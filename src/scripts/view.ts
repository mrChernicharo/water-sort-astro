import { COLORS, type Color } from "../pages/constants";
import { parseMap } from "../pages/helpers";
import type { GameModel } from "./model";

export class GameView {
  model: GameModel;
  svgCanvas: SVGSVGElement;
  canvasContainer: HTMLDivElement;
  startBtn: HTMLButtonElement;
  resetBtn: HTMLButtonElement;
  constructor(model: GameModel) {
    this.model = model;

    this.canvasContainer = document.querySelector("#canvas-container") as HTMLDivElement;
    this.svgCanvas = document.querySelector("#svg-canvas") as SVGSVGElement;
    this.startBtn = document.querySelector("#btn01") as HTMLButtonElement;
    this.resetBtn = document.querySelector("#btn02") as HTMLButtonElement;
  }

  #drawTube(tube: string) {
    const tubeEle = document.createElement("div");
    tubeEle.classList.add("tube");

    for (let i = 0; i < tube.length; i++) {
      const water = document.createElement("div");
      water.classList.add("water");
      const c = tube[i] as Color;
      const color = COLORS[c];
      water.classList.add(color);
      water.style.backgroundColor = color;
      tubeEle.append(water);
    }

    this.canvasContainer.append(tubeEle);
  }

  drawScene() {
    const currMap = this.model.getCurrentMap();
    const tubes = parseMap(currMap);

    tubes.forEach((tube) => this.#drawTube(tube));
    console.log("drawScene :::", currMap, tubes);
  }
}
