import { describe, it, expect, vi, beforeEach } from 'vitest';
import { initCatsApp } from '../../src/main';
import * as api from '../../src/api';
import type { Cat } from '../../src/types';

vi.mock('../../src/api');

const cats: Cat[] = [
  { id: 1, name: 'Whiskers', breed: 'Siamese', age: 3, color: 'Cream' },
  { id: 2, name: 'Tom', breed: 'British Shorthair', age: 5, color: 'Gray' },
];

function setupDom(): HTMLElement {
  document.body.innerHTML = '<div id="app"></div>';
  return document.querySelector<HTMLElement>('#app')!;
}

function submitForm(root: HTMLElement): void {
  root
    .querySelector<HTMLFormElement>('#cat-form')!
    .dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
}

beforeEach(() => {
  vi.mocked(api.getCats).mockResolvedValue(cats);
});

describe('initCatsApp - initial render', () => {
  it('renders the form and table markup', () => {
    const root = setupDom();
    initCatsApp(root);

    expect(root.querySelector('h1')?.textContent).toBe('Cats');
    expect(root.querySelector('#cat-form')).not.toBeNull();
    expect(root.querySelectorAll('thead th')).toHaveLength(5);
    expect(['Name', 'Breed', 'Age', 'Color', 'Actions']).toEqual(
      Array.from(root.querySelectorAll('thead th')).map((th) => th.textContent)
    );
  });

  it('loads and renders cats from the API on init', async () => {
    const root = setupDom();
    initCatsApp(root);

    await vi.waitFor(() => {
      expect(root.querySelectorAll('#cat-list tr')).toHaveLength(2);
    });

    const firstRow = root.querySelector('#cat-list tr')!;
    expect(firstRow.textContent).toContain('Whiskers');
    expect(firstRow.textContent).toContain('Siamese');
  });

  it('shows an error message when loading cats fails', async () => {
    vi.mocked(api.getCats).mockRejectedValue(new Error('boom'));
    const root = setupDom();
    initCatsApp(root);

    await vi.waitFor(() => {
      const error = root.querySelector<HTMLElement>('#error')!;
      expect(error.hidden).toBe(false);
      expect(error.textContent).toBe('boom');
    });
  });
});

describe('initCatsApp - creating a cat', () => {
  it('submits the form, calls createCat, and clears the inputs', async () => {
    vi.mocked(api.createCat).mockResolvedValue({
      id: 3,
      name: 'Luna',
      breed: 'Maine Coon',
      age: 2,
      color: 'Black',
    });
    const root = setupDom();
    initCatsApp(root);
    await vi.waitFor(() => expect(root.querySelectorAll('#cat-list tr')).toHaveLength(2));

    root.querySelector<HTMLInputElement>('#name')!.value = 'Luna';
    root.querySelector<HTMLInputElement>('#breed')!.value = 'Maine Coon';
    root.querySelector<HTMLInputElement>('#age')!.value = '2';
    root.querySelector<HTMLInputElement>('#color')!.value = 'Black';

    submitForm(root);

    await vi.waitFor(() => {
      expect(api.createCat).toHaveBeenCalledWith({
        name: 'Luna',
        breed: 'Maine Coon',
        age: 2,
        color: 'Black',
      });
    });
    expect(root.querySelector<HTMLInputElement>('#name')!.value).toBe('');
  });
});

describe('initCatsApp - editing a cat', () => {
  it('populates the form and switches to update mode when Edit is clicked', async () => {
    const root = setupDom();
    initCatsApp(root);
    await vi.waitFor(() => expect(root.querySelectorAll('#cat-list tr')).toHaveLength(2));

    root.querySelector<HTMLButtonElement>('.edit-btn')!.click();

    expect(root.querySelector<HTMLInputElement>('#name')!.value).toBe('Whiskers');
    expect(root.querySelector<HTMLInputElement>('#breed')!.value).toBe('Siamese');
    expect(root.querySelector<HTMLButtonElement>('#submit-btn')!.textContent).toBe('Save cat');
    expect(root.querySelector<HTMLButtonElement>('#cancel-btn')!.hidden).toBe(false);
  });

  it('calls updateCat with the edited values on submit', async () => {
    vi.mocked(api.updateCat).mockResolvedValue({
      id: 1,
      name: 'Whiskers Jr',
      breed: 'Siamese',
      age: 3,
      color: 'Cream',
    });
    const root = setupDom();
    initCatsApp(root);
    await vi.waitFor(() => expect(root.querySelectorAll('#cat-list tr')).toHaveLength(2));

    root.querySelector<HTMLButtonElement>('.edit-btn')!.click();
    root.querySelector<HTMLInputElement>('#name')!.value = 'Whiskers Jr';
    submitForm(root);

    await vi.waitFor(() => {
      expect(api.updateCat).toHaveBeenCalledWith(1, {
        name: 'Whiskers Jr',
        breed: 'Siamese',
        age: 3,
        color: 'Cream',
      });
    });
  });

  it('cancel button resets the form back to add mode', async () => {
    const root = setupDom();
    initCatsApp(root);
    await vi.waitFor(() => expect(root.querySelectorAll('#cat-list tr')).toHaveLength(2));

    root.querySelector<HTMLButtonElement>('.edit-btn')!.click();
    expect(root.querySelector<HTMLButtonElement>('#submit-btn')!.textContent).toBe('Save cat');

    root.querySelector<HTMLButtonElement>('#cancel-btn')!.click();

    expect(root.querySelector<HTMLButtonElement>('#submit-btn')!.textContent).toBe('Add cat');
    expect(root.querySelector<HTMLButtonElement>('#cancel-btn')!.hidden).toBe(true);
    expect(root.querySelector<HTMLInputElement>('#name')!.value).toBe('');
  });
});

describe('initCatsApp - deleting a cat', () => {
  it('calls deleteCat with the row id and reloads the list', async () => {
    vi.mocked(api.deleteCat).mockResolvedValue(undefined);
    const root = setupDom();
    initCatsApp(root);
    await vi.waitFor(() => expect(root.querySelectorAll('#cat-list tr')).toHaveLength(2));

    root.querySelector<HTMLButtonElement>('.delete-btn')!.click();

    await vi.waitFor(() => {
      expect(api.deleteCat).toHaveBeenCalledWith(1);
    });
  });
});
