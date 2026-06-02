export function uuidv7() {
  const timestamp = Date.now();

  const randomBytes = new Uint8Array(10);
  crypto.getRandomValues(randomBytes);

  const tsHex = timestamp
    .toString(16)
    .padStart(12, "0");

  let randHex = [...randomBytes]
    .map(b =>
      b.toString(16).padStart(2, "0")
    )
    .join("");

  const uuid =
    tsHex +
    "7" +
    randHex.substring(1,4) +
    ((parseInt(randHex[4],16)&0x3)|0x8)
      .toString(16) +
    randHex.substring(5,16);

  return (
    uuid.slice(0,8) + "-" +
    uuid.slice(8,12) + "-" +
    uuid.slice(12,16) + "-" +
    uuid.slice(16,20) + "-" +
    uuid.slice(20)
  );
}
