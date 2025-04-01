import ChessPiece from "../../../components/ChessPiece";
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

    calculateMovement() {
        console.error("Invocation of base calculateMovement.");
    };
}

class Pawn extends Piece {
    calculateMovement() {
        console.log("Hello world. Pawn override.");
    }
}

class Rook extends Piece {
    calculateMovement() {
        console.log("Hello world. Rook override.");
    }
}

class Knight extends Piece {
    calculateMovement() {
        console.log("Hello world. Knight override.");
    }
}

class Bishop extends Piece {
    calculateMovement() {
        console.log("Hello world. Bishop override.");
    }
}

class King extends Piece {
    calculateMovement() {
        console.log("Hello world. King override.");
    }
}

class Queen extends Piece {
    calculateMovement() {
        console.log("Hello world. Queen override.");
    }
}