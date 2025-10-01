import { useAtomValue } from "jotai";
import { Button } from "@/components/ui/button";
import { eventBus } from "@/lib/event-bus";
import { historyIndexAtom, gameHistoryAtom } from "@/lib/chess-store";
import {
  ChevronFirst,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
} from "lucide-react";

export function BoardControls() {
  const historyIndex = useAtomValue(historyIndexAtom);
  const gameHistory = useAtomValue(gameHistoryAtom);

  const handleFirst = () => {
    eventBus.emit("firstMove");
  };

  const handlePrev = () => {
    eventBus.emit("prevMove");
  };

  const handleNext = () => {
    eventBus.emit("nextMove");
  };

  const handleReset = () => {
    eventBus.emit(
      "setFen",
      "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
    );
  };

  const canGoPrev = historyIndex > 0;
  const canGoNext = historyIndex < gameHistory.length;

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="icon"
        onClick={handleFirst}
        disabled={!canGoPrev}
        title="Go to start"
      >
        <ChevronFirst className="h-4 w-4" />
      </Button>
      <Button
        variant="outline"
        size="icon"
        onClick={handlePrev}
        disabled={!canGoPrev}
        title="Previous move"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <Button
        variant="outline"
        size="icon"
        onClick={handleNext}
        disabled={!canGoNext}
        title="Next move"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
      <Button
        variant="outline"
        size="icon"
        onClick={handleReset}
        title="Reset game"
      >
        <RotateCcw className="h-4 w-4" />
      </Button>
    </div>
  );
}
