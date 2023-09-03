import { Link } from "@tanstack/react-router";
import { useAppState } from "../../socket-context";
import {
  Menubar,
  MenubarCheckboxItem,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarTrigger,
} from "./menubar";

export const NavBar = ({
  editBookmarkToggle,
  setEditBookmarkToggle,
}: {
  setEditBookmarkToggle: (value: boolean) => void;
  editBookmarkToggle: boolean;
}) => {
  const { state, navigateTo } = useAppState();
  const { bookmarks } = state;

  return (
    <Menubar className="w-screen">
      <MenubarMenu>
        <MenubarTrigger>File</MenubarTrigger>
        <MenubarContent>
          <MenubarItem>
            <MenubarCheckboxItem
              onCheckedChange={setEditBookmarkToggle}
              checked={editBookmarkToggle}
            >
              Edit Bookmarks
            </MenubarCheckboxItem>
          </MenubarItem>
        </MenubarContent>
      </MenubarMenu>
      <MenubarMenu>
        <MenubarTrigger>Bookmarks</MenubarTrigger>
        <MenubarContent>
          {bookmarks.map((bookmark) => {
            return (
              <MenubarItem
                key={bookmark.fullPath}
                onClick={() => navigateTo(bookmark)}
              >
                {bookmark.name}
              </MenubarItem>
            );
          })}
        </MenubarContent>
      </MenubarMenu>

      <MenubarMenu>
        <MenubarTrigger>Nav</MenubarTrigger>

        <MenubarContent>
          <MenubarItem asChild>
            <Link to="/">Home</Link>
          </MenubarItem>
          <MenubarItem asChild>
            <Link to="/trainer">Trainer</Link>
          </MenubarItem>
        </MenubarContent>
      </MenubarMenu>
    </Menubar>
  );
};
