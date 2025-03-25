import React, { useState } from 'react';

import { Coordinate, TileColor } from "./CommonTypes";
import "./ChessTile.css";

interface ChessTileInterface {
    id: string,
    x: number,
    y: number,
    size: number,
    color: TileColor;
    getCenter(): Coordinate
};

interface Props {
    id: string,
    key: string;
    x: number,
    y: number,
    size: number,
    color: TileColor,
    border: TileColor,
    getCenter(): Coordinate,
};

function ChessTile(props: Props) {
    const xPx: string = `${(props.x * props.size)}px`;
    const yPx: string = `${(props.y * props.size)}px`;

    return (
        <>
            <div
                className={`absolute`}
                style={{ 
                    left: xPx, 
                    top: yPx, 
                    backgroundColor: props.color,
                    height: props.size + "px",
                    width: props.size + "px",
                    border: `8px solid ${props.border}`
                }}
                id={props.id}
                key={props.key}>
            </div>
        </>
    )
};

export type { ChessTileInterface };
export default ChessTile;