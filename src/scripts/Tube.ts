import gsap from "gsap";
import { COLORS, type Color } from "./constants";
import { parseMap, wait } from "./helpers";
import { getSpillCount, performWaterSpill } from "./old/old";

export class Liquid {
    color: string;
    idx: number;
    level: number;
    element: HTMLDivElement;

    constructor(color: string, idx: number, level = 25) {
        this.color = color;
        this.idx = idx;
        this.level = level;

        this.element = this.#createElement();
        return this;
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
        const prevLevel = this.level;
        this.element.style.height = `${level}%`;
        this.level = level;

        // gsap.fromTo(this.element, { height: `${prevLevel}%` }, { height: `${level}%` });
    }
}

export class Tube {
    idx: number;
    colorStr: string;
    liquids: Liquid[] = [];
    element: HTMLDivElement;

    constructor(colorStr: string, idx: number) {
        this.idx = idx;

        this.colorStr = colorStr;

        for (let i = 3; i >= 0; i--) {
            this.liquids.push(new Liquid(colorStr[i], i));
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

    isComplete() {
        return this.liquids.filter((lq) => lq.color != "_").length == 4;
    }

    getTopColor() {
        let topColor = null;
        for (let i = 0; i < 4; i++) {
            const color = this.liquids[i].color;
            if (color == "_") continue;
            else {
                topColor = color;
                break;
            }
        }
        return topColor;
    }

    parsePouringLiquids(spillCount: number) {
        let liqIdx = 0;
        let minPourIdx = 3;
        const pouringLiquids: Liquid[] = [];

        while (spillCount > 0) {
            const liquid = this.liquids[liqIdx];
            liqIdx++;

            if (liquid.color == "_") continue;
            else {
                pouringLiquids.push(liquid);
                minPourIdx = liquid.idx;
                spillCount--;
            }
        }
        pouringLiquids.reverse();

        const remainingLiquids = this.liquids.filter((lq) => lq.idx < minPourIdx);

        const emptySpaces = this.liquids.filter((lq) => lq.color == "_");

        const result = { emptySpaces, pouringLiquids, remainingLiquids };
        // console.log("getPouringLiquids", result, { minPourIdx });
        return result;
    }

    pourInto(other: Tube, container: HTMLDivElement) {
        const result = performWaterSpill(this.colorStr, other.colorStr);
        const { tubeA, tubeB } = result;

        this.colorStr = tubeA;
        this.liquids = [];
        for (let i = 3; i >= 0; i--) {
            const ch = tubeA[i];
            this.liquids.push(new Liquid(ch, i));
        }

        other.liquids = [];
        other.colorStr = tubeB;
        for (let i = 3; i >= 0; i--) {
            const ch = tubeB[i];
            other.liquids.push(new Liquid(ch, i, 0));
        }

        this.updateLiquids(container);
        other.updateLiquids(container);
    }

    updateLiquids(container: HTMLDivElement, nextLevel?: number) {
        this.element.innerHTML = "";

        this.liquids.forEach((liquid) => {
            this.element.append(liquid.element);
            if (nextLevel != undefined) {
                liquid.setLevel(nextLevel);
            }
        });

        console.log(this, container, this.element);
    }
}
