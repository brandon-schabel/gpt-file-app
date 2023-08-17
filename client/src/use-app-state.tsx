import { useServerState } from "@u-tools/react/use-server-state";
import { ServerClientState, defaultState } from "../../shared/shared-state";

export const useAppState = () => {
  // TODO need to ensure only one websocket connection is made
  const { control, state } = useServerState<ServerClientState>({
    defaultState,
    url: "ws://localhost:8080/state",
  });

  return {
    control: control,
    state,
  };
};
