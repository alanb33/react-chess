export interface ChessPieceProps {
    id: string,
    x: number,
    y: number,
    size: number,
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
                //left: (props.x * props.size) + "px", 
                //top: (props.y * props.size) + "px", 
                //height: props.size + "px",
                //width: props.size + "px",
                zIndex: 1,
                cursor: "grab"
            }}>
            </img>
    );
};

export default ChessPiece;