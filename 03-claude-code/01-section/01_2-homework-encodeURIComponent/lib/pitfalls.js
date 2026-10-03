// Each exported function is one route: /pitfalls/<name>.
// Every route shows the WRONG way (❌) next to the RIGHT way (✅) and prints
// what actually happened, so you can see the difference in the browser.

import http from "http";
import { sendHtml, page, escapeHtml, contentDisposition } from "./respond.js";

const BASE = "http://localhost:3000";

function report(res, title, explanation, lines) {
  sendHtml(
    res,
    200,
    page(
      title,
      `<div class="explanation">${explanation}</div>
       <pre>${escapeHtml(lines.join("\n"))}</pre>
       <p><a href="/">&larr; back to all pitfalls</a></p>`,
    ),
  );
}

// Run fn and show its result, or the error it threw.
function attempt(fn) {
  try {
    return JSON.stringify(fn());
  } catch (err) {
    return `💥 ${err.name}: ${err.message}`;
  }
}

// What the SERVER sees for a given URL (the same thing index.js does).
function whatServerSees(url) {
  const u = new URL(url, BASE);
  return {
    pathname: u.pathname,
    params: JSON.stringify([...u.searchParams]),
    // the part after # is never sent - it stays in the browser
    lostInBrowser: u.hash,
  };
}

// ===========================================================================
// 1. Building a query string by gluing strings together
// ===========================================================================
function queryString(req, res) {
  const values = ["Tom & Jerry", "C++", "a=b", "#1 fan", "100%", "Київ"];
  const lines = [];

  for (const value of values) {
    const bad = `/search?q=${value}&page=2`;
    const good = `/search?q=${encodeURIComponent(value)}&page=2`;
    const b = whatServerSees(bad);
    const g = whatServerSees(good);

    lines.push(`value: ${JSON.stringify(value)}`);
    lines.push(`  ❌ ${bad}`);
    lines.push(`     server params -> ${b.params}${b.lostInBrowser ? `   (lost: "${b.lostInBrowser}")` : ""}`);
    lines.push(`  ✅ ${good}`);
    lines.push(`     server params -> ${g.params}`);
    lines.push("");
  }

  lines.push("✅ Even better - let the platform build it:");
  lines.push("   const url = new URL('/search', location.origin);");
  lines.push("   url.searchParams.set('q', 'Tom & Jerry');");
  const u = new URL("/search", BASE);
  u.searchParams.set("q", "Tom & Jerry");
  lines.push(`   url.href -> ${u.href}   (form style: space = +)`);

  report(
    res,
    "Pitfall: gluing values into a query string",
    `<p><code>&amp;</code> starts a new parameter, <code>=</code> separates name and value,
     <code>+</code> means a space, <code>#</code> ends the URL for the server.
     A value containing any of them silently changes the meaning of the URL &ndash;
     <b>no error, just wrong data</b> (or a parameter injected by the user:
     <code>name=x&amp;role=admin</code>).</p>
     <p>Try it live: <a href="/api/echo?q=Tom &amp; Jerry&amp;page=2">/api/echo?q=Tom &amp; Jerry&amp;page=2</a>
     vs <a href="/api/echo?q=Tom%20%26%20Jerry&amp;page=2">/api/echo?q=Tom%20%26%20Jerry&amp;page=2</a></p>`,
    lines,
  );
}

// ===========================================================================
// 2. encodeURI vs encodeURIComponent
// ===========================================================================
function encodeUriVsComponent(req, res) {
  const chars = [" ", "&", "=", "?", "#", "/", "+", ":", "@", "%", "Й"];
  const lines = ["char   encodeURI   encodeURIComponent"];
  for (const c of chars) {
    lines.push(`${JSON.stringify(c).padEnd(6)} ${encodeURI(c).padEnd(11)} ${encodeURIComponent(c)}`);
  }

  const value = "Tom & Jerry";
  const full = `https://example.com/search?q=${value}`;
  lines.push("");
  lines.push("❌ encodeURI on the full URL - & is NOT encoded, q is still broken:");
  lines.push(`   ${encodeURI(full)}`);
  lines.push(`   q -> ${JSON.stringify(new URL(encodeURI(full)).searchParams.get("q"))}`);
  lines.push("");
  lines.push("❌ encodeURIComponent on the full URL - the URL itself is destroyed:");
  lines.push(`   ${encodeURIComponent(full)}`);
  lines.push(`   as href on http://localhost:3000/people -> ${new URL(encodeURIComponent(full), BASE + "/people").href}`);
  lines.push("");
  lines.push("✅ encodeURIComponent on the VALUE only:");
  const good = `https://example.com/search?q=${encodeURIComponent(value)}`;
  lines.push(`   ${good}`);
  lines.push(`   q -> ${JSON.stringify(new URL(good).searchParams.get("q"))}`);
  lines.push("");
  lines.push("❌ escape() is deprecated and is NOT UTF-8:");
  lines.push(`   escape("Й")             -> ${escape("Й")}   (servers can't read %u....)`);
  lines.push(`   encodeURIComponent("Й") -> ${encodeURIComponent("Й")}`);

  report(
    res,
    "Pitfall: encodeURI vs encodeURIComponent",
    `<p><code>encodeURI</code> is for a <b>whole URL</b>: it keeps <code>: / ? # &amp; =</code>
     because they give the URL its structure. <code>encodeURIComponent</code> is for
     <b>one piece</b> (a path segment or a query value) and encodes all of them.</p>
     <p>Rule: never encode the whole URL &ndash; encode <b>each value</b> you put into it.</p>`,
    lines,
  );
}

