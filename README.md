# 🛒 Sunday Shop

A weekly meal planner built around your routine: a **Sunday → Thursday** plan
(the big shop), with **slow-cooker dinners always slotted on Tuesday &
Thursday**. Claude suggests the meals in a Bored of Lunch style, and you can
drop in your own links or pasted recipes any time. Everything rolls up into one
de-duplicated, aisle-grouped shopping list you can tick off in the supermarket.

## Features

- **Plan my week with AI** — generates 5 dinners (Tue/Thu = slow cooker),
  scaled to your household, avoiding repeats. Swap or regenerate any day.
- **Add your own** — paste a recipe link (Bored of Lunch, Pinch of Nom, BBC
  Food, Tesco, Sainsbury's…) and Claude reads the page; or paste recipe text.
- **Smart shopping list** — combined across all meals, grouped by aisle, with
  tick-off checkboxes, your own extras (the Friday weekend bits, household
  stuff), **Copy list**, and **one-tap send to Apple Reminders**.
- **Learns your taste** — heart the meals you love and the AI leans towards
  those styles next time, while automatically avoiding dishes from recent weeks
  so the menu stays varied.
- **Week navigation** — plan ahead or look back; each week is saved.
- **Secure key** — on the deployed site your Anthropic key is held server-side
  in a Netlify Function and never shipped to the browser.

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:5173, go to **Settings**, paste an Anthropic API key
(from console.anthropic.com → API Keys), set your household size and
preferences, then hit **Plan my week with AI**.

## Deploy (Netlify)

The repo includes `netlify.toml` and a serverless proxy at
`netlify/functions/claude.mjs`. Connect the repo in Netlify, then set **one**
environment variable:

```
ANTHROPIC_API_KEY = sk-ant-...
```

(Site settings → Environment variables.) This key stays on the server and is
never sent to the browser, so you don't have to enter it on each device. For
local `netlify dev`, copy `.env.example` to `.env`.

## Apple Reminders

The **Reminders** button on the Shopping tab sends your unticked items to an
Apple Shortcut. One-time setup: create a Shortcut named **Add Shopping List**
that takes Shortcut Input → Split Text by New Lines → Repeat with Each → Add
New Reminder. Tap the **?** button in the app for the full steps. You can rename
the shortcut in Settings.

## Notes on sync

Plans are stored per-device in the browser. To sync the same plan between your
laptop and phone, a small cloud backend (Firebase/Supabase) can be added — the
storage layer in `src/lib/storage.ts` is isolated for exactly this.
