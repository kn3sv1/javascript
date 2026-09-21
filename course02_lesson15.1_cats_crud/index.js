const http = require("http");
const fs = require("fs");
const path = require("path");

const {
  homePage,
  angiePage,
  showFormPage,
  commentsPage,
  showUploadFilePage,
  showErrorPage,
} = require("./lib/pages");

const { parseData, readData, saveData } = require("./lib/database");
const { uploadDoctorPhoto, UPLOADS_DIR } = require("./lib/upload");

const PORT = 3000;
const PUBLIC_DIR = path.join(__dirname, "public");

const MIME_TYPES = {
  ".css": "text/css",
  ".js": "text/javascript",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
};

function sendHtml(res, status, html) {
  res.writeHead(status, { "Content-Type": "text/html; charset=utf-8" });
  res.end(html);
}

function redirect(res, location) {
  res.writeHead(302, { Location: location });
  res.end();
}

function serveStatic(req, res, rootDir, urlPrefix) {
  const pathname = new URL(req.url, "http://localhost").pathname;
  const relPath = decodeURIComponent(pathname.slice(urlPrefix.length));
  const filePath = path.join(rootDir, relPath);

  if (!filePath.startsWith(rootDir)) {
    sendHtml(res, 403, "Forbidden");
    return;
  }

  fs.readFile(filePath, (err, data) => {
    if (err) {
      sendHtml(res, 404, "Not found");
      return;
    }
    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, {
      "Content-Type": MIME_TYPES[ext] || "application/octet-stream",
    });
    res.end(data);
  });
}

function uuid() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// console.log(uuid());
// e.g. "f47ac10b-58cc-4372-a567-0e02b2c3d479"

