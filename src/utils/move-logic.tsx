import { Coordinate } from "../utils/coordinate"
import { King, Pawn, Piece, SpecialMovablePiece } from "../assets/types/chesspiece/ChessPieceTypes";
import { PieceView } from "./piece-utils";
import { getPieceAtCoordinate, getPieceViewAtCoordinate } from "./tile-utils";
import { Manuever } from "../components/MoveLog";

export interface RecordingData {
    validPiece: PieceView | null;
    realTilePos: Coordinate | null;
    mode: Manuever;
};

export function doCastling(validPiece: PieceView, realTilePos: Coordinate, allPieces: Piece[]): RecordingData | null {
    /* 
        The King AND the Rook need to be moved.
        If we are doing castling, then we have previously validated
        that the King and Rook are valid, so we don't need to do any
        testing here.
    */

    let recordingData: RecordingData | null = null;

    function getActualRook(rookPos: Coordinate): Piece | null {
        // Piece is guaranteed to be valid at this call.
        const rookView = getPieceViewAtCoordinate(rookPos, allPieces);
        let rook: Piece | null = null;

        for (const piece of allPieces) {
            if (piece.equals(rookView!)) {
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
                const rookPos = new Coordinate(validPiece.coordinate.x + 3, validPiece.coordinate.y);
                const actualRook = getActualRook(rookPos)!;

                // Move that rook!
                const rookNewX = actualRook.coordinate.x - 2;
                actualRook.coordinate = new Coordinate(rookNewX, actualRook.coordinate.y);

                recordingData.mode = "castling king";
            };

            // Queenside castling logic
            if (validPiece.queenCastlingDest) {
                // Grab the Rook that's kingside.
                const rookPos = new Coordinate(validPiece.coordinate.x - 4, validPiece.coordinate.y);
                const actualRook = getActualRook(rookPos)!;

                // Move that rook!
                const rookNewX = actualRook.coordinate.x + 3;
                actualRook.coordinate = new Coordinate(rookNewX, actualRook.coordinate.y);

                recordingData.mode = "castling queen";
            };

            // Clear any castling status afterwards
            validPiece.kingCastlingDest = null;
            validPiece.queenCastlingDest = null;
        };

    return recordingData;
};

export function doDoublePawnAdvancement(validPiece: Piece, realTilePos: Coordinate) {
    // Pawn double advancement logic
    if (validPiece instanceof SpecialMovablePiece) {
        validPiece.hasMoved = true;
        if (validPiece instanceof Pawn) {
            if (Math.abs(validPiece.coordinate.y - realTilePos.y) === 2) {
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
            const enPassantCoord: Coordinate = new Coordinate(
                realTilePos.x,
                realTilePos.y + dir,
            );
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