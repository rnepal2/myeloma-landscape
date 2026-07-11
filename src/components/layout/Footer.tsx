import { Radar, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";

export function Footer() {
  return (
    <footer className="bg-[#08262c] text-[#9bb0b1]">
      <div className="mx-auto grid max-w-[1200px] gap-10 px-6 py-12 md:grid-cols-[1.25fr_1fr_1fr]">
        <div className="flex items-start gap-3.5">
          <span className="grid size-10 shrink-0 place-items-center rounded-full border border-[#8fe3c5]/25 bg-[#8fe3c5]/10 text-[#8fe3c5]">
            <Radar size={19} />
          </span>
          <div>
            <strong className="block text-[15px] text-[#e3efed]">
              Myeloma Intelligence
            </strong>
            <p className="mt-2 max-w-sm text-[13px] leading-6">
              A source-linked view of clinical development, competitive
              intensity, scientific momentum, regulatory change, and operational
              context.
            </p>
          </div>
        </div>
        <div>
          <h3 className="mb-3 text-[11px] font-extrabold uppercase tracking-[0.12em] text-[#d9e8e5]">
            What this helps answer
          </h3>
          <ul className="space-y-2 text-[13px] leading-5">
            <li>Where is development activity concentrating?</li>
            <li>Which sponsors and institutions are most active?</li>
            <li>What changed, and which catalysts are approaching?</li>
          </ul>
        </div>
        <div>
          <h3 className="mb-3 text-[11px] font-extrabold uppercase tracking-[0.12em] text-[#d9e8e5]">
            Evidence and trust
          </h3>
          <p className="text-[13px] leading-6">
            ClinicalTrials.gov · FDA · PubMed · NIH RePORTER · DailyMed · EMA
          </p>
          <Link
            className="mt-4 inline-flex items-center gap-2 text-xs font-bold text-[#8fe3c5] no-underline hover:text-white"
            to="/methodology"
          >
            <ShieldCheck size={15} />
            Review methodology and limitations
          </Link>
        </div>
      </div>
    </footer>
  );
}
