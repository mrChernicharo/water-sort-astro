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

export const POUR_DATA: Record<number, Record<number, number>> = {
    3: {
        3: 0,
        2: 30,
        1: 30,
        0: 40,
    },
    2: {
        3: 0,
        2: 0,
        1: 42,
        0: 58,
    },
    1: {
        3: 0,
        2: 0,
        1: 0,
        0: 80,
    },
    0: {
        3: 0,
        2: 0,
        1: 0,
        0: 0,
    },
};
export const ROTATION_DATA: Record<number, number> = {
    0: 91,
    1: 80,
    2: 68,
    3: 50,
};
