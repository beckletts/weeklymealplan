import { useMemo, useState } from 'react'
import { type ExtraItem, type WeekPlan } from '../types'
import { buildShoppingList, shoppingListToText } from '../lib/shopping'
import { guessAisle } from '../lib/aisles'
import { uid } from '../lib/storage'
import { Plus, Trash, Copy, Basket } from './Icons'

interface Props {
  plan: WeekPlan
  onToggle: (key: string) => void
  onAddExtra: (item: ExtraItem) => void
  onRemoveExtra: (id: string) => void
}

export default function ShoppingListView({ plan, onToggle, onAddExtra, onRemoveExtra }: Props) {
  const [newItem, setNewItem] = useState('')
  const [copied, setCopied] = useState(false)
  const checked = useMemo(() => new Set(plan.checked), [plan.checked])
  const groups = useMemo(() => buildShoppingList(plan), [plan])

  const total = groups.reduce((n, g) => n + g.rows.length, 0)
  const done = groups.reduce((n, g) => n + g.rows.filter((r) => checked.has(r.key)).length, 0)

  // Map a shopping row back to the extra it came from (extras-only rows are removable).
  const extraByKey = useMemo(() => {
    const m = new Map<string, ExtraItem>()
    for (const e of plan.extras) m.set(('' + e.aisle + '|' + e.name.trim().toLowerCase()).replace(/\s+/g, ' '), e)
    return m
  }, [plan.extras])

  function addExtra() {
    const name = newItem.trim()
    if (!name) return
    onAddExtra({ id: uid(), name, quantity: '', aisle: guessAisle(name) })
    setNewItem('')
  }

  async function copyList() {
    await navigator.clipboard.writeText(shoppingListToText(groups, checked))
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2 no-print">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Basket className="size-5 text-green-600" />
          <span>
            {done}/{total} items
          </span>
        </div>
        <button
          onClick={copyList}
          disabled={total === 0}
          className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40"
        >
          <Copy className="size-4" /> {copied ? 'Copied!' : 'Copy list'}
        </button>
      </div>

      <div className="flex gap-2 no-print">
        <input
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addExtra()}
          placeholder="Add an extra (e.g. kitchen roll, wine, milk)…"
          className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none"
        />
        <button
          onClick={addExtra}
          className="rounded-lg bg-green-600 px-3 text-white hover:bg-green-700"
          aria-label="Add extra"
        >
          <Plus />
        </button>
      </div>

      {total === 0 ? (
        <p className="text-center text-gray-400 py-12 text-sm">
          No items yet. Plan some meals or add extras above.
        </p>
      ) : (
        <div className="space-y-4">
          {groups.map((g) => (
            <div key={g.aisle} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-4 py-2 bg-gray-50 text-xs font-semibold uppercase tracking-wide text-gray-500">
                {g.aisle}
              </div>
              <ul>
                {g.rows.map((row) => {
                  const isChecked = checked.has(row.key)
                  const extra = extraByKey.get(row.key)
                  const removable = extra && row.sources.every((s) => s === 'Extras')
                  return (
                    <li
                      key={row.key}
                      className="flex items-center gap-3 px-4 py-2.5 border-t border-gray-50 first:border-t-0"
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => onToggle(row.key)}
                        className="size-5 rounded accent-green-600 shrink-0"
                      />
                      <div className={`flex-1 min-w-0 ${isChecked ? 'line-through text-gray-300' : ''}`}>
                        <span className="text-sm">{row.name}</span>
                        {row.quantities.length > 0 && (
                          <span className="text-xs text-gray-400 ml-2">{row.quantities.join(' + ')}</span>
                        )}
                      </div>
                      {removable && (
                        <button
                          onClick={() => onRemoveExtra(extra!.id)}
                          className="text-gray-300 hover:text-red-500 no-print"
                          aria-label="Remove extra"
                        >
                          <Trash className="size-4" />
                        </button>
                      )}
                    </li>
                  )
                })}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
