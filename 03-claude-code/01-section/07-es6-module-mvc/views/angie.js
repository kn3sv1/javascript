import { layout } from "./layout.js";

export function angieView({ name, color }) {
  const content = `<p style="color: ${color}">${name}</p>`;

  return layout({ title: name, content });
}
