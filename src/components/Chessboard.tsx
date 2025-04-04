import { useCallback, useEffect, useState } from 'react';

import { Piece, PieceBuilder, PieceType, SpecialMovablePiece } from '../assets/types/chesspiece/ChessPieceTypes';
import ChessTile, { ChessTileInterface } from "./ChessTile"
import { Coordinate, MousePos, TileColor } from "./CommonTypes";
import HighlightedTile from "./HighlightedTile";

import Globals from "../config/globals";
import { isChessPiece, isTileKey } from "../utils/validators";
import { getTileKeyFromCoordinates, isPieceAtTile } from '../utils/tile-utils';
import { buildPieceView } from '../utils/piece-utils';

import "./Chessboard.css";

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

            const tileKey = getTileKeyFromCoordinates(col, row);
            const chessTile: ChessTileInterface = {
                id: tileKey,
                x: col,
                y: row,
                color: tileColor,
                getCenter(): Coordinate {
                    const coord: Coordinate = {
                        x: ((this.x - 1) * Globals.TILESIZE) / 2,
                        y: ((this.y - 1) * Globals.TILESIZE) / 2,
                    };
                    return coord;
                }
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
            getCenter={chessboard[tile].getCenter}
        />
    )
});

let tempPieces: Array<Piece> = [];

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
                const wl = PieceBuilder.buildPiece(piece, "white", column, royal ? row.white.royal : row.white.pawn);
                const wr = PieceBuilder.buildPiece(piece, "white", max - column, royal ? row.white.royal : row.white.pawn);
                const bl = PieceBuilder.buildPiece(piece, "black", column, royal ? row.black.royal : row.black.pawn);
                const br = PieceBuilder.buildPiece(piece, "black", max - column, royal ? row.black.royal : row.black.pawn);
                pieces.push(wl, wr, bl, br);
            } else {
                const w = PieceBuilder.buildPiece(piece, "white", column, royal ? row.white.royal : row.white.pawn);
                const b = PieceBuilder.buildPiece(piece, "black", column, royal ? row.black.royal : row.black.pawn);
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
                            height: `${Globals.TILESIZE}px`,
                        }}
                    />
                );
            };
            return null;
        };
        return null;
    };

    const highlightedTileElements = highlightedTiles.map((tileCoordinate) => {
        const tileKey = getTileKeyFromCoordinates(tileCoordinate.x, tileCoordinate.y);
        if (isTileKey(tileKey)) { 
            const tile = chessboard[tileKey];
            const color = isPieceAtTile(tile, pieces) ? "pink" : "lightgreen";
            return (
                <HighlightedTile 
                    key={`highlightedTile-${tile.id}`}
                    coordinates={{x: tile.x, y: tile.y}}
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
                        const allPieceView = buildPieceView(pieces);
                        const piece = getPieceById(pieceID)
                        if (piece) {
                            const highlights = [...piece.calculateMovement(allPieceView)];
                            for (const highlight of highlights) {
                                console.log(`Highlight: ${highlight.x}/${highlight.y}`);
                            }
                            if (piece instanceof SpecialMovablePiece) {
                                console.log("Calculating special moves...");
                                const specialMoves = (piece as SpecialMovablePiece).calculateSpecialMovement(allPieceView);
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
                const piece = getPieceById(draggingPiece);
                if (piece && piece instanceof SpecialMovablePiece) {
                    piece.hasMoved = true;
                }
                
                setDraggingPiece(null)
                setHighlightedTiles([])
                const dropPos: Coordinate = {
                    x: event.pageX,
                    y: event.pageY
                };
                const translatedPos: Coordinate = {
                    x: Math.floor(dropPos.x / Globals.TILESIZE), 
                    y: Math.floor(dropPos.y / Globals.TILESIZE)
                };

                if (translatedPos.x > 0 && translatedPos.x <= Globals.BOARDSIZE) {
                    if (translatedPos.y > 0 && translatedPos.y <= Globals.BOARDSIZE) {
                        let found = null;
                        for (const tile of highlightedTiles) {
                            if (translatedPos.x === tile.x && translatedPos.y === tile.y) {
                                const pieceData = pieces.filter(piece => piece.id === draggingPiece)[0];
                                pieceData.x = translatedPos.x;
                                pieceData.y = translatedPos.y;
                                found = true;
                                break;
                            };
                        };

                        if (!found) {
                            console.log("Tried to drop piece, but wasn't at a valid coordinate.");
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
        </div>
    );
};

export default Chessboard;