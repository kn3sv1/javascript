import fs from "node:fs/promises";
import path from "node:path";

const COFFEE_PATH = path.join(import.meta.dirname, "..", "/data/coffee.json");

async function readData() {
  try {
    const content = await fs.readFile(COFFEE_PATH, "utf-8");
    return JSON.parse(content);
  } catch (err) {
    if (err.code === "ENOENT") {
      return [];
    }
    throw err;
  }
}

export async function getAll() {
  const coffee = await readData();

  return coffee;
}


// Returns one coffee object, or null if not found
export async function getById(id) {
  const coffee = await readData();

  // id from the URL is a string ("3"), but in JSON it is a number (3)
  const item = coffee.find((item) => item.id === Number(id));

  return item || null;
}

// Returns an array of coffees in this category (empty array if none)
export async function getByCategory(category) {
  const coffee = await readData();

  return coffee.filter((item) => item.category === category);
}

// Returns coffees with a discount of at least `percent`
// Without an argument it returns all coffees that have any discount
export async function getAllWithDiscount(percent = 1) {
  const coffee = await readData();

  return coffee.filter((item) => item.discount_percent >= percent);
}
