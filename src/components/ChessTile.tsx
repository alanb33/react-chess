import "./ChessTile.css";
import { TileColor } from "./CommonTypes";

import Globals from "../config/globals"

interface ChessTileInterface {
    id: string,
    x: number,
    y: number,
    color: TileColor;
};

interface Props {
    id: string,
    x: number,
    y: number,
    color: TileColor,
    border: TileColor,
};

const WHITE_COLOR = "cornsilk";
const BLACK_COLOR = "chocolate";

function ChessTile(props: Props) {
    const xPx: string = `${(props.x * Globals.TILESIZE)}px`;
    const yPx: string = `${(props.y * Globals.TILESIZE)}px`;

    let color = WHITE_COLOR;
    if (props.color === "black") {
        color = BLACK_COLOR;
    };
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

export type { ChessTileInterface };
export default ChessTile;