import { useEffect, useState } from 'react';

import { Piece } from "./ChessPiece";
import ChessTile, { ChessTileInterface } from "./ChessTile"
import { Coordinate, MousePos, TileColor } from "./CommonTypes";
import HighlightedTile from "./HighlightedTile";

import Globals from "../config/globals";
import { isChessPiece, isChessboardTile, isTileKey } from "../utils/validators";
import { ColumnLetter, getTileKeyFromCoordinates, columnTranslationKey } from '../utils/tile-utils';

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

function Chessboard() {

    const [pieces, setPieces] = useState<Array<Piece>>([]);
    const [highlightedTile, setHighlightedTile] = useState("");
    const [shiftHeld, setShiftHeld] = useState(false);
    const [draggingPiece, setDraggingPiece] = useState<string | null>(null)
    const [mousePosition, setMousePosition] = useState<MousePos>({x: 0, y: 0});

    let tempPieces: Array<Piece> = [];

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

        function generateReflectedPieces(piece: string, column: number, royal: boolean, singlePiece: boolean = false): Array<Piece> {
            const max = Globals.BOARDSIZE + 1;
            
            const pieces = [];

            if (!singlePiece) {
                // For reference: wl/wr/bl/br = white-left, white-right, black-left, black-right
                const wl = new Piece(piece, "white", column, royal ? row.white.royal : row.white.pawn);
                const wr = new Piece(piece, "white", max - column, royal ? row.white.royal : row.white.pawn);
                const bl = new Piece(piece, "black", column, royal ? row.black.royal : row.black.pawn);
                const br = new Piece(piece, "black", max - column, royal ? row.black.royal : row.black.pawn);
                pieces.push(wl, wr, bl, br);
            } else {
                const w = new Piece(piece, "white", column, royal ? row.white.royal : row.white.pawn);
                const b = new Piece(piece, "black", column, royal ? row.black.royal : row.black.pawn);
                pieces.push(w, b);
            };
            return pieces;
        };

        // Pawn placement.
        const pawnHalfwayPoint = 4;
        for (let i = 1; i <= pawnHalfwayPoint; i++) {
            const piece = "pawn"
            const pawns = generateReflectedPieces(piece, i, false);
            initialPieces.push(...pawns);
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

    function getPieceDict() {
        if (pieces.length === 0) {
            return tempPieces;
        };
        return pieces;
    };

    function getPieceById(pieceID: string) {
        for (const piece of getPieceDict()) {
            if (piece.id === pieceID) {
                return piece;
            };
        };
        return null;
    };

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

    const highlightedTileElement = () => {
        if (highlightedTile !== "") {
            if (isTileKey(highlightedTile)) {
                const tile = chessboard[highlightedTile];
                return (
                    <HighlightedTile 
                        key="highlightedTile"
                        coordinates={{x: tile.x, y: tile.y}}
                        color="lightgreen"
                        />
                );
            };
        };
        return null
    };

    const allPieces = getPieceDict().map((piece) => piece.buildElement());   
     
    // TODO: Probably using too many things here. Read up on hooks and see what can be better-placed.
    useEffect(() => {
        function moveTile(xMovement: number, yMovement: number) {
            const tileLetter = highlightedTile[0];
            const x = columnTranslationKey.indexOf(tileLetter as ColumnLetter) + 1;
            const y = parseInt(highlightedTile[1]);
        
            let destX = x + xMovement;
            let destY = y + yMovement;

            console.log(`Current X/Y before movement is ${x}/${y}`);
            // Horizontal clamping
            if (destX < 1 || destX > Globals.BOARDSIZE) {
                destX = destX < 1 ? 1 : Globals.BOARDSIZE;
                console.log("Hit horizontal limit.");
            }
        
            // Vertical clamping
            if (destY < 1 || destY > Globals.BOARDSIZE) {
                destY = destY < 1 ? 1 : Globals.BOARDSIZE;
                console.log("Hit vertical limit.");
            }
    
            const newTile = getTileKeyFromCoordinates(destX, destY);

            if (newTile !== highlightedTile) {
                setHighlightedTile(newTile);
                console.log(`Trying to move to ${newTile}`)
            } else {
                console.log("No movement possible.");
            }
        };
    
        function handleKeyDown(event: KeyboardEvent) {
            const distance = shiftHeld ? Globals.BOARDSIZE : 1;
            switch (event.key) {
                case "Shift":
                    if (!shiftHeld) {
                        setShiftHeld(true);
                    }
                    break;
                case "ArrowUp":
                    moveTile(0, -distance);
                    break;
                case "ArrowDown":
                    moveTile(0, distance);
                    break;
                case "ArrowLeft":
                    moveTile(-distance, 0);
                    break;
                case "ArrowRight":
                    moveTile(distance, 0);
                    break;
            };
        };

        function handleKeyUp(event: KeyboardEvent) {
            if (event.key === "Shift") {
                console.log("Releasing shift");
                setShiftHeld(false);
            };
        };

        function handleClick(event: MouseEvent) {
            const target = event.target;

            if (target) {
                if (isChessPiece(target)) {
                    // nice
                }
            }
        }

        function handleDragStart(event: DragEvent) {
            event.preventDefault();
            const target = event.target;

            if (target) {
                if (isChessPiece(target)) {
                    const elem = target as HTMLImageElement;
                    setDraggingPiece(elem.getAttribute("id"));
                } else if (isChessboardTile(target)) {
                    if (pieces) {
                        for (const pieceIndex in pieces) {
                            const piece = pieces[pieceIndex];
                            const targetElem = target as HTMLDivElement;
                            if (getTileKeyFromCoordinates(piece.x, piece.y) === targetElem.id) {
                                setDraggingPiece(piece.id);
                                break;
                            }
                        }
                    }
                }
            }
        }

        // While this sounds like it should be a DragEvent/dragend event, it's actually going to be mouseup here since
        // the page is being re-rendered and the drag state is lost
        function handleDragEnd(event: MouseEvent) {
            if (draggingPiece) {
                setDraggingPiece(null)
            }
        }

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

        function updateMousePosition(event: MouseEvent) {
            const newMousePos = {
                x: event.pageX,
                y: event.pageY,
            }
            setMousePosition(newMousePos);
        }

        document.addEventListener("keydown", handleKeyDown);
        document.addEventListener("keyup", handleKeyUp);
        document.addEventListener("mousedown", handleClick);
        document.addEventListener("mouseover", handleHover);

        // Handling of piece clicking and dragging
        document.addEventListener("dragstart", handleDragStart);
        document.addEventListener("mouseup", handleDragEnd);
        document.addEventListener("mousemove", updateMousePosition);

        // Cleanup function, so it doesn't add the event listeners repeatedly
        return () => {
            document.removeEventListener("keydown", handleKeyDown);
            document.removeEventListener("keyup", handleKeyUp);
            document.removeEventListener("mousedown", handleClick);
            document.removeEventListener("mouseover", handleHover);
            document.removeEventListener("dragstart", handleDragStart);
            document.removeEventListener("mouseup", handleDragEnd);
            document.removeEventListener("mousemove", updateMousePosition);
        };

    }, [draggingPiece, mousePosition, highlightedTile, shiftHeld, pieces]);

    const SIZECALC = `${Globals.TILESIZE * Globals.BOARDSIZE}px`;

    return (
        <div 
            className="flex justify-center"
            id="chessboard"
            key="chessboard"
            style={{ width: SIZECALC, height: SIZECALC }}>
            {tiles}
            {cursorFollowerElement()}
            {highlightedTileElement()}
            {allPieces}
        </div>
    );
};

export default Chessboard;