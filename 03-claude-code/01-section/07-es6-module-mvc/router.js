import { routes } from "./routes.js";
import { serveStatic } from "./controllers/static.js"; 

function findRoute(method, pathname) {
  return routes.find((route) => {
    if (route.method !== method) return false;

    const routeParts = route.path.split("/");
    const pathParts = pathname.split("/");

    console.log("routeParts:", routeParts, "pathParts:", pathParts);

    if (routeParts.length !== pathParts.length) {
      return false;
    }

    return routeParts.every(
      (part, i) => part.startsWith(":") || part === pathParts[i],
    );
  });
}

function findRouteSimple(method, pathname) {
  return routes.find((route) => {
    if (route.method !== method) return false;

    if (route.path === pathname) {
      return true;
    }
    return false;
  });
}

export function handleRequest(req, res) {
  // we want to parse the URL to extract the path name.
  const url = new URL(req.url, `http://${req.headers.host}`);
    // 1. Try static files from /public first
  if (serveStatic(req, res, url.pathname)) return; 

  // 2. Then dynamic routes
  const route = findRoute(req.method, url.pathname);
  // if we didn't find router from our config that matches URL in browser
  if (!route) {
    res.statusCode = 404;
    return res.end("Not Found");
  }

  // here we are sure that it exists.
  route.handler(req, res);
}
