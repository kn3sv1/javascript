import type { Page, PageInput } from '../../shared/types';
import { getPages, createPage, updatePage, deletePage } from '../../shared/api/pages';

export function initPagesView(root: HTMLElement): void {
  root.innerHTML = `
    <h1>Pages</h1>
    <div id="error" class="error" hidden></div>
    <form id="page-form" class="stacked">
      <input id="path" name="path" placeholder="Path (e.g. /about)" required />
      <input id="title" name="title" placeholder="Title" required />
      <textarea id="content" name="content" placeholder="Content (HTML allowed)" required></textarea>
      <div class="form-actions">
        <button type="submit" class="primary" id="submit-btn">Add page</button>
        <button type="button" id="cancel-btn" hidden>Cancel</button>
      </div>
    </form>
    <table>
      <thead>
        <tr>
          <th>Path</th>
          <th>Title</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody id="page-list"></tbody>
    </table>
  `;

  const form = root.querySelector<HTMLFormElement>('#page-form')!;
  const pathInput = root.querySelector<HTMLInputElement>('#path')!;
  const titleInput = root.querySelector<HTMLInputElement>('#title')!;
  const contentInput = root.querySelector<HTMLTextAreaElement>('#content')!;
  const submitBtn = root.querySelector<HTMLButtonElement>('#submit-btn')!;
  const cancelBtn = root.querySelector<HTMLButtonElement>('#cancel-btn')!;
  const pageList = root.querySelector<HTMLTableSectionElement>('#page-list')!;
  const errorBox = root.querySelector<HTMLDivElement>('#error')!;

  let editingId: number | null = null;
  let pages: Page[] = [];

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
    submitBtn.textContent = 'Add page';
    cancelBtn.hidden = true;
  }

  function renderPages(): void {
    pageList.innerHTML = pages
      .map(
        (page) => `
          <tr data-id="${page.id}">
            <td>${page.path}</td>
            <td>${page.title}</td>
            <td class="actions">
              <button type="button" class="edit-btn">Edit</button>
              <button type="button" class="danger delete-btn">Delete</button>
            </td>
          </tr>
        `
      )
      .join('');
  }

  async function loadPages(): Promise<void> {
    try {
      pages = await getPages();
      renderPages();
      clearError();
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Failed to load pages');
    }
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const pageInput: PageInput = {
      path: pathInput.value.trim(),
      title: titleInput.value.trim(),
      content: contentInput.value.trim(),
    };

    try {
      if (editingId === null) {
        await createPage(pageInput);
      } else {
        await updatePage(editingId, pageInput);
      }
      resetForm();
      await loadPages();
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Failed to save page');
    }
  });

  cancelBtn.addEventListener('click', () => {
    resetForm();
  });

  pageList.addEventListener('click', async (event) => {
    const target = event.target as HTMLElement;
    const row = target.closest<HTMLTableRowElement>('tr[data-id]');
    if (!row) return;

    const id = Number(row.dataset.id);

    if (target.classList.contains('delete-btn')) {
      try {
        await deletePage(id);
        if (editingId === id) resetForm();
        await loadPages();
      } catch (err) {
        showError(err instanceof Error ? err.message : 'Failed to delete page');
      }
      return;
    }

    if (target.classList.contains('edit-btn')) {
      const page = pages.find((p) => p.id === id);
      if (!page) return;
      pathInput.value = page.path;
      titleInput.value = page.title;
      contentInput.value = page.content;
      editingId = id;
      submitBtn.textContent = 'Save page';
      cancelBtn.hidden = false;
    }
  });

  loadPages();
}
