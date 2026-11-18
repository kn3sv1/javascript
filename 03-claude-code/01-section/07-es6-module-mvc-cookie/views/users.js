import { layout } from "./layout.js";

export function usersView() {
  const content = `  
  <link rel="stylesheet" href="/css/style.css">
  <h1>Users Page</h1>
  `;

  return layout({ title: "Users page", content });
}
