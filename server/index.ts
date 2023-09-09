import {
  createFileFactory,
  readFilesContents,
} from '@u-tools/core/modules/files-factory/files-folder';
import {
  createServerFactory,
  createStateManager,
  createWSStateHandler,
} from '@u-tools/core/modules/server-factory';
import OpenAI from 'openai';

import { SERVER_PORT } from '../shared';
import { systemPrompts } from '../shared/custom-prompts';
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
// const { websocketHandler, state, control, onStateChange, whenValueIs } =
//   createWSStateMachine<ServerClientState>(defaultState);

const manager = createStateManager<ServerClientState>(defaultState);
const { onStateChange, state, whenValueIs, dispatch } = manager;

const websocketHandler = createWSStateHandler(manager);


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

  // TODO add mode where where it only broadcasts to the client it was sent from
  dispatch.directoryData.set(directoryData);
});

onStateChange('completionAPIStatus', async status => {
  console.log({ status, paths: state.filesToSubmit });
  if (status !== 'FETCH') return;
  dispatch.completionAPIStatus.set('IN_PROGRESS');

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
        content: 'You are a professional python coder',
        role: 'system',
      },
      {
        content: systemPrompts[state.systemPrompt].prompt,
        role: 'system',
      },
      {
        content: promptToSubmit,
        role: 'user',
      },
    ],
  });

  if (result) {
    dispatch.completionResponse.set(result);
    dispatch.completionAPIStatus.set('DONE');
    return;
  }

  dispatch.completionAPIStatus.set('IDLE');
});

whenValueIs('fileSearchStatus', 'IN_PROGRESS').then(async () => {
  try {
    const fileSearchRes = await fileFactory.recursiveFileSearch({
      searchString: state.fileSearchString,
      directory: state.navigation.paths[state.navigation.currentIndex].fullPath,
    });

    dispatch.fileSearchStatus.set('DONE');
    dispatch.fileSearchResult.set(fileSearchRes);

    console.log({ fileSearchRes });
  } catch (err) {
    dispatch.fileSearchStatus.set('ERROR');
  }
});
