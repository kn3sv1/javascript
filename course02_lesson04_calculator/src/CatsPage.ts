import { CatAjax } from "./CatAjax";
import { Cat } from "./Types";

let fakeVariable = async () => {
  //problem with these cats is we don't have any autocompletion without TypeScript
  //   let cats = await CatAjax.loadCats();
  //   console.log(cats);

  // Let's add TypeScript types.
  // The types we create should be the same as what we get from AJAX request
  // otherwise we will have runtime errors in browser. For example undefined values if property doesn't exist.
  let cats: Cat[] = await CatAjax.loadCats();
  cats.map((cat: Cat) => {
    console.log(`Nmae: ${cat.name} Age: ${cat.age}`);
  });
};
fakeVariable();

// THE SAME BUT WITHOUT EXTRA VARIABLE: fakeVariable
// (async () => {
//   let cats = await CatAjax.loadCats();
//   console.log(cats);
// })();
