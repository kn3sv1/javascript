import "../resources/css/style.css";
import { HomePage } from "./pages/HomePage";

const app = document.querySelector<HTMLDivElement>("#app");

if (!app) {
  throw new Error("App container (#app) not found.");
}

const homePage = new HomePage();
homePage.render(app);