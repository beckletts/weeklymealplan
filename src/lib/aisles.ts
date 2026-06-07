import { AISLES, type Aisle } from '../types'

/**
 * Keyword → aisle lookup used as a fallback when the AI doesn't supply an
 * aisle (e.g. for manually-typed extras). Order matters: first match wins, so
 * more specific terms are listed before generic ones.
 */
const KEYWORDS: [Aisle, string[]][] = [
  ['Meat & Fish', ['chicken', 'beef', 'pork', 'lamb', 'mince', 'sausage', 'bacon', 'gammon', 'turkey', 'steak', 'salmon', 'cod', 'haddock', 'tuna', 'prawn', 'fish', 'chorizo', 'ham']],
  ['Dairy & Eggs', ['milk', 'cheese', 'butter', 'yoghurt', 'yogurt', 'cream', 'egg', 'creme fraiche', 'mozzarella', 'cheddar', 'feta', 'parmesan', 'margarine']],
  ['Bakery', ['bread', 'roll', 'bun', 'bagel', 'wrap', 'tortilla', 'naan', 'pitta', 'baguette', 'croissant', 'muffin', 'crumpet']],
  ['Tins & Jars', ['tin', 'tinned', 'canned', 'chopped tomato', 'passata', 'baked bean', 'chickpea', 'kidney bean', 'butter bean', 'sweetcorn', 'coconut milk', 'jar']],
  ['Pasta, Rice & Grains', ['pasta', 'spaghetti', 'penne', 'fusilli', 'rice', 'noodle', 'couscous', 'quinoa', 'lentil', 'flour', 'oat', 'lasagne', 'gnocchi', 'bulgur']],
  ['Herbs, Spices & Sauces', ['salt', 'pepper', 'cumin', 'paprika', 'curry', 'spice', 'oregano', 'basil', 'thyme', 'rosemary', 'coriander', 'stock', 'cube', 'oil', 'vinegar', 'soy sauce', 'ketchup', 'mayonnaise', 'mustard', 'honey', 'sugar', 'garlic', 'ginger', 'chilli', 'cinnamon', 'turmeric', 'sauce', 'worcestershire', 'gravy']],
  ['Frozen', ['frozen', 'ice cream', 'peas']],
  ['Drinks & Snacks', ['juice', 'squash', 'cola', 'lemonade', 'water', 'wine', 'beer', 'crisp', 'chocolate', 'biscuit', 'snack', 'coffee', 'tea bag']],
  ['Household', ['kitchen roll', 'toilet roll', 'washing', 'detergent', 'bin bag', 'foil', 'cling film', 'sponge', 'soap', 'shampoo', 'bleach', 'cleaner']],
  ['Fruit & Veg', ['onion', 'potato', 'carrot', 'tomato', 'pepper', 'mushroom', 'broccoli', 'spinach', 'lettuce', 'cucumber', 'courgette', 'aubergine', 'leek', 'celery', 'cabbage', 'cauliflower', 'sweet potato', 'apple', 'banana', 'lemon', 'lime', 'orange', 'berry', 'avocado', 'salad', 'veg', 'fruit', 'herb', 'parsley', 'spring onion', 'kale', 'bean', 'corn', 'squash', 'pumpkin']],
]

export function guessAisle(name: string): Aisle {
  const n = name.toLowerCase()
  for (const [aisle, words] of KEYWORDS) {
    if (words.some((w) => n.includes(w))) return aisle
  }
  return 'Other'
}

/** Normalise whatever the AI returns into one of our known aisles. */
export function normaliseAisle(value: string | undefined, name: string): Aisle {
  if (value) {
    const match = AISLES.find((a) => a.toLowerCase() === value.toLowerCase().trim())
    if (match) return match
  }
  return guessAisle(name)
}

export function aisleOrder(aisle: Aisle): number {
  const i = AISLES.indexOf(aisle)
  return i === -1 ? AISLES.length : i
}
