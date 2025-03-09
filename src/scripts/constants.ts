export const COLORS = {
    a: "aqua",
    b: "cornflowerBlue",
    c: "lightBlue",
    d: "goldenRod",
    e: "DarkTurquoise",
    f: "mediumSpringGreen",
    g: "lightGreen",
    h: "hotpink",
    i: "yellowGreen",
    j: "slateBlue",
    k: "khaki",
    l: "lightSeaGreen",
    m: "mediumOrchid",
    n: "mediumSeaGreen",
    o: "orange",
    p: "purple",
    q: "salmon",
    r: "red",
    s: "silver",
    t: "teal",
    u: "plum",
    v: "violet",
    w: "wheat",
    x: "indianRed",
    y: "yellow",
    z: "pink",
    // a: "hsl(0, 100%, 50%)",
    // b: "hsl(10, 100%, 50%)",
    // c: "hsl(20, 100%, 50%)",
    // d: "hsl(30, 100%, 50%)",
    // e: "hsl(40, 100%, 50%)",
    // f: "hsl(50, 100%, 50%)",
    // g: "hsl(60, 100%, 50%)",
    // h: "hsl(70, 100%, 50%)",
    // i: "hsl(80, 100%, 50%)",
    // j: "hsl(90, 100%, 50%)",
    // k: "hsl(100, 100%, 50%)",
    // l: "hsl(110, 100%, 50%)",
    // m: "hsl(120, 100%, 50%)",
    // n: "hsl(130, 100%, 50%)",
    // o: "hsl(140, 100%, 50%)",
    // p: "hsl(150, 100%, 50%)",
    // q: "hsl(160, 100%, 50%)",
    // r: "hsl(170, 100%, 50%)",
    // s: "hsl(180, 100%, 50%)",
    // t: "hsl(190, 100%, 50%)",
    // u: "hsl(200, 100%, 50%)",
    // v: "hsl(210, 100%, 50%)",
    // w: "hsl(220, 100%, 50%)",
    // x: "hsl(230, 100%, 50%)",
    // y: "hsl(240, 100%, 50%)",
    // z: "hsl(250, 100%, 50%)",
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
