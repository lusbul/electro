/* Картка-нагорода за урок (наліпка). Спільна для уроку й сторінки «Досягнення».
   Card.svg(meta) → SVG-рядок 1080×1030; Card.png(meta) → Promise<Blob> (PNG). */
(function () {
  const F = 'font-family="Arial, Helvetica, sans-serif"';
  const esc = t => String(t).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

  /* Довгу назву ділимо на два рядки біля середини */
  function titleLines(t) {
    if (t.length <= 22) return [t];
    const mid = t.length / 2; let best = -1;
    for (let k = 0; k < t.length; k++) if (t[k] === ' ' && (best < 0 || Math.abs(k - mid) < Math.abs(best - mid))) best = k;
    return best < 0 ? [t] : [t.slice(0, best), t.slice(best + 1)];
  }

  /* meta: { number, title, lines[], stars, name, date:'РРРР-ММ-ДД', sticker:{src,size:[w,h]} } */
  function svg(meta) {
    const W = 1080, H = 1030;
    const stripe = y => `<rect x="0" y="${y}" width="240" height="12" fill="#57B146"/><rect x="240" y="${y}" width="355" height="12" fill="#0CB7D1"/><rect x="595" y="${y}" width="290" height="12" fill="#EE7E42"/><rect x="885" y="${y}" width="195" height="12" fill="#E53281"/>`;
    const starPath = 'M0 -30 L9 -10 L30 -9 L13 5 L19 27 L0 15 L-19 27 L-13 5 L-30 -9 L-9 -10Z';
    const stars = [0, 1, 2].map(k => `<path d="${starPath}" transform="translate(${700 + k * 110} 600) scale(1.45)" fill="${k < (meta.stars || 0) ? '#FBAE40' : '#DEE2E6'}" stroke="#1F3B63" stroke-width="2.5" stroke-linejoin="round"/>`).join('');
    // Наліпка уроку (або котик за замовчуванням) — вписуємо в рамку 520×540
    const st = meta.sticker || { src: window.CATS.thumb, size: [358, 420] };
    const k = Math.min(520 / st.size[0], 480 / st.size[1]);
    const sw = st.size[0] * k, sh = st.size[1] * k;
    const tl = titleLines(meta.title);
    const site = ((window.SITE && SITE.url) || '').replace(/^https?:\/\//, '');
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
      <rect width="${W}" height="${H}" fill="#fff"/>
      ${stripe(0)}
      <image href="${window.LOGOS.section}" x="40" y="44" width="150" height="165"/>
      <image href="${window.LOGOS.kman}" x="890" y="50" width="150" height="152"/>
      <text x="540" y="${tl.length > 1 ? 92 : 112}" text-anchor="middle" ${F} font-size="40" font-weight="700" fill="#EE7E42">Урок ${meta.number} пройдено!</text>
      ${tl.map((t, i) => `<text x="540" y="${(tl.length > 1 ? 150 : 180) + i * 58}" text-anchor="middle" ${F} font-size="${tl.length > 1 ? 50 : 58}" font-weight="700" fill="#003FB8">${esc(t)}</text>`).join('')}
      <rect x="40" y="245" width="1000" height="520" rx="14" fill="#DDEFDA"/>
      <image href="${st.src}" x="${60 + (520 - sw) / 2}" y="${265 + (480 - sh) / 2}" width="${sw}" height="${sh}"/>
      <rect x="600" y="345" width="410" height="${86 + (meta.lines || []).length * 42}" rx="12" fill="#fff"/>
      <text x="805" y="405" text-anchor="middle" ${F} font-size="42" font-weight="700" fill="#1F3B63">${esc(meta.name || 'Юний інженер')}</text>
      ${(meta.lines || []).map((t, i) => `<text x="805" y="${455 + i * 40}" text-anchor="middle" ${F} font-size="30" fill="#1F3B63">${esc(t)}</text>`).join('')}
      ${stars}
      ${meta.date ? `<text x="805" y="700" text-anchor="middle" ${F} font-size="26" fill="#6E747A">${esc(meta.date.split('-').reverse().join('.'))}</text>` : ''}
      <rect x="40" y="790" width="1000" height="120" rx="12" fill="#EAF3FB"/>
      <text x="540" y="842" text-anchor="middle" ${F} font-size="38" font-weight="700" fill="#003FB8">Електроніка та приладобудування</text>
      <text x="540" y="884" text-anchor="middle" ${F} font-size="27" fill="#1F3B63">секція Київської МАН на базі КПІ ім. Ігоря Сікорського</text>
      <text x="540" y="968" text-anchor="middle" ${F} font-size="28" fill="#6E747A">Спробуй і ти: ${esc(site)}</text>
      ${stripe(H - 12)}
    </svg>`;
  }

  async function png(meta) {
    const img = new Image();
    img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg(meta));
    await img.decode();
    const cv = document.createElement('canvas'); cv.width = 1080; cv.height = 1030;
    cv.getContext('2d').drawImage(img, 0, 0);
    return new Promise(r => cv.toBlob(r, 'image/png'));
  }

  window.Card = { svg, png, titleLines };
})();
