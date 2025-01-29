type GameMove = { from: number; to: number };

const spliceString = (str: string, start: number, deleteCount: number, insertText: string) => {
  // Extract the part before the removal
  let before = str.slice(0, start);
  // Extract the part after the removal
  let after = str.slice(start + deleteCount);
  // Combine the parts with the new text
  return before + insertText + after;
};

const uniqueCharacters = (str: string) => {
  const seen = new Set<string>();
  let result = "";

  for (const char of str) {
    if (!seen.has(char)) {
      seen.add(char);
      result += char;
    }
  }
  return result;
};

const isTubeFull = (tube: string) => {
  return tube.replace(/_/g, "").length === 4;
};
const isTubeEmpty = (tube: string) => {
  return tube.replace(/_/g, "").length === 0;
};

const parseMap = (map: string) => {
  return map.split(" ");
};

const isMapValid = (map: string) => {
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
};

const isGameSuccessful = (map: string) => {
  for (const tube of parseMap(map)) {
    //     if (!isTubeFull(tube) || !isTubeEmpty(tube) || new Set(...tube).size !== 1) {
    //       return false;
    //     }
    console.log(tube);

    if (uniqueCharacters(tube).length != 1) {
      return false;
    }
  }
  return true;
};

const getTubesByIdx = (map: string, indices: number[]) => {
  const result: Record<number, string> = {};
  for (const index of indices) {
    let start = index * 4 + index;
    let end = start + 4;
    result[index] = map.slice(start, end);
  }
  return result;
};

function getSpillCount(tubeA: string, tubeB: string) {
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

function performWaterSpill(tubeA: string, tubeB: string) {
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

  //   console.log("res ->", "A", tubeA);
  //   console.log("res ->", "B", tubeB);
  return { tubeA, tubeB };
}

function getMapAfterMove(map: string, move: GameMove) {
  const tubes = getTubesByIdx(map, [move.from, move.to]);
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

function checkAvailableMoves(map: string) {
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

let map01 = "bb__ gb__ g___ ggb_";
const map02 = "bbr_ gb__ g___ ggb_";
const map03 = "bb__ gb__ g___ ggb_ rr__ rr__";
const map04 = "bgro gbro bgor robg ____ ____ ____";

// console.log(checkAvailableMoves(map03));

type INode = { map: string; children: INode[] };

// const node = { map: map01, children: [] };
const node = { map: map03, children: [] };
const visited = new Set<string>();

function buildGraph(node: INode, maxIteration = 60_000) {
  if (maxIteration < 1 || visited.has(node.map)) {
    return;
  }
  const moves = checkAvailableMoves(node.map);

  if (moves.length == 0) {
    // console.log("dead end", node.map);
    return;
  }

  if (isGameSuccessful(node.map)) {
    console.log("SUCCESS!", node.map, maxIteration);
    return;
  }

  visited.add(node.map);

  for (let i = 0; i < moves.length; i++) {
    const move = moves[i];
    const resultMap = getMapAfterMove(node.map, move);
    const childNode = { map: resultMap, children: [] };

    node.children.push(childNode);

    buildGraph(childNode, maxIteration - 1);
  }
}

// console.log(buildGraph(node));
// console.log({ node, visited });

//

// console.log(getTubesByIdx(map01, [0, 1]));
// console.log(getTubesByIdx(map02, [0, 1, 2, 3]));
// console.log(getTubesByIdx(map03, [3, 4, 5]));
// console.log(map01);
// map01 = getMapAfterMove(map01, { from: 1, to: 0 });
// console.log(map01);
// map01 = getMapAfterMove(map01, { from: 3, to: 0 });
// console.log(map01);
// map01 = getMapAfterMove(map01, { from: 2, to: 3 });
// console.log(map01);
// map01 = getMapAfterMove(map01, { from: 1, to: 3 });
// console.log(map01);

// console.log("map01", parseMap(map01), isMapValid(map01));
// console.log("map02", parseMap(map02), isMapValid(map02));
// console.log(getSpillCount("____", "gb__"));
// console.log(getSpillCount("g___", "gb__"));
// console.log(getSpillCount("bb__", "b___"));
// console.log(getSpillCount("rbr_", "rrrr"));
// console.log(getSpillCount("rrrr", "gr__"));
// console.log(getSpillCount("rrr_", "grr_"));
// console.log(getSpillCount("rrrr", "grr_"));
// console.log(getSpillCount("rrrr", "gr__"));
// console.log(getSpillCount("rrrr", "r___"));
// console.log(getSpillCount("rrrr", "____"));

// performWaterSpill("____", "gb__");
// performWaterSpill("g___", "gb__");
// performWaterSpill("bb__", "b___");
// performWaterSpill("rbr_", "rrrr");
// performWaterSpill("rrrr", "gr__");
// performWaterSpill("rrr_", "grr_");
// performWaterSpill("rrrr", "grr_");
// performWaterSpill("rrrr", "gr__");
// performWaterSpill("rrrr", "r___");
// performWaterSpill("rrrr", "____");

// console.log(performWaterSpill("____", "gb__"));
// console.log(performWaterSpill("g___", "gb__"));
// console.log(performWaterSpill("bb__", "b___"));
// console.log(performWaterSpill("rbr_", "rrrr"));
// console.log(performWaterSpill("rrrr", "gr__"));
// console.log(performWaterSpill("rrr_", "grr_"));
// console.log(performWaterSpill("rrrr", "grr_"));
// console.log(performWaterSpill("rrrr", "gr__"));
// console.log(performWaterSpill("rrrr", "r___"));
// console.log(performWaterSpill("rrrr", "____"));

// console.log(isGameSuccessful("rrrr ____"));
console.log(isGameSuccessful("rrrr gggg ____ oooo ____"));
console.log(isGameSuccessful("rgrr gggo ____ rooo ____"));
