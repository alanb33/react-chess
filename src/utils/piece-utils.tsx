import { Pawn, Piece } from "../assets/types/chesspiece/ChessPieceTypes";

// Reduced view of a Piece for passing less information around
export interface PieceView {
    id: string;
    x: number;
    y: number;
    color: string;
}

export interface PieceViewPawn extends PieceView {
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
        if (getPieceTypeFromId(piece.id) === "pawn") {
            const pieceViewPawn = pieceView as PieceViewPawn;
            const piecePawn = piece as Pawn;
            pieceViewPawn.justDoubleAdvanced = piecePawn.justDoubleAdvanced;
        }
        pieceViewArray.push(pieceView)
    }
    return pieceViewArray;
}

export function capturePiece(piece: PieceView, allPieces: Piece[]): Piece[] {
    return allPieces.filter(existingPiece => existingPiece.id !== piece.id);
}