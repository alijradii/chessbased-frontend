import { ThemeProvider } from "@/components/theme-provider";
// import { ModeToggle } from "./components/mode-toggle"
import { ChessBoard } from "@/components/chess/chessboard";
import { BoardControls } from "@/components/chess/board-controls";
import { GameInfo } from "./components/chess/game-info";

function App() {
  return (
    <ThemeProvider>
      <main className="min-h-screen flex items-center justify-center p-4 bg-background w-screen">
        <div className="w-full flex items-stretch justify-center gap-6">
          <GameInfo />
          <div className="flex-[3] flex flex-col items-center md:max-w-[80vmin]">
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

            <GameInfo />
        </div>
      </main>
    </ThemeProvider>
  );
}

export default App;
