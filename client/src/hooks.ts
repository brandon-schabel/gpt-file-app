import {
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { FileDirInfo } from "@u-tools/core/modules/files-factory/files-folder";
import {
  ModelInfo,
  ModelsListResponse,
} from "@u-tools/core/modules/utils/open-ai-completions-api";
import {
  FilesListResponse,
  OpenAIFileObject,
} from "@u-tools/open-ai/open-ai-files-api";
import {
  FineTuneEvent,
  FineTuneFile,
  FineTuneParams,
  FineTuneResponse,
  FineTunesListResponse,
} from "@u-tools/open-ai/open-ai-fine-tune-api";
import { useApiFactory } from "@u-tools/react/use-api-factory";
import { useLocalStorage } from "@u-tools/react/use-local-storage";
import { useEffect, useRef, useState } from "react";
import {
  SubmitFilesRequest,
  SubmitFilesResponse,
  defaultPath,
} from "../../shared";
import { CreateOpenAIFileRequest } from "../../shared/api-types";
import { columns } from "./components/ui/file-folder-table";

type GPTFileServerAppEndpoints = {
  "/submit-files": {
    body: SubmitFilesRequest;
    response: SubmitFilesResponse;
  };
  "/view-directory": {
    body: {
      path: string;
    };
    response: FileDirInfo[];
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
  "/fine-tune": {
    body: {
      model: string;
      training_files: FineTuneFile[];
      validation_files: FineTuneFile[];
      hyperparams: FineTuneParams;
    };
    response: FineTuneResponse; // Updated this
  };
  "/fine-tune/list": {
    response: FineTunesListResponse; // Updated this
  };
  "/fine-tune/:id": {
    params: {
      id: string;
    };
    response: FineTuneResponse; // Updated this
  };
  "/fine-tune/:id/events": {
    params: {
      id: string;
    };
    response: FineTuneEvent[]; // Updated this
  };
  "/fine-tune/:id/cancel": {
    params: {
      id: string;
    };
    response: FineTuneResponse; // Updated this
  };

  "/files/list": {
    response: FilesListResponse; // Updated this
  };
  "/files": {
    body: CreateOpenAIFileRequest;
    response: OpenAIFileObject; // TODO: Define the expected response type for file creation
  };
  "/files/:id": {
    params: {
      id: string;
    };
    response: OpenAIFileObject; // Updated this
  };
  "/files/:id/delete": {
    params: {
      id: string;
    };
    response: any; // TODO: Define the expected response type for file deletion
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
      { endpoint: "/fine-tune", method: "post" },
      { endpoint: "/fine-tune/list", method: "get" },
      { endpoint: "/fine-tune/:id", method: "get" },
      { endpoint: "/fine-tune/:id/events", method: "get" },
      { endpoint: "/fine-tune/:id/cancel", method: "delete" },
      { endpoint: "/files/list", method: "get" },
      { endpoint: "/files", method: "post" },
      { endpoint: "/files/:id", method: "get" },
      { endpoint: "/files/:id/delete", method: "delete" },
    ],
    defaultHeaders: {
      "Content-Type": "application/json",
    },
  });

  return {
    useSubmitFilesPaths: fileServer["/submit-files"],
    useViewDirectory: fileServer["/view-directory"],
    useListModels: fileServer["/get-models"],
    useCreateFineTune: fileServer["/fine-tune"],
    useListFineTunes: fileServer["/fine-tune/list"],
    useRetrieveFineTune: fileServer["/fine-tune/:id"],
    useListFineTuneEvents: fileServer["/fine-tune/:id/events"],
    useCancelFineTune: fileServer["/fine-tune/:id/cancel"],
    useListFiles: fileServer["/files/list"],
    useCreateOpenAIFile: fileServer["/files"],
    useRetrieveFile: fileServer["/files/:id"],
    useDeleteFile: fileServer["/files/:id/delete"],
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

export const useWatchValueChangeCount = (key: string, value: any) => {
  const changeCounts = useRef<Record<string, number>>({});

  useEffect(() => {
    changeCounts.current[key] = changeCounts.current[key] + 1;
    if (changeCounts.current[key] % 100 === 0) {
      console.warn("Excessive Value Changes: ", key, value);
    }
  }, [value]);
};

export const useComponentRenderCount = (logAtInterval: number = 100) => {
  const count = useRef(0);

  count.current += 1;

  if (count.current % logAtInterval === 0) {
    console.warn("Excessive Rendering", count.current);
  }
};

export const useFileFolderTable = ({
  directoryData,
}: {
  directoryData: FileDirInfo[] | null;
}) => {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const table = useReactTable({
    data: directoryData || [],
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  return table;
};
