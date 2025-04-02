import { Coordinate } from "../components/CommonTypes";
import { Piece } from "../assets/types/chesspiece/ChessPieceTypes";
import { ChessTileInterface } from "../components/ChessTile";
import Globals from "../config/globals";

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

export function isCoordinateValid(coord: Coordinate): boolean {
    if (coord.x >= 1 && coord.x <= Globals.BOARDSIZE) {
        if (coord.y >= 1 && coord.y <= Globals.BOARDSIZE) {
            return true;
        }
    }
    return false;
}

// TODO: As getTileHighlights; devise a way to just pass a view of pieces.
export function isPieceAtTile(tile: ChessTileInterface, allPieces: Piece[]): boolean {
    for (const piece of allPieces) {
        if (piece.x === tile.x && piece.y === tile.y) {
            return true;
        }
    }
    return false;
}