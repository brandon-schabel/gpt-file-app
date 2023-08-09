import { useLocalStorage } from "@u-tools/react/use-local-storage";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import "./App.css";
import { Button } from "./components/ui/button";
import { ComboOption, Combobox } from "./components/ui/combobox";
import { Input } from "./components/ui/input";

import { ScrollArea } from "./components/ui/scroll-area";

import { Textarea } from "./components/ui/textarea";

import { NavBar } from "./components/ui/app-navbar";
import { OldTable } from "./components/ui/old-table";
import {
  useBookmarks,
  useFileSubmitQueue,
  usePathControl,
  useServer,
} from "./hooks";

const defaultModels: ComboOption[] = [
  {
    label: "gpt-3.5-turbo-16k-0613",
    value: "gpt-3.5-turbo-16k-0613",
  },
  {
    label: "gpt-3.5-turbo-16k",
    value: "gpt-3.5-turbo-16k",
  },
  {
    label: "gpt-3.5-turbo",
    value: "gpt-3.5-turbo",
  },
  {
    label: "gpt-3.5-turbo-0301",
    value: "gpt-3.5-turbo-0301",
  },
  {
    label: "gpt-3.5-turbo-0613",
    value: "gpt-3.5-turbo-0613",
  },
  {
    label: "gpt-4",
    value: "gpt-4",
  },
];

function App() {
  const { addBookmark, bookmarks, removeBookmark } = useBookmarks();
  const [editBookmarkToggle, setEditBookmarkToggle] = useLocalStorage({
    key: "bookMarkToggle",
    initialState: false,
  });

  const {
    currentViewPath,
    forwardPaths,
    prevViewPaths,
    backNDirs,
    changeDir,
    forwardNDirs,
    directoryData,
  } = usePathControl();

  const { useSubmitFilesPaths, useListModels } = useServer();
  const [selectedModel, setSelectedModel] = useLocalStorage({
    key: "selectedModel",
    initialState: "gpt-3.5-turbo",
  });
  const { get: getModels, data: modelList } = useListModels();
  useEffect(() => {
    getModels();
  }, []);

  const { addFileToQueue, filePathsToSubmit, removeFileFromQueue } =
    useFileSubmitQueue();

  const { data: gptRequestData, post: postGptRequest } = useSubmitFilesPaths();

  const [prompt, setPrompt] = useLocalStorage<string>({
    key: "prompt",
    initialState: "",
  });

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    const result = await postGptRequest({
      files: filePathsToSubmit,
      prompt,
      model: selectedModel,
    });
    console.log("result", result);
  };

  const [manualInputDir, setManualInputDir] = useState("");

  const modelOptions = useMemo((): ComboOption[] => {
    return (
      modelList?.data.map((item) => {
        return {
          label: item.id,
          value: item.id,
        };
      }) || []
    );
  }, [modelList]);

  return (
    <>
      <div className="w-full flex flex-col justify-center gap-y-4">
        <div className="fixed flex top-0 left-0 w-100vw z-10">
          <NavBar
            bookmarks={bookmarks}
            changeDir={changeDir}
            editBookmarkToggle={editBookmarkToggle}
            setEditBookmarkToggle={setEditBookmarkToggle}
          />
        </div>

        {/* move to modal */}
        {editBookmarkToggle && (
          <div className="flex flex-row gap-x-2 w-full justify-center">
            {bookmarks.map((bookmark) => {
              return (
                <div className="flex flex-col max-w-[100px] gap-y-2">
                  <Button
                    key={bookmark.fullPath}
                    onClick={() => {
                      changeDir(bookmark);
                    }}
                  >
                    {bookmark.name}
                  </Button>
                  {editBookmarkToggle && (
                    <Button
                      onClick={() => {
                        removeBookmark(bookmark);
                      }}
                    >
                      Remove
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        )}

        <h1>Current Path: {currentViewPath.fullPath}</h1>

        <div className="flex flex-row gap-x-2 flex-start mb-2 w-full">
          <Button
            onClick={() => backNDirs(1)}
            disabled={prevViewPaths.length === 0}
          >
            <ChevronLeftIcon />
          </Button>
          <Button
            onClick={() => forwardNDirs(1)}
            disabled={forwardPaths.length === 0}
          >
            <ChevronRightIcon />
          </Button>

          <div className="flex flex-row gap-x-2">
            <Input onChange={(e) => setManualInputDir(e.target.value)}></Input>

            <Button
              onClick={() => {
                changeDir({
                  fullPath: manualInputDir,
                  name: "Manual Input",
                  type: "directory",
                });
              }}
              className="w-40"
            >
              Go To Path
            </Button>
          </div>
        </div>
      </div>
      <ScrollArea className="h-[calc(100vh-128px)] w-full shadow-md border-2 rounded"></ScrollArea>
      <OldTable
        addBookmark={addBookmark}
        addFileToQueue={addFileToQueue}
        bookmarks={bookmarks}
        changeDir={changeDir}
        directoryData={directoryData}
        filePathsToSubmit={filePathsToSubmit}
      />

      <div className="my-8">
        <label className="text-lg ">Prompt</label>
      </div>
      <Textarea
        onChange={(e) => setPrompt(e.target?.value as any)}
        value={prompt}
        placeholder="Additional Prompt"
      ></Textarea>
      <div className="my-4">
        <p>Files:</p>
      </div>

      <div className="flex flex-col gapy-y-2 mb-4">
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
      </div>
      <Combobox
        options={defaultModels}
        value={selectedModel}
        onValueChange={setSelectedModel}
      />

      <div className="w-full justify-center">
        <Button
          onClick={handleSubmit}
          variant={"ghost"}
          className="w-32 bg-blue-400"
        >
          Submit
        </Button>
      </div>
      <h1 className="font-bold">Output:</h1>

      <div className="w-full justify-center items-center flex flex-col">
        <ScrollArea className="h-[300px] w-full rounded-md border p-4 text-left">
          {gptRequestData?.choices.map((choice) => {
            return <p>{choice.message.content}</p>;
          })}
        </ScrollArea>
        <div>
          <Button
            onClick={() => {
              navigator.clipboard.writeText(
                gptRequestData?.choices
                  .map((choice) => {
                    return choice.message.content;
                  })
                  .join("\n")
              );
            }}
            className="mt-2"
          >
            Copy output
          </Button>
        </div>
      </div>
    </>
  );
}

export default App;
