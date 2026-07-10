import { useEffect, useMemo, useState } from 'react'
import { Activity, ArrowRight, Building2, CalendarClock, Database, ExternalLink, FlaskConical, GitCompareArrows, Menu, Radar, Search, ShieldCheck, Sparkles, Target, X } from 'lucide-react'
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Badge, MetricCard, SearchBox, SectionHeading, SourceNote, TrialDrawer, Verified } from './components'
import { activeStatuses, cx, prettyEnum, shortDate } from './lib'
import type { Asset, ChangeEvent, RegulatoryEvent, Summary, Trial } from './types'

type View = 'radar' | 'pipeline' | 'trials' | 'assets' | 'regulatory' | 'methodology'
const nav: { id: View; label: string }[] = [
  { id: 'radar', label: 'Radar' }, { id: 'pipeline', label: 'Landscape' }, { id: 'trials', label: 'Trials' },
  { id: 'assets', label: 'Assets' }, { id: 'regulatory', label: 'Regulatory' }, { id: 'methodology', label: 'Methodology' },
]

function useData() {
  const [data, setData] = useState<{ summary: Summary; trials: Trial[]; assets: Asset[]; changes: ChangeEvent[]; regulatory: RegulatoryEvent[] } | null>(null)
  const [error, setError] = useState('')
  useEffect(() => {
    Promise.all(['summary', 'trials', 'assets', 'changes', 'regulatory'].map(name => fetch(`/data/${name}.json`).then(r => { if (!r.ok) throw new Error(`${name}: ${r.status}`); return r.json() })))
      .then(([summary, trials, assets, changes, regulatory]) => setData({ summary, trials, assets, changes, regulatory }))
      .catch(e => setError(e.message))
  }, [])
  return { data, error }
}

export function App() {
  const { data, error } = useData()
  const [view, setView] = useState<View>('radar')
  const [mobileNav, setMobileNav] = useState(false)
  useEffect(() => { const hash = location.hash.slice(1) as View; if (nav.some(n => n.id === hash)) setView(hash) }, [])
  function navigate(next: View) { setView(next); location.hash = next; setMobileNav(false); window.scrollTo({ top: 0, behavior: 'smooth' }) }
  if (error) return <main className="load-state"><Database /><h1>Data could not be loaded</h1><p>{error}</p></main>
  if (!data) return <main className="load-state"><Radar className="spin" /><h1>Calibrating landscape radar</h1><p>Loading the latest validated public-source snapshot…</p></main>
  return <>
    <header className="topbar">
      <button className="brand" onClick={() => navigate('radar')}><span className="brand-mark"><Radar size={20} /></span><span>Myeloma<br /><strong>Landscape Radar</strong></span></button>
      <nav className={cx('main-nav', mobileNav && 'nav-open')}>{nav.map(item => <button key={item.id} onClick={() => navigate(item.id)} className={view === item.id ? 'active' : ''}>{item.label}</button>)}</nav>
      <div className="topbar-meta"><span className="live-dot" />Data current · {shortDate(data.summary.sourceRetrievedAt.slice(0, 10))}</div>
      <button className="mobile-menu" aria-label="Menu" onClick={() => setMobileNav(!mobileNav)}>{mobileNav ? <X /> : <Menu />}</button>
    </header>
    <main>
      {view === 'radar' && <RadarView {...data} onNavigate={navigate} />}
      {view === 'pipeline' && <PipelineView summary={data.summary} assets={data.assets} />}
      {view === 'trials' && <TrialsView trials={data.trials} />}
      {view === 'assets' && <AssetsView assets={data.assets} />}
      {view === 'regulatory' && <RegulatoryView events={data.regulatory} />}
      {view === 'methodology' && <MethodologyView summary={data.summary} />}
    </main>
    <footer><div><Radar size={18} /><strong>Myeloma Landscape Radar</strong></div><p>Open public-data intelligence. Not medical, regulatory or investment advice.</p><a href="https://clinicaltrials.gov" target="_blank" rel="noreferrer">Primary data: ClinicalTrials.gov <ExternalLink size={13} /></a></footer>
  </>
}

