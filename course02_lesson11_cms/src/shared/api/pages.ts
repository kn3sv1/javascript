import type { Page, PageInput } from '../types';
import { handleResponse } from '../http';

const BASE_URL = '/api/pages';

export function getPages(): Promise<Page[]> {
  return fetch(BASE_URL).then((res) => handleResponse<Page[]>(res));
}

export function createPage(page: PageInput): Promise<Page> {
  return fetch(BASE_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(page),
  }).then((res) => handleResponse<Page>(res));
}

export function updatePage(id: number, page: PageInput): Promise<Page> {
  return fetch(`${BASE_URL}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(page),
  }).then((res) => handleResponse<Page>(res));
}

export function deletePage(id: number): Promise<void> {
  return fetch(`${BASE_URL}/${id}`, { method: 'DELETE' }).then((res) => {
    if (!res.ok) {
      throw new Error(`Request failed: ${res.status} ${res.statusText}`);
    }
  });
}
