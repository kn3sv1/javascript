import { addRoute } from "../router.js";
import { getPages, getPageBySlug } from "../database.js";
import { sendHtml } from "../response.js";
import { pageView, pageListView, notFoundView } from "../views/client.js";

// Pages that visitors are allowed to see in the menu.
async function getMenuPages() {
  const pages = await getPages();
  return pages.filter((page) => page.published && page.showInMenu && page.slug !== "home");
}

export async function sendClientNotFound(res) {
  sendHtml(res, 404, notFoundView(await getMenuPages()));
}

// GET /  -> the page with slug "home", or a list of all published pages
addRoute("GET", "/", async (req, res) => {
  const menuPages = await getMenuPages();
  const homePage = await getPageBySlug("home");

  if (homePage && homePage.published) {
    sendHtml(res, 200, pageView(homePage, menuPages));
    return;
  }

  const pages = await getPages();
  const publishedPages = pages.filter((page) => page.published);
  sendHtml(res, 200, pageListView(publishedPages, menuPages));
});

// GET /pages/about-us
addRoute("GET", "/pages/:slug", async (req, res, params) => {
  const page = await getPageBySlug(params.slug);

  // Drafts are not visible to visitors.
  if (!page || !page.published) {
    await sendClientNotFound(res);
    return;
  }

  sendHtml(res, 200, pageView(page, await getMenuPages()));
});
