export function layout({ title = "My App", content = "", user = null }) {
  // Greeting for a logged-in user, or a link to the login page
  let userMenu = `<a href="/login">Login</a>`;
  if (user) {
    userMenu = `Hello, <b>${user}</b>! <a href="/logout">Logout</a>`;
  }

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${title}</title>
    <style>
      body { font-family: sans-serif; margin: 0; }
      header, footer { background: #333; color: #fff; padding: 1rem; }
      header a { color: #fff; margin-right: 1rem; text-decoration: none; }
      main { padding: 1rem; }
      header { display: flex; justify-content: space-between; align-items: center; }
      .user-menu { display: flex; align-items: center; gap: 1rem; }
      .user-menu a { margin-right: 0; text-decoration: underline; }

      #theme-btn {
        background: none;
        color: #fff;
        border: 1px solid #fff;
        border-radius: 20px;
        padding: 4px 12px;
        cursor: pointer;
      }

      /* ===== Dark mode ===== */
      body.dark {
        background: #1e1e1e;
        color: #eee;
      }
      body.dark a { color: #c4a688; }
      body.dark .card { border-color: #555; }

      /* Keep text dark on the yellow and green highlighted cards */
      body.dark .special-offer,
      body.dark .discount_percent_over_10 { color: #222; }

    </style>
    <script src="/js/app.js" defer></script>
  </head>
  <body>
    <header>
      <nav>
        <a href="/">Home page</a>
        <a href="/users">Users</a>
        <a href="/products">Products</a>
        <a href="/angie">Angie</a>
        <a href="/roma">Roma</a>
        <a href="/coffee">Coffee</a>
        <a href="/greek-food">Greek Food</a>
      </nav>
      <div class="user-menu">
        <span>${userMenu}</span>
        <button id="theme-btn">🌙 Dark mode</button>
      </div>
    </header>

    <main>
      ${content}
    </main>

    <footer>
      <small>
        &copy; ${new Date().getFullYear()} My App | 
        Current time: <span id="clock"></span>
      </small>
    </footer>
  </body>
</html>`;
}
