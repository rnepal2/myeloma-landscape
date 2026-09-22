import { ExternalLink, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";
import { LandscapeMark } from "../brand/LandscapeMark";

const sources = [
  ["ClinicalTrials.gov", "https://clinicaltrials.gov/"],
  [
    "FDA Oncology",
    "https://www.fda.gov/drugs/resources-information-approved-drugs/oncology-cancerhematologic-malignancies-approval-notifications",
  ],
  ["PubMed", "https://pubmed.ncbi.nlm.nih.gov/"],
  ["NIH RePORTER", "https://reporter.nih.gov/"],
  ["DailyMed", "https://dailymed.nlm.nih.gov/dailymed/"],
  ["EMA Medicines", "https://www.ema.europa.eu/en/medicines"],
] as const;

export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-[#0d1015] text-[#9bb0b1]">
      <div className="mx-auto grid max-w-[1200px] gap-10 px-6 py-12 md:grid-cols-[1.15fr_.85fr_1.2fr]">
        <div className="flex items-start gap-3.5">
          <span className="grid size-11 shrink-0 place-items-center rounded-2xl border border-[#788aff]/30 bg-[linear-gradient(145deg,rgba(120,138,255,.16),rgba(255,255,255,.025))] text-[#91a0ff] shadow-[inset_0_1px_0_rgba(255,255,255,.12)]">
            <LandscapeMark className="size-7" />
          </span>
          <div>
            <strong className="block text-[15px] text-[#e3efed]">
              Myeloma Intelligence
            </strong>
            <p className="mt-2 max-w-sm text-[13px] leading-6">
              Public-source records for multiple myeloma trials, therapies,
              publications, funding, regulatory actions, labels, and supply.
            </p>
            <p className="mt-3 max-w-sm text-[11px] leading-5 text-[#859b9d]">
              An independent project, not affiliated with or endorsed by Johnson
              &amp; Johnson or the listed data providers.
            </p>
          </div>
        </div>
        <div>
          <h3 className="mb-3 text-[11px] font-extrabold uppercase tracking-[0.12em] text-[#d9e8e5]">
            Methodology
          </h3>
          <p className="text-[13px] leading-6">
            Definitions, source scope, refresh rules, and limitations for every
            dataset on the site.
          </p>
          <Link
            className="mt-4 inline-flex items-center gap-2 text-xs font-bold text-[#91a0ff] no-underline hover:text-white"
            to="/methodology"
          >
            <ShieldCheck size={15} />
            Methodology and limitations
          </Link>
        </div>
        <div>
          <h3 className="mb-3 text-[11px] font-extrabold uppercase tracking-[0.12em] text-[#d9e8e5]">
            Evidence references
          </h3>
          <div className="grid grid-cols-2 gap-x-5 gap-y-2.5">
            {sources.map(([label, href]) => (
              <a
                className="inline-flex items-center gap-1.5 text-[12px] text-[#b4c7c7] no-underline transition hover:text-[#91a0ff]"
                href={href}
                key={label}
                rel="noreferrer"
                target="_blank"
              >
                {label}
                <ExternalLink size={11} />
              </a>
            ))}
          </div>
          <p className="mt-4 text-[11px] leading-5 text-[#859b9d]">
            NCBI does not warrant its content or endorse products or services.
            PubMed citation text may have third-party copyright.{" "}
            <a
              className="text-[#91a0ff] underline decoration-[#91a0ff]/40 underline-offset-2 hover:text-white"
              href="https://www.ncbi.nlm.nih.gov/home/about/policies/"
              rel="noreferrer"
              target="_blank"
            >
              NCBI disclaimer and copyright
            </a>
            .
          </p>
        </div>
      </div>
    </footer>
  );
}
