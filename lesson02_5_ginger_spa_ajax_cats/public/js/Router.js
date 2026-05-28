import { CatController } from "./controller/CatController.js";
import { DoctorController } from "./controller/DoctorController.js";
import { WeatherController } from "./controller/WeatherController.js";

import { Listener1, Listener2 } from "./listeners/index.js";

export const Router = {
  init(selector) {
    this.selector = selector;
    this.setListener();

    return this;
  },

  setListener() {
    document.addEventListener("click", (e) => {
      if (e.target.matches("[data-link]")) {
        e.preventDefault();

        this.navigate(e.target.href.replace(location.origin, ""));
      }
    });

    window.addEventListener("popstate", () => {
      this.render(location.pathname);
    });
  },

  navigate(url) {
    // change browser URL
    history.pushState({}, "", url);

    // render correct page
    this.render(url);
  },

  render(path) {
    const app = document.getElementById(this.selector);
    switch (path) {
      case "/":
        app.innerHTML = "<h1>Home Page</h1>";
        break;

      case "/about":
        app.innerHTML = "<h1>About Page</h1>";
        break;

      case "/products":
        app.innerHTML = "<h1>Products Page</h1>";
        break;

      case "/cats":
        const controller1 = CatController.init(this.selector);
        controller1.showCats();
        break;

      case "/weather":
        const controller2 = WeatherController.init(this.selector);
        controller2.showWeather();
        break;

      case "/events":
        app.innerHTML = `
          <div id="events-block">
            <button id="event1" data-name="Ginger">Ginger</button>
            <button id="event2" data-name="Fluffy">Fluffy</button>
            <button id="event3" data-name="Gucci">Gucci</button>
            <button id="event4" data-name="Teady">Teady</button>
          </div>
          <div id="events-block-detail"></div>
        `;

        Listener1.registerEvents();
        Listener1.registerListeners();
        Listener2.registerEvents();
        Listener2.registerListeners();
        break;
      case "/doctors":
        const controller = DoctorController.init(this.selector);
        controller.index();
        break;

      default:
        app.innerHTML = "<h1>404 Not Found</h1>";
    }
  },
};
