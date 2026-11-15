import {
  getAll,
  getById,
  getByCategory,
} from "../repositories/coffeeRepository.js";
import { coffeeView } from "../views/coffee.js";
import { coffeeDetailView } from "../views/coffeeDetail.js";
import {
  getCoffeeWithSpecialOffer,
  getCoffeeOnlyWithSpecialOffer,
  getCoffeeWithOverTenPercent
} from "../services/coffeeSpecialOffer.js";
import { setCookie, getCookie } from "../utils/cookie.js";
import { saveSession } from "../utils/session.js";

export async function getCoffee(req, res) {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const category = url.searchParams.get("category");
  // 2. Get coffees: filtered or all
  let coffee;
  if (category) {
    coffee = await getByCategory(category);
  } else {
    coffee = await getAll();
  }

  // we create new array with special
  // we can comment this out and disable discount and nothing will break
  // on the website becaus in view we check if property exists.
  //coffee = getCoffeeWithSpecialOffer(coffee);

  const specialOffer = url.searchParams.get("special_offer");
  if (specialOffer) {
    // if in URL we passed: special_offer
    coffee = getCoffeeOnlyWithSpecialOffer(coffee);
  } else {
    // by default
    coffee = getCoffeeWithSpecialOffer(coffee);
  }

  coffee = getCoffeeWithOverTenPercent(coffee);

  // Visit counter: cookie is a string ("3") or null on the first visit
  const visits = Number(getCookie(req, "coffee_visits") || 0) + 1;

  // Time of the previous visit (null on the first visit)
  const lastVisit = getCookie(req, "coffee_last_visit");

  // Save the new values for next time
  setCookie(res, "coffee_visits", visits);
  setCookie(res, "coffee_last_visit", new Date().toLocaleString());

  // Session counter: only for logged-in users, counts since login
  let sessionInfo = null;
  if (req.session) {
    const previousVisit = req.session.coffee_last_visit;

    req.session.coffee_visits += 1;
    req.session.coffee_last_visit = new Date().toLocaleString();
    await saveSession(req);

    sessionInfo = {
      coffeeVisits: req.session.coffee_visits,
      lastVisit: previousVisit,
      totalVisits: req.session.total_visits,
    };
  }

  // const coffee = await getAll();

  //   res.statusCode = 200;
  //   res.setHeader("Content-Type", "application/json; charset=utf-8");
  //   // always convert to string
  //   res.end(JSON.stringify(coffee));

  res.statusCode = 200;
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.end(coffeeView(coffee, visits, lastVisit, req.user, sessionInfo));
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
  res.end(coffeeDetailView(coffee, req.user));
}
