import { describe, it, expect, vi, beforeEach } from 'vitest';
import { handleResponse } from '../../src/shared/http';

beforeEach(() => {
  vi.unstubAllGlobals();
});

describe('handleResponse', () => {
  it('resolves with the parsed JSON body when the response is ok', async () => {
    const response = { ok: true, json: () => Promise.resolve({ hello: 'world' }) } as Response;

    await expect(handleResponse(response)).resolves.toEqual({ hello: 'world' });
  });

  it('throws a descriptive error when the response is not ok', async () => {
    const response = { ok: false, status: 404, statusText: 'Not Found' } as Response;

    await expect(handleResponse(response)).rejects.toThrow('Request failed: 404 Not Found');
  });
});
