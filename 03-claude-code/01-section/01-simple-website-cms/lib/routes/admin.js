import { addRoute } from "../router.js";
import { getFormData } from "../formData.js";
import { sendHtml, sendJson, redirect } from "../response.js";
import { getPages, getPageById, createPage, updatePage, deletePage } from "../database.js";
import {
  UPLOAD_FOLDERS,
  uploadPhoto,
  uploadEditorImage,
  listPhotos,
  isValidPhotoPath,
  deletePhoto,
} from "../upload.js";
import {
  dashboardView,
  pagesListView,
  pageFormView,
  adminNotFoundView,
  uploadsView,
} from "../views/admin.js";

const SLUG_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;

// Values for an empty "create page" form.
const EMPTY_PAGE = {
  title: "",
  slug: "",
  description: "",
  mainImage: "",
  content: "",
  published: true,
  showInMenu: true,
  menuOrder: 0,
};

// "About Us!" -> "about-us"
function slugify(text) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // remove accents: "é" -> "e"
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// Checks the submitted page form.
// Returns { page, errors }: "page" holds the cleaned values, "errors" a list of messages.
async function validatePage(formData, currentPageId = null) {
  const errors = [];

  const title = (formData.title || "").trim();
  let slug = (formData.slug || "").trim().toLowerCase();
  const description = (formData.description || "").trim();
  const mainImage = formData.mainImage || "";
  const content = formData.content || "";
  const menuOrder = Number.parseInt(formData.menuOrder, 10);

  if (!title) {
    errors.push("Title is required.");
  } else if (title.length > 200) {
    errors.push("Title must be 200 characters or less.");
  }

  if (!slug) {
    slug = slugify(title);
  }
  if (!slug) {
    errors.push("Please enter a slug (only latin letters, numbers and dashes).");
  } else if (!SLUG_PATTERN.test(slug) || slug.length > 100) {
    errors.push("Slug may only contain a-z, 0-9 and single dashes, for example: about-us");
  } else {
    const pages = await getPages();
    const slugTaken = pages.some((page) => page.slug === slug && page.id !== currentPageId);
    if (slugTaken) {
      errors.push(`The slug "${slug}" is already used by another page.`);
    }
  }

  if (description.length > 500) {
    errors.push("Description must be 500 characters or less.");
  }

  // The main image must be one of the uploaded photos (no other paths allowed).
  if (mainImage && !(await isValidPhotoPath(mainImage))) {
    errors.push("Please choose a main image from the list.");
  }

  const page = {
    title,
    slug,
    description,
    mainImage,
    content,
    published: formData.published === "1",
    showInMenu: formData.showInMenu === "1",
    menuOrder: Number.isNaN(menuOrder) ? 0 : Math.min(Math.max(menuOrder, 0), 999),
  };

  return { page, errors };
}

// Reads "?msg=..." from the URL (used for messages after a redirect).
function getMessageKey(req) {
  return new URL(req.url, "http://localhost").searchParams.get("msg");
}

// ---------- Dashboard ----------

addRoute("GET", "/admin", async (req, res) => {
  const pages = await getPages();
  const photoFolders = await listPhotos();
  const photoCount = photoFolders.reduce((total, folder) => total + folder.photos.length, 0);

  sendHtml(res, 200, dashboardView({ pageCount: pages.length, photoCount }));
});

// ---------- Pages ----------

addRoute("GET", "/admin/pages", async (req, res) => {
  const pages = await getPages();
  sendHtml(res, 200, pagesListView(pages, getMessageKey(req)));
});

addRoute("GET", "/admin/pages/create", async (req, res) => {
  const html = pageFormView({
    heading: "Create page",
    action: "/admin/pages/create",
    page: EMPTY_PAGE,
    photoFolders: await listPhotos(),
  });
  sendHtml(res, 200, html);
});

