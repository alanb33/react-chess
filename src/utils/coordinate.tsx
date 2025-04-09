export class Coordinate {
    x: number;
    y: number;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    };

    equals(other: Coordinate) {
        if (this.x === other.x && this.y === other.y) {
            return true;
        }
        return false;
    }
}