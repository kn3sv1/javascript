import type { Photo, PhotoInput } from '../types';
import { handleResponse } from '../http';

const BASE_URL = '/api/photos';

export function getPhotos(): Promise<Photo[]> {
  return fetch(BASE_URL).then((res) => handleResponse<Photo[]>(res));
}

export function createPhoto(photo: PhotoInput): Promise<Photo> {
  return fetch(BASE_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(photo),
  }).then((res) => handleResponse<Photo>(res));
}

export function uploadPhoto(file: File): Promise<{ filename: string; url: string }> {
  const formData = new FormData();
  formData.append('photo', file);
  return fetch('/api/upload', { method: 'POST', body: formData }).then((res) =>
    handleResponse<{ filename: string; url: string }>(res)
  );
}

export function deletePhoto(photo: Photo): Promise<void> {
  return fetch(`${BASE_URL}/${photo.id}`, { method: 'DELETE' })
    .then((res) => {
      if (!res.ok) {
        throw new Error(`Request failed: ${res.status} ${res.statusText}`);
      }
    })
    .then(() => fetch(`/photos/${photo.filename}`, { method: 'DELETE' }))
    .then(() => undefined);
}
