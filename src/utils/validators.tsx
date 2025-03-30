export function isChessPiece(element: EventTarget): boolean {
    return (element instanceof HTMLImageElement && element.getAttribute("chess-piece") !== null);
}

export function isChessboardTile(element: EventTarget): boolean {
    return (element instanceof HTMLDivElement && element.getAttribute("chess-tile") !== null);
}

export function isTileKey(key: string): boolean {
    if (key.length === 2) {
        const letter = key[0].toLowerCase();
        if (letter >= "a" && letter <= "h") {
            const number = parseInt(key[1]);
            if (number) {
                if (number >= 1 && number <= 8) {
                    return true;
                }
                return false;
            }
            return false;
        }
        return false;
    }
    return false;
}