import { Building2, Landmark } from "lucide-react";
import type { StrategicIntelligence } from "../../types";

type Sponsor = StrategicIntelligence["topSponsors"][number];

export function SponsorLeaderboard({
  title,
  subtitle,
  sponsors,
  kind,
}: {
  title: string;
  subtitle: string;
  sponsors: Sponsor[];
  kind: "industry" | "institution";
}) {
  const maximum = Math.max(1, ...sponsors.map((item) => item.activeTrials));
  const Icon = kind === "industry" ? Building2 : Landmark;
  return (
    <article className="rounded-lg border border-[#dbe5e1] bg-white p-5 sm:p-6">
      <div className="mb-5 flex items-start gap-3">
        <span
          className={`grid size-9 shrink-0 place-items-center rounded-full ${kind === "industry" ? "bg-[#e2f5ed] text-[#158c77]" : "bg-[#e5eef2] text-[#456f79]"}`}
        >
          <Icon size={17} />
        </span>
        <div>
          <h3 className="m-0 text-sm font-bold text-[#0b292f]">{title}</h3>
          <p className="mt-1 text-[11px] leading-5 text-[#718587]">
            {subtitle}
          </p>
        </div>
      </div>
      <ol className="space-y-3">
        {sponsors.map((sponsor, index) => (
          <li
            className="grid grid-cols-[22px_1fr_auto] items-center gap-2.5"
            key={sponsor.name}
          >
            <span className="text-[10px] font-bold text-[#8b999a]">
              {String(index + 1).padStart(2, "0")}
            </span>
            <div className="min-w-0">
              <div className="mb-1 flex items-center justify-between gap-3">
                <strong className="truncate text-[12px] text-[#0b292f]">
                  {sponsor.name}
                </strong>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-[#e8eeeb]">
                <i
                  className={`block h-full rounded-full ${kind === "industry" ? "bg-[#1b9c82]" : "bg-[#517d87]"}`}
                  style={{
                    width: `${(sponsor.activeTrials / maximum) * 100}%`,
                  }}
                />
              </div>
            </div>
            <span className="text-right">
              <strong className="block [font-family:Newsreader] text-xl font-medium leading-none text-[#0b292f]">
                {sponsor.activeTrials}
              </strong>
              <small className="text-[9px] uppercase tracking-wide text-[#839294]">
                active
              </small>
            </span>
          </li>
        ))}
      </ol>
    </article>
  );
}
