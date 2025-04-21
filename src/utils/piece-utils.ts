import { King, Piece } from "../assets/types/chesspiece/ChessPieceTypes";

export function getKing(side: string, allPieces: Piece[]): King {
    return allPieces.filter(piece => piece.id.includes("king") && piece.color === side)[0] as King;
}

export function getPieceTypeFromId(pieceID: string): string {
    return pieceID.split("-")[0];
}

export function capturePiece(piece: Piece, allPieces: Piece[]): Piece[] {
    return allPieces.filter(existingPiece => existingPiece.id !== piece.id);
}

export function isKingChecked(side: string, allPieces: Piece[]): boolean {
    const king = getKing(side, allPieces);
    return king.checked;
}