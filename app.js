/* app.js  -  screen code only. Meal data lives in meals.js. */
(function () {
  "use strict";

  var view = document.getElementById("view");
  var titleEl = document.getElementById("title");
  var backBtn = document.getElementById("back");

  // ---------- storage (never crash if storage is blocked) ----------
  function load(key, fallback) {
    try { var v = JSON.parse(localStorage.getItem(key)); return v == null ? fallback : v; } catch (e) { return fallback; }
  }
  function save(key, val) { try { localStorage.setItem(key, JSON.stringify(val)); } catch (e) {} }

  // ---------- dates ----------
  var DAY = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  var MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  function pad(n) { return (n < 10 ? "0" : "") + n; }
  function dateKey(d) { return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()); }
  function parseKey(k) { var p = String(k).split("-"); return new Date(+p[0], +p[1] - 1, +p[2]); }
  function addDays(d, n) { return new Date(d.getFullYear(), d.getMonth(), d.getDate() + n); }
  function todayKey() { return dateKey(new Date()); }
  function validKey(k) { return /^\d{4}-\d{2}-\d{2}$/.test(k || ""); }
  function niceDate(k) { var d = parseKey(k); return DAY[d.getDay()] + " " + MON[d.getMonth()] + " " + d.getDate(); }
  function weekStart(d) { return addDays(d, -((d.getDay() + 6) % 7)); }   // weeks start Monday
  function weekOffsetOf(k) { return Math.round((weekStart(parseKey(k)) - weekStart(new Date())) / (7 * 864e5)); }

  // ---------- the log: one entry per day, { "2026-11-16": { mealId: count } } ----------
  function getLog() {
    var log = load("meals-log-v1", null);
    if (!log) {
      log = {};
      var old = load("meals-today-v1", null);   // carry over the old single-day log
      if (old && old.date && old.items) {
        var p = String(old.date).split("-");
        if (p.length === 3) log[p[0] + "-" + pad(+p[1]) + "-" + pad(+p[2])] = old.items;
      }
      save("meals-log-v1", log);
    }
    return log;
  }
  function getDay(k) { return getLog()[k] || {}; }
  function setDay(k, items) {
    var log = getLog();
    if (Object.keys(items).length) log[k] = items; else delete log[k];
    save("meals-log-v1", log);
  }
  function getQuickAll() { return load("meals-quick-v1", {}) || {}; }
  function getQuick(k) { var q = getQuickAll()[k]; return Array.isArray(q) ? q : []; }
  function setQuick(k, list) {
    var all = getQuickAll();
    if (list.length) all[k] = list; else delete all[k];
    save("meals-quick-v1", all);
  }
  function getRecent() { var r = load("meals-quick-recent-v1", []); return Array.isArray(r) ? r : []; }
  function rememberRecent(e) {
    var sig = function (x) { return [x.name, x.protein, x.carbs, x.fat, x.fiber, x.calories].join("|"); };
    var r = getRecent().filter(function (x) { return sig(x) !== sig(e); });
    r.unshift({ name: e.name, protein: e.protein, carbs: e.carbs, fat: e.fat, fiber: e.fiber, calories: e.calories });
    save("meals-quick-recent-v1", r.slice(0, 8));
  }
  function getWorkAll() { return load("meals-workouts-v1", {}) || {}; }
  function getWorkouts(k) { var w = getWorkAll()[k]; return Array.isArray(w) ? w : []; }
  function setWorkouts(k, list) {
    var all = getWorkAll();
    if (list.length) all[k] = list; else delete all[k];
    save("meals-workouts-v1", all);
  }
  function getPlan() { return load("meals-plan-v1", {}); }
  function setPlan(p) { save("meals-plan-v1", p); }
  function getGot() { return load("meals-got-v1", {}); }
  function setGot(g) { save("meals-got-v1", g); }

  // ---------- targets (meals.js defaults, overridden in Settings) ----------
  var TARGET_KEYS = ["proteinMin", "proteinMax", "fiber", "carbsMin", "carbsMax", "caloriesMin", "caloriesMax"];
  function getTargets() {
    var o = load("meals-targets-v1", {}) || {}, t = {};
    TARGET_KEYS.forEach(function (k) {
      var v = Number(o[k]);
      t[k] = (o[k] != null && o[k] !== "" && isFinite(v) && v > 0) ? v : TARGETS[k];
    });
    return t;
  }
  // ---------- workouts ----------
  // MET values (Compendium of Physical Activities, rounded). Net burn = (MET - 1) x kg x hours.
  var WORK = {
    lift:  { name: "Lift",       emoji: "&#127947;&#65039;", met: { easy: 3.5, moderate: 5,   hard: 6 } },
    run:   { name: "Run",        emoji: "&#127939;",         met: { easy: 8,   moderate: 9.8, hard: 11.5 } },
    hoops: { name: "Basketball", emoji: "&#127936;",         met: { easy: 6,   moderate: 6.5, hard: 8 } },
    other: { name: "Cardio",     emoji: "&#128692;",         met: { easy: 5,   moderate: 7,   hard: 9 } }
  };
  var INTENSITY = ["easy", "moderate", "hard"];
  function bodyKg() { var lb = Number(load("meals-weight-v1", 0)); return (isFinite(lb) && lb > 60 ? lb : 175) * 0.4536; }
  function workBurn(w) {
    if (w.watchCal > 0) return Math.round(w.watchCal);
    var t = WORK[w.type] || WORK.other, met = t.met[w.intensity] || t.met.moderate;
    return Math.round((met - 1) * bodyKg() * (w.minutes / 60));
  }
  // Half of the burn is added to the day's calorie target. Your base target already assumes an active
  // person, and watch and formula burns both run high. Roughly half of that extra goes to carbs.
  function workBonus(k) {
    var burn = 0;
    getWorkouts(k).forEach(function (w) { burn += workBurn(w); });
    var cal = Math.round(burn * 0.5 / 10) * 10;
    return { burn: burn, cal: cal, carbs: Math.round(cal * 0.5 / 4) };
  }
  function dayTargets(k) {
    var T = getTargets(), b = workBonus(k), o = {};
    Object.keys(T).forEach(function (x) { o[x] = T[x]; });
    o.caloriesMin += b.cal; o.caloriesMax += b.cal; o.carbsMin += b.carbs; o.carbsMax += b.carbs;
    o.bonus = b;
    return o;
  }

  function metrics(T) {
    return [
      { key: "protein",  label: "Protein",  unit: "g",   min: T.proteinMin,  max: T.proteinMax,  c: ["#06b6d4", "#2563eb"] },
      { key: "fiber",    label: "Fiber",    unit: "g",   min: T.fiber,       max: null,          c: ["#2dd4bf", "#0d9488"] },
      { key: "carbs",    label: "Carbs",    unit: "g",   min: T.carbsMin,    max: T.carbsMax,    c: ["#a78bfa", "#6366f1"] },
      { key: "calories", label: "Calories", unit: "cal", min: T.caloriesMin, max: T.caloriesMax, c: ["#38bdf8", "#0284c7"] }
    ];
  }
  function status(m, v) { if (v < m.min) return "under"; if (m.max && v > m.max) return "over"; return "hit"; }
  function fmtNum(n) { return Math.round(n).toLocaleString("en-US"); }
  function withUnit(m, n) { return fmtNum(n) + (m.unit === "g" ? " g" : " cal"); }
  function goalText(m) { return m.max ? fmtNum(m.min) + " to " + withUnit(m, m.max) : withUnit(m, m.min); }
  function noteText(m, v) {
    var s = status(m, v);
    if (s === "under") return withUnit(m, m.min - v) + " to go";
    if (s === "over") return withUnit(m, v - m.max) + " over";
    return "&#10003; " + (m.max ? "In range" : "Target hit");
  }

  // ---------- helpers ----------
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function meal(id) { for (var i = 0; i < MEALS.length; i++) if (MEALS[i].id === id) return MEALS[i]; return null; }
  function cat(id) { for (var i = 0; i < CATEGORIES.length; i++) if (CATEGORIES[i].id === id) return CATEGORIES[i]; return null; }
  function money(n) { return "$" + n.toFixed(2); }

  var FRACS = [[0.25, "1/4"], [0.33, "1/3"], [0.5, "1/2"], [0.67, "2/3"], [0.75, "3/4"]];
  function fmtQty(q) {
    var whole = Math.floor(q + 1e-9), rest = q - whole;
    if (rest < 0.02) return String(whole);
    for (var i = 0; i < FRACS.length; i++) {
      if (Math.abs(rest - FRACS[i][0]) < 0.03) return (whole ? whole + " " : "") + FRACS[i][1];
    }
    return String(Math.round(q * 10) / 10);
  }
  var PLURAL = { cup: "cups", slice: "slices", packet: "packets", can: "cans", scoop: "scoops" };
  function fmtAmt(q, unit) {
    if (!q) return "";
    var u = unit === "each" ? "" : (q > 1 && PLURAL[unit] ? PLURAL[unit] : unit);
    return fmtQty(q) + (u ? " " + u : "");
  }

  function totals(items) {
    var t = { protein: 0, carbs: 0, fat: 0, fiber: 0, calories: 0, cost: 0, count: 0 };
    Object.keys(items || {}).forEach(function (id) {
      var m = meal(id), n = items[id];
      if (!m || !n) return;
      t.protein += m.macros.protein * n; t.carbs += m.macros.carbs * n; t.fat += m.macros.fat * n;
      t.fiber += m.macros.fiber * n; t.calories += m.macros.calories * n; t.cost += m.cost * n; t.count += n;
    });
    return t;
  }

  function dayTotals(k) {
    var t = totals(getDay(k));
    getQuick(k).forEach(function (e) {
      t.protein += e.protein; t.carbs += e.carbs; t.fat += e.fat; t.fiber += e.fiber; t.calories += e.calories; t.count += 1;
    });
    ["protein", "carbs", "fat", "fiber", "calories"].forEach(function (x) { t[x] = Math.round(t[x]); });
    return t;
  }

  // ---------- favorites ----------
  function getFavs() {
    var f = load("meals-fav-v1", null);
    if (!Array.isArray(f)) f = (typeof DEFAULT_FAVORITES !== "undefined" ? DEFAULT_FAVORITES : []).slice();
    return f.filter(function (id) { return !!meal(id); });
  }
  function isFav(id) { return getFavs().indexOf(id) >= 0; }
  function toggleFav(id) {
    var f = getFavs(), i = f.indexOf(id);
    if (i >= 0) f.splice(i, 1); else f.push(id);
    save("meals-fav-v1", f);
  }

  // ---------- progress rings ----------
  var RING_C = 2 * Math.PI * 52;
  var lastPct = {};
  function ring(m, v, size) {
    var st = status(m, v), pct = Math.min(100, (v / m.min) * 100);
    var from = lastPct[size + m.key] || 0;
    lastPct[size + m.key] = pct;
    var id = "g-" + size + "-" + m.key, c = st === "over" ? ["#fbbf24", "#f97316"] : m.c;
    return '<div class="ring ' + st + '"><div class="rw"><svg viewBox="0 0 120 120" aria-hidden="true">' +
      '<defs><linearGradient id="' + id + '" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="' + c[0] + '"/><stop offset="1" stop-color="' + c[1] + '"/></linearGradient></defs>' +
      '<circle class="rt" cx="60" cy="60" r="52"/>' +
      '<circle class="rp" cx="60" cy="60" r="52" stroke="url(#' + id + ')" transform="rotate(-90 60 60)" stroke-dasharray="' + RING_C.toFixed(1) + '"' +
      ' stroke-dashoffset="' + (RING_C * (1 - from / 100)).toFixed(1) + '" data-to="' + (RING_C * (1 - pct / 100)).toFixed(1) + '"/></svg>' +
      '<div class="rc"><b>' + fmtNum(v) + (m.unit === "g" ? "g" : "") + '</b>' + (size === "big" ? '<span>' + m.label + '</span>' : '') + '</div></div>' +
      (size === "big" ? '<div class="rg">of ' + goalText(m) + '</div><div class="rn">' + noteText(m, v) + '</div>'
                      : '<div class="rl">' + m.label + '</div>') + '</div>';
  }
  function ringsHtml(t, size, T) {
    return '<div class="rings ' + size + '">' + metrics(T || getTargets()).map(function (m) { return ring(m, t[m.key], size); }).join("") + '</div>';
  }

  // ---------- shared pieces ----------
  var popId = null;
  function stepper(id, n, kind) {
    return '<div class="step">' +
      (n ? '<button data-act="' + kind + '-minus" data-id="' + esc(id) + '" aria-label="Remove one">&minus;</button><span class="q' + (popId === id ? ' pop' : '') + '">' + n + '</span>' : '') +
      '<button class="plus" data-act="' + kind + '-plus" data-id="' + esc(id) + '" aria-label="Add one">+</button></div>';
  }
  function rowHtml(m, n, kind, sub) {
    return '<div class="row' + (n ? ' on' : '') + '"><span class="re">' + (m.emoji || '') + '</span>' +
      '<a class="txt" href="#/meal/' + m.id + '"><b>' + esc(m.name) + '</b><small>' + sub(m) + '</small></a>' + stepper(m.id, n, kind) + '</div>';
  }
  function daySub(m) {
    return m.macros.protein + 'g protein &middot; ' + m.macros.calories + ' cal<br>' + m.macros.carbs + 'g carbs &middot; ' + m.macros.fiber + 'g fiber';
  }
  // Favorites first, then each category (without repeating the favorites).
  function pickerHtml(counts, kind, sub) {
    var favs = getFavs(), html = "";
    if (favs.length) {
      html += '<h3 class="group-h">&#11088; Favorites</h3><div class="rows">' +
        favs.map(function (id) { var m = meal(id); return rowHtml(m, counts[id] || 0, kind, sub); }).join("") + '</div>';
    }
    CATEGORIES.forEach(function (c) {
      var list = MEALS.filter(function (m) { return m.category === c.id && favs.indexOf(m.id) < 0; });
      if (!list.length) return;
      html += '<h3 class="group-h">' + (c.emoji ? c.emoji + ' ' : '') + esc(c.name) + '</h3><div class="rows">' +
        list.map(function (m) { return rowHtml(m, counts[m.id] || 0, kind, sub); }).join("") + '</div>';
    });
    return html;
  }
  function cardHtml(m) {
    return '<a class="card" href="#/meal/' + m.id + '"><div class="head"><span class="bub">' + (m.emoji || '') + '</span>' +
      '<div class="ht"><h3>' + esc(m.name) + (isFav(m.id) ? ' <span class="favmark">&#11088;</span>' : '') + '</h3>' +
      '<div class="sub">' + esc(m.time) + (m.servings > 1 ? ' &middot; makes ' + m.servings : '') + '</div></div>' +
      '<div class="pp"><b>' + m.macros.protein + 'g</b><span>protein</span></div></div>' +
      '<div class="chips"><span>' + m.macros.carbs + 'g carbs</span><span>' + m.macros.fiber + 'g fiber</span><span>' + m.macros.calories + ' cal</span><span>' + money(m.cost) + '</span></div></a>';
  }

  // ---------- screens ----------
  var curDay = todayKey(), curWeek = 0, weekMetric = "protein";

  function screenHome() {
    var items = getDay(todayKey()), t = dayTotals(todayKey());
    var html = '<a class="today-card" href="#/today"><div class="card-top"><h2>Today</h2><span class="more">Open &#8250;</span></div>' + ringsHtml(t, "small", dayTargets(todayKey())) + '</a>';
    var favs = getFavs();
    if (favs.length) {
      html += '<h3 class="group-h">&#11088; Favorites</h3><div class="rows">' +
        favs.map(function (id) { return rowHtml(meal(id), items[id] || 0, "day", daySub); }).join("") + '</div>';
    }
    html += '<h3 class="group-h">Browse</h3><div class="grid">';
    CATEGORIES.forEach(function (c) {
      var n = MEALS.filter(function (m) { return m.category === c.id; }).length;
      html += '<a class="tile t-' + c.id + '" href="#/cat/' + c.id + '"><span class="em">' + (c.emoji || '') + '</span><b>' + esc(c.name) + '</b><span>' + n + (n === 1 ? ' meal' : ' meals') + '</span></a>';
    });
    html += '<a class="tile t-grocery" href="#/grocery"><span class="em">&#128722;</span><b>Grocery list</b><span>Plan the week</span></a></div>' +
      '<p class="est">All macros and costs are estimates.</p>';
    return { title: "Meals", tab: "home", html: html };
  }

  function screenCat(id) {
    var c = cat(id);
    if (!c) return screenHome();
    var list = MEALS.filter(function (m) { return m.category === id; });
    list.sort(function (a, b) { return (isFav(b.id) ? 1 : 0) - (isFav(a.id) ? 1 : 0); });
    var html = '<p class="hint lead">' + esc(c.hint) + '</p>' + list.map(cardHtml).join("");
    if (!list.length) html += '<p class="empty">No meals here yet. Add one in meals.js.</p>';
    html += '<p class="est">Estimates, per serving.</p>';
    return { title: c.name, tab: "home", back: "#/", html: html };
  }

  function screenMeal(id) {
    var m = meal(id);
    if (!m) return screenHome();
    var c = cat(m.category), n = getDay(todayKey())[id] || 0, M = m.macros, fav = isFav(id);
    var html = '<div class="detail"><div class="hero"><span class="bub">' + (m.emoji || '') + '</span><h2>' + esc(m.name) + '</h2>' +
      '<button class="star' + (fav ? ' on' : '') + '" data-act="fav" data-id="' + esc(id) + '" aria-label="' + (fav ? 'Remove from favorites' : 'Add to favorites') + '">' + (fav ? '&#9733;' : '&#9734;') + '</button></div>' +
      '<div class="meta">' + esc(m.time) + ' &middot; ' + (m.servings > 1 ? 'makes ' + m.servings + ' servings' : '1 serving') + '</div>' +
      (m.servingNote ? '<div class="meta">One serving: ' + esc(m.servingNote) + '</div>' : '') +

      '<div class="section"><h3>Per serving (estimate)</h3><div class="macros">' +
        '<div class="stat hi"><b>' + M.protein + 'g</b><span>protein</span></div>' +
        '<div class="stat"><b>' + M.carbs + 'g</b><span>carbs</span></div>' +
        '<div class="stat"><b>' + M.fat + 'g</b><span>fat</span></div>' +
        '<div class="stat"><b>' + M.fiber + 'g</b><span>fiber</span></div>' +
        '<div class="stat"><b>' + M.calories + '</b><span>calories</span></div>' +
        '<div class="stat"><b>' + money(m.cost) + '</b><span>cost</span></div></div></div>' +

      '<div class="section"><h3>Ingredients' + (m.servings > 1 ? ' (whole batch)' : '') + '</h3><ul class="ing">';
    m.ingredients.forEach(function (g) {
      html += '<li><span class="amt">' + (g.qty ? esc(fmtAmt(g.qty, g.unit)) : '&bull;') + '</span>' +
        '<span class="what">' + esc(g.item) + (g.note ? '<small>' + esc(g.note) + '</small>' : '') + '</span></li>';
    });
    html += '</ul></div><div class="section"><h3>Steps</h3><ol class="steps">';
    m.steps.forEach(function (s, i) { html += '<li><span class="n">' + (i + 1) + '</span><span>' + esc(s) + '</span></li>'; });
    html += '</ol></div>';
    if (m.notes) html += '<div class="section"><h3>Notes</h3><p class="note">' + esc(m.notes) + '</p></div>';
    html += '<button class="btn sticky" data-act="day-plus" data-id="' + esc(m.id) + '">' +
      (n ? 'Add another to Today (' + n + ' added)' : 'Add to Today') + '</button>' +
      '<p class="est">Macros from typical labels, costs from typical Aldi, Walmart, and Sam\'s Club prices. Estimates only.</p></div>';
    return { title: c ? c.name : "Meal", tab: "home", back: "#/cat/" + m.category, html: html };
  }

  // Meals that close the protein gap without going over carbs or calories.
  function whatFits(t, T) {
    var left = T.proteinMin - t.protein, roomC = T.carbsMax - t.carbs, roomK = T.caloriesMax - t.calories;
    var list = MEALS.filter(function (m) {
      return m.category !== "prep" && m.macros.protein >= 15 && m.macros.carbs <= roomC && m.macros.calories <= roomK;
    });
    list.sort(function (a, b) {
      return (Math.min(b.macros.protein, left) - Math.min(a.macros.protein, left)) || (b.macros.fiber - a.macros.fiber);
    });
    return list.slice(0, 3);
  }

  function screenDay(k) {
    var isToday = k === todayKey(), items = getDay(k), t = dayTotals(k), T = dayTargets(k);
    var html = '<div class="today-card">' + ringsHtml(t, "big", T) +
      (T.bonus.cal ? '<p class="bonus">&#128293; Workouts burned about ' + fmtNum(T.bonus.burn) + ' cal, so calories are up ' + fmtNum(T.bonus.cal) + ' and carbs up ' + T.bonus.carbs + ' g today.</p>' : '') +
      '<div class="extra"><span>Fat <b>' + t.fat + 'g</b></span><span>Cost <b>' + money(t.cost) + '</b></span>' +
      '<span><b>' + t.count + '</b> ' + (t.count === 1 ? 'serving' : 'servings') + '</span></div></div>';

    var prevK = dateKey(addDays(parseKey(k), -1)), prevN = dayTotals(prevK).count;
    if (!t.count && prevN) {
      html += '<button class="btn soft" data-act="repeat">&#8635; Repeat ' + (isToday ? 'yesterday' : niceDate(prevK)) +
        ' (' + prevN + (prevN === 1 ? ' serving' : ' servings') + ')</button>';
    }
    html += workoutHtml(k, t, T, items);
    html += quickHtml(k);
    if (t.count && t.protein < T.proteinMin && !getWorkouts(k).length) {
      var fits = whatFits(t, T);
      if (fits.length) {
        html += '<h3 class="group-h">&#128161; Fits what is left</h3><div class="rows">' +
          fits.map(function (m) { return rowHtml(m, items[m.id] || 0, "day", daySub); }).join("") + '</div>';
      }
    }
    html += '<p class="hint">' + (isToday ? 'Tap + on what you eat. Each day is saved, see the Week tab.' : 'You are editing ' + niceDate(k) + '.') + '</p>';
    html += pickerHtml(items, "day", daySub);
    if (t.count) html += '<div class="gap"><button class="btn ghost" data-act="day-clear">Clear this day</button></div>';
    html += '<p class="est">Totals are estimates.</p>';
    return { title: isToday ? "Today" : niceDate(k), tab: isToday ? "today" : "week", back: isToday ? null : "#/week/" + weekOffsetOf(k), html: html };
  }

  // ---------- workout block on Today ----------
  var workOpen = false, wType = "lift", wInt = "moderate";
  function workLine(w) {
    return (w.minutes ? w.minutes + ' min &middot; ' : '') + w.intensity.charAt(0).toUpperCase() + w.intensity.slice(1) +
      ' &middot; ~' + fmtNum(workBurn(w)) + ' cal' + (w.watchCal ? ' (watch)' : '');
  }
  // What to eat after the last workout logged today.
  function postWorkout(k, t, T, items) {
    var list = getWorkouts(k);
    if (!list.length) return null;
    var last = list[list.length - 1], cardio = last.type !== "lift", big = last.intensity === "hard" || last.minutes >= 60;
    var roomC = T.carbsMax - t.carbs, roomK = T.caloriesMax - t.calories;
    var cand = MEALS.filter(function (m) {
      return m.category !== "prep" && m.macros.protein >= 20 && m.macros.calories <= Math.max(roomK, 400) && m.macros.carbs <= Math.max(roomC, 40);
    });
    function score(m) {
      var P = m.macros.protein, C = m.macros.carbs, sc;
      if (cardio) sc = Math.min(C, big ? 100 : 70) * 1.2 + Math.min(P, 50) * 1.0;
      else sc = Math.min(P, 60) * 2 + Math.min(C, big ? 80 : 60) * 0.6;
      if (m.macros.fat > 30) sc -= (m.macros.fat - 30) * 1.5;   // heavy fat slows things down after training
      if (items[m.id]) sc -= 25;                                  // already eaten today, mix it up
      return sc;
    }
    cand.sort(function (a, b) { return score(b) - score(a); });
    var why = cardio
      ? (big ? 'Long or hard cardio burns through stored carbs. Refill carbs first, with solid protein.' : 'Carbs to refill, protein to recover.')
      : (big ? 'Hard lift: lots of protein for muscle repair, plus carbs to refuel.' : 'Protein first for muscle repair, some carbs to refuel.');
    return { last: last, meals: cand.slice(0, 3), why: why + ' Best eaten within about 2 hours.' };
  }
  function workoutHtml(k, t, T, items) {
    var list = getWorkouts(k), html = '';
    if (list.length) {
      html += '<h3 class="group-h">&#128170; Workouts</h3><div class="rows">' + list.map(function (w) {
        var tp = WORK[w.type] || WORK.other;
        return '<div class="row on"><span class="re">' + tp.emoji + '</span><div class="txt"><b>' + esc(w.label || tp.name) + '</b><small>' + workLine(w) + '</small></div>' +
          '<button class="xbtn" data-act="work-del" data-id="' + esc(w.id) + '" aria-label="Remove workout">&times;</button></div>';
      }).join("") + '</div>';
      var pw = postWorkout(k, t, T, items);
      if (pw && pw.meals.length) {
        var tp2 = WORK[pw.last.type] || WORK.other;
        html += '<div class="eatnext"><div class="en-h">' + tp2.emoji + ' <b>Eat after your ' + esc((pw.last.label || tp2.name).toLowerCase()) + '</b></div>' +
          '<p>' + pw.why + '</p></div><div class="rows">' +
          pw.meals.map(function (m) { return rowHtml(m, items[m.id] || 0, "day", daySub); }).join("") + '</div>';
      }
    }
    if (!workOpen) {
      return html + '<button class="btn soft" data-act="work-open">&#128170; Log a workout</button>';
    }
    html += '<div class="quick"><div class="qhead"><b>Log a workout</b><button type="button" class="xbtn" data-act="work-close" aria-label="Close">&times;</button></div>' +
      '<div class="wtypes">' + Object.keys(WORK).map(function (key) {
        return '<button type="button" data-act="work-type" data-id="' + key + '"' + (key === wType ? ' class="on"' : '') + '><i>' + WORK[key].emoji + '</i>' + WORK[key].name + '</button>';
      }).join("") + '</div>' +
      (wType === "lift" ? '<div class="seg mt">' + ["Upper", "Lower", "Full"].map(function (x) {
        return '<button type="button" data-act="work-label" data-id="' + x + '"' + (x === wLabel ? ' class="on"' : '') + '>' + x + '</button>';
      }).join("") + '</div>' : '') +
      '<div class="seg mt">' + INTENSITY.map(function (x) {
        return '<button type="button" data-act="work-int" data-id="' + x + '"' + (x === wInt ? ' class="on"' : '') + '>' + x.charAt(0).toUpperCase() + x.slice(1) + '</button>';
      }).join("") + '</div>' +
      '<div class="qgrid"><label class="qf"><span>Minutes</span><input id="w-min" type="number" inputmode="numeric" min="1" placeholder="' + (wType === "run" ? "40" : "60") + '"></label>' +
      '<label class="qf"><span>Watch calories</span><input id="w-cal" type="number" inputmode="numeric" min="0" placeholder="optional"></label></div>' +
      '<p class="qnote" id="w-msg">Burn is estimated from time, effort, and your weight (Settings). If your Garmin shows calories, put them in and that number is used instead.</p>' +
      '<button type="button" class="btn" data-act="work-save">Save workout</button></div>';
    return html;
  }
  var wLabel = "Upper";

  // ---------- quick add ----------
  var quickOpen = false;
  function qline(e) {
    return e.protein + 'g protein &middot; ' + e.calories + ' cal<br>' + e.carbs + 'g carbs &middot; ' + e.fiber + 'g fiber';
  }
  function quickHtml(k) {
    var list = getQuick(k), recent = getRecent(), html = '';
    if (list.length) {
      html += '<h3 class="group-h">&#9997;&#65039; Quick adds</h3><div class="rows">' + list.map(function (e) {
        return '<div class="row on"><span class="re">&#9997;&#65039;</span><div class="txt"><b>' + esc(e.name) + '</b><small>' + qline(e) + '</small></div>' +
          '<button class="xbtn" data-act="quick-del" data-id="' + esc(e.id) + '" aria-label="Remove ' + esc(e.name) + '">&times;</button></div>';
      }).join("") + '</div>';
    }
    if (!quickOpen) {
      return html + '<button class="btn soft" data-act="quick-open">+ Quick add (food not in the app)</button>';
    }
    function f(id, label, ph) {
      return '<label class="qf"><span>' + label + '</span><input id="q-' + id + '" type="number" inputmode="decimal" min="0" step="any" placeholder="' + ph + '"></label>';
    }
    html += '<form class="quick" id="quick-form" autocomplete="off"><div class="qhead"><b>Quick add</b>' +
      '<button type="button" class="xbtn" data-act="quick-close" aria-label="Close">&times;</button></div>';
    if (recent.length) {
      html += '<div class="qrecent"><span>Recent, one tap to add</span><div class="qchips">' + recent.map(function (e, i) {
        return '<button type="button" data-act="quick-recent" data-id="' + i + '">' + esc(e.name) + ' &middot; ' + e.protein + 'g</button>';
      }).join("") + '</div></div>';
    }
    html += '<label class="qf wide"><span>What was it?</span><input id="q-name" type="text" maxlength="40" placeholder="Protein bar, Chipotle bowl..." enterkeyhint="next"></label>' +
      '<div class="qgrid">' + f("protein", "Protein g", "0") + f("calories", "Calories", "auto") +
      f("carbs", "Carbs g", "0") + f("fat", "Fat g", "0") + f("fiber", "Fiber g", "0") + '</div>' +
      '<p class="qnote" id="q-msg">Leave calories blank and it works them out from protein, carbs, and fat. Blank boxes count as 0.</p>' +
      '<button type="submit" class="btn">Add to ' + (k === todayKey() ? 'Today' : niceDate(k)) + '</button></form>';
    return html;
  }
  function num(id) {
    var el = document.getElementById("q-" + id), v = el ? parseFloat(el.value) : NaN;
    return isFinite(v) && v > 0 ? Math.round(v * 10) / 10 : 0;
  }
  function addQuick(k, e) {
    var list = getQuick(k);
    e.id = "q" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
    list.push(e);
    setQuick(k, list);
    rememberRecent(e);
  }

  function proteinStreak(T) {
    var d = new Date(), n = 0;
    // protein target does not change with workouts, so the base target is right here
    if (dayTotals(dateKey(d)).protein < T.proteinMin) d = addDays(d, -1);   // today is still in progress
    for (var i = 0; i < 730; i++) {
      if (dayTotals(dateKey(d)).protein >= T.proteinMin) { n++; d = addDays(d, -1); } else break;
    }
    return n;
  }
  function shortNum(m, v) { return m.key === "calories" && v >= 1000 ? (Math.round(v / 100) / 10) + "k" : String(v); }

  function chartHtml(days, m, tk) {
    var W = 350, H = 210, top = 24, bottom = 34, plot = H - top - bottom, step = W / 7, bw = 30;
    var peak = Math.max.apply(null, days.map(function (d) { return d.t[m.key]; }));
    var yMax = Math.max(m.max || m.min, peak) * 1.12;
    function y(v) { return top + plot - (v / yMax) * plot; }
    var s = '<svg viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="' + m.label + ' by day">' +
      '<defs><linearGradient id="wg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + m.c[0] + '"/><stop offset="1" stop-color="' + m.c[1] + '"/></linearGradient></defs>';
    if (m.max) s += '<rect class="band" x="0" y="' + y(m.max).toFixed(1) + '" width="' + W + '" height="' + (y(m.min) - y(m.max)).toFixed(1) + '" rx="4"/>';
    s += '<line class="goal" x1="0" x2="' + W + '" y1="' + y(m.min).toFixed(1) + '" y2="' + y(m.min).toFixed(1) + '"/>';
    days.forEach(function (d, i) {
      var cx = step * i + step / 2, v = d.t[m.key], dm = d.M ? d.M.filter(function (x) { return x.key === m.key; })[0] : m, st = status(dm, v);
      if (d.t.count) {
        var by = y(v), bh = Math.max(4, top + plot - by);
        s += '<rect class="bar b-' + st + '" x="' + (cx - bw / 2).toFixed(1) + '" y="' + (top + plot - bh).toFixed(1) + '" width="' + bw + '" height="' + bh.toFixed(1) + '" rx="8"' + (st === "hit" ? ' fill="url(#wg)"' : '') + '/>' +
          '<text class="val" x="' + cx.toFixed(1) + '" y="' + (top + plot - bh - 6).toFixed(1) + '">' + shortNum(m, v) + '</text>';
      } else {
        s += '<rect class="bar b-none" x="' + (cx - bw / 2).toFixed(1) + '" y="' + (top + plot - 4) + '" width="' + bw + '" height="4" rx="2"/>';
      }
      s += '<text class="lab' + (d.k === tk ? ' now' : '') + '" x="' + cx.toFixed(1) + '" y="' + (H - 16) + '">' + DAY[d.d.getDay()].charAt(0) + '</text>' +
        '<text class="lab2' + (d.k === tk ? ' now' : '') + '" x="' + cx.toFixed(1) + '" y="' + (H - 2) + '">' + d.d.getDate() + '</text>';
    });
    return s + '</svg>';
  }

  function screenWeek(off) {
    var T = getTargets(), M = metrics(T), tk = todayKey(), start = addDays(weekStart(new Date()), off * 7), days = [], i;
    for (i = 0; i < 7; i++) { var d = addDays(start, i), k = dateKey(d); days.push({ d: d, k: k, t: dayTotals(k), M: metrics(dayTargets(k)), w: getWorkouts(k), future: k > tk }); }
    var m = M.filter(function (x) { return x.key === weekMetric; })[0] || M[0];
    var end = days[6].d, logged = days.filter(function (x) { return x.t.count; });
    var range = MON[start.getMonth()] + " " + start.getDate() + " to " + (end.getMonth() !== start.getMonth() ? MON[end.getMonth()] + " " : "") + end.getDate();

    var html = '<div class="weeknav"><button class="icon-btn" data-act="week-prev" aria-label="Previous week">&#8249;</button>' +
      '<div class="wk"><b>' + (off === 0 ? "This week" : off === -1 ? "Last week" : range) + '</b><small>' + (off >= -1 ? range : "") + '</small></div>' +
      '<button class="icon-btn" data-act="week-next" aria-label="Next week"' + (off >= 0 ? ' disabled' : '') + '>&#8250;</button></div>';

    html += '<div class="seg">' + M.map(function (x) {
      return '<button data-act="metric" data-id="' + x.key + '"' + (x.key === m.key ? ' class="on"' : '') + '>' + x.label + '</button>';
    }).join("") + '</div>';

    html += '<div class="chart">' + chartHtml(days, m, tk) + '<p class="cap">Goal: ' + goalText(m) + ' a day</p></div>';

    var wcount = 0, wburn = 0;
    days.forEach(function (dd) { dd.w.forEach(function (w) { wcount++; wburn += workBurn(w); }); });
    if (off === 0) {
      var st = proteinStreak(T);
      html += '<div class="streak"><span class="fire">&#128293;</span><div><b>' + st + (st === 1 ? ' day' : ' days') + '</b><small>protein streak</small></div></div>';
    }

    if (wcount) html += '<div class="wsum">&#128170; <b>' + wcount + (wcount === 1 ? ' workout' : ' workouts') + '</b> this week &middot; about ' + fmtNum(wburn) + ' cal burned</div>';
    html += '<h3 class="group-h">Averages' + (logged.length ? ' over ' + logged.length + (logged.length === 1 ? ' logged day' : ' logged days') : '') + '</h3>';
    if (logged.length) {
      html += '<div class="wstats">' + M.map(function (x) {
        var sum = 0, hits = 0;
        logged.forEach(function (dd) {
          var dx = dd.M.filter(function (y) { return y.key === x.key; })[0];
          sum += dd.t[x.key]; if (status(dx, dd.t[x.key]) === "hit") hits++;
        });
        return '<div class="wstat"><span>' + x.label + '</span><b>' + fmtNum(sum / logged.length) + (x.unit === "g" ? "g" : "") + '</b>' +
          '<small>on target ' + hits + ' of ' + logged.length + '</small></div>';
      }).join("") + '</div>';
    } else {
      html += '<p class="empty">Nothing logged this week.</p>';
    }

    html += '<h3 class="group-h">Days</h3><div class="rows">';
    days.forEach(function (dd) {
      var inner = '<div class="dl' + (dd.k === tk ? ' now' : '') + '"><b>' + DAY[dd.d.getDay()] + '</b><span>' + dd.d.getDate() + '</span></div><div class="dv">';
      if (dd.t.count) {
        inner += dd.M.map(function (x) {
          return '<span class="pill ' + status(x, dd.t[x.key]) + '">' + (x.key === "calories" ? "Cal" : x.label.charAt(0)) + ' ' + shortNum(x, dd.t[x.key]) + '</span>';
        }).join("");
      } else inner += '<span class="none">' + (dd.future ? "Upcoming" : "Nothing logged") + '</span>';
      if (dd.w.length) inner += '<span class="wk-ic">' + dd.w.map(function (w) { return (WORK[w.type] || WORK.other).emoji; }).join("") + '</span>';
      inner += '</div>';
      html += dd.future ? '<div class="dayrow off">' + inner + '</div>'
                        : '<a class="dayrow" href="#/' + (dd.k === tk ? 'today' : 'day/' + dd.k) + '">' + inner + '<span class="chev">&#8250;</span></a>';
    });
    html += '</div><p class="hint">P protein, F fiber, C carbs. Green means on target. Tap a day to see or fix it. Swipe or use the arrows for other weeks. History is saved on this phone only.</p>';
    return { title: "Week", tab: "week", html: html };
  }

  function buildList(plan) {
    var items = {};
    Object.keys(plan).forEach(function (id) {
      var m = meal(id), n = plan[id];
      if (!m || !n) return;
      m.ingredients.forEach(function (g) {
        var info = GROCERY[g.item] || { section: "Other", unit: g.unit, price: 0 };
        var it = items[g.item] || (items[g.item] = { item: g.item, qty: 0, unit: g.unit || info.unit, info: info });
        it.qty += (g.qty || 0) * n;
      });
    });
    return items;
  }

  function screenGrocery() {
    var plan = getPlan(), got = getGot(), items = buildList(plan), names = Object.keys(items);
    var html = '<p class="hint lead">Tap + for each time you will make a meal this week. Batch recipes count as the whole batch.</p>';
    html += pickerHtml(plan, "plan", function (m) {
      return (m.servings > 1 ? 'makes ' + m.servings + ' &middot; ' : '') + money(m.cost * m.servings) + (m.servings > 1 ? ' a batch' : ' each');
    });

    html += '<h2 class="big-h">Your list</h2>';
    if (!names.length) {
      html += '<p class="empty">Pick meals above and the list builds itself.</p>';
    } else {
      var total = 0;
      SECTIONS.forEach(function (sec) {
        var inSec = names.filter(function (k) { return (items[k].info.section || "Other") === sec; }).sort();
        if (!inSec.length) return;
        html += '<h3 class="group-h">' + esc(sec) + '</h3><div class="rows"><ul class="gl">';
        inSec.forEach(function (k) {
          var it = items[k], cost = it.qty * (it.info.price || 0), amt, extra = it.info.tip || "";
          total += cost;
          if (it.info.staple || !it.qty) amt = "Have on hand";
          else {
            amt = fmtAmt(Math.ceil(it.qty * 4 - 1e-9) / 4, it.unit);
            if (it.unit === "oz" && it.qty >= 8) amt += " (" + (Math.round(it.qty / 16 * 10) / 10) + " lb)";
          }
          html += '<li class="' + (got[k] ? 'got' : '') + '" data-act="got" data-id="' + esc(k) + '">' +
            '<span class="box">' + (got[k] ? '&#10003;' : '') + '</span>' +
            '<span class="gi"><b>' + esc(k) + '</b><small>' + esc(amt) + (extra ? ' &middot; ' + esc(extra) : '') + '</small></span>' +
            (cost ? '<span class="gp">' + money(cost) + '</span>' : '') + '</li>';
        });
        html += '</ul></div>';
      });
      html += '<div class="total"><span>Rough total</span><b>' + money(total) + '</b></div>' +
        '<p class="hint">Estimate of the food you will use. The receipt runs higher when you buy full packages, and lower for what you already have. ' +
        'If you pick a batch and the meals that use it, the chicken or turkey gets counted twice.</p>' +
        '<div class="gap"><button class="btn ghost" data-act="plan-clear">Clear week</button></div>';
    }
    return { title: "Grocery list", tab: "grocery", html: html };
  }

  function screenSettings() {
    var T = getTargets();
    function inp(k) { return '<input type="number" inputmode="numeric" min="0" data-target="' + k + '" value="' + T[k] + '" aria-label="' + k + '">'; }
    function line(label, a, b) {
      return '<div class="frow"><span class="fl">' + label + '</span><span class="fi">' + inp(a) + (b ? '<i>to</i>' + inp(b) : '<i></i><span class="fpad">or more</span>') + '</span></div>';
    }
    var html = '<h3 class="group-h">Daily targets</h3><div class="rows">' +
      line("Protein (g)", "proteinMin", "proteinMax") + line("Fiber (g)", "fiber") +
      line("Carbs (g)", "carbsMin", "carbsMax") + line("Calories", "caloriesMin", "caloriesMax") + '</div>' +
      '<p class="hint">Changes save as you type. The rings and the Week chart use these. On workout days, calories and carbs go up automatically.</p>' +
      '<h3 class="group-h">You</h3><div class="rows"><div class="frow"><span class="fl">Body weight (lb)</span><span class="fi">' +
      '<input type="number" inputmode="numeric" min="60" data-weight="1" value="' + Math.round(bodyKg() / 0.4536) + '" aria-label="Body weight"><i></i><span class="fpad">for burn</span></span></div></div>' +
      '<div class="gap"><button class="btn ghost" data-act="targets-reset">Reset targets to defaults</button></div>' +
      '<h3 class="group-h">Look</h3><div class="seg">' + ["auto", "light", "dark"].map(function (t) {
        return '<button data-act="theme" data-id="' + t + '"' + (t === theme ? ' class="on"' : '') + '>' + t.charAt(0).toUpperCase() + t.slice(1) + '</button>';
      }).join("") + '</div>' +
      '<h3 class="group-h">Good to know</h3><p class="note">Tap the star on any meal to pin it to the top as a favorite. ' +
      'Your log, quick adds, workouts, favorites, and targets are saved on this phone only. Deleting the app from your home screen erases them.</p>';
    return { title: "Settings", tab: "", back: "#/", html: html };
  }

  // ---------- router ----------
  var route = "";
  function render(keepScroll) {
    var parts = location.hash.replace(/^#\/?/, "").split("/"), s;
    route = parts[0] || "home";
    curDay = todayKey();
    if (route === "cat") s = screenCat(parts[1]);
    else if (route === "meal") s = screenMeal(decodeURIComponent(parts[1] || ""));
    else if (route === "today") s = screenDay(curDay);
    else if (route === "day" && validKey(parts[1]) && parts[1] <= curDay) { curDay = parts[1]; s = screenDay(curDay); }
    else if (route === "week") { curWeek = Math.min(0, parseInt(parts[1], 10) || 0); s = screenWeek(curWeek); }
    else if (route === "grocery") s = screenGrocery();
    else if (route === "settings") s = screenSettings();
    else { route = "home"; s = screenHome(); }

    var y = window.scrollY;
    view.innerHTML = s.html;
    titleEl.textContent = s.title;
    backBtn.hidden = !s.back;
    backBtn.dataset.to = s.back || "";
    Array.prototype.forEach.call(document.querySelectorAll(".tabs a"), function (a) {
      a.classList.toggle("on", a.dataset.tab === s.tab);
    });
    window.scrollTo(0, keepScroll ? y : 0);
    view.classList.toggle("enter", !keepScroll);
    popId = null;
    // animate rings from their last value to the new one
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        Array.prototype.forEach.call(view.querySelectorAll(".rp"), function (c) { c.style.strokeDashoffset = c.dataset.to; });
      });
    });
  }

  function bump(obj, id, d) {
    var n = (obj[id] || 0) + d;
    if (n <= 0) delete obj[id]; else obj[id] = Math.min(n, 20);
  }

  view.addEventListener("click", function (e) {
    var el = e.target.closest("[data-act]");
    if (!el || el.disabled) return;
    var act = el.dataset.act, id = el.dataset.id, d, p, g;
    if (act === "day-plus" || act === "day-minus") {
      d = getDay(curDay); bump(d, id, act === "day-plus" ? 1 : -1); setDay(curDay, d);
    } else if (act === "day-clear") {
      setDay(curDay, {}); setQuick(curDay, []); setWorkouts(curDay, []);
    } else if (act === "repeat") {
      var pk = dateKey(addDays(parseKey(curDay), -1));
      setDay(curDay, JSON.parse(JSON.stringify(getDay(pk))));
      setQuick(curDay, getQuick(pk).map(function (x, i) { var c = JSON.parse(JSON.stringify(x)); c.id = "q" + Date.now().toString(36) + i; return c; }));
    } else if (act === "plan-plus" || act === "plan-minus") {
      p = getPlan(); bump(p, id, act === "plan-plus" ? 1 : -1); setPlan(p);
    } else if (act === "plan-clear") {
      setPlan({}); setGot({});
    } else if (act === "got") {
      g = getGot(); if (g[id]) delete g[id]; else g[id] = true; setGot(g);
    } else if (act === "work-open") {
      workOpen = true; quickOpen = false;
    } else if (act === "work-close") {
      workOpen = false;
    } else if (act === "work-type" || act === "work-int" || act === "work-label") {
      var keep = { m: (document.getElementById("w-min") || {}).value, c: (document.getElementById("w-cal") || {}).value };
      if (act === "work-type") wType = id; else if (act === "work-int") wInt = id; else wLabel = id;
      e.preventDefault(); render(true);
      if (keep.m) document.getElementById("w-min").value = keep.m;
      if (keep.c) document.getElementById("w-cal").value = keep.c;
      return;
    } else if (act === "work-save") {
      var mins = parseFloat((document.getElementById("w-min") || {}).value), wc = parseFloat((document.getElementById("w-cal") || {}).value);
      mins = isFinite(mins) && mins > 0 ? Math.round(mins) : 0;
      wc = isFinite(wc) && wc > 0 ? Math.round(wc) : 0;
      if (!mins && !wc) {
        var wm = document.getElementById("w-msg");
        if (wm) { wm.textContent = "Enter the minutes, or the calories from your watch."; wm.classList.add("err"); }
        return;
      }
      var wl = getWorkouts(curDay);
      wl.push({ id: "w" + Date.now().toString(36), type: wType, label: wType === "lift" ? wLabel + " lift" : "", intensity: wInt, minutes: mins, watchCal: wc });
      setWorkouts(curDay, wl);
      workOpen = false;
      if (document.activeElement) document.activeElement.blur();
    } else if (act === "work-del") {
      setWorkouts(curDay, getWorkouts(curDay).filter(function (x) { return x.id !== id; }));
    } else if (act === "quick-open") {
      quickOpen = true; workOpen = false;
      e.preventDefault(); render(true);
      var nm = document.getElementById("q-name"); if (nm) nm.focus();
      return;
    } else if (act === "quick-close") {
      quickOpen = false;
    } else if (act === "quick-del") {
      setQuick(curDay, getQuick(curDay).filter(function (x) { return x.id !== id; }));
    } else if (act === "quick-recent") {
      var r = getRecent()[+id];
      if (r) { addQuick(curDay, JSON.parse(JSON.stringify(r))); quickOpen = false; }
    } else if (act === "fav") {
      toggleFav(id);
    } else if (act === "metric") {
      weekMetric = id;
    } else if (act === "week-prev" || act === "week-next") {
      e.preventDefault();
      location.hash = "#/week/" + Math.min(0, curWeek + (act === "week-prev" ? -1 : 1));
      return;
    } else if (act === "theme") {
      theme = id; try { localStorage.setItem("meals-theme", theme); } catch (err) {}
      applyTheme(theme);
    } else if (act === "targets-reset") {
      save("meals-targets-v1", {});
    } else return;
    if (act.indexOf("-plus") > 0 || act.indexOf("-minus") > 0) popId = id;
    e.preventDefault();
    render(true);
  });

  // Quick add form
  view.addEventListener("submit", function (e) {
    if (!e.target || e.target.id !== "quick-form") return;
    e.preventDefault();
    var en = {
      name: (document.getElementById("q-name").value || "").trim() || "Quick add",
      protein: num("protein"), carbs: num("carbs"), fat: num("fat"), fiber: num("fiber"), calories: num("calories")
    };
    if (!en.calories) en.calories = Math.round(en.protein * 4 + en.carbs * 4 + en.fat * 9);
    if (!en.protein && !en.carbs && !en.fat && !en.fiber && !en.calories) {
      var msg = document.getElementById("q-msg");
      if (msg) { msg.textContent = "Enter at least one number."; msg.classList.add("err"); }
      return;
    }
    if (document.activeElement) document.activeElement.blur();
    addQuick(curDay, en);
    quickOpen = false;
    render(true);
  });

  // Settings inputs save as you type (no re-render, so the keyboard stays up).
  view.addEventListener("input", function (e) {
    if (e.target && e.target.dataset && e.target.dataset.weight) {
      var lb = Number(e.target.value);
      if (isFinite(lb) && lb > 60) save("meals-weight-v1", lb);
      return;
    }
    var k = e.target && e.target.dataset ? e.target.dataset.target : null;
    if (!k) return;
    var o = load("meals-targets-v1", {}) || {}, v = Number(e.target.value);
    if (e.target.value !== "" && isFinite(v) && v > 0) o[k] = v; else delete o[k];
    save("meals-targets-v1", o);
  });

  // Swipe left and right on the Week screen to change weeks.
  var sx = null, sy = null;
  view.addEventListener("touchstart", function (e) { sx = e.touches[0].clientX; sy = e.touches[0].clientY; }, { passive: true });
  view.addEventListener("touchend", function (e) {
    if (route !== "week" || sx === null) return;
    var dx = e.changedTouches[0].clientX - sx, dy = e.changedTouches[0].clientY - sy;
    sx = null;
    if (Math.abs(dx) < 70 || Math.abs(dx) < Math.abs(dy) * 1.5) return;
    var next = Math.min(0, curWeek + (dx > 0 ? -1 : 1));
    if (next !== curWeek) location.hash = "#/week/" + next;
  }, { passive: true });

  backBtn.addEventListener("click", function () { location.hash = backBtn.dataset.to || "#/"; });

  // ---------- theme ----------
  function applyTheme(t) {
    if (t === "auto") delete document.documentElement.dataset.theme; else document.documentElement.dataset.theme = t;
  }
  var theme = "auto";
  try { theme = localStorage.getItem("meals-theme") || "auto"; } catch (e) {}
  if (["auto", "light", "dark"].indexOf(theme) < 0) theme = "auto";
  applyTheme(theme);

  window.addEventListener("hashchange", function () { quickOpen = false; workOpen = false; render(false); });
  // Coming back to the app the next morning: refresh so Today moves to the new day.
  document.addEventListener("visibilitychange", function () { if (!document.hidden && !quickOpen && !workOpen) render(true); });
  render(false);

  if ("serviceWorker" in navigator) {
    window.addEventListener("load", function () { navigator.serviceWorker.register("sw.js").catch(function () {}); });
  }
})();
