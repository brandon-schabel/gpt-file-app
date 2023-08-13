import {
    Sheet,
    SheetClose,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import { FileDirInfo } from "@u-tools/core/modules/files-factory/files-folder";
import { ReactNode, useMemo, useState } from "react";
import { Button } from "./components/ui/button";
import { FileFolderTable } from "./components/ui/file-folder-table";
import { Input } from "./components/ui/input";
import { useFileFolderTable, useServer } from "./hooks";

export function WhatTheSheet({
  children,
  trigger,
}: {
  children: ReactNode;
  trigger: ReactNode;
}) {
  return (
    <Sheet>
      {trigger}

      <SheetContent>
        <SheetHeader>
          <SheetTitle>Edit profile</SheetTitle>
          <SheetDescription>
            Make changes to your profile here. Click save when you're done.
          </SheetDescription>
        </SheetHeader>
        <div className="flex flex-col space-y-4">{children}</div>
        <SheetFooter>
          <SheetClose asChild>
            {/* <Button type="submit">Save changes</Button> */}
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

export const OpenAIFileSelectUpload = ({
  dirData,
}: {
  dirData: FileDirInfo[] | null;
}) => {
  const { useCreateOpenAIFile } = useServer();
  const [purpose, setPurpose] = useState("");
  const { data, post } = useCreateOpenAIFile();

  const filteredData = useMemo(
    () =>
      dirData?.filter((dataRow) => {
        if (dataRow.type === "directory") return true;

        if (dataRow.extension === "jsonl") return true;
      }),
    [dirData]
  );
  const table = useFileFolderTable({
    directoryData: filteredData || null,
  });

  // create file implementation, upload happens on server
  const handleFileCreate = async () => {
    const selectedFile = table.getSelectedRowModel().rows[0]?.original;

    console.log({ selectedFile });

    const result = await post({
        file: selectedFile,
        purpose,
    });

    console.log({ result });
  };

  return (
    <>
      <h1>Upload JSONL Files:</h1>
      <FileFolderTable table={table} />

      <label>
        Purpose
        <Input onChange={(e) => setPurpose(e.target.value)} />
      </label>
      <Button onClick={handleFileCreate}>Upload File</Button>

      <div>Uploaded File Response:</div>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </>
  );
};
