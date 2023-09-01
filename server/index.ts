import {
  createFileFactory,
  readFilesContents,
} from '@u-tools/core/modules/files-factory/files-folder';
import {
  createServerFactory,
  createWSStateMachine,
} from '@u-tools/core/modules/server-factory';
import OpenAI from 'openai';

import { SERVER_PORT } from '../shared';
import { ServerClientState, defaultState } from '../shared/shared-state';
import { systemPrompts } from './custom-prompts';

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

const ai = new OpenAI({
  apiKey: Bun.env.OPEN_AI_KEY || '',
  organization: Bun.env.OPEN_AI_ORGANIZATION_ID || '',
  fetch: fetch,
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
  console.log(state, count);
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
  console.log({ status, paths: state.filesToSubmit });
  if (status !== 'FETCH') return;
  // if (state.filesToSubmit.length === 0) return;

  control.completionAPIStatus.set('IN_PROGRESS');

  let promptToSubmit = ``;

  const allFilesContent = await readFilesContents(
    state.filesToSubmit.map(file => file.fullPath)
  );

  allFilesContent?.forEach(file => {
    let filePrompt = `
          ${file.path}:
          ${file.content}
        `;

    promptToSubmit += filePrompt;
  });

  promptToSubmit += state.prompt;

  const result = await ai.chat.completions.create({
    model: 'gpt-4',
    messages: [
      //  here you can add current directory information and other stuff
      {
        content: systemPrompts.bunTest.prompt,
        role: 'system',
      },
      {
        content: promptToSubmit,
        role: 'user',
      },
    ],
  });

  // ai.files.create({
  //   file: {}
  // })

  if (result) {
    control.completionResponse.set(result);
    control.completionAPIStatus.set('DONE');
    return;
  }

  control.completionAPIStatus.set('IDLE');
});
