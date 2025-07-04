import { useCallback, useEffect, useState } from 'react';

import { King, Pawn, Piece, PieceBuilder, PieceType, Rook, SpecialMovablePiece } from '../assets/types/chesspiece/ChessPieceTypes';
import ChessTile, { ChessTileInterface } from "./ChessTile"
import { MousePos, TileColor } from "./CommonTypes";
import { Coordinate } from '../utils/coordinate';
import HighlightedTile from "./HighlightedTile";
import MoveLog from "./MoveLog";

import Globals from "../config/globals";
import { isChessPiece, isTileKey } from "../utils/validators";
import { getPieceAtCoordinate, getTileKeyFromCoordinate, isPieceAtTile } from '../utils/tile-utils';
import { capturePiece, getKing } from '../utils/piece-utils';

import "./Chessboard.css";
import { canPieceInterfereWithCheck, checkForCheckmate, doCastling, doDoublePawnAdvancement, doEnPassant, getDirTowardsEnemyKing, getLineThreatUnsafeSpace, isLineThreatened, isPieceCheckingEnemyKing, RecordingData } from '../utils/move-logic';

interface TileGrid {
    [key: string]: ChessTileInterface;
};

function buildChessboard(): TileGrid {
        
    const newChessboard: TileGrid = {};

    for (let row = Globals.BOARDSIZE; row >= 1; row-- ) {
        for (let col = 1; col <= Globals.BOARDSIZE; col++ ) {
            /*
                Tiles are represents as letter-number, where a letter is a
                reference to the column, and the number is the row that the
                tile is in. For example, the first column is A and the last
                column is H. Importantly, numbering starts from the bottom to
                the top, rather than top to bottom, so to instantiate the 
                board, I must begin at Globals.BOARDSIZE.
            */

            // Alternate tile colors by row evenness
            let tileColor: TileColor = "white";
            if (row % 2 === 1) {
                // Odd row; odd tiles are white, even are black
                if (col % 2 === 0) {
                    tileColor = "black";
                }
            } else {
                // Even row; odd tiles are black, even are white
                if (col % 2 === 1) {
                    tileColor = "black";
                }
            }

            const tileKey = getTileKeyFromCoordinate(new Coordinate(col, row));
            const chessTile: ChessTileInterface = {
                id: tileKey,
                x: col,
                y: row,
                color: tileColor,
            };

            newChessboard[tileKey] = chessTile;
        };
    };

    return newChessboard;
};

const chessboard = buildChessboard();

const tileKeys = Object.keys(chessboard)
const tiles = tileKeys.map((tile) => {
    return (
        <ChessTile 
            id={chessboard[tile].id}
            key={chessboard[tile].id}
            x={chessboard[tile].x}
            y={chessboard[tile].y}
            color={chessboard[tile].color}
            border={chessboard[tile].color}
        />
    )
});

let tempPieces: Array<Piece> = [];
const moveLog = new MoveLog();

