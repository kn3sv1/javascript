// A module with ONE main thing can use a DEFAULT export.
// It is imported without curly braces, and the importer picks the name:
//   import formatNumber from "./format.js";

const MAX_DECIMALS = 6;

export default function formatNumber(value) {
  if (!Number.isFinite(value)) {
    return String(value);
  }
  // 0.1 + 0.2 = 0.30000000000000004 -> "0.3"
  return String(Number(value.toFixed(MAX_DECIMALS)));
}
