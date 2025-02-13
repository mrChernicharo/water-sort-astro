enum GameState {
  paused = "paused",
  active = "active",
}

export class GameModel {
  initialMap: string;
  state = GameState.paused;
  history: string[] = [];

  constructor(map: string) {
    if (!this.isMapValid(map)) throw Error("invalid map");
    this.initialMap = map;
  }

  getCurrentMap() {
    if (this.state != GameState.active) throw Error("should not call getCurrentMap when paused");
    return this.history.at(-1) ?? "";
  }

  gameStart() {
    this.state = GameState.active;
    this.history = [this.initialMap];
  }

  resetGame() {
    this.state = GameState.paused;
    this.history = [];
  }

  isMapValid(map: string) {
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
}
