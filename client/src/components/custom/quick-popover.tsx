import { PopoverContentProps } from "@radix-ui/react-popover";
import { ReactNode } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";

export const QuickPopover = ({
  children,
  content,
  className,
  contentProps,
}: {
  children: ReactNode;
  content: ReactNode;
  className?: string;
  contentProps?: PopoverContentProps;
}) => {
  return (
    <Popover>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent className={className} {...contentProps}>
        {content}
      </PopoverContent>
    </Popover>
  );
};
