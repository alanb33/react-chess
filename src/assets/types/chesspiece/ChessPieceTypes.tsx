import ChessPiece from "../../../components/ChessPiece";
import { Coordinate } from "../../../components/CommonTypes";
import { getPieceAtCoordinate, getTileKeyFromCoordinates, isCoordinateValid, isPieceAtCoordinate } from "../../../utils/tile-utils";
import { getPieceTypeFromId, PieceView, PieceViewPawn } from "../../../utils/piece-utils";
import Globals from "../../../config/globals";

export type PieceType = "pawn" | "rook" | "knight" | "bishop" | "king" | "queen";

const pieceDict: {[key: string]: number} = {};

type Dir = "n" | "ne" | "e" | "se" | "s" | "sw" | "w" | "nw";

function getDirectionalTiles(origin: Piece, allPieces: PieceView[], directions: Dir[], maxDistance = Globals.BOARDSIZE): Coordinate[] {

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

    getCoordinate(): Coordinate { return {x: this.x, y: this.y} };

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

    abstract calculateMovement(allpieces: PieceView[]): Coordinate[];

    moveTo(dest: Coordinate) {
        this.x = dest.x;
        this.y = dest.y;
    };

    wouldCapture(other: PieceView) {
        if (this.x === other.x && this.y === other.y) {
            return true;
        }
        return false;
    }
};

export abstract class SpecialMovablePiece extends Piece {
    hasMoved: boolean;

    constructor (name: PieceType, color: string, x: number, y: number) {
        super(name, color, x, y);
        this.hasMoved = false;
    };

    abstract calculateSpecialMovement(allPieces: PieceView[]): Coordinate[];
}

export class Pawn extends SpecialMovablePiece {
    enPassantDest: Coordinate | null;
    justDoubleAdvanced: boolean;

    constructor (name: PieceType, color: string, x: number, y: number) {
        super(name, color, x, y);
        this.enPassantDest = null;
        this.justDoubleAdvanced = false;
    }

