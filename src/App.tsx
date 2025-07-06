import { useState } from "react";
import Chessboard from "./components/Chessboard"
import GameStateManager from "./utils/GameStateManager";
import "./App.css"

function App() {
    const [, doChessboardUpdate] = useState<number>(0);
    
    const gameStateManager = GameStateManager.getInstance()
    const resetButton =
    <button
    onClick={() => {
        gameStateManager.resetGame();
        // Force render update
        doChessboardUpdate(prev => prev + 1);
    }}
    style={{
        position: "absolute",
        top: "10px",
        left: "10px",
        zIndex: 1000,
        padding: "10px 20px",
        backgroundColor: "#ff4444",
        color: "white",
        border: "none",
        borderRadius: "5px",
        cursor: "pointer"
    }}
    >
    Reset Game
    </button>
    
    return (
        <>
        {resetButton}
        <Chessboard />
        </>
    );
}

export default App
