"use client";

import React, {
  useCallback,
  useEffect,
  useReducer,
  useRef,
  useState,
} from "react";
import BootSequence from "@/components/BootSequence";
import TerminalLineComponent from "@/components/TerminalLine";
import TerminalInput from "@/components/TerminalInput";
import { TerminalLine } from "@/lib/types";
import { parseAndExecute } from "@/lib/commandParser";
import { lineId } from "@/lib/commandParser";

// ────────────────────────────────────────────────────────
// State
// ────────────────────────────────────────────────────────
interface TerminalState {
  lines: TerminalLine[];
  cwd: string[];
  commandHistory: string[];
  historyIndex: number;
  crtEnabled: boolean;
}

type Action =
  | { type: "APPEND"; lines: TerminalLine[] }
  | { type: "CLEAR" }
  | { type: "SET_CWD"; cwd: string[] }
  | { type: "PUSH_HISTORY"; cmd: string }
  | { type: "SET_HISTORY_INDEX"; index: number }
  | { type: "TOGGLE_CRT" };

function reducer(state: TerminalState, action: Action): TerminalState {
  switch (action.type) {
    case "APPEND":
      return { ...state, lines: [...state.lines, ...action.lines] };
    case "CLEAR":
      return { ...state, lines: [] };
    case "SET_CWD":
      return { ...state, cwd: action.cwd };
    case "PUSH_HISTORY":
      return {
        ...state,
        commandHistory: [...state.commandHistory, action.cmd],
        historyIndex: state.commandHistory.length + 1,
      };
    case "SET_HISTORY_INDEX":
      return { ...state, historyIndex: action.index };
    case "TOGGLE_CRT":
      return { ...state, crtEnabled: !state.crtEnabled };
    default:
      return state;
  }
}

// ────────────────────────────────────────────────────────
// Matrix rain effect (brief)
// ────────────────────────────────────────────────────────
const MATRIX_CHARS = "ｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄ01アイウエオカキクケコサシスセソタチツテトNAME";
function matrixFrame(cols: number): string {
  return Array.from({ length: cols }, () =>
    MATRIX_CHARS[Math.floor(Math.random() * MATRIX_CHARS.length)]
  ).join(" ");
}

// ────────────────────────────────────────────────────────
// Terminal component
// ────────────────────────────────────────────────────────
interface TerminalProps {
  content: Record<string, string>;
}

