import { VariantProps } from "class-variance-authority";
import { ServerClientState } from "shared/shared-state";
import { BooleanKeys } from "../../lib/type-utils";
import { useAppState } from "../../socket-context";
import { Button, buttonVariants } from "../ui/button"; // Update the path accordingly
import { Checkbox } from "../ui/checkbox"; // Update the path accordingly
import { Switch } from "../ui/switch"; // Update the path accordingly

interface SyncBooleanProps {
  stateKey: BooleanKeys<ServerClientState>;
  type?: "switch" | "checkbox" | "toggle-button";
  toggleButtonVariant?: VariantProps<typeof buttonVariants>; // If you want to control toggle button's variant
}

export const SyncBoolean = ({
  stateKey,
  type = "switch",
  toggleButtonVariant = { variant: "default", size: "default" }, // Default values
}: SyncBooleanProps) => {
  const { control, state } = useAppState();

  const setterFunc = control[stateKey].set as (value: boolean) => void;

  const handleChange = () => {
    setterFunc(!state[stateKey]);
  };

  switch (type) {
    case "checkbox":
      return (
        <Checkbox onCheckedChange={handleChange} checked={state[stateKey]} />
      );

    case "toggle-button":
      return (
        <Button onClick={handleChange} {...toggleButtonVariant}>
          {state[stateKey] ? "ON" : "OFF"}
        </Button>
      );

    case "switch":
    default:
      return (
        <Switch checked={state[stateKey]} onCheckedChange={handleChange} />
      );
  }
};
