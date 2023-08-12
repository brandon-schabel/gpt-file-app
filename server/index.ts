import {
  FileDirInfo,
  createFileFactory,
  readFilesContents,
} from '@u-tools/core/modules/files-factory/files-folder';
import { createServerFactory } from '@u-tools/core/modules/server-factory';
import { createOpenAICompletions } from '@u-tools/core/modules/utils/open-ai-completions-api';
import { SERVER_PORT } from '../shared';

const fileFactory = createFileFactory({ baseDirectory: '~/' });
const { route, start } = createServerFactory({
  enableBodyParser: true,
  cors: {
    allAllOrigins: true,
    allowedMethods: ['DELETE', 'GET', 'POST', 'PUT'],
  },
});

// the request should return an object wiht the "onRequest" handler, that way a route can return other
// configurations for configuration a route
const { onRequest: onBaseRequest } = route('/');

onBaseRequest(async ({ request }) => {
  return new Response(`Hello World ${request.method}`);
});

const { onRequest: onViewRoute } = route<
  {
    body: { path: string };
  },
  FileDirInfo[]
>('/view-directory');

onViewRoute(async ({ getBody, JSONRes }) => {
  const parsedJSON = await getBody();

  const pathData = await fileFactory.listFilesAndFolderInPath(parsedJSON.path);

  return JSONRes(pathData);
});

const openAiCompletions = createOpenAICompletions({
  apiKey: Bun.env.OPEN_AI_KEY || '',
});

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

  const result = await openAiCompletions.getCompletions({
    prompt: promptToSubmit,
    model: jsonData.model,
  });

  return JSONRes(result);
});

const { onRequest: onListModels } = route('/get-models');

onListModels(async ({ JSONRes }) => {
  return JSONRes(await openAiCompletions.listModels());
});

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

  const model = await openAiCompletions.retrieveModel(modelId);
  return JSONRes(model);
});

start({ port: SERVER_PORT, verbose: true });
