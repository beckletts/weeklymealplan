import { Fragment, useRef, useState } from 'react'
import { SLOW_COOKER_DAYS, type Day, type Meal, type Settings } from '../types'
import { importRecipeFromUrl, parseRecipeImage, parseRecipeText } from '../lib/ai'
import { X, Link, Sparkles, Camera } from './Icons'

interface Props {
  day: Day
  settings: Settings
  onClose: () => void
  onAdd: (meal: Meal) => void
}

type Mode = 'link' | 'paste' | 'photo'

// Every photo is re-encoded as JPEG when resized, so this is the only type we send.
type PhotoType = 'image/jpeg'

// Claude reads images at up to ~1568px on the long edge anyway, and shrinking
// here keeps the upload well under the Netlify function body-size limit.
const MAX_DIMENSION = 1568

function loadImage(dataUrl: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error("Couldn't read that photo"))
    img.src = dataUrl
  })
}

function readImage(file: File): Promise<{ base64: string; mediaType: PhotoType; preview: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = async () => {
      try {
        const dataUrl = reader.result as string
        const img = await loadImage(dataUrl)
        const scale = Math.min(1, MAX_DIMENSION / Math.max(img.width, img.height))
        const canvas = document.createElement('canvas')
        canvas.width = Math.round(img.width * scale)
        canvas.height = Math.round(img.height * scale)
        const ctx = canvas.getContext('2d')
        if (!ctx) throw new Error("Couldn't read that photo")
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
        const resizedUrl = canvas.toDataURL('image/jpeg', 0.85)
        resolve({ base64: resizedUrl.split(',')[1] ?? '', mediaType: 'image/jpeg', preview: resizedUrl })
      } catch (e) {
        reject(e instanceof Error ? e : new Error("Couldn't read that photo"))
      }
    }
    reader.onerror = () => reject(new Error("Couldn't read that photo"))
    reader.readAsDataURL(file)
  })
}

export default function AddRecipeModal({ day, settings, onClose, onAdd }: Props) {
  const [mode, setMode] = useState<Mode>('link')
  const [url, setUrl] = useState('')
  const [text, setText] = useState('')
  const [photo, setPhoto] = useState<{ base64: string; mediaType: PhotoType; preview: string } | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const isSlow = SLOW_COOKER_DAYS.includes(day)

  async function handleFile(file: File | undefined) {
    if (!file) return
    setError('')
    try {
      setPhoto(await readImage(file))
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't read that photo")
    }
  }

  async function submit() {
    setError('')
    setBusy(true)
    try {
      const meal =
        mode === 'link'
          ? await importRecipeFromUrl(settings, url.trim(), day)
          : mode === 'photo'
            ? await parseRecipeImage(settings, photo!.base64, photo!.mediaType, day)
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

  const canSubmit =
    mode === 'link' ? url.trim().length > 4 : mode === 'photo' ? photo !== null : text.trim().length > 20

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
          <Tab active={mode === 'photo'} onClick={() => setMode('photo')} icon={<Camera className="size-4" />}>
            Scan a photo
          </Tab>
          <Tab active={mode === 'paste'} onClick={() => setMode('paste')} icon={<Sparkles className="size-4" />}>
            Paste recipe text
          </Tab>
        </div>

        <div className="p-4 space-y-3">
          {mode === 'link' ? (
            <Fragment key="link">
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
            </Fragment>
          ) : mode === 'photo' ? (
            <Fragment key="photo">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                capture="environment"
                className="hidden"
                onChange={(e) => handleFile(e.target.files?.[0])}
              />
              {photo ? (
                <div className="relative">
                  <img
                    src={photo.preview}
                    alt="Cookbook page"
                    className="w-full max-h-64 object-contain rounded-lg border border-gray-200 bg-gray-50"
                  />
                  <button
                    onClick={() => setPhoto(null)}
                    className="absolute top-2 right-2 bg-white/90 rounded-full p-1.5 text-gray-500 hover:text-gray-800 shadow"
                  >
                    <X className="size-4" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-300 py-8 text-gray-500 hover:border-green-400 hover:text-green-700"
                >
                  <Camera className="size-6" />
                  <span className="text-sm font-medium">Take or choose a photo</span>
                </button>
              )}
              <p className="text-xs text-gray-500">
                Snap a cookbook page and Claude will read the ingredients and method, scaled for{' '}
                {settings.household}.
              </p>
            </Fragment>
          ) : (
            <Fragment key="paste">
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
            </Fragment>
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
