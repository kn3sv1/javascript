import {
  getAll,
  getById,
  getByCategory,
} from "../repositories/greekFoodRepository.js";
import { greekFoodView } from "../views/greekFood.js";
import { foodDetailView } from "../views/greekFoodDetail.js";
import {
  getFoodWithSpecialOffer,
  getFoodOnlyWithSpecialOffer,
  getFoodWithOverTenPercent
} from "../services/greekFoodSpecialOffer.js";

export async function getGreekFood(req, res) {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const category = url.searchParams.get("category");
  // 2. Get food: filtered or all
  let food;
  if (category) {
    food = await getByCategory(category);
  } else {
    food = await getAll();
  }

  const specialOffer = url.searchParams.get("special_offer");
  if (specialOffer) {
    // if in URL we passed: special_offer
    food = getFoodOnlyWithSpecialOffer(food);
  } else {
    // by default
    food = getFoodWithSpecialOffer(food);
  }

  food = getFoodWithOverTenPercent(food);

  res.statusCode = 200;
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.end(greekFoodView(food));
}

export async function getFoodDetail(req, res) {
  // http://localhost:3000/coffee/1
  const url = new URL(req.url, `http://${req.headers.host}`);
  const routeParts = url.pathname.split("/");
  const id = Number(routeParts[2]);
  //console.log(routeParts, id);
  const food = await getById(id);

  if (!food) {
    res.statusCode = 404;
    // homework make your own not found template.
    return res.end("Food not found");
  }

  res.statusCode = 200;
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.end(foodDetailView(food));
}
