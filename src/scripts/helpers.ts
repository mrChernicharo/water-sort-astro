export function degToRad(deg: number) {
    return deg * (Math.PI / 180);
}

export const spliceString = (
    str: string,
    start: number,
    deleteCount: number,
    insertText: string
) => {
    // Extract the part before the removal
    let before = str.slice(0, start);
    // Extract the part after the removal
    let after = str.slice(start + deleteCount);
    // Combine the parts with the new text
    return before + insertText + after;
};

export const uniqueCharacters = (str: string) => {
    const seen = new Set();
    let result = "";

    for (const char of str) {
        if (!seen.has(char)) {
            seen.add(char);
            result += char;
        }
    }
    return result;
};

export const parseMap = (map: string) => {
    return map.split(" ");
};

export function getMapDiff(m1: string, m2: string) {
    const s1 = new Set(parseMap(m1));
    const s2 = new Set(parseMap(m2));
    //   console.log(s1, s2, s1.difference(s2));
    return s1.difference(s2);
}

export function areMapsEqual(m1: string, m2: string) {
    return getMapDiff(m1, m2).size == 0;
}

export async function wait(time: number) {
    return new Promise((resolve) => setTimeout(resolve, time));
}

export const isGameSuccessful = (map: string) => {
    for (const tube of parseMap(map)) {
        if (uniqueCharacters(tube).length != 1) {
            return false;
        }
    }
    return true;
};
