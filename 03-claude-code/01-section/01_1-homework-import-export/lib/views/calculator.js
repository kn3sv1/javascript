import { escapeHtml, layout } from "./layout.js";
import { OPERATIONS } from "../constants.js";
// Import from the barrel file, and rename on import with "as".
import { formatNumber as fmt } from "../math/index.js";

// "2 + 3 = 5"
function expression({ a, b, op, result }) {
  return `${fmt(a)} ${OPERATIONS[op].symbol} ${fmt(b)} = <strong>${fmt(result)}</strong>`;
}

function calculatorForm({ a = "", b = "", op = "add" } = {}) {
  const options = Object.entries(OPERATIONS)
    .map(
      ([key, { symbol, label }]) =>
        `<option value="${key}" ${key === op ? "selected" : ""}>${symbol} ${label}</option>`,
    )
    .join("");

  // The form has two buttons. Each one sends the form to a different URL.
  return `
    <form method="GET" action="/calculate">
      <label>First number
        <input type="number" step="any" name="a" value="${escapeHtml(a)}" required>
      </label>
      <label>Operation
        <select name="op">${options}</select>
      </label>
      <label>Second number
        <input type="number" step="any" name="b" value="${escapeHtml(b)}" required>
      </label>
      <div class="form-actions">
        <button type="submit">Calculate</button>
        <button type="submit" class="secondary" formaction="/calculate-all">All operations</button>
      </div>
    </form>`;
}

export function homeView() {
  return layout({
    title: "Calculator",
    body: `<h1>Calculator</h1>${calculatorForm()}`,
  });
}

export function resultView(calculation) {
  return layout({
    title: "Result",
    body: `
      <h1>Result</h1>
      <p class="result">${expression(calculation)}</p>
      ${calculatorForm(calculation)}`,
  });
}

// Table of results from calculateAll().
export function allResultsView(a, b, results) {
  const rows = results
    .map(
      (item) => `
      <tr>
        <td>${OPERATIONS[item.op].label}</td>
        <td>${item.error ? `<span class="error">${escapeHtml(item.error)}</span>` : expression(item)}</td>
      </tr>`,
    )
    .join("");

  return layout({
    title: "All operations",
    body: `
      <h1>All operations for ${fmt(a)} and ${fmt(b)}</h1>
      <table>
        <thead><tr><th>Operation</th><th>Result</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
      <p><a class="button" href="/">Back</a></p>`,
  });
}

export function historyView(history) {
  const rows = history
    .map(
      (item) => `
      <tr>
        <td>${expression(item)}</td>
        <td>${new Date(item.createdAt).toLocaleString()}</td>
      </tr>`,
    )
    .join("");

  const table = rows
    ? `<table>
        <thead><tr><th>Calculation</th><th>Time</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
      <form method="POST" action="/history/clear" class="inline-form">
        <button type="submit" class="danger">Clear history</button>
      </form>`
    : "<p>No calculations yet.</p>";

  return layout({ title: "History", body: `<h1>History</h1>${table}` });
}

export function errorView(status, message) {
  return layout({
    title: "Error",
    body: `
      <h1>Error ${status}</h1>
      <p class="error">${escapeHtml(message)}</p>
      <p><a class="button" href="/">Back to calculator</a></p>`,
  });
}
