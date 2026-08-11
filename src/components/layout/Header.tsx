import { Menu, X } from "lucide-react";
import { useLayoutEffect, useRef, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { navigation } from "../../app/navigation";
import { LandscapeMark } from "../brand/LandscapeMark";
import { useAppData } from "../../context/AppDataContext";
import { cx, shortDate } from "../../lib/format";

export function Header() {
  const { summary } = useAppData();
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const linkRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const [indicator, setIndicator] = useState({
    left: 0,
    width: 0,
    visible: false,
  });

  useLayoutEffect(() => {
    const updateIndicator = () => {
      const activeIndex = navigation.findIndex((item) =>
        item.path === "/" ? pathname === "/" : pathname.startsWith(item.path),
      );
      const activeLink = linkRefs.current[activeIndex];
      setIndicator(
        activeLink
          ? {
              left: activeLink.offsetLeft,
              width: activeLink.offsetWidth,
              visible: true,
            }
          : { left: 0, width: 0, visible: false },
      );
    };

    updateIndicator();
    window.addEventListener("resize", updateIndicator);
    return () => window.removeEventListener("resize", updateIndicator);
  }, [pathname]);

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-[#090b0e]/95 text-white shadow-[0_8px_30px_rgba(0,0,0,0.22)] backdrop-blur-xl">
      <div className="mx-auto flex h-[72px] max-w-[1280px] items-center gap-7 px-5 sm:px-7">
        <NavLink
          className="flex shrink-0 items-center gap-3 no-underline"
          to="/"
          onClick={() => setOpen(false)}
        >
          <span className="grid size-12 place-items-center rounded-2xl border border-[#788aff]/30 bg-[linear-gradient(145deg,rgba(120,138,255,.16),rgba(255,255,255,.025))] text-[#91a0ff] shadow-[inset_0_1px_0_rgba(255,255,255,.12),0_8px_24px_rgba(0,0,0,.28)] backdrop-blur-xl">
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
            "absolute left-0 right-0 top-[72px] flex-col border-b border-white/10 bg-[#0c0f13]/98 p-3 shadow-xl backdrop-blur-2xl md:relative md:left-auto md:right-auto md:top-auto md:flex md:flex-row md:items-center md:gap-1 md:rounded-full md:border md:border-white/[0.13] md:bg-[linear-gradient(135deg,rgba(255,255,255,.07),rgba(255,255,255,.018))] md:p-1 md:shadow-[inset_0_1px_0_rgba(255,255,255,.08),0_12px_30px_rgba(0,0,0,.28)]",
            open ? "flex" : "hidden md:flex",
          )}
        >
          <span
            aria-hidden="true"
            className="pointer-events-none absolute bottom-1 top-1 hidden overflow-hidden rounded-full border border-[#aab4ff]/55 bg-[linear-gradient(135deg,rgba(159,171,255,.96),rgba(102,121,245,.9)_58%,rgba(132,147,255,.94))] shadow-[inset_0_1px_0_rgba(255,255,255,.48),inset_0_-1px_0_rgba(31,42,129,.26),0_6px_20px_rgba(94,115,255,.2)] transition-[transform,width,opacity] duration-500 ease-[cubic-bezier(.22,1,.36,1)] motion-reduce:transition-none md:block"
            style={{
              opacity: indicator.visible ? 1 : 0,
              transform: `translateX(${indicator.left}px)`,
              width: indicator.width,
            }}
          >
            <span className="absolute inset-x-[18%] top-px h-[45%] rounded-full bg-white/40 blur-[3px]" />
          </span>
          {navigation.map((item, index) => (
            <NavLink
              ref={(node) => {
                linkRefs.current[index] = node;
              }}
              className={({ isActive }) =>
                cx(
                  "relative z-10 overflow-hidden rounded-full px-3.5 py-2.5 text-xs font-bold no-underline transition-[color,background-color,transform] duration-300 active:scale-[.97] md:py-2",
                  isActive
                    ? "bg-[linear-gradient(145deg,rgba(159,171,255,.98),rgba(102,121,245,.9))] text-[#090b0e] shadow-[inset_0_1px_0_rgba(255,255,255,.5),0_8px_20px_rgba(94,115,255,.18)] md:bg-transparent md:shadow-none"
                    : "text-[#adc1c1] hover:bg-white/[0.08] hover:text-white md:hover:bg-white/[0.07]",
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
        <div className="ml-auto hidden items-center gap-3 rounded-full border border-white/15 bg-white/[0.07] px-3.5 py-2 shadow-[inset_0_1px_0_rgba(255,255,255,.1)] backdrop-blur-xl lg:flex">
          <span className="size-2 rounded-full bg-[#9bd67d] shadow-[0_0_0_5px_rgba(155,214,125,0.1)]" />
          <span className="flex flex-col leading-none">
            <span className="whitespace-nowrap text-[9px] font-bold uppercase tracking-[0.12em] text-[#8fa9aa]">
              Weekly data refresh
            </span>
            <time
              className="mt-1 whitespace-nowrap text-[11px] font-semibold text-[#d8e7e5]"
              dateTime={summary.sourceRetrievedAt}
            >
              {shortDate(summary.sourceRetrievedAt.slice(0, 10))}
            </time>
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
