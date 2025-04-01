import { getTileKeyFromCoordinates } from "../utils/tile-utils";
import Globals from "../config/globals";

const pieceDict: {[key: string]: number} = {};

function generatePieceID(name: string, color: string): string {

    const key = `${name}-${color}`;

    if (pieceDict[key]) {
        pieceDict[key] += 1;
    } else {
        pieceDict[key] = 1;
    }

    return `${key}-${pieceDict[key]}`;
}

export class Piece {
    name: string;
    color: string;
    x: number;
    y: number;
    id: string;
    imagePath: string;

    constructor (name: string, color: string, x: number, y: number) {
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
}

export interface ChessPieceProps {
    id: string,
    x: number,
    y: number,
    imagePath: string,
    color: string,
    boardPosition: string,
};

function ChessPiece(props: ChessPieceProps) {
    return (
        <img src={props.imagePath}
            id={props.id}
            className={"size-full absolute"}
            chess-piece={"true"}
            board-position={props.boardPosition}
            style={{ 
                zIndex: Globals.Z_INDEX.PIECE,
                cursor: "grab",
                left: Globals.TILESIZE * props.x,
                top: Globals.TILESIZE * props.y,
                width: Globals.TILESIZE,
                height: Globals.TILESIZE,
            }}>
            </img>
    );
};

export default ChessPiece;