import Globals from "../config/globals";
import { Coordinate } from "./CommonTypes";

interface HighlightedTileInterface {
    coordinates: Coordinate,
    color: string,
}

function HighlightedTile(props: HighlightedTileInterface) {
    // Create a div at the specified X/Y.
    // Use a z-level between the board and the chesspieces (board: -1? piece 1)
    const padding = (Globals.TILESIZE / Globals.BORDER_FRACTION);
    const withOffsets = {
        x: (Globals.TILESIZE * props.coordinates.x) + padding / 2,
        y: (Globals.TILESIZE * props.coordinates.y) + padding / 2,
    };
    const paddingSize = Globals.TILESIZE - padding;
    return (
        <div 
            id = "highlightedTile"
            className = "absolute"
            style = {{
                zIndex: Globals.Z_INDEX.HIGHLIGHT,
                left: withOffsets.x + "px",
                top: withOffsets.y + "px",
                width: paddingSize + "px",
                height: paddingSize + "px",
                padding: padding + "px",
                backgroundColor: props.color,
                borderRadius: "25%"
            }}
        />
    );
};

export default HighlightedTile;