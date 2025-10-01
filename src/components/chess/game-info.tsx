import { useAtomValue } from "jotai";
import {
  currentFenAtom,
  gameHistoryAtom,
  historyIndexAtom,
  currentTurnAtom,
  gameStatusAtom,
} from "@/lib/chess-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function GameInfo() {
  const currentFen = useAtomValue(currentFenAtom);
  const gameHistory = useAtomValue(gameHistoryAtom);
  const historyIndex = useAtomValue(historyIndexAtom);
  const currentTurn = useAtomValue(currentTurnAtom);
  const gameStatus = useAtomValue(gameStatusAtom);

  return (
    <Card className="flex-[2] min-h-full">
      <CardHeader>
        <CardTitle>Game Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h3 className="text-sm font-semibold mb-1">Current Turn</h3>
          <p className="text-sm text-muted-foreground">
            {currentTurn === "w" ? "White" : "Black"}
          </p>
        </div>

        <div>
          <h3 className="text-sm font-semibold mb-1">Game Status</h3>
          <p className="text-sm text-muted-foreground capitalize">
            {gameStatus}
          </p>
        </div>

        <div>
          <h3 className="text-sm font-semibold mb-1">Move Count</h3>
          <p className="text-sm text-muted-foreground">
            {historyIndex} / {gameHistory.length}
          </p>
        </div>

        <div>
          <h3 className="text-sm font-semibold mb-1">Current FEN</h3>
          <p className="text-xs text-muted-foreground font-mono break-all">
            {currentFen}
          </p>
        </div>

        {gameHistory.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold mb-2">Move History</h3>
            <div className="max-h-40 overflow-y-auto space-y-1">
              {gameHistory.map((move, index) => (
                <div
                  key={index}
                  className="text-xs text-muted-foreground flex items-center gap-2"
                >
                  <span className="font-semibold w-8">
                    {Math.floor(index / 2) + 1}.
                  </span>
                  <span className="font-mono">{move.san}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
