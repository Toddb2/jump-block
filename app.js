/* Jump Block app: Today, Gym logger, guided Mobility, Plan, Progress. All data stays on this device. */
(() => {
'use strict';
const P = window.PROGRAM;
const {EX, SESSIONS, PHASES, WEEKTYPES, ROUTINES, FUEL} = P;
const VERSION = '1.0.0';
const DAY = 864e5;
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const WD = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
const WDL = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const iso = P.iso, parseDate = P.parse;
const today = () => iso(new Date());
const ts = s => parseDate(s).getTime();
const addDays = (s, n) => { const d = parseDate(s); d.setDate(d.getDate() + n); return iso(d); };
const fmtDate = s => { const d = parseDate(s); return d.getDate() + ' ' + MONTHS[d.getMonth()]; };
const fmtDay = s => { const d = parseDate(s); return WD[d.getDay()] + ' ' + d.getDate() + ' ' + MONTHS[d.getMonth()]; };
const fmtDayLong = s => { const d = parseDate(s); return WDL[d.getDay()] + ' ' + d.getDate() + ' ' + MONTHS[d.getMonth()]; };
const num = v => { if (v === '' || v == null) return null; const n = Number(v); return Number.isFinite(n) ? n : null; };
const fmtN = n => n == null ? '' : String(Math.round(n * 100) / 100);
const r25 = x => Math.round(x / 2.5) * 2.5;
const clone = o => JSON.parse(JSON.stringify(o ?? null));
const fmtRest = s => s <= 90 ? s + ' s' : (s % 60 ? Math.floor(s / 60) + ' min ' + (s % 60) + ' s' : (s / 60) + ' min');
const plural = (n, w) => n + ' ' + w + (n === 1 ? '' : 's');
const clock = s =>Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0');

const ICON = {
  today:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3.5" y="5" width="17" height="15" rx="2.5"/><path d="M3.5 10h17M8 3v4M16 3v4"/><path d="M8.5 14.5l2.2 2.2 4.8-4.7"/></svg>',
  gym:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6.5 7v10M17.5 7v10M3.5 9.5v5M20.5 9.5v5M6.5 12h11"/></svg>',
  mobility:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="13.5" r="7"/><path d="M12 13.5V9.5M10 3h4M18.5 6.5l1.2-1.2"/></svg>',
  plan:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 20V13M9 20V9M14 20v-5M19 20V5M3 20.5h18"/></svg>',
  progress:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3.5 17l5.5-5.5 4 4 7.5-8"/><path d="M15 7.5h5.5V13"/></svg>',
  event:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="8"/><path d="M5.5 8.5c4 1.5 9 1.5 13 0M5.5 15.5c4-1.5 9-1.5 13 0M12 4c-2.5 3-2.5 13 0 16"/></svg>',
  check:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>'
};

/* ---------------- Store: everything in localStorage on this device ---------------- */
const KEY = 'jumpblock:v1';
const blank = () => ({v:1, sessions:{}, weighins:{}, mob:{}, days:{}, settings:{rm:{squat:255, trapbar:null}, weekOverride:{}}, created:Date.now()});
function loadDB(){
  try {
    const o = JSON.parse(localStorage.getItem(KEY));
    if (o && o.v === 1){
      const b = blank();
      return Object.assign(b, o, {settings:Object.assign(b.settings, o.settings || {}, {rm:Object.assign(b.settings.rm, (o.settings || {}).rm || {}), weekOverride:(o.settings || {}).weekOverride || {}})});
    }
  } catch (e) {}
  return blank();
}
let DB = loadDB();
let storageOK = true;
function save(){
  try { localStorage.setItem(KEY, JSON.stringify(DB)); if (!storageOK){ storageOK = true; } }
  catch (e){ if (storageOK) toast('Couldn’t save on this phone. Storage is full or blocked.'); storageOK = false; }
}
let saveT = null;
function saveSoon(){ clearTimeout(saveT); saveT = setTimeout(() => { saveT = null; save(); }, 250); }
function flush(){ if (saveT){ clearTimeout(saveT); saveT = null; save(); } }
try { navigator.storage && navigator.storage.persist && navigator.storage.persist(); } catch (e) {}
const ov = () => DB.settings.weekOverride;
const week = s => P.weekInfo(s, ov());
const sessionsList = () => Object.values(DB.sessions).sort((a, b) => a.date < b.date ? 1 : a.date > b.date ? -1 : (a.session < b.session ? 1 : -1));
const weighList = () => Object.entries(DB.weighins).map(([date, kg]) => ({date, kg})).filter(w => typeof w.kg === 'number').sort((a, b) => a.date < b.date ? -1 : 1);
const mobDone = (d, id) => !!(DB.mob[d] && DB.mob[d][id]);
const exName = (id, ent) => (EX[id] && EX[id].name) || (ent && ent.name) || id;

/* ---------------- Toast ---------------- */
let toastT = null;
function toast(msg, action, fn, ms = 4500){
  const el = $('#toast');
  el.innerHTML = `<span>${esc(msg)}</span>${action ? `<button type="button">${esc(action)}</button>` : ''}`;
  el.hidden = false;
  if (action) el.querySelector('button').onclick = () => { el.hidden = true; fn && fn(); };
  clearTimeout(toastT); toastT = setTimeout(() => { el.hidden = true; }, action ? 12000 : ms);
}

/* ---------------- Navigation ---------------- */
const VIEWS = ['today','gym','mobility','plan','progress'];
let view = 'today';
function show(v, opts = {}){
  flush();
  view = v;
  VIEWS.forEach(k => { $('#v-' + k).hidden = k !== v; });
  $$('.nav button').forEach(b => { if (b.dataset.v === v) b.setAttribute('aria-current', 'page'); else b.removeAttribute('aria-current'); });
  render(v);
  if (!opts.keepScroll) window.scrollTo(0, 0);
  try { history.replaceState(null, '', '#' + v); } catch (e) {}
}
function render(v){ ({today:renderToday, gym:renderGym, mobility:renderMobility, plan:renderPlan, progress:renderProgress})[v](); }
function buildNav(){
  $('#nav').innerHTML = `<div class="in">${[['today','Today'],['gym','Gym'],['mobility','Mobility'],['plan','Plan'],['progress','Progress']].map(([k, l]) => `<button type="button" data-v="${k}">${ICON[k]}<span>${l}</span></button>`).join('')}</div>`;
  $('#nav').addEventListener('click', ev => { const b = ev.target.closest('[data-v]'); if (b) show(b.dataset.v); });
}

/* ---------------- Shared bits ---------------- */
function toneChip(w){ const t = WEEKTYPES[w.type]; return `<span class="tone ${t.tone}">${esc(t.name)}</span>`; }
function weekCard(w, extra = ''){
  const t = WEEKTYPES[w.type];
  return `<section class="card"><div class="row">${toneChip(w)}<span class="meta">${esc(w.label)}${w.overridden ? ' · changed by you' : ''}</span></div><p class="weeknote">${esc(t.note)}</p>${extra}</section>`;
}
function rolling(list){
  return list.map(w => { const t = ts(w.date); const win = list.filter(x => ts(x.date) <= t && ts(x.date) > t - 7 * DAY); return {t, y:win.reduce((a, b) => a + b.kg, 0) / win.length}; });
}
function slopePerWeek(list){
  if (list.length < 3) return null;
  const last = ts(list[list.length - 1].date); const win = list.filter(w => ts(w.date) >= last - 28 * DAY);
  if (win.length < 3 || ts(win[win.length - 1].date) - ts(win[0].date) < 7 * DAY) return null;
  const xs = win.map(w => ts(w.date) / DAY), ys = win.map(w => w.kg);
  const mx = xs.reduce((a, b) => a + b) / xs.length, my = ys.reduce((a, b) => a + b) / ys.length;
  let n = 0, d = 0; xs.forEach((x, i) => { n += (x - mx) * (ys[i] - my); d += (x - mx) ** 2; });
  return d ? n / d * 7 : null;
}
function sessionProgress(date, k){
  const prog = P.program(k, date, ov());
  const total = prog.list.reduce((a, e) => a + e.sets, 0);
  const doc = DB.sessions[date + '_' + k];
  let done = 0;
  if (doc) for (const e of prog.list){ const ent = doc.entries && doc.entries[e.id]; if (ent) done += (ent.sets || []).filter(r => r.done).length; }
  return {prog, total, done, logged:!!doc};
}

/* ---------------- Today ---------------- */
function renderToday(){
  const d = today(); const w = week(d);
  const dp = P.dayPlan(d, (DB.days[d] || {}).choice);
  const fuel = FUEL[dp.fuel];
  const wl = weighList(); const todayW = DB.weighins[d];
  const roll = wl.length ? rolling(wl) : []; const avg = roll.length ? roll[roll.length - 1].y : null;
  const tmr = addDays(d, 1); const tp = P.dayPlan(tmr, (DB.days[tmr] || {}).choice);
  const tgym = tp.items.find(i => i.gym);
  const items = dp.items.map(it => {
    if (it.gym){
      const sp = sessionProgress(d, it.gym); const s = SESSIONS[it.gym];
      if (!sp.prog.list.length) return `<div class="item ev"><span class="ic">${ICON.gym}</span><div class="tx"><div class="tt">${esc(s.label)}</div><div class="ts">${esc(sp.prog.notes[0] || 'Skipped this week')}</div></div></div>`;
      const done = sp.total && sp.done >= sp.total;
      return `<div class="item${done ? ' done' : ''}"><span class="ic">${done ? ICON.check : ICON.gym}</span><div class="tx"><div class="tt">${esc(s.label)} · ${esc(s.title)}</div><div class="ts">${sp.prog.list.length} exercises · ${s.mins}${sp.logged ? ` · ${sp.done}/${sp.total} sets done` : ''}</div></div><button type="button" class="btn primary" data-gym="${it.gym}">${sp.logged ? 'Continue' : 'Start'}</button></div>`;
    }
    if (it.mob){
      const r = ROUTINES[it.mob]; const done = mobDone(d, it.mob);
      return `<div class="item${done ? ' done' : ''}"><span class="ic">${done ? ICON.check : ICON.mobility}</span><div class="tx"><div class="tt">${esc(r.name)}</div><div class="ts">${r.mins} min${it.note ? ' · ' + esc(it.note) : ''}${done ? ' · done' : ''}</div></div><button type="button" class="btn${done ? '' : ' primary'}" data-play="${it.mob}">${done ? 'Again' : 'Start'}</button></div>`;
    }
    return `<div class="item ev"><span class="ic">${ICON.event}</span><div class="tx"><div class="tt">${esc(it.event)}</div>${it.time ? `<div class="ts">${esc(it.time)}</div>` : ''}</div></div>`;
  }).join('');
  $('#v-today').innerHTML = `
    <div class="head"><div><div class="eyebrow">${fmtDayLong(d)}</div><h1 class="h1">${esc(dp.title)}</h1></div></div>
    <div class="stack">
      ${weekCard(w)}
      ${dp.choices ? `<div class="field"><span>Today I'm doing</span><div class="seg" role="group" aria-label="Today's plan">${Object.entries(dp.choices).map(([k, c]) => `<button type="button" data-choice="${k}" aria-pressed="${k === dp.choice}">${esc(c.label)}</button>`).join('')}</div></div>` : ''}
      <section class="card stack" style="gap:16px">${items}</section>
      <section class="card">
        <div class="row"><h2 class="h3">Morning weigh-in</h2><span class="spacer"></span>${avg != null ? `<span class="meta">7-day avg ${avg.toFixed(1)} kg</span>` : ''}</div>
        <form class="row end" id="t-wform" style="margin-top:10px">
          <label class="field" style="flex:1"><span>Weight (kg)</span><input class="input" id="t-kg" type="number" inputmode="decimal" step="0.1" min="30" max="200" value="${todayW != null ? fmtN(todayW) : ''}" placeholder="${wl.length ? fmtN(wl[wl.length - 1].kg) : '93.0'}"></label>
          <button class="btn primary" type="submit" style="height:44px">${todayW != null ? 'Update' : 'Save'}</button>
        </form>
        <p class="sub">${todayW != null ? 'Logged today.' : 'Same time each morning, 3–4 times a week.'}</p>
      </section>
      <section class="card">
        <div class="row"><h2 class="h3">Fuel · ${esc(fuel.label)}</h2></div>
        <div class="fuel"><div><span>Calories</span><b>${fuel.kcal}</b></div><div><span>Protein</span><b>${fuel.p}</b></div><div><span>Carbs</span><b>${fuel.c}</b></div><div><span>Fat</span><b>${fuel.f}</b></div></div>
        ${dp.fuelNote ? `<p class="sub">${esc(dp.fuelNote)}</p>` : ''}
      </section>
      <p class="meta">Tomorrow: ${esc(tp.title)}${tgym ? ' · ' + esc(SESSIONS[tgym.gym].label) : ''}</p>
    </div>`;
}
$('#v-today').addEventListener('click', ev => {
  const c = ev.target.closest('[data-choice]');
  if (c){ DB.days[today()] = {choice:c.dataset.choice}; saveSoon(); renderToday(); return; }
  const g = ev.target.closest('[data-gym]');
  if (g){ openGym(today(), g.dataset.gym); return; }
  const p = ev.target.closest('[data-play]');
  if (p) openPlayer(p.dataset.play);
});
$('#v-today').addEventListener('submit', ev => {
  if (ev.target.id !== 't-wform') return; ev.preventDefault();
  const kg = num($('#t-kg').value);
  if (kg == null || kg < 30 || kg > 200){ toast('Enter a weight between 30 and 200 kg.'); return; }
  DB.weighins[today()] = Math.round(kg * 10) / 10; save(); renderToday(); toast('Saved ' + fmtN(kg) + ' kg.');
});

/* ---------------- Gym logger ---------------- */
const FIELD = {
  kg:{label:'kg', step:'0.5', mode:'decimal'}, reps:{label:'Reps', step:'1', mode:'numeric'}, ms:{label:'m/s', step:'0.01', mode:'decimal'},
  cm:{label:'cm', step:'0.5', mode:'decimal'}, min:{label:'Min', step:'1', mode:'numeric'}, sec:{label:'Sec', step:'1', mode:'numeric'}
};
const L = {date:today(), session:null, data:null, prog:null};
const sid = () => L.date + '_' + L.session;
const blankRow = () => ({kg:'', reps:'', ms:'', cm:'', min:'', sec:'', done:false});
function loadLog(date, session){
  L.date = date; L.session = session;
  const doc = DB.sessions[sid()] ? clone(DB.sessions[sid()]) : {};
  L.data = {cmj:[0, 1, 2].map(i => doc.cmj && doc.cmj[i] != null ? String(doc.cmj[i]) : ''), notes:doc.notes || '', entries:{}};
  for (const [id, ent] of Object.entries(doc.entries || {})){
    L.data.entries[id] = {name:ent.name, sets:(ent.sets || []).map(r => { const o = blankRow(); for (const k of Object.keys(FIELD)) if (r[k] != null) o[k] = String(r[k]); o.done = !!r.done; return o; })};
  }
}
function ensureEntries(){ for (const e of L.prog.list) if (!L.data.entries[e.id]) L.data.entries[e.id] = {name:e.name, sets:Array.from({length:e.sets}, blankRow)}; }
function commit(){
  const entries = {};
  for (const [id, ent] of Object.entries(L.data.entries)){
    const sets = ent.sets.map(r => { const o = {done:!!r.done}; for (const k of Object.keys(FIELD)){ const n = num(r[k]); if (n != null) o[k] = n; } return o; });
    if (sets.some(r => r.done || Object.keys(r).length > 1)) entries[id] = {name:ent.name || exName(id), sets};
  }
  const body = {date:L.date, session:L.session, phase:L.prog.week.phase, weekType:L.prog.week.type, cmj:L.data.cmj.map(num), notes:L.data.notes.trim(), entries, updatedAt:Date.now()};
  const any = Object.keys(entries).length || body.notes || body.cmj.some(v => v != null);
  if (any) DB.sessions[sid()] = body; else delete DB.sessions[sid()];
  saveSoon();
}
function lastFor(exId){
  const id = sid();
  const all = Object.values(DB.sessions).filter(s => s.date + '_' + s.session !== id && s.entries && s.entries[exId]);
  const prior = all.filter(s => s.date <= L.date); const pool = prior.length ? prior : all;
  if (!pool.length) return null;
  pool.sort((a, b) => a.date < b.date ? 1 : -1);
  return {date:pool[0].date, ent:pool[0].entries[exId]};
}
function bestKg(exId){
  const id = sid(); let best = null;
  for (const s of Object.values(DB.sessions)){
    if (s.date + '_' + s.session === id || !s.entries || !s.entries[exId]) continue;
    for (const r of s.entries[exId].sets || []) if (r.kg != null && (r.reps == null || r.reps > 0)) best = best == null ? r.kg : Math.max(best, r.kg);
  }
  return best;
}
function suggest(e){
  if (!e.pct || !e.of) return null;
  const rm = num(DB.settings.rm[e.of]); if (!rm) return null;
  return [r25(rm * e.pct[0] / 100), r25(rm * e.pct[1] / 100)];
}
function setsText(fields, ent){
  const f = fields || ['kg','reps'];
  return (ent.sets || []).map(r => {
    if (r.kg != null && r.reps != null) return fmtN(r.kg) + '×' + fmtN(r.reps) + (r.ms != null ? ' @' + fmtN(r.ms) : '');
    if (r.cm != null) return fmtN(r.cm) + ' cm' + (r.reps != null ? ' ×' + fmtN(r.reps) : '');
    if (r.min != null) return fmtN(r.min) + ' min';
    if (r.sec != null) return fmtN(r.sec) + ' s';
    if (r.reps != null) return fmtN(r.reps) + (f.includes('kg') ? ' reps' : '');
    if (r.kg != null) return fmtN(r.kg) + ' kg';
    return r.done ? '✓' : null;
  }).filter(Boolean).join(', ');
}
function rowHTML(e, row, i, last){
  const lastRow = last && last.ent.sets && (last.ent.sets[i] || last.ent.sets[last.ent.sets.length - 1]);
  const sug = suggest(e);
  const inputs = e.fields.map(f => {
    let ph = '';
    if (lastRow && lastRow[f] != null) ph = fmtN(lastRow[f]);
    else if (f === 'kg' && sug) ph = fmtN(sug[0]);
    else if (f === 'reps' || f === 'min' || f === 'sec') ph = String(e.target);
    return `<input id="in-${e.id}-${i}-${f}" data-f="${f}" type="number" inputmode="${FIELD[f].mode}" step="${FIELD[f].step}" min="0" placeholder="${esc(ph)}" value="${esc(row[f])}" aria-label="${esc(e.name)} set ${i + 1} ${FIELD[f].label}">`;
  }).join('');
  return `<div class="set${row.done ? ' is-done' : ''}" data-ex="${e.id}" data-i="${i}"><span class="set-n">${i + 1}</span>${inputs}<label class="tick"><input id="in-${e.id}-${i}-done" data-f="done" type="checkbox"${row.done ? ' checked' : ''}><span class="box" aria-hidden="true"></span><span class="sr">Set ${i + 1} done</span></label></div>`;
}
const lastHTML = (e, last) => last ? `<b>Last</b> ${esc(setsText(e.fields, last.ent) || 'logged')} · ${fmtDate(last.date)}` : 'No previous log yet.';
function modChip(e, w){
  if (w.type === 'deload' || w.type === 'taper' || (w.type === 'test' && !e.test && L.session !== 'A')) return '<span class="chip mod">Half sets</span>';
  if (w.type === 'test' && e.test) return '<span class="chip mod">Test</span>';
  if (w.type === 'heavy' && e.main && e.pct) return '<span class="chip mod">Heavy +2.5%</span>';
  if (w.type === 'peak' && e.main && e.pct) return '<span class="chip mod">Peak +5%</span>';
  return '';
}
function cardHTML(e){
  const ent = L.data.entries[e.id]; const last = lastFor(e.id); const sug = suggest(e); const w = L.prog.week;
  let loadChip = '';
  if (e.pct){
    const p = e.pct[0] === e.pct[1] ? fmtN(e.pct[0]) + '%' : fmtN(e.pct[0]) + '–' + fmtN(e.pct[1]) + '%';
    loadChip = `<span class="chip">${p} of 1RM${sug ? ' ≈ ' + (sug[0] === sug[1] ? fmtN(sug[0]) : fmtN(sug[0]) + '–' + fmtN(sug[1])) + ' kg' : ''}</span>`;
  } else if (e.load) loadChip = `<span class="chip">${esc(e.load)}</span>`;
  const q = encodeURIComponent(e.name.replace(/\s*\(.*?\)/g, '').replace(/,.*$/, '') + ' exercise');
  return `<article class="card" id="card-${e.id}">
    <header class="ex-h"><span class="tag">${esc(e.tag)}</span>
      <div class="ex-t"><h3>${esc(e.name)}</h3>
        <div class="chips"><span class="chip strong">${e.sets} × ${esc(e.reps)}</span>${loadChip}${e.rest ? `<span class="chip">Rest ${fmtRest(e.rest)}</span>` : ''}${modChip(e, w)}<span class="chip best" id="best-${e.id}" hidden>New best</span></div>
      </div>
      <a class="demo" href="https://www.youtube.com/results?search_query=${q}" target="_blank" rel="noopener">Demo ↗</a>
    </header>
    ${e.cue ? `<p class="cue">${esc(e.cue)}</p>` : ''}
    <p class="last" id="last-${e.id}">${lastHTML(e, last)}</p>
    <div class="sets" style="--n:${e.fields.length}">
      <div class="set set-h" aria-hidden="true"><span>Set</span>${e.fields.map(f => `<span>${FIELD[f].label}</span>`).join('')}<span>Done</span></div>
      ${ent.sets.map((r, i) => rowHTML(e, r, i, last)).join('')}
    </div>
    <div class="ex-actions">
      <button type="button" class="btn" data-act="add" data-ex="${e.id}">+ Set</button>
      <button type="button" class="btn quiet" data-act="del" data-ex="${e.id}"${ent.sets.length ? '' : ' disabled'}>Remove set</button>
      <button type="button" class="btn quiet" data-act="last" data-ex="${e.id}"${last ? '' : ' disabled'}>Copy last session</button>
    </div>
  </article>`;
}
function weekStripHTML(){
  const mon = P.mondayOf(L.date); const t = today();
  const logged = new Set(Object.values(DB.sessions).map(s => s.date));
  const labels = ['Gym A','Volleyball','Volleyball','Gym B','VB or C','Games or D','Games'];
  return `<div class="week">${labels.map((what, i) => { const ds = addDays(mon, i); const dd = parseDate(ds);
    return `<button type="button" class="day${i === 0 || i === 3 ? ' gym' : ''}${ds === t ? ' today' : ''}" data-day="${ds}" aria-pressed="${ds === L.date}" aria-label="${fmtDay(ds)}, ${what}"><span class="dn">${WD[dd.getDay()]}</span><span class="dd">${dd.getDate()}</span><span class="dw">${what}</span>${logged.has(ds) ? '<span class="dot"></span>' : ''}</button>`; }).join('')}</div>`;
}
function renderGym(){
  if (!L.session){ const dp = P.dayPlan(L.date, (DB.days[L.date] || {}).choice); const g = dp.items.find(i => i.gym); L.session = g ? g.gym : P.defaultSession(L.date); }
  if (!L.data || (L.data && !L.date)) loadLog(L.date || today(), L.session);
  L.prog = P.program(L.session, L.date, ov()); ensureEntries();
  const s = SESSIONS[L.session]; const w = L.prog.week; const ph = PHASES[w.phase];
  const notes = [`<b>${esc(ph.name)}</b> · ${esc(WEEKTYPES[w.type].name)}`].concat(L.prog.notes.map(esc));
  $('#v-gym').innerHTML = `
    <div class="head"><div><div class="eyebrow">${fmtDayLong(L.date)}</div><h1 class="h1">Gym</h1></div>${toneChip(w)}</div>
    <div class="datenav"><button type="button" class="btn" data-nav="-1" aria-label="Previous day">‹</button><input class="input" type="date" id="g-date" value="${L.date}" aria-label="Date"><button type="button" class="btn" data-nav="1" aria-label="Next day">›</button>${L.date !== today() ? '<button type="button" class="btn" data-nav="0">Today</button>' : ''}</div>
    ${weekStripHTML()}
    <div class="seg big" role="group" aria-label="Session" style="margin-bottom:14px">${Object.keys(SESSIONS).map(k => `<button type="button" data-sess="${k}" aria-pressed="${k === L.session}">${k}</button>`).join('')}</div>
    <div class="stack">
      <div><h2 class="h2">${esc(s.label)} · ${esc(s.title)}</h2><p class="meta" style="margin:4px 0 0">${s.mins} · ${esc(w.label)}</p></div>
      <p class="note">${notes.join('. ')}</p>
      ${s.warmup && L.prog.list.length ? `<button type="button" class="btn block lg" data-play="gymwarm">${mobDone(L.date, 'gymwarm') ? ICON.check.replace('<svg', '<svg width="18" height="18" style="vertical-align:-3px;margin-right:6px"') + 'Warm-up done · run again' : 'Start the 12-min warm-up'}</button>` : ''}
      ${!L.prog.list.length ? `<div class="empty"><b>Nothing to log</b>${esc(L.prog.notes.join(' ') || 'This session is off this week.')}</div>` : ''}
      ${s.cmj && L.prog.list.length && w.type !== 'test' ? `<section class="card"><h3 class="h3">Readiness check</h3><p class="sub">3 CMJs, hands on hips, after the warm-up. More than about 5% below your usual means go lighter today.</p>
        <div class="cmj">${[0, 1, 2].map(i => `<label class="field"><span>Jump ${i + 1} (cm)</span><input id="cmj-${i}" data-cmj="${i}" type="number" inputmode="decimal" step="0.1" min="0" value="${esc(L.data.cmj[i])}"></label>`).join('')}</div></section>` : ''}
      ${L.prog.list.map(cardHTML).join('')}
      ${L.prog.list.length ? `<section class="card"><label class="field"><span>Session notes</span><textarea class="input" id="g-notes" placeholder="How it felt, any pain or tightness, sleep">${esc(L.data.notes)}</textarea></label></section>` : ''}
    </div>`;
  L.prog.list.forEach(e => updateBest(e.id));
}
function updateBest(exId){
  const chip = $('#best-' + exId); if (!chip) return;
  const best = bestKg(exId); const ent = L.data.entries[exId];
  const top = Math.max(...ent.sets.map(r => num(r.kg) ?? -Infinity));
  chip.hidden = !(best != null && top > best);
}
function rerenderCard(exId){ const e = L.prog.list.find(x => x.id === exId); const el = $('#card-' + exId); if (e && el){ el.outerHTML = cardHTML(e); updateBest(exId); } }
function openGym(date, session){ flush(); loadLog(date, session); show('gym'); }
const gymView = $('#v-gym');
gymView.addEventListener('input', ev => {
  const t = ev.target;
  if (t.dataset.f && t.dataset.f !== 'done'){ const row = t.closest('.set'); const ex = row.dataset.ex, i = +row.dataset.i; L.data.entries[ex].sets[i][t.dataset.f] = t.value; commit(); updateBest(ex); return; }
  if (t.dataset.cmj != null){ L.data.cmj[+t.dataset.cmj] = t.value; commit(); return; }
  if (t.id === 'g-notes'){ L.data.notes = t.value; commit(); }
});
gymView.addEventListener('change', ev => {
  const t = ev.target;
  if (t.dataset.f === 'done'){
    const row = t.closest('.set'); const ex = row.dataset.ex, i = +row.dataset.i;
    L.data.entries[ex].sets[i].done = t.checked; row.classList.toggle('is-done', t.checked); commit();
    const e = L.prog.list.find(x => x.id === ex);
    if (t.checked && e && e.rest) startRest(e.rest, e.name);
    return;
  }
  if (t.id === 'g-date' && t.value) openGym(t.value, P.defaultSession(t.value));
});
gymView.addEventListener('click', ev => {
  const nav = ev.target.closest('[data-nav]');
  if (nav){ const n = +nav.dataset.nav; const d = n === 0 ? today() : addDays(L.date, n); openGym(d, gymSessionFor(d)); return; }
  const day = ev.target.closest('[data-day]'); if (day){ openGym(day.dataset.day, gymSessionFor(day.dataset.day)); return; }
  const sb = ev.target.closest('[data-sess]'); if (sb){ openGym(L.date, sb.dataset.sess); return; }
  const pl = ev.target.closest('[data-play]'); if (pl){ openPlayer(pl.dataset.play, L.date); return; }
  const b = ev.target.closest('[data-act]'); if (!b) return;
  const ex = b.dataset.ex, ent = L.data.entries[ex];
  if (b.dataset.act === 'add'){
    const prev = ent.sets[ent.sets.length - 1]; const r = blankRow(); if (prev) for (const k of ['kg','ms','cm']) r[k] = prev[k];
    ent.sets.push(r); commit(); rerenderCard(ex);
  } else if (b.dataset.act === 'del'){ if (ent.sets.length){ ent.sets.pop(); commit(); rerenderCard(ex); } }
  else if (b.dataset.act === 'last'){
    const last = lastFor(ex); if (!last) return;
    ent.sets = (last.ent.sets || []).map(r => { const o = blankRow(); for (const k of Object.keys(FIELD)) if (r[k] != null) o[k] = String(r[k]); return o; });
    if (!ent.sets.length) ent.sets.push(blankRow()); commit(); rerenderCard(ex);
  }
});
function gymSessionFor(d){ const dp = P.dayPlan(d, (DB.days[d] || {}).choice); const g = dp.items.find(i => i.gym); return g ? g.gym : P.defaultSession(d); }

/* ---------------- Audio, vibration, wake lock ---------------- */
let AC = null;
function audioInit(){ try { AC = AC || new (window.AudioContext || window.webkitAudioContext)(); if (AC.state === 'suspended') AC.resume(); } catch (e) {} }
function tone(freq = 880, dur = 0.18, vol = 0.22){
  try { const a = AC; if (!a) return; const o = a.createOscillator(), g = a.createGain(); o.frequency.value = freq;
    g.gain.setValueAtTime(0.0001, a.currentTime); g.gain.exponentialRampToValueAtTime(vol, a.currentTime + 0.015); g.gain.exponentialRampToValueAtTime(0.0001, a.currentTime + dur);
    o.connect(g).connect(a.destination); o.start(); o.stop(a.currentTime + dur + 0.02); } catch (e) {}
}
const buzz = p => { try { navigator.vibrate && navigator.vibrate(p); } catch (e) {} };
let wake = null;
async function wakeOn(){
  try { if ('wakeLock' in navigator){ wake = await navigator.wakeLock.request('screen'); wake.addEventListener('release', () => { wake = null; }); } }
  catch (e) { wake = null; }
}
function wakeOff(){ try { wake && wake.release(); } catch (e) {} wake = null; }

/* ---------------- Rest timer (gym) ---------------- */
const RT = {end:0, t:null, label:''};
function startRest(sec, label){
  audioInit(); RT.end = Date.now() + sec * 1000; RT.label = label;
  $('#timer').hidden = false; $('#timer').classList.remove('go'); $('#timer-k').textContent = 'Rest · ' + label; restTick();
}
function restTick(){
  clearTimeout(RT.t);
  const left = Math.max(0, Math.round((RT.end - Date.now()) / 1000));
  $('#timer-v').textContent = clock(left);
  if (left <= 0){ $('#timer').classList.add('go'); $('#timer-k').textContent = 'Next set · ' + RT.label; $('#timer-v').textContent = 'Go'; tone(880, .5); buzz([200, 100, 200]); RT.t = setTimeout(() => { $('#timer').hidden = true; }, 6000); return; }
  if (left <= 3) tone(660, .08, .15);
  RT.t = setTimeout(restTick, 1000 - (Date.now() % 1000) + 10);
}
$('#timer-add').addEventListener('click', () => { RT.end = Math.max(RT.end, Date.now()) + 15000; $('#timer').classList.remove('go'); $('#timer-k').textContent = 'Rest · ' + RT.label; restTick(); });
$('#timer-skip').addEventListener('click', () => { clearTimeout(RT.t); $('#timer').hidden = true; });

/* ---------------- Guided routine player ---------------- */
const PL = {id:null, r:null, steps:[], i:0, mode:'idle', end:0, left:0, dur:0, paused:false, iv:null, date:null, lastBeep:-1};
const PREP = 5, SET_REST = 10;
function expand(r){
  const out = [];
  r.items.forEach((it, idx) => { const sets = it.sets || 1, sides = it.sides || 1;
    for (let s = 0; s < sets; s++) for (let sd = 0; sd < sides; sd++) out.push({it, idx, set:s, sets, side:sd, sides}); });
  return out;
}
const sideName = st => st.sides > 1 ? ((st.it.sideNames || ['Left side','Right side'])[st.side]) : '';
const setName = st => (st.it.setNames && st.it.setNames[st.set]) || (st.sets > 1 ? `Set ${st.set + 1} of ${st.sets}` : '');
const timed = st => st.it.kind === 'hold' || st.it.kind === 'time';
function doseText(it){
  const sets = it.sets || 1, side = (it.sides || 1) > 1 ? ' each side' : '';
  if (it.kind === 'time') return it.sec % 60 ? clock(it.sec) + ' min' : (it.sec / 60) + ' min';
  if (it.kind === 'hold') return (sets > 1 ? sets + ' × ' : '') + it.sec + ' s' + side;
  return (sets > 1 ? sets + ' × ' : '') + it.reps + side;
}
function openPlayer(id, date){
  flush(); audioInit(); wakeOn();
  PL.id = id; PL.r = ROUTINES[id]; PL.steps = expand(PL.r); PL.i = 0; PL.paused = false; PL.date = date || today();
  const el = $('#player'); el.hidden = false; document.body.style.overflow = 'hidden';
  el.innerHTML = `
    <div class="ptop"><button type="button" class="btn quiet" id="p-close" aria-label="Close routine">✕</button><div class="pbar"><i id="p-bar"></i></div><span class="meta" id="p-count"></span></div>
    <div class="pbody" id="p-body"></div>
    <div class="pctl" id="p-ctl"></div>`;
  $('#p-close').onclick = closePlayer;
  startStep(0, true);
  clearInterval(PL.iv); PL.iv = setInterval(playerTick, 200);
}
function closePlayer(){
  clearInterval(PL.iv); PL.iv = null; wakeOff();
  $('#player').hidden = true; $('#player').innerHTML = ''; document.body.style.overflow = '';
  PL.mode = 'idle'; render(view);
}
function startStep(i, first){
  PL.i = i; const st = PL.steps[i]; const prev = PL.steps[i - 1];
  PL.lastBeep = -1; PL.paused = false;
  if (timed(st)){
    const sameItem = prev && prev.idx === st.idx;
    const prep = first ? PREP : sameItem ? (st.side > 0 ? PREP : SET_REST) : PREP;
    PL.mode = 'prep'; PL.dur = prep; PL.end = Date.now() + prep * 1000;
    PL.prepLabel = first ? 'Get ready' : sameItem ? (st.side > 0 ? 'Switch sides' : 'Rest') : 'Next up';
  } else { PL.mode = 'reps'; }
  drawStep();
}
function ringHTML(){
  const C = 2 * Math.PI * 45;
  return `<div class="ring"><svg viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="50" r="45" fill="none" stroke="var(--surface-2)" stroke-width="7"/><circle class="fg" id="p-ring" cx="50" cy="50" r="45" fill="none" stroke="var(--accent)" stroke-width="7" stroke-linecap="round" stroke-dasharray="${C.toFixed(2)}" stroke-dashoffset="0"/></svg><div class="rt"><div><span id="p-time">0:00</span><small id="p-tlabel"></small></div></div></div>`;
}
function drawStep(){
  const st = PL.steps[PL.i]; const n = PL.steps.length; const nx = PL.steps[PL.i + 1];
  $('#p-bar').style.width = (PL.i / n * 100) + '%';
  $('#p-count').textContent = (st.idx + 1) + '/' + PL.r.items.length;
  $('#player').classList.toggle('prep', PL.mode === 'prep');
  const side = sideName(st), set = setName(st);
  const nextTxt = nx ? (nx.idx === st.idx ? (sideName(nx) || setName(nx) || 'Next set') : 'Next: ' + nx.it.name) : 'Last one';
  $('#p-body').innerHTML = `
    <div class="pstep">${esc(PL.r.name)}</div>
    <h2 class="pname" id="p-name">${esc(st.it.name)}</h2>
    ${side || set ? `<div class="row" style="justify-content:center">${side ? `<span class="pside">${esc(side)}</span>` : ''}${set ? `<span class="meta">${esc(set)}</span>` : ''}</div>` : ''}
    ${PL.mode === 'reps' ? `<div class="reps">${st.it.reps}<small>reps${st.sides > 1 ? ' this side' : ''}</small></div>` : ringHTML()}
    ${st.it.cue ? `<p class="pcue">${esc(st.it.cue)}</p>` : ''}
    <p class="pnext">${esc(nextTxt)}</p>`;
  $('#p-ctl').innerHTML = PL.mode === 'reps'
    ? `<button type="button" class="btn lg" id="p-back"${PL.i ? '' : ' disabled'}>Back</button><button type="button" class="btn primary lg" id="p-done">Done</button><button type="button" class="btn lg" id="p-skip">Skip</button>`
    : `<button type="button" class="btn lg" id="p-back"${PL.i ? '' : ' disabled'}>Back</button><button type="button" class="btn primary lg" id="p-pause">${PL.paused ? 'Resume' : 'Pause'}</button><button type="button" class="btn lg" id="p-skip">Skip</button>`;
  $('#p-back').onclick = () => startStep(Math.max(0, PL.i - 1));
  $('#p-skip').onclick = nextStep;
  if ($('#p-done')) $('#p-done').onclick = () => { tone(990, .12); nextStep(); };
  if ($('#p-pause')) $('#p-pause').onclick = togglePause;
  playerTick();
}
function togglePause(){
  if (PL.paused){ PL.end = Date.now() + PL.left; PL.paused = false; }
  else { PL.left = Math.max(0, PL.end - Date.now()); PL.paused = true; }
  const b = $('#p-pause'); if (b) b.textContent = PL.paused ? 'Resume' : 'Pause';
}
function playerTick(){
  if (PL.mode !== 'prep' && PL.mode !== 'run') return;
  const msLeft = PL.paused ? PL.left : Math.max(0, PL.end - Date.now());
  const sLeft = Math.ceil(msLeft / 1000);
  const t = $('#p-time'), ring = $('#p-ring'), lbl = $('#p-tlabel');
  if (t) t.textContent = clock(sLeft);
  if (lbl) lbl.textContent = PL.mode === 'prep' ? PL.prepLabel : (PL.paused ? 'Paused' : 'Hold');
  if (ring){ const C = 2 * Math.PI * 45; ring.setAttribute('stroke-dashoffset', (C * (1 - msLeft / (PL.dur * 1000))).toFixed(2)); }
  if (PL.paused) return;
  if (sLeft <= 3 && sLeft > 0 && PL.lastBeep !== sLeft){ PL.lastBeep = sLeft; tone(PL.mode === 'prep' ? 520 : 660, .08, .14); }
  if (msLeft <= 0){
    if (PL.mode === 'prep'){
      const st = PL.steps[PL.i]; PL.mode = 'run'; PL.dur = st.it.sec; PL.end = Date.now() + st.it.sec * 1000; PL.lastBeep = -1;
      tone(880, .25); buzz(120); $('#player').classList.remove('prep');
    } else { tone(990, .45); buzz([150, 80, 150]); nextStep(); }
  }
}
function nextStep(){ if (PL.i + 1 < PL.steps.length) startStep(PL.i + 1); else finishRoutine(); }
function finishRoutine(){
  PL.mode = 'done';
  DB.mob[PL.date] = Object.assign({}, DB.mob[PL.date], {[PL.id]:Date.now()}); save();
  $('#p-bar').style.width = '100%'; $('#player').classList.remove('prep');
  $('#p-body').innerHTML = `<div class="pstep">${esc(PL.r.name)}</div><h2 class="pname">Done</h2><p class="pcue">${PL.id === 'gymwarm' ? 'Log your three readiness CMJs at the top of the session, then start.' : 'Ticked off for ' + esc(fmtDayLong(PL.date)) + '.'}</p>`;
  $('#p-ctl').innerHTML = `<span></span><button type="button" class="btn primary lg" id="p-fin">Close</button><span></span>`;
  $('#p-fin').onclick = closePlayer;
  tone(660, .15); setTimeout(() => tone(990, .3), 170); buzz([100, 60, 100, 60, 200]);
}

/* ---------------- Mobility ---------------- */
function renderMobility(){
  const d = today(); const mon = P.mondayOf(d);
  const days = Array.from({length:7}, (_, i) => addDays(mon, i));
  const doneDays = days.filter(x => mobDone(x, 'daily')).length;
  const dp = P.dayPlan(d, (DB.days[d] || {}).choice);
  const todays = dp.items.filter(i => i.mob).map(i => i.mob);
  const order = ['daily','activation','extended','gymwarm','gameday','primer'];
  $('#v-mobility').innerHTML = `
    <div class="head"><div><div class="eyebrow">Stretching, rolling and band work</div><h1 class="h1">Mobility</h1></div></div>
    <div class="stack">
      <section class="card"><div class="row"><h2 class="h3">Daily routine this week</h2><span class="spacer"></span><span class="meta">${doneDays}/7 days</span></div>
        <div class="streak" aria-label="${doneDays} of 7 days done">${days.map(x => `<i class="${mobDone(x, 'daily') ? 'on' : ''}${x === d ? ' today' : ''}" title="${fmtDay(x)}"></i>`).join('')}</div>
        <p class="sub">Tight spots usually ease within 4–8 weeks of doing this every day.</p></section>
      ${order.map(id => { const r = ROUTINES[id]; const done = mobDone(d, id); const isToday = todays.includes(id);
        return `<section class="card">
          <div class="item${done ? ' done' : ''}"><span class="ic">${done ? ICON.check : ICON.mobility}</span><div class="tx"><div class="tt">${esc(r.name)}</div><div class="ts">${r.mins} min · ${r.items.length} exercises${isToday ? ' · on today' : ''}${done ? ' · done today' : ''}</div></div><button type="button" class="btn${done ? '' : ' primary'}" data-play="${id}">${done ? 'Again' : 'Start'}</button></div>
          <p class="sub">${esc(r.when)}</p>
          <details class="more"><summary>See the ${r.items.length} exercises</summary><ul class="rlist">${r.items.map(it => `<li><span>${esc(it.name)}</span><span>${esc(doseText(it))}</span></li>`).join('')}</ul></details>
        </section>`; }).join('')}
      <p class="meta">Holds run on a timer with a beep to switch sides. Rep exercises wait for you to tap Done. The screen stays on while a routine runs.</p>
    </div>`;
}
$('#v-mobility').addEventListener('click', ev => { const p = ev.target.closest('[data-play]'); if (p) openPlayer(p.dataset.play); });

/* ---------------- Charts ---------------- */
function niceStep(range, n){ const raw = range / n; const p = Math.pow(10, Math.floor(Math.log10(raw))); const f = raw / p; return (f < 1.5 ? 1 : f < 3 ? 2 : f < 7 ? 5 : 10) * p; }
let chartN = 0;
function lineChart({series, refs = [], unit = '', xMin, xMax, h = 220, label = 'Chart'}){
  const pts = series.flatMap(s => s.pts); if (!pts.length) return '';
  const W = 640, H = h, ml = 40, mr = 62, mt = 14, mb = 28;
  let t0 = xMin ?? Math.min(...pts.map(p => p.t)), t1 = xMax ?? Math.max(...pts.map(p => p.t));
  if (t1 - t0 < DAY * 6){ const mid = (t0 + t1) / 2; t0 = mid - DAY * 3; t1 = mid + DAY * 3; }
  const ys = pts.map(p => p.y).concat(refs.map(r => r.y));
  let y0 = Math.min(...ys), y1 = Math.max(...ys); if (y1 - y0 < 1e-9){ y0 -= 1; y1 += 1; }
  const step = niceStep(y1 - y0, 4); y0 = Math.floor(y0 / step) * step; y1 = Math.ceil(y1 / step) * step; if (y1 === y0) y1 += step;
  const X = t => ml + (t - t0) / (t1 - t0) * (W - ml - mr), Y = y => mt + (y1 - y) / (y1 - y0) * (H - mt - mb);
  const id = 'clip' + (++chartN); const dec = step < 1 ? (step < 0.1 ? 2 : 1) : 0;
  let g = `<defs><clipPath id="${id}"><rect x="${ml}" y="${mt - 6}" width="${W - ml - mr + 6}" height="${H - mt - mb + 12}"/></clipPath></defs>`;
  for (let v = y0; v <= y1 + step / 2; v += step) g += `<line class="grid" x1="${ml}" x2="${W - mr}" y1="${Y(v).toFixed(1)}" y2="${Y(v).toFixed(1)}"/><text class="ax" x="${ml - 6}" y="${(Y(v) + 3.5).toFixed(1)}" text-anchor="end">${v.toFixed(dec)}</text>`;
  for (let i = 0; i <= 4; i++){ const t = t0 + (t1 - t0) * i / 4; const d = new Date(t); g += `<text class="ax" x="${X(t).toFixed(1)}" y="${H - 8}" text-anchor="${i === 0 ? 'start' : i === 4 ? 'end' : 'middle'}">${d.getDate()} ${MONTHS[d.getMonth()]}</text>`; }
  for (const r of refs) g += `<line x1="${ml}" x2="${W - mr}" y1="${Y(r.y).toFixed(1)}" y2="${Y(r.y).toFixed(1)}" stroke="var(--good)" stroke-width="1.25" stroke-dasharray="2 4"/><text x="${W - mr + 6}" y="${(Y(r.y) + 4).toFixed(1)}" style="fill:var(--good);font-size:11px;font-weight:600">${esc(r.label)}</text>`;
  g += `<g clip-path="url(#${id})">`;
  for (const s of series){
    const Pp = s.pts.slice().sort((a, b) => a.t - b.t);
    if (s.kind === 'dots'){ for (const p of Pp) g += `<circle cx="${X(p.t).toFixed(1)}" cy="${Y(p.y).toFixed(1)}" r="3" fill="var(--muted)" fill-opacity="0.45"/>`; continue; }
    if (Pp.length > 1) g += `<path d="${Pp.map((p, i) => (i ? 'L' : 'M') + X(p.t).toFixed(1) + ' ' + Y(p.y).toFixed(1)).join('')}" fill="none" stroke="${s.kind === 'dash' ? 'var(--muted)' : 'var(--accent)'}" stroke-width="${s.kind === 'dash' ? 1.5 : 2.25}"${s.kind === 'dash' ? ' stroke-dasharray="5 5"' : ''} stroke-linejoin="round" stroke-linecap="round"/>`;
    if (s.kind !== 'dash' && s.marks !== false) for (const p of Pp) g += `<circle cx="${X(p.t).toFixed(1)}" cy="${Y(p.y).toFixed(1)}" r="3.25" fill="var(--surface)" stroke="var(--accent)" stroke-width="2"/>`;
  }
  g += '</g>';
  for (const s of series){ if (!s.end || !s.pts.length) continue; const p = s.pts.slice().sort((a, b) => a.t - b.t).pop();
    g += `<circle cx="${X(p.t).toFixed(1)}" cy="${Y(p.y).toFixed(1)}" r="4.5" fill="var(--accent)"/><text class="lbl" x="${(X(p.t) + 8).toFixed(1)}" y="${(Y(p.y) + 4).toFixed(1)}">${fmtN(p.y)}${unit}</text>`; }
  return `<div class="chart"><svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(label)}">${g}</svg></div>`;
}
const LOAD = {test:2, build:3, heavy:4, peak:5, deload:1.5, taper:2, season:3, tournament:2};
const TONE_COL = {good:'var(--good)', warn:'var(--warn)', hot:'var(--hot)', info:'var(--muted)', plain:'var(--accent)'};
function blockChart(allW, nowStart){
  const weeks = allW.filter(w => w.start <= '2027-05-31');
  const W = 640, H = 230, ml = 6, mr = 6, base = 140, top = 26, n = weeks.length, bw = (W - ml - mr) / n;
  let g = `<line class="grid" x1="${ml}" x2="${W - mr}" y1="${base}" y2="${base}"/>`;
  weeks.forEach((w, i) => {
    const t = WEEKTYPES[w.type]; const hgt = (LOAD[w.type] / 5) * (base - top); const x = ml + i * bw;
    g += `<rect x="${(x + 1).toFixed(1)}" y="${(base - hgt).toFixed(1)}" width="${Math.max(1, bw - 2).toFixed(1)}" height="${hgt.toFixed(1)}" rx="1.5" fill="${TONE_COL[t.tone]}" fill-opacity="${w.start < nowStart ? 0.35 : w.type === 'season' ? 0.55 : 0.9}"/>`;
    if (w.start === nowStart) g += `<path d="M${(x + bw / 2 - 8).toFixed(1)} 4 L${(x + bw / 2 + 8).toFixed(1)} 4 L${(x + bw / 2).toFixed(1)} 16 Z" fill="var(--ink)"/>`;
  });
  let i = 0;
  while (i < n){ let j = i; while (j + 1 < n && weeks[j + 1].phase === weeks[i].phase) j++;
    const x0 = ml + i * bw, x1 = ml + (j + 1) * bw;
    g += `<line x1="${x0.toFixed(1)}" x2="${x0.toFixed(1)}" y1="${base + 4}" y2="${base + 38}" stroke="var(--line)" stroke-width="1.5"/>`;
    const name = ({reset:'Reset', base:'Base', speed:'Speed', conversion:'Convert', taper:'Pre-season', season:'Season'})[weeks[i].phase];
    if (x1 - x0 > 50) g += `<text x="${((x0 + x1) / 2).toFixed(1)}" y="${base + 27}" text-anchor="middle" style="fill:var(--ink);font-size:20px;font-weight:600;font-family:var(--font-display)">${esc(name)}</text>`;
    i = j + 1; }
  let lastM = -1, lastX = -99;
  weeks.forEach((w, k) => { const d = parseDate(w.start); if (d.getMonth() !== lastM && ml + k * bw - lastX > 40){ lastM = d.getMonth(); lastX = ml + k * bw; g +=`<text x="${(ml + k * bw + 2).toFixed(1)}" y="${base + 66}" style="fill:var(--muted);font-size:17px;font-family:var(--font-body)">${MONTHS[d.getMonth()]}</text>`; } });
  return `<div class="chart"><svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Training load by week from October 2026 to May 2027">${g}</svg></div>`;
}

/* ---------------- Plan ---------------- */
let installEvt = null;
window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); installEvt = e; if (view === 'plan') renderPlan(); });
const isStandalone = () => (window.matchMedia && matchMedia('(display-mode: standalone)').matches) || navigator.standalone === true;
const isIOS = () => /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
function renderPlan(){
  const d = today(); const w = week(d); const weeks = P.allWeeks().map(x => Object.assign({}, x, {type:ov()[x.start] || x.type}));
  const auto = P.weekInfo(d, {}).type;
  const byPhase = []; for (const x of weeks){ const last = byPhase[byPhase.length - 1]; if (last && last.phase === x.phase) last.weeks.push(x); else byPhase.push({phase:x.phase, weeks:[x]}); }
  $('#v-plan').innerHTML = `
    <div class="head"><div><div class="eyebrow">Winter block 2026–27</div><h1 class="h1">Plan</h1></div></div>
    <div class="stack">
      ${weekCard(w, `<label class="field" style="margin-top:12px"><span>This week</span><select class="input" id="pl-override"><option value="">As planned (${esc(WEEKTYPES[auto].name)})</option>${Object.entries(WEEKTYPES).map(([k, t]) => `<option value="${k}"${ov()[w.start] === k ? ' selected' : ''}>${esc(t.name)}</option>`).join('')}</select></label><p class="sub">Change this if you're ill, travelling, or playing a tournament. It only affects this week.</p>`)}
      <section class="card"><h2 class="h3">How the load moves</h2><p class="sub">Three weeks building, then a lighter week. Taller bars are harder weeks.</p>
        ${blockChart(weeks, w.start)}
        <div class="legend"><span><i style="background:var(--accent)"></i>Build</span><span><i style="background:var(--warn)"></i>Heavy</span><span><i style="background:var(--hot)"></i>Peak</span><span><i style="background:var(--good)"></i>Deload or taper</span><span><i style="background:var(--muted)"></i>Test</span></div>
        <p class="sub">From 10 May it's in-season maintenance through September, with tournament weeks set by you.</p>
      </section>
      ${byPhase.map(g => { const isNow = g.weeks.some(x => x.start === w.start); const ph = PHASES[g.phase];
        return `<section class="card phase"><details${isNow ? ' open' : ''}><summary><span class="h3">${esc(ph.name)}</span><span class="meta">${fmtDate(g.weeks[0].start)} – ${fmtDate(addDays(g.weeks[g.weeks.length - 1].start, 6))}</span></summary>
          ${g.weeks.length > 12 ? `<p class="sub">${g.weeks.length} weeks of maintenance. Use the week selector above for tournament weeks.</p>` : g.weeks.map(x => `<div class="wk${x.start === w.start ? ' now' : x.start < w.start ? ' past' : ''}"><span class="wd">${fmtDate(x.start)}</span><span>${esc(x.label)}</span><span class="tone ${WEEKTYPES[x.type].tone}">${esc(WEEKTYPES[x.type].short)}</span></div>`).join('')}
        </details></section>`; }).join('')}
      <section class="card"><h2 class="h3">Training maxes</h2><p class="sub">Used for the % loads. Update after each test week.</p>
        <div class="row end" style="margin-top:10px">
          <label class="field" style="flex:1 1 140px"><span>Back squat 1RM (kg)</span><input class="input" id="rm-squat" type="number" inputmode="decimal" step="2.5" min="0" value="${esc(DB.settings.rm.squat ?? '')}"></label>
          <label class="field" style="flex:1 1 140px"><span>Trap-bar deadlift 1RM (kg)</span><input class="input" id="rm-trapbar" type="number" inputmode="decimal" step="2.5" min="0" value="${esc(DB.settings.rm.trapbar ?? '')}" placeholder="Not set"></label>
        </div><p class="sub">The squat starts at 255 kg, estimated from your 240 kg 3RM.</p></section>
      <section class="card"><h2 class="h3">Your data</h2><p class="sub">Everything is stored on this phone only. Back up now and then so you don't lose it if you clear your browser or change phone.</p>
        <div class="ex-actions"><button type="button" class="btn primary" data-data="backup">Back up</button><button type="button" class="btn" data-data="restore">Restore</button><button type="button" class="btn" data-data="lifts">Export lifts (CSV)</button><button type="button" class="btn" data-data="weight">Export weigh-ins (CSV)</button></div>
        <input type="file" id="restore-file" accept="application/json,.json" hidden>
        <div id="restore-confirm"></div>
        <p class="sub">Saved here: ${plural(Object.keys(DB.sessions).length, 'session')}, ${plural(Object.keys(DB.weighins).length, 'weigh-in')}, ${plural(Object.keys(DB.mob).length, 'mobility day')}.</p></section>
      ${isStandalone() ? '' : `<section class="card"><h2 class="h3">Install on your phone</h2>${installEvt ? '<p class="sub">Add Jump Block to your home screen so it opens like an app and works offline.</p><div class="ex-actions"><button type="button" class="btn primary" id="install-btn">Install app</button></div>' : isIOS() ? '<p class="sub">In Safari, tap the Share button, then <b>Add to Home Screen</b>. It then opens full-screen and works offline.</p>' : '<p class="sub">In Chrome, tap the ⋮ menu, then <b>Install app</b> or <b>Add to Home screen</b>. It then works offline.</p>'}</section>`}
      <p class="meta">Jump Block ${VERSION} · works offline once installed.</p>
    </div>`;
}
const planView = $('#v-plan');
planView.addEventListener('change', ev => {
  const t = ev.target;
  if (t.id === 'pl-override'){ const st = week(today()).start; if (t.value) DB.settings.weekOverride[st] = t.value; else delete DB.settings.weekOverride[st]; save(); L.prog = null; renderPlan(); toast(t.value ? 'This week is now a ' + WEEKTYPES[t.value].name.toLowerCase() + '.' : 'Back to the planned week.'); return; }
  if (t.id === 'rm-squat' || t.id === 'rm-trapbar'){ DB.settings.rm[t.id === 'rm-squat' ? 'squat' : 'trapbar'] = num(t.value); save(); toast('Training max saved.'); return; }
  if (t.id === 'restore-file' && t.files && t.files[0]) readBackup(t.files[0]);
});
planView.addEventListener('click', async ev => {
  if (ev.target.id === 'install-btn' && installEvt){ installEvt.prompt(); try { await installEvt.userChoice; } catch (e) {} installEvt = null; renderPlan(); return; }
  const b = ev.target.closest('[data-data]'); if (!b) return;
  const k = b.dataset.data;
  if (k === 'backup') shareFile('jump-block-backup-' + today() + '.json', JSON.stringify(DB, null, 1), 'application/json');
  if (k === 'restore') $('#restore-file').click();
  if (k === 'lifts') shareFile('jump-block-lifts-' + today() + '.csv', liftsCSV(), 'text/csv');
  if (k === 'weight') shareFile('jump-block-weigh-ins-' + today() + '.csv', weightCSV(), 'text/csv');
});
planView.addEventListener('click', ev => {
  if (ev.target.id === 'restore-yes' && pendingRestore){ DB = pendingRestore; pendingRestore = null; save(); L.data = null; L.session = null; toast('Backup restored.'); renderPlan(); }
  if (ev.target.id === 'restore-no'){ pendingRestore = null; $('#restore-confirm').innerHTML = ''; }
});
let pendingRestore = null;
function readBackup(file){
  const fr = new FileReader();
  fr.onload = () => {
    let o = null; try { o = JSON.parse(fr.result); } catch (e) {}
    if (!o || o.v !== 1 || typeof o.sessions !== 'object'){ toast('That file isn’t a Jump Block backup.'); return; }
    const b = blank(); pendingRestore = Object.assign(b, o, {settings:Object.assign(b.settings, o.settings || {})});
    $('#restore-confirm').innerHTML = `<div class="note" style="margin-top:10px">Replace everything on this phone with this backup (${Object.keys(o.sessions).length} sessions, ${Object.keys(o.weighins || {}).length} weigh-ins)?<div class="ex-actions"><button type="button" class="btn primary" id="restore-yes">Replace</button><button type="button" class="btn" id="restore-no">Cancel</button></div></div>`;
  };
  fr.readAsText(file);
}
async function shareFile(name, text, type){
  const blob = new Blob([text], {type});
  try {
    const file = new File([blob], name, {type});
    if (navigator.canShare && navigator.canShare({files:[file]}) && /android|iphone|ipad|ipod/i.test(navigator.userAgent)){ await navigator.share({files:[file], title:name}); return; }
  } catch (e) { if (e && e.name === 'AbortError') return; }
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name; document.body.appendChild(a); a.click();
  setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
}
const csvCell = v => { const s = v == null ? '' : String(v); return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; };
const csv = rows => rows.map(r => r.map(csvCell).join(',')).join('\r\n') + '\r\n';
function liftsCSV(){
  const out = [['date','weekday','session','phase','week_type','exercise','set','kg','reps','bar_speed_m_s','height_cm','minutes','seconds','done','readiness_cmj_best_cm','session_notes']];
  for (const s of sessionsList().reverse()){
    const cmj = (s.cmj || []).filter(x => x != null); const best = cmj.length ? Math.max(...cmj) : '';
    const base = [s.date, WD[parseDate(s.date).getDay()], (SESSIONS[s.session] || {label:s.session}).label, (PHASES[s.phase] || {name:''}).name, (WEEKTYPES[s.weekType] || {name:''}).name];
    const ents = Object.entries(s.entries || {});
    if (!ents.length) out.push(base.concat(['', '', '', '', '', '', '', '', '', best, s.notes || '']));
    for (const [id, ent] of ents) (ent.sets || []).forEach((r, i) => out.push(base.concat([exName(id, ent), i + 1, r.kg, r.reps, r.ms, r.cm, r.min, r.sec, r.done ? 'yes' : 'no', best, s.notes || ''])));
  }
  return csv(out);
}
function weightCSV(){ const wl = weighList(); const roll = rolling(wl); return csv([['date','kg','seven_day_average_kg']].concat(wl.map((w, i) => [w.date, w.kg, roll[i].y.toFixed(2)]))); }

/* ---------------- Progress ---------------- */
let progEx = null;
function exerciseMetrics(){
  const m = {};
  for (const s of Object.values(DB.sessions)){
    for (const [id, ent] of Object.entries(s.entries || {})){
      if (EX[id] && EX[id].test) continue;
      let kg = null, cm = null;
      for (const r of ent.sets || []){ if (r.kg != null && (r.reps == null || r.reps > 0)) kg = Math.max(kg ?? -Infinity, r.kg); if (r.cm != null) cm = Math.max(cm ?? -Infinity, r.cm); }
      const v = kg != null ? {y:kg, u:' kg'} : cm != null ? {y:cm, u:' cm'} : null; if (!v) continue;
      (m[id] = m[id] || {name:exName(id, ent), unit:v.u, pts:[]}).pts.push({t:ts(s.date), y:v.y, date:s.date, ent});
    }
  }
  return m;
}
const e1rm = (kg, reps) => reps >= 1 && reps <= 10 ? kg * (1 + reps / 30) : null;
function bestsHTML(m){
  const rows = [];
  for (const [id, x] of Object.entries(m)){
    if (x.unit !== ' kg') continue;
    let best = null, bestE = null; const tops = x.pts.slice().sort((a, b) => a.t - b.t);
    for (const p of tops) for (const r of p.ent.sets || []){
      if (r.kg == null || (r.reps != null && r.reps <= 0)) continue;
      if (!best || r.kg > best.kg || (r.kg === best.kg && (r.reps || 0) > (best.reps || 0))) best = {kg:r.kg, reps:r.reps, date:p.date};
      const e = r.reps != null ? e1rm(r.kg, r.reps) : null; if (e != null && (bestE == null || e > bestE)) bestE = e;
    }
    if (!best) continue;
    rows.push({id, name:x.name, best, bestE, change:tops.length > 1 ? tops[tops.length - 1].y - tops[0].y : null, n:tops.length});
  }
  if (!rows.length) return '';
  const order = Object.keys(EX); rows.sort((a, b) => order.indexOf(a.id) - order.indexOf(b.id));
  return `<section class="card"><h2 class="h3">Personal bests</h2><p class="sub">Heaviest set per exercise. Est. 1RM uses sets of 10 reps or fewer.</p>
    <div class="scroll" style="margin-top:8px"><table class="tbl"><thead><tr><th>Exercise</th><th>Best set</th><th>Est. 1RM</th><th>Change</th></tr></thead><tbody>
    ${rows.map(r => `<tr><td>${esc(r.name)}<span class="n">${r.n} session${r.n === 1 ? '' : 's'}</span></td><td>${fmtN(r.best.kg)} kg${r.best.reps != null ? ' × ' + fmtN(r.best.reps) : ''}<span class="n">${fmtDate(r.best.date)}</span></td><td>${r.bestE != null ? fmtN(Math.round(r.bestE * 2) / 2) + ' kg' : '–'}</td><td class="${r.change > 0 ? 'up' : ''}">${r.change == null ? '–' : (r.change > 0 ? '+' : '') + fmtN(r.change) + ' kg'}</td></tr>`).join('')}
    </tbody></table></div></section>`;
}
function testsHTML(){
  const ids = ['t_cmj','t_cmja','t_sj','t_reach','t_appr']; const heads = ['CMJ','CMJ arms','SJ','Reach','Approach'];
  const rows = Object.values(DB.sessions).filter(s => s.entries && ids.some(id => s.entries[id])).sort((a, b) => a.date < b.date ? 1 : -1)
    .map(s => ({date:s.date, v:ids.map(id => { const e = s.entries[id]; const vals = e ? (e.sets || []).map(r => r.cm).filter(x => x != null) : []; return vals.length ? Math.max(...vals) : null; })}));
  return `<section class="card"><h2 class="h3">Jump tests</h2><p class="sub">Best attempt from each test week, in cm. Your last CMJ test, about a year ago, was 45 cm; standing reach 237 cm.</p>
    ${rows.length ? `<div class="scroll" style="margin-top:8px"><table class="tbl"><thead><tr><th>Date</th>${heads.map(h => `<th>${h}</th>`).join('')}</tr></thead><tbody>${rows.map(r => `<tr><td>${fmtDate(r.date)}</td>${r.v.map(v => `<td>${v == null ? '–' : fmtN(v)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>` : '<p class="sub">Your first test is this week in Gym A.</p>'}</section>`;
}
function weightHTML(){
  const list = weighList();
  if (!list.length) return `<section class="card"><h2 class="h3">Weight</h2><p class="sub">Log your morning weight on the Today screen. Your 7-day average, weekly rate and goal date show here. Goal: 85 kg at about 0.5 kg a week.</p></section>`;
  const GOAL = 85; const roll = rolling(list); const avg = roll[roll.length - 1].y; const latest = list[list.length - 1]; const rate = slopePerWeek(list);
  let cls = '', txt = 'Needs 3+ weigh-ins over a week';
  if (rate != null){ if (rate <= -0.3 && rate >= -0.75){ cls = 'good'; txt = 'On track'; } else if (rate < -0.75){ cls = 'warn'; txt = 'Faster than planned: eat a little more'; } else { cls = 'warn'; txt = 'Slower than planned: trim 150–200 kcal'; } }
  const toGo = avg - GOAL; let eta = '–';
  if (rate != null && rate < -0.05 && toGo > 0){ const dd = new Date(ts(latest.date) + toGo / -rate * 7 * DAY); eta = dd.getDate() + ' ' + MONTHS[dd.getMonth()] + ' ' + dd.getFullYear(); } else if (toGo <= 0) eta = 'reached';
  const first = list[0]; const t0 = ts(first.date); const tEnd = Math.max(ts(latest.date), t0 + 28 * DAY);
  const paceEnd = Math.min(tEnd, t0 + Math.max(0, first.kg - GOAL) / 0.5 * 7 * DAY);
  const pace = [{t:t0, y:first.kg}, {t:paceEnd, y:first.kg - (paceEnd - t0) / (7 * DAY) * 0.5}];
  return `<div class="stats">
      <div class="stat"><div class="k">7-day average</div><div class="v">${avg.toFixed(1)}<small>kg</small></div><div class="d">Latest ${fmtN(latest.kg)} kg · ${fmtDate(latest.date)}</div></div>
      <div class="stat"><div class="k">Weekly rate</div><div class="v">${rate != null ? (rate > 0 ? '+' : '') + rate.toFixed(2) + '<small>kg/wk</small>' : '–'}</div><div class="d">${cls ? `<span class="pill ${cls}">${txt}</span>` : txt}</div></div>
      <div class="stat"><div class="k">To go</div><div class="v">${Math.max(0, toGo).toFixed(1)}<small>kg</small></div><div class="d">Goal ${GOAL} kg · ${eta === 'reached' ? 'reached' : 'ETA ' + eta}</div></div>
    </div>
    <section class="card"><h2 class="h3">Weight trend</h2>
      ${list.length > 1 ? lineChart({series:[{kind:'dots', pts:list.map(w => ({t:ts(w.date), y:w.kg}))}, {kind:'dash', pts:pace}, {pts:roll, marks:false, end:true}], refs:[{y:GOAL, label:GOAL + ' kg goal'}], unit:' kg', xMin:t0, xMax:tEnd, label:'Weight trend'}) : '<p class="sub">Add a second weigh-in to start the trend line.</p>'}
      <div class="legend"><span><i class="line"></i>7-day average</span><span><i class="dot"></i>Weigh-ins</span><span><i class="dash"></i>Plan, −0.5 kg a week</span></div>
      <details class="more"><summary>Recent weigh-ins</summary><div class="wlist" style="margin-top:6px">${list.slice(-14).reverse().map(w => `<div><span>${fmtDay(w.date)}</span><span><b>${fmtN(w.kg)} kg</b> <button type="button" class="btn quiet danger" data-delw="${w.date}">Delete</button></span></div>`).join('')}</div></details>
    </section>`;
}
function histHTML(s){
  const sess = SESSIONS[s.session] || {label:s.session};
  const items = Object.entries(s.entries || {});
  const fieldsOf = id => (EX[id] || {}).fields;
  const summary = items.slice(0, 3).map(([id, ent]) => exName(id, ent) + ' ' + (setsText(fieldsOf(id), ent) || '')).join(' · ');
  const cmj = (s.cmj || []).filter(x => x != null);
  return `<details><summary><span class="hl"><span class="hd">${fmtDay(s.date)} · ${esc(sess.label)}</span><span class="hs">${esc((WEEKTYPES[s.weekType] || {short:''}).short)}</span></span><span class="hx">${esc(summary || s.notes || 'No sets logged')}</span></summary>
    <div class="body"><table class="tbl"><tbody>${cmj.length ? `<tr><td>Readiness CMJ</td><td>${cmj.map(fmtN).join(', ')} cm</td></tr>` : ''}${items.map(([id, ent]) => `<tr><td>${esc(exName(id, ent))}</td><td>${esc(setsText(fieldsOf(id), ent) || '–')}</td></tr>`).join('')}</tbody></table>
      ${s.notes ? `<p class="sub">${esc(s.notes)}</p>` : ''}
      <div class="ex-actions"><button type="button" class="btn" data-open="${esc(s.date + '|' + s.session)}">Open</button><button type="button" class="btn quiet danger" data-delsess="${esc(s.date + '_' + s.session)}">Delete</button></div></div></details>`;
}
function renderProgress(){
  const list = sessionsList(); const d = today(); const mon = P.mondayOf(d);
  const thisWeek = list.filter(s => s.date >= mon).length;
  const mobWeek = Array.from({length:7}, (_, i) => addDays(mon, i)).filter(x => DB.mob[x] && Object.keys(DB.mob[x]).length).length;
  const cmjPts = list.map(s => ({t:ts(s.date), y:Math.max(...(s.cmj || []).filter(x => x != null))})).filter(p => Number.isFinite(p.y));
  const m = exerciseMetrics(); const ids = Object.keys(m).sort((a, b) => m[a].name.localeCompare(m[b].name));
  if (!progEx || !m[progEx]) progEx = m.sq ? 'sq' : ids[0] || null;
  const exm = progEx ? m[progEx] : null;
  $('#v-progress').innerHTML = `
    <div class="head"><div><div class="eyebrow">Since 26 Oct 2026</div><h1 class="h1">Progress</h1></div></div>
    <div class="stack">
      <div class="stats">
        <div class="stat"><div class="k">This week</div><div class="v">${thisWeek}<small>${thisWeek === 1 ? 'session' : 'sessions'}</small></div><div class="d">Mobility on ${mobWeek}/7 days</div></div>
        <div class="stat"><div class="k">Logged</div><div class="v">${list.length}<small>total</small></div><div class="d">${list.length ? 'Last: ' + fmtDay(list[0].date) : 'Nothing yet'}</div></div>
        <div class="stat"><div class="k">Best CMJ</div><div class="v">${cmjPts.length ? fmtN(Math.max(...cmjPts.map(p => p.y))) + '<small>cm</small>' : '–'}</div><div class="d">Readiness checks</div></div>
      </div>
      ${testsHTML()}
      ${bestsHTML(m)}
      <section class="card"><h2 class="h3">Lift progress</h2>
        ${ids.length ? `<label class="field" style="margin-top:8px;max-width:320px"><span>Exercise</span><select class="input" id="p-ex">${ids.map(id => `<option value="${id}"${id === progEx ? ' selected' : ''}>${esc(m[id].name)}</option>`).join('')}</select></label>
          <p class="sub">${exm.unit === ' kg' ? 'Heaviest set each session.' : 'Best height each session.'}</p>
          ${exm.pts.length > 1 ? lineChart({series:[{pts:exm.pts, end:true}], unit:exm.unit, label:exm.name + ' over time'}) : '<p class="sub">Log this exercise in two sessions to see a trend.</p>'}` : '<p class="sub">Weights you enter in the Gym tab are charted here.</p>'}
      </section>
      <section class="card"><h2 class="h3">Readiness CMJ</h2><p class="sub">Best of 3 each gym session. Changes under 2 cm are usually noise.</p>
        ${cmjPts.length > 1 ? lineChart({series:[{pts:cmjPts, end:true}], unit:' cm', label:'Readiness CMJ'}) : '<p class="sub">Fill in the readiness check at the top of Gym A or B.</p>'}</section>
      ${weightHTML()}
      <h2 class="h3" style="margin-top:8px">History</h2>
      ${list.length ? `<div class="hist">${list.map(histHTML).join('')}</div>` : '<div class="empty"><b>No sessions yet</b>Start today’s session from the Today tab.</div>'}
    </div>`;
}
const progView = $('#v-progress');
progView.addEventListener('change', ev => { if (ev.target.id === 'p-ex'){ progEx = ev.target.value; renderProgress(); } });
progView.addEventListener('click', ev => {
  const o = ev.target.closest('[data-open]'); if (o){ const [date, s] = o.dataset.open.split('|'); openGym(date, s); return; }
  const confirmBtn = (el, fn) => { if (el.dataset.armed){ fn(); return; } el.dataset.armed = '1'; el.textContent = 'Tap again to delete'; setTimeout(() => { if (el.isConnected){ delete el.dataset.armed; el.textContent = 'Delete'; } }, 4000); };
  const ds = ev.target.closest('[data-delsess]'); if (ds){ confirmBtn(ds, () => { delete DB.sessions[ds.dataset.delsess]; save(); if (sid() === ds.dataset.delsess) L.data = null; renderProgress(); toast('Session deleted.'); }); return; }
  const dw = ev.target.closest('[data-delw]'); if (dw){ confirmBtn(dw, () => { delete DB.weighins[dw.dataset.delw]; save(); renderProgress(); }); }
});

/* ---------------- Service worker and lifecycle ---------------- */
let wantReload = false;
if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol)){
  navigator.serviceWorker.register('sw.js').then(reg => {
    reg.addEventListener('updatefound', () => {
      const nw = reg.installing; if (!nw) return;
      nw.addEventListener('statechange', () => {
        if (nw.state === 'installed' && navigator.serviceWorker.controller) toast('A new version is ready.', 'Update', () => { wantReload = true; nw.postMessage('skipWaiting'); });
      });
    });
  }).catch(() => {});
  navigator.serviceWorker.addEventListener('controllerchange', () => { if (wantReload){ wantReload = false; location.reload(); } });
}
let lastDay = today();
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden'){ flush(); return; }
  if (wake === null && PL.mode !== 'idle') wakeOn();
  if (today() !== lastDay){ lastDay = today(); if (view === 'today' || view === 'mobility') render(view); }
});
window.addEventListener('pagehide', flush);
window.addEventListener('storage', ev => { if (ev.key === KEY){ DB = loadDB(); L.data = null; render(view); } });

/* ---------------- Boot ---------------- */
buildNav();
const start = (location.hash || '').slice(1);
show(VIEWS.includes(start) ? start : 'today');
})();
