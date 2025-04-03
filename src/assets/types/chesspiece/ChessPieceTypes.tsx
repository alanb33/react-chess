import ChessPiece from "../../../components/ChessPiece";
import { Coordinate } from "../../../components/CommonTypes";
import { getPieceAtCoordinate, getTileKeyFromCoordinates, isCoordinateValid, isPieceAtCoordinate } from "../../../utils/tile-utils";
import Globals from "../../../config/globals";

export type PieceType = "pawn" | "rook" | "knight" | "bishop" | "king" | "queen";

const pieceDict: {[key: string]: number} = {};

type Dir = "n" | "ne" | "e" | "se" | "s" | "sw" | "w" | "nw";

function getDirectionalTiles(origin: Piece, allPieces: Piece[], directions: Dir[], maxDistance = Globals.BOARDSIZE): Coordinate[] {

    // Prepare the checking dictionary with all directions we need
    const checking: {[key: string]: boolean} = {}
    for (const dir of directions) {
        checking[dir] = true;
    }

    const returnTiles = [];

    for (let i = 1; i <= maxDistance; i++) {
        for (const dir of directions) {
            if (checking[dir]) {
                let xMovement = 0;
                let yMovement = 0;

                /* 
                    Since the Dir type is n/ne/se, etc -- this should get the
                    proper directions from their string contents!
                */
                if (dir.includes("n")) {
                    yMovement = -i;
                } else if (dir.includes("s")) {
                    yMovement = i;
                }
                if (dir.includes("w")) {
                    xMovement = -i;
                } else if (dir.includes("e")) {
                    xMovement = i;
                }

                const dest: Coordinate = {x: origin.x + xMovement, y: origin.y + yMovement};
                if (isCoordinateValid(dest)) {
                    // If the destination is valid...
                    if (isPieceAtCoordinate(dest, allPieces)) {
                        // And there is a piece at the destination....
                        const piece = getPieceAtCoordinate(dest, allPieces)
                        if (piece!.color !== origin.color) {
                            // Highlight it if it's an enemy piece.
                            returnTiles.push(dest);
                        }
                        // In any case, we're done checking in this direction.
                        checking[dir] = false;
                        continue;
                    } else {
                        // If there is no piece in that direction...
                        returnTiles.push(dest)
                    }
                } else {
                    // It's not a valid coordinate, so stop checking in this direction.
                    checking[dir] = false;
                    continue;
                };
            };
        };
    };

    return returnTiles;
};

function generatePieceID(name: PieceType, color: string): string {

    const key = `${name}-${color}`;

    if (pieceDict[key]) {
        pieceDict[key] += 1;
    } else {
        pieceDict[key] = 1;
    }

    return `${key}-${pieceDict[key]}`;
}

export class PieceBuilder {
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
};

export abstract class Piece {
    name: PieceType;
    color: string;
    x: number;
    y: number;
    id: string;
    imagePath: string;

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
    };

    abstract calculateMovement(allpieces: Piece[]): Coordinate[];
};

class Pawn extends Piece {
    calculateMovement(allPieces: Piece[]): Coordinate[] {
        const tilesToHighlight = [];

        // If we're white, move downwards, and if black, move upwards.
        const dir = this.color === "white" ? 1 : -1;

        if (this.y + dir > 0 || this.y + dir <= Globals.BOARDSIZE) {
            const dest: Coordinate = {x: this.x, y: this.y + dir};
            let pieceAhead = false;
            for (const piece of allPieces) {
                if (piece.x === dest.x && piece.y === dest.y) {
                    pieceAhead = true;
                };

                // Check for enemy pieces in the diagonals
                const diagonalX = [-1, 1];
                if (piece.y === dest.y && piece.color !== this.color) {
                    for (const diagonal of diagonalX) {
                        console.log(`Testing diagonal ${diagonal}`);
                        if (piece.x === dest.x + diagonal) {
                            const enemyCoord: Coordinate = {x: dest.x + diagonal, y: dest.y}
                            console.log(`Pushing enemy piece from ${piece.x}/${piece.y}`);
                            tilesToHighlight.push(enemyCoord);
                        };
                    };
                };
            };

            if (!pieceAhead) {
                tilesToHighlight.push(dest);
            };
        };

        return tilesToHighlight;
    };
};

