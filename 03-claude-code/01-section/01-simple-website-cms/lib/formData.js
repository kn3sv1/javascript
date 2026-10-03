const MAX_BODY_SIZE = 2 * 1024 * 1024; // 2 MB is plenty for a page with CKEditor content

// Reads a normal HTML form submission (application/x-www-form-urlencoded)
// and returns a plain object, e.g. { title: "About Us", slug: "about-us" }.
// Forms with file uploads (multipart/form-data) are handled by multer instead.
export function getFormData(req) {
  return new Promise((resolve, reject) => {
    let body = "";

    req.on("data", (chunk) => {
      body += chunk;

      if (body.length > MAX_BODY_SIZE) {
        reject(new Error("Form data is too large."));
        req.destroy();
      }
    });

    req.on("end", () => {
      const params = new URLSearchParams(body);
      resolve(Object.fromEntries(params));
    });

    req.on("error", reject);
  });
}
