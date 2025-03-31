export type ColumnLetter = "A" | "B" | "C" | "D" | "E" | "F" | "G" | "H"

export const columnTranslationKey: Array<ColumnLetter> = [
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
    const colLetter: ColumnLetter = columnTranslationKey[x - 1];
    return `${colLetter}${y}`;
};