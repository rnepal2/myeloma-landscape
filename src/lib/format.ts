export const activeStatuses = new Set([
  "RECRUITING",
  "ACTIVE_NOT_RECRUITING",
  "NOT_YET_RECRUITING",
  "ENROLLING_BY_INVITATION",
]);

export function prettyEnum(value: string) {
  const phase = value.match(/^(EARLY_)?PHASE(\d)$/);
  if (phase) return `${phase[1] ? "Early " : ""}Phase ${phase[2]}`;
  if (value === "NA") return "Not applicable";
  return value
    .toLowerCase()
    .replaceAll("_", " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

export function shortDate(value?: string) {
  if (!value) return "Not reported";
  if (/^\d{4}$/.test(value)) return value;
  const normalized =
    value.length === 4
      ? `${value}-01-01`
      : value.length === 7
        ? `${value}-01`
        : value;
  const date = new Date(`${normalized}T12:00:00Z`);
  return Number.isNaN(date.valueOf())
    ? value
    : new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: value.length > 7 ? "numeric" : undefined,
        year: "numeric",
        timeZone: "UTC",
      }).format(date);
}

export function snapshotDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "America/New_York",
  }).format(new Date(value));
}

export function targetFamily(value?: string) {
  if (!value || value === "Unclassified") return "Unclassified";
  for (const family of [
    "BCMA",
    "GPRC5D",
    "FcRH5",
    "CD38",
    "Cereblon",
    "Proteasome",
    "XPO1",
    "BCL-2",
    "SLAMF7",
  ]) {
    if (value.startsWith(family)) return family;
  }
  return value;
}

export function csvCell(value: string | number | boolean) {
  const text = String(value);
  // Prevent spreadsheet programs interpreting registry text as a formula.
  const safe = /^[=+\-@\t\r]/.test(text) ? `'${text}` : text;
  return `"${safe.replaceAll('"', '""')}"`;
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
