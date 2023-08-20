import { ChevronLeftIcon, ChevronRightIcon, CloudIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import "./App.css";
import { Button } from "./components/ui/button";
import { Input } from "./components/ui/input";

import { ScrollArea } from "./components/ui/scroll-area";

import { useClipboard } from "@u-tools/react";

import { FileDirInfo } from "@u-tools/core/modules/files-factory/files-folder";
import { NavBar } from "./components/ui/app-navbar";
import {
  FileFolderTable,
  getAllFileRows,
} from "./components/ui/file-folder-table";
import { SheetTrigger } from "./components/ui/sheet";
import { SyncBoolean } from "./components/ui/sync-boolean";
import { SyncInput } from "./components/ui/sync-input";
import { Textarea } from "./components/ui/textarea";
import { OpenAIFileSelectUpload, WhatTheSheet } from "./fine-tune";
import { useFileFolderTable } from "./hooks";
import { useAppState } from "./socket-context";

function App() {
  const { state, control, goBack, goForward, navigateTo } = useAppState();
  const { bookmarks, count, directoryData, filePathsToSubmit } = state;

  const currentIndex = state.navigation.currentIndex;
  const currentPath = state.navigation.paths[currentIndex];

  const table = useFileFolderTable({
    directoryData,
  });

  const renderCount = useRef(0);

  console.log(renderCount.current);

  renderCount.current++;

  const { setClipboard } = useClipboard();

  const [manualInputDir, setManualInputDir] = useState("");

  const selectedFiles = table.getSelectedRowModel().rows.map((row) => {
    return row.original;
  });
  const selectedRowsLen = selectedFiles.length;

  useEffect(() => {
    control.filePathsToSubmit.set(selectedFiles);
  }, [selectedRowsLen]);

  // the below does not include any folders
  const allFiles = getAllFileRows(table);

  // break down currentPath.fullPath into segments, and then create links to each
  // segment, each segment needs to be a concatination of all paths prior
  // to the current path, like cookie crumbs
  let currentPathSegment = "";

  const allSegments = currentPath.fullPath.split("/");
  const mappedSegments = allSegments.map(
    (
      segment,
      index
    ): {
      label: string;
      fileDirInfo: FileDirInfo;
    } => {
      currentPathSegment += segment;
      // add "/" for each segement except the last one
      if (index !== allSegments.length - 1) {
        currentPathSegment += "/";
      }

      return {
        label: segment,
        fileDirInfo: {
          fullPath: currentPathSegment,
          name: segment,
          type: "directory",
          extension: "",
          size: 0,
        },
      };
    }
  );

  const pathSegmentLinks = mappedSegments.map((segment, index) => {
    return (
      <span
        key={segment.fileDirInfo.fullPath + segment.label}
        onClick={() => {
          navigateTo(segment.fileDirInfo);
        }}
        className="hover:underline hover:text-green-400"
      >
        {segment.label}
        {index !== allSegments.length - 1 && "/"}
      </span>
    );
  });

  return (
    <>
      <div className="w-full flex flex-col justify-center gap-y-4">
        <div className="100% h-4" />
        <div className="fixed flex top-0 left-0 100vw z-10">
          <NavBar
            bookmarks={bookmarks}
            changeDir={(bookmark) => navigateTo(bookmark)}
            editBookmarkToggle={false}
            setEditBookmarkToggle={() => false}
          />
        </div>

        <div>{pathSegmentLinks}</div>

        <div>
          <Button onClick={() => control.count.set(count - 1)}>-</Button>
          <Button onClick={() => control.count.set(count + 1)}>+</Button>
          <Button onClick={() => control.count.set(0)}>Reset</Button>
          <pre>{count}</pre>
        </div>

        {false && (
          <div className="flex flex-row gap-x-2 w-full justify-center">
            {bookmarks?.map((bookmark) => {
              return (
                <div
                  className="flex flex-col max-w-[100px] gap-y-2"
                  key={bookmark.fullPath}
                >
                  <Button
                    key={bookmark.fullPath}
                    onClick={() => {
                      navigateTo(bookmark);
                    }}
                  >
                    {bookmark.name}
                  </Button>
                  {false && <Button onClick={() => {}}>Remove</Button>}
                </div>
              );
            })}
          </div>
        )}

        <h2>
          {selectedFiles?.length}/{allFiles?.length} Files Selected
        </h2>

        <div className="flex flex-row gap-x-2 flex-start mb-2 w-full">
          <Button
            onClick={() => {
              goBack();
            }}
          >
            <ChevronLeftIcon />
          </Button>
          <Button
            onClick={() => {
              goForward();
            }}
          >
            <ChevronRightIcon />
          </Button>
          <div className="flex flex-row gap-x-2">
            <Input onChange={(e: any) => setManualInputDir(e.target.value)} />
            File Search:
            <SyncInput stateKey="fileSearchString" />
            
            <SyncBoolean stateKey="enabledTest" type="checkbox" />
            <SyncBoolean stateKey="enabledTest" type="switch" />
            <SyncBoolean
              stateKey="enabledTest"
              type="toggle-button"
              toggleButtonVariant={{ variant: "ghost", size: "sm" }}
            />

            <Button
              onClick={() => {
                navigateTo({
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
        onChange={(e: any) =>
          control.prompt.set(e.target?.value, {
            optimistic: true,
          })
        }
        value={state.prompt}
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
              // onClick={() => removeFileFromQueue(file)}
              className="hover:bg-red-200 rounded"
              key={file.fullPath}
            >
              {file.name} - {file.fullPath}
            </p>
          );
        })}
      </div>
      {/* <Combobox
        options={defaultModels}
        value={selectedModel}
        onValueChange={setSelectedModel}
      /> */}

      <div className="w-full justify-center">
        <Button
          // onClick={handleSubmit}
          variant={"ghost"}
          className="w-32 bg-blue-400"
          onClick={() => {
            if (
              state.completionAPIStatus === "FETCH" ||
              state.completionAPIStatus === "IN_PROGRESS"
            ) {
              control.completionAPIStatus.set("IDLE");
            } else {
              control.completionAPIStatus.set("FETCH");
            }
          }}
        >
          {state.completionAPIStatus === "FETCH" ||
          state.completionAPIStatus === "IN_PROGRESS" ? (
            <>
              <CloudIcon /> "Cancel"
            </>
          ) : (
            "Submit"
          )}
        </Button>

        <p>Completion Status {state.completionAPIStatus}</p>
      </div>
      <h1 className="font-bold">Output:</h1>

      <div className="w-full justify-center items-center flex flex-col">
        <ScrollArea className="h-[300px] w-full rounded-md border p-4 text-left">
          {state.completionResponse?.choices.map((choice) => {
            return <p>{choice.message.content}</p>;
          })}
        </ScrollArea>
        <div>
          <Button
            onClick={() => {
              setClipboard(
                state.completionResponse?.choices
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
