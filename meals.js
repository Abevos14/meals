/* =====================================================================
   meals.js  -  ALL meal data lives here. Edit this file to change the app.
   The screen code (app.js) never needs to be touched.

   TO ADD A MEAL: copy one meal block below, paste it, and change:
     id          unique, lowercase, no spaces (example: "egg-tacos")
     name        what shows on the card
     category    one of: "breakfast" "lunch" "dinner" "small" "prep"
     servings    how many servings the ingredient list makes
     time        cook time text
     ingredients item, qty, unit. Spell "item" exactly like the GROCERY
                 table at the bottom so the grocery list can combine it.
     steps       one string per step
     macros      PER SERVING: protein, carbs, fat, fiber (grams), calories
     cost        PER SERVING, in dollars
     notes       optional

   All macros and costs are ESTIMATES from typical nutrition labels and
   typical Aldi / Sam's Club prices. Check your own packages.

   After any edit: bump CACHE in sw.js, then git add . / commit / push.
   ===================================================================== */

const TARGETS = {
  proteinMin: 190,   // grams per day
  proteinMax: 200,
  fiber: 40          // grams per day
};

const CATEGORIES = [
  { id: "breakfast", name: "Breakfast",  hint: "Before noon is fine" },
  { id: "lunch",     name: "Lunch",      hint: "Big protein bowls" },
  { id: "dinner",    name: "Dinner",     hint: "Meat, veg, potato" },
  { id: "small",     name: "Small meal", hint: "The 4th, lighter meal" },
  { id: "prep",      name: "Meal prep",  hint: "Batches and ranch" }
];

