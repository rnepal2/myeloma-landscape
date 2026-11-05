import { describe, expect, it } from "vitest";
import {
  csvCell,
  highestPhase,
  prettyEnum,
  shortDate,
  targetFamily,
} from "./lib/format";

describe("presentation helpers", () => {
  it("formats registry enums", () =>
    expect(prettyEnum("ACTIVE_NOT_RECRUITING")).toBe("Active Not Recruiting"));
  it("selects the highest phase", () =>
    expect(highestPhase(["PHASE1", "PHASE3", "PHASE2"])).toBe("PHASE3"));
  it("renders incomplete registry dates", () =>
    expect(shortDate("2026-07")).toContain("2026"));
  it("preserves calendar month and year precision", () => {
    expect(shortDate("2026-11")).toBe("Nov 2026");
    expect(shortDate("2026")).toBe("2026");
    expect(shortDate("2026-11-01")).toBe("Nov 1, 2026");
  });
  it("formats phase codes with readable spacing", () => {
    expect(prettyEnum("PHASE3")).toBe("Phase 3");
    expect(prettyEnum("EARLY_PHASE1")).toBe("Early Phase 1");
  });
  it("consolidates modality-specific targets", () => {
    expect(targetFamily("BCMA × CD3")).toBe("BCMA");
    expect(targetFamily("Unclassified")).toBe("Unclassified");
  });
  it("escapes CSV fields and neutralizes formulas", () => {
    expect(csvCell('Title, with "quotes"')).toBe('"Title, with ""quotes"""');
    expect(csvCell("=HYPERLINK(A1)")).toBe('"\'=HYPERLINK(A1)"');
  });
});
