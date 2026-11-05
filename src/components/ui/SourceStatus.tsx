import { useAppData } from "../../context/AppDataContext";
import { snapshotDate } from "../../lib/format";
export function SourceStatus({ ids }: { ids?: string[] }) {
  const { sources } = useAppData();
  return (
    <div
      className="my-4 flex flex-wrap gap-x-6 gap-y-3 text-[11px] leading-5"
      aria-label="Source freshness"
    >
      {sources.sources
        .filter((item) => !ids || ids.includes(item.id))
        .map((item) => (
          <p
            key={item.id}
            className={
              item.status === "fallback" ? "text-[#e2b980]" : "text-[#9ba3aa]"
            }
          >
            <strong>{item.name}</strong> ·{" "}
            {item.status === "fallback" ? "Retained records · " : "Retrieved "}
            {item.lastSuccessAt
              ? snapshotDate(item.lastSuccessAt)
              : "last successful retrieval unknown"}
            {item.status === "fallback" && (
              <span className="block">
                The latest retrieval did not complete.
              </span>
            )}
          </p>
        ))}
    </div>
  );
}
