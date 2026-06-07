import { useEffect, useMemo, useState } from 'react'
import {
  DAYS,
  type Day,
  type ExtraItem,
  type Meal,
  type Settings,
  type WeekPlan,
} from './types'
import {
  addDays,
  formatNice,
  loadPlan,
  loadSettings,
  savePlan,
  saveSettings,
  sundayOf,
} from './lib/storage'
import { generatePlan } from './lib/ai'
import DayCard from './components/DayCard'
import AddRecipeModal from './components/AddRecipeModal'
import ShoppingListView from './components/ShoppingListView'
import SettingsPanel from './components/SettingsPanel'
import { Basket, Pot, Gear, Sparkles, Chevron } from './components/Icons'

type Tab = 'plan' | 'shop' | 'settings'

export default function App() {
  const [settings, setSettings] = useState<Settings>(loadSettings)
  const [weekStart, setWeekStart] = useState<string>(sundayOf())
  const [plan, setPlan] = useState<WeekPlan>(() => loadPlan(sundayOf()))
  const [tab, setTab] = useState<Tab>('plan')
  const [adding, setAdding] = useState<Day | null>(null)
  const [busyDays, setBusyDays] = useState<Set<Day>>(new Set())
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState('')

  // Load the plan whenever the week changes.
  useEffect(() => setPlan(loadPlan(weekStart)), [weekStart])

  // Persist on every change.
  useEffect(() => savePlan(plan), [plan])

  const mealByDay = useMemo(() => {
    const m = new Map<Day, Meal>()
    for (const meal of plan.meals) m.set(meal.day, meal)
    return m
  }, [plan.meals])

  const filledDays = mealByDay.size
  const hasKey = settings.apiKey.trim().length > 0

  function setBusy(day: Day, on: boolean) {
    setBusyDays((prev) => {
      const next = new Set(prev)
      on ? next.add(day) : next.delete(day)
      return next
    })
  }

  function upsertMeal(meal: Meal) {
    setPlan((p) => ({
      ...p,
      meals: [...p.meals.filter((m) => m.day !== meal.day), meal],
    }))
  }

  function removeMeal(day: Day) {
    setPlan((p) => ({ ...p, meals: p.meals.filter((m) => m.day !== day) }))
  }

  async function suggestDay(day: Day) {
    if (!hasKey) {
      setError('Add your Claude API key in Settings first.')
      setTab('settings')
      return
    }
    setError('')
    setBusy(day, true)
    try {
      const avoid = plan.meals.filter((m) => m.day !== day).map((m) => m.title)
      const [meal] = await generatePlan(settings, [day], avoid)
      if (meal) upsertMeal(meal)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not generate a meal')
    } finally {
      setBusy(day, false)
    }
  }

  async function generateWeek() {
    if (!hasKey) {
      setError('Add your Claude API key in Settings first.')
      setTab('settings')
      return
    }
    setError('')
    setGenerating(true)
    try {
      const emptyDays = DAYS.filter((d) => !mealByDay.has(d))
      const target = emptyDays.length ? emptyDays : [...DAYS]
      const avoid = plan.meals.filter((m) => !target.includes(m.day)).map((m) => m.title)
      const meals = await generatePlan(settings, target, avoid)
      setPlan((p) => {
        const kept = p.meals.filter((m) => !target.includes(m.day))
        return { ...p, meals: [...kept, ...meals] }
      })
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not generate the week')
    } finally {
      setGenerating(false)
    }
  }

  function toggleChecked(key: string) {
    setPlan((p) => ({
      ...p,
      checked: p.checked.includes(key) ? p.checked.filter((k) => k !== key) : [...p.checked, key],
    }))
  }

  function addExtra(item: ExtraItem) {
    setPlan((p) => ({ ...p, extras: [...p.extras, item] }))
  }

  function removeExtra(id: string) {
    setPlan((p) => ({ ...p, extras: p.extras.filter((e) => e.id !== id) }))
  }

  const weekEnd = addDays(weekStart, 4) // Sunday → Thursday

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white border-b border-gray-100 sticky top-0 z-30">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Basket className="size-6 text-green-600" />
            <h1 className="font-bold text-lg">Sunday Shop</h1>
          </div>
          <span className="text-xs text-gray-400">Sun–Thu plan</span>
        </div>
      </header>

      <main className="flex-1 max-w-2xl w-full mx-auto px-4 py-4 pb-28">
        {error && (
          <div className="mb-3 text-sm text-red-700 bg-red-50 border border-red-100 rounded-lg px-3 py-2 flex justify-between">
            <span>{error}</span>
            <button onClick={() => setError('')} className="text-red-400 hover:text-red-600">
              ✕
            </button>
          </div>
        )}

        {tab === 'plan' && (
          <>
            <WeekNav
              weekStart={weekStart}
              weekEnd={weekEnd}
              onPrev={() => setWeekStart(addDays(weekStart, -7))}
              onNext={() => setWeekStart(addDays(weekStart, 7))}
              onThis={() => setWeekStart(sundayOf())}
            />

            <div className="my-3 flex items-center gap-2">
              <button
                onClick={generateWeek}
                disabled={generating}
                className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-green-600 text-white font-semibold py-3 hover:bg-green-700 disabled:opacity-50 shadow-sm"
              >
                <Sparkles className={`size-5 ${generating ? 'animate-pulse' : ''}`} />
                {generating
                  ? 'Planning your week…'
                  : filledDays === 0
                    ? 'Plan my week with AI'
                    : filledDays < 5
                      ? `Fill the ${5 - filledDays} empty ${5 - filledDays === 1 ? 'day' : 'days'}`
                      : 'Regenerate the week'}
              </button>
            </div>
            <p className="text-xs text-gray-400 mb-3 text-center">
              🍲 Tuesday & Thursday are always slow-cooker dinners.
            </p>

            <div className="space-y-3">
              {DAYS.map((day, i) => (
                <DayCard
                  key={day}
                  day={day}
                  date={addDays(weekStart, i)}
                  meal={mealByDay.get(day)}
                  busy={busyDays.has(day)}
                  onAdd={() => setAdding(day)}
                  onSuggest={() => suggestDay(day)}
                  onRemove={() => removeMeal(day)}
                />
              ))}
            </div>
          </>
        )}

        {tab === 'shop' && (
          <>
            <WeekNav
              weekStart={weekStart}
              weekEnd={weekEnd}
              onPrev={() => setWeekStart(addDays(weekStart, -7))}
              onNext={() => setWeekStart(addDays(weekStart, 7))}
              onThis={() => setWeekStart(sundayOf())}
            />
            <div className="h-3" />
            <ShoppingListView
              plan={plan}
              onToggle={toggleChecked}
              onAddExtra={addExtra}
              onRemoveExtra={removeExtra}
            />
          </>
        )}

        {tab === 'settings' && <SettingsPanel settings={settings} onSave={(s) => {
          setSettings(s)
          saveSettings(s)
        }} />}
      </main>

      <nav className="fixed bottom-0 inset-x-0 bg-white border-t border-gray-100 z-30 no-print safe-bottom">
        <div className="max-w-2xl mx-auto grid grid-cols-3">
          <TabButton active={tab === 'plan'} onClick={() => setTab('plan')} icon={<Pot />} label="Plan" />
          <TabButton active={tab === 'shop'} onClick={() => setTab('shop')} icon={<Basket />} label="Shopping" />
          <TabButton active={tab === 'settings'} onClick={() => setTab('settings')} icon={<Gear />} label="Settings" />
        </div>
      </nav>

      {adding && (
        <AddRecipeModal
          day={adding}
          settings={settings}
          onClose={() => setAdding(null)}
          onAdd={upsertMeal}
        />
      )}
    </div>
  )
}

