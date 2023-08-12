import {
  ChevronDownIcon,
  DotsHorizontalIcon,
  FileIcon,
} from "@radix-ui/react-icons";
import {
  ColumnDef,
  flexRender,
  type Table as TableType,
} from "@tanstack/react-table";

import { useAppContext } from "@/app-context";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { FileDirInfo } from "@u-tools/core/modules/files-factory/files-folder";
import { useClipboard } from "@u-tools/react";
import {
  ArrowUpDown,
  BookmarkMinusIcon,
  BookmarkPlusIcon,
  CopyCheckIcon,
  CopyIcon,
  FolderIcon,
} from "lucide-react";
import { ComponentProps, ReactNode, useEffect } from "react";
import { Checkbox } from "./checkbox";
import { TableCellTooltip } from "./table-cell-tooltip";
import { useToast } from "./use-toast";

type BtnProps = ComponentProps<"button">;

export const selectAllFiles = (table: TableType<FileDirInfo>) => {
  const allFiles = getAllFileRows(table);

  return allFiles.forEach((row) => {
    const fileOrDirData = row.original;

    if (fileOrDirData.type === "file") {
      row.toggleSelected(true);
    }
  });
};

export const deselectAll = (table: TableType<FileDirInfo>) => {
  table.toggleAllRowsSelected(false);
};

export const getAllFileRows = (table: TableType<FileDirInfo>) => {
  // check the .type property of each row and return the length of those that are files
  return table.getRowModel().rows.filter((row) => {
    const fileOrDirData = row.original;

    return fileOrDirData.type === "file";
  });
};

const SortBtn = ({
  children,
  onClick,
}: {
  onClick?: BtnProps["onClick"];
  children?: ReactNode;
}) => {
  return (
    <Button onClick={onClick} variant="ghost" className="w-full">
      <div className="flex flex-row w-full">
        {children}
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </div>
    </Button>
  );
};

export const columns: ColumnDef<FileDirInfo>[] = [
  {
    id: "select",
    header: ({ table }) => {
      const allFileRows = getAllFileRows(table);
      const checkedRows = allFileRows.filter((row) => row.getIsSelected());

      const isChecked = allFileRows.length === checkedRows.length;

      return (
        <Checkbox
          checked={isChecked}
          onCheckedChange={() =>
            isChecked ? deselectAll(table) : selectAllFiles(table)
          }
          aria-label="Select all"
        />
      );
    },
    cell: ({ row }) => {
      const fileOrDirData = row.original;
      if (fileOrDirData.type === "directory") {
        return null;
      }

      return (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      );
    },
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <SortBtn
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Name
        </SortBtn>
      );
    },
  },
  {
    accessorKey: "extension",
    header: ({ column }) => {
      return (
        <SortBtn
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Extension
        </SortBtn>
      );
    },
    cell: ({ row }) => {
      return <div>{row.getValue("extension")}</div>;
    },
  },
  {
    accessorKey: "size",
    header: ({ column }) => {
      return (
        <SortBtn
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Size
        </SortBtn>
      );
    },
    cell: ({ row }) => {
      return <div>{row.getValue("size")}</div>;
    },
  },
  {
    id: "add-action",
    cell: ({ row }) => {
      const fileOrDirData = row.original;

      const {
        fileSubmitQueue: { addFileToQueue, filePathsToSubmit },
      } = useAppContext();

      const isInQueue = filePathsToSubmit.some((file) => {
        return file.fullPath === fileOrDirData.fullPath;
      });

      if (!isInQueue) {
        return null;
      }

      return (
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
      );
    },
  },
  {
    id: "bookmark-action",
    enableHiding: false,
    cell: ({ row }) => {
      const fileOrDirData = row.original;
      const { setClipboard, clipboardData } = useClipboard();
      const { toast } = useToast();
      const {
        bookmarks: { addBookmark, removeBookmark, bookmarks },
      } = useAppContext();

      const { fullPath } = fileOrDirData;

      const isBookmarked = bookmarks.some((bookmark) => {
        return bookmark.fullPath === fullPath;
      });

      const isCopiedPath = clipboardData === fullPath;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <DotsHorizontalIcon className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => {
                setClipboard(fileOrDirData.fullPath);
                toast({
                  title: "Copied Path",
                  description: fullPath,
                });
              }}
            >
              {isCopiedPath ? <CopyCheckIcon /> : <CopyIcon />} Copy Path
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                isBookmarked
                  ? removeBookmark(fileOrDirData)
                  : addBookmark(fileOrDirData);

                toast({
                  title: isBookmarked ? "Unbookmarked" : "Bookmark",
                  description: isBookmarked
                    ? `Unbookmarked ${fullPath}`
                    : `Bookmarked ${fullPath}`,
                });
              }}
            >
              {isBookmarked ? <BookmarkMinusIcon /> : <BookmarkPlusIcon />}
              Bookmark
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

