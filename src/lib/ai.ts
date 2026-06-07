import Anthropic from '@anthropic-ai/sdk'
import { DAYS, SLOW_COOKER_DAYS, AISLES, type Day, type Meal, type Settings } from '../types'
import { normaliseAisle } from './aisles'
import { uid } from './storage'

const MODEL = 'claude-sonnet-4-6'

function client(apiKey: string) {
  return new Anthropic({ apiKey, dangerouslyAllowBrowser: true })
}

/**
 * Send a Messages API request. If the user has entered their own key it goes
 * straight to Anthropic from the browser; otherwise we POST to the Netlify
 * function proxy, which holds the key server-side.
 */
async function createMessage(
  settings: Settings,
  body: Anthropic.MessageCreateParamsNonStreaming,
): Promise<Anthropic.Message> {
  if (settings.apiKey.trim()) {
    return client(settings.apiKey).messages.create(body)
  }
  const res = await fetch('/.netlify/functions/claude', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    if (res.status === 404) {
      throw new Error(
        'No API key found. Add one in Settings, or deploy with ANTHROPIC_API_KEY set on Netlify.',
      )
    }
    let msg = `AI request failed (${res.status})`
    try {
      const data = await res.json()
      if (data?.error?.message) msg = data.error.message
    } catch {
      /* ignore */
    }
    throw new Error(msg)
  }
  return (await res.json()) as Anthropic.Message
}

type InputSchema = Anthropic.Tool.InputSchema

const ingredientSchema = {
  type: 'object',
  properties: {
    name: { type: 'string', description: 'Ingredient name only, e.g. "chicken breast"' },
    quantity: { type: 'string', description: 'Amount for the whole dish, e.g. "400g", "2", "1 tbsp"' },
    aisle: { type: 'string', enum: AISLES as unknown as string[] },
  },
  required: ['name', 'quantity', 'aisle'],
}

const mealSchema = {
  type: 'object',
  properties: {
    day: { type: 'string', enum: DAYS as unknown as string[] },
    title: { type: 'string' },
    isSlowCooker: { type: 'boolean' },
    servings: { type: 'number' },
    ingredients: { type: 'array', items: ingredientSchema },
    method: { type: 'array', items: { type: 'string' }, description: 'Short numbered steps' },
    notes: { type: 'string', description: 'Optional tip, e.g. prep-ahead note' },
  },
  required: ['day', 'title', 'isSlowCooker', 'servings', 'ingredients', 'method'],
}

function preferences(s: Settings): string {
  const parts: string[] = [`Cooking for ${s.household} ${s.household === 1 ? 'person' : 'people'}.`]
  if (s.likes.trim()) parts.push(`They like: ${s.likes.trim()}.`)
  if (s.dislikes.trim()) parts.push(`Avoid: ${s.dislikes.trim()}.`)
  if (s.cuisines.trim()) parts.push(`Favourite cuisines/styles: ${s.cuisines.trim()}.`)
  return parts.join(' ')
}

interface RawMeal {
  day: Day
  title: string
  isSlowCooker: boolean
  servings: number
  ingredients: { name: string; quantity: string; aisle?: string }[]
  method: string[]
  notes?: string
}

function toMeal(raw: RawMeal, source: Meal['source'], url?: string): Meal {
  return {
    id: uid(),
    day: raw.day,
    title: raw.title,
    source,
    url,
    isSlowCooker: raw.isSlowCooker,
    servings: raw.servings,
    ingredients: (raw.ingredients ?? []).map((i) => ({
      id: uid(),
      name: i.name,
      quantity: i.quantity ?? '',
      aisle: normaliseAisle(i.aisle, i.name),
    })),
    method: raw.method ?? [],
    notes: raw.notes,
  }
}

/**
 * Generate a meal for each of the given days. Tuesday & Thursday are always
 * slow-cooker dishes. `avoid` lists titles already in the plan to prevent
 * repeats when topping up empty days.
 */
export interface TasteProfile {
  /** Dishes the user has hearted — lean towards these styles. */
  favourites: string[]
  /** Dishes cooked in recent weeks — avoid repeating for variety. */
  recent: string[]
}

