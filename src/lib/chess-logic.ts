// Chess game logic implementation
export type PieceType = "p" | "n" | "b" | "r" | "q" | "k"
export type Color = "w" | "b"
export type Square = string // e.g., 'e4', 'a1'

export interface Piece {
  type: PieceType
  color: Color
}

export interface Move {
  from: Square
  to: Square
  piece: Piece
  captured?: Piece | null
  promotion?: PieceType
  castling?: "k" | "q"
  enPassant?: boolean
}

export interface GameState {
  board: (Piece | null)[][]
  turn: Color
  castlingRights: {
    wk: boolean
    wq: boolean
    bk: boolean
    bq: boolean
  }
  enPassantSquare: Square | null
  halfMoveClock: number
  fullMoveNumber: number
  lastMove: Move | null
}

// Convert algebraic notation to array indices
export function squareToIndices(square: Square): [number, number] {
  const file = square.charCodeAt(0) - 97 // 'a' = 0, 'b' = 1, etc.
  const rank = 8 - Number.parseInt(square[1]) // '8' = 0, '1' = 7
  return [rank, file]
}

// Convert array indices to algebraic notation
export function indicesToSquare(rank: number, file: number): Square {
  return String.fromCharCode(97 + file) + (8 - rank)
}

// Initialize standard chess starting position
export function initializeGame(): GameState {
  const board: (Piece | null)[][] = [
    [
      { type: "r", color: "b" },
      { type: "n", color: "b" },
      { type: "b", color: "b" },
      { type: "q", color: "b" },
      { type: "k", color: "b" },
      { type: "b", color: "b" },
      { type: "n", color: "b" },
      { type: "r", color: "b" },
    ],
    Array(8).fill({ type: "p", color: "b" }),
    Array(8).fill(null),
    Array(8).fill(null),
    Array(8).fill(null),
    Array(8).fill(null),
    Array(8).fill({ type: "p", color: "w" }),
    [
      { type: "r", color: "w" },
      { type: "n", color: "w" },
      { type: "b", color: "w" },
      { type: "q", color: "w" },
      { type: "k", color: "w" },
      { type: "b", color: "w" },
      { type: "n", color: "w" },
      { type: "r", color: "w" },
    ],
  ]

  return {
    board,
    turn: "w",
    castlingRights: { wk: true, wq: true, bk: true, bq: true },
    enPassantSquare: null,
    halfMoveClock: 0,
    fullMoveNumber: 1,
    lastMove: null,
  }
}

// Get piece at square
export function getPieceAt(state: GameState, square: Square): Piece | null {
  const [rank, file] = squareToIndices(square)
  return state.board[rank][file]
}

// Check if square is on board
function isValidSquare(rank: number, file: number): boolean {
  return rank >= 0 && rank < 8 && file >= 0 && file < 8
}

// Get all legal moves for a piece at a given square
export function getLegalMoves(state: GameState, square: Square): Square[] {
  const piece = getPieceAt(state, square)
  if (!piece || piece.color !== state.turn) return []

  const [rank, file] = squareToIndices(square)
  const moves: Square[] = []

  switch (piece.type) {
    case "p":
      moves.push(...getPawnMoves(state, rank, file, piece.color))
      break
    case "n":
      moves.push(...getKnightMoves(state, rank, file, piece.color))
      break
    case "b":
      moves.push(...getBishopMoves(state, rank, file, piece.color))
      break
    case "r":
      moves.push(...getRookMoves(state, rank, file, piece.color))
      break
    case "q":
      moves.push(...getQueenMoves(state, rank, file, piece.color))
      break
    case "k":
      moves.push(...getKingMoves(state, rank, file, piece.color))
      break
  }

  // Filter out moves that would leave king in check
  return moves.filter((to) => !wouldBeInCheck(state, square, to))
}

