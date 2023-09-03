import { Button } from "../../components/ui/button";
import { SheetTrigger } from "../../components/ui/sheet";
import { OpenAIFileSelectUpload, WhatTheSheet } from "../../fine-tune";
import { useAppState } from "../../socket-context";

export const Trainer = () => {
  const { state } = useAppState();
  const { directoryData } = state;
  return (
    <div>
      <h1>Utilities</h1>
      <WhatTheSheet
        trigger={
          <SheetTrigger asChild>
            <Button variant="outline">Trainer</Button>
          </SheetTrigger>
        }
      >
        <OpenAIFileSelectUpload dirData={directoryData} />
      </WhatTheSheet>
    </div>
  );
};
