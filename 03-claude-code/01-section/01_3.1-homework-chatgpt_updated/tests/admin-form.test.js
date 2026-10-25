// Shows how the POST /admin/people code in index.js (lines 84-113)
// turns form data into a person with a table - using made-up data,
// without starting the server or touching data/people.json.
//
// Run it:  node --test tests/
// or just: node tests/admin-form.test.js

import { test } from "node:test";
import assert from "node:assert/strict";
import querystring from "node:querystring";

// ---------------------------------------------------------------
// COPY of the logic from index.js lines 84-113.
// index.js starts the server when it is imported, so we can't
// import the code from there - we copy it into a function instead.
// Instead of sending an error page, it returns { error }.
// ---------------------------------------------------------------
function buildPerson(formData, people) {
  const name = (formData.name || "").trim();
  const slug = (formData.slug || "").trim().toLowerCase();
  const bio = (formData.bio || "").trim();
  const avatar =
    (formData.avatar || "").trim() || "/uploads/people/roma/avatar.svg";

  if (!name || !slug || !bio) {
    return { error: "Name, slug and bio are required." };
  }
  if (!/^[a-z0-9-]+$/.test(slug)) {
    return { error: "Slug can only use a-z, 0-9 and -" };
  }
  if (people.some((p) => p.slug === slug)) {
    return { error: `Slug "${slug}" is already taken.` };
  }

  // always get an array, even if the form sent only one value (a string)
  //const toArray = (value) => [].concat(value || []).map((v) => v.trim());

  function toArray(value) {
    // Step 1: If value is empty, use an empty array
    let safeValue = value || [];

    // Step 2: Convert the value into an array
    let valuesArray = [].concat(safeValue);

    // Step 3: Remove spaces from the beginning and end of each item
    let trimmedArray = valuesArray.map(function (v) {
      return v.trim();
    });

    // Step 4: Return the final array
    return trimmedArray;
  }

  const tableTitle = (formData.tableTitle || "").trim();
  const columns = toArray(formData.column);

  // const rows = [0, 1, 2]
  //   .map((r) => toArray(formData[`row${r}`]))
  //   .filter((row) => row.some((cell) => cell !== "")); // skip empty rows

  const rowIndexes = [0, 1, 2];
  const mappedRows = rowIndexes.map((r) => toArray(formData[`row${r}`]));
  const rows = mappedRows.filter((row) => row.some((cell) => cell !== ""));

  let table;

  if (tableTitle) {
    if (columns.some((column) => column === "")) {
      return { error: "Please fill in all 4 column names." };
    }
    if (rows.length === 0) {
      return { error: "Please fill in at least one row." };
    }
    table = { title: tableTitle, columns, rows };
  }

  const newPerson = { slug, name, bio, avatar };
  if (table) {
    newPerson.table = table;
  }

  return { person: newPerson };
}

// ---------------------------------------------------------------
// Emulated data
// ---------------------------------------------------------------

// people that are "already in people.json"
const existingPeople = [
  { slug: "angie", name: "Angie", bio: "Loves nature.", avatar: "/a.svg" },
  { slug: "roma", name: "Roma", bio: "Learning JS.", avatar: "/r.svg" },
];

// This is what the BROWSER really sends when you submit the admin form:
// one long string, "name=value" pairs joined with "&".
// Spaces become "+", special characters become %XX.
// Inputs with the same name (column, row0, ...) are repeated.
function makeBody(fields) {
  // fields is a list of [name, value] pairs, in the same order as in the form
  return fields
    .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
    .join("&");
}

const lenaBody = makeBody([
  ["name", "Lena"],
  ["slug", "Lena"], // capital L - the code lowercases it
  ["bio", "  Loves hiking  "], // extra spaces - the code trims them
  ["avatar", ""], // empty - the code uses the default avatar
  ["tableTitle", "My trips"],
  ["column", "Year"],
  ["column", "Place"],
  ["column", "Days"],
  ["column", "Rating"],
  ["row0", "2023"],
  ["row0", "Skye "],
  ["row0", "5"],
  ["row0", "⭐⭐⭐⭐"],
  ["row1", "2024"],
  ["row1", "Nepal"],
  ["row1", "14"],
  ["row1", "⭐⭐⭐⭐⭐"],
  ["row2", ""], // row 3 left empty in the form
  ["row2", ""],
  ["row2", ""],
  ["row2", ""],
]);

