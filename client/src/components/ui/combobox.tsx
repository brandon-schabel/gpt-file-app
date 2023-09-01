import { CaretSortIcon, CheckIcon } from "@radix-ui/react-icons";

import { useState } from "react";
import { cn } from "../../lib/utils";
import { Button } from "../ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "../ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";

export type ComboOption = {
  value: string;
  label: string;
};

export function Combobox({
  options,
  value: valueProp,
  open: openProp,
  onOpenChange: onOpenChangeProp,
  onValueChange: setValueProp,
}: {
  options: ComboOption[];
  value?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onValueChange?: (value: string) => void;
}) {
  const [openState, setOpenState] = useState(false);
  const [valueState, setValueState] = useState("");

  const value = valueProp ?? valueState;
  const open = openProp ?? openState;
  const onOpenChange = onOpenChangeProp ?? setOpenState;
  const setValue = setValueProp ?? setValueState;

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[200px] justify-between"
        >
          {value
            ? options.find((option) => option.value === value)?.label
            : "Select model..."}
          <CaretSortIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder="Search model..." className="h-9" />
          <CommandEmpty>No model found.</CommandEmpty>
          <CommandGroup>
            {options.map((option) => (
              <CommandItem
                key={option.value}
                onSelect={(currentValue) => {
                  setValue(currentValue === value ? "" : currentValue);
                  onOpenChange(false);
                }}
              >
                {option.label}
                <CheckIcon
                  className={cn(
                    "ml-auto h-4 w-4",
                    value === option.value ? "opacity-100" : "opacity-0"
                  )}
                />
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