    calculateMovement(allPieces: PieceView[]): Coordinate[] {
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
                        if (piece.x === dest.x + diagonal) {
                            const enemyCoord: Coordinate = {x: dest.x + diagonal, y: dest.y}
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

    override calculateSpecialMovement(allPieces: PieceView[]): Coordinate[] {
        const highlights: Coordinate[] = [];
        highlights.push(...this.#calculateFirstTurnAdvancement(allPieces));
        highlights.push(...this.#calculateEnPassant(allPieces));
        return highlights;
    }

    #calculateEnPassant(allPieces: PieceView[]): Coordinate[] {
        console.log("Calculating en passant possibility.")
        const highlights: Coordinate[] = [];

        for (const piece of allPieces) {
            if (Object.hasOwn(piece, "justDoubleAdvanced")) {
                const otherPawn = piece as PieceViewPawn;
                if (otherPawn.id !== this.id) {
                    if (otherPawn.color !== this.color) {
                        const xDistance = Math.abs(otherPawn.x - this.x);
                        if (otherPawn.y === this.y && xDistance === 1) {
                            // If there is another pawn beside us that is not our color...
                            if (otherPawn.justDoubleAdvanced) {
                                // We a have a valid en passant target!
                                const dir = otherPawn.color === "white" ? -1 : 1;
                                const dest: Coordinate = {x: otherPawn.x, y: otherPawn.y + dir };
                                this.enPassantDest = dest;
                                highlights.push(dest); 
                            };
                        };
                    };
                };
            };
        };

        console.log(`en passant highlights length: ${highlights.length}`)
        if (highlights.length > 0) {
            console.log(`highlights[0] === ${highlights[0].x}/${highlights[0].y}`)
        };

        return highlights;
    };

    #calculateFirstTurnAdvancement(allPieces: PieceView[]): Coordinate[] {
        const highlights: Coordinate[] = [];

        if (!this.hasMoved) {
            // If we're white, move downwards, and if black, move upwards.
            const dir = this.color === "white" ? 1 : -1;
            const steps = 2;

            let destBlocked = false;
            for (let step = 1; step <= steps; step++) {
                if (destBlocked) {
                    break;
                };

                const dest: Coordinate = {x: this.x, y: this.y + (dir * step)};
                if (isCoordinateValid(dest)) {
                    for (const piece of allPieces) {
                        if (piece.x === dest.x && piece.y === dest.y) {
                            console.log("The destination is blocked by another piece.");
                            destBlocked = true;
                            break;
                        };
                    };
                    if (!destBlocked) {
                        highlights.push(dest);
                    }
                } else {
                    break;
                };
            };
        };

        return highlights;
    }
};

class Rook extends SpecialMovablePiece {
    calculateMovement(allPieces: PieceView[]): Coordinate[] {
        const toCheck: Dir[] = ["n", "e", "s", "w"];
        return getDirectionalTiles(this, allPieces, toCheck);
    };

    calculateSpecialMovement(allPieces: PieceView[]): Coordinate[] {
        // This is a dummy function; Rook has no special movements of its own,
        // but needs to be SpecialMovablePiece for invocations of hasMoved
        return [];
    };
};

class Knight extends Piece {
    calculateMovement(allPieces: PieceView[]): Coordinate[] {

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

                if (isCoordinateValid(dest)) {
                    if (isPieceAtCoordinate(dest, allPieces)) {
                        const piece = getPieceAtCoordinate(dest, allPieces)!;
                        // Only mark if it's an enemy piece
                        if (piece.color !== this.color) {
                            tiles.push(dest);
                        };
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
    calculateMovement(allPieces: PieceView[]): Coordinate[] {
        const toCheck: Dir[] = ["nw", "sw", "se", "ne"];
        return getDirectionalTiles(this, allPieces, toCheck);
    }
}

export class King extends SpecialMovablePiece {
    kingCastlingDest: Coordinate | null;
    queenCastlingDest: Coordinate | null;

    constructor (name: PieceType, color: string, x: number, y: number) {
        super(name, color, x, y);
        this.kingCastlingDest = null;
        this.queenCastlingDest = null;
    }

    calculateMovement(allPieces: PieceView[]): Coordinate[] {
        const toCheck: Dir[] = ["n", "e", "s", "w", "nw", "sw", "se", "ne"];
        return getDirectionalTiles(this, allPieces, toCheck, 1);
    }

    calculateSpecialMovement(allPieces: PieceView[]): Coordinate[] {
        const specialHighlights = [];
        const kingCastling = this.#calculateKingSideCastling(allPieces);
        const queenCastling = this.#calculateQueenSideCastling(allPieces);

        if (kingCastling) {
            specialHighlights.push(kingCastling)
        };

        if (queenCastling) {
            specialHighlights.push(queenCastling);
        };

        return specialHighlights;
    };

    #calculateKingSideCastling(allPieces: PieceView[]): Coordinate | null {
        /*
            Kingside Castling: If the King has not moved, and there are two
            free spaces to the right of the King, and there is a Rook three
            spaces to the right of the King, and the Rook has not moved, and
            the Rook is the same color as the King,

            then highlight the space two to the right and mark a castlingDest.
        */

        // If we haven't moved...
        if (!this.hasMoved) {
            const possibleCastlingCoord = {x: this.x + 2, y: this.y};
            let valid = true;
            for (let i = 1; i <= 2; i++) {
                const dest: Coordinate = {x: this.x + i, y: this.y};
                if (getPieceAtCoordinate(dest, allPieces)) {
                    valid = false;
                    break;
                };
            };
            if (valid) {
                // The next two steps are clear...
                const possibleRook = getPieceAtCoordinate({x: this.x + 3, y: this.y}, allPieces);
                if (possibleRook) {
                    const possibleRookType = getPieceTypeFromId(possibleRook.id);
                    if (possibleRookType === "rook") {
                        if (possibleRook.color === this.color) {
                            const ourRook = possibleRook as Rook;
                            if (!ourRook.hasMoved) {
                                // It's all valid, send it!
                                this.kingCastlingDest = possibleCastlingCoord;
                                return possibleCastlingCoord;
                            };
                        };
                    };
                };
            };
        };

        // No valid place for castling
        return null;
    };

    #calculateQueenSideCastling(allPieces: PieceView[]): Coordinate | null {
        /*
            Queenside Castling: If the King has not moved, and there are three
            free spaces to the left of the King, and there is a Rook four
            spaces to the right of the King, and the Rook has not moved, and
            the Rook is the same color as the King,

            then highlight the space three to the left and mark a castlingDest.
        */

        // If we haven't moved...
        if (!this.hasMoved) {
            const possibleCastlingCoord = {x: this.x - 2, y: this.y};
            let valid = true;
            for (let i = 1; i <= 3; i++) {
                const dest: Coordinate = {x: this.x - i, y: this.y};
                if (getPieceAtCoordinate(dest, allPieces)) {
                    valid = false;
                    break;
                };
            }
            if (valid) {
                // The next two steps are clear...
                const possibleRook = getPieceAtCoordinate({x: this.x - 4, y: this.y}, allPieces);
                if (possibleRook) {
                    const possibleRookType = getPieceTypeFromId(possibleRook.id);
                    if (possibleRookType === "rook") {
                        if (possibleRook.color === this.color) {
                            const ourRook = possibleRook as Rook;
                            if (!ourRook.hasMoved) {
                                // It's all valid, send it!
                                this.queenCastlingDest = possibleCastlingCoord;
                                return possibleCastlingCoord;
                            };
                        };
                    };
                };
            };
        };

        // No valid place for castling
        return null;
    };
};

class Queen extends Piece {
    calculateMovement(allPieces: PieceView[]): Coordinate[] {
        const toCheck: Dir[] = ["n", "e", "s", "w", "nw", "sw", "se", "ne"];
        return getDirectionalTiles(this, allPieces, toCheck);
    }
}