function getPawnMoves(state: GameState, rank: number, file: number, color: Color): Square[] {
  const moves: Square[] = []
  const direction = color === "w" ? -1 : 1
  const startRank = color === "w" ? 6 : 1

  // Forward move
  const newRank = rank + direction
  if (isValidSquare(newRank, file) && !state.board[newRank][file]) {
    moves.push(indicesToSquare(newRank, file))

    // Double move from starting position
    if (rank === startRank) {
      const doubleRank = rank + 2 * direction
      if (!state.board[doubleRank][file]) {
        moves.push(indicesToSquare(doubleRank, file))
      }
    }
  }

  // Captures
  for (const df of [-1, 1]) {
    const newFile = file + df
    if (isValidSquare(newRank, newFile)) {
      const target = state.board[newRank][newFile]
      if (target && target.color !== color) {
        moves.push(indicesToSquare(newRank, newFile))
      }
      // En passant
      if (state.enPassantSquare === indicesToSquare(newRank, newFile)) {
        moves.push(state.enPassantSquare)
      }
    }
  }

  return moves
}

function getKnightMoves(state: GameState, rank: number, file: number, color: Color): Square[] {
  const moves: Square[] = []
  const offsets = [
    [-2, -1],
    [-2, 1],
    [-1, -2],
    [-1, 2],
    [1, -2],
    [1, 2],
    [2, -1],
    [2, 1],
  ]

  for (const [dr, df] of offsets) {
    const newRank = rank + dr
    const newFile = file + df
    if (isValidSquare(newRank, newFile)) {
      const target = state.board[newRank][newFile]
      if (!target || target.color !== color) {
        moves.push(indicesToSquare(newRank, newFile))
      }
    }
  }

  return moves
}

function getBishopMoves(state: GameState, rank: number, file: number, color: Color): Square[] {
  return getSlidingMoves(state, rank, file, color, [
    [-1, -1],
    [-1, 1],
    [1, -1],
    [1, 1],
  ])
}

function getRookMoves(state: GameState, rank: number, file: number, color: Color): Square[] {
  return getSlidingMoves(state, rank, file, color, [
    [-1, 0],
    [1, 0],
    [0, -1],
    [0, 1],
  ])
}

function getQueenMoves(state: GameState, rank: number, file: number, color: Color): Square[] {
  return getSlidingMoves(state, rank, file, color, [
    [-1, -1],
    [-1, 0],
    [-1, 1],
    [0, -1],
    [0, 1],
    [1, -1],
    [1, 0],
    [1, 1],
  ])
}

function getSlidingMoves(state: GameState, rank: number, file: number, color: Color, directions: number[][]): Square[] {
  const moves: Square[] = []

  for (const [dr, df] of directions) {
    let newRank = rank + dr
    let newFile = file + df

    while (isValidSquare(newRank, newFile)) {
      const target = state.board[newRank][newFile]
      if (!target) {
        moves.push(indicesToSquare(newRank, newFile))
      } else {
        if (target.color !== color) {
          moves.push(indicesToSquare(newRank, newFile))
        }
        break
      }
      newRank += dr
      newFile += df
    }
  }

  return moves
}

function getKingMoves(state: GameState, rank: number, file: number, color: Color): Square[] {
  const moves: Square[] = []
  const offsets = [
    [-1, -1],
    [-1, 0],
    [-1, 1],
    [0, -1],
    [0, 1],
    [1, -1],
    [1, 0],
    [1, 1],
  ]

  for (const [dr, df] of offsets) {
    const newRank = rank + dr
    const newFile = file + df
    if (isValidSquare(newRank, newFile)) {
      const target = state.board[newRank][newFile]
      if (!target || target.color !== color) {
        moves.push(indicesToSquare(newRank, newFile))
      }
    }
  }

  // Castling
  if (!isSquareUnderAttack(state, indicesToSquare(rank, file), color)) {
    // Kingside
    if ((color === "w" && state.castlingRights.wk) || (color === "b" && state.castlingRights.bk)) {
      if (
        !state.board[rank][file + 1] &&
        !state.board[rank][file + 2] &&
        !isSquareUnderAttack(state, indicesToSquare(rank, file + 1), color) &&
        !isSquareUnderAttack(state, indicesToSquare(rank, file + 2), color)
      ) {
        moves.push(indicesToSquare(rank, file + 2))
      }
    }
    // Queenside
    if ((color === "w" && state.castlingRights.wq) || (color === "b" && state.castlingRights.bq)) {
      if (
        !state.board[rank][file - 1] &&
        !state.board[rank][file - 2] &&
        !state.board[rank][file - 3] &&
        !isSquareUnderAttack(state, indicesToSquare(rank, file - 1), color) &&
        !isSquareUnderAttack(state, indicesToSquare(rank, file - 2), color)
      ) {
        moves.push(indicesToSquare(rank, file - 2))
      }
    }
  }

  return moves
}

