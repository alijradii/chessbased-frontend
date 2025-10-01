import { ThemeProvider } from "@/components/theme-provider";
// import { ModeToggle } from "./components/mode-toggle"
import { ChessBoard } from "@/components/chess/chessboard";
import { BoardControls } from "@/components/chess/board-controls";
import { GameInfo } from "./components/chess/game-info";

function App() {
  return (
    <ThemeProvider>
      <main className="min-h-screen flex items-center justify-center p-4 bg-background">
        <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 flex flex-col items-center md:max-w-[80vmin]">
            <ChessBoard
              pieceSet="merida"
              lightSquareColor="#f0d9b5"
              darkSquareColor="#b58863"
              highlightColor="rgba(255, 255, 0, 0.4)"
              lastMoveColor="rgba(155, 199, 0, 0.4)"
              onMove={(fen) => {
                console.log("Move made, new FEN:", fen);
              }}
            />
            <div className="mt-4 w-full">
              <BoardControls />
            </div>
          </div>

          <div className="lg:col-span-1">
            <GameInfo />
          </div>
        </div>
      </main>
    </ThemeProvider>
  );
}

export default App;
