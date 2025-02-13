const MAX_DEPTH = 5;

type INode = { map: string; children: INode[]; path: string[] };
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
  const seen = new Set();
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
    if (uniqueCharacters(tube).length != 1) {
      return false;
    }
  }
  return true;
};

export const isCycling = (path: string[]) => {
  for (let i = path.length; i >= 0; i--) {
    if (i < path.length - 5) break;

    let move = path[i];
    let prevMove = path[i - 1] || null;
    let prevPrevMove = path[i - 2] || null;
    let prevPrevPrevMove = path[i - 3] || null;

    if (prevMove) {
      const reversedPrevMove = prevMove[2] + "-" + prevMove[0];
      if (move === reversedPrevMove) return true;
    }

    if (move === prevPrevMove) {
      return true;
    }

    // if (move === path[i - 4] && prevMove === path[i - 5]) {
    //   return true;
    // }
  }
  return false;
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

export function getSpillCount(tubeA: string, tubeB: string) {
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

export function performWaterSpill(tubeA: string, tubeB: string) {
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

export function getMapAfterMove(map: string, move: GameMove) {
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

export function checkAvailableMoves(map: string) {
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

export function calcHeuristic(map: string) {
  const tubes = parseMap(map);

  let score = 0;
  for (let i = 0; i < tubes.length; i++) {
    const tube = tubes[i];
    const colorCount = uniqueCharacters(tube).replace(/_/g, "").length;
    const waterCount = tube.replace(/_/g, "").length;
    // console.log({ tube, colorCount, waterCount });
    if (isTubeEmpty(tube) || colorCount == 1) {
      continue;
    }

    score += colorCount * waterCount;
  }
  // console.log({ score });
  return score;
}

export function dfs(node: INode, maxDepth = MAX_DEPTH) {
  const visited = new Set();
  const successfulPaths: string[][] = [];

  const recurse = (node: INode, maxDepth: number) => {
    if (maxDepth < 1) return;

    if (visited.has(node.map)) return;
    visited.add(node.map);

    if (isGameSuccessful(node.map)) {
      console.log("SUCCESS!", maxDepth, node);
      successfulPaths.push(node.path);
      return;
    }

    const moves = checkAvailableMoves(node.map);
    if (moves.length == 0) return;

    for (let i = 0; i < moves.length; i++) {
      const move = moves[i];
      const resultMap = getMapAfterMove(node.map, move);

      const childNode = {
        map: resultMap,
        children: [],
        path: node.path.concat(`${move.from}-${move.to}`),
        depth: MAX_DEPTH - maxDepth + 1,
        h: calcHeuristic(resultMap),
        ...(isGameSuccessful(resultMap) && { success: true }),
      };

      node.children.push(childNode);
    }

    for (const childNode of node.children) {
      recurse(childNode, maxDepth - 1);
    }
    return { node, successfulPaths };
  };

  return recurse(node, maxDepth);
}

export function bfs(
  node: { map: string; path: string[]; depth: number; h: number; success?: boolean },
  maxDepth = MAX_DEPTH
) {
  const visited = new Set();
  const queue = [node];

  while (queue.length > 0) {
    const curr = queue.shift();

    if (maxDepth < 1 || !curr) break;
    if (visited.has(curr.map)) continue;

    visited.add(curr.map);
    const moves = checkAvailableMoves(curr.map);

    const childNodes: { map: string; path: string[]; depth: number; h: number; success?: boolean }[] = [];

    for (let i = 0; i < moves.length; i++) {
      const move = moves[i];
      const resultMap = getMapAfterMove(curr.map, move);
      const success = isGameSuccessful(resultMap);
      const path = curr.path.concat(`${move.from}-${move.to}`);

      const childNode = {
        map: resultMap,
        path,
        depth: path.length,
        h: calcHeuristic(resultMap),
        ...(success && { success: true }),
      };
      // console.log(childNode);

      if (success) {
        return childNode;
      }
      childNodes.push(childNode);
    }

    childNodes.sort((a, b) => calcHeuristic(a.map) - calcHeuristic(b.map));
    // childNodes.sort((a, b) => getHeuristic(b.map) - getHeuristic(a.map));
    console.log(childNodes);

    for (let i = 0; i < childNodes.length; i++) {
      queue.push(childNodes[i]);
    }
  }
  return null;
}

type N = {
  map: string;
  move: GameMove | null;
  parent: N | null;
  children: N[];
  path: string[];
  depth: number;
  score: number;
};

export function getDistToGround(targetTube: string) {
  let topColor = "";

  for (let i = 3; i >= 0; i--) {
    const c = targetTube[i];
    if (!topColor && c != "_") {
      topColor = c;
    }

    if (topColor && c != topColor) {
      return i + 1;
    }
  }
  return 0;
}

const penalty = {
  uselessMove: -30,
};
const bonus: Record<string, Record<number | string, number>> = {
  spillCount: {
    0: 0,
    1: 3.5,
    2: 7,
    3: 10.5,
    4: -10,
  },
  distToGround: {
    0: 6,
    1: 4,
    2: 2,
    3: 1,
  },
  tube: {},
};

export function calcHeuristic2(node: N) {
  let score = 0;

  if (!node.parent || !node.move) return score;

  const { from, to } = node.move;

  const { [from]: prevTubeA, [to]: prevTubeB } = getTubesByIdx(node.parent.map, [from, to]);
  const { [from]: afterTubeA, [to]: afterTubeB } = getTubesByIdx(node.map, [from, to]);

  const spillCount = getSpillCount(prevTubeA, prevTubeB);
  const distToGround = getDistToGround(afterTubeB);
  console.log({ prevTubeA, prevTubeB, distToGround, spillCount, map: node.map, prevMap: node.parent.map });

  if ((distToGround == 0 && spillCount == 4) || spillCount == 0) {
    score += penalty.uselessMove;
  } else {
    score += bonus.distToGround[distToGround];
    score += bonus.spillCount[spillCount];
  }

  for (const t of parseMap(node.map)) {
    if (isTubeFull(t) || isTubeEmpty(t)) score += 2.25;
  }

  return score;
}

export function getBestNextMoveV1(map: string) {
  const root: N = { map, parent: null, children: [], depth: 0, path: [], score: 0, move: null };
  let kill = false;

  const search = (node: N) => {
    if (kill) return node;

    if (node.depth > MAX_DEPTH) {
      //   console.log("maxDepth", node.path);
      return node;
    }
    if (isGameSuccessful(node.map)) {
      console.log("Success", node.path);
      kill = true;
      return node;
    }
    if (isCycling(node.path)) {
      //   console.log("isCycling", node.path, node);
      return node;
    }
    const moves = checkAvailableMoves(node.map);
    if (moves.length === 0) {
      console.log("NO SOLUTION");
      return node;
    }
    const nodeChildren: N[] = [];
    for (const move of moves) {
      const parent = node;
      const path = parent.path.concat(`${move.from}-${move.to}`);
      const resultMap = getMapAfterMove(parent.map, move);
      const newNode = {
        parent,
        path,
        move,
        children: [],
        depth: parent.depth + 1,
        map: resultMap,
        score: 0,
      };

      newNode.score = calcHeuristic2(newNode);
      nodeChildren.push(newNode);
    }
    nodeChildren.sort((a, b) => a.score - b.score);
    for (const child of nodeChildren) {
      node.children.push(child);
    }
    for (const ch of node.children) {
      search(ch);
    }
    return node;
  };
  return search(root);
}

export function getBestNextMoveV2(map: string) {
  const root: N = { map, parent: null, children: [], depth: 0, path: [], score: 0, move: null };

  const queue: N[] = [root];
  let node: N;
  let found = false;

  while (queue.length && !found) {
    queue.sort((a, b) => b.score - a.score);
    node = queue.shift() as N;

    if (node.depth > MAX_DEPTH) {
      console.log("maxDepth", node.path);
      return node;
    }
    if (isGameSuccessful(node.map)) {
      console.log("Success", node.path);
      found = true;
      return node;
    }

    if (isCycling(node.path)) {
      //   console.log("isCycling", node.path, node);
      return node;
    }

    const moves = checkAvailableMoves(node.map);
    if (moves.length === 0) {
      // console.log("NO SOLUTION");
      return node;
    }

    for (const move of moves) {
      const parent = node;
      const path = parent.path.concat(`${move.from}-${move.to}`);
      const resultMap = getMapAfterMove(parent.map, move);
      const newNode = {
        parent,
        path,
        move,
        children: [],
        depth: parent.depth + 1,
        map: resultMap,
        score: 0,
      };

      newNode.score = calcHeuristic2(newNode);
      if (newNode.score > 0) queue.push(newNode);
    }
  }

  return null;

  // ***************************************************************

  // const search = (node: N) => {
  //   if (kill) return node;

  //   if (node.depth > MAX_DEPTH) {
  //     //   console.log("maxDepth", node.path);
  //     return node;
  //   }
  //   if (isGameSuccessful(node.map)) {
  //     console.log("Success", node.path);
  //     kill = true;
  //     return node;
  //   }
  //   if (isCycling(node.path)) {
  //     //   console.log("isCycling", node.path, node);
  //     return node;
  //   }
  //   const moves = checkAvailableMoves(node.map);
  //   if (moves.length === 0) {
  //     console.log("NO SOLUTION");
  //     return node;
  //   }
  //   const nodeChildren: N[] = [];
  //   for (const move of moves) {
  //     const parent = node;
  //     const path = parent.path.concat(`${move.from}-${move.to}`);
  //     const resultMap = getMapAfterMove(parent.map, move);
  //     const newNode = {
  //       parent,
  //       path,
  //       move,
  //       children: [],
  //       depth: parent.depth + 1,
  //       map: resultMap,
  //       score: 0,
  //     };

  //     newNode.score = calcHeuristic2(newNode);
  //     nodeChildren.push(newNode);
  //   }
  //   nodeChildren.sort((a, b) => a.score - b.score);
  //   for (const child of nodeChildren) {
  //     node.children.push(child);
  //   }
  //   for (const ch of node.children) {
  //     search(ch);
  //   }
  //   return node;
  // };
  // return search(root);
}

function getMapDiff(m1: string, m2: string) {
  const s1 = new Set(parseMap(m1));
  const s2 = new Set(parseMap(m2));
  //   console.log(s1, s2, s1.difference(s2));
  return s1.difference(s2);
}

export function areMapsEqual(m1: string, m2: string) {
  return getMapDiff(m1, m2).size == 0;
}

type NN = { map: string; path: GameMove[]; depth: number; parent: NN | null; score: number };

export function calcHeuristic3(node: NN) {
  let score = 0;

  if (!node.parent || !node.path) return score;

  const { from, to } = node.path.at(-1)!;

  const { [from]: prevTubeA, [to]: prevTubeB } = getTubesByIdx(node.parent.map, [from, to]);
  const { [from]: afterTubeA, [to]: afterTubeB } = getTubesByIdx(node.map, [from, to]);

  const spillCount = getSpillCount(prevTubeA, prevTubeB);
  const distToGround = getDistToGround(afterTubeB);
  //   console.log({ prevTubeA, prevTubeB, distToGround, spillCount, map: node.map, prevMap: node.parent.map });

  if ((distToGround == 0 && spillCount == 4) || spillCount == 0) {
    score += penalty.uselessMove;
  } else if (areMapsEqual(node.map, node.parent.map)) {
    score += penalty.uselessMove * 2;
  } else {
    score += bonus.distToGround[distToGround];
    score += bonus.spillCount[spillCount];

    for (const t of parseMap(node.map)) {
      if (isTubeFull(t) || isTubeEmpty(t)) score += 2.25;
      else if (uniqueCharacters(t).length === 2) score += 1;
    }
  }

  return score;
}

export function getBestNextMove(map: string) {
  const visited: Record<string, number> = {};
  const queue: NN[] = [{ map, depth: 0, parent: null, score: 0, path: [] }];

  while (queue.length) {
    const curr = queue.shift()!;

    // base case
    if (isGameSuccessful(curr.map)) {
      //   console.log("success", curr, "best move: ", curr.path[0]);
      return curr.path[0];
    }

    // base case
    if (curr.depth > MAX_DEPTH) {
      //   console.log("MAX_DEPTH reached", curr, "best move: ", curr.path[0]);
      return curr.path[0];
    }

    // skip if visited
    if (visited[curr.map]) {
      visited[curr.map]++;
      continue;
    } else {
      visited[curr.map] = 1;
    }

    const moves = checkAvailableMoves(curr.map);
    // skip if no available moves
    if (moves.length <= 0) {
      continue;
    }

    const resultMaps: NN[] = [];
    for (const m of moves) {
      const child = {
        map: getMapAfterMove(curr.map, m),
        depth: curr.depth + 1,
        parent: curr,
        score: 0,
        path: curr.path.concat(m),
      };
      // assign score
      child.score = calcHeuristic3(child);
      resultMaps.push(child);
    }

    // const sortedResults = resultMaps.slice().sort((a, b) => b.score - a.score);
    // for (const res of sortedResults) {}
    for (const res of resultMaps) {
      if (res.score > 0) queue.push(res);
    }
    queue.sort((a, b) => b.score - a.score);
    console.log({ curr, resultMaps, queue });
  }

  console.log("NO SOLUTION");
  return null;
}

// import type { INode, GameMove } from "../utils/tube-helpers.ts";
// import { isGameSuccessful } from "../utils/tube-helpers.ts";
// const spliceString = (str: string, start: number, deleteCount: number, insertText: string) => {
//   // Extract the part before the removal
//   let before = str.slice(0, start);
//   // Extract the part after the removal
//   let after = str.slice(start + deleteCount);
//   // Combine the parts with the new text
//   return before + insertText + after;
// };

// const uniqueCharacters = (str: string) => {
//   const seen = new Set<string>();
//   let result = "";

//   for (const char of str) {
//     if (!seen.has(char)) {
//       seen.add(char);
//       result += char;
//     }
//   }
//   return result;
// };

// const isTubeFull = (tube: string) => {
//   return tube.replace(/_/g, "").length === 4;
// };
// const isTubeEmpty = (tube: string) => {
//   return tube.replace(/_/g, "").length === 0;
// };

// const parseMap = (map: string) => {
//   return map.split(" ");
// };

// const isMapValid = (map: string) => {
//   const memory: Record<string, number> = {};

//   for (let i = 0; i < map.length; i++) {
//     if (["_", " "].includes(map[i])) continue;

//     if (!memory[map[i]]) {
//       memory[map[i]] = 1;
//     } else {
//       memory[map[i]]++;
//     }
//   }

//   for (const color in memory) {
//     if (memory[color] != 4) return false;
//   }
//   return true;
// };

// const isGameSuccessful = (map: string) => {
//   for (const tube of parseMap(map)) {
//     //     if (!isTubeFull(tube) || !isTubeEmpty(tube) || new Set(...tube).size !== 1) {
//     //       return false;
//     //     }
//     console.log(tube);

//     if (uniqueCharacters(tube).length != 1) {
//       return false;
//     }
//   }
//   return true;
// };

// const getTubesByIdx = (map: string, indices: number[]) => {
//   const result: Record<number, string> = {};
//   for (const index of indices) {
//     let start = index * 4 + index;
//     let end = start + 4;
//     result[index] = map.slice(start, end);
//   }
//   return result;
// };

// export function getSpillCount(tubeA: string, tubeB: string) {
//   const targetColor = tubeB.replace(/_/g, "").at(-1) ?? "_";

//   let currColorA = null;
//   let ASpillPotential = 0;
//   for (let i = 0; i < tubeA.length; i++) {
//     const ch = tubeA[i];
//     // console.log(ch, targetColor);
//     if (ch == "_") continue;

//     if (ch == targetColor || targetColor == "_") {
//       if (ch != currColorA) {
//         currColorA = ch;
//         ASpillPotential = 1;
//       } else {
//         ASpillPotential++;
//       }
//     } else {
//       ASpillPotential = 0;
//     }
//   }

//   let BCapacity = 0;
//   for (let i = 0; i < tubeB.length; i++) {
//     const ch = tubeB[i];
//     if (ch == "_") {
//       BCapacity++;
//     }
//   }

//   const spillCount = Math.min(ASpillPotential, BCapacity);
//   //   console.log("A", tubeA, { ASpillPotential });
//   //   console.log("B", tubeB, { BCapacity, targetColor, spillCount });
//   //   console.log("-------------------------------------");

//   return spillCount;
// }

// export function performWaterSpill(tubeA: string, tubeB: string) {
//   const targetColor = tubeA.replace(/_/g, "").at(-1) ?? "_";
//   const spillCount = getSpillCount(tubeA, tubeB);

//   //   console.log("==========================");
//   //   console.log("A", tubeA);
//   //   console.log("B", tubeB, "\n", { spillCount });
//   //   console.log("B", tubeB, "\n", { spillCount });

//   //   console.log({ tubeA, tubeB, spillCount });

//   const arrA = [];
//   let removeCount = spillCount;
//   for (let i = 3; i >= 0; i--) {
//     const color = tubeA[i];
//     arrA[i] = color;
//     if (color != "_" && removeCount > 0) {
//       removeCount--;
//       arrA[i] = "_";
//     }
//   }

//   const arrB = [];
//   let insertCount = spillCount;
//   for (let i = 0; i < 4; i++) {
//     const color = tubeB[i];
//     arrB.push(color);

//     if (color == "_" && insertCount > 0) {
//       insertCount--;
//       arrB[i] = targetColor;
//     }
//   }

//   tubeA = arrA.join("");
//   tubeB = arrB.join("");

//   //   console.log("res ->", "A", tubeA);
//   //   console.log("res ->", "B", tubeB);
//   return { tubeA, tubeB };
// }

// export function getMapAfterMove(map: string, move: GameMove) {
//   const tubes = getTubesByIdx(map, [move.from, move.to]);
//   const tA = tubes[move.from];
//   const tB = tubes[move.to];

//   const { tubeA, tubeB } = performWaterSpill(tA, tB);

//   for (const [i, index] of [move.from, move.to].entries()) {
//     let start = index * 4 + index;
//     const tube = i == 0 ? tubeA : tubeB;
//     map = spliceString(map, start, 4, tube);
//   }

//   return map;
// }

// export function checkAvailableMoves(map: string) {
//   const availableMoves: GameMove[] = [];

//   const tubes = parseMap(map);

//   for (let i = 0; i < tubes.length; i++) {
//     const tubeA = tubes[i];

//     let j = 0;
//     while (j < tubes.length) {
//       if (i != j) {
//         const tubeB = tubes[j];
//         const spillCount = getSpillCount(tubeA, tubeB);

//         if (spillCount > 0) {
//           //   console.log("act", { i, j, tubeA, tubeB, spillCount });
//           availableMoves.push({ from: i, to: j });
//         }
//       }
//       j++;
//     }
//   }
//   return availableMoves;
// }

const mapzz = "bbbb gggg cccc pppp mmii iimm ____ ____";
const map00 = "bbb_ gg__ bgg_";
let map01 = "bb__ gb__ g___ ggb_";
const map02 = "bbr_ gb__ g___ ggb_ rrr_";
const map03 = "bb__ gb__ g___ ggb_ rr__ rr__";
const map04 = "bgro gbro bgor robg ____ ____";
const map05 = "bgro gbro bgor robg ____ ____";
const map06 = "grbo rbr_ or__ ccgo bocc bgg_ ____";
const map07 = "grbo prbr orpp ccgo bocc bgpg ____ ____";
const map08 = "gtrr urgu brtu gbgz zubt ztbz ____ ____";
const map10 = "ewwe gtrr urgu brtu gbgz zubt ztbz ewew ____ ____"; // 10 tubes
const map11 = "ejew gtrr urgu brtu gbgz zubt ztbz ewew ppjw jpjp ____ ____";
const map12 = "ejew gtrr urgu brtu gbgz zubt ztbz ewew ppjw jpjp yhhh hyyy ____ ____";
const map13 = "ejew gtra urgu brtx gbgz zubt zthz ywew ppjw xara axux jpjp yhbh hyye ____ ____";
const map14 = "ejew gtra urgu brtx gbgz zubt zthz ykew fpjw xara axux jpjp yhbh hkye kyfp ffwk ____ ____"; // 18 tubes
const map15 = "ejew gtra urgu brtx gbgz zubt zthz ykew fpjw xira amux jpjp yhbh hkye kyfp mfwk iixm mfai ____ ____"; // 20 tubes

// function runAutoGame() {
//   let myMap = map15;
//   console.log("initial map -> ", myMap);
//   console.log("isMapValid -> ", isMapValid(myMap));
//   let move = getBestNextMove(myMap);

//   while (move) {
//     myMap = getMapAfterMove(myMap, move);
//     // console.log(`${move.from} -> ${move.to} => "${myMap}"`);
//     move = getBestNextMove(myMap);
//   }
// }

// runAutoGame();

// const interval = setInterval(() => {
//   const move = getBestNextMove(myMap);
//   if (!move) {
//     console.log("FUDEEEO");
//     return clearInterval(interval);
//   }

//   myMap = getMapAfterMove(myMap, move);
//   console.log(`${move.from} -> ${move.to} = ${myMap}`);

//   if (isGameSuccessful(myMap)) {
//     console.log("WIN");
//     return clearInterval(interval);
//   }
// }, 0);

// gggg, rrrr, bbbb, oooo, pppp, cccc
// mm, dd, iiii, wwww

// console.log(checkAvailableMoves(map03));

// export function buildGraph(node: INode, maxIteration = 60_000) {
//   if (maxIteration < 1 || visited.has(node.map)) {
//     return;
//   }
//   const moves = checkAvailableMoves(node.map);

//   if (moves.length == 0) {
//     // console.log("dead end", node.map);
//     return;
//   }

//   if (isGameSuccessful(node.map)) {
//     // console.log("SUCCESS!", node.map, maxIteration);
//     return;
//   }

//   visited.add(node.map);

//   for (let i = 0; i < moves.length; i++) {
//     const move = moves[i];
//     const resultMap = getMapAfterMove(node.map, move);
//     const childNode = { map: resultMap, children: [], path: node.path.concat(`${move.from}-${move.to}`) };

//     node.children.push(childNode);

//     buildGraph(childNode, maxIteration - 1);
//   }
// }
// type INode = { map: string; children: INode[]; path: string[] };

// const node = { map: map01, children: [] };
// const node: INode = { map: map03, children: [], path: [] };
// const node: INode = { map: map06, children: [], path: [] };

// const visited = new Set<string>();

/*******************************************************************/
/*******************************************************************/
/*******************************************************************/
/*******************************************************************/

// const worker = new Worker(new URL("../workers/graph-build.js", import.meta.url));

// worker.addEventListener("message", (ev) => {
//   console.log("response from worker", ev.data);
//   const { bestMove, resultMap } = ev.data;

//   if (isGameSuccessful(resultMap)) {
//     console.log("SUCCESS!", resultMap);
//     return;
//   }

//   worker.postMessage({ map: resultMap, children: [], path: [] });
// });

// worker.addEventListener("error", (ev) => {
//   console.log("error from worker", ev);
// });

// const node = { map: map03, children: [], path: [] };
// console.log(node);
// worker.postMessage(node);

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
// console.log(isGameSuccessful("rrrr gggg ____ oooo ____"));
// console.log(isGameSuccessful("rgrr gggo ____ rooo ____"));
