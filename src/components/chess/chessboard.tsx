import { useState, useRef, useEffect, useCallback } from "react";
import { Chess } from "chess.js";
import type { Square, PieceSymbol, Color, Move } from "chess.js";
import { ChessPiece, FloatingPiece } from "./chess-piece";
import { PromotionDialog } from "./promotion-dialog";
import { cn } from "@/lib/utils";
import { eventBus } from "@/lib/event-bus";

interface Piece {
  type: PieceSymbol;
  color: Color;
}

interface ChessBoardProps {
  initialFen?: string;
  onMove?: (fen: string) => void;
  pieceSet?: string;
  lightSquareColor?: string;
  darkSquareColor?: string;
  highlightColor?: string;
  lastMoveColor?: string;
  flipped?: boolean;
  interactive?: boolean;
}

export function ChessBoard({
  initialFen,
  onMove,
  pieceSet = "merida",
  lightSquareColor = "#f0d9b5",
  darkSquareColor = "#b58863",
  highlightColor = "rgba(255, 255, 0, 0.4)",
  lastMoveColor = "rgba(155, 199, 0, 0.4)",
  flipped = false,
  interactive = true,
}: ChessBoardProps) {
  const [chess] = useState(() => new Chess(initialFen));
  const [boardState, setBoardState] = useState(chess.board());
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const [legalMoves, setLegalMoves] = useState<Square[]>([]);
  const [draggedPiece, setDraggedPiece] = useState<{
    piece: Piece;
    from: Square;
    position: { x: number; y: number };
  } | null>(null);
  const [promotionPending, setPromotionPending] = useState<{
    from: Square;
    to: Square;
  } | null>(null);
  const [lastMove, setLastMove] = useState<{ from: Square; to: Square } | null>(
    null
  );

  const [gameHistory, setGameHistory] = useState<Move[]>(() =>
    chess.history({ verbose: true })
  );
  const [historyIndex, setHistoryIndex] = useState(
    () => chess.history({ verbose: true }).length
  );

  const isDraggingRef = useRef(false);
  const dragStartPos = useRef<{ x: number; y: number } | null>(null);
  const DRAG_THRESHOLD = 5;

  const boardRef = useRef<HTMLDivElement>(null);
  const squareSizeRef = useRef<number>(0);
  console.log(chess.history());

  useEffect(() => {
    const handleSetFen = (fen: string) => {
      try {
        chess.load(fen);
        setBoardState(chess.board());
        const newHistory = chess.history({ verbose: true });
        setGameHistory(newHistory);
        setHistoryIndex(newHistory.length);
        setLastMove(null);
      } catch (err) {
        console.error("Invalid FEN:", fen, err);
      }
    };

    const handleMakeMove = (
      from: Square,
      to: Square,
      promotion?: PieceSymbol
    ) => {
      executeMove(from, to, promotion);
    };

    const handlePrev = () => {
      if (historyIndex > 0) {
        const prevIndex = historyIndex - 1;
        const temp = new Chess();
        chess.load(temp.fen());
        gameHistory.slice(0, prevIndex).forEach((m) => temp.move(m));
        gameHistory.slice(0, prevIndex).forEach((m) => chess.move(m));

        setBoardState(chess.board());
        setHistoryIndex(prevIndex);

        if (prevIndex > 0) {
          const lastMoveInHistory = gameHistory[prevIndex - 1];
          setLastMove({
            from: lastMoveInHistory.from,
            to: lastMoveInHistory.to,
          });
        } else {
          setLastMove(null);
        }
      }
    };

    const handleNext = () => {
      if (historyIndex < gameHistory.length) {
        const nextIndex = historyIndex + 1;
        const temp = new Chess();
        
        chess.load(temp.fen());

        gameHistory.slice(0, nextIndex).forEach((m) => temp.move(m));
        gameHistory.slice(0, nextIndex).forEach((m) => chess.move(m));

        setBoardState(chess.board());
        setHistoryIndex(nextIndex);

        const lastMoveInHistory = gameHistory[nextIndex - 1];
        setLastMove({ from: lastMoveInHistory.from, to: lastMoveInHistory.to });
      }
    };

    const handleFirst = () => {
      chess.reset();
      setBoardState(chess.board());
      setHistoryIndex(0);
      setLastMove(null);
    };

    eventBus.on("setFen", handleSetFen);
    eventBus.on("makeMove", handleMakeMove);
    eventBus.on("prevMove", handlePrev);
    eventBus.on("nextMove", handleNext);
    eventBus.on("firstMove", handleFirst);

    return () => {
      eventBus.off("setFen", handleSetFen);
      eventBus.off("makeMove", handleMakeMove);
      eventBus.off("prevMove", handlePrev);
      eventBus.off("nextMove", handleNext);
      eventBus.off("firstMove", handleFirst);
    };
  }, [chess, gameHistory, historyIndex]);

  useEffect(() => {
    const updateSquareSize = () => {
      if (boardRef.current) {
        squareSizeRef.current = boardRef.current.offsetWidth / 8;
      }
    };

    updateSquareSize();
    window.addEventListener("resize", updateSquareSize);
    return () => window.removeEventListener("resize", updateSquareSize);
  }, []);

  const indicesToSquare = (rank: number, file: number): Square => {
    return (String.fromCharCode(97 + file) + (8 - rank)) as Square;
  };

  const getSquareFromPosition = useCallback(
    (x: number, y: number): Square | null => {
      if (!boardRef.current) return null;

      const rect = boardRef.current.getBoundingClientRect();
      const relX = x - rect.left;
      const relY = y - rect.top;

      if (relX < 0 || relY < 0 || relX >= rect.width || relY >= rect.height) {
        return null;
      }

      let file = Math.floor(relX / squareSizeRef.current);
      let rank = Math.floor(relY / squareSizeRef.current);

      if (flipped) {
        file = 7 - file;
        rank = 7 - rank;
      }

      return indicesToSquare(rank, file);
    },
    [flipped]
  );

  const getLegalMovesForSquare = (square: Square): Square[] => {
    const moves = chess.moves({ square, verbose: true });
    return moves.map((move) => move.to);
  };

  const handleSquareClick = (square: Square) => {
    if (!interactive) return;

    if (isDraggingRef.current) return;

    const piece = chess.get(square);

    if (selectedSquare && legalMoves.includes(square)) {
      handleMove(selectedSquare, square);
      setSelectedSquare(null);
      setLegalMoves([]);
    } else if (piece && piece.color === chess.turn()) {
      setSelectedSquare(square);
      setLegalMoves(getLegalMovesForSquare(square));
    } else {
      setSelectedSquare(null);
      setLegalMoves([]);
    }
  };

  const handleDragStart = (
    square: Square,
    e: React.MouseEvent | React.TouchEvent
  ) => {
    if (!interactive) return;

    const piece = chess.get(square);
    if (!piece || piece.color !== chess.turn()) return;

    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;

    dragStartPos.current = { x: clientX, y: clientY };
    isDraggingRef.current = false;

    setDraggedPiece({
      piece,
      from: square,
      position: { x: clientX, y: clientY },
    });
    setLegalMoves(getLegalMovesForSquare(square));
  };

  const handleDragMove = useCallback(
    (e: MouseEvent | TouchEvent) => {
      if (!draggedPiece || !dragStartPos.current) return;

      const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
      const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;

      const deltaX = Math.abs(clientX - dragStartPos.current.x);
      const deltaY = Math.abs(clientY - dragStartPos.current.y);

      if (
        !isDraggingRef.current &&
        (deltaX > DRAG_THRESHOLD || deltaY > DRAG_THRESHOLD)
      ) {
        isDraggingRef.current = true;
      }

      setDraggedPiece((prev) =>
        prev ? { ...prev, position: { x: clientX, y: clientY } } : null
      );
    },
    [draggedPiece]
  );

  const handleDragEnd = useCallback(
    (e: MouseEvent | TouchEvent) => {
      if (!draggedPiece) return;

      const clientX =
        "changedTouches" in e ? e.changedTouches[0].clientX : e.clientX;
      const clientY =
        "changedTouches" in e ? e.changedTouches[0].clientY : e.clientY;

      if (isDraggingRef.current) {
        const targetSquare = getSquareFromPosition(clientX, clientY);

        if (targetSquare && legalMoves.includes(targetSquare)) {
          handleMove(draggedPiece.from, targetSquare);
        }

        setSelectedSquare(null);
        setLegalMoves([]);
      } else {
        setSelectedSquare(draggedPiece.from);
      }

      setDraggedPiece(null);
      dragStartPos.current = null;

      setTimeout(() => {
        isDraggingRef.current = false;
      }, 50);
    },
    [draggedPiece, legalMoves, getSquareFromPosition]
  );

  useEffect(() => {
    if (!draggedPiece) return;

    const handleMouseMove = (e: MouseEvent) => handleDragMove(e);
    const handleMouseUp = (e: MouseEvent) => handleDragEnd(e);
    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      handleDragMove(e);
    };
    const handleTouchEnd = (e: TouchEvent) => handleDragEnd(e);

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("touchmove", handleTouchMove, { passive: false });
    document.addEventListener("touchend", handleTouchEnd);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("touchend", handleTouchEnd);
    };
  }, [draggedPiece, handleDragMove, handleDragEnd]);

  const handleMove = (from: Square, to: Square) => {
    const piece = chess.get(from);
    if (!piece) return;

    const moves = chess.moves({ square: from, verbose: true });
    const move = moves.find((m) => m.to === to);

    if (move && move.promotion) {
      setPromotionPending({ from, to });
      return;
    }

    executeMove(from, to);
  };

  const executeMove = (from: Square, to: Square, promotion?: PieceSymbol) => {
    try {
      const move = chess.move({ from, to, promotion });

      if (move) {
        setLastMove({ from: move.from, to: move.to });
        setBoardState(chess.board());
        onMove?.(chess.fen());

        const newHistory = chess.history({ verbose: true });
        setGameHistory(newHistory);
        setHistoryIndex(newHistory.length);

        if (chess.isCheckmate()) {
          setTimeout(() => {
            alert(
              `Checkmate! ${chess.turn() === "w" ? "Black" : "White"} wins!`
            );
          }, 100);
        } else if (chess.isStalemate()) {
          setTimeout(() => {
            alert("Stalemate! The game is a draw.");
          }, 100);
        } else if (chess.isDraw()) {
          setTimeout(() => {
            alert("Draw!");
          }, 100);
        }
      }
    } catch (error) {
      console.error("Invalid move:", error);
    }
  };

  const handlePromotionSelect = (piece: PieceSymbol) => {
    if (!promotionPending) return;
    executeMove(promotionPending.from, promotionPending.to, piece);
    setPromotionPending(null);
  };

  const renderSquare = (rank: number, file: number) => {
    const square = indicesToSquare(rank, file);
    const piece = boardState[rank][file];
    const isLight = (rank + file) % 2 === 0;
    const isSelected = selectedSquare === square;
    const isLegalMove = legalMoves.includes(square);
    const isLastMoveSquare =
      lastMove && (lastMove.from === square || lastMove.to === square);
    const isDraggingFromSquare = draggedPiece?.from === square;

    const displayRank = flipped ? 7 - rank : rank;
    const displayFile = flipped ? 7 - file : file;

    return (
      <div
        key={square}
        className="relative"
        style={{
          backgroundColor: isLight ? lightSquareColor : darkSquareColor,
          gridRow: displayRank + 1,
          gridColumn: displayFile + 1,
        }}
        onClick={() => handleSquareClick(square)}
      >
        {isLastMoveSquare && (
          <div
            className="absolute inset-0"
            style={{ backgroundColor: lastMoveColor }}
          />
        )}

        {isSelected && (
          <div
            className="absolute inset-0"
            style={{ backgroundColor: highlightColor }}
          />
        )}

        {isLegalMove && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div
              className={cn(
                "rounded-full",
                piece ? "w-full h-full border-4" : "w-1/3 h-1/3"
              )}
              style={{
                backgroundColor: piece ? "transparent" : highlightColor,
                borderColor: piece ? highlightColor : "transparent",
              }}
            />
          </div>
        )}

        {piece && !isDraggingFromSquare && (
          <ChessPiece
            piece={piece}
            square={square}
            isSelected={isSelected}
            pieceSet={pieceSet}
            onMouseDown={(e) => handleDragStart(square, e)}
            onTouchStart={(e) => handleDragStart(square, e)}
          />
        )}

        {file === (flipped ? 7 : 0) && (
          <div
            className="absolute left-1 top-1 text-xs font-semibold pointer-events-none select-none"
            style={{ color: isLight ? darkSquareColor : lightSquareColor }}
          >
            {8 - rank}
          </div>
        )}
        {rank === (flipped ? 0 : 7) && (
          <div
            className="absolute right-1 bottom-1 text-xs font-semibold pointer-events-none select-none"
            style={{ color: isLight ? darkSquareColor : lightSquareColor }}
          >
            {String.fromCharCode(97 + file)}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <div
        ref={boardRef}
        className="relative w-full max-w-[90vmin] aspect-square grid grid-cols-8 grid-rows-8 select-none"
        style={{
          userSelect: "none",
          WebkitUserSelect: "none",
          MozUserSelect: "none",
          msUserSelect: "none",
        }}
      >
        {Array.from({ length: 8 }, (_, rank) =>
          Array.from({ length: 8 }, (_, file) => renderSquare(rank, file))
        )}
      </div>

      {draggedPiece && (
        <FloatingPiece
          piece={draggedPiece.piece}
          position={draggedPiece.position}
          squareSize={squareSizeRef.current}
          pieceSet={pieceSet}
        />
      )}

      {promotionPending && (
        <PromotionDialog
          color={chess.turn()}
          onSelect={handlePromotionSelect}
          pieceSet={pieceSet}
        />
      )}
    </>
  );
}