// ---------------------------------------------------------------
// Step by step demo - prints what happens to the data
// ---------------------------------------------------------------
test("demo: from request body to saved person", () => {
  console.log("\n1. Raw request body (what getRequestBody() receives):");
  console.log(lenaBody);

  // this is what getFormData() in lib/formData.js does
  const formData = querystring.parse(lenaBody);
  console.log("\n2. formData after querystring.parse():");
  console.log(formData);

  const result = buildPerson(formData, existingPeople);
  console.log("\n3. newPerson that would be pushed into people.json:");
  console.log(JSON.stringify(result.person, null, 2));

  assert.equal(result.error, undefined);
});

// ---------------------------------------------------------------
// Tests - each one checks one rule of the code
// ---------------------------------------------------------------
test("toArray: querystring gives arrays for repeated names, a string for one", () => {
  const many = querystring.parse("column=Year&column=Place");
  const one = querystring.parse("column=Year");

  assert.deepEqual(many.column, ["Year", "Place"]); // array
  assert.equal(one.column, "Year"); // just a string!

  const toArray = (value) => [].concat(value || []).map((v) => v.trim());
  assert.deepEqual(toArray(many.column), ["Year", "Place"]);
  assert.deepEqual(toArray(one.column), ["Year"]); // now an array too
  assert.deepEqual(toArray(undefined), []); // field not sent at all
});

test("full person: trims, lowercases, default avatar, skips empty row", () => {
  const formData = querystring.parse(lenaBody);
  const { person } = buildPerson(formData, existingPeople);

  assert.deepEqual(person, {
    slug: "lena",
    name: "Lena",
    bio: "Loves hiking",
    avatar: "/uploads/people/roma/avatar.svg",
    table: {
      title: "My trips",
      columns: ["Year", "Place", "Days", "Rating"],
      rows: [
        ["2023", "Skye", "5", "⭐⭐⭐⭐"],
        ["2024", "Nepal", "14", "⭐⭐⭐⭐⭐"],
        // row2 is gone - all its cells were empty
      ],
    },
  });
});

test("no table title → person has no table key (like Max)", () => {
  const formData = querystring.parse(
    makeBody([
      ["name", "Max"],
      ["slug", "max"],
      ["bio", "No table"],
      ["tableTitle", ""],
      ["column", "Year"], // ignored, because there is no title
    ]),
  );
  const { person } = buildPerson(formData, existingPeople);

  assert.equal(person.table, undefined);
  assert.equal("table" in person, false);
});

test("missing name → error", () => {
  const formData = querystring.parse("slug=bob&bio=Hi");
  const result = buildPerson(formData, existingPeople);

  assert.equal(result.error, "Name, slug and bio are required.");
});

test("bad slug → error", () => {
  const formData = querystring.parse(
    makeBody([
      ["name", "Bob"],
      ["slug", "bob smith!"],
      ["bio", "Hi"],
    ]),
  );
  const result = buildPerson(formData, existingPeople);

  assert.equal(result.error, "Slug can only use a-z, 0-9 and -");
});

test("slug already taken → error", () => {
  const formData = querystring.parse("name=Angie2&slug=angie&bio=Hi");
  const result = buildPerson(formData, existingPeople);

  assert.equal(result.error, 'Slug "angie" is already taken.');
});

test("table title but an empty column name → error", () => {
  const formData = querystring.parse(
    makeBody([
      ["name", "Ann"],
      ["slug", "ann"],
      ["bio", "Hi"],
      ["tableTitle", "My list"],
      ["column", "Year"],
      ["column", ""], // empty!
      ["column", "Days"],
      ["column", "Rating"],
      ["row0", "2023"],
    ]),
  );
  const result = buildPerson(formData, existingPeople);

  assert.equal(result.error, "Please fill in all 4 column names.");
});

test("table title but all rows empty → error", () => {
  const formData = querystring.parse(
    makeBody([
      ["name", "Ann"],
      ["slug", "ann"],
      ["bio", "Hi"],
      ["tableTitle", "My list"],
      ["column", "A"],
      ["column", "B"],
      ["column", "C"],
      ["column", "D"],
      ["row0", ""],
      ["row0", "   "], // only spaces - trim() makes it ""
    ]),
  );
  const result = buildPerson(formData, existingPeople);

  assert.equal(result.error, "Please fill in at least one row.");
});
