import { layout } from "./layout.js";

export function angieView({ name, color }) {
  const content = `
  <p style="color: ${color}">${name}</p>
  
  <link rel="stylesheet" href="/css/style.css">
  <script src="/js/app.js" defer></script>
  <img src="/images/logo.png" alt="Logo">
  `;

  return layout({ title: name, content });
}
