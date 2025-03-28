export interface ChessPieceProps {
    id: string,
    x: number,
    y: number,
    size: number,
    imagePath: string,
};

function ChessPiece(props: ChessPieceProps) {
    return (
        <img src={props.imagePath}
            className={`absolute`}
            style={{ 
                left: props.x, 
                top: props.y, 
                height: props.size + "px",
                width: props.size + "px",
            }}>
            </img>
    );
};

export default ChessPiece;