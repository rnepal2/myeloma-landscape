import { useEffect, useMemo, useState } from 'react'
import { Activity, ArrowRight, Building2, Database, ExternalLink, FlaskConical, GitCompareArrows, Menu, Radar, ShieldCheck, Sparkles, Target, X } from 'lucide-react'
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Badge, MetricCard, Pagination, SearchBox, SectionHeading, SegmentedControl, SourceNote, TrialDrawer, Verified } from './components'
import { activeStatuses, cx, prettyEnum, shortDate } from './lib'
import type { Asset, ChangeEvent, Evidence, MarketContext, RegulatoryEvent, StrategicIntelligence, Summary, Trial } from './types'

type View = 'overview' | 'pipeline' | 'trials' | 'evidence' | 'regulatory' | 'methodology'
const nav: { id: View; label: string }[] = [
  { id: 'overview', label: 'Overview' }, { id: 'pipeline', label: 'Pipeline' }, { id: 'trials', label: 'Trials' },
  { id: 'evidence', label: 'Evidence' }, { id: 'regulatory', label: 'Regulatory' },
]

function useData() {
  const [data, setData] = useState<{ summary: Summary; trials: Trial[]; assets: Asset[]; changes: ChangeEvent[]; regulatory: RegulatoryEvent[]; evidence: Evidence; market: MarketContext; strategic: StrategicIntelligence } | null>(null)
  const [error, setError] = useState('')
  useEffect(() => {
    Promise.all(['summary', 'trials', 'assets', 'changes', 'regulatory', 'evidence', 'market-context', 'strategic'].map(name => fetch(`/data/${name}.json`).then(r => { if (!r.ok) throw new Error(`${name}: ${r.status}`); return r.json() })))
      .then(([summary, trials, assets, changes, regulatory, evidence, market, strategic]) => setData({ summary, trials, assets, changes, regulatory, evidence, market, strategic }))
      .catch(e => setError(e.message))
  }, [])
  return { data, error }
}

export function App() {
  const { data, error } = useData()
  const [view, setView] = useState<View>('overview')
  const [mobileNav, setMobileNav] = useState(false)
  useEffect(() => {
    const syncHash = () => {
      const hash = location.hash.slice(1) as View
      if ([...nav, { id: 'methodology' as View, label: 'Methodology' }].some(n => n.id === hash)) setView(hash)
    }
    syncHash(); addEventListener('hashchange', syncHash)
    return () => removeEventListener('hashchange', syncHash)
  }, [])
  function navigate(next: View) { setView(next); location.hash = next; setMobileNav(false); window.scrollTo({ top: 0, behavior: 'smooth' }) }
  if (error) return <main className="load-state"><Database /><h1>Data could not be loaded</h1><p>{error}</p></main>
  if (!data) return <main className="load-state"><Radar className="spin" /><h1>Calibrating landscape radar</h1><p>Loading the latest validated public-source snapshot…</p></main>
  return <>
    <header className="topbar">
      <button className="brand" onClick={() => navigate('overview')}><span className="brand-mark"><Radar size={20} /></span><span><strong>Myeloma Intelligence</strong><small>Landscape Radar</small></span></button>
      <nav className={cx('main-nav', mobileNav && 'nav-open')}>{nav.map(item => <button key={item.id} onClick={() => navigate(item.id)} className={view === item.id ? 'active' : ''}>{item.label}</button>)}</nav>
      <div className="topbar-meta"><span className="live-dot" /><span><strong>Multi-source pulse</strong><small>Updated {shortDate(data.summary.sourceRetrievedAt.slice(0, 10))}</small></span></div>
      <button className="mobile-menu" aria-label="Menu" onClick={() => setMobileNav(!mobileNav)}>{mobileNav ? <X /> : <Menu />}</button>
    </header>
    <main>
      {view === 'overview' && <OverviewView {...data} onNavigate={navigate} />}
      {view === 'pipeline' && <PipelineView summary={data.summary} assets={data.assets} strategic={data.strategic} />}
      {view === 'trials' && <TrialsView trials={data.trials} />}
      {view === 'evidence' && <EvidenceView evidence={data.evidence} />}
      {view === 'regulatory' && <RegulatoryView events={data.regulatory} market={data.market} />}
      {view === 'methodology' && <MethodologyView summary={data.summary} />}
    </main>
    <footer className="site-footer"><div className="footer-main"><div className="footer-brand"><span className="brand-mark"><Radar size={20} /></span><div><strong>Myeloma Intelligence</strong><span>Clinical development · evidence · regulatory intelligence</span></div></div><div className="footer-column"><h3>Explore</h3>{nav.map(item => <button key={item.id} onClick={() => navigate(item.id)}>{item.label}</button>)}</div><div className="footer-column"><h3>Data trust</h3><button onClick={() => navigate('methodology')}>Methodology</button><span>ClinicalTrials.gov · FDA · PubMed</span><span>NIH · DailyMed · EMA</span></div><div className="footer-purpose"><h3>Built for landscape decisions</h3><p>A reproducible, source-linked view of competitive intensity, scientific momentum, catalysts and market context.</p></div></div><div className="footer-bottom"><span>Updated {shortDate(data.summary.sourceRetrievedAt.slice(0, 10))} · Dataset {data.summary.datasetVersion}</span><span>Research use only. Not medical, regulatory or investment advice.</span></div></footer>
  </>
}

