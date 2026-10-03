import { escapeHtml, clientLayout } from "./layout.js";

// One page created by the administrator.
export function pageView(page, menuPages) {
  const image = page.mainImage
    ? `<img class="main-image" src="/uploads/${escapeHtml(page.mainImage)}" alt="${escapeHtml(page.title)}">`
    : "";

  const description = page.description
    ? `<p class="page-description">${escapeHtml(page.description)}</p>`
    : "";

  // page.content is HTML from CKEditor, written by the admin,
  // so it is NOT escaped. Everything else is.
  const body = `
    <article class="page">
      <h1>${escapeHtml(page.title)}</h1>
      ${description}
      ${image}
      <div class="ck-content">${page.content}</div>
    </article>`;

  return clientLayout({
    title: page.title,
    description: page.description,
    menuPages,
    body,
  });
}

// Shown on "/" when there is no published page with the slug "home".
export function pageListView(pages, menuPages) {
  const items = pages
    .map(
      (page) => `
      <a class="card" href="/pages/${encodeURIComponent(page.slug)}">
        <img width="50" src="/uploads/${page.mainImage}" />
        ${escapeHtml(page.title)}
        <span class="card-description">${escapeHtml(page.description)}</span>
      </a>`,
    )
    .join("");

  const body = `
    <h1>Welcome</h1>
    ${items ? `<div class="card-links">${items}</div>` : "<p>No pages yet.</p>"}`;

  return clientLayout({ title: "Home", menuPages, body });
}

export function notFoundView(menuPages) {
  const body = `
    <h1>Page not found</h1>
    <p><a href="/">Go to the home page</a></p>`;

  return clientLayout({ title: "Page not found", menuPages, body });
}
