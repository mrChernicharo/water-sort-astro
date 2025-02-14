import type { GameMove } from "../pages/constants";
import { parseMap, uniqueCharacters, spliceString } from "../pages/helpers";
import { getSpillCount, performWaterSpill } from "../pages/old";

export class GameModel {
  #initialMap: string;
  #history: string[] = [];
  #selectedTubeIdx: number | null = null;

  constructor(map: string) {
    if (!GameModel.isMapValid(map)) throw Error("invalid map");
    this.#initialMap = map;
  }

  get selectedTubeIdx() {
    return this.#selectedTubeIdx;
  }

  getCurrentMap() {
    return this.#history.at(-1) ?? "";
  }

  gameStart() {
    this.#history = [this.#initialMap];
  }

  getTubesByIdx = (indices: number[]) => {
    const map = this.getCurrentMap();
    const result: Record<number, string> = {};
    for (const index of indices) {
      let start = index * 4 + index;
      let end = start + 4;
      result[index] = map.slice(start, end);
    }
    return result;
  };

  selectTube(idx: number | null) {
    if (idx === this.#selectedTubeIdx) this.#selectedTubeIdx = null;
    else this.#selectedTubeIdx = idx;
  }

  static isMapValid(map: string) {
    const memory: Record<string, number> = {};

    for (let i = 0; i < map.length; i++) {
      if (["_", " "].includes(map[i])) continue;

      if (!memory[map[i]]) {
        memory[map[i]] = 1;
      } else {
        memory[map[i]]++;
      }
    }

    for (const color in memory) {
      if (memory[color] != 4) return false;
    }
    return true;
  }

  isGameSuccessful = () => {
    const map = this.getCurrentMap();
    for (const tube of parseMap(map)) {
      if (uniqueCharacters(tube).length != 1) {
        return false;
      }
    }
    return true;
  };

  getSpillCount(tubeA: string, tubeB: string) {
    const targetColor = tubeB.replace(/_/g, "").at(-1) ?? "_";

    let currColorA = null;
    let ASpillPotential = 0;
    for (let i = 0; i < tubeA.length; i++) {
      const ch = tubeA[i];
      // console.log(ch, targetColor);
      if (ch == "_") continue;

      if (ch == targetColor || targetColor == "_") {
        if (ch != currColorA) {
          currColorA = ch;
          ASpillPotential = 1;
        } else {
          ASpillPotential++;
        }
      } else {
        ASpillPotential = 0;
      }
    }

    let BCapacity = 0;
    for (let i = 0; i < tubeB.length; i++) {
      const ch = tubeB[i];
      if (ch == "_") {
        BCapacity++;
      }
    }

    const spillCount = Math.min(ASpillPotential, BCapacity);
    //   console.log("A", tubeA, { ASpillPotential });
    //   console.log("B", tubeB, { BCapacity, targetColor, spillCount });
    //   console.log("-------------------------------------");

    return spillCount;
  }

  performWaterSpill(tubeA: string, tubeB: string) {
    const targetColor = tubeA.replace(/_/g, "").at(-1) ?? "_";
    const spillCount = getSpillCount(tubeA, tubeB);

    //   console.log("==========================");
    //   console.log("A", tubeA);
    //   console.log("B", tubeB, "\n", { spillCount });
    //   console.log("B", tubeB, "\n", { spillCount });

    //   console.log({ tubeA, tubeB, spillCount });

    const arrA = [];
    let removeCount = spillCount;
    for (let i = 3; i >= 0; i--) {
      const color = tubeA[i];
      arrA[i] = color;
      if (color != "_" && removeCount > 0) {
        removeCount--;
        arrA[i] = "_";
      }
    }

    const arrB = [];
    let insertCount = spillCount;
    for (let i = 0; i < 4; i++) {
      const color = tubeB[i];
      arrB.push(color);

      if (color == "_" && insertCount > 0) {
        insertCount--;
        arrB[i] = targetColor;
      }
    }

    tubeA = arrA.join("");
    tubeB = arrB.join("");

    //   console.log("A", tubeA, "->", "B", tubeB);
    return { tubeA, tubeB };
  }

  getMapAfterMove(move: GameMove) {
    let map = this.getCurrentMap();
    const tubes = this.getTubesByIdx([move.from, move.to]);
    const tA = tubes[move.from];
    const tB = tubes[move.to];

    const { tubeA, tubeB } = performWaterSpill(tA, tB);

    for (const [i, index] of [move.from, move.to].entries()) {
      let start = index * 4 + index;
      const tube = i == 0 ? tubeA : tubeB;
      map = spliceString(map, start, 4, tube);
    }

    return map;
  }

  checkAvailableMoves() {
    const map = this.getCurrentMap();

    const availableMoves: GameMove[] = [];

    const tubes = parseMap(map);

    for (let i = 0; i < tubes.length; i++) {
      const tubeA = tubes[i];

      let j = 0;
      while (j < tubes.length) {
        if (i != j) {
          const tubeB = tubes[j];
          const spillCount = getSpillCount(tubeA, tubeB);

          if (spillCount > 0) {
            //   console.log("act", { i, j, tubeA, tubeB, spillCount });
            availableMoves.push({ from: i, to: j });
          }
        }
        j++;
      }
    }
    return availableMoves;
  }
}
