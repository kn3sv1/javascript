import type { NavItem, NavItemInput } from '../types';
import { handleResponse } from '../http';

const BASE_URL = '/api/navigation';

export function getNavItems(): Promise<NavItem[]> {
  return fetch(BASE_URL).then((res) => handleResponse<NavItem[]>(res));
}

export function createNavItem(item: NavItemInput): Promise<NavItem> {
  return fetch(BASE_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(item),
  }).then((res) => handleResponse<NavItem>(res));
}

export function updateNavItem(id: number, item: NavItemInput): Promise<NavItem> {
  return fetch(`${BASE_URL}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(item),
  }).then((res) => handleResponse<NavItem>(res));
}

export function deleteNavItem(id: number): Promise<void> {
  return fetch(`${BASE_URL}/${id}`, { method: 'DELETE' }).then((res) => {
    if (!res.ok) {
      throw new Error(`Request failed: ${res.status} ${res.statusText}`);
    }
  });
}
