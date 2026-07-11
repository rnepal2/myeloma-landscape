import type { ReactNode } from "react";
import { cx } from "../../lib/format";

const tones = {
  neutral: "bg-[#edf1ef] text-[#5e7274]",
  teal: "bg-[#dcf3ea] text-[#176f5d]",
  amber: "bg-[#fff0d6] text-[#8c5a0f]",
  red: "bg-[#f8e4e2] text-[#944c46]",
  blue: "bg-[#e4eef1] text-[#3f6871]",
} as const;

export function Badge({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: keyof typeof tones;
}) {
  return (
    <span
      className={cx(
        "inline-flex items-center whitespace-nowrap rounded px-2 py-1 text-[10px] font-bold uppercase tracking-[0.06em]",
        tones[tone],
      )}
    >
      {children}
    </span>
  );
}
