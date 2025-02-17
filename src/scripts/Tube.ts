import { COLORS, type Color } from "./constants";
import { parseMap } from "./helpers";

export class Liquid {
  color: string;
  level: number;
  element: HTMLDivElement;

  constructor(color: string) {
    this.color = color;
    this.level = 25;

    this.element = this.#createElement();
  }

  #createElement() {
    const cssColor = COLORS[this.color as Color];

    const liquidEle = document.createElement("div");

    liquidEle.classList.add(cssColor);
    liquidEle.classList.add("liquid");
    liquidEle.style.backgroundColor = cssColor;
    return liquidEle;
  }

  setLevel(level: number) {
    this.level = level;
    this.element.style.height = `${level}%`;
  }
}

export class Tube {
  idx: number;
  liquids: Liquid[] = [];
  element: HTMLDivElement;

  constructor(colors: string, idx: number) {
    this.idx = idx;

    for (let i = 3; i >= 0; i--) {
      this.liquids.push(new Liquid(colors[i]));
    }
    this.element = this.#createElement();
  }

  #createElement() {
    const tubeEle = document.createElement("div");
    tubeEle.classList.add("tube");

    this.liquids.forEach((liquid) => {
      tubeEle.append(liquid.element);
    });

    return tubeEle;
  }
}

export class Level {
  board: Tube[];
  element: HTMLDivElement;

  constructor(map: string) {
    this.element = document.querySelector("#board") as HTMLDivElement;

    this.board = parseMap(map).map((colors, i) => {
      const tube = new Tube(colors, i);
      this.element.append(tube.element);

      return tube;
    });

    setTimeout(() => {
      this.board[1].liquids[0].setLevel(0);
      this.board[1].liquids[1].setLevel(0);
      this.board[1].liquids[2].setLevel(50);
      this.board[1].liquids[3].setLevel(50);
    }, 1000);

    setTimeout(() => {
      this.board[1].liquids[0].setLevel(25);
      this.board[1].liquids[1].setLevel(25);
      this.board[1].liquids[2].setLevel(25);
      this.board[1].liquids[3].setLevel(25);
    }, 2000);
  }
}
