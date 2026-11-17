import { layout } from "./layout.js";

export function usersView() {
  const content = `  
  <link rel="stylesheet" href="/css/style.css">
  <script src="/js/app.js" defer></script>
  <h1>Users Page</h1>
  `;

  return layout({ title: "Users page", content });
}
