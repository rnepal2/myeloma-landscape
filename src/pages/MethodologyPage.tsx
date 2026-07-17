import {
  Database,
  ExternalLink,
  GitCompareArrows,
  RefreshCw,
  ShieldCheck,
  Target,
} from "lucide-react";
import { PageIntro } from "../components/ui/PageIntro";
import { useAppData } from "../context/AppDataContext";

const sources = [
  {
    name: "ClinicalTrials.gov",
    href: "https://clinicaltrials.gov/data-api/api",
    use: "Studies, sponsors, interventions, phases, statuses, dates, results flags, and registered locations",
    scope:
      "API v2 condition query for “Multiple Myeloma”; headline active counts are limited to interventional studies in four documented active statuses.",
  },
  {
    name: "PubMed",
    href: "https://pubmed.ncbi.nlm.nih.gov/",
    use: "Annual literature counts, target-linked query counts, and a browsable recent citation sample",
    scope:
      "Annual and recent-stream queries require the disease phrase in the citation title. Target counts use reviewed target and therapy terms in titles or abstracts over a three-year window.",
  },
  {
    name: "NIH RePORTER",
    href: "https://reporter.nih.gov/",
    use: "Project records, organizations, investigators, fiscal years, and award amounts",
    scope:
      "Projects require multiple myeloma in the project title and cover the current and two prior fiscal years.",
  },
  {
    name: "FDA",
    href: "https://www.fda.gov/drugs/resources-information-approved-drugs/oncology-cancerhematologic-malignancies-approval-notifications",
    use: "Oncology approval notifications and current oncology shortage records",
    scope:
      "Approval rows require a multiple-myeloma phrase. Shortages are current oncology records matched to reviewed therapy aliases and remain presentation-specific.",
  },
  {
    name: "DailyMed",
    href: "https://dailymed.nlm.nih.gov/dailymed/",
    use: "Structured Product Label versions for a reviewed therapy list",
    scope:
      "Records are retrieved by reviewed drug name and deduplicated by DailyMed set ID. The current label at DailyMed remains authoritative.",
  },
  {
    name: "European Medicines Agency",
    href: "https://www.ema.europa.eu/en/medicines",
    use: "Centrally managed medicine status, indication text, and record updates",
    scope:
      "Records require multiple myeloma in the therapeutic indication or plasma cell myeloma in the therapeutic-area field.",
  },
] as const;

export function MethodologyPage() {
  const { summary, evidence, market } = useAppData();
  const principles = [
    [
      Database,
      "Retrieved records",
      "Source fields and source URLs are retained in the generated datasets. Counts are scoped to the queries and filters documented on this page.",
    ],
    [
      Target,
      "Reviewed classification",
      "A version-controlled ontology connects known intervention aliases to canonical assets, target families, and modalities. Unmatched terms remain unclassified.",
    ],
    [
      GitCompareArrows,
      "Derived measures",
      "Shares, target activity indices, date windows, and cross-source rows are deterministic calculations. They describe the retrieved records and do not rank clinical or commercial value.",
    ],
    [
      ShieldCheck,
      "Fail-closed publication",
      "Required files, identifiers, references, source coverage, counts, and ranges are validated. A failed run does not replace the last accepted snapshot.",
    ],
  ] as const;

  return (
    <section className="mx-auto max-w-[1040px] px-6 py-16">
      <PageIntro
        title="How records are retrieved, classified, and summarized"
        copy="The site separates source records, reviewed classifications, and deterministic derived measures so that each displayed number has a defined scope."
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

      <section className="mt-14">
        <h2 className="m-0 [font-family:Newsreader] text-[32px] font-medium text-[#0b292f]">
          Public systems and retrieval scope
        </h2>
        <div className="mt-5 overflow-hidden rounded-lg border border-[#dbe5e1] bg-white">
          {sources.map((source) => (
            <article
              className="grid gap-3 border-t border-[#e3eae6] p-5 first:border-t-0 md:grid-cols-[190px_1fr]"
              key={source.name}
            >
              <a
                className="inline-flex items-center gap-1.5 self-start text-xs font-bold text-[#158c77] no-underline hover:text-[#0b292f]"
                href={source.href}
                rel="noreferrer"
                target="_blank"
              >
                {source.name}
                <ExternalLink size={12} />
              </a>
              <div>
                <p className="text-xs font-semibold leading-5 text-[#0b292f]">
                  {source.use}
                </p>
                <p className="mt-1 text-[11px] leading-5 text-[#718587]">
                  {source.scope}
                </p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-14 grid gap-5 lg:grid-cols-[1.05fr_.95fr]">
        <div>
          <h2 className="[font-family:Newsreader] text-[30px] font-medium text-[#0b292f]">
            Current data contract
          </h2>
          <dl className="mt-4 overflow-hidden rounded-lg border border-[#dbe5e1] bg-white">
            {[
              ["Disease query", summary.methodology.query],
              ["Trial scope", summary.methodology.scope],
              ["PubMed target window", evidence.targetCountWindow],
              ["Dataset version", summary.datasetVersion],
              [
                "Source retrieval",
                new Date(summary.sourceRetrievedAt).toLocaleString("en-US", {
                  timeZone: "America/New_York",
                  timeZoneName: "short",
                }),
              ],
              ["Refresh schedule", "Daily at 07:17 US Eastern time"],
            ].map(([label, value]) => (
              <div
                className="grid gap-2 border-t border-[#e3eae6] p-4 first:border-t-0 sm:grid-cols-[170px_1fr]"
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
        </div>
        <div>
          <h2 className="[font-family:Newsreader] text-[30px] font-medium text-[#0b292f]">
            Important interpretation limits
          </h2>
          <ul className="mt-4 space-y-3 rounded-lg border border-[#dbe5e1] bg-white p-5 text-xs leading-6 text-[#65797b]">
            <li>
              Registry dates, statuses, enrollment, sponsor, and location fields
              are submitted and revised by study record owners.
            </li>
            <li>
              PubMed target counts can overlap because one record may match more
              than one reviewed target or therapy query.
            </li>
            <li>
              NIH amounts reflect application records returned by RePORTER and
              can change during the current fiscal year.
            </li>
            <li>
              DailyMed, EMA, and FDA shortage matches are constrained by
              reviewed therapy terms and should not be generalized beyond the
              linked source record.
            </li>
          </ul>
        </div>
      </section>

      <div className="mt-8 flex gap-4 rounded-lg bg-[#102e33] p-6 text-white">
        <RefreshCw className="mt-0.5 shrink-0 text-[#8fe3c5]" size={23} />
        <div>
          <h2 className="text-sm font-bold">Appropriate use</h2>
          <p className="mt-1 text-xs leading-6 text-[#adc2c2]">
            This application is a public-data landscape reference. It is not
            medical advice, clinical decision support, regulatory advice,
            market-share reporting, investment advice, or a validated commercial
            intelligence product. Source records may be incomplete, delayed, or
            revised by their publishers. Current market-context sources were
            last refreshed with the accepted snapshot; FDA shortage source
            metadata is
            {market.shortageSourceUpdatedAt ? " present" : " unavailable"}.
          </p>
        </div>
      </div>
    </section>
  );
}
