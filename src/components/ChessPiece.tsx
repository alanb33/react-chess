import Globals from "../config/globals";

export interface ChessPieceProps {
    id: string,
    x: number,
    y: number,
    imagePath: string,
    color: string,
    boardPosition: string,
    checked?: boolean,
};

function ChessPiece(props: ChessPieceProps) {
    return (
        <img src={props.imagePath}
            id={props.id}
            className={"size-full absolute"}
            chess-piece={"true"}
            board-position={props.boardPosition}
            style={{ 
                zIndex: Globals.Z_INDEX.PIECE,
                cursor: "grab",
                left: Globals.TILESIZE * props.x,
                top: Globals.TILESIZE * props.y,
                width: Globals.TILESIZE,
                height: Globals.TILESIZE,
                backgroundColor: props.checked ? "red" : "",
            }}>
            </img>
    );
};

export default ChessPiece;