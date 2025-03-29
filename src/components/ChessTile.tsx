import ChessPiece, { ChessPieceProps } from "./ChessPiece"
import { Coordinate, TileColor } from "./CommonTypes";
import "./ChessTile.css";

interface ChessTileInterface {
    id: string,
    x: number,
    y: number,
    size: number,
    color: TileColor;
    getCenter(): Coordinate
};

interface Props {
    id: string,
    x: number,
    y: number,
    size: number,
    color: TileColor,
    border: TileColor,
    getCenter(): Coordinate,
    drawPiece: ChessPieceProps | null,
    highlighted: boolean,
};

const PLAYER_COLOR = "white"
const WHITE_COLOR = "cornsilk";
const BLACK_COLOR = "chocolate";
const HIGHLIGHT_COLOR = "lightgreen";

function ChessTile(props: Props) {
    const xPx: string = `${(props.x * props.size)}px`;
    const yPx: string = `${(props.y * props.size)}px`;

    let color = WHITE_COLOR;
    if (props.color === "black") {
        color = BLACK_COLOR;
    };

    if (props.highlighted) {
        color = HIGHLIGHT_COLOR;
    }

    if (props.drawPiece) {
        return (
            <>
                <div
                    className={`absolute`}
                    chess-tile={"true"}
                    style={{ 
                        left: xPx, 
                        top: yPx, 
                        backgroundColor: color,
                        height: props.size + "px",
                        width: props.size + "px",
                        border: `${props.size / 8}px solid ${props.border === "white" ? WHITE_COLOR : BLACK_COLOR }`,
                        //cursor: props.drawPiece.color === PLAYER_COLOR ? "grab" : "default",
                    }}
                    id={props.id}
                    key={props.id}>
                        <ChessPiece 
                            id={props.drawPiece.id}
                            key={props.drawPiece.id}
                            x={props.drawPiece.x}
                            y={props.drawPiece.y}
                            size={props.drawPiece.size}
                            color={props.drawPiece.color}
                            imagePath={props.drawPiece.imagePath}
                        />
                </div>
            </>
        );
    } else {
        return (
            <>
                <div
                    className={`absolute`}
                    chess-tile={"true"}
                    style={{ 
                        left: xPx, 
                        top: yPx, 
                        backgroundColor: color,
                        height: props.size + "px",
                        width: props.size + "px",
                        border: `${props.size / 8}px solid ${props.border === "white" ? "cornsilk" : "chocolate"}`
                    }}
                    id={props.id}
                    key={props.id}>
                </div>
            </>
        );
    };
};

export type { ChessTileInterface };
export default ChessTile;