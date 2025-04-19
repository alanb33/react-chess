import { Piece } from "../assets/types/chesspiece/ChessPieceTypes";

export function getPieceTypeFromId(pieceID: string): string {
    return pieceID.split("-")[0];
}

export function capturePiece(piece: Piece, allPieces: Piece[]): Piece[] {
    return allPieces.filter(existingPiece => existingPiece.id !== piece.id);
}