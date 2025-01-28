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
  console.log("A", tubeA, { ASpillPotential });
  console.log("B", tubeB, { BCapacity, targetColor, spillCount });
  console.log("-------------------------------------");

  return spillCount;
}

const map01 = "bb__ gb__ g___ ggb_";
const map02 = "bbr_ gb__ g___ ggb_";

console.log("map01", parseMap(map01), isMapValid(map01));
console.log("map02", parseMap(map02), isMapValid(map02));
console.log(getSpillCount("____", "gb__"));
console.log(getSpillCount("g___", "gb__"));
console.log(getSpillCount("bb__", "b___"));
console.log(getSpillCount("rbr_", "rrrr"));
console.log(getSpillCount("rrrr", "gr__"));
console.log(getSpillCount("rrr_", "grr_"));
console.log(getSpillCount("rrrr", "grr_"));
console.log(getSpillCount("rrrr", "gr__"));
console.log(getSpillCount("rrrr", "r___"));
console.log(getSpillCount("rrrr", "____"));

type INode = { map: string; children: INode[] };

const node = { map: map01, children: [] };
const visited = new Set<string>();
function buildGraph(node: INode) {}
