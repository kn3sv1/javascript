import { productsView } from "../views/products.js";

export function getProducts(req, res) {
  res.statusCode = 200;
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.end(productsView());
}
