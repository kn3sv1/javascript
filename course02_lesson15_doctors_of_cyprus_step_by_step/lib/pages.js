
function menu() {
  return `
  <a href="/">Home page</a></br>
  <a href="/comments">Comments</a></br>
  <a href="/angie">Angie's page</a></br>
  <a href="/form">Form page</a></br>
  <a href="/show-upload">upload file</a></br></br>
  `;
}


function homePage(res) {
  res.writeHead(200, { "Content-Type": "text/html" });
  res.end(`${menu()} Home Page`);
}

function angiePage(res) {
  res.writeHead(200, { "Content-Type": "text/html" });
  res.end(`${menu()} Angie's Page`);
}

function showFormPage(res) {
  res.writeHead(200, { "Content-Type": "text/html" });
  res.end(`
      ${menu()}
      <form method="POST" action="/submit">
        <input name="name" /></br></br>
        <input name="message" /></br></br>
        <button type="submit">Send</button>
      </form>
      `);
}

function showUploadFilePage(res) {
  res.writeHead(200, { "Content-Type": "text/html" });
  res.end(`
      ${menu()}
      <form action="/upload" method="POST" enctype="multipart/form-data">
        <label for="file">Choose a file:</label><br><br>
        <input type="file" id="file" name="file"><br><br>
        <button type="submit">Upload</button>
      </form>
      `);
}

function commentsPage(res, comments) {
  res.writeHead(200, { "Content-Type": "text/html" });

  let html = "";
  for (const item of comments) {
    html = html + `<p> Name: ${item.name}, Messege: ${item.message}</p>`;
  }

  res.end(`${menu()} ${html}`);
}

function showErrorPage(res, err) {
  res.writeHead(400, { "Content-Type": "text/html" });
  res.end(`ErrorPage ${err}`);
}

module.exports = {
  homePage,
  angiePage,
  showFormPage,
  commentsPage,
  showUploadFilePage,
  showErrorPage,
};
