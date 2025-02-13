import type { GameModel } from "./model";
import type { GameView } from "./view";

export class GameController {
  model: GameModel;
  view: GameView;
  constructor({ model, view }: { view: GameView; model: GameModel }) {
    this.model = model;
    this.view = view;

    this.view.startBtn.onclick = this.onStartBtnClicked.bind(this);
    this.view.resetBtn.onclick = this.onResetBtnClicked.bind(this);
  }

  onStartBtnClicked(e: MouseEvent) {
    this.model.gameStart();
    console.log(this.model);
  }

  onResetBtnClicked(e: MouseEvent) {
    this.model.resetGame();
    console.log(this.model);
  }
}
