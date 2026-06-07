import { aisleOrder } from './aisles'
import type { Aisle, WeekPlan } from '../types'

export interface ShopRow {
  key: string
  name: string
  /** Combined quantities from every recipe that needs this item. */
  quantities: string[]
  /** Where each quantity comes from (meal title or "Extras"). */
  sources: string[]
  aisle: Aisle
}

export interface ShopGroup {
  aisle: Aisle
  rows: ShopRow[]
}

function rowKey(aisle: string, name: string): string {
  return (aisle + '|' + name.trim().toLowerCase()).replace(/\s+/g, ' ')
}

/** Build the de-duplicated, aisle-grouped shopping list for a plan. */
export function buildShoppingList(plan: WeekPlan): ShopGroup[] {
  const rows = new Map<string, ShopRow>()

  const add = (name: string, quantity: string, aisle: Aisle, source: string) => {
    const clean = name.trim()
    if (!clean) return
    const key = rowKey(aisle, clean)
    const existing = rows.get(key)
    if (existing) {
      if (quantity.trim()) {
        existing.quantities.push(quantity.trim())
        existing.sources.push(source)
      }
    } else {
      rows.set(key, {
        key,
        name: clean,
        quantities: quantity.trim() ? [quantity.trim()] : [],
        sources: quantity.trim() ? [source] : [],
        aisle,
      })
    }
  }

  for (const meal of plan.meals) {
    for (const ing of meal.ingredients) add(ing.name, ing.quantity, ing.aisle, meal.title)
  }
  for (const extra of plan.extras) add(extra.name, extra.quantity, extra.aisle, 'Extras')

  const groups = new Map<Aisle, ShopRow[]>()
  for (const row of rows.values()) {
    if (!groups.has(row.aisle)) groups.set(row.aisle, [])
    groups.get(row.aisle)!.push(row)
  }

  return [...groups.entries()]
    .map(([aisle, r]) => ({
      aisle,
      rows: r.sort((a, b) => a.name.localeCompare(b.name)),
    }))
    .sort((a, b) => aisleOrder(a.aisle) - aisleOrder(b.aisle))
}

/** Plain-text version for copying / sharing. */
export function shoppingListToText(groups: ShopGroup[], checked: Set<string>): string {
  const lines: string[] = ['🛒 Shopping list', '']
  for (const g of groups) {
    const pending = g.rows.filter((r) => !checked.has(r.key))
    if (pending.length === 0) continue
    lines.push(g.aisle.toUpperCase())
    for (const row of pending) {
      const qty = row.quantities.length ? ` — ${row.quantities.join(' + ')}` : ''
      lines.push(`  • ${row.name}${qty}`)
    }
    lines.push('')
  }
  return lines.join('\n').trim()
}
