import { CloudIcon } from "lucide-react";
import { useEffect } from "react";
import { Button } from "../components/ui/button";

import { useClipboard } from "@u-tools/react";
import { systemPrompts } from "../../../shared/custom-prompts";
import {
  FileFolderTable,
  getAllFileRows,
} from "../components/custom/file-folder-table";
import { QuickPopover } from "../components/custom/quick-popover";
import { SelectOption, SyncSelect } from "../components/custom/sync-select";
import { CompletionsDisplay } from "../components/domain/completions-display";
import { FileNavControls } from "../components/domain/file-nav-controls";
import { FilesToSubmitWithPrompt } from "../components/domain/files-to-submit-with-prompt";
import { PathSegments } from "../components/domain/path-segments";
import { NavBar } from "../components/ui/app-navbar";
import { Dialog, DialogContent, DialogTrigger } from "../components/ui/dialog";
import { Textarea } from "../components/ui/textarea";
import { useFileFolderTable } from "../hooks";
import { useAppState } from "../socket-context";

export function Home() {
  const { state, control } = useAppState();
  const { directoryData, filesToSubmit, fileSearchStatus, fileSearchResult } =
    state;

  const table = useFileFolderTable({
    directoryData:
      fileSearchStatus === "DONE" ? fileSearchResult : directoryData,
  });

  const { setClipboard } = useClipboard();

  const selectedFiles = table.getSelectedRowModel().rows.map((row) => {
    return row.original;
  });

  useEffect(() => {
    control.filesToSubmit.set(selectedFiles);
  }, [selectedFiles.length]);

  // the below does not include any folders
  const allFiles = getAllFileRows(table);

  const promptOptions = Object.keys(systemPrompts).map((key): SelectOption => {
    const typedKey = key as keyof typeof systemPrompts;
    return {
      label: systemPrompts[typedKey].title,
      value: systemPrompts[typedKey].id,
      popoverContent: systemPrompts[typedKey].prompt,
    };
  });

  const selectedPrompt = systemPrompts[state.systemPrompt].prompt;

  return (
    <>
      <div className="w-full flex flex-col justify-center gap-y-4">
        <div className="100% h-4" />
        <div className="fixed flex top-0 left-0 100vw z-10">
          <NavBar
            editBookmarkToggle={false}
            setEditBookmarkToggle={() => false}
          />
        </div>
      </div>

      <div className="my-8">
        <label className="text-lg">Prompt</label>
      </div>
      <Textarea
        onChange={(e: any) =>
          control.prompt.set(e.target?.value, {
            optimistic: true,
          })
        }
        value={state.prompt}
        placeholder="Additional Prompt"
        rows={10}
      />

      <div className="flex flex-row gap-x-2 m-2">
        <SyncSelect options={promptOptions} stateKey="systemPrompt" />

        <QuickPopover
          content={
            <div>
              <span className="font-bold">
                Prompt Len: {selectedPrompt.length + state.prompt.length}
              </span>
              <pre className="whitespace-pre-wrap  overflow-y-scroll max-h-96">
                {selectedPrompt} {state.prompt}
              </pre>
            </div>
          }
          className="w-420px; lg:w-[920px]"
        >
          <Button>View Prompt</Button>
        </QuickPopover>

        <Dialog>
          <DialogTrigger>
            <Button>Add Files</Button>
          </DialogTrigger>
          <DialogContent className="overflow-y-scroll lg:max-w-[90vw]">
            <PathSegments />

            <FileNavControls />

            <h2>
              {selectedFiles?.length}/{allFiles?.length} Files Selected
            </h2>
            <div className="overflow-y-scroll max-h-96">
              <FileFolderTable table={table} />
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {filesToSubmit.length > 0 && (
        <div className="my-4">
          <p>Files:</p>
        </div>
      )}

      <FilesToSubmitWithPrompt />

      <div className="w-full justify-center">
        <Button
          variant="ghost"
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
              <CloudIcon /> Cancel
            </>
          ) : (
            "Submit"
          )}
        </Button>

        <p>Completion Status {state.completionAPIStatus}</p>
      </div>

      <CompletionsDisplay />

      <div className="w-full justify-center items-center flex flex-col">
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
      </div>
    </>
  );
}
