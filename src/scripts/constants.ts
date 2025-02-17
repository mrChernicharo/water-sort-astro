export const COLORS = {
    a: "aqua",
    b: "dodgerBlue",
    c: "cyan",
    d: "darkblue",
    e: "DarkTurquoise", // emerald
    f: "fuchsia",
    g: "lightGreen",
    h: "hotpink",
    i: "indigo",
    j: "jade",
    k: "khaki",
    l: "lavender",
    m: "mediumOrchid",
    n: "navy",
    o: "orange",
    p: "purple",
    q: "royalBlue",
    r: "red",
    s: "silver",
    t: "teal",
    u: "plum",
    v: "violet",
    w: "wheat",
    x: "indianRed",
    y: "yellow",
    z: "orangeRed",
    _: "transparent",
};

export type Color = keyof typeof COLORS;

export type GameMove = { from: number; to: number };

export const TUBE_HEIGHT = 200;
export const TUBE_WIDTH = 50;
