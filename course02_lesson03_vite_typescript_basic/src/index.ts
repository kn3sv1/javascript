import {add} from './math.js';
import {sub} from './math.js';


function greet(name: string): string {
  return `Hello ${name}`;
}

const message = greet("Angie");

console.log(message);

let age: number = 30;

age += 5;

console.log(age);


console.log("A + B = " + add(10,5));

console.log("A - B = " + sub(10,5));