import {
  Activity,
  ArrowRight,
  ExternalLink,
  FlaskConical,
  GitCompareArrows,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { Link } from "react-router-dom";
import { StrategicSignalCard } from "../components/intelligence/StrategicSignalCard";
import { TargetMatrix } from "../components/intelligence/TargetMatrix";
import { Badge } from "../components/ui/Badge";
import { MetricCard } from "../components/ui/MetricCard";
import { SectionHeading } from "../components/ui/SectionHeading";
import { SourceNote } from "../components/ui/SourceNote";
import { useAppData } from "../context/AppDataContext";
import { prettyEnum, shortDate } from "../lib/format";

export function OverviewPage() {
  const { summary, strategic, changes, regulatory } = useAppData();
  const activeTargetAssets = strategic.targetLandscape.reduce(
    (sum, item) => sum + item.activeAssets,
    0,
  );
  return (
    <>
      <section className="relative overflow-hidden bg-[#09272d] text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_15%,rgba(80,204,163,0.16),transparent_32%),linear-gradient(120deg,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[size:auto,42px_42px]" />
        <div className="relative mx-auto grid min-h-[550px] max-w-[1200px] items-center gap-10 px-6 py-7 lg:grid-cols-[1.35fr_.65fr]">
          <div>
            <span className="mb-5 inline-flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-[0.14em] text-[#8fe3c5]">
              <Sparkles size={14} />
              Myeloma Landscape
            </span>
            <h1 className="max-w-3xl text-balance [font-family:Newsreader] text-5xl font-medium leading-[.98] tracking-[-0.04em] sm:text-6xl">
              Public records, organized across the{" "}
              <em className="text-[#8fe3c5]">myeloma landscape.</em>
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-7 text-[#b8cece]">
              A structured view of registered trials, classified therapies,
              publications, NIH funding, regulatory actions, labels, and supply
              records from six public systems.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                className="inline-flex items-center gap-2 rounded-md bg-[#b8f0db] px-4 py-3 text-xs font-extrabold text-[#09272d] no-underline hover:bg-white"
                to="/pipeline"
              >
                Explore pipeline data
                <ArrowRight size={15} />
              </Link>
              <Link
                className="inline-flex items-center rounded-md border border-white/20 bg-white/5 px-4 py-3 text-xs font-bold text-white no-underline hover:bg-white/10"
                to="/methodology"
              >
                Review methodology
              </Link>
            </div>
            <div className="mt-7 flex flex-wrap items-center gap-2 text-[10px] text-[#91aaab]">
              <strong className="text-[#8fe3c5]">Six public systems</strong>
              <i className="size-1 rounded-full bg-[#6f898b]" />
              ClinicalTrials.gov
              <i className="size-1 rounded-full bg-[#6f898b]" />
              FDA
              <i className="size-1 rounded-full bg-[#6f898b]" />
              PubMed
              <i className="size-1 rounded-full bg-[#6f898b]" />
              NIH
              <i className="size-1 rounded-full bg-[#6f898b]" />
              DailyMed
              <i className="size-1 rounded-full bg-[#6f898b]" />
              EMA
            </div>
          </div>
          <aside className="rounded-xl border border-white/10 bg-white/[0.06] p-5 shadow-2xl backdrop-blur">
            <span className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-[#8fe3c5]">
              Current snapshot
            </span>
            <div className="mt-5 space-y-5">
              {strategic.landscapeMeasures.slice(0, 3).map((signal) => (
                <div
                  className="border-b border-white/10 pb-5 last:border-0 last:pb-0"
                  key={signal.id}
                >
                  <strong className="block [font-family:Newsreader] text-2xl font-medium text-white">
                    {signal.metric}
                  </strong>
                  <p className="mt-1 text-xs font-bold leading-5 text-[#d2e1df]">
                    {signal.title}
                  </p>
                  <span className="mt-1 block text-[10px] uppercase tracking-[0.08em] text-[#819c9d]">
                    {signal.theme}
                  </span>
                </div>
              ))}
            </div>
          </aside>
        </div>
      </section>

      <section className="relative z-10 mx-auto -mt-9 grid max-w-[1200px] overflow-hidden rounded-lg shadow-[0_18px_45px_rgba(23,61,52,0.12)] sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          label="Active interventional trials"
          value={summary.activeTrialCount.toLocaleString()}
          note={`${summary.recruitingTrialCount.toLocaleString()} currently recruiting`}
          accent
        />
        <MetricCard
          label="Classified active assets"
          value={activeTargetAssets}
          note={`Across ${strategic.targetLandscape.length} target families`}
        />
        <MetricCard
          label="Phase 3 completion dates"
          value={strategic.lateStageMilestones.length}
          note="Registry dates inside 18 months"
        />
        <MetricCard
          label="Registered site coverage"
          value={strategic.geographicFootprint.length}
          note="Countries with active registered sites"
        />
      </section>

      <section className="mx-auto max-w-[1200px] px-6 pb-8 pt-24">
        <SectionHeading
          eyebrow="Landscape measures"
          title="Six current measures from the refreshed dataset"
          copy="Each card reports a defined count, share, amount, or date window from the public-source records described in the methodology."
        />
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {strategic.landscapeMeasures.map((signal) => (
            <StrategicSignalCard key={signal.id} signal={signal} />
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-[1200px] px-6 py-14">
        <SectionHeading
          eyebrow="Target-level source comparison"
          title="Registered activity and source-linked research counts"
          copy="Rows align active trial, classified asset, lead-sponsor, PubMed, and NIH project counts by reviewed target family. Counts describe different source records and are not additive."
          action={
            <Link
              className="hidden items-center gap-1.5 text-xs font-bold text-[#158c77] no-underline hover:text-[#0b292f] sm:flex"
              to="/pipeline"
            >
              Open pipeline detail
              <ArrowRight size={14} />
            </Link>
          }
        />
        <TargetMatrix rows={strategic.targetLandscape.slice(0, 7)} />
        <SourceNote>{strategic.methodology}</SourceNote>
      </section>

      <section className="mx-auto grid max-w-[1200px] gap-12 px-6 py-16 lg:grid-cols-[1.55fr_.8fr]">
        <div>
          <SectionHeading
            eyebrow="Change monitor"
            title="Recent registry changes"
            copy="Up to four recent status changes or record updates are shown from the accepted refresh history. The feed does not interpret study outcomes."
          />
          {changes.slice(0, 4).map((change) => (
            <article
              className="grid grid-cols-[44px_1fr] gap-4 border-t border-[#dbe5e1] py-5"
              key={change.id}
            >
              <span
                className={`grid size-10 place-items-center rounded-full ${change.severity === "high" ? "bg-[#fff0d6] text-[#8d590c]" : "bg-[#e4eef1] text-[#456e78]"}`}
              >
                {change.type === "STATUS_CHANGE" ? (
                  <GitCompareArrows size={18} />
                ) : change.type === "NEW_STUDY" ? (
                  <FlaskConical size={18} />
                ) : (
                  <Activity size={18} />
                )}
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <Badge tone={change.severity === "high" ? "amber" : "blue"}>
                    {change.type === "STATUS_CHANGE"
                      ? "Status change"
                      : change.type === "NEW_STUDY"
                        ? "New study"
                        : "Record update"}
                  </Badge>
                  <span className="text-[10px] text-[#7b8d8f]">
                    {shortDate(change.date)}
                  </span>
                </div>
                <h3 className="mt-2 text-pretty text-[15px] font-bold leading-5 text-[#0b292f]">
                  {change.title}
                </h3>
                <p className="mt-1.5 text-xs leading-5 text-[#65797b]">
                  {change.detail}
                </p>
                <a
                  className="mt-2 inline-flex items-center gap-1 text-[11px] font-bold text-[#158c77] no-underline"
                  href={change.sourceUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  Source record
                  <ExternalLink size={12} />
                </a>
              </div>
            </article>
          ))}
        </div>
        <aside className="space-y-4">
          <div className="rounded-lg bg-[#102e33] p-6 text-white">
            <span className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-[#8fe3c5]">
              Registry date horizon
            </span>
            <h2 className="mt-2 [font-family:Newsreader] text-2xl font-medium">
              Upcoming primary-completion dates
            </h2>
            <div className="mt-5">
              {summary.upcomingMilestones.slice(0, 4).map((milestone) => (
                <div
                  className="grid grid-cols-[48px_1fr] gap-3 border-t border-white/10 py-4"
                  key={milestone.nctId}
                >
                  <div>
                    <strong className="block text-sm text-[#8fe3c5]">
                      {new Date(
                        `${milestone.date.slice(0, 7)}-01`,
                      ).toLocaleString("en-US", { month: "short" })}
                    </strong>
                    <span className="text-[10px] text-[#8ca5a7]">
                      {milestone.date.slice(0, 4)}
                    </span>
                  </div>
                  <div>
                    <Badge>{prettyEnum(milestone.phase)}</Badge>
                    <h3 className="mt-2 text-xs font-bold leading-5">
                      {milestone.title}
                    </h3>
                    <span className="mt-1 block text-[10px] text-[#8ca5a7]">
                      {milestone.sponsor}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <SourceNote dark>
              Registry dates are sponsor estimates and should be monitored for
              revision.
            </SourceNote>
          </div>
          <div className="rounded-lg border border-[#dbe5e1] bg-white p-6">
            <ShieldCheck className="float-right text-[#158c77]" size={24} />
            <span className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-[#158c77]">
              Latest FDA action
            </span>
            <h2 className="mt-3 [font-family:Newsreader] text-[22px] font-medium leading-7 text-[#0b292f]">
              {regulatory[0]?.title}
            </h2>
            <p className="mt-2 text-xs leading-5 text-[#65797b]">
              {regulatory[0]?.detail}
            </p>
            <Link
              className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-[#158c77] no-underline"
              to="/regulatory"
            >
              Review regulatory context
              <ArrowRight size={14} />
            </Link>
          </div>
        </aside>
      </section>
    </>
  );
}
