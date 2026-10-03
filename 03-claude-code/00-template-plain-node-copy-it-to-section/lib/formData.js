const querystring = require("querystring");

function getRequestBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";

    req.on("data", (chunk) => {
      body += chunk.toString();
    });

    req.on("end", () => {
      resolve(body);
    });

    req.on("error", (err) => {
      reject(err);
    });
  });
}

async function getFormData(req, res) {
  const body = await getRequestBody(req);
  const formData = querystring.parse(body);

  return formData;
}

module.exports = {
  getFormData,
};
