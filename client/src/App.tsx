import { useLocalStorage } from "@u-tools/react/use-local-storage";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import "./App.css";
import { Button } from "./components/ui/button";
import { ComboOption, Combobox } from "./components/ui/combobox";
import { Input } from "./components/ui/input";

import { ScrollArea } from "./components/ui/scroll-area";

import { Textarea } from "./components/ui/textarea";

import { useClipboard } from "@u-tools/react";
import { defaultPath } from "../../shared";

import { useAppContext } from "./app-context";
import { NavBar } from "./components/ui/app-navbar";
import {
  FileFolderTable,
  getAllFileRows,
} from "./components/ui/file-folder-table";
import { SheetTrigger } from "./components/ui/sheet";
import { defaultModels } from "./constants/config";
import { OpenAIFileSelectUpload, WhatTheSheet } from "./fine-tune";
import { useFileFolderTable } from "./hooks";
import { useAppState } from "./use-app-state";

function App() {
  const { state, control } = useAppState();

  const {
    bookmarks: { bookmarks = [], removeBookmark },
    fileSubmitQueue: { filePathsToSubmit = [], removeFileFromQueue },
    pathControl: {
      backNDirs,
      changeDir,
      currentViewPath = defaultPath,
      directoryData = [],
      forwardNDirs,
      forwardPaths = [],
      prevViewPaths = [],
    },
    server: { useListModels, useSubmitFilesPaths },
  } = useAppContext();

  const table = useFileFolderTable({
    directoryData,
  });

  const { setClipboard } = useClipboard();
  const { state: editBookmarkToggle, setState: setEditBookmarkToggle } =
    useLocalStorage({
      key: "bookMarkToggle",
      initialState: false,
    });

  const { state: selectedModel, set: setSelectedModel } = useLocalStorage({
    key: "selectedModel",
    initialState: "gpt-3.5-turbo",
  });
  const { get: getModels, data: modelList } = useListModels();
  useEffect(() => {
    getModels();
  }, []);

  const { data: gptRequestData, post: postGptRequest } = useSubmitFilesPaths();

  const { state: prompt, set: setPrompt } = useLocalStorage<string>({
    key: "prompt",
    initialState: "",
  });

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    await postGptRequest({
      files: filePathsToSubmit,
      prompt,
      model: selectedModel,
    });
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

  const selectedFiles = table.getSelectedRowModel().rows;
  // the below does not include any folders
  const allFiles = getAllFileRows(table);

  return (
    <>
      <div className="w-full flex flex-col justify-center gap-y-4">
        <div className="100% h-4" />
        <div className="fixed flex top-0 left-0 100vw z-10">
          <NavBar
            bookmarks={bookmarks}
            changeDir={changeDir}
            editBookmarkToggle={editBookmarkToggle}
            setEditBookmarkToggle={setEditBookmarkToggle}
          />
        </div>

        <div>
          {/* <button onClick={() => control.count.set(state.count - 1)}>-</button>( */}
          {state.count})
          <button onClick={() => control.count.set(state.count + 1)}>+</button>
          {/* <button onClick={() => control.count.set(0)}>Reset</button> */}
          <pre>{JSON.stringify(state, null, 2)}</pre>
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

        {currentViewPath && <h1>Current Path: {currentViewPath.fullPath}</h1>}
        <h2>
          {selectedFiles.length}/{allFiles.length} Files Selected
        </h2>

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
            <Input
              onChange={(e: any) => setManualInputDir(e.target.value)}
            ></Input>

            <Button
              onClick={() => {
                changeDir({
                  fullPath: manualInputDir,
                  name: "Manual Input",
                  type: "directory",
                  extension: "",
                  size: 0,
                });
              }}
              className="w-40"
            >
              Go To Path
            </Button>
          </div>
        </div>
      </div>
      <ScrollArea className="h-[calc(100vh-128px)] w-full shadow-md border-2 rounded">
        <FileFolderTable table={table} />
      </ScrollArea>

      <div className="my-8">
        <label className="text-lg ">Prompt</label>
      </div>
      <Textarea
        onChange={(e: any) => setPrompt(e.target?.values)}
        value={prompt}
        placeholder="Additional Prompt"
      ></Textarea>
      <div className="my-4">
        <p>Files:</p>
      </div>

      <WhatTheSheet
        trigger={
          <SheetTrigger asChild>
            <Button variant="outline">Fine Tune</Button>
          </SheetTrigger>
        }
      >
        <OpenAIFileSelectUpload dirData={directoryData} />
      </WhatTheSheet>

      <div className="flex flex-col gapy-y-2 mb-4">
        {filePathsToSubmit?.map((file) => {
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
              setClipboard(
                gptRequestData?.choices
                  .map((choice) => {
                    return choice.message.content;
                  })
                  .join("\n") || ""
              );
            }}
            className="mt-2"
          >
            Copy output
          </Button>
        </div>

        {/* <RandomComponent /> */}
      </div>
    </>
  );
}

export default App;
