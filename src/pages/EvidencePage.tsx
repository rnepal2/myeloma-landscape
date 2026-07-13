import { ExternalLink } from "lucide-react";
import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Badge } from "../components/ui/Badge";
import { MetricCard } from "../components/ui/MetricCard";
import { PageIntro } from "../components/ui/PageIntro";
import { Pagination } from "../components/ui/Pagination";
import { SearchBox } from "../components/ui/SearchBox";
import { SectionHeading } from "../components/ui/SectionHeading";
import { SourceNote } from "../components/ui/SourceNote";
import { useAppData } from "../context/AppDataContext";
import { shortDate } from "../lib/format";

export function EvidencePage() {
  const { evidence } = useAppData();
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [grantPage, setGrantPage] = useState(1);
  const pageSize = 8;
  const grantPageSize = 4;
  const filtered = evidence.publications.filter((publication) =>
    `${publication.title} ${publication.journal} ${publication.authors.join(" ")} ${publication.linkedAssets.join(" ")} ${publication.linkedTargets.join(" ")}`
      .toLowerCase()
      .includes(query.toLowerCase()),
  );
  const publicationItems = filtered.slice(
    (page - 1) * pageSize,
    page * pageSize,
  );
  const grantItems = evidence.grants.slice(
    (grantPage - 1) * grantPageSize,
    grantPage * grantPageSize,
  );
  const lastComplete = evidence.countsByYear.at(-2);
  const prior = evidence.countsByYear.at(-3);
  const growth =
    lastComplete && prior
      ? Math.round((lastComplete.value / prior.value - 1) * 100)
      : 0;
  const currentFunding = evidence.grantAwardsByYear.at(-1)?.value ?? 0;
  useEffect(() => setPage(1), [query]);

  return (
    <section className="mx-auto max-w-[1200px] px-6 py-16">
      <PageIntro
        eyebrow="Publication and funding records"
        title="PubMed literature and NIH-funded projects"
        copy="The page combines annual PubMed counts, target-linked query counts, a recent citation sample, and NIH RePORTER projects. These are record counts and award amounts, not measures of evidence quality or clinical benefit."
      />
      <div className="mb-5 grid overflow-hidden rounded-lg border border-[#dbe5e1] shadow-sm sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          label="Indexed publication corpus"
          value={evidence.totalCount.toLocaleString()}
          note="Multiple myeloma in the citation title"
        />
        <MetricCard
          label="Latest complete year"
          value={lastComplete?.value.toLocaleString() ?? "—"}
          note={`${growth >= 0 ? "+" : ""}${growth}% versus the prior year`}
        />
        <MetricCard
          label="NIH funding records"
          value={evidence.grantCount}
          note="Disease-title matches across three fiscal years"
        />
        <MetricCard
          label="Current-year awards"
          value={`$${(currentFunding / 1_000_000).toFixed(1)}M`}
          note="NIH RePORTER award actions"
        />
      </div>
      <div className="mb-16 grid gap-4 lg:grid-cols-[1.25fr_.8fr]">
        <article className="rounded-lg border border-[#dbe5e1] bg-white p-6">
          <h2 className="text-[15px] font-bold text-[#0b292f]">
            Publication volume
          </h2>
          <p className="mt-1 text-xs text-[#65797b]">
            Annual PubMed records with multiple myeloma in the citation title.
          </p>
          <div className="mt-5 h-72">
            <ResponsiveContainer>
              <BarChart data={evidence.countsByYear}>
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
                <Tooltip />
                <Bar dataKey="value" fill="#178c77" radius={[5, 5, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </article>
        <article className="rounded-lg border border-[#dbe5e1] bg-white p-6">
          <h2 className="text-[15px] font-bold text-[#0b292f]">
            Target-linked PubMed records
          </h2>
          <p className="mt-1 text-xs text-[#65797b]">
            Reviewed target and therapy terms in titles or abstracts,{" "}
            {evidence.targetCountWindow}.
          </p>
          <div className="mt-5 space-y-3">
            {evidence.targetMomentum.slice(0, 7).map((item, index) => (
              <div
                className="grid grid-cols-[20px_95px_1fr_25px] items-center gap-2 text-[11px]"
                key={item.name}
              >
                <span className="text-[#8a999a]">{index + 1}</span>
                <strong>{item.name}</strong>
                <i className="h-1.5 overflow-hidden rounded-full bg-[#e8eeeb]">
                  <b
                    className="block h-full rounded-full bg-[#178c77]"
                    style={{
                      width: `${(item.value / Math.max(1, evidence.targetMomentum[0].value)) * 100}%`,
                    }}
                  />
                </i>
                <em className="text-right not-italic text-[#65797b]">
                  {item.value}
                </em>
              </div>
            ))}
          </div>
        </article>
      </div>

      <SectionHeading
        eyebrow="NIH RePORTER records"
        title="NIH-funded multiple myeloma projects"
        copy="Projects require multiple myeloma in the project title and cover the current and two prior fiscal years. Amounts are the award values returned for each application record."
      />
      <div className="overflow-hidden rounded-lg border border-[#dbe5e1] bg-white">
        {grantItems.map((grant) => (
          <article
            className="grid gap-4 border-t border-[#e3eae6] p-5 first:border-t-0 sm:grid-cols-[120px_1fr_28px]"
            key={grant.id}
          >
            <div>
              <strong className="block [font-family:Newsreader] text-[22px] font-medium text-[#158c77]">
                ${grant.awardAmount.toLocaleString()}
              </strong>
              <span className="text-[10px] text-[#718587]">
                FY {grant.fiscalYear}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-[#718587]">
                {grant.organization} · {grant.projectNumber}
              </span>
              <h3 className="mt-1 text-sm font-bold leading-5 text-[#0b292f]">
                {grant.title}
              </h3>
              <p className="mt-1 text-[11px] text-[#65797b]">
                {grant.principalInvestigators.slice(0, 3).join(", ")}
              </p>
            </div>
            <a
              className="text-[#158c77]"
              href={grant.sourceUrl}
              target="_blank"
              rel="noreferrer"
              aria-label={`Open ${grant.title} in NIH RePORTER`}
            >
              <ExternalLink size={17} />
            </a>
          </article>
        ))}
      </div>
      <Pagination
        page={grantPage}
        total={evidence.grants.length}
        pageSize={grantPageSize}
        onPage={setGrantPage}
        label="funding records"
      />

      <SectionHeading
        eyebrow="Recent literature"
        title="Explore the PubMed evidence stream"
        copy="Search citation titles, journals, authors, reviewed therapy names, and deterministically matched targets."
      />
      <div className="mb-3 max-w-2xl">
        <SearchBox
          value={query}
          onChange={setQuery}
          placeholder="Search publications, journals, assets, or targets"
        />
      </div>
      <div className="overflow-hidden rounded-lg border border-[#dbe5e1] bg-white">
        {publicationItems.map((publication) => (
          <article
            className="grid gap-4 border-t border-[#e3eae6] p-5 first:border-t-0 sm:grid-cols-[105px_1fr_28px]"
            key={publication.pmid}
          >
            <div className="text-[11px] font-bold text-[#158c77]">
              {shortDate(publication.date)}
            </div>
            <div>
              <div className="flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-[#798b8d]">
                <span>{publication.journal}</span>
                <span>PMID {publication.pmid}</span>
              </div>
              <h3 className="mt-1.5 text-sm font-bold leading-5 text-[#0b292f]">
                {publication.title}
              </h3>
              <p className="mt-1 text-[11px] text-[#65797b]">
                {publication.authors.join(", ")}
              </p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {publication.linkedAssets.slice(0, 3).map((asset) => (
                  <Badge key={asset} tone="blue">
                    {asset}
                  </Badge>
                ))}
                {publication.linkedTargets.slice(0, 3).map((target) => (
                  <Badge key={target} tone="teal">
                    {target}
                  </Badge>
                ))}
              </div>
            </div>
            <a
              className="text-[#158c77]"
              href={publication.sourceUrl}
              target="_blank"
              rel="noreferrer"
              aria-label={`Open ${publication.title} in PubMed`}
            >
              <ExternalLink size={17} />
            </a>
          </article>
        ))}
      </div>
      <Pagination
        page={page}
        total={filtered.length}
        pageSize={pageSize}
        onPage={setPage}
        label="citations"
      />
      <SourceNote>{evidence.methodology}</SourceNote>
    </section>
  );
}