function OverviewView({ summary, changes, regulatory, strategic, onNavigate }: { summary: Summary; trials: Trial[]; assets: Asset[]; changes: ChangeEvent[]; regulatory: RegulatoryEvent[]; evidence: Evidence; market: MarketContext; strategic: StrategicIntelligence; onNavigate: (v: View) => void }) {
  const activeTargetAssets = strategic.targetLandscape.reduce((sum, item) => sum + item.activeAssets, 0)
  return <>
    <section className="hero">
      <div className="hero-grid-overlay" />
      <div className="hero-copy"><span className="eyebrow light"><Sparkles size={14} /> Executive landscape intelligence</span><h1>Know where myeloma is moving—and <em>why it matters.</em></h1><p>Cross-source signals on competitive intensity, target momentum, catalysts, evidence, global execution and regulatory change.</p><div className="hero-actions"><button className="primary-button light-button" onClick={() => onNavigate('pipeline')}>Interrogate the pipeline <ArrowRight size={16} /></button><button className="ghost-button" onClick={() => onNavigate('methodology')}>Review the evidence model</button></div><div className="hero-sources"><span>6 public systems</span><i />Trials<i />FDA<i />PubMed<i />NIH<i />DailyMed<i />EMA</div></div>
      <div className="radar-visual" aria-hidden="true"><div className="radar-ring r1" /><div className="radar-ring r2" /><div className="radar-ring r3" /><div className="radar-sweep" /><i className="blip b1" /><i className="blip b2" /><i className="blip b3" /><span>LIVE<br />LANDSCAPE</span></div>
    </section>
    <section className="metrics-wrap">
      <MetricCard label="Active interventional trials" value={summary.activeTrialCount.toLocaleString()} note={`${summary.recruitingTrialCount.toLocaleString()} currently recruiting`} accent />
      <MetricCard label="Target-linked active assets" value={activeTargetAssets} note={`Across ${strategic.targetLandscape.length} target families`} />
      <MetricCard label="Phase 3 catalysts" value={strategic.lateStageMilestones.length} note="Primary completions inside 18 months" />
      <MetricCard label="Global trial footprint" value={strategic.geographicFootprint.length} note="Countries with active registered sites" />
    </section>
    <section className="content-section strategic-section">
      <SectionHeading eyebrow="Strategic radar" title="Six signals worth an executive conversation" copy="Reproducible screening observations across development, evidence, funding, regulatory and supply data." />
      <div className="strategic-grid">{strategic.executiveSignals.map(signal => <article className={`strategic-card tone-${signal.tone}`} key={signal.id}><div className="strategic-card-top"><span>{signal.theme}</span><i /></div><strong>{signal.metric}</strong><h3>{signal.title}</h3><p>{signal.detail}</p></article>)}</div>
    </section>
    <section className="content-section target-section">
      <SectionHeading eyebrow="Cross-source target intelligence" title="Crowding, execution and scientific attention in one matrix" copy="Clinical activity and research momentum are shown together so apparent white space is not confused with low interest." action={<button className="text-button" onClick={() => onNavigate('pipeline')}>Open full pipeline <ArrowRight size={15} /></button>} />
      <div className="target-intelligence-table"><div className="target-row target-header"><span>Target family</span><span>Active assets</span><span>Active trials</span><span>Phase 3</span><span>Sponsors</span><span>Recent evidence</span><span>Crowding</span></div>{strategic.targetLandscape.slice(0, 7).map(row => <div className="target-row" key={row.target}><strong>{row.target}</strong><span>{row.activeAssets}</span><span>{row.activeTrials}</span><span>{row.phase3Trials}</span><span>{row.sponsors}</span><span>{row.recentPublications} papers · {row.recentGrants} grants</span><span className="crowding-cell"><i><b style={{ width: `${row.crowdingScore}%` }} /></i><em>{row.crowdingScore}</em></span></div>)}</div>
      <SourceNote>{strategic.methodology}</SourceNote>
    </section>
    <section className="content-section split-section">
      <div className="main-column"><SectionHeading eyebrow="Change radar" title="What deserves attention" copy="Rule-based signals from the latest accepted public-data snapshot." action={<button className="text-button" onClick={() => onNavigate('trials')}>View all trials <ArrowRight size={15} /></button>} />
        <div className="signal-list">{changes.slice(0, 5).map(change => <article className="signal" key={change.id}><div className={`signal-icon severity-${change.severity}`}>{change.type === 'STATUS_CHANGE' ? <GitCompareArrows /> : change.type === 'NEW_STUDY' ? <FlaskConical /> : <Activity />}</div><div><div className="signal-meta"><Badge tone={change.severity === 'high' ? 'amber' : change.severity === 'medium' ? 'blue' : 'neutral'}>{change.severity} signal</Badge><span>{shortDate(change.date)}</span></div><h3>{change.title}</h3><p>{change.detail}</p><a href={change.sourceUrl} target="_blank" rel="noreferrer">Source record <ExternalLink size={13} /></a></div></article>)}</div>
      </div>
      <aside className="side-column"><div className="panel dark-panel"><span className="eyebrow light">Upcoming readouts</span><h2>Primary completion milestones</h2>{summary.upcomingMilestones.slice(0, 5).map(m => <div className="milestone" key={m.nctId}><div className="milestone-date"><strong>{new Date(`${m.date.slice(0, 7)}-01`).toLocaleString('en-US', { month: 'short' })}</strong><span>{m.date.slice(0, 4)}</span></div><div><Badge>{prettyEnum(m.phase)}</Badge><h4>{m.title}</h4><span>{m.sponsor}</span></div></div>)}<SourceNote>Dates are registry estimates and may change.</SourceNote></div>
        <div className="panel regulatory-teaser"><div className="panel-icon"><ShieldCheck /></div><span className="eyebrow">Regulatory watch</span><h2>{regulatory[0]?.title}</h2><p>{regulatory[0]?.detail}</p><button className="text-button" onClick={() => onNavigate('regulatory')}>View regulatory timeline <ArrowRight size={15} /></button></div>
      </aside>
    </section>
  </>
}

