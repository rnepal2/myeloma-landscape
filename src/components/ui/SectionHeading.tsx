import type { ReactNode } from "react";

export function SectionHeading({
  eyebrow,
  title,
  copy,
  action,
}: {
  eyebrow?: string;
  title: string;
  copy?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-7 flex items-end justify-between gap-6">
      <div>
        {eyebrow && (
          <span className="mb-3 block text-[11px] font-extrabold uppercase tracking-[0.14em] text-[#158c77]">
            {eyebrow}
          </span>
        )}
        <h2 className="m-0 [font-family:Newsreader] text-[34px] font-medium leading-tight tracking-[-0.02em] text-[#0b292f]">
          {title}
        </h2>
        {copy && (
          <p className="mt-3 max-w-3xl text-sm leading-6 text-[#65797b]">
            {copy}
          </p>
        )}
      </div>
      {action}
    </div>
  );
}
