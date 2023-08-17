import { Dispatchers } from "@u-tools/core/modules/server-factory/create-web-socket-state-machine";
import { useServerState } from "@u-tools/react/use-server-state";
import { ReactNode, createContext, useContext } from "react";
import { ServerClientState, defaultState } from "../../shared/shared-state";

export const useWebsocketState = () => {
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

export const SocketAppContext = createContext<{
  control: Dispatchers<ServerClientState>;
  state: ServerClientState;
}>({
  state: defaultState,
  control: {} as Dispatchers<ServerClientState>,
});

export const SocketContextProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const appState = useWebsocketState();
  return (
    <SocketAppContext.Provider value={appState}>
      {children}
    </SocketAppContext.Provider>
  );
};

export const useAppState = () => {
  return useContext(SocketAppContext);
};
