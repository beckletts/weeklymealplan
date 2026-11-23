import { useState } from 'react'
import { DAYS, SLOW_COOKER_DAYS, type Day, type FavouriteRecipe, type Meal } from '../types'
import { Heart, Pot, Chevron } from './Icons'

interface Props {
  favourites: FavouriteRecipe[]
  mealByDay: Map<Day, Meal>
  onAddToDay: (recipe: FavouriteRecipe, day: Day) => void
  onRemove: (id: string) => void
}

export default function FavouritesView({ favourites, mealByDay, onAddToDay, onRemove }: Props) {
  if (favourites.length === 0) {
    return (
      <div className="text-center text-gray-400 py-16 text-sm px-6">
        <Heart className="size-8 mx-auto mb-2 text-gray-200" />
        No favourites yet. Tap the heart on a planned meal to save it here, ready to add again
        another week.
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {favourites.map((recipe) => (
        <FavouriteCard
          key={recipe.id}
          recipe={recipe}
          mealByDay={mealByDay}
          onAddToDay={onAddToDay}
          onRemove={onRemove}
        />
      ))}
    </div>
  )
}

function FavouriteCard({
  recipe,
  mealByDay,
  onAddToDay,
  onRemove,
}: {
  recipe: FavouriteRecipe
  mealByDay: Map<Day, Meal>
  onAddToDay: (recipe: FavouriteRecipe, day: Day) => void
  onRemove: (id: string) => void
}) {
  const [open, setOpen] = useState(false)
  const hasDetail = recipe.ingredients.length > 0 || recipe.method.length > 0

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-4 pt-3 pb-1 flex items-start justify-between gap-2">
        <button
          onClick={() => hasDetail && setOpen((o) => !o)}
          className="flex-1 flex items-start justify-between gap-2 text-left group min-w-0"
          disabled={!hasDetail}
        >
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-medium text-gray-900 group-hover:text-green-700 truncate">
                {recipe.title}
              </span>
              {recipe.isSlowCooker && <Pot className="size-3.5 text-amber-600 shrink-0" />}
            </div>
            <span className="text-xs text-gray-400">
              {recipe.servings} servings
              {!hasDetail && ' · no saved ingredients'}
            </span>
          </div>
          {hasDetail && (
            <Chevron
              className={`size-4 text-gray-400 shrink-0 mt-0.5 transition-transform ${open ? 'rotate-90' : ''}`}
            />
          )}
        </button>
        <button
          onClick={() => onRemove(recipe.id)}
          className="p-1 text-rose-500 hover:text-rose-700 shrink-0"
          title="Remove favourite"
        >
          <Heart className="size-4" filled />
        </button>
      </div>

      {open && hasDetail && (
        <div className="px-4 pb-2 pt-1 space-y-3 text-sm">
          {recipe.ingredients.length > 0 && (
            <div>
              <p className="font-medium text-gray-700 mb-1">Ingredients</p>
              <ul className="space-y-0.5 text-gray-600">
                {recipe.ingredients.map((i) => (
                  <li key={i.id} className="flex justify-between gap-2">
                    <span>{i.name}</span>
                    <span className="text-gray-400 shrink-0">{i.quantity}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {recipe.method.length > 0 && (
            <div>
              <p className="font-medium text-gray-700 mb-1">Method</p>
              <ol className="list-decimal list-inside space-y-1 text-gray-600">
                {recipe.method.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ol>
            </div>
          )}
        </div>
      )}

      <div className="px-4 pb-3 pt-2 border-t border-gray-50">
        <p className="text-xs text-gray-400 mb-1.5">Add to plan</p>
        <div className="grid grid-cols-5 gap-1.5">
          {DAYS.map((day) => {
            const occupied = mealByDay.get(day)
            const isSlow = SLOW_COOKER_DAYS.includes(day)
            return (
              <button
                key={day}
                onClick={() => onAddToDay(recipe, day)}
                title={occupied ? `Replace ${occupied.title} on ${day}` : `Add to ${day}`}
                className={`rounded-lg py-1.5 text-xs font-medium border ${
                  occupied
                    ? 'border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100'
                    : 'border-gray-200 text-gray-600 hover:border-green-400 hover:text-green-700'
                }`}
              >
                {day.slice(0, 3)}
                {isSlow && ' 🍲'}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