function PipelineView({ summary, assets, strategic }: { summary: Summary; assets: Asset[]; strategic: StrategicIntelligence }) {
  const colors = ['#17a48b', '#f0a63a', '#476e78', '#bb5e54', '#86a1a8', '#d6bf76']
  const [query, setQuery] = useState('')
  const [target, setTarget] = useState('ALL')
  const [page, setPage] = useState(1)
  const pageSize = 9
  const targetChart = strategic.targetLandscape.slice(0, 6).map(x => ({ name: x.target, value: x.activeTrials }))
  const targets = [...new Set(assets.filter(a => a.activeTrialCount > 0 && a.target !== 'Unclassified').map(a => a.target))].sort()
  const filtered = assets.filter(a => a.activeTrialCount > 0 && (target === 'ALL' || a.target === target) && `${a.name} ${a.target} ${a.modality} ${a.sponsors.join(' ')}`.toLowerCase().includes(query.toLowerCase()))
  const pageItems = filtered.slice((page - 1) * pageSize, page * pageSize)
  useEffect(() => setPage(1), [query, target])
  return <section className="page-shell"><PageIntro eyebrow="Landscape" title="Pipeline structure at a glance" copy="Active interventional studies grouped through a myeloma-specific asset, target and modality ontology." />
    <div className="chart-grid"><article className="chart-panel wide"><h3>Active trial mix by development phase</h3><p>Phase 2 activity remains the broadest layer of the current registered landscape.</p><div className="chart-box"><ResponsiveContainer width="100%" height="100%"><BarChart data={summary.countsByPhase}><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#dfe6e4" /><XAxis dataKey="name" tick={{ fill: '#6b7d7f', fontSize: 12 }} axisLine={false} tickLine={false} /><YAxis tick={{ fill: '#6b7d7f', fontSize: 12 }} axisLine={false} tickLine={false} /><Tooltip cursor={{ fill: '#f1f5f3' }} /><Bar dataKey="value" fill="#17a48b" radius={[6, 6, 0, 0]} /></BarChart></ResponsiveContainer></div></article>
      <article className="chart-panel"><h3>Target-family concentration</h3><p>Unique active trials, consolidated across target-specific modalities.</p><div className="donut-wrap"><div className="chart-box donut"><ResponsiveContainer><PieChart><Pie data={targetChart} dataKey="value" nameKey="name" innerRadius={58} outerRadius={86} paddingAngle={2}>{targetChart.map((_, i) => <Cell key={i} fill={colors[i % colors.length]} />)}</Pie><Tooltip /></PieChart></ResponsiveContainer></div><div className="legend">{targetChart.map((d, i) => <span key={d.name}><i style={{ background: colors[i] }} />{d.name}<strong>{d.value}</strong></span>)}</div></div></article></div>
    <div className="portfolio-strip"><article><span>Top-five sponsor share</span><strong>{strategic.top5SponsorShare}%</strong><p>of active interventional studies</p></article><article><span>Most active registry sponsor</span><strong>{strategic.topSponsors[0]?.name}</strong><p>{strategic.topSponsors[0]?.activeTrials} active trials</p></article><article><span>Largest active footprint</span><strong>{strategic.geographicFootprint[0]?.country}</strong><p>{strategic.geographicFootprint[0]?.activeTrials} active studies with a registered site</p></article></div>
    <SectionHeading eyebrow="Asset explorer" title="Find active programs without leaving the landscape" copy="Pipeline structure and asset discovery belong together. Results are ranked by active trial count." />
    <div className="toolbar pipeline-toolbar"><SearchBox value={query} onChange={setQuery} placeholder="Search asset, target, modality or sponsor" /><label>Target<select value={target} onChange={e => setTarget(e.target.value)}><option value="ALL">All classified targets</option>{targets.map(t => <option key={t}>{t}</option>)}</select></label></div>
    <div className="result-meta"><strong>{filtered.length.toLocaleString()}</strong> active programs</div>
    <div className="asset-matrix">{pageItems.map(asset => <article key={asset.id}><div className="asset-top"><span className="target-mark"><Target size={16} /></span><Badge tone="blue">{prettyEnum(asset.highestPhase)}</Badge></div><h3>{asset.name}</h3><p>{asset.modality} · {asset.target}</p><div className="chip-row">{asset.sponsors.slice(0, 2).map(s => <span key={s}><Building2 size={12} />{s}</span>)}</div><div className="asset-stats"><span><strong>{asset.activeTrialCount}</strong> active</span><span><strong>{asset.recruitingTrialCount}</strong> recruiting</span></div><div className="phase-track"><i style={{ width: `${Math.min(100, asset.activeTrialCount * 8 + 12)}%` }} /></div></article>)}</div>
    <Pagination page={page} total={filtered.length} pageSize={pageSize} onPage={setPage} label="programs" />
    <SourceNote>Counts reflect records matching the documented disease query. Classification is deterministic and may not capture every novel target or modality.</SourceNote>
  </section>
}

