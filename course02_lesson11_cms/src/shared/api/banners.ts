import type { Banner, BannerInput } from '../types';
import { handleResponse } from '../http';

const BASE_URL = '/api/banners';

export function getBanners(): Promise<Banner[]> {
  return fetch(BASE_URL).then((res) => handleResponse<Banner[]>(res));
}

export function createBanner(banner: BannerInput): Promise<Banner> {
  return fetch(BASE_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(banner),
  }).then((res) => handleResponse<Banner>(res));
}

export function updateBanner(id: number, banner: BannerInput): Promise<Banner> {
  return fetch(`${BASE_URL}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(banner),
  }).then((res) => handleResponse<Banner>(res));
}

export function deleteBanner(id: number): Promise<void> {
  return fetch(`${BASE_URL}/${id}`, { method: 'DELETE' }).then((res) => {
    if (!res.ok) {
      throw new Error(`Request failed: ${res.status} ${res.statusText}`);
    }
  });
}
