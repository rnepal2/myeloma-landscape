import { Search } from "lucide-react";

export function SearchBox({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <label className="flex h-12 items-center gap-2.5 rounded-md border border-[#dbe5e1] bg-white px-3.5 text-[#718587] focus-within:border-[#158c77] focus-within:ring-2 focus-within:ring-[#158c77]/10">
      <Search size={17} />
      <input
        className="min-w-0 flex-1 border-0 bg-transparent text-[13px] text-[#0b292f] outline-none placeholder:text-[#879799]"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
      />
      <kbd className="rounded border border-[#dbe5e1] px-1.5 py-0.5 text-[9px]">
        /
      </kbd>
    </label>
  );
}
