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
        size="icon"
        onClick={handleReset}
        title="Reset game"
        className="flex-1"
      >
        <Trash className="h-6 w-6" />
      </Button>
      <Button
        variant="outline"
        size="icon"
        onClick={handleFirst}
        disabled={!canGoPrev}
        title="Go to start"
        className="flex-1"
      >
        <ChevronFirst className="h-6 w-6" />
      </Button>
      <Button
        variant="outline"
        size="icon"
        onClick={handlePrev}
        disabled={!canGoPrev}
        title="Previous move"
        className="flex-1"
      >
        <ChevronLeft className="h-6 w-6" />
      </Button>
      <Button
        variant="outline"
        size="icon"
        onClick={handleNext}
        disabled={!canGoNext}
        title="Next move"
        className="flex-1"
      >
        <ChevronRight className="h-6 w-6" />
      </Button>
      <Button
        variant="outline"
        size="icon"
        onClick={handleRotate}
        title="Reset game"
        className="flex-1"
      >
        <RotateCcw className="h-6 w-6" />
      </Button>
    </div>
  );
}
