import { layout } from "./layout.js";

export function romaView({ name, color, education }) {
  const content = `
    <h2 style="color:green">Education: ${education}</h2>
    <p style="color: ${color}">${name}</p>  
    `;

  return layout({ title: name, content });
}
