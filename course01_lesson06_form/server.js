const express = require('express')
const jsonServer = require('json-server')
const path = require('path')
const files = require("./files");

const app = express()

const router = jsonServer.router('db.json')

// API
app.use('/api', router);
//FILES to upload and get list from folder
app.use("/files", files);

// static
app.use(express.static(path.join(__dirname, 'public')))

// SPA fallback admin area
app.get('/admin/*', (req, res) => {
  // console.log(req.path);
  res.sendFile(path.join(__dirname, 'public', 'admin/index.html'))
})

// SPA fallback
app.get('*', (req, res) => {
  // console.log(req.path);
  res.sendFile(path.join(__dirname, 'public', 'index.html'))
})

app.listen(3000, () => {
  console.log('http://localhost:3000')
})