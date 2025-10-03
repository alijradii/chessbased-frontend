"use client";

import { useEffect, useState, useRef } from "react";
import { useAtomValue, useAtom } from "jotai";
import { atom } from "jotai";
import { currentFenAtom, currentTurnAtom } from "@/lib/chess-store";
import { StockfishEngine, type MultiPVLine } from "@/lib/stockfish-engine";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Activity } from "lucide-react";

export const isEngineEnabledAtom = atom(false);

export function EnginePanel() {
  const currentFen = useAtomValue(currentFenAtom);
  const [isEngineEnabled, setIsEngineEnabled] = useAtom(isEngineEnabledAtom);
  const [lines, setLines] = useState<MultiPVLine[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [engineError, setEngineError] = useState<string | null>(null);
  const engineRef = useRef<StockfishEngine | null>(null);
  const currentTurn = useAtomValue(currentTurnAtom);

  console.log(lines[0]);
  // Initialize engine when enabled
  useEffect(() => {
    if (isEngineEnabled && !engineRef.current) {
      setIsAnalyzing(true);
      setEngineError(null);

      try {
        engineRef.current = new StockfishEngine();
        console.log("[v0] Engine initialized");
      } catch (error) {
        console.error("[v0] Engine initialization error:", error);
        setEngineError(
          "Failed to load engine. Make sure stockfish.js and stockfish.wasm are in the public directory."
        );
        setIsAnalyzing(false);
      }
    }

    // Cleanup when disabled
    if (!isEngineEnabled && engineRef.current) {
      engineRef.current.quit();
      engineRef.current = null;
      setLines([]);
      setIsAnalyzing(false);
    }
  }, [isEngineEnabled]);

  // Analyze position when FEN changes
  useEffect(() => {
    if (isEngineEnabled && engineRef.current && currentFen) {
      setIsAnalyzing(true);

      engineRef.current
        .analyze(currentFen, (pvLines) => {
          setLines(pvLines);
          setIsAnalyzing(false);
        })
        .catch((error) => {
          console.error("[v0] Analysis error:", error);
          setEngineError("Analysis failed");
          setIsAnalyzing(false);
        });
    }

    return () => {
      if (engineRef.current) {
        engineRef.current.stop();
      }
    };
  }, [currentFen, isEngineEnabled]);

  const formatScore = (line: MultiPVLine): string => {
    const score = currentTurn === "b" ? -line.score : line.score;
    const mate =
      line.mate !== undefined
        ? currentTurn === "b"
          ? -line.mate
          : line.mate
        : undefined;

    if (mate !== undefined) {
      const mateIn = Math.abs(mate);
      const side = mate > 0 ? "White" : "Black";
      return `M${mateIn} (${side})`;
    }

    return (score / 100).toFixed(2);
  };

  const getScoreColor = (line: MultiPVLine): string => {
    const score = currentTurn === "b" ? -line.score : line.score;
    const mate =
      line.mate !== undefined
        ? currentTurn === "b"
          ? -line.mate
          : line.mate
        : undefined;

    if (mate !== undefined) {
      return mate > 0
        ? "text-green-600 dark:text-green-400"
        : "text-red-600 dark:text-red-400";
    }

    if (score > 100) return "text-green-600 dark:text-green-400";
    if (score < -100) return "text-red-600 dark:text-red-400";
    return "text-foreground";
  };

  return (
    <Card className="w-full max-w-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Engine Analysis
          </CardTitle>
          <div className="flex items-center gap-2">
            <Switch
              id="engine-toggle"
              checked={isEngineEnabled}
              onCheckedChange={setIsEngineEnabled}
            />
            <Label htmlFor="engine-toggle" className="text-sm cursor-pointer">
              {isEngineEnabled ? "On" : "Off"}
            </Label>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {!isEngineEnabled ? (
          <div className="text-sm text-muted-foreground text-center py-4">
            Enable the engine to see position evaluation
          </div>
        ) : engineError ? (
          <div className="text-sm text-destructive">{engineError}</div>
        ) : (
          <>
            {isAnalyzing && (
              <div className="text-xs text-muted-foreground animate-pulse text-center">
                Analyzing...
              </div>
            )}

            {lines.length > 0 ? (
              <div className="space-y-2">
                {lines.map((line, index) => (
                  <div key={index} className="p-2 border rounded-md">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Line {index + 1}
                      </span>
                      <span className={`font-mono ${getScoreColor(line)}`}>
                        {formatScore(line)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Depth</span>
                      <span className="font-mono">{line.depth}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Best Move</span>
                      <span className="font-mono">{line.bestMove}</span>
                    </div>
                    <div className="mt-1">
                      <span className="text-muted-foreground text-xs">PV:</span>
                      <div className="font-mono text-xs break-all">
                        {line.pv.join(" ")}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-muted-foreground text-center py-4">
                Waiting for engine...
              </div>
            )}

            <div className="pt-2 border-t">
              <div className="text-xs text-muted-foreground text-center">
                Stockfish 17 NNUE
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
