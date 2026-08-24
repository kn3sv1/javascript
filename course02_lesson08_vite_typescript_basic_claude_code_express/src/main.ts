import './style.css';
import type { Cat, CatInput } from './types';
import { getCats, createCat, updateCat, deleteCat } from './api';

export function initCatsApp(root: HTMLElement): void {
  root.innerHTML = `
    <h1>Cats</h1>
    <div id="error" class="error" hidden></div>
    <form id="cat-form">
      <input id="name" name="name" placeholder="Name" required />
      <input id="breed" name="breed" placeholder="Breed" required />
      <input id="age" name="age" type="number" min="0" placeholder="Age" required />
      <input id="color" name="color" placeholder="Color" required />
      <div class="form-actions">
        <button type="submit" class="primary" id="submit-btn">Add cat</button>
        <button type="button" id="cancel-btn" hidden>Cancel</button>
      </div>
    </form>
    <table>
      <thead>
        <tr>
          <th>Name</th>
          <th>Breed</th>
          <th>Age</th>
          <th>Color</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody id="cat-list"></tbody>
    </table>
  `;

  const form = root.querySelector<HTMLFormElement>('#cat-form')!;
  const nameInput = root.querySelector<HTMLInputElement>('#name')!;
  const breedInput = root.querySelector<HTMLInputElement>('#breed')!;
  const ageInput = root.querySelector<HTMLInputElement>('#age')!;
  const colorInput = root.querySelector<HTMLInputElement>('#color')!;
  const submitBtn = root.querySelector<HTMLButtonElement>('#submit-btn')!;
  const cancelBtn = root.querySelector<HTMLButtonElement>('#cancel-btn')!;
  const catList = root.querySelector<HTMLTableSectionElement>('#cat-list')!;
  const errorBox = root.querySelector<HTMLDivElement>('#error')!;

  let editingId: number | null = null;

  function showError(message: string): void {
    errorBox.textContent = message;
    errorBox.hidden = false;
  }

  function clearError(): void {
    errorBox.hidden = true;
    errorBox.textContent = '';
  }

  function resetForm(): void {
    form.reset();
    editingId = null;
    submitBtn.textContent = 'Add cat';
    cancelBtn.hidden = true;
  }

  function renderCats(cats: Cat[]): void {
    catList.innerHTML = cats
      .map(
        (cat) => `
          <tr data-id="${cat.id}">
            <td>${cat.name}</td>
            <td>${cat.breed}</td>
            <td>${cat.age}</td>
            <td>${cat.color}</td>
            <td class="actions">
              <button type="button" class="edit-btn">Edit</button>
              <button type="button" class="danger delete-btn">Delete</button>
            </td>
          </tr>
        `
      )
      .join('');
  }

  async function loadCats(): Promise<void> {
    try {
      const cats = await getCats();
      renderCats(cats);
      clearError();
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Failed to load cats');
    }
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const catInput: CatInput = {
      name: nameInput.value.trim(),
      breed: breedInput.value.trim(),
      age: Number(ageInput.value),
      color: colorInput.value.trim(),
    };

    try {
      if (editingId === null) {
        await createCat(catInput);
      } else {
        await updateCat(editingId, catInput);
      }
      resetForm();
      await loadCats();
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Failed to save cat');
    }
  });

  cancelBtn.addEventListener('click', () => {
    resetForm();
  });

  catList.addEventListener('click', async (event) => {
    const target = event.target as HTMLElement;
    const row = target.closest<HTMLTableRowElement>('tr[data-id]');
    if (!row) return;

    const id = Number(row.dataset.id);

    if (target.classList.contains('delete-btn')) {
      try {
        await deleteCat(id);
        if (editingId === id) resetForm();
        await loadCats();
      } catch (err) {
        showError(err instanceof Error ? err.message : 'Failed to delete cat');
      }
      return;
    }

    if (target.classList.contains('edit-btn')) {
      const cells = row.querySelectorAll('td');
      nameInput.value = cells[0].textContent ?? '';
      breedInput.value = cells[1].textContent ?? '';
      ageInput.value = cells[2].textContent ?? '';
      colorInput.value = cells[3].textContent ?? '';
      editingId = id;
      submitBtn.textContent = 'Save cat';
      cancelBtn.hidden = false;
    }
  });

  loadCats();
}

const appRoot = document.querySelector<HTMLDivElement>('#app');
if (appRoot) {
  initCatsApp(appRoot);
}
