export type Trial = {
  nctId: string
  title: string
  status: string
  phases: string[]
  sponsor: string
  collaborators: string[]
  interventions: { name: string; canonicalName: string; type: string; target?: string; modality?: string }[]
  conditions: string[]
  startDate?: string
  primaryCompletionDate?: string
  completionDate?: string
  enrollment?: number
  studyType: string
  hasResults: boolean
  locations: { city?: string; state?: string; country?: string }[]
  briefSummary?: string
  firstPosted?: string
  lastUpdated?: string
  setting: string
  sourceUrl: string
}

export type Asset = {
  id: string
  name: string
  aliases: string[]
  target: string
  modality: string
  trialCount: number
  activeTrialCount: number
  recruitingTrialCount: number
  highestPhase: string
  sponsors: string[]
  settings: string[]
  statusCounts: Record<string, number>
  trialIds: string[]
}

export type Summary = {
  generatedAt: string
  sourceRetrievedAt: string
  datasetVersion: string
  trialCount: number
  activeTrialCount: number
  recruitingTrialCount: number
  phase23ActiveCount: number
  assetCount: number
  sponsorCount: number
  resultsTrialCount: number
  countsByPhase: { name: string; value: number }[]
  countsByStatus: { name: string; value: number }[]
  countsByTarget: { name: string; value: number }[]
  countsByModality: { name: string; value: number }[]
  topSponsors: { name: string; value: number }[]
  upcomingMilestones: { nctId: string; title: string; date: string; phase: string; sponsor: string }[]
  methodology: { query: string; scope: string; source: string }
}

export type ChangeEvent = {
  id: string
  type: string
  severity: 'high' | 'medium' | 'low'
  title: string
  detail: string
  date: string
  nctId?: string
  sourceUrl: string
  observedAt: string
}

export type RegulatoryEvent = {
  id: string
  date: string
  asset: string
  title: string
  detail: string
  target: string
  eventType: string
  sourceUrl: string
}
