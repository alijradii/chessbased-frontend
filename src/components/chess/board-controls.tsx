import { useAtom, useAtomValue } from "jotai";
import { Button } from "@/components/ui/button";
import { eventBus } from "@/lib/event-bus";
import {
  historyIndexAtom,
  gameHistoryAtom,
  isBoardFlippedAtom,
} from "@/lib/chess-store";
import {
  ChevronFirst,
  ChevronLast,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Trash,
} from "lucide-react";

export function BoardControls() {
  const historyIndex = useAtomValue(historyIndexAtom);
  const gameHistory = useAtomValue(gameHistoryAtom);
  const [flipped, setFlipped] = useAtom(isBoardFlippedAtom);
  const handleRotate = () => {
    setFlipped(!flipped);
  };
  const handleFirst = () => {
    eventBus.emit("firstMove");
  };

  const handlePrev = () => {
    eventBus.emit("prevMove");
  };

  const handleNext = () => {
    eventBus.emit("nextMove");
  };

  const handleLast = () => {
    eventBus.emit("lastMove");
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
    <div className="flex items-center gap-2 w-full">
      <Button
        variant="outline"
        onClick={handleReset}
        title="Reset game"
        className="flex-1 md:h-12"
      >
        <Trash className="h-12 w-12" />
      </Button>
      <Button
        variant="outline"
        onClick={handleFirst}
        disabled={!canGoPrev}
        title="Go to start"
        className="flex-1 md:h-12"
      >
        <ChevronFirst className="h-12 w-12" />
      </Button>
      <Button
        variant="outline"
        onClick={handlePrev}
        disabled={!canGoPrev}
        title="Previous move"
        className="flex-1 md:h-12"
      >
        <ChevronLeft className="h-12 w-12" />
      </Button>
      <Button
        variant="outline"
        onClick={handleNext}
        disabled={!canGoNext}
        title="Next move"
        className="flex-1 md:h-12"
      >
        <ChevronRight className="h-12 w-12" />
      </Button>
      <Button
        variant="outline"
        onClick={handleLast}
        disabled={!canGoNext}
        title="Go to start"
        className="flex-1 md:h-12"
      >
        <ChevronLast className="h-12 w-12" />
      </Button>
      <Button
        variant="outline"
        onClick={handleRotate}
        title="Reset game"
        className="flex-1 md:h-12"
      >
        <RotateCcw className="h-12 w-12" />
      </Button>
    </div>
  );
}
