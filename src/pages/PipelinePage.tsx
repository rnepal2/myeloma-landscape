import { ArrowRight, ExternalLink, Target } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { SponsorLeaderboard } from "../components/intelligence/SponsorLeaderboard";
import { Badge } from "../components/ui/Badge";
import { PageIntro } from "../components/ui/PageIntro";
import { Pagination } from "../components/ui/Pagination";
import { SearchBox } from "../components/ui/SearchBox";
import { SectionHeading } from "../components/ui/SectionHeading";
import { SourceNote } from "../components/ui/SourceNote";
import { useAppData } from "../context/AppDataContext";
import { activeStatuses, prettyEnum, targetFamily } from "../lib/format";
import type { Asset, Trial } from "../types";

export function PipelinePage() {
  const { summary, trials, assets, strategic } = useAppData();
  const [query, setQuery] = useState("");
  const [target, setTarget] = useState("CLASSIFIED");
  const [page, setPage] = useState(1);
  const pageSize = 9;
  const targetChart = [...strategic.targetLandscape].sort(
    (a, b) => b.activeTrials - a.activeTrials,
  );
  const targets = [
    ...new Set(
      assets
        .filter(
          (asset) =>
            asset.activeTrialCount > 0 && asset.target !== "Unclassified",
        )
        .map((asset) => targetFamily(asset.target)),
    ),
  ].sort();
  const filtered = assets.filter(
    (asset) =>
      asset.activeTrialCount > 0 &&
      (target === "ALL" ||
        (target === "CLASSIFIED" && asset.target !== "Unclassified") ||
        targetFamily(asset.target) === target) &&
      `${asset.name} ${asset.aliases.join(" ")} ${asset.target} ${asset.modality}`
        .toLowerCase()
        .includes(query.toLowerCase()),
  );
  const pageItems = filtered.slice((page - 1) * pageSize, page * pageSize);
  const trialById = useMemo(
    () => new Map(trials.map((trial) => [trial.nctId, trial])),
    [trials],
  );
  useEffect(() => setPage(1), [query, target]);
  return (
    <section className="mx-auto max-w-[1200px] px-6 py-16">
      <PageIntro
        title="Find studies by therapy or target"
        copy="Explore therapies and registered intervention names linked to active myeloma studies. Counts include all study arms, including background treatment and comparators."
      />
      <section className="mb-10">
        <SectionHeading
          title="Active study counts"
          copy="The phase chart and target counts describe active interventional studies. A study may report multiple phases or include several targets."
        />
        <div className="grid gap-4 lg:grid-cols-2">
          <article className="rounded-lg border border-[#dbe5e1] bg-white p-6">
            <h2 className="text-[15px] font-bold text-[#0b292f]">
              Studies by phase
            </h2>
            <p className="mt-2 text-xs leading-5 text-[#65797b]">
              Phase 1/2 studies appear in both phase counts.
            </p>
            <div className="mt-5 h-72">
              <ResponsiveContainer>
                <BarChart data={summary.countsByPhase}>
                  <CartesianGrid
                    stroke="#2a3036"
                    strokeDasharray="3 3"
                    vertical={false}
                  />
                  <XAxis
                    axisLine={false}
                    dataKey="name"
                    tick={{ fill: "#9ba3aa", fontSize: 10 }}
                    tickLine={false}
                  />
                  <YAxis
                    axisLine={false}
                    tick={{ fill: "#9ba3aa", fontSize: 11 }}
                    tickLine={false}
                  />
                  <Tooltip cursor={{ fill: "#191e23" }} />
                  <Bar dataKey="value" fill="#788aff" radius={[5, 5, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </article>
          <article className="rounded-lg border border-[#dbe5e1] bg-white p-6">
            <h2 className="text-[15px] font-bold text-[#0b292f]">
              Studies by target family
            </h2>
            <p className="mt-2 text-xs leading-5 text-[#65797b]">
              Each study counts once per target family. Families overlap and do
              not form shares of a total.
            </p>
            <div className="mt-5 space-y-3">
              {targetChart.map((row) => (
                <Link
                  key={row.target}
                  to={`/trials?target=${encodeURIComponent(row.target)}&status=ACTIVE`}
                  className="grid grid-cols-[130px_1fr_34px] items-center gap-3 text-[11px] no-underline hover:text-[#91a0ff]"
                >
                  <span>{row.target}</span>
                  <span className="h-2 overflow-hidden rounded bg-white/5">
                    <span
                      className="block h-full rounded bg-[#788aff]"
                      style={{
                        width: `${(100 * row.activeTrials) / Math.max(1, targetChart[0]?.activeTrials ?? 1)}%`,
                      }}
                    />
                  </span>
                  <strong className="text-right">{row.activeTrials}</strong>
                </Link>
              ))}
            </div>
          </article>
        </div>
      </section>
      <div className="grid gap-2.5 sm:grid-cols-[1fr_260px]">
        <SearchBox
          value={query}
          onChange={setQuery}
          placeholder="Search therapy, intervention, target or modality"
        />
        <label className="rounded-md border border-[#dbe5e1] bg-white px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.08em] text-[#718587]">
          Target family
          <select
            className="mt-1 block w-full border-0 bg-transparent text-[12px] font-semibold normal-case tracking-normal text-[#0b292f] outline-none focus-visible:outline-2 focus-visible:outline-[#91a0ff]"
            value={target}
            onChange={(event) => setTarget(event.target.value)}
          >
            <option value="CLASSIFIED">Classified targets</option>
            <option value="ALL">
              All interventions, including unclassified
            </option>
            {targets.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </label>
      </div>
      <p className="my-4 text-xs leading-5 text-[#718587]">
        <strong className="text-[#0b292f]">
          {filtered.length.toLocaleString()}
        </strong>{" "}
        therapy and intervention entities with active studies. Aliases are
        merged where a reviewed mapping exists; remaining names can include
        regimens or dose variants and are not a count of distinct development
        programs.
      </p>
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {pageItems.map((asset) => {
          const sourceTrial = latestSourceTrial(asset, trialById);
          return (
            <article
              className="flex h-full flex-col rounded-lg border border-[#dbe5e1] bg-white p-5 transition hover:border-[#788aff]/50"
              key={asset.id}
            >
              <div className="flex items-center justify-between gap-3">
                <span className="grid size-9 place-items-center rounded-full bg-[#e4f3ed] text-[#158c77]">
                  <Target size={16} />
                </span>
                <Badge tone="blue">{prettyEnum(asset.highestPhase)}</Badge>
              </div>
              <h2 className="mt-4 text-pretty text-[15px] font-bold leading-5 text-[#0b292f]">
                {asset.name}
              </h2>
              <p className="mt-2 text-xs text-[#65797b]">
                {asset.modality} ·{" "}
                {asset.target === "Unclassified"
                  ? "Target not classified"
                  : asset.target}
              </p>
              <p className="mt-2 text-[10px] text-[#718587]">
                Highest phase among linked studies; not an approval status.
              </p>
              <div className="mt-auto flex gap-5 pt-5 text-[11px] text-[#718587]">
                <span>
                  <strong className="mr-1 text-sm text-[#0b292f]">
                    {asset.activeTrialCount}
                  </strong>
                  active studies
                </span>
                <span>
                  <strong className="mr-1 text-sm text-[#0b292f]">
                    {asset.recruitingTrialCount}
                  </strong>
                  recruiting
                </span>
              </div>
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-[#e3eae6] pt-3">
                <Link
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-[#158c77] no-underline hover:text-[#91a0ff]"
                  to={`/trials?asset=${encodeURIComponent(asset.id)}&status=ACTIVE`}
                >
                  View {asset.activeTrialCount} active{" "}
                  {asset.activeTrialCount === 1 ? "study" : "studies"}
                  <ArrowRight size={12} />
                </Link>
                {sourceTrial && (
                  <a
                    aria-label={`Open latest linked source study for ${asset.name}`}
                    className="inline-flex items-center gap-1 text-[10px] text-[#718587] no-underline hover:text-[#91a0ff]"
                    href={sourceTrial.sourceUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Latest source
                    <ExternalLink size={11} />
                  </a>
                )}
              </div>
            </article>
          );
        })}
      </div>
      {!filtered.length && (
        <p className="py-8 text-sm text-[#718587]">
          No interventions match this selection. Try another target or search
          term.
        </p>
      )}
      <Pagination
        page={page}
        total={filtered.length}
        pageSize={pageSize}
        onPage={setPage}
        label="interventions"
      />
      <section className="mt-16">
        <SectionHeading
          title="Lead sponsors"
          copy="Active studies grouped by their registered lead sponsor. These counts describe trial attribution, not medicine ownership or market share."
        />
        <div className="grid gap-4 lg:grid-cols-2">
          <SponsorLeaderboard
            kind="industry"
            title="Industry sponsors"
            subtitle="Registry industry classification"
            sponsors={strategic.industrySponsors.slice(0, 8)}
          />
          <SponsorLeaderboard
            kind="institution"
            title="Government, academic and other sponsors"
            subtitle="Registry non-industry classification"
            sponsors={strategic.institutionSponsors.slice(0, 8)}
          />
        </div>
      </section>
      <SourceNote>
        Studies are included by the documented disease query. Classification
        coverage is limited to reviewed aliases and target rules. An active
        study may be evaluating supportive care, diagnostics or a comparator
        rather than a new myeloma therapy.
      </SourceNote>
    </section>
  );
}

function latestSourceTrial(asset: Asset, trialById: Map<string, Trial>) {
  const linked = asset.trialIds.flatMap((id) =>
    trialById.has(id) ? [trialById.get(id)!] : [],
  );
  const active = linked.filter(
    (trial) =>
      trial.studyType === "INTERVENTIONAL" && activeStatuses.has(trial.status),
  );
  return (active.length ? active : linked).sort((a, b) =>
    (b.lastUpdated ?? "").localeCompare(a.lastUpdated ?? ""),
  )[0];
}
