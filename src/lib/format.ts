export const activeStatuses = new Set([
  "RECRUITING",
  "ACTIVE_NOT_RECRUITING",
  "NOT_YET_RECRUITING",
  "ENROLLING_BY_INVITATION",
]);

export function prettyEnum(value: string) {
  return value
    .toLowerCase()
    .replaceAll("_", " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

export function shortDate(value?: string) {
  if (!value) return "Not reported";
  const normalized =
    value.length === 4
      ? `${value}-01-01`
      : value.length === 7
        ? `${value}-01`
        : value;
  const date = new Date(`${normalized}T00:00:00`);
  return Number.isNaN(date.valueOf())
    ? value
    : new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: value.length > 7 ? "numeric" : undefined,
        year: "numeric",
      }).format(date);
}

export function highestPhase(phases: string[]) {
  const order = ["NA", "EARLY_PHASE1", "PHASE1", "PHASE2", "PHASE3", "PHASE4"];
  return phases.reduce(
    (best, phase) =>
      order.indexOf(phase) > order.indexOf(best) ? phase : best,
    "NA",
  );
}

export function cx(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(" ");
}
