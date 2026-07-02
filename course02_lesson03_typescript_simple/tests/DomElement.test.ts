import { describe, it, expect, beforeEach } from "vitest";
import { DomElement } from "../src/DomElement";

describe("DomElement.sayHello", () => {
  beforeEach(() => {
    document.body.innerHTML = `<div id="app"></div>`;
  });

  it("should set innerHTML to Hello TypeScript!", () => {
    DomElement.sayHello();

    const element = document.getElementById("app");

    expect(element?.innerHTML).toBe("Hello TypeScript!");
  });
});
