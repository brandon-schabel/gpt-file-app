import {
  FileDirInfo,
  createFileFactory,
  readFilesContents,
} from '@u-tools/core/modules/files-factory/files-folder';
import {
  createServerFactory,
  createWSStateMachine,
} from '@u-tools/core/modules/server-factory';

import { openAIFetcher } from '@u-tools/open-ai/index';
import {
  FineTuneFile,
  FineTuneParams,
} from '@u-tools/open-ai/open-ai-fine-tune-api';
import { SERVER_PORT } from '../shared';
import { CreateOpenAIFileRequest } from '../shared/api-types';
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

// TODO combine into one config, move list models out of completions
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

// the request should  return an object wiht the "onRequest" handler, that way a route can return other
// configurations for configuration a route
const { onRequest: onBaseRequest } = route('/');

onBaseRequest(async ({ request }) => {
  return new Response(`Hello World ${request.method}`);
});

type ViewRouteRequest = {
  body: { path: string };
};

/* view route */
const { onRequest: onViewRoute } = route<ViewRouteRequest, FileDirInfo[]>(
  '/view-directory'
);

onViewRoute(async ({ getBody, jsonRes, request }) => {
  console.log({ request });

  const parsedJSON = await getBody();
  console.log({ parsedJSON });

  const pathData = await fileFactory.listFilesAndFolderInPath(parsedJSON.path);

  console.log({ pathData });

  return jsonRes(pathData);
});

/* submit file routes */
type SubmitFilesRequestBody = {
  files: FileDirInfo[];
  prompt: string;
  model: string;
};

const { onRequest: onSubmitFilesRequest } = route<{
  body: SubmitFilesRequestBody;
}>('/submit-files');

onSubmitFilesRequest(async ({ request, getBody, jsonRes }) => {
  // if we create the response/request type maps, then we can
  // we can create a function to handle the request type
  const jsonData = await getBody();

  const allFilesContent = await readFilesContents(
    jsonData.files.map(file => file.fullPath)
  );

  let promptToSubmit = `
    ${jsonData.prompt}
    `;

  allFilesContent?.forEach(file => {
    let filePrompt = `
      ${file.path}:
      ${file.content}
    `;

    promptToSubmit += filePrompt;
  });

  const result = await aiCompletions.getCompletions({
    prompt: promptToSubmit,
    model: jsonData.model,
  });

  return jsonRes(result);
});

/* list models route */
const { onRequest: onListModels } = route('/get-models');

onListModels(async ({ jsonRes }) => {
  return jsonRes(await aiCompletions.listModels());
});

/* get model route */
const { onRequest: onGetModel } = route('/get-model');

onGetModel(async ({ request, jsonRes }) => {
  const url = new URLSearchParams(request.url);
  const modelId = url.get('modelId');

  if (!modelId) {
    return new Response('Failed', {
      status: 500,
      statusText: `No modelId`,
    });
  }

  const model = await aiCompletions.retrieveModel(modelId);
  return jsonRes(model);
});

// Assuming you've already initialized your server and other necessary configurations

/** FINE TUNES */
// 1. Create a new fine-tune route
const { onRequest: onCreateFineTune } = route<{
  body: {
    model: string;
    training_files: FineTuneFile[];
    validation_files: FineTuneFile[];
    hyperparams: FineTuneParams;
  };
}>('/fine-tune');

onCreateFineTune(async ({ getBody, jsonRes }) => {
  const { model, training_files, validation_files, hyperparams } =
    await getBody();
  const result = await openAIFineTune.createFineTune(
    model,
    training_files,
    validation_files,
    hyperparams
  );
  return jsonRes(result);
});

// 2. List all fine-tunes route
const { onRequest: onListFineTunes } = route('/fine-tune/list');

onListFineTunes(async ({ jsonRes }) => {
  const result = await openAIFineTune.listFineTunes();
  return jsonRes(result);
});

// 3. Retrieve a specific fine-tune route
const { onRequest: onRetrieveFineTune } = route<{ params: { id: string } }>(
  '/fine-tune/:id'
);

onRetrieveFineTune(async ({ jsonRes, parseQueryParams }) => {
  const params = parseQueryParams();
  const result = await openAIFineTune.retrieveFineTune(params?.id || '');
  return jsonRes(result);
});

// 4. List events for a fine-tune route
const { onRequest: onListFineTuneEvents } = route<{ params: { id: string } }>(
  '/fine-tune/:id/events'
);

onListFineTuneEvents(async ({ jsonRes, parseQueryParams }) => {
  const params = parseQueryParams();
  const result = await openAIFineTune.listFineTuneEvents(params?.id || '');
  return jsonRes(result);
});

// 5. Cancel a fine-tune route
const { onRequest: onCancelFineTune } = route<{ params: { id: string } }>(
  '/fine-tune/:id/cancel'
);

onCancelFineTune(async ({ parseQueryParams, jsonRes }) => {
  const params = parseQueryParams();
  const result = await openAIFineTune.cancelFineTune(params?.id || '');
  return jsonRes(result);
});

/* FILE API */

const { onRequest: onListFiles } = route('/files/list');

onListFiles(async ({ jsonRes }) => {
  const result = await openAIFiles.listFiles();
  return jsonRes(result);
});

// 2. Create a new file route
const { onRequest: onCreateFile } = route<{ body: CreateOpenAIFileRequest }>(
  '/files'
);

onCreateFile(async ({ getBody, jsonRes }) => {
  const fileData = await getBody();

  console.log(fileData);

  const path = fileData.file.fullPath;
  const purpose = fileData.purpose;

  // const fileStream = fs.createReadStream(path);

  const result = await openAIFiles.createFile(path, purpose);

  return jsonRes(result);
});

// 3. Retrieve a specific file route
const { onRequest: onRetrieveFile } = route('/files/:id');

onRetrieveFile(async ({ parseQueryParams, jsonRes }) => {
  const params = parseQueryParams();
  const result = await openAIFiles.retrieveFile(params?.id || '');
  return jsonRes(result);
});

// 4. Delete a specific file route
const { onRequest: onDeleteFile } = route('/files/:id/delete');

onDeleteFile(async ({ parseQueryParams, jsonRes }) => {
  const params = parseQueryParams();
  const result = await openAIFiles.deleteFile(params?.id || '');
  return jsonRes(result);
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

onStateChange('currentPath', async currPath => {
  const directoryData = await fileFactory.listFilesAndFolderInPath(
    currPath.fullPath
  );

  control.prevViewPaths.push(currPath);

  control.directoryData.set(directoryData);
});
