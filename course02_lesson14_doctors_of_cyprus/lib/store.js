const fs = require('fs');
const path = require('path');

const CITIES_FILE = path.join(__dirname, '..', 'data', 'cities.json');
const DOCTORS_FILE = path.join(__dirname, '..', 'data', 'doctors.json');

function readJSON(file) {
  const raw = fs.readFileSync(file, 'utf-8');
  return raw.trim() ? JSON.parse(raw) : [];
}

function writeJSON(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

function nextId(list) {
  return list.reduce((max, item) => Math.max(max, item.id), 0) + 1;
}

module.exports = {
  getCities: () => readJSON(CITIES_FILE),
  saveCities: (data) => writeJSON(CITIES_FILE, data),
  getDoctors: () => readJSON(DOCTORS_FILE),
  saveDoctors: (data) => writeJSON(DOCTORS_FILE, data),
  nextId
};
