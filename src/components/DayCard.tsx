import { useState } from 'react'
import { SLOW_COOKER_DAYS, type Day, type Meal } from '../types'
import { formatNice } from '../lib/storage'
import { Plus, Trash, Refresh, Pot, Chevron, Heart } from './Icons'

interface Props {
  day: Day
  date: string
  meal?: Meal
  busy: boolean
  favourite: boolean
  onAdd: () => void
  onSuggest: () => void
  onRemove: () => void
  onToggleFavourite: (title: string) => void
}

export default function DayCard({
  day,
  date,
  meal,
  busy,
  favourite,
  onAdd,
  onSuggest,
  onRemove,
  onToggleFavourite,
}: Props) {
  const [open, setOpen] = useState(false)
  const isSlow = SLOW_COOKER_DAYS.includes(day)

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-4 pt-3">
        <div className="flex items-center gap-2">
          <span className="font-semibold">{day}</span>
          <span className="text-xs text-gray-400">{formatNice(date)}</span>
        </div>
        {isSlow && (
          <span className="flex items-center gap-1 text-xs font-medium text-amber-700 bg-amber-50 rounded-full px-2 py-0.5">
            <Pot className="size-3.5" /> Slow cooker
          </span>
        )}
      </div>

      {meal ? (
        <div className="px-4 pb-3 pt-1">
          <button
            onClick={() => setOpen((o) => !o)}
            className="w-full flex items-center justify-between text-left group"
          >
            <span className="font-medium text-gray-900 group-hover:text-green-700">{meal.title}</span>
            <Chevron className={`size-4 text-gray-400 transition-transform ${open ? 'rotate-90' : ''}`} />
          </button>

          {meal.url && (
            <a
              href={meal.url}
              target="_blank"
              rel="noreferrer"
              className="text-xs text-green-700 hover:underline break-all"
            >
              {new URL(meal.url).hostname.replace('www.', '')}
            </a>
          )}

          {open && (
            <div className="mt-3 space-y-3 text-sm">
              <div>
                <p className="font-medium text-gray-700 mb-1">Ingredients ({meal.servings} servings)</p>
                <ul className="space-y-0.5 text-gray-600">
                  {meal.ingredients.map((i) => (
                    <li key={i.id} className="flex justify-between gap-2">
                      <span>{i.name}</span>
                      <span className="text-gray-400 shrink-0">{i.quantity}</span>
                    </li>
                  ))}
                </ul>
              </div>
              {meal.method.length > 0 && (
                <div>
                  <p className="font-medium text-gray-700 mb-1">Method</p>
                  <ol className="list-decimal list-inside space-y-1 text-gray-600">
                    {meal.method.map((s, i) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ol>
                </div>
              )}
              {meal.notes && <p className="text-gray-500 italic">{meal.notes}</p>}
            </div>
          )}

          <div className="flex gap-3 mt-3 pt-2 border-t border-gray-50">
            <button
              onClick={() => onToggleFavourite(meal.title)}
              className={`flex items-center gap-1 text-xs ${
                favourite ? 'text-rose-500' : 'text-gray-500 hover:text-rose-500'
              }`}
              title={favourite ? 'Loved — AI will suggest more like this' : 'Mark as loved'}
            >
              <Heart className="size-3.5" filled={favourite} /> {favourite ? 'Loved' : 'Love'}
            </button>
            <button
              onClick={onSuggest}
              disabled={busy}
              className="flex items-center gap-1 text-xs text-gray-500 hover:text-green-700 disabled:opacity-40"
            >
              <Refresh className="size-3.5" /> Swap
            </button>
            <button
              onClick={onRemove}
              className="flex items-center gap-1 text-xs text-gray-500 hover:text-red-600"
            >
              <Trash className="size-3.5" /> Remove
            </button>
          </div>
        </div>
      ) : (
        <div className="px-4 pb-3 pt-2 flex gap-2">
          <button
            onClick={onSuggest}
            disabled={busy}
            className="flex-1 flex items-center justify-center gap-1.5 rounded-lg bg-green-50 text-green-800 text-sm font-medium py-2 hover:bg-green-100 disabled:opacity-50"
          >
            <Refresh className={`size-4 ${busy ? 'animate-spin' : ''}`} />
            {busy ? 'Thinking…' : 'AI suggest'}
          </button>
          <button
            onClick={onAdd}
            className="flex-1 flex items-center justify-center gap-1.5 rounded-lg border border-gray-200 text-gray-700 text-sm font-medium py-2 hover:bg-gray-50"
          >
            <Plus className="size-4" /> Add recipe
          </button>
        </div>
      )}
    </div>
  )
}
