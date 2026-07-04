import { describe, it, expect } from "vitest";
import { CatAjax } from "../src/CatAjax";


describe("fake test", () => {
  it("show environment variable", () => {
    const API_URL = import.meta.env.VITE_API_URL;
    const isTest = import.meta.env.MODE === "test";
    // for Node.js test it will be value from file .env.test
    // from browser if you execute it will be empty.
    const API = isTest ? API_URL : "";

    console.log(`API_URL:  ${API_URL} MODE: ${import.meta.env.MODE}`);
  });
});

describe("CatAjax", () => {
  it("returns cats with all required properties", async () => {
    const cats = await CatAjax.loadCats();

    expect(cats.length).toBeGreaterThan(0);

    const cat = cats[0];

    expect(cat).toHaveProperty("id");
    expect(cat).toHaveProperty("name");
    expect(cat).toHaveProperty("age");
    expect(cat).toHaveProperty("photo");
    expect(cat).toHaveProperty("city");
  });
});

describe("CatAjax: check every cat", () => {
  it("returns cats with all required properties", async () => {
    const cats = await CatAjax.loadCats();

    for (const cat of cats) {
      expect(cat).toHaveProperty("id");
      expect(cat).toHaveProperty("name");
      expect(cat).toHaveProperty("age");
      expect(cat).toHaveProperty("photo");
      expect(cat).toHaveProperty("city");
    }
  });
});
