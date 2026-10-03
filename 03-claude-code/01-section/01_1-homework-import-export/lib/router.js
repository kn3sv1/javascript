// A very small router.
//
// Usage:
//   addRoute("GET", "/calculate", handler);
//   const found = findRoute("GET", "/calculate");
//   // found.handler

// This array is private to this module: it is NOT exported,
// so other files can only use it through addRoute/findRoute.
const routes = [];

export function addRoute(method, path, handler) {
  routes.push({ method, path, handler });
}

export function findRoute(method, pathname) {
  return routes.find((route) => route.method === method && route.path === pathname) || null;
}
