// import {
//   Link,
//   Outlet,
//   RootRoute,
//   Route,
//   Router,
//   RouterProvider,
// } from "@tanstack/router";
import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { Toaster } from "./components/ui/toaster";

// const Header = () => {
//   return (
//     <div>
//       <Link to="/">Home</Link> <Link to="/about">About</Link>
//     </div>
//   );
// };

// // Create a root route
// const rootRoute = new RootRoute({
//   component: Root,
// });

// function Root() {
//   return (
//     <>
//       <Header />
//       <hr />
//       <Outlet />
//     </>
//   );
// }

// Create an index route
// const indexRoute = new Route({
//   getParentRoute: () => rootRoute,
//   path: "/",
//   component: Index,
// });

function Index() {
  return (
    <div>
      <App />
    </div>
  );
}

// const aboutRoute = new Route({
//   getParentRoute: () => rootRoute,
//   path: "/about",
//   component: About,
// });

// function About() {
//   return <div>Hello from About!</div>;
// }

// Create the route tree using your routes
// const routeTree = rootRoute.addChildren([indexRoute, aboutRoute]);

// Create the router using your route tree
// const router = new Router({ routeTree });

// Register your router for maximum type safety
// declare module '@tanstack/router' {
//   interface Register {
//     router: typeof router
//   }
// }

// Render our app!
const rootElement = document.getElementById("root")!;
if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <StrictMode>
      <Toaster />
        <App />
      {/* <div>Test</div> */}
    </StrictMode>
  );
}
