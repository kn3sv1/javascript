function homePage(res) {
  res.writeHead(200, { "Content-Type": "text/html" });
  res.end("Home Page");
}

function angiePage(res) {
  res.writeHead(200, { "Content-Type": "text/html" });
  res.end("Angie's Page");
}

function showFormPage(res) {
  res.writeHead(200, { "Content-Type": "text/html" });
  res.end(`
      <form method="POST" action="/submit">
        <input name="name" />
        <input name="message" />
        <button type="submit">Send</button>
      </form>
      `);
}

module.exports = {
  homePage,
  angiePage,
  showFormPage,
};
