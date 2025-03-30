import { useEffect, useState } from 'react';

import { ChessPieceProps } from "./ChessPiece";
import ChessTile, { ChessTileInterface } from "./ChessTile"
import { Coordinate, MousePos, TileColor } from "./CommonTypes";

import Globals from "../config/globals";
import { isChessPiece, isChessboardTile, isTileKey } from "../utils/validators";
import { Col, getTileKeyFromCoordinates, translationKey } from '../utils/tile-utils';

import "./Chessboard.css";

interface TileGrid {
    [key: string]: ChessTileInterface;
};

interface PieceDict {
    [key: string]: ChessPieceProps;
}

function Chessboard() {

    // TODO: Chessboard does not need to be a state object.
    const [chessboard, setChessboard] = useState<TileGrid>({});

    const [pieces, setPieces] = useState<PieceDict>({});
    const [highlightedTile, setHighlightedTile] = useState("A1");
    const [shiftHeld, setShiftHeld] = useState(false);
    const [draggingPiece, setDraggingPiece] = useState<string | null>(null)
    const [mousePosition, setMousePosition] = useState<MousePos>({x: 0, y: 0});

    let tempChessboard: TileGrid = {};
    let tempPieces: PieceDict = {};

    function placePieces(): PieceDict {

        const newPieces: PieceDict = {};

        const initialPieces = []

        for (let i = 0; i < Globals.BOARDSIZE; i++) {
            const columnPieces = []
            const columnLetter = translationKey[i];

            const pawn_white = {name: "pawn", color: "white", tile: `${columnLetter}2`};
            const pawn_black = {name: "pawn", color: "black", tile: `${columnLetter}7`};
            columnPieces.push(pawn_white, pawn_black);

            switch (columnLetter) {
                case "A":
                case "H": {
                    const rook_white = {name: "rook", color: "white", tile: `${columnLetter}1`};
                    const rook_black = {name: "rook", color: "black", tile: `${columnLetter}8`};
                    columnPieces.push(rook_white, rook_black);
                    break;
                }
                case "B":
                case "G": {
                    const knight_white = {name: "knight", color: "white", tile: `${columnLetter}1`};
                    const knight_black = {name: "knight", color: "black", tile: `${columnLetter}8`};
                    columnPieces.push(knight_white, knight_black);
                    break;
                }
                case "C":
                case "F": {
                    const bishop_white = {name: "bishop", color: "white", tile: `${columnLetter}1`};
                    const bishop_black = {name: "bishop", color: "black", tile: `${columnLetter}8`};
                    columnPieces.push(bishop_white, bishop_black);
                    break;
                }
                case "D": {
                    const queen_white = {name: "queen", color: "white", tile: `${columnLetter}1`};
                    const queen_black = {name: "queen", color: "black", tile: `${columnLetter}8`};
                    columnPieces.push(queen_white, queen_black);
                    break;
                }
                case "E": {
                    const king_white = {name: "king", color: "white", tile: `${columnLetter}1`};
                    const king_black = {name: "king", color: "black", tile: `${columnLetter}8`};
                    columnPieces.push(king_white, king_black);
                    break;
                }
            }

            initialPieces.push(...columnPieces);
        };

        for (const piece of initialPieces) {
            const tile = tempChessboard[piece.tile];
            const key = `${piece.name}-${piece.color[0]}-${piece.tile}`;
            const newPiece: ChessPieceProps = {
                id: key,
                x: tile.x,
                y: tile.y,
                color: piece.color,
                imagePath: `src/assets/images/${piece.name}-${piece.color[0]}.png`
            };

            newPieces[newPiece.id] = newPiece;
        }

        return newPieces;

    }

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
    }

    // First renderings

    if (Object.keys(chessboard).length === 0) {
        tempChessboard = buildChessboard();
        setChessboard(tempChessboard);
    }

    if (Object.keys(pieces).length === 0) {
        tempPieces = placePieces();
        setPieces(tempPieces);
    }

    function getPieceDict() {
        if (Object.keys(pieces).length === 0) {
            return tempPieces;
        }
        return pieces;
    }

    // Creating element tags

    const tileKeys = Object.keys(chessboard)
    const tiles = tileKeys.map((tile) => {
        let drawPiece = null;
        const pieceDict = getPieceDict();
        for (const pieceKey in pieceDict) {
            const piece = pieceDict[pieceKey];
            const pieceTile = getTileKeyFromCoordinates(piece.x, piece.y);
            if (tile === pieceTile && piece.id != draggingPiece)  {
                drawPiece = piece;
                break;
            }
        }
        const isHighlighted = chessboard[tile].id === highlightedTile;
        return (
            <ChessTile 
                id={chessboard[tile].id}
                key={chessboard[tile].id}
                x={chessboard[tile].x}
                y={chessboard[tile].y}
                color={chessboard[tile].color}
                border={chessboard[tile].color}
                getCenter={chessboard[tile].getCenter}
                drawPiece={drawPiece}
                highlighted={isHighlighted}
            />
        )
    });

    let cursorFollower = null;
    if (draggingPiece) {
        const piece = pieces[draggingPiece];
        cursorFollower = (
            <img
                src={piece.imagePath}
                style={{
                    position: "absolute",
                    left: mousePosition.x - Globals.TILESIZE / 2,
                    top: mousePosition.y - Globals.TILESIZE / 2,
                    width: `${Globals.TILESIZE}px`,
                    height: `${Globals.TILESIZE}px`,
                }}
                />
        )
    };

     
    // TODO: Probably using too many things here. Read up on hooks and see what can be better-placed.
    useEffect(() => {
        function moveTile(xMovement: number, yMovement: number) {
            const tileLetter = highlightedTile[0];
            const x = translationKey.indexOf(tileLetter as Col) + 1;
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
                let target = event.target as HTMLElement
                // It it's a chess piece, change the target to its parent tile.
                if (isChessPiece(target) && target.parentElement) {
                    target = target.parentElement;
                }

                // If it's a tile, highlight it.
                if (isChessboardTile(target)) {
                    if (isTileKey(target.id)) {
                        setHighlightedTile(target.id);
                    }
                }
            }
        }

        function updateMousePosition(event: MouseEvent) {
            const newMousePos = {
                x: event.clientX,
                y: event.clientY,
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
            style={{ width: SIZECALC, height: SIZECALC }}>
            {tiles}
            {draggingPiece ? cursorFollower : null}
        </div>
    );
};

export default Chessboard;