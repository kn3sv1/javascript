import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getBanners, createBanner, updateBanner, deleteBanner } from '../../src/shared/api/banners';
import type { Banner } from '../../src/shared/types';

const sampleBanner: Banner = {
  id: 1,
  message: 'Welcome!',
  pattern: '^/$',
  type: 'promo',
  active: true,
};

function mockFetchOnce(body: unknown, init: Partial<Response> = {}): void {
  const response = {
    ok: init.ok ?? true,
    status: init.status ?? 200,
    statusText: init.statusText ?? 'OK',
    json: () => Promise.resolve(body),
  } as Response;

  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(response));
}

beforeEach(() => {
  vi.unstubAllGlobals();
});

describe('getBanners', () => {
  it('fetches the banners list from /api/banners', async () => {
    mockFetchOnce([sampleBanner]);

    const banners = await getBanners();

    expect(fetch).toHaveBeenCalledWith('/api/banners');
    expect(banners).toEqual([sampleBanner]);
  });
});

describe('createBanner', () => {
  it('POSTs the banner payload as JSON', async () => {
    mockFetchOnce(sampleBanner);

    const { id: _id, ...input } = sampleBanner;
    const result = await createBanner(input);

    expect(fetch).toHaveBeenCalledWith('/api/banners', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });
    expect(result).toEqual(sampleBanner);
  });
});

describe('updateBanner', () => {
  it('PUTs the banner payload to /api/banners/:id', async () => {
    const updated = { ...sampleBanner, active: false };
    mockFetchOnce(updated);

    const { id: _id, ...input } = updated;
    const result = await updateBanner(1, input);

    expect(fetch).toHaveBeenCalledWith('/api/banners/1', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });
    expect(result).toEqual(updated);
  });
});

describe('deleteBanner', () => {
  it('DELETEs /api/banners/:id', async () => {
    mockFetchOnce(null);

    await deleteBanner(1);

    expect(fetch).toHaveBeenCalledWith('/api/banners/1', { method: 'DELETE' });
  });

  it('throws when the response is not ok', async () => {
    mockFetchOnce(null, { ok: false, status: 404, statusText: 'Not Found' });

    await expect(deleteBanner(999)).rejects.toThrow('Request failed: 404 Not Found');
  });
});
