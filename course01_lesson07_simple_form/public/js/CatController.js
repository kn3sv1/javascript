import { CatList } from "./CatList.js";
import { CatForm } from "./CatForm.js";

export const CatController = {
  init(selector) {
    this.selector = selector;

    return this;
  },

  async deleteBtns(e) {
    if (e.target.matches(".delete-btn")) {
      const id = e.target.dataset.id;
      console.log(id);

      try {
        const response = await this.deleteCat(id);

        // check from fetch result
        if (response.status !== 200) {
          throw new Error("Delete failed");
        }

        console.log("Deleted:", id);

        // reload list after delete
        this.showCatsTable();
      } catch (error) {
        console.error(error);
      }
    }
  },

  async showCatsTable() {
    const catTable = CatList.init();
    await catTable.render();

    const deleteBtnAll = document.querySelectorAll("button.delete-btn");

    deleteBtnAll.forEach((element) => {
      //element.addEventListener("click", this.deleteBtns.bind(this));
      element.addEventListener("click", (e) => this.deleteBtns(e));
    });
  },

  createCat() {
    const catForm = CatForm.init();
    catForm.render();
  },

  async deleteCat(id) {
    // I didn't return fetch function result!
    return await fetch("api/cats/" + id, {
      method: "DELETE"
    });
  },

  editCat() {},
};
