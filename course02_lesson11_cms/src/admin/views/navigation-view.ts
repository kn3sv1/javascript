import type { NavItem, NavItemInput } from '../../shared/types';
import { getNavItems, createNavItem, updateNavItem, deleteNavItem } from '../../shared/api/navigation';

export function initNavigationView(root: HTMLElement): void {
  root.innerHTML = `
    <h1>Navigation</h1>
    <div id="error" class="error" hidden></div>
    <form id="nav-form">
      <input id="label" name="label" placeholder="Label" required />
      <input id="path" name="path" placeholder="Path (e.g. /about)" required />
      <input id="order" name="order" type="number" min="1" placeholder="Order" required />
      <div class="form-actions">
        <button type="submit" class="primary" id="submit-btn">Add nav item</button>
        <button type="button" id="cancel-btn" hidden>Cancel</button>
      </div>
    </form>
    <table>
      <thead>
        <tr>
          <th>Label</th>
          <th>Path</th>
          <th>Order</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody id="nav-list"></tbody>
    </table>
  `;

  const form = root.querySelector<HTMLFormElement>('#nav-form')!;
  const labelInput = root.querySelector<HTMLInputElement>('#label')!;
  const pathInput = root.querySelector<HTMLInputElement>('#path')!;
  const orderInput = root.querySelector<HTMLInputElement>('#order')!;
  const submitBtn = root.querySelector<HTMLButtonElement>('#submit-btn')!;
  const cancelBtn = root.querySelector<HTMLButtonElement>('#cancel-btn')!;
  const navList = root.querySelector<HTMLTableSectionElement>('#nav-list')!;
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
    submitBtn.textContent = 'Add nav item';
    cancelBtn.hidden = true;
  }

  function renderNavItems(items: NavItem[]): void {
    navList.innerHTML = [...items]
      .sort((a, b) => a.order - b.order)
      .map(
        (item) => `
          <tr data-id="${item.id}">
            <td>${item.label}</td>
            <td>${item.path}</td>
            <td>${item.order}</td>
            <td class="actions">
              <button type="button" class="edit-btn">Edit</button>
              <button type="button" class="danger delete-btn">Delete</button>
            </td>
          </tr>
        `
      )
      .join('');
  }

  async function loadNavItems(): Promise<void> {
    try {
      const items = await getNavItems();
      renderNavItems(items);
      clearError();
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Failed to load navigation items');
    }
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const itemInput: NavItemInput = {
      label: labelInput.value.trim(),
      path: pathInput.value.trim(),
      order: Number(orderInput.value),
    };

    try {
      if (editingId === null) {
        await createNavItem(itemInput);
      } else {
        await updateNavItem(editingId, itemInput);
      }
      resetForm();
      await loadNavItems();
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Failed to save navigation item');
    }
  });

  cancelBtn.addEventListener('click', () => {
    resetForm();
  });

  navList.addEventListener('click', async (event) => {
    const target = event.target as HTMLElement;
    const row = target.closest<HTMLTableRowElement>('tr[data-id]');
    if (!row) return;

    const id = Number(row.dataset.id);

    if (target.classList.contains('delete-btn')) {
      try {
        await deleteNavItem(id);
        if (editingId === id) resetForm();
        await loadNavItems();
      } catch (err) {
        showError(err instanceof Error ? err.message : 'Failed to delete navigation item');
      }
      return;
    }

    if (target.classList.contains('edit-btn')) {
      const cells = row.querySelectorAll('td');
      labelInput.value = cells[0].textContent ?? '';
      pathInput.value = cells[1].textContent ?? '';
      orderInput.value = cells[2].textContent ?? '';
      editingId = id;
      submitBtn.textContent = 'Save nav item';
      cancelBtn.hidden = false;
    }
  });

  loadNavItems();
}
