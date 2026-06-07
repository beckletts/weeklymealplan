export const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday'] as const
export type Day = (typeof DAYS)[number]

/** Slow cooker meals are wanted on these days. */
export const SLOW_COOKER_DAYS: Day[] = ['Tuesday', 'Thursday']

export const AISLES = [
  'Fruit & Veg',
  'Meat & Fish',
  'Dairy & Eggs',
  'Bakery',
  'Tins & Jars',
  'Pasta, Rice & Grains',
  'Herbs, Spices & Sauces',
  'Frozen',
  'Drinks & Snacks',
  'Household',
  'Other',
] as const
export type Aisle = (typeof AISLES)[number]

export interface Ingredient {
  id: string
  name: string
  /** Free-text amount, e.g. "2", "400g", "1 tbsp". */
  quantity: string
  aisle: Aisle
}

export type MealSource = 'ai' | 'link' | 'manual'

export interface Meal {
  id: string
  day: Day
  title: string
  source: MealSource
  url?: string
  isSlowCooker: boolean
  servings: number
  ingredients: Ingredient[]
  method: string[]
  notes?: string
}

export interface ExtraItem {
  id: string
  name: string
  quantity: string
  aisle: Aisle
}

export interface WeekPlan {
  /** ISO date (yyyy-mm-dd) of the Sunday this plan starts. */
  weekStart: string
  meals: Meal[]
  extras: ExtraItem[]
  /** Keys of shopping-list rows that have been ticked off. */
  checked: string[]
}

export interface Settings {
  apiKey: string
  household: number
  likes: string
  dislikes: string
  cuisines: string
}

export const DEFAULT_SETTINGS: Settings = {
  apiKey: '',
  household: 2,
  likes: '',
  dislikes: '',
  cuisines: '',
}
