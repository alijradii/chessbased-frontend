import { ThemeProvider } from "@/components/theme-provider";
// import { ModeToggle } from "./components/mode-toggle"
import { ChessBoard } from "./components/chess/chessboard";

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <main className="min-h-screen flex items-center justify-center p-4 bg-background">
        <div className="w-full max-w-2xl">
          <h1 className="text-3xl font-bold text-center mb-6">Chess Game</h1>
          <ChessBoard
            pieceSet="merida"
            lightSquareColor="#f0d9b5"
            darkSquareColor="#b58863"
            highlightColor="rgba(255, 255, 0, 0.4)"
            lastMoveColor="rgba(155, 199, 0, 0.4)"
            onMove={(state: { lastMove: any; }) => {
              console.log("Move made:", state.lastMove);
            }}
          />
          <div className="mt-4 text-center text-sm text-muted-foreground">
            <p>Click or drag pieces to move</p>
            <p>Legal moves are highlighted</p>
          </div>
        </div>
      </main>
    </ThemeProvider>
  );
}

export default App;