function RadarView({ summary, changes, regulatory, onNavigate }: { summary: Summary; trials: Trial[]; assets: Asset[]; changes: ChangeEvent[]; regulatory: RegulatoryEvent[]; onNavigate: (v: View) => void }) {
  const highSignals = changes.filter(c => c.severity === 'high').length
  return <>
    <section className="hero">
      <div className="hero-grid-overlay" />
      <div className="hero-copy"><span className="eyebrow light"><Sparkles size={14} /> Public-source competitive intelligence</span><h1>See where the myeloma landscape is <em>moving.</em></h1><p>A source-linked view of trials, assets, sponsors and regulatory events—structured to surface material change, not noise.</p><div className="hero-actions"><button className="primary-button light-button" onClick={() => onNavigate('trials')}>Explore active trials <ArrowRight size={16} /></button><button className="ghost-button" onClick={() => onNavigate('methodology')}>How we classify data</button></div></div>
      <div className="radar-visual" aria-hidden="true"><div className="radar-ring r1" /><div className="radar-ring r2" /><div className="radar-ring r3" /><div className="radar-sweep" /><i className="blip b1" /><i className="blip b2" /><i className="blip b3" /><span>LIVE<br />LANDSCAPE</span></div>
    </section>
    <section className="metrics-wrap">
      <MetricCard label="Active trials" value={summary.activeTrialCount.toLocaleString()} note={`${summary.recruitingTrialCount.toLocaleString()} currently recruiting`} accent />
      <MetricCard label="Tracked assets" value={summary.assetCount.toLocaleString()} note="Drug and biological interventions" />
      <MetricCard label="Phase 2/3 active" value={summary.phase23ActiveCount.toLocaleString()} note="Mid- and late-stage studies" />
      <MetricCard label="High-signal changes" value={highSignals} note="In the current observation window" />
    </section>
    <section className="content-section split-section">
      <div className="main-column"><SectionHeading eyebrow="Change radar" title="What deserves attention" copy="Rule-based signals from the latest accepted public-data snapshot." action={<button className="text-button" onClick={() => onNavigate('trials')}>View all trials <ArrowRight size={15} /></button>} />
        <div className="signal-list">{changes.slice(0, 8).map(change => <article className="signal" key={change.id}><div className={`signal-icon severity-${change.severity}`}>{change.type === 'STATUS_CHANGE' ? <GitCompareArrows /> : change.type === 'NEW_STUDY' ? <FlaskConical /> : <Activity />}</div><div><div className="signal-meta"><Badge tone={change.severity === 'high' ? 'amber' : change.severity === 'medium' ? 'blue' : 'neutral'}>{change.severity} signal</Badge><span>{shortDate(change.date)}</span></div><h3>{change.title}</h3><p>{change.detail}</p><a href={change.sourceUrl} target="_blank" rel="noreferrer">Source record <ExternalLink size={13} /></a></div></article>)}</div>
      </div>
      <aside className="side-column"><div className="panel dark-panel"><span className="eyebrow light">Upcoming readouts</span><h2>Primary completion milestones</h2>{summary.upcomingMilestones.slice(0, 5).map(m => <div className="milestone" key={m.nctId}><div className="milestone-date"><strong>{new Date(`${m.date.slice(0, 7)}-01`).toLocaleString('en-US', { month: 'short' })}</strong><span>{m.date.slice(0, 4)}</span></div><div><Badge>{prettyEnum(m.phase)}</Badge><h4>{m.title}</h4><span>{m.sponsor}</span></div></div>)}<SourceNote>Dates are registry estimates and may change.</SourceNote></div>
        <div className="panel regulatory-teaser"><div className="panel-icon"><ShieldCheck /></div><span className="eyebrow">Regulatory watch</span><h2>{regulatory[0]?.title}</h2><p>{regulatory[0]?.detail}</p><button className="text-button" onClick={() => onNavigate('regulatory')}>View regulatory timeline <ArrowRight size={15} /></button></div>
      </aside>
    </section>
  </>
}

