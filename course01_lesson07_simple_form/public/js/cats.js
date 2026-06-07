// import your rest classes: CatList, CatEditForm
//import { CatList } from "./CatList.js";

// cannot import express because need to change "type" to "module" in package.json that tells Node
// to use ES module syntax. Instead I have "commonjs" and other code won't work.

// app.get("/cats.html", (req, res) => {
//   if (req.query.param == "form=1") {
//     const catForm = CatForm.init();
//     catForm.render();

//     window.catForm = catForm;
//   } else {
//     const catTable = CatList.init();
//     catTable.render();
//   }
// });

// const catTable = CatList.init();
// catTable.render();

// depending on URL you dont only create cat form it can be cat list object.
// I suggest to create different objects: CatList, CatEditForm, CatForm for creating.
// CatForm - this class for creating don't touch and don't break.
import { Router } from "./Router.js";
import { CatController } from "./CatController.js";

const router = Router.init("app");
router.render(location.pathname);


