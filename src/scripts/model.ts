export class Game {
  state: string[] = [];

  constructor() {}

  start(board: string) {
    this.state.push(board);
    return this.state[0];
  }
}
