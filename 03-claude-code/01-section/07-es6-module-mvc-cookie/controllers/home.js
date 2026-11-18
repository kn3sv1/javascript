import { homeView } from "../views/home.js";

export function getHome(req, res) {
  res.statusCode = 200;
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.end(homeView(req.user));
}
