import { useEffect, useMemo, useState } from "react";
import { TrialDrawer } from "../components/trials/TrialDrawer";
import { Badge } from "../components/ui/Badge";
import { PageIntro } from "../components/ui/PageIntro";
import { Pagination } from "../components/ui/Pagination";
import { SearchBox } from "../components/ui/SearchBox";
import { useAppData } from "../context/AppDataContext";
import { activeStatuses, prettyEnum, shortDate } from "../lib/format";
import type { Trial } from "../types";

export function TrialsPage() {
  const { trials } = useAppData();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("ACTIVE");
  const [phase, setPhase] = useState("ALL");
  const [selected, setSelected] = useState<Trial | null>(null);
  const [page, setPage] = useState(1);
  const pageSize = 15;
  const filtered = useMemo(
    () =>
      trials.filter((trial) => {
        const haystack =
          `${trial.nctId} ${trial.title} ${trial.sponsor} ${trial.interventions.map((item) => item.canonicalName).join(" ")}`.toLowerCase();
        const statusMatches =
          status === "ALL" ||
          (status === "ACTIVE" &&
            trial.studyType === "INTERVENTIONAL" &&
            activeStatuses.has(trial.status)) ||
          trial.status === status;
        return (
          (!query || haystack.includes(query.toLowerCase())) &&
          statusMatches &&
          (phase === "ALL" || trial.phases.includes(phase))
        );
      }),
    [trials, query, status, phase],
  );
  const pageItems = filtered.slice((page - 1) * pageSize, page * pageSize);
  useEffect(() => setPage(1), [query, status, phase]);
  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (event.key === "/" && document.activeElement?.tagName !== "INPUT") {
        event.preventDefault();
        document
          .querySelector<HTMLInputElement>('input[placeholder^="Search trial"]')
          ?.focus();
      }
    };
    addEventListener("keydown", handler);
    return () => removeEventListener("keydown", handler);
  }, []);

  return (
    <section className="mx-auto max-w-[1200px] px-6 py-16">
      <PageIntro
        eyebrow="Trial intelligence"
        title="Interrogate the registered development landscape"
        copy="Search and filter structured ClinicalTrials.gov records, then trace each field back to the source study."
      />
      <div className="grid gap-2.5 md:grid-cols-[1fr_190px_170px]">
        <SearchBox
          value={query}
          onChange={setQuery}
          placeholder="Search trial, sponsor, intervention, or NCT ID"
        />
        <Filter
          label="Status"
          value={status}
          onChange={setStatus}
          options={[
            ["ACTIVE", "Active studies"],
            ["ALL", "All statuses"],
            ["RECRUITING", "Recruiting"],
            ["COMPLETED", "Completed"],
            ["TERMINATED", "Terminated"],
          ]}
        />
        <Filter
          label="Phase"
          value={phase}
          onChange={setPhase}
          options={[
            ["ALL", "All phases"],
            ["PHASE1", "Phase 1"],
            ["PHASE2", "Phase 2"],
            ["PHASE3", "Phase 3"],
            ["PHASE4", "Phase 4"],
          ]}
        />
      </div>
      <p className="my-3 text-xs text-[#718587]">
        <strong className="text-[#0b292f]">
          {filtered.length.toLocaleString()}
        </strong>{" "}
        matching records
      </p>
      <div className="overflow-x-auto rounded-lg border border-[#dbe5e1] bg-white">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-[#f6f9f7] text-left text-[10px] font-bold uppercase tracking-[0.08em] text-[#718587]">
              <th className="px-4 py-3">Study</th>
              <th className="px-4 py-3">Phase</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Lead sponsor</th>
              <th className="px-4 py-3">Primary completion</th>
            </tr>
          </thead>
          <tbody>
            {pageItems.map((trial) => (
              <tr
                className="cursor-pointer border-t border-[#e5ebe8] text-xs text-[#5e7376] transition hover:bg-[#f1f7f3] focus:bg-[#edf7f2] focus:outline-2 focus:outline-[#158c77]"
                key={trial.nctId}
                onClick={() => setSelected(trial)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    setSelected(trial);
                  }
                }}
                tabIndex={0}
                role="button"
                aria-label={`Open ${trial.nctId}: ${trial.title}`}
              >
                <td className="min-w-[420px] px-4 py-4">
                  <span className="mb-1 block text-[10px] font-extrabold text-[#158c77]">
                    {trial.nctId}
                  </span>
                  <strong className="block max-w-xl text-[13px] leading-5 text-[#0b292f]">
                    {trial.title}
                  </strong>
                  <small className="mt-1 block text-[11px] text-[#829193]">
                    {trial.interventions
                      .slice(0, 3)
                      .map((item) => item.canonicalName)
                      .join(" · ")}
                  </small>
                </td>
                <td className="px-4 py-4">
                  {trial.phases.map((item) => (
                    <Badge key={item} tone="blue">
                      {prettyEnum(item)}
                    </Badge>
                  ))}
                </td>
                <td className="px-4 py-4">
                  <Badge
                    tone={
                      trial.status === "RECRUITING"
                        ? "teal"
                        : trial.status === "TERMINATED"
                          ? "red"
                          : "neutral"
                    }
                  >
                    {prettyEnum(trial.status)}
                  </Badge>
                </td>
                <td className="min-w-44 px-4 py-4">
                  <span className="block text-[#0b292f]">{trial.sponsor}</span>
                  <small className="mt-1 block text-[9px] uppercase tracking-wide text-[#829193]">
                    {prettyEnum(trial.sponsorClass)}
                  </small>
                </td>
                <td className="whitespace-nowrap px-4 py-4">
                  {shortDate(trial.primaryCompletionDate)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Pagination
        page={page}
        total={filtered.length}
        pageSize={pageSize}
        onPage={setPage}
        label="studies"
      />
      <TrialDrawer trial={selected} onClose={() => setSelected(null)} />
    </section>
  );
}

function Filter({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[][];
}) {
  return (
    <label className="rounded-md border border-[#dbe5e1] bg-white px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.08em] text-[#718587]">
      {label}
      <select
        className="mt-1 block w-full border-0 bg-transparent text-[12px] font-semibold normal-case tracking-normal text-[#0b292f] outline-none"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        {options.map(([optionValue, optionLabel]) => (
          <option key={optionValue} value={optionValue}>
            {optionLabel}
          </option>
        ))}
      </select>
    </label>
  );
}
