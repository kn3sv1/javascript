import type { Photo } from '../../shared/types';
import { getPhotos, createPhoto, uploadPhoto, deletePhoto } from '../../shared/api/photos';

export function initPhotosView(root: HTMLElement): void {
  root.innerHTML = `
    <h1>Photos</h1>
    <div id="error" class="error" hidden></div>
    <form id="photo-form">
      <input id="file" name="file" type="file" accept="image/*" required />
      <input id="alt" name="alt" placeholder="Alt text" required />
      <div class="form-actions">
        <button type="submit" class="primary" id="submit-btn">Upload photo</button>
      </div>
    </form>
    <div id="photo-grid" class="photo-grid"></div>
  `;

  const form = root.querySelector<HTMLFormElement>('#photo-form')!;
  const fileInput = root.querySelector<HTMLInputElement>('#file')!;
  const altInput = root.querySelector<HTMLInputElement>('#alt')!;
  const submitBtn = root.querySelector<HTMLButtonElement>('#submit-btn')!;
  const photoGrid = root.querySelector<HTMLDivElement>('#photo-grid')!;
  const errorBox = root.querySelector<HTMLDivElement>('#error')!;

  let photos: Photo[] = [];

  function showError(message: string): void {
    errorBox.textContent = message;
    errorBox.hidden = false;
  }

  function clearError(): void {
    errorBox.hidden = true;
    errorBox.textContent = '';
  }

  function renderPhotos(): void {
    photoGrid.innerHTML = photos
      .map(
        (photo) => `
          <div class="photo-card" data-id="${photo.id}">
            <img src="${photo.url}" alt="${photo.alt}" />
            <p>${photo.alt}</p>
            <button type="button" class="danger delete-btn">Delete</button>
          </div>
        `
      )
      .join('');
  }

  async function loadPhotos(): Promise<void> {
    try {
      photos = await getPhotos();
      renderPhotos();
      clearError();
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Failed to load photos');
    }
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const file = fileInput.files?.[0];
    if (!file) {
      showError('Please choose a photo file');
      return;
    }

    submitBtn.disabled = true;
    try {
      const uploaded = await uploadPhoto(file);
      await createPhoto({ filename: uploaded.filename, url: uploaded.url, alt: altInput.value.trim() });
      form.reset();
      await loadPhotos();
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Failed to upload photo');
    } finally {
      submitBtn.disabled = false;
    }
  });

  photoGrid.addEventListener('click', async (event) => {
    const target = event.target as HTMLElement;
    if (!target.classList.contains('delete-btn')) return;

    const card = target.closest<HTMLElement>('.photo-card[data-id]');
    if (!card) return;

    const id = Number(card.dataset.id);
    const photo = photos.find((p) => p.id === id);
    if (!photo) return;

    try {
      await deletePhoto(photo);
      await loadPhotos();
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Failed to delete photo');
    }
  });

  loadPhotos();
}
