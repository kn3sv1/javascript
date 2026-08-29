const http = require('http');
const path = require('path');
const fs = require('fs');

const store = require('./lib/store');
const views = require('./lib/views');
const { uploadCityPhoto, uploadDoctorPhoto, UPLOADS_DIR } = require('./lib/upload');

const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = path.join(__dirname, 'public');

const MIME_TYPES = {
  '.css': 'text/css',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml'
};

function sendHtml(res, status, html) {
  res.writeHead(status, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end(html);
}

function redirect(res, location) {
  res.writeHead(302, { Location: location });
  res.end();
}

function serveStatic(req, res, rootDir, urlPrefix) {
  const pathname = new URL(req.url, 'http://localhost').pathname;
  const relPath = decodeURIComponent(pathname.slice(urlPrefix.length));
  const filePath = path.join(rootDir, relPath);

  if (!filePath.startsWith(rootDir)) {
    sendHtml(res, 403, 'Forbidden');
    return;
  }

  fs.readFile(filePath, (err, data) => {
    if (err) {
      sendHtml(res, 404, 'Not found');
      return;
    }
    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, { 'Content-Type': MIME_TYPES[ext] || 'application/octet-stream' });
    res.end(data);
  });
}

function removeUploadedFile(filename) {
  if (!filename) return;
  const filePath = path.join(UPLOADS_DIR, filename);
  fs.unlink(filePath, () => {});
}

// ---------- Cities ----------

function listCities(req, res) {
  const cities = store.getCities();
  sendHtml(res, 200, views.citiesList(cities));
}

function newCityForm(req, res) {
  sendHtml(res, 200, views.cityForm(null));
}

function createCity(req, res) {
  uploadCityPhoto(req, res, (err) => {
    if (err) return sendHtml(res, 400, views.errorPage(err));

    const name = (req.body.name || '').trim();
    if (!name) return sendHtml(res, 400, views.errorPage(new Error('City name is required')));

    const cities = store.getCities();
    const city = {
      id: store.nextId(cities),
      name,
      photo: req.file ? req.file.filename : null
    };
    cities.push(city);
    store.saveCities(cities);
    redirect(res, '/cities');
  });
}

function editCityForm(req, res, id) {
  const cities = store.getCities();
  const city = cities.find((c) => c.id === Number(id));
  if (!city) return sendHtml(res, 404, views.notFound());
  sendHtml(res, 200, views.cityForm(city));
}

function updateCity(req, res, id) {
  uploadCityPhoto(req, res, (err) => {
    if (err) return sendHtml(res, 400, views.errorPage(err));

    const cities = store.getCities();
    const city = cities.find((c) => c.id === Number(id));
    if (!city) return sendHtml(res, 404, views.notFound());

    const name = (req.body.name || '').trim();
    if (!name) return sendHtml(res, 400, views.errorPage(new Error('City name is required')));

    city.name = name;
    if (req.file) {
      removeUploadedFile(city.photo);
      city.photo = req.file.filename;
    }

    store.saveCities(cities);
    redirect(res, '/cities');
  });
}

function deleteCity(req, res, id) {
  const cities = store.getCities();
  const city = cities.find((c) => c.id === Number(id));
  if (city) {
    removeUploadedFile(city.photo);
    store.saveCities(cities.filter((c) => c.id !== Number(id)));
  }
  redirect(res, '/cities');
}

// ---------- Doctors ----------

function listDoctors(req, res) {
  const doctors = store.getDoctors();
  const cities = store.getCities();
  sendHtml(res, 200, views.doctorsList(doctors, cities));
}

function newDoctorForm(req, res) {
  const cities = store.getCities();
  sendHtml(res, 200, views.doctorForm(null, cities));
}

