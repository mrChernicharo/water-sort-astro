import type { Color } from "./constants";

export class Liquid {
  color: string;

  constructor(color: string) {
    this.color = color;
  }
}

export class Tube {
  idx: number;
  liquids: Liquid[];

  constructor(idx: number, liquids: Liquid[]) {
    this.idx = idx;
    this.liquids = liquids;
  }
}

export class Board {
  constructor(map: string) {}
}
