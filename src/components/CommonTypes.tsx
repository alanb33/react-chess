// Used to determine tile colors.
export type TileColor = "black" | "white" | "lightgreen" | "lightred";

// Used in some cases of x/y coordinate usage with tiles.
export interface Coordinate {
    x: number,
    y: number
};

// Used to pass size information.
export interface SizeProps {
    "boardSize": number;
    "tileSize": number;
};