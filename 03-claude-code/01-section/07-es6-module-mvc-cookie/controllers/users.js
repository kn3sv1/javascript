import { usersView } from "../views/users.js";

export function getUsers(req, res) {
  res.statusCode = 200;
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.end(usersView());
}

export function getUser(req, res) {
  res.end("Single user");
}
