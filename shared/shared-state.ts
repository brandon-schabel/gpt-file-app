import {
  FileDirInfo,
  FileWithContent,
} from "@u-tools/core/modules/files-factory/files-folder";
import { CompletionsResponse } from "@u-tools/core/modules/utils/open-ai-completions-api";
import { defaultPath } from ".";

type NavigationState = {
  paths: FileDirInfo[];
  currentIndex: number;
};

type GPTModels = "gpt-3.5-turbo" | "gpt-3.5";

const gptModels: GPTModels[] = ["gpt-3.5-turbo", "gpt-3.5"];

type APIStatus = "IDLE" | "FETCH" | "IN_PROGRESS" | "DONE" | "ERROR";

// get keys from gpt models and make a union type
export type ServerClientState = {
  count: number;
  bookmarks: FileDirInfo[];
  filePathsToSubmit: FileDirInfo[];
  directoryData: FileDirInfo[];
  navigation: NavigationState;
  prompt: string;
  completionAPIStatus: APIStatus;
  completionResponse: CompletionsResponse;
  model: GPTModels;
  // openedFile: FileDirInfo | null
  // openedFileContent: string
  // openAIFileUpload:
  fileSearchString: string;
  fileSearchResult: FileDirInfo[];
  fileContentSearchResult: FileWithContent[];
  enabledTest: boolean;
};

export const defaultState: ServerClientState = {
  count: 0,
  bookmarks: [],
  filePathsToSubmit: [],
  directoryData: [],
  navigation: {
    paths: [defaultPath],
    currentIndex: 0,
  },
  prompt: "",
  completionAPIStatus: "IDLE",
  model: "gpt-3.5-turbo",
  completionResponse: {
    choices: [],
    created: 0,
    id: "",
    model: "",
    object: "",
    usage: {
      completion_tokens: 0,
      prompt_tokens: 0,
      total_tokens: 0,
    },
  },
  fileSearchString: "",
  fileSearchResult: [],
  fileContentSearchResult: [],
  enabledTest: false,
};
