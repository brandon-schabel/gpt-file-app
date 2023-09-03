import { ServerClientState } from "shared/shared-state";
import { useAppState } from "../../socket-context";

import { StringKeys } from "../../lib/type-utils";

import { SelectItemProps } from "@radix-ui/react-select";
import { ReactNode, forwardRef } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

export type SelectOption = {
  label: string | ReactNode;
  value: string;
  children?: ReactNode;
  className?: string;
  popoverContent?: ReactNode;
  selectItemProps?: SelectItemProps;
};

const SelectItemWithRef = forwardRef<HTMLDivElement, SelectOption>(
  ({ label, value, selectItemProps }, ref) => {
    return (
      <SelectItem
        ref={ref}
        value={value}
        className="flex items-center"
        {...selectItemProps}
      >
        {label}
      </SelectItem>
    );
  }
);

// TODO for selects, you can create an option config if it's a type that is a union string type
export const SyncSelect = ({
  stateKey,
  options,
}: {
  stateKey: StringKeys<ServerClientState>;
  options: SelectOption[];
}) => {
  const { control, state } = useAppState();

  const setterFunc = control[stateKey].set as (value: string) => void;

  return (
    <Select value={state[stateKey]} onValueChange={setterFunc}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Theme" />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => {
          return (
            <SelectItemWithRef
              key={option.value}
              value={option.value}
              className="flex items-center"
              label={option.label}
            />
          );
        })}
      </SelectContent>
    </Select>
  );
};
