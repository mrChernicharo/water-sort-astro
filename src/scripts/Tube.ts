import gsap from "gsap";
import { COLORS, type Color } from "./constants";
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
        const { emptySpaces, pouringLiquids, remainingLiquids } =
            this.parsePouringLiquids(spillCount);

        console.log("drain empty", {
            emptySpaces: cloneDeep(emptySpaces),
            pouringLiquids: cloneDeep(pouringLiquids),
            remainingLiquids: cloneDeep(remainingLiquids),
        });

        let remaining = pouringLiquids.concat(remainingLiquids);
        let level = 100 / remaining.length;

        // drain empty
        emptySpaces.forEach((lq) => lq.setLevel(0));
        // expand the rest
        remaining.forEach((lq) => lq.setLevel(level));

        await wait(duration * 1000);

        console.log("drain pouring");
        remaining = remainingLiquids;

        if (remaining.length > 0) {
            level = 100 / remaining.length;

            for (const lq of pouringLiquids) {
                const newEmptyLiquid = new Liquid("_", lq.idx, 0);
                newEmptyLiquid.element.classList.add("temp");
                // insert empty siblings before pouring liquids
                lq.element.insertAdjacentElement("beforebegin", newEmptyLiquid.element);
                // drain pouringLiquid
                lq.setLevel(0);
            }
            // expand the rest
            remaining.forEach((lq) => lq.setLevel(level));

            await wait(duration * 1000);

            for (const zeroHeightEle of this.getZeroHeightLiquids()) {
                console.log(zeroHeightEle);
                console.log(Number(zeroHeightEle.dataset.idx));

                // console.log(cloneDeep(zeroHeightEle));
            }

            // const tempEles = [...this.element.querySelectorAll(".liquid.temp")];
            // console.log({ tempEles });
        }

        await wait(duration * 1000);

        // scale back
        console.log("Time to scale back");

        // pouringLiquids.forEach(lq => {

        // })

        // const largestChange = Math.max(
        //     remainingLiquids.length,
        //     pouringLiquids.length,
        //     emptySpaces.length
        // );

        // let pouringLiquid;

        // for (let i = 0; i < largestChange; i++) {
        //     emptySpaces[i]?.setLevel(0);

        //     if (remainingLiquids.length > 0) {
        //         pouringLiquids[i]?.setLevel(0);
        //         remainingLiquids[i]?.setLevel(level);
        //     }
        // }

        // const enlargedLiquids = this.liquids.filter((lq) => lq.level > 25);

        // // let lgIdx = 0;
        // console.log("drain", { spillCount, enlargedLiquids: cloneDeep(enlargedLiquids) });
        // //
        // await wait(2000);

        // for (let i = 0; i < largestChange; i++) {
        //     const pouring = pouringLiquids[i];
        //     if (pouring) {
        //         let liquid = this.getLiquidByIdx(pouring.idx);
        //         const newEmptyLiquid = new Liquid("_", liquid.idx, 0);

        //         liquid.element.insertAdjacentElement("beforebegin", newEmptyLiquid.element);
        //         liquid.color = newEmptyLiquid.color;
        //         liquid.level = newEmptyLiquid.level;
        //         liquid.element = newEmptyLiquid.element;
        //         liquid.setLevel(25);
        //     }
        //     emptySpaces[i]?.setLevel(25);
        //     remainingLiquids[i]?.setLevel(25);
        // }
        // await wait(2000);

        // // this.rotateTo(0);
        // this.colorStr = resultColorStr;
        // this.#clearTemporaryElements();
        // // console.log("drain", this);
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

    #clearTemporaryElements() {
        const removingEles = this.getZeroHeightLiquids();
        removingEles.forEach((ele) => ele.remove());
    }
}
