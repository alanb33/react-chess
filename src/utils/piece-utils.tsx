import { Piece } from "../assets/types/chesspiece/ChessPieceTypes";

// Reduced view of a Piece for passing less information around
export interface PieceView {
    id: string;
    x: number;
    y: number;
    color: string;
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
        pieceViewArray.push(pieceView)
    }
    return pieceViewArray;
}

export function capturePiece(piece: PieceView, allPieces: Piece[]): Piece[] {
    return allPieces.filter(existingPiece => existingPiece.id !== piece.id);
}