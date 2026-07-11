import { cx } from "../../lib/format";

export function SegmentedControl<T extends string>({
  value,
  options,
  onChange,
  label,
}: {
  value: T;
  options: { value: T; label: string }[];
  onChange: (value: T) => void;
  label: string;
}) {
  return (
    <div
      className="mb-6 flex gap-1 overflow-x-auto rounded-lg bg-[#e7eeea] p-1.5"
      role="tablist"
      aria-label={label}
    >
      {options.map((option) => (
        <button
          className={cx(
            "min-w-32 flex-1 rounded-md px-4 py-2.5 text-xs font-bold transition",
            value === option.value
              ? "bg-white text-[#0b292f] shadow-sm"
              : "text-[#65797b] hover:text-[#0b292f]",
          )}
          key={option.value}
          role="tab"
          aria-selected={value === option.value}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
