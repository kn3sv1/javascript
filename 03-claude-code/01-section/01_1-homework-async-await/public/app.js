// Browser side: fetch() with async/await instead of .then().
//
//   // with .then()
//   fetch("/api/messages")
//     .then((response) => response.json())
//     .then((messages) => show(messages))
//     .catch((err) => show(err.message));

const output = document.getElementById("output");

async function getJson(url) {
  const response = await fetch(url);

  // PITFALL: fetch() only rejects on NETWORK errors (server down, no internet).
  // A 404 or 500 is still a "successful" fetch - you must check response.ok yourself,
  // otherwise response.json() fails later with a confusing "Unexpected token <" error.
  if (!response.ok) {
    throw new Error(`HTTP ${response.status} for ${url}`);
  }

  // PITFALL: response.json() ALSO returns a promise - it needs its own await.
  return await response.json();
}

async function load(url) {
  output.textContent = "Loading...";
  try {
    const messages = await getJson(url);
    output.textContent = JSON.stringify(messages, null, 2);
  } catch (err) {
    output.textContent = `Error: ${err.message}`;
  }
}

// PITFALL: an event listener doesn't await the async function either.
// That's why load() catches its own errors - otherwise they'd end up as
// "Uncaught (in promise)" in the console and the user would see nothing.
document.getElementById("load").addEventListener("click", () => load("/api/messages"));
document.getElementById("load-404").addEventListener("click", () => load("/api/does-not-exist"));