const server = http.createServer(async (req, res) => {
  let parsed;
  try {
    parsed = new URL(req.url, "http://localhost");
  } catch (err) {
    return sendHtml(res, 400, "Bad request");
  }

  // http://localhost:3000/uploads/doctors/keyboard.png
  // http://localhost:3000/public/style.css
  // http://localhost:3000/public/hello.js
  const pathname = parsed.pathname || "/";

  if (pathname === "/") {
    homePage(res);
    return;
  }

  if (pathname.startsWith("/public/")) {
    return serveStatic(req, res, PUBLIC_DIR, "/public/");
  }
  if (pathname.startsWith("/uploads/")) {
    return serveStatic(req, res, UPLOADS_DIR, "/uploads/");
  }

  // if (req.method === "POST" && req.url === "/submit") {
  //   const formData = await getFormData(req, res);
  //   formData.uuid = uuid();
  //   console.log(formData);
  //   // maybe we want to do something here - save to JSON fle
  //   await saveData(formData);

  //   res.writeHead(200, { "Content-Type": "text/html" });
  //   res.end("Received!");

  //   // you should redirect to "comments" page
  //   //redirect(res, '/comments');

  //   return;
  // }

  if (req.url === "/form") {
    showFormPage(res);
    return;
  }

  if (req.url === "/show-upload") {
    showUploadFilePage(res);
    return;
  }

  if (req.url === "/upload") {
    uploadDoctorPhoto(req, res, (err) => {
      if (err) {
        return showErrorPage(res, err);
      }

      console.log(req.file.filename);
      console.log(req.file);

      res.writeHead(200, { "Content-Type": "text/html" });
      res.end("Received uploaded file!");

      // redirect(res, '/doctors');
    });

    return;
  }

  if (req.url === "/angie") {
    angiePage(res);
    return;
  }

  // GET /cats
  if (req.method === "GET" && req.url === "/cats") {
    // OLD WAY
    /*return fs.readFile("cats.json", "utf8", (err, data) => {
      if (err) {
        res.writeHead(500, { "Content-Type": "application/json" });

        res.end(
          JSON.stringify({
            error: "Could not read cats.json",
          }),
        );

        return;
      }

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(data);
    });*/

    readData()
      .then((database) => {
        res.writeHead(200, {
          "Content-Type": "application/json",
        });

        res.end(JSON.stringify(database.cats));
      })
      .catch((err) => {
        console.error(err);

        res.writeHead(500, {
          "Content-Type": "application/json",
        });

        res.end(
          JSON.stringify({
            error: "Could not read cats",
          }),
        );
      });

    return;
  }

  // POST /cats
  if (req.method === "POST" && req.url === "/cats") {
    let body = "";

    req.on("data", (chunk) => {
      body += chunk;
    });

    req.on("end", async () => {
      //const body = getRequestBody(req);

      //OLD WAY - BEFORE EXTRACTING database/file-related work to functions in database.js
      /*const params = new URLSearchParams(body);

      const newCat = Object.fromEntries(params);

      newCat.age = Number(newCat.age);

      console.log(newCat);
      */

      //const newCat = JSON.parse(body);

      try {
        // 1. Parse request data
        const newCat = parseData(body);

        // 2. Validate
        const errors = [];

        if (!newCat.name || newCat.name.trim() === "") {
          errors.push("Name is required");
        }

        if (!Number.isInteger(newCat.age) || newCat.age < 0) {
          errors.push("Age must be a non-negative integer");
        }

        if (!newCat.color || newCat.color.trim() === "") {
          errors.push("Color is required");
        }

        if (errors.length > 0) {
          res.writeHead(400, {
            "Content-Type": "application/json",
          });

          res.end(
            JSON.stringify({
              errors: errors,
            }),
          );

          return;
        }

        // OLD WAY
        /*fs.readFile("cats.json", "utf8", (err, data) => {
        const database = JSON.parse(data);

        const newId =
          database.cats.length > 0
            ? Math.max(...database.cats.map((cat) => cat.id)) + 1
            : 1;

        newCat.id = newId;

        database.cats.push(newCat);

        fs.writeFile("cats.json", JSON.stringify(database, null, 2), (err) => {
          if (err) {
            res.writeHead(500);
            res.end("Could not save cat");
            return;
          }

          res.writeHead(201, {
            "Content-Type": "application/json",
          });

          res.end(JSON.stringify(newCat));
        });
      });*/

        // 3. Read database
        const database = await readData();

        // 4. Generate ID
        const newId =
          database.cats.length > 0
            ? Math.max(...database.cats.map((cat) => cat.id)) + 1
            : 1;

        newCat.id = newId;

        // 5. Add cat
        database.cats.push(newCat);

        // 6. Save database
        await saveData(database);

        // 7. Send response
        res.writeHead(201, {
          "Content-Type": "application/json",
        });

        res.end(JSON.stringify(newCat));
      } catch (err) {
        console.error(err);

        res.writeHead(500, {
          "Content-Type": "application/json",
        });

        res.end(
          JSON.stringify({
            error: "Internal server error",
          }),
        );
      }
    });

    return;
  }

  // GET /cats/:id
  if (req.method === "GET" && req.url.startsWith("/cats/")) {
    const id = Number(req.url.split("/")[2]);

    // OLD WAY
    /*fs.readFile("cats.json", "utf8", (err, data) => {
      if (err) {
        res.writeHead(500, { "Content-Type": "application/json" });

        res.end(
          JSON.stringify({
            error: "Could not read cats.json",
          }),
        );

        return;
      }

      const database = JSON.parse(data);

      const cat = database.cats.find((cat) => cat.id === id);

      if (!cat) {
        res.writeHead(404, {
          "Content-Type": "application/json",
        });

        res.end(
          JSON.stringify({
            error: "Cat not found",
          }),
        );

        return;
      }

      res.writeHead(200, {
        "Content-Type": "application/json",
      });

      res.end(JSON.stringify(cat));
    });*/

    // Validate ID
    if (!Number.isInteger(id) || id <= 0) {
      res.writeHead(400, {
        "Content-Type": "application/json",
      });

      res.end(
        JSON.stringify({
          error: "Invalid cat ID",
        }),
      );

      return;
    }

    readData()
      .then((database) => {
        const cat = database.cats.find((cat) => cat.id === id);

        if (!cat) {
          res.writeHead(404, {
            "Content-Type": "application/json",
          });

          res.end(
            JSON.stringify({
              error: "Cat not found",
            }),
          );

          return;
        }

        res.writeHead(200, {
          "Content-Type": "application/json",
        });

        res.end(JSON.stringify(cat));
      })
      .catch((err) => {
        console.error(err);

        res.writeHead(500, {
          "Content-Type": "application/json",
        });

        res.end(
          JSON.stringify({
            error: "Could not read cats",
          }),
        );
      });

    return;
  }

  // Route not found
  res.writeHead(404, {
    "Content-Type": "application/json",
  });

  res.end(
    JSON.stringify({
      error: "Route not found",
    }),
  );
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
