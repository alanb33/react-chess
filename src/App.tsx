import { createContext } from "react";

import Chessboard from "./components/Chessboard"
import "./App.css"

const highlightedTileKey = createContext("A1");

function App() {

  return (
    <>
      <highlightedTileKey.Provider value={"A1"}>
        <Chessboard />
      </highlightedTileKey.Provider>
    </>
  )
}

export default App
