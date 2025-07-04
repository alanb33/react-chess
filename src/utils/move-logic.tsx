import { Coordinate } from "../utils/coordinate";
import Globals from "../config/globals";
import { King, Pawn, Piece, SpecialMovablePiece } from "../assets/types/chesspiece/ChessPieceTypes";
import { getPieceAtCoordinate, isCoordinateValid, isPieceAtCoordinate } from "./tile-utils";
import { Manuever } from "../components/MoveLog";
import { getKing } from "./piece-utils";

export type Dir = "n" | "ne" | "e" | "se" | "s" | "sw" | "w" | "nw";

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
                // Funny way to set property without Rook inheriting SpecialMovablePiece
                Object.defineProperty(actualRook, "hasMoved", {value: true});

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

export function getDirTowardsEnemyKing(origin: Piece, enemyKing: Piece): string {
    if (enemyKing.coordinate.y === origin.coordinate.y) {
        if (enemyKing.coordinate.x < origin.coordinate.x) {
            return "w";
        } else {
            return "e";
        };
    };

    if (enemyKing.coordinate.x === origin.coordinate.x) {
        if (enemyKing.coordinate.y < origin.coordinate.y) {
            return "n";
        } else {
            return "s";
        };
    };

    const yDiff = enemyKing.coordinate.y - origin.coordinate.y;
    const xDiff = enemyKing.coordinate.x - origin.coordinate.x;

    // If these are equal, then the enemy king is perfect diagonal from us.
    if (Math.abs(yDiff) / Math.abs(xDiff) === 1) {
        if (yDiff < 0) {
            if (xDiff < 0) {
                return "nw";
            } else {
                return "ne";
            }
        } else {
            if (xDiff < 0) {
                return "sw";
            } else {
                return "se";
            }
        }
    } else {
        return "none"
    }
}

export function getDirectionalTiles(origin: Piece, allPieces: Piece[], directions: Dir[], stopAtEnemyPiece: boolean = true): Coordinate[] {

    // Prepare the checking dictionary with all directions we need
    const checking: {[key: string]: boolean} = {}
    for (const dir of directions) {
        checking[dir] = true;
    }

    const returnTiles = [];

    const distance = origin instanceof King ? 1 : Globals.BOARDSIZE;

    for (let i = 1; i <= distance; i++) {
        for (const dir of directions) {
            if (checking[dir]) {
                let xMovement = 0;
                let yMovement = 0;

                /* 
                    Since the Dir type is n/ne/se, etc -- this should get the
                    proper directions from their string contents!
                */
                if (dir.includes("n")) {
                    yMovement = -i;
                } else if (dir.includes("s")) {
                    yMovement = i;
                }
                if (dir.includes("w")) {
                    xMovement = -i;
                } else if (dir.includes("e")) {
                    xMovement = i;
                }

                const dest: Coordinate = new Coordinate(
                    origin.coordinate.x + xMovement,
                    origin.coordinate.y + yMovement);
                if (isCoordinateValid(dest)) {
                    // If the destination is valid...
                    if (isPieceAtCoordinate(dest, allPieces)) {
                        // And there is a piece at the destination....
                        const piece = getPieceAtCoordinate(dest, allPieces)
                        
                        if (piece!.color !== origin.color) {
                            // Highlight it if it's an enemy piece.
                            returnTiles.push(dest);
                            if (stopAtEnemyPiece) {
                                checking[dir] = false;
                                continue;
                            }
                        // Always stop if it's a friendly piece
                        } else {
                            checking[dir] = false;
                            continue;
                        }
                    } else {
                        // If there is no piece in that direction...
                        returnTiles.push(dest)
                    }
                } else {
                    // It's not a valid coordinate, so stop checking in this direction.
                    checking[dir] = false;
                    continue;
                };
            };
        };
    };

    return returnTiles;
};

export function isLineThreatened(king: King): boolean {
    if (king.threatener) {
        const line_threats = ["rook", "bishop", "queen"]
        for (const threat in line_threats) {
            if (king.threatener.id.includes(threat)) {
                const move_dir = getDirTowardsEnemyKing(king.threatener, king);
                return move_dir !== "none";
            }
        }
    }
    return false;
}

