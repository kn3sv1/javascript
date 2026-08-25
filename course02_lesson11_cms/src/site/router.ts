import type { NavItem, Page, Banner } from '../shared/types';
import { renderNav } from './nav';
import { renderBanners } from './banner';

export interface SiteElements {
  navEl: HTMLElement;
  bannersEl: HTMLElement;
  contentEl: HTMLElement;
}

export interface SiteData {
  navItems: NavItem[];
  pages: Page[];
  banners: Banner[];
}

function getCurrentPath(): string {
  const hash = window.location.hash.replace(/^#/, '');
  return hash || '/';
}

function renderPage(contentEl: HTMLElement, pages: Page[], path: string): void {
  const page = pages.find((p) => p.path === path);
  if (!page) {
    contentEl.innerHTML = '<h1>Page not found</h1><p>Try one of the links above.</p>';
    return;
  }
  contentEl.innerHTML = `<h1>${page.title}</h1>${page.content}`;
}

// objects arguments have TypeScript types
export function startRouter(elements: SiteElements, data: SiteData): void {
  function render(): void {
    const path = getCurrentPath();
    renderNav(elements.navEl, data.navItems, path);
    renderBanners(elements.bannersEl, data.banners, path);
    renderPage(elements.contentEl, data.pages, path);
  }

  window.addEventListener('hashchange', render);
  render();
}
