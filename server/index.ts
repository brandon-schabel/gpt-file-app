import {
  createFileFactory,
  readFilesContents,
} from '@u-tools/core/modules/files-factory/files-folder';
import {
  createServerFactory,
  createWSStateMachine,
} from '@u-tools/core/modules/server-factory';

import { createOpenAIApi } from '@u-tools/open-ai/index';
import { SERVER_PORT } from '../shared';
import { ServerClientState, defaultState } from '../shared/shared-state';

const fileFactory = createFileFactory({ baseDirectory: '~/' });
const { route, start } = createServerFactory({
  wsPaths: ['/state'],
  enableBodyParser: true,
  cors: {
    allowedMethods: ['DELETE', 'GET', 'POST', 'PUT', 'OPTIONS', 'PATCH'],
    allowedOrigins: ['http://localhost:5173'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Requested-With',
      'OpenAI-Organization',
    ],
  },
});

const ai = createOpenAIApi({
  apiKey: Bun.env.OPEN_AI_KEY || '',
  organizationId: Bun.env.OPEN_AI_ORGANIZATION_ID || '',
});

const { onRequest: onBaseRequest } = route('/');

onBaseRequest(async ({ request }) => {
  return new Response(`Hello World ${request.method}`);
});

// TODO: state could occasionally be written to a json file and then be loaded
// when the server starts up incase client looses the data somehow
const {
  websocketHandler,
  state,
  control,
  onStateChange,
  updateStateAndDispatch,
} = createWSStateMachine<ServerClientState>(defaultState);

const server = start({
  port: SERVER_PORT,
  verbose: true,
  // TODO figure out how handle multiple handlers at the same time
  websocket: websocketHandler,
});

onStateChange('count', count => {
  console.log(state);
});

onStateChange('navigation', async navigation => {
  const { currentIndex } = navigation;

  const currentPathData = navigation.paths[currentIndex];

  const directoryData = await fileFactory.listFilesAndFolderInPath(
    currentPathData.fullPath
  );

  console.log({ directoryData });

  // TODO add mode where where it only broadcasts to the client it was sent from
  control.directoryData.set(directoryData);
});

onStateChange('completionAPIStatus', async status => {
  console.log({ status, paths: state.filePathsToSubmit });
  if (status !== 'FETCH') return;
  // if (state.filePathsToSubmit.length === 0) return;

  control.completionAPIStatus.set('IN_PROGRESS');

  let promptToSubmit = ``;

  const allFilesContent = await readFilesContents(
    state.filePathsToSubmit.map(file => file.fullPath)
  );

  allFilesContent?.forEach(file => {
    let filePrompt = `
          ${file.path}:
          ${file.content}
        `;

    promptToSubmit += filePrompt;
  });

  promptToSubmit += state.prompt;

  const result = await ai.post({
    endpoint: '/v1/chat/completions',
    body: {
      model: 'gpt-4',
      messages: [
        {
          content:
            'You are a very good programmer, your job is to teach programming with a typesafe approach, you write clean easy to understand and modern code.',
          role: 'system',
        },
        {
          content: promptToSubmit,
          role: 'user',
        },
      ],
    },
  });

  if (result) {
    control.completionResponse.set(result);
    control.completionAPIStatus.set('DONE');
    return;
  }

  control.completionAPIStatus.set('IDLE');
});
