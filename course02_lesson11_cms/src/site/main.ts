import './style.css';
import { getNavItems } from '../shared/api/navigation';
import { getPages } from '../shared/api/pages';
import { getBanners } from '../shared/api/banners';
import { startRouter } from './router';

export async function initSite(root: HTMLElement): Promise<void> {
  root.innerHTML = `
    <header>
      <nav id="nav"></nav>
    </header>
    <div id="banners"></div>
    <main id="content"></main>
  `;

  const navEl = root.querySelector<HTMLElement>('#nav')!;
  const bannersEl = root.querySelector<HTMLElement>('#banners')!;
  const contentEl = root.querySelector<HTMLElement>('#content')!;

  try {
    const [navItems, pages, banners] = await Promise.all([getNavItems(), getPages(), getBanners()]);
    // we call funtion and pass two objects: one Html element selectors where we append Html
    // and object with data for these Html elements.
    startRouter({ navEl, bannersEl, contentEl }, { navItems, pages, banners });
  } catch (err) {
    contentEl.innerHTML = `<p>Failed to load site data: ${err instanceof Error ? err.message : 'unknown error'}</p>`;
  }
}

const appRoot = document.querySelector<HTMLDivElement>('#app');
if (appRoot) {
  // everything starts from this function. This function inside calls other
  // functions.
  initSite(appRoot);
}
