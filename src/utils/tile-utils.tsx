import { Coordinate } from "../components/CommonTypes";
import { Piece } from "../assets/types/chesspiece/ChessPieceTypes";

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

export function getTileHighlights(draggingPieceID: string, allPieces: Piece[]): Coordinate[] {
    for (const piece of allPieces) {
        if (piece.id === draggingPieceID) {
            // TODO: Don't pass all the actual objects; pass a reduced version with coordinates to parse on its return
            return piece.calculateMovement(allPieces);
        }
    };
    return [];
};

export function getTileKeyFromCoordinates(x: number, y: number): string {
    const colLetter: ColumnLetter = columnTranslationKey[x - 1];
    return `${colLetter}${y}`;
};

