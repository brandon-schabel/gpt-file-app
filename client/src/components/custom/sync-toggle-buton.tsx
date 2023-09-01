import { BooleanKeys } from "app-types";
import { VariantProps } from "class-variance-authority";
import { ServerClientState } from "shared/shared-state";
import { useAppState } from "../../socket-context";
import { Button, buttonVariants } from "../ui/button";

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
