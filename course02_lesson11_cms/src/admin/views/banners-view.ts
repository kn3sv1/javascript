import type { Banner, BannerInput, BannerType } from '../../shared/types';
import { getBanners, createBanner, updateBanner, deleteBanner } from '../../shared/api/banners';
import { getMatchingBanners } from '../../site/banner';

function isValidPattern(pattern: string): boolean {
  try {
    new RegExp(pattern);
    return true;
  } catch {
    return false;
  }
}

export function initBannersView(root: HTMLElement): void {
  root.innerHTML = `
    <h1>Banners</h1>
    <div id="error" class="error" hidden></div>
    <form id="banner-form">
      <input id="message" name="message" placeholder="Message" required />
      <input id="pattern" name="pattern" placeholder="Path pattern (regex, e.g. ^/about)" required />
      <div id="pattern-error" class="field-error" hidden>That is not a valid regular expression.</div>
      <select id="type" name="type">
        <option value="info">info</option>
        <option value="promo">promo</option>
        <option value="warning">warning</option>
      </select>
      <label><input id="active" name="active" type="checkbox" checked /> Active</label>
      <div class="form-actions">
        <button type="submit" class="primary" id="submit-btn">Add banner</button>
        <button type="button" id="cancel-btn" hidden>Cancel</button>
      </div>
    </form>
    <div class="preview-box">
      <label for="preview-path">Preview: which banners match a page path?</label>
      <input id="preview-path" placeholder="/about" />
      <div id="preview-result"></div>
    </div>
    <table>
      <thead>
        <tr>
          <th>Message</th>
          <th>Pattern</th>
          <th>Type</th>
          <th>Active</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody id="banner-list"></tbody>
    </table>
  `;

  const form = root.querySelector<HTMLFormElement>('#banner-form')!;
  const messageInput = root.querySelector<HTMLInputElement>('#message')!;
  const patternInput = root.querySelector<HTMLInputElement>('#pattern')!;
  const patternError = root.querySelector<HTMLDivElement>('#pattern-error')!;
  const typeSelect = root.querySelector<HTMLSelectElement>('#type')!;
  const activeCheckbox = root.querySelector<HTMLInputElement>('#active')!;
  const submitBtn = root.querySelector<HTMLButtonElement>('#submit-btn')!;
  const cancelBtn = root.querySelector<HTMLButtonElement>('#cancel-btn')!;
  const bannerList = root.querySelector<HTMLTableSectionElement>('#banner-list')!;
  const errorBox = root.querySelector<HTMLDivElement>('#error')!;
  const previewPathInput = root.querySelector<HTMLInputElement>('#preview-path')!;
  const previewResult = root.querySelector<HTMLDivElement>('#preview-result')!;

  let editingId: number | null = null;
  let banners: Banner[] = [];

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
    activeCheckbox.checked = true;
    patternError.hidden = true;
    editingId = null;
    submitBtn.textContent = 'Add banner';
    cancelBtn.hidden = true;
  }

  function renderBanners(): void {
    bannerList.innerHTML = banners
      .map(
        (banner) => `
          <tr data-id="${banner.id}">
            <td>${banner.message}</td>
            <td><code>${banner.pattern}</code></td>
            <td>${banner.type}</td>
            <td>${banner.active ? 'Yes' : 'No'}</td>
            <td class="actions">
              <button type="button" class="edit-btn">Edit</button>
              <button type="button" class="danger delete-btn">Delete</button>
            </td>
          </tr>
        `
      )
      .join('');
    renderPreview();
  }

  function renderPreview(): void {
    const path = previewPathInput.value.trim();
    if (!path) {
      previewResult.textContent = '';
      return;
    }
    const matches = getMatchingBanners(banners, path);
    previewResult.textContent =
      matches.length === 0 ? 'No banners match this path.' : `Matches: ${matches.map((b) => b.message).join(', ')}`;
  }

  async function loadBanners(): Promise<void> {
    try {
      banners = await getBanners();
      renderBanners();
      clearError();
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Failed to load banners');
    }
  }

  previewPathInput.addEventListener('input', renderPreview);

  patternInput.addEventListener('input', () => {
    patternError.hidden = isValidPattern(patternInput.value.trim()) || patternInput.value.trim() === '';
  });

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const pattern = patternInput.value.trim();
    if (!isValidPattern(pattern)) {
      patternError.hidden = false;
      return;
    }

    const bannerInput: BannerInput = {
      message: messageInput.value.trim(),
      pattern,
      type: typeSelect.value as BannerType,
      active: activeCheckbox.checked,
    };

    try {
      if (editingId === null) {
        await createBanner(bannerInput);
      } else {
        await updateBanner(editingId, bannerInput);
      }
      resetForm();
      await loadBanners();
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Failed to save banner');
    }
  });

  cancelBtn.addEventListener('click', () => {
    resetForm();
  });

  bannerList.addEventListener('click', async (event) => {
    const target = event.target as HTMLElement;
    const row = target.closest<HTMLTableRowElement>('tr[data-id]');
    if (!row) return;

    const id = Number(row.dataset.id);

    if (target.classList.contains('delete-btn')) {
      try {
        await deleteBanner(id);
        if (editingId === id) resetForm();
        await loadBanners();
      } catch (err) {
        showError(err instanceof Error ? err.message : 'Failed to delete banner');
      }
      return;
    }

    if (target.classList.contains('edit-btn')) {
      const banner = banners.find((b) => b.id === id);
      if (!banner) return;
      messageInput.value = banner.message;
      patternInput.value = banner.pattern;
      typeSelect.value = banner.type;
      activeCheckbox.checked = banner.active;
      patternError.hidden = true;
      editingId = id;
      submitBtn.textContent = 'Save banner';
      cancelBtn.hidden = false;
    }
  });

  loadBanners();
}
