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
                left: (props.x * props.size) + "px", 
                top: (props.y * props.size) + "px", 
                height: props.size + "px",
                width: props.size + "px",
                zIndex: 1,
            }}>
            </img>
    );
};

export default ChessPiece;