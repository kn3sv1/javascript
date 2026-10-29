import { angieView } from "../views/angie.js";

export function getAngieInfo(req, res) {
  //   res.end('<p style="color: red">Angie</p>');

  const data = { name: "Angie", color: "red" };

  res.statusCode = 200;
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.end(angieView(data));
}
