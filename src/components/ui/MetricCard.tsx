import { CircleDot } from "lucide-react";
import { cx } from "../../lib/format";

export function MetricCard({
  label,
  value,
  note,
  accent = false,
}: {
  label: string;
  value: string | number;
  note: string;
  accent?: boolean;
}) {
  return (
    <article
      className={cx(
        "min-h-40 border-r border-[#dbe5e1] p-6 last:border-r-0",
        accent ? "bg-[#e2f6ee]" : "bg-white",
      )}
    >
      <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.1em] text-[#63787a]">
        <CircleDot size={14} />
        {label}
      </div>
      <strong className="my-3 block [font-family:Newsreader] text-[42px] font-medium leading-none text-[#0b292f]">
        {value}
      </strong>
      <p className="m-0 text-xs leading-5 text-[#65797b]">{note}</p>
    </article>
  );
}
