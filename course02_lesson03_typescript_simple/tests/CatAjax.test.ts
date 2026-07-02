import { describe, it, expect } from "vitest";
import { CatAjax } from "../src/CatAjax";

describe("CatsAjax", () => {
  it("if we can get cats", async () => {
    const response = await CatAjax.loadCats();
    //console.log(response);

    expect(response.length).toBe(4);
  });
});
