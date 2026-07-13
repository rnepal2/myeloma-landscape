import type { StrategicIntelligence } from "../../types";

const tones: Record<string, string> = {
  amber: "border-l-[#dda03b]",
  teal: "border-l-[#209d83]",
  blue: "border-l-[#4b7b86]",
  purple: "border-l-[#756a9b]",
  red: "border-l-[#b85c55]",
};
const dots: Record<string, string> = {
  amber: "bg-[#dda03b]",
  teal: "bg-[#209d83]",
  blue: "bg-[#4b7b86]",
  purple: "bg-[#756a9b]",
  red: "bg-[#b85c55]",
};

export function StrategicSignalCard({
  signal,
}: {
  signal: StrategicIntelligence["landscapeMeasures"][number];
}) {
  return (
    <article
      className={`min-h-56 rounded-lg border border-[#dbe5e1] border-l-[3px] bg-white p-5 ${tones[signal.tone] ?? tones.teal}`}
    >
      <div className="flex items-center justify-between text-[10px] font-extrabold uppercase tracking-[0.1em] text-[#65797b]">
        <span>{signal.theme}</span>
        <i
          className={`size-2 rounded-full ${dots[signal.tone] ?? dots.teal}`}
        />
      </div>
      <strong className="my-5 block [font-family:Newsreader] text-[30px] font-medium leading-none text-[#0b292f]">
        {signal.metric}
      </strong>
      <h3 className="text-sm font-bold leading-5 text-[#0b292f]">
        {signal.title}
      </h3>
      <p className="mt-2 text-xs leading-5 text-[#65797b]">{signal.detail}</p>
    </article>
  );
}
