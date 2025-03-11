import { GameState } from "./constants";
import { parseMap, wait } from "./helpers";
import { getBestNextMove, getMapAfterMove, getSpillCount, isMapValid } from "./old/old";
import { Tube } from "./Tube";

export class Level {
    map: string;
    history: string[];
    board!: Tube[];
    selectedTubeIdx: number | null;
    element: HTMLDivElement;
    state = GameState.idle;

    constructor(map: string) {
        if (!isMapValid(map)) {
            console.error("invalid map!!!!");
        }

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
        this.state = GameState.pouring;

        await tubeA.pourInto(tubeB);

        const updatedMap = getMapAfterMove(this.map, { from: tubeA.idx, to: tubeB.idx });

        this.history.push(updatedMap);
        this.map = updatedMap;
        this.state = GameState.idle;
    }

    goBackInTime() {
        // console.log("goBackInTime", this);

        if (this.history.length <= 1) return;

        this.history.pop();
        this.map = this.history.at(-1)!;

        this.#setBoard(this.map);
    }

    async doBestMove() {
        if (this.state == GameState.pouring) {
            console.log("wait, my friend!");
            return;
        }

        const move = getBestNextMove(this.map);
        console.log("do best move", move, this.state);

        if (!move) {
            // @TODO: trigger game over
            console.log("no best move 😩");
            return;
        }

        const { from, to } = move;
        const tubeA = this.getTubeByIdx(from);
        const tubeB = this.getTubeByIdx(to);

        await this.pour(tubeA, tubeB);

        const updatedMap = getMapAfterMove(this.map, { from: tubeA.idx, to: tubeB.idx });

        this.history.push(updatedMap);
        this.map = updatedMap;
    }

    #onWindowClick(e: MouseEvent) {
        const composedPath = e.composedPath() as HTMLElement[];

        const clickedTube = composedPath.find((el) => el?.classList?.contains("tube"));
        const clickedGoBackInTimeBtn = composedPath.find((el) => el.id === "go-back-in-time-btn");
        const clickedBestMoveBtn = composedPath.find((el) => el.id === "best-move-btn");

        // console.log(composedPath, clickedTube, clickedGoBackInTimeBtn, clickedBestMoveBtn);

        if (clickedBestMoveBtn) {
            this.doBestMove();
            return;
        }

        if (clickedGoBackInTimeBtn) {
            this.goBackInTime();
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
