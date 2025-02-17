export const COLORS = {
  a: "aqua",
  b: "brown",
  c: "cyan",
  d: "darkblue",
  e: "emerald",
  f: "fuchsia",
  g: "gold",
  h: "hotpink",
  i: "indigo",
  j: "jade",
  k: "khaki",
  l: "lavender",
  m: "magenta",
  n: "navy",
  o: "orange",
  p: "purple",
  q: "quartz",
  r: "red",
  s: "silver",
  t: "teal",
  u: "ultramarine",
  v: "violet",
  w: "white",
  x: "xanadu",
  y: "yellow",
  z: "zucchini",
};

export type Color = keyof typeof COLORS;

export type GameMove = { from: number; to: number };
