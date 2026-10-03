// A very small router.
//
// Usage:
//   addRoute("GET", "/pages/:slug", handler);
//   const found = findRoute("GET", "/pages/about-us");
//   // found.handler, found.params -> { slug: "about-us" }

const routes = [];

export function addRoute(method, path, handler) {
  routes.push({ method, parts: splitPath(path), handler });
}

// "/admin/pages/edit/123" -> ["admin", "pages", "edit", "123"]
function splitPath(path) {
  return path.split("/").filter((part) => part !== "");
}

export function findRoute(method, pathname) {
  const urlParts = splitPath(pathname);

  for (const route of routes) {
    if (route.method !== method || route.parts.length !== urlParts.length) {
      continue;
    }

    const params = {};
    let isMatch = true;

    for (let i = 0; i < route.parts.length; i++) {
      const routePart = route.parts[i];
      const urlPart = urlParts[i];

      if (routePart.startsWith(":")) {
        // ":slug" matches anything and is saved as params.slug
        params[routePart.slice(1)] = decodeURIComponent(urlPart);
      } else if (routePart !== urlPart) {
        isMatch = false;
        break;
      }
    }

    if (isMatch) {
      return { handler: route.handler, params };
    }
  }

  return null;
}
