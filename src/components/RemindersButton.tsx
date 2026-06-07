import { useState } from 'react'
import { isApplePlatform, reminderItems, shortcutUrl } from '../lib/reminders'
import type { ShopGroup } from '../lib/shopping'
import { X } from './Icons'

interface Props {
  groups: ShopGroup[]
  checked: Set<string>
  shortcutName: string
}

// Apple's tick-in-a-circle, drawn inline to match the other icons.
const AppleCheck = () => (
  <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 11l3 3L22 4" />
    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
  </svg>
)

export default function RemindersButton({ groups, checked, shortcutName }: Props) {
  const [help, setHelp] = useState(false)
  const items = reminderItems(groups, checked)

  function send() {
    if (items.length === 0) return
    if (!isApplePlatform()) {
      setHelp(true)
      return
    }
    window.location.href = shortcutUrl(shortcutName, items)
  }

  return (
    <>
      <div className="flex items-center gap-1">
        <button
          onClick={send}
          disabled={items.length === 0}
          className="flex items-center gap-1.5 rounded-lg bg-black text-white px-3 py-1.5 text-sm font-medium hover:bg-gray-800 disabled:opacity-40"
        >
          <AppleCheck /> Reminders
        </button>
        <button
          onClick={() => setHelp(true)}
          className="size-6 rounded-full border border-gray-200 text-gray-400 text-xs hover:bg-gray-50"
          aria-label="How to set up Reminders"
        >
          ?
        </button>
      </div>

      {help && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-0 sm:p-4"
          onClick={() => setHelp(false)}
        >
          <div
            className="w-full sm:max-w-md bg-white rounded-t-2xl sm:rounded-2xl shadow-xl max-h-[92vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <h2 className="font-semibold text-lg">Add to Apple Reminders</h2>
              <button onClick={() => setHelp(false)} className="p-2 text-gray-400 hover:text-gray-700">
                <X />
              </button>
            </div>
            <div className="p-4 space-y-3 text-sm text-gray-600">
              <p>
                One-time setup on your iPhone, iPad or Mac. Open the{' '}
                <strong>Shortcuts</strong> app and create a shortcut named exactly{' '}
                <code className="bg-gray-100 px-1 rounded">{shortcutName}</code>:
              </p>
              <ol className="list-decimal list-inside space-y-1.5">
                <li>Add action <strong>“Get text from input”</strong> (Shortcut Input).</li>
                <li>Add <strong>“Split Text”</strong> — split by <strong>New Lines</strong>.</li>
                <li>
                  Add <strong>“Repeat with Each”</strong> → inside it, <strong>“Add New Reminder”</strong>{' '}
                  using <em>Repeat Item</em> as the title (pick your shopping list).
                </li>
                <li>Save. Make sure “Use with Share Sheet / shortcuts URL” is on.</li>
              </ol>
              <p>
                Then tap <strong>Reminders</strong> here and your unticked items drop straight into the
                list. You can rename the shortcut in this app's Settings.
              </p>
              <p className="text-xs text-gray-400">
                Note: this only works on Apple devices (it uses the Shortcuts app).
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
