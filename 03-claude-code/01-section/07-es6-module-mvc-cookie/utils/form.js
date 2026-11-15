// Read the data of a submitted HTML form (POST request)
// The browser sends it as text: "username=roma&password=1234"
// Result: { username: "roma", password: "1234" }
export function readForm(req) {
  return new Promise((resolve) => {
    let body = "";

    // The body arrives in pieces (chunks), so we collect them
    req.on("data", (chunk) => {
      body += chunk;
    });

    // All pieces received: turn the text into an object
    req.on("end", () => {
      resolve(Object.fromEntries(new URLSearchParams(body)));
    });
  });
}
