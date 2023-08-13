import {
  FileDirInfo,
  createFileFactory,
  readFilesContents,
} from '@u-tools/core/modules/files-factory/files-folder';
import { createServerFactory } from '@u-tools/core/modules/server-factory';

import { openAIFetcher } from '@u-tools/open-ai/index';
import {
  FineTuneFile,
  FineTuneParams,
} from '@u-tools/open-ai/open-ai-fine-tune-api';
import { SERVER_PORT } from '../shared';
import { CreateOpenAIFileRequest } from '../shared/api-types';

const fileFactory = createFileFactory({ baseDirectory: '~/' });
const { route, start } = createServerFactory({
  enableBodyParser: true,
  cors: {
    allAllOrigins: true,
    allowedMethods: ['DELETE', 'GET', 'POST', 'PUT', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  },
});

console.log(route);

console.log(Bun.env.OPEN_AI_KEY);

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

// the request should return an object wiht the "onRequest" handler, that way a route can return other
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

onViewRoute(async ({ getBody, JSONRes }) => {
  const parsedJSON = await getBody();

  const pathData = await fileFactory.listFilesAndFolderInPath(parsedJSON.path);

  return JSONRes(pathData);
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

onSubmitFilesRequest(async ({ request, getBody, JSONRes }) => {
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

  return JSONRes(result);
});

/* list models route */
const { onRequest: onListModels } = route('/get-models');

onListModels(async ({ JSONRes }) => {
  return JSONRes(await aiCompletions.listModels());
});

/* get model route */
const { onRequest: onGetModel } = route('/get-model');

onGetModel(async ({ request, JSONRes }) => {
  const url = new URLSearchParams(request.url);
  const modelId = url.get('modelId');

  if (!modelId) {
    return new Response('Failed', {
      status: 500,
      statusText: `No modelId`,
    });
  }

  const model = await aiCompletions.retrieveModel(modelId);
  return JSONRes(model);
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

onCreateFineTune(async ({ getBody, JSONRes }) => {
  const { model, training_files, validation_files, hyperparams } =
    await getBody();
  const result = await openAIFineTune.createFineTune(
    model,
    training_files,
    validation_files,
    hyperparams
  );
  return JSONRes(result);
});

// 2. List all fine-tunes route
const { onRequest: onListFineTunes } = route('/fine-tune/list');

onListFineTunes(async ({ JSONRes }) => {
  const result = await openAIFineTune.listFineTunes();
  return JSONRes(result);
});

// 3. Retrieve a specific fine-tune route
const { onRequest: onRetrieveFineTune } = route<{ params: { id: string } }>(
  '/fine-tune/:id'
);

onRetrieveFineTune(async ({ JSONRes, parseQueryParams }) => {
  const params = parseQueryParams();
  const result = await openAIFineTune.retrieveFineTune(params?.id || '');
  return JSONRes(result);
});

// 4. List events for a fine-tune route
const { onRequest: onListFineTuneEvents } = route<{ params: { id: string } }>(
  '/fine-tune/:id/events'
);

onListFineTuneEvents(async ({ JSONRes, parseQueryParams }) => {
  const params = parseQueryParams();
  const result = await openAIFineTune.listFineTuneEvents(params?.id || '');
  return JSONRes(result);
});

// 5. Cancel a fine-tune route
const { onRequest: onCancelFineTune } = route<{ params: { id: string } }>(
  '/fine-tune/:id/cancel'
);

onCancelFineTune(async ({ parseQueryParams, JSONRes }) => {
  const params = parseQueryParams();
  const result = await openAIFineTune.cancelFineTune(params?.id || '');
  return JSONRes(result);
});

/* FILE API */

const { onRequest: onListFiles } = route('/files/list');

onListFiles(async ({ JSONRes }) => {
  const result = await openAIFiles.listFiles();
  return JSONRes(result);
});

// 2. Create a new file route
const { onRequest: onCreateFile } = route<{ body: CreateOpenAIFileRequest }>(
  '/files'
);

onCreateFile(async ({ getBody, JSONRes }) => {
  const fileData = await getBody();

  console.log(fileData);

  const path = fileData.file.fullPath;
  const purpose = fileData.purpose;

  // const fileStream = fs.createReadStream(path);

  const result = await openAIFiles.createFile(path, purpose);

  return JSONRes(result);
});

// 3. Retrieve a specific file route
const { onRequest: onRetrieveFile } = route('/files/:id');

onRetrieveFile(async ({ parseQueryParams, JSONRes }) => {
  const params = parseQueryParams();
  const result = await openAIFiles.retrieveFile(params?.id || '');
  return JSONRes(result);
});

// 4. Delete a specific file route
const { onRequest: onDeleteFile } = route('/files/:id/delete');

onDeleteFile(async ({ parseQueryParams, JSONRes }) => {
  const params = parseQueryParams();
  const result = await openAIFiles.deleteFile(params?.id || '');
  return JSONRes(result);
});

start({ port: SERVER_PORT, verbose: true });
