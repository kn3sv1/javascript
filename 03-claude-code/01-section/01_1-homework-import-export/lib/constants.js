// App-wide constants.
// Each one is a NAMED export, so other files import exactly what they need:
//   import { PORT, OPERATIONS } from "./lib/constants.js";

export const PORT = 3000;

export const APP_NAME = "Node Calculator";

// How many results we keep in database/history.json
export const HISTORY_LIMIT = 20;

// Fake "slow work" delay in milliseconds, used to show async/await.
export const CALCULATION_DELAY_MS = 300;

// Every operation the calculator knows about.
// The key is what goes into the URL: /calculate?a=2&b=3&op=add
export const OPERATIONS = {
  add: { symbol: "+", label: "Add" },
  subtract: { symbol: "−", label: "Subtract" },
  multiply: { symbol: "×", label: "Multiply" },
  divide: { symbol: "÷", label: "Divide" },
  power: { symbol: "^", label: "Power" },
  modulo: { symbol: "%", label: "Modulo" },
};
