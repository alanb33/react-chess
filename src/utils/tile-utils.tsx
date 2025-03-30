export type Col = "A" | "B" | "C" | "D" | "E" | "F" | "G" | "H";

export const translationKey: Array<Col> = [
    "A",
    "B",
    "C",
    "D",
    "E",
    "F",
    "G",
    "H"
];

export function getTileKeyFromCoordinates(x: number, y: number): string {
    const colLetter: Col = translationKey[x - 1];
    return `${colLetter}${y}`;
};