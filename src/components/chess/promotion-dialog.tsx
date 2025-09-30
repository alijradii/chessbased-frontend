import type { Color, PieceSymbol } from "chess.js"
import { cn } from "@/lib/utils"

interface PromotionDialogProps {
  color: Color
  onSelect: (piece: PieceSymbol) => void
  pieceSet?: string
}

export function PromotionDialog({ color, onSelect, pieceSet = "merida" }: PromotionDialogProps) {
  const pieces: PieceSymbol[] = ["q", "r", "b", "n"]

  const pieceMap: Record<string, string> = {
    q: "Q",
    r: "R",
    b: "B",
    n: "N",
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-background border-2 border-foreground rounded-lg p-4 shadow-xl">
        <h3 className="text-lg font-semibold mb-4 text-center">Choose promotion piece</h3>
        <div className="grid grid-cols-4 gap-2">
          {pieces.map((piece) => {
            const pieceName = `${color}${pieceMap[piece]}`
            const imageSrc = `/assets/pieces/${pieceSet}/${pieceName}.svg`

            return (
              <button
                key={piece}
                onClick={() => onSelect(piece)}
                className={cn(
                  "w-16 h-16 flex items-center justify-center",
                  "bg-secondary hover:bg-accent rounded-lg",
                  "transition-colors cursor-pointer",
                  "border-2 border-transparent hover:border-primary",
                )}
              >
                <img
                  src={imageSrc || "/placeholder.svg"}
                  alt={piece}
                  className="w-full h-full object-contain pointer-events-none select-none"
                  draggable={false}
                />
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
