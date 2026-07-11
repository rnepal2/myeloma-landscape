import { ArrowLeft, ArrowRight } from "lucide-react";

export function Pagination({
  page,
  total,
  pageSize,
  onPage,
  label,
}: {
  page: number;
  total: number;
  pageSize: number;
  onPage: (page: number) => void;
  label: string;
}) {
  const pages = Math.max(1, Math.ceil(total / pageSize));
  if (pages <= 1) return null;
  const start = (page - 1) * pageSize + 1;
  const end = Math.min(total, page * pageSize);
  return (
    <nav
      className="my-6 flex flex-col items-start justify-between gap-3 text-xs text-[#65797b] sm:flex-row sm:items-center"
      aria-label={`${label} pagination`}
    >
      <span>
        {start.toLocaleString()}–{end.toLocaleString()} of{" "}
        {total.toLocaleString()} {label}
      </span>
      <div className="flex w-full items-center justify-between gap-3 sm:w-auto">
        <button
          className="inline-flex items-center gap-1.5 rounded-md border border-[#dbe5e1] bg-white px-3 py-2 text-xs font-bold text-[#0b292f] disabled:cursor-not-allowed disabled:opacity-40"
          onClick={() => onPage(page - 1)}
          disabled={page === 1}
        >
          <ArrowLeft size={14} />
          Previous
        </button>
        <strong className="text-[11px]">
          Page {page} of {pages}
        </strong>
        <button
          className="inline-flex items-center gap-1.5 rounded-md border border-[#dbe5e1] bg-white px-3 py-2 text-xs font-bold text-[#0b292f] disabled:cursor-not-allowed disabled:opacity-40"
          onClick={() => onPage(page + 1)}
          disabled={page === pages}
        >
          Next
          <ArrowRight size={14} />
        </button>
      </div>
    </nav>
  );
}
