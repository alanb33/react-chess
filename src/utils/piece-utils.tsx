import { Pawn, Piece, SpecialMovablePiece } from "../assets/types/chesspiece/ChessPieceTypes";

// Reduced view of a Piece for passing less information around
export interface PieceView {
    id: string;
    x: number;
    y: number;
    color: string;
}

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
        const pieceView = {
            id: piece.id,
            x: piece.x, 
            y: piece.y, 
            color: piece.color
        };

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