import { addRoute } from "../router.js";
import { sendHtml, redirect } from "../response.js";
import { calculate, calculateAll } from "../math/index.js";
import { getHistory, addToHistory, clearHistory } from "../database.js";
import {
  homeView,
  resultView,
  allResultsView,
  historyView,
  errorView,
} from "../views/calculator.js";

// Number("") and Number(null) are 0, so treat empty/missing values as NaN.
function toNumber(value) {
  return value === null || value.trim() === "" ? NaN : Number(value);
}

// Reads ?a=2&b=3&op=add from the URL.
function readNumbers(req) {
  const { searchParams } = new URL(req.url, "http://localhost");
  return {
    a: toNumber(searchParams.get("a")),
    b: toNumber(searchParams.get("b")),
    op: searchParams.get("op") || "add",
  };
}

// GET /
addRoute("GET", "/", async (req, res) => {
  sendHtml(res, 200, homeView());
});

// GET /calculate?a=2&b=3&op=add
addRoute("GET", "/calculate", async (req, res) => {
  const { a, b, op } = readNumbers(req);

  // try/catch works with await: if calculate() rejects
  // (e.g. divide by zero), we land in catch.
  try {
    const calculation = await calculate(a, b, op);
    await addToHistory(calculation);
    sendHtml(res, 200, resultView(calculation));
  } catch (err) {
    sendHtml(res, 400, errorView(400, err.message));
  }
});

// GET /calculate-all?a=2&b=3
addRoute("GET", "/calculate-all", async (req, res) => {
  const { a, b } = readNumbers(req);

  if (!Number.isFinite(a) || !Number.isFinite(b)) {
    sendHtml(res, 400, errorView(400, "Both values must be numbers."));
    return;
  }

  const results = await calculateAll(a, b);
  sendHtml(res, 200, allResultsView(a, b, results));
});

// GET /history
addRoute("GET", "/history", async (req, res) => {
  const history = await getHistory();
  sendHtml(res, 200, historyView(history));
});

// POST /history/clear
addRoute("POST", "/history/clear", async (req, res) => {
  await clearHistory();
  redirect(res, "/history");
});
