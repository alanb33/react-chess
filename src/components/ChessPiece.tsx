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
                zIndex: 1,
                cursor: "grab"
            }}>
            </img>
    );
};

export default ChessPiece;