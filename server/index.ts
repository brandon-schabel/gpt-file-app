import { createFileFactory } from "instant-bun/modules/files-factory";
import { FileDirInfo } from "instant-bun/modules/files-factory/files-folder";
import { createServerFactory } from "instant-bun/modules/server-factory";
import { createOpenAICompletions } from "instant-bun/modules/utils/open-ai-completions-api";

const serverFactory = createServerFactory({});
const fileFactory = createFileFactory({ baseDirectory: "~/" });

export const ROUTE_VIEW_DIR = "/view-directory";

// idea: combine adding the server routes,
// with the view response and request types,
// then it can be configured on the server factory, it should match
// similar to what the use-advanced-fetcher.ts does
export type ViewDirectoryResponse = FileDirInfo[];
export type ViewDirectoryRequest = {
  path: string;
};

// TODO need to be able to specificy http method
serverFactory.addRoute(ROUTE_VIEW_DIR, async (request) => {
  try {
    // const json = await request.json();
    const text = await request.text();

    let parsedJSON: { path: string } = {
      path: "/Users/brandon",
    };

    if (text) {
      parsedJSON = JSON.parse(text || "{}");
    }

    const pathData = await fileFactory.listFilesAndFolderInPath(
      parsedJSON.path
    );

    const response = new Response(JSON.stringify(pathData));

    setCors(response);

    return response;
  } catch (e) {
    console.error(e);
    return new Response("Failed", {
      status: 500,
      statusText: `Pooped the bed: ${JSON.stringify(e)}`,
    });
  }
});

const port = 8080;

const setCors = (response: Response) => {
  // THIS IS ONLY FOR A DEMO DON'T DO THIS IN PROD IF YOU DON'T KNOW WHAT YOU'RE DOING
  response.headers.set("Access-Control-Allow-Origin", "*");
  response.headers.set(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE"
  );
  response.headers.set("Access-Control-Allow-Headers", "Content-Type");
};

serverFactory.addRoute("/test", () => {
  const response = new Response("This is a test route!");
  setCors(response);

  return response;
});

try {
  console.log(`Starting server on port ${port}...`);

  serverFactory.start({ port });
  console.log(
    `Server started on port ${port}, press Ctrl+C to stop, http://localhost:${port}`
  );
} catch (e) {
  console.error("Issue starting server: ", e);
}

const openAiCompletions = createOpenAICompletions({
  apiKey: "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",
});

serverFactory.addRoute("/submit-gpt-files", async (request) => {
  try {
    const text = await request.text();

    const jsonData = (await request.json()) as {
      files: FileDirInfo[];
      prompt: string;
    };
    // const bodyData = request.body;

    // READ FILE CONTNET HERE

    console.log(jsonData);

    const result = await openAiCompletions.getCompletions({
      prompt: jsonData.prompt,
    });

    const response = new Response(result);

    setCors(response);

    return response;
  } catch (e) {
    // throw
    console.error(e);
    return new Response("Failed", {
      status: 500,
      statusText: `Pooped the bed: ${JSON.stringify(e)}`,
    });
  }
});
