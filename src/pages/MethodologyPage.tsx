import { Database, GitCompareArrows, ShieldCheck, Target } from "lucide-react";
import { PageIntro } from "../components/ui/PageIntro";
import { useAppData } from "../context/AppDataContext";

export function MethodologyPage() {
  const { summary } = useAppData();
  const principles = [
    [
      Database,
      "Six public systems",
      "Trials come from ClinicalTrials.gov; approvals and shortages from FDA; citations from PubMed; awards from NIH; labels from DailyMed; and European status from EMA.",
    ],
    [
      Target,
      "Transparent ontology",
      "Reviewed aliases connect interventions to canonical assets, targets, and modalities. Unknown development codes remain unresolved rather than being merged without evidence.",
    ],
    [
      GitCompareArrows,
      "Cross-source screening",
      "Crowding, momentum, concentration, and catalyst signals combine comparable public fields. They are directional screening metrics—not forecasts or product rankings.",
    ],
    [
      ShieldCheck,
      "Fail-closed refreshes",
      "Validation checks counts, identifiers, references, source freshness, and required fields. A failed refresh does not replace the last accepted production snapshot.",
    ],
  ] as const;
  return (
    <section className="mx-auto max-w-[920px] px-6 py-16">
      <PageIntro
        eyebrow="Trust and methodology"
        title="Every insight should survive a source check"
        copy="The product separates retrieved facts, deterministic classifications, derived screening metrics, and interpretation."
      />
      <div className="grid gap-3 sm:grid-cols-2">
        {principles.map(([Icon, title, copy]) => (
          <article
            className="rounded-lg border border-[#dbe5e1] bg-white p-6"
            key={title}
          >
            <Icon className="text-[#158c77]" size={22} />
            <h2 className="mt-5 text-sm font-bold text-[#0b292f]">{title}</h2>
            <p className="mt-2 text-xs leading-6 text-[#65797b]">{copy}</p>
          </article>
        ))}
      </div>
      <section className="mt-12">
        <h2 className="[font-family:Newsreader] text-[30px] font-medium text-[#0b292f]">
          Current data contract
        </h2>
        <dl className="mt-4 overflow-hidden rounded-lg border border-[#dbe5e1] bg-white">
          {[
            ["Disease query", summary.methodology.query],
            ["Scope", summary.methodology.scope],
            ["Primary trial source", "ClinicalTrials.gov API v2"],
            ["Dataset version", summary.datasetVersion],
            ["Retrieved", new Date(summary.sourceRetrievedAt).toLocaleString()],
          ].map(([label, value]) => (
            <div
              className="grid gap-2 border-t border-[#e3eae6] p-4 first:border-t-0 sm:grid-cols-[180px_1fr]"
              key={label}
            >
              <dt className="text-[10px] font-bold uppercase tracking-[0.08em] text-[#7e8f91]">
                {label}
              </dt>
              <dd className="text-xs font-semibold leading-5 text-[#0b292f]">
                {value}
              </dd>
            </div>
          ))}
        </dl>
      </section>
      <div className="mt-6 flex gap-4 rounded-lg bg-[#102e33] p-6 text-white">
        <ShieldCheck className="shrink-0 text-[#8fe3c5]" size={23} />
        <div>
          <h2 className="text-sm font-bold">Appropriate use</h2>
          <p className="mt-1 text-xs leading-6 text-[#adc2c2]">
            This application supports public-data landscape exploration and
            strategic screening. It is not medical advice, clinical decision
            support, regulatory advice, market-share reporting, investment
            advice, or a validated commercial intelligence product. Registry and
            regulatory records may be incomplete, delayed, or revised by their
            source owners.
          </p>
        </div>
      </div>
    </section>
  );
}
