// Reading a POST body with async/await.
//
// The classic callback version looks like this:
//
//   function getBody(req) {
//     return new Promise((resolve, reject) => {
//       let body = "";
//       req.on("data", (chunk) => (body += chunk));
//       req.on("end", () => resolve(body));
//       req.on("error", reject);
//     });
//   }
//   getBody(req).then((body) => ...);
//
// But `req` is a Readable stream, and every Readable stream is an *async
// iterable*. So `for await` replaces the events, the manual Promise AND the .then().

const MAX_BODY_SIZE = 1_000_000; // 1 MB

async function getBody(req) {
  const chunks = [];
  let size = 0;

  for await (const chunk of req) {
    size += chunk.length;
    if (size > MAX_BODY_SIZE) {
      // `throw` inside an async function = the returned promise rejects.
      // The caller's try/catch (around `await getBody(req)`) receives it.
      throw new Error("Request body is too large");
    }
    chunks.push(chunk);
  }

  return Buffer.concat(chunks).toString("utf-8");
}

// PITFALL: an async function ALWAYS returns a Promise, even if it just
// "returns an object". `getFormData(req).name` is undefined - you need
// `(await getFormData(req)).name`.
async function getFormData(req) {
  const body = await getBody(req);
  // body looks like "name=Maria&message=Hello+world"
  return Object.fromEntries(new URLSearchParams(body));
}

export {
  getFormData,
};
