import { ArrowUpRight, CheckCircle2, CircleDot, ExternalLink, Info, Search, SlidersHorizontal, X } from 'lucide-react'
import type { ReactNode } from 'react'
import { useEffect } from 'react'
import { cx, prettyEnum, shortDate } from './lib'
import type { Trial } from './types'

export function Badge({ children, tone = 'neutral' }: { children: ReactNode; tone?: 'neutral' | 'teal' | 'amber' | 'red' | 'blue' }) {
  return <span className={`badge badge-${tone}`}>{children}</span>
}

export function MetricCard({ label, value, note, accent }: { label: string; value: string | number; note: string; accent?: boolean }) {
  return <article className={cx('metric-card', accent && 'metric-accent')}>
    <div className="metric-label"><CircleDot size={14} />{label}</div>
    <strong>{value}</strong>
    <p>{note}</p>
  </article>
}

export function SectionHeading({ eyebrow, title, copy, action }: { eyebrow?: string; title: string; copy?: string; action?: ReactNode }) {
  return <div className="section-heading">
    <div>{eyebrow && <span className="eyebrow">{eyebrow}</span>}<h2>{title}</h2>{copy && <p>{copy}</p>}</div>
    {action}
  </div>
}

export function SourceNote({ children }: { children: ReactNode }) {
  return <div className="source-note"><Info size={14} />{children}</div>
}

export function TrialDrawer({ trial, onClose }: { trial: Trial | null; onClose: () => void }) {
  useEffect(() => {
    if (!trial) return
    const close = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose() }
    addEventListener('keydown', close); document.body.style.overflow = 'hidden'
    return () => { removeEventListener('keydown', close); document.body.style.overflow = '' }
  }, [trial, onClose])
  if (!trial) return null
  return <div className="drawer-scrim" onMouseDown={onClose} role="presentation">
    <aside className="drawer" onMouseDown={e => e.stopPropagation()} aria-label="Trial detail">
      <button className="icon-button drawer-close" onClick={onClose} aria-label="Close"><X size={20} /></button>
      <div className="drawer-kicker">{trial.nctId}</div>
      <h2>{trial.title}</h2>
      <div className="badge-row">
        <Badge tone={trial.status === 'RECRUITING' ? 'teal' : 'neutral'}>{prettyEnum(trial.status)}</Badge>
        {trial.phases.map(phase => <Badge tone="blue" key={phase}>{prettyEnum(phase)}</Badge>)}
        <Badge>{trial.setting}</Badge>
      </div>
      <dl className="detail-grid">
        <div><dt>Lead sponsor</dt><dd>{trial.sponsor}</dd></div>
        <div><dt>Enrollment</dt><dd>{trial.enrollment?.toLocaleString() ?? 'Not reported'}</dd></div>
        <div><dt>Start</dt><dd>{shortDate(trial.startDate)}</dd></div>
        <div><dt>Primary completion</dt><dd>{shortDate(trial.primaryCompletionDate)}</dd></div>
        <div><dt>Last updated</dt><dd>{shortDate(trial.lastUpdated)}</dd></div>
        <div><dt>Results posted</dt><dd>{trial.hasResults ? 'Yes' : 'No'}</dd></div>
      </dl>
      <h3>Interventions</h3>
      <div className="intervention-list">{trial.interventions.map((item, i) => <div key={`${item.name}-${i}`}><strong>{item.canonicalName}</strong><span>{[item.modality, item.target].filter(Boolean).join(' · ') || prettyEnum(item.type)}</span></div>)}</div>
      {trial.briefSummary && <><h3>Study summary</h3><p className="drawer-copy">{trial.briefSummary}</p></>}
      <a className="primary-button" href={trial.sourceUrl} target="_blank" rel="noreferrer">Open source record <ExternalLink size={16} /></a>
    </aside>
  </div>
}

export function SearchBox({ value, onChange, placeholder = 'Search trials, assets or sponsors' }: { value: string; onChange: (value: string) => void; placeholder?: string }) {
  return <label className="search-box"><Search size={17} /><input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} /><kbd>/</kbd></label>
}

export function FilterButton({ children }: { children: ReactNode }) { return <button className="filter-button"><SlidersHorizontal size={15} />{children}</button> }

export function Verified() { return <span className="verified"><CheckCircle2 size={14} />Source linked</span> }
export function InlineLink({ href, children }: { href: string; children: ReactNode }) { return <a href={href} target="_blank" rel="noreferrer" className="inline-link">{children}<ArrowUpRight size={13} /></a> }
