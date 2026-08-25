import type { Banner } from '../shared/types';

export function getMatchingBanners(banners: Banner[], currentPath: string): Banner[] {
  return banners.filter((banner) => {
    if (!banner.active) return false;
    try {
      return new RegExp(banner.pattern).test(currentPath);
    } catch {
      // An invalid regex pattern is skipped instead of breaking the page.
      return false;
    }
  });
}

export function renderBanners(bannersEl: HTMLElement, banners: Banner[], currentPath: string): void {
  const matching = getMatchingBanners(banners, currentPath);

  bannersEl.innerHTML = matching
    .map((banner) => `<div class="banner ${banner.type}">${banner.message}</div>`)
    .join('');
}
