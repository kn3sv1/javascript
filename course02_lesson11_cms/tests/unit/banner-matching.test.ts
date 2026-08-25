import { describe, it, expect } from 'vitest';
import { getMatchingBanners } from '../../src/site/banner';
import type { Banner } from '../../src/shared/types';

const banners: Banner[] = [
  { id: 1, message: 'Home promo', pattern: '^/$', type: 'promo', active: true },
  { id: 2, message: 'About notice', pattern: '^/about', type: 'info', active: true },
  { id: 3, message: 'Inactive banner', pattern: '^/', type: 'warning', active: false },
  { id: 4, message: 'Broken pattern', pattern: '(unclosed', type: 'info', active: true },
];

describe('getMatchingBanners', () => {
  it('returns banners whose pattern matches the current path', () => {
    expect(getMatchingBanners(banners, '/')).toEqual([banners[0]]);
    expect(getMatchingBanners(banners, '/about')).toEqual([banners[1]]);
  });

  it('excludes inactive banners even if their pattern matches', () => {
    expect(getMatchingBanners(banners, '/contact')).not.toContainEqual(banners[2]);
  });

  it('skips banners with an invalid regex pattern instead of throwing', () => {
    expect(() => getMatchingBanners(banners, '/about')).not.toThrow();
    expect(getMatchingBanners(banners, '/about')).not.toContainEqual(banners[3]);
  });

  it('returns an empty array when nothing matches', () => {
    expect(getMatchingBanners(banners, '/contact')).toEqual([]);
  });
});
