console.log("Hello App");

// https://nodejs.org/learn/typescript/introduction
type User = {
  name: string;
  age: number;
};

function isAdult(user: User): boolean {
  return user.age >= 18;
}

const angie: User = {
  name: "Angie",
  age: 29,
};
const angieAdult = isAdult(angie);

console.log(`angieAdult: ${angieAdult}`);
