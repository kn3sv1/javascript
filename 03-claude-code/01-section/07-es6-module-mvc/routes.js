import { getUser, getUsers } from "./controllers/users.js";
import { getProducts } from "./controllers/products.js";
import { getAngieInfo } from "./controllers/angie.js";

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
];
