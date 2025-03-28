import { useEffect, useState } from 'react';

import ChessPiece, { ChessPieceProps } from "./ChessPiece";
import ChessTile, { ChessTileInterface } from "./ChessTile"
import { Coordinate, SizeProps, TileColor } from "./CommonTypes";

import "./Chessboard.css";

interface TileGrid {
    [key: string]: ChessTileInterface;
};

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
    const [chessPieces, setChessPieces] = useState<Array<ChessPieceProps>>([]);
    const [highlightedTile, setHighlightedTile] = useState("A1");
    const [shiftHeld, setShiftHeld] = useState(false);

    function getTile(tileKey: string): ChessTileInterface | null {
        const lowerTile = tileKey.toLowerCase();
        return isTileKey(lowerTile) ? chessboard[lowerTile] : null;
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

    function placeInitialPieces(): Array<ChessPieceProps> {

        const setPieces = [];

        interface PieceData {
            piece: string,
            color: string,
            initialTile: string,
        };

        const pieces: PieceData[] = [
            {piece: "pawn",  color: "black", initialTile: "A7"},
            {piece: "pawn",  color: "black", initialTile: "B7"},
        ];

        for (const piece in pieces) {
            const data = pieces[piece];
            const tile = getTile(data.initialTile);
            console.log(`Tile is ${tile}. ${tile?.x} ${tile?.y}`);
            setPieces.push(
                {
                    imagePath: `src/assets/images/${data.piece}-${data.color[0]}.png`,
                    size: props.tileSize,
                    x: tile ? tile.x : 0,
                    y: tile ? tile.y : 0,
                    id: `${data.piece}-${data.initialTile}`,
                }
            )
        }

        return setPieces;

    };

    if (Object.keys(chessboard).length === 0) {
        setChessboard(buildChessboard());
        setChessPieces(placeInitialPieces());
    }

    const tileKeys = Object.keys(chessboard)
    const tiles = tileKeys.map((tile) => (
        <ChessTile 
            id={chessboard[tile].id}
            key={chessboard[tile].id}
            x={chessboard[tile].x}
            y={chessboard[tile].y}
            size={chessboard[tile].size}
            color={chessboard[tile].id === highlightedTile ? "lightgreen" : chessboard[tile].color}
            border={chessboard[tile].color}
            getCenter={chessboard[tile].getCenter} />
    ));

    const pieces = chessPieces.map((piece) => (
        <ChessPiece
            id={piece.id}
            key={piece.id}
            x={piece.x}
            y={piece.y}
            size={piece.size}
            imagePath={piece.imagePath} />
    ));

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
                        console.log("Holding shift");
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
            const target = event.target as Element;
            if (target) {
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
            {pieces}
        </div>
    );
};

export default Chessboard;