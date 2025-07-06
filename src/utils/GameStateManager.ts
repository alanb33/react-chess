import { King, Pawn, Piece, PieceType, PieceBuilder, Rook, SpecialMovablePiece } from "../assets/types/chesspiece/ChessPieceTypes";
import { Coordinate } from "./coordinate";
import MoveLog, { Manuever } from "../components/MoveLog";

interface SerializedPiece {
    type: PieceType;
    color: string;
    x: number;
    y: number;
    hasMoved?: boolean;
    enPassantDest?: { x: number; y: number } | null;
    justDoubleAdvanced?: boolean;
    kingCastlingDest?: { x: number; y: number } | null;
    queenCastlingDest?: { x: number; y: number } | null;
    captured?: boolean;
    threatener?: string | null;
    checked?: boolean;
    kingThreateningMovement?: { x: number; y: number }[];
}

interface SerializedGameState {
    pieces: SerializedPiece[];
    moveLog: SerializedMoveLog; // Array of move strings
    currentTurn: "white" | "black";
}

interface SerializedMoveLog {
    turnHistory: string[],
    turn: number
}

class GameStateManager {
    private static instance: GameStateManager;
    private pieces: Piece[] = [];
    private moveLog: MoveLog;
    private currentTurn: "white" | "black" = "white";
    private storageKey: string = "chessGameState";
    
    private constructor() {
        this.moveLog = new MoveLog();
    }
    
    public static getInstance(): GameStateManager {
        if (!GameStateManager.instance) {
            GameStateManager.instance = new GameStateManager();
        }
        return GameStateManager.instance;
    }
    
    public initialize(pieces: Piece[]): void {
        this.pieces = pieces;
        this.loadState();
    }
    
    public getCurrentTurn(): "white" | "black" {
        return this.currentTurn;
    }
    
    public switchTurn(): void {
        this.currentTurn = this.currentTurn === "white" ? "black" : "white";
    }
    
    public getPieces(): Piece[] {
        return this.pieces;
    }
    
    public getMoveLog(): MoveLog {
        return this.moveLog;
    }
    
    public setPieces(pieces: Piece[]): void {
        this.pieces = pieces;
    }
    
    public isPlayersTurn(pieceColor: string): boolean {
        return pieceColor === this.currentTurn;
    }
    
    private serializePieces(pieces: Piece[]): SerializedPiece[] {
        return pieces.map(piece => {
            const base: SerializedPiece = {
                type: piece.name,
                color: piece.color,
                x: piece.coordinate.x,
                y: piece.coordinate.y,
                captured: piece.captured,
            };
            
            if (piece instanceof SpecialMovablePiece) {
                base.hasMoved = piece.hasMoved;
            }
            
            if (piece instanceof Rook) {
                // While this appears to be a repeated line, Rooks actually are not
                // SpecialMovablePiece, they are IFirstMovable, so we need to save 
                // this state.
                base.hasMoved = piece.hasMoved;
            }
            
            if (piece instanceof Pawn) {
                base.enPassantDest = piece.enPassantDest ? { x: piece.enPassantDest.x, y: piece.enPassantDest.y } : null;
                base.justDoubleAdvanced = piece.justDoubleAdvanced;
            }
            
            
            
            if (piece instanceof King) {
                base.kingCastlingDest = piece.kingCastlingDest ? { x: piece.kingCastlingDest.x, y: piece.kingCastlingDest.y } : null;
                base.queenCastlingDest = piece.queenCastlingDest ? { x: piece.queenCastlingDest.x, y: piece.queenCastlingDest.y } : null;
                base.threatener = piece.threatener ? piece.threatener.id : null;
                if (base.threatener) {
                    base.checked = true
                }
            }
            
            return base;
        });
    }
    
    private deserializePieces(serialized: SerializedPiece[]): Piece[] {
        return serialized.map(serializedPiece => {
            const piece = PieceBuilder.buildPiece(serializedPiece.type, serializedPiece.color, new Coordinate(serializedPiece.x, serializedPiece.y));
            
            if (serializedPiece.hasMoved !== undefined && 
                (piece instanceof SpecialMovablePiece || piece instanceof Rook)) {
                    piece.hasMoved = serializedPiece.hasMoved;
                }
                
                if (serializedPiece.captured !== undefined) {
                    piece.captured = serializedPiece.captured;
                }
                
                if (serializedPiece.enPassantDest !== undefined && piece instanceof Pawn) {
                    if (serializedPiece.enPassantDest) {
                        piece.enPassantDest = new Coordinate(serializedPiece.enPassantDest.x, serializedPiece.enPassantDest.y);
                    } else {
                        piece.enPassantDest = null;
                    }
                }
                
                if (serializedPiece.justDoubleAdvanced !== undefined && piece instanceof Pawn) {
                    piece.justDoubleAdvanced = serializedPiece.justDoubleAdvanced;
                }
                
                if (serializedPiece.kingCastlingDest !== undefined && piece instanceof King) {
                    if (serializedPiece.kingCastlingDest) {
                        piece.kingCastlingDest = new Coordinate(serializedPiece.kingCastlingDest.x, serializedPiece.kingCastlingDest.y);
                    } else {
                        piece.kingCastlingDest = null;
                    }
                }
                
                if (serializedPiece.queenCastlingDest !== undefined && piece instanceof King) {
                    if (serializedPiece.queenCastlingDest) {
                        piece.queenCastlingDest = new Coordinate(serializedPiece.queenCastlingDest.x, serializedPiece.queenCastlingDest.y);
                    } else {
                        piece.queenCastlingDest = null;
                    }
                }
                
                if (serializedPiece.threatener !== undefined && piece instanceof King) {
                    piece.threatener = serializedPiece.threatener ? this.pieces.find(p => p.id === serializedPiece.threatener) || null : null;
                    piece.enterCheck(piece.threatener!)
                }
                
                return piece;
            });
        }
        
        
        
        private serializeMoveLog(moveLog: MoveLog): SerializedMoveLog {
            return {
                turnHistory: moveLog.turnHistory.map(entry => JSON.stringify(entry)),
                turn: moveLog.turn
            }
        }
        
        private deserializeMoveLog(serialized: SerializedMoveLog): MoveLog {
            const newMoveLog = new MoveLog();
            newMoveLog.turn = serialized.turn;
            newMoveLog.turnHistory = [];
            
            for (const entry of serialized.turnHistory) {
                newMoveLog.turnHistory.push(JSON.parse(entry));
            }
            
            return newMoveLog;
        }
        
        public saveState(): void {
            const state: SerializedGameState = {
                pieces: this.serializePieces(this.pieces),
                moveLog: this.serializeMoveLog(this.moveLog),
                currentTurn: this.currentTurn,
            };
            localStorage.setItem(this.storageKey, JSON.stringify(state));
        }
        
        public loadState(): void {
            const savedState = localStorage.getItem(this.storageKey);
            if (savedState) {
                const state: SerializedGameState = JSON.parse(savedState);
                this.pieces = this.deserializePieces(state.pieces);
                this.moveLog = this.deserializeMoveLog(state.moveLog);
                this.currentTurn = state.currentTurn;
                console.log("Loaded game state from local storage");
            } else {
                console.log("No saved game state found, starting fresh");
            }
        }
        
        public resetGame(): void {
            localStorage.removeItem(this.storageKey);
            this.pieces = [];
            this.moveLog = new MoveLog();
            this.currentTurn = "white";
        }
        
        public recordMove(piece: Piece, dest: Coordinate, manuever: Manuever = "none"): void {
            this.moveLog.recordMove(piece, dest, manuever);
        }
    }
    
    export default GameStateManager;