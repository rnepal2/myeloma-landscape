import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { Database, Radar } from "lucide-react";
import type {
  Asset,
  ChangeEvent,
  Evidence,
  MarketContext,
  RegulatoryEvent,
  StrategicIntelligence,
  Summary,
  Trial,
} from "../types";

export type AppData = {
  summary: Summary;
  trials: Trial[];
  assets: Asset[];
  changes: ChangeEvent[];
  regulatory: RegulatoryEvent[];
  evidence: Evidence;
  market: MarketContext;
  strategic: StrategicIntelligence;
};

const AppDataContext = createContext<AppData | null>(null);
const dataFiles = [
  "summary",
  "trials",
  "assets",
  "changes",
  "regulatory",
  "evidence",
  "market-context",
  "strategic",
] as const;

export function AppDataProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<AppData | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all(
      dataFiles.map((name) =>
        fetch(`/data/${name}.json`, { cache: "no-cache" }).then((response) => {
          if (!response.ok) throw new Error(`${name}: HTTP ${response.status}`);
          return response.json();
        }),
      ),
    )
      .then(
        ([
          summary,
          trials,
          assets,
          changes,
          regulatory,
          evidence,
          market,
          strategic,
        ]) => {
          setData({
            summary,
            trials,
            assets,
            changes,
            regulatory,
            evidence,
            market,
            strategic,
          });
        },
      )
      .catch((reason) =>
        setError(reason instanceof Error ? reason.message : String(reason)),
      );
  }, []);

  if (error)
    return (
      <main className="theme-obsidian grid min-h-screen place-content-center justify-items-center bg-[#090b0e] px-6 text-center text-[#f0f1ee]">
        <Database className="text-[#dc7772]" size={34} />
        <h1 className="mt-5 [font-family:Newsreader] text-4xl">
          Data could not be loaded
        </h1>
        <p className="mt-2 text-sm text-[#9ba3aa]">{error}</p>
      </main>
    );
  if (!data)
    return (
      <main className="theme-obsidian grid min-h-screen place-content-center justify-items-center bg-[#090b0e] px-6 text-center text-[#f0f1ee]">
        <span className="grid size-16 place-items-center rounded-2xl border border-[#788aff]/25 bg-[#788aff]/[0.06] shadow-[inset_0_1px_0_rgba(255,255,255,.06),0_18px_60px_rgba(0,0,0,.28)]">
          <Radar
            className="animate-[spin_2.4s_linear_infinite] text-[#91a0ff]"
            size={30}
          />
        </span>
        <p className="mt-4 text-[11px] font-bold uppercase tracking-[0.16em] text-[#9ba3aa]">
          Loading data
        </p>
      </main>
    );

  return (
    <AppDataContext.Provider value={data}>{children}</AppDataContext.Provider>
  );
}

export function useAppData() {
  const context = useContext(AppDataContext);
  if (!context)
    throw new Error("useAppData must be used within AppDataProvider");
  return context;
}
