import { Outlet } from "@tanstack/react-router";
import "./App.css";
import { NavBar } from "./components/ui/app-navbar";

function App() {
  return (
    <>
      <div className="fixed flex top-0 left-0 100vw z-10">
        <NavBar
          editBookmarkToggle={false}
          setEditBookmarkToggle={() => false}
        />
      </div>
      <hr />
      <Outlet />
    </>
  );
}

export default App;
