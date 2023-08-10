"use client";

import {
  ChevronDownIcon,
  DotsHorizontalIcon,
  FileIcon,
} from "@radix-ui/react-icons";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
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
import {
  ComponentProps,
  ReactNode,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { TableCellTooltip } from "./table-cell-tooltip";
import { useToast } from "./use-toast";

type BtnProps = ComponentProps<"button">;

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
  // implement row selection with checkboxes
  //   {
  //     id: "select",
  //     header: ({ table }) => (
  //       <Checkbox
  //         checked={table.getIsAllPageRowsSelected()}
  //         onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
  //         aria-label="Select all"
  //       />
  //     ),
  //     cell: ({ row }) => (
  //       <Checkbox
  //         checked={row.getIsSelected()}
  //         onCheckedChange={(value) => row.toggleSelected(!!value)}
  //         aria-label="Select row"
  //       />
  //     ),
  //     enableSorting: false,
  //     enableHiding: false,
  //   },
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
    // cell: ({ row }) => (
    //   <div className="capitalize">{row.getValue("name")}</div>
    // ),
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
const changeCounts: Record<string, number> = {};

const useWatchValueChangeCount = (key: string, value: any) => {
  useEffect(() => {
    changeCounts[key] = changeCounts[key] + 1;
    if (changeCounts[key] % 100 === 0) {
      console.warn("Excessive Value Changes: ", key, value);
    }
  }, [value]);
};

const useComponentRenderCount = (logAtInterval: number = 100) => {
  const count = useRef(0);

  count.current += 1;

  if (count.current % logAtInterval === 0) {
    console.warn("Excessive Rendering", count.current);
  }
};

export function FileFolderTable({
  directoryData,
}: {
  directoryData: FileDirInfo[] | null;
}) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const { setClipboard } = useClipboard();
  const { pathControl } = useAppContext();
  const { changeDir } = pathControl;

  useWatchValueChangeCount("changeDir", changeDir);
  useWatchValueChangeCount("directoryData", directoryData);
  useComponentRenderCount(1000);
  useWatchValueChangeCount("sorting", sorting);
  useWatchValueChangeCount("columnFilters", columnFilters);
  useWatchValueChangeCount("columnVisibility", columnVisibility);
  useWatchValueChangeCount("rowSelection", rowSelection);

  const table = useReactTable({
    data: directoryData || [],
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  useEffect(() => {
    table.setPageSize(1000000000000);
  }, []);

  const filterValue = table.getColumn("name")?.getFilterValue() as string;

  const setFilterVal = (table.getColumn("name") as any)?.setFilterValue;

  const allCols = useMemo(
    () =>
      table.getAllColumns().map((col) => {
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
      }),
    [table, directoryData, sorting]
  );

  const headerGroups = useMemo(() => {
    return table.getHeaderGroups().map((headerGroup) => (
      <TableRow key={headerGroup.id}>
        {headerGroup.headers.map((header) => {
          return (
            <TableHead key={header.id}>
              {header.isPlaceholder
                ? null
                : flexRender(
                    header.column.columnDef.header,
                    header.getContext()
                  )}
            </TableHead>
          );
        })}
      </TableRow>
    ));
  }, [table, directoryData, sorting]);

  const mappedRows = useMemo(() => {
    const rows = table.getRowModel().rows;

    return rows.map((row) => {
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
  }, [table, directoryData, sorting]);

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
