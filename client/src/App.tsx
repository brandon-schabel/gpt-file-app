import { useLocalStorage } from "@u-tools/react/use-local-storage";
import { useState } from "react";
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
import {
  useBookmarks,
  useFileServer,
  useFileSubmitQueue,
  usePathControl,
} from "./hooks";

function App() {
  const { addBookmark, bookmarks, removeBookmark } = useBookmarks();

  const {
    currentViewPath,
    forwardPaths,
    prevViewPaths,
    backNDirs,
    changeDir,
    forwardNDirs,
    directoryData,
  } = usePathControl();

  const { useSubmitFilesPaths } = useFileServer();

  const { addFileToQueue, filePathsToSubmit, removeFileFromQueue } =
    useFileSubmitQueue();

  const { data: gptRequestData, post: postGptRequest } = useSubmitFilesPaths();

  const [prompt, setPrompt] = useLocalStorage<string>({
    key: "prompt",
    initialState: "",
  });

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    const result = await postGptRequest({ files: filePathsToSubmit, prompt });
    console.log("result", result);
  };

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
            {directoryData?.map((fileOrDirData) => (
              <TableRow key={fileOrDirData.fullPath}>
                <TableCell className="font-medium">
                  {fileOrDirData.name}
                </TableCell>
                <TableCell>{fileOrDirData.type}</TableCell>
                <TableCell>
                  {fileOrDirData.type === "file" && (
                    <Button
                      onClick={() => {
                        addFileToQueue(fileOrDirData);
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
                      changeDir(fileOrDirData);
                    }}
                  >
                    {fileOrDirData.fullPath}
                  </Button>
                </TableCell>
                <TableCell>
                  <Button
                    onClick={() => {
                      addBookmark(fileOrDirData);
                    }}
                  >
                    Bookmark
                  </Button>

                  <Button
                    onClick={() => {
                      removeBookmark(fileOrDirData);
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
          {gptRequestData?.choices.map((choice) => {
            return <p>{choice.message.content}</p>;
          })}
        </ScrollArea>
      </div>
    </>
  );
}

export default App;
