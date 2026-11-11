export function layout({ title = "My App", content = "" }) {
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
    </style>
    <script src="/js/app.js" defer></script>
  </head>
  <body>
    <header>
      <nav>
        <a href="/users">Users</a>
        <a href="/products">Products</a>
        <a href="/angie">Angie</a>
        <a href="/roma">Roma</a>
        <a href="/coffee">Coffee</a>
        <a href="/greek-food">Greek Food</a>
      </nav>
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
