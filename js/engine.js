/* Рушій уроку: один крок на екрані, прогрес, збереження в браузері, картка-нагорода. */
(function () {
  const L = window.LESSON;
  // Останній крок кожного уроку: «Що ми вже вміємо» + завдання Tinkercad (додається автоматично)
  if ((L.skills || L.practice) && !L.steps.some(x => x.type === 'summary')) L.steps.push({ type: 'summary', kind: 'summary', title: 'Що ми вже вміємо' });
  const SITE_URL = (window.SITE && SITE.url) || location.href;
  const KEY = 'electro-progress-' + L.id;
  const $ = s => document.querySelector(s);

  /* ---------- Збереження ---------- */
  let state = { step: 0, done: {}, mistakes: {}, name: '' };
  try { Object.assign(state, JSON.parse(localStorage.getItem(KEY) || '{}')); } catch (e) {}
  const save = () => {
    state.total = L.steps.length;
    state.complete = L.steps.every((_, i) => state.done[i]);
    if (state.complete) state.card = {
      number: L.number, title: L.title, lines: L.cardLines || [], stars: stars(),
      date: (state.card && state.card.date) || new Date().toISOString().slice(0, 10)   // дата першого проходження
    };
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) {}
  };

  const total = L.steps.length;
  const allDone = () => L.steps.every((_, i) => state.done[i]);

  /* ---------- Прогрес-смуга ----------
     Кожен сегмент забарвлений за типом кроку (як тло кроку): пояснення, «Поміркуй», «Зроби сам»…
     Пройдений — насичений колір, ще не пройдений — блідий. На сегмент можна натиснути й перейти
     до будь-якого пройденого кроку або до першого непройденого. */
  const KIND_NAME = { summary: 'Підсумок', trainer: 'Тренажер',  theory: 'Пояснення', think: 'Поміркуй', task: 'Зроби сам', together: 'Зробимо разом' };
  const kindOf = st => st.kind || ({ scene: 'theory', predict: 'think', try: 'task', measure: 'task', tune: 'task', switch: 'task', material: 'task', toggle: 'task', gen: 'trainer', match: 'think', flip: 'task', code: 'task', order: 'task', sort: 'task', pot: 'task', pwm: 'task', live: 'task' })[st.type] || 'theory';
  const reachable = i => { const f = L.steps.findIndex((_, k) => !state.done[k]); return f < 0 || i <= f; };
  function drawProgress() {
    const bar = $('#progress');
    bar.innerHTML = L.steps.map((st, i) => {
      const label = `Крок ${i + 1} · ${KIND_NAME[kindOf(st)]}${st.title ? ': ' + st.title : ''}`;
      return `<button class="seg k-${kindOf(st)} ${state.done[i] ? 'done' : ''} ${i === state.step ? 'now' : ''}" data-i="${i}" title="${label.replace(/"/g, '&quot;')}" aria-label="${label.replace(/"/g, '&quot;')}" ${reachable(i) ? '' : 'disabled'}></button>`;
    }).join('') +
      `<button class="seg reward ${allDone() ? 'done' : ''} ${state.step === total ? 'now' : ''}" data-i="${total}" title="Нагорода" aria-label="Нагорода" ${allDone() ? '' : 'disabled'}>★</button>`;
    bar.querySelectorAll('.seg').forEach(b => b.onclick = () => { if (+b.dataset.i !== state.step) go(+b.dataset.i); });
  }

  /* ---------- Кроки ---------- */
  const view = $('#step');
  let cleanup = null;

  /* Журнал: коли урок почато, коли пройдено кожен крок (потрапляє у файл прогресу) */
  if (!state.startedAt) { state.startedAt = new Date().toISOString(); }
  function markDone(i) {
    if (!state.done[i]) {
      state.done[i] = true;
      state.doneAt = state.doneAt || {}; state.doneAt[i] = new Date().toISOString();
      if (L.steps.every((_, k) => state.done[k]) && !state.completedAt) state.completedAt = new Date().toISOString();
      save();
    }
    updateNav(); drawProgress();
  }
  function mistake(i) { if (!state.done[i]) { state.mistakes[i] = (state.mistakes[i] || 0) + 1; save(); } }

  /* Схема + (за бажанням) перемикач «Деталі / Схема» */
  let curView = null;
  function circuitBlock(name, st) {
    if (!name) return '';
    // Схема за замовчуванням для пояснень і запитань; для дослідів — «Деталі». st.view — явний вибір
    curView = (st && st.view) || (st && ['scene', 'predict'].includes(st.type) ? 'schematic' : L.circuits[name].view || 'schematic');
    const tg = !st || st.views !== false ? `<div class="view-toggle" role="group" aria-label="Вигляд">
        <button data-v="real" class="${curView === 'real' ? 'on' : ''}">Деталі</button><button data-v="schematic" class="${curView === 'schematic' ? 'on' : ''}">Схема</button></div>` : '';
    return `<div class="scheme">${tg}<svg id="sv${state.step}" class="circuit" role="img" aria-label="Схема"></svg></div>`;
  }

  function mountCircuit(name, anim) {
    const svg = view.querySelector('svg.circuit');
    if (!svg) return null;
    const c = Circuit.render(svg, L.circuits[name], curView);
    c.setCurrent(0);
    const dm = L.circuits[name].meters; if (dm) for (const [id, t] of Object.entries(dm)) c.setMeter(id, t);   // статичні покази приладів
    if (anim) {
      const s = MODELS[anim.model](anim.params);
      c.setCurrent(s.I); if (anim.led) c.setLed(anim.led, s.level, s.burnt);
      applyState(c, s);
    }
    return c;
  }

  /* Застосувати стан моделі до схеми: лампочки, струми по дротах, покази амперметрів */
  function applyState(c, s) {
    if (!c || !s) return;
    if (s.lamps) for (const [id, lv] of Object.entries(s.lamps)) c.setLamp(id, lv);
    if (s.nets) c.setNetCurrents(s.nets);
    if (s.meters) for (const [id, t] of Object.entries(s.meters)) c.setMeter(id, t);
  }

  /* Перемикач вигляду: перемальовує схему й повторно застосовує стан */
  function bindToggle(onSwitch) {
    view.querySelectorAll('.view-toggle button').forEach(b => b.onclick = () => {
      curView = b.dataset.v;
      view.querySelectorAll('.view-toggle button').forEach(x => x.classList.toggle('on', x === b));
      onSwitch();
    });
  }

  const catImg = (k, cls = 'cat') => k && window.CATS[k] ? `<img class="${cls}" src="${window.CATS[k]}" alt="">` : '';

  /* Вигляд кроку — як макети слайдів: пояснення, «Поміркуй», «Зроби сам», «Зробимо разом» */
  const KINDS = {
    theory:   { label: '',              cat: null },
    think:    { label: 'Поміркуй',      cat: 'think' },
    task:     { label: 'Зроби сам',     cat: 'measure' },
    together: { label: 'Зробимо разом', cat: 'happy' },
    trainer:  { label: 'Тренажер',      cat: 'thumb' },
    summary:  { label: 'Підсумок',      cat: 'happy' }
  };
  const DEFAULT_KIND = { scene: 'theory', predict: 'think', try: 'task', measure: 'task', tune: 'task', switch: 'task', material: 'task', toggle: 'task', gen: 'trainer', match: 'think', flip: 'task', code: 'task', order: 'task', sort: 'task', pot: 'task', pwm: 'task', live: 'task' };
  function frame(st, inner) {
    const kind = st.kind || DEFAULT_KIND[st.type] || 'theory';
    const k = KINDS[kind];
    view.innerHTML = `<div class="panel kind-${kind}">${k.cat ? catImg(st.panelCat || k.cat, 'panel-cat') : ''}
      ${k.label ? `<div class="badge">${k.label}</div>` : ''}${inner}</div>`;
    autofit();
  }
  /* Підігнати viewBox малюнків окремих деталей під їхній вміст */
  function autofit(root = view) {
    root.querySelectorAll('svg.autofit').forEach(svg => {
      try { const b = svg.querySelector('g').getBBox(), p = 8; if (b.width) svg.setAttribute('viewBox', `${b.x - p} ${b.y - p} ${b.width + 2 * p} ${b.height + 2 * p}`); } catch (e) {}
    });
  }

  /* Ілюстрація кроку: схема, малюнок (figure) або формула з картками величин */
  function visual(st) {
    let h = '';
    if (st.circuit) h += circuitBlock(st.circuit, st);
    if (st.figure) {
      const fc = st.figureControl;
      h += `<div class="scheme"><div class="fig-wrap">${FIGURES[st.figure](st.figureOpts)}</div>${fc ? `
        <label class="fig-ctl">${fc.label}<input type="range" min="${fc.min}" max="${fc.max}" step="${fc.step || 1}" value="${(st.figureOpts || {})[fc.param] ?? fc.min}"></label>` : ''}</div>`;
    }
    if (st.image) h += `<div class="sticker"><img src="${st.image}" alt="${st.imageAlt || ''}"></div>`;
    if (st.formula) h += `<div class="formula">${st.formula}</div>`;
    if (st.cards) h += `<div class="qty">${st.cards.map(c => `<div class="q"><b class="sym">${c.sym}</b><div><b>${c.name}</b><span>${c.unit}</span>${c.hint ? `<em>${c.hint}</em>` : ''}</div></div>`).join('')}</div>`;
    /* Приклади до формули: example — один, examples — кілька (стають поруч) */
    const exs = st.examples || (st.example ? [st.example] : []);
    if (exs.length) h += `<div class="examples">${exs.map((e, k) => `<div class="example"><b class="ex-t">${e.title || (exs.length > 1 ? 'Приклад ' + (k + 1) : 'Приклад')}</b><p>${e.given}</p>${e.lines.map(l => `<div class="ex-line">${l}</div>`).join('')}</div>`).join('')}</div>`;
    return h;
  }
  /* Повзунок під малюнком перемальовує його з новим параметром */
  function bindFigure(st) {
    const wrapEl = view.querySelector('.fig-wrap');
    if (wrapEl && st.figureGoal && window.FIGURE_INTERACT && FIGURE_INTERACT[st.figure]) {
      const i = state.step;
      FIGURE_INTERACT[st.figure](wrapEl, st, () => markDone(i));
    }
    const fc = st.figureControl; if (!fc) return;
    const inp = view.querySelector('.fig-ctl input'), wrap = view.querySelector('.fig-wrap');
    inp.oninput = () => { wrap.innerHTML = FIGURES[st.figure]({ ...st.figureOpts, [fc.param]: +inp.value }); };
  }

  /* Після малювання схеми: анімація струму, показ приладу, щупи */
  function mountVisual(st) {
    bindFigure(st);
    const c = mountCircuit(st.circuit, st.animate);
    if (c && st.meter) c.setMeter(st.meter.part, st.meter.text);
    if (c && st.hidePart) c.setPartVisible(st.hidePart, false);
    if (c && st.probes) { c.setProbes(st.probes.red, st.probes.black); }
    return c;
  }
  /* Пунктирні «місця-кандидати» для приладу на схемі; hi — індекс підсвіченого (неправильного) */
  function drawCandidates(st, hi) {
    const svg = view.querySelector('svg.circuit'); if (!svg || !st.candidates) return;
    svg.querySelectorAll('.cand').forEach(n => n.remove());
    st.candidates.forEach((c, k) => {
      const col = k === hi ? '#E53281' : '#EE7E42';
      const leads = (c.leads || []).map(l => `<polyline points="${l.map(p => p.join(',')).join(' ')}" fill="none" stroke="${col}" stroke-width="3" stroke-dasharray="7 6"/>`).join('');
      const cx = c.x + c.w / 2, cy = c.y + c.h / 2;
      svg.insertAdjacentHTML('beforeend', `<g class="cand${k === hi ? ' wrong' : ''}">${leads}
        <rect x="${c.x}" y="${c.y}" width="${c.w}" height="${c.h}" rx="8" fill="#fff" stroke="${col}" stroke-width="3" stroke-dasharray="7 6"/>
        <text x="${cx}" y="${cy + 7}" text-anchor="middle" font-size="20" font-weight="800" fill="${col}">A?</text>
        <circle cx="${c.x}" cy="${c.y}" r="12" fill="${col}"/><text x="${c.x}" y="${c.y + 5}" text-anchor="middle" font-size="14" font-weight="800" fill="#fff">${k + 1}</text></g>`);
    });
  }
  /* Після правильної відповіді показати «правильну» схему замість кандидатів */
  function showAfter(st) {
    const a = st.after, svg = view.querySelector('svg.circuit');
    const c = Circuit.render(svg, L.circuits[a.circuit], curView);
    if (a.animate) { const m = MODELS[a.animate.model](a.animate.params); c.setCurrent(m.I); applyState(c, m); }
    if (a.meter) c.setMeter(a.meter.part, a.meter.text);
  }

  const meterDev = (mode, text) => `<div class="meter-dev"><span class="md-mode">${mode}</span><span class="md-disp" id="mdisp">${text}</span></div>`;

  /* Потенціометр: у «Деталях» ручку обертають по колу (вона повертається слідом за мишкою),
     у «Схемі» повзунок тягнуть уздовж резистора ліворуч-праворуч */
  function potDrag(g, getPos, setPos) {
    g.onpointerdown = e => {
      e.preventDefault();
      const knob = g.querySelector('[id$="-knob"]');
      let move;
      if (knob) {
        const svg = knob.ownerSVGElement, pt = svg.createSVGPoint(); pt.x = 50; pt.y = 18;
        const c = pt.matrixTransform(knob.parentNode.getScreenCTM());
        const ang = ev => Math.atan2(ev.clientX - c.x, c.y - ev.clientY) * 180 / Math.PI;   // 0° — вгору, +90° — праворуч
        let last = ang(e);
        move = ev => {
          const a = ang(ev); let d = a - last; last = a;
          if (d > 180) d -= 360; if (d < -180) d += 360;      // перехід через низ кола
          setPos(Math.max(0, Math.min(1, getPos() + d / 270)));   // ручка повертається на той самий кут, що й мишка навколо неї
        };
      } else {
        const x0 = e.clientX, p0 = getPos();
        move = ev => setPos(Math.max(0, Math.min(1, p0 + (ev.clientX - x0) / 180)));
      }
      const up = () => { document.removeEventListener('pointermove', move); document.removeEventListener('pointerup', up); };
      document.addEventListener('pointermove', move); document.addEventListener('pointerup', up);
    };
  }

  const RENDER = {
    scene(st, i) {
      frame(st, `${st.title ? `<h2>${st.title}</h2>` : ''}${st.visualAfter ? '' : visual(st)}<div class="txt">${st.text}</div>${st.visualAfter ? visual(st) : ''}${st.textAfter ? `<div class="txt">${st.textAfter}</div>` : ''}`);   // visualAfter: малюнок під текстом
      mountVisual(st);
      bindToggle(() => mountVisual(st));
      if (!st.figureGoal) markDone(i);
    },

    /* Співставлення: кілька малюнків, для кожного обрати варіант зі спільного списку */
    match(st, i) {
      state.answers = state.answers || {};
      const pick = state.answers[i] = state.answers[i] || {};
      frame(st, `${st.title ? `<h2>${st.title}</h2>` : ''}<div class="lead">${st.text}</div>
        ${st.figure ? `<div class="scheme"><div class="fig-wrap">${FIGURES[st.figure](st.figureOpts || {})}</div></div>` : ''}
        <div class="match-grid${st.figure ? ' shared' : ''}${st.compact ? ' compact' : ''}">${st.items.map((it, k) => `<div class="match-card${it.figure ? '' : ' nofig'}" data-k="${k}">
          <div class="match-h">${it.label}</div>
          ${it.figure ? `<div class="match-fig">${FIGURES[it.figure](it.figureOpts || {})}</div>` : ''}
          ${it.text ? `<p class="small match-t">${it.text}</p>` : ''}
          <div class="match-ch">${st.choices.map((c, n) => `<button class="mch" data-n="${n}">${c}</button>`).join('')}</div>
          <p class="match-fb small"></p></div>`).join('')}</div>
        <button class="primary match-check">Перевірити</button>
        <div class="feedback" aria-live="polite"></div>`);
      const fb = view.querySelector('.feedback'), chk = view.querySelector('.match-check');
      const paint = (checked) => view.querySelectorAll('.match-card').forEach(card => {
        const k = +card.dataset.k, it = st.items[k];
        card.querySelectorAll('.mch').forEach(b => b.classList.toggle('sel', pick[k] === +b.dataset.n));
        card.classList.remove('ok', 'bad'); card.querySelector('.match-fb').innerHTML = '';
        if (checked && pick[k] != null) {
          const ok = pick[k] === it.answer;
          card.classList.add(ok ? 'ok' : 'bad');
          card.querySelector('.match-fb').innerHTML = ok ? (it.ok || 'Так!') : (it.why || 'Подивись ще раз, які отвори з\u2019єднані.');
        }
      });
      const all = () => st.items.every((_, k) => pick[k] != null);
      chk.disabled = !all();
      view.querySelectorAll('.match-card').forEach(card => card.querySelectorAll('.mch').forEach(b => b.onclick = () => {
        pick[+card.dataset.k] = +b.dataset.n; save(); paint(false); chk.disabled = !all(); fb.className = 'feedback'; fb.innerHTML = '';
      }));
      chk.onclick = () => {
        paint(true);
        const wrong = st.items.filter((it, k) => pick[k] !== it.answer).length;
        if (!wrong) { fb.className = 'feedback good'; fb.innerHTML = `${catImg('good', 'cat-mini')}<p>${st.done}</p>`; markDone(i); }
        else { mistake(i); fb.className = 'feedback bad'; fb.innerHTML = `${catImg('help', 'cat-mini')}<p>Неправильно: ${wrong}. Зміни відповідь і перевір ще раз.</p>`; }
      };
      if (state.done[i]) paint(true);
    },

    /* Розвернути деталь (світлодіод): клік міняє полярність */
    flip(st, i) {
      let flipped = false, flips = 0;
      frame(st, `${st.title ? `<h2>${st.title}</h2>` : ''}<div class="lead">${st.text}</div>${circuitBlock(st.circuit, st)}
        <div class="feedback" aria-live="polite"></div>`);
      const fb = view.querySelector('.feedback');
      const build = () => {
        const d = JSON.parse(JSON.stringify(L.circuits[st.circuit]));
        if (flipped) {
          d.parts[st.part].type = 'led-rev';
          const A = st.part + '.A', K = st.part + '.K';
          for (const k in d.nets) d.nets[k] = d.nets[k].map(r => r === A ? K : r === K ? A : r);
        }
        L.circuits.__flip = d;
        const c = mountCircuit('__flip');
        const s = MODELS[st.model](st.params);
        if (!flipped) { c.setCurrent(s.I); c.setLed(st.part, s.level); } else { c.setCurrent(0); c.setLed(st.part, 0); }
        const g = view.querySelector(`[data-id="${st.part}"]`);
        if (g) { g.classList.add('clickable'); g.onclick = () => { flipped = !flipped; build(); fb.className = 'feedback ' + (flipped ? 'bad' : 'good'); fb.innerHTML = `${catImg(flipped ? 'surprised' : 'good', 'cat-mini')}<p>${flipped ? st.msgs.off : st.msgs.on}</p>`; flips++; if (!flipped && flips >= 2) markDone(i); }; }   // зараховуємо, коли розвернули і повернули назад
        return c;
      };
      build();
      bindToggle(build);
    },

    /* Код Arduino: пропуски-списки / числа або вільне редагування; симуляція, підсвітка рядка, часова діаграма */
    code(st, i) {
      const tpl = st.code;
      const LEDS = st.leds || [{ pin: st.pin, led: st.led }];
      const off = new Set((state.answers && state.answers[i]) || []);   // «прибрані» рядки (st.removable)
      const slots = [];
      const lines = tpl.split('\n');
      const html = lines.map((ln, k) => {
        const esc = ln.replace(/&/g, '&amp;').replace(/</g, '&lt;');
        const body = esc.replace(/\[\[(sel|num):([^\]]*)\]\]/g, (_, kind, arg) => {
          const n = slots.length; slots.push({ kind, arg });
          if (kind === 'sel') { const opts = arg.split('|'); return `<select class="cslot" data-n="${n}">${opts.map(o => `<option>${o}</option>`).join('')}</select>`; }
          return `<input class="cslot num" data-n="${n}" type="number" min="0" step="50" value="${arg}">`;
        });
        return `<div class="cl${st.removable ? ' rm' : ''}" data-ln="${k + 1}"><span class="ln">${k + 1}</span><span class="ct">${body || ' '}</span></div>`;
      }).join('');
      const editor = st.editable
        ? `<div class="code-edit"><div class="code-gutter" aria-hidden="true"></div><textarea class="code-ta" spellcheck="false" autocapitalize="off" autocomplete="off">${tpl.replace(/</g, '&lt;')}</textarea></div>`
        : `<pre class="code">${html}</pre>`;
      frame(st, `${st.title ? `<h2>${st.title}</h2>` : ''}<div class="lead">${st.text}</div>
        <div class="code-wrap">${editor}<div class="code-side">${circuitBlock(st.circuit, st)}${st.meter ? meterDev('V', '0,0 В') : ''}</div></div>
        ${st.editable ? '<div class="actions"><button class="primary code-run">▶ Запустити</button></div>' : ''}
        <div class="code-msg"></div>
        ${st.diagram ? `<div class="timing-wrap"><div class="small">Часова діаграма ${LEDS.length > 1 ? 'виводів ' + LEDS.map(x => x.pin).join(' і ') : 'виводу ' + st.pin}</div><div class="timing-box"></div></div>` : ''}
        ${st.question ? `<p class="q">${st.question}</p>` : ''}
        <div class="feedback" aria-live="polite"></div>`);
      const msg = view.querySelector('.code-msg'), fb = view.querySelector('.feedback');
      let c = mountCircuit(st.circuit), res = null, raf = 0, t0 = 0;
      const model = MODELS.ledSeries({ V: 5, R: 220, Vf: 2, ...(st.params || {}) });
      const T = st.T || 4000;
      const ta = view.querySelector('.code-ta'), gut = view.querySelector('.code-gutter');
      const gutter = () => { if (gut) gut.innerHTML = ta.value.split('\n').map((_, k) => `<span>${k + 1}</span>`).join(''); };
      const source = () => {
        if (ta) return ta.value;
        let n = 0;
        const full = tpl.replace(/\[\[(sel|num):([^\]]*)\]\]/g, () => { const el = view.querySelector(`.cslot[data-n="${n++}"]`); return el.value === '' ? '0' : el.value; });
        return full.split('\n').map((l, k) => off.has(k + 1) ? '' : l).join('\n');
      };
      const hl = ln => view.querySelectorAll('.cl').forEach(e => e.classList.toggle('run', +e.dataset.ln === ln));
      const apply = t => {
        const lvs = LEDS.map(x => res && res.ok ? ArduinoSim.levelAt(res, x.pin, t) : 0), lv = lvs[0];
        if (LEDS.length > 1) { const nets = {}; LEDS.forEach((x, k) => (x.nets || []).forEach(n => nets[n] = (nets[n] || 0) + (lvs[k] ? model.I : 0))); c.setNetCurrents(nets); }
        else c.setCurrent(lv ? model.I : 0);
        LEDS.forEach((x, k) => c.setLed(x.led, lvs[k] ? model.level : 0));
        const md = view.querySelector('#mdisp'); if (md) md.textContent = lv ? '5,0 В' : '0,0 В';
        if (res && res.ok) hl(ArduinoSim.lineAt(res, t));
        view.querySelectorAll('.timing .cursor').forEach(cur => { const x = ArduinoSim.diagram.X(T, t % T); cur.setAttribute('x1', x); cur.setAttribute('x2', x); });
      };
      const play = () => {
        cancelAnimationFrame(raf);
        if (!res || !res.ok) return;
        const span = Math.min(T, Math.max(res.end, 1));
        const loopy = res.end > 0;
        t0 = performance.now();
        const tick = now => {
          let t = now - t0;
          if (loopy) t = t % span; else t = Math.min(t, span);
          apply(t);
          raf = requestAnimationFrame(tick);
        };
        if (loopy) raf = requestAnimationFrame(tick); else apply(Math.max(res.end, 0) + 1);
      };
      cleanup = () => cancelAnimationFrame(raf);
      const runIt = (user) => {
        res = ArduinoSim.run(source(), { maxTime: T * 3 });
        view.querySelectorAll('.cl').forEach(e => e.classList.remove('err'));
        if (!res.ok) {
          msg.className = 'code-msg bad';
          msg.innerHTML = `⚠️ Рядок ${res.error.line}: ${res.error.msg}`;
          const e = view.querySelector(`.cl[data-ln="${res.error.line}"]`); if (e) e.classList.add('err');
          cancelAnimationFrame(raf); apply(0); hl(null);
          if (user) mistake(i);
          return;
        }
        msg.className = 'code-msg' + (res.warnings.length ? ' warn' : ' ok');
        msg.innerHTML = res.warnings.length ? res.warnings.map(w => `💡 ${w.line ? 'Рядок ' + w.line + ': ' : ''}${w.msg}`).join('<br>') : (st.editable ? '✅ Програма запустилася' : '');
        const box = view.querySelector('.timing-box'); if (box) box.innerHTML = LEDS.map(x => ArduinoSim.diagram(res, x.pin, T, { color: x.color, label: x.label })).join('');
        play();
        if (st.goal) {
          const g = st.goal(res, source());
          if (g === true || (g && g.ok)) { fb.className = 'feedback good'; fb.innerHTML = `${catImg('good', 'cat-mini')}<p>${(g && g.msg) || st.done || 'Працює!'}</p>`; markDone(i); }
          else if (user && g && g.msg) { fb.className = 'feedback'; fb.innerHTML = `${catImg('think', 'cat-mini')}<p>${g.msg}</p>`; }
        } else markDone(i);
      };
      view.querySelectorAll('.cslot').forEach(el => el.oninput = el.onchange = () => runIt(true));
      if (st.removable) view.querySelectorAll('.cl.rm').forEach(el => {
        const ln = +el.dataset.ln; el.classList.toggle('off', off.has(ln));
        el.onclick = () => { off.has(ln) ? off.delete(ln) : off.add(ln); el.classList.toggle('off', off.has(ln)); state.answers = state.answers || {}; state.answers[i] = [...off]; save(); runIt(true); };
      });
      if (ta) {
        gutter();
        ta.oninput = gutter;
        ta.onkeydown = e => { if (e.key === 'Tab') { e.preventDefault(); const p = ta.selectionStart; ta.setRangeText('  ', p, ta.selectionEnd, 'end'); gutter(); } };
        ta.onscroll = () => { gut.scrollTop = ta.scrollTop; };
        view.querySelector('.code-run').onclick = () => runIt(true);
      }
      bindToggle(() => { c = mountCircuit(st.circuit); play(); });
      if (!st.editable) runIt(false); else { c.setLed(st.led, 0); }
    },

    /* Розстав рядки коду в правильному порядку (кнопки ↑ ↓) */
    order(st, i) {
      const fixed = st.lines.map(l => typeof l === 'object' && l.fixed);
      const text = st.lines.map(l => typeof l === 'object' ? l.t : l);
      const movable = text.map((_, k) => k).filter(k => !fixed[k]);
      // перемішати рухомі рядки детерміновано (щоб при поверненні порядок був той самий)
      let order = state.answers && state.answers[i] ? state.answers[i] : null;
      if (!order) {
        const sh = [...movable]; let seed = 7;
        for (let k = sh.length - 1; k > 0; k--) { seed = (seed * 9301 + 49297) % 233280; const j = Math.floor(seed / 233280 * (k + 1)); [sh[k], sh[j]] = [sh[j], sh[k]]; }
        if (sh.every((v, k) => v === movable[k])) sh.reverse();
        order = text.map((_, k) => k); movable.forEach((pos, n) => order[pos] = sh[n]);
      }
      frame(st, `${st.title ? `<h2>${st.title}</h2>` : ''}<div class="lead">${st.text}</div>
        <div class="code-wrap"><ol class="order-list"></ol><div class="code-side">${circuitBlock(st.circuit, st)}</div></div>
        <button class="primary ord-check">Перевірити</button>
        <div class="code-msg"></div>
        ${st.diagram ? `<div class="timing-wrap"><div class="small">Часова діаграма виводу ${st.pin}</div><div class="timing-box"></div></div>` : ''}
        <div class="feedback" aria-live="polite"></div>`);
      const ol = view.querySelector('.order-list'), fb = view.querySelector('.feedback');
      let c = mountCircuit(st.circuit), raf = 0;
      cleanup = () => cancelAnimationFrame(raf);
      const draw = () => {
        ol.innerHTML = order.map((k, pos) => `<li class="${fixed[pos] ? 'fixed' : ''}" data-pos="${pos}"><code>${text[k].replace(/</g, '&lt;').replace(/ /g, '&nbsp;') || '&nbsp;'}</code>${fixed[pos] ? '' : `<span class="mv"><button data-d="-1" aria-label="Вище">↑</button><button data-d="1" aria-label="Нижче">↓</button></span>`}</li>`).join('');
        ol.querySelectorAll('button[data-d]').forEach(b => b.onclick = () => {
          const pos = +b.closest('li').dataset.pos; let to = pos + +b.dataset.d;
          while (to >= 0 && to < order.length && fixed[to]) to += +b.dataset.d;
          if (to < 0 || to >= order.length) return;
          [order[pos], order[to]] = [order[to], order[pos]];
          state.answers = state.answers || {}; state.answers[i] = order; save();
          draw(); fb.className = 'feedback'; fb.innerHTML = '';
        });
      };
      draw();
      view.querySelector('.ord-check').onclick = () => {
        const src = order.map(k => text[k]).join('\n');
        const res = ArduinoSim.run(src, { maxTime: (st.T || 4000) * 3 });
        const g = res.ok && (!st.goal || st.goal(res, src));
        ol.querySelectorAll('li').forEach((li, pos) => li.classList.toggle('bad', !g && order[pos] !== pos && !fixed[pos]));
        if (g) {
          fb.className = 'feedback good'; fb.innerHTML = `${catImg('good', 'cat-mini')}<p>${st.done || 'Правильно! Програма працює.'}</p>`; markDone(i);
          const box = view.querySelector('.timing-box'); if (box) box.innerHTML = ArduinoSim.diagram(res, st.pin, st.T || 4000);
          const model = MODELS.ledSeries({ V: 5, R: 220, Vf: 2 }), T = st.T || 4000, t0 = performance.now();
          const tick = now => { const t = (now - t0) % Math.max(1, Math.min(T, res.end)); const lv = ArduinoSim.levelAt(res, st.pin, t); c.setCurrent(lv ? model.I : 0); c.setLed(st.led, lv ? model.level : 0);
            const cur = view.querySelector('.timing .cursor'); if (cur) { const x = ArduinoSim.diagram.X(T, t); cur.setAttribute('x1', x); cur.setAttribute('x2', x); } raf = requestAnimationFrame(tick); };
          raf = requestAnimationFrame(tick);
        } else {
          mistake(i); fb.className = 'feedback bad';
          fb.innerHTML = `${catImg('help', 'cat-mini')}<p>${res.ok ? (st.hint || 'Програма запускається, але робить не те. Подивись на порядок команд у loop().') : 'Поки що програма не запускається: ' + res.error.msg + '. Рядки, що стоять не на своїх місцях, підсвічено.'}</p>`;
        }
      };
      bindToggle(() => { c = mountCircuit(st.circuit); });
    },

    /* Розклади рядки-чіпи по зонах (перед setup / у setup / у loop): перетягуванням або тапом */
    sort(st, i) {
      const chips = st.chips;                       // [{ t: 'рядок', zone: 0|1|2 }]
      state.answers = state.answers || {};
      let A = state.answers[i];
      if (!A) {
        const pool = chips.map((_, k) => k); let seed = 11;
        for (let k = pool.length - 1; k > 0; k--) { seed = (seed * 9301 + 49297) % 233280; const j = Math.floor(seed / 233280 * (k + 1)); [pool[k], pool[j]] = [pool[j], pool[k]]; }
        A = { zones: [[], [], []], pool };
      }
      const Z = st.zones || ['на початку — імена та змінні', 'один раз — налаштування', 'знову і знову — робота'];
      frame(st, `${st.title ? `<h2>${st.title}</h2>` : ''}<div class="lead">${st.text}</div>
        <div class="code-wrap"><div class="sort-code">
          <div class="zone" data-z="0"><div class="zl">${Z[0]}</div><div class="zc"></div></div>
          <div class="zfix">void setup() {</div>
          <div class="zone in" data-z="1"><div class="zl">${Z[1]}</div><div class="zc"></div></div>
          <div class="zfix">}</div>
          <div class="zfix">void loop() {</div>
          <div class="zone in" data-z="2"><div class="zl">${Z[2]}</div><div class="zc"></div></div>
          <div class="zfix">}</div>
        </div><div class="code-side">${circuitBlock(st.circuit, st)}</div></div>
        <div class="sort-pool"><div class="small">Рядки коду — перетягни кожен у потрібне місце (або натисни на рядок, а потім на місце):</div><div class="zc pool" data-z="pool"></div></div>
        <button class="primary ord-check">Перевірити</button>
        ${st.diagram ? `<div class="timing-wrap"><div class="small">Часова діаграма виводу ${st.pin}</div><div class="timing-box"></div></div>` : ''}
        <div class="feedback" aria-live="polite"></div>`);
      const fb = view.querySelector('.feedback');
      let c = mountCircuit(st.circuit), raf = 0, sel = null;
      cleanup = () => cancelAnimationFrame(raf);
      const cont = z => z === 'pool' ? view.querySelector('.zc.pool') : view.querySelector(`.zone[data-z="${z}"] .zc`);
      const chipHTML = k => `<div class="chip" data-k="${k}" tabindex="0"><code>${chips[k].t.replace(/</g, '&lt;')}</code></div>`;
      const draw = () => {
        [0, 1, 2].forEach(z => { cont(z).innerHTML = A.zones[z].map(chipHTML).join(''); });
        cont('pool').innerHTML = A.pool.map(chipHTML).join('') || '<span class="small">Усі рядки розкладено ✔</span>';
        view.querySelectorAll('.chip').forEach(bind);
      };
      const store = () => { state.answers[i] = A; save(); fb.className = 'feedback'; fb.innerHTML = ''; };
      const remove = k => { A.pool = A.pool.filter(x => x !== k); A.zones = A.zones.map(z => z.filter(x => x !== k)); };
      const place = (k, z, before) => {
        remove(k);
        const arr = z === 'pool' ? A.pool : A.zones[z];
        const idx = before == null ? arr.length : Math.max(0, arr.indexOf(before));
        arr.splice(before == null || idx < 0 ? arr.length : idx, 0, k);
        store(); draw();
      };
      const zoneAt = (x, y) => {
        const el = document.elementFromPoint(x, y); if (!el) return null;
        const zc = el.closest('.zone') ? el.closest('.zone').querySelector('.zc') : el.closest('.zc');
        if (!zc) return null;
        const z = zc.classList.contains('pool') ? 'pool' : +zc.closest('.zone').dataset.z;
        const before = [...zc.querySelectorAll('.chip')].find(ch => { const r = ch.getBoundingClientRect(); return y < r.top + r.height / 2; });
        return { z, before: before ? +before.dataset.k : null };
      };
      function bind(ch) {
        const k = +ch.dataset.k;
        ch.onpointerdown = e => {
          e.preventDefault();
          const r = ch.getBoundingClientRect(), dx = e.clientX - r.left, dy = e.clientY - r.top, x0 = e.clientX, y0 = e.clientY;
          let ghost = null, moved = false;
          const mv = ev => {
            if (!moved && Math.hypot(ev.clientX - x0, ev.clientY - y0) < 6) return;
            if (!moved) { moved = true; ghost = ch.cloneNode(true); ghost.classList.add('ghost'); ghost.style.width = r.width + 'px'; document.body.appendChild(ghost); ch.classList.add('dragging'); }
            ghost.style.left = (ev.clientX - dx) + 'px'; ghost.style.top = (ev.clientY - dy) + 'px';
            view.querySelectorAll('.zone, .zc.pool').forEach(zn => zn.classList.remove('over'));
            const t = zoneAt(ev.clientX, ev.clientY);
            if (t) (t.z === 'pool' ? cont('pool') : view.querySelector(`.zone[data-z="${t.z}"]`)).classList.add('over');
          };
          const up = ev => {
            document.removeEventListener('pointermove', mv); document.removeEventListener('pointerup', up);
            view.querySelectorAll('.zone, .zc.pool').forEach(zn => zn.classList.remove('over'));
            if (ghost) ghost.remove();
            if (moved) { const t = zoneAt(ev.clientX, ev.clientY); if (t) place(k, t.z, t.before === k ? null : t.before); else draw(); sel = null; }
            else { sel = sel === k ? null : k; view.querySelectorAll('.chip').forEach(x => x.classList.toggle('sel', +x.dataset.k === sel)); }
          };
          document.addEventListener('pointermove', mv); document.addEventListener('pointerup', up);
        };
      }
      // тап по зоні — покласти вибраний рядок у кінець
      view.querySelectorAll('.zone, .zc.pool').forEach(zn => zn.addEventListener('click', e => {
        if (sel == null || e.target.closest('.chip')) return;
        place(sel, zn.classList.contains('pool') ? 'pool' : +zn.dataset.z, null); sel = null;
      }));
      draw();
      view.querySelector('.ord-check').onclick = () => {
        if (A.pool.length) { fb.className = 'feedback'; fb.innerHTML = `${catImg('think', 'cat-mini')}<p>Ще не всі рядки розкладено.</p>`; return; }
        const src = [...A.zones[0].map(k => chips[k].t), 'void setup() {', ...A.zones[1].map(k => '  ' + chips[k].t), '}', 'void loop() {', ...A.zones[2].map(k => '  ' + chips[k].t), '}'].join('\n');
        const res = ArduinoSim.run(src, { maxTime: (st.T || 4000) * 3 });
        const wrongZone = new Set(); A.zones.forEach((z, zi) => z.forEach(k => { if (chips[k].zone !== zi) wrongZone.add(k); }));
        view.querySelectorAll('.chip').forEach(ch => ch.classList.toggle('bad', wrongZone.has(+ch.dataset.k)));
        const ok = res.ok && !wrongZone.size && (!st.goal || st.goal(res, src));
        if (ok) {
          fb.className = 'feedback good'; fb.innerHTML = `${catImg('good', 'cat-mini')}<p>${st.done || 'Правильно! Програма працює.'}</p>`; markDone(i);
          const box = view.querySelector('.timing-box'); if (box) box.innerHTML = ArduinoSim.diagram(res, st.pin, st.T || 4000);
          const model = MODELS.ledSeries({ V: 5, R: 220, Vf: 2 }), T = st.T || 4000, t0 = performance.now();
          const tick = now => { const t = (now - t0) % Math.max(1, Math.min(T, res.end)); const lv = ArduinoSim.levelAt(res, st.pin, t); c.setCurrent(lv ? model.I : 0); c.setLed(st.led, lv ? model.level : 0);
            const cur = view.querySelector('.timing .cursor'); if (cur) { const x = ArduinoSim.diagram.X(T, t); cur.setAttribute('x1', x); cur.setAttribute('x2', x); } raf = requestAnimationFrame(tick); };
          cancelAnimationFrame(raf); raf = requestAnimationFrame(tick);
        } else {
          mistake(i); fb.className = 'feedback bad';
          fb.innerHTML = `${catImg('help', 'cat-mini')}<p>${wrongZone.size ? 'Рожеві рядки стоять не в тій частині програми. Згадай: що виконується один раз, а що — постійно?' : res.ok ? (st.hint || 'Частини правильні, але порядок у loop() інший. Перевір послідовність.') : 'Програма не запускається: ' + res.error.msg}</p>`;
        }
      };
      bindToggle(() => { c = mountCircuit(st.circuit); });
    },

    /* Підсумок уроку: що ми вже вміємо + випробуй свої сили в Tinkercad */
    summary(st, i) {
      frame(st, `<h2>${st.title}</h2>
        ${L.skills ? `<ul class="skills">${L.skills.map(t => `<li>${t}</li>`).join('')}</ul>` : ''}
        ${L.practice ? `<section class="practice">
          <div class="pr-head">${catImg('measure', 'cat-mini')}<div><h2>Випробуй свої сили в Tinkercad</h2><p>${L.practice.intro}</p></div></div>
          <a class="primary" href="https://www.tinkercad.com/circuits" target="_blank" rel="noopener">Відкрити Tinkercad Circuits ↗</a>
          <ol class="pr-tasks">${L.practice.tasks.map((t, k) => `<li><label><input type="checkbox" data-k="${k}" ${(state.practice || {})[k] ? 'checked' : ''}><span>${t}</span></label></li>`).join('')}</ol>
          <p class="small" id="pr-count"></p>
        </section>` : ''}
        <div class="fb-slot"></div>
        <p class="small">Далі — твоя наліпка за урок 🎉</p>`);
      if (window.Feedback) Feedback.mount(view.querySelector('.fb-slot'), { id: L.id, title: L.title });
      const prCount = () => { const n = Object.values(state.practice || {}).filter(Boolean).length; const el = view.querySelector('#pr-count'); if (el) el.textContent = `Виконано: ${n} з ${L.practice.tasks.length}`; };
      view.querySelectorAll('.pr-tasks input').forEach(cb => cb.onchange = () => { state.practice = state.practice || {}; state.practice[cb.dataset.k] = cb.checked; save(); prCount(); });
      if (L.practice) prCount();
      markDone(i);
    },

    /* Потенціометр: крутимо ручку, бачимо напругу на повзунку і (за бажанням) число АЦП */
    pot(st, i) {
      state.answers = state.answers || {};
      let pos = state.answers[i] ?? 0.5, seen0 = false, seen1 = false;
      const U = st.U || 5;
      frame(st, `${st.title ? `<h2>${st.title}</h2>` : ''}<div class="lead">${st.text}</div>${circuitBlock(st.circuit, st)}
        <div class="knob-ctl"><label>Ручка потенціометра <input type="range" min="0" max="1000" value="${pos * 1000}" class="knob-rng"></label>
          <div class="readouts">
            <div class="ro"><span>Напруга на повзунку</span><b class="ro-v">0 В</b></div>
            ${st.adc ? '<div class="ro adc"><span>Число в Arduino (АЦП)</span><b class="ro-a">0</b></div>' : ''}
          </div></div>
        ${st.adc ? '<div class="adc-bar"><i></i><span>0</span><span>1023</span></div>' : ''}
        <div class="feedback" aria-live="polite"></div>`);
      let c = mountCircuit(st.circuit);
      const rng = view.querySelector('.knob-rng'), fb = view.querySelector('.feedback');
      const upd = () => {
        c.setPot(st.pot, pos);
        const v = U * pos, a = Math.round(pos * 1023);
        view.querySelector('.ro-v').textContent = v.toFixed(2).replace('.', ',') + ' В';
        const ra = view.querySelector('.ro-a'); if (ra) ra.textContent = a;
        const bar = view.querySelector('.adc-bar i'); if (bar) bar.style.width = (pos * 100) + '%';
        if (st.meter) c.setMeter(st.meter, v.toFixed(2).replace('.', ',') + ' В');
        if (pos < 0.03) seen0 = true; if (pos > 0.97) seen1 = true;
        if (seen0 && seen1 && !state.done[i]) { fb.className = 'feedback good'; fb.innerHTML = `${catImg('good', 'cat-mini')}<p>${st.done}</p>`; markDone(i); }
        state.answers[i] = pos; save();
      };
      rng.oninput = () => { pos = rng.value / 1000; upd(); };
      const bindKnob = () => {
        const g = view.querySelector(`[data-id="${st.pot}"]`); if (!g) return;
        g.classList.add('clickable');
        potDrag(g, () => pos, p => { pos = p; rng.value = pos * 1000; upd(); });
      };
      bindKnob(); upd();
      if (state.done[i]) { fb.className = 'feedback good'; fb.innerHTML = `${catImg('good', 'cat-mini')}<p>${st.done}</p>`; }
      bindToggle(() => { c = mountCircuit(st.circuit); bindKnob(); upd(); });
    },

    /* ШІМ: частка часу ввімкнення, часова діаграма імпульсів, уповільнення */
    pwm(st, i) {
      state.answers = state.answers || {};
      let d = state.answers[i] ?? 64, slow = false, raf = 0, changed = false, slowed = false;
      frame(st, `${st.title ? `<h2>${st.title}</h2>` : ''}<div class="lead">${st.text}</div>
        <div class="code-wrap"><div>
          <pre class="code"><div class="cl"><span class="ln">1</span><span class="ct">analogWrite(9, <b class="pwm-n">64</b>);</span></div></pre>
          <div class="knob-ctl"><label>Значення ШІМ (0–255) <input type="range" min="0" max="255" value="${d}" class="pwm-rng"></label>
            <div class="readouts"><div class="ro"><span>Частка часу ввімкнення</span><b class="pwm-pc">25 %</b></div></div></div>
          <label class="slow"><input type="checkbox" class="pwm-slow"> 🐢 Уповільнити в 500 разів</label>
        </div><div class="code-side">${circuitBlock(st.circuit, st)}</div></div>
        <div class="timing-wrap"><div class="small">Напруга на виводі 9 (5 періодів ≈ 10 мс; в уповільненні — 5 с)</div><div class="timing-box"></div></div>
        <div class="feedback" aria-live="polite"></div>`);
      let c = mountCircuit(st.circuit);
      const rng = view.querySelector('.pwm-rng'), fb = view.querySelector('.feedback'), sl = view.querySelector('.pwm-slow');
      const model = MODELS.ledSeries({ V: 5, R: 220, Vf: 2 });
      cleanup = () => cancelAnimationFrame(raf);
      const wave = () => {
        const W = 640, H = 120, x0 = 54, x1 = W - 14, yH = 26, yL = 86, P = (x1 - x0) / 5, f = d / 255;
        let path = `M${x0} ${f > 0 ? yH : yL}`;
        for (let k = 0; k < 5; k++) { const a = x0 + k * P; if (f > 0 && f < 1) path += ` L${a} ${yH} L${a + P * f} ${yH} L${a + P * f} ${yL} L${a + P} ${yL}`; else path += ` L${a + P} ${f ? yH : yL}`; }
        let ticks = ''; for (let k = 0; k <= 5; k++) ticks += `<text x="${x0 + k * P}" y="${yL + 24}" text-anchor="middle" font-size="12" fill="#5a6573">${k * 2}</text>`;
        return `<svg class="timing" viewBox="0 0 ${W} ${H}"><text x="6" y="${yH + 5}" font-size="13" font-weight="700" fill="#d93025">5 В</text><text x="6" y="${yL + 5}" font-size="13" font-weight="700" fill="#1F3B63">0 В</text>
          <line x1="${x0}" y1="${yL + 4}" x2="${x1}" y2="${yL + 4}" stroke="#c4cad3"/>${ticks}<text x="${x1}" y="${H - 2}" text-anchor="end" font-size="11" fill="#5a6573">час, мс</text>
          <path d="${path}" fill="none" stroke="#003FB8" stroke-width="3" stroke-linejoin="round"/>
          <line class="cursor" x1="${x0}" y1="14" x2="${x0}" y2="${yL + 8}" style="display:${slow ? 'inline' : 'none'}"/></svg>`;
      };
      const show = () => {
        view.querySelector('.pwm-n').textContent = d;
        view.querySelector('.pwm-pc').textContent = Math.round(d / 255 * 100) + ' %';
        view.querySelector('.timing-box').innerHTML = wave();
      };
      const anim = () => {
        cancelAnimationFrame(raf);
        if (!slow) { const cu = view.querySelector('.timing .cursor'); if (cu) cu.style.display = 'none'; c.setCurrent(d ? model.I * d / 255 : 0); c.setLed(st.led, model.level * d / 255); return; }
        const t0 = performance.now();
        const cur = view.querySelector('.timing .cursor'); if (cur) cur.style.display = 'inline';
        const tick = now => {
          const t = (now - t0) % 5000, ph = (t % 1000) / 1000, on = ph < d / 255;      // 1 період = 1 с, на діаграмі 5 періодів
          c.setCurrent(on ? model.I : 0); c.setLed(st.led, on ? model.level : 0);
          const cu = view.querySelector('.timing .cursor'); if (cu) { const x = 54 + t / 5000 * (640 - 14 - 54); cu.setAttribute('x1', x); cu.setAttribute('x2', x); }
          raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
      };
      const check = () => { if (changed && slowed && !state.done[i]) { fb.className = 'feedback good'; fb.innerHTML = `${catImg('good', 'cat-mini')}<p>${st.done}</p>`; markDone(i); } };
      rng.oninput = () => { d = +rng.value; changed = true; state.answers[i] = d; save(); show(); anim(); check(); };
      sl.onchange = () => { slow = sl.checked; if (slow) slowed = true; anim(); check(); };
      show(); anim();
      if (state.done[i]) { fb.className = 'feedback good'; fb.innerHTML = `${catImg('good', 'cat-mini')}<p>${st.done}</p>`; }
      bindToggle(() => { c = mountCircuit(st.circuit); anim(); });
    },

    /* Живий скетч: потенціометр + Serial Monitor / Plotter, виконання в реальному часі */
    live(st, i) {
      state.answers = state.answers || {};
      const tpl = st.code, slots = [];
      let pos = 0.5;
      const html = tpl.split('\n').map((ln, k) => {
        const esc = ln.replace(/&/g, '&amp;').replace(/</g, '&lt;');
        const body = esc.replace(/\[\[sel:([^\]]*)\]\]/g, (_, arg) => { const n = slots.length; slots.push(arg); return `<select class="cslot" data-n="${n}">${arg.split('|').map(o => `<option>${o}</option>`).join('')}</select>`; });
        return `<div class="cl" data-ln="${k + 1}"><span class="ln">${k + 1}</span><span class="ct">${body || ' '}</span></div>`;
      }).join('');
      frame(st, `${st.title ? `<h2>${st.title}</h2>` : ''}<div class="lead">${st.text}</div>
        <div class="code-wrap"><pre class="code">${html}</pre><div class="code-side">${circuitBlock(st.circuit, st)}
          <div class="knob-ctl"><label>Ручка потенціометра <input type="range" min="0" max="1000" value="500" class="knob-rng"></label></div></div></div>
        <div class="code-msg"></div>
        <div class="serial-wrap">
          ${st.monitor !== false ? `<div class="serial-mon"><div class="sm-head">Serial Monitor ${st.baudSelect ? `<label>швидкість <select class="baud"><option>9600</option><option selected>115200</option></select></label>` : '<span>9600 бод</span>'}</div><pre class="sm-out"></pre></div>` : ''}
          ${st.plotter ? '<div class="serial-plot"><div class="sm-head">Serial Plotter</div><svg class="sp-svg" viewBox="0 0 640 220" preserveAspectRatio="none"></svg></div>' : ''}
        </div>
        ${st.question ? `<p class="q">${st.question}</p>` : ''}
        <div class="feedback" aria-live="polite"></div>`);
      const msg = view.querySelector('.code-msg'), fb = view.querySelector('.feedback'), out = view.querySelector('.sm-out'), rng = view.querySelector('.knob-rng');
      const baudSel = view.querySelector('.baud');
      let c = mountCircuit(st.circuit), M = null, raf = 0, last = 0, text = '', samples = [], ctx = { min: 1, max: 0, lines: 0, jumps: 0, ramps: 0, still: 0 };
      const model = MODELS.ledSeries({ V: 5, R: 220, Vf: 2 });
      const source = () => { let n = 0; return tpl.replace(/\[\[sel:([^\]]*)\]\]/g, () => view.querySelector(`.cslot[data-n="${n++}"]`).value); };
      const garble = s => s.replace(/[^\n]/g, () => '⸮�ÿ§ñ'[Math.random() * 5 | 0]);
      const plot = () => {
        const svg = view.querySelector('.sp-svg'); if (!svg) return;
        const mx = st.plotMax || 1023, n = 200, pts = samples.slice(-n).map((v, k) => `${(k / (n - 1) * 630 + 5).toFixed(1)},${(210 - v / mx * 200).toFixed(1)}`).join(' ');
        svg.innerHTML = `<line x1="5" y1="10" x2="635" y2="10" stroke="#eef1f5"/><line x1="5" y1="110" x2="635" y2="110" stroke="#eef1f5"/><line x1="5" y1="210" x2="635" y2="210" stroke="#d6dbe3"/>
          <text x="8" y="22" font-size="12" fill="#8a93a0">${mx}</text><text x="8" y="206" font-size="12" fill="#8a93a0">0</text>
          <polyline points="${pts}" fill="none" stroke="#003FB8" stroke-width="2.5" vector-effect="non-scaling-stroke"/>`;
      };
      const onEvent = e => {
        if (e.kind !== 'serial') return;
        let s = e.text + (e.nl ? '\n' : '');
        if (baudSel && +baudSel.value !== M.baud) s = garble(s);
        text += s; if (text.length > 4000) text = text.slice(-3000);
        if (e.nl) {
          ctx.lines++;
          const line = text.split('\n').slice(-2)[0], num = line.match(/-?\d+/);
          if (num && st.plotter) {
            const v = +num[0], prev = samples[samples.length - 1];
            samples.push(v); if (samples.length > 400) samples.shift();
            if (prev != null) { const dv = Math.abs(v - prev); if (dv > 300) ctx.jumps++; else if (dv > 3) ctx.ramps++; else ctx.still++; }
          }
        }
      };
      const start = () => {
        cancelAnimationFrame(raf); text = ''; samples = []; ctx = { min: 1, max: 0, lines: 0, jumps: 0, ramps: 0, still: 0 };
        if (out) out.textContent = '';
        M = ArduinoSim.live(source(), { analogRead: () => pos * 1023, event: e => onEvent(e) });
        view.querySelectorAll('.cl').forEach(e => e.classList.remove('err'));
        if (!M.ok) { msg.className = 'code-msg bad'; msg.innerHTML = `⚠️ Рядок ${M.error.line}: ${M.error.msg}`; const e = view.querySelector(`.cl[data-ln="${M.error.line}"]`); if (e) e.classList.add('err'); return; }
        msg.className = 'code-msg'; msg.innerHTML = '';
        last = performance.now();
        const tick = now => {
          const dt = Math.min(100, now - last); last = now;
          M.tick(dt);
          if (!M.ok) { msg.className = 'code-msg bad'; msg.innerHTML = `⚠️ Рядок ${M.error.line}: ${M.error.msg}`; return; }
          const lv = M.levels[st.pin] || 0;
          if (st.led) { if (st.ledNets) { const m = {}; st.ledNets.forEach(n => m[n] = lv ? model.I * lv : 0); c.setNetCurrents(m); } else c.setCurrent(lv ? model.I * lv : 0); c.setLed(st.led, model.level * lv); }
          const ln = M.line(); view.querySelectorAll('.cl').forEach(e => e.classList.toggle('run', +e.dataset.ln === ln));
          if (out) { out.textContent = text; out.scrollTop = out.scrollHeight; }
          plot();
          if (M.warnings.length) { msg.className = 'code-msg warn'; msg.innerHTML = M.warnings.map(w => `💡 ${w.line ? 'Рядок ' + w.line + ': ' : ''}${w.msg}`).join('<br>'); }
          ctx.min = Math.min(ctx.min, pos); ctx.max = Math.max(ctx.max, pos);
          if (st.goal && !state.done[i]) {
            const g = st.goal(M, ctx, source(), baudSel ? +baudSel.value : M.baud);
            if (g && g.ok) { fb.className = 'feedback good'; fb.innerHTML = `${catImg('good', 'cat-mini')}<p>${g.msg}</p>`; markDone(i); }
            else if (g && g.msg && g.msg !== fb.dataset.m) { fb.dataset.m = g.msg; fb.className = 'feedback'; fb.innerHTML = `${catImg('think', 'cat-mini')}<p>${g.msg}</p>`; }
          }
          raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
      };
      cleanup = () => cancelAnimationFrame(raf);
      rng.oninput = () => { pos = rng.value / 1000; c.setPot(st.pot, pos); };
      const bindKnob = () => {
        c.setPot(st.pot, pos);
        const g = view.querySelector(`[data-id="${st.pot}"]`); if (!g) return;
        g.classList.add('clickable');
        potDrag(g, () => pos, p => { pos = p; rng.value = pos * 1000; c.setPot(st.pot, pos); });
      };
      view.querySelectorAll('.cslot').forEach(el => el.onchange = start);
      if (baudSel) baudSel.onchange = () => { text = ''; };
      bindKnob(); start();
      if (state.done[i] && st.doneText) { fb.className = 'feedback good'; fb.innerHTML = `${catImg('good', 'cat-mini')}<p>${st.doneText}</p>`; }
      bindToggle(() => { c = mountCircuit(st.circuit); bindKnob(); });
    },

    predict(st, i) {
      frame(st, `${st.text ? `<div class="lead">${st.text}</div>` : ''}${visual(st)}
        ${st.probes && st.probes.display ? meterDev(st.probes.mode, st.probes.display) : ''}
        <h2 class="question">${st.question}</h2>
        <div class="options">${st.options.map((o, k) => `<button class="opt" data-k="${k}">${o.text}</button>`).join('')}</div>
        <div class="feedback" aria-live="polite"></div>`);
      let solved = false, hi = -1;
      const redraw = () => { if (solved && st.after) showAfter(st); else { mountVisual(st); drawCandidates(st, hi); } };
      redraw();
      bindToggle(redraw);
      const fb = view.querySelector('.feedback');
      const btns = [...view.querySelectorAll('.opt')];
      const show = (k) => {
        const o = st.options[k];
        if (o.correct) solved = true; else hi = o.cand ?? -1;
        if (st.candidates || st.after) redraw();
        btns.forEach(b => b.classList.remove('right', 'wrong'));
        btns[k].classList.add(o.correct ? 'right' : 'wrong');
        fb.className = 'feedback ' + (o.correct ? 'good' : 'bad');
        fb.innerHTML = `${catImg(o.correct ? 'good' : 'help', 'cat-mini')}<p>${o.feedback}</p>`;
        fb.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      };
      btns.forEach(b => b.onclick = () => {
        const k = +b.dataset.k;
        if (st.options[k].correct) { state.answers = state.answers || {}; state.answers[i] = k; markDone(i); }
        else mistake(i);
        show(k);
      });
      if (state.done[i] && state.answers && state.answers[i] != null) show(state.answers[i]);
    },

    /* Ключ на схемі: учень натискає на нього, коло замикається й розмикається */
    switch(st, i) {
      const sw = L.circuits[st.circuit].parts[st.part];
      sw.closed = !!state.done[i];
      frame(st, `${st.title ? `<h2>${st.title}</h2>` : ''}<div class="lead">${st.text}</div>${visual(st)}<div class="feedback" aria-live="polite"></div>`);
      const fb = view.querySelector('.feedback');
      const feedback = () => {
        fb.className = 'feedback ' + (sw.closed ? 'good' : '');
        fb.innerHTML = sw.closed ? `${catImg('good', 'cat-mini')}<p>${st.messages.closed}</p>` : `<p>${st.messages.open}</p>`;
        if (sw.closed) { markDone(i); fb.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); }
      };
      const mount = () => {
        mountCircuit(st.circuit, sw.closed ? st.animate : null);
        const g = view.querySelector(`svg.circuit [data-id="${st.part}"]`);
        g.classList.add('clickable'); g.classList.toggle('hint', !sw.closed);
        g.setAttribute('role', 'button'); g.setAttribute('aria-label', sw.closed ? 'Розімкнути ключ' : 'Замкнути ключ');
        g.onclick = () => { sw.closed = !sw.closed; mount(); feedback(); };
      };
      mount();
      bindToggle(mount);
      if (state.done[i]) feedback();
    },

    /* Вийми деталь: натискання на деталь виймає її з кола (на її місці — «?»), повторне — повертає */
    toggle(st, i) {
      const out = new Set(), tried = new Set();
      frame(st, `${st.title ? `<h2>${st.title}</h2>` : ''}<div class="lead">${st.text}</div>${visual(st)}<div class="feedback" aria-live="polite"></div>`);
      const fb = view.querySelector('.feedback');
      const mount = () => {
        const c = mountCircuit(st.circuit);
        const svg = view.querySelector('svg.circuit');
        st.parts.forEach(id => {
          const isLamp = L.circuits[st.circuit].parts[id].type === 'lamp';
          if (out.has(id)) isLamp ? c.setLampOut(id, true) : c.setPartVisible(id, false);
          const g = svg.querySelector(`[data-id="${id}"]`), slot = svg.querySelector(`.slot[data-for="${id}"]`);
          const flip = () => { out.has(id) ? out.delete(id) : (out.add(id), tried.add(id)); mount(); };
          if (g) { g.classList.add('clickable'); g.onclick = flip; }
          if (slot) { slot.style.cursor = 'pointer'; slot.onclick = flip; }
        });
        const r = st.compute([...out]);
        applyState(c, r);
        out.forEach(id => { if (L.circuits[st.circuit].parts[id].type === 'lamp') c.setLampOut(id, true); });
        fb.className = 'feedback' + (tried.size ? ' good' : '');
        fb.innerHTML = tried.size ? `${out.size ? '' : catImg('good', 'cat-mini')}<p>${r.msg}</p>` : `<p>${st.hint}</p>`;
        if (tried.size) markDone(i);
      };
      mount();
      bindToggle(mount);
    },

    /* Тренажер: випадкові значення, відповідь рахується за формулою, «Ще одне завдання» */
    gen(st, i) {
      frame(st, `${st.title ? `<h2>${st.title}</h2>` : ''}<div class="lead">${st.text}</div>
        <div class="gen-card"><div class="scheme gen-scheme" hidden><svg id="sv${state.step}" class="circuit" role="img" aria-label="Схема"></svg></div><p class="gen-q"></p>
          <div class="gen-in"><input type="text" inputmode="decimal" autocomplete="off" aria-label="Відповідь"><span class="gen-unit"></span><button class="primary gen-check">Перевірити</button></div>
        </div>
        <div class="feedback" aria-live="polite"></div>
        <div class="gen-foot"><button class="primary alt gen-next" hidden>🎲 Ще одне завдання</button><span class="small gen-count"></span></div>`);
      const R = {
        pick: a => a[Math.floor(Math.random() * a.length)],
        int: (a, b) => a + Math.floor(Math.random() * (b - a + 1)),
        num: (x, d = 2) => (+x.toFixed(d)).toString().replace('.', ',')
      };
      const q = view.querySelector('.gen-q'), inp = view.querySelector('.gen-in input'), unit = view.querySelector('.gen-unit');
      const fb = view.querySelector('.feedback'), nextB = view.querySelector('.gen-next'), cnt = view.querySelector('.gen-count');
      state.genSolved = state.genSolved || {};
      let task, tries;
      const need = st.need || 1, B = st.bonus || null, bonus = B && B.need;
      state.bonuses = state.bonuses || {};
      if (typeof state.bonus === 'string' && !state.bonuses.b) state.bonuses.b = state.bonus;   // старий формат
      const earned = () => B && state.bonuses[B.key];
      const count = () => {
        const n = state.genSolved[i] || 0;
        cnt.innerHTML = n < need ? `Розв’язано: <b>${n} з ${need}</b>. Щоб піти далі, розв’яжи ще ${need - n}.`
          : bonus && n < bonus ? `Розв’язано: <b>${n}</b>. Можна йти далі! А за <b>${bonus}</b> задач — ексклюзивна наліпка (залишилось ${bonus - n}).`
          : `Розв’язано: <b>${n}</b>.`;
      };
      const make = () => {
        const solved = state.genSolved[i] || 0;           // перші задачі — фіксовані прості (st.first), далі випадкові
        task = (st.first && solved < st.first.length ? st.first[solved] : st.make)(R); tries = 0;
        const sch = view.querySelector('.gen-scheme');
        sch.hidden = !task.circuit;
        if (task.circuit) {
          const c = Circuit.render(sch.querySelector('svg'), task.circuit, 'schematic');
          c.setCurrent(0); if (task.pot) c.setPot(task.pot[0], task.pot[1]); if (task.meters) for (const [id, t] of Object.entries(task.meters)) c.setMeter(id, t);
        }
        q.innerHTML = task.q; unit.textContent = task.unit; inp.value = ''; inp.disabled = false;
        fb.className = 'feedback'; fb.innerHTML = ''; nextB.hidden = true; inp.focus({ preventScroll: true }); count();
      };
      const showBonus = () => {
        const b = B, src = (window.STICKERS || {})[L.id + B.key];
        const box = document.createElement('div'); box.className = 'bonus-box';
        box.innerHTML = `<b>🎉 Ексклюзивна наліпка!</b><p>${b.text || b.need + ' задач розв’язано! Ось твоя нагорода.'}</p>
          ${src ? `<img src="${src.src}" alt="Ексклюзивна наліпка">` : ''}<div><button class="primary bonus-dl">⬇️ Завантажити наліпку</button> <a href="achievements.html">Усі досягнення →</a></div>`;
        view.querySelector('.gen-foot').after(box);
        box.querySelector('.bonus-dl').onclick = async () => {
          const img = new Image(); img.src = src.src; await img.decode();
          const cv = document.createElement('canvas'); cv.width = img.naturalWidth; cv.height = img.naturalHeight; cv.getContext('2d').drawImage(img, 0, 0);
          cv.toBlob(bl => { const a = document.createElement('a'); a.href = URL.createObjectURL(bl); a.download = `наліпка-${(st.title || 'тренажер').replace(/\s+/g, '-')}.png`; a.click(); }, 'image/png');
        };
        box.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      };
      const check = () => {
        if (inp.disabled) return;
        const v = parseFloat(inp.value.replace(',', '.').replace(/\s/g, ''));
        if (isNaN(v)) { fb.className = 'feedback'; fb.innerHTML = '<p>Введи число.</p>'; return; }
        const ok = Math.abs(v - task.a) <= Math.max(Math.abs(task.a) * (task.tol ?? 0.02), task.abs ?? 0.001);
        // Статистика тренажера: правильні, усі спроби, помилки (рахуються завжди)
        state.gen = state.gen || {};
        const g = state.gen[i] = state.gen[i] || { ok: 0, tries: 0, wrong: 0 };
        g.title = st.title; g.key = B ? B.key : ''; g.bonus = bonus || 0; g.tries++; ok ? g.ok++ : g.wrong++; save();
        if (ok) {
          state.genSolved[i] = (state.genSolved[i] || 0) + 1; save();
          fb.className = 'feedback good'; fb.innerHTML = `${catImg('good', 'cat-mini')}<p>Правильно! ${task.sol}</p>`;
          inp.disabled = true; nextB.hidden = false; count();
          if (state.genSolved[i] >= need) markDone(i);
          if (bonus && state.genSolved[i] >= bonus && !earned()) { state.bonuses[B.key] = new Date().toISOString(); save(); showBonus(); }
        } else {
          tries++; if (tries === 1) mistake(i);
          fb.className = 'feedback bad';
          fb.innerHTML = tries < 2 ? `${catImg('help', 'cat-mini')}<p>Не зовсім. ${task.hint || 'Перевір одиниці й формулу.'}</p>`
                                   : `${catImg('help', 'cat-mini')}<p>Розберімося разом: ${task.sol}</p>`;
          if (tries >= 2) { inp.disabled = true; nextB.hidden = false; }
        }
        fb.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      };
      view.querySelector('.gen-check').onclick = check;
      inp.onkeydown = e => { if (e.key === 'Enter') check(); };
      nextB.onclick = make;
      count(); make();
      if (earned()) showBonus();
    },

    /* Що проводить струм: учень вставляє в розрив різні матеріали */
    material(st, i) {
      const def = L.circuits[st.circuit], X = def.parts[st.part];
      frame(st, `${st.title ? `<h2>${st.title}</h2>` : ''}<div class="lead">${st.text}</div>${visual(st)}
        <div class="control">
          <div class="ctl-label">${st.label}</div>
          <div class="choices">${st.materials.map(m => `<button class="choice" data-m="${m.id}">${m.name}</button>`).join('')}</div>
          <table class="results"><thead><tr><th>Матеріал</th><th>Проводить струм?</th></tr></thead><tbody></tbody></table>
        </div>
        <div class="feedback" aria-live="polite"></div>`);
      const fb = view.querySelector('.feedback');
      state.tried = state.tried || {};
      const tried = state.tried[i] = state.tried[i] || {};
      let cur = null;
      const table = () => view.querySelector('.results tbody').innerHTML = st.materials.map(m =>
        `<tr class="${m.id === cur ? 'cur' : ''}"><td>${m.name}</td><td>${tried[m.id] == null ? '?' : tried[m.id] ? '✓ так' : '✗ ні'}</td></tr>`).join('');
      const mount = () => {
        X.material = cur;
        const c = mountCircuit(st.circuit);
        if (!cur) { c.setPartVisible(st.part, false); return; }
        const m = st.materials.find(x => x.id === cur);
        const RL = st.loadR ?? 1000, Rx = m.R || 0;
        c.setCurrent(m.conducts ? 9 / (RL + Rx) * 1000 : 0);
        if (st.lamp) c.setLamp(st.lamp, m.conducts ? (RL / (RL + Rx)) ** 2 : 0);   // гірший провідник — тьмяніше
      };
      const pick = id => {
        cur = id;
        view.querySelectorAll('.choice').forEach(b => b.classList.toggle('on', b.dataset.m === id));
        const m = st.materials.find(x => x.id === id);
        tried[id] = !!m.conducts; save(); mount(); table();
        const left = st.materials.filter(x => tried[x.id] == null).length;
        fb.className = 'feedback' + (left ? '' : ' good');
        fb.innerHTML = left ? `<p>${m.conducts ? 'Крапки побігли — коло замкнулося.' : 'Струму немає — коло так і лишилося розірваним.'} Залишилось спробувати: ${left}.</p>`
                            : `${catImg('good', 'cat-mini')}<p>${st.done}</p>`;
        if (!left) markDone(i);
      };
      view.querySelectorAll('.choice').forEach(b => b.onclick = () => pick(b.dataset.m));
      bindToggle(mount);
      table(); mount();
      if (state.done[i]) pick(st.materials[0].id);
    },

    /* Спробуй кожен варіант: кнопки з номіналами, прилад у колі, таблиця результатів */
    try(st, i) {
      const c0 = st.control;
      frame(st, `${st.title ? `<h2>${st.title}</h2>` : ''}<div class="lead">${st.text}</div>${visual(st)}
        <div class="control">
          <div class="ctl-label">${c0.label}</div>
          <div class="choices">${c0.values.map(v => `<button class="choice" data-v="${v}">${fmtR(v)}</button>`).join('')}</div>
          <table class="results"><thead><tr><th>${c0.colA}</th>${st.cols ? st.cols.map(k => `<th>${k.label}</th>`).join('') : `<th>${c0.colB}</th>`}</tr></thead><tbody></tbody></table>
        </div>
        <div class="feedback" aria-live="polite"></div>`);
      let c = mountVisual(st);
      const fb = view.querySelector('.feedback');
      state.tried = state.tried || {};
      const tried = state.tried[i] = state.tried[i] || {};
      let cur = null;
      const fmt = x => x.toFixed(x < 10 ? 1 : 0).replace('.', ',');
      const table = () => {
        view.querySelector('.results tbody').innerHTML = c0.values.map(v => {
          const row = tried[v];
          const cells = st.cols ? st.cols.map(k => `<td>${row && row[k.key] != null ? fmt(row[k.key]) + ' ' + (k.unit || 'мА') : '?'}</td>`).join('')
                                : `<td>${row != null ? fmt(row) + ' мА' : '?'}</td>`;
          return `<tr class="${v === cur ? 'cur' : ''}"><td>${fmtR(v)}</td>${cells}</tr>`;
        }).join('');
      };
      const pick = v => {
        cur = v;
        view.querySelectorAll('.choice').forEach(b => b.classList.toggle('on', +b.dataset.v === v));
        c.setPartVisible(c0.part, true);
        c.setValue(c0.part, v);
        if (st.compute) {                       // складніша схема: модель повертає стан і рядок таблиці
          const r = st.compute(v); applyState(c, r); tried[v] = r.row;
        } else {
          const s = MODELS[st.model]({ ...st.params, [c0.param]: v });
          c.setCurrent(s.I);
          if (st.meterPart) c.setMeter(st.meterPart, fmt(s.I) + ' мА');
          tried[v] = s.I;
        }
        save(); table();
        const left = c0.values.filter(x => tried[x] == null).length;
        if (!left) {
          fb.className = 'feedback good';
          fb.innerHTML = `${catImg('good', 'cat-mini')}<p>${st.done}</p>`;
          markDone(i);
        } else {
          fb.className = 'feedback';
          fb.innerHTML = `<p>Залишилось спробувати: ${left}.</p>`;
        }
      };
      view.querySelectorAll('.choice').forEach(b => b.onclick = () => pick(+b.dataset.v));
      const empty = () => { c.setCurrent(0); if (st.meterPart) c.setMeter(st.meterPart, '0,0 мА'); (st.meters0 || []).forEach(id => c.setMeter(id, '0,0 мА')); if (c0.emptyStart) c.setPartVisible(c0.part, false); };
      bindToggle(() => { c = mountVisual(st); if (cur) pick(cur); else empty(); });
      table();
      empty();
      if (state.done[i]) pick(c0.values[0]);
    },

    /* Постав щупи: учень торкається двох точок, прилад показує різницю між ними */
    measure(st, i) {
      frame(st, `${st.title ? `<h2>${st.title}</h2>` : ''}<div class="lead">${st.text}</div>${visual(st)}
        ${meterDev(st.mode, '—')}
        <p class="small hint">Торкнись першої точки (червоний щуп), потім другої (чорний).</p>
        ${st.targets ? `<table class="results"><thead><tr><th>Що вимірюємо</th><th>Показ</th></tr></thead><tbody class="tg"></tbody></table>` : ''}
        <div class="feedback" aria-live="polite"></div>`);
      state.tried = state.tried || {};
      const found = state.tried[i] = state.tried[i] || {};
      const fmtV = v => v.toFixed(1).replace('.', ',') + ' ' + st.unit;
      const drawTg = () => { const tb = view.querySelector('.tg'); if (tb) tb.innerHTML = st.targets.map((t, k) => `<tr><td>${t.label}</td><td>${found[k] != null ? fmtV(found[k]) : '?'}</td></tr>`).join(''); };
      drawTg();
      let c, red = null, black = null;
      const fb = view.querySelector('.feedback'), disp = view.querySelector('#mdisp');
      const drawPoints = () => {
        const svg = view.querySelector('svg.circuit');
        svg.querySelectorAll('.tp').forEach(n => n.remove());
        st.points.forEach(p => svg.insertAdjacentHTML('beforeend',
          `<g class="tp" data-id="${p.id}"><circle class="ring" cx="${p.at[0]}" cy="${p.at[1]}" r="15"/><circle cx="${p.at[0]}" cy="${p.at[1]}" r="32" fill="transparent"/></g>`));
        svg.querySelectorAll('.tp').forEach(g => g.onclick = () => tap(st.points.find(p => p.id === g.dataset.id)));
        c.setProbes(red && red.at, black && black.at);
      };
      const tap = p => {
        if (!red || black) { red = p; black = null; disp.textContent = '—'; fb.className = 'feedback'; fb.innerHTML = ''; }
        else if (p.id === red.id) return;
        else {
          black = p;
          const v = Math.abs(red.v - black.v);
          disp.textContent = v.toFixed(1).replace('.', ',') + ' ' + st.unit;
          if (st.targets) {
            const k = st.targets.findIndex(t => (t.nets[0] === red.net && t.nets[1] === black.net) || (t.nets[1] === red.net && t.nets[0] === black.net));
            if (k >= 0) found[k] = v;
            save(); drawTg();
            const left = st.targets.filter((_, n) => found[n] == null).length;
            const msg = red.net === black.net ? st.messages.same : k < 0 ? st.messages.other : left ? `${st.targets[k].label}: ${fmtV(v)}. Залишилось виміряти: ${left}.` : st.messages.ok;
            fb.className = 'feedback ' + (!left ? 'good' : k < 0 ? 'bad' : '');
            fb.innerHTML = `${!left ? catImg('good', 'cat-mini') : ''}<p>${msg}</p>`;
            if (!left) markDone(i);
            c.setProbes(red && red.at, black && black.at);
            return;
          }
          const ok = Math.abs(v - st.goal) < 1e-6;
          fb.className = 'feedback ' + (ok ? 'good' : 'bad');
          fb.innerHTML = `${catImg(ok ? 'good' : 'help', 'cat-mini')}<p>${ok ? st.messages.ok : v === 0 ? st.messages.same : st.messages.other}</p>`;
          fb.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
          if (ok) markDone(i); else mistake(i);
        }
        c.setProbes(red && red.at, black && black.at);
      };
      const mount = () => { c = mountVisual(st); drawPoints(); };
      mount();
      bindToggle(mount);
    },

    /* Підбір значення повзунком (для уроку зі світлодіодом) */
    tune(st, i) {
      const ser = E_SERIES;
      const startIdx = Math.max(0, ser.indexOf(st.control.start));
      frame(st, `${st.title ? `<h2>${st.title}</h2>` : ''}<div class="lead">${st.text}</div>${visual(st)}
        <div class="control">
          <label for="ctl">${st.control.label}: <b id="ctlv"></b></label>
          <input id="ctl" type="range" min="0" max="${ser.length - 1}" step="1" value="${startIdx}">
          <div class="meter"><span>Струм</span><b id="amp">0</b><span>мА</span><div class="gauge"><i id="gauge"></i><em class="zone" style="left:${st.goal.min / 60 * 100}%;width:${(st.goal.max - st.goal.min) / 60 * 100}%"></em></div></div>
        </div>
        <div class="feedback" aria-live="polite"></div>
        <button class="ghost" id="newled" hidden>🔁 Взяти новий світлодіод</button>`);
      let c = mountVisual(st);
      const ctl = view.querySelector('#ctl'), fb = view.querySelector('.feedback'), nl = view.querySelector('#newled');
      let burnt = false;
      const upd = () => {
        const R = ser[+ctl.value];
        view.querySelector('#ctlv').textContent = fmtR(R);
        c.setValue(st.control.part, R);
        const s = MODELS[st.model]({ ...st.params, [st.control.param]: R });
        if (s.burnt) burnt = true;
        const I = burnt ? 0 : s.I;
        c.setCurrent(I); c.setLed(st.led, s.level, burnt);
        view.querySelector('#amp').textContent = burnt ? '—' : I.toFixed(1).replace('.', ',');
        view.querySelector('#gauge').style.width = Math.min(100, s.I / 60 * 100) + '%';
        let kind = burnt ? 'burnt' : s.hot ? 'hot' : (I >= st.goal.min && I <= st.goal.max) ? 'ok' : 'dim';
        if (!burnt && I > st.goal.max && !s.hot) kind = 'hot';
        fb.className = 'feedback ' + (kind === 'ok' ? 'good' : kind === 'dim' ? '' : 'bad');
        fb.innerHTML = `${catImg({ burnt: 'help', hot: 'careful', ok: 'good', dim: 'help' }[kind], 'cat-mini')}<p>${st.messages[kind]}</p>`;
        nl.hidden = !burnt;
        ctl.disabled = burnt;
        if (kind === 'ok') markDone(i);
      };
      ctl.oninput = upd;
      bindToggle(() => { c = mountVisual(st); upd(); });
      nl.onclick = () => { burnt = false; ctl.value = Math.min(ser.length - 1, +ctl.value + 3); upd(); ctl.focus(); };
      upd();
    }
  };

  /* ---------- Конспект: теоретичні кроки для друку / PDF ----------
     Потрапляють кроки-пояснення та кроки з полем notes ({ title, text }) */
  function notesHTML() {
    const S = window.SITE || { author: {} };
    const items = L.steps.map((st, i) => ({ st, i })).filter(({ st }) => kindOf(st) === 'theory' || st.notes);
    const cards = st => st.cards ? `<div class="qty">${st.cards.map(c => `<div class="q"><b class="sym">${c.sym}</b><div><b>${c.name}</b><span>${c.unit}</span>${c.hint ? `<em>${c.hint}</em>` : ''}</div></div>`).join('')}</div>` : '';
    const exs = st => { const e = st.examples || (st.example ? [st.example] : []); return e.length ? `<div class="examples">${e.map((x, k) => `<div class="example"><b class="ex-t">${x.title || (e.length > 1 ? 'Приклад ' + (k + 1) : 'Приклад')}</b><p>${x.given}</p>${x.lines.map(l => `<div class="ex-line">${l}</div>`).join('')}</div>`).join('')}</div>` : ''; };
    return `<header class="nt-head">
        <img src="img/logo-section.webp" alt="">
        <div><small>Конспект · ${S.title || ''}</small><h1>Урок ${L.number}. ${L.title}</h1></div>
      </header>
      ${items.map(({ st, i }, k) => {
        const n = st.notes || {};
        const theory = kindOf(st) === 'theory';
        const cname = n.circuit !== undefined ? n.circuit : st.circuit;
        return `<section class="nt">
          <h2>${k + 1}. ${n.title || st.title || ''}</h2>
          ${cname ? `<svg class="circuit" id="nt${i}" data-i="${i}" data-c="${cname}"></svg>` : ''}
          ${theory && st.figure ? FIGURES[st.figure](st.figureOpts) : ''}
          ${theory && st.image ? `<div class="sticker"><img src="${st.image}" alt=""></div>` : ''}
          ${theory ? cards(st) + exs(st) : ''}
          <p>${n.text || st.text}</p>
        </section>`;
      }).join('')}
      ${L.practice ? `<section class="nt"><h2>${items.length + 1}. Спробуй сам у Tinkercad</h2><p>${L.practice.intro}</p><ol class="nt-tasks">${L.practice.tasks.map(t => `<li>${t}</li>`).join('')}</ol><p>Сайт: tinkercad.com/circuits · Потрібна допомога — консультацію дасть ментор на секції.</p></section>` : ''}
      <footer class="nt-foot">${S.author.name ? 'Автор курсу: ' + S.author.name + ' · ' : ''}${S.url || ''}<br>${S.license || ''}${S.aiNote ? ' · ' + S.aiNote : ''}</footer>`;
  }

  function printNotes() {
    let box = document.getElementById('notes');
    if (!box) { box = document.createElement('div'); box.id = 'notes'; document.body.appendChild(box); }
    box.innerHTML = notesHTML();
    // Схеми: статичні, у тому вигляді, що й в уроці; ключ — замкнений
    box.querySelectorAll('svg.circuit').forEach(svg => {
      const st = L.steps[+svg.dataset.i], n = st.notes || {};
      const def = JSON.parse(JSON.stringify(L.circuits[svg.dataset.c]));
      if (st.part && def.parts[st.part]) def.parts[st.part].closed = true;
      const c = Circuit.render(svg, def, def.view);
      if (n.meter) c.setMeter(n.meter.part, n.meter.text);
      if (n.probes) c.setProbes(n.probes.red, n.probes.black);
    });
    document.body.classList.add('printing');
    const done = () => { document.body.classList.remove('printing'); window.removeEventListener('afterprint', done); };
    window.addEventListener('afterprint', done);
    setTimeout(() => window.print(), 150);   // дати картинкам завантажитися
  }

  /* ---------- Фінал: картка-нагорода ---------- */
  function stars() {
    const m = Object.values(state.mistakes).reduce((a, b) => a + b, 0);
    return m === 0 ? 3 : m <= 2 ? 2 : 1;
  }

  /* Картка-нагорода: дані для Card (js/card.js). Ім'я — спільне для всіх уроків */
  const getName = () => { try { return localStorage.getItem('electro-name') || ''; } catch (e) { return ''; } };
  const setName = v => { try { localStorage.setItem('electro-name', v); } catch (e) {} };
  const cardMeta = () => ({
    number: L.number, title: L.title, lines: L.cardLines || [], stars: stars(), name: getName(),
    date: (state.card && state.card.date) || new Date().toISOString().slice(0, 10),
    sticker: (window.STICKERS || {})[L.id]
  });
  const cardSVG = () => Card.svg(cardMeta());
  const cardPNG = () => Card.png(cardMeta());

  function renderReward() {
    if (!allDone()) {
      const first = L.steps.findIndex((_, i) => !state.done[i]);
      view.innerHTML = `<h2>Майже!</h2><p class="txt">Щоб отримати картку, пройди всі кроки уроку.</p><button class="primary" id="goto">Перейти до кроку ${first + 1}</button>`;
      view.querySelector('#goto').onclick = () => go(first);
      return;
    }
    view.innerHTML = `<div class="reward">
      <div class="card-preview">${cardSVG()}</div>
      <div class="reward-side">
        <h2>Урок пройдено! 🎉</h2>
        <label class="name">Ім'я на картці (не обов'язково)<input id="nm" maxlength="24" placeholder="Наприклад, Оля" value="${getName()}"></label>
        <div class="share">
          <button class="primary" id="sh-native" hidden>📤 Поділитися</button>
          <button id="sh-tg">Telegram</button><button id="sh-fb">Facebook</button><button id="sh-vb">Viber</button>
          <button id="sh-copy">📋 Скопіювати картку</button><button id="sh-dl">⬇️ Завантажити</button>
        </div>
        <p class="small" id="sh-msg" aria-live="polite"></p>
        <p class="small">Усі твої наліпки зберігаються на сторінці <a href="achievements.html">«Досягнення»</a>.</p>
        <div class="notes-dl"><button id="dl-notes">📄 Конспект уроку (PDF)</button><span class="small">Уся теорія уроку на одній сторінці. У вікні друку обери «Зберегти як PDF».</span></div>
      </div></div>
      <div class="teaser">${catImg('surprised', 'cat-mini')}<p><b>Потрібна допомога? Звертайся до ментора</b><br>${L.teaser}</p><a class="primary" href="${(window.SITE && SITE.signupHref) || '#'}">Записатися на секцію</a></div>`;
    // Позначки виконаних завдань практики зберігаються в браузері
    const prCount = () => { const n = Object.values(state.practice || {}).filter(Boolean).length; const el = view.querySelector('#pr-count'); if (el) el.textContent = `Виконано: ${n} з ${L.practice.tasks.length}`; };
    view.querySelectorAll('.pr-tasks input').forEach(cb => cb.onchange = () => { state.practice = state.practice || {}; state.practice[cb.dataset.k] = cb.checked; save(); prCount(); });
    if (L.practice) prCount();
    const nm = view.querySelector('#nm'), msg = view.querySelector('#sh-msg');
    nm.oninput = () => { setName(nm.value.trim()); save(); view.querySelector('.card-preview').innerHTML = cardSVG(); };
    const url = encodeURIComponent(SITE_URL), txt = encodeURIComponent(L.shareText);
    const open = u => window.open(u, '_blank', 'noopener');
    view.querySelector('#sh-tg').onclick = () => open(`https://t.me/share/url?url=${url}&text=${txt}`);
    view.querySelector('#sh-fb').onclick = () => open(`https://www.facebook.com/sharer/sharer.php?u=${url}`);
    view.querySelector('#sh-vb').onclick = () => { location.href = `viber://forward?text=${txt}%20${url}`; };
    view.querySelector('#dl-notes').onclick = printNotes;
    view.querySelector('#sh-dl').onclick = async () => {
      const a = document.createElement('a'); a.href = URL.createObjectURL(await cardPNG()); a.download = `урок-${L.number}.png`; a.click();
    };
    view.querySelector('#sh-copy').onclick = async () => {
      try { await navigator.clipboard.write([new ClipboardItem({ 'image/png': cardPNG() })]); msg.textContent = 'Скопійовано! Встав у чат через Ctrl+V.'; }
      catch (e) { msg.textContent = 'Цей браузер не вміє копіювати картинки. Скористайся «Завантажити».'; }
    };
    // Системне меню «Поділитися» — якщо браузер уміє передавати файли
    const nb = view.querySelector('#sh-native');
    const probe = new File([new Blob(['x'], { type: 'image/png' })], 'x.png', { type: 'image/png' });
    if (navigator.canShare && navigator.canShare({ files: [probe] })) {
      nb.hidden = false;
      nb.onclick = async () => {
        const file = new File([await cardPNG()], `урок-${L.number}.png`, { type: 'image/png' });
        try { await navigator.share({ files: [file], text: L.shareText + ' ' + SITE_URL }); } catch (e) {}
      };
    }
  }

  /* ---------- Навігація ---------- */
  const back = $('#back'), next = $('#next');
  function updateNav() {
    back.disabled = state.step === 0;
    next.hidden = false;
    if (state.step === total) {
      next.disabled = !allDone();
      next.textContent = L.next ? `Наступний урок →` : 'До переліку уроків →';
      return;
    }
    next.disabled = !state.done[state.step];
    next.textContent = state.step === total - 1 ? 'Завершити ★' : 'Далі →';
  }

  function go(i) {
    state.step = Math.max(0, Math.min(total, i)); save();
    if (cleanup) cleanup(), cleanup = null;
    view.classList.remove('enter'); void view.offsetWidth; view.classList.add('enter');
    $('#counter').textContent = state.step < total ? `Крок ${state.step + 1} з ${total}` : 'Нагорода';
    if (state.step === total) renderReward();
    else { const st = L.steps[state.step]; RENDER[st.type](st, state.step); }
    drawProgress(); updateNav();
    window.scrollTo({ top: 0 });
  }

  back.onclick = () => go(state.step - 1);
  next.onclick = () => {
    if (next.disabled) return;
    if (state.step === total) { location.href = L.next ? 'lesson.html?l=' + L.next.id : 'index.html'; return; }
    go(state.step + 1);
  };
  document.addEventListener('keydown', e => {
    if (e.target.matches('input, textarea')) return;
    if (e.key === 'ArrowRight' && !next.disabled && state.step < total) go(state.step + 1);
    if (e.key === 'ArrowLeft' && !back.disabled) go(state.step - 1);
  });
  $('#reset').onclick = () => { if (confirm('Почати урок спочатку?')) { state = { step: 0, done: {}, mistakes: {}, name: state.name }; save(); go(0); } };

  $('#lesson-title').textContent = `Урок ${L.number}. ${L.title}`;
  go(state.step || 0);
})();
