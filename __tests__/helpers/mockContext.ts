import { vi } from "vitest";
import type { CommandContext } from "@/lib/types";

export function createMockContext(
  overrides: Partial<CommandContext> = {}
): CommandContext {
  return {
    args: [],
    cwd: [],
    content: {},
    setCwd: vi.fn(),
    clearLines: vi.fn(),
    toggleCrt: vi.fn(),
    crtEnabled: false,
    commandHistory: [],
    theme: "dark",
    setTheme: vi.fn(),
    ...overrides,
  };
}
