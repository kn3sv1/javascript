import { layout } from "./layout.js";

export function homeView() {
  const content = `  
  <link rel="stylesheet" href="/css/style.css">
  <script src="/js/app.js" defer></script>
  <h1>Home Page</h1>
  `;

  return layout({ title: "Home page", content });
}