function PipelineView({ summary, assets }: { summary: Summary; assets: Asset[] }) {
  const colors = ['#17a48b', '#f0a63a', '#476e78', '#bb5e54', '#86a1a8', '#d6bf76']
  return <section className="page-shell"><PageIntro eyebrow="Landscape" title="Pipeline structure at a glance" copy="Active interventional studies grouped through a myeloma-specific asset, target and modality ontology." />
    <div className="chart-grid"><article className="chart-panel wide"><h3>Active trial mix by development phase</h3><p>Phase 2 activity remains the broadest layer of the current registered landscape.</p><div className="chart-box"><ResponsiveContainer width="100%" height="100%"><BarChart data={summary.countsByPhase}><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#dfe6e4" /><XAxis dataKey="name" tick={{ fill: '#6b7d7f', fontSize: 12 }} axisLine={false} tickLine={false} /><YAxis tick={{ fill: '#6b7d7f', fontSize: 12 }} axisLine={false} tickLine={false} /><Tooltip cursor={{ fill: '#f1f5f3' }} /><Bar dataKey="value" fill="#17a48b" radius={[6, 6, 0, 0]} /></BarChart></ResponsiveContainer></div></article>
      <article className="chart-panel"><h3>Target concentration</h3><p>Share of active asset-linked trials.</p><div className="donut-wrap"><div className="chart-box donut"><ResponsiveContainer><PieChart><Pie data={summary.countsByTarget.slice(0, 6)} dataKey="value" nameKey="name" innerRadius={58} outerRadius={86} paddingAngle={2}>{summary.countsByTarget.slice(0, 6).map((_, i) => <Cell key={i} fill={colors[i % colors.length]} />)}</Pie><Tooltip /></PieChart></ResponsiveContainer></div><div className="legend">{summary.countsByTarget.slice(0, 6).map((d, i) => <span key={d.name}><i style={{ background: colors[i] }} />{d.name}<strong>{d.value}</strong></span>)}</div></div></article></div>
    <SectionHeading eyebrow="Asset matrix" title="Leading active programs" copy="Ranked by active trial count; phase represents the highest registered phase." />
    <div className="asset-matrix">{assets.slice(0, 18).map(asset => <article key={asset.id}><div className="asset-top"><span className="target-mark"><Target size={16} /></span><Badge tone="blue">{prettyEnum(asset.highestPhase)}</Badge></div><h3>{asset.name}</h3><p>{asset.modality} · {asset.target}</p><div className="asset-stats"><span><strong>{asset.activeTrialCount}</strong> active</span><span><strong>{asset.recruitingTrialCount}</strong> recruiting</span></div><div className="phase-track"><i style={{ width: `${Math.min(100, asset.activeTrialCount * 8 + 12)}%` }} /></div></article>)}</div>
    <SourceNote>Counts reflect records matching the documented disease query. Classification is deterministic and may not capture every novel target or modality.</SourceNote>
  </section>
}

function TrialsView({ trials }: { trials: Trial[] }) {
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('ACTIVE')
  const [phase, setPhase] = useState('ALL')
  const [selected, setSelected] = useState<Trial | null>(null)
  const filtered = useMemo(() => trials.filter(t => {
    const haystack = `${t.nctId} ${t.title} ${t.sponsor} ${t.interventions.map(i => i.canonicalName).join(' ')}`.toLowerCase()
    return (!query || haystack.includes(query.toLowerCase())) && (status === 'ALL' || status === 'ACTIVE' && t.studyType === 'INTERVENTIONAL' && activeStatuses.has(t.status) || t.status === status) && (phase === 'ALL' || t.phases.includes(phase))
  }).slice(0, 250), [trials, query, status, phase])
  useEffect(() => { const handler = (e: KeyboardEvent) => { if (e.key === '/' && document.activeElement?.tagName !== 'INPUT') { e.preventDefault(); document.querySelector<HTMLInputElement>('.search-box input')?.focus() } }; addEventListener('keydown', handler); return () => removeEventListener('keydown', handler) }, [])
  return <section className="page-shell"><PageIntro eyebrow="Trial explorer" title="Interrogate the registered landscape" copy="Filter structured ClinicalTrials.gov records and open any row for source-linked detail." />
    <div className="toolbar"><SearchBox value={query} onChange={setQuery} placeholder="Search title, sponsor, intervention or NCT ID" /><label>Status<select value={status} onChange={e => setStatus(e.target.value)}><option value="ACTIVE">Active studies</option><option value="ALL">All statuses</option><option value="RECRUITING">Recruiting</option><option value="COMPLETED">Completed</option><option value="TERMINATED">Terminated</option></select></label><label>Phase<select value={phase} onChange={e => setPhase(e.target.value)}><option value="ALL">All phases</option><option value="PHASE1">Phase 1</option><option value="PHASE2">Phase 2</option><option value="PHASE3">Phase 3</option><option value="PHASE4">Phase 4</option></select></label></div>
    <div className="result-meta"><strong>{filtered.length.toLocaleString()}</strong> records shown <span>· capped at 250 for browser performance</span></div>
    <div className="table-wrap"><table><thead><tr><th>Study</th><th>Phase</th><th>Status</th><th>Sponsor</th><th>Primary completion</th></tr></thead><tbody>{filtered.map(trial => <tr key={trial.nctId} onClick={() => setSelected(trial)}><td><span className="nct">{trial.nctId}</span><strong>{trial.title}</strong><small>{trial.interventions.slice(0, 3).map(i => i.canonicalName).join(' · ')}</small></td><td>{trial.phases.map(p => <Badge key={p} tone="blue">{prettyEnum(p)}</Badge>)}</td><td><Badge tone={trial.status === 'RECRUITING' ? 'teal' : trial.status === 'TERMINATED' ? 'red' : 'neutral'}>{prettyEnum(trial.status)}</Badge></td><td>{trial.sponsor}</td><td>{shortDate(trial.primaryCompletionDate)}</td></tr>)}</tbody></table></div>
    <TrialDrawer trial={selected} onClose={() => setSelected(null)} />
  </section>
}