const MEALS = [
  {
    id: "egg-scramble",
    name: "Egg and Cottage Cheese Scramble",
    category: "breakfast",
    servings: 1,
    time: "8 min",
    ingredients: [
      { item: "Eggs", qty: 5, unit: "each" },
      { item: "Cottage cheese", qty: 0.5, unit: "cup" },
      { item: "Sauerkraut", qty: 0.25, unit: "cup", note: "on the side, cold" },
      { item: "Sourdough bread", qty: 1, unit: "slice" },
      { item: "Olive oil", qty: 1, unit: "tsp" },
      { item: "Salt, pepper, garlic powder", qty: 0, unit: "", note: "to taste" },
    ],
    steps: [
      "Heat oil in a pan on medium.",
      "Crack in the eggs and stir slowly for 2 to 3 minutes.",
      "When the eggs are almost set, stir in the cottage cheese and cook 30 more seconds.",
      "Toast the sourdough.",
      "Plate with the sauerkraut cold on the side. Do not heat the kraut, heat kills the live cultures.",
    ],
    macros: { protein: 47, carbs: 33, fat: 35, fiber: 2, calories: 625 },
    cost: 2.13,
    notes: "For live cultures, buy refrigerated raw sauerkraut. Shelf-stable jars are pasteurized."
  },
  {
    id: "pb-oatmeal",
    name: "PB Date Microwave Oatmeal",
    category: "breakfast",
    servings: 1,
    time: "6 min",
    ingredients: [
      { item: "Rolled oats", qty: 1, unit: "cup" },
      { item: "Whole milk", qty: 1.5, unit: "cup", note: "not 2 cups" },
      { item: "Peanut butter", qty: 1, unit: "tbsp" },
      { item: "Deglet Noor dates", qty: 3, unit: "each", note: "chopped" },
      { item: "Cinnamon", qty: 0, unit: "", note: "1/2 tsp" },
      { item: "Sauerkraut", qty: 0.25, unit: "cup", note: "eat first, on the side" },
    ],
    steps: [
      "Use a big bowl, at least 4 cups, so it cannot boil over.",
      "Add oats, milk, and cinnamon. Stir.",
      "Microwave 2 minutes. Stir.",
      "Microwave 1 more minute. Stop early if it climbs to the rim.",
      "Rest 2 minutes. It thickens a lot as it sits.",
      "Top with peanut butter and chopped dates.",
    ],
    macros: { protein: 26, carbs: 92, fat: 26, fiber: 12, calories: 685 },
    cost: 0.91,
    notes: "Liquid is cut from 2 cups to 1 1/2 so it sets thick instead of soupy. Still too loose in your microwave: drop to 1 1/4 cups. Fewer carbs: use 1/2 cup oats and 3/4 cup milk. More protein: stir in 1/2 cup Greek yogurt after cooking (+12 g)."
  },
  {
    id: "yogurt-bowl",
    name: "Greek Yogurt Berry Bowl",
    category: "breakfast",
    servings: 1,
    time: "3 min",
    ingredients: [
      { item: "Plain Greek yogurt", qty: 1.5, unit: "cup" },
      { item: "Frozen berries", qty: 1, unit: "cup" },
      { item: "Pumpkin seeds", qty: 2, unit: "tbsp" },
      { item: "Almonds", qty: 1, unit: "oz", note: "about 23" },
      { item: "Deglet Noor dates", qty: 2, unit: "each", note: "chopped" },
      { item: "Sauerkraut", qty: 0.25, unit: "cup", note: "eat first, on the side" },
    ],
    steps: [
      "Microwave the frozen berries 45 seconds so they thaw and make their own syrup.",
      "Put yogurt in a bowl. Pour berries over it.",
      "Top with pumpkin seeds, almonds, and dates.",
    ],
    macros: { protein: 47, carbs: 50, fat: 22, fiber: 11, calories: 565 },
    cost: 3.10
  },
  {
    id: "favorite-bowl",
    name: "The Favorite Bowl",
    category: "lunch",
    servings: 1,
    time: "12 min",
    ingredients: [
      { item: "Chicken breast", qty: 6, unit: "oz", note: "raw weight, about 130 g cooked" },
      { item: "White basmati rice", qty: 0.25, unit: "cup", note: "dry, about 3/4 cup cooked" },
      { item: "Protein noodles", qty: 2, unit: "oz", note: "dry" },
      { item: "Cottage cheese", qty: 1, unit: "cup" },
      { item: "Broccoli, fresh", qty: 1, unit: "cup" },
      { item: "Homemade ranch", qty: 2, unit: "tbsp" },
      { item: "Salt, pepper, garlic powder", qty: 0, unit: "", note: "to taste" },
    ],
    steps: [
      "Boil the noodles per the box. Drop the broccoli into the same pot for the last 3 minutes. Drain.",
      "Reheat batch chicken and rice in the microwave 1:30. No batch: cook the rice and pan-cook the chicken 6 to 7 minutes a side.",
      "Bowl: rice and noodles on the bottom, then chicken and broccoli.",
      "Cottage cheese on top. Season. Finish with ranch.",
    ],
    macros: { protein: 86, carbs: 90, fat: 17, fiber: 8, calories: 810 },
    cost: 3.11,
    notes: "Chicken, rice, protein noodles, and cottage cheese in one bowl. Lower carb: skip the rice, keep the noodles."
  },
  {
    id: "chicken-quesadilla",
    name: "Chicken and Bean Quesadillas",
    category: "lunch",
    servings: 1,
    time: "10 min",
    ingredients: [
      { item: "High-fiber tortillas", qty: 2, unit: "each" },
      { item: "Chicken breast", qty: 4, unit: "oz", note: "raw weight, about 85 g cooked, chopped" },
      { item: "Black beans, canned", qty: 0.5, unit: "cup", note: "drained, lightly mashed" },
      { item: "Shredded cheese", qty: 0.5, unit: "cup" },
      { item: "Salsa", qty: 2, unit: "tbsp" },
      { item: "Homemade ranch", qty: 2, unit: "tbsp", note: "for dipping" },
    ],
    steps: [
      "Mash the beans a little with a fork so they stick.",
      "Spread beans on half of each tortilla. Add chicken and cheese. Fold.",
      "Dry pan on medium. Cook 2 to 3 minutes a side until crisp and the cheese melts.",
      "Cut in half. Dip in salsa and ranch.",
    ],
    macros: { protein: 59, carbs: 65, fat: 28, fiber: 37, calories: 630 },
    cost: 2.53,
    notes: "One of the best fiber meals in the app: the tortillas and beans carry it."
  },
  {
    id: "turkey-taco-bowl",
    name: "Turkey Taco Bowl",
    category: "lunch",
    servings: 1,
    time: "15 min",
    ingredients: [
      { item: "Ground turkey (93/7)", qty: 6, unit: "oz", note: "raw weight" },
      { item: "Black beans, canned", qty: 0.5, unit: "cup", note: "drained" },
      { item: "White basmati rice", qty: 0.25, unit: "cup", note: "dry, about 3/4 cup cooked" },
      { item: "Cottage cheese", qty: 0.5, unit: "cup", note: "in place of sour cream" },
      { item: "Salsa", qty: 3, unit: "tbsp" },
      { item: "Taco seasoning", qty: 0, unit: "", note: "2 tsp" },
      { item: "Salt, pepper, garlic powder", qty: 0, unit: "", note: "to taste" },
    ],
    steps: [
      "Brown the turkey on medium-high 8 to 10 minutes, breaking it up. Or reheat a serving of the batch taco turkey.",
      "Stir in taco seasoning, 2 tbsp water, and the beans. Cook 2 minutes.",
      "Reheat or cook the rice.",
      "Bowl: rice, then turkey and beans. Top with cottage cheese and salsa.",
    ],
    macros: { protein: 54, carbs: 64, fat: 19, fiber: 8, calories: 650 },
    cost: 2.76,
    notes: "Lower carb: skip the rice and double the beans."
  },
  {
    id: "chicken-potato-broccoli",
    name: "Chicken, Potato, and Broccoli Plate",
    category: "dinner",
    servings: 1,
    time: "15 min",
    ingredients: [
      { item: "Chicken breast", qty: 8, unit: "oz", note: "raw weight, about 170 g cooked" },
      { item: "Potatoes", qty: 1, unit: "each", note: "medium" },
      { item: "Broccoli, fresh", qty: 2, unit: "cup" },
      { item: "Olive oil", qty: 1, unit: "tsp" },
      { item: "Homemade ranch", qty: 3, unit: "tbsp" },
      { item: "Salt, pepper, garlic powder", qty: 0, unit: "", note: "to taste" },
    ],
    steps: [
      "Poke the potato with a fork. Microwave 5 to 7 minutes, flipping halfway.",
      "Broccoli in a bowl with 2 tbsp water. Cover and microwave 3 to 4 minutes.",
      "Reheat batch chicken 1:30. No batch: pan-cook 6 to 7 minutes a side to 165 F.",
      "Split the potato. Drizzle oil on the broccoli. Season everything.",
      "Ranch over the potato and chicken.",
    ],
    macros: { protein: 63, carbs: 53, fat: 11, fiber: 9, calories: 550 },
    cost: 2.62
  },
  {
    id: "turkey-noodle-bowl",
    name: "Turkey Noodle Bowl",
    category: "dinner",
    servings: 1,
    time: "15 min",
    ingredients: [
      { item: "Ground turkey (93/7)", qty: 6, unit: "oz", note: "raw weight" },
      { item: "Protein noodles", qty: 2, unit: "oz", note: "dry" },
      { item: "Cottage cheese", qty: 1, unit: "cup" },
      { item: "Broccoli, fresh", qty: 1.5, unit: "cup" },
      { item: "Salt, pepper, garlic powder", qty: 0, unit: "", note: "to taste" },
    ],
    steps: [
      "Start the noodle water.",
      "Brown the turkey on medium-high 8 to 10 minutes. Season.",
      "Boil noodles per the box. Add broccoli for the last 3 minutes. Drain.",
      "Bowl: noodles and broccoli, turkey, cottage cheese on top. It melts into a sauce.",
    ],
    macros: { protein: 75, carbs: 54, fat: 26, fiber: 9, calories: 710 },
    cost: 3.90
  },
  {
    id: "liver-skillet",
    name: "Turkey and Liver Potato Skillet",
    category: "dinner",
    servings: 1,
    time: "20 min",
    ingredients: [
      { item: "Ground turkey (93/7)", qty: 6, unit: "oz", note: "raw weight" },
      { item: "Beef liver", qty: 1, unit: "oz", note: "finely chopped or grated frozen" },
      { item: "Potatoes", qty: 1, unit: "each", note: "medium, diced small" },
      { item: "Broccoli, fresh", qty: 2, unit: "cup" },
      { item: "Olive oil", qty: 2, unit: "tsp" },
      { item: "Homemade ranch", qty: 2, unit: "tbsp" },
      { item: "Salt, pepper, garlic powder", qty: 0, unit: "", note: "to taste" },
    ],
    steps: [
      "Microwave the diced potato 3 minutes to get it started.",
      "Heat oil in a pan on medium-high. Add the potato and cook 4 minutes until it browns.",
      "Push the potato aside. Add turkey and liver. Cook 8 minutes, breaking it up.",
      "Add broccoli and 2 tbsp water. Cover 3 minutes.",
      "Season hard with garlic powder, salt, and pepper. Ranch on top.",
    ],
    macros: { protein: 49, carbs: 53, fat: 25, fiber: 9, calories: 630 },
    cost: 3.36,
    notes: "Rare beef night: swap the turkey for 85/15 ground beef (about +100 calories, +10 g fat)."
  },
  {
    id: "carrots-pb-sourdough",
    name: "Carrots, PB, Sourdough, and Milk",
    category: "small",
    servings: 1,
    time: "3 min",
    ingredients: [
      { item: "Carrots", qty: 3, unit: "each" },
      { item: "Peanut butter", qty: 2, unit: "tbsp" },
      { item: "Sourdough bread", qty: 1, unit: "slice" },
      { item: "Whole milk", qty: 1.5, unit: "cup" },
    ],
    steps: [
      "Peel and cut the carrots into sticks.",
      "Dip in peanut butter. Spread what is left on the sourdough.",
      "Milk on the side.",
    ],
    macros: { protein: 25, carbs: 67, fat: 29, fiber: 8, calories: 610 },
    cost: 1.03
  },
  {
    id: "cottage-berry-bowl",
    name: "Cottage Cheese Berry Bowl",
    category: "small",
    servings: 1,
    time: "3 min",
    ingredients: [
      { item: "Cottage cheese", qty: 1, unit: "cup" },
      { item: "Frozen berries", qty: 1, unit: "cup" },
      { item: "Pumpkin seeds", qty: 2, unit: "tbsp" },
    ],
    steps: [
      "Microwave the berries 45 seconds.",
      "Pour over the cottage cheese.",
      "Pumpkin seeds on top.",
    ],
    macros: { protein: 31, carbs: 29, fat: 18, fiber: 5, calories: 380 },
    cost: 1.95
  },
  {
    id: "eggs-banana-almonds",
    name: "Boiled Eggs, Banana, and Almonds",
    category: "small",
    servings: 1,
    time: "2 min (eggs boiled ahead)",
    ingredients: [
      { item: "Eggs", qty: 3, unit: "each", note: "hard-boiled" },
      { item: "Bananas", qty: 1, unit: "each" },
      { item: "Almonds", qty: 1, unit: "oz", note: "about 23" },
    ],
    steps: [
      "Boil a dozen eggs ahead: cover with cold water, bring to a boil, lid on, heat off, 11 minutes, then ice water.",
      "Peel 3 eggs. Salt them.",
      "Eat with the banana and almonds.",
    ],
    macros: { protein: 25, carbs: 35, fat: 29, fiber: 7, calories: 480 },
    cost: 1.22
  },
  {
    id: "bean-quesadilla",
    name: "Bean and Cheese Quesadilla",
    category: "small",
    servings: 1,
    time: "6 min",
    ingredients: [
      { item: "High-fiber tortillas", qty: 1, unit: "each" },
      { item: "Black beans, canned", qty: 0.5, unit: "cup", note: "drained, lightly mashed" },
      { item: "Shredded cheese", qty: 0.25, unit: "cup" },
      { item: "Salsa", qty: 2, unit: "tbsp" },
      { item: "Homemade ranch", qty: 1, unit: "tbsp" },
    ],
    steps: [
      "Mash the beans a little. Spread on half the tortilla. Add cheese. Fold.",
      "Dry pan on medium, 2 to 3 minutes a side.",
      "Dip in salsa and ranch.",
    ],
    macros: { protein: 20, carbs: 43, fat: 13, fiber: 22, calories: 315 },
    cost: 1.11,
    notes: "The fiber fixer. Add this on any day the fiber bar is short."
  },
  {
    id: "fixed-ranch",
    name: "Fixed Ranch (no mayo, not sour)",
    category: "prep",
    servings: 14,
    servingNote: "2 tbsp",
    time: "5 min + 30 min chill",
    ingredients: [
      { item: "Cottage cheese", qty: 1, unit: "cup" },
      { item: "Plain Greek yogurt", qty: 0.5, unit: "cup" },
      { item: "Whole milk", qty: 0.25, unit: "cup", note: "add a splash more to thin" },
      { item: "Ranch seasoning packet", qty: 1, unit: "packet", note: "Great Value, 1 oz" },
      { item: "Honey", qty: 1, unit: "tsp" },
    ],
    steps: [
      "Put cottage cheese, Greek yogurt, milk, ranch packet, and honey in a blender.",
      "Blend 30 to 45 seconds until completely smooth. Scrape the sides once.",
      "Taste. Still tangy: add 1/2 tsp more honey. Too thick: add 1 tbsp milk.",
      "Pour into a jar and chill at least 30 minutes. The dried herbs need that time and the flavor mellows.",
      "Keeps about 7 days in the fridge. Shake before using.",
    ],
    macros: { protein: 3, carbs: 3, fat: 1, fiber: 0, calories: 30 },
    cost: 0.16,
    notes: "Why the last batch was sour: Greek yogurt was the whole base, and with no mayo there was no fat to round off the tang. This version swaps most of the yogurt for blended cottage cheese (much milder), uses whole milk, and adds a little honey to cancel the sour aftertaste. No blender: use 1 cup yogurt, 1/2 cup milk, 2 tbsp olive oil, 2 tsp honey, and whisk hard."
  },
  {
    id: "batch-chicken-rice",
    name: "Batch Chicken and Rice",
    category: "prep",
    servings: 6,
    servingNote: "about 170 g cooked chicken + 3/4 cup cooked rice",
    time: "35 min",
    ingredients: [
      { item: "Chicken breast", qty: 48, unit: "oz", note: "3 lb raw" },
      { item: "White basmati rice", qty: 1.5, unit: "cup", note: "dry" },
      { item: "Olive oil", qty: 3, unit: "tsp" },
      { item: "Salt, pepper, garlic powder", qty: 0, unit: "", note: "to taste" },
    ],
    steps: [
      "Heat oven to 425 F. Line a sheet pan with foil.",
      "Rinse rice. Put rice and 2 1/4 cups water in a pot with a pinch of salt. Bring to a boil, cover, turn to low, cook 15 minutes. Leave the lid on 5 more minutes off the heat.",
      "Rub chicken with oil, salt, pepper, and garlic powder. Lay flat on the pan.",
      "Bake 20 to 25 minutes, until the thickest piece hits 165 F or the juices run clear.",
      "Rest chicken 5 minutes, then slice or cube.",
      "Split chicken and rice into 6 containers. Fridge 4 days. Freeze the rest.",
    ],
    macros: { protein: 53, carbs: 36, fat: 7, fiber: 1, calories: 420 },
    cost: 1.39,
    notes: "This is the base for the Favorite Bowl, the chicken plate, and the quesadillas. Thighs work too and are often cheaper."
  },
  {
    id: "batch-turkey-liver",
    name: "Batch Taco Turkey with Hidden Liver",
    category: "prep",
    servings: 6,
    servingNote: "about 1 cup",
    time: "20 min",
    ingredients: [
      { item: "Ground turkey (93/7)", qty: 32, unit: "oz", note: "2 lb raw" },
      { item: "Beef liver", qty: 4, unit: "oz", note: "finely chopped or grated frozen" },
      { item: "Black beans, canned", qty: 1.75, unit: "cup", note: "1 can, drained and rinsed" },
      { item: "Olive oil", qty: 2, unit: "tsp" },
      { item: "Taco seasoning", qty: 0, unit: "", note: "2 to 3 tbsp" },
      { item: "Salt, pepper, garlic powder", qty: 0, unit: "", note: "to taste" },
    ],
    steps: [
      "Chop the liver as fine as you can. Easiest way: grate it frozen on a box grater.",
      "Heat oil in a large pan on medium-high. Add turkey and liver together.",
      "Cook 8 to 10 minutes, breaking it up, until no pink is left.",
      "Stir in taco seasoning and 1/2 cup water. Add the beans.",
      "Simmer 3 to 4 minutes until thick.",
      "Split into 6 containers. Fridge 4 days. Freezes well.",
    ],
    macros: { protein: 36, carbs: 12, fat: 14, fiber: 4, calories: 330 },
    cost: 1.93,
    notes: "Liver is about 11 percent of the meat here, low enough that the taco seasoning covers it. Keep liver to this amount, a few servings a week is plenty. Rare beef night: swap the turkey for 85/15 ground beef."
  },
];

