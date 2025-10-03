// Stockfish.js WASM wrapper
// This is a minimal wrapper to load and communicate with Stockfish WASM

let wasmModule = null
let stockfishWorker = null

const Stockfish = () => {
  const worker = {
    listeners: [],

    postMessage: (cmd) => {
      if (typeof cmd === "string") {
        if (wasmModule && wasmModule.ccall) {
          try {
            wasmModule.ccall("uci_command", "number", ["string"], [cmd])
          } catch (e) {
            console.error("Error sending command to Stockfish:", e)
          }
        }
      }
    },

    addEventListener: function (event, callback) {
      if (event === "message") {
        this.listeners.push(callback)
      }
    },

    removeEventListener: function (event, callback) {
      if (event === "message") {
        const index = this.listeners.indexOf(callback)
        if (index > -1) {
          this.listeners.splice(index, 1)
        }
      }
    },

    _onMessage: function (line) {
      this.listeners.forEach((listener) => {
        listener({ data: line })
      })
    },
  }

  // Load WASM module
  if (!wasmModule) {
    const script = document.createElement("script")
    script.src = "/stockfish.wasm.js"
    script.onload = () => {
      if (window.Module) {
        wasmModule = window.Module
        wasmModule.print = (text) => worker._onMessage(text)
      }
    }
    document.head.appendChild(script)
  }

  stockfishWorker = worker
  return worker
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = Stockfish
} else {
  window.Stockfish = Stockfish
}
