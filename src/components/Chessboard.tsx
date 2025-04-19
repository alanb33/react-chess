import { useCallback, useEffect, useState } from 'react';

import { Pawn, Piece, PieceBuilder, PieceType, Rook, SpecialMovablePiece } from '../assets/types/chesspiece/ChessPieceTypes';
import ChessTile, { ChessTileInterface } from "./ChessTile"
import { MousePos, TileColor } from "./CommonTypes";
import { Coordinate } from '../utils/coordinate';
import HighlightedTile from "./HighlightedTile";
import MoveLog from "./MoveLog";

import Globals from "../config/globals";
import { isChessPiece, isTileKey } from "../utils/validators";
import { getPieceAtCoordinate, getTileKeyFromCoordinate, isPieceAtTile } from '../utils/tile-utils';
import { capturePiece } from '../utils/piece-utils';

import "./Chessboard.css";
import { doCastling, doDoublePawnAdvancement, doEnPassant, RecordingData } from '../utils/move-logic';

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
     
    // TODO: Probably using too many things here. Read up on hooks and see what can be better-placed.
    useEffect(() => {
        function handleDragStart(event: DragEvent) {
            event.preventDefault();
            const target = event.target;

            if (target) {
                if (isChessPiece(target)) {
                    const elem = target as HTMLImageElement;
                    const pieceID = elem.getAttribute("id");
                    if (pieceID) {
                        setDraggingPiece(pieceID);
                        const piece = getPieceById(pieceID)
                        if (piece) {
                            let highlights = []
                            if (piece instanceof Rook) {
                                highlights = piece.calculateMovement(pieces, false);
                            } else {
                                highlights = [...piece.calculateMovement(pieces, true)];
                            }
                            //const 
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
                            setHighlightedTiles(highlights);
                        }
                    };
                };
            };
        };

        // While this sounds like it should be a DragEvent/dragend event, it's actually going to be mouseup here since
        // the page is being re-rendered and the drag state is lost
        function handleDragEnd(event: MouseEvent) {
            if (draggingPiece) {
                const validPiece = getPieceById(draggingPiece);

                let recordingData: RecordingData = {
                    validPiece: null,
                    realTilePos: null,
                    mode: "none",
                };
                
                if (validPiece) {
                    let capturingPiece: Piece | null = null;

                    setDraggingPiece(null)
                    setHighlightedTiles([])
                    const dropPos: Coordinate 
                        = new Coordinate (event.pageX, event.pageY);
                    const realTilePos: Coordinate 
                        = new Coordinate (
                            Math.floor(dropPos.x / Globals.TILESIZE),
                            Math.floor(dropPos.y / Globals.TILESIZE)
                        ); 

                    if (realTilePos.x > 0 && realTilePos.x <= Globals.BOARDSIZE) {
                        if (realTilePos.y > 0 && realTilePos.y <= Globals.BOARDSIZE) {
                            let destTileValid = null;
                            for (const tile of highlightedTiles) {
                                if (realTilePos.x === tile.x && realTilePos.y === tile.y) {
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
                                    destTileValid = true;
                                    break;
                                };
                            };

                            // We have a good destination and a valid piece
                            if (destTileValid && validPiece) {

                                // Pawn double advancement logic
                                doDoublePawnAdvancement(validPiece, realTilePos);
                                
                                // En passant logic
                                const enPassantData = doEnPassant(validPiece, realTilePos, pieces);
                                if (enPassantData) {
                                    capturingPiece = enPassantData.capturingPiece!;
                                    recordingData = enPassantData.recordingData!;
                                }
;
                                // Castling logic
                                const castlingData = doCastling(validPiece, realTilePos, pieces);
                                if (castlingData) {
                                    recordingData = castlingData!;
                                }

                                moveLog.recordMove(
                                    recordingData.validPiece!,
                                    recordingData.realTilePos as Coordinate,
                                    recordingData.mode
                                )
                                validPiece.moveTo(realTilePos);

                                if (capturingPiece) {
                                    setPieces(capturePiece(capturingPiece, pieces));
                                }

                                // Clear any 'just double advanced' status for
                                // other pawns, to prevent accidental cases of
                                // en passant
                                for (const otherPiece of pieces) {
                                    if (otherPiece instanceof Pawn) {
                                        if (otherPiece.id !== validPiece.id) {
                                            otherPiece.justDoubleAdvanced = false;
                                        };
                                    };
                                };
                            };   
                        };
                    };
                };
            };
        };

        /* TODO: Do something else to specify a highlight, like making the piece larger
        function handleHover(event: MouseEvent) {
            if (event.target) {
                const target = event.target as HTMLElement
                // It it's a chess piece, change the target to its parent tile.
                if (isChessPiece(target)) {
                    const associatedTileKey = target.getAttribute("board-position");
                    if (associatedTileKey) {
                        if (isTileKey(associatedTileKey)) {
                            setHighlightedTile(associatedTileKey)
                        };
                    };
                } else if (isChessboardTile(target)) {
                    // Else, it's just a tile, so highlight it. 
                    if (isTileKey(target.id)) {
                        setHighlightedTile(target.id);
                    }
                }
            }
        }
        */

        function updateMousePosition(event: MouseEvent) {
            const newMousePos = {
                x: event.pageX,
                y: event.pageY,
            }
            setMousePosition(newMousePos);
        }

        //document.addEventListener("keydown", handleKeyDown);
        //document.addEventListener("keyup", handleKeyUp);
        //document.addEventListener("mousedown", handleClick);
        //document.addEventListener("mouseover", handleHover);

        // Handling of piece clicking and dragging
        document.addEventListener("dragstart", handleDragStart);
        document.addEventListener("mouseup", handleDragEnd);
        document.addEventListener("mousemove", updateMousePosition);

        // Cleanup function, so it doesn't add the event listeners repeatedly
        return () => {
            //document.removeEventListener("keydown", handleKeyDown);
            //document.removeEventListener("keyup", handleKeyUp);
            //document.removeEventListener("mousedown", handleClick);
            //document.removeEventListener("mouseover", handleHover);
            document.removeEventListener("dragstart", handleDragStart);
            document.removeEventListener("mouseup", handleDragEnd);
            document.removeEventListener("mousemove", updateMousePosition);
        };

    }, [draggingPiece, highlightedTiles, mousePosition, pieces, getPieceById]);

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