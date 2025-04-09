import { Coordinate } from "./coordinate";
import { Piece } from "../assets/types/chesspiece/ChessPieceTypes";
import { ChessTileInterface } from "../components/ChessTile";
import Globals from "../config/globals";
import { PieceView } from "./piece-utils";

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

export function getTileHighlights(targetPiece: Piece, allPieces: PieceView[]): Coordinate[] {
    for (const piece of allPieces) {
        if (piece.id === targetPiece.id) {
            // TODO: Don't pass all the actual objects; pass a reduced version with coordinates to parse on its return
            return targetPiece.calculateMovement(allPieces);
        }
    };
    return [];
};

export function getTileKeyFromCoordinate(coordinate: Coordinate): string {
    const colLetter: ColumnLetter = columnTranslationKey[coordinate.x - 1];
    return `${colLetter}${coordinate.y}`;
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
export function isPieceAtTile(tile: ChessTileInterface, allPieces: PieceView[] | Piece[]): boolean {
    for (const piece of allPieces) {
        if (piece.coordinate.x === tile.x && piece.coordinate.y === tile.y) {
            return true;
        }
    }
    return false;
}

export function getPieceViewAtCoordinate(coordinate: Coordinate, allPieces: PieceView[]): PieceView | null {
    for (const piece of allPieces) {
        if (piece.coordinate.x === coordinate.x && piece.coordinate.y === coordinate.y) {
            return piece;
        };
    };
    return null;
}

export function getPieceAtCoordinate(coordinate: Coordinate, allPieces: Piece[]): Piece | null {
    for (const piece of allPieces) {
        if (piece.coordinate.x === coordinate.x && piece.coordinate.y === coordinate.y) {
            return piece;
        };
    };
    return null;
}

export function isPieceAtCoordinate(coordinate: Coordinate, allPieces: PieceView[]): boolean {
    for (const piece of allPieces) {
        if (piece.coordinate.x === coordinate.x && piece.coordinate.y === coordinate.y) {
            return true;
        };
    };
    return false;
}