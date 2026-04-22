export type LineType = "output" | "prompt" | "error" | "system" | "html";

export interface TerminalLine {
  id: string;
  type: LineType;
  text?: string;
  html?: string;
  prompt?: string; // the prompt string shown before user input on prompt lines
}

export interface CommandContext {
  args: string[];
  cwd: string[];
  content: Record<string, string>;
  setCwd: (path: string[]) => void;
  clearLines: () => void;
  toggleCrt: () => void;
  crtEnabled: boolean;
  commandHistory: string[];
}

export type CommandResult = TerminalLine | TerminalLine[];
