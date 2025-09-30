import type { PieceSymbol, Color } from "chess.js";
import { cn } from "@/lib/utils";

type Piece = {
  type: PieceSymbol;
  color: Color;
};

interface ChessPieceProps {
  piece: Piece;
  square: string;
  isDragging?: boolean;
  isSelected?: boolean;
  pieceSet?: string;
  onMouseDown?: (e: React.MouseEvent) => void;
  onTouchStart?: (e: React.TouchEvent) => void;
  onClick?: () => void;
  style?: React.CSSProperties;
}

export function ChessPiece({
  piece,
  // square,
  isDragging = false,
  isSelected = false,
  pieceSet = "merida",
  onMouseDown,
  onTouchStart,
  onClick,
  style,
}: ChessPieceProps) {
  const pieceMap: Record<string, string> = {
    p: "P",
    n: "N",
    b: "B",
    r: "R",
    q: "Q",
    k: "K",
  };

  const pieceName = `${piece.color}${pieceMap[piece.type]}`;
  const imageSrc = `/assets/pieces/${pieceSet}/${pieceName}.svg`;

  return (
    <div
      className={cn(
        "absolute inset-0 flex items-center justify-center cursor-pointer select-none",
        isDragging && "opacity-50",
        isSelected && "z-10"
      )}
      onMouseDown={(e) => {
        e.preventDefault();
        onMouseDown?.(e);
      }}
      onTouchStart={(e) => {
        e.preventDefault();
        onTouchStart?.(e);
      }}
      onClick={onClick}
      style={{
        ...style,
        pointerEvents: isDragging ? "none" : "auto",
      }}
    >
      <img
        src={imageSrc || "/placeholder.svg"}
        alt={`${piece.color === "w" ? "White" : "Black"} ${piece.type}`}
        className="w-full h-full object-contain pointer-events-none select-none"
        draggable={false}
        style={{
          userSelect: "none",
          WebkitUserSelect: "none",
          MozUserSelect: "none",
          msUserSelect: "none",
        }}
      />
    </div>
  );
}

// Floating piece that follows cursor during drag
interface FloatingPieceProps {
  piece: Piece;
  position: { x: number; y: number };
  squareSize: number;
  pieceSet?: string;
}

export function FloatingPiece({
  piece,
  position,
  squareSize,
  pieceSet = "merida",
}: FloatingPieceProps) {
  const pieceMap: Record<string, string> = {
    p: "P",
    n: "N",
    b: "B",
    r: "R",
    q: "Q",
    k: "K",
  };

  const pieceName = `${piece.color}${pieceMap[piece.type]}`;
  const imageSrc = `/assets/pieces/${pieceSet}/${pieceName}.svg`;

  return (
    <div
      className="fixed pointer-events-none z-50 select-none"
      style={{
        left: position.x - squareSize / 2,
        top: position.y - squareSize / 2,
        width: squareSize,
        height: squareSize,
      }}
    >
      <img
        src={imageSrc || "/placeholder.svg"}
        alt={`${piece.color === "w" ? "White" : "Black"} ${piece.type}`}
        className="w-full h-full object-contain pointer-events-none select-none"
        draggable={false}
        style={{
          userSelect: "none",
          WebkitUserSelect: "none",
          MozUserSelect: "none",
          msUserSelect: "none",
        }}
      />
    </div>
  );
}
