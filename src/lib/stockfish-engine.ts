import { Chess } from "chess.js";

export interface VerboseMove {
  from: string;
  to: string;
  promotion?: string;
}

export interface EngineEvaluation {
  score: number; // in centipawns
  mate?: number; // moves to mate
  depth: number;
  bestMove?: string;
  pv?: string[];
  verboseMoves: VerboseMove[];
}

export interface MultiPVLine {
  bestMove: string;
  score: number;
  mate?: number;
  depth: number;
  pv: string[];
  verboseMoves: VerboseMove[];
}

const pieceUnicode: Record<string, string> = {
  p: "♟",
  n: "♞",
  b: "♝",
  r: "♜",
  q: "♛",
  k: "♚",
};

export class StockfishEngine {
  private worker: Worker | null = null;
  private isReady = false;
  private readyPromise: Promise<void>;
  private evaluationCallback: ((lines: MultiPVLine[]) => void) | null = null;
  private multiPV = 5;
  private latestLines: (MultiPVLine | undefined)[] = [];
  private currentFEN: string = "";

  constructor() {
    this.readyPromise = this.initEngine();
  }

  private async initEngine(): Promise<void> {
    try {
      const workerUrl = "/engine/stockfish-17.1-8e4d048.js";
      this.worker = new Worker(workerUrl);

      this.worker.onmessage = (e: MessageEvent) => {
        const line: string = e.data;

        if (line === "uciok") {
          this.isReady = true;
        } else if (line.startsWith("info")) {
          // Pass the current FEN to parseInfo
          this.parseInfo(line, this.currentFEN);
        }
      };

      this.worker.postMessage("uci");
      await this.waitForReady();

      this.worker.postMessage("setoption name UCI_AnalyseMode value true");
      this.worker.postMessage(`setoption name MultiPV value ${this.multiPV}`);
      this.worker.postMessage("isready");
    } catch (err) {
      console.error("Failed to initialize Stockfish:", err);
      throw err;
    }
  }

  private waitForReady(): Promise<void> {
    return new Promise((resolve) => {
      const checkReady = () => {
        if (this.isReady) resolve();
        else setTimeout(checkReady, 50);
      };
      checkReady();
    });
  }

  private parseInfo(line: string, fen: string) {
    const depthMatch = line.match(/depth (\d+)/);
    const scoreMatch = line.match(/score (cp|mate) (-?\d+)/);
    const pvMatch = line.match(/pv (.+)/);
    const multiPVMatch = line.match(/multipv (\d+)/);

    if (!depthMatch || !scoreMatch || !pvMatch) return;

    const chess = new Chess(fen);

    const depth = Number(depthMatch[1]);
    const scoreType = scoreMatch[1];
    const scoreValue = (chess.turn() === "w" ? 1 : -1) * Number(scoreMatch[2]);

    const pvMoves = pvMatch[1].trim().split(/\s+/).slice(13);
    const multipv = multiPVMatch ? Number(multiPVMatch[1]) : 1;

    const sanMoves: string[] = [];
    const verboseMoves: VerboseMove[] = [];
    let bestMove = "";

    for (const uci of pvMoves) {
      const move = chess.move({
        from: uci.slice(0, 2),
        to: uci.slice(2, 4),
        promotion: uci[4] || undefined,
      });
      if (!move) break;

      // Only replace non-pawn pieces with Unicode
      let san = move.san;
      for (const [letter, symbol] of Object.entries(pieceUnicode)) {
        const regex = new RegExp(letter.toUpperCase(), "g");
        san = san.replace(regex, symbol);
      }

      sanMoves.push(san);
      verboseMoves.push({
        from: move.from,
        to: move.to,
        promotion: move.promotion,
      });
      if (!bestMove) bestMove = san;
    }

    const lineEval: MultiPVLine = {
      depth,
      score: scoreType === "cp" ? scoreValue : 0,
      mate: scoreType === "mate" ? scoreValue : undefined,
      pv: sanMoves,
      bestMove,
      verboseMoves
    };

    this.latestLines[multipv - 1] = lineEval;

    if (this.latestLines[0]?.depth && this.evaluationCallback) {
      this.evaluationCallback(
        [...this.latestLines].filter(Boolean) as MultiPVLine[]
      );
    }
  }

  async analyze(fen: string, callback: (lines: MultiPVLine[]) => void) {
    await this.readyPromise;
    if (!this.worker) throw new Error("Engine not initialized");

    this.currentFEN = fen; // store current FEN for parseInfo
    this.evaluationCallback = callback;
    this.latestLines = [];

    this.worker.postMessage("stop");
    this.worker.postMessage(`position fen ${fen}`);
    this.worker.postMessage("go depth 20");
  }

  stop() {
    if (this.worker) this.worker.postMessage("stop");
    this.evaluationCallback = null;
  }

  quit() {
    if (this.worker) {
      this.worker.postMessage("quit");
      this.worker.terminate();
      this.worker = null;
    }
    this.isReady = false;
  }
}
