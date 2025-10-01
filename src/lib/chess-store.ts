import { atom } from "jotai"
import { Chess } from "chess.js"
import type { Square, PieceSymbol, Color, Move } from "chess.js"

export interface Piece {
  type: PieceSymbol
  color: Color
}

export interface DraggedPiece {
  piece: Piece
  from: Square
  position: { x: number; y: number }
}

export interface PromotionPending {
  from: Square
  to: Square
}

export interface LastMove {
  from: Square
  to: Square
}

export const isBoardFlippedAtom = atom<boolean>(false);

// Core chess game instance
export const chessGameAtom = atom<Chess>(new Chess())

// Board state (8x8 array of pieces or null)
export const boardStateAtom = atom((get) => get(chessGameAtom).board())

// Selected square for click-to-move
export const selectedSquareAtom = atom<Square | null>(null)

// Legal moves for the selected piece
export const legalMovesAtom = atom<Square[]>([])

// Currently dragged piece (for drag-and-drop)
export const draggedPieceAtom = atom<DraggedPiece | null>(null)

// Promotion dialog state
export const promotionPendingAtom = atom<PromotionPending | null>(null)

// Last move made (for highlighting)
export const lastMoveAtom = atom<LastMove | null>(null)

// Full game history
export const gameHistoryAtom = atom<Move[]>([])

// Current position in history (for navigation)
export const historyIndexAtom = atom<number>(0)

// Derived atom: current turn
export const currentTurnAtom = atom((get) => get(chessGameAtom).turn())

// Derived atom: is game over
export const isGameOverAtom = atom((get) => get(chessGameAtom).isGameOver())

// Derived atom: game status
export const gameStatusAtom = atom((get) => {
  const chess = get(chessGameAtom)
  if (chess.isCheckmate()) return "checkmate"
  if (chess.isStalemate()) return "stalemate"
  if (chess.isDraw()) return "draw"
  if (chess.isCheck()) return "check"
  return "playing"
})

// Derived atom: current FEN
export const currentFenAtom = atom((get) => get(chessGameAtom).fen())