function Chessboard() {

    const [pieces, setPieces] = useState<Array<Piece>>([]);
    const [highlightedTiles, setHighlightedTiles] = useState<Coordinate[]>([]);
    const [draggingPiece, setDraggingPiece] = useState<string | null>(null)
    const [mousePosition, setMousePosition] = useState<MousePos>({x: 0, y: 0});

    function placePieces() {

        const initialPieces = [];

        // 1/2/3 are rook/knight/bishop columns. 4 and 5 are queen/king.
        // All piece placement can be determined from these first five rows.

        const row = {
            "white": {
                "pawn": 2,
                "royal": 1,
            },
            "black": {
                "pawn": 7,
                "royal": 8,
            }
        };

        function generateReflectedPieces(piece: PieceType, column: number, royal: boolean, singlePiece: boolean = false): Array<Piece> {
            const max = Globals.BOARDSIZE + 1;
            
            const pieces = [];

            if (!singlePiece) {
                // For reference: wl/wr/bl/br = white-left, white-right, black-left, black-right
                const wl = PieceBuilder.buildPiece(piece, "white", new Coordinate(column, royal ? row.white.royal : row.white.pawn));
                const wr = PieceBuilder.buildPiece(piece, "white", new Coordinate(max - column, royal ? row.white.royal : row.white.pawn));
                const bl = PieceBuilder.buildPiece(piece, "black", new Coordinate(column, royal ? row.black.royal : row.black.pawn));
                const br = PieceBuilder.buildPiece(piece, "black", new Coordinate(max - column, royal ? row.black.royal : row.black.pawn));
                pieces.push(wl, wr, bl, br);
            } else {
                const w = PieceBuilder.buildPiece(piece, "white", new Coordinate(column, royal ? row.white.royal : row.white.pawn));
                const b = PieceBuilder.buildPiece(piece, "black", new Coordinate(column, royal ? row.black.royal : row.black.pawn));
                pieces.push(w, b);
            };
            return pieces;
        };

        // Pawn placement.
        const pawnHalfwayPoint = 4;
        for (let i = 1; i <= pawnHalfwayPoint; i++) {
            initialPieces.push(...generateReflectedPieces("pawn", i, false));
        };

        // Rook/Knight/Bishop placement
        const royalHalfwayPoint = 3;
        for (let i = 1; i <= royalHalfwayPoint; i++) {
            switch (i) {
                // Rooks columns
                case 1: {
                    initialPieces.push(...generateReflectedPieces("rook", i, true));
                    break;
                };
                // Knights columns
                case 2: {
                    initialPieces.push(...generateReflectedPieces("knight", i, true));
                    break;
                };
                // Bishops column
                case 3: {
                    initialPieces.push(...generateReflectedPieces("bishop", i, true));
                    break;
                };
            };
        };

        // King/Queen placement
        const queenCol = 4;
        const kingCol = 5;
        initialPieces.push(...generateReflectedPieces("queen", queenCol, true, true));
        initialPieces.push(...generateReflectedPieces("king", kingCol, true, true));

        return initialPieces;

    };

    // First renderings

    if (pieces.length === 0) {
        tempPieces = placePieces();
        setPieces(tempPieces);
    };

    const getPieceDict = useCallback(() => {
        if (pieces.length === 0) {
            return tempPieces;
        };
        return pieces;
    }, [pieces]);

    const getPieceById = useCallback((pieceID: string) => {
        for (const piece of getPieceDict()) {
            if (piece.id === pieceID) {
                return piece;
            };
        };
        return null;
    }, [getPieceDict]);

    // Creating element tags
    const cursorFollowerElement = () => {
        if (draggingPiece) {
            const piece = getPieceById(draggingPiece);
            if (piece) {
                return (
                    <img
                        id="cursorFollower"
                        key="cursorFollower"
                        src={piece.imagePath}
                        style={{
                            position: "absolute",
                            zIndex: Globals.Z_INDEX.DRAGGED_PIECE,
                            left: mousePosition.x - Globals.TILESIZE / 2,
                            top: mousePosition.y - Globals.TILESIZE / 2,
                            width: `${Globals.TILESIZE}px`,
                            height: `${Globals.TILESIZE}px`
                        }}
                    />
                );
            };
            return null;
        };
        return null;
    };

    const highlightedTileElements = highlightedTiles.map((tileCoordinate) => {
        const tileKey = getTileKeyFromCoordinate(tileCoordinate);
        if (isTileKey(tileKey)) { 
            const tile = chessboard[tileKey];
            const color = isPieceAtTile(tile, pieces) ? "pink" : "lightgreen";
            return (
                <HighlightedTile 
                    key={`highlightedTile-${tile.id}`}
                    coordinates={new Coordinate(tile.x, tile.y)}
                    color={color}
                    />
            );
        };
        return null
    });

    const allPieces = getPieceDict()
        .filter(piece => piece.id !== draggingPiece) // Don't render the piece being dragged
        .map(piece => piece.buildElement());
     
    const handlePieceDragStart = useCallback((pieceID: string) => {
        setDraggingPiece(pieceID);
        const piece = getPieceById(pieceID);
        if (piece) {
            // Check if our king is in check and if so, restrict piece selection
            const ourKing = getKing(piece.color, pieces);
            if (ourKing.checked) {
                // Only allow pieces that can interfere with the threat or capture the threatening piece
                const canPieceHelp = canPieceInterfereWithCheck(piece, ourKing, pieces);
                if (!canPieceHelp) {
                    // This piece can't help with the check, don't allow selection
                    return;
                }
            }

            let highlights = []
            if (piece instanceof Rook) {
                highlights = piece.calculateMovement(pieces, false);
            } else {
                highlights = [...piece.calculateMovement(pieces, true)];
            }
             
            if (piece instanceof SpecialMovablePiece) {
                const specialMoves = (piece as SpecialMovablePiece).calculateSpecialMovement(pieces);
                
                for (const move of specialMoves) {
                    let found = false;
                    for (const highlight of highlights) {
                        if (move.x === highlight.x && move.y === highlight.y) {
                            found = true;
                            break;
                        }
                    }
                    if (!found) {
                        highlights.push(move);
                    }
                };
            }

            // Check if our king is in check and limit moves accordingly
            if (ourKing.checked && piece !== ourKing) {
                const threateningMovement = ourKing.threatener!.getKingThreateningMovement(pieces);
                const newMovement = []
                for (const ourMove of highlights) {
                    for (const threateningMove of threateningMovement) {
                        if (ourMove.equals(threateningMove)) {
                            newMovement.push(ourMove)
                        };
                    };
                };
                highlights = newMovement;
            };

            // If we are the king, limit moves
            if (ourKing.checked && piece === ourKing) {
                const threateningMovement = ourKing.threatener!.getKingThreateningMovement(pieces);
                const newMovement = []
                for (const ourMove of highlights) {
                    let isThreatened = false;
                    for (const threateningMove of threateningMovement) {
                        if (ourMove.equals(threateningMove)) {
                            isThreatened = true;
                        };
                    };

                    if (isLineThreatened(ourKing)) {
                        const dir_to_king = getDirTowardsEnemyKing(ourKing.threatener!, ourKing);
                        const unsafeDest = getLineThreatUnsafeSpace(ourKing, dir_to_king);
                        if (ourMove.equals(unsafeDest)) {
                            isThreatened = true;
                        }
                    }

                    if (!isThreatened) {
                        newMovement.push(ourMove)
                    }

                };
                highlights = newMovement;
            };

            // If we are the king, don't permit moves that will put us into check.
            if (piece === ourKing) {
                const enemyColor = ourKing.color === "white" ? "black" : "white";
                const enemyPieces = pieces.filter(piece => {
                    return piece.color === enemyColor
                });
                for (const enemy of enemyPieces) {
                    if (enemy instanceof Pawn) {
                        // Pawns target their diagonals
                        const leftDestX = enemy.coordinate.x - 1
                        const rightDestX = enemy.coordinate.x + 1
                        const forward = enemy.color === "white" ? 1 : -1;
                        const forwardDestY = enemy.coordinate.y + forward;
                        const leftDest = new Coordinate(leftDestX, forwardDestY);
                        const rightDest = new Coordinate(rightDestX, forwardDestY);

                        const threatened: Coordinate[] = []
                        for (const dest of [leftDest, rightDest]) {;
                            for (const coord of highlights) {
                                if (coord.equals(dest)) {
                                    threatened.push(dest)
                                    break;
                                }
                            }
                        }

                        // Filter out any tiles that are dangeorus
                        highlights = highlights.filter(highlight => {
                            for (const threat of threatened) {
                                if (highlight.equals(threat)) {
                                    return false;
                                }
                            }
                            return true
                        });
                    } else {
                        // Threat range matches the piece movement
                        const threats = enemy.calculateMovement(pieces, true);
                        const badSquares: Coordinate[] = []
                        for (const threat of threats) {
                            for (const highlight of highlights) {
                                if (highlight.equals(threat)) {
                                    badSquares.push(threat);
                                }
                            }
                        }

                        // Filter out any tiles that are dangeorus
                        highlights = highlights.filter(highlight => {
                            for (const badSquare of badSquares) {
                                if (highlight.equals(badSquare)) {
                                    return false;
                                }
                            }
                            return true
                        });
                    }
                } 
            }
            setHighlightedTiles(highlights);
        }
    }, [getPieceById, pieces]);

    const handlePieceDrop = useCallback((dropPosition: Coordinate) => {
        if (!draggingPiece) return;

        const validPiece = getPieceById(draggingPiece);
        if (!validPiece) return;

        let recordingData: RecordingData = {
            validPiece: null,
            realTilePos: null,
            mode: "none",
        };

        let capturingPiece: Piece | null = null;
        const realTilePos = new Coordinate(
            Math.floor(dropPosition.x / Globals.TILESIZE),
            Math.floor(dropPosition.y / Globals.TILESIZE)
        );

        // Check if drop position is within board bounds
        if (realTilePos.x > 0 && realTilePos.x <= Globals.BOARDSIZE &&
            realTilePos.y > 0 && realTilePos.y <= Globals.BOARDSIZE) {
            
            // Check if the move is valid (tile is highlighted)
            const isValidMove = highlightedTiles.some(tile => 
                realTilePos.x === tile.x && realTilePos.y === tile.y
            );

            if (isValidMove) {
                const destPiece = getPieceAtCoordinate(realTilePos, pieces);
                if (destPiece && validPiece.id !== destPiece.id) {
                    capturingPiece = destPiece;
                    recordingData = {
                        validPiece: validPiece,
                        realTilePos: realTilePos, 
                        mode: "capture"
                    };
                } else {
                    // Don't log special non-captures as a regular move
                    if (!(validPiece instanceof Pawn && validPiece.enPassantDest)) {
                        recordingData = {
                            validPiece: validPiece,
                            realTilePos: realTilePos, 
                            mode: "none"
                        };
                    }
                }

                // Execute special moves
                doDoublePawnAdvancement(validPiece, realTilePos);
                
                const enPassantData = doEnPassant(validPiece, realTilePos, pieces);
                if (enPassantData) {
                    capturingPiece = enPassantData.capturingPiece!;
                    recordingData = enPassantData.recordingData!;
                }

                const castlingData = doCastling(validPiece, realTilePos, pieces);
                if (castlingData) {
                    recordingData = castlingData!;
                }

                // Record and execute the move
                moveLog.recordMove(
                    recordingData.validPiece!,
                    recordingData.realTilePos as Coordinate,
                    recordingData.mode
                );
                validPiece.moveTo(realTilePos);

                if (capturingPiece) {
                    setPieces(capturePiece(capturingPiece, pieces));
                }

                // Clear any 'just double advanced' status for other pawns, to 
                // prevent accidental cases of en passant
                setPieces(currentPieces => 
                    currentPieces.map(piece => {
                        if (piece instanceof Pawn && piece.id !== validPiece.id) {
                            piece.justDoubleAdvanced = false;
                        }
                        return piece;
                    })
                );

                // Check for enemy king in check
                if (isPieceCheckingEnemyKing(validPiece, pieces)) {
                    const enemyColor = validPiece.color === "white" ? "black" : "white";
                    const enemyKing = getKing(enemyColor, pieces);
                    enemyKing.enterCheck(validPiece);
                }

                // Check for checkmate
                checkForCheckmate(pieces);
            }

            // Clear any check status if necessary
            const kings: King[] = [
                getKing("white", pieces),
                getKing("black", pieces)
            ]
            for (const king of kings) {
                if (king.checked) {
                    const kingEnemyColor = king.color === "white" ? "black" : "white";
                    const enemyPieces = pieces.filter(piece => {
                        return piece.color === kingEnemyColor && !piece.captured;
                    });
                    let inCheck = false;
                    for (const enemyPiece of enemyPieces) {
                        if (isPieceCheckingEnemyKing(enemyPiece, pieces)) {
                            inCheck = true;
                            break;
                        }
                    }
                    if (!inCheck) {
                        king.clearCheck()
                    }
                }
            }


        }

        // Always clear drag state after attempting a move
        setDraggingPiece(null);
        setHighlightedTiles([]);
    }, [draggingPiece, highlightedTiles, pieces, getPieceById]);

    const handleMouseMove = useCallback((event: MouseEvent) => {
        setMousePosition({ x: event.pageX, y: event.pageY });
    }, []);

    useEffect(() => {
        function handleDragStart(event: DragEvent) {
            event.preventDefault();
            const target = event.target;

            if (target && isChessPiece(target)) {
                const elem = target as HTMLImageElement;
                const pieceID = elem.getAttribute("id");
                if (pieceID) {
                    handlePieceDragStart(pieceID);
                }
            }
        }

        function handleMouseUp(event: MouseEvent) {
            if (draggingPiece) {
                handlePieceDrop(new Coordinate(event.pageX, event.pageY));
            }
        }

        document.addEventListener("dragstart", handleDragStart);
        document.addEventListener("mouseup", handleMouseUp);
        document.addEventListener("mousemove", handleMouseMove);

        return () => {
            document.removeEventListener("dragstart", handleDragStart);
            document.removeEventListener("mouseup", handleMouseUp);
            document.removeEventListener("mousemove", handleMouseMove);
        };
    }, [draggingPiece, handlePieceDragStart, handlePieceDrop, handleMouseMove]);

    const SIZECALC = `${Globals.TILESIZE * Globals.BOARDSIZE}px`;
    const moveLogElement = moveLog.buildElement();

    return (
        <div 
            className="flex justify-center"
            id="chessboard"
            key="chessboard"
            style={{ width: SIZECALC, height: SIZECALC }}>
            {tiles}
            {cursorFollowerElement()}
            {highlightedTileElements}
            {allPieces}
            {moveLogElement}
        </div>
    );
};

export default Chessboard;