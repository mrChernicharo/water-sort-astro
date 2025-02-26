import { parseMap, wait } from "./helpers";
import { getBestNextMove, getMapAfterMove, getSpillCount } from "./old/old";
import { Tube } from "./Tube";

export class Level {
    map: string;
    history: string[];
    board!: Tube[];
    selectedTubeIdx: number | null;
    element: HTMLDivElement;

    constructor(map: string) {
        this.map = map;
        this.history = [map];
        this.element = document.querySelector("#board") as HTMLDivElement;
        this.selectedTubeIdx = null;

        this.#setBoard(map);

        window.addEventListener("click", this.#onWindowClick.bind(this));
    }

    #setBoard(map: string) {
        this.element.innerHTML = "";

        this.board = parseMap(map).map((colors, i) => {
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
        console.log("canPour", { tubeA, fromColor, tubeB, toColor });
        if (fromColor == null) return false;
        if (fromColor && toColor == null) return true;
        else return fromColor == toColor && !tubeB.isComplete();
    }

    async pour(tubeA: Tube, tubeB: Tube) {
        await tubeA.pourInto(tubeB);
        const updatedMap = getMapAfterMove(this.map, { from: tubeA.idx, to: tubeB.idx });

        // @TODO remove setBoard
        // this.#setBoard(updatedMap);
        this.history.push(updatedMap);
        this.map = updatedMap;
        console.log(this);
    }

    goBackInTime() {
        if (this.history.length <= 1) return;

        this.history.pop();
        this.map = this.history.at(-1)!;

        this.#setBoard(this.map);
        console.log(this);
    }

    doBestMove() {
        const move = getBestNextMove(this.map);
        console.log("do best move", move);
        if (!move) {
            console.log("no best move 😩");
            return;
        }
        const { from, to } = move;
        const tubeA = this.getTubeByIdx(from);
        const tubeB = this.getTubeByIdx(to);

        tubeA.pourInto(tubeB);
        const updatedMap = getMapAfterMove(this.map, { from: tubeA.idx, to: tubeB.idx });

        // @TODO remove setBoard
        // this.#setBoard(updatedMap);
        this.history.push(updatedMap);
        this.map = updatedMap;
        console.log(this);
    }

    #onWindowClick(e: MouseEvent) {
        const composedPath = e.composedPath();

        const clickedTube = composedPath.find((el) =>
            (el as HTMLElement)?.classList?.contains("tube")
        ) as HTMLDivElement;

        const clickedGoBackInTimeBtn = composedPath.find(
            (el) => (el as HTMLElement).id === "go-back-in-time-btn"
        ) as HTMLButtonElement;

        const clickedBestMoveBtn = composedPath.find(
            (el) => (el as HTMLElement).id === "best-move-btn"
        ) as HTMLButtonElement;

        // console.log(composedPath, clickedTube, clickedGoBackInTimeBtn);

        if (clickedGoBackInTimeBtn) {
            this.goBackInTime();
        }

        if (clickedBestMoveBtn) {
            this.doBestMove();
        }

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

        if (!clickedTube && this.selectedTubeIdx != null) {
            const tube = this.getTubeByIdx(this.selectedTubeIdx);
            this.selectedTubeIdx = null;
            tube.deselect();
        }
    }
}
