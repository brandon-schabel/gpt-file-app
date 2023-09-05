import {
  FileDirInfo,
  FileWithContent,
} from "@u-tools/core/modules/files-factory/files-folder";
import OpenAI from "openai";
import { defaultPath } from ".";
import { PromptKeys } from "./custom-prompts";

type NavigationState = {
  paths: FileDirInfo[];
  currentIndex: number;
};

type GPTModels = "gpt-3.5-turbo" | "gpt-3.5";

const gptModels: GPTModels[] = ["gpt-3.5-turbo", "gpt-3.5"];

type APIStatus = "IDLE" | "FETCH" | "IN_PROGRESS" | "DONE" | "ERROR";
type OSOperationStatus = "IDLE" | "IN_PROGRESS" | "DONE" | "ERROR";

// get keys from gpt models and make a union type
export type ServerClientState = {
  count: number;
  bookmarks: FileDirInfo[];
  filesToSubmit: FileDirInfo[];
  directoryData: FileDirInfo[];
  navigation: NavigationState;
  prompt: string;
  completionAPIStatus: APIStatus;
  completionResponse: OpenAI.Chat.Completions.ChatCompletion;
  model: GPTModels;
  /* File Search */
  fileSearchString: string;
  fileSearchStatus: OSOperationStatus;
  fileSearchResult: FileDirInfo[];
  fileContentSearchResult: FileWithContent[];
  enabledTest: boolean;
  systemPrompt: PromptKeys;
};

export const defaultState: ServerClientState = {
  count: 0,
  bookmarks: [],
  filesToSubmit: [],
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
  fileSearchStatus: "IDLE",
  fileContentSearchResult: [],
  enabledTest: false,
  systemPrompt: "bunCode",
};
