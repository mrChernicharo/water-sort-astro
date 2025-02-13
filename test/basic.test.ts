import { assert, expect, test, describe } from "vitest";
import { getDistToGround, getMapAfterMove, getSpillCount, performWaterSpill } from "../src/pages/old";
import { areMapsEqual } from "../src/pages/helpers";

// Edit an assertion and save to see HMR in action
test("getSpillCount", () => {
  expect(getSpillCount("gggg", "b___")).toEqual(0);
  expect(getSpillCount("gggg", "bb__")).toEqual(0);
  expect(getSpillCount("gggg", "bbb_")).toEqual(0);
  expect(getSpillCount("gggg", "bbbb")).toEqual(0);

  expect(getSpillCount("gggg", "g___")).toEqual(3);
  expect(getSpillCount("gggg", "bg__")).toEqual(2);
  expect(getSpillCount("gggg", "bbg_")).toEqual(1);
  expect(getSpillCount("gggg", "bbrg")).toEqual(0);

  expect(getSpillCount("gggg", "____")).toEqual(4);
  expect(getSpillCount("ggg_", "____")).toEqual(3);
  expect(getSpillCount("gg__", "____")).toEqual(2);
  expect(getSpillCount("g___", "____")).toEqual(1);

  expect(getSpillCount("rggg", "g___")).toEqual(3);
  expect(getSpillCount("rggg", "rg__")).toEqual(2);
  expect(getSpillCount("rggg", "rgg_")).toEqual(1);
  expect(getSpillCount("rggg", "rgrg")).toEqual(0);

  expect(getSpillCount("rggg", "rrrg")).toEqual(0);
  expect(getSpillCount("rggg", "rrg_")).toEqual(1);
  expect(getSpillCount("rggg", "rg__")).toEqual(2);
  expect(getSpillCount("rggg", "g___")).toEqual(3);

  expect(getSpillCount("rrgg", "rrrg")).toEqual(0);
  expect(getSpillCount("rrgg", "rrg_")).toEqual(1);
  expect(getSpillCount("rrgg", "rg__")).toEqual(2);
  expect(getSpillCount("rrgg", "g___")).toEqual(2);

  expect(getSpillCount("rrg_", "rrrg")).toEqual(0);
  expect(getSpillCount("rrg_", "rrg_")).toEqual(1);
  expect(getSpillCount("rrg_", "rg__")).toEqual(1);
  expect(getSpillCount("rrg_", "g___")).toEqual(1);
});

test("performWaterSpill", () => {
  expect(performWaterSpill("ggg_", "g___")).toEqual({ tubeA: "____", tubeB: "gggg" });
  expect(performWaterSpill("ggg_", "bg__")).toEqual({ tubeA: "g___", tubeB: "bggg" });

  expect(getSpillCount("bggg", "bbg_")).toEqual(1);
  expect(performWaterSpill("bggg", "bbg_")).toEqual({ tubeA: "bgg_", tubeB: "bbgg" });

  expect(getSpillCount("ggg_", "bbg_")).toEqual(1);
  expect(performWaterSpill("ggg_", "bbg_")).toEqual({ tubeA: "gg__", tubeB: "bbgg" });

  expect(getSpillCount("gg__", "bbg_")).toEqual(1);
  expect(performWaterSpill("gg__", "bbg_")).toEqual({ tubeA: "g___", tubeB: "bbgg" });

  expect(getSpillCount("gg__", "bg__")).toEqual(2);
  expect(performWaterSpill("gg__", "bg__")).toEqual({ tubeA: "____", tubeB: "bggg" });

  expect(getSpillCount("gg__", "bgg_")).toEqual(1);
  expect(performWaterSpill("gg__", "bgg_")).toEqual({ tubeA: "g___", tubeB: "bggg" });

  expect(getSpillCount("gg__", "gg__")).toEqual(2);
  expect(performWaterSpill("gg__", "gg__")).toEqual({ tubeA: "____", tubeB: "gggg" });

  expect(getSpillCount("bgg_", "gg__")).toEqual(2);
  expect(performWaterSpill("bgg_", "gg__")).toEqual({ tubeA: "b___", tubeB: "gggg" });

  expect(getSpillCount("bgg_", "bgg_")).toEqual(1);
  expect(performWaterSpill("bgg_", "bgg_")).toEqual({ tubeA: "bg__", tubeB: "bggg" });
});

test("getMapAfterMove", () => {
  expect(getMapAfterMove("bbb_ ggb_", { from: 0, to: 1 })).toEqual("bb__ ggbb");
  expect(getMapAfterMove("bbb_ ggb_", { from: 1, to: 0 })).toEqual("bbbb gg__");
  expect(getMapAfterMove("____ bbb_ ggb_", { from: 2, to: 1 })).toEqual("____ bbbb gg__");
  expect(getMapAfterMove("rrrr ____ bbb_ ggb_", { from: 3, to: 2 })).toEqual("rrrr ____ bbbb gg__");
});

test("getDistToGround", () => {
  expect(getDistToGround("gggg")).toEqual(0);
  expect(getDistToGround("g___")).toEqual(0);
  expect(getDistToGround("bggg")).toEqual(1);
  expect(getDistToGround("bg__")).toEqual(1);
  expect(getDistToGround("bgg_")).toEqual(1);
  expect(getDistToGround("bbgg")).toEqual(2);
  expect(getDistToGround("bbbg")).toEqual(3);
  expect(getDistToGround("bgbg")).toEqual(3);
  expect(getDistToGround("gbg_")).toEqual(2);

  expect(getDistToGround("gggg")).toEqual(0);
  expect(getSpillCount("gggg", "____")).toEqual(4);
});

test("areMapsEqual", () => {
  expect(areMapsEqual("____ ff__ ff__", "ff__ ____ ff__")).toBeTruthy();
  expect(areMapsEqual("rrb__ bbbr ffr_ ff__", "bbbr ff__ ffr_ rrb__")).toBeTruthy();
  expect(areMapsEqual("oo__ rrb__ bbbr ffr_ f___ oof_", "oof_ bbbr f___ oo__ ffr_ rrb__")).toBeTruthy();

  expect(areMapsEqual("ggg_ g___", "gg__ gg__")).toBeFalsy();
  expect(areMapsEqual("ggg_ g___ rrrr", "rrrr gg__ gg__")).toBeFalsy();
  expect(areMapsEqual("rrb__ bbr_ ffr_ ffb_", "bbbr ff__ ffr_ rrb__")).toBeFalsy();
});
