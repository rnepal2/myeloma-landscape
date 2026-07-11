import { Menu, Radar, X } from "lucide-react";
import { useState } from "react";
import { NavLink } from "react-router-dom";
import { navigation } from "../../app/navigation";
import { useAppData } from "../../context/AppDataContext";
import { cx, shortDate } from "../../lib/format";

export function Header() {
  const { summary } = useAppData();
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-[#09272d]/95 text-white shadow-[0_8px_30px_rgba(8,38,44,0.12)] backdrop-blur-xl">
      <div className="mx-auto flex h-[78px] max-w-[1280px] items-center gap-7 px-5 sm:px-7">
        <NavLink
          className="flex shrink-0 items-center gap-3 no-underline"
          to="/"
          onClick={() => setOpen(false)}
        >
          <span className="grid size-10 place-items-center rounded-full border border-[#8fe3c5]/30 bg-[#8fe3c5]/10 text-[#8fe3c5]">
            <Radar size={20} />
          </span>
          <span className="flex flex-col">
            <strong className="text-sm tracking-[-0.01em] text-white">
              Myeloma Intelligence
            </strong>
            <small className="mt-0.5 text-[9px] font-bold uppercase tracking-[0.16em] text-[#8fa9aa]">
              Landscape Radar
            </small>
          </span>
        </NavLink>
        <nav
          className={cx(
            "absolute left-0 right-0 top-[78px] flex-col border-b border-[#dbe5e1] bg-white p-3 shadow-xl md:static md:flex md:flex-row md:items-center md:gap-1 md:rounded-lg md:border md:border-white/10 md:bg-white/[0.06] md:p-1 md:shadow-none",
            open ? "flex" : "hidden md:flex",
          )}
        >
          {navigation.map((item) => (
            <NavLink
              className={({ isActive }) =>
                cx(
                  "rounded-md px-3.5 py-2.5 text-xs font-bold no-underline transition md:py-2",
                  isActive
                    ? "bg-[#8fe3c5] text-[#0b292f]"
                    : "text-[#36585d] hover:bg-[#f0f5f2] md:text-[#adc1c1] md:hover:bg-white/10 md:hover:text-white",
                )
              }
              end={item.path === "/"}
              key={item.path}
              to={item.path}
              onClick={() => setOpen(false)}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="ml-auto hidden items-center gap-3 rounded-full border border-white/10 bg-white/[0.06] px-4 py-2 lg:flex">
          <span className="size-2 rounded-full bg-[#6de0b8] shadow-[0_0_0_5px_rgba(109,224,184,0.1)]" />
          <span className="flex flex-col">
            <strong className="text-[10px] font-bold text-[#d8e7e5]">
              Six-source intelligence pulse
            </strong>
            <small className="text-[9px] text-[#8fa9aa]">
              Refreshed {shortDate(summary.sourceRetrievedAt.slice(0, 10))}
            </small>
          </span>
        </div>
        <button
          className="ml-auto grid size-10 place-items-center rounded-md border border-white/10 text-[#d8e7e5] md:hidden"
          onClick={() => setOpen(!open)}
          aria-label="Toggle navigation"
        >
          {open ? <X size={19} /> : <Menu size={19} />}
        </button>
      </div>
    </header>
  );
}
