import { Menu, X } from "lucide-react";
import { useState } from "react";
import { NavLink } from "react-router-dom";
import { navigation } from "../../app/navigation";
import { LandscapeMark } from "../brand/LandscapeMark";
import { useAppData } from "../../context/AppDataContext";
import { cx, shortDate } from "../../lib/format";

export function Header() {
  const { summary } = useAppData();
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-[#09272d]/95 text-white shadow-[0_8px_30px_rgba(8,38,44,0.12)] backdrop-blur-xl">
      <div className="mx-auto flex h-[72px] max-w-[1280px] items-center gap-7 px-5 sm:px-7">
        <NavLink
          className="flex shrink-0 items-center gap-3 no-underline"
          to="/"
          onClick={() => setOpen(false)}
        >
          <span className="grid size-12 place-items-center rounded-2xl border border-white/20 bg-[linear-gradient(145deg,rgba(143,227,197,.18),rgba(255,255,255,.04))] text-[#9cf0d1] shadow-[inset_0_1px_0_rgba(255,255,255,.22),0_8px_24px_rgba(4,25,29,.22)] backdrop-blur-xl">
            <LandscapeMark className="size-8" />
          </span>
          <span className="flex flex-col">
            <strong className="text-sm tracking-[-0.01em] text-white">
              Myeloma Intelligence
            </strong>
            <small className="mt-0.5 text-[10px] font-bold uppercase tracking-[0.16em] text-[#8fa9aa]">
              Landscape Radar
            </small>
          </span>
        </NavLink>
        <nav
          className={cx(
            "absolute left-0 right-0 top-[72px] flex-col border-b border-[#dbe5e1] bg-white p-3 shadow-xl md:static md:flex md:flex-row md:items-center md:gap-1 md:rounded-full md:border md:border-white/20 md:bg-[linear-gradient(135deg,rgba(255,255,255,.14),rgba(255,255,255,.055))] md:p-1 md:shadow-[inset_0_1px_0_rgba(255,255,255,.16),0_10px_28px_rgba(2,19,23,.16)] md:backdrop-blur-2xl",
            open ? "flex" : "hidden md:flex",
          )}
        >
          {navigation.map((item) => (
            <NavLink
              className={({ isActive }) =>
                cx(
                  "relative overflow-hidden rounded-full px-3.5 py-2.5 text-xs font-bold no-underline transition-all duration-300 active:scale-[.97] md:py-2",
                  isActive
                    ? "bg-[linear-gradient(145deg,rgba(207,255,239,.98),rgba(111,224,184,.82))] text-[#0b292f] ring-1 ring-white/50 shadow-[inset_0_1px_0_rgba(255,255,255,.85),inset_0_-1px_0_rgba(7,72,60,.12),0_8px_20px_rgba(39,190,149,.2)] backdrop-blur-2xl"
                    : "text-[#36585d] hover:bg-[#f0f5f2] md:text-[#adc1c1] md:hover:bg-white/[0.12] md:hover:text-white md:hover:shadow-[inset_0_1px_0_rgba(255,255,255,.12)]",
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
        <div className="ml-auto hidden items-center gap-3 rounded-full border border-white/15 bg-white/[0.07] px-4 py-2 shadow-[inset_0_1px_0_rgba(255,255,255,.1)] backdrop-blur-xl lg:flex">
          <span className="size-2 rounded-full bg-[#6de0b8] shadow-[0_0_0_5px_rgba(109,224,184,0.1)]" />
          <span className="flex flex-col">
            <strong className="text-[10px] text-[#8fa9aa]">
              Data Refresh: {shortDate(summary.sourceRetrievedAt.slice(0, 10))}
            </strong>
          </span>
        </div>
        <button
          className="ml-auto grid size-10 place-items-center rounded-full border border-white/10 text-[#d8e7e5] md:hidden"
          onClick={() => setOpen(!open)}
          aria-label="Toggle navigation"
        >
          {open ? <X size={19} /> : <Menu size={19} />}
        </button>
      </div>
    </header>
  );
}
