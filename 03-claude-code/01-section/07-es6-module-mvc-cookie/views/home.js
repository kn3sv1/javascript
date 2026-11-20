import { layout } from "./layout.js";

export function homeView(user) {
  const content = `  
  <link rel="stylesheet" href="/css/style.css">
  <script src="/js/home.js" defer></script>
  <h1>Home Page</h1>
  <div id="last-coffee">Loading...</div></br></br>
  <div id="main-dishes"></div>
  <div id="cars"></div>
  `;

  return layout({ title: "Home page", content, user });
}
