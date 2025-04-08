import { Coordinate } from "../components/CommonTypes";
import { King, Pawn, Piece, SpecialMovablePiece } from "../assets/types/chesspiece/ChessPieceTypes";
import { getPieceAtCoordinate } from "./tile-utils";
import { Manuever } from "../components/MoveLog";

export interface RecordingData {
    validPiece: Piece | null;
    realTilePos: Coordinate | null;
    mode: Manuever;
};

export function doCastling(validPiece: Piece, realTilePos: Coordinate, allPieces: Piece[]): RecordingData | null {
    /* 
        The King AND the Rook need to be moved.
        If we are doing castling, then we have previously validated
        that the King and Rook are valid, so we don't need to do any
        testing here.
    */

    let recordingData: RecordingData | null = null;

    function getActualRook(rookPos: Coordinate): Piece | null {
        // Piece is guaranteed to be valid at this call.
        const rookView = getPieceAtCoordinate(rookPos, allPieces);
        let rook: Piece | null = null;

        for (const piece of allPieces) {
            if (piece.id === rookView!.id) {
                rook = piece;
                break;
            };
        };

        // Null will never be returned.
        return rook;
    };
    
    if (validPiece instanceof King
        && (validPiece.kingCastlingDest || validPiece.queenCastlingDest)) {
            recordingData = {
                validPiece: validPiece,
                realTilePos: realTilePos,
                mode: "none",
            }
            // Kingside castling logic
            if (validPiece.kingCastlingDest) {
                // Grab the Rook that's kingside.
                const rookPos = {x: validPiece.x + 3, y: validPiece.y};
                const actualRook = getActualRook(rookPos)!;

                // Move that rook!
                const rookNewX = actualRook.x - 2;
                actualRook.x = rookNewX;

                recordingData.mode = "castling king";
            };

            // Queenside castling logic
            if (validPiece.kingCastlingDest) {
                // Grab the Rook that's kingside.
                const rookPos = {x: validPiece.x - 4, y: validPiece.y};
                const actualRook = getActualRook(rookPos)!;

                // Move that rook!
                const rookNewX = actualRook.x + 3;
                actualRook.x = rookNewX;

                recordingData.mode = "castling queen";
            };
        };

    return recordingData;
};

export function doDoublePawnAdvancement(validPiece: Piece, realTilePos: Coordinate) {
    // Pawn double advancement logic
    if (validPiece instanceof SpecialMovablePiece) {
        validPiece.hasMoved = true;
        if (validPiece instanceof Pawn) {
            if (Math.abs(validPiece.y - realTilePos.y) === 2) {
                validPiece.justDoubleAdvanced = true;
            };
        };
    }
}

export function doEnPassant(validPiece: Piece, realTilePos: Coordinate, allPieces: Piece[]) {
    let capturingPiece = null;
    let recordingData: RecordingData | null = null;
    
    if (validPiece instanceof Pawn && validPiece.enPassantDest) {
        if (realTilePos.x === validPiece.enPassantDest.x && realTilePos.y === validPiece.enPassantDest.y) {
            // Move up if we're moving a white
            // piece and vice versa
            const dir = 
                validPiece.color === "white" ? -1 : 1;
            const enPassantCoord: Coordinate = {
                x: realTilePos.x,
                y: realTilePos.y + dir,
            };
            const enPassantPawn = 
                getPieceAtCoordinate(
                    enPassantCoord, allPieces);
                    
            capturingPiece = enPassantPawn;
            recordingData = {
                validPiece: validPiece,
                realTilePos: realTilePos, 
                mode: "en passant"
            };

            validPiece.enPassantDest = null;
        };
    };

    if (!capturingPiece && !recordingData) {
        return null;
    }

    return {
        capturingPiece: capturingPiece,
        recordingData: recordingData,
    };
}