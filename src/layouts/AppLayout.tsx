import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Footer } from "../components/layout/Footer";
import { Header } from "../components/layout/Header";

export function AppLayout() {
  const location = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [location.pathname]);
  return (
    <div className="min-h-screen bg-[#f4f7f4] text-[#153237]">
      <Header />
      <main>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
