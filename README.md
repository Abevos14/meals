# Meals

My meal app. A PWA in plain HTML, CSS, and JavaScript. No frameworks, no build step.

Live: https://abevos14.github.io/meals/

## Files

- `index.html` : the page shell
- `style.css` : all styling, light and dark
- `meals.js` : ALL meal data, targets, and grocery prices. Edit this to change meals.
- `app.js` : screen code. Leave it alone unless you want new features.
- `sw.js` : offline cache. Bump `CACHE` on every update.
- `manifest.webmanifest`, `icons/` : home screen install

## Edit or add a meal

1. Open `meals.js`. Copy a meal block, paste it, change the fields.
2. Spell each ingredient `item` exactly like the `GROCERY` table at the bottom of the file.
3. Macros and cost are per serving.
4. In `sw.js`, bump `meals-v1` to `meals-v2` (then v3, and so on).
5. `git add .` then `git commit -m "Add meal"` then `git push`.
6. On the phone: close the app fully and reopen it, twice if needed.

## Estimates

Macros come from typical nutrition labels. Costs come from typical Aldi and Sam's Club prices.
Check your own packages, especially the protein noodles, and fix the numbers in `meals.js`.

## Targets and favorites

Default daily targets and default starred meals are at the top of `meals.js`.
You can also change targets in the app (gear button) and star meals by tapping the star on a meal.

## Data on the phone

Each day's log, favorites, targets, the weekly grocery plan, and the theme are saved on the phone only (localStorage).
Deleting the app from the home screen erases them.
