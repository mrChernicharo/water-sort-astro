import type { Color } from "./constants";
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
    const liquidEle = document.createElement("div");
    liquidEle.classList.add("liquid");
    liquidEle.style.backgroundColor = this.color;
    return liquidEle;
  }
}

export class Tube {
  idx: number;
  liquids: Liquid[] = [];
  element: HTMLDivElement;

  constructor(colors: string, idx: number) {
    this.idx = idx;

    for (let i = 0; i < colors.length; i++) {
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
  }
}
