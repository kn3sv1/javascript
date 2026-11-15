import { getUser, getUsers } from "./controllers/users.js";
import { getProducts } from "./controllers/products.js";
import { getAngieInfo } from "./controllers/angie.js";
import { getRomaInfo } from "./controllers/roma.js";
import { getCoffee, getCoffeeDetail } from "./controllers/coffee.js";
import { getGreekFood, getFoodDetail } from "./controllers/greekFood.js";
import { getLogin, postLogin, getLogout } from "./controllers/auth.js";

export const routes = [
  {
    method: "GET",
    path: "/users",
    handler: getUsers,
  },
  {
    method: "GET",
    path: "/users/:id",
    handler: getUser,
  },
  {
    method: "GET",
    path: "/products",
    handler: getProducts,
  },
  {
    method: "GET",
    path: "/angie",
    handler: getAngieInfo,
  },
  {
    method: "GET",
    path: "/roma",
    handler: getRomaInfo,
  },
  {
    method: "GET",
    path: "/coffee",
    handler: getCoffee,
  },
  {
    method: "GET",
    path: "/coffee/:id",
    handler: getCoffeeDetail,
  },
  {
    method: "GET",
    path: "/greek-food",
    handler: getGreekFood,
  },
  {
    method: "GET",
    path: "/greek-food/:id",
    handler: getFoodDetail,
  },
  {
    method: "GET",
    path: "/login",
    handler: getLogin,
  },
  {
    method: "POST",
    path: "/login",
    handler: postLogin,
  },
  {
    method: "GET",
    path: "/logout",
    handler: getLogout,
  },
];
