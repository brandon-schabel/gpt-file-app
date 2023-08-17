import { FileDirInfo } from "@u-tools/core/modules/files-factory/files-folder";
import { defaultPath } from ".";

export type ServerClientState = {
  count: number;
  bookmarks: FileDirInfo[];
  filePathsToSubmit: FileDirInfo[];
  directoryData: FileDirInfo[];
  prevViewPaths: FileDirInfo[];
  forwardPaths: FileDirInfo[];
  currentPath: FileDirInfo;
};

export const defaultState: ServerClientState = {
  count: 0,
  bookmarks: [],
  filePathsToSubmit: [],
  directoryData: [],
  prevViewPaths: [],
  forwardPaths: [],
  currentPath: defaultPath,
};
