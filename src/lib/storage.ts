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

/**
 * Collect dish titles from previously saved weeks (most recent first, deduped)
 * so the AI can avoid repeating them. Reads every stored plan except the one
 * for `excludeWeek`.
 */
export function recentMealTitles(excludeWeek: string, limit = 14): string[] {
  const found: { title: string; week: string }[] = []
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i)
    if (!k || !k.startsWith(PLAN_PREFIX)) continue
    const week = k.slice(PLAN_PREFIX.length)
    if (week === excludeWeek) continue
    try {
      const plan: WeekPlan = JSON.parse(localStorage.getItem(k)!)
      for (const m of plan.meals ?? []) found.push({ title: m.title, week })
    } catch {
      /* ignore corrupt entries */
    }
  }
  found.sort((a, b) => b.week.localeCompare(a.week)) // newest weeks first
  const seen = new Set<string>()
  const out: string[] = []
  for (const { title } of found) {
    const key = title.trim().toLowerCase()
    if (!key || seen.has(key)) continue
    seen.add(key)
    out.push(title)
    if (out.length >= limit) break
  }
  return out
}
