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
    z: "pink",
    _: "transparent",
};

export type Color = keyof typeof COLORS;

export type GameMove = { from: number; to: number };

export const TUBE_HEIGHT = 200;
export const TUBE_WIDTH = 50;

export const HEIGHTS_DATA: Record<number, Record<number, number>> = {
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
export const ROTATION_DATA: Record<"ready" | "done", Record<number, number>> = {
    ready: {
        3: 0,
        2: 50,
        1: 68,
        0: 80,
    },
    done: {
        3: 50,
        2: 68,
        1: 80,
        0: 91,
    },
};

export const duration = 0.5;
// export const duration = 1;