addRoute("POST", "/admin/pages/create", async (req, res) => {
  const formData = await getFormData(req);
  const { page, errors } = await validatePage(formData);

  // Show the form again with the entered values and the errors.
  if (errors.length > 0) {
    const html = pageFormView({
      heading: "Create page",
      action: "/admin/pages/create",
      page,
      errors,
      photoFolders: await listPhotos(),
    });
    sendHtml(res, 400, html);
    return;
  }

  await createPage(page);
  redirect(res, "/admin/pages?msg=page-created");
});

addRoute("GET", "/admin/pages/edit/:id", async (req, res, params) => {
  const page = await getPageById(params.id);
  if (!page) {
    sendHtml(res, 404, adminNotFoundView());
    return;
  }

  const html = pageFormView({
    heading: `Edit page: ${page.title}`,
    action: `/admin/pages/edit/${encodeURIComponent(page.id)}`,
    page,
    photoFolders: await listPhotos(),
  });
  sendHtml(res, 200, html);
});

addRoute("POST", "/admin/pages/edit/:id", async (req, res, params) => {
  const existingPage = await getPageById(params.id);
  if (!existingPage) {
    sendHtml(res, 404, adminNotFoundView());
    return;
  }

  const formData = await getFormData(req);
  const { page, errors } = await validatePage(formData, existingPage.id);

  if (errors.length > 0) {
    const html = pageFormView({
      heading: `Edit page: ${existingPage.title}`,
      action: `/admin/pages/edit/${encodeURIComponent(existingPage.id)}`,
      page,
      errors,
      photoFolders: await listPhotos(),
    });
    sendHtml(res, 400, html);
    return;
  }

  await updatePage(existingPage.id, page);
  redirect(res, "/admin/pages?msg=page-saved");
});

addRoute("POST", "/admin/pages/delete/:id", async (req, res, params) => {
  await deletePage(params.id);
  redirect(res, "/admin/pages?msg=page-deleted");
});

// ---------- Photos ----------

async function renderUploads(res, status, { messageKey = null, error = "" } = {}) {
  const html = uploadsView({
    photoFolders: await listPhotos(),
    folderNames: UPLOAD_FOLDERS,
    messageKey,
    error,
  });
  sendHtml(res, status, html);
}

// Turns multer errors into friendly messages.
function uploadErrorMessage(err) {
  if (err.code === "LIMIT_FILE_SIZE") {
    return "The photo is too large (max 5 MB).";
  }
  return err.message || "Upload failed.";
}

addRoute("GET", "/admin/uploads", async (req, res) => {
  await renderUploads(res, 200, { messageKey: getMessageKey(req) });
});

addRoute("POST", "/admin/uploads", async (req, res) => {
  try {
    await uploadPhoto(req, res);
  } catch (err) {
    await renderUploads(res, 400, { error: uploadErrorMessage(err) });
    return;
  }

  if (!req.file) {
    await renderUploads(res, 400, { error: "Please choose a photo to upload." });
    return;
  }

  redirect(res, "/admin/uploads?msg=photo-uploaded");
});

addRoute("POST", "/admin/uploads/delete", async (req, res) => {
  const formData = await getFormData(req);
  const photo = formData.photo;

  // Do not delete a photo that a page still uses as its main image.
  const pages = await getPages();
  const usedBy = pages.find((page) => page.mainImage === photo);
  if (usedBy) {
    await renderUploads(res, 400, {
      error: `This photo is the main image of the page "${usedBy.title}". Choose another image for that page first.`,
    });
    return;
  }

  const deleted = await deletePhoto(photo);
  if (!deleted) {
    await renderUploads(res, 400, { error: "Photo not found." });
    return;
  }

  redirect(res, "/admin/uploads?msg=photo-deleted");
});

// Image upload from inside CKEditor (Simple Upload Adapter).
// CKEditor expects JSON: { url: "..." } or { error: { message: "..." } }
addRoute("POST", "/admin/uploads/editor", async (req, res) => {
  try {
    await uploadEditorImage(req, res);
  } catch (err) {
    sendJson(res, 400, { error: { message: uploadErrorMessage(err) } });
    return;
  }

  if (!req.file) {
    sendJson(res, 400, { error: { message: "No image received." } });
    return;
  }

  sendJson(res, 200, { url: `/uploads/pages/${req.file.filename}` });
});
