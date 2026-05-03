"use client";

import React from "react";
import { TerminalLine } from "@/lib/types";

interface TerminalLineProps {
  line: TerminalLine;
}

export default function TerminalLineComponent({ line }: TerminalLineProps) {
  if (line.type === "html" && line.html) {
    return (
      <div
        className="dos-content text-sm leading-relaxed pl-2"
        dangerouslySetInnerHTML={{ __html: line.html }}
      />
    );
  }

  if (line.type === "prompt") {
    return (
      <div className="flex text-sm leading-relaxed">
        <span className="text-dos-green select-none mr-1">{line.prompt}&gt;</span>
        <span className="text-dos-text">{line.text}</span>
      </div>
    );
  }

  if (line.type === "error") {
    return (
      <div className="text-dos-error text-sm leading-relaxed">
        {line.text}
      </div>
    );
  }

  if (line.type === "system") {
    return (
      <div className="text-dos-green-dim text-sm leading-relaxed italic">
        {line.text}
      </div>
    );
  }

  // "output"
  return (
    <div className="text-dos-text text-sm leading-relaxed whitespace-pre-wrap">
      {line.text ?? "\u00a0"}
    </div>
  );
}
