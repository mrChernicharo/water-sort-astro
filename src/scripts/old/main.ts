import { GameController } from "./controller";
import { GameModel } from "./model";
import { GameView } from "./view";

function main() {
    let map = "bbrr rgrg ggbb ____ ____";

    const model = new GameModel(map);
    const view = new GameView(model);
    const controller = new GameController({ model, view });
    console.log("controller", controller);
}

main();
