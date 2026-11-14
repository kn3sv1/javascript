// Cookies live until the end of 2030
const EXPIRES = new Date("2030-12-31T23:59:59Z").toUTCString();

// Save a cookie in the browser: setCookie(res, "last_coffee", 5)
export function setCookie(res, key, value) {
  const cookie = `${key}=${encodeURIComponent(value)}; Path=/; Expires=${EXPIRES}`;

  // Keep cookies that were already set in this response,
  // otherwise setHeader would replace them
  const existing = res.getHeader("Set-Cookie") || [];
  res.setHeader("Set-Cookie", [...existing, cookie]);
}

// Read one cookie sent by the browser: getCookie(req, "last_coffee") -> "5"
// Returns null if the cookie doesn't exist
export function getCookie(req, key) {
  const header = req.headers.cookie; // "last_coffee=5; theme=dark"
  if (!header) return null;

  for (const pair of header.split("; ")) {
    const [name, value] = pair.split("=");
    if (name === key) {
      return decodeURIComponent(value);
    }
  }

  return null;
}
