import gsap from "gsap";
import { COLORS, type Color } from "./constants";
import { parseMap, wait } from "./helpers";
import { getSpillCount, performWaterSpill } from "./old/old";

const duration = 3;

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
        liquidEle.style.height = `${this.level}%`;
        return liquidEle;
    }

    async setLevel(level: number) {
        return new Promise((resolve) => {
            const prevLevel = this.level;
            this.element.style.height = `${level}%`;
            this.level = level;
            gsap.fromTo(
                this.element,
                { height: `${prevLevel}%` },
                { height: `${level}%`, duration }
            ).then(() => {
                resolve(true);
            });
        });
    }
}

export class Tube {
    idx: number;
    colorStr: string;
    liquids: Liquid[] = [];
    element: HTMLDivElement;
    topAnchor!: HTMLDivElement;

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

        const topAnchorEle = document.createElement("div");
        topAnchorEle.classList.add("top-anchor");
        topAnchorEle.classList.add(`top-anchor-${this.idx}`);

        tubeEle.append(topAnchorEle);

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
    getTopLiquid() {
        return this.liquids.filter((lq) => lq.color != "_")[0];
    }
    getLiquidByIdx(idx: number) {
        const liquidIdx = this.liquids.findIndex((lq) => lq.idx == idx);
        return this.liquids[liquidIdx];
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

    rotateTo(angle: number) {
        gsap.to(this.element, { rotate: `${angle}deg`, duration });
    }

    async pourInto(other: Tube) {
        const spillCount = getSpillCount(this.colorStr, other.colorStr);

        const result = performWaterSpill(this.colorStr, other.colorStr);
        const { tubeA, tubeB } = result;

        await Promise.all([this.drain(tubeA, spillCount), other.fill(tubeB, spillCount)]);
    }
    async drain(resultColorStr: string, spillCount: number) {
        this.rotateTo(20);

        const topLiquid = this.getTopLiquid();

        let liquidIdx = topLiquid.idx;

        while (spillCount > 0) {
            let liquid = this.getLiquidByIdx(liquidIdx);
            if (!liquid) throw Error("no liquid found");

            const newEmptyLiquid = new Liquid("_", liquidIdx, 0);

            liquid.element.insertAdjacentElement("beforebegin", newEmptyLiquid.element);

            newEmptyLiquid.setLevel(25);
            await liquid.setLevel(0);

            liquid.color = newEmptyLiquid.color;
            liquid.level = newEmptyLiquid.level;
            liquid.element = newEmptyLiquid.element;

            liquidIdx--;
            spillCount--;
        }

        this.rotateTo(0);
        this.colorStr = resultColorStr;
        this.#clearTemporaryElements();
        // console.log("drain", this);
    }
    async fill(resultColorStr: string, spillCount: number) {
        const topLiquid = this.getTopLiquid();
        const color = resultColorStr.replaceAll("_", "").at(-1) || "_";

        let liquidIdx = 0;
        if (topLiquid) {
            liquidIdx = topLiquid.idx + 1;
        }

        while (spillCount > 0) {
            const liquid = this.getLiquidByIdx(liquidIdx);

            const fillLiquid = new Liquid(color, liquidIdx, 0);

            liquid.element.insertAdjacentElement("afterend", fillLiquid.element);

            fillLiquid.setLevel(25);
            await liquid.setLevel(0);

            liquid.color = fillLiquid.color;
            liquid.level = fillLiquid.level;
            liquid.element = fillLiquid.element;

            spillCount--;
            liquidIdx++;
        }

        this.colorStr = resultColorStr;
        this.#clearTemporaryElements();
        // console.log("fill", this);
    }

    #clearTemporaryElements() {
        const removingEles: Element[] = [];
        [...this.element.children].forEach((ele) => {
            const height = ele.computedStyleMap().get("height")?.toString();

            if (height && parseInt(height) == 0) {
                removingEles.push(ele);
            }
        });
        removingEles.forEach((ele) => ele.remove());
    }
}
