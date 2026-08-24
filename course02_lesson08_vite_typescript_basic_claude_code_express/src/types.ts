export interface Cat {
  id: number;
  name: string;
  breed: string;
  age: number;
  color: string;
}

export type CatInput = Omit<Cat, 'id'>;
