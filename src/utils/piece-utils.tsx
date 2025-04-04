import { Piece } from "../assets/types/chesspiece/ChessPieceTypes";

// Reduced view of a Piece for passing less information around
export interface PieceView {
    id: string;
    x: number;
    y: number;
    color: string;
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