import { FileDirInfo } from "@u-tools/core/modules/files-factory/files-folder";
import { defaultPath } from ".";

type NavigationState = {
  paths: FileDirInfo[];
  currentIndex: number;
};

export type ServerClientState = {
  count: number;
  bookmarks: FileDirInfo[];
  filePathsToSubmit: FileDirInfo[];
  directoryData: FileDirInfo[];
  navigation: NavigationState;
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
};
