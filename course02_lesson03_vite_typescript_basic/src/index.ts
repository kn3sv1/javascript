import {add} from './math.js';
import {sub} from './math.js';


function greet(name: string): string {
  return `Hello ${name}`;
}

const message = greet("Angie");

console.log(message);

const paragraph = document.getElementById("name");

if (paragraph) {
  paragraph.textContent = message;
}

let age: number = 40;

age += 2;

console.log(age);


console.log("A + B = " + add(10,5));

console.log("A - B = " + sub(10,5));

const paragraph2 = document.getElementById("age");

if (paragraph2) {
  paragraph2.textContent = `You are ${age} years old.`;
}

let num: number = 50;
let num2: number = 60;

console.log("New number: " + num);
console.log("New number: " + num2);