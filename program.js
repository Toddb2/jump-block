/* Jump Block programme data: exercises, sessions, phases, the week-by-week calendar,
   week-type rules, mobility routines and the weekly day plan. */
window.PROGRAM = (() => {
'use strict';

const EX = {
  /* Gym A */
  a1:{tag:'A1', name:'Depth jump', sets:4, reps:'4', target:4, load:'Box 30–40 cm', rest:90, fields:['reps'], plyo:true, cue:'Step off, touch down and leave the ground as fast as you can. Jump as high as possible.'},
  a2:{tag:'A2', name:'Hurdle hops', sets:3, reps:'5', target:5, load:'Bodyweight', rest:90, fields:['reps'], plyo:true, cue:'Stiff ankles, quick contacts, knees up.'},
  sq:{tag:'B', name:'Back squat', sets:4, reps:'3', target:3, pct:[80,85], of:'squat', rest:180, fields:['kg','reps'], main:true, cue:'Full depth, controlled down, drive up as fast as you can.'},
  con:{tag:'B2', name:'Contrast jumps', sets:3, reps:'3', target:3, load:'4–8 min after each heavy squat set', rest:300, fields:['cm','reps'], plyo:true, cue:'Pair each squat set with 3 maximal CMJs or approach jumps. Log your best height.'},
  rdl:{tag:'C', name:'Romanian deadlift', sets:3, reps:'5', target:5, load:'Heavy, 2 reps in reserve', rest:120, fields:['kg','reps'], cue:'Push the hips back, bar close to the legs, neutral back.'},
  bss:{tag:'D1', name:'Bulgarian split squat', sets:3, reps:'6 each leg', target:6, load:'Dumbbells', rest:90, fields:['kg','reps'], cue:'Front knee tracks over the toes. Log the weight per dumbbell.'},
  pu:{tag:'D2', name:'Weighted pull-up', sets:3, reps:'5–6', target:6, load:'Added weight', rest:90, fields:['kg','reps'], cue:'Full hang to chin over the bar. Log the added weight only.'},
  calf:{tag:'E1', name:'Single-leg calf raise', sets:4, reps:'8 each leg', target:8, load:'Heavy dumbbell, 3 s down', rest:60, fields:['kg','reps'], cue:'Pause at the top, 3 seconds down. You can swap for 30–45 s isometric holds.'},
  row:{tag:'E2', name:'Chest-supported row', sets:3, reps:'8', target:8, load:'Moderate', rest:60, fields:['kg','reps'], cue:'Squeeze the shoulder blades together at the top.'},
  pallof:{tag:'F', name:'Pallof press', sets:3, reps:'10 each side', target:10, load:'Band or cable', rest:45, fields:['kg','reps'], cue:'Press straight out and resist the twist.'},
  /* Test week */
  t_cmj:{tag:'T1', name:'CMJ, hands on hips', sets:5, reps:'1 per attempt', target:1, load:'Firm floor, My Jump at 240 fps', rest:45, fields:['cm'], test:true, cue:'Film side-on, feet in view. Log every attempt; your best one counts.'},
  t_cmja:{tag:'T2', name:'CMJ with arm swing', sets:3, reps:'1 per attempt', target:1, load:'Firm floor', rest:45, fields:['cm'], test:true, cue:'Same set-up, full arm swing. The gap to T1 shows what your arms add.'},
  t_sj:{tag:'T3', name:'Squat jump', sets:3, reps:'1 per attempt', target:1, load:'2 s pause at 90° knee bend', rest:45, fields:['cm'], test:true, cue:'No dip before you jump. CMJ ÷ SJ shows how well you use elastic energy.'},
  t_reach:{tag:'T4', name:'Standing reach', sets:1, reps:'1', target:1, load:'One hand, flat-footed', rest:0, fields:['cm'], test:true, cue:'Side-on to a wall, reach as high as you can with heels down. Last measure: 237 cm.'},
  t_appr:{tag:'T5', name:'Approach-jump reach', sets:3, reps:'1 per attempt', target:1, load:'Spike approach, one hand', rest:60, fields:['cm'], test:true, cue:'Wall mark or Vertec. Do it on sand too when you can and note it.'},
  /* Gym B */
  js:{tag:'A', name:'Jump shrug', sets:4, reps:'3', target:3, load:'Add load only while it stays fast', rest:120, fields:['kg','reps'], cue:'From mid-thigh: drive through the floor, shrug and leave the ground.'},
  tbj:{tag:'B', name:'Trap-bar jump', sets:4, reps:'3', target:3, pct:[20,30], of:'trapbar', rest:120, fields:['kg','reps','ms'], cue:'Reset each rep. Aim for bar speed above about 1.0 m/s.'},
  bsq:{tag:'C', name:'Box squat, dynamic effort', sets:6, reps:'2', target:2, pct:[55,55], of:'squat', rest:60, fields:['kg','reps','ms'], cue:'Sit back to the box, then explode up as fast as possible.'},
  mbr:{tag:'D1', name:'Med-ball rotational throw', sets:3, reps:'5 each side', target:5, load:'4–6 kg ball', rest:60, fields:['kg','reps'], cue:'Hips first, then trunk, then arms. Throw into a wall.'},
  mbo:{tag:'D2', name:'Med-ball overhead throw', sets:3, reps:'5', target:5, load:'3–5 kg ball', rest:60, fields:['kg','reps'], cue:'Like an arm swing: loose and fast.'},
  lmp:{tag:'E1', name:'Half-kneeling landmine press', sets:3, reps:'6 each arm', target:6, load:'Moderate', rest:90, fields:['kg','reps'], cue:'Reach up and forward at the top.'},
  fp:{tag:'E2', name:'Face pull', sets:3, reps:'12', target:12, load:'Light to moderate cable', rest:60, fields:['kg','reps'], cue:'Pull to the forehead, thumbs back.'},
  er:{tag:'F', name:'Side-lying external rotation', sets:2, reps:'12–15 each arm', target:15, load:'Light dumbbell', rest:45, fields:['kg','reps'], cue:'Slow and controlled. Protects the hitting shoulder.'},
  nord:{tag:'G', name:'Nordic curl', sets:3, reps:'4', target:4, load:'Bodyweight', rest:90, fields:['reps'], cue:'Lower yourself as slowly as you can.'},
  /* Session C */
  bike:{tag:'1', name:'Easy bike or rower', sets:1, reps:'30 min', target:30, load:'Conversational pace', rest:0, fields:['min'], cue:'You should be able to talk the whole time.'},
  roll:{tag:'2', name:'Foam rolling and long mobility', sets:1, reps:'20–30 min', target:25, load:'Use the Extended routine', rest:0, fields:['min'], cue:'Run the Extended mobility routine from the Mobility tab, then log the minutes here.'},
  fw:{tag:'3', name:'Sharp footwork (optional)', sets:3, reps:'10 s', target:10, load:'Low effort', rest:30, fields:['sec'], cue:'Split-step and shuffle, light and quick.'},
  /* Session D */
  swu:{tag:'A', name:'Sand warm-up', sets:1, reps:'10 min', target:10, load:'Jog, skips, shuffles, 3 build-ups', rest:0, fields:['min'], cue:'Get properly warm before sprinting.'},
  spr:{tag:'B', name:'Multidirectional sprints', sets:2, reps:'5 × 5–10 m', target:5, load:'From ready stance', rest:60, fields:['reps'], cue:'Forward, diagonal, lateral and turn-and-chase. Full rest between reps.'},
  rs:{tag:'C', name:'Reactive starts', sets:2, reps:'4', target:4, load:'Partner cue', rest:60, fields:['reps'], cue:'Partner points or tosses a ball; go on the cue, not on your own timing.'},
  dfw:{tag:'D', name:'Defensive footwork', sets:3, reps:'4', target:4, load:'Split-step, shuffle, sprawl, recover', rest:90, fields:['reps'], cue:'Stay low and balanced; get up fast.'},
  rsa:{tag:'E', name:'Repeated sprints', sets:3, reps:'6–8 × 5–8 s', target:7, load:'15 s rest between sprints', rest:180, fields:['reps'], cue:'Match timing. Keep every sprint high quality and stop if the pace falls apart.'},
  cd:{tag:'F', name:'Easy cool-down', sets:1, reps:'10–15 min', target:12, load:'Walk or easy bike', rest:0, fields:['min'], cue:''}
};

const SESSIONS = {
  A:{label:'Gym A', title:'Heavy lower and plyos', mins:'~75 min', cmj:true, warmup:true, ids:['a1','a2','sq','rdl','bss','pu','calf','row','pallof']},
  B:{label:'Gym B', title:'Power and upper body', mins:'~60 min', cmj:true, warmup:true, ids:['js','tbj','bsq','mbr','mbo','lmp','fp','er','nord']},
  C:{label:'Session C', title:'Light session', mins:'~45 min', cmj:false, warmup:false, ids:['bike','roll','fw']},
  D:{label:'Session D', title:'Sand speed', mins:'~60 min', cmj:false, warmup:false, ids:['swu','spr','rs','dfw','rsa','cd']}
};

const PHASES = {
  reset:{name:'Test and reset', span:'Late Oct to mid Nov'},
  base:{name:'Base and tendons', span:'Mid Nov to Dec'},
  speed:{name:'Speed-strength', span:'Jan to Feb'},
  conversion:{name:'Conversion', span:'Mar'},
  taper:{name:'Pre-season and taper', span:'Apr to early May'},
  season:{name:'In-season', span:'May to Sept'}
};

/* Phase-specific changes to the base sessions. */
const PH = {
  reset:{
    A:{a1:{name:'Box jump', sets:3, reps:'5', target:5, load:'Box 50–60 cm, step down', cue:'Land soft and quiet, then step down. No depth jumps yet.'},
       a2:{name:'Pogo hops', sets:3, reps:'10', target:10, load:'Bodyweight', cue:'Small, quick bounces off the balls of the feet.'},
       sq:{sets:3, reps:'5', target:5, pct:[70,75]}},
    B:{_note:'Go lighter than written. Stop every set well before it slows down.'}
  },
  base:{},
  speed:{
    A:{a1:{load:'Box 40–45 cm'}, sq:{sets:3, reps:'3', target:3, pct:[85,87.5]}, bss:{sets:2}},
    B:{tbj:{pct:[30,40]}, mbr:{sets:4}, mbo:{sets:4}}
  },
  conversion:{
    A:{sq:{sets:3, reps:'3', target:3, pct:[85,85]}, _add:{after:'sq', id:'con'}},
    B:{bsq:{cue:'Swap for approach jumps on sand when you can.'}}
  },
  taper:{
    A:{sq:{sets:3, reps:'2', target:2, pct:[85,85]}, _add:{after:'sq', id:'con'}},
    B:{js:{sets:3}, tbj:{sets:3}, bsq:{sets:3}, mbr:{sets:3}, mbo:{sets:3}}
  },
  season:{
    A:{_note:'30–40 min. Do the last heavy lower-body session at least 3–4 days before an event.', sq:{sets:3, reps:'2–3', target:3, pct:[80,85]}, _drop:['a1','a2','bss','row','pallof']},
    B:{_note:'Power only.', _drop:['lmp','fp','er','nord']},
    D:{_note:'Volleyball covers most of this in season.'}
  }
};

const WEEKTYPES = {
  test:{name:'Test week', short:'Test', tone:'info', note:'Retest jumps, reach and your squat 3RM in Gym A. Everything else is half volume.'},
  build:{name:'Build week', short:'Build', tone:'plain', note:'Loads as written. Leave a rep or two in the tank on the heavy lifts.'},
  heavy:{name:'Heavy week', short:'Heavy', tone:'warn', note:'Back squat +2.5%. Push the heavy sets; keep the speed work fast.'},
  peak:{name:'Peak week', short:'Peak', tone:'hot', note:'Heaviest week of the block: back squat +5% with one rep fewer.'},
  deload:{name:'Deload week', short:'Deload', tone:'good', note:'Half the sets and back squat 10% lighter. Leave every session feeling fresh.'},
  taper:{name:'Taper week', short:'Taper', tone:'good', note:'Before your first event: keep the intensity, cut the volume in half.'},
  season:{name:'In-season week', short:'Season', tone:'plain', note:'Maintain strength and power: short, heavy, low volume.'},
  tournament:{name:'Tournament week', short:'Event', tone:'hot', note:'Gym A becomes a 30-minute primer early in the week. Skip Gym B.'}
};

/* Week-by-week calendar. Each row: week starting Monday, phase, week type, label. */
const CAL = [
  ['2026-10-26','reset','test','Reset · Retest'],
  ['2026-11-02','reset','build','Reset · Week 2'],
  ['2026-11-09','reset','build','Reset · Week 3'],
  ['2026-11-16','base','build','Base 1 · Week 1'],
  ['2026-11-23','base','heavy','Base 1 · Week 2'],
  ['2026-11-30','base','peak','Base 1 · Week 3'],
  ['2026-12-07','base','deload','Base 1 · Deload'],
  ['2026-12-14','base','build','Base 2 · Week 1'],
  ['2026-12-21','base','heavy','Base 2 · Week 2'],
  ['2026-12-28','base','deload','Holiday deload'],
  ['2027-01-04','speed','build','Speed 1 · Week 1'],
  ['2027-01-11','speed','heavy','Speed 1 · Week 2'],
  ['2027-01-18','speed','peak','Speed 1 · Week 3'],
  ['2027-01-25','speed','test','Speed 1 · Deload + retest'],
  ['2027-02-01','speed','build','Speed 2 · Week 1'],
  ['2027-02-08','speed','heavy','Speed 2 · Week 2'],
  ['2027-02-15','speed','peak','Speed 2 · Week 3'],
  ['2027-02-22','speed','deload','Speed 2 · Deload'],
  ['2027-03-01','conversion','build','Conversion 1 · Week 1'],
  ['2027-03-08','conversion','heavy','Conversion 1 · Week 2'],
  ['2027-03-15','conversion','peak','Conversion 1 · Week 3'],
  ['2027-03-22','conversion','test','Conversion 1 · Deload + retest'],
  ['2027-03-29','conversion','build','Conversion 2 · Week 1'],
  ['2027-04-05','taper','heavy','Pre-season · Week 1'],
  ['2027-04-12','taper','peak','Pre-season · Week 2'],
  ['2027-04-19','taper','deload','Pre-season · Deload'],
  ['2027-04-26','taper','heavy','Pre-season · Sharpen'],
  ['2027-05-03','taper','taper','Taper week'],
  ['2027-05-10','season','season','In-season']
];
const SEASON_END = '2027-10-03';

/* Mobility and warm-up routines. kind: hold (timed, per side), reps (tap Done), time (one block). */
const ROUTINES = {
  daily:{name:'Daily mobility', mins:15, when:'Every day, best after training or in the evening', items:[
    {name:'Foam roll calves', kind:'hold', sec:45, sides:2, cue:'Slow passes, pause on tender spots.'},
    {name:'Foam roll quads and hip flexors', kind:'hold', sec:45, sides:2, cue:'Face down, roll from just above the knee to the front of the hip.'},
    {name:'Foam roll glutes', kind:'hold', sec:45, sides:2, cue:'Sit on the roller, ankle crossed over the other knee, lean into that side.'},
    {name:'Foam roll upper back', kind:'hold', sec:60, sides:1, cue:'Arms crossed, roll between the shoulder blades. Not the lower back.'},
    {name:'Foam roll lats', kind:'hold', sec:30, sides:2, cue:'Lie on your side, arm overhead, roll from armpit to mid-ribs.'},
    {name:'Thoracic extension over roller', kind:'reps', reps:8, sets:2, cue:'Roller across the upper back, hands behind head, extend back over it.'},
    {name:'Open-book rotation', kind:'reps', reps:8, sets:2, sides:2, cue:'Side-lying, knees bent, open the top arm across and follow it with your eyes.'},
    {name:'Couch stretch', kind:'hold', sec:45, sides:2, cue:'Back knee against the wall or sofa, squeeze the back glute, stay tall.'},
    {name:'90/90 hip switches', kind:'reps', reps:8, sets:2, cue:'Sit with both knees at 90°, rotate them side to side without using your hands.'},
    {name:'Half-kneeling hamstring stretch', kind:'hold', sec:30, sides:2, cue:'Front leg straight, hinge forward from the hips with a flat back.'},
    {name:'Kneeling lat stretch', kind:'hold', sec:30, sides:1, sets:2, cue:'Hands on a bench, sit the hips back and sink the chest down.'},
    {name:'Doorway pec stretch', kind:'hold', sec:30, sides:2, cue:'Forearm on the door frame at shoulder height, step through gently.'},
    {name:'Band pull-aparts', kind:'reps', reps:15, sets:2, cue:'Straight arms, squeeze the shoulder blades. No shrugging.'},
    {name:'Band pass-throughs', kind:'reps', reps:10, sets:2, cue:'Wide grip, straight arms, over the head and behind, then back.'},
    {name:'Band external rotation', kind:'reps', reps:15, sets:2, sides:2, cue:'Elbow tucked at your side, rotate the forearm out slowly.'}
  ]},
  activation:{name:'Pre-volleyball activation', mins:8, when:'Before the team warm-up and on game days', items:[
    {name:'Arm circles', kind:'reps', reps:10, sides:2, cue:'Small to large, forwards then backwards.', sideNames:['Forwards','Backwards']},
    {name:'Band pull-aparts', kind:'reps', reps:15, cue:'Straight arms, squeeze the shoulder blades.'},
    {name:'Band external rotation', kind:'reps', reps:12, sides:2, cue:'Elbow tucked at your side.'},
    {name:'Band pass-throughs', kind:'reps', reps:10, cue:'Wide grip, straight arms.'},
    {name:'Band Y raises', kind:'reps', reps:10, cue:'Arms overhead in a Y, thumbs up, lift from the shoulder blades.'},
    {name:'Wall open-books', kind:'reps', reps:6, sides:2, cue:'Standing side-on to a wall, rotate the top arm open.'},
    {name:'Leg swings', kind:'reps', reps:10, sides:2, cue:'Forwards and sideways on each leg.'},
    {name:'World’s greatest stretch', kind:'reps', reps:4, sides:2, cue:'Lunge, elbow to instep, rotate the arm up. 2 s pause at the end of each.'}
  ]},
  extended:{name:'Extended mobility', mins:30, when:'Friday off, Session C, or a Saturday with no games', items:[
    {name:'Foam roll calves (+ massage gun)', kind:'hold', sec:60, sides:2, cue:'Roll, then 30 s with the massage gun.'},
    {name:'Foam roll quads (+ massage gun)', kind:'hold', sec:60, sides:2, cue:'Include the hip flexors.'},
    {name:'Foam roll glutes', kind:'hold', sec:45, sides:2, cue:'Ankle over knee, lean into the working side.'},
    {name:'Foam roll upper back', kind:'hold', sec:60, sides:1, cue:'Arms crossed, between the shoulder blades.'},
    {name:'Massage gun on pecs', kind:'hold', sec:45, sides:2, cue:'Light pressure, avoid the collarbone and armpit.'},
    {name:'Couch stretch', kind:'hold', sec:75, sides:2, sets:2, cue:'Squeeze the back glute and stay tall.'},
    {name:'Frog stretch', kind:'hold', sec:60, sides:1, sets:2, cue:'Knees wide, rock the hips gently back.'},
    {name:'Deep squat hold with rotations', kind:'hold', sec:45, sides:1, sets:2, cue:'Sit in the bottom of a squat, rotate one arm up at a time.'},
    {name:'Knee-to-wall ankle stretch', kind:'reps', reps:10, sets:2, sides:2, cue:'Heel down, knee drives over the toes to the wall.'},
    {name:'Sleeper stretch (gentle)', kind:'hold', sec:30, sides:2, sets:2, cue:'Lying on your side, press the forearm down gently. Never painful.'},
    {name:'Thread the needle', kind:'reps', reps:8, sets:2, sides:2, cue:'On all fours, reach one arm under and then up to the ceiling.'},
    {name:'Wall slides', kind:'reps', reps:10, sets:2, cue:'Back and arms against the wall, slide up without arching.'},
    {name:'Side-lying external rotation', kind:'reps', reps:15, sets:2, sides:2, cue:'Light dumbbell, slow.'},
    {name:'Heated cupping', kind:'time', sec:600, cue:'One zone today, rotating A (posterior legs), B (back), C (chest and shoulders).'}
  ]},
  gymwarm:{name:'Gym warm-up', mins:12, when:'Before Gym A and Gym B', items:[
    {name:'Easy bike or rower', kind:'time', sec:210, cue:'Easy pace to get warm.'},
    {name:'Open-book rotation', kind:'reps', reps:8, sides:2, cue:'Side-lying, follow the hand with your eyes.'},
    {name:'Couch stretch', kind:'hold', sec:30, sides:2, cue:'Short hold before lifting.'},
    {name:'World’s greatest stretch', kind:'reps', reps:5, sides:2, cue:'Lunge, elbow to instep, rotate up.'},
    {name:'Band pull-aparts', kind:'reps', reps:15, cue:'Squeeze the shoulder blades.'},
    {name:'Band external rotation', kind:'reps', reps:15, sides:2, cue:'Elbow tucked.'},
    {name:'Glute bridges', kind:'reps', reps:10, cue:'Squeeze at the top for a second.'},
    {name:'Pogo hops', kind:'reps', reps:10, sets:2, cue:'Quick, light contacts.'},
    {name:'Build-up jumps', kind:'reps', reps:3, sets:3, cue:'3 at 50%, 3 at 80%, then 3 maximal CMJs. Log those as your readiness check.', setNames:['50% effort','80% effort','100%: readiness CMJs']}
  ]},
  primer:{name:'Tuesday speed primer', mins:15, when:'Straight after the team warm-up on Tuesday', items:[
    {name:'5 m sprints from defensive stance', kind:'reps', reps:6, cue:'Mixed directions, walk back between reps.'},
    {name:'Reactive starts', kind:'reps', reps:6, cue:'Go on your partner’s cue.'},
    {name:'Split-step, shuffle, sprawl', kind:'reps', reps:4, sets:2, cue:'Get up fast every time.'}
  ]},
  gameday:{name:'Game-day warm-up', mins:25, when:'25–30 minutes before your first match', items:[
    {name:'Jog, skips and lateral shuffles', kind:'time', sec:300, cue:'In the sand, building gradually.'},
    {name:'Shoulder prep', kind:'time', sec:300, cue:'Open-books, band pull-aparts, external rotations, arm circles.'},
    {name:'Hip prep', kind:'time', sec:300, cue:'Leg swings, deep squat holds, walking lunges with a reach.'},
    {name:'Accelerations', kind:'reps', reps:5, cue:'Short, sharp, building to full speed.'},
    {name:'Approach jumps', kind:'reps', reps:5, cue:'3 at 80%, then 2 at 100%.'},
    {name:'Ball warm-up with your partner', kind:'time', sec:600, cue:'Between matches: stay warm, small carb snack, sip fluids, and repeat the accelerations briefly.'}
  ]}
};

/* Weekly plan by weekday (0 = Sunday). Friday, Saturday and Sunday have choices. */
const DAYS = {
  1:{title:'Gym A day', items:[{mob:'gymwarm'}, {gym:'A'}, {mob:'daily', note:'After the gym or in the evening'}], fuel:'train'},
  2:{title:'Volleyball', items:[{mob:'activation', note:'Before the team warm-up'}, {mob:'primer'}, {event:'Volleyball', time:'17:30–21:30'}, {mob:'daily', note:'After volleyball'}],
     fuel:'train', fuelNote:'Add 50–80 g carbs during or after the 4-hour session.'},
  3:{title:'Volleyball', items:[{event:'Optional easy bike', time:'30 min, earlier in the day'}, {mob:'activation', note:'Before the team warm-up'}, {event:'Volleyball', time:'20:00–21:30'}, {mob:'daily'}], fuel:'train'},
  4:{title:'Gym B day', items:[{mob:'gymwarm'}, {gym:'B'}, {mob:'daily', note:'After the gym or in the evening'}], fuel:'train'},
  5:{choices:{
      vb:{label:'Volleyball 07:00', title:'Morning volleyball', items:[{mob:'activation'}, {event:'Volleyball', time:'07:00–09:00'}, {mob:'daily'}], fuel:'train',
          fuelNote:'Have the yoghurt bowl at 06:15, then Meal 1 at 10:00.'},
      c:{label:'Light session', title:'Light session', items:[{gym:'C'}, {mob:'extended'}], fuel:'rest'},
      off:{label:'Off', title:'Rest day', items:[{mob:'extended'}], fuel:'rest'}
    }, def:'vb'},
  6:{choices:{
      games:{label:'Games', title:'Game day', items:[{mob:'activation'}, {mob:'gameday'}, {event:'Games'}, {mob:'daily', note:'In the evening'}], fuel:'train',
             fuelNote:'Pause the deficit. Carb-based meal 2–3 h before the first match, small snacks between.'},
      d:{label:'Sand session', title:'Sand speed', items:[{gym:'D'}, {mob:'daily'}], fuel:'train'},
      off:{label:'Off', title:'Rest day', items:[{mob:'extended'}], fuel:'rest'}
    }, def:'games'},
  0:{choices:{
      games:{label:'Games', title:'Game day', items:[{mob:'activation'}, {mob:'gameday'}, {event:'Games'}, {mob:'daily', note:'In the evening'}], fuel:'train',
             fuelNote:'Pause the deficit on game days.'},
      off:{label:'Off', title:'Rest day', items:[{mob:'daily'}, {event:'Easy walk', time:'30–45 min'}], fuel:'rest'}
    }, def:'games'}
};

const FUEL = {
  train:{kcal:'~3,000', p:'185 g', c:'380–400 g', f:'75–80 g', label:'Training day'},
  rest:{kcal:'~2,500', p:'185 g', c:'240–260 g', f:'80–85 g', label:'Rest day'}
};

/* ---- calendar helpers ---- */
const parse = s => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };
const iso = d => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
function mondayOf(s){ const d = parse(s); d.setDate(d.getDate() - ((d.getDay() + 6) % 7)); return iso(d); }
function baseWeek(s){
  const mon = mondayOf(s);
  const row = CAL.find(r => r[0] === mon);
  if (row) return {start:mon, phase:row[1], type:row[2], label:row[3]};
  if (mon < CAL[0][0]) return {start:mon, phase:'reset', type:'build', label:'Before the block'};
  if (mon <= SEASON_END) return {start:mon, phase:'season', type:'season', label:'In-season'};
  return {start:mon, phase:'reset', type:'build', label:'Block finished', finished:true};
}
function weekInfo(s, overrides){
  const w = baseWeek(s); const o = overrides && overrides[w.start];
  if (o && WEEKTYPES[o]) w.type = o, w.overridden = true;
  return w;
}
function allWeeks(){
  const out = [];
  for (const r of CAL) out.push({start:r[0], phase:r[1], type:r[2], label:r[3]});
  let d = parse(CAL[CAL.length - 1][0]); d.setDate(d.getDate() + 7);
  while (iso(d) <= SEASON_END){ out.push({start:iso(d), phase:'season', type:'season', label:'In-season'}); d.setDate(d.getDate() + 7); }
  return out;
}

/* Build a session's exercise list for a given date. */
function program(sk, s, overrides){
  const w = weekInfo(s, overrides);
  const notes = [];
  let ids = SESSIONS[sk].ids.slice();
  const o = (PH[w.phase] || {})[sk] || {};
  if (o._note) notes.push(o._note);
  ids = ids.filter(id => !(o._drop || []).includes(id));
  if (o._add){ const i = ids.indexOf(o._add.after); if (i >= 0) ids.splice(i + 1, 0, o._add.id); }
  let list = ids.map(id => Object.assign({id}, EX[id], o[id] || {}));
  const half = e => { e.sets = Math.max(1, Math.ceil(e.sets / 2)); };
  const shiftPct = (e, d) => { if (e.pct) e.pct = [Math.max(50, e.pct[0] + d), Math.max(50, e.pct[1] + d)]; };

  if (w.type === 'test' && sk === 'A'){
    const sq = list.find(e => e.id === 'sq');
    list = ['t_cmj','t_cmja','t_sj','t_reach','t_appr'].map(id => Object.assign({id}, EX[id]))
      .concat(sq ? [Object.assign({}, sq, {sets:5, reps:'3, building', target:3, pct:null, load:'Work up to a hard but clean 3RM', cue:'Build in jumps of 10–20 kg. Full depth only. Stop at the last set that moved well, then update your max in Settings.'})] : [])
      .concat(list.filter(e => ['rdl','pu','calf'].includes(e.id)).map(e => { e = Object.assign({}, e); half(e); return e; }));
    notes.push('Test day: jumps first while fresh, then the squat. Retest on the same surface each time.');
  } else if (w.type === 'tournament'){
    if (sk === 'A'){
      list = [Object.assign({id:'sq'}, EX.sq, {sets:2, reps:'2', target:2, pct:[80,80], cue:'Crisp and fast. Early in the week, at least 3–4 days before the first match.'}), Object.assign({id:'calf'}, EX.calf, {sets:2})];
      notes.push('Tournament primer: in and out in 30 minutes.');
    } else if (sk === 'B'){ list = []; notes.push('Skip Gym B in a tournament week.'); }
    else list.forEach(half);
  } else {
    for (const e of list){
      if (w.type === 'heavy' && e.main) shiftPct(e, 2.5);
      if (w.type === 'peak' && e.main){ shiftPct(e, 5); if (e.target > 2){ e.target -= 1; e.reps = String(e.target); } }
      if (w.type === 'deload' || (w.type === 'test' && sk !== 'A')){ half(e); if (e.main) shiftPct(e, -10); }
      if (w.type === 'taper') half(e);
    }
  }
  return {week:w, notes, list};
}

function dayPlan(s, choice){
  const wd = parse(s).getDay(); const d = DAYS[wd];
  if (d.choices){ const k = d.choices[choice] ? choice : d.def; return Object.assign({choice:k, choices:d.choices}, d.choices[k]); }
  return Object.assign({choice:null}, d);
}
function defaultSession(s){ return ({1:'A', 2:'A', 3:'B', 4:'B', 5:'C', 6:'D', 0:'A'})[parse(s).getDay()]; }

return {EX, SESSIONS, PHASES, WEEKTYPES, CAL, ROUTINES, DAYS, FUEL, weekInfo, allWeeks, program, dayPlan, defaultSession, mondayOf, iso, parse};
})();
