import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());

// dist/server.js -> ../public
//const publicPath = path.resolve(__dirname, "public");
const publicPath =
  process.env.NODE_ENV === "production"
    ? path.resolve(__dirname, "../public")
    : path.resolve(__dirname, "public");

console.log(process.env.NODE_ENV + ' PATH:' + publicPath);

app.use(express.static(publicPath));

// API
app.get("/api/users", (req, res) => {
  res.json([
    { id: 1, name: "Alice" },
    { id: 2, name: "Bob" },
  ]);
});

// SPA fallback
app.get("/{*any}", (req, res) => {
  res.sendFile(path.join(publicPath, "index.html"));
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
