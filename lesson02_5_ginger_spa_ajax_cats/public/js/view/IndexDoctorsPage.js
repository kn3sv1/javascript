import { Listener1, Listener2 } from "../listeners/index.js";

export const IndexDoctorsPage = {
  init(selector) {
    this.selector = selector;
    return this;
  },

  render(doctors) {
    const page = document.getElementById(this.selector);
    const doctorsHtml = doctors.map(
          (doctor) => `
        <div style="float:left" class="cat">
            <h2>${doctor.name}</h2>
            <p>Profession: ${doctor.profession}</p>
            <img height="100" src="${doctor.photo}" alt="${doctor.name}" />
        </div>`,
        )
        .join("")

    const eventsBlock = `<div id="events-block">
            <button id="event1" data-name="Ginger">Ginger</button>
            <button id="event2" data-name="Fluffy">Fluffy</button>
            <button id="event3" data-name="Gucci">Gucci</button>
            <button id="event4" data-name="Teady">Teady</button>
          </div>
          <div id="events-block-detail"></div>`;

    page.innerHTML = `
          <div id="doctors-block">` + doctorsHtml + `</div>
          <div style="clear:both"></div>
          <div id="doctors-block-cats">`
          + eventsBlock 
          + `</div>
        `;

    Listener1.registerEvents();
    Listener1.registerListeners();
    Listener2.registerEvents();
    Listener2.registerListeners();
  },
};
