import { ThemeProvider } from "@/components/theme-provider";
// import { ModeToggle } from "./components/mode-toggle"
import { ChessBoard } from "./components/chess/chessboard";

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <main className="max-h-screen flex items-center justify-center p-4 bg-background">
        <div className="w-full max-w-2xl">
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
         
        </div>
      </main>
    </ThemeProvider>
  );
}

export default App;
