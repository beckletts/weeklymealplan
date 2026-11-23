// Tracks dishes the household has "hearted", including the full recipe so
// they can be re-added to a week straight from the Favourites tab. Stored
// globally (not per-week) in localStorage. The AI planner also leans towards
// these titles when suggesting new meals.
import type { FavouriteRecipe, Meal } from '../types'
import { uid } from './storage'

const KEY = 'weekly-shop:favourites'

function fromMeal(meal: Meal): FavouriteRecipe {
  return {
    id: uid(),
    title: meal.title,
    source: meal.source,
    url: meal.url,
    isSlowCooker: meal.isSlowCooker,
    servings: meal.servings,
    ingredients: meal.ingredients,
    method: meal.method,
    notes: meal.notes,
  }
}

export function loadFavourites(): FavouriteRecipe[] {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    // Older versions stored favourites as plain title strings — upgrade them
    // in place so they still show up (with no saved ingredients to re-add).
    return parsed.map((item) =>
      typeof item === 'string'
        ? {
            id: uid(),
            title: item,
            source: 'manual' as const,
            isSlowCooker: false,
            servings: 2,
            ingredients: [],
            method: [],
          }
        : item,
    )
  } catch {
    /* ignore corrupt data */
  }
  return []
}

function save(list: FavouriteRecipe[]): void {
  localStorage.setItem(KEY, JSON.stringify(list))
}

/** Titles only, for biasing the AI planner. */
export function favouriteTitles(list: FavouriteRecipe[]): string[] {
  return list.map((f) => f.title)
}

export function isFavourite(list: FavouriteRecipe[], title: string): boolean {
  const t = title.trim().toLowerCase()
  return list.some((f) => f.title.trim().toLowerCase() === t)
}

/** Returns the new list (does not mutate the input). */
export function toggleFavourite(list: FavouriteRecipe[], meal: Meal): FavouriteRecipe[] {
  const next = isFavourite(list, meal.title)
    ? list.filter((f) => f.title.trim().toLowerCase() !== meal.title.trim().toLowerCase())
    : [...list, fromMeal(meal)]
  save(next)
  return next
}

export function removeFavourite(list: FavouriteRecipe[], id: string): FavouriteRecipe[] {
  const next = list.filter((f) => f.id !== id)
  save(next)
  return next
}
