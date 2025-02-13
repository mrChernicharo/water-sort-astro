import { GameController } from "../scripts/controller";
import { GameModel } from "../scripts/model";
import { GameView } from "../scripts/view";

function main() {
  let map = "bbrr rgrg ggbb ____ ____";

  const model = new GameModel(map);
  const view = new GameView(model);
  const controller = new GameController({ model, view });
  console.log("controller", controller);
}

main();