export function FileFolderTable({ table }: { table: TableType<FileDirInfo> }) {
  const { setClipboard } = useClipboard();
  const { pathControl } = useAppContext();
  const { changeDir } = pathControl;

  useEffect(() => {
    table.setPageSize(1000000000000);
  }, []);

  const filterValue = table.getColumn("name")?.getFilterValue() as string;

  const setFilterVal = (table.getColumn("name") as any)?.setFilterValue;

  const allCols = table.getAllColumns().map((col) => {
    return (
      <DropdownMenuCheckboxItem
        key={col.id}
        className="capitalize"
        checked={col.getIsVisible()}
        onCheckedChange={(value) => col.toggleVisibility(!!value)}
      >
        {col.id}
      </DropdownMenuCheckboxItem>
    );
  });

  const headerGroups = table.getHeaderGroups().map((headerGroup) => (
    <TableRow key={headerGroup.id}>
      {headerGroup.headers.map((header) => {
        return (
          <TableHead key={header.id}>
            {header.isPlaceholder
              ? null
              : flexRender(header.column.columnDef.header, header.getContext())}
          </TableHead>
        );
      })}
    </TableRow>
  ));

  const mappedRows = table.getRowModel().rows.map((row) => {
    return (
      <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
        {row.getVisibleCells().map((cell) => {
          // TODO maybe add clipboard to context and then you can keep clipboard history as well
          const cellCtx = cell.getContext();
          cellCtx.column.id;

          const tooltipColumns = ["name"];

          const istTooltipColumn = tooltipColumns.includes(cellCtx.column.id);

          const { fullPath, name, type } = row.original;

          if (istTooltipColumn) {
            return (
              <TableCellTooltip
                className="font-medium justify-start text-left items-center"
                tooltipContent={fullPath}
                onTooltipContentClick={() => {
                  // copy path to clipboard
                  setClipboard(fullPath);
                }}
                toastOptions={{
                  description: fullPath,
                  title: "Copied Path",
                }}
              >
                <div
                  className="flex w-32 justify-start text-left"
                  onClick={() => changeDir(row.original)}
                >
                  {type === "directory" ? (
                    <Button>
                      <FolderIcon /> {name}
                    </Button>
                  ) : (
                    <>
                      <FileIcon /> <span>{name}</span>
                    </>
                  )}
                </div>
              </TableCellTooltip>
            );
          }

          return (
            <TableCell key={cell.id}>
              {flexRender(cell.column.columnDef.cell, cellCtx)}
            </TableCell>
          );
        })}
      </TableRow>
    );
  });

  return (
    <div className="w-full">
      <div className="flex items-center py-4">
        <Input
          placeholder="Filter directory...(non recursive)"
          value={filterValue}
          onChange={(e: any) => setFilterVal(e.target?.value)}
          className="max-w-sm"
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
              Columns <ChevronDownIcon className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">{allCols}</DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>{headerGroups}</TableHeader>
          <TableBody>
            {mappedRows.length ? (
              mappedRows
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
