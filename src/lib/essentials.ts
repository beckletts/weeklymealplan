import type { EssentialItem } from '../types'

// Staples bought most weeks. Stored globally (not per-week) so they carry over
// and appear in every week's shopping list, ready to tick off.
const KEY = 'weekly-shop:essentials'

export function loadEssentials(): EssentialItem[] {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return JSON.parse(raw)
  } catch {
    /* ignore */
  }
  return []
}

function save(list: EssentialItem[]): void {
  localStorage.setItem(KEY, JSON.stringify(list))
}

/** Returns the new list (does not mutate the input). */
export function addEssential(list: EssentialItem[], item: EssentialItem): EssentialItem[] {
  // Skip exact-name duplicates so the same staple isn't added twice.
  if (list.some((e) => e.name.trim().toLowerCase() === item.name.trim().toLowerCase())) {
    return list
  }
  const next = [...list, item]
  save(next)
  return next
}

export function removeEssential(list: EssentialItem[], id: string): EssentialItem[] {
  const next = list.filter((e) => e.id !== id)
  save(next)
  return next
}
