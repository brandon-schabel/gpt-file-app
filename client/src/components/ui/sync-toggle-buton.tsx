import { useAppState } from "@/socket-context";
import { VariantProps } from "class-variance-authority";
import { Button, buttonVariants } from "./button"; // Update the path accordingly
import { BooleanKeys } from "./type-utils";
import { ServerClientState } from "../../../../shared/shared-state";

interface SyncToggleButtonProps {
  stateKey: BooleanKeys<ServerClientState>;
  toggleButtonVariant?: VariantProps<typeof buttonVariants>;
}

export const SyncToggleButton = ({
  stateKey,
  toggleButtonVariant = { variant: "default", size: "default" }, // Default values
}: SyncToggleButtonProps) => {
  const { control, state } = useAppState();

  const setterFunc = control[stateKey].set as (value: boolean) => void;

  const handleClick = () => {
    setterFunc(!state[stateKey]);
  };

  return (
    <Button onClick={handleClick} {...toggleButtonVariant}>
      {state[stateKey] ? "ON" : "OFF"}
    </Button>
  );
};
