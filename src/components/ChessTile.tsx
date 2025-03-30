import ChessPiece, { ChessPieceProps } from "./ChessPiece"
import { Coordinate, TileColor } from "./CommonTypes";
import "./ChessTile.css";

import Globals from "../config/globals"

interface ChessTileInterface {
    id: string,
    x: number,
    y: number,
    color: TileColor;
    getCenter(): Coordinate
};

interface Props {
    id: string,
    x: number,
    y: number,
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
    const xPx: string = `${(props.x * Globals.TILESIZE)}px`;
    const yPx: string = `${(props.y * Globals.TILESIZE)}px`;

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
                        height: Globals.TILESIZE + "px",
                        width: Globals.TILESIZE + "px",
                        border: `${Globals.TILESIZE / Globals.BORDER_FRACTION}px solid ${props.border === "white" ? WHITE_COLOR : BLACK_COLOR }`,
                        //cursor: props.drawPiece.color === PLAYER_COLOR ? "grab" : "default",
                    }}
                    id={props.id}
                    key={props.id}>
                        <ChessPiece 
                            id={props.drawPiece.id}
                            key={props.drawPiece.id}
                            x={props.drawPiece.x}
                            y={props.drawPiece.y}
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
                        height: Globals.TILESIZE + "px",
                        width: Globals.TILESIZE + "px",
                        border: `${Globals.TILESIZE / Globals.BORDER_FRACTION}px solid ${props.border === "white" ? "cornsilk" : "chocolate"}`
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