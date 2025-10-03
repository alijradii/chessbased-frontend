"use client";

import { useEffect, useState, useRef } from "react";
import { useAtomValue, useAtom } from "jotai";
import { atom } from "jotai";
import { currentFenAtom } from "@/lib/chess-store";
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
  const [depth, setDepth] = useState<number>(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [engineError, setEngineError] = useState<string | null>(null);
  const engineRef = useRef<StockfishEngine | null>(null);

  useEffect(() => {
    if (isEngineEnabled && !engineRef.current) {
      setIsAnalyzing(true);
      setEngineError(null);

      try {
        engineRef.current = new StockfishEngine();
      } catch (error) {
        console.error("Engine init error:", error);
        setEngineError(
          "Failed to load engine. Make sure stockfish.js and stockfish.wasm are in the public directory."
        );
        setIsAnalyzing(false);
      }
    }

    if (!isEngineEnabled && engineRef.current) {
      engineRef.current.quit();
      engineRef.current = null;
      setLines([]);
      setIsAnalyzing(false);
      setDepth(0);
    }
  }, [isEngineEnabled]);

  useEffect(() => {
    if (isEngineEnabled && engineRef.current && currentFen) {
      setIsAnalyzing(true);

      engineRef.current
        .analyze(currentFen, (engineLines) => {
          setLines(engineLines);
          if (engineLines[0]?.depth) setDepth(engineLines[0].depth);
          setIsAnalyzing(false);
        })
        .catch((error) => {
          console.error("Analysis error:", error);
          setEngineError("Analysis failed");
          setIsAnalyzing(false);
        });
    }

    return () => {
      if (engineRef.current) engineRef.current.stop();
    };
  }, [currentFen, isEngineEnabled]);

  const formatLine = (line: MultiPVLine) => {
    let evalText = "";
    if (line.mate !== undefined) {
      evalText = `#${line.mate}`;
    } else {
      evalText = `${(line.score / 100).toFixed(2)}`;
      if (!evalText.startsWith("-")) evalText = `+${evalText}`;
    }

    return `(${evalText}) ${line.pv.join(" ")}`;
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
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Depth</span>
              <span className="font-mono">{depth}</span>
            </div>

            {isAnalyzing && (
              <div className="text-xs text-muted-foreground animate-pulse text-center">
                Analyzing...
              </div>
            )}

            <div className="space-y-1 text-sm font-mono">
              {lines.map((line, idx) => (
                <div key={idx} className="line-clamp-1">{formatLine(line)}</div>
              ))}
            </div>

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