function TrialsView({ trials }: { trials: Trial[] }) {
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('ACTIVE')
  const [phase, setPhase] = useState('ALL')
  const [selected, setSelected] = useState<Trial | null>(null)
  const [page, setPage] = useState(1)
  const pageSize = 15
  const filtered = useMemo(() => trials.filter(t => {
    const haystack = `${t.nctId} ${t.title} ${t.sponsor} ${t.interventions.map(i => i.canonicalName).join(' ')}`.toLowerCase()
    return (!query || haystack.includes(query.toLowerCase())) && (status === 'ALL' || status === 'ACTIVE' && t.studyType === 'INTERVENTIONAL' && activeStatuses.has(t.status) || t.status === status) && (phase === 'ALL' || t.phases.includes(phase))
  }), [trials, query, status, phase])
  const pageItems = filtered.slice((page - 1) * pageSize, page * pageSize)
  useEffect(() => setPage(1), [query, status, phase])
  useEffect(() => { const handler = (e: KeyboardEvent) => { if (e.key === '/' && document.activeElement?.tagName !== 'INPUT') { e.preventDefault(); document.querySelector<HTMLInputElement>('.search-box input')?.focus() } }; addEventListener('keydown', handler); return () => removeEventListener('keydown', handler) }, [])
  return <section className="page-shell"><PageIntro eyebrow="Trial explorer" title="Interrogate the registered landscape" copy="Filter structured ClinicalTrials.gov records and open any row for source-linked detail." />
    <div className="toolbar"><SearchBox value={query} onChange={setQuery} placeholder="Search title, sponsor, intervention or NCT ID" /><label>Status<select value={status} onChange={e => setStatus(e.target.value)}><option value="ACTIVE">Active studies</option><option value="ALL">All statuses</option><option value="RECRUITING">Recruiting</option><option value="COMPLETED">Completed</option><option value="TERMINATED">Terminated</option></select></label><label>Phase<select value={phase} onChange={e => setPhase(e.target.value)}><option value="ALL">All phases</option><option value="PHASE1">Phase 1</option><option value="PHASE2">Phase 2</option><option value="PHASE3">Phase 3</option><option value="PHASE4">Phase 4</option></select></label></div>
    <div className="result-meta"><strong>{filtered.length.toLocaleString()}</strong> matching records</div>
    <div className="table-wrap paged-table"><table><thead><tr><th>Study</th><th>Phase</th><th>Status</th><th>Sponsor</th><th>Primary completion</th></tr></thead><tbody>{pageItems.map(trial => <tr key={trial.nctId} onClick={() => setSelected(trial)} onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSelected(trial) } }} tabIndex={0} role="button" aria-label={`Open ${trial.nctId}: ${trial.title}`}><td><span className="nct">{trial.nctId}</span><strong>{trial.title}</strong><small>{trial.interventions.slice(0, 3).map(i => i.canonicalName).join(' · ')}</small></td><td>{trial.phases.map(p => <Badge key={p} tone="blue">{prettyEnum(p)}</Badge>)}</td><td><Badge tone={trial.status === 'RECRUITING' ? 'teal' : trial.status === 'TERMINATED' ? 'red' : 'neutral'}>{prettyEnum(trial.status)}</Badge></td><td>{trial.sponsor}</td><td>{shortDate(trial.primaryCompletionDate)}</td></tr>)}</tbody></table></div>
    <Pagination page={page} total={filtered.length} pageSize={pageSize} onPage={setPage} label="studies" />
    <TrialDrawer trial={selected} onClose={() => setSelected(null)} />
  </section>
}

