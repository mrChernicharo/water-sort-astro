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

  draw() {
    this.model.getCurrentMap();
  }
}
