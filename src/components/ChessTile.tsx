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
};

const WHITE_COLOR = "cornsilk";
const BLACK_COLOR = "chocolate";

function ChessTile(props: Props) {
    const xPx: string = `${(props.x * props.size)}px`;
    const yPx: string = `${(props.y * props.size)}px`;

    let color = WHITE_COLOR;
    if (props.color === "lightgreen") {
        // We're highlighted.
        color = "lightgreen";
    } else if (props.color === "black") {
        color = BLACK_COLOR;
    };

    return (
        <>
            <div
                className={`absolute`}
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
    )
};

export type { ChessTileInterface };
export default ChessTile;