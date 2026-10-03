// Browser side: the same mistake happens in fetch() calls, not only in HTML links.

const input = document.getElementById("value");
const output = document.getElementById("output");

async function send(encode) {
  const value = input.value;

  // ❌ fetch(`/api/echo?q=${value}&page=2`)
  // ✅ fetch(`/api/echo?q=${encodeURIComponent(value)}&page=2`)
  const url = `/api/echo?q=${encode ? encodeURIComponent(value) : value}&page=2`;

  try {
    const response = await fetch(url);
    const echo = await response.json();
    const ok = echo.q === value;

    output.textContent = [
      `you typed       -> ${JSON.stringify(value)}`,
      `fetch(url)      -> ${url}`,
      `server got q    -> ${JSON.stringify(echo.q)}   ${ok ? "✅ same" : "❌ different!"}`,
      `all params      -> ${JSON.stringify(echo.params)}`,
      "",
      `encodeURI(value)          -> ${encodeURI(value)}`,
      `encodeURIComponent(value) -> ${encodeURIComponent(value)}`,
    ].join("\n");
  } catch (err) {
    // e.g. a lone surrogate makes encodeURIComponent throw URIError
    output.textContent = `Error: ${err.message}`;
  }
}

document.getElementById("send-raw").addEventListener("click", () => send(false));
document.getElementById("send-encoded").addEventListener("click", () => send(true));
