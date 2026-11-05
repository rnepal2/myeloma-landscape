import { CircleDot } from "lucide-react";
import { cx } from "../../lib/format";

export function MetricCard({
  label,
  value,
  note,
  accent = false,
  compact = false,
}: {
  label: string;
  value: string | number;
  note: string;
  accent?: boolean;
  compact?: boolean;
}) {
  return (
    <article
      className={cx(
        "border-r border-[#dbe5e1] last:border-r-0",
        compact ? "min-h-0 p-3 sm:p-5" : "min-h-40 p-6",
        accent ? "bg-[#e2f6ee]" : "bg-white",
      )}
    >
      <div
        className={cx(
          "flex items-center gap-2 font-bold uppercase tracking-[0.06em] text-[#63787a]",
          compact ? "text-[9px] sm:text-[11px]" : "text-[11px]",
        )}
      >
        <CircleDot
          size={14}
          className={compact ? "hidden shrink-0 sm:block" : "shrink-0"}
        />
        {label}
      </div>
      <strong
        className={cx(
          "my-3 block [font-family:Newsreader] font-medium leading-none text-[#0b292f]",
          compact ? "text-[32px] sm:text-[42px]" : "text-[42px]",
        )}
      >
        {value}
      </strong>
      <p
        className={cx(
          "m-0 text-xs leading-5 text-[#65797b]",
          compact && "sr-only sm:not-sr-only",
        )}
      >
        {note}
      </p>
    </article>
  );
}
