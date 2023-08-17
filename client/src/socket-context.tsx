import { FileDirInfo } from "@u-tools/core/modules/files-factory/files-folder";
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

  const navigateTo = (fileOrDir: FileDirInfo) => {
    const { paths, currentIndex } = state.navigation;

    // Trim any forward paths and append the new path
    const newPaths = paths.slice(0, currentIndex + 1).concat(fileOrDir);

    control.navigation.set({
      paths: newPaths,
      currentIndex: newPaths.length - 1, // Set current index to the last item
    });
  };

  const goBack = () => {
    const { currentIndex } = state.navigation;

    if (currentIndex > 0) {
      control.navigation.set({
        ...state.navigation,
        currentIndex: currentIndex - 1, // Move back by one position
      });
    }
  };

  const goForward = () => {
    const { paths, currentIndex } = state.navigation;

    if (currentIndex < paths.length - 1) {
      control.navigation.set({
        ...state.navigation,
        currentIndex: currentIndex + 1, // Move forward by one position
      });
    }
  };

  return {
    control,
    state,
    goBack,
    navigateTo,
    goForward,
  };
};

export const SocketAppContext = createContext<{
  control: Dispatchers<ServerClientState>;
  state: ServerClientState;
  goBack: () => void;
  navigateTo: (fileOrDir: FileDirInfo) => void;
  goForward: () => void;
}>({
  state: defaultState,
  control: {} as Dispatchers<ServerClientState>,
  goBack: () => {},
  navigateTo: (fileOrDir: FileDirInfo) => {},
  goForward: () => {},
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