function WeekNav({
  weekStart,
  weekEnd,
  onPrev,
  onNext,
  onThis,
}: {
  weekStart: string
  weekEnd: string
  onPrev: () => void
  onNext: () => void
  onThis: () => void
}) {
  const isThisWeek = weekStart === sundayOf()
  return (
    <div className="flex items-center justify-between bg-white rounded-xl border border-gray-100 shadow-sm px-2 py-2">
      <button onClick={onPrev} className="p-2 text-gray-400 hover:text-gray-700 rotate-180">
        <Chevron />
      </button>
      <button onClick={onThis} className="text-center group">
        <div className="text-sm font-semibold text-gray-800">
          {formatNice(weekStart)} – {formatNice(weekEnd)}
        </div>
        <div className="text-xs text-gray-400 group-hover:text-green-600">
          {isThisWeek ? 'This week' : 'Tap for this week'}
        </div>
      </button>
      <button onClick={onNext} className="p-2 text-gray-400 hover:text-gray-700">
        <Chevron />
      </button>
    </div>
  )
}

function TabButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean
  onClick: () => void
  icon: React.ReactNode
  label: string
}) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center gap-0.5 py-2.5 text-xs font-medium transition-colors ${
        active ? 'text-green-700' : 'text-gray-400 hover:text-gray-600'
      }`}
    >
      {icon}
      {label}
    </button>
  )
}
