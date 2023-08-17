import {
  createFileFactory,
  readFilesContents,
} from '@u-tools/core/modules/files-factory/files-folder';
import {
  createServerFactory,
  createWSStateMachine,
} from '@u-tools/core/modules/server-factory';

import { openAIFetcher } from '@u-tools/open-ai/index';
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

// TODO: combine into one config, move list models out of completions
const aiCompletions = openAIFetcher.completions({
  apiKey: Bun.env.OPEN_AI_KEY || '',
});
const openAIFiles = openAIFetcher.files({
  apiKey: Bun.env.OPEN_AI_KEY || '',
  organizationId: Bun.env.OPEN_AI_ORGANIZATION_ID || '',
});
const openAIFineTune = openAIFetcher.fineTune({
  apiKey: Bun.env.OPEN_AI_KEY || '',
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
  console.log({ countChange: count });
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

// onStateChange('filePathsToSubmit', async filePathsToSubmit => {
//   // TODO: need to have a submit status to trigger this so we don't submit everytime files change
//   if (filePathsToSubmit && filePathsToSubmit.length > 0) {
//     const allFilesContent = await readFilesContents(
//       filePathsToSubmit.map(file => file.fullPath)
//     );

//     let promptToSubmit = `Your prompt here.`;  // Update this with the necessary prompt logic

//     allFilesContent?.forEach(file => {
//       let filePrompt = `
//         ${file.path}:
//         ${file.content}
//       `;

//       promptToSubmit += filePrompt;
//     });

//     const result = await aiCompletions.getCompletions({
//       prompt: promptToSubmit,
//       model: 'Your model here',  // Update this with the necessary model logic
//     });

//     // Handle the result as necessary
//     console.log(result);
//   }
// });

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

  // let promptToSubmit = ``;  // Update this with the necessary prompt logic

  promptToSubmit += state.prompt;

  const result = await aiCompletions.getCompletions({
    prompt: promptToSubmit,
    model: state.model,
  });

  control.completionResponse.set(result);
  control.completionAPIStatus.set('DONE');
});
