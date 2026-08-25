import { describe, it, expect, vi, beforeEach } from 'vitest';
import { initBannersView } from '../../src/admin/views/banners-view';
import * as api from '../../src/shared/api/banners';
import type { Banner } from '../../src/shared/types';

vi.mock('../../src/shared/api/banners');

const banners: Banner[] = [{ id: 1, message: 'Welcome!', pattern: '^/$', type: 'promo', active: true }];

function setupDom(): HTMLElement {
  document.body.innerHTML = '<div id="app"></div>';
  return document.querySelector<HTMLElement>('#app')!;
}

function submitForm(root: HTMLElement): void {
  root
    .querySelector<HTMLFormElement>('#banner-form')!
    .dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
}

beforeEach(() => {
  vi.mocked(api.getBanners).mockResolvedValue(banners);
});

describe('initBannersView - regex validation', () => {
  it('blocks submit and shows an error when the pattern is invalid', async () => {
    const root = setupDom();
    initBannersView(root);
    await vi.waitFor(() => expect(root.querySelectorAll('#banner-list tr')).toHaveLength(1));

    root.querySelector<HTMLInputElement>('#message')!.value = 'Broken';
    root.querySelector<HTMLInputElement>('#pattern')!.value = '(unclosed';

    submitForm(root);

    expect(root.querySelector<HTMLDivElement>('#pattern-error')!.hidden).toBe(false);
    expect(api.createBanner).not.toHaveBeenCalled();
  });

  it('creates the banner when the pattern is valid', async () => {
    vi.mocked(api.createBanner).mockResolvedValue({
      id: 2,
      message: 'Contact notice',
      pattern: '^/contact',
      type: 'info',
      active: true,
    });
    const root = setupDom();
    initBannersView(root);
    await vi.waitFor(() => expect(root.querySelectorAll('#banner-list tr')).toHaveLength(1));

    root.querySelector<HTMLInputElement>('#message')!.value = 'Contact notice';
    root.querySelector<HTMLInputElement>('#pattern')!.value = '^/contact';

    submitForm(root);

    await vi.waitFor(() => {
      expect(api.createBanner).toHaveBeenCalledWith({
        message: 'Contact notice',
        pattern: '^/contact',
        type: 'info',
        active: true,
      });
    });
  });
});

describe('initBannersView - preview path', () => {
  it('shows which banners match a typed path', async () => {
    const root = setupDom();
    initBannersView(root);
    await vi.waitFor(() => expect(root.querySelectorAll('#banner-list tr')).toHaveLength(1));

    const previewInput = root.querySelector<HTMLInputElement>('#preview-path')!;
    previewInput.value = '/';
    previewInput.dispatchEvent(new Event('input', { bubbles: true }));

    expect(root.querySelector('#preview-result')!.textContent).toContain('Welcome!');
  });

  it('reports no matches for a path nothing matches', async () => {
    const root = setupDom();
    initBannersView(root);
    await vi.waitFor(() => expect(root.querySelectorAll('#banner-list tr')).toHaveLength(1));

    const previewInput = root.querySelector<HTMLInputElement>('#preview-path')!;
    previewInput.value = '/contact';
    previewInput.dispatchEvent(new Event('input', { bubbles: true }));

    expect(root.querySelector('#preview-result')!.textContent).toContain('No banners match');
  });
});
