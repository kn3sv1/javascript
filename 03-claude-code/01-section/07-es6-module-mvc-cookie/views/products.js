import { layout } from "./layout.js";

export function productsView() {
  const content = `  
  <link rel="stylesheet" href="/css/style.css">
  <script src="/js/app.js" defer></script>
  <h1>Products Page</h1>
  `;

  return layout({ title: "Products page", content });
}
