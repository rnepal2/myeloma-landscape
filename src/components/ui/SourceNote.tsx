import { Info } from "lucide-react";
import type { ReactNode } from "react";

export function SourceNote({
  children,
  dark = false,
}: {
  children: ReactNode;
  dark?: boolean;
}) {
  return (
    <div
      className={`mt-4 flex items-start gap-2 text-[11px] leading-5 ${dark ? "text-[#93a9aa]" : "text-[#718587]"}`}
    >
      <Info className="mt-0.5 shrink-0" size={14} />
      {children}
    </div>
  );
}
