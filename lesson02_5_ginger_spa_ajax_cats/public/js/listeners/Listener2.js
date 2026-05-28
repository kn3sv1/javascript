import { CatRepository } from "../repository/CatRepository.js";

export const Listener2 = {
  registerEvents() {},
  registerListeners() {
    document.addEventListener("showCatEvent", (event) => {
      console.log("Event arrived:");
      console.log(event);
      this.showCat(event.detail.catName);
    });
  },

  async showCat(catName) {
    //console.log("showCat:" + catName);
    const cat = await CatRepository.getCatByName(catName);
    const container = document.getElementById("events-block-detail");

    if (cat === null) {
        container.innerHTML = `<span style="color:red">Cat does not exist on Server!</span>`;
        return;
    }

    // render cats
    container.innerHTML = `
        <div style="float:left" class="cat">
            <h2>${cat.name}</h2>
            <p>Age: ${cat.age}</p>
            <img height="100" src="${cat.photo}" alt="${cat.name}" />
            <br /><button class="cat-detail" data-id="${cat.id}">Load Details</button>
        </div>
        <div style="clear:both"></div>
    `;
  },
};
