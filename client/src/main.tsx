import { RouterProvider } from "@tanstack/react-router";
import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import { Toaster } from "./components/ui/toaster";
import "./index.css";
import { router } from "./router";
import { SocketContextProvider } from "./socket-context";

const rootElement = document.getElementById("root")!;
if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <StrictMode>
      <SocketContextProvider>
        <Toaster />
        <RouterProvider router={router} />
      </SocketContextProvider>
    </StrictMode>
  );
}