function EvidenceView({ evidence }: { evidence: Evidence }) {
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(1)
  const [grantPage, setGrantPage] = useState(1)
  const pageSize = 8
  const grantPageSize = 4
  const filtered = evidence.publications.filter(p => `${p.title} ${p.journal} ${p.authors.join(' ')} ${p.linkedAssets.join(' ')} ${p.linkedTargets.join(' ')}`.toLowerCase().includes(query.toLowerCase()))
  const pageItems = filtered.slice((page - 1) * pageSize, page * pageSize)
  useEffect(() => setPage(1), [query])
  const lastComplete = evidence.countsByYear.at(-2)
  const prior = evidence.countsByYear.at(-3)
  const growth = lastComplete && prior ? Math.round((lastComplete.value / prior.value - 1) * 100) : 0
  const grantItems = evidence.grants.slice((grantPage - 1) * grantPageSize, grantPage * grantPageSize)
  const currentFunding = evidence.grantAwardsByYear.at(-1)?.value ?? 0
  return <section className="page-shell"><PageIntro eyebrow="Evidence intelligence" title="Scientific momentum with the citations attached" copy="Publication volume, emerging target attention and recent PubMed records—kept distinct from clinical outcomes or evidence quality." />
    <div className="evidence-metrics"><MetricCard label="Indexed corpus" value={evidence.totalCount.toLocaleString()} note="Title-matched PubMed records" /><MetricCard label="Latest complete year" value={lastComplete?.value.toLocaleString() ?? '—'} note={`${growth >= 0 ? '+' : ''}${growth}% versus prior year`} /><MetricCard label="NIH funding records" value={evidence.grantCount} note="Disease-title matches, latest three fiscal years" /><MetricCard label="Current-year awards" value={`$${(currentFunding / 1_000_000).toFixed(1)}M`} note="NIH RePORTER award actions" /></div>
    <div className="chart-grid evidence-charts"><article className="chart-panel"><h3>Publication volume</h3><p>Annual PubMed records with multiple myeloma in the citation title.</p><div className="chart-box"><ResponsiveContainer><BarChart data={evidence.countsByYear}><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#dfe6e4" /><XAxis dataKey="name" tick={{ fill: '#6b7d7f', fontSize: 12 }} axisLine={false} tickLine={false} /><YAxis tick={{ fill: '#6b7d7f', fontSize: 12 }} axisLine={false} tickLine={false} /><Tooltip /><Bar dataKey="value" fill="#17a48b" radius={[5, 5, 0, 0]} /></BarChart></ResponsiveContainer></div></article><article className="chart-panel"><h3>Target mentions in recent titles</h3><p>Deterministic matching across the latest citation sample.</p><div className="momentum-list">{evidence.targetMomentum.slice(0, 7).map((item, i) => <div key={item.name}><span>{i + 1}</span><strong>{item.name}</strong><i><b style={{ width: `${item.value / Math.max(1, evidence.targetMomentum[0].value) * 100}%` }} /></i><em>{item.value}</em></div>)}</div></article></div>
    <SectionHeading eyebrow="Early innovation" title="NIH-funded research signals" copy="Active award actions can reveal emerging scientific and translational themes before they become mature development programs." />
    <div className="grant-list">{grantItems.map(grant => <article key={grant.id}><div><span className="grant-amount">${grant.awardAmount.toLocaleString()}</span><span>FY {grant.fiscalYear}</span></div><div><span className="publication-meta">{grant.organization} · {grant.projectNumber}</span><h3>{grant.title}</h3><p>{grant.principalInvestigators.slice(0, 3).join(', ')}</p></div><a href={grant.sourceUrl} target="_blank" rel="noreferrer" aria-label={`Open ${grant.title} in NIH RePORTER`}><ExternalLink size={17} /></a></article>)}</div>
    <Pagination page={grantPage} total={evidence.grants.length} pageSize={grantPageSize} onPage={setGrantPage} label="funding records" />
    <SectionHeading eyebrow="Recent citations" title="Explore the evidence stream" copy="Search titles, journals, authors, assets and deterministically matched targets." />
    <div className="toolbar single"><SearchBox value={query} onChange={setQuery} placeholder="Search publications, journals, assets or targets" /></div>
    <div className="publication-list">{pageItems.map(pub => <article key={pub.pmid}><div className="publication-date">{shortDate(pub.date)}</div><div><div className="publication-meta"><span>{pub.journal}</span><span>PMID {pub.pmid}</span></div><h3>{pub.title}</h3><p>{pub.authors.join(', ')}</p><div className="badge-row">{pub.linkedAssets.slice(0, 3).map(a => <Badge key={a} tone="blue">{a}</Badge>)}{pub.linkedTargets.slice(0, 3).map(t => <Badge key={t} tone="teal">{t}</Badge>)}</div></div><a href={pub.sourceUrl} target="_blank" rel="noreferrer" aria-label={`Open ${pub.title} in PubMed`}><ExternalLink size={17} /></a></article>)}</div>
    <Pagination page={page} total={filtered.length} pageSize={pageSize} onPage={setPage} label="citations" />
    <SourceNote>{evidence.methodology}</SourceNote>
  </section>
}

