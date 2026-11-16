/* =====================================================================
   meals.js  -  ALL meal data lives here. Edit this file to change the app.
   The screen code (app.js) never needs to be touched.

   TO ADD A MEAL: copy one meal block below, paste it, and change:
     id          unique, lowercase, no spaces (example: "egg-tacos")
     name        what shows on the card
     emoji       one emoji shown next to the name
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

// Daily targets. You can also change these in the app (gear button, top right).
const TARGETS = {
  proteinMin: 190,    proteinMax: 200,    // grams
  fiber: 40,                              // grams, at least
  carbsMin: 180,      carbsMax: 300,      // grams
  caloriesMin: 3100,  caloriesMax: 3300   // lean bulk at 6'2", 175 lb
};

// Meals starred by default. Tap the star on any meal in the app to change.
const DEFAULT_FAVORITES = ["eggs-sourdough", "cottage-toast", "chicken-eggs-milk", "chicken-rice-eggs"];

const CATEGORIES = [
  { id: "breakfast", name: "Breakfast", emoji: "🍳",  hint: "Before noon is fine" },
  { id: "lunch",     name: "Lunch", emoji: "🥗",      hint: "Big protein bowls" },
  { id: "dinner",    name: "Dinner", emoji: "🍗",     hint: "Meat, veg, potato" },
  { id: "small",     name: "Small meal", emoji: "🥕", hint: "The 4th, lighter meal" },
  { id: "prep",      name: "Meal prep", emoji: "🍱",  hint: "Batches and ranch" }
];

const MEALS = [
  {
    id: "egg-scramble",
    name: "Egg and Cottage Cheese Scramble",
    emoji: "🍳",
    category: "breakfast",
    servings: 1,
    time: "8 min",
    ingredients: [
      { item: "Eggs", qty: 4, unit: "each" },
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
    macros: { protein: 41, carbs: 32, fat: 30, fiber: 2, calories: 555 },
    cost: 1.90,
    notes: "For live cultures, buy refrigerated raw sauerkraut. Shelf-stable jars are pasteurized."
  },
  {
    id: "pb-oatmeal",
    name: "PB Microwave Oatmeal",
    emoji: "🥣",
    category: "breakfast",
    servings: 1,
    time: "6 min",
    ingredients: [
      { item: "Rolled oats", qty: 1, unit: "cup" },
      { item: "Whole milk", qty: 1.5, unit: "cup", note: "not 2 cups" },
      { item: "Peanut butter", qty: 1, unit: "tbsp" },
      { item: "Cinnamon", qty: 0, unit: "", note: "1/2 tsp" },
      { item: "Sauerkraut", qty: 0.25, unit: "cup", note: "eat first, on the side" },
    ],
    steps: [
      "Use a big bowl, at least 4 cups, so it cannot boil over.",
      "Add oats, milk, and cinnamon. Stir.",
      "Microwave 2 minutes. Stir.",
      "Microwave 1 more minute. Stop early if it climbs to the rim.",
      "Rest 2 minutes. It thickens a lot as it sits.",
      "Top with peanut butter.",
    ],
    macros: { protein: 26, carbs: 77, fat: 26, fiber: 10, calories: 625 },
    cost: 0.70,
    notes: "Liquid is cut from 2 cups to 1 1/2 so it sets thick instead of soupy. Still too loose in your microwave: drop to 1 1/4 cups. Fewer carbs: use 1/2 cup oats and 3/4 cup milk. More protein: stir in 1/2 cup Greek yogurt after cooking (+12 g)."
  },
  {
    id: "yogurt-bowl",
    name: "Greek Yogurt Bowl",
    emoji: "🫐",
    category: "breakfast",
    servings: 1,
    time: "3 min",
    ingredients: [
      { item: "Plain Greek yogurt", qty: 1, unit: "cup", note: "1 serving" },
      { item: "Blueberries", qty: 1, unit: "cup" },
      { item: "Granola", qty: 0.25, unit: "cup" },
      { item: "Pumpkin seeds", qty: 3, unit: "tbsp", note: "1 serving, about 1 oz" },
      { item: "Honey", qty: 3, unit: "tsp", note: "1 tbsp" },
      { item: "Sauerkraut", qty: 0.25, unit: "cup", note: "eat first, on the side" },
    ],
    steps: [
      "Yogurt in the bowl.",
      "Add the blueberries. Frozen: microwave 45 seconds first.",
      "Top with granola, pumpkin seeds, and honey.",
    ],
    macros: { protein: 34, carbs: 66, fat: 17, fiber: 8, calories: 535 },
    cost: 2.87
  },
  {
    id: "chicken-eggs-milk",
    name: "Chicken, Eggs, and Milk",
    emoji: "🥚",
    category: "breakfast",
    servings: 1,
    time: "8 min",
    ingredients: [
      { item: "Eggs", qty: 4, unit: "each" },
      { item: "Chicken breast", qty: 4, unit: "oz", note: "raw weight, about 85 g cooked, batch chicken works" },
      { item: "Whole milk", qty: 1.5, unit: "cup", note: "a big glass" },
      { item: "Olive oil", qty: 1, unit: "tsp" },
      { item: "Salt, pepper, garlic powder", qty: 0, unit: "", note: "to taste" },
    ],
    steps: [
      "Heat oil in a pan on medium.",
      "Add the chopped chicken. Batch chicken: warm it 1 minute. Raw: cook 6 to 7 minutes until no pink is left.",
      "Push the chicken aside. Scramble the 4 eggs next to it, 2 to 3 minutes.",
      "Season everything. Big glass of milk on the side.",
    ],
    macros: { protein: 61, carbs: 20, fat: 39, fiber: 0, calories: 665 },
    cost: 1.91
  },
  {
    id: "eggs-sourdough",
    name: "Eggs on Sourdough",
    emoji: "🍞",
    category: "breakfast",
    servings: 1,
    time: "6 min",
    ingredients: [
      { item: "Eggs", qty: 4, unit: "each" },
      { item: "Sourdough bread", qty: 2, unit: "slice" },
      { item: "Olive oil", qty: 1, unit: "tsp" },
      { item: "Salt, pepper, garlic powder", qty: 0, unit: "", note: "to taste" },
    ],
    steps: [
      "Heat oil in a pan on medium.",
      "Fry or scramble the 4 eggs, 2 to 3 minutes.",
      "Toast the sourdough.",
      "Eggs on the toast. Season.",
    ],
    macros: { protein: 32, carbs: 50, fat: 26, fiber: 2, calories: 560 },
    cost: 1.47,
    notes: "Almost no fiber. Add carrots or berries on the side on days the fiber ring is short."
  },
  {
    id: "favorite-bowl",
    name: "The Favorite Bowl",
    emoji: "🍚",
    category: "lunch",
    servings: 1,
    time: "12 min",
    ingredients: [
      { item: "Chicken breast", qty: 6, unit: "oz", note: "raw weight, about 130 g cooked" },
      { item: "White basmati rice", qty: 0.25, unit: "cup", note: "dry, about 3/4 cup cooked" },
      { item: "Protein noodles", qty: 2, unit: "oz", note: "dry" },
      { item: "Cottage cheese", qty: 0.5, unit: "cup", note: "1 serving" },
      { item: "Broccoli, fresh", qty: 1, unit: "cup" },
      { item: "Ranch dressing", qty: 2, unit: "tbsp" },
      { item: "Salt, pepper, garlic powder", qty: 0, unit: "", note: "to taste" },
    ],
    steps: [
      "Boil the noodles per the box. Drop the broccoli into the same pot for the last 3 minutes. Drain.",
      "Reheat batch chicken and rice in the microwave 1:30. No batch: cook the rice and pan-cook the chicken 6 to 7 minutes a side.",
      "Bowl: rice and noodles on the bottom, then chicken and broccoli.",
      "Cottage cheese on top. Season. Finish with ranch.",
    ],
    macros: { protein: 71, carbs: 84, fat: 25, fiber: 8, calories: 800 },
    cost: 2.59,
    notes: "Chicken, rice, protein noodles, and cottage cheese in one bowl. Lower carb: skip the rice, keep the noodles."
  },
  {
    id: "chicken-quesadilla",
    name: "Chicken and Bean Quesadillas",
    emoji: "🧀",
    category: "lunch",
    servings: 1,
    time: "10 min",
    ingredients: [
      { item: "High-fiber tortillas", qty: 2, unit: "each" },
      { item: "Chicken breast", qty: 4, unit: "oz", note: "raw weight, about 85 g cooked, chopped" },
      { item: "Black beans, canned", qty: 0.5, unit: "cup", note: "drained, lightly mashed" },
      { item: "Shredded cheese", qty: 0.5, unit: "cup" },
      { item: "Ranch dressing", qty: 2, unit: "tbsp", note: "for dipping" },
    ],
    steps: [
      "Mash the beans a little with a fork so they stick.",
      "Spread beans on half of each tortilla. Add chicken and cheese. Fold.",
      "Dry pan on medium. Cook 2 to 3 minutes a side until crisp and the cheese melts.",
      "Cut in half. Dip in ranch.",
    ],
    macros: { protein: 56, carbs: 62, fat: 41, fiber: 37, calories: 720 },
    cost: 2.43,
    notes: "One of the best fiber meals in the app: the tortillas and beans carry it."
  },
  {
    id: "turkey-taco-bowl",
    name: "Turkey Taco Bowl",
    emoji: "🌮",
    category: "lunch",
    servings: 1,
    time: "15 min",
    ingredients: [
      { item: "Ground turkey (93/7)", qty: 6, unit: "oz", note: "raw weight" },
      { item: "Black beans, canned", qty: 0.5, unit: "cup", note: "drained" },
      { item: "White basmati rice", qty: 0.25, unit: "cup", note: "dry, about 3/4 cup cooked" },
      { item: "Cottage cheese", qty: 0.5, unit: "cup", note: "in place of sour cream" },
      { item: "Ranch dressing", qty: 2, unit: "tbsp" },
      { item: "Taco seasoning", qty: 0, unit: "", note: "2 tsp" },
      { item: "Salt, pepper, garlic powder", qty: 0, unit: "", note: "to taste" },
    ],
    steps: [
      "Brown the turkey on medium-high 8 to 10 minutes, breaking it up. Or reheat a serving of the batch taco turkey.",
      "Stir in taco seasoning, 2 tbsp water, and the beans. Cook 2 minutes.",
      "Reheat or cook the rice.",
      "Bowl: rice, then turkey and beans. Top with cottage cheese and ranch.",
    ],
    macros: { protein: 54, carbs: 63, fat: 33, fiber: 8, calories: 765 },
    cost: 2.78,
    notes: "Lower carb: skip the rice and double the beans."
  },
  {
    id: "chicken-rice-eggs",
    name: "Chicken, Rice, and Eggs",
    emoji: "🥘",
    category: "lunch",
    servings: 1,
    time: "10 min",
    ingredients: [
      { item: "Chicken breast", qty: 6, unit: "oz", note: "raw weight, about 130 g cooked" },
      { item: "White basmati rice", qty: 0.33, unit: "cup", note: "dry, about 1 cup cooked" },
      { item: "Eggs", qty: 2, unit: "each" },
      { item: "Olive oil", qty: 1, unit: "tsp" },
      { item: "Ranch dressing", qty: 2, unit: "tbsp" },
      { item: "Salt, pepper, garlic powder", qty: 0, unit: "", note: "to taste" },
    ],
    steps: [
      "Reheat batch chicken and rice 1:30 in the microwave. No batch: cook the rice and pan-cook the chicken 6 to 7 minutes a side.",
      "Fry the 2 eggs in oil on medium, 2 to 3 minutes.",
      "Bowl: rice, chicken, eggs on top.",
      "Season. Ranch over it.",
    ],
    macros: { protein: 54, carbs: 51, fat: 32, fiber: 1, calories: 700 },
    cost: 1.73
  },
  {
    id: "chicken-ranch-wraps",
    name: "Chicken Ranch Wraps",
    emoji: "🌯",
    category: "lunch",
    servings: 1,
    time: "5 min",
    ingredients: [
      { item: "High-fiber tortillas", qty: 2, unit: "each" },
      { item: "Chicken breast", qty: 6, unit: "oz", note: "raw weight, batch chicken sliced" },
      { item: "Shredded cheese", qty: 0.25, unit: "cup" },
      { item: "Carrots", qty: 1, unit: "each", note: "shredded or thin sticks" },
      { item: "Ranch dressing", qty: 3, unit: "tbsp" },
    ],
    steps: [
      "Warm the tortillas 15 seconds in the microwave so they fold without cracking.",
      "Spread ranch down the middle.",
      "Add sliced chicken, cheese, and carrot.",
      "Roll tight. Eat cold, or toast seam-side down in a dry pan 1 minute a side.",
    ],
    macros: { protein: 56, carbs: 48, fat: 40, fiber: 32, calories: 650 },
    cost: 2.44,
    notes: "Fastest lunch in the app if the batch chicken is made."
  },
  {
    id: "chicken-potato-broccoli",
    name: "Chicken, Potato, and Broccoli Plate",
    emoji: "🥦",
    category: "dinner",
    servings: 1,
    time: "15 min",
    ingredients: [
      { item: "Chicken breast", qty: 8, unit: "oz", note: "raw weight, about 170 g cooked" },
      { item: "Potatoes", qty: 1, unit: "each", note: "medium" },
      { item: "Broccoli, fresh", qty: 2, unit: "cup" },
      { item: "Olive oil", qty: 1, unit: "tsp" },
      { item: "Ranch dressing", qty: 3, unit: "tbsp" },
      { item: "Salt, pepper, garlic powder", qty: 0, unit: "", note: "to taste" },
    ],
    steps: [
      "Poke the potato with a fork. Microwave 5 to 7 minutes, flipping halfway.",
      "Broccoli in a bowl with 2 tbsp water. Cover and microwave 3 to 4 minutes.",
      "Reheat batch chicken 1:30. No batch: pan-cook 6 to 7 minutes a side to 165 F.",
      "Split the potato. Drizzle oil on the broccoli. Season everything.",
      "Ranch over the potato and chicken.",
    ],
    macros: { protein: 60, carbs: 52, fat: 31, fiber: 9, calories: 700 },
    cost: 2.59
  },
  {
    id: "turkey-noodle-bowl",
    name: "Turkey Noodle Bowl",
    emoji: "🍜",
    category: "dinner",
    servings: 1,
    time: "15 min",
    ingredients: [
      { item: "Ground turkey (93/7)", qty: 6, unit: "oz", note: "raw weight" },
      { item: "Protein noodles", qty: 2, unit: "oz", note: "dry" },
      { item: "Cottage cheese", qty: 0.5, unit: "cup", note: "1 serving" },
      { item: "Broccoli, fresh", qty: 1.5, unit: "cup" },
      { item: "Salt, pepper, garlic powder", qty: 0, unit: "", note: "to taste" },
    ],
    steps: [
      "Start the noodle water.",
      "Brown the turkey on medium-high 8 to 10 minutes. Season.",
      "Boil noodles per the box. Add broccoli for the last 3 minutes. Drain.",
      "Bowl: noodles and broccoli, turkey, cottage cheese on top. It melts into a sauce.",
    ],
    macros: { protein: 63, carbs: 49, fat: 21, fiber: 9, calories: 600 },
    cost: 3.40
  },
  {
    id: "liver-skillet",
    name: "Turkey and Liver Potato Skillet",
    emoji: "🥔",
    category: "dinner",
    servings: 1,
    time: "20 min",
    ingredients: [
      { item: "Ground turkey (93/7)", qty: 6, unit: "oz", note: "raw weight" },
      { item: "Beef liver", qty: 1, unit: "oz", note: "finely chopped or grated frozen" },
      { item: "Potatoes", qty: 1, unit: "each", note: "medium, diced small" },
      { item: "Broccoli, fresh", qty: 2, unit: "cup" },
      { item: "Olive oil", qty: 2, unit: "tsp" },
      { item: "Ranch dressing", qty: 2, unit: "tbsp" },
      { item: "Salt, pepper, garlic powder", qty: 0, unit: "", note: "to taste" },
    ],
    steps: [
      "Microwave the diced potato 3 minutes to get it started.",
      "Heat oil in a pan on medium-high. Add the potato and cook 4 minutes until it browns.",
      "Push the potato aside. Add turkey and liver. Cook 8 minutes, breaking it up.",
      "Add broccoli and 2 tbsp water. Cover 3 minutes.",
      "Season hard with garlic powder, salt, and pepper. Ranch on top.",
    ],
    macros: { protein: 47, carbs: 52, fat: 38, fiber: 9, calories: 730 },
    cost: 3.34,
    notes: "Rare beef night: swap the turkey for 85/15 ground beef (about +100 calories, +10 g fat)."
  },
  {
    id: "beef-cottage",
    name: "Ground Beef and Cottage Cheese",
    emoji: "🥩",
    category: "dinner",
    servings: 1,
    time: "15 min",
    ingredients: [
      { item: "Ground beef (85/15)", qty: 6, unit: "oz", note: "raw weight" },
      { item: "Cottage cheese", qty: 0.5, unit: "cup", note: "1 serving" },
      { item: "Broccoli, fresh", qty: 2, unit: "cup", note: "or swap for 1 potato" },
      { item: "Salt, pepper, garlic powder", qty: 0, unit: "", note: "to taste" },
    ],
    steps: [
      "Brown the beef in a pan on medium-high, 8 to 10 minutes, breaking it up.",
      "Drain the fat. Season with salt, pepper, and garlic powder.",
      "Broccoli in a covered bowl with 2 tbsp water, microwave 3 to 4 minutes.",
      "Plate the beef with cottage cheese on top or on the side.",
    ],
    macros: { protein: 49, carbs: 17, fat: 31, fiber: 5, calories: 535 },
    cost: 3.52,
    notes: "Potato instead of broccoli: microwave 5 to 7 minutes. Adds about 105 calories and 25 g carbs, about the same fiber. Mix in 1 oz grated liver if you want it hidden here."
  },
  {
    id: "carrots-pb-sourdough",
    name: "Carrots, PB, Sourdough, and Milk",
    emoji: "🥕",
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
    emoji: "🍓",
    category: "small",
    servings: 1,
    time: "3 min",
    ingredients: [
      { item: "Cottage cheese", qty: 0.5, unit: "cup", note: "1 serving" },
      { item: "Frozen berries", qty: 1, unit: "cup" },
      { item: "Pumpkin seeds", qty: 2, unit: "tbsp" },
    ],
    steps: [
      "Microwave the berries 45 seconds.",
      "Pour over the cottage cheese.",
      "Pumpkin seeds on top.",
    ],
    macros: { protein: 18, carbs: 24, fat: 13, fiber: 5, calories: 270 },
    cost: 1.45
  },
  {
    id: "eggs-banana-almonds",
    name: "Boiled Eggs, Banana, and Almonds",
    emoji: "🍌",
    category: "small",
    servings: 1,
    time: "2 min (eggs boiled ahead)",
    ingredients: [
      { item: "Eggs", qty: 4, unit: "each", note: "hard-boiled" },
      { item: "Bananas", qty: 1, unit: "each" },
      { item: "Almonds", qty: 1, unit: "oz", note: "about 23" },
    ],
    steps: [
      "Boil a dozen eggs ahead: cover with cold water, bring to a boil, lid on, heat off, 11 minutes, then ice water.",
      "Peel 4 eggs. Salt them.",
      "Eat with the banana and almonds.",
    ],
    macros: { protein: 31, carbs: 35, fat: 34, fiber: 7, calories: 550 },
    cost: 1.45
  },
  {
    id: "bean-quesadilla",
    name: "Bean and Cheese Quesadilla",
    emoji: "🫘",
    category: "small",
    servings: 1,
    time: "6 min",
    ingredients: [
      { item: "High-fiber tortillas", qty: 1, unit: "each" },
      { item: "Black beans, canned", qty: 0.5, unit: "cup", note: "drained, lightly mashed" },
      { item: "Shredded cheese", qty: 0.25, unit: "cup" },
      { item: "Ranch dressing", qty: 1, unit: "tbsp" },
    ],
    steps: [
      "Mash the beans a little. Spread on half the tortilla. Add cheese. Fold.",
      "Dry pan on medium, 2 to 3 minutes a side.",
      "Dip in ranch.",
    ],
    macros: { protein: 19, carbs: 41, fat: 20, fiber: 22, calories: 355 },
    cost: 1.02,
    notes: "The fiber fixer. Add this on any day the fiber bar is short."
  },
  {
    id: "cottage-toast",
    name: "Cottage Cheese Toast",
    emoji: "🍯",
    category: "small",
    servings: 1,
    time: "3 min",
    ingredients: [
      { item: "Sourdough bread", qty: 2, unit: "slice" },
      { item: "Cottage cheese", qty: 0.5, unit: "cup", note: "1 serving, split across both" },
      { item: "Honey", qty: 3, unit: "tsp", note: "1 tbsp, drizzled" },
    ],
    steps: [
      "Toast the sourdough.",
      "Spread the cottage cheese across both slices.",
      "Drizzle the honey.",
    ],
    macros: { protein: 21, carbs: 70, fat: 6, fiber: 2, calories: 410 },
    cost: 1.15
  },
  {
    id: "chocolate-smoothie",
    name: "Chocolate Smoothie",
    emoji: "🥤",
    category: "small",
    servings: 1,
    time: "3 min",
    ingredients: [
      { item: "Whole milk", qty: 1.33, unit: "cup", note: "320 ml" },
      { item: "Frozen berries", qty: 1, unit: "cup", note: "or 1 banana" },
      { item: "Chocolate bone broth protein", qty: 1, unit: "scoop" },
      { item: "Honey", qty: 3, unit: "tsp", note: "1 tbsp" },
    ],
    steps: [
      "Milk in the blender first.",
      "Add fruit, protein, and honey.",
      "Blend 30 to 45 seconds.",
    ],
    macros: { protein: 22, carbs: 50, fat: 12, fiber: 4, calories: 375 },
    cost: 2.67,
    notes: "Optional: 1 tbsp peanut butter adds about 95 calories, 4 g protein, 8 g fat. The scoop is counted at 10 g protein. Most of the protein here comes from the milk."
  },
  {
    id: "batch-chicken-rice",
    name: "Batch Chicken and Rice",
    emoji: "🍗",
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
    emoji: "🦃",
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
  "Olive oil":                { section: "Pantry",         unit: "tsp",    price: 0.05 },
  "Ground beef (85/15)":      { section: "Meat",           unit: "oz",     price: 0.37 },
  "Blueberries":              { section: "Frozen",         unit: "cup",    price: 0.75 },
  "Granola":                  { section: "Pantry",         unit: "cup",    price: 2.00, tip: "Purely Elizabeth or similar" },
  "Chocolate bone broth protein": { section: "Pantry",         unit: "scoop",  price: 1.50, tip: "your tub" },
  "Ranch dressing":           { section: "Pantry",         unit: "tbsp",   price: 0.07, tip: "cheapest bottle, Great Value is fine" },
  "Honey":                    { section: "Pantry",         unit: "tsp",    price: 0.05 },
  "Salt, pepper, garlic powder": { section: "Pantry",         unit: "",       price: 0, staple: true },
  "Cinnamon":                 { section: "Pantry",         unit: "",       price: 0, staple: true },
  "Taco seasoning":           { section: "Pantry",         unit: "",       price: 0, staple: true },
};
