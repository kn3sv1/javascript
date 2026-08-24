import type { Cat, CatInput } from './types';

const BASE_URL = '/api/cats';

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    throw new Error(`Request failed: ${response.status} ${response.statusText}`);
  }
  return response.json() as Promise<T>;
}

export function getCats(): Promise<Cat[]> {
  return fetch(BASE_URL).then((res) => handleResponse<Cat[]>(res));
}

export function createCat(cat: CatInput): Promise<Cat> {
  return fetch(BASE_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(cat),
  }).then((res) => handleResponse<Cat>(res));
}

export function updateCat(id: number, cat: CatInput): Promise<Cat> {
  return fetch(`${BASE_URL}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(cat),
  }).then((res) => handleResponse<Cat>(res));
}

export function deleteCat(id: number): Promise<void> {
  return fetch(`${BASE_URL}/${id}`, { method: 'DELETE' }).then((res) => {
    if (!res.ok) {
      throw new Error(`Request failed: ${res.status} ${res.statusText}`);
    }
  });
}
