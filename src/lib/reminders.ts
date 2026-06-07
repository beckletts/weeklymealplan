import type { ShopGroup } from './shopping'

export function isApplePlatform(): boolean {
  if (typeof navigator === 'undefined') return false
  return /iPhone|iPad|iPod|Macintosh|Mac OS X/.test(navigator.userAgent)
}

/** Unchecked items, one line each, with quantities appended. */
export function reminderItems(groups: ShopGroup[], checked: Set<string>): string[] {
  const items: string[] = []
  for (const g of groups) {
    for (const r of g.rows) {
      if (checked.has(r.key)) continue
      const qty = r.quantities.length ? ` (${r.quantities.join(' + ')})` : ''
      items.push(r.name + qty)
    }
  }
  return items
}

/**
 * Deep link that runs an Apple Shortcut, passing the list as newline-separated
 * text input. The user's shortcut splits the text and adds each line to a
 * Reminders list.
 */
export function shortcutUrl(name: string, items: string[]): string {
  const text = items.join('\n')
  return (
    'shortcuts://run-shortcut?name=' +
    encodeURIComponent(name) +
    '&input=text&text=' +
    encodeURIComponent(text)
  )
}