function AssetsView({ assets }: { assets: Asset[] }) {
  const [query, setQuery] = useState('')
  const filtered = assets.filter(a => `${a.name} ${a.target} ${a.modality} ${a.sponsors.join(' ')}`.toLowerCase().includes(query.toLowerCase()))
  return <section className="page-shell"><PageIntro eyebrow="Asset intelligence" title="Therapy-centric, not trial-centric" copy="Normalized drug and biological interventions connected across studies, aliases, targets and sponsors." /><div className="toolbar single"><SearchBox value={query} onChange={setQuery} placeholder="Search asset, target, modality or sponsor" /></div><div className="asset-list">{filtered.slice(0, 100).map(asset => <article key={asset.id}><div className="asset-letter">{asset.name[0]}</div><div className="asset-body"><div className="asset-title-row"><h3>{asset.name}</h3><Badge tone="blue">{prettyEnum(asset.highestPhase)}</Badge></div><p>{asset.modality} <span>·</span> {asset.target}</p><div className="chip-row">{asset.sponsors.slice(0, 3).map(s => <span key={s}><Building2 size={12} />{s}</span>)}</div></div><div className="asset-numbers"><span><strong>{asset.activeTrialCount}</strong>Active trials</span><span><strong>{asset.recruitingTrialCount}</strong>Recruiting</span></div></article>)}</div></section>
}

function RegulatoryView({ events }: { events: RegulatoryEvent[] }) {
  return <section className="page-shell"><PageIntro eyebrow="Regulatory timeline" title="Indication-level approval intelligence" copy="Curated, source-linked FDA events kept separate from general product approval status." /><div className="regulatory-summary"><ShieldCheck size={28} /><div><strong>{events.length} tracked milestones</strong><span>Selected recent and landscape-defining multiple myeloma actions</span></div><Verified /></div><div className="timeline">{events.map((event, i) => <article key={event.id}><div className="timeline-rail"><i />{i < events.length - 1 && <span />}</div><div className="timeline-date">{shortDate(event.date)}</div><div className="timeline-card"><div><Badge tone={event.eventType.includes('Accelerated') ? 'amber' : 'teal'}>{event.eventType}</Badge><Badge>{event.target}</Badge></div><h2>{event.title}</h2><p>{event.detail}</p><div className="timeline-footer"><strong>{event.asset}</strong><a href={event.sourceUrl} target="_blank" rel="noreferrer">FDA source <ExternalLink size={13} /></a></div></div></article>)}</div><SourceNote>This is a curated regulatory layer, not a complete substitute for Drugs@FDA, CBER resources or current prescribing information.</SourceNote></section>
}

function MethodologyView({ summary }: { summary: Summary }) {
  return <section className="page-shell narrow"><PageIntro eyebrow="Trust & methodology" title="Every insight should survive a source check" copy="The product separates retrieved facts, deterministic classifications and editorial interpretation." /><div className="method-grid"><article><Database /><h3>Public-source facts</h3><p>Trial facts are retrieved from the ClinicalTrials.gov API v2 and retain their NCT identifier, source URL, first-posted date and latest registry update.</p></article><article><Target /><h3>Transparent ontology</h3><p>Assets, targets, modalities and disease settings are assigned using version-controlled aliases and text rules. Unknowns remain visible instead of being guessed.</p></article><article><GitCompareArrows /><h3>Snapshot comparison</h3><p>After the first run, material events are computed by comparing accepted snapshots. A changed registry field is distinguished from the date we observed it.</p></article><article><ShieldCheck /><h3>Fail-closed refreshes</h3><p>Validation checks record counts, identifiers, references and required fields. A failed refresh does not overwrite the last accepted production dataset.</p></article></div>
    <div className="method-section"><h2>Current data contract</h2><dl><div><dt>Disease query</dt><dd>{summary.methodology.query}</dd></div><div><dt>Scope</dt><dd>{summary.methodology.scope}</dd></div><div><dt>Primary source</dt><dd><a href={summary.methodology.source} target="_blank" rel="noreferrer">ClinicalTrials.gov API v2 <ExternalLink size={13} /></a></dd></div><div><dt>Dataset version</dt><dd><code>{summary.datasetVersion}</code></dd></div><div><dt>Retrieved</dt><dd>{new Date(summary.sourceRetrievedAt).toLocaleString()}</dd></div></dl></div>
    <div className="disclaimer"><ShieldCheck /><div><h3>Appropriate use</h3><p>This project supports public-data landscape exploration. It is not medical advice, clinical decision support, regulatory advice, investment advice or a validated commercial intelligence product. Registry records may be incomplete, delayed or changed by their sponsors.</p></div></div>
  </section>
}

function PageIntro({ eyebrow, title, copy }: { eyebrow: string; title: string; copy: string }) { return <div className="page-intro"><span className="eyebrow">{eyebrow}</span><h1>{title}</h1><p>{copy}</p></div> }
