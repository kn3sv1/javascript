const http = require("http");
const fs = require("fs");
const path = require("path");
const { homePage, angiePage, showFormPage, commentsPage } = require("./lib/pages");
const { getFormData } = require("./lib/formData");
const { saveData, readData } = require("./lib/database");

const PORT = 3000;

const server = http.createServer(async (req, res) => {
  if (req.method === "POST" && req.url === "/submit") {
    const formData = await getFormData(req, res);
    console.log(formData);
    // maybe we want to do something here - save to JSON fle
    await saveData(formData);

    res.writeHead(200, { "Content-Type": "text/html" });
    res.end("Received!");

    return;
  }

  if (req.url === "/form") {
    showFormPage(res);
    return;
  }

  if (req.url === "/comments") {
    const comments = await readData();
    commentsPage(res, comments);
    return;
  }

  if (req.url === "/angie") {
    angiePage(res);
    return;
  }

  homePage(res);
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