// Check if a move would leave the king in check
function wouldBeInCheck(state: GameState, from: Square, to: Square): boolean {
  const newState = makeMove(state, from, to)
  return isInCheck(newState, state.turn)
}

// Check if a color's king is in check
function isInCheck(state: GameState, color: Color): boolean {
  // Find king position
  let kingSquare: Square | null = null
  for (let rank = 0; rank < 8; rank++) {
    for (let file = 0; file < 8; file++) {
      const piece = state.board[rank][file]
      if (piece && piece.type === "k" && piece.color === color) {
        kingSquare = indicesToSquare(rank, file)
        break
      }
    }
    if (kingSquare) break
  }

  if (!kingSquare) return false
  return isSquareUnderAttack(state, kingSquare, color)
}

// Check if a square is under attack by the opposite color
function isSquareUnderAttack(state: GameState, square: Square, defendingColor: Color): boolean {
  const attackingColor = defendingColor === "w" ? "b" : "w"
  const [targetRank, targetFile] = squareToIndices(square)

  for (let rank = 0; rank < 8; rank++) {
    for (let file = 0; file < 8; file++) {
      const piece = state.board[rank][file]
      if (piece && piece.color === attackingColor) {
        // const fromSquare = indicesToSquare(rank, file)
        const moves = getAttackingMoves(state, rank, file, piece)
        if (moves.some(([r, f]) => r === targetRank && f === targetFile)) {
          return true
        }
      }
    }
  }

  return false
}

// Get squares a piece can attack (similar to legal moves but without check validation)
function getAttackingMoves(state: GameState, rank: number, file: number, piece: Piece): [number, number][] {
  const moves: [number, number][] = []

  switch (piece.type) {
    case "p": {
      const direction = piece.color === "w" ? -1 : 1
      const newRank = rank + direction
      for (const df of [-1, 1]) {
        const newFile = file + df
        if (isValidSquare(newRank, newFile)) {
          moves.push([newRank, newFile])
        }
      }
      break
    }
    case "n": {
      const offsets = [
        [-2, -1],
        [-2, 1],
        [-1, -2],
        [-1, 2],
        [1, -2],
        [1, 2],
        [2, -1],
        [2, 1],
      ]
      for (const [dr, df] of offsets) {
        const newRank = rank + dr
        const newFile = file + df
        if (isValidSquare(newRank, newFile)) {
          moves.push([newRank, newFile])
        }
      }
      break
    }
    case "b": {
      const directions = [
        [-1, -1],
        [-1, 1],
        [1, -1],
        [1, 1],
      ]
      for (const [dr, df] of directions) {
        let newRank = rank + dr
        let newFile = file + df
        while (isValidSquare(newRank, newFile)) {
          moves.push([newRank, newFile])
          if (state.board[newRank][newFile]) break
          newRank += dr
          newFile += df
        }
      }
      break
    }
    case "r": {
      const directions = [
        [-1, 0],
        [1, 0],
        [0, -1],
        [0, 1],
      ]
      for (const [dr, df] of directions) {
        let newRank = rank + dr
        let newFile = file + df
        while (isValidSquare(newRank, newFile)) {
          moves.push([newRank, newFile])
          if (state.board[newRank][newFile]) break
          newRank += dr
          newFile += df
        }
      }
      break
    }
    case "q": {
      const directions = [
        [-1, -1],
        [-1, 0],
        [-1, 1],
        [0, -1],
        [0, 1],
        [1, -1],
        [1, 0],
        [1, 1],
      ]
      for (const [dr, df] of directions) {
        let newRank = rank + dr
        let newFile = file + df
        while (isValidSquare(newRank, newFile)) {
          moves.push([newRank, newFile])
          if (state.board[newRank][newFile]) break
          newRank += dr
          newFile += df
        }
      }
      break
    }
    case "k": {
      const offsets = [
        [-1, -1],
        [-1, 0],
        [-1, 1],
        [0, -1],
        [0, 1],
        [1, -1],
        [1, 0],
        [1, 1],
      ]
      for (const [dr, df] of offsets) {
        const newRank = rank + dr
        const newFile = file + df
        if (isValidSquare(newRank, newFile)) {
          moves.push([newRank, newFile])
        }
      }
      break
    }
  }

  return moves
}

