import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Footer } from "../components/layout/Footer";
import { Header } from "../components/layout/Header";
import { PageMetadata } from "../components/layout/PageMetadata";

export function AppLayout() {
  const location = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [location.pathname]);
  return (
    <div className="theme-obsidian min-h-screen bg-[#090b0e] text-[#f0f1ee]">
      <PageMetadata />
      <Header />
      <main>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