function RegulatoryView({ events, market }: { events: RegulatoryEvent[]; market: MarketContext }) {
  const [tab, setTab] = useState<'fda' | 'labels' | 'europe' | 'supply'>('fda')
  const [page, setPage] = useState(1)
  const pageSize = tab === 'fda' ? 4 : 6
  const unavailable = market.shortages.filter(x => x.availability.toLowerCase().includes('unavailable')).length
  const authorised = market.emaMedicines.filter(x => x.status === 'Authorised').length
  useEffect(() => setPage(1), [tab])
  const total = tab === 'fda' ? events.length : tab === 'labels' ? market.dailyMedLabels.length : tab === 'europe' ? market.emaMedicines.length : market.shortages.length
  const start = (page - 1) * pageSize
  return <section className="page-shell"><PageIntro eyebrow="Regulatory & market context" title="Follow approvals, labels, global status and supply" copy="Four distinct regulatory questions, each backed by an automatically refreshed primary-source layer." />
    <div className="regulatory-kpis"><article><span>FDA actions</span><strong>{events.length}</strong><p>Indication-level milestones</p></article><article><span>Current label documents</span><strong>{market.dailyMedLabels.length}</strong><p>DailyMed SPL records</p></article><article><span>EMA authorised records</span><strong>{authorised}</strong><p>Myeloma-indicated medicines</p></article><article><span>Unavailable presentations</span><strong>{unavailable}</strong><p>Current FDA shortage records</p></article></div>
    <SegmentedControl value={tab} onChange={setTab} label="Regulatory intelligence views" options={[{ value: 'fda', label: 'FDA actions' }, { value: 'labels', label: 'US label pulse' }, { value: 'europe', label: 'European status' }, { value: 'supply', label: 'Supply watch' }]} />
    {tab === 'fda' && <><div className="regulatory-summary"><ShieldCheck size={28} /><div><strong>Indication and regimen actions</strong><span>Automatically retrieved from FDA oncology notifications</span></div><Verified /></div><div className="timeline">{events.slice(start, start + pageSize).map((event, i, rows) => <article key={event.id}><div className="timeline-rail"><i />{i < rows.length - 1 && <span />}</div><div className="timeline-date">{shortDate(event.date)}</div><div className="timeline-card"><div><Badge tone={event.eventType.includes('Accelerated') ? 'amber' : 'teal'}>{event.eventType}</Badge><Badge>{event.target}</Badge></div><h2>{event.title}</h2><p>{event.detail}</p><div className="timeline-footer"><strong>{event.asset}</strong><a href={event.sourceUrl} target="_blank" rel="noreferrer">FDA source <ExternalLink size={13} /></a></div></div></article>)}</div></>}
    {tab === 'labels' && <><div className="context-intro"><div><span className="eyebrow">US label pulse</span><h2>Which reviewed therapy labels changed most recently?</h2><p>Structured Product Label versions provide a reproducible change-monitoring surface; the label itself remains the authoritative content.</p></div><span>DailyMed</span></div><div className="context-list">{market.dailyMedLabels.slice(start, start + pageSize).map(label => <article key={label.setId}><div><Badge tone="blue">Version {label.version}</Badge><span>{shortDate(label.publishedDate)}</span></div><div><h3>{label.asset}</h3><p>{label.title}</p></div><a href={label.sourceUrl} target="_blank" rel="noreferrer">Open label <ExternalLink size={14} /></a></article>)}</div></>}
    {tab === 'europe' && <><div className="context-intro"><div><span className="eyebrow">European regulatory position</span><h2>Centralised medicine status and recent page updates</h2><p>EMA records add a global regulatory lens and make authorised, withdrawn, lapsed and expired records visible together.</p></div><span>EMA</span></div><div className="context-list">{market.emaMedicines.slice(start, start + pageSize).map((medicine, index) => <article key={`${medicine.sourceUrl}-${index}`}><div><Badge tone={medicine.status === 'Authorised' ? 'teal' : 'amber'}>{medicine.status}</Badge><span>{shortDate(medicine.lastUpdated)}</span></div><div><h3>{medicine.name}</h3><p>{medicine.activeSubstance}{medicine.holder ? ` · ${medicine.holder}` : ''}</p><div className="badge-row">{medicine.orphan && <Badge>Orphan</Badge>}{medicine.conditional && <Badge>Conditional</Badge>}{medicine.advancedTherapy && <Badge>Advanced therapy</Badge>}</div></div><a href={medicine.sourceUrl} target="_blank" rel="noreferrer">EMA record <ExternalLink size={14} /></a></article>)}</div></>}
    {tab === 'supply' && <><div className="context-intro"><div><span className="eyebrow">Operational supply watch</span><h2>Current oncology shortage records that intersect the regimen map</h2><p>Availability is presentation- and manufacturer-specific. It must not be generalized to an entire molecule or market.</p></div><span>FDA daily</span></div><div className="context-list">{market.shortages.slice(start, start + pageSize).map((item, index) => <article key={`${item.asset}-${item.company}-${index}`}><div><Badge tone={item.availability.toLowerCase().includes('unavailable') ? 'red' : item.availability.toLowerCase().includes('limited') ? 'amber' : 'teal'}>{item.availability}</Badge><span>{shortDate(item.updatedDate)}</span></div><div><h3>{item.asset}</h3><p>{item.presentation || item.genericName}</p><small>{item.company}{item.reason ? ` · ${item.reason}` : ''}</small></div><a href={item.sourceUrl} target="_blank" rel="noreferrer">FDA shortage record <ExternalLink size={14} /></a></article>)}</div></>}
    <Pagination page={page} total={total} pageSize={pageSize} onPage={setPage} label={tab === 'fda' ? 'milestones' : tab === 'labels' ? 'labels' : tab === 'europe' ? 'EMA records' : 'shortage records'} />
    <SourceNote>{market.methodology}</SourceNote>
  </section>
}

