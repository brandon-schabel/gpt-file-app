import { FileDirInfo } from "@u-tools/core/modules/files-factory/files-folder";

export type CreateOpenAIFileRequest = {
  file: FileDirInfo;
  purpose: string;
};
