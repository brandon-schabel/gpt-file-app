import { ServerClientState } from "shared/shared-state";
import { Checkbox } from "ui/checkbox";
import { BooleanKeys } from "../../lib/type-utils";
import { useAppState } from "../../socket-context";

interface SyncCheckboxProps {
  stateKey: BooleanKeys<ServerClientState>;
}

export const SyncCheckbox = ({ stateKey }: SyncCheckboxProps) => {
  const { control, state } = useAppState();

  const setterFunc = control[stateKey].set as (value: boolean) => void;

  const handleChange = () => {
    setterFunc(!state[stateKey]);
  };

  return <Checkbox onCheckedChange={handleChange} checked={state[stateKey]} />;
};
