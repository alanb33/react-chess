import React, { useContext, useState } from 'react';
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

    const tileKeys = Object.keys(chessboard)
    const [highlightedTile, setHighlightedTile] = useState("A1");
    const [processingKeypress, setProcessingKeypress] = useState(false);
    
    function moveTile(xMovement: number, yMovement: number) {
        if (!processingKeypress) {
            setProcessingKeypress(true);
            const tileLetter = highlightedTile[0];
            const x = translationKey.indexOf(tileLetter as Col) + 1;
            const y = parseInt(highlightedTile[1]);
        
            //console.log(`tileLetter is ${tileLetter} ${x}/${y}`);

            // Horizontal clamping
            if ((x - xMovement < 0) || (x + xMovement > BOARDSIZE - 1)) {
                //console.log("Hit horizontal boundary.");
                return;
            } 
        
            // Vertical clamping
            if ((y - yMovement < 0) || (y + yMovement > BOARDSIZE - 1)) {
                //console.log("Hit vertical boundary.")
                return;
            }

            const newTile = getTileKey(y + yMovement, x + xMovement);

            console.log(`Trying to move to ${newTile}`)

            setHighlightedTile(newTile);
            setProcessingKeypress(false);
        }
    };

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

    return (
        <div 
            className="flex justify-center"
            style={{ width: SIZECALC, height: SIZECALC }}>
            {tiles}
        </div>
    );
};

export default Chessboard;