// ===========================================================================
// 3. Values inside a PATH segment: /people/<name>
// ===========================================================================
function pathSegment(req, res) {
  const names = ["AC/DC", "What? Why?", "#1 Fan", "100% Cotton", "../admin", ".."];
  const lines = [];

  for (const name of names) {
    const bad = `/people/${name}`;
    const good = `/people/${encodeURIComponent(name)}`;
    const b = whatServerSees(bad);
    const g = whatServerSees(good);

    lines.push(`name: ${JSON.stringify(name)}`);
    lines.push(`  ❌ ${bad.padEnd(24)} -> pathname ${b.pathname}  query ${b.params}${b.lostInBrowser ? `  lost ${b.lostInBrowser}` : ""}`);
    lines.push(`  ✅ ${good.padEnd(24)} -> pathname ${g.pathname}`);
    lines.push("");
  }

  lines.push(`⚠ encodeURIComponent("..") -> "${encodeURIComponent("..")}" - dots are NOT encoded,`);
  lines.push("  so /people/.. still jumps one level up. Encoding is not validation:");
  lines.push("  reject names like '.' and '..' (or use ids in URLs instead of names).");

  report(
    res,
    "Pitfall: values inside a path segment",
    `<p><code>/</code> creates a new segment, <code>?</code> starts the query,
     <code>#</code> cuts the rest off, <code>..</code> climbs up a folder (the browser
     and <code>new URL()</code> resolve it <b>before</b> your router runs).</p>
     <p>See it in the real app on the <a href="/people">People</a> page.</p>`,
    lines,
  );
}

// ===========================================================================
// 4. Decoding: throws, + is not a space, double encoding
// ===========================================================================
function decoding(req, res) {
  const lines = [];

  lines.push("decodeURIComponent THROWS on broken input:");
  for (const s of ["100%", "%E0%A4%A", "50%25", "%D0%9A%D0%B8%D1%97%D0%B2"]) {
    lines.push(`  decodeURIComponent(${JSON.stringify(s).padEnd(28)}) -> ${attempt(() => decodeURIComponent(s))}`);
  }
  lines.push("  ✅ wrap it in try/catch -> safeDecode() in lib/respond.js, answer 400.");
  lines.push("  (without it: /people/100% crashes the handler -> 500)");
  lines.push("");

  lines.push("encodeURIComponent can throw too - on a broken emoji (lone surrogate):");
  const broken = "😀".slice(0, 1);
  lines.push(`  encodeURIComponent("😀".slice(0, 1)) -> ${attempt(() => encodeURIComponent(broken))}`);
  lines.push(`  encodeURIComponent("😀")             -> ${attempt(() => encodeURIComponent("😀"))}`);
  lines.push("");

  lines.push("+ means space ONLY in forms / query strings - decodeURIComponent doesn't know that:");
  lines.push(`  ❌ decodeURIComponent("Tom+%26+Jerry")                -> ${attempt(() => decodeURIComponent("Tom+%26+Jerry"))}`);
  lines.push(`  ✅ new URLSearchParams("q=Tom+%26+Jerry").get("q")     -> ${JSON.stringify(new URLSearchParams("q=Tom+%26+Jerry").get("q"))}`);
  lines.push(`  ✅ and so a real + must be sent as %2B: encodeURIComponent("C++") -> ${encodeURIComponent("C++")}`);
  lines.push("");

  const once = encodeURIComponent("my cat.png");
  const twice = encodeURIComponent(once);
  lines.push("Double encoding (encoding something that is already encoded):");
  lines.push(`  once  -> ${once}`);
  lines.push(`  twice -> ${twice}     ← %25 is the encoded "%" itself`);
  lines.push(`  server decodes once -> ${decodeURIComponent(twice)}   ❌ file not found`);
  lines.push("");
  lines.push("Double DECODING is the same bug the other way round:");
  lines.push(`  file "50%25.txt" -> URL ${encodeURIComponent("50%25.txt")}`);
  lines.push(`  decode once  -> ${decodeURIComponent(encodeURIComponent("50%25.txt"))}  ✅`);
  lines.push(`  decode twice -> ${decodeURIComponent(decodeURIComponent(encodeURIComponent("50%25.txt")))}    ❌ different file`);
  lines.push("  -> searchParams.get() already decodes. Encode exactly once, decode exactly once.");

  report(
    res,
    "Pitfall: decoding",
    `<p>The server must undo the encoding &ndash; and that is where it crashes.
     Anyone can type <a href="/people/100%">a broken URL</a>,
     so <code>decodeURIComponent</code> on user input needs a <code>try/catch</code>.</p>`,
    lines,
  );
}

