import { ExternalLink, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { Badge } from "../components/ui/Badge";
import { PageIntro } from "../components/ui/PageIntro";
import { Pagination } from "../components/ui/Pagination";
import { SegmentedControl } from "../components/ui/SegmentedControl";
import { SourceNote } from "../components/ui/SourceNote";
import { useAppData } from "../context/AppDataContext";
import { shortDate } from "../lib/format";

type Tab = "fda" | "labels" | "europe" | "supply";

export function RegulatoryPage() {
  const { regulatory: events, market } = useAppData();
  const [tab, setTab] = useState<Tab>("fda");
  const [page, setPage] = useState(1);
  const pageSize = tab === "fda" ? 4 : 6;
  const unavailable = market.shortages.filter((item) =>
    item.availability.toLowerCase().includes("unavailable"),
  ).length;
  const authorised = market.emaMedicines.filter(
    (item) => item.status === "Authorised",
  ).length;
  const total =
    tab === "fda"
      ? events.length
      : tab === "labels"
        ? market.dailyMedLabels.length
        : tab === "europe"
          ? market.emaMedicines.length
          : market.shortages.length;
  const start = (page - 1) * pageSize;
  useEffect(() => setPage(1), [tab]);

  return (
    <section className="mx-auto max-w-[1200px] px-6 py-16">
      <PageIntro
        eyebrow="Regulatory and supply records"
        title="Follow approvals, labels, European status, and supply"
        copy="Separate source views cover FDA oncology actions, DailyMed label versions, EMA medicine status, and current FDA shortage records."
      />
      <div className="mb-6 grid overflow-hidden rounded-lg border border-[#dbe5e1] bg-white sm:grid-cols-2 lg:grid-cols-4">
        {[
          ["FDA actions", events.length, "Indication-level milestones"],
          [
            "Label documents",
            market.dailyMedLabels.length,
            "Reviewed DailyMed SPL records",
          ],
          ["EMA authorised", authorised, "Myeloma-indicated records"],
          [
            "Unavailable presentations",
            unavailable,
            "Current FDA shortage entries",
          ],
        ].map(([label, value, note]) => (
          <article
            className="border-b border-r border-[#dbe5e1] p-5 last:border-r-0 sm:[&:nth-child(3)]:border-b-0 sm:[&:nth-child(4)]:border-b-0 lg:border-b-0"
            key={label}
          >
            <span className="text-[10px] font-bold uppercase tracking-[0.08em] text-[#718587]">
              {label}
            </span>
            <strong className="my-2 block [font-family:Newsreader] text-[32px] font-medium leading-none text-[#0b292f]">
              {value}
            </strong>
            <p className="text-[11px] text-[#65797b]">{note}</p>
          </article>
        ))}
      </div>
      <SegmentedControl
        value={tab}
        onChange={setTab}
        label="Regulatory source views"
        options={[
          { value: "fda", label: "FDA actions" },
          { value: "labels", label: "US label pulse" },
          { value: "europe", label: "European status" },
          { value: "supply", label: "Supply watch" },
        ]}
      />

      {tab === "fda" && (
        <>
          <div className="mb-4 flex items-center gap-4 rounded-lg border border-[#bfe5d7] bg-[#e2f6ee] p-5 text-[#158c77]">
            <ShieldCheck size={26} />
            <div>
              <strong className="block text-[13px] text-[#0b292f]">
                Indication and regimen actions
              </strong>
              <span className="text-[11px] text-[#637b78]">
                Automatically retrieved from FDA oncology approval notifications
              </span>
            </div>
          </div>
          <div>
            {events.slice(start, start + pageSize).map((event, index, rows) => (
              <article
                className="grid grid-cols-[28px_90px_1fr] gap-3 sm:grid-cols-[35px_110px_1fr]"
                key={event.id}
              >
                <div className="relative flex justify-center">
                  <i className="relative z-10 mt-6 size-3 rounded-full border-[3px] border-[#d9f1e8] bg-[#158c77]" />
                  {index < rows.length - 1 && (
                    <span className="absolute bottom-[-20px] top-7 w-px bg-[#bed6ce]" />
                  )}
                </div>
                <div className="pt-5 text-[11px] font-bold text-[#65797b]">
                  {shortDate(event.date)}
                </div>
                <div className="mb-4 rounded-lg border border-[#dbe5e1] bg-white p-5">
                  <div className="flex flex-wrap gap-1.5">
                    <Badge
                      tone={
                        event.eventType.includes("Accelerated")
                          ? "amber"
                          : "teal"
                      }
                    >
                      {event.eventType}
                    </Badge>
                    <Badge>{event.target}</Badge>
                  </div>
                  <h2 className="mt-3 [font-family:Newsreader] text-2xl font-medium leading-7 text-[#0b292f]">
                    {event.title}
                  </h2>
                  <p className="mt-2 text-xs leading-5 text-[#65797b]">
                    {event.detail}
                  </p>
                  <div className="mt-4 flex justify-between gap-4 border-t border-[#dbe5e1] pt-3 text-[11px]">
                    <strong>{event.asset}</strong>
                    <a
                      className="inline-flex items-center gap-1 font-bold text-[#158c77] no-underline"
                      href={event.sourceUrl}
                      target="_blank"
                      rel="noreferrer"
                    >
                      FDA source
                      <ExternalLink size={12} />
                    </a>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </>
      )}

      {tab !== "fda" && <ContextHeader tab={tab} />}
      {tab === "labels" && (
        <ContextList>
          {market.dailyMedLabels.slice(start, start + pageSize).map((label) => (
            <ContextRow
              key={label.setId}
              meta={
                <>
                  <Badge tone="blue">Version {label.version}</Badge>
                  <span>{shortDate(label.publishedDate)}</span>
                </>
              }
              title={label.asset}
              detail={label.title}
              href={label.sourceUrl}
              linkLabel="Open label"
            />
          ))}
        </ContextList>
      )}
      {tab === "europe" && (
        <ContextList>
          {market.emaMedicines
            .slice(start, start + pageSize)
            .map((medicine, index) => (
              <ContextRow
                key={`${medicine.sourceUrl}-${index}`}
                meta={
                  <>
                    <Badge
                      tone={medicine.status === "Authorised" ? "teal" : "amber"}
                    >
                      {medicine.status}
                    </Badge>
                    <span>{shortDate(medicine.lastUpdated)}</span>
                  </>
                }
                title={medicine.name}
                detail={`${medicine.activeSubstance}${medicine.holder ? ` · ${medicine.holder}` : ""}`}
                href={medicine.sourceUrl}
                linkLabel="EMA record"
                badges={
                  <>
                    {medicine.orphan && <Badge>Orphan</Badge>}
                    {medicine.conditional && <Badge>Conditional</Badge>}
                    {medicine.advancedTherapy && (
                      <Badge>Advanced therapy</Badge>
                    )}
                  </>
                }
              />
            ))}
        </ContextList>
      )}
      {tab === "supply" && (
        <ContextList>
          {market.shortages
            .slice(start, start + pageSize)
            .map((item, index) => (
              <ContextRow
                key={`${item.asset}-${item.company}-${index}`}
                meta={
                  <>
                    <Badge
                      tone={
                        item.availability.toLowerCase().includes("unavailable")
                          ? "red"
                          : item.availability.toLowerCase().includes("limited")
                            ? "amber"
                            : "teal"
                      }
                    >
                      {item.availability}
                    </Badge>
                    <span>{shortDate(item.updatedDate)}</span>
                  </>
                }
                title={item.asset}
                detail={item.presentation || item.genericName}
                subdetail={`${item.company}${item.reason ? ` · ${item.reason}` : ""}`}
                href={item.sourceUrl}
                linkLabel="FDA shortage record"
              />
            ))}
        </ContextList>
      )}
      <Pagination
        page={page}
        total={total}
        pageSize={pageSize}
        onPage={setPage}
        label={
          tab === "fda"
            ? "milestones"
            : tab === "labels"
              ? "labels"
              : tab === "europe"
                ? "EMA records"
                : "shortage records"
        }
      />
      <SourceNote>{market.methodology}</SourceNote>
    </section>
  );
}

function ContextHeader({ tab }: { tab: Exclude<Tab, "fda"> }) {
  const content = {
    labels: [
      "US label pulse",
      "Which reviewed therapy labels changed most recently?",
      "Structured Product Label versions provide a reproducible monitoring surface; the current label remains authoritative.",
      "DailyMed",
    ],
    europe: [
      "European regulatory position",
      "Centralised medicine status and recent record updates",
      "EMA adds an international view across authorised, withdrawn, lapsed, and expired records.",
      "EMA",
    ],
    supply: [
      "Operational supply watch",
      "Current shortages intersecting the regimen map",
      "Availability is presentation- and manufacturer-specific and must not be generalized to an entire active ingredient.",
      "FDA daily",
    ],
  }[tab];
  return (
    <div className="flex flex-col justify-between gap-4 rounded-t-lg bg-[#102e33] p-6 text-white sm:flex-row">
      <div>
        <span className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-[#8fe3c5]">
          {content[0]}
        </span>
        <h2 className="mt-2 [font-family:Newsreader] text-[26px] font-medium">
          {content[1]}
        </h2>
        <p className="mt-1 max-w-3xl text-xs leading-5 text-[#afc2c2]">
          {content[2]}
        </p>
      </div>
      <span className="self-start rounded-full border border-[#8fe3c5]/30 px-3 py-1.5 text-[9px] font-bold uppercase tracking-[0.1em] text-[#8fe3c5]">
        {content[3]}
      </span>
    </div>
  );
}

function ContextList({ children }: { children: React.ReactNode }) {
  return (
    <div className="overflow-hidden rounded-b-lg border border-t-0 border-[#dbe5e1] bg-white">
      {children}
    </div>
  );
}
function ContextRow({
  meta,
  title,
  detail,
  subdetail,
  href,
  linkLabel,
  badges,
}: {
  meta: React.ReactNode;
  title: string;
  detail: string;
  subdetail?: string;
  href: string;
  linkLabel: string;
  badges?: React.ReactNode;
}) {
  return (
    <article className="grid gap-4 border-t border-[#e3eae6] p-5 first:border-t-0 sm:grid-cols-[145px_1fr_125px] sm:items-center">
      <div className="flex flex-wrap items-center gap-2 text-[10px] text-[#718587] sm:flex-col sm:items-start">
        {meta}
      </div>
      <div>
        <h3 className="text-sm font-bold text-[#0b292f]">{title}</h3>
        <p className="mt-1 text-xs leading-5 text-[#65797b]">{detail}</p>
        {subdetail && (
          <small className="mt-1 block text-[10px] text-[#879697]">
            {subdetail}
          </small>
        )}
        {badges && <div className="mt-2 flex flex-wrap gap-1.5">{badges}</div>}
      </div>
      <a
        className="inline-flex items-center gap-1 text-[11px] font-bold text-[#158c77] no-underline sm:justify-self-end"
        href={href}
        target="_blank"
        rel="noreferrer"
      >
        {linkLabel}
        <ExternalLink size={13} />
      </a>
    </article>
  );
}
