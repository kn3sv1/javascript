export function sendHtml(res, status, html) {
  res.writeHead(status, { "Content-Type": "text/html; charset=utf-8" });
  res.end(html);
}

export function menu() {
  return `
    <nav class="menu">
      <a href="/">Home</a>
      <a href="/people/angie">Angie</a>
      <a href="/people/roma">Roma</a>
    </nav>
  `;
}

export function layout(title, content) {
  return `
    <!doctype html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>${title}</title>
        <link rel="stylesheet" href="/public/style.css">
      </head>
      <body>
        ${menu()}
        <main>
          ${content}
        </main>
      </body>
    </html>
  `;
}

export function homePage(res) {
  sendHtml(
    res,
    200,
    layout(
      "Home",
      `
    <section class="hero">
      <div class="hero-text">
        <h1>Welcome to our little website</h1>
        <p>A homework project built with plain Node.js — no frameworks.</p>
        <a class="button" href="#team">Meet the team ↓</a>
      </div>
    </section>

    <section id="team">
      <h2>Meet the team</h2>
      <div class="cards">
        <article class="card">
          <img class="avatar" src="/uploads/people/angie/avatar.svg" alt="Angie">
          <h3>Angie</h3>
          <p>Loves nature, hiking and photography.</p>
          <a class="button" href="/people/angie">View page →</a>
        </article>

        <article class="card">
          <img class="avatar" src="/uploads/people/roma/avatar.svg" alt="Roma">
          <h3>Roma</h3>
          <p>Learning JavaScript and Node.js. Likes mountains and animals.</p>
          <a class="button" href="/people/roma">View page →</a>
        </article>
      </div>
    </section>

    <section>
      <h2>What this site is built with</h2>
      <ul class="features">
        <li>🟢 <b>Node.js</b> — <code>http</code> server</li>
        <li>📄 <b>HTML</b> — template strings</li>
        <li>🎨 <b>CSS</b> — flexbox &amp; grid</li>
        <li>📦 <b>ES modules</b> — import / export</li>
      </ul>
    </section>

    <footer class="footer">
      © ${new Date().getFullYear()} · Made while learning JavaScript
    </footer>

    <script src="/public/homepage.js"></script>
  `,
    ),
  );
}

export function angiePage(res) {
  sendHtml(
    res,
    200,
    layout(
      "Angie",
      `
    <div class="profile">
      <img class="avatar" src="/uploads/people/angie/avatar.svg" alt="Angie">
      <div>
        <h1>Angie</h1>
        <p>Loves nature, hiking and photography.</p>
      </div>
    </div>

    <h2>Places I want to visit</h2>
    <table>
      <thead>
        <tr>
          <th>#</th>
          <th>Place</th>
          <th>Country</th>
          <th>Why</th>
        </tr>
      </thead>
      <tbody>
        <tr><td>1</td><td>Preikestolen</td><td>Norway</td><td>Amazing view over the fjord</td></tr>
        <tr><td>2</td><td>Yosemite</td><td>USA</td><td>Giant rocks and forests</td></tr>
        <tr><td>3</td><td>Salt Creek Falls</td><td>USA</td><td>Waterfall in the forest</td></tr>
      </tbody>
    </table>

    <h2>My photos</h2>
    <div class="gallery">
      <figure>
        <img src="/uploads/people/angie/fjord.jpg" alt="Fjord">
        <figcaption>Fjord in Norway</figcaption>
      </figure>
      <figure>
        <img src="/uploads/people/angie/waterfall.jpg" alt="Waterfall">
        <figcaption>Forest waterfall</figcaption>
      </figure>
      <figure>
        <img src="/uploads/people/angie/yosemite.jpg" alt="Yosemite">
        <figcaption>Yosemite valley</figcaption>
      </figure>
    </div>
  `,
    ),
  );
}

export function romaPage(res) {
  sendHtml(
    res,
    200,
    layout(
      "Roma",
      `
    <div class="profile">
      <img class="avatar" src="/uploads/people/roma/avatar.svg" alt="Roma">
      <div>
        <h1>Roma</h1>
        <p>Learning JavaScript and Node.js. Likes mountains and animals.</p>
      </div>
    </div>

    <h2>My trips</h2>
    <table>
      <thead>
        <tr>
          <th>Year</th>
          <th>Place</th>
          <th>Days</th>
          <th>Rating</th>
        </tr>
      </thead>
      <tbody>
        <tr><td>2023</td><td>Isle of Skye, Scotland</td><td>5</td><td>⭐⭐⭐⭐</td></tr>
        <tr><td>2024</td><td>Himalayas, Nepal</td><td>14</td><td>⭐⭐⭐⭐⭐</td></tr>
        <tr><td>2025</td><td>Safari, Kenya</td><td>7</td><td>⭐⭐⭐⭐⭐</td></tr>
      </tbody>
    </table>

    <h2>My photos</h2>
    <div class="gallery">
      <figure>
        <img src="/uploads/people/roma/mountain-road.jpg" alt="Mountain road">
        <figcaption>Road on Isle of Skye</figcaption>
      </figure>
      <figure>
        <img src="/uploads/people/roma/snow-camp.jpg" alt="Snow camp">
        <figcaption>Camp in the Himalayas</figcaption>
      </figure>
      <figure>
        <img src="/uploads/people/roma/lioness.jpg" alt="Lioness">
        <figcaption>Lioness on safari</figcaption>
      </figure>
    </div>
  `,
    ),
  );
}

export function personPage(res, person) {
  sendHtml(res, 200, layout(person.name, `
    <div class="profile">
      <img class="avatar" src="${person.avatar}" alt="${person.name}">
      <div>
        <h1>${person.name}</h1>
        <p>${person.bio}</p>
      </div>
    </div>
  `));
}

export function notFoundPage(res) {
  sendHtml(
    res,
    404,
    layout(
      "Error",
      `
    <h1 style="color: red">Page not found</h1>`,
    ),
  );
}
