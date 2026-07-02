const API_URL = import.meta.env.VITE_API_URL;
const isTest = import.meta.env.MODE === "test";
const API = isTest ? API_URL : "";

export const CatAjax = {
  async loadCats() {
    // we use 2 times await because we wait for response
    // from server then we wait for conversion of json to javascript/objects.
    console.log("URL for Cats:" + `${API}/api/cats`);
    return await (await fetch(`${API}/api/cats`)).json();
  },
};
