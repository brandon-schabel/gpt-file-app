import { Switch } from "@radix-ui/react-switch";
import { BooleanKeys } from "app-types";
import { ServerClientState } from "shared/shared-state";
import { useAppState } from "../../socket-context";

interface SyncSwitchProps {
  stateKey: BooleanKeys<ServerClientState>;
}

export const SyncSwitch = ({ stateKey }: SyncSwitchProps) => {
  const { control, state } = useAppState();

  const setterFunc = control[stateKey].set as (value: boolean) => void;

  const handleChange = () => {
    setterFunc(!state[stateKey]);
  };

  return <Switch checked={state[stateKey]} onCheckedChange={handleChange} />;
};
