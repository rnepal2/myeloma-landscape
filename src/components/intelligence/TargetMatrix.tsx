import type { StrategicIntelligence } from "../../types";

export function TargetMatrix({
  rows,
}: {
  rows: StrategicIntelligence["targetLandscape"];
}) {
  return (
    <div className="overflow-x-auto rounded-lg border border-[#dbe5e1] bg-white">
      <div className="min-w-[820px]">
        <div className="grid min-h-11 grid-cols-[1.25fr_repeat(4,.62fr)_1.2fr_1fr] items-center gap-3 bg-[#eef3f0] px-5 text-[9px] font-extrabold uppercase tracking-[0.07em] text-[#748789]">
          <span>Target family</span>
          <span>Assets</span>
          <span>Trials</span>
          <span>Phase 3</span>
          <span>Sponsors</span>
          <span>Research records</span>
          <span>Activity index</span>
        </div>
        {rows.map((row) => (
          <div
            className="grid min-h-14 grid-cols-[1.25fr_repeat(4,.62fr)_1.2fr_1fr] items-center gap-3 border-t border-[#e3eae6] px-5 text-[11px] text-[#65797b]"
            key={row.target}
          >
            <strong className="text-[13px] text-[#0b292f]">{row.target}</strong>
            <span>{row.activeAssets}</span>
            <span>{row.activeTrials}</span>
            <span>{row.phase3Trials}</span>
            <span>{row.sponsors}</span>
            <span>
              {row.recentPublications.toLocaleString()} PubMed ·{" "}
              {row.recentGrants} NIH
            </span>
            <span className="grid grid-cols-[1fr_22px] items-center gap-2">
              <i className="h-1.5 overflow-hidden rounded-full bg-[#e6ece9]">
                <b
                  className="block h-full rounded-full bg-gradient-to-r from-[#158c77] to-[#dda03b]"
                  style={{ width: `${row.crowdingScore}%` }}
                />
              </i>
              <em className="text-[10px] not-italic">{row.crowdingScore}</em>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
