const fs = require("fs");

const DB_PATH = "cats.json";

function parseData(body) {
  const params = new URLSearchParams(body);

  const cat = {
    name: params.get("name"),
    age: Number(params.get("age")),
    color: params.get("color"),
  };

  return cat;
}

function readData() {
  return new Promise((resolve, reject) => {
    fs.readFile(DB_PATH, "utf8", (err, data) => {
      if (err) {
        reject(err);
        return;
      }

      try {
        const database = JSON.parse(data);
        resolve(database);
      } catch (err) {
        reject(err);
      }
    });
  });
}

function saveData(database) {
  return new Promise((resolve, reject) => {
    fs.writeFile(DB_PATH, JSON.stringify(database, null, 2), "utf8", (err) => {
      if (err) {
        reject(err);
        return;
      }

      resolve();
    });
  });
}

module.exports = {
  parseData,
  readData,
  saveData,
};
