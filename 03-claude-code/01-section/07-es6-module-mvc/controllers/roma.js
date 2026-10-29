import { romaView } from "../views/roma.js";

export function getRomaInfo(req, res) {
  //   res.end('<p style="color: red">Roma</p>');

  const data = { name: "Roma", color: "blue", education: "Manchester" };

  res.statusCode = 200;
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.end(romaView(data));
}
