import { test, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { getToolLabel, ToolInvocationChip } from "../ToolInvocationChip";

afterEach(() => {
  cleanup();
});

// ---------------------------------------------------------------------------
// getToolLabel — pure function tests
// ---------------------------------------------------------------------------

test("getToolLabel: str_replace_editor create", () => {
  expect(getToolLabel("str_replace_editor", { command: "create", path: "/App.jsx" })).toBe("Creating /App.jsx");
});

test("getToolLabel: str_replace_editor str_replace", () => {
  expect(getToolLabel("str_replace_editor", { command: "str_replace", path: "/components/Button.tsx" })).toBe("Editing /components/Button.tsx");
});

test("getToolLabel: str_replace_editor insert", () => {
  expect(getToolLabel("str_replace_editor", { command: "insert", path: "/App.jsx" })).toBe("Editing /App.jsx");
});

test("getToolLabel: str_replace_editor view", () => {
  expect(getToolLabel("str_replace_editor", { command: "view", path: "/App.jsx" })).toBe("Reading /App.jsx");
});

test("getToolLabel: str_replace_editor undo_edit", () => {
  expect(getToolLabel("str_replace_editor", { command: "undo_edit", path: "/App.jsx" })).toBe("Undoing edit in /App.jsx");
});

test("getToolLabel: file_manager rename with new_path", () => {
  expect(getToolLabel("file_manager", { command: "rename", path: "/old.jsx", new_path: "/new.jsx" })).toBe("Renaming /old.jsx → /new.jsx");
});

test("getToolLabel: file_manager rename without new_path", () => {
  expect(getToolLabel("file_manager", { command: "rename", path: "/old.jsx" })).toBe("Renaming /old.jsx");
});

test("getToolLabel: file_manager delete", () => {
  expect(getToolLabel("file_manager", { command: "delete", path: "/App.jsx" })).toBe("Deleting /App.jsx");
});

test("getToolLabel: unknown tool falls back to toolName", () => {
  expect(getToolLabel("some_other_tool", { command: "do_thing" })).toBe("some_other_tool");
});

test("getToolLabel: empty args falls back to toolName", () => {
  expect(getToolLabel("str_replace_editor", {})).toBe("str_replace_editor");
});

test("getToolLabel: missing path renders label without crashing", () => {
  const label = getToolLabel("str_replace_editor", { command: "create" });
  expect(label).toBe("Creating ");
});

// ---------------------------------------------------------------------------
// ToolInvocationChip — render tests
// ---------------------------------------------------------------------------

test("ToolInvocationChip renders label text", () => {
  render(
    <ToolInvocationChip
      toolName="str_replace_editor"
      args={{ command: "create", path: "/App.jsx" }}
      state="result"
      result="ok"
    />
  );
  expect(screen.getByText("Creating /App.jsx")).toBeDefined();
});

test("ToolInvocationChip shows green dot when done", () => {
  const { container } = render(
    <ToolInvocationChip
      toolName="str_replace_editor"
      args={{ command: "create", path: "/App.jsx" }}
      state="result"
      result="ok"
    />
  );
  expect(container.querySelector(".bg-emerald-500")).toBeDefined();
});

test("ToolInvocationChip does not show spinner when done", () => {
  const { container } = render(
    <ToolInvocationChip
      toolName="str_replace_editor"
      args={{ command: "create", path: "/App.jsx" }}
      state="result"
      result="ok"
    />
  );
  expect(container.querySelector(".animate-spin")).toBeNull();
});

test("ToolInvocationChip shows spinner when state is call", () => {
  const { container } = render(
    <ToolInvocationChip
      toolName="str_replace_editor"
      args={{ command: "create", path: "/App.jsx" }}
      state="call"
    />
  );
  expect(container.querySelector(".animate-spin")).toBeDefined();
});

test("ToolInvocationChip shows spinner when state is partial-call", () => {
  const { container } = render(
    <ToolInvocationChip
      toolName="str_replace_editor"
      args={{ command: "create", path: "/App.jsx" }}
      state="partial-call"
    />
  );
  expect(container.querySelector(".animate-spin")).toBeDefined();
});

test("ToolInvocationChip does not show green dot when pending", () => {
  const { container } = render(
    <ToolInvocationChip
      toolName="str_replace_editor"
      args={{ command: "create", path: "/App.jsx" }}
      state="call"
    />
  );
  expect(container.querySelector(".bg-emerald-500")).toBeNull();
});

test("ToolInvocationChip container has font-mono class", () => {
  const { container } = render(
    <ToolInvocationChip
      toolName="str_replace_editor"
      args={{ command: "create", path: "/App.jsx" }}
      state="call"
    />
  );
  expect(container.firstElementChild?.className).toContain("font-mono");
});

test("ToolInvocationChip treats result=undefined as pending even if state=result", () => {
  const { container } = render(
    <ToolInvocationChip
      toolName="str_replace_editor"
      args={{ command: "create", path: "/App.jsx" }}
      state="result"
      result={undefined}
    />
  );
  // No result value → treated as in-progress
  expect(container.querySelector(".animate-spin")).toBeDefined();
  expect(container.querySelector(".bg-emerald-500")).toBeNull();
});
