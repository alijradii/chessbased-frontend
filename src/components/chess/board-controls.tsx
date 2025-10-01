import { eventBus } from "@/lib/event-bus";

export function BoardControls() {
  return (
    <div className="flex gap-2 mt-2">
      <button
        onClick={() => eventBus.emit("firstMove")}
        className="px-2 py-1 bg-card rounded"
      >
        ⏮ First
      </button>
      <button
        onClick={() => eventBus.emit("prevMove")}
        className="px-2 py-1 bg-card rounded"
      >
        ◀ Prev
      </button>
      <button
        onClick={() => eventBus.emit("nextMove")}
        className="px-2 py-1 bg-card rounded"
      >
        Next ▶
      </button>
      <button
        onClick={() => eventBus.emit("makeMove", "d7", "d5")}
        className="px-2 py-1 bg-card rounded"
      >
        Test ▶
      </button>
    </div>
  );
}
