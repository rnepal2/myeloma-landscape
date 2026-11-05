import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { TrialDrawer } from "../components/trials/TrialDrawer";
import { Badge } from "../components/ui/Badge";
import { PageIntro } from "../components/ui/PageIntro";
import { Pagination } from "../components/ui/Pagination";
import { SearchBox } from "../components/ui/SearchBox";
import { useAppData } from "../context/AppDataContext";
import {
  activeStatuses,
  csvCell,
  prettyEnum,
  shortDate,
  targetFamily,
} from "../lib/format";

export function TrialsPage() {
  const { trials, assets, summary } = useAppData();
  const [params, setParams] = useSearchParams();
  const [page, setPage] = useState(1);
  const query = params.get("query") ?? "";
  const status = params.get("status") ?? "ACTIVE";
  const phase = params.get("phase") ?? "ALL";
  const target = params.get("target") ?? "ALL";
  const modality = params.get("modality") ?? "ALL";
  const country = params.get("country") ?? "ALL";
  const sort = params.get("sort") ?? "updated";
  const assetId = params.get("asset");
  const asset = assets.find((item) => item.id === assetId);
  const assetIds = useMemo(
    () => (asset ? new Set(asset.trialIds) : null),
    [asset],
  );
  const selected =
    trials.find((item) => item.nctId === params.get("study")) ?? null;
  const update = (key: string, value: string) => {
    setParams(
      (current) => {
        const next = new URLSearchParams(current);
        if (!value || (value === "ALL" && key !== "status")) next.delete(key);
        else next.set(key, value);
        if (key !== "study") next.delete("study");
        return next;
      },
      { replace: key === "query" },
    );
  };
  const countries = (trial: (typeof trials)[number]) =>
    trial.countries ??
    trial.locations.flatMap((item) => (item.country ? [item.country] : []));
  const targets = [
    ...new Set(
      trials.flatMap((trial) =>
        trial.interventions.map((item) => targetFamily(item.target)),
      ),
    ),
  ]
    .filter((item) => item !== "Unclassified")
    .sort();
  const modalities = [
    ...new Set(
      trials.flatMap((trial) =>
        trial.interventions.flatMap((item) =>
          item.modality ? [item.modality] : [],
        ),
      ),
    ),
  ].sort();
  const countryOptions = [...new Set(trials.flatMap(countries))].sort();
  const filtered = useMemo(() => {
    const rows = trials.filter((trial) => {
      const haystack =
        `${trial.nctId} ${trial.title} ${trial.sponsor} ${trial.interventions.map((item) => `${item.name} ${item.canonicalName}`).join(" ")}`.toLowerCase();
      const statusMatches =
        status === "ALL" ||
        (status === "ACTIVE"
          ? trial.studyType === "INTERVENTIONAL" &&
            activeStatuses.has(trial.status)
          : trial.status === status);
      return (
        (!assetId || Boolean(assetIds?.has(trial.nctId))) &&
        (!query || haystack.includes(query.toLowerCase())) &&
        statusMatches &&
        (phase === "ALL" || trial.phases.includes(phase)) &&
        (target === "ALL" ||
          trial.interventions.some(
            (item) => targetFamily(item.target) === target,
          )) &&
        (modality === "ALL" ||
          trial.interventions.some((item) => item.modality === modality)) &&
        (country === "ALL" || countries(trial).includes(country))
      );
    });
    return rows.sort((a, b) =>
      sort === "completion"
        ? (a.primaryCompletionDate || "9999").localeCompare(
            b.primaryCompletionDate || "9999",
          ) || a.nctId.localeCompare(b.nctId)
        : (b.lastUpdated ?? "").localeCompare(a.lastUpdated ?? "") ||
          a.nctId.localeCompare(b.nctId),
    );
  }, [
    trials,
    query,
    status,
    phase,
    target,
    modality,
    country,
    sort,
    assetId,
    assetIds,
  ]);
  const pageSize = 15;
  const pageItems = filtered.slice((page - 1) * pageSize, page * pageSize);
  useEffect(
    () => setPage(1),
    [query, status, phase, target, modality, country, sort, assetId],
  );
  useEffect(() => {
    const focusSearch = (event: KeyboardEvent) => {
      const element = document.activeElement;
      if (
        event.key === "/" &&
        !(element instanceof HTMLInputElement) &&
        !(element instanceof HTMLTextAreaElement)
      ) {
        event.preventDefault();
        document
          .querySelector<HTMLInputElement>('input[placeholder^="Search trial"]')
          ?.focus();
      }
    };
    addEventListener("keydown", focusSearch);
    return () => removeEventListener("keydown", focusSearch);
  }, []);
  const close = () => update("study", "");
  const exportCsv = () => {
    const header = [
      "NCT ID",
      "Title",
      "Status",
      "Phases",
      "Lead sponsor",
      "Primary completion",
      "Registry updated",
      "Source retrieved",
      "Dataset version",
      "Source URL",
    ];
    const rows = filtered.map((trial) => [
      trial.nctId,
      trial.title,
      trial.status,
      trial.phases.map(prettyEnum).join("; "),
      trial.sponsor,
      trial.primaryCompletionDate ?? "",
      trial.lastUpdated ?? "",
      summary.sourceRetrievedAt,
      summary.datasetVersion,
      trial.sourceUrl,
    ]);
    const blob = new Blob(
      [
        "\uFEFF" +
          [header, ...rows]
            .map((row) => row.map(csvCell).join(","))
            .join("\r\n"),
      ],
      { type: "text/csv;charset=utf-8" },
    );
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "myeloma-studies.csv";
    link.click();
    URL.revokeObjectURL(url);
  };
  return (
    <section className="mx-auto max-w-[1200px] px-6 py-16">
      <PageIntro
        title="Explore myeloma studies"
        copy="Find registry records by therapy, target, phase, status or country. Open a study to review its details and original ClinicalTrials.gov record."
      />
      {assetId && (
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-[#788aff]/30 bg-[#788aff]/[.06] p-4 text-sm">
          <span>
            Linked studies for{" "}
            <strong>{asset?.name ?? "an unknown intervention"}</strong>
            {!asset &&
              ". This saved intervention is not present in the current snapshot."}
          </span>
          <button
            className="text-xs font-bold text-[#91a0ff]"
            onClick={() => update("asset", "")}
          >
            Clear therapy selection
          </button>
        </div>
      )}
      <div className="grid gap-2.5 md:grid-cols-[1fr_190px_170px]">
        <SearchBox
          value={query}
          onChange={(value) => update("query", value)}
          placeholder="Search trial, sponsor, intervention, or NCT ID"
        />
        <Filter
          label="Status"
          value={status}
          onChange={(value) => update("status", value)}
          options={[
            ["ACTIVE", "Active interventional"],
            ["ALL", "All statuses"],
            ...[
              "RECRUITING",
              "ACTIVE_NOT_RECRUITING",
              "NOT_YET_RECRUITING",
              "ENROLLING_BY_INVITATION",
              "COMPLETED",
              "TERMINATED",
              "SUSPENDED",
              "WITHDRAWN",
              "UNKNOWN",
            ].map((item) => [item, prettyEnum(item)]),
          ]}
        />
        <Filter
          label="Phase"
          value={phase}
          onChange={(value) => update("phase", value)}
          options={[
            ["ALL", "All phases"],
            ...[
              "EARLY_PHASE1",
              "PHASE1",
              "PHASE2",
              "PHASE3",
              "PHASE4",
              "NA",
            ].map((item) => [item, prettyEnum(item)]),
          ]}
        />
      </div>
      <div className="mt-2.5 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
        <Filter
          label="Target family"
          value={target}
          onChange={(value) => update("target", value)}
          options={[
            ["ALL", "All targets"],
            ...targets.map((item) => [item, item]),
          ]}
        />
        <Filter
          label="Modality"
          value={modality}
          onChange={(value) => update("modality", value)}
          options={[
            ["ALL", "All modalities"],
            ...modalities.map((item) => [item, item]),
          ]}
        />
        <Filter
          label="Registered country"
          value={country}
          onChange={(value) => update("country", value)}
          options={[
            ["ALL", "All countries"],
            ...countryOptions.map((item) => [item, item]),
          ]}
        />
        <Filter
          label="Sort"
          value={sort}
          onChange={(value) => update("sort", value)}
          options={[
            ["updated", "Recently updated"],
            ["completion", "Primary completion date"],
          ]}
        />
      </div>
      <div className="my-4 flex flex-wrap items-center justify-between gap-3 text-xs text-[#718587]">
        <p>
          <strong className="text-[#0b292f]">
            {filtered.length.toLocaleString()}
          </strong>{" "}
          matching studies · filters are included in this page’s URL
        </p>
        <div className="flex gap-4">
          <button
            className="font-bold text-[#91a0ff]"
            onClick={() => setParams({})}
          >
            Reset filters
          </button>
          <button
            disabled={!filtered.length}
            className="font-bold text-[#91a0ff] disabled:opacity-40"
            onClick={exportCsv}
          >
            Export these studies
          </button>
        </div>
      </div>
      <p className="mb-4 text-xs leading-5 text-[#718587]">
        Active means recruiting, active but not recruiting, not yet recruiting,
        or enrolling by invitation. Country filters describe registered sites,
        not confirmed local availability. Target and modality matches can refer
        to any study arm, including comparators.
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
                className="border-t border-[#e5ebe8] text-xs text-[#5e7376] hover:bg-[#f1f7f3]"
                key={trial.nctId}
              >
                <td className="min-w-[350px] px-4 py-4">
                  <span className="mb-1 block text-[10px] font-extrabold text-[#158c77]">
                    {trial.nctId}
                  </span>
                  <button
                    className="block max-w-xl text-left text-[13px] font-bold leading-5 text-[#0b292f] underline decoration-transparent underline-offset-4 hover:decoration-current focus-visible:outline-2 focus-visible:outline-[#91a0ff]"
                    onClick={() => update("study", trial.nctId)}
                  >
                    {trial.title}
                  </button>
                  <small className="mt-1 block text-[11px] text-[#829193]">
                    {[
                      ...new Set(
                        trial.interventions.map((item) => item.canonicalName),
                      ),
                    ]
                      .slice(0, 3)
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
        {!filtered.length && (
          <p className="p-8 text-center text-sm text-[#718587]">
            No studies match these filters. Broaden your selection or reset the
            filters.
          </p>
        )}
      </div>
      <Pagination
        page={page}
        total={filtered.length}
        pageSize={pageSize}
        onPage={setPage}
        label="studies"
      />
      <TrialDrawer trial={selected} onClose={close} />
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
        className="mt-1 block w-full border-0 bg-transparent text-[12px] font-semibold normal-case tracking-normal text-[#0b292f] outline-none focus-visible:outline-2 focus-visible:outline-[#91a0ff]"
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
