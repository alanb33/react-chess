import ChessPiece from "../../../components/ChessPiece";
import { Coordinate } from "../../../components/CommonTypes";
import { getTileKeyFromCoordinates } from "../../../utils/tile-utils";
import Globals from "../../../config/globals";

export type PieceType = "pawn" | "rook" | "knight" | "bishop" | "king" | "queen";

const pieceDict: {[key: string]: number} = {};

function generatePieceID(name: PieceType, color: string): string {

    const key = `${name}-${color}`;

    if (pieceDict[key]) {
        pieceDict[key] += 1;
    } else {
        pieceDict[key] = 1;
    }

    return `${key}-${pieceDict[key]}`;
}

export class Piece {
    name: PieceType;
    color: string;
    x: number;
    y: number;
    id: string;
    imagePath: string;

    static buildPiece (name: PieceType, color: string, x: number, y: number) {
        const params: [PieceType, string, number, number] = [name, color, x, y];
        switch (name) {
            case "pawn": return new Pawn(...params);
            case "rook": return new Rook(...params);
            case "knight": return new Knight(...params);
            case "bishop": return new Bishop(...params);
            case "king": return new King(...params);
            case "queen": return new Queen(...params); 
        };
    };

    constructor (name: PieceType, color: string, x: number, y: number) {
        this.name = name;
        this.color = color;
        this.id = generatePieceID(this.name, this.color);
        this.imagePath = `src/assets/images/${this.name}-${this.color[0]}.png`

        if ((x > 0 && x <= Globals.BOARDSIZE) && (y > 0 && y <= Globals.BOARDSIZE)) {
            this.x = x;
            this.y = y;
        } else {
            console.error(`Failed to assign proper tile to ${color} ${name}: received ${x}/${y}, using 0/0 fallback`);
            this.x = 0;
            this.y = 0;
        }
    };

    buildElement() {
        return <ChessPiece
            id={this.id}
            key={this.id}
            x={this.x}
            y={this.y}
            color={this.color}
            imagePath={this.imagePath}
            boardPosition={getTileKeyFromCoordinates(this.x, this.y)}
        />
    }

    calculateMovement(_: Piece[]): Coordinate[] {
        console.error("Invocation of base calculateMovement.");
        return [];
    };
}


// TODO: There's some off-by-one error somewhere. It has to do with piece x/y and movement limitations.
class Pawn extends Piece {
    calculateMovement(allPieces: Piece[]): Coordinate[] {
        const tilesToHighlight = [];

        // If we're white, move downwards, and if black, move upwards.
        const dir = this.color === "white" ? 1 : -1;

        if (this.y + dir > 0 || this.y + dir <= Globals.BOARDSIZE) {
            const dest: Coordinate = {x: this.x, y: this.y + dir};
            let pieceAhead = false;
            for (const piece of allPieces) {
                if (piece.x === dest.x && piece.y === dest.y) {
                    pieceAhead = true;
                };

                // Check for enemy pieces in the diagonals
                const diagonalX = [-1, 1];
                if (piece.y === dest.y && piece.color !== this.color) {
                    for (const diagonal of diagonalX) {
                        console.log(`Testing diagonal ${diagonal}`);
                        if (piece.x === dest.x + diagonal) {
                            const enemyCoord: Coordinate = {x: dest.x + diagonal, y: dest.y}
                            console.log(`Pushing enemy piece from ${piece.x}/${piece.y}`);
                            tilesToHighlight.push(enemyCoord);
                        };
                    };
                };
            };

            if (!pieceAhead) {
                tilesToHighlight.push(dest);
            };
        };

        return tilesToHighlight;
    };
};

class Rook extends Piece {
    calculateMovement(allPieces: Piece[]): Coordinate[] {
        console.log("Hello world. Rook override.");
        return [];
    }
}

class Knight extends Piece {
    calculateMovement(allPieces: Piece[]): Coordinate[] {
        console.log("Hello world. Knight override.");
        return [];
    }
}

class Bishop extends Piece {
    calculateMovement(allPieces: Piece[]): Coordinate[] {
        console.log("Hello world. Bishop override.");
        return [];
    }
}

class King extends Piece {
    calculateMovement(allPieces: Piece[]): Coordinate[] {
        console.log("Hello world. King override.");
        return [];
    }
}

class Queen extends Piece {
    calculateMovement(allPieces: Piece[]): Coordinate[] {
        console.log("Hello world. Queen override.");
        return [];
    }
}