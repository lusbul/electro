/* Ілюстрації для кроків-пояснень (не схеми). Кожна — функція, що повертає SVG.
   Крок посилається на них полем figure: 'water'. */
window.FIGURES = {
  /* Маленький графік Serial Plotter: still / ramp / jump */
  plotmini: (o = {}) => {
    const pts = { still: '10,70 60,70 110,70 160,70 210,70', ramp: '10,100 50,96 90,80 130,56 170,34 210,24', jump: '10,96 90,96 92,22 150,22 210,22' }[o.kind] || '';
    return `<svg class="figure" viewBox="0 0 220 120" role="img" aria-label="Графік"><rect x="1" y="1" width="218" height="118" rx="6" fill="#fff" stroke="#c9d2df"/>
      <line x1="10" y1="110" x2="210" y2="110" stroke="#d6dbe3"/><polyline points="${pts}" fill="none" stroke="#003FB8" stroke-width="3" stroke-linejoin="round"/></svg>`;
  },

  /* Як виконується скетч: setup — один раз, loop — по колу */
  setuploop: () => `<svg class="figure" viewBox="0 0 680 230" role="img" aria-label="setup виконується один раз, loop повторюється">
    <defs><marker id="slA" markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto"><path d="M0 0 L10 5 L0 10 Z" fill="#1F3B63"/></marker></defs>
    <circle cx="60" cy="115" r="34" fill="#DDEFDA" stroke="#57B146" stroke-width="3"/>
    <path d="M60 96 V114 M48 103 A17 17 0 1 0 72 103" stroke="#2e7d32" stroke-width="4" fill="none" stroke-linecap="round"/>
    <text x="60" y="172" text-anchor="middle" font-size="15" font-weight="700" fill="#1F3B63">Увімкнули</text>
    <path d="M98 115 H158" stroke="#1F3B63" stroke-width="3" marker-end="url(#slA)"/>
    <rect x="166" y="70" width="190" height="90" rx="12" fill="#CEF1F6" stroke="#0CB7D1" stroke-width="3"/>
    <text x="261" y="104" text-anchor="middle" font-size="21" font-weight="800" fill="#003FB8" font-family="Consolas, monospace">setup()</text>
    <text x="261" y="134" text-anchor="middle" font-size="16" font-weight="700" fill="#1F3B63">один раз</text>
    <path d="M360 115 H420" stroke="#1F3B63" stroke-width="3" marker-end="url(#slA)"/>
    <rect x="428" y="70" width="190" height="90" rx="12" fill="#FCE5D9" stroke="#EE7E42" stroke-width="3"/>
    <text x="523" y="104" text-anchor="middle" font-size="21" font-weight="800" fill="#c2541a" font-family="Consolas, monospace">loop()</text>
    <text x="523" y="134" text-anchor="middle" font-size="16" font-weight="700" fill="#1F3B63">знову і знову</text>
    <path d="M600 160 C640 215 420 215 446 166" stroke="#EE7E42" stroke-width="3" fill="none" marker-end="url(#slA)"/>
    <text x="523" y="222" text-anchor="middle" font-size="14" fill="#c2541a">повтор, доки є живлення</text>
    <text x="261" y="40" text-anchor="middle" font-size="14" fill="#1F3B63">налаштування: pinMode…</text>
    <text x="523" y="40" text-anchor="middle" font-size="14" fill="#1F3B63">робота: увімкнути, чекати, вимкнути…</text>
  </svg>`,

  /* Аналогія для уроку 3: #define — наліпка з іменем, int — коробка з написом */
  varbox: (o = {}) => `<svg class="figure varbox" viewBox="${o.only === 'define' ? '0 0 334 250' : o.only === 'int' ? '346 0 334 290' : '0 0 680 270'}" role="img" aria-label="Наліпка і коробка">
    <text x="170" y="26" text-anchor="middle" font-size="17" font-weight="800" fill="#003FB8">#define — як наліпка</text>
    <g transform="translate(70 60) rotate(-4 100 40)">
      <path d="M0 6 Q0 0 6 0 H194 Q200 0 200 6 V74 Q200 80 194 80 H24 L0 56 Z" fill="#FCE5D9" stroke="#EE7E42" stroke-width="3"/>
      <path d="M0 56 L24 56 L24 80" fill="#f6c8ad" stroke="#EE7E42" stroke-width="2"/>
      <text x="100" y="34" text-anchor="middle" font-size="22" font-weight="800" fill="#1F3B63" font-family="Consolas, monospace">LED_PIN</text>
      <text x="100" y="62" text-anchor="middle" font-size="16" font-weight="700" fill="#7a4a00">означає «9»</text>
    </g>
    <text x="170" y="185" text-anchor="middle" font-size="14" fill="#1F3B63">Перед запуском усюди, де наліпка,</text>
    <text x="170" y="204" text-anchor="middle" font-size="14" fill="#1F3B63">підставляється напис <tspan font-weight="800" font-family="Consolas, monospace">9</tspan>.</text>
    <text x="170" y="232" text-anchor="middle" font-size="14" font-weight="700" fill="#E53281">Наліпку не переклеїш під час роботи</text>
    <line x1="340" y1="40" x2="340" y2="250" stroke="#d6dbe3" stroke-dasharray="5 5"/>
    <text x="510" y="26" text-anchor="middle" font-size="17" font-weight="800" fill="#003FB8">Змінна — як коробка з написом</text>
    <g transform="translate(420 70)">
      <path d="M0 30 L90 10 L180 30 L90 50 Z" fill="#e9c58f" stroke="#a87c3d" stroke-width="2.5"/>
      <path d="M0 30 V100 L90 120 V50 Z" fill="#d9ab6a" stroke="#a87c3d" stroke-width="2.5"/>
      <path d="M180 30 V100 L90 120 V50 Z" fill="#c99654" stroke="#a87c3d" stroke-width="2.5"/>
      <rect x="18" y="62" width="58" height="26" rx="3" fill="#fff" stroke="#a87c3d" transform="skewY(12)"/>
      <text x="47" y="80" text-anchor="middle" font-size="12" font-weight="800" fill="#1F3B63" font-family="Consolas, monospace" transform="skewY(12)">pauseMs</text>
      <rect x="62" y="-18" width="56" height="30" rx="5" fill="#fff" stroke="#003FB8" stroke-width="2.5"/>
      <text x="90" y="3" text-anchor="middle" font-size="17" font-weight="800" fill="#003FB8" font-family="Consolas, monospace">250</text>
      <path d="M90 14 V30" stroke="#003FB8" stroke-width="2" marker-end="url(#vbArrow)"/>
    </g>
    <defs><marker id="vbArrow" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto"><path d="M0 0 L8 4 L0 8 Z" fill="#003FB8"/></marker></defs>
    <text x="510" y="210" text-anchor="middle" font-size="14" fill="#1F3B63">У коробці лежить число.</text>
    <text x="510" y="229" text-anchor="middle" font-size="14" fill="#1F3B63"><tspan font-weight="800" font-family="Consolas, monospace">pauseMs = 500;</tspan></text>
    <text x="510" y="248" text-anchor="middle" font-size="14" fill="#1F3B63">виймає 250 і кладе 500.</text>
    <text x="510" y="272" text-anchor="middle" font-size="14" font-weight="700" fill="#57B146">Вміст можна міняти під час роботи</text>
  </svg>`,

  /* Одна деталь окремо: { type, view: 'real' | 'schematic', ...параметри }. viewBox підганяється автоматично (svg.autofit) */
  part: (o = {}) => {
    const P = window.PARTS[o.type], view = o.view || 'schematic';
    const draw = view === 'real' && P.real ? P.real : P.draw;
    const id = 'fp' + Math.random().toString(36).slice(2, 8);
    return `<svg class="figure autofit part-fig" viewBox="-20 -40 140 140" role="img" aria-label="${o.alt || ''}"><g class="part part-${o.type}">${draw({ ...o, id, label: o.label ?? '' })}</g></svg>`;
  },

  /* Таблиця умовних позначень: деталь «як є» і її позначення на схемі */
  symbols: (o = {}) => {
    const items = o.items || [];
    return `<div class="sym-grid">${items.map(it => `<div class="sym-card">
        <div class="sym-pics">${FIGURES.part({ ...it.part, view: 'real' })}<span class="sym-arrow">→</span>${FIGURES.part({ ...it.part, view: 'schematic' })}</div>
        <b>${it.name}</b></div>`).join('')}</div>`;
  },

  /* Модель з водою: висота води в баку = напруга, вузьке місце = опір, потік = струм.
     o.level — висота води над дном (40…200), o.narrow — ширина вузького місця труби */
  water: (o = {}) => {
    const narrow = o.narrow ?? 16;
    const level = o.level ?? 150;
    const floor = 266;                         // дно баку (і нижній край труби)
    const top = floor - level;
    const y0 = 226, y1 = floor, yc = (y0 + y1) / 2;
    const n0 = yc - narrow / 2, n1 = yc + narrow / 2;
    const fill = `M198 ${y0} H330 Q345 ${y0} 350 ${n0} H430 Q435 ${y0} 450 ${y0} H590 V${y1} H450 Q435 ${y1} 430 ${n1} H350 Q345 ${y1} 330 ${y1} H198 Z`;
    const edges = `M198 ${y0} H330 Q345 ${y0} 350 ${n0} H430 Q435 ${y0} 450 ${y0} H590 M590 ${y1} H450 Q435 ${y1} 430 ${n1} H350 Q345 ${y1} 330 ${y1} H198`;
    // Швидкість потоку: більша висота води (напруга) → швидше; вужче місце (більший опір) → повільніше
    const speed = level * narrow * 0.06;      // пікселів за секунду
    const flow = speed > 0 ? `style="animation-duration:${(22 / speed).toFixed(3)}s"` : '';
    return `<svg viewBox="0 0 620 300" class="figure" role="img" aria-label="Модель кола з водою">
      <defs><linearGradient id="wg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7fd0f2"/><stop offset="1" stop-color="#3aa6dc"/></linearGradient></defs>
      <rect x="42" y="${top}" width="158" height="${level}" fill="url(#wg)"/>
      <path d="${fill}" fill="url(#wg)"/>
      <path class="water-flow" ${flow} d="M206 ${yc} H584" stroke="#fff" stroke-width="6" stroke-linecap="round" stroke-dasharray="0 22" fill="none"/>
      <path d="M40 28 V266 H198 M198 28 V${y0}" fill="none" stroke="#1f2a44" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/>
      <path d="${edges}" fill="none" stroke="#1f2a44" stroke-width="3" stroke-linejoin="round"/>
      <path d="M598 ${yc} l-14 -9 v18 z" fill="#1f2a44"/>
      <g stroke="#E53281" stroke-width="3" fill="#E53281">
        <line x1="20" y1="${floor - 4}" x2="20" y2="${top + 8}"/>
        <path d="M20 ${top} l-6 10 h12 z"/><path d="M20 ${floor} l-6 -10 h12 z"/>
      </g>
      <text x="12" y="${(top + floor) / 2}" transform="rotate(-90 12 ${(top + floor) / 2})" text-anchor="middle" font-size="16" font-weight="800" fill="#E53281">${level >= 110 ? 'Напруга U' : 'U'}</text>
      <text x="390" y="${n0 - 14}" text-anchor="middle" font-size="16" font-weight="800" fill="#EE7E42">Опір R</text>
      <text x="520" y="${y0 - 14}" text-anchor="middle" font-size="16" font-weight="800" fill="#1C3AA9">Сила струму I</text>
    </svg>`;
  },

  /* Аналогії з дорогами: послідовне (мости підряд) і вузол (розвилка 5 → 2 + 3) */
  roads: () => {
    const car = (x, y, c, r = 0) => `<g transform="translate(${x} ${y}) rotate(${r})"><rect x="-13" y="-7" width="26" height="14" rx="4" fill="${c}"/><rect x="-5" y="-5" width="9" height="10" rx="2" fill="rgba(255,255,255,.7)"/></g>`;
    const C = ['#E53281', '#0CB7D1', '#EE7E42', '#57B146', '#1C3AA9'];
    return `<svg viewBox="0 0 640 400" class="figure" role="img" aria-label="Аналогії з дорогами">
      <text x="14" y="26" font-size="17" font-weight="800" fill="#003FB8">Послідовне: одна дорога, два мости підряд</text>
      <rect x="10" y="62" width="620" height="44" rx="6" fill="#9aa3ad" stroke="#5f6670" stroke-width="3"/>
      <path d="M10 84 H630" stroke="#fff" stroke-width="3" stroke-dasharray="16 12"/>
      ${[200, 420].map((x, k) => `<g><rect x="${x - 45}" y="50" width="90" height="68" rx="4" fill="none" stroke="#7a5230" stroke-width="5"/><path d="M${x - 45} 50 Q${x} 30 ${x + 45} 50" fill="none" stroke="#7a5230" stroke-width="5"/><text x="${x}" y="144" text-anchor="middle" font-size="15" font-weight="700" fill="#7a5230">міст ${k + 1}</text></g>`).join('')}
      ${[60, 110, 290, 340, 520].map((x, k) => car(x, 84, C[k])).join('')}
      <text x="14" y="176" font-size="14" fill="#1F3B63">Кожна машина проїжджає обидва мости. Закрили один міст — стала вся дорога.</text>

      <text x="14" y="222" font-size="17" font-weight="800" fill="#003FB8">Вузол: розвилка</text>
      ${(() => {
        const main = 'M10 300 H170 M560 300 H630';
        const br = 'M170 300 L240 252 H490 L560 300 M170 300 L240 348 H490 L560 300';
        return `<path d="${main}" stroke="#5f6670" stroke-width="50" fill="none"/>
          <path d="${br}" stroke="#5f6670" stroke-width="32" fill="none" stroke-linejoin="round"/>
          <path d="${main}" stroke="#9aa3ad" stroke-width="44" fill="none"/>
          <path d="${br}" stroke="#9aa3ad" stroke-width="26" fill="none" stroke-linejoin="round"/>
          <path d="M10 300 H150 M580 300 H630" stroke="#fff" stroke-width="3" stroke-dasharray="16 12"/>`;
      })()}
      <circle cx="170" cy="300" r="10" fill="#E53281"/><circle cx="560" cy="300" r="10" fill="#E53281"/>
      ${[30, 60, 90, 120].map((x, k) => car(x, 289, C[k])).join('')}${car(150, 311, C[4])}
      ${[320, 400].map((x, k) => car(x, 252, C[k])).join('')}
      ${[300, 365, 430].map((x, k) => car(x, 348, C[k + 2])).join('')}
      <text x="85" y="346" text-anchor="middle" font-size="16" font-weight="800" fill="#1F3B63">приїхало 5</text>
      <text x="365" y="228" text-anchor="middle" font-size="16" font-weight="800" fill="#1F3B63">2</text>
      <text x="365" y="388" text-anchor="middle" font-size="16" font-weight="800" fill="#1F3B63">3</text>
      <text x="170" y="270" text-anchor="middle" font-size="15" font-weight="800" fill="#E53281">вузол</text>
      <text x="560" y="270" text-anchor="middle" font-size="15" font-weight="800" fill="#E53281">вузол</text>
    </svg>`;
  },

  /* Макетна плата: o.side = 'front' | 'back'; o.parts — резистори зверху: [{from:'c3', to:'c7'}] */
  breadboard: (o = {}) => {
    const N = o.cols || 30, d = 20, x0 = 66, rows = 'abcdefghij';   // половинна плата: 30 стовпців
    const back = o.side === 'back';
    const cx = c => back ? x0 + (N - c) * d : x0 + (c - 1) * d;        // знизу плата дзеркальна
    const yRow = r => { const k = rows.indexOf(r); return k < 5 ? 116 + k * d : 116 + 5 * d + 30 + (k - 5) * d; };
    const yRail = { tp: 42, tm: 64, bp: 116 + 10 * d + 30 + 32, bm: 116 + 10 * d + 30 + 54 };
    const W = x0 * 2 + (N - 1) * d, H = yRail.bm + 40;
    let g = `<rect x="10" y="14" width="${W - 20}" height="${H - 20}" rx="12" fill="${back ? '#ece9e2' : '#fbfbf9'}" stroke="#c9c9c4" stroke-width="2"/>`;
    // розділювач посередині
    g += `<rect x="16" y="${yRow('e') + 12}" width="${W - 32}" height="${30 - 24}" rx="3" fill="${back ? '#d9d6ce' : '#e9e9e4'}"/>`;
    if (!back) {
      // номери всіх стовпців і літери рядків з обох боків
      for (let c = 1; c <= N; c++) g += `<text x="${cx(c)}" y="${yRow('a') - 14}" text-anchor="middle" font-size="10" font-weight="700" fill="#8a8a84">${c}</text><text x="${cx(c)}" y="${yRow('j') + 22}" text-anchor="middle" font-size="10" font-weight="700" fill="#8a8a84">${c}</text>`;
      for (const r of rows) g += `<text x="${x0 - 26}" y="${yRow(r) + 4}" text-anchor="middle" font-size="12" font-weight="800" fill="#8a8a84">${r}</text><text x="${W - x0 + 26}" y="${yRow(r) + 4}" text-anchor="middle" font-size="12" font-weight="800" fill="#8a8a84">${r}</text>`;
      // шини живлення: по дві зверху й знизу; червона лінія біля «+», синя біля «−»
      for (const [k, y] of Object.entries(yRail)) {
        const plus = k.endsWith('p'), top = k[0] === 't';
        const ly = plus ? (top ? y - 11 : y - 11) : (top ? y + 11 : y + 11);
        const col = plus ? '#d93025' : '#1c7ed6', sign = plus ? '+' : '−';
        g += `<line x1="${x0 - 14}" y1="${ly}" x2="${W - x0 + 14}" y2="${ly}" stroke="${col}" stroke-width="2"/>
          <text x="${x0 - 30}" y="${y + 5}" text-anchor="middle" font-size="15" font-weight="800" fill="${col}">${sign}</text>
          <text x="${W - x0 + 30}" y="${y + 5}" text-anchor="middle" font-size="15" font-weight="800" fill="${col}">${sign}</text>`;
        for (let c = 1; c <= N; c++) if (c % 6 !== 0) g += `<rect class="bb-h" data-g="${k}" x="${cx(c) - 4.5}" y="${y - 4.5}" width="9" height="9" rx="1.5" fill="#3a3a3a"/>`;
      }
      for (let c = 1; c <= N; c++) for (const r of rows)
        g += `<rect class="bb-h" data-g="${c}${'abcde'.includes(r) ? 'T' : 'B'}" data-id="${r}${c}" x="${cx(c) - 4.5}" y="${yRow(r) - 4.5}" width="9" height="9" rx="1.5" fill="#3a3a3a"/>`;
      // деталі, встромлені в плату
      (o.parts || []).forEach((p, k) => {
        const pos = id => [cx(+id.slice(1)), yRow(id[0])];
        const [a, b] = [pos(p.from), pos(p.to)];
        const mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2;
        g += `<g><circle cx="${a[0]}" cy="${a[1]}" r="9" fill="none" stroke="#EE7E42" stroke-width="3"/><circle cx="${b[0]}" cy="${b[1]}" r="9" fill="none" stroke="#EE7E42" stroke-width="3"/>
          <line x1="${a[0]}" y1="${a[1]}" x2="${b[0]}" y2="${b[1]}" stroke="#9aa1a8" stroke-width="4"/>
          <rect x="${mx - 24}" y="${my - 11}" width="48" height="22" rx="8" fill="#e7c89a" stroke="#b8925c" stroke-width="1.5"/>
          <text x="${mx}" y="${my + 5}" text-anchor="middle" font-size="14" font-weight="800" fill="#1F3B63">${p.label || 'R' + (k + 1)}</text></g>`;
      });
    } else {
      // знизу: металеві смужки-контакти
      for (let c = 1; c <= N; c++) for (const half of ['T', 'B']) {
        const ya = yRow(half === 'T' ? 'a' : 'f'), yb = yRow(half === 'T' ? 'e' : 'j');
        g += `<rect x="${cx(c) - 6}" y="${ya - 8}" width="12" height="${yb - ya + 16}" rx="4" fill="#c9ced4" stroke="#8e969f" stroke-width="1.2"/>`;
      }
      for (const [k, y] of Object.entries(yRail)) {
        g += `<rect x="${cx(N) - 8}" y="${y - 7}" width="${(N - 1) * d + 16}" height="14" rx="5" fill="#c9ced4" stroke="#8e969f" stroke-width="1.2"/>`;
      }
      g += `<text x="${W / 2}" y="${H - 6}" text-anchor="middle" font-size="13" fill="#6E747A">вид знизу — плата перевернута, тож стовпці йдуть у зворотному порядку</text>`;
    }
    return `<svg viewBox="0 0 ${W} ${H}" class="figure bb" role="img" aria-label="Макетна плата ${back ? 'знизу' : 'зверху'}">${g}</svg>`;
  }
};

