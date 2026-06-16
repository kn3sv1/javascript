import { CatForm } from "./CatForm.js";
import { CatList } from "./CatList.js";
import { Notification } from "./Notification.js";

const app = document.getElementById("app");

app.innerHTML = `
  <div id="form-container"></div>
  <div id="list-container"></div>
`;

CatForm.init();
CatList.init();
Notification.init();

