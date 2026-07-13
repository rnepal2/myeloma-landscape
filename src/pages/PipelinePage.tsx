import { Building2, Target } from "lucide-react";
import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
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
import { prettyEnum } from "../lib/format";

const chartColors = [
  "#178c77",
  "#dca03b",
  "#4d7781",
  "#b65d55",
  "#809b9f",
  "#786d9a",
];

export function PipelinePage() {
  const { summary, assets, strategic } = useAppData();
  const [query, setQuery] = useState("");
  const [target, setTarget] = useState("ALL");
  const [page, setPage] = useState(1);
  const pageSize = 9;
  const targetChart = strategic.targetLandscape
    .slice(0, 6)
    .map((item) => ({ name: item.target, value: item.activeTrials }));
  const targets = [
    ...new Set(
      assets
        .filter(
          (asset) =>
            asset.activeTrialCount > 0 && asset.target !== "Unclassified",
        )
        .map((asset) => asset.target),
    ),
  ].sort();
  const filtered = assets.filter(
    (asset) =>
      asset.activeTrialCount > 0 &&
      (target === "ALL" || asset.target === target) &&
      `${asset.name} ${asset.target} ${asset.modality} ${asset.sponsors.join(" ")}`
        .toLowerCase()
        .includes(query.toLowerCase()),
  );
  const pageItems = filtered.slice((page - 1) * pageSize, page * pageSize);
  useEffect(() => setPage(1), [query, target]);

  return (
    <section className="mx-auto max-w-[1200px] px-6 py-16">
      <PageIntro
        eyebrow="Development landscape"
        title="Pipeline structure and sponsor activity"
        copy="A therapy-centric view of active interventional studies, target families, modalities, sponsors, and registered geographic activity."
      />
      <div className="grid gap-4 lg:grid-cols-[1.35fr_.8fr]">
        <article className="rounded-lg border border-[#dbe5e1] bg-white p-6">
          <h2 className="text-[15px] font-bold text-[#0b292f]">
            Active trial mix by development phase
          </h2>
          <p className="mt-1 text-xs text-[#65797b]">
            Active interventional studies may report more than one phase
            designation.
          </p>
          <div className="mt-5 h-72">
            <ResponsiveContainer>
              <BarChart data={summary.countsByPhase}>
                <CartesianGrid
                  stroke="#dfe6e4"
                  strokeDasharray="3 3"
                  vertical={false}
                />
                <XAxis
                  axisLine={false}
                  dataKey="name"
                  tick={{ fill: "#6b7d7f", fontSize: 11 }}
                  tickLine={false}
                />
                <YAxis
                  axisLine={false}
                  tick={{ fill: "#6b7d7f", fontSize: 11 }}
                  tickLine={false}
                />
                <Tooltip cursor={{ fill: "#f1f5f3" }} />
                <Bar dataKey="value" fill="#178c77" radius={[5, 5, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </article>
        <article className="rounded-lg border border-[#dbe5e1] bg-white p-6">
          <h2 className="text-[15px] font-bold text-[#0b292f]">
            Target-family distribution
          </h2>
          <p className="mt-1 text-xs text-[#65797b]">
            Unique active trials consolidated across target-specific modalities.
          </p>
          <div className="mt-4 grid items-center sm:grid-cols-[1fr_.85fr] lg:grid-cols-1 xl:grid-cols-[1fr_.85fr]">
            <div className="h-56">
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={targetChart}
                    dataKey="value"
                    innerRadius={55}
                    nameKey="name"
                    outerRadius={82}
                    paddingAngle={2}
                  >
                    {targetChart.map((_, index) => (
                      <Cell
                        fill={chartColors[index % chartColors.length]}
                        key={index}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2">
              {targetChart.map((item, index) => (
                <div
                  className="grid grid-cols-[8px_1fr_auto] items-center gap-2 text-[11px]"
                  key={item.name}
                >
                  <i
                    className="size-2 rounded-full"
                    style={{ background: chartColors[index] }}
                  />
                  <span>{item.name}</span>
                  <strong>{item.value}</strong>
                </div>
              ))}
            </div>
          </div>
        </article>
      </div>

      <div className="relative z-10 -mt-5 mb-16 grid overflow-hidden rounded-lg border border-white/10 bg-[#102e33] text-white shadow-xl md:grid-cols-3">
        <article className="border-b border-white/10 p-5 md:border-b-0 md:border-r">
          <span className="text-[10px] font-extrabold uppercase tracking-[0.1em] text-[#8fe3c5]">
            Top-five sponsor share
          </span>
          <strong className="mt-2 block [font-family:Newsreader] text-[28px] font-medium">
            {strategic.top5SponsorShare}%
          </strong>
          <p className="mt-1 text-[11px] text-[#a8bdbd]">
            of active interventional studies
          </p>
        </article>
        <article className="border-b border-white/10 p-5 md:border-b-0 md:border-r">
          <span className="text-[10px] font-extrabold uppercase tracking-[0.1em] text-[#8fe3c5]">
            Highest active-study lead-sponsor count
          </span>
          <strong className="mt-2 block [font-family:Newsreader] text-xl font-medium">
            {strategic.topSponsors[0]?.name}
          </strong>
          <p className="mt-1 text-[11px] text-[#a8bdbd]">
            {strategic.topSponsors[0]?.activeTrials} active trials
          </p>
        </article>
        <article className="p-5">
          <span className="text-[10px] font-extrabold uppercase tracking-[0.1em] text-[#8fe3c5]">
            Highest registered site count
          </span>
          <strong className="mt-2 block [font-family:Newsreader] text-xl font-medium">
            {strategic.geographicFootprint[0]?.country}
          </strong>
          <p className="mt-1 text-[11px] text-[#a8bdbd]">
            {strategic.geographicFootprint[0]?.activeTrials} active studies with
            a site
          </p>
        </article>
      </div>

      <SectionHeading
        eyebrow="Sponsor activity"
        title="Lead sponsors grouped by registry class"
        copy="ClinicalTrials.gov sponsor classifications are shown separately for industry and non-industry organizations. Counts are active interventional studies attributed to each lead sponsor."
      />
      <div className="mb-16 grid gap-4 lg:grid-cols-2">
        <SponsorLeaderboard
          kind="industry"
          title="Industry-sponsored development"
          subtitle="Industry-classified sponsors by active interventional study count"
          sponsors={strategic.industrySponsors.slice(0, 8)}
        />
        <SponsorLeaderboard
          kind="institution"
          title="Institutional research activity"
          subtitle="Non-industry sponsors, including government, academic, and network organizations"
          sponsors={strategic.institutionSponsors.slice(0, 8)}
        />
      </div>

      <SectionHeading
        eyebrow="Program explorer"
        title="Search active therapy and regimen entities"
        copy="Programs are normalized where reviewed aliases exist. Unresolved development codes remain separate to avoid false entity merges."
      />
      <div className="grid gap-2.5 sm:grid-cols-[1fr_240px]">
        <SearchBox
          value={query}
          onChange={setQuery}
          placeholder="Search asset, target, modality, or sponsor"
        />
        <label className="rounded-md border border-[#dbe5e1] bg-white px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.08em] text-[#718587]">
          Target
          <select
            className="mt-1 block w-full border-0 bg-transparent text-[12px] font-semibold normal-case tracking-normal text-[#0b292f] outline-none"
            value={target}
            onChange={(event) => setTarget(event.target.value)}
          >
            <option value="ALL">All classified targets</option>
            {targets.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </label>
      </div>
      <p className="my-3 text-xs text-[#718587]">
        <strong className="text-[#0b292f]">
          {filtered.length.toLocaleString()}
        </strong>{" "}
        active program entities
      </p>
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {pageItems.map((asset) => (
          <article
            className="rounded-lg border border-[#dbe5e1] bg-white p-5"
            key={asset.id}
          >
            <div className="flex items-start justify-between">
              <span className="grid size-9 place-items-center rounded-full bg-[#e4f3ed] text-[#158c77]">
                <Target size={16} />
              </span>
              <Badge tone="blue">{prettyEnum(asset.highestPhase)}</Badge>
            </div>
            <h3 className="mt-4 text-[15px] font-bold text-[#0b292f]">
              {asset.name}
            </h3>
            <p className="mt-1 text-[11px] text-[#65797b]">
              {asset.modality} · {asset.target}
            </p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {asset.sponsors.slice(0, 2).map((sponsor) => (
                <span
                  className="inline-flex items-center gap-1 rounded bg-[#f0f4f1] px-2 py-1 text-[9px] text-[#5f7476]"
                  key={sponsor}
                >
                  <Building2 size={11} />
                  {sponsor}
                </span>
              ))}
            </div>
            <div className="mt-5 flex gap-5 text-[10px] text-[#718587]">
              <span>
                <strong className="mr-1 text-sm text-[#0b292f]">
                  {asset.activeTrialCount}
                </strong>
                active
              </span>
              <span>
                <strong className="mr-1 text-sm text-[#0b292f]">
                  {asset.recruitingTrialCount}
                </strong>
                recruiting
              </span>
            </div>
          </article>
        ))}
      </div>
      <Pagination
        page={page}
        total={filtered.length}
        pageSize={pageSize}
        onPage={setPage}
        label="programs"
      />
      <SourceNote>
        Counts reflect the documented disease query and registered lead-sponsor
        attribution. They do not represent market share, development investment,
        or probability of success.
      </SourceNote>
    </section>
  );
}
