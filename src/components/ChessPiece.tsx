import Globals from "../config/globals";

export interface ChessPieceProps {
    id: string,
    x: number,
    y: number,
    imagePath: string,
    color: string,
};

function ChessPiece(props: ChessPieceProps) {
    return (
        <img src={props.imagePath}
            id={props.id}
            className={"size-full"}
            chess-piece={"true"}
            style={{ 
                zIndex: Globals.Z_INDEX.PIECE,
                cursor: "grab",
                position: "relative"
            }}>
            </img>
    );
};

export default ChessPiece;