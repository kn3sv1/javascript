import type { NavItem } from '../shared/types';

export function renderNav(navEl: HTMLElement, items: NavItem[], currentPath: string): void {
  const sorted = [...items].sort((a, b) => a.order - b.order);

  navEl.innerHTML = sorted
    .map((item) => {
      const activeClass = item.path === currentPath ? ' class="active"' : '';
      return `<a href="#${item.path}"${activeClass}>${item.label}</a>`;
    })
    .join('');
}
