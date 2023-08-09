import { FileDirInfo } from "@u-tools/core/modules/files-factory/files-folder";
import {
    BookMarkedIcon,
    BookmarkIcon,
    FileIcon,
    FolderIcon,
    Table,
} from "lucide-react";
import { Button } from "./button";
import {
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "./table";
import { TableCellTooltip } from "./table-cell-tooltip";

export const OldTable = ({
  directoryData,
  bookmarks,
  filePathsToSubmit,
  changeDir,
  addBookmark,
  addFileToQueue
}: {
  directoryData: FileDirInfo[] | null;
  bookmarks: FileDirInfo[];
  filePathsToSubmit: FileDirInfo[];
  changeDir: (file: FileDirInfo) => void;
  addFileToQueue: (file: FileDirInfo) => void;
  addBookmark: (file: FileDirInfo) => void;
}) => {
  return (
    <Table>
      <TableCaption>Files</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[100px] text-left">Name</TableHead>
          <TableHead className="text-left">Add</TableHead>
          <TableHead className="text-left">Bookmark</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {directoryData?.map((fileOrDirData) => {
          const isBookMarked = bookmarks.some(
            (bookmark) => bookmark.fullPath === fileOrDirData.fullPath
          );

          const isInQueue = filePathsToSubmit.some(
            (file) => file.fullPath === fileOrDirData.fullPath
          );

          return (
            <TableRow
              key={fileOrDirData.fullPath}
              onClick={() => {
                changeDir(fileOrDirData);
              }}
            >
              <TableCellTooltip
                className="font-medium justify-start text-left items-center"
                tooltipContent={fileOrDirData.fullPath}
                onTooltipContentClick={() => {
                  // copy path to clipboard
                  navigator.clipboard.writeText(fileOrDirData.fullPath);
                }}
                toastOptions={{
                  description: fileOrDirData.fullPath,
                  title: "Copied Path",
                }}
              >
                <div className="flex w-32 justify-start text-left">
                  {fileOrDirData.type === "directory" ? (
                    <Button>
                      <FolderIcon /> {fileOrDirData.name}
                    </Button>
                  ) : (
                    <>
                      <FileIcon /> <span>{fileOrDirData.name}</span>
                    </>
                  )}
                </div>
              </TableCellTooltip>

              <TableCell className="text-left">
                {!isInQueue && (
                  <div className="flex w-full justify-start">
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
                  </div>
                )}
              </TableCell>
              <TableCell>
                <div className="flex w-full justify-start gap-x-2">
                  <Button
                    onClick={() => {
                      addBookmark(fileOrDirData);
                    }}
                    variant="outline"
                    className="w-24 rounded-3xl text-xs"
                  >
                    {isBookMarked ? <BookMarkedIcon /> : <BookmarkIcon />}
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
};
