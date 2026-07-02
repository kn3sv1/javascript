import { person } from "./Person";
import { cat } from "./Cat";
import { CatAjax } from "./CatAjax";

//roma wrote
console.log(person);
console.log(cat);

console.log(cat.owner.name);
console.log(cat.owner.city);


(async () => {
  const response = await CatAjax.loadCats();
  console.log(response);
})();