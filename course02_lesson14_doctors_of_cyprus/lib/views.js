function escapeHtml(value) {
  return String(value === undefined || value === null ? '' : value).replace(/[&<>"']/g, (c) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[c]));
}

function layout(title, body, message) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${escapeHtml(title)} - Doctors of Cyprus</title>
<link rel="stylesheet" href="/public/style.css">
</head>
<body>
<header class="site-header">
  <div class="brand">Doctors of Cyprus</div>
  <nav>
    <a href="/">Home</a>
    <a href="/cities">Cities</a>
    <a href="/doctors">Doctors</a>
  </nav>
</header>
<main>
${message ? `<p class="flash">${escapeHtml(message)}</p>` : ''}
${body}
</main>
</body>
</html>`;
}

function home() {
  return layout('Home', `
    <h1>Doctors of Cyprus</h1>
    <p>A simple CRUD demo built with plain Node.js (no Express), Multer for photo uploads, and no frontend JavaScript.</p>
    <div class="card-links">
      <a class="card" href="/cities">Manage Cities</a>
      <a class="card" href="/doctors">Manage Doctors</a>
    </div>
  `);
}

function notFound() {
  return layout('Not Found', '<h1>404 - Page Not Found</h1><p><a href="/">Go home</a></p>');
}

function errorPage(err) {
  return layout('Error', `<h1>Something went wrong</h1><p>${escapeHtml(err && err.message)}</p><p><a href="/">Go home</a></p>`);
}

function photoThumb(photo, alt) {
  return photo ? `<img class="thumb" src="/uploads/${encodeURIComponent(photo)}" alt="${escapeHtml(alt)}">` : '<span class="no-photo">No photo</span>';
}

function citiesList(cities) {
  const rows = cities.map((c) => `
    <tr>
      <td>${photoThumb(c.photo, c.name)}</td>
      <td>${escapeHtml(c.name)}</td>
      <td class="actions">
        <a href="/cities/edit?id=${c.id}">Edit</a>
        <form action="/cities/delete?id=${c.id}" method="POST" class="inline-form">
          <button type="submit" class="danger">Delete</button>
        </form>
      </td>
    </tr>`).join('');

  return layout('Cities', `
    <h1>Cities</h1>
    <p><a class="button" href="/cities/new">+ Add new city</a></p>
    <table>
      <thead><tr><th>Photo</th><th>Name</th><th>Actions</th></tr></thead>
      <tbody>${rows || '<tr><td colspan="3">No cities yet.</td></tr>'}</tbody>
    </table>
  `);
}

function cityForm(city) {
  const isEdit = Boolean(city);
  const action = isEdit ? `/cities/update?id=${city.id}` : '/cities/create';
  return layout(isEdit ? 'Edit City' : 'New City', `
    <h1>${isEdit ? 'Edit City' : 'New City'}</h1>
    <form action="${action}" method="POST" enctype="multipart/form-data">
      <label>Name
        <input type="text" name="name" value="${isEdit ? escapeHtml(city.name) : ''}" required>
      </label>

      <label>Photo
        <input type="file" name="photo" accept="image/*">
      </label>
      ${isEdit && city.photo ? `<div class="current-photo"><p>Current photo:</p>${photoThumb(city.photo, city.name)}</div>` : ''}

      <div class="form-actions">
        <button type="submit">Save</button>
        <a class="button secondary" href="/cities">Cancel</a>
      </div>
    </form>
  `);
}

function doctorsList(doctors, cities) {
  const cityName = (id) => {
    const c = cities.find((c) => c.id === id);
    return c ? c.name : '(unknown city)';
  };

  const rows = doctors.map((d) => `
    <tr>
      <td>${photoThumb(d.photo, d.name)}</td>
      <td>${escapeHtml(d.name)}</td>
      <td>${escapeHtml(d.specialty)}</td>
      <td>${escapeHtml(cityName(d.cityId))}</td>
      <td class="actions">
        <a href="/doctors/edit?id=${d.id}">Edit</a>
        <form action="/doctors/delete?id=${d.id}" method="POST" class="inline-form">
          <button type="submit" class="danger">Delete</button>
        </form>
      </td>
    </tr>`).join('');

  return layout('Doctors', `
    <h1>Doctors</h1>
    <p><a class="button" href="/doctors/new">+ Add new doctor</a></p>
    <table>
      <thead><tr><th>Photo</th><th>Name</th><th>Specialty</th><th>City</th><th>Actions</th></tr></thead>
      <tbody>${rows || '<tr><td colspan="5">No doctors yet.</td></tr>'}</tbody>
    </table>
  `);
}

function doctorForm(doctor, cities) {
  const isEdit = Boolean(doctor);
  const action = isEdit ? `/doctors/update?id=${doctor.id}` : '/doctors/create';
  const options = cities.map((c) => `<option value="${c.id}" ${isEdit && doctor.cityId === c.id ? 'selected' : ''}>${escapeHtml(c.name)}</option>`).join('');

  return layout(isEdit ? 'Edit Doctor' : 'New Doctor', `
    <h1>${isEdit ? 'Edit Doctor' : 'New Doctor'}</h1>
    <form action="${action}" method="POST" enctype="multipart/form-data">
      <label>Name
        <input type="text" name="name" value="${isEdit ? escapeHtml(doctor.name) : ''}" required>
      </label>

      <label>Specialty
        <input type="text" name="specialty" value="${isEdit ? escapeHtml(doctor.specialty) : ''}" required>
      </label>

      <label>City
        <select name="cityId" required>
          <option value="">-- select a city --</option>
          ${options}
        </select>
      </label>

      <label>Photo
        <input type="file" name="photo" accept="image/*">
      </label>
      ${isEdit && doctor.photo ? `<div class="current-photo"><p>Current photo:</p>${photoThumb(doctor.photo, doctor.name)}</div>` : ''}

      <div class="form-actions">
        <button type="submit">Save</button>
        <a class="button secondary" href="/doctors">Cancel</a>
      </div>
    </form>
  `);
}

module.exports = {
  escapeHtml,
  layout,
  home,
  notFound,
  errorPage,
  citiesList,
  cityForm,
  doctorsList,
  doctorForm
};
