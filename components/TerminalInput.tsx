"use client";

import React, { KeyboardEvent, useEffect, useRef } from "react";
import { getSuggestions } from "@/lib/filesystem";

interface TerminalInputProps {
  value: string;
  prompt: string;
  onChange: (val: string) => void;
  onSubmit: (val: string) => void;
  onHistoryUp: () => void;
  onHistoryDown: () => void;
  onTabComplete: (partial: string, suggestions: string[]) => void;
  cwd: string[];
  disabled?: boolean;
}

export default function TerminalInput({
  value,
  prompt,
  onChange,
  onSubmit,
  onHistoryUp,
  onHistoryDown,
  onTabComplete,
  cwd,
  disabled,
}: TerminalInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  // Keep focus on input at all times
  useEffect(() => {
    if (!disabled) inputRef.current?.focus();
  });

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      onSubmit(value);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      onHistoryUp();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      onHistoryDown();
    } else if (e.key === "Tab") {
      e.preventDefault();
      const tokens = value.trimStart().split(/\s+/);
      // Autocomplete the last token
      const partial = tokens[tokens.length - 1] ?? "";
      const suggestions = getSuggestions(cwd, partial);
      onTabComplete(partial, suggestions);
    }
  };

  return (
    <div className="flex items-center text-sm">
      <span className="text-dos-green select-none whitespace-nowrap mr-1">
        {prompt}&gt;
      </span>
      <div className="relative flex-1 flex items-center">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
          className={[
            "flex-1 bg-transparent outline-none border-none",
            "text-dos-text caret-dos-green font-mono text-sm",
            "selection:bg-dos-green selection:text-dos-bg",
          ].join(" ")}
          aria-label="Terminal input"
        />
      </div>
    </div>
  );
}
