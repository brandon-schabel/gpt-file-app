import { FileDirInfo } from "@u-tools/core/modules/files-factory/files-folder";
import {
    Menubar,
    MenubarCheckboxItem,
    MenubarContent,
    MenubarItem,
    MenubarMenu,
    MenubarTrigger,
} from "./menubar";

export const NavBar = ({
  bookmarks,
  changeDir,
  editBookmarkToggle,
  setEditBookmarkToggle,
}: {
  bookmarks: FileDirInfo[];
  setEditBookmarkToggle: (value: boolean) => void;
  changeDir: (bookmark: FileDirInfo) => void;
  editBookmarkToggle: boolean;
}) => {
  return (
    <Menubar>
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
                onClick={() => changeDir(bookmark)}
              >
                {bookmark.name}
              </MenubarItem>
            );
          })}
        </MenubarContent>
      </MenubarMenu>
    </Menubar>
  );
};
