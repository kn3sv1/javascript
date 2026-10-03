// Reading a urlencoded POST body.
//
// A form posts "name=Tom+%26+Jerry&note=hi". Two traps if you parse it by hand:
//   body.split("&")              -> fine ONLY because the browser encoded "&" as %26
//   decodeURIComponent("Tom+")   -> "Tom+"  (it does NOT turn + into a space!)
// URLSearchParams knows the form rules (+ = space), so let it do the work.

const MAX_BODY_SIZE = 1_000_000; // 1 MB

async function getBody(req) {
  const chunks = [];
  let size = 0;

  for await (const chunk of req) {
    size += chunk.length;
    if (size > MAX_BODY_SIZE) {
      throw new Error("Request body is too large");
    }
    chunks.push(chunk);
  }

  return Buffer.concat(chunks).toString("utf-8");
}

async function getFormData(req) {
  const body = await getBody(req);
  return Object.fromEntries(new URLSearchParams(body));
}

export {
  getFormData,
};
