// "Barrel" file: the public entry point of the math folder.
// Other parts of the app import from "./math/index.js" and don't need
// to know how the folder is organised inside.

// Re-export everything named from a file.
export * from "./operations.js";

// Re-export only some names.
export { calculate, calculateAll } from "./calculator.js";

// Re-export a default export as a named export.
export { default as formatNumber } from "./format.js";
