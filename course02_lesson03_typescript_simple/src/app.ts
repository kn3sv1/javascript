import { person } from "./Person";
import { cat } from "./Cat";
import { CatAjax } from "./CatAjax";
import _ from "lodash";
import { z } from "zod";

//roma wrote
console.log(person);
console.log(cat);

console.log(cat.owner.name);
console.log(cat.owner.city);

let result = _.camelCase("Foo Bar");
console.log(result);

//standard JavaScript without any extra logic please. stupid technical work.
result = "aNgIe-  nEoPhYtOu".toLowerCase();

//lodash SMART - INTELIGENT convertion to title case. Not just title case but extra work for example replace dash
// maybe customer stupid typed dash instead of space or many spaces and dash
// this smart lodash function replaces many slashes many spaces to proper only one space.
// It is smart like Word program.
// that is why we use lodash method from this lodash program.
result = _.startCase(result);
console.log(result);

// https://lodash.com/docs/4.18.1#template
let template1 = _.template("hello <%= user %>!");
let html = template1({ user: "angie" });
console.log(html);

var template2 = _.template(
  "<% _.forEach(users, function(user) { %><li><%- user %></li><% }); %>",
);
let html2 = template2({ users: ["angie", "katerina"] });
console.log(html2);


const userSchema = z.object({
  name: z.string().min(2),
  age: z.number().int().positive(),
  email: z.string().email(),
});

const result5 = userSchema.safeParse({
  name: "Angie",
  age: 30,
  email: "angie@example.com",
});

if (result5.success) {
  console.log(result5.data);
} else {
  console.log(result5.error.issues);
}


(async () => {
  const response = await CatAjax.loadCats();
  console.log(response);
})();
