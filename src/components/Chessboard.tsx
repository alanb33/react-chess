//import React from 'react';
import { Coordinate, TileColor } from './CommonTypes'
import "./Chessboard.css";

interface ChessTile {
    x: number,
    y: number,
    size: number,
    color: TileColor;
    getCenter(): Coordinate
};

interface TileGrid {
    [key: string]: ChessTile
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
const TILESIZE = 32;

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
            const chessTile: ChessTile = {
                x: col,
                y: row,
                size: TILESIZE,
                color: tileColor,
                getCenter(): Coordinate {
                    const coord: Coordinate = {
                        x: (this.x * TILESIZE) / 2,
                        y: (this.y * TILESIZE) / 2,
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

function Chessboard() {

    return (
        <div className="size-32 flex justify-center w-full">
            <p className="w-full">Hello, world!</p>
        </div>
    );
};

export default Chessboard;