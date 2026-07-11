import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AppDataProvider } from "./context/AppDataContext";
import { AppLayout } from "./layouts/AppLayout";
import { EvidencePage } from "./pages/EvidencePage";
import { MethodologyPage } from "./pages/MethodologyPage";
import { OverviewPage } from "./pages/OverviewPage";
import { PipelinePage } from "./pages/PipelinePage";
import { RegulatoryPage } from "./pages/RegulatoryPage";
import { TrialsPage } from "./pages/TrialsPage";

export function App() {
  return (
    <BrowserRouter>
      <AppDataProvider>
        <Routes>
          <Route element={<AppLayout />}>
            <Route index element={<OverviewPage />} />
            <Route path="pipeline" element={<PipelinePage />} />
            <Route path="trials" element={<TrialsPage />} />
            <Route path="evidence" element={<EvidencePage />} />
            <Route path="regulatory" element={<RegulatoryPage />} />
            <Route path="methodology" element={<MethodologyPage />} />
            <Route path="*" element={<Navigate replace to="/" />} />
          </Route>
        </Routes>
      </AppDataProvider>
    </BrowserRouter>
  );
}
