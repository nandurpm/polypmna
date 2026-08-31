import { describe, expect, it } from "vitest";
import { resolveAuthRedirect } from "../src/lib/authRedirect";

describe("auth redirect validation", () => {
  it("preserves an internal route including query and hash", () => {
    expect(resolveAuthRedirect("/subject/123?revision=2026#notes"))
      .toBe("/subject/123?revision=2026#notes");
  });

  it.each([
    "https://evil.example/steal",
    "//evil.example/steal",
    "/\\evil.example/steal",
    "javascript:alert(1)",
  ])("rejects unsafe returnTo value %j", (returnTo) => {
    expect(resolveAuthRedirect(returnTo, "/curriculum")).toBe("/curriculum");
  });

  it("uses the authenticated default when returnTo is absent", () => {
    expect(resolveAuthRedirect(null)).toBe("/dashboard");
  });
});
