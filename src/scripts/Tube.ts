import { COLORS, type Color } from "./constants";
import { parseMap } from "./helpers";

export class Liquid {
    color: string;
    idx: number;
    level: number;
    element: HTMLDivElement;

    constructor(color: string, idx: number) {
        this.color = color;
        this.idx = idx;
        this.level = 25;

        this.element = this.#createElement();
    }

    #createElement() {
        const cssColor = COLORS[this.color as Color];

        const liquidEle = document.createElement("div");

        liquidEle.classList.add("liquid");
        liquidEle.classList.add(`liquid-${this.idx}`);
        liquidEle.classList.add(cssColor);

        liquidEle.dataset.idx = String(this.idx);
        liquidEle.dataset.color = String(cssColor);

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
            this.liquids.push(new Liquid(colors[i], i));
        }
        this.element = this.#createElement();
    }

    #createElement() {
        const tubeEle = document.createElement("div");
        tubeEle.classList.add("tube");
        tubeEle.classList.add(`tube-${this.idx}`);

        tubeEle.dataset.idx = String(this.idx);

        this.liquids.forEach((liquid) => {
            tubeEle.append(liquid.element);
        });

        return tubeEle;
    }

    select() {
        this.element.classList.add("selected");
    }
    deselect() {
        this.element.classList.remove("selected");
    }

    getTopColor() {
        return this.liquids.filter((lq) => lq.color != "_")[0]?.color || null;
    }

    isComplete() {
        return this.liquids.filter((lq) => lq.color != "_").length == 4;
    }
}

export class Level {
    board: Tube[];
    selectedTubeIdx: number | null;
    element: HTMLDivElement;

    constructor(map: string) {
        this.selectedTubeIdx = null;

        this.element = document.querySelector("#board") as HTMLDivElement;

        this.board = parseMap(map).map((colors, i) => {
            const tube = new Tube(colors, i);

            this.element.append(tube.element);

            return tube;
        });

        window.addEventListener("click", this.#onWindowClick.bind(this));
    }

    getTubeByIdx(idx: number) {
        return this.board[idx];
    }

    // @TODO: fix this
    canPour(tubeA: Tube, tubeB: Tube) {
        const fromColor = tubeA.getTopColor();
        const toColor = tubeB.getTopColor();
        // console.log("canPour", { fromColor, toColor });
        if (fromColor == null) return false;
        if (fromColor && toColor == null) return true;
        else return fromColor == toColor && !tubeB.isComplete();
    }

    pour(tubeA: Tube, tubeB: Tube) {
        console.log("Pour!", { tubeA, tubeB });
    }

    #onWindowClick(e: MouseEvent) {
        const composedPath = e.composedPath();
        const clickedTube = composedPath.find((el) =>
            (el as HTMLElement)?.classList?.contains("tube")
        ) as HTMLDivElement;
        // console.log(composedPath, clickedTube);
        if (clickedTube) {
            const tubeIdx = Number(clickedTube.dataset.idx);
            const tube = this.getTubeByIdx(tubeIdx);

            if (this.selectedTubeIdx == null) {
                this.selectedTubeIdx = tube.idx;
                tube.select();
            } else {
                if (this.selectedTubeIdx == tube.idx) {
                    this.selectedTubeIdx = null;
                    tube.deselect();
                } else {
                    const prevTube = this.getTubeByIdx(this.selectedTubeIdx);
                    const canPour = this.canPour(prevTube, tube);

                    if (canPour) {
                        this.pour(prevTube, tube);
                        this.selectedTubeIdx = null;
                        prevTube.deselect();
                    } else {
                        this.selectedTubeIdx = tubeIdx;
                        prevTube.deselect();
                        tube.select();
                    }
                }
            }
        }

        if (!clickedTube) {
            if (this.selectedTubeIdx != null) {
                const tube = this.getTubeByIdx(this.selectedTubeIdx);
                this.selectedTubeIdx = null;
                tube.deselect();
            }
        }
    }
}
