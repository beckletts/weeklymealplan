import { useState } from 'react'
import type { Settings } from '../types'

interface Props {
  settings: Settings
  onSave: (s: Settings) => void
}

export default function SettingsPanel({ settings, onSave }: Props) {
  const [draft, setDraft] = useState(settings)
  const [saved, setSaved] = useState(false)

  function update<K extends keyof Settings>(key: K, value: Settings[K]) {
    setDraft((d) => ({ ...d, [key]: value }))
    setSaved(false)
  }

  function save() {
    onSave(draft)
    setSaved(true)
    setTimeout(() => setSaved(false), 1500)
  }

  return (
    <div className="space-y-5 max-w-lg">
      <Field
        label="Claude API key (optional)"
        hint="Only needed for local dev. On the deployed site the key lives securely on the server, so you can leave this blank. Stored only in this browser — never uploaded. Get one at console.anthropic.com → API Keys."
      >
        <input
          type="password"
          value={draft.apiKey}
          onChange={(e) => update('apiKey', e.target.value)}
          placeholder="sk-ant-... (leave blank if deployed)"
          className="input"
        />
      </Field>

      <Field label="How many people are you cooking for?">
        <input
          type="number"
          min={1}
          max={12}
          value={draft.household}
          onChange={(e) => update('household', Math.max(1, Number(e.target.value) || 1))}
          className="input w-24"
        />
      </Field>

      <Field label="Meals & ingredients you love" hint="Comma separated — helps the AI suggest things you'll actually eat.">
        <input
          value={draft.likes}
          onChange={(e) => update('likes', e.target.value)}
          placeholder="chicken, pasta bakes, curries, halloumi"
          className="input"
        />
      </Field>

      <Field label="Anything to avoid?" hint="Allergies, dislikes, dietary needs.">
        <input
          value={draft.dislikes}
          onChange={(e) => update('dislikes', e.target.value)}
          placeholder="mushrooms, very spicy food, no pork"
          className="input"
        />
      </Field>

      <Field label="Favourite cuisines / styles">
        <input
          value={draft.cuisines}
          onChange={(e) => update('cuisines', e.target.value)}
          placeholder="Italian, Indian, comfort food, slimming-friendly"
          className="input"
        />
      </Field>

      <Field
        label="Apple Reminders shortcut name"
        hint="The name of your Apple Shortcut that adds items to Reminders. Must match exactly. See the ? button on the Shopping tab for setup."
      >
        <input
          value={draft.reminderShortcut}
          onChange={(e) => update('reminderShortcut', e.target.value)}
          placeholder="Add Shopping List"
          className="input"
        />
      </Field>

      <button
        onClick={save}
        className="rounded-lg bg-green-600 text-white font-medium px-5 py-2.5 hover:bg-green-700"
      >
        {saved ? 'Saved ✓' : 'Save settings'}
      </button>

      <style>{`.input{width:100%;border-radius:0.5rem;border:1px solid #d1d5db;padding:0.625rem 0.75rem;font-size:0.875rem;outline:none}.input:focus{border-color:#22c55e;box-shadow:0 0 0 1px #22c55e}`}</style>
    </div>
  )
}

function Field({
  label,
  hint,
  children,
}: {
  label: string
  hint?: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      {children}
      {hint && <p className="text-xs text-gray-500">{hint}</p>}
    </div>
  )
}
