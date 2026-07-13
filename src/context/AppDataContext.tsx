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
      <main className="grid min-h-screen place-content-center justify-items-center bg-[#f4f7f4] px-6 text-center text-[#0b292f]">
        <Database className="text-[#b85c55]" size={34} />
        <h1 className="mt-5 [font-family:Newsreader] text-4xl">
          Data could not be loaded
        </h1>
        <p className="mt-2 text-sm text-[#65797b]">{error}</p>
      </main>
    );
  if (!data)
    return (
      <main className="grid min-h-screen place-content-center justify-items-center bg-[#f4f7f4] px-6 text-center text-[#0b292f]">
        <Radar className="animate-spin text-[#158c77]" size={34} />
        <h1 className="mt-5 [font-family:Newsreader] text-4xl">
          Calibrating the landscape
        </h1>
        <p className="mt-2 text-sm text-[#65797b]">
          Loading the latest validated public-source snapshot…
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
