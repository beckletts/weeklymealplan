import { useState } from 'react'
import { SLOW_COOKER_DAYS, type Day, type Meal, type Settings } from '../types'
import { importRecipeFromUrl, parseRecipeText } from '../lib/ai'
import { X, Link, Sparkles } from './Icons'

interface Props {
  day: Day
  settings: Settings
  onClose: () => void
  onAdd: (meal: Meal) => void
}

type Mode = 'link' | 'paste'

export default function AddRecipeModal({ day, settings, onClose, onAdd }: Props) {
  const [mode, setMode] = useState<Mode>('link')
  const [url, setUrl] = useState('')
  const [text, setText] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const isSlow = SLOW_COOKER_DAYS.includes(day)

  async function submit() {
    setError('')
    if (!settings.apiKey) {
      setError('Add your Claude API key in Settings first.')
      return
    }
    setBusy(true)
    try {
      const meal =
        mode === 'link'
          ? await importRecipeFromUrl(settings, url.trim(), day)
          : await parseRecipeText(settings, text.trim(), day)
      onAdd(meal)
      onClose()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong')
      if (mode === 'link') setMode('paste') // nudge towards the fallback
    } finally {
      setBusy(false)
    }
  }

  const canSubmit = mode === 'link' ? url.trim().length > 4 : text.trim().length > 20

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-0 sm:p-4"
      onClick={onClose}
    >
      <div
        className="w-full sm:max-w-lg bg-white rounded-t-2xl sm:rounded-2xl shadow-xl max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <div>
            <h2 className="font-semibold text-lg">Add a recipe</h2>
            <p className="text-sm text-gray-500">
              {day}
              {isSlow && ' · 🍲 slow cooker'}
            </p>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-700">
            <X />
          </button>
        </div>

        <div className="flex gap-2 p-4 pb-0">
          <Tab active={mode === 'link'} onClick={() => setMode('link')} icon={<Link className="size-4" />}>
            Paste a link
          </Tab>
          <Tab active={mode === 'paste'} onClick={() => setMode('paste')} icon={<Sparkles className="size-4" />}>
            Paste recipe text
          </Tab>
        </div>

        <div className="p-4 space-y-3">
          {mode === 'link' ? (
            <>
              <input
                autoFocus
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://www.boredoflunch.com/..."
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none"
              />
              <p className="text-xs text-gray-500">
                Works with Bored of Lunch, Pinch of Nom, BBC Food, Tesco & Sainsbury's recipe pages.
                Claude reads the page and pulls out the ingredients.
              </p>
            </>
          ) : (
            <>
              <textarea
                autoFocus
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Paste the recipe (ingredients and method) here..."
                rows={8}
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none resize-none"
              />
              <p className="text-xs text-gray-500">
                Handy if a link won't load — copy the recipe text and Claude will tidy it into
                ingredients scaled for {settings.household}.
              </p>
            </>
          )}

          {error && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>}

          <button
            onClick={submit}
            disabled={!canSubmit || busy}
            className="w-full rounded-lg bg-green-600 text-white font-medium py-2.5 disabled:opacity-40 hover:bg-green-700 transition-colors"
          >
            {busy ? 'Reading recipe…' : 'Add to plan'}
          </button>
        </div>
      </div>
    </div>
  )
}

function Tab({
  active,
  onClick,
  icon,
  children,
}: {
  active: boolean
  onClick: () => void
  icon: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
        active ? 'bg-green-100 text-green-800' : 'text-gray-500 hover:bg-gray-100'
      }`}
    >
      {icon}
      {children}
    </button>
  )
}
