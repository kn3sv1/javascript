import fs from "node:fs/promises";
import path from "node:path";

const FOOD_PATH = path.join(import.meta.dirname, "..", "/data/greek_food.json");

async function readData() {
  try {
    const content = await fs.readFile(FOOD_PATH, "utf-8");
    return JSON.parse(content);
  } catch (err) {
    if (err.code === "ENOENT") {
      return [];
    }
    throw err;
  }
}

export async function getAll() {
  const food = await readData();

  return food;
}


// Returns one food object, or null if not found
export async function getById(id) {
  const food = await readData();

  // id from the URL is a string ("3"), but in JSON it is a number (3)
  const item = food.find((item) => item.id === Number(id));

  return item || null;
}

// Returns an array of food in this category (empty array if none)
export async function getByCategory(category) {
  const food = await readData();

  return food.filter((item) => item.category === category);
}

// Returns food with a discount of at least `percent`
// Without an argument it returns all food that have any discount
export async function getAllWithDiscount(percent = 1) {
  const food = await readData();

  return food.filter((item) => item.discount_percent >= percent);
}
