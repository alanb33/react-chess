import Chessboard from "./components/Chessboard"
import "./App.css"

const BOARDSIZE = 8;
const TILESIZE = 128;

function App() {

  return (
    <>
        <Chessboard 
          boardSize={BOARDSIZE}
          tileSize={TILESIZE}
          />
    </>
  );
}

export default App
