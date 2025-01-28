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

const map01 = "bb__ gb__ g___ ggb_";
const map02 = "bbr_ gb__ g___ ggb_";

console.log("map01", parseMap(map01), isMapValid(map01));
console.log("map02", parseMap(map02), isMapValid(map02));

// class Game {
//     map: string;
//     constructor(map: string) {
//         this.map = map;
//     }
// }