// This is used for checking/checkmating logic. Assumes valid direction.
export function getLineThreatUnsafeSpace(king: King, unsafe_space_dir: string): Coordinate {
    const dest: Coordinate = new Coordinate(king.coordinate.x, king.coordinate.y);
    switch (unsafe_space_dir) {
        case "w":
            dest.x--;
            break;
        case "nw":
            dest.x--;
            dest.y--;
            break;
        case "n":
            dest.y--;
            break;
        case "ne":
            dest.x++;
            dest.y--;
            break;
        case "e":
            dest.x++;
            break;
        case "se":
            dest.x++;
            dest.y++;
            break;
        case "s":
            dest.y++;
            break;
        case "sw":
            dest.y++;
            dest.x--;
            break;
    }
    return dest;
}
export function isPieceCheckingEnemyKing(validPiece: Piece, allPieces: Piece[]): boolean {

    const enemyKing = allPieces.filter(piece => 
        piece.id.includes("king") && piece.color !== validPiece.color
    )[0];

    if (enemyKing) {
        const ourMovement = validPiece.calculateMovement(allPieces, true);
        for (const coordinate of ourMovement) {
            if (coordinate.equals(enemyKing.coordinate)) {
                return true;
            }
        }
    }

    return false;
};

export function isSquareUnderAttack(square: Coordinate, kingColor: string, allPieces: Piece[]): boolean {
    const enemyColor = kingColor === "white" ? "black" : "white";    
    for (const piece of allPieces) {
        if (piece.color === enemyColor) {
            const movement = piece.calculateMovement(allPieces, true);
            for (const attackSquare of movement) {
                if (attackSquare.equals(square)) {
                    return true;
                }
            }
        }
    }    
    return false;
}

export function canPieceInterfereWithCheck(piece: Piece, checkedKing: King, allPieces: Piece[]): boolean {
    if (!checkedKing.checked || !checkedKing.threatener) {
        return true; // No check, piece can move freely
    }
    
    // The king itself can always try to move (we'll filter its moves separately)
    if (piece instanceof King) {
        return true;
    }
    
    const threatener = checkedKing.threatener;
    const threateningPath = threatener.getKingThreateningMovement(allPieces);
    const pieceMovement = piece.calculateMovement(allPieces, true);
    
    // Check if piece can capture the threatener
    if (pieceMovement.some(move => move.equals(threatener.coordinate))) {
        return true;
    }
    
    // Check if piece can block the threatening path
    for (const move of pieceMovement) {
        for (const threatSquare of threateningPath) {
            if (move.equals(threatSquare) && !move.equals(checkedKing.coordinate)) {
                return true;
            }
        }
    }
    
    return false;
}

export function checkForCheckmate(allPieces: Piece[]): void {
    // Check if either king is in checkmate
    const kings: King[] = [
        getKing("white", allPieces),
        getKing("black", allPieces)
    ]
    kings.forEach(king => {
        if (king.checked) {
            const kingColor = king.color;
            let canEscape = false;
            
            // Check if king can move to safety
            const kingMoves = king.calculateMovement(allPieces);
            if (kingMoves.length > 0) {
                canEscape = true;
            }
            
            // Check if any piece can help
            if (!canEscape) {
                for (const piece of allPieces) {
                    if (piece.color === kingColor && !(piece instanceof King)) {
                        if (canPieceInterfereWithCheck(piece, king, allPieces)) {
                            // Check if this piece actually has valid moves
                            const threateningPath = king.threatener!.getKingThreateningMovement(allPieces);
                            const pieceMovement = piece.calculateMovement(allPieces, true);
                            
                            for (const move of pieceMovement) {
                                // Can capture threatener or block path
                                if (move.equals(king.threatener!.coordinate) || 
                                    threateningPath.some(threat => move.equals(threat) && !move.equals(king.coordinate))) {
                                    canEscape = true;
                                    break;
                                }
                            }
                            
                            if (canEscape) break;
                        }
                    }
                }
            }
            
            if (!canEscape) {
                console.log("CHECKMATE");
            }
        }
    });
}