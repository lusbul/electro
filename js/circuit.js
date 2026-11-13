/* Рендер схеми з опису:
   parts:  { id: {type, x, y, rot, ...параметри} }
   nets:   { назва: ["деталь.вивід", ...] }  — виводи одного вузла, у порядку руху струму
   via:    { назва: [[x,y], ...] }           — необов'язкові точки зламу дроту
   viaReal:{ назва: [[x,y], ...] }           — інші точки зламу для реалістичного вигляду (якщо треба)
   view:   'real' (як у Tinkercad) або 'schematic' (умовні позначення)
   colors: { назва: '#колір' }               — колір дроту в реалістичному вигляді
   open:   ['назва']                         — розірвані дроти (струму немає, на дроті видно розрив)
   Для вузлів із 3+ виводами точки зламу окремого відрізка: via['назва#0'], via['назва#1'] …
   Повертає об'єкт із методами для оживлення схеми. */
(function () {
  const NS = 'http://www.w3.org/2000/svg';
  const PALETTE = ['#2e9e44', '#e07b1a', '#1e63d6', '#8e44ad', '#0aa5b8'];

  /* Змішати два кольори #rrggbb: t = 0 → a, t = 1 → b */
  function mix(a, b, t) {
    if (!/^#[0-9a-f]{6}$/i.test(a) || !/^#[0-9a-f]{6}$/i.test(b)) return t > 0.05 ? b : a;
    const h = (c, i) => parseInt(c.slice(1 + 2 * i, 3 + 2 * i), 16);
    return '#' + [0, 1, 2].map(i => Math.round(h(a, i) + (h(b, i) - h(a, i)) * t).toString(16).padStart(2, '0')).join('');
  }

  function pinPos(def, ref, view) {
    const [pid, pin] = ref.split('.');
    const p = def.parts[pid];
    const P = window.PARTS[p.type];
    if (!P || !P.pins[pin]) throw new Error('Невідомий вивід: ' + ref);
    let [x, y] = (view === 'real' && P.realPins && P.realPins[pin]) || P.pins[pin];
    const r = (p.rot || 0) % 360;
    if (r === 90) [x, y] = [-y, x];
    else if (r === 180) [x, y] = [-x, -y];
    else if (r === 270) [x, y] = [y, -x];
    return [p.x + x, p.y + y];
  }

  // Дріт: через задані точки або «горизонталь, потім вертикаль»
  function route(a, b, via) {
    const pts = [a, ...(via || []), b];
    if (!via || !via.length) pts.splice(1, 0, [b[0], a[1]]);
    return 'M' + pts.map(p => p.join(' ')).join(' L');
  }

  // Колір дроту за назвою вузла: плюс — червоний, земля — чорний, решта — з палітри
  function wireColor(def, name, i) {
    if (def.colors && def.colors[name]) return def.colors[name];
    if (/plus|vcc|5v/i.test(name)) return '#d93025';
    if (/minus|gnd/i.test(name)) return '#222';
    return PALETTE[i % PALETTE.length];
  }

  function render(svg, def, view) {
    view = view || def.view || 'schematic';
    const real = view === 'real';
    svg.setAttribute('viewBox', def.viewBox || '0 0 600 340');
    svg.classList.toggle('view-real', real);
    svg.innerHTML = '';
    const gw = document.createElementNS(NS, 'g');
    const gf = document.createElementNS(NS, 'g');
    const gp = document.createElementNS(NS, 'g');
    let wires = '', flows = '', dots = '', k = 0;

    for (const [name, refs] of Object.entries(def.nets || {})) {
      const via = (real && (def.viaReal || {})[name]) || (def.via || {})[name];
      const col = real ? wireColor(def, name, k++) : null;
      for (let i = 0; i < refs.length - 1; i++) {
        const seg = name + '#' + i;
        const v = refs.length === 2 ? via : ((real && (def.viaReal || {})[seg]) || (def.via || {})[seg]);
        const d = route(pinPos(def, refs[i], view), pinPos(def, refs[i + 1], view), v);
        const open = (def.open || []).includes(name);
        wires += `<path class="wire${open ? ' broken' : ''}" d="${d}"${col ? ` style="stroke:${col}"` : ''}/>`;
        if (!open) flows += `<path class="flow" data-net="${name}" d="${d}"/>`;
      }
      if (refs.length > 2) refs.slice(1, -1).forEach(r => {
        const [x, y] = pinPos(def, r, view);
        dots += `<circle cx="${x}" cy="${y}" r="${real ? 4 : 5}" fill="${col || '#1f2a44'}"/>`;
      });
    }
    gw.innerHTML = wires + dots;
    gf.innerHTML = flows;

    let parts = '';
    for (const [id, p] of Object.entries(def.parts)) {
      const P = window.PARTS[p.type];
      const draw = real && P.real ? P.real : P.draw;
      parts += `<g class="part part-${p.type}" data-id="${id}" transform="translate(${p.x} ${p.y}) rotate(${p.rot || 0})">${draw({ ...p, id: svg.id + '-' + id })}</g>`;
    }
    gp.innerHTML = parts;
    svg.append(gw, gp, gf);

    // Розірваний дріт: проміжок посередині та «іскорка»-позначка
    svg.querySelectorAll('.wire.broken').forEach(w => {
      const L = w.getTotalLength(), gap = 26;
      w.setAttribute('stroke-dasharray', `${L / 2 - gap / 2} ${gap} ${L}`);
      const m1 = w.getPointAtLength(L / 2 - gap / 2), m2 = w.getPointAtLength(L / 2 + gap / 2);
      gw.insertAdjacentHTML('beforeend', `<circle cx="${m1.x}" cy="${m1.y}" r="4" fill="${w.style.stroke || '#1f2a44'}"/><circle cx="${m2.x}" cy="${m2.y}" r="4" fill="${w.style.stroke || '#1f2a44'}"/>`);
    });

    const q = sel => svg.querySelector(sel);
    return {
      view,
      /* Струм у мА: швидкість крапок пропорційна струму */
      setCurrent(mA) {
        svg.querySelectorAll('.flow').forEach(f => {
          if (mA <= 0.05) { f.style.opacity = 0; return; }
          f.style.opacity = 1;
          const speed = Math.min(Math.max(mA * 7, 12), 420);
          f.style.animationDuration = (18 / speed) + 's';
        });
      },
      /* Яскравість LED 0…1; burnt — згорів */
      setLed(id, level, burnt) {
        const glow = q(`#${svg.id}-${id}-glow`), body = q(`#${svg.id}-${id}-body`), sm = q(`#${svg.id}-${id}-smoke`);
        const k = burnt ? 0 : Math.max(0, Math.min(1, level));
        glow.setAttribute('opacity', (k ** 0.8).toFixed(2));
        const r0 = +(glow.dataset.r || (glow.dataset.r = glow.getAttribute('r')));
        glow.setAttribute('r', (r0 * (0.45 + 0.55 * k)).toFixed(1));          // слабке світіння — менший ореол
        body.setAttribute('fill', burnt ? '#4a4f5a' : mix(body.dataset.off, body.dataset.color, Math.min(1, k * 1.6)));
        sm.setAttribute('opacity', burnt ? 1 : 0);
        sm.classList.toggle('rising', !!burnt);
      },
      /* Новий номінал резистора: підпис і кольорові смужки */
      setValue(id, R) {
        const t = q(`#${svg.id}-${id}-label`); if (t) t.textContent = fmtR(R);
        const b = resistorBands(R);
        b.forEach((c, i) => { const r = q(`#${svg.id}-${id}-b${i}`); if (r) r.setAttribute('fill', c); });
        def.parts[id].value = R;
      },
      /* Сховати деталь і показати на її місці пунктирне «гніздо» зі знаком питання */
      setPartVisible(id, visible) {
        const g = q(`[data-id="${id}"]`); if (g) g.style.display = visible ? '' : 'none';
        svg.querySelectorAll(`.slot[data-for="${id}"]`).forEach(n => n.remove());
        if (visible) return;
        const pins = Object.keys(window.PARTS[def.parts[id].type].pins).map(n => pinPos(def, id + '.' + n, view));
        const [a, b] = pins, vert = Math.abs(a[0] - b[0]) < Math.abs(a[1] - b[1]);
        const cx = (a[0] + b[0]) / 2, cy = (a[1] + b[1]) / 2, w = vert ? 34 : 64, h = vert ? 64 : 34;
        svg.insertAdjacentHTML('beforeend', `<g class="slot" data-for="${id}">
          <rect x="${cx - w / 2}" y="${cy - h / 2}" width="${w}" height="${h}" rx="6" fill="#fff" stroke="#EE7E42" stroke-width="2.5" stroke-dasharray="6 5"/>
          <text x="${cx}" y="${cy + 8}" text-anchor="middle" font-size="22" font-weight="800" fill="#EE7E42">?</text></g>`);
      },
      /* Яскравість лампочки 0…1 */
      /* Потенціометр: положення ручки 0…1 */
      setPot(id, pos) {
        const k = q(`#${svg.id}-${id}-knob`); if (k) k.setAttribute('transform', `rotate(${-135 + 270 * pos} 50 18)`);
        const w = q(`#${svg.id}-${id}-wip`);
        if (w) { const x = 30 + 40 * pos; w.innerHTML = `<path d="M50 100 V86 H${x} V76" stroke="currentColor" stroke-width="3" fill="none"/><path d="M${x - 6} 78 L${x} 70 L${x + 6} 78 Z" fill="currentColor"/>`; w.setAttribute('color', '#1F3B63'); }
      },
      setLamp(id, level) {
        const g = q(`#${svg.id}-${id}-glow`), gl = q(`#${svg.id}-${id}-glass`), f = q(`#${svg.id}-${id}-fil`);
        if (!g) return;
        const on = level > 0.03;
        g.setAttribute('opacity', Math.min(1, level).toFixed(2));
        gl.setAttribute('fill', on ? `rgba(255,236,150,${(0.35 + 0.55 * Math.min(1, level)).toFixed(2)})` : gl.dataset.off);
        f.setAttribute('stroke', on ? '#ff9f1a' : f.dataset.off);
      },
      /* Викрутити лампочку: колба з цоколем піднімається над патроном */
      setLampOut(id, out) {
        const b = q(`#${svg.id}-${id}-bulb`); if (!b) return;
        b.setAttribute('transform', out ? 'translate(0 -30) rotate(-12 50 30)' : '');
        if (out) this.setLamp(id, 0);
      },
      /* Струм окремо для кожного дроту (вузла): { назва: мА } */
      setNetCurrents(map) {
        svg.querySelectorAll('.flow').forEach(f => {
          const mA = map[f.dataset.net] || 0;
          if (mA <= 0.05) { f.style.opacity = 0; return; }
          f.style.opacity = 1;
          f.style.animationDuration = (18 / (10 + Math.sqrt(Math.min(mA, 500)) * 4)) + 's';   // різниця між 45, 90 і 180 мА помітна
        });
      },
      /* Показ мультиметра */
      setMeter(id, text) { const t = q(`#${svg.id}-${id}-disp`); if (t) t.textContent = text; },
      /* Щупи мультиметра в точках схеми: red/black = [x, y] або null */
      setProbes(red, black) {
        svg.querySelectorAll('.probe').forEach(n => n.remove());
        const pr = (p, c, t) => p ? `<g class="probe"><line x1="${p[0]}" y1="${p[1]}" x2="${p[0] + 22}" y2="${p[1] - 34}" stroke="${c}" stroke-width="7" stroke-linecap="round"/><circle cx="${p[0]}" cy="${p[1]}" r="7" fill="${c}" stroke="#fff" stroke-width="2"/><text x="${p[0] + 26}" y="${p[1] - 38}" font-size="13" font-weight="800" fill="${c}">${t}</text></g>` : '';
        svg.insertAdjacentHTML('beforeend', pr(red, '#d93025', '+') + pr(black, '#222', 'COM'));
      },
      setPin(boardId, pin, high) { const g = q(`#${svg.id}-${boardId}-${pin} .pin-led`); if (g) g.setAttribute('fill', high ? '#ffd23f' : '#56606e'); }
    };
  }

  window.Circuit = { render, pinPos };
})();
