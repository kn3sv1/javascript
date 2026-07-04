import { Cat } from "./Types";

const API_URL = import.meta.env.VITE_API_URL;
const isTest = import.meta.env.MODE === "test";
// for Node.js test it will be value from file .env.test
// from browser if you execute it will be empty.
const API = isTest ? API_URL : "";

console.log("Hello from Agia Fyla cats!");
console.log(`API_URL: ${API_URL}`);

export const CatAjax = {
  async loadCats(): Promise<Cat[]> {
    // we use 2 times await because we wait for response
    // from server then we wait for conversion of json to javascript/objects.
    console.log("URL for Cats:" + `${API}/api/cats`);
    const resources = await fetch(`${API}/api/cats`);
    return await resources.json();
  },
};