class Rook extends Piece {
    calculateMovement(allPieces: Piece[]): Coordinate[] {
        const toCheck: Dir[] = ["n", "e", "s", "w"];
        return getDirectionalTiles(this, allPieces, toCheck);
    };
};

class Knight extends Piece {
    calculateMovement(allPieces: Piece[]): Coordinate[] {

        /*
            The knight moves in an unusual L-shaped pattern.

            There is the primary movement and then the secondary movement.
            The primary is always in two steps in one direction, and then
            one direct perdicular in both.

            For example, the knight can move in a primary direction of left,
            and following that, a secondary step in either perpendicular
            direction, up and down.

            The knight's primary direction is all cardinal directions, and
            the same for all second directions. There is no traditional 
            diagonal movement for this piece.
        */

        const tiles = []

        const primaryDirections = [
            "left",
            "right",
            "up",
            "down",
        ]

        for (const primary of primaryDirections) {
            /*
                If we know the primary movement, we can define the secondary
                movement. A list of possible coordinates is devised here, and
                then later, we'll operate over them to make sure they're valid.
            */

            const primaryStep = 2;
            const secondaryStep = 1;

            const secondaryDirections = []

            switch (primary) {
                case "left":
                case "right":
                    secondaryDirections.push("up", "down");
                    break;
                case "up":
                case "down":
                    secondaryDirections.push("left", "right");
                    break;
            }

            // First, assemble the destinations for the primary step.
            for (const secondary of secondaryDirections) {
                const dest: Coordinate = {x: 0, y: 0}

                let xMovement = 0;
                let yMovement = 0;

                // Define primary movement
                switch (primary) {
                    case "left":
                        xMovement = -primaryStep;
                        break;
                    case "right":
                        xMovement = primaryStep;
                        break;
                    case "up":
                        yMovement = -primaryStep;
                        break;
                    case "down":
                        yMovement = primaryStep;
                        break;
                };

                // Define secondary movement
                switch (secondary) {
                    case "left":
                        xMovement = -secondaryStep;
                        break;
                    case "right":
                        xMovement = secondaryStep;
                        break;
                    case "up":
                        yMovement = -secondaryStep;
                        break;
                    case "down":
                        yMovement = secondaryStep;
                        break;
                };

                // Movements are now defined! We can assemble a dest from these.
                dest.x = this.x + xMovement;
                dest.y = this.y + yMovement;

                console.log(`Knight trying destination ${dest.x}/${dest.y}`);

                if (isCoordinateValid(dest)) {
                    if (isPieceAtCoordinate(dest, allPieces)) {
                        const piece = getPieceAtCoordinate(dest, allPieces)!;
                        console.log(`A piece is present at ${dest.x}/${dest.y} and it's color ${piece.color} versus our ${this.color}`);
                        // Only mark if it's an enemy piece
                        if (piece.color !== this.color) {
                            console.log("...so it should be getting pushed.")
                            tiles.push(dest);
                        } else {
                            console.log("...so it shouldn't get pushed.");
                        }
                    } else {
                        // No piece is there
                        tiles.push(dest);
                    };
                };
            };
        };

        return tiles;

    };
};

class Bishop extends Piece {
    calculateMovement(allPieces: Piece[]): Coordinate[] {
        const toCheck: Dir[] = ["nw", "sw", "se", "ne"];
        return getDirectionalTiles(this, allPieces, toCheck);
    }
}

class King extends Piece {
    calculateMovement(allPieces: Piece[]): Coordinate[] {
        const toCheck: Dir[] = ["n", "e", "s", "w", "nw", "sw", "se", "ne"];
        return getDirectionalTiles(this, allPieces, toCheck, 1);
    }
}

class Queen extends Piece {
    calculateMovement(allPieces: Piece[]): Coordinate[] {
        const toCheck: Dir[] = ["n", "e", "s", "w", "nw", "sw", "se", "ne"];
        return getDirectionalTiles(this, allPieces, toCheck);
    }
}