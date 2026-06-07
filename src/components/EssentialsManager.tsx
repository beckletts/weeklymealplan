import { useState } from 'react'
import type { EssentialItem } from '../types'
import { guessAisle } from '../lib/aisles'
import { uid } from '../lib/storage'
import { Plus, Trash, Chevron } from './Icons'

interface Props {
  essentials: EssentialItem[]
  onAdd: (item: EssentialItem) => void
  onRemove: (id: string) => void
}

const SUGGESTIONS = ['Milk', 'Bread', 'Eggs', 'Butter', 'Bananas', 'Coffee', 'Kitchen roll']

export default function EssentialsManager({ essentials, onAdd, onRemove }: Props) {
  const [open, setOpen] = useState(false)
  const [text, setText] = useState('')

  function add(name: string) {
    const clean = name.trim()
    if (!clean) return
    onAdd({ id: uid(), name: clean, quantity: '', aisle: guessAisle(clean) })
    setText('')
  }

  const unused = SUGGESTIONS.filter(
    (s) => !essentials.some((e) => e.name.toLowerCase() === s.toLowerCase()),
  )

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-4 py-3 text-left"
      >
        <span className="flex items-center gap-2 font-medium text-gray-800">
          🧺 Weekly essentials
          {essentials.length > 0 && (
            <span className="text-xs font-normal text-gray-400">
              ({essentials.length} added every week)
            </span>
          )}
        </span>
        <Chevron className={`size-4 text-gray-400 transition-transform ${open ? 'rotate-90' : ''}`} />
      </button>

      {open && (
        <div className="px-4 pb-4 space-y-3 border-t border-gray-50 pt-3">
          <p className="text-xs text-gray-500">
            Staples you buy most weeks. They're added to every week's shopping list automatically,
            ready to tick off.
          </p>

          <div className="flex gap-2">
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && add(text)}
              placeholder="Add a staple (e.g. milk, bread, bin bags)…"
              className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none"
            />
            <button
              onClick={() => add(text)}
              className="rounded-lg bg-green-600 px-3 text-white hover:bg-green-700"
              aria-label="Add essential"
            >
              <Plus />
            </button>
          </div>

          {unused.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {unused.map((s) => (
                <button
                  key={s}
                  onClick={() => add(s)}
                  className="text-xs rounded-full border border-gray-200 px-2.5 py-1 text-gray-600 hover:bg-green-50 hover:border-green-200 hover:text-green-700"
                >
                  + {s}
                </button>
              ))}
            </div>
          )}

          {essentials.length > 0 && (
            <ul className="divide-y divide-gray-50">
              {essentials.map((e) => (
                <li key={e.id} className="flex items-center justify-between py-2">
                  <span className="text-sm text-gray-700">{e.name}</span>
                  <button
                    onClick={() => onRemove(e.id)}
                    className="text-gray-300 hover:text-red-500"
                    aria-label={`Remove ${e.name}`}
                  >
                    <Trash className="size-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
