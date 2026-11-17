/* Ілюстрації для кроків-пояснень (не схеми). Кожна — функція, що повертає SVG.
   Крок посилається на них полем figure: 'water'. */
window.FIGURES = {
  /* Гістерезис нічника: два пороги на шкалі АЦП і петля «увімкнено/вимкнено» */
  hyst: (o = {}) => {
    const lo = o.lower ?? 400, hi = o.upper ?? 520, X = v => 40 + v / 1023 * 600, INK = '#1F3B63';
    return `<svg class="fig" viewBox="0 0 680 250" role="img" aria-label="Два пороги нічника">
      <rect x="${X(0)}" y="40" width="${X(lo) - X(0)}" height="150" fill="#e8f0ff"/>
      <rect x="${X(lo)}" y="40" width="${X(hi) - X(lo)}" height="150" fill="#fff4d6"/>
      <rect x="${X(hi)}" y="40" width="${X(1023) - X(hi)}" height="150" fill="#f2f4f7"/>
      <text x="${(X(0) + X(lo)) / 2}" y="30" text-anchor="middle" font-size="13" font-weight="700" fill="${INK}">темно → увімкнути</text>
      <text x="${(X(lo) + X(hi)) / 2}" y="30" text-anchor="middle" font-size="13" font-weight="700" fill="#b26a00">пам’ятаємо стан</text>
      <text x="${(X(hi) + X(1023)) / 2}" y="30" text-anchor="middle" font-size="13" font-weight="700" fill="${INK}">світло → вимкнути</text>
      <path d="M${X(1023) - 10} 80 H${X(lo)} " stroke="#5a6573" stroke-width="3" fill="none"/>
      <path d="M${X(lo)} 80 V150" stroke="#EE7E42" stroke-width="3" fill="none"/>
      <path d="M${X(0) + 10} 150 H${X(hi)}" stroke="#EE7E42" stroke-width="3" fill="none"/>
      <path d="M${X(hi)} 150 V80" stroke="#5a6573" stroke-width="3" fill="none"/>
      <path d="M${(X(lo) + X(hi)) / 2 - 6} 80 l10 -6 v12 z" fill="#5a6573"/><path d="M${(X(lo) + X(hi)) / 2 + 6} 150 l-10 -6 v12 z" fill="#EE7E42"/>
      <text x="${X(1023) - 12}" y="72" text-anchor="end" font-size="13" fill="#5a6573">нічник вимкнений</text>
      <text x="${X(0) + 12}" y="170" font-size="13" fill="#EE7E42">нічник увімкнений</text>
      <line x1="${X(lo)}" y1="40" x2="${X(lo)}" y2="200" stroke="${INK}" stroke-width="2" stroke-dasharray="5 4"/>
      <line x1="${X(hi)}" y1="40" x2="${X(hi)}" y2="200" stroke="${INK}" stroke-width="2" stroke-dasharray="5 4"/>
      <text x="${X(lo) - 4}" y="216" text-anchor="end" font-size="13" font-weight="800" fill="${INK}">lower = ${lo}</text>
      <text x="${X(hi) + 4}" y="216" font-size="13" font-weight="800" fill="${INK}">upper = ${hi}</text>
      <line x1="${X(0)}" y1="200" x2="${X(1023)}" y2="200" stroke="#8a93a0"/><text x="${X(0)}" y="240" font-size="12" fill="#5a6573">0</text><text x="${X(1023)}" y="240" text-anchor="end" font-size="12" fill="#5a6573">1023 — код АЦП</text>
    </svg>`;
  },
  /* Підтягування входу. o.mode: 'internal' (вбудований резистор до 5 В), 'up' (зовнішній до 5 В), 'down' (зовнішній до GND, кнопка до 5 В).
     o.pressed — стан кнопки; o.hideRead — не показувати, що читає вхід (для питань). Важіль кнопки — як у Tinkercad. */
  pullup: (o = {}) => {
    const pr = !!o.pressed, md = o.mode || 'internal', INK = '#1F3B63', hi = '#d93025', lo = '#1c7ed6';
    const read = md === 'down' ? (pr ? 'HIGH' : 'LOW') : (pr ? 'LOW' : 'HIGH');
    const btn = (x, y) => { const d = pr ? 8.5 : 0;
      return `<circle cx="${x}" cy="${y}" r="4" fill="#fff" stroke="${INK}" stroke-width="3"/><circle cx="${x + 60}" cy="${y}" r="4" fill="#fff" stroke="${INK}" stroke-width="3"/>
      <g transform="translate(0 ${d})"><line x1="${x - 6}" y1="${y - 14}" x2="${x + 66}" y2="${y - 14}" stroke="${INK}" stroke-width="3.5" stroke-linecap="round"/><line x1="${x + 30}" y1="${y - 14}" x2="${x + 30}" y2="${y - 32}" stroke="${INK}" stroke-width="3"/><line x1="${x + 18}" y1="${y - 32}" x2="${x + 42}" y2="${y - 32}" stroke="${INK}" stroke-width="3.5" stroke-linecap="round"/></g>
      <text x="${x + 30}" y="${y - 42}" text-anchor="middle" font-size="13" font-weight="700" fill="${INK}">кнопка ${pr ? 'натиснута' : 'відпущена'}</text>`; };
    const gnd = (x, y) => `<line x1="${x - 16}" y1="${y}" x2="${x + 16}" y2="${y}" stroke="${INK}" stroke-width="3"/><line x1="${x - 10}" y1="${y + 8}" x2="${x + 10}" y2="${y + 8}" stroke="${INK}" stroke-width="3"/><line x1="${x - 4}" y1="${y + 16}" x2="${x + 4}" y2="${y + 16}" stroke="${INK}" stroke-width="3"/><text x="${x}" y="${y + 34}" text-anchor="middle" font-size="13" font-weight="700" fill="${INK}">GND</text>`;
    const res = (x, y, lbl) => `<rect x="${x - 12}" y="${y}" width="24" height="56" fill="#fff" stroke="${INK}" stroke-width="3"/><text x="${x + 20}" y="${y + 33}" font-size="13" fill="${INK}">${lbl}</text>`;
    const readTxt = o.hideRead ? `<text x="40" y="252" font-size="15" font-weight="700" fill="${INK}">вхід D2 читає: ?</text>`
      : `<text x="40" y="252" font-size="15" font-weight="700" fill="${INK}">вхід D2 читає: <tspan font-size="18" font-weight="800" fill="${read === 'HIGH' ? hi : lo}">${read}</tspan></text>`;
    let body;
    if (md === 'down') {
      body = `<text x="96" y="38" font-size="16" font-weight="800" fill="${hi}">5 В</text><line x1="110" y1="44" x2="110" y2="88" stroke="${INK}" stroke-width="3"/>
        <line x1="110" y1="88" x2="200" y2="88" stroke="${INK}" stroke-width="3"/>${btn(200, 88)}<line x1="260" y1="88" x2="300" y2="88" stroke="${INK}" stroke-width="3"/>
        <line x1="300" y1="88" x2="300" y2="140" stroke="${INK}" stroke-width="3"/><circle cx="300" cy="140" r="5" fill="${INK}"/>
        <line x1="300" y1="140" x2="420" y2="140" stroke="${INK}" stroke-width="3"/><circle cx="420" cy="140" r="6" fill="#fff" stroke="${INK}" stroke-width="3"/><text x="432" y="145" font-size="14" font-weight="700" fill="${INK}">D2</text>
        ${res(300, 140, 'резистор 10 кОм')}<line x1="300" y1="196" x2="300" y2="210" stroke="${INK}" stroke-width="3"/>${gnd(300, 210)}`;
    } else if (md === 'up') {
      /* Дзеркально до 'down': резистор зверху до 5 В, кнопка від вузла до GND */
      body = `<text x="286" y="38" font-size="16" font-weight="800" fill="${hi}">5 В</text><line x1="300" y1="44" x2="300" y2="60" stroke="${INK}" stroke-width="3"/>
        ${res(300, 60, 'резистор 10 кОм')}<line x1="300" y1="116" x2="300" y2="140" stroke="${INK}" stroke-width="3"/><circle cx="300" cy="140" r="5" fill="${INK}"/>
        <line x1="300" y1="140" x2="420" y2="140" stroke="${INK}" stroke-width="3"/><circle cx="420" cy="140" r="6" fill="#fff" stroke="${INK}" stroke-width="3"/><text x="432" y="145" font-size="14" font-weight="700" fill="${INK}">D2</text>
        <line x1="300" y1="140" x2="230" y2="140" stroke="${INK}" stroke-width="3"/>${btn(170, 140)}<line x1="170" y1="140" x2="110" y2="140" stroke="${INK}" stroke-width="3"/>
        <line x1="110" y1="140" x2="110" y2="186" stroke="${INK}" stroke-width="3"/>${gnd(110, 186)}`;
    } else {
      const inside = md === 'internal';
      body = `${inside ? `<rect x="20" y="16" width="250" height="210" rx="10" fill="#eef8f9" stroke="#0e7c86" stroke-width="2" stroke-dasharray="7 5"/><text x="34" y="40" font-size="14" font-weight="700" fill="#0e7c86">усередині Arduino</text>` : ''}
        <text x="96" y="66" font-size="16" font-weight="800" fill="${hi}">5 В</text><line x1="110" y1="72" x2="110" y2="90" stroke="${INK}" stroke-width="3"/>
        ${res(110, 90, inside ? 'вбудований резистор' : 'резистор 10 кОм')}
        <line x1="110" y1="146" x2="110" y2="180" stroke="${INK}" stroke-width="3"/><circle cx="110" cy="180" r="5" fill="${INK}"/>
        <line x1="110" y1="180" x2="380" y2="180" stroke="${INK}" stroke-width="3"/>
        <circle cx="${inside ? 270 : 200}" cy="180" r="6" fill="#fff" stroke="${INK}" stroke-width="3"/><text x="${inside ? 262 : 192}" y="166" font-size="14" font-weight="700" fill="${INK}">D2</text>
        ${btn(380, 180)}<line x1="440" y1="180" x2="490" y2="180" stroke="${INK}" stroke-width="3"/><line x1="490" y1="180" x2="490" y2="200" stroke="${INK}" stroke-width="3"/>${gnd(490, 200)}`;
    }
    return `<svg class="fig" viewBox="0 0 520 268" role="img" aria-label="Підтягування входу">${body}${readTxt}</svg>`;
  },
  /* Два зовнішні варіанти поруч: до GND і до 5 В */
  pullpair: (o = {}) => `<div class="two-col fig-pair"><div><b>Резистор до GND, кнопка до 5 В</b>${FIGURES.pullup({ mode: 'down', pressed: o.pressed })}<p class="small">відпущена — LOW, натиснута — HIGH</p></div>
    <div><b>Резистор до 5 В, кнопка до GND</b>${FIGURES.pullup({ mode: 'up', pressed: o.pressed })}<p class="small">відпущена — HIGH, натиснута — LOW</p></div></div>`,
  /* Оператори з прикладами true/false: o.ops = [[знак, що означає, приклад true, приклад false], …] */
  ops: (o = {}) => `<div class="ops-grid">${(o.ops || []).map(([op, m, t, f]) => `<div class="op-card"><span class="op-badge">${op}</span><span class="op-m">${m}</span>
      <span class="op-ex"><code>${t}</code><b class="tf t">true</b></span><span class="op-ex"><code>${f}</code><b class="tf f">false</b></span></div>`).join('')}</div>`,
  /* Модулі датчиків: різні на вигляд, однаковий цифровий вихід DO */
  modules: (o = {}) => `<svg class="fig" viewBox="-10 -30 480 130" role="img" aria-label="Модулі датчиків">
      ${(o.kinds || ['sound', 'hall', 'line']).map((k, i) => `<g transform="translate(${i * 160} 0)">${PARTS.dsensor.real({ id: 'm' + i, kind: k })}</g>`).join('')}</svg>`,
  /* if / else: розвилка з указівником; o.cond — умова істинна? (інтерактивно — FIGURE_INTERACT.ifelse) */
  ifelse: (o = {}) => {
    const c = !!o.cond, INK = '#1F3B63', on = '#2f9e44', off = '#c4cad3';
    return `<div class="ifelse"><svg class="fig" viewBox="0 0 600 250" role="img" aria-label="if else">
      <text x="300" y="22" text-anchor="middle" font-size="15" font-weight="700" fill="${INK}">${o.q || 'digitalRead(SENSOR) == HIGH'} ?</text>
      <path d="M300 34 L360 74 L300 114 L240 74 Z" fill="#fff4d6" stroke="#b26a00" stroke-width="3"/><text x="300" y="80" text-anchor="middle" font-size="18" font-weight="800" fill="#b26a00">if</text>
      <path d="M240 74 H110 V150" fill="none" stroke="${c ? on : off}" stroke-width="${c ? 5 : 3}"/><text x="170" y="64" text-anchor="middle" font-size="14" font-weight="800" fill="${c ? on : '#8a93a0'}">так (true)</text>
      <path d="M360 74 H490 V150" fill="none" stroke="${c ? off : on}" stroke-width="${c ? 3 : 5}"/><text x="430" y="64" text-anchor="middle" font-size="14" font-weight="800" fill="${c ? '#8a93a0' : on}">ні (false)</text>
      <rect x="20" y="150" width="180" height="56" rx="8" fill="${c ? '#e9f7e6' : '#f4f5f7'}" stroke="${c ? on : off}" stroke-width="3"/><text x="110" y="183" text-anchor="middle" font-size="14" font-family="monospace" fill="${INK}">digitalWrite(LED, HIGH)</text>
      <rect x="400" y="150" width="180" height="56" rx="8" fill="${c ? '#f4f5f7' : '#e9f7e6'}" stroke="${c ? off : on}" stroke-width="3"/><text x="490" y="183" text-anchor="middle" font-size="14" font-family="monospace" fill="${INK}">digitalWrite(LED, LOW)</text>
      <text x="110" y="232" text-anchor="middle" font-size="13" fill="${c ? on : '#8a93a0'}">${c ? '▶ виконується' : 'пропускається'}</text>
      <text x="490" y="232" text-anchor="middle" font-size="13" fill="${c ? '#8a93a0' : on}">${c ? 'пропускається' : '▶ виконується (else)'}</text>
      <circle cx="300" cy="185" r="22" fill="${c ? '#ff3b30' : '#5a1d1d'}" ${c ? 'style="filter:drop-shadow(0 0 10px #ff3b30)"' : ''}/><text x="300" y="226" text-anchor="middle" font-size="12" fill="${INK}">світлодіод</text>
    </svg></div>`;
  },
  /* Як працює датчик перешкод: перешкода є / немає / чорна перешкода */
  irsense: () => {
    const INK = '#1F3B63';
    const sensor = x => `<rect x="${x}" y="40" width="46" height="60" rx="4" fill="#2b2f6b"/><rect x="${x + 38}" y="50" width="18" height="12" rx="6" fill="#e9eef5" stroke="#9aa"/><rect x="${x + 38}" y="76" width="18" height="12" rx="6" fill="#1b1b1b" stroke="#555"/>`;
    const ray = (x1, y1, x2, y2, dim) => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#e03131" stroke-width="3" stroke-dasharray="6 5" ${dim ? 'opacity=".35"' : ''} marker-end="url(#irArr)"/>`;
    const panel = (dx, title, body, cap, capCol) => `<g transform="translate(${dx} 0)"><text x="110" y="22" text-anchor="middle" font-size="14" font-weight="800" fill="${INK}">${title}</text>${sensor(10)}${body}
      ${cap.map((t, k) => `<text x="110" y="${140 + k * 17}" text-anchor="middle" font-size="12.5" font-weight="${k === cap.length - 1 ? 800 : 400}" fill="${k === cap.length - 1 ? capCol : INK}">${t}</text>`).join('')}</g>`;
    return `<svg class="fig" viewBox="0 0 690 215" role="img" aria-label="Як працює датчик перешкод">
      <defs><marker id="irArr" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0 L10 5 L0 10 z" fill="#e03131"/></marker></defs>
      ${panel(0, 'Перешкода є', `<rect x="160" y="34" width="22" height="72" fill="#e9ecef" stroke="#adb5bd" stroke-width="2"/>${ray(68, 56, 156, 66)}${ray(158, 74, 70, 82)}`,
        ['Світло відбилось', 'і потрапило в приймач', 'DO = LOW'], '#2b8a3e')}
      ${panel(230, 'Перешкоди немає', `${ray(68, 56, 210, 56)}`, ['Світло пішло далі,', 'нічого не повернулось', 'DO = HIGH'], '#e8590c')}
      ${panel(460, 'Чорна перешкода', `<rect x="160" y="34" width="22" height="72" fill="#1b1b1b"/>${ray(68, 56, 156, 60)}<text x="171" y="120" text-anchor="middle" font-size="10" fill="#5a6573">поглинає</text>`,
        ['Чорне поглинає ІЧ-світло —', 'відбивати нічого', 'DO = HIGH: «не бачить»'], '#e8590c')}
      <text x="345" y="208" text-anchor="middle" font-size="11" fill="#5a6573">На модулі: білий — ІЧ-світлодіод (світить), чорний — фотоприймач (ловить відбите світло)</text>
    </svg>`;
  },
  /* Аналогія бібліотека → клас (креслення) → об’єкт (річ) → метод (дія) для NeoPixel */
  classobj: () => {
    const INK = '#1F3B63', BLUE = '#1c5fb8';
    const strip = (x, y, lit) => `<rect x="${x}" y="${y}" width="150" height="34" rx="4" fill="#1b1f27"/>${Array.from({ length: 8 }, (_, i) => `<rect x="${x + 6 + i * 18}" y="${y + 8}" width="14" height="14" rx="2" fill="${lit && lit[i] ? lit[i] : '#e9e9e2'}"/>`).join('')}${lit ? '' : ''}`;
    const num = (x, t) => `<circle cx="${x}" cy="20" r="12" fill="${INK}"/><text x="${x}" y="25" text-anchor="middle" font-size="14" font-weight="800" fill="#fff">${t}</text>`;
    const cap = (x, a, b) => `<text x="${x}" y="196" text-anchor="middle" font-size="14" font-weight="800" fill="${INK}">${a}</text><text x="${x}" y="215" text-anchor="middle" font-size="12" fill="#5a6573">${b}</text>`;
    const arr = (x1, x2, t) => `<line x1="${x1}" y1="110" x2="${x2}" y2="110" stroke="${INK}" stroke-width="2.5" marker-end="url(#coArr)"/><text x="${(x1 + x2) / 2}" y="100" text-anchor="middle" font-size="${t === '.' ? 26 : 11}" font-weight="800" font-family="monospace" fill="${INK}">${t}</text>`;
    return `<svg class="fig" viewBox="0 0 800 225" role="img" aria-label="Бібліотека, клас, об’єкт і метод на прикладі стрічки">
      <defs><marker id="coArr" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0 L10 5 L0 10 z" fill="${INK}"/></marker></defs>
      ${num(20, '①')}
      <rect x="40" y="48" width="104" height="124" rx="6" fill="#f3d9a4" stroke="#b8862f" stroke-width="2"/>
      <rect x="40" y="48" width="16" height="124" rx="4" fill="#d9a74a"/>
      <rect x="66" y="64" width="64" height="44" fill="${BLUE}" stroke="#fff" stroke-width="1.5"/>
      <rect x="72" y="80" width="52" height="12" fill="none" stroke="#fff" stroke-width="1.2" stroke-dasharray="3 2"/>
      <text x="98" y="130" text-anchor="middle" font-size="10" font-family="monospace" fill="${INK}">Adafruit_</text><text x="98" y="143" text-anchor="middle" font-size="10" font-family="monospace" fill="${INK}">NeoPixel.h</text>
      ${cap(92, 'Бібліотека', 'готовий код')}
      ${arr(150, 196, '#include')}
      ${num(210, '②')}
      <rect x="204" y="56" width="160" height="108" fill="${BLUE}"/>
      <path d="M204 56 h160 v108 h-160 z" fill="none" stroke="#8fb4e8" stroke-width="1"/>
      <rect x="216" y="80" width="144" height="30" fill="none" stroke="#fff" stroke-width="1.6" stroke-dasharray="5 3"/>
      ${Array.from({ length: 8 }, (_, i) => `<rect x="${222 + i * 17}" y="88" width="12" height="12" fill="none" stroke="#fff" stroke-width="1.2"/>`).join('')}
      <text x="216" y="74" font-size="11" fill="#fff" font-family="monospace">class Adafruit_NeoPixel</text>
      <text x="216" y="130" font-size="11" fill="#fff">пікселів: ?   вивід: ?</text>
      <text x="216" y="150" font-size="11" fill="#fff">уміє: begin, show, …</text>
      ${cap(284, 'Клас = креслення', 'яким буде будь-яка стрічка')}
      ${arr(370, 446, 'strip(8,6,…)')}
      ${num(458, '③')}
      ${strip(452, 92)}
      <text x="527" y="76" text-anchor="middle" font-size="13" font-weight="800" font-family="monospace" fill="${INK}">strip</text>
      <text x="527" y="146" text-anchor="middle" font-size="11" fill="${INK}">8 пікселів, вивід 6</text>
      ${cap(527, 'Об’єкт = річ', 'зроблена за кресленням')}
      ${arr(608, 636, '.')}
      ${num(648, '④')}
      ${strip(642, 92, ['#e03131', '#f08c00', '#fab005', '#40c057', '#15aabf', '#4263eb', '#7048e8', '#e64980'])}
      <text x="717" y="76" text-anchor="middle" font-size="13" font-weight="800" font-family="monospace" fill="${INK}">strip.show()</text>
      <text x="717" y="146" text-anchor="middle" font-size="11" fill="${INK}">«стрічко, покажи!»</text>
      ${cap(717, 'Метод = дія', 'об’єкта, через крапку')}
    </svg>`;
  },
  obsIntro: o => FIGURES.symbols(o) + FIGURES.irsense(),
  /* Ланцюжок «подія → рівень на виводі → рішення програми» */
  chain: (o = {}) => {
    const box = (x, t1, t2, c) => `<rect x="${x}" y="20" width="170" height="86" rx="10" fill="#fff" stroke="${c}" stroke-width="3"/><text x="${x + 85}" y="54" text-anchor="middle" font-size="16" font-weight="800" fill="${c}">${t1}</text><text x="${x + 85}" y="80" text-anchor="middle" font-size="13" fill="#1F3B63">${t2}</text>`;
    const arr = x => `<path d="M${x} 63 h26 m-8 -7 l8 7 l-8 7" fill="none" stroke="#5a6573" stroke-width="3"/>`;
    return `<svg class="fig" viewBox="0 0 600 126" role="img" aria-label="Подія, рівень, рішення">
      ${box(4, o.a || 'Подія', o.a2 || 'звук, магніт, натискання', '#EE7E42')}${arr(180)}
      ${box(214, o.b || 'Рівень на виводі', o.b2 || 'HIGH ≈ 5 В або LOW ≈ 0 В', '#d93025')}${arr(390)}
      ${box(424, o.c || 'Рішення програми', o.c2 || 'if … else …', '#003FB8')}</svg>`;
  },
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
      <defs><linearGradient id="wg" gradientUnits="userSpaceOnUse" x1="0" y1="40" x2="0" y2="266"><stop offset="0" stop-color="#7fd0f2"/><stop offset="1" stop-color="#3aa6dc"/></linearGradient></defs>
      <rect x="42" y="${top}" width="158" height="${level}" fill="url(#wg)"/>
      <path d="${fill}" fill="url(#wg)"/>
      <path class="water-flow" ${flow} d="M206 ${yc} H584" stroke="#fff" stroke-width="6" stroke-linecap="round" stroke-dasharray="0 22" fill="none"/>
      <path d="M40 28 V266 H198 M198 28 V${y0}" fill="none" stroke="#1f2a44" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"/>
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
    return `<svg viewBox="0 0 640 404" class="figure" role="img" aria-label="Аналогії з дорогами">
      <text x="14" y="26" font-size="17" font-weight="800" fill="#003FB8">Послідовне: одна дорога, два мости підряд</text>
      ${[200, 420].map(x => `<path d="M${x - 38} 36 C${x - 30} 70 ${x - 44} 100 ${x - 36} 132 H${x + 36} C${x + 44} 100 ${x + 30} 70 ${x + 38} 36 Z" fill="#7cc6ec"/>
        <path d="M${x - 20} 50 q6 -4 12 0 t12 0 M${x - 6} 122 q6 -4 12 0 t12 0" stroke="#fff" stroke-width="2" fill="none"/>`).join('')}
      <rect x="10" y="62" width="620" height="44" rx="6" fill="#9aa3ad" stroke="#5f6670" stroke-width="3"/>
      <path d="M10 84 H630" stroke="#fff" stroke-width="3" stroke-dasharray="16 12"/>
      ${[200, 420].map((x, k) => `<g stroke="#7a5230" stroke-width="4" stroke-linecap="round">
        <path d="M${x - 52} 56 H${x + 52} M${x - 52} 112 H${x + 52}"/>
        ${[-52, -26, 0, 26, 52].map(d => `<path d="M${x + d} 50 V56 M${x + d} 112 V118"/>`).join('')}</g>
        <text x="${x}" y="150" text-anchor="middle" font-size="15" font-weight="700" fill="#7a5230">міст ${k + 1}</text>`).join('')}
      ${[60, 110, 290, 340, 520].map((x, k) => car(x, 84, C[k])).join('')}
      <text x="14" y="176" font-size="14" fill="#1F3B63">Кожна машина проїжджає обидва мости. Закрили один міст — стала вся дорога.</text>

      <text x="14" y="222" font-size="17" font-weight="800" fill="#003FB8">Вузол: розвилка</text>
      ${(() => {
        /* Одна дорога, що розходиться на дві й сходиться: той самий контур і ширина, без швів на розвилці */
        const road = 'M10 300 H170 L240 252 H490 L560 300 H630 M170 300 L240 348 H490 L560 300';
        return `<path d="${road}" stroke="#5f6670" stroke-width="50" fill="none" stroke-linejoin="round"/>
          <path d="${road}" stroke="#9aa3ad" stroke-width="44" fill="none" stroke-linejoin="round"/>
          <path d="M10 300 H140 M590 300 H630" stroke="#fff" stroke-width="3" stroke-dasharray="16 12"/>`;
      })()}
      <circle cx="170" cy="300" r="10" fill="#E53281"/><circle cx="560" cy="300" r="10" fill="#E53281"/>
      ${[30, 60, 90, 120].map((x, k) => car(x, 289, C[k])).join('')}${car(150, 311, C[4])}
      ${[320, 400].map((x, k) => car(x, 252, C[k])).join('')}
      ${[300, 365, 430].map((x, k) => car(x, 348, C[k + 2])).join('')}
      <text x="85" y="346" text-anchor="middle" font-size="16" font-weight="800" fill="#1F3B63">приїхало 5</text>
      <text x="365" y="216" text-anchor="middle" font-size="16" font-weight="800" fill="#1F3B63">2</text>
      <text x="365" y="394" text-anchor="middle" font-size="16" font-weight="800" fill="#1F3B63">3</text>
      <text x="128" y="266" text-anchor="middle" font-size="15" font-weight="800" fill="#E53281">вузол</text>
      <text x="602" y="266" text-anchor="middle" font-size="15" font-weight="800" fill="#E53281">вузол</text>
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
    }
    return `<svg viewBox="0 0 ${W} ${H}" class="figure bb" role="img" aria-label="Макетна плата ${back ? 'знизу' : 'зверху'}">${g}</svg>`;
  }
};

/* Інтерактив малюнків: (обгортка, крок, done) */
window.FIGURE_INTERACT = {
  ifelse(wrap, st, done) {
    let c = false; const seen = new Set();
    const draw = () => {
      const o = st.figureOpts || {}, tog = o.tog || ['Сигнал з датчика: LOW', 'Сигнал з датчика: HIGH'];
      wrap.innerHTML = FIGURES.ifelse({ ...o, cond: c }) + `<div class="bb-bar"><button class="primary alt if-tog">${tog[c ? 1 : 0]} — змінити</button><span class="bb-msg">${c ? 'Умова істинна: виконується перша гілка.' : 'Умова хибна: виконується гілка else.'}</span></div>`;
      seen.add(c); if (seen.size === 2) done();
      wrap.querySelector('.if-tog').onclick = () => { c = !c; draw(); };
    };
    draw();
  },
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
