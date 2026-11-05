import { ArrowRight, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import { TargetMatrix } from "../components/intelligence/TargetMatrix";
import { Badge } from "../components/ui/Badge";
import { MetricCard } from "../components/ui/MetricCard";
import { SectionHeading } from "../components/ui/SectionHeading";
import { SourceNote } from "../components/ui/SourceNote";
import { SourceStatus } from "../components/ui/SourceStatus";
import { useAppData } from "../context/AppDataContext";
import { prettyEnum, shortDate, snapshotDate } from "../lib/format";
export function OverviewPage() {
  const { summary, strategic, changes, regulatory } = useAppData();
  return (
    <section className="mx-auto max-w-[1200px] px-6 py-12 sm:py-16">
      <h1 className="max-w-4xl text-balance [font-family:Newsreader] text-4xl font-medium leading-[1.05] tracking-[-0.03em] sm:text-6xl">
        Multiple myeloma trials and{" "}
        <span className="text-[#91a0ff]">research updates.</span>
      </h1>
      <p className="mt-5 max-w-2xl text-base leading-7 text-[#9ba3aa]">
        Explore active studies by therapy and target, and see what changed in
        the latest registry refresh.
      </p>
      <div className="mt-6 flex flex-wrap gap-3">
        <Link
          to="/trials"
          className="inline-flex items-center gap-2 rounded-md bg-[#788aff] px-4 py-3 text-xs font-bold text-[#090b0e] no-underline"
        >
          Explore studies <ArrowRight size={15} />
        </Link>
        <Link
          to="/pipeline"
          className="rounded-md border border-white/15 px-4 py-3 text-xs font-bold text-[#d9deee] no-underline"
        >
          Browse therapies and targets
        </Link>
      </div>
      <div className="my-10 grid overflow-hidden rounded-lg border border-white/10 sm:grid-cols-3">
        <MetricCard
          label="Active interventional studies"
          value={summary.activeTrialCount.toLocaleString()}
          note="Four active registry statuses"
          accent
        />
        <MetricCard
          label="Currently recruiting"
          value={summary.recruitingTrialCount.toLocaleString()}
          note="Recruiting interventional studies"
        />
        <MetricCard
          label="Phase 3 completion dates"
          value={strategic.lateStageMilestones.length}
          note="Registered dates within 18 months"
        />
      </div>
      <SourceStatus ids={["clinicaltrials"]} />
      <div className="mt-12 grid gap-10 lg:grid-cols-[1.4fr_1fr]">
        <div>
          <SectionHeading
            title="Recent registry changes"
            copy="Changes observed between accepted snapshots. Registry dates and observation dates can differ."
          />
          {changes.slice(0, 6).map((change) => (
            <article key={change.id} className="border-t border-white/10 py-5">
              <div className="flex flex-wrap items-center gap-3">
                <Badge tone="blue">{prettyEnum(change.type)}</Badge>
                <span className="text-[11px] text-[#9ba3aa]">
                  Registry: {shortDate(change.date)} · Observed:{" "}
                  {snapshotDate(change.observedAt)}
                </span>
              </div>
              <h3 className="mt-3 text-sm font-bold leading-6">
                {change.title}
              </h3>
              <p className="mt-2 text-xs leading-6 text-[#9ba3aa]">
                {change.detail}
              </p>
              <div className="mt-3 flex gap-4 text-xs">
                <Link
                  className="text-[#91a0ff]"
                  to={`/trials?status=ALL&study=${change.nctId}`}
                >
                  Study details
                </Link>
                <a
                  href={change.sourceUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-[#91a0ff]"
                >
                  Source record <ExternalLink size={12} />
                </a>
              </div>
            </article>
          ))}
        </div>
        <aside>
          <SectionHeading
            title="Upcoming Phase 3 dates"
            copy="Registered primary-completion dates, which may change. They are not expected results-release dates."
          />
          {strategic.lateStageMilestones.slice(0, 5).map((item) => (
            <article key={item.nctId} className="border-t border-white/10 py-5">
              <p className="text-xs font-bold text-[#91a0ff]">
                {shortDate(item.date)}
              </p>
              <Link
                to={`/trials?status=ALL&study=${item.nctId}`}
                className="mt-2 block text-sm font-semibold leading-6 text-[#e3e7ef] no-underline"
              >
                {item.title}
              </Link>
              <p className="mt-2 text-xs text-[#9ba3aa]">{item.sponsor}</p>
            </article>
          ))}
          {!strategic.lateStageMilestones.length && (
            <p className="text-sm text-[#9ba3aa]">
              No matching dates are reported in this snapshot.
            </p>
          )}
          <Link
            className="mt-4 inline-flex items-center gap-2 text-xs text-[#91a0ff]"
            to="/trials?phase=PHASE3&sort=completion"
          >
            Explore Phase 3 studies <ArrowRight size={13} />
          </Link>
        </aside>
      </div>
      <div className="mt-14">
        <SectionHeading
          title="Studies by target family"
          copy="Distinct active studies containing a classified intervention. Combination studies can appear in multiple rows; background and comparator therapies are included."
        />
        <TargetMatrix rows={strategic.targetLandscape} />
        <SourceNote>
          Mappings describe recorded interventions, including background
          treatments. Counts do not measure clinical benefit or development
          success.
        </SourceNote>
      </div>
      <div className="mt-12 rounded-lg border border-white/10 p-6">
        <h2 className="text-lg font-semibold">FDA approval notifications</h2>
        <SourceStatus ids={["fda"]} />
        {regulatory[0] && (
          <>
            <p className="mt-4 text-xs text-[#9ba3aa]">
              Latest listed notice · {shortDate(regulatory[0].date)}
            </p>
            <Link
              to="/regulatory"
              className="mt-2 block text-sm font-semibold text-[#91a0ff]"
            >
              {regulatory[0].title}
            </Link>
          </>
        )}
      </div>
    </section>
  );
}
