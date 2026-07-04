import { Calculator } from "./Calculator";

console.log("Hello Calculator");
let a:number = 5;
let b:number = 2;

let result = Calculator.add(a, b);
console.log(`A week has ${result} days`);

let result2 = Calculator.multiply(a, b);
console.log(`The result of ${a} timmes ${b} is ${result2}`);

let result3 = Calculator.subtract(a, b);
console.log(`The result of ${a} minus ${b} is ${result3}`);

a = 10;
b = 2;

let result4 = Calculator.divide(a, b);
console.log(`The result of ${a} divided by ${b} is ${result4}`);