import { describe, expect, it } from 'vitest'
import {
  formatAgentState,
  formatClock,
  formatDuration,
  formatRelativeTime,
  formatSignedPct,
  formatTickTime,
} from './format'

describe('formatDuration', () => {
  it('renders seconds under a minute', () => {
    expect(formatDuration(0)).toBe('0s')
    expect(formatDuration(45)).toBe('45s')
  })

  it('renders minutes and seconds', () => {
    expect(formatDuration(60)).toBe('1m')
    expect(formatDuration(175)).toBe('2m 55s')
    expect(formatDuration(900)).toBe('15m')
  })

  it('drops seconds at an hour and above', () => {
    expect(formatDuration(3600)).toBe('1h 00m')
    expect(formatDuration(3900)).toBe('1h 05m')
  })

  it('clamps negative input to zero', () => {
    expect(formatDuration(-10)).toBe('0s')
  })
})

describe('formatClock', () => {
  it('renders m:ss below an hour', () => {
    expect(formatClock(45)).toBe('0:45')
    expect(formatClock(175)).toBe('2:55')
  })

  it('renders h:mm:ss at an hour and above', () => {
    expect(formatClock(3723)).toBe('1:02:03')
  })
})

describe('formatSignedPct', () => {
  it('signs positive and negative values', () => {
    expect(formatSignedPct(25)).toBe('+25%')
    expect(formatSignedPct(-8)).toBe('−8%')
  })

  it('leaves zero unsigned', () => {
    expect(formatSignedPct(0)).toBe('0%')
    expect(formatSignedPct(0.4)).toBe('0%')
  })
})

describe('formatRelativeTime', () => {
  const now = new Date('2026-05-26T14:45:00Z')

  it('collapses very recent times to "just now"', () => {
    expect(formatRelativeTime('2026-05-26T14:44:58Z', now)).toBe('just now')
  })

  it('renders seconds, minutes, hours', () => {
    expect(formatRelativeTime('2026-05-26T14:44:30Z', now)).toBe('30s ago')
    expect(formatRelativeTime('2026-05-26T14:30:00Z', now)).toBe('15m ago')
    expect(formatRelativeTime('2026-05-26T12:45:00Z', now)).toBe('2h ago')
  })
})

describe('formatTickTime', () => {
  it('renders UTC wall-clock time', () => {
    expect(formatTickTime('2026-05-26T14:45:00Z')).toBe('14:45')
  })
})

describe('formatAgentState', () => {
  it('humanizes snake_case states', () => {
    expect(formatAgentState('on_break')).toBe('On break')
    expect(formatAgentState('available')).toBe('Available')
  })
})
