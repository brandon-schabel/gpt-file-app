import { useAppState } from "../../socket-context";
import { Button } from "../ui/button";

export const BookmarkManager = () => {
  const { state, control, navigateTo } = useAppState();
  const { bookmarks, directoryData } = state;

  return (
    <div className="flex flex-row gap-x-2 w-full justify-center">
      {bookmarks?.map((bookmark) => {
        return (
          <div
            className="flex flex-col max-w-[100px] gap-y-2"
            key={bookmark.fullPath}
          >
            <Button
              key={bookmark.fullPath}
              onClick={() => {
                navigateTo(bookmark);
              }}
            >
              {bookmark.name}
            </Button>
            <Button onClick={() => {}}>Remove</Button>
          </div>
        );
      })}
    </div>
  );
};