function MethodologyView({ summary }: { summary: Summary }) {
  return <section className="page-shell narrow"><PageIntro eyebrow="Trust & methodology" title="Every insight should survive a source check" copy="The product separates retrieved facts, deterministic classifications and editorial interpretation." /><div className="method-grid"><article><Database /><h3>Six public systems</h3><p>Trials come from ClinicalTrials.gov; approvals and shortages from FDA; citations from PubMed; awards from NIH; labels from DailyMed; and European status from EMA.</p></article><article><Target /><h3>Transparent ontology</h3><p>Assets, targets, modalities and disease settings are assigned using version-controlled aliases and text rules. Unknowns remain visible instead of being guessed.</p></article><article><GitCompareArrows /><h3>Cross-source screening</h3><p>Crowding, momentum, concentration and catalyst signals combine comparable public fields. They are directional screening metrics—not forecasts or product rankings.</p></article><article><ShieldCheck /><h3>Fail-closed refreshes</h3><p>Validation checks record counts, identifiers, references and required fields. A failed refresh does not overwrite the last accepted production dataset.</p></article></div>
    <div className="method-section"><h2>Current data contract</h2><dl><div><dt>Disease query</dt><dd>{summary.methodology.query}</dd></div><div><dt>Scope</dt><dd>{summary.methodology.scope}</dd></div><div><dt>Primary source</dt><dd><a href={summary.methodology.source} target="_blank" rel="noreferrer">ClinicalTrials.gov API v2 <ExternalLink size={13} /></a></dd></div><div><dt>Dataset version</dt><dd><code>{summary.datasetVersion}</code></dd></div><div><dt>Retrieved</dt><dd>{new Date(summary.sourceRetrievedAt).toLocaleString()}</dd></div></dl></div>
    <div className="disclaimer"><ShieldCheck /><div><h3>Appropriate use</h3><p>This project supports public-data landscape exploration. It is not medical advice, clinical decision support, regulatory advice, investment advice or a validated commercial intelligence product. Registry records may be incomplete, delayed or changed by their sponsors.</p></div></div>
  </section>
}

function PageIntro({ eyebrow, title, copy }: { eyebrow: string; title: string; copy: string }) { return <div className="page-intro"><span className="eyebrow">{eyebrow}</span><h1>{title}</h1><p>{copy}</p></div> }
