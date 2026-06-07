// Tracks which dishes the household has "hearted" so the AI can lean towards
// them. Stored globally (not per-week) in localStorage.
const KEY = 'weekly-shop:favourites'

export function loadFavourites(): string[] {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return JSON.parse(raw)
  } catch {
    /* ignore */
  }
  return []
}

function save(list: string[]): void {
  localStorage.setItem(KEY, JSON.stringify(list))
}

export function isFavourite(list: string[], title: string): boolean {
  const t = title.trim().toLowerCase()
  return list.some((f) => f.toLowerCase() === t)
}

/** Returns the new list (does not mutate the input). */
export function toggleFavourite(list: string[], title: string): string[] {
  const t = title.trim()
  const next = isFavourite(list, t)
    ? list.filter((f) => f.toLowerCase() !== t.toLowerCase())
    : [...list, t]
  save(next)
  return next
}