export async function generatePlan(
  settings: Settings,
  days: Day[],
  avoid: string[],
  taste: TasteProfile = { favourites: [], recent: [] },
): Promise<Meal[]> {
  if (days.length === 0) return []
  const slowDays = days.filter((d) => SLOW_COOKER_DAYS.includes(d))
  const system = [
    'You are a friendly UK meal planner in the style of "Bored of Lunch": quick, healthy, slimming-friendly family dinners using everyday supermarket ingredients (Tesco/Sainsbury\'s/Aldi).',
    'Keep dishes realistic for a weeknight. Use UK ingredient names, metric quantities, and UK supermarket aisle categories.',
    'Scale every ingredient quantity to the requested number of servings.',
    slowDays.length
      ? `These days MUST be slow-cooker recipes (set isSlowCooker true): ${slowDays.join(', ')}.`
      : '',
    'All other days should be quick hob/oven dinners (isSlowCooker false).',
  ]
    .filter(Boolean)
    .join(' ')

  const prompt = [
    preferences(settings),
    taste.favourites.length
      ? `Meals the household has loved before — lean towards these flavours and styles (but suggest fresh ideas, don't just copy): ${taste.favourites.join('; ')}.`
      : '',
    `Plan dinners for: ${days.join(', ')}.`,
    `Give exactly ${days.length} meals, one per day, each different.`,
    avoid.length ? `Do NOT repeat these dishes already planned this week: ${avoid.join('; ')}.` : '',
    taste.recent.length
      ? `Also avoid repeating dishes cooked in recent weeks, to keep things varied: ${taste.recent.join('; ')}.`
      : '',
    `Use ${settings.household} servings for each meal.`,
    'Return them via the submit_plan tool.',
  ]
    .filter(Boolean)
    .join(' ')

  const res = await createMessage(settings, {
    model: MODEL,
    max_tokens: 4000,
    system,
    tools: [
      {
        name: 'submit_plan',
        description: 'Submit the planned meals.',
        input_schema: {
          type: 'object',
          properties: { meals: { type: 'array', items: mealSchema } },
          required: ['meals'],
        } as InputSchema,
      },
    ],
    tool_choice: { type: 'tool', name: 'submit_plan' },
    messages: [{ role: 'user', content: prompt }],
  })

  const block = res.content.find((b) => b.type === 'tool_use')
  if (!block || block.type !== 'tool_use') throw new Error('No plan returned')
  const meals = (block.input as { meals: RawMeal[] }).meals ?? []
  // Enforce slow-cooker flag for Tue/Thu regardless of model output.
  return meals.map((m) =>
    toMeal({ ...m, isSlowCooker: SLOW_COOKER_DAYS.includes(m.day) ? true : m.isSlowCooker }, 'ai'),
  )
}

/** Parse a free-text recipe (pasted) into a structured meal for the given day. */
export async function parseRecipeText(
  settings: Settings,
  text: string,
  day: Day,
  url?: string,
): Promise<Meal> {
  const isSlow = SLOW_COOKER_DAYS.includes(day)
  const res = await createMessage(settings, {
    model: MODEL,
    max_tokens: 3000,
    system:
      'Extract a single recipe from the text the user provides. Use UK ingredient names, metric quantities and UK supermarket aisles. Scale ingredient quantities to the requested servings if the original differs.',
    tools: [
      {
        name: 'submit_recipe',
        description: 'Submit the parsed recipe.',
        input_schema: mealSchema as InputSchema,
      },
    ],
    tool_choice: { type: 'tool', name: 'submit_recipe' },
    messages: [
      {
        role: 'user',
        content: `Servings wanted: ${settings.household}. This recipe is for ${day} (${
          isSlow ? 'slow cooker' : 'normal'
        }).\n\nRecipe:\n${text.slice(0, 12000)}`,
      },
    ],
  })

  const block = res.content.find((b) => b.type === 'tool_use')
  if (!block || block.type !== 'tool_use') throw new Error('Could not read that recipe')
  const raw = block.input as RawMeal
  return toMeal({ ...raw, day, isSlowCooker: isSlow || raw.isSlowCooker }, url ? 'link' : 'manual', url)
}

/**
 * Fetch a recipe page's readable text via the Jina reader proxy (handles CORS
 * and strips boilerplate), then parse it. Falls back with a clear error so the
 * UI can prompt the user to paste the text instead.
 */
export async function importRecipeFromUrl(
  settings: Settings,
  url: string,
  day: Day,
): Promise<Meal> {
  let pageText: string
  try {
    const res = await fetch('https://r.jina.ai/' + url, {
      headers: { Accept: 'text/plain' },
    })
    if (!res.ok) throw new Error(String(res.status))
    pageText = await res.text()
  } catch {
    throw new Error(
      "Couldn't fetch that link automatically. Paste the recipe text instead and I'll read it.",
    )
  }
  return parseRecipeText(settings, pageText, day, url)
}
