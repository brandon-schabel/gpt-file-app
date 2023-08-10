import { FileDirInfo } from "@u-tools/core/modules/files-factory/files-folder";
import {
  ModelInfo,
  ModelsListResponse,
} from "@u-tools/core/modules/utils/open-ai-completions-api";
import { useApiFactory } from "@u-tools/react/use-api-factory";
import { useLocalStorage } from "@u-tools/react/use-local-storage";
import { useEffect } from "react";
import {
  SubmitFilesRequest,
  SubmitFilesResponse,
  ViewDirectoryResponse,
  defaultPath,
} from "../../shared";

type GPTFileServerAppEndpoints = {
  "/submit-files": {
    body: SubmitFilesRequest;
    response: SubmitFilesResponse;
  };
  "/view-directory": {
    body: {
      path: string;
    };
    response: ViewDirectoryResponse;
  };
  "/get-models": {
    response: ModelsListResponse;
  };
  "/get-model": {
    response: ModelInfo;
    params: {
      modelId: string;
    };
  };
};

export const useBookmarks = () => {
  const { state: bookmarks, set: setBookmarks } = useLocalStorage<
    FileDirInfo[]
  >({
    key: "bookmarks",
    initialState: [],
  });

  const addBookmark = (path: FileDirInfo) => {
    if (!bookmarks.some((b) => b.fullPath === path.fullPath)) {
      setBookmarks([...bookmarks, path]);
    }
  };

  const removeBookmark = (path: FileDirInfo) => {
    setBookmarks(bookmarks.filter((b) => b.fullPath !== path.fullPath));
  };

  return {
    bookmarks,
    addBookmark,
    removeBookmark,
  };
};

export const useServer = () => {
  const fileServer = useApiFactory<GPTFileServerAppEndpoints>({
    baseUrl: "http://localhost:8080",
    endpoints: [
      { endpoint: "/submit-files", method: "post" },
      { endpoint: "/view-directory", method: "post" },
      { endpoint: "/get-models", method: "get" },
      { endpoint: "/get-model", method: "get" },
    ],
  });

  return {
    useSubmitFilesPaths: fileServer["/submit-files"],
    useViewDirectory: fileServer["/view-directory"],
    useListModels: fileServer["/get-models"],
  };
};

export const usePathControl = () => {
  const { useViewDirectory } = useServer();
  const { data: directoryData, post: postViewDirectory } = useViewDirectory();
  const { state: prevViewPaths, set: setPrevViewPaths } = useLocalStorage<
    FileDirInfo[]
  >({
    key: "prevViewPaths",
    initialState: [],
  });

  const { state: forwardPaths, set: setForwardPaths } = useLocalStorage<
    FileDirInfo[]
  >({
    key: "forwardPaths",
    initialState: [],
  });

  const { state: storedCurrentPath, set: setStoredCurrentPath } =
    useLocalStorage<FileDirInfo>({
      key: "currentPath",
      initialState: defaultPath,
    });

  const { state: currentViewPath, set: setNewViewPath } =
    useLocalStorage<FileDirInfo>({
      key: "currentViewPath",
      initialState: defaultPath,
    });

  const fetchPath = (path: string) => {
    return postViewDirectory({ path });
  };

  useEffect(() => {
    if (storedCurrentPath?.fullPath) {
      fetchPath(storedCurrentPath.fullPath);
    }
  }, [storedCurrentPath?.fullPath]);

  const changeDir = (fileOrDir: FileDirInfo) => {
    setPrevViewPaths([...prevViewPaths, currentViewPath]);
    setForwardPaths([]);
    setNewViewPath(fileOrDir);
    setStoredCurrentPath(fileOrDir);
    fetchPath(fileOrDir.fullPath);
  };

  const backNDirs = (numDirs: number = 1) => {
    const prevPath = prevViewPaths[prevViewPaths.length - numDirs];
    if (prevPath) {
      setNewViewPath(prevPath);
      setForwardPaths([currentViewPath, ...forwardPaths]);
      setPrevViewPaths((prev) => prev.slice(0, -numDirs));
      fetchPath(prevPath.fullPath);
    }
  };

  const forwardNDirs = (numDirs: number = 1) => {
    const nextPath = forwardPaths[numDirs - 1];
    if (nextPath) {
      setNewViewPath(nextPath);
      setPrevViewPaths([...prevViewPaths, currentViewPath]);
      setForwardPaths((forward) => forward.slice(numDirs));
      fetchPath(nextPath.fullPath);
    }
  };

  return {
    prevViewPaths,
    forwardPaths,
    storedCurrentPath,
    currentViewPath,
    forwardNDirs,
    backNDirs,
    changeDir,
    directoryData,
  };
};

export const useFileSubmitQueue = () => {
  const { state: filePathsToSubmit, set: setFilePathsToSubmit } =
    useLocalStorage<FileDirInfo[]>({
      key: "filePathsToSubmit",
      initialState: [],
    });

  const removeFileFromQueue = (file: FileDirInfo) => {
    setFilePathsToSubmit((prevFiles) =>
      prevFiles.filter((f) => f.fullPath !== file.fullPath)
    );
  };

  const addFileToQueue = (file: FileDirInfo) => {
    if (!filePathsToSubmit.some((f) => f.fullPath === file.fullPath)) {
      setFilePathsToSubmit((prevFiles) => [...prevFiles, file]);
    }
  };

  return {
    filePathsToSubmit,
    removeFileFromQueue,
    addFileToQueue,
  };
};
