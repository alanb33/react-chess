//import React from 'react';

import { Coordinate, TileColor } from "./CommonTypes";
import "./ChessTile.css";

interface Props {
    x: number,
    y: number,
    size: number,
    color: TileColor,
    getCenter(): Coordinate,
}

function ChessTile(props: Props) {
    return (
        <>
            <div
                className={`bg-${props.color} w-${props.size}`}>
                    <p>poggersh</p>
            </div>
        </>
    )
};

export default ChessTile;