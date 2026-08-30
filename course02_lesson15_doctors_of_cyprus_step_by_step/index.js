const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = 3000;

const angiePage = "Angie's Page";

const server = http.createServer((req, res) => {
  if (req.url === "/angie") {
    res.writeHead(200, { "Content-Type": "text/html" });
    res.end(angiePage);
    return;
  }

  res.writeHead(200, { "Content-Type": "text/html" });
  res.end("Home Page");
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
