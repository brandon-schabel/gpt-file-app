import { ComponentProps, ReactNode, useState } from "react";
import { TableCell } from "./table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./tooltip";
import { useToast } from "./use-toast";

type BtnProps = ComponentProps<"button">;

export const TableCellTooltip = ({
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
