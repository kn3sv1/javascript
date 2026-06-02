import { CatForm } from "./CatForm.js";
// import your rest classes: CatList, CatEditForm


// depending on URL you dont only create cat form it can be cat list object.
// I suggest to create different objects: CatList, CatEditForm, CatForm for creating.
// CatForm - this class for creating don't touch and don't break.

const catForm = CatForm.init();
catForm.render();

window.catForm = catForm;
