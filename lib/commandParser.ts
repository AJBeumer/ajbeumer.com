// Re-export shim � logic has moved to @/lib/commands/
// This file exists only for backward compatibility during transition.
// All new code should import from @/lib/commands instead.
export { parseAndExecute, lineId } from "@/lib/commands";
