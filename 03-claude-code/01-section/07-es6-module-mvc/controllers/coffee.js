import { getAll } from "../repositories/coffeeRepository.js";
import { coffeeView } from "../views/coffee.js";

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
