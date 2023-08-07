import { useLocalStorage } from "@u-tools/react/use-local-storage";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { ComponentProps, ReactNode, useState } from "react";
import "./App.css";
import { Button } from "./components/ui/button";
import { Input } from "./components/ui/input";
import {
  Menubar,
  MenubarCheckboxItem,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarTrigger,
} from "./components/ui/menubar";
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
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./components/ui/tooltip";
import { useToast } from "./components/ui/use-toast";
import {
  useBookmarks,
  useFileServer,
  useFileSubmitQueue,
  usePathControl,
} from "./hooks";

type BtnProps = ComponentProps<"button">;

const TableCellTooltip = ({
  children,
  onClick,
  className,
  tooltipContent,
  onTooltipContentClick,
  toastOptions,
}: {
  children: ReactNode;
  onClick?: BtnProps["onClick"];
  className?: string;
  tooltipContent: ReactNode;
  onTooltipContentClick?: BtnProps["onClick"];
  toastOptions: {
    title: string;
    description: string;
    toastAction?: ReactNode;
  };
}) => {
  const [tooltipOpen, setTooltipOpen] = useState(false);
  const { toast } = useToast();

  return (
    <TooltipProvider>
      <Tooltip onOpenChange={setTooltipOpen} open={tooltipOpen}>
        <TooltipTrigger>
          <TableCell className={className} onClick={onClick}>
            {children}
          </TableCell>
        </TooltipTrigger>
        {tooltipContent && (
          <TooltipContent
            className="hover:cursor-pointer hover:bg-zinc-300"
            onClick={(event) => {
              if (onTooltipContentClick) {
                onTooltipContentClick(event);
              }

              if (toastOptions) {
                toast(toastOptions);
              }
            }}
          >
            {tooltipContent}
          </TooltipContent>
        )}
      </Tooltip>
    </TooltipProvider>
  );
};

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

  const NavBar = () => {
    return (
      <Menubar>
        <MenubarMenu>
          <MenubarTrigger>File</MenubarTrigger>
          <MenubarContent>
            <MenubarItem>
              <MenubarCheckboxItem
                onCheckedChange={setEditBookmarkToggle}
                checked={editBookmarkToggle}
              >
                Edit Bookmarks
              </MenubarCheckboxItem>
            </MenubarItem>
          </MenubarContent>
        </MenubarMenu>
        <MenubarMenu>
          <MenubarTrigger>Bookmarks</MenubarTrigger>
          <MenubarContent>
            {bookmarks.map((bookmark) => {
              return (
                <MenubarItem
                  key={bookmark.fullPath}
                  onClick={() => changeDir(bookmark)}
                >
                  {bookmark.name}
                </MenubarItem>
              );
            })}
          </MenubarContent>
        </MenubarMenu>
      </Menubar>
    );
  };

  return (
    <>
      <div className="w-full flex flex-col justify-center gap-y-4">
        <NavBar />

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
      <ScrollArea className="h-[calc(100vh-128px)] w-full shadow-md border-2 rounded">
        <Table>
          <TableCaption>Files</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px] text-left">Name</TableHead>
              {/* <TableHead>File Type</TableHead> */}
              <TableHead className="text-left">Add</TableHead>
              {/* <TableHead>Full Path</TableHead> */}
              <TableHead className="text-left">Bookmark</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {directoryData?.map((fileOrDirData) => (
              <TableRow key={fileOrDirData.fullPath}>
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
                      <Button
                        onClick={() => {
                          changeDir(fileOrDirData);
                        }}
                      >
                        {fileOrDirData.name}
                      </Button>
                    ) : (
                      fileOrDirData.name
                    )}
                  </div>
                </TableCellTooltip>
                <TableCell className="text-left">
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
                </TableCell>
                <TableCell>
                  <div className="flex w-full justify-start gap-x-2">
                    <Button
                      onClick={() => {
                        addBookmark(fileOrDirData);
                      }}
                      variant={"outline"}
                      className="w-24 rounded-3xl text-xs"
                    >
                      Bookmark
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </ScrollArea>

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
      <div className="w-full justify-center">
        <Button
          onClick={handleSubmit}
          variant={"ghost"}
          className="w-32 bg-blue-400  "
        >
          Submit
        </Button>
      </div>
      <h1 className="font-bold">Output:</h1>

      <div className="w-full justify-center items-center flex flex-col">
        <ScrollArea className="h-[300px] w-1/2 rounded-md border p-4">
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
