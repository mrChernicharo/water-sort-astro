export const COLORS = {
    // a: "aqua",
    // b: "cornflowerBlue",
    // c: "lightBlue",
    // d: "goldenRod",
    // e: "DarkTurquoise",
    // f: "mediumSpringGreen",
    // g: "lightGreen",
    // h: "hotpink",
    // i: "yellowGreen",
    // j: "slateBlue",
    // k: "khaki",
    // l: "lightSeaGreen",
    // m: "mediumOrchid",
    // n: "mediumSeaGreen",
    // o: "orange",
    // p: "purple",
    // q: "salmon",
    // r: "red",
    // s: "silver",
    // t: "teal",
    // u: "plum",
    // v: "violet",
    // w: "wheat",
    // x: "indianRed",
    // y: "yellow",
    // z: "pink",
    a: "hsl(0, 100%, 50%)",
    b: "hsl(15, 90%, 60%)",
    c: "hsl(30, 80%, 70%)",
    d: "hsl(45, 70%, 80%)",
    e: "hsl(60, 60%, 90%)",
    f: "hsl(180, 90%, 40%)",
    g: "hsl(160, 90%, 25%)",
    h: "hsl(105, 80%, 40%)",
    i: "hsl(120, 70%, 70%)",
    j: "hsl(75, 100%, 40%)",
    k: "hsl(150, 35%, 60%)",
    l: "hsl(165, 100%, 30%)",
    m: "hsl(225, 100%, 50%)",
    n: "hsl(195, 80%, 50%)",
    o: "hsl(210, 70%, 60%)",
    p: "hsl(225, 60%, 70%)",
    q: "hsl(240, 50%, 80%)",
    r: "hsl(255, 100%, 30%)",
    s: "hsl(270, 90%, 30%)",
    t: "hsl(285, 80%, 40%)",
    u: "hsl(300, 70%, 50%)",
    v: "hsl(315, 60%, 60%)",
    w: "hsl(330, 50%, 70%)",
    x: "hsl(345, 100%, 10%)",
    y: "hsl(360, 90%, 20%)",
    z: "hsl(10, 80%, 30%)",
};

export type Color = keyof typeof COLORS;

export type GameMove = { from: number; to: number };

export enum GameState {
    idle = "idle",
    pouring = "pouring",
}

export enum RotationDir {
    clockwise = "clockwise",
    anticlock = "anticlock",
}

export const TUBE_HEIGHT = 200;
export const TUBE_WIDTH = 56;

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
// export const duration = 2;
// export const duration = 10;
