/**
 * @typedef {Object} Weather
 * @property {string} id
 * @property {string} city
 * @property {string} photo
 * @property {number} temperature
 * @property {boolean} isWindy
 */

export const WeatherController = {
  init(selector) {
    this.selector = selector;

    return this;
  },

  /**
   * Fetch cats from API.
   * @returns {Promise<void>}
   */
  async showWeather() {
    const app = document.getElementById(this.selector);
    //app.innerHTML = "<h1>Cats Controller</h1>";

    // fetch data from server
    const response = await fetch("/api/weather");

    /**
     * @type {Weather[]}
     */
    const weather = await response.json();
    // console.log(cats);

    const container = document.getElementById(this.selector);

    // render cats
    container.innerHTML =
      weather
        .map(
          (weather) => `
        <div style="float:left" class="cat">
            <h2>${weather.city}</h2>
            <p>Temperature: ${weather.temperature}</p>
            <img height="100" src="${weather.photo}" alt="weather icon" />
            <br /><button class="cat-detail" data-id="${weather.id}">Load Details</button>
        </div>
    `,
        )
        .join("") +
      '<div style="clear:both"></div>' +
      '<div id="cat-details"></div>';

    // NOW we WANT BUTTON and events for extra ajax from this page.
    // Can be very big logic here for different AJAX
    const children = container.querySelectorAll("button.cat-detail");
    //always we use arrow function => ... because it preserves this
    children.forEach((element) => {
      element.addEventListener("click", (e) => {
        const id = e.target.getAttribute("data-id");
        //const id = e.target.dataset.id;
        this.loadCatDetails(id);
      });
    });

    // if you want EVENT to another Controller handler - read UNIT 14 of Lesson 2.5
    // CustomEvent - from one class to another.
  },

  /**
   * Fetch details about specific Cat from API.
   * @returns {Promise<void>}
   */
  async loadCatDetails(id) {
    // console.log("clicked id:" + id);
    // make ajax request and fill '<div id="cat-details"></div>'
    const container = document.getElementById("cat-details");
    container.innerHTML = "Loading ajax request for ID:" + id;
  },
};
