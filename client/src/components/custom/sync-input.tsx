import { ServerClientState } from "shared/shared-state";
import { useAppState } from "../../socket-context";

import { Input, InputProps } from "../ui/input";

export type InputSync = {
  state?: string;
  setState?: (value: string) => void;
  onStateUpdate?: (state: string) => void;
  setter?: ((value: string) => void) | undefined;
  initVal?: string;
};

type QuickInputProps = InputProps & InputSync;

export const QInput = ({
  state,
  setState,
  onStateUpdate,
  setter,
  initVal,
  defaultValue,
  ...rest
}: QuickInputProps) => {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newVal = (event?.target?.value || "") as string;

    if (setter) {
      setter(newVal);
    }

    if (setState) {
      setState(newVal);

      if (onStateUpdate) {
        onStateUpdate(newVal);
      }
    }
  };
  //  since the event is forwarded after the set state handler,
  // we dont' want to override it with the ...rest
  return (
    <Input
      value={state}
      {...rest}
      defaultValue={initVal ?? defaultValue}
      onChange={handleChange}
    />
  );
};

type StringKeys<T> = {
  [K in keyof T]: T[K] extends string ? K : never;
}[keyof T];

// TODO for selects, you can create an option config if it's a type that is a union string type
export const SyncInput = ({
  stateKey,
}: {
  stateKey: StringKeys<ServerClientState>;
}) => {
  const { control, state } = useAppState();

  const setterFunc = control[stateKey].set as (value: string) => void;

  return <QInput setter={setterFunc} state={state[stateKey]} />;
};
