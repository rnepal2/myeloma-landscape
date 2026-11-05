import { renderToString } from "react-dom/server";
import { StaticRouter } from "react-router-dom";
import { AppRoutes } from "./App";
import { SnapshotProvider, type AppData } from "./context/AppDataContext";
export function render(path: string, data: AppData) {
  return renderToString(
    <StaticRouter location={path}>
      <SnapshotProvider data={data}>
        <AppRoutes />
      </SnapshotProvider>
    </StaticRouter>,
  );
}
