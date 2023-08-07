import { FileDirInfo } from "@u-tools/core/modules/files-factory/files-folder";
import { useApiFactory } from "@u-tools/react/use-api-factory";
import { useLocalStorage } from "@u-tools/react/use-local-storage";
import { useEffect, useState } from "react";
import {
  ROUTE_VIEW_PATH,
  SubmitFilesRequest,
  SubmitFilesResponse,
  ViewDirectoryResponse,
} from "../../shared";
import "./App.css";
import { Button } from "./components/ui/button";
import { Input } from "./components/ui/input";
import { ScrollArea } from "./components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./components/ui/table";
import { Textarea } from "./components/ui/textarea";

type GPTFileServerAppEndpoints = {
  "/submit-files": {
    body: SubmitFilesRequest;
    response: SubmitFilesResponse;
  };
  [ROUTE_VIEW_PATH]: {
    body: {
      path: string;
    };
    response: ViewDirectoryResponse;
  };
};

function App() {
  const defaultPath: FileDirInfo = {
    fullPath: "/Users/brandon",
    name: "Home Dir",
    type: "directory",
  };

  const [bookmarks, setBookmarks] = useLocalStorage<FileDirInfo[]>({
    key: "bookmarks",
    initialState: [],
  });
  const [storedCurrentPath, setStoredCurrentPath] =
    useLocalStorage<FileDirInfo>({
      key: "currentPath",
      initialState: defaultPath,
    });

  const result = useApiFactory<GPTFileServerAppEndpoints>({
    baseUrl: "http://localhost:8080",
    endpoints: [
      { endpoint: "/submit-files", method: "post" },
      { endpoint: "/view-directory", method: "post" },
    ],
  });

  const useSubmitFilesPaths = result["/submit-files"];
  const useViewDirectory = result[ROUTE_VIEW_PATH];

  const { data: viewDirectoryData, post: postViewDirectory } =
    useViewDirectory();
  const { data: gptRequestData, post: postGptRequest } = useSubmitFilesPaths();

  const [prevViewPaths, setPrevViewPaths] = useLocalStorage<FileDirInfo[]>({
    key: "prevViewPaths",
    initialState: [],
  });

  const [forwardPaths, setForwardPaths] = useLocalStorage<FileDirInfo[]>({
    key: "forwardPaths",
    initialState: [],
  });

  const [currentViewPath, setNewViewPath] = useLocalStorage<FileDirInfo>({
    key: "currentViewPath",
    initialState: storedCurrentPath,
  });

  const [filePathsToSubmit, setFilePathsToSubmit] = useLocalStorage<
    FileDirInfo[]
  >({
    key: "filePathsToSubmit",
    initialState: [],
  });

  const [prompt, setPrompt] = useLocalStorage<string>({
    key: "prompt",
    initialState: "",
  });

  const addBookmark = (path: FileDirInfo) => {
    if (!bookmarks.some((b) => b.fullPath === path.fullPath)) {
      setBookmarks([...bookmarks, path]);
    }
  };

  const removeBookmark = (path: FileDirInfo) => {
    setBookmarks(bookmarks.filter((b) => b.fullPath !== path.fullPath));
  };

  const removeFileFromQueue = (file: FileDirInfo) => {
    setFilePathsToSubmit((prevFiles) =>
      prevFiles.filter((f) => f.fullPath !== file.fullPath)
    );
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    const result = await postGptRequest({ files: filePathsToSubmit, prompt });
    console.log("result", result);
  };

  const fetchPath = (path: string) => {
    return postViewDirectory({ path });
  };

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

  useEffect(() => {
    fetchPath(storedCurrentPath.fullPath);
  }, []);

  const [manualInputDir, setManualInputDir] = useState("");

  return (
    <>
      <div className="w-full">
        <div>
          {bookmarks.map((bookmark) => {
            return (
              <Button
                key={bookmark.fullPath}
                onClick={() => {
                  changeDir(bookmark);
                }}
              >
                {bookmark.name}
              </Button>
            );
          })}
        </div>
        <h1>Current Path: {currentViewPath.fullPath}</h1>
        <Input onChange={(e) => setManualInputDir(e.target.value)}></Input>
        <Button
          onClick={() => {
            changeDir({
              fullPath: manualInputDir,
              name: "Manual Input",
              type: "directory",
            });
          }}
        >
          Go To Path
        </Button>

        <Button
          onClick={() => backNDirs(1)}
          disabled={prevViewPaths.length === 0}
        >
          Back
        </Button>
        <Button
          onClick={() => forwardNDirs(1)}
          disabled={forwardPaths.length === 0}
        >
          Forward
        </Button>
      </div>
      <ScrollArea className="h-[calc(100vh-128px)] w-full shadow-md border-2 rounded">
        <Table>
          <TableCaption>Files</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Name</TableHead>
              <TableHead>File Type</TableHead>
              <TableHead>Add</TableHead>
              <TableHead>Full Path</TableHead>
              <TableHead>Bookmark</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {viewDirectoryData?.map((data) => (
              <TableRow key={data.fullPath}>
                <TableCell className="font-medium">{data.name}</TableCell>
                <TableCell>{data.type}</TableCell>
                <TableCell>
                  {data.type === "file" && (
                    <Button
                      onClick={() => {
                        // as long as it doesn't exist in filePathsToSubmit
                        if (
                          !filePathsToSubmit.some(
                            (f) => f.fullPath === data.fullPath
                          )
                        ) {
                          setFilePathsToSubmit((prevState) => [
                            ...prevState,
                            data,
                          ]);
                        }
                      }}
                      variant={"outline"}
                    >
                      <span className="font-bold text-lg">+</span>
                    </Button>
                  )}
                </TableCell>
                <TableCell>
                  <Button
                    onClick={() => {
                      changeDir(data);
                    }}
                  >
                    {data.fullPath}
                  </Button>
                </TableCell>
                <TableCell>
                  <Button
                    onClick={() => {
                      addBookmark(data);
                    }}
                  >
                    Bookmark
                  </Button>

                  <Button
                    onClick={() => {
                      removeBookmark(data);
                    }}
                  >
                    Remove
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </ScrollArea>

      <label>Prompt</label>
      <Textarea
        onChange={(e) => setPrompt(e.target?.value as any)}
        value={prompt}
        placeholder="Additional Prompt"
      ></Textarea>
      <p>Files:</p>
      {filePathsToSubmit.map((file) => {
        return (
          <p
            onClick={() => removeFileFromQueue(file)}
            className="hover:bg-red-200 rounded"
          >
            {file.name} - {file.fullPath}
          </p>
        );
      })}
      <Button onClick={handleSubmit} variant={"outline"}>
        Submit
      </Button>
      <h1> Result:</h1>
      <div className="w-full justify-center flex">
        <ScrollArea className="h-[300px] w-1/2 rounded-md border p-4">
          {/* {gptRequestData?.message.content} */}
          {/* {JSON.stringify(gptRequestData, null, 2)} */}
          {gptRequestData?.choices.map((choice) => {
            return <p>{choice.message.content}</p>;
          })}
        </ScrollArea>
      </div>
    </>
  );
}

export default App;
