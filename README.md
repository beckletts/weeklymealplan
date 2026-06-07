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
  stuff), and a one-tap **Copy list**.
- **Week navigation** — plan ahead or look back; each week is saved.
- Your Claude API key lives **only in your browser** (localStorage), never in
  the code or any server.

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:5173, go to **Settings**, paste an Anthropic API key
(from console.anthropic.com → API Keys), set your household size and
preferences, then hit **Plan my week with AI**.

## Deploy (Netlify)

The repo includes `netlify.toml`. Connect the repo in Netlify (or drag the
`dist/` folder after `npm run build`). No environment variables needed — the
API key is entered in the app's Settings on each device.

## Notes on sync

Plans are currently stored per-device in the browser. To sync the same plan
between your laptop and phone, a small cloud backend (Firebase/Supabase) can be
added — the storage layer in `src/lib/storage.ts` is isolated for exactly this.