function createDoctor(req, res) {
  uploadDoctorPhoto(req, res, (err) => {
    if (err) return sendHtml(res, 400, views.errorPage(err));

    const name = (req.body.name || '').trim();
    const specialty = (req.body.specialty || '').trim();
    const cityId = Number(req.body.cityId);

    if (!name || !specialty || !cityId) {
      return sendHtml(res, 400, views.errorPage(new Error('Name, specialty and city are required')));
    }

    const doctors = store.getDoctors();
    const doctor = {
      id: store.nextId(doctors),
      name,
      specialty,
      cityId,
      photo: req.file ? req.file.filename : null
    };
    doctors.push(doctor);
    store.saveDoctors(doctors);
    redirect(res, '/doctors');
  });
}

function editDoctorForm(req, res, id) {
  const doctors = store.getDoctors();
  const doctor = doctors.find((d) => d.id === Number(id));
  if (!doctor) return sendHtml(res, 404, views.notFound());
  const cities = store.getCities();
  sendHtml(res, 200, views.doctorForm(doctor, cities));
}

function updateDoctor(req, res, id) {
  uploadDoctorPhoto(req, res, (err) => {
    if (err) return sendHtml(res, 400, views.errorPage(err));

    const doctors = store.getDoctors();
    const doctor = doctors.find((d) => d.id === Number(id));
    if (!doctor) return sendHtml(res, 404, views.notFound());

    const name = (req.body.name || '').trim();
    const specialty = (req.body.specialty || '').trim();
    const cityId = Number(req.body.cityId);

    if (!name || !specialty || !cityId) {
      return sendHtml(res, 400, views.errorPage(new Error('Name, specialty and city are required')));
    }

    doctor.name = name;
    doctor.specialty = specialty;
    doctor.cityId = cityId;
    if (req.file) {
      removeUploadedFile(doctor.photo);
      doctor.photo = req.file.filename;
    }

    store.saveDoctors(doctors);
    redirect(res, '/doctors');
  });
}

function deleteDoctor(req, res, id) {
  const doctors = store.getDoctors();
  const doctor = doctors.find((d) => d.id === Number(id));
  if (doctor) {
    removeUploadedFile(doctor.photo);
    store.saveDoctors(doctors.filter((d) => d.id !== Number(id)));
  }
  redirect(res, '/doctors');
}

// ---------- Router ----------

const server = http.createServer((req, res) => {
  let parsed;
  try {
    parsed = new URL(req.url, 'http://localhost');
  } catch (err) {
    return sendHtml(res, 400, 'Bad request');
  }

  const pathname = parsed.pathname || '/';
  const method = req.method;
  const id = parsed.searchParams.get('id');

  try {
    if (pathname.startsWith('/public/')) return serveStatic(req, res, PUBLIC_DIR, '/public/');
    if (pathname.startsWith('/uploads/')) return serveStatic(req, res, UPLOADS_DIR, '/uploads/');

    if (pathname === '/' && method === 'GET') return sendHtml(res, 200, views.home());

    if (pathname === '/cities' && method === 'GET') return listCities(req, res);
    if (pathname === '/cities/new' && method === 'GET') return newCityForm(req, res);
    if (pathname === '/cities/create' && method === 'POST') return createCity(req, res);
    if (pathname === '/cities/edit' && method === 'GET') return editCityForm(req, res, id);
    if (pathname === '/cities/update' && method === 'POST') return updateCity(req, res, id);
    if (pathname === '/cities/delete' && method === 'POST') return deleteCity(req, res, id);

    if (pathname === '/doctors' && method === 'GET') return listDoctors(req, res);
    if (pathname === '/doctors/new' && method === 'GET') return newDoctorForm(req, res);
    if (pathname === '/doctors/create' && method === 'POST') return createDoctor(req, res);
    if (pathname === '/doctors/edit' && method === 'GET') return editDoctorForm(req, res, id);
    if (pathname === '/doctors/update' && method === 'POST') return updateDoctor(req, res, id);
    if (pathname === '/doctors/delete' && method === 'POST') return deleteDoctor(req, res, id);

    sendHtml(res, 404, views.notFound());
  } catch (err) {
    console.error(err);
    sendHtml(res, 500, views.errorPage(err));
  }
});

server.listen(PORT, () => {
  console.log(`Doctors of Cyprus app running at http://localhost:${PORT}`);
});
