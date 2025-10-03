// Stockfish WASM Module Loader
// This file loads the actual Stockfish WASM binary

var Module = {
  locateFile: (path) => {
    if (path.endsWith(".wasm")) {
      return "/stockfish.wasm"
    }
    return path
  },

  print: (text) => {
    console.log("[Stockfish]", text)
  },

  printErr: (text) => {
    console.error("[Stockfish Error]", text)
  },

  onRuntimeInitialized: function () {
    console.log("[Stockfish] WASM module initialized")
    // Initialize UCI
    if (this.ccall) {
      this.ccall("uci_command", "number", ["string"], ["uci"])
    }
  },
}

// Note: You'll need to download the actual stockfish.wasm binary
// from https://github.com/nmrugg/stockfish.js/releases
// and place it in the public directory as stockfish.wasm
