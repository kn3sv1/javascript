import { CatList } from "./CatList.js";
import { CatForm } from "./CatForm.js";
import { CatEditForm } from "./CatEditForm.js";

export const CatController = {
  init(selector) {
    this.selector = selector;

    return this;
  },

  editBtns(e) {
    if (e.target.matches(".edit-btn")) {
      const id = e.target.dataset.id;
      console.log(id);

      this.editCat(id);

      // try {

      // } catch (error) {
      //   console.error(error);
      // }
    }
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
    const editBtnAll = document.querySelectorAll("button.edit-btn");

    deleteBtnAll.forEach((element) => {
      //element.addEventListener("click", this.deleteBtns.bind(this));
      // always write this.
      element.addEventListener("click", (e) => this.deleteBtns(e));
    });

    editBtnAll.forEach((element) => {
      element.addEventListener("click", (e) => this.editBtns(e));
    });
  },

  createCat() {
    const catForm = CatForm.init();
    catForm.render();
  },

  editCat(id) {
    const editCatForm = CatEditForm.init(id);
    editCatForm.render();
  },

  async deleteCat(id) {
    // I didn't return fetch function result!
    return await fetch("api/cats/" + id, {
      method: "DELETE",
    });
  },
};
