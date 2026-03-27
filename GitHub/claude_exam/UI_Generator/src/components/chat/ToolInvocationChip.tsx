"use client";

import { Loader2 } from "lucide-react";

export function getToolLabel(toolName: string, args: Record<string, any>): string {
  const path = args?.path ?? "";

  if (toolName === "str_replace_editor") {
    switch (args?.command) {
      case "create":     return `Creating ${path}`;
      case "str_replace": return `Editing ${path}`;
      case "insert":     return `Editing ${path}`;
      case "view":       return `Reading ${path}`;
      case "undo_edit":  return `Undoing edit in ${path}`;
    }
  }

  if (toolName === "file_manager") {
    switch (args?.command) {
      case "rename": {
        const dest = args?.new_path ? ` → ${args.new_path}` : "";
        return `Renaming ${path}${dest}`;
      }
      case "delete": return `Deleting ${path}`;
    }
  }

  return toolName;
}

interface ToolInvocationChipProps {
  toolName: string;
  args: Record<string, any>;
  state: "partial-call" | "call" | "result";
  result?: unknown;
}

export function ToolInvocationChip({ toolName, args, state, result }: ToolInvocationChipProps) {
  const label = getToolLabel(toolName, args);
  const isDone = state === "result" && Boolean(result);

  return (
    <div className="inline-flex items-center gap-2 mt-2 px-3 py-1.5 bg-neutral-50 rounded-lg text-xs font-mono border border-neutral-200">
      {isDone ? (
        <div className="w-2 h-2 rounded-full bg-emerald-500" />
      ) : (
        <Loader2 className="w-3 h-3 animate-spin text-blue-600" />
      )}
      <span className="text-neutral-700">{label}</span>
    </div>
  );
}
