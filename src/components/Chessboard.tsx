import React, { useEffect, useState } from 'react';
import { Coordinate, TileColor } from './CommonTypes'
import ChessTile, { ChessTileInterface } from "./ChessTile"
import "./Chessboard.css";


interface TileGrid {
    [key: string]: ChessTileInterface
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

function getTileKey(row: number, col: number): string {
    const colLetter: Col = translationKey[col - 1];
    return `${colLetter}${row}`;
};

const chessboard: TileGrid = {}
const BOARDSIZE = 8;
const TILESIZE = 128;

function buildChessboard() {
    
    for (let row = BOARDSIZE; row >= 1; row-- ) {
        for (let col = 1; col <= BOARDSIZE; col++ ) {
            /*
                Tiles are represents as letter-number, where a letter is a
                reference to the column, and the number is the row that the
                tile is in. For example, the first column is A and the last
                column is H. Importantly, numbering starts from the bottom to
                the top, rather than top to bottom, so to instantiate the 
                board, I must begin at BOARDSIZE.
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
                size: TILESIZE,
                color: tileColor,
                getCenter(): Coordinate {
                    const coord: Coordinate = {
                        x: ((this.x - 1) * TILESIZE) / 2,
                        y: ((this.y - 1) * TILESIZE) / 2,
                    };
                    return coord;
                }
            };

            chessboard[tileKey] = chessTile;
        }
    }
}

buildChessboard();
console.log(chessboard);

/*
interface Props {
    id: string,
    key: string;
    x: number,
    y: number,
    size: number,
    color: TileColor,
    getCenter(): Coordinate,
};
*/

const SIZECALC = `${TILESIZE * BOARDSIZE}px`;

function Chessboard() {

    const [highlightedTile, setHighlightedTile] = useState("A1");
    const [shiftHeld, setShiftHeld] = useState(false);

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

    useEffect(() => {
        function moveTile(xMovement: number, yMovement: number) {
            const tileLetter = highlightedTile[0];
            const x = translationKey.indexOf(tileLetter as Col) + 1;
            const y = parseInt(highlightedTile[1]);
        
            let destX = x + xMovement;
            let destY = y + yMovement;

            console.log(`Current X/Y before movement is ${x}/${y}`);
            // Horizontal clamping
            if (destX < 1 || destX > BOARDSIZE) {
                destX = destX < 1 ? 1 : BOARDSIZE;
                console.log("Hit horizontal limit.");
            }
        
            // Vertical clamping
            if (destY < 1 || destY > BOARDSIZE) {
                destY = destY < 1 ? 1 : BOARDSIZE;
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
            const distance = shiftHeld ? BOARDSIZE : 1;
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

        document.addEventListener("keydown", handleKeyDown);
        document.addEventListener("keyup", handleKeyUp);

        // Cleanup function, so it doesn't add the event listener repeatedly
        return () => {
            document.removeEventListener("keydown", handleKeyDown);
            document.removeEventListener("keyup", handleKeyUp);
        };

    }, [highlightedTile, shiftHeld]);

    return (
        <div 
            className="flex justify-center"
            style={{ width: SIZECALC, height: SIZECALC }}>
            {tiles}
        </div>
    );
};

export default Chessboard;