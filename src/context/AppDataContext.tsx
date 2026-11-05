import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { useLocation } from "react-router-dom";
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
  SourceManifest,
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
  sources: SourceManifest;
};
const AppDataContext = createContext<AppData | null>(null);
const filenames: Record<keyof AppData, string> = {
  summary: "summary",
  trials: "trials",
  assets: "assets",
  changes: "changes",
  regulatory: "regulatory",
  evidence: "evidence",
  market: "market-context",
  strategic: "strategic",
  sources: "sources",
};
const requests = new Map<string, Promise<unknown>>();
export function routeKeys(pathname: string): (keyof AppData)[] {
  pathname = pathname.replace(/\/$/, "") || "/";
  const keys: (keyof AppData)[] = [
    "summary",
    "strategic",
    "changes",
    "sources",
  ];
  if (["/pipeline", "/trials"].includes(pathname))
    keys.push("trials", "assets");
  if (["/evidence", "/methodology"].includes(pathname)) keys.push("evidence");
  if (["/regulatory", "/methodology"].includes(pathname)) keys.push("market");
  if (["/regulatory", "/"].includes(pathname)) keys.push("regulatory");
  return keys;
}
export async function loadRouteData(
  pathname: string,
): Promise<Partial<AppData>> {
  const entries = await Promise.all(
    routeKeys(pathname).map((key) => {
      if (!requests.has(key))
        requests.set(
          key,
          fetch(`/data/${filenames[key]}.json`, { cache: "no-cache" })
            .then((response) => {
              if (!response.ok)
                throw new Error(`${filenames[key]}: HTTP ${response.status}`);
              return response.json();
            })
            .catch((reason) => {
              requests.delete(key);
              throw reason;
            }),
        );
      return requests.get(key)!.then((value) => [key, value]);
    }),
  );
  return Object.fromEntries(entries);
}
export function SnapshotProvider({
  data,
  children,
}: {
  data: AppData;
  children: ReactNode;
}) {
  return (
    <AppDataContext.Provider value={data}>{children}</AppDataContext.Provider>
  );
}
export function AppDataProvider({
  children,
  initialData = {},
}: {
  children: ReactNode;
  initialData?: Partial<AppData>;
}) {
  const [data, setData] = useState<Partial<AppData>>(initialData);
  const [error, setError] = useState("");
  const { pathname } = useLocation();
  const required = routeKeys(pathname);
  const requestKey = required.join(",");
  useEffect(() => {
    let cancelled = false;
    setError("");
    loadRouteData(pathname)
      .then((loaded) => {
        if (!cancelled)
          setData((previous) => ({
            ...previous,
            ...loaded,
          }));
      })
      .catch((reason) => {
        if (!cancelled) setError(String(reason));
      });
    return () => {
      cancelled = true;
    };
  }, [requestKey]);
  if (error)
    return (
      <main className="theme-obsidian grid min-h-screen place-content-center justify-items-center bg-[#090b0e] px-6 text-center text-[#f0f1ee]">
        <Database size={34} />
        <h1 className="mt-5 text-3xl">Data could not be loaded</h1>
        <p className="mt-3 text-sm">Please reload to try again.</p>
        <button
          className="mt-5 rounded border border-white/20 px-4 py-2"
          onClick={() => window.location.reload()}
        >
          Reload page
        </button>
      </main>
    );
  if (!required.every((key) => key in data))
    return (
      <main
        className="theme-obsidian grid min-h-screen place-content-center justify-items-center bg-[#090b0e] text-[#f0f1ee]"
        aria-live="polite"
      >
        <Radar
          className="animate-spin motion-reduce:animate-none text-[#91a0ff]"
          size={36}
        />
        <p className="mt-4 text-xs">Loading data</p>
      </main>
    );
  return (
    <AppDataContext.Provider value={data as AppData}>
      {children}
    </AppDataContext.Provider>
  );
}
export function useAppData() {
  const context = useContext(AppDataContext);
  if (!context)
    throw new Error("useAppData must be used within AppDataProvider");
  return context;
}
