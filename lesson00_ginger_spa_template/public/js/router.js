const app = document.getElementById("app");

function render(path) {

  switch(path) {

    case "/":
      app.innerHTML = "<h1>Home Page</h1>";
      break;

    case "/about":
      app.innerHTML = "<h1>About Page</h1>";
      break;

    case "/products":
      app.innerHTML = "<h1>Products Page</h1>";
      break;

    default:
      app.innerHTML = "<h1>404 Not Found</h1>";
  }
}

function navigate(url) {

  // change browser URL
  history.pushState({}, "", url);

  // render correct page
  render(url);
}

document.addEventListener("click", e => {

  if (e.target.matches("[data-link]")) {

    e.preventDefault();

    navigate(e.target.href.replace(location.origin, ""));
  }
});

window.addEventListener("popstate", () => {
  render(location.pathname);
});

render(location.pathname);