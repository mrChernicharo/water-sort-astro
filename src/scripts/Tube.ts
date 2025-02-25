import gsap from "gsap";
import { COLORS, TUBE_WIDTH, type Color } from "./constants";
import { parseMap, wait } from "./helpers";
import { getSpillCount, performWaterSpill } from "./old/old";
import { cloneDeep } from "lodash";

const duration = 1;

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

        liquidEle.dataset.idx = String(this.idx);
        liquidEle.dataset.color = String(cssColor);

        liquidEle.style.zIndex = String(5 - this.idx);
        liquidEle.style.height = `${this.level}%`;

        ["left", "right"].forEach((side) => {
            const marker = document.createElement("div");
            marker.classList.add("marker");

            const layer = document.createElement("div");
            layer.classList.add("layer");
            layer.classList.add(cssColor);

            layer.style.backgroundColor = cssColor;

            marker.append(layer);
            liquidEle.append(marker);
        });
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

    getMarkers() {
        const markers: HTMLDivElement[] = [];
        [...this.element.children]
            .filter((el) => el.classList.contains("marker"))
            .forEach((marker) => {
                markers.push(marker as HTMLDivElement);
            });
        return markers;
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

        for (let i = 0; i < 4; i++) {
            // for (let i = 3; i >= 0; i--) {
            if (colorStr[i] !== "_") {
                this.liquids.push(new Liquid(colorStr[i], i));
            }
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
        return this.liquids.filter((lq) => lq.color != "_").at(-1);
    }
    getLiquidByIdx(idx: number) {
        const liquidIdx = this.liquids.findIndex((lq) => lq.idx == idx);
        return this.liquids[liquidIdx];
    }

    getTopColor() {
        let topColor = null;
        for (let i = 3; i >= 0; i--) {
            // for (let i = 0; i < 4; i++) {
            if (!this.liquids[i]) continue;
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
        const topLiquid = this.getTopLiquid();
        if (!topLiquid) return { pouringLiquids: [], remainingLiquids: this.liquids };

        const pouringLiquids: Liquid[] = [];
        let liqIdx = topLiquid.idx;
        while (spillCount > 0) {
            pouringLiquids.push(this.liquids[liqIdx]);
            liqIdx--;
            spillCount--;
        }
        const remainingLiquids: Liquid[] = [];
        while (liqIdx >= 0) {
            remainingLiquids.push(this.liquids[liqIdx]);
            liqIdx--;
        }

        const result = { pouringLiquids, remainingLiquids };
        // console.log("getPouringLiquids", result);
        return result;
    }

    async rotateTo(angle: number) {
        return new Promise((resolve) => {
            this.liquids.forEach((lq) => {
                lq.getMarkers().forEach((marker) => {
                    gsap.to(marker, { rotate: `${-angle}deg`, duration });
                });
            });
            gsap.to(this.element, { rotate: `${angle}deg`, duration }).then(() => {
                resolve(true);
            });
        });
    }

    async pourInto(other: Tube) {
        const spillCount = getSpillCount(this.colorStr, other.colorStr);

        const result = performWaterSpill(this.colorStr, other.colorStr);
        const { tubeA, tubeB } = result;

        await Promise.all([this.spill(other, tubeA, spillCount), other.fill(tubeB, spillCount)]);
    }

    async spill(other: Tube, resultColorStr: string, spillCount: number) {
        this.colorStr = resultColorStr;

        const { pouringLiquids, remainingLiquids } = this.parsePouringLiquids(spillCount);

        // should i rotate left or right?
        const { x } = other.element.getBoundingClientRect();
        const direction = x + TUBE_WIDTH / 2 > window.innerWidth / 2 ? "clockwise" : "anticlock";

        console.log({ pouringLiquids, remainingLiquids, direction });
        // move towards other && rotate to angle to start spilling // duration * 1

        // rotate to angle during spill // duration *  spillCount

        // rotate back

        await this.rotateTo(75);
        await this.rotateTo(0);

        this.liquids = remainingLiquids;
        console.log("spill", { resultColorStr, spillCount, tube: this });
    }
    async fill(resultColorStr: string, spillCount: number) {
        this.colorStr = resultColorStr;

        const { pouringLiquids, remainingLiquids } = this.parsePouringLiquids(spillCount);
        console.log({ pouringLiquids, remainingLiquids });

        // wait for other to reach spilling position // duration * 1

        // spawn new liquids and increase their height // duration *  spillCount
        console.log("fill", { resultColorStr, spillCount, tube: this });
    }

    getZeroHeightLiquids() {
        const zeroHeightEles: HTMLDivElement[] = [];
        [...this.element.children].forEach((ele) => {
            const height = ele.computedStyleMap().get("height")?.toString();

            if (height && parseInt(height) == 0) {
                zeroHeightEles.push(ele as HTMLDivElement);
            }
        });
        return zeroHeightEles;
    }
}
