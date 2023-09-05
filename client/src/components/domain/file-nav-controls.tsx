import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { useState } from "react";
import { useAppState } from "../../socket-context";
import { SyncInput } from "../custom/sync-input";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

export const FileNavControls = () => {
  const { goBack, goForward, navigateTo, control } = useAppState();
  const [manualInputDir, setManualInputDir] = useState("");

  return (
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
          className="w-64"
        >
          Go To Path
        </Button>
        File Search:
        <SyncInput stateKey="fileSearchString" />
        <Button
          variant="secondary"
          onClick={() => {
            control.fileSearchStatus.set("IN_PROGRESS");
          }}
        >
          Search
        </Button>
        <Button onClick={() => {
          control.fileSearchStatus.set("IDLE")
        }}>
          Clear
        </Button>
      </div>
    </div>
  );
};
