import { createFileFactory } from "@u-tools/core/modules/files-factory";
import {
  FileDirInfo,
  readFilesContents,
} from "@u-tools/core/modules/files-factory/files-folder";
import { createServerFactory } from "@u-tools/core/modules/server-factory";
import { createOpenAICompletions } from "@u-tools/core/modules/utils/open-ai-completions-api";
import { ROUTE_VIEW_PATH, SERVER_PORT } from "../shared/index";

const serverFactory = createServerFactory({});
const fileFactory = createFileFactory({ baseDirectory: "~/" });

serverFactory.addRoute("/", async (request) => {
  return new Response("Hello World");
});

// TODO need to be able to specificy http method
serverFactory.addRoute(ROUTE_VIEW_PATH, async (request) => {
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

const setCors = (response: Response) => {
  // THIS IS ONLY FOR A DEMO DON'T DO THIS IN PROD IF YOU DON'T KNOW WHAT YOU'RE DOING
  response.headers.set("Access-Control-Allow-Origin", "*");
  response.headers.set(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE"
  );
  response.headers.set("Access-Control-Allow-Headers", "Content-Type");
};

const openAiCompletions = createOpenAICompletions({
  apiKey: Bun.env.OPEN_AI_KEY || "",
});

serverFactory.addRoute("/submit-files", async (request) => {
  try {
    // const text = await request.text();

    // if we create the response/request type maps, then we can
    // we can create a function to handle the request type

    const jsonData = (await request.json()) as {
      files: FileDirInfo[];
      prompt: string;
    };
    // const bodyData = request.body;

    // READ FILE CONTNET HERE

    console.log(jsonData);

    // jsonData.files.forEach(file => {
    //   // read file content

    // })

    const allFilesContent = await readFilesContents(
      jsonData.files.map((file) => file.fullPath)
    );

    console.log({ allFilesContent });

    let promptToSubmit = `
    ${jsonData.prompt}
    `;

    allFilesContent?.forEach((file) => {
      let filePrompt = `
      ${file.path}:
      ${file.content}
    `;

      promptToSubmit += filePrompt;
    });

    const result = await openAiCompletions.getCompletions({
      prompt: promptToSubmit,
    });

    const response = new Response(JSON.stringify(result));

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

try {
  console.log(`Starting server on port ${SERVER_PORT}...`);

  serverFactory.start({ port: SERVER_PORT });
  console.log(
    `Server started on port ${SERVER_PORT}, press Ctrl+C to stop, http://localhost:${SERVER_PORT}`
  );
} catch (e) {
  console.error("Issue starting server: ", e);
}
