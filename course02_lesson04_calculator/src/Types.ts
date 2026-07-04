export type Cat = {
  id: string;
  name: string;
  age: number;
  photo: string;
  city: string;
};

export type CalculatorType = {
  add(a: number, b: number): number;
  subtract(a: number, b: number): number;
  multiply(a: number, b: number): number;
  divide(a: number, b: number): number;
};