// Make a move and return new game state
export function makeMove(state: GameState, from: Square, to: Square, promotion?: PieceType): GameState {
  const [fromRank, fromFile] = squareToIndices(from)
  const [toRank, toFile] = squareToIndices(to)

  const piece = state.board[fromRank][fromFile]
  if (!piece) return state

  const captured = state.board[toRank][toFile]

  // Create new board
  const newBoard = state.board.map((row) => [...row])
  newBoard[toRank][toFile] = piece
  newBoard[fromRank][fromFile] = null

  // Handle promotion
  if (piece.type === "p" && (toRank === 0 || toRank === 7)) {
    newBoard[toRank][toFile] = { type: promotion || "q", color: piece.color }
  }

  // Handle castling
  let castling: "k" | "q" | undefined
  if (piece.type === "k" && Math.abs(toFile - fromFile) === 2) {
    castling = toFile > fromFile ? "k" : "q"
    const rookFromFile = toFile > fromFile ? 7 : 0
    const rookToFile = toFile > fromFile ? toFile - 1 : toFile + 1
    newBoard[toRank][rookToFile] = newBoard[toRank][rookFromFile]
    newBoard[toRank][rookFromFile] = null
  }

  // Handle en passant
  let enPassant = false
  if (piece.type === "p" && to === state.enPassantSquare) {
    enPassant = true
    const capturedPawnRank = piece.color === "w" ? toRank + 1 : toRank - 1
    newBoard[capturedPawnRank][toFile] = null
  }

  // Update castling rights
  const newCastlingRights = { ...state.castlingRights }
  if (piece.type === "k") {
    if (piece.color === "w") {
      newCastlingRights.wk = false
      newCastlingRights.wq = false
    } else {
      newCastlingRights.bk = false
      newCastlingRights.bq = false
    }
  }
  if (piece.type === "r") {
    if (piece.color === "w") {
      if (fromFile === 0) newCastlingRights.wq = false
      if (fromFile === 7) newCastlingRights.wk = false
    } else {
      if (fromFile === 0) newCastlingRights.bq = false
      if (fromFile === 7) newCastlingRights.bk = false
    }
  }

  // Update en passant square
  let newEnPassantSquare: Square | null = null
  if (piece.type === "p" && Math.abs(toRank - fromRank) === 2) {
    const epRank = (fromRank + toRank) / 2
    newEnPassantSquare = indicesToSquare(epRank, fromFile)
  }

  const move: Move = {
    from,
    to,
    piece,
    captured,
    promotion,
    castling,
    enPassant,
  }

  return {
    board: newBoard,
    turn: state.turn === "w" ? "b" : "w",
    castlingRights: newCastlingRights,
    enPassantSquare: newEnPassantSquare,
    halfMoveClock: captured || piece.type === "p" ? 0 : state.halfMoveClock + 1,
    fullMoveNumber: state.turn === "b" ? state.fullMoveNumber + 1 : state.fullMoveNumber,
    lastMove: move,
  }
}

// Check if game is over
export function isCheckmate(state: GameState): boolean {
  if (!isInCheck(state, state.turn)) return false

  // Check if any legal move exists
  for (let rank = 0; rank < 8; rank++) {
    for (let file = 0; file < 8; file++) {
      const piece = state.board[rank][file]
      if (piece && piece.color === state.turn) {
        const square = indicesToSquare(rank, file)
        const moves = getLegalMoves(state, square)
        if (moves.length > 0) return false
      }
    }
  }

  return true
}

export function isStalemate(state: GameState): boolean {
  if (isInCheck(state, state.turn)) return false

  // Check if any legal move exists
  for (let rank = 0; rank < 8; rank++) {
    for (let file = 0; file < 8; file++) {
      const piece = state.board[rank][file]
      if (piece && piece.color === state.turn) {
        const square = indicesToSquare(rank, file)
        const moves = getLegalMoves(state, square)
        if (moves.length > 0) return false
      }
    }
  }

  return true
}
