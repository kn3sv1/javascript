import './style.css';
import { initNavigationView } from './views/navigation-view';
import { initPagesView } from './views/pages-view';
import { initBannersView } from './views/banners-view';
import { initPhotosView } from './views/photos-view';

type TabId = 'navigation' | 'pages' | 'banners' | 'photos';

const tabs: { id: TabId; label: string; init: (el: HTMLElement) => void }[] = [
  { id: 'navigation', label: 'Navigation', init: initNavigationView },
  { id: 'pages', label: 'Pages', init: initPagesView },
  { id: 'banners', label: 'Banners', init: initBannersView },
  { id: 'photos', label: 'Photos', init: initPhotosView },
];

export function initAdminApp(root: HTMLElement): void {
  root.innerHTML = `
    <div class="tabs" id="tabs"></div>
    <div id="tab-content"></div>
  `;

  const tabsEl = root.querySelector<HTMLDivElement>('#tabs')!;
  const contentEl = root.querySelector<HTMLDivElement>('#tab-content')!;

  tabsEl.innerHTML = tabs
    .map((tab) => `<button type="button" data-tab="${tab.id}">${tab.label}</button>`)
    .join('');

  function showTab(tabId: TabId): void {
    const tab = tabs.find((t) => t.id === tabId);
    if (!tab) return;

    tabsEl.querySelectorAll<HTMLButtonElement>('button').forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.tab === tabId);
    });

    tab.init(contentEl);
  }

  tabsEl.addEventListener('click', (event) => {
    const target = event.target as HTMLElement;
    const tabId = target.dataset.tab as TabId | undefined;
    if (tabId) showTab(tabId);
  });

  showTab('navigation');
}

const appRoot = document.querySelector<HTMLDivElement>('#app');
if (appRoot) {
  initAdminApp(appRoot);
}
