import { useEffect } from "react";
import { useLocation } from "react-router-dom";
const pages: Record<string, [string, string]> = {
  "/": [
    "Myeloma Landscape — trials and research updates",
    "Explore multiple myeloma studies by therapy and target, with weekly registry changes and links to public sources.",
  ],
  "/pipeline": [
    "Therapies and targets | Myeloma Landscape",
    "Browse myeloma therapy and intervention records and explore their linked active studies.",
  ],
  "/trials": [
    "Clinical studies | Myeloma Landscape",
    "Search and filter multiple myeloma clinical studies by therapy, target, phase, status and country.",
  ],
  "/evidence": [
    "Literature and funding | Myeloma Landscape",
    "Explore a recent PubMed citation sample and title-matched NIH project and award records for multiple myeloma.",
  ],
  "/regulatory": [
    "Regulatory sources | Myeloma Landscape",
    "Review selected FDA approval notifications, DailyMed labels, EMA records and FDA shortage records.",
  ],
  "/methodology": [
    "Sources and limitations | Myeloma Landscape",
    "Read source coverage, retrieval status, definitions and limitations for Myeloma Landscape.",
  ],
};
export function PageMetadata() {
  const { pathname } = useLocation();
  useEffect(() => {
    const [title, description] = pages[pathname] ?? pages["/"];
    document.title = title;
    document
      .querySelector('meta[name="description"]')
      ?.setAttribute("content", description);
    let canonical = document.querySelector<HTMLLinkElement>(
      'link[rel="canonical"]',
    );
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.rel = "canonical";
      document.head.append(canonical);
    }
    canonical.href = `https://myeloma-landscape.pages.dev${pathname === "/" ? "/" : pathname}`;
  }, [pathname]);
  return null;
}
