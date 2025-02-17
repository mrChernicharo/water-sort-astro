import { parseMap, wait } from "./helpers";
import { getMapAfterMove, getSpillCount } from "./old/old";
import { Tube } from "./Tube";

export class Level {
    map: string;
    board!: Tube[];
    selectedTubeIdx: number | null;
    element: HTMLDivElement;

    constructor(map: string) {
        this.map = map;

        this.selectedTubeIdx = null;

        this.element = document.querySelector("#board") as HTMLDivElement;

        this.#updateBoard();

        window.addEventListener("click", this.#onWindowClick.bind(this));
    }

    #updateBoard() {
        this.element.innerHTML = "";

        this.board = parseMap(this.map).map((colors, i) => {
            const tube = new Tube(colors, i);

            this.element.append(tube.element);

            return tube;
        });
    }

    getTubeByIdx(idx: number) {
        return this.board[idx];
    }

    canPour(tubeA: Tube, tubeB: Tube) {
        const fromColor = tubeA.getTopColor();
        const toColor = tubeB.getTopColor();
        // console.log("canPour", { tubeA, fromColor, tubeB, toColor });
        if (fromColor == null) return false;
        if (fromColor && toColor == null) return true;
        else return fromColor == toColor && !tubeB.isComplete();
    }

    async pour(tubeA: Tube, tubeB: Tube) {
        const spillCount = getSpillCount(tubeA.colorStr, tubeB.colorStr);

        const { pouringLiquids, emptySpaces, remainingLiquids } =
            tubeA.parsePouringLiquids(spillCount);

        console.log({ pouringLiquids, emptySpaces, remainingLiquids });

        // translate tubeA until it stays on top of tubeB
        // rotate A inwards

        // let expandCount = 4 - emptySpaces.length;
        // // shrink A emptySpaces
        // emptySpaces.forEach((emptyLiq) => emptyLiq.setLevel(0));

        // // expand A pouringLiquids + remainingLiquids
        // [...pouringLiquids, ...remainingLiquids].forEach((liquid) =>
        //     liquid.setLevel(100 / expandCount)
        // );

        // await wait(1000);

        // expandCount = 4 - emptySpaces.length - pouringLiquids.length;
        // // shrink A pouringLiquids
        // pouringLiquids.forEach((liquid) => liquid.setLevel(0));
        // // expand A remainingLiquids
        // remainingLiquids.forEach((liquid) => liquid.setLevel(100 / expandCount));

        await tubeA.pourInto(tubeB);
        // await wait(1000);

        // update A.liquids

        // console.log(tubeA, tubeB);

        // rotate backwards

        // reset A levels
        // tubeA.liquids.forEach((liquid) => liquid.setLevel(25));

        const updatedMap = getMapAfterMove(this.map, { from: tubeA.idx, to: tubeB.idx });
        this.map = updatedMap;
        // this.#updateBoard();
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
