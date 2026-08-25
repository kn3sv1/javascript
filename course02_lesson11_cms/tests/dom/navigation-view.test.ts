import { describe, it, expect, vi, beforeEach } from 'vitest';
import { initNavigationView } from '../../src/admin/views/navigation-view';
import * as api from '../../src/shared/api/navigation';
import type { NavItem } from '../../src/shared/types';

vi.mock('../../src/shared/api/navigation');

const navItems: NavItem[] = [
  { id: 1, label: 'Home', path: '/', order: 1 },
  { id: 2, label: 'About', path: '/about', order: 2 },
];

function setupDom(): HTMLElement {
  document.body.innerHTML = '<div id="app"></div>';
  return document.querySelector<HTMLElement>('#app')!;
}

function submitForm(root: HTMLElement): void {
  root
    .querySelector<HTMLFormElement>('#nav-form')!
    .dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
}

beforeEach(() => {
  vi.mocked(api.getNavItems).mockResolvedValue(navItems);
});

describe('initNavigationView - initial render', () => {
  it('renders the form and table markup', () => {
    const root = setupDom();
    initNavigationView(root);

    expect(root.querySelector('h1')?.textContent).toBe('Navigation');
    expect(root.querySelector('#nav-form')).not.toBeNull();
  });

  it('loads and renders nav items sorted by order', async () => {
    const root = setupDom();
    initNavigationView(root);

    await vi.waitFor(() => {
      expect(root.querySelectorAll('#nav-list tr')).toHaveLength(2);
    });

    const rows = root.querySelectorAll('#nav-list tr');
    expect(rows[0].textContent).toContain('Home');
    expect(rows[1].textContent).toContain('About');
  });
});

describe('initNavigationView - creating a nav item', () => {
  it('submits the form and calls createNavItem with trimmed values', async () => {
    vi.mocked(api.createNavItem).mockResolvedValue({ id: 3, label: 'Contact', path: '/contact', order: 3 });
    const root = setupDom();
    initNavigationView(root);
    await vi.waitFor(() => expect(root.querySelectorAll('#nav-list tr')).toHaveLength(2));

    root.querySelector<HTMLInputElement>('#label')!.value = 'Contact';
    root.querySelector<HTMLInputElement>('#path')!.value = '/contact';
    root.querySelector<HTMLInputElement>('#order')!.value = '3';

    submitForm(root);

    await vi.waitFor(() => {
      expect(api.createNavItem).toHaveBeenCalledWith({ label: 'Contact', path: '/contact', order: 3 });
    });
  });
});

describe('initNavigationView - editing a nav item', () => {
  it('populates the form and switches to update mode when Edit is clicked', async () => {
    const root = setupDom();
    initNavigationView(root);
    await vi.waitFor(() => expect(root.querySelectorAll('#nav-list tr')).toHaveLength(2));

    root.querySelector<HTMLButtonElement>('.edit-btn')!.click();

    expect(root.querySelector<HTMLInputElement>('#label')!.value).toBe('Home');
    expect(root.querySelector<HTMLButtonElement>('#submit-btn')!.textContent).toBe('Save nav item');
  });
});

describe('initNavigationView - deleting a nav item', () => {
  it('calls deleteNavItem with the row id and reloads the list', async () => {
    vi.mocked(api.deleteNavItem).mockResolvedValue(undefined);
    const root = setupDom();
    initNavigationView(root);
    await vi.waitFor(() => expect(root.querySelectorAll('#nav-list tr')).toHaveLength(2));

    root.querySelector<HTMLButtonElement>('.delete-btn')!.click();

    await vi.waitFor(() => {
      expect(api.deleteNavItem).toHaveBeenCalledWith(1);
    });
  });
});
