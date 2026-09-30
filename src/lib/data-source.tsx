import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type DataSource = "seeded" | "uploaded";

const Ctx = createContext<{ source: DataSource; setSource: (s: DataSource) => void }>({
  source: "seeded",
  setSource: () => {},
});

const KEY = "brite-data-source";

export function DataSourceProvider({ children }: { children: ReactNode }) {
  const [source, setSourceState] = useState<DataSource>("seeded");
  useEffect(() => {
    const saved = window.localStorage.getItem(KEY);
    if (saved === "uploaded" || saved === "seeded") setSourceState(saved);
  }, []);
  const setSource = (s: DataSource) => {
    setSourceState(s);
    window.localStorage.setItem(KEY, s);
  };
  return <Ctx.Provider value={{ source, setSource }}>{children}</Ctx.Provider>;
}

export const useDataSource = () => useContext(Ctx);
