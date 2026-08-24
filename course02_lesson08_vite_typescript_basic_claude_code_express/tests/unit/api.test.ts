import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getCats, createCat, updateCat, deleteCat } from '../../src/api';
import type { Cat } from '../../src/types';

const sampleCat: Cat = { id: 1, name: 'Whiskers', breed: 'Siamese', age: 3, color: 'Cream' };

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

describe('getCats', () => {
  it('fetches the cats list from /api/cats', async () => {
    mockFetchOnce([sampleCat]);

    const cats = await getCats();

    expect(fetch).toHaveBeenCalledWith('/api/cats');
    expect(cats).toEqual([sampleCat]);
  });

  it('throws when the response is not ok', async () => {
    mockFetchOnce(null, { ok: false, status: 500, statusText: 'Server Error' });

    await expect(getCats()).rejects.toThrow('Request failed: 500 Server Error');
  });
});

describe('createCat', () => {
  it('POSTs the cat payload as JSON', async () => {
    mockFetchOnce(sampleCat);

    const result = await createCat({ name: 'Whiskers', breed: 'Siamese', age: 3, color: 'Cream' });

    expect(fetch).toHaveBeenCalledWith('/api/cats', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Whiskers', breed: 'Siamese', age: 3, color: 'Cream' }),
    });
    expect(result).toEqual(sampleCat);
  });
});

describe('updateCat', () => {
  it('PUTs the cat payload to /api/cats/:id', async () => {
    const updated = { ...sampleCat, age: 4 };
    mockFetchOnce(updated);

    const result = await updateCat(1, { name: 'Whiskers', breed: 'Siamese', age: 4, color: 'Cream' });

    expect(fetch).toHaveBeenCalledWith('/api/cats/1', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Whiskers', breed: 'Siamese', age: 4, color: 'Cream' }),
    });
    expect(result).toEqual(updated);
  });
});

describe('deleteCat', () => {
  it('DELETEs /api/cats/:id', async () => {
    mockFetchOnce(null);

    await deleteCat(1);

    expect(fetch).toHaveBeenCalledWith('/api/cats/1', { method: 'DELETE' });
  });

  it('throws when the response is not ok', async () => {
    mockFetchOnce(null, { ok: false, status: 404, statusText: 'Not Found' });

    await expect(deleteCat(999)).rejects.toThrow('Request failed: 404 Not Found');
  });
});
