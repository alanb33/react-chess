import { Coordinate } from "./CommonTypes";
import Globals from "../config/globals";
import { PieceType } from "../assets/types/chesspiece/ChessPieceTypes";
import { getPieceTypeFromId, PieceView } from "../utils/piece-utils";
import { getTileKeyFromCoordinates } from "../utils/tile-utils";

type Side = "white" | "black"

type Manuever = "en passant" | "castling" | "capture" | "none"

interface ScoreEntry {
    "white": string;
    "black": string;
};

class MoveLog {
    #turn: number;
    #turnHistory: ScoreEntry[];
    
    constructor() {
        this.#turn = 0;
        this.#turnHistory = [];
        this.#turnHistory.push({"white": "", "black": ""});
    }

    buildElement() {
        let turn  = 1;
        const scoreHistoryLi = this.#turnHistory.map(score => {
            return (
                <li>{turn++}.<span style={{paddingLeft: "2em"}}>{score.white}</span><span style={{paddingLeft: "3em"}}>{score.black}</span></li>
            );
        });
        const distanceTilesOffset = 1;
        return (
            <div
            style = {{
                left: ((Globals.BOARDSIZE + distanceTilesOffset) * Globals.TILESIZE),
                top: (Globals.TILESIZE),
                position: "absolute",
                background: "white"
            }}>
                <h1>Move History</h1>
                <span style={{paddingLeft: "2em"}}>White</span>
                <span style={{paddingLeft: "2em"}}>Black</span>
                <ul>
                    {scoreHistoryLi}
                </ul>
            </div>
        );
    };

    #getNormalMovement(piece: PieceView, dest: Coordinate) {
        
        const abbr = this.#getPieceAbbreviation(piece);
        const destKey = getTileKeyFromCoordinates(dest.x, dest.y).toLowerCase();
        const assembled = `${abbr}${destKey}`

        return assembled;
    }

    #getPieceAbbreviation(piece: PieceView): string {
        const pieceType = getPieceTypeFromId(piece.id) as PieceType;
        let abbr = "";

        // Set abbreviation based on the moving piece. Pawns don't get one.
        switch (pieceType) {
            case "bishop":
                abbr = "B";
                break;
            case "king":
                abbr = "K";
                break;
            case "knight":
                abbr = "N";
                break;
            case "queen":
                abbr = "Q";
                break;
            case "rook":
                abbr = "R";
                break;
            case "pawn":
                // Redundant, but used to allow default for bad type 
                break;
            default:
                abbr = "?";
                break;
        };

        return abbr;
    }

    #modifyForCaptureString(moveString: string, piece: PieceView): string {
        /*
            Modify a basic "normal" move to turn it into a "capture" move.
            In all cases but the pawn, this involves placing an X between the
            piece letter and its movement.

            For the pawn, this involves prepending the string with the pawn's
            original column letter and an x.
        */
        
        let newString = moveString;
        const pieceType = getPieceTypeFromId(piece.id) as PieceType;

        switch (pieceType) {
            case "bishop":
            case "knight":
            case "king":
            case "queen":
            case "rook": {
                const pieceLetter = moveString.substring(0, 1);
                const movement = moveString.substring(2);
                newString = `${pieceLetter}x${movement}`;
                break;
            }
            case "pawn": {
                /* 
                    Here, the string is prepended by origin column + x.
                    For example, if the pawn moved from Column D to capture
                    a piece in E6, then the string will be dxe6.
                */
               const originColumnLetter = getTileKeyFromCoordinates(piece.x, piece.y).toLowerCase()[0];
               newString = `${originColumnLetter}x${moveString}`;
            }
        };

        return newString;
    };

    recordMove(piece: PieceView, dest: Coordinate, manuever: Manuever = "none") {

        // Switch logic based on manuever
        let moveString = ""
        switch (manuever) {
            case "none":
                moveString = this.#getNormalMovement(piece, dest);
                break;
            case "capture":
                moveString = this.#getNormalMovement(piece, dest);
                moveString = this.#modifyForCaptureString(moveString, piece);
        };

        this.#writeLog(moveString, piece.color as Side);
    };

    #writeLog(move: string, color: Side) {
        if (this.#turnHistory.length - 1 !== this.#turn) {
            const blankEntry = {"white": "", "black": ""}
            this.#turnHistory.push(blankEntry);
        }
        console.log(`this.turn is ${this.#turn}`);
        const entry: ScoreEntry = this.#turnHistory[this.#turn];
        entry[color] = move;

        if (color === "black") {
            this.#turn++;
        }
    };

}

export default MoveLog;