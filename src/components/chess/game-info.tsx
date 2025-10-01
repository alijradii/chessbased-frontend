import { useAtomValue } from "jotai";
import {
  currentFenAtom,
  gameHistoryAtom,
  historyIndexAtom,
  currentTurnAtom,
  gameStatusAtom,
} from "@/lib/chess-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { eventBus } from "@/lib/event-bus";
import { Input } from "../ui/input";
import { cn } from "@/lib/utils";

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
      <CardContent className="space-y-8">
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
          <Input
            value={currentFen}
            readOnly
            className="text-xs font-mono mt-2"
          />
        </div>

        {gameHistory.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold mb-2">Move History</h3>
            <div className="max-h-40 overflow-y-auto flex flex-wrap gap-2">
              {gameHistory.map((move, index) => {
                const isWhiteMove = index % 2 === 0;
                return (
                  <div
                    key={index}
                    className={cn(
                      "text-xs text-muted-foreground flex items-center gap-1 px-2 py-1 rounded-md ",
                      "hover:bg-muted hover:text-accent-foreground transition-colors cursor-pointer",
                      `${(historyIndex === index + 1)? "bg-accent": ""}`
                    )}
                    onClick={() => {
                      eventBus.emit("goToIndex", index + 1);
                    }}
                  >
                    {isWhiteMove && (
                      <span className="font-semibold mr-1">
                        {Math.floor(index / 2) + 1}.
                      </span>
                    )}
                    <span className="font-mono">{move.san}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
