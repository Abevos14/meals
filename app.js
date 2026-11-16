/* app.js  -  screen code only. Meal data lives in meals.js. */
(function () {
  "use strict";

  var view = document.getElementById("view");
  var titleEl = document.getElementById("title");
  var backBtn = document.getElementById("back");
  var themeBtn = document.getElementById("theme");

  // ---------- storage (never crash if storage is blocked) ----------
  function load(key, fallback) {
    try { var v = JSON.parse(localStorage.getItem(key)); return v == null ? fallback : v; } catch (e) { return fallback; }
  }
  function save(key, val) { try { localStorage.setItem(key, JSON.stringify(val)); } catch (e) {} }

  function todayKey() {
    var d = new Date();
    return d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate();
  }
  // Today resets itself each morning.
  function getToday() {
    var t = load("meals-today-v1", null);
    if (!t || t.date !== todayKey()) t = { date: todayKey(), items: {} };
    return t;
  }
  function setToday(t) { save("meals-today-v1", t); }
  function getPlan() { return load("meals-plan-v1", {}); }
  function setPlan(p) { save("meals-plan-v1", p); }
  function getGot() { return load("meals-got-v1", {}); }
  function setGot(g) { save("meals-got-v1", g); }

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
  var PLURAL = { cup: "cups", slice: "slices", packet: "packets", can: "cans" };
  function fmtAmt(q, unit) {
    if (!q) return "";
    var u = unit === "each" ? "" : (q > 1 && PLURAL[unit] ? PLURAL[unit] : unit);
    return fmtQty(q) + (u ? " " + u : "");
  }

  function totals(items) {
    var t = { protein: 0, carbs: 0, fat: 0, fiber: 0, calories: 0, cost: 0, count: 0 };
    Object.keys(items).forEach(function (id) {
      var m = meal(id), n = items[id];
      if (!m || !n) return;
      t.protein += m.macros.protein * n; t.carbs += m.macros.carbs * n; t.fat += m.macros.fat * n;
      t.fiber += m.macros.fiber * n; t.calories += m.macros.calories * n; t.cost += m.cost * n; t.count += n;
    });
    return t;
  }

  // ---------- progress rings ----------
  var RING_C = 2 * Math.PI * 52;
  var lastPct = { p: 0, f: 0 };
  function ringHtml(key, label, val, pct, goal, note, hit) {
    var from = lastPct[key] || 0;
    lastPct[key] = pct;
    return '<div class="ring' + (hit ? ' hit' : '') + '"><div class="rw"><svg viewBox="0 0 120 120" aria-hidden="true">' +
      '<defs><linearGradient id="rg-' + key + '" x1="0" y1="0" x2="1" y2="1">' +
      '<stop offset="0" stop-color="' + (key === "p" ? "#06b6d4" : "#2dd4bf") + '"/><stop offset="1" stop-color="' + (key === "p" ? "#2563eb" : "#0891b2") + '"/></linearGradient></defs>' +
      '<circle class="rt" cx="60" cy="60" r="52"/>' +
      '<circle class="rp" cx="60" cy="60" r="52" stroke="url(#rg-' + key + ')" transform="rotate(-90 60 60)" stroke-dasharray="' + RING_C.toFixed(1) + '"' +
      ' stroke-dashoffset="' + (RING_C * (1 - from / 100)).toFixed(1) + '" data-to="' + (RING_C * (1 - pct / 100)).toFixed(1) + '"/></svg>' +
      '<div class="rc"><b>' + val + 'g</b><span>' + label + '</span></div></div>' +
      '<div class="rg">' + goal + '</div><div class="rn">' + note + '</div></div>';
  }
  function barsHtml(t) {
    var pPct = Math.min(100, (t.protein / TARGETS.proteinMin) * 100);
    var fPct = Math.min(100, (t.fiber / TARGETS.fiber) * 100);
    var pHit = t.protein >= TARGETS.proteinMin, fHit = t.fiber >= TARGETS.fiber, pNote;
    if (!pHit) pNote = (TARGETS.proteinMin - t.protein) + ' g to go';
    else if (t.protein <= TARGETS.proteinMax) pNote = '&#10003; Target hit';
    else pNote = '&#10003; Hit, ' + (t.protein - TARGETS.proteinMax) + ' g over';
    return '<div class="rings">' +
      ringHtml("p", "protein", t.protein, pPct, 'of ' + TARGETS.proteinMin + ' to ' + TARGETS.proteinMax + ' g', pNote, pHit) +
      ringHtml("f", "fiber", t.fiber, fPct, 'of ' + TARGETS.fiber + ' g', fHit ? '&#10003; Target hit' : (TARGETS.fiber - t.fiber) + ' g to go', fHit) +
      '</div>';
  }

  function statsHtml(m) {
    return '<div class="stats">' +
      '<div class="stat hi"><b>' + m.macros.protein + 'g</b><span>protein</span></div>' +
      '<div class="stat"><b>' + m.macros.fiber + 'g</b><span>fiber</span></div>' +
      '<div class="stat"><b>' + m.macros.calories + '</b><span>cal</span></div>' +
      '<div class="stat"><b>' + money(m.cost) + '</b><span>serving</span></div></div>';
  }

  function stepper(id, n, kind) {
    return '<div class="step">' +
      (n ? '<button data-act="' + kind + '-minus" data-id="' + esc(id) + '" aria-label="Remove one">&minus;</button><span class="q' + (popId === id ? ' pop' : '') + '">' + n + '</span>' : '') +
      '<button class="plus" data-act="' + kind + '-plus" data-id="' + esc(id) + '" aria-label="Add one">+</button></div>';
  }

  var popId = null;

  // ---------- screens ----------
  function screenHome() {
    var t = totals(getToday().items);
    var html = '<a class="today-card" href="#/today"><h2>Today</h2>' + barsHtml(t) + '</a><div class="grid">';
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
    var html = '<p class="hint" style="margin:0 2px 12px">' + esc(c.hint) + '</p>';
    list.forEach(function (m) {
      html += '<a class="card" href="#/meal/' + m.id + '"><div class="head"><span class="bub">' + (m.emoji || '') + '</span><div><h3>' + esc(m.name) + '</h3>' +
        '<div class="sub">' + esc(m.time) + (m.servings > 1 ? ' &middot; makes ' + m.servings : '') + '</div></div></div>' + statsHtml(m) + '</a>';
    });
    if (!list.length) html += '<p class="empty">No meals here yet. Add one in meals.js.</p>';
    html += '<p class="est">Estimates, per serving.</p>';
    return { title: c.name, tab: "home", back: "#/", html: html };
  }

  function screenMeal(id) {
    var m = meal(id);
    if (!m) return screenHome();
    var c = cat(m.category), n = getToday().items[id] || 0, M = m.macros;
    var html = '<div class="detail"><div class="hero"><span class="bub">' + (m.emoji || '') + '</span><h2>' + esc(m.name) + '</h2></div>' +
      '<div class="meta">' + esc(m.time) + ' &middot; ' +
      (m.servings > 1 ? 'makes ' + m.servings + ' servings' : '1 serving') +
      ' &middot; ' + money(m.cost) + ' a serving</div>' +
      (m.servingNote ? '<div class="meta">One serving: ' + esc(m.servingNote) + '</div>' : '') +

      '<div class="section"><h3>Macros per serving (estimate)</h3><div class="macros">' +
        '<div class="stat hi"><b>' + M.protein + 'g</b><span>protein</span></div>' +
        '<div class="stat"><b>' + M.carbs + 'g</b><span>carbs</span></div>' +
        '<div class="stat"><b>' + M.fat + 'g</b><span>fat</span></div>' +
        '<div class="stat"><b>' + M.fiber + 'g</b><span>fiber</span></div>' +
        '<div class="stat"><b>' + M.calories + '</b><span>cal</span></div></div></div>' +

      '<div class="section"><h3>Ingredients' + (m.servings > 1 ? ' (whole batch)' : '') + '</h3><ul class="ing">';
    m.ingredients.forEach(function (g) {
      html += '<li><span class="amt">' + (g.qty ? esc(fmtAmt(g.qty, g.unit)) : '&bull;') + '</span>' +
        '<span class="what">' + esc(g.item) + (g.note ? '<small>' + esc(g.note) + '</small>' : '') + '</span></li>';
    });
    html += '</ul></div><div class="section"><h3>Steps</h3><ol class="steps">';
    m.steps.forEach(function (s, i) { html += '<li><span class="n">' + (i + 1) + '</span><span>' + esc(s) + '</span></li>'; });
    html += '</ol></div>';
    if (m.notes) html += '<div class="section"><h3>Notes</h3><p class="note">' + esc(m.notes) + '</p></div>';
    html += '<button class="btn sticky" data-act="today-plus" data-id="' + esc(m.id) + '">' +
      (n ? 'Add another to Today (' + n + ' added)' : 'Add to Today') + '</button>' +
      '<p class="est">Macros from typical labels, costs from typical Aldi and Sam\'s Club prices. Estimates only.</p></div>';
    return { title: c ? c.name : "Meal", tab: "home", back: "#/cat/" + m.category, html: html };
  }

  function pickerHtml(counts, kind, sub) {
    var html = "";
    CATEGORIES.forEach(function (c) {
      var list = MEALS.filter(function (m) { return m.category === c.id; });
      if (!list.length) return;
      html += '<h3 class="group-h">' + esc(c.name) + '</h3><div class="rows">';
      list.forEach(function (m) {
        var n = counts[m.id] || 0;
        html += '<div class="row' + (n ? ' on' : '') + '"><span class="re">' + (m.emoji || '') + '</span><a class="txt" href="#/meal/' + m.id + '"><b>' + esc(m.name) + '</b><small>' + sub(m) + '</small></a>' +
          stepper(m.id, n, kind) + '</div>';
      });
      html += '</div>';
    });
    return html;
  }

  function screenToday() {
    var today = getToday(), t = totals(today.items);
    var html = '<div class="today-card" style="margin-bottom:0;padding-bottom:16px">' + barsHtml(t) +
      '<div class="mini">' +
        '<div class="stat"><b>' + t.calories + '</b><span>cal</span></div>' +
        '<div class="stat"><b>' + t.carbs + 'g</b><span>carbs</span></div>' +
        '<div class="stat"><b>' + t.fat + 'g</b><span>fat</span></div>' +
        '<div class="stat"><b>' + money(t.cost) + '</b><span>cost</span></div></div></div>';
    html += '<p class="hint">' + (t.count ? t.count + (t.count === 1 ? ' serving' : ' servings') + ' logged. ' : 'Nothing logged yet. ') + 'Tap + on what you eat. Resets each morning.</p>';
    html += pickerHtml(today.items, "today", function (m) {
      return m.macros.protein + 'g protein &middot; ' + m.macros.fiber + 'g fiber &middot; ' + m.macros.calories + ' cal';
    });
    if (t.count) html += '<div style="margin-top:20px"><button class="btn ghost" data-act="today-clear">Clear today</button></div>';
    html += '<p class="est">Totals are estimates.</p>';
    return { title: "Today", tab: "today", html: html };
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
    var html = '<p class="hint" style="margin-top:0">Tap + for each time you will make a meal this week. Batch recipes count as the whole batch.</p>';
    html += pickerHtml(plan, "plan", function (m) {
      return (m.servings > 1 ? 'makes ' + m.servings + ' &middot; ' : '') + money(m.cost * m.servings) + (m.servings > 1 ? ' a batch' : ' each');
    });

    html += '<h2 style="font-size:26px;font-weight:800;margin:30px 2px 0">Your list</h2>';
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
        '<div style="margin-top:16px"><button class="btn ghost" data-act="plan-clear">Clear week</button></div>';
    }
    return { title: "Grocery list", tab: "grocery", html: html };
  }

  // ---------- router ----------
  function render(keepScroll) {
    var hash = location.hash.replace(/^#\/?/, ""), parts = hash.split("/"), s;
    if (parts[0] === "cat") s = screenCat(parts[1]);
    else if (parts[0] === "meal") s = screenMeal(decodeURIComponent(parts[1] || ""));
    else if (parts[0] === "today") s = screenToday();
    else if (parts[0] === "grocery") s = screenGrocery();
    else s = screenHome();

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
    if (!el) return;
    var act = el.dataset.act, id = el.dataset.id, t, p, g;
    if (act === "today-plus" || act === "today-minus") {
      t = getToday(); bump(t.items, id, act === "today-plus" ? 1 : -1); setToday(t);
    } else if (act === "today-clear") {
      t = getToday(); t.items = {}; setToday(t);
    } else if (act === "plan-plus" || act === "plan-minus") {
      p = getPlan(); bump(p, id, act === "plan-plus" ? 1 : -1); setPlan(p);
    } else if (act === "plan-clear") {
      setPlan({}); setGot({});
    } else if (act === "got") {
      g = getGot(); if (g[id]) delete g[id]; else g[id] = true; setGot(g);
    } else return;
    if (act.indexOf("-plus") > 0 || act.indexOf("-minus") > 0) popId = id;
    e.preventDefault();
    render(true);
  });

  backBtn.addEventListener("click", function () { location.hash = backBtn.dataset.to || "#/"; });

  // ---------- theme: Auto -> Light -> Dark ----------
  var THEMES = ["auto", "light", "dark"];
  function applyTheme(t) {
    if (t === "auto") delete document.documentElement.dataset.theme; else document.documentElement.dataset.theme = t;
    themeBtn.textContent = t.charAt(0).toUpperCase() + t.slice(1);
  }
  var theme = "auto";
  try { theme = localStorage.getItem("meals-theme") || "auto"; } catch (e) {}
  if (THEMES.indexOf(theme) < 0) theme = "auto";
  applyTheme(theme);
  themeBtn.addEventListener("click", function () {
    theme = THEMES[(THEMES.indexOf(theme) + 1) % THEMES.length];
    try { localStorage.setItem("meals-theme", theme); } catch (e) {}
    applyTheme(theme);
  });

  window.addEventListener("hashchange", function () { render(false); });
  // Coming back to the app the next morning: refresh so Today resets.
  document.addEventListener("visibilitychange", function () { if (!document.hidden) render(true); });
  render(false);

  if ("serviceWorker" in navigator) {
    window.addEventListener("load", function () { navigator.serviceWorker.register("sw.js").catch(function () {}); });
  }
})();
