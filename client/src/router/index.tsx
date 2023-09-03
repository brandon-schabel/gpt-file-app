import {  RootRoute, Route, Router } from "@tanstack/react-router";
import { Home } from "./home";
import { Trainer } from "./trainer";
import App from "../App";

// Create a root route
const rootRoute = new RootRoute({
  component: App,
});

// Create an index route
const indexRoute = new Route({
  getParentRoute: () => rootRoute,
  path: "/",
  component: Home,
});

const trainerRoute = new Route({
  getParentRoute: () => rootRoute,
  path: "/trainer",
  component: Trainer,
});

// Create the route tree using your routes
const routeTree = rootRoute.addChildren([indexRoute, trainerRoute]);

// Create the router using your route tree
export const router = new Router({ routeTree });

// Register your router for maximum type safety
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

