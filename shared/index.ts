import { FileDirInfo } from "@u-tools/core/modules/files-factory/files-folder";
import type { CompletionsResponse } from "@u-tools/core/modules/utils/open-ai-completions-api";

// config variables
export const ROUTE_VIEW_PATH = "/view-directory";
export const SUBMIT_FILES_PATH = "/submit-files";
export const SERVER_PORT = 8080;

// idea: combine adding the server routes,
// with the view response and request types,
// then it can be configured on the server factory, it should match
// similar to what the use-advanced-fetcher.ts does
export type ViewDirectoryResponse = FileDirInfo[];
export type ViewDirectoryRequest = {
  path: string;
};

export type SubmitFilesResponse = CompletionsResponse;
export type SubmitFilesRequest = {
  files: FileDirInfo[];
  prompt: string;
};


export const defaultPath: FileDirInfo = {
  fullPath: "/Users/brandon",
  name: "Home Dir",
  type: "directory",
};