/* Інтерактив малюнків: (обгортка, крок, done) */
window.FIGURE_INTERACT = {
  breadboard(wrap, st, done) {
    let side = 'front', touched = false, flipped = false;
    const draw = () => {
      wrap.innerHTML = FIGURES.breadboard({ ...st.figureOpts, side }) +
        `<div class="bb-bar"><button class="primary alt bb-flip">${side === 'front' ? '🔄 Перевернути плату' : '🔄 Повернути лицем'}</button><span class="bb-msg">${side === 'front' ? 'Торкнись будь-якого отвору.' : 'Металеві смужки з\u2019єднують отвори зсередини.'}</span></div>`;
      wrap.querySelectorAll('.bb-h').forEach(h => h.onclick = () => {
        const grp = h.dataset.g;
        wrap.querySelectorAll('.bb-h').forEach(x => x.setAttribute('fill', x.dataset.g === grp ? '#0CB7D1' : '#3a3a3a'));
        const rail = /^[tb][pm]/.test(grp);
        const m = wrap.querySelector('.bb-msg');
        m.textContent = rail ? `Шина живлення «${grp[1] === 'p' ? '+' : '−'}»: усі отвори ряду з\u2019єднані між собою.` : 'Ці 5 отворів з\u2019єднані між собою. Через розділювач посередині з\u2019єднання немає.';
        m.style.color = rail ? (grp[1] === 'p' ? '#d93025' : '#1c7ed6') : '#1a1a1a';
        touched = true; if (touched && flipped) done();
      });
      wrap.querySelector('.bb-flip').onclick = () => {
        wrap.classList.remove('flip-in'); wrap.classList.add('flip-out');
        setTimeout(() => {
          side = side === 'front' ? 'back' : 'front'; flipped = true;
          wrap.classList.remove('flip-out'); wrap.classList.add('flip-in'); draw();
          if (touched && flipped) done();
        }, 220);
      };
    };
    draw();
  }
};
