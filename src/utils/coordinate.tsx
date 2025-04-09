// import { buildPieceView } from "./piece-utils";
// import { Piece, PieceColor } from "../assets/types/chesspiece/ChessPieceTypes";

export class Coordinate {
    x: number = 0;
    y: number = 0;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    };

    equals(other: Coordinate) {
        if (this.x === other.x && this.y === other.y) {
            return true;
        }
        return false;
    }

    toString(): string {return `[${this.x}/${this.y}]`};

    // getPiecesInRange(allPieces: Piece[], threateningColor: PieceColor): Piece[];
}