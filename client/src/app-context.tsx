import { ReactNode, createContext, useContext } from "react";
import {
  useBookmarks,
  useFileSubmitQueue,
  usePathControl,
  useServer,
} from "./hooks";

type AppContextType = {
  bookmarks: ReturnType<typeof useBookmarks>;
  pathControl: ReturnType<typeof usePathControl>;
  server: ReturnType<typeof useServer>;
  fileSubmitQueue: ReturnType<typeof useFileSubmitQueue>;
};

export const AppContext = createContext<AppContextType>({
  bookmarks: {} as ReturnType<typeof useBookmarks>,
  pathControl: {} as ReturnType<typeof usePathControl>,
  server: {} as ReturnType<typeof useServer>,
  fileSubmitQueue: {} as ReturnType<typeof useFileSubmitQueue>,
});

export const AppContextProvider = ({ children }: { children: ReactNode }) => {
  const bookmarksContextValue = useBookmarks();
  const pathControlContextValue = usePathControl();
  const serverContextValue = useServer();
  const fileSubmitQueueContextValue = useFileSubmitQueue();

  const combinedContextValue = {
    bookmarks: bookmarksContextValue,
    pathControl: pathControlContextValue,
    server: serverContextValue,
    fileSubmitQueue: fileSubmitQueueContextValue,
  };

  return (
    <AppContext.Provider value={combinedContextValue}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  return useContext(AppContext);
};
