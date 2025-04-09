import { Coordinate } from "./coordinate";
import { Pawn, Piece, SpecialMovablePiece } from "../assets/types/chesspiece/ChessPieceTypes";

// Reduced read-only view of a Piece for passing less information around
export class PieceView {
    readonly id: string;
    readonly _x: number;
    readonly _y: number;
    readonly color: string;

    get coordinate() {
        return new Coordinate(this._x, this._y);
    }

    constructor(id: string, coordinate: Coordinate, color: string) {
        this.id = id;
        this._x = coordinate.x;
        this._y = coordinate.y;
        this.color = color;
    }

    static buildFrom(piece: Piece) {
        // Build a PieceView from a regular Piece.

        return new PieceView(
            piece.id,
            piece.coordinate,
            piece.color
        );
    };

    equals(other: Piece | PieceView): boolean {
        return this.id === other.id;
    };
};

export interface PieceViewSpecialMovable extends PieceView {
    hasMoved: boolean;
}

export interface PieceViewPawn extends PieceViewSpecialMovable {
    justDoubleAdvanced: boolean;
}

export function getPieceTypeFromId(pieceID: string): string {
    return pieceID.split("-")[0];
}

export function buildPieceView(allPieces: Piece[]): PieceView[] {
    const pieceViewArray = []
    for (const piece of allPieces) {
        const pieceView = PieceView.buildFrom(piece);

        // Set hasMoved status for special movables
        const pieceType = getPieceTypeFromId(piece.id);
        switch (pieceType) {
            case "rook":
            case "king":
            case "pawn": {
                (pieceView as PieceViewSpecialMovable).hasMoved = (piece as SpecialMovablePiece).hasMoved;
                break;
            }
        }

        // Set double advancement for pawns
        if (pieceType === "pawn") {
            (pieceView as PieceViewPawn).justDoubleAdvanced = (piece as Pawn).justDoubleAdvanced;
        }
        pieceViewArray.push(pieceView)
    }
    return pieceViewArray;
}

export function capturePiece(piece: PieceView, allPieces: Piece[]): Piece[] {
    return allPieces.filter(existingPiece => existingPiece.id !== piece.id);
}