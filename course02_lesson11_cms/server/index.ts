import path from 'path';
import fs from 'fs';
import express from 'express';
import jsonServer from 'json-server';
import multer from 'multer';

const app = express();
const PORT = 4000;

const photosDir = path.join(process.cwd(), 'uploads', 'photos');
fs.mkdirSync(photosDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, photosDir);
  },
  filename: (_req, file, cb) => {
    const safeName = file.originalname.replace(/[^a-zA-Z0-9.\-_]/g, '_');
    cb(null, `${Date.now()}-${safeName}`);
  },
});
const upload = multer({ storage });

// Serves the built frontend (run `npm run build` first) so the whole app
// works from this one server without the Vite dev server. Routing is
// hash-based (#/about), so plain static serving is enough - no SPA fallback
// middleware needed for direct path requests. Registered before
// jsonServer.defaults() below, whose own static middleware would otherwise
// win the route for "/" and show json-server's default landing page instead.
app.use(express.static(path.join(process.cwd(), 'dist')));

const middlewares = jsonServer.defaults();
app.use(middlewares);

// Registered before the json-server router so it takes priority over /api/*.
app.post('/api/upload', upload.single('photo'), (req, res) => {
  if (!req.file) {
    res.status(400).json({ error: 'No photo file was uploaded' });
    return;
  }
  res.json({ filename: req.file.filename, url: `/photos/${req.file.filename}` });
});

app.delete('/photos/:filename', (req, res) => {
  const filePath = path.join(photosDir, req.params.filename);
  fs.unlink(filePath, (err) => {
    if (err && err.code !== 'ENOENT') {
      res.status(500).json({ error: 'Failed to delete file' });
      return;
    }
    res.status(204).end();
  });
});

app.use('/photos', express.static(photosDir));

app.use(jsonServer.bodyParser);
app.use('/api', jsonServer.router('db.json'));

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT} (API at /api)`);
});