/* =====================================================================
   GROCERY table: one line per ingredient.
     section  where it sits in the store (controls grouping)
     unit     must match the unit used in the meals above
     price    estimated dollars per ONE unit (Aldi / Sam's Club typical)
   price 0 + staple true = seasoning you just need to have on hand.
   ===================================================================== */
const SECTIONS = ["Meat", "Dairy and eggs", "Produce", "Frozen", "Bakery", "Pantry", "Make ahead", "Other"];

const GROCERY = {
  "Chicken breast":           { section: "Meat",           unit: "oz",     price: 0.16 },
  "Ground turkey (93/7)":     { section: "Meat",           unit: "oz",     price: 0.30 },
  "Beef liver":               { section: "Meat",           unit: "oz",     price: 0.25 },
  "Eggs":                     { section: "Dairy and eggs", unit: "each",   price: 0.23, tip: "12 per dozen" },
  "Cottage cheese":           { section: "Dairy and eggs", unit: "cup",    price: 1.00 },
  "Plain Greek yogurt":       { section: "Dairy and eggs", unit: "cup",    price: 1.00 },
  "Whole milk":               { section: "Dairy and eggs", unit: "cup",    price: 0.20 },
  "Shredded cheese":          { section: "Dairy and eggs", unit: "cup",    price: 1.00 },
  "Sauerkraut":               { section: "Dairy and eggs", unit: "cup",    price: 0.70 },
  "Broccoli, fresh":          { section: "Produce",        unit: "cup",    price: 0.40, tip: "1 crown is about 3 cups chopped" },
  "Potatoes":                 { section: "Produce",        unit: "each",   price: 0.25 },
  "Carrots":                  { section: "Produce",        unit: "each",   price: 0.12 },
  "Bananas":                  { section: "Produce",        unit: "each",   price: 0.20 },
  "Frozen berries":           { section: "Frozen",         unit: "cup",    price: 0.75 },
  "Sourdough bread":          { section: "Bakery",         unit: "slice",  price: 0.25 },
  "High-fiber tortillas":     { section: "Bakery",         unit: "each",   price: 0.45 },
  "Protein noodles":          { section: "Pantry",         unit: "oz",     price: 0.25, tip: "dry weight, check your box label" },
  "White basmati rice":       { section: "Pantry",         unit: "cup",    price: 0.35, tip: "dry measure, you have the 20 lb bag" },
  "Rolled oats":              { section: "Pantry",         unit: "cup",    price: 0.16, tip: "dry measure, you have the 10 lb bag" },
  "Black beans, canned":      { section: "Pantry",         unit: "cup",    price: 0.50, tip: "1 can is about 1 3/4 cups drained" },
  "Peanut butter":            { section: "Pantry",         unit: "tbsp",   price: 0.06 },
  "Almonds":                  { section: "Pantry",         unit: "oz",     price: 0.33 },
  "Pumpkin seeds":            { section: "Pantry",         unit: "tbsp",   price: 0.10 },
  "Deglet Noor dates":        { section: "Pantry",         unit: "each",   price: 0.07 },
  "Olive oil":                { section: "Pantry",         unit: "tsp",    price: 0.05 },
  "Salsa":                    { section: "Pantry",         unit: "tbsp",   price: 0.04 },
  "Ranch seasoning packet":   { section: "Pantry",         unit: "packet", price: 0.60 },
  "Honey":                    { section: "Pantry",         unit: "tsp",    price: 0.05 },
  "Homemade ranch":           { section: "Make ahead",     unit: "tbsp",   price: 0.08, tip: "make the Fixed Ranch recipe" },
  "Salt, pepper, garlic powder": { section: "Pantry",         unit: "",       price: 0, staple: true },
  "Cinnamon":                 { section: "Pantry",         unit: "",       price: 0, staple: true },
  "Taco seasoning":           { section: "Pantry",         unit: "",       price: 0, staple: true },
};
