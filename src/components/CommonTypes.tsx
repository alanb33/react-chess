// Used to determine tile colors.
export type TileColor = "black" | "white" | "lightgreen" | "lightred";

// Used to pass size information.
export interface SizeProps {
    "boardSize": number;
    "tileSize": number;
};

// Used to track state of mouse position
export interface MousePos {
    "x": number;
    "y": number;
};