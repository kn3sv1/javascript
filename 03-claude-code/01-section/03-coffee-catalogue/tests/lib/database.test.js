
import test  from "node:test";
import assert from "node:assert/strict"
import fs from "node:fs/promises";
import path from "node:path";

// we set process/global environment variable for tests.
// always change DATA_DIR for tests otherwise you will destroy your real files.
process.env.DATA_DIR = path.resolve('test-data');
// and only now dynamically loads this database.js file. If you load before:
// process.env.DATA_DIR = path.resolve('test-data'); it will not have any effect.
const { writeJson, readJson } = await import("../../lib/database.js");

test('should write and read JSON in test-data', async (t) => {
  const filename = 'test-output.json';
//  const filePath = path.join(process.env.DATA_DIR, filename);

//   t.after(async () => {
//     await fs.rm(filePath, { force: true });
//   });

  const expected = [
    {
    id: 1,
    name: 'Iced Latte',
    isPopular: true,
    ingredients: [
      "ice", "milk", "espresso"
    ],
    photo: "/images/coffee/ice-latte.png"
  },
      {
    id: 2,
    name: 'Iced Americano',
    isPopular: true,
    ingredients: [
      "ice", "cold water", "espresso"
    ],
    photo: "/images/coffee/ice-americano.png"
  }
];

  await writeJson(filename, expected);

  const actual = await readJson(filename);

  assert.deepStrictEqual(actual, expected);
});
