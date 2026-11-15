import { accounts } from "../data/accounts.js";
import { loginView } from "../views/login.js";
import { setCookie, deleteCookie } from "../utils/cookie.js";
import { readForm } from "../utils/form.js";

// GET /login - show the form
export function getLogin(req, res) {
  res.statusCode = 200;
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.end(loginView({ user: req.user }));
}

// POST /login - check login and password
export async function postLogin(req, res) {
  const { username, password } = await readForm(req);

  // Find the account where both login and password match
  const account = accounts.find(
    (item) => item.username === username && item.password === password,
  );

  if (!account) {
    res.statusCode = 401;
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    return res.end(loginView({ error: "Wrong login or password" }));
  }

  // Remember the user and send them to the coffee page
  setCookie(res, "username", account.name);
  res.statusCode = 302;
  res.setHeader("Location", "/coffee");
  res.end();
}

// GET /logout - forget the user
export function getLogout(req, res) {
  deleteCookie(res, "username");
  res.statusCode = 302;
  res.setHeader("Location", "/login");
  res.end();
}
