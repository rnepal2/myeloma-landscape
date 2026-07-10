import { describe, expect, it } from 'vitest'
import { highestPhase, prettyEnum, shortDate } from './lib'

describe('presentation helpers', () => {
  it('formats registry enums', () => expect(prettyEnum('ACTIVE_NOT_RECRUITING')).toBe('Active Not Recruiting'))
  it('selects the highest phase', () => expect(highestPhase(['PHASE1', 'PHASE3', 'PHASE2'])).toBe('PHASE3'))
  it('renders incomplete registry dates', () => expect(shortDate('2026-07')).toContain('2026'))
})
