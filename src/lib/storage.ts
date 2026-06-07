import { DEFAULT_SETTINGS, type Settings, type WeekPlan } from '../types'

const PLAN_PREFIX = 'weekly-shop:plan:'
const SETTINGS_KEY = 'weekly-shop:settings'

/** Returns the ISO date (yyyy-mm-dd) of the Sunday on or before `d`. */
export function sundayOf(d = new Date()): string {
  const date = new Date(d)
  date.setHours(12, 0, 0, 0) // avoid DST edge cases
  date.setDate(date.getDate() - date.getDay()) // getDay(): 0 = Sunday
  return date.toISOString().slice(0, 10)
}

export function addDays(iso: string, days: number): string {
  const d = new Date(iso + 'T12:00:00')
  d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 10)
}

export function formatNice(iso: string): string {
  return new Date(iso + 'T12:00:00').toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  })
}

export function emptyPlan(weekStart: string): WeekPlan {
  return { weekStart, meals: [], extras: [], checked: [] }
}

export function loadPlan(weekStart: string): WeekPlan {
  try {
    const raw = localStorage.getItem(PLAN_PREFIX + weekStart)
    if (raw) return { ...emptyPlan(weekStart), ...JSON.parse(raw) }
  } catch {
    /* ignore corrupt data */
  }
  return emptyPlan(weekStart)
}

export function savePlan(plan: WeekPlan): void {
  localStorage.setItem(PLAN_PREFIX + plan.weekStart, JSON.stringify(plan))
}

export function loadSettings(): Settings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY)
    if (raw) return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) }
  } catch {
    /* ignore */
  }
  return DEFAULT_SETTINGS
}

export function saveSettings(s: Settings): void {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(s))
}

export function uid(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4)
}
