self.addEventListener("message", (event) => {
  // Perform some computation or task
  const result = main(event.data);

  // Send the result back to the main thread
  self.postMessage(result);
});

//

//

const spliceString = (str, start, deleteCount, insertText) => {
  // Extract the part before the removal
  let before = str.slice(0, start);
  // Extract the part after the removal
  let after = str.slice(start + deleteCount);
  // Combine the parts with the new text
  return before + insertText + after;
};

const uniqueCharacters = (str) => {
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

const isTubeFull = (tube) => {
  return tube.replace(/_/g, "").length === 4;
};
const isTubeEmpty = (tube) => {
  return tube.replace(/_/g, "").length === 0;
};

const parseMap = (map) => {
  return map.split(" ");
};

const isMapValid = (map) => {
  const memory = {};

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

const isGameSuccessful = (map) => {
  for (const tube of parseMap(map)) {
    //     if (!isTubeFull(tube) || !isTubeEmpty(tube) || new Set(...tube).size !== 1) {
    //       return false;
    //     }
    // console.log(tube);

    if (uniqueCharacters(tube).length != 1) {
      return false;
    }
  }
  return true;
};

const getTubesByIdx = (map, indices) => {
  const result = {};
  for (const index of indices) {
    let start = index * 4 + index;
    let end = start + 4;
    result[index] = map.slice(start, end);
  }
  return result;
};

function getSpillCount(tubeA, tubeB) {
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

function performWaterSpill(tubeA, tubeB) {
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

function getMapAfterMove(map, move) {
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

function checkAvailableMoves(map) {
  const availableMoves = [];

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

function calcHeuristic(map) {
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

const MAX_DEPTH = 25;

function dfs(node, maxDepth = MAX_DEPTH) {
  const visited = new Set();
  const successfulPaths = [];

  const recurse = (node, maxDepth) => {
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

function bfs(node, maxDepth = MAX_DEPTH) {
  const visited = new Set();
  const queue = [node];

  while (queue.length > 0) {
    const curr = queue.shift();

    if (maxDepth < 1) break;
    if (visited.has(curr.map)) continue;

    visited.add(curr.map);
    const moves = checkAvailableMoves(curr.map);

    const childNodes = [];
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
    // console.log(childNodes);

    for (let i = 0; i < childNodes.length; i++) {
      queue.push(childNodes[i]);
    }
  }
  return null;
}

function getBestNextMove(map) {
  const moves = checkAvailableMoves(map);

  let bestMove;
  let bestScore = Infinity;

  for (const move of moves) {
    const newMap = getMapAfterMove(map, move);
    const hScore = calcHeuristic(newMap);
    if (hScore < bestScore) {
      bestScore = hScore;
      bestMove = move;
    }
  }

  return bestMove;
}

function main(node, maxDepth = MAX_DEPTH) {
  // dfs(node, maxDepth);
  // const res = bfs(node, maxDepth);
  // return res;
  const bestMove = getBestNextMove(node.map);
  return bestMove;
}

// const recurse = (node, maxDepth) => {
//   if (maxDepth < 1) return;

//   if (visited.has(node.map)) return;
//   visited.add(node.map);

//   if (isGameSuccessful(node.map)) {
//     console.log("SUCCESS!", maxDepth, node);
//     successfulPaths.push(node.path);
//     return;
//   }

//   const moves = checkAvailableMoves(node.map);
//   if (moves.length == 0) return;

//   for (let i = 0; i < moves.length; i++) {
//     const move = moves[i];
//     const resultMap = getMapAfterMove(node.map, move);

//     const childNode = {
//       map: resultMap,
//       children: [],
//       path: node.path.concat(`${move.from}-${move.to}`),
//       depth: MAX_DEPTH - maxDepth + 1,
//       ...(isGameSuccessful(resultMap) && { success: true }),
//     };

//     node.children.push(childNode);
//   }

//   for (const childNode of node.children) {
//   }
// };

// return recurse(node, maxDepth);
// }
