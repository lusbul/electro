/* Бібліотека деталей у двох виглядах:
   draw(o) — умовне позначення (принципова схема)
   real(o) — реалістичний вигляд, як у Tinkercad
   Виводи (pins) однакові для обох виглядів, тому одну схему можна показати будь-як. */
(function () {
  const INK = '#1f2a44';
  const METAL = '#9aa1a8';
  const lead = (x1, y1, x2, y2, c = INK, w = 3) => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${c}" stroke-width="${w}" stroke-linecap="round"/>`;
  const label = (x, y, t, anchor = 'middle', size = 15, extra = '') =>
    `<text x="${x}" y="${y}" text-anchor="${anchor}" font-size="${size}" font-weight="700" fill="${INK}" ${extra}>${t}</text>`;

  const fmtR = v => v >= 1000 ? (v / 1000).toString().replace('.', ',') + ' кОм' : v + ' Ом';

  /* Кольорове маркування резистора: дві цифри + множник */
  const BAND = ['#111', '#7b3f00', '#d32f2f', '#f57c00', '#fbc02d', '#2e9e44', '#1e63d6', '#7b3fb0', '#8a8f96', '#fafafa'];
  function bands(v) {
    const e = Math.floor(Math.log10(v)) - 1;
    const two = Math.round(v / Math.pow(10, e));
    return [BAND[Math.floor(two / 10)], BAND[two % 10], BAND[Math.max(0, e)]];
  }

  const LED_COLORS = { red: '#ff3b30', green: '#22c55e', yellow: '#facc15', blue: '#3b82f6', white: '#e8f0ff' };
  const ledGlow = (o, c, cx, cy, r) => `
    <defs><radialGradient id="${o.id}-g"><stop offset="0" stop-color="${c}" stop-opacity=".95"/><stop offset=".45" stop-color="${c}" stop-opacity=".45"/><stop offset="1" stop-color="${c}" stop-opacity="0"/></radialGradient></defs>
    <circle id="${o.id}-glow" cx="${cx}" cy="${cy}" r="${r}" fill="url(#${o.id}-g)" opacity="0"/>`;
  const smoke = (o, x) => `<g id="${o.id}-smoke" opacity="0"><path d="M${x} 0 q-8 -12 0 -22 q8 -10 0 -22" stroke="#9aa3b2" stroke-width="3" fill="none" stroke-linecap="round"/></g>`;

  const PARTS = {
    /* ---------- Батарея 9 В ---------- */
    battery: {
      w: 60, h: 90, pins: { plus: [30, 0], minus: [30, 90] },
      draw: o => `
        ${lead(30, 0, 30, 38)}${lead(30, 52, 30, 90)}
        <line x1="8" y1="38" x2="52" y2="38" stroke="${INK}" stroke-width="4" stroke-linecap="round"/>
        <line x1="18" y1="52" x2="42" y2="52" stroke="${INK}" stroke-width="7" stroke-linecap="round"/>
        ${label(62, 30, '+', 'start', 18)}
        ${label(-8, 50, (o.value ?? 9) + ' В', 'end')}`,
      /* У «крони» обидва контакти зверху: мінусовий дріт виходить праворуч угорі */
      realPins: { plus: [30, 0], minus: [72, 10] },
      real: o => `
        <path d="M18 18 C18 6 30 8 30 0" stroke="#d93025" stroke-width="5" fill="none" stroke-linecap="round"/>
        <path d="M42 16 C42 6 58 10 72 10" stroke="#222" stroke-width="5" fill="none" stroke-linecap="round"/>
        <rect x="11" y="14" width="14" height="10" rx="2" fill="#c9ced4" stroke="#6b7480" stroke-width="1.5"/>
        <circle cx="42" cy="19" r="6" fill="#c9ced4" stroke="#6b7480" stroke-width="1.5"/>
        <rect x="4" y="22" width="52" height="68" rx="5" fill="#2d3240"/>
        <rect x="4" y="44" width="52" height="30" fill="#EE7E42"/>
        <text x="30" y="65" text-anchor="middle" font-size="16" font-weight="800" fill="#fff">9V</text>
        <text x="11" y="38" font-size="13" font-weight="800" fill="#fff">+</text>
        ${label(-8, 60, (o.value ?? 9) + ' В', 'end')}`
    },

    /* ---------- Резистор ---------- */
    resistor: {
      w: 100, h: 40, pins: { 1: [0, 20], 2: [100, 20] },
      draw: o => `
        ${lead(0, 20, 26, 20)}${lead(74, 20, 100, 20)}
        <rect x="26" y="10" width="48" height="20" rx="3" fill="#fff" stroke="${INK}" stroke-width="3"/>
        ${label(50, -2, o.label ?? fmtR(o.value ?? 220), o.rot ? 'start' : 'middle', 15, `id="${o.id}-label" transform="rotate(${-(o.rot || 0)} 50 -2)"`)}`,
      real: o => {
        const b = bands(o.value ?? 220);
        return `
        ${lead(0, 20, 26, 20, METAL, 3.5)}${lead(74, 20, 100, 20, METAL, 3.5)}
        <path d="M24 12 Q24 8 30 8 Q34 8 36 11 H64 Q66 8 70 8 Q76 8 76 12 V28 Q76 32 70 32 Q66 32 64 29 H36 Q34 32 30 32 Q24 32 24 28 Z" fill="#e7c89a" stroke="#b8925c" stroke-width="1.5"/>
        <rect id="${o.id}-b0" x="31" y="8.5" width="5" height="23" fill="${b[0]}"/>
        <rect id="${o.id}-b1" x="41" y="11" width="5" height="18" fill="${b[1]}"/>
        <rect id="${o.id}-b2" x="50" y="11" width="5" height="18" fill="${b[2]}"/>
        <rect x="63" y="8.5" width="4" height="23" fill="#c9a227"/>
        ${label(50, -2, o.label ?? fmtR(o.value ?? 220), o.rot ? 'start' : 'middle', 15, `id="${o.id}-label" transform="rotate(${-(o.rot || 0)} 50 -2)"`)}`;
      }
    },

    /* ---------- Світлодіод: анод ліворуч, катод праворуч ---------- */
    led: {
      w: 100, h: 60, pins: { A: [0, 30], K: [100, 30] },
      draw: o => {
        const c = LED_COLORS[o.color || 'red'];
        return `${ledGlow(o, c, 50, 30, 46)}
        ${lead(0, 30, 36, 30)}${lead(64, 30, 100, 30)}
        <polygon id="${o.id}-body" points="36,14 36,46 64,30" fill="#fff" stroke="${INK}" stroke-width="3" stroke-linejoin="round" data-color="${c}" data-off="#ffffff"/>
        <line x1="64" y1="13" x2="64" y2="47" stroke="${INK}" stroke-width="3.5" stroke-linecap="round"/>
        <g stroke="${INK}" stroke-width="2.2" stroke-linecap="round" fill="none"><path d="M56 8 l9 -9 M60 -1 h5 v5"/><path d="M66 14 l9 -9 M70 5 h5 v5"/></g>
        ${smoke(o, 50)}`;
      },
      /* Корпус зверху, дві ніжки вниз; довша ніжка аноду (+) має вигин угорі */
      real: o => {
        const c = LED_COLORS[o.color || 'red'];
        const off = { red: '#9e3a35', green: '#3d8452', yellow: '#b39a2c', blue: '#3a5d9a', white: '#c3c9d2' }[o.color || 'red'];   // невімкнений: тьмяний, а не білий
        return `${ledGlow(o, c, 50, -4, 42)}
        <path d="M44 14 V18 L38 23 V27 Q38 30 34 30 H0" stroke="${METAL}" stroke-width="3.5" fill="none" stroke-linejoin="round" stroke-linecap="round"/>
        <path d="M56 14 V27 Q56 30 60 30 H100" stroke="${METAL}" stroke-width="3.5" fill="none" stroke-linejoin="round" stroke-linecap="round"/>
        <path id="${o.id}-body" d="M38 10 V-6 A12 12 0 0 1 62 -6 V10 Z" fill="${off}" stroke="rgba(0,0,0,.35)" stroke-width="1.5" data-color="${c}" data-off="${off}"/>
        <path d="M43 -7 A7 7 0 0 1 50 -14" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round" opacity=".8"/>
        <path d="M35 9 H63 V15 H35 Z" fill="${off}" stroke="rgba(0,0,0,.35)" stroke-width="1.5"/>
        ${o.polarity === false ? '' : `<text x="14" y="24" font-size="15" font-weight="800" fill="#d93025">+</text><text x="78" y="24" font-size="17" font-weight="800" fill="${INK}">−</text>`}
        ${smoke(o, 50).replace('M50 0', 'M50 -20')}`;
      }
    },


    /* Світлодіод, розвернутий навпаки: анод (довга ніжка, «+») праворуч */
    'led-rev': {
      w: 100, h: 60, pins: { A: [100, 30], K: [0, 30] },
      draw: o => `<g transform="translate(100 0) scale(-1 1)">${PARTS.led.draw(o)}</g>`,
      real: o => `<g transform="translate(100 0) scale(-1 1)">${PARTS.led.real({ ...o, polarity: false })}</g>
        ${o.polarity === false ? '' : `<text x="14" y="24" font-size="17" font-weight="800" fill="${INK}">−</text><text x="80" y="24" font-size="15" font-weight="800" fill="#d93025">+</text>`}`
    },

    /* ---------- Потенціометр: виводи 1 і 2 — кінці доріжки, W — повзунок ----------
       Circuit.setPot(id, 0…1) повертає ручку (Деталі) і зсуває стрілку повзунка (Схема). */
    pot: {
      w: 100, h: 100, pins: { 1: [0, 60], 2: [100, 60], W: [50, 100] },
      draw: o => `${lead(0, 60, 26, 60)}${lead(74, 60, 100, 60)}
        <rect x="26" y="50" width="48" height="20" fill="#fff" stroke="${INK}" stroke-width="3"/>
        <g id="${o.id}-wip"><path d="M50 100 V86 H50 V76" stroke="${INK}" stroke-width="3" fill="none"/><path d="M44 78 L50 70 L56 78 Z" fill="${INK}"/></g>
        ${o.label ? `<text x="50" y="40" text-anchor="middle" font-size="14" font-weight="700" fill="${INK}">${o.label}</text>` : ''}`,
      real: o => `
        <path d="M36 44 V60 H0" stroke="${METAL}" stroke-width="3.5" fill="none" stroke-linejoin="round"/>
        <path d="M64 44 V60 H100" stroke="${METAL}" stroke-width="3.5" fill="none" stroke-linejoin="round"/>
        <path d="M50 44 V100" stroke="${METAL}" stroke-width="3.5"/>
        <rect x="18" y="-6" width="64" height="50" rx="6" fill="#2f63b5" stroke="#1d3f78" stroke-width="2"/>
        <circle cx="50" cy="18" r="22" fill="#e3e7ec" stroke="#8a93a0" stroke-width="2"/>
        <g id="${o.id}-knob" transform="rotate(${-135 + 270 * (o.pos ?? 0.5)} 50 18)">
          <circle cx="50" cy="18" r="15" fill="#c9ced6"/>
          <rect x="47" y="-1" width="6" height="16" rx="3" fill="#1F3B63"/>
        </g>
        <text x="20" y="56" font-size="11" font-weight="700" fill="#5a6573">1</text><text x="74" y="56" font-size="11" font-weight="700" fill="#5a6573">2</text>
        <text x="56" y="92" font-size="11" font-weight="700" fill="#5a6573">W</text>`
    },

    /* ---------- Мультиметр (амперметр у колі): o.mode = 'A' | 'V' | 'Ω' ----------
       Виводи праворуч/ліворуч, як у резистора; корпус висить під дротом. */
    multimeter: {
      w: 100, h: 50, pins: { 1: [0, 25], 2: [100, 25] },
      draw: o => `
        ${lead(0, 25, 32, 25)}${lead(68, 25, 100, 25)}
        <circle cx="50" cy="25" r="18" fill="#fff" stroke="${INK}" stroke-width="3"/>
        <text x="50" y="32" text-anchor="middle" font-size="20" font-weight="800" fill="${INK}">${o.mode || 'A'}</text>
        <text id="${o.id}-disp" x="50" y="66" text-anchor="middle" font-size="15" font-weight="700" fill="${INK}"></text>`,
      real: o => `
        <path d="M0 25 C0 85 38 80 40 118" stroke="#222" stroke-width="4" fill="none" stroke-linecap="round"/>
        <path d="M100 25 C100 85 62 80 60 118" stroke="#d93025" stroke-width="4" fill="none" stroke-linecap="round"/>
        <circle cx="0" cy="25" r="4" fill="#222"/><circle cx="100" cy="25" r="4" fill="#d93025"/>
        <rect x="18" y="40" width="64" height="96" rx="9" fill="#f2c230" stroke="#b58d12" stroke-width="2"/>
        <rect x="25" y="47" width="50" height="24" rx="3" fill="#cfe3c4" stroke="#6d7f63" stroke-width="1.5"/>
        <text id="${o.id}-disp" x="71" y="65" text-anchor="end" font-size="13" font-weight="800" font-family="Consolas, monospace" fill="#1d2a1a"></text>
        <circle cx="50" cy="96" r="12" fill="#2d3240"/>
        <text x="50" y="101" text-anchor="middle" font-size="12" font-weight="800" fill="#fff">${o.mode || 'A'}</text>
        <circle cx="40" cy="124" r="4" fill="#222"/><circle cx="60" cy="124" r="4" fill="#d93025"/>`
    },


    /* ---------- Ключ (вимикач): o.closed — замкнений ---------- */
    switch: {
      w: 100, h: 40, pins: { 1: [0, 30], 2: [100, 30] },
      draw: o => `
        <rect x="10" y="-6" width="80" height="46" fill="transparent"/>
        ${lead(0, 30, 30, 30)}${lead(70, 30, 100, 30)}
        <circle cx="30" cy="30" r="4" fill="${INK}"/><circle cx="70" cy="30" r="4" fill="#fff" stroke="${INK}" stroke-width="3"/>
        <path d="${o.closed ? 'M30 30 L68 30' : 'M30 30 L66 6'}" stroke="${INK}" stroke-width="3.5" stroke-linecap="round"/>`,
      /* Рубильник (як на ескізі): дві клеми-стійки; сірий важіль на шарнірі лівої стійки
         з червоною ручкою. Розімкнено — важіль піднятий, замкнено — лежить у прорізі правої стійки */
      real: o => `
        <rect x="6" y="-30" width="96" height="76" fill="transparent"/>
        ${lead(0, 30, 24, 30, '#222', 4)}${lead(76, 30, 100, 30, '#222', 4)}
        <rect x="22" y="14" width="16" height="17" rx="2" fill="#fff" stroke="#222" stroke-width="3.5"/>
        <rect x="62" y="14" width="16" height="17" rx="2" fill="#fff" stroke="#222" stroke-width="3.5"/>
        <rect x="68" y="12" width="4" height="8" fill="#222"/>
        <g transform="rotate(${o.closed ? 0 : -50} 31 19)">
          <path d="M31 16.5 L76 14.5 L76 21.5 L31 21.5 Z" fill="#8f969e" stroke="#5f6670" stroke-width="1.2"/>
          <circle cx="82" cy="17" r="7.5" fill="#e0282e" stroke="#a51c20" stroke-width="1.2"/>
        </g>
        <circle cx="31" cy="19" r="3" fill="#fff" stroke="#222" stroke-width="2"/>`
    },


    /* ---------- Зразок матеріалу в затискачах «крокодил»: o.material ----------
       copper, nail, graphite, ruler, rubber, wood */
    sample: {
      w: 100, h: 40, pins: { 1: [0, 30], 2: [100, 30] },
      draw: o => PARTS.sample.real(o),
      real: o => {
        const body = {
          copper:   `<rect x="24" y="27" width="52" height="6" rx="3" fill="#c87533" stroke="#8a4b1c" stroke-width="1"/>`,
          nail:     `<rect x="22" y="22" width="4" height="16" rx="1" fill="#8a8f96"/><path d="M26 27.5 H70 L78 30 L70 32.5 H26 Z" fill="#a9afb6" stroke="#6b7480" stroke-width="1"/>`,
          graphite: `<rect x="24" y="26.5" width="52" height="7" rx="2" fill="#3d4148" stroke="#22252a" stroke-width="1"/><rect x="28" y="27.5" width="44" height="1.5" fill="#6b7078"/>`,
          ruler:    `<rect x="20" y="20" width="60" height="18" rx="2" fill="rgba(110,170,230,.55)" stroke="#3b78b8" stroke-width="1.2"/>${[0,1,2,3,4,5,6,7,8,9,10].map(k => `<line x1="${24 + k * 5.2}" y1="20" x2="${24 + k * 5.2}" y2="${k % 5 ? 25 : 28}" stroke="#2b5b8f" stroke-width="1"/>`).join('')}`,
          rubber:   `<rect x="28" y="20" width="44" height="20" rx="5" fill="#f2a1b8" stroke="#c76b86" stroke-width="1.2"/><rect x="28" y="20" width="16" height="20" rx="5" fill="#7fb3e6"/>`,
          wood:     `<rect x="22" y="26" width="56" height="8" rx="4" fill="#d9a865" stroke="#9c6b2e" stroke-width="1"/><path d="M30 30 h10 M48 29 h14" stroke="#b07d3f" stroke-width="1"/>`
        }[o.material] || '';
        const clip = x => `<path d="M${x - 8} 26 L${x + 8} 28 L${x + 8} 32 L${x - 8} 34 Z" fill="#9aa1a8" stroke="#5f6670" stroke-width="1"/>`;
        return `<rect x="0" y="0" width="100" height="46" fill="transparent"/>
          ${lead(0, 30, 14, 30, METAL, 3.5)}${lead(86, 30, 100, 30, METAL, 3.5)}${body}${clip(20)}${clip(80)}`;
      }
    },


    /* ---------- Лампочка розжарювання: світиться без резистора ----------
       Виводи внизу цоколя; скло — над ними. Яскравість задає Circuit.setLamp */
    lamp: {
      w: 100, h: 50, pins: { 1: [0, 40], 2: [100, 40] },
      draw: o => `
        ${lead(0, 40, 32, 40)}${lead(68, 40, 100, 40)}
        <g id="${o.id}-bulb" class="bulb">
          <defs><radialGradient id="${o.id}-g"><stop offset="0" stop-color="#ffe066" stop-opacity=".95"/><stop offset=".5" stop-color="#ffd23f" stop-opacity=".4"/><stop offset="1" stop-color="#ffd23f" stop-opacity="0"/></radialGradient></defs>
          <circle id="${o.id}-glow" cx="50" cy="40" r="46" fill="url(#${o.id}-g)" opacity="0"/>
          <circle id="${o.id}-glass" cx="50" cy="40" r="18" fill="#fff" stroke="${INK}" stroke-width="3" data-off="#fff"/>
          <path id="${o.id}-fil" d="M37 27 L63 53 M63 27 L37 53" stroke="${INK}" stroke-width="3" data-off="${INK}"/>
        </g>`,
      /* Патрон (темний) лишається в колі; колба з цоколем — група -bulb, її можна «викрутити» (Circuit.setLampOut) */
      real: o => `
        ${lead(0, 40, 38, 40, METAL, 3.5)}${lead(62, 40, 100, 40, METAL, 3.5)}
        <g id="${o.id}-bulb" class="bulb">
          <defs><radialGradient id="${o.id}-g"><stop offset="0" stop-color="#fff3b0" stop-opacity="1"/><stop offset=".45" stop-color="#ffd23f" stop-opacity=".55"/><stop offset="1" stop-color="#ffd23f" stop-opacity="0"/></radialGradient></defs>
          <circle id="${o.id}-glow" cx="50" cy="2" r="50" fill="url(#${o.id}-g)" opacity="0"/>
          <path id="${o.id}-glass" d="M41 26 C30 18 28 -4 50 -18 C72 -4 70 18 59 26 Z" fill="rgba(225,235,245,.55)" stroke="#9aa6b2" stroke-width="2" data-off="rgba(225,235,245,.55)"/>
          <path id="${o.id}-fil" d="M45 26 L45 6 L47 2 L49 6 L51 2 L53 6 L55 2 L55 26" fill="none" stroke="#6b6b6b" stroke-width="1.8" data-off="#6b6b6b"/>
          <rect x="41" y="25" width="18" height="13" rx="2" fill="#b9bfc6" stroke="#7b838c" stroke-width="1.2"/>
          <path d="M41 29 H59 M41 33 H59" stroke="#7b838c" stroke-width="1.2"/>
        </g>
        <rect x="37" y="32" width="26" height="14" rx="3" fill="#3a3f47" stroke="#22262c" stroke-width="1.2"/>
        <rect x="41" y="32" width="18" height="3" fill="#555b63"/>`
    },

    /* ---------- Компактний амперметр для схем із кількома приладами ---------- */
    ammeter: {
      w: 100, h: 40, pins: { 1: [0, 20], 2: [100, 20] },
      draw: o => `${lead(0, 20, 34, 20)}${lead(66, 20, 100, 20)}
        <circle cx="50" cy="20" r="16" fill="#fff" stroke="${INK}" stroke-width="3"/>
        <text x="50" y="27" text-anchor="middle" font-size="18" font-weight="800" fill="${INK}">A</text>
        <text id="${o.id}-disp" x="50" y="-6" text-anchor="middle" font-size="15" font-weight="800" fill="#c4561b">${o.label || ''}</text>`,
      /* Маленький мультиметр у режимі A (жовтий корпус, перемикач з літерою A), покази — над ним */
      real: o => `${lead(0, 20, 32, 20, '#d93025', 4)}${lead(68, 20, 100, 20, '#222', 4)}
        <rect x="30" y="-2" width="40" height="48" rx="6" fill="#f2c230" stroke="#b58d12" stroke-width="2"/>
        <rect x="35" y="3" width="30" height="11" rx="2" fill="#cfe3c4" stroke="#6d7f63" stroke-width="1"/>
        <circle cx="50" cy="29" r="9" fill="#2d3240"/>
        <text x="50" y="33" text-anchor="middle" font-size="11" font-weight="800" fill="#fff">A</text>
        <circle cx="32" cy="20" r="3.5" fill="#d93025"/><circle cx="68" cy="20" r="3.5" fill="#222"/>
        <rect x="18" y="-30" width="64" height="20" rx="3" fill="#cfe3c4" stroke="#6d7f63" stroke-width="1.2"/>
        <text id="${o.id}-disp" x="78" y="-15" text-anchor="end" font-size="13" font-weight="800" font-family="Consolas, monospace" fill="#1d2a1a">${o.label || ''}</text>`
    },

    /* ---------- Вузол: точка з'єднання (o.label — підпис, наприклад «A») ---------- */
    junction: {
      w: 0, h: 0, pins: { p: [0, 0] },
      draw: o => `<circle r="6" fill="${INK}"/>${o.label ? `<text x="${o.lx ?? -10}" y="${o.ly ?? -12}" text-anchor="middle" font-size="18" font-weight="800" fill="#E53281">${o.label}</text>` : ''}`,
      real: o => `<circle r="5.5" fill="#222"/>${o.label ? `<text x="${o.lx ?? -10}" y="${o.ly ?? -12}" text-anchor="middle" font-size="18" font-weight="800" fill="#E53281">${o.label}</text>` : ''}`
    },

    /* ---------- Тактова кнопка ---------- */
    button: {
      w: 100, h: 50, pins: { 1: [0, 40], 2: [100, 40] },
      draw: o => `
        ${lead(0, 40, 30, 40)}${lead(70, 40, 100, 40)}
        <circle cx="30" cy="38" r="4" fill="${INK}"/><circle cx="70" cy="38" r="4" fill="#fff" stroke="${INK}" stroke-width="3"/>
        <path d="${o.pressed ? 'M30 34 L70 34' : 'M30 34 L68 18'}" stroke="${INK}" stroke-width="3.5" stroke-linecap="round"/>
        <line x1="50" y1="${o.pressed ? 34 : 26}" x2="50" y2="4" stroke="${INK}" stroke-width="2.5" stroke-dasharray="4 4"/>
        <line x1="40" y1="4" x2="60" y2="4" stroke="${INK}" stroke-width="3.5" stroke-linecap="round"/>`,
      real: o => `
        ${lead(0, 40, 32, 40, METAL, 3.5)}${lead(68, 40, 100, 40, METAL, 3.5)}
        <rect x="28" y="14" width="44" height="32" rx="3" fill="#2b2f36"/>
        ${[[32, 18], [68, 18], [32, 42], [68, 42]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="2" fill="#555"/>`).join('')}
        <circle cx="50" cy="30" r="${o.pressed ? 9 : 11}" fill="${o.pressed ? '#1e63d6' : '#3b82f6'}" stroke="#123a80" stroke-width="2"/>`
    },

    /* ---------- Земля ---------- */
    gnd: {
      w: 40, h: 26, pins: { g: [20, 0] },
      draw: () => `${lead(20, 0, 20, 18)}<line x1="4" y1="18" x2="36" y2="18" stroke="${INK}" stroke-width="4" stroke-linecap="round"/>`,
      real: () => `<rect x="2" y="0" width="36" height="18" rx="4" fill="#222"/><text x="20" y="13" text-anchor="middle" font-size="11" font-weight="800" fill="#fff">GND</text>`
    },

    /* ---------- Arduino UNO ---------- */
    'arduino-uno': (() => {
      const W = 200, H = 370;
      const right = ['D13', 'D12', 'D11', 'D10', 'D9', 'D8', 'D7', 'D6', 'D5', 'D4', 'D3', 'D2', 'D1', 'D0'];
      const NAME = { D1: 'TX→1', D0: 'RX←0' };   // виводи послідовного порту
      const left = ['5V', 'GND', 'A0', 'A1', 'A2', 'A3', 'A4', 'A5'];
      const pins = {};
      right.forEach((n, i) => pins[n] = [W, 50 + i * 22]);
      left.forEach((n, i) => pins[n] = [0, 70 + i * 26]);
      const pinsMarkup = (o, real) => {
        let s = '';
        right.forEach(n => {
          const [x, y] = pins[n];
          s += real
            ? `<g id="${o.id}-${n}"><rect x="${x - 14}" y="${y - 7}" width="14" height="14" rx="2" fill="#1b2230"/><circle class="pin-led" cx="${x - 7}" cy="${y}" r="3" fill="#56606e"/></g>
               <text x="${x - 20}" y="${y + 5}" text-anchor="end" font-size="13" font-weight="700" fill="#fff">${NAME[n] || n}</text>`
            : `<g id="${o.id}-${n}">${lead(x - 16, y, x, y)}</g>
               <text x="${x - 22}" y="${y + 5}" text-anchor="end" font-size="13" font-weight="700" fill="${INK}">${NAME[n] || n}</text>`;
        });
        left.forEach(n => {
          const [x, y] = pins[n];
          s += real
            ? `<rect x="${x}" y="${y - 7}" width="14" height="14" rx="2" fill="#1b2230"/><text x="${x + 20}" y="${y + 5}" font-size="13" font-weight="700" fill="#fff">${n}</text>`
            : `${lead(x, y, x + 16, y)}<text x="${x + 22}" y="${y + 5}" font-size="13" font-weight="700" fill="${INK}">${n}</text>`;
        });
        return s;
      };
      return {
        w: W, h: H, pins,
        draw: o => `<rect x="16" y="10" width="${W - 32}" height="${H - 20}" fill="#fff" stroke="${INK}" stroke-width="3"/>
          <text x="100" y="40" text-anchor="middle" font-size="17" font-weight="800" fill="${INK}">Arduino UNO</text>${pinsMarkup(o, false)}`,
        real: o => `<rect x="0" y="0" width="${W}" height="${H}" rx="16" fill="#0e7c86" stroke="#0a5960" stroke-width="3"/>
          <rect x="62" y="-14" width="56" height="30" rx="4" fill="#c9d1d9" stroke="#6b7480" stroke-width="2"/>
          <rect x="62" y="150" width="76" height="34" rx="4" fill="#1b2230"/>
          <text x="100" y="215" text-anchor="middle" font-size="19" font-weight="800" fill="#fff">ARDUINO</text>
          <text x="100" y="236" text-anchor="middle" font-size="15" font-weight="700" fill="#bff3f6">UNO</text>${pinsMarkup(o, true)}`
      };
    })()
  };

  window.PARTS = PARTS;
  window.fmtR = fmtR;
  window.resistorBands = bands;
})();