// ===========================================================================
// 5. HTTP headers: Location and Content-Disposition
// ===========================================================================
function headers(req, res) {
  const check = (name, value) =>
    attempt(() => {
      http.validateHeaderValue(name, value); // the same check res.setHeader() does
      return "ok";
    });

  const lines = [];
  const name = "Київ";
  lines.push(`Redirect after saving "${name}":`);
  lines.push(`  ❌ Location: /people/${name}`);
  lines.push(`     -> ${check("Location", `/people/${name}`)}`);
  lines.push(`  ✅ Location: /people/${encodeURIComponent(name)}`);
  lines.push(`     -> ${check("Location", `/people/${encodeURIComponent(name)}`)}`);
  lines.push("");

  const file = "звіт 2026.txt";
  lines.push(`Download "${file}":`);
  lines.push(`  ❌ Content-Disposition: attachment; filename="${file}"`);
  lines.push(`     -> ${check("Content-Disposition", `attachment; filename="${file}"`)}`);
  lines.push(`  ✅ Content-Disposition: ${contentDisposition(file)}`);
  lines.push(`     -> ${check("Content-Disposition", contentDisposition(file))}`);
  lines.push("");

  const evil = "x\r\nSet-Cookie: admin=1";
  lines.push(`Header injection - user sends name ${JSON.stringify(evil)}:`);
  lines.push(`  ❌ Location: /people/<raw>  -> ${check("Location", `/people/${evil}`)}`);
  lines.push("     (Node refuses CR/LF - older servers wrote a second header!)");
  lines.push(`  ✅ Location: /people/${encodeURIComponent(evil)}`);
  lines.push(`     -> ${check("Location", `/people/${encodeURIComponent(evil)}`)}`);

  report(
    res,
    "Pitfall: user values in HTTP headers",
    `<p>Headers may only contain latin1 characters and no line breaks. Node throws
     <code>ERR_INVALID_CHAR</code> &ndash; inside a request handler that is a 500 error.
     Percent-encoding turns any value into plain ASCII.</p>
     <p>Real code: <code>createPerson()</code> and <code>downloadFile()</code> in <code>index.js</code>.</p>`,
    lines,
  );
}

// ===========================================================================
// 6. What encodeURIComponent does NOT do
// ===========================================================================
function notEncoded(req, res) {
  const lines = [];

  lines.push(`Not encoded: A-Z a-z 0-9 - _ . ! ~ * ' ( )`);
  lines.push(`  encodeURIComponent("Rock 'n' Roll (live)!*") -> ${encodeURIComponent("Rock 'n' Roll (live)!*")}`);
  lines.push("");
  lines.push("❌ ' is left as is, so it breaks a single-quoted HTML attribute:");
  const name = "Rock 'n' Roll";
  lines.push(`   <a href='/people/${encodeURIComponent(name)}'>  <- the attribute ends after "Rock%20"`);
  lines.push("✅ always ALSO escape HTML (escapeHtml turns ' into &#39;), or use a strict encoder:");
  const strict = (s) =>
    encodeURIComponent(s).replace(/[!'()*]/g, (c) => "%" + c.charCodeAt(0).toString(16).toUpperCase());
  lines.push(`   strict("${name}") -> ${strict(name)}`);
  lines.push("   (RFC 3986 strict encoding is also required by OAuth 1 / AWS signatures)");
  lines.push("");

  lines.push("❌ It turns ANYTHING into a string - missing values become real words:");
  lines.push(`   "/people?q=" + encodeURIComponent(undefined) -> /people?q=${encodeURIComponent(undefined)}`);
  lines.push(`   "/people?q=" + encodeURIComponent(null)      -> /people?q=${encodeURIComponent(null)}`);
  lines.push("   -> check the value first (or use URLSearchParams and skip empty ones).");
  lines.push("");

  lines.push("❌ It is NOT a security filter:");
  lines.push(`   encodeURIComponent("..")                    -> ${encodeURIComponent("..")}   (path traversal still possible)`);
  lines.push(`   encodeURIComponent("javascript:alert(1)")   -> ${encodeURIComponent("javascript:alert(1)")}`);
  lines.push("     fine as a VALUE, but if the user controls the WHOLE href, encoding doesn't help -");
  lines.push("     check that it starts with http:// or https:// instead.");
  lines.push("   It doesn't escape SQL or HTML either - one escape per language.");

  report(
    res,
    "Pitfall: what encodeURIComponent does NOT do",
    `<p>It makes a value safe <b>for a URL</b>. Nothing more.</p>`,
    lines,
  );
}

export {
  queryString,
  encodeUriVsComponent,
  pathSegment,
  decoding,
  headers,
  notEncoded,
};
