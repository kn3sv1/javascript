import { getAll, getById } from "../repositories/coffeeRepository.js";
import { coffeeView } from "../views/coffee.js";
import { coffeeDetailView } from "../views/coffeeDetail.js";

export async function getCoffee(req, res) {
  const coffee = await getAll();

  //   res.statusCode = 200;
  //   res.setHeader("Content-Type", "application/json; charset=utf-8");
  //   // always convert to string
  //   res.end(JSON.stringify(coffee));

  res.statusCode = 200;
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.end(coffeeView(coffee));
}

export async function getCoffeeDetail(req, res) {
  // http://localhost:3000/coffee/1
  const url = new URL(req.url, `http://${req.headers.host}`);
  const routeParts = url.pathname.split("/");
  const id = Number(routeParts[2]);
  //console.log(routeParts, id);
  const coffee = await getById(id);

  if (!coffee) {
    res.statusCode = 404;
    // homework make your own not found template.
    return res.end("Coffee not found");
  }

  res.statusCode = 200;
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.end(coffeeDetailView(coffee));
}
