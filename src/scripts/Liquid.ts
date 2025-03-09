import gsap from "gsap";
import { COLORS, duration, type Color } from "./constants";

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
        // liquidEle.textContent = this.color; // <-- debug only

        liquidEle.style.zIndex = String(5 - this.idx);
        liquidEle.style.height = `${this.level}%`;

        ["left", "right"].forEach((side) => {
            const marker = document.createElement("div");
            marker.classList.add("marker");
            marker.dataset["side"] = side;

            const layer = document.createElement("div");
            layer.classList.add("layer");
            // layer.classList.add(cssColor);

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
