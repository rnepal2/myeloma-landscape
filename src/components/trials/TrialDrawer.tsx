import { ExternalLink, X } from "lucide-react";
import { useEffect, useRef } from "react";
import { Badge } from "../ui/Badge";
import { prettyEnum, shortDate } from "../../lib/format";
import type { Trial } from "../../types";

export function TrialDrawer({
  trial,
  onClose,
}: {
  trial: Trial | null;
  onClose: () => void;
}) {
  const panel = useRef<HTMLElement>(null);
  const closeAction = useRef(onClose);
  closeAction.current = onClose;
  useEffect(() => {
    if (!trial) return;
    const previousFocus = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    panel.current?.querySelector<HTMLElement>("button")?.focus();
    const close = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeAction.current();
      if (event.key === "Tab") {
        const controls = panel.current?.querySelectorAll<HTMLElement>(
          'button, a[href], input, select, [tabindex="0"]',
        );
        if (!controls?.length) return;
        const first = controls[0];
        const last = controls[controls.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };
    addEventListener("keydown", close);
    document.body.style.overflow = "hidden";
    return () => {
      removeEventListener("keydown", close);
      document.body.style.overflow = previousOverflow;
      previousFocus?.focus();
    };
  }, [trial?.nctId]);

  if (!trial) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-[#09272d]/45"
      onMouseDown={onClose}
      role="presentation"
    >
      <aside
        ref={panel}
        className="relative h-full w-full max-w-[590px] overflow-y-auto bg-white p-6 shadow-2xl sm:p-10"
        onMouseDown={(event) => event.stopPropagation()}
        aria-label="Trial detail"
        role="dialog"
        aria-modal="true"
      >
        <button
          className="absolute right-5 top-5 grid size-9 place-items-center rounded-full border border-[#dbe5e1] bg-white text-[#0b292f]"
          onClick={onClose}
          aria-label="Close trial detail"
        >
          <X size={19} />
        </button>
        <div className="text-[11px] font-extrabold uppercase tracking-[0.1em] text-[#158c77]">
          {trial.nctId}
        </div>
        <h2 className="mr-10 mt-3 text-pretty [font-family:Newsreader] text-[34px] font-medium leading-[1.14] tracking-[-0.02em] text-[#0b292f]">
          {trial.title}
        </h2>
        <div className="mt-4 flex flex-wrap gap-1.5">
          <Badge tone={trial.status === "RECRUITING" ? "teal" : "neutral"}>
            {prettyEnum(trial.status)}
          </Badge>
          {trial.phases.map((phase) => (
            <Badge tone="blue" key={phase}>
              {prettyEnum(phase)}
            </Badge>
          ))}
          <Badge>{trial.setting}</Badge>
        </div>
        <dl className="my-7 grid grid-cols-1 border-l border-t border-[#dbe5e1] sm:grid-cols-2">
          {[
            ["Lead sponsor", trial.sponsor],
            ["Sponsor class", prettyEnum(trial.sponsorClass)],
            [
              "Enrollment",
              trial.enrollment?.toLocaleString() ?? "Not reported",
            ],
            ["Start", shortDate(trial.startDate)],
            ["Primary completion", shortDate(trial.primaryCompletionDate)],
            ["Last updated", shortDate(trial.lastUpdated)],
            ["Results posted", trial.hasResults ? "Yes" : "No"],
          ].map(([label, value]) => (
            <div
              className="border-b border-r border-[#dbe5e1] p-3.5"
              key={label}
            >
              <dt className="text-[9px] font-bold uppercase tracking-[0.08em] text-[#7c8d8f]">
                {label}
              </dt>
              <dd className="mt-1 text-xs font-semibold text-[#0b292f]">
                {value}
              </dd>
            </div>
          ))}
        </dl>
        <p className="text-xs leading-5 text-[#65797b]">
          Primary completion is a registry date for collecting the primary
          outcome data. It is not a promised results publication date. Dates and
          enrollment may be revised by the record owner.
        </p>
        <h3 className="mb-3 mt-8 text-[11px] font-extrabold uppercase tracking-[0.1em] text-[#0b292f]">
          Interventions
        </h3>
        <div className="grid gap-2 sm:grid-cols-2">
          {trial.interventions.map((item, index) => (
            <div
              className="rounded-md bg-[#f2f6f3] p-3"
              key={`${item.name}-${index}`}
            >
              <strong className="block text-xs text-[#0b292f]">
                {item.canonicalName}
              </strong>
              <span className="mt-1 block text-[10px] text-[#718587]">
                {[item.modality, item.target].filter(Boolean).join(" · ") ||
                  prettyEnum(item.type)}
              </span>
            </div>
          ))}
        </div>
        {trial.briefSummary && (
          <>
            <h3 className="mb-3 mt-8 text-[11px] font-extrabold uppercase tracking-[0.1em] text-[#0b292f]">
              Study summary
            </h3>
            <p className="text-[13px] leading-6 text-[#65797b]">
              {trial.briefSummary}
            </p>
          </>
        )}
        <a
          className="mt-6 inline-flex items-center gap-2 rounded-md bg-[#0b292f] px-4 py-3 text-xs font-bold text-white hover:bg-[#158c77]"
          href={trial.sourceUrl}
          target="_blank"
          rel="noreferrer"
        >
          Open source record
          <ExternalLink size={15} />
        </a>
      </aside>
    </div>
  );
}
