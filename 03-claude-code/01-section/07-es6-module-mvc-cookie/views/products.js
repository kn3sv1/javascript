import { layout } from "./layout.js";

export function productsView() {
  const content = `  
  <link rel="stylesheet" href="/css/style.css">
  <h1>Products Page</h1>
  `;

  return layout({ title: "Products page", content });
}
