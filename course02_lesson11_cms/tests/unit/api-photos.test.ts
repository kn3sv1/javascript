import { describe, it, expect, vi, beforeEach } from 'vitest';
import { uploadPhoto, deletePhoto } from '../../src/shared/api/photos';
import type { Photo } from '../../src/shared/types';

const samplePhoto: Photo = { id: 1, filename: '123-cat.png', url: '/photos/123-cat.png', alt: 'A cat' };

function mockFetchSequence(responses: Partial<Response>[]): ReturnType<typeof vi.fn> {
  const fetchMock = vi.fn();
  responses.forEach((init) => {
    fetchMock.mockResolvedValueOnce({
      ok: init.ok ?? true,
      status: init.status ?? 200,
      statusText: init.statusText ?? 'OK',
      json: init.json ?? (() => Promise.resolve(null)),
    } as Response);
  });
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

beforeEach(() => {
  vi.unstubAllGlobals();
});

describe('uploadPhoto', () => {
  it('POSTs the file as multipart form data to /api/upload', async () => {
    mockFetchSequence([{ json: () => Promise.resolve({ filename: samplePhoto.filename, url: samplePhoto.url }) }]);
    const file = new File(['data'], 'cat.png', { type: 'image/png' });

    const result = await uploadPhoto(file);

    expect(fetch).toHaveBeenCalledWith('/api/upload', {
      method: 'POST',
      body: expect.any(FormData),
    });
    expect(result).toEqual({ filename: samplePhoto.filename, url: samplePhoto.url });
  });
});

describe('deletePhoto', () => {
  it('deletes the DB record and then the uploaded file', async () => {
    const fetchMock = mockFetchSequence([{}, {}]);

    await deletePhoto(samplePhoto);

    expect(fetchMock).toHaveBeenNthCalledWith(1, '/api/photos/1', { method: 'DELETE' });
    expect(fetchMock).toHaveBeenNthCalledWith(2, '/photos/123-cat.png', { method: 'DELETE' });
  });

  it('throws when deleting the DB record fails', async () => {
    mockFetchSequence([{ ok: false, status: 404, statusText: 'Not Found' }]);

    await expect(deletePhoto(samplePhoto)).rejects.toThrow('Request failed: 404 Not Found');
  });
});
