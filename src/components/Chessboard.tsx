import { useEffect, useState } from 'react';

import { ChessPieceProps } from "./ChessPiece";
import ChessTile, { ChessTileInterface } from "./ChessTile"
import { Coordinate, SizeProps, TileColor } from "./CommonTypes";

import "./Chessboard.css";

interface TileGrid {
    [key: string]: ChessTileInterface;
};

interface PieceDict {
    [key: string]: ChessPieceProps;
}

type Col = "A" | "B" | "C" | "D" | "E" | "F" | "G" | "H";

const translationKey: Array<Col> = [
    "A",
    "B",
    "C",
    "D",
    "E",
    "F",
    "G",
    "H"
];

function isTileKey(key: string) {
    if (key.length === 2) {
        const letter = key[0].toLowerCase();
        if (letter >= "a" && letter <= "h") {
            const number = parseInt(key[1]);
            if (number) {
                if (number >= 1 && number <= 8) {
                    return true;
                }
                return false;
            }
            return false;
        }
        return false;
    }
    return false;
}

function getTileKey(row: number, col: number): string {
    const colLetter: Col = translationKey[col - 1];
    return `${colLetter}${row}`;
};

function Chessboard(props: SizeProps) {

    const [chessboard, setChessboard] = useState<TileGrid>({});
    const [pieces, setPieces] = useState<PieceDict>({});
    const [highlightedTile, setHighlightedTile] = useState("A1");
    const [shiftHeld, setShiftHeld] = useState(false);

    let tempChessboard: TileGrid = {};
    let tempPieces: PieceDict = {};

    function placePieces(): PieceDict {

        const newPieces: PieceDict = {};

        const initialPieces = []

        for (let i = 0; i < props.boardSize; i++) {
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
                size: tile.size,
                imagePath: `src/assets/images/${piece.name}-${piece.color[0]}.png`
            };

            newPieces[newPiece.id] = newPiece;
        }

        return newPieces;

    }

    function buildChessboard(): TileGrid {
        
        const newChessboard: TileGrid = {};

        for (let row = props.boardSize; row >= 1; row-- ) {
            for (let col = 1; col <= props.boardSize; col++ ) {
                /*
                    Tiles are represents as letter-number, where a letter is a
                    reference to the column, and the number is the row that the
                    tile is in. For example, the first column is A and the last
                    column is H. Importantly, numbering starts from the bottom to
                    the top, rather than top to bottom, so to instantiate the 
                    board, I must begin at props.boardSize.
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
    
                const tileKey = getTileKey(row, col);
                const chessTile: ChessTileInterface = {
                    id: tileKey,
                    x: col,
                    y: row,
                    size: props.tileSize,
                    color: tileColor,
                    getCenter(): Coordinate {
                        const coord: Coordinate = {
                            x: ((this.x - 1) * props.tileSize) / 2,
                            y: ((this.y - 1) * props.tileSize) / 2,
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
            const pieceTile = getTileKey(piece.y, piece.x);
            if (tile === pieceTile) {
                drawPiece = piece;
                break;
            }
        }
        return (
            <ChessTile 
                id={chessboard[tile].id}
                key={chessboard[tile].id}
                x={chessboard[tile].x}
                y={chessboard[tile].y}
                size={chessboard[tile].size}
                color={chessboard[tile].id === highlightedTile ? "lightgreen" : chessboard[tile].color}
                border={chessboard[tile].color}
                getCenter={chessboard[tile].getCenter}
                drawPiece={drawPiece}
            />
        )
    });

    useEffect(() => {
        function moveTile(xMovement: number, yMovement: number) {
            const tileLetter = highlightedTile[0];
            const x = translationKey.indexOf(tileLetter as Col) + 1;
            const y = parseInt(highlightedTile[1]);
        
            let destX = x + xMovement;
            let destY = y + yMovement;

            console.log(`Current X/Y before movement is ${x}/${y}`);
            // Horizontal clamping
            if (destX < 1 || destX > props.boardSize) {
                destX = destX < 1 ? 1 : props.boardSize;
                console.log("Hit horizontal limit.");
            }
        
            // Vertical clamping
            if (destY < 1 || destY > props.boardSize) {
                destY = destY < 1 ? 1 : props.boardSize;
                console.log("Hit vertical limit.");
            }
    
            const newTile = getTileKey(destY, destX);

            if (newTile !== highlightedTile) {
                setHighlightedTile(newTile);
                console.log(`Trying to move to ${newTile}`)
            } else {
                console.log("No movement possible.");
            }
        };
    
        function handleKeyDown(event: KeyboardEvent) {
            const distance = shiftHeld ? props.boardSize : 1;
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
            let target = event.target;
            if (target instanceof HTMLImageElement) {
                target = target.parentElement as HTMLDivElement;
            }
            if (target instanceof HTMLDivElement) {
                if (isTileKey(target.id)) {
                    setHighlightedTile(target.id);
                }
            }
        }

        document.addEventListener("keydown", handleKeyDown);
        document.addEventListener("keyup", handleKeyUp);
        document.addEventListener("mousedown", handleClick);

        // Cleanup function, so it doesn't add the event listeners repeatedly
        return () => {
            document.removeEventListener("keydown", handleKeyDown);
            document.removeEventListener("keyup", handleKeyUp);
            document.removeEventListener("mousedown", handleClick);
        };

    }, [highlightedTile, shiftHeld, props]);

    const SIZECALC = `${props.tileSize * props.boardSize}px`;

    return (
        <div 
            className="flex justify-center"
            style={{ width: SIZECALC, height: SIZECALC }}>
            {tiles}
        </div>
    );
};

export default Chessboard;