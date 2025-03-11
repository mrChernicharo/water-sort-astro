import { COLORS, type Color } from "../constants";
import { parseMap } from "../helpers";
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

    getTubeElementByIdx(idx: number) {
        return this.canvasContainer.querySelector(`.tube[data-idx="${idx}"]`) as HTMLDivElement;
    }

    onTubeClick(e: MouseEvent) {
        const tube = (e.target as HTMLDivElement).closest(".tube") as HTMLDivElement;
        const prevIdx = this.model.selectedTubeIdx;

        if (prevIdx !== null) {
            const prevTube = this.getTubeElementByIdx(prevIdx);
            prevTube.classList.remove("selected");
        }

        if (tube.dataset.idx !== undefined) {
            const tubeIdx = parseInt(tube.dataset.idx);

            if (tubeIdx !== prevIdx) {
                this.model.selectTube(tubeIdx);
                tube.classList.add("selected");
            } else {
                this.model.selectTube(null);
            }
        }

        console.log("tube clicked", tube, this.model, this.model.checkAvailableMoves());
    }

    #drawTube(tube: string, idx: number) {
        const tubeEle = document.createElement("div");
        tubeEle.dataset.idx = idx.toString();
        tubeEle.classList.add("tube");

        for (let i = 0; i < tube.length; i++) {
            const color = COLORS[tube[i] as Color];

            const water = document.createElement("div");
            water.classList.add("water");
            water.classList.add(color);
            water.style.backgroundColor = color;

            tubeEle.append(water);
        }
        tubeEle.onclick = this.onTubeClick.bind(this);

        this.canvasContainer.append(tubeEle);
    }

    drawScene() {
        this.canvasContainer.innerHTML = "";

        const currMap = this.model.getCurrentMap();

        const tubes = parseMap(currMap);

        tubes.forEach(this.#drawTube.bind(this));
        console.log("drawScene :::", currMap, tubes);
    }
}