export default function Terminal({ content }: TerminalProps) {
  const [booted, setBooted] = useState(false);
  const [rebooting, setRebooting] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [matrixActive, setMatrixActive] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const [state, dispatch] = useReducer(reducer, {
    lines: [],
    cwd: [],
    commandHistory: [],
    historyIndex: 0,
    crtEnabled: false,
  });

  // Apply CRT class to body
  useEffect(() => {
    if (state.crtEnabled) {
      document.body.classList.add("crt-enabled");
    } else {
      document.body.classList.remove("crt-enabled");
    }
  }, [state.crtEnabled]);

  // Auto-scroll to bottom
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [state.lines, matrixActive]);

  const currentPrompt = `C:\\AJBEUMER${state.cwd.length ? "\\" + state.cwd.join("\\") : ""}`;

  const appendLines = useCallback((lines: TerminalLine[]) => {
    dispatch({ type: "APPEND", lines });
  }, []);

  const handleBootComplete = useCallback(() => {
    setBooted(true);
  }, []);

  // Matrix animation
  const runMatrix = useCallback(() => {
    setMatrixActive(true);
    const FRAMES = 18;
    let frame = 0;
    const id = setInterval(() => {
      const line: TerminalLine = {
        id: lineId(),
        type: "output",
        text: matrixFrame(32),
      };
      dispatch({ type: "APPEND", lines: [line] });
      frame++;
      if (frame >= FRAMES) {
        clearInterval(id);
        setMatrixActive(false);
        dispatch({
          type: "APPEND",
          lines: [
            { id: lineId(), type: "output", text: "" },
            {
              id: lineId(),
              type: "system",
              text: "There is no spoon. Type HELP to continue.",
            },
            { id: lineId(), type: "output", text: "" },
          ],
        });
      }
    }, 60);
  }, []);

  const handleSubmit = useCallback(
    (raw: string) => {
      const trimmed = raw.trim();

      // Echo the prompt line
      const promptLine: TerminalLine = {
        id: lineId(),
        type: "prompt",
        prompt: currentPrompt,
        text: raw,
      };
      dispatch({ type: "APPEND", lines: [promptLine] });

      if (trimmed) {
        dispatch({ type: "PUSH_HISTORY", cmd: trimmed });

        let newCwd = state.cwd;
        let crtEnabled = state.crtEnabled;

        const result = parseAndExecute(trimmed, {
          cwd: state.cwd,
          content,
          setCwd: (p) => {
            newCwd = p;
          },
          clearLines: () => dispatch({ type: "CLEAR" }),
          toggleCrt: () => {
            crtEnabled = !crtEnabled;
          },
          crtEnabled: state.crtEnabled,
          commandHistory: state.commandHistory,
        });

        // Check for special signals
        const specialIdx = result.findIndex(
          (l) => l.type === "system" && (l.text === "__MATRIX__" || l.text === "__REBOOT__")
        );

        if (specialIdx !== -1) {
          const special = result[specialIdx];
          const others = result.filter((_, i) => i !== specialIdx);
          if (others.length) dispatch({ type: "APPEND", lines: others });

          if (special.text === "__MATRIX__") {
            runMatrix();
          } else if (special.text === "__REBOOT__") {
            setRebooting(true);
            setTimeout(() => setRebooting(false), 100);
          }
        } else {
          dispatch({ type: "APPEND", lines: result });
        }

        if (newCwd !== state.cwd) dispatch({ type: "SET_CWD", cwd: newCwd });
        if (crtEnabled !== state.crtEnabled) dispatch({ type: "TOGGLE_CRT" });
      }

      setInputValue("");
    },
    [content, currentPrompt, runMatrix, state]
  );

  const handleHistoryUp = useCallback(() => {
    const newIdx = Math.max(0, state.historyIndex - 1);
    dispatch({ type: "SET_HISTORY_INDEX", index: newIdx });
    setInputValue(state.commandHistory[newIdx] ?? "");
  }, [state.commandHistory, state.historyIndex]);

  const handleHistoryDown = useCallback(() => {
    const newIdx = Math.min(state.commandHistory.length, state.historyIndex + 1);
    dispatch({ type: "SET_HISTORY_INDEX", index: newIdx });
    setInputValue(state.commandHistory[newIdx] ?? "");
  }, [state.commandHistory, state.historyIndex]);

  const handleTabComplete = useCallback(
    (partial: string, suggestions: string[]) => {
      if (suggestions.length === 0) return;
      if (suggestions.length === 1) {
        // Replace last token with the suggestion
        const tokens = inputValue.trimStart().split(/\s+/);
        tokens[tokens.length - 1] = suggestions[0];
        setInputValue(tokens.join(" "));
      } else {
        // Show suggestions
        const lines: TerminalLine[] = [
          { id: lineId(), type: "output", text: "" },
          {
            id: lineId(),
            type: "output",
            text: suggestions.join("   "),
          },
          { id: lineId(), type: "output", text: "" },
        ];
        dispatch({ type: "APPEND", lines });
      }
    },
    [inputValue]
  );

  if (rebooting) {
    return (
      <BootSequence
        onComplete={() => {
          setRebooting(false);
          dispatch({ type: "CLEAR" });
        }}
      />
    );
  }

  if (!booted) {
    return <BootSequence onComplete={handleBootComplete} />;
  }

  return (
    <div
      className="fixed inset-0 bg-dos-bg flex flex-col"
      onClick={() => {
        // Click anywhere → focus input
        const input = document.querySelector<HTMLInputElement>(
          'input[aria-label="Terminal input"]'
        );
        input?.focus();
      }}
      role="application"
      aria-label="Terminal"
    >
      {/* Header bar */}
      <div className="flex-none bg-dos-border border-b border-dos-border px-4 py-1 flex items-center gap-3">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-dos-dim" />
          <div className="w-3 h-3 rounded-full bg-dos-dim" />
          <div className="w-3 h-3 rounded-full bg-dos-dim" />
        </div>
        <span className="text-dos-dim text-xs font-mono select-none">
          AJB-OS v1.0.0 — C:\AJBEUMER
        </span>
      </div>

      {/* Scrollback area */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto terminal-scroll px-4 py-3 space-y-0.5"
        role="log"
        aria-live="polite"
        aria-atomic="false"
        aria-label="Terminal output"
      >
        {state.lines.map((line) => (
          <TerminalLineComponent
            key={line.id}
            line={line}
            promptPath={currentPrompt}
          />
        ))}
        {matrixActive && (
          <div className="text-dos-green text-sm font-mono opacity-80 animate-pulse">
            {matrixFrame(32)}
          </div>
        )}
      </div>

      {/* Input row — sticky at bottom */}
      <div className="flex-none px-4 py-3 border-t border-dos-border bg-dos-bg">
        <TerminalInput
          value={inputValue}
          prompt={currentPrompt}
          onChange={setInputValue}
          onSubmit={handleSubmit}
          onHistoryUp={handleHistoryUp}
          onHistoryDown={handleHistoryDown}
          onTabComplete={handleTabComplete}
          cwd={state.cwd}
          disabled={matrixActive}
        />
      </div>
    </div>
  );
}
