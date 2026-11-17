/* Перенесення прогресу між браузерами: файл .electro.
   Дані простенько зашифровані (XOR + base64) і мають контрольну суму,
   щоб файл не можна було просто відкрити й підправити в блокноті. */
(function () {
  const KEY = 'kman-electro-2026';
  const PREFIX = 'electro-progress-';

  const hash = str => { let h = 5381; for (let i = 0; i < str.length; i++) h = ((h << 5) + h + str.charCodeAt(i)) >>> 0; return h.toString(36); };
  const xor = bytes => bytes.map((b, i) => b ^ KEY.charCodeAt(i % KEY.length));
  const toB64 = bytes => { let s = ''; bytes.forEach(b => s += String.fromCharCode(b)); return btoa(s); };
  const fromB64 = str => Uint8Array.from(atob(str), c => c.charCodeAt(0));

  function collect() {
    const data = { v: 1, name: localStorage.getItem('electro-name') || '', lessons: {} };
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k.startsWith(PREFIX)) { try { data.lessons[k.slice(PREFIX.length)] = JSON.parse(localStorage.getItem(k)); } catch (e) {} }
    }
    return data;
  }

  function encode(data) {
    const json = JSON.stringify(data);
    const body = toB64(xor(new TextEncoder().encode(json)));
    return 'ELX1.' + hash(KEY + json) + '.' + body;
  }

  function decode(text) {
    const [tag, sum, body] = text.trim().split('.');
    if (tag !== 'ELX1' || !body) throw new Error('format');
    const json = new TextDecoder().decode(xor(fromB64(body)));
    if (hash(KEY + json) !== sum) throw new Error('checksum');
    return JSON.parse(json);
  }

  /* Об'єднати з тим, що вже є в браузері: для кожного уроку лишається кращий результат */
  const score = st => !st ? -1 : Object.keys(st.done || {}).length * 100 - Object.values(st.mistakes || {}).reduce((a, b) => a + b, 0);
  function merge(data) {
    let n = 0;
    for (const [id, inc] of Object.entries(data.lessons || {})) {
      let cur = null; try { cur = JSON.parse(localStorage.getItem(PREFIX + id) || 'null'); } catch (e) {}
      const incBetter = score(inc) > score(cur);
      const best = incBetter ? { ...inc } : { ...(cur || {}) };
      const other = incBetter ? cur : inc;
      if (other) {
        best.practice = { ...(other.practice || {}), ...(best.practice || {}) };
        // лічильники тренажерів — більші з двох
        const mx = (a = {}, b = {}) => { const r = { ...a }; for (const k in b) r[k] = Math.max(r[k] || 0, b[k] || 0); return r; };
        best.genSolved = mx(best.genSolved, other.genSolved);
        const g = { ...(other.gen || {}), ...(best.gen || {}) };
        for (const k in g) { const a = (best.gen || {})[k] || {}, b = (other.gen || {})[k] || {}; g[k] = { ...b, ...a, ok: Math.max(a.ok || 0, b.ok || 0), tries: Math.max(a.tries || 0, b.tries || 0), wrong: Math.max(a.wrong || 0, b.wrong || 0) }; }
        best.gen = g;
        if (other.bonus && (!best.bonus || other.bonus < best.bonus)) best.bonus = other.bonus;
        const bb = { ...((other && other.bonuses) || {}) };
        for (const [k, d] of Object.entries(best.bonuses || {})) if (!bb[k] || d < bb[k]) bb[k] = d;
        best.bonuses = bb;
        // дата — найраніша з двох
        if (best.card && other.card && other.card.date && (!best.card.date || other.card.date < best.card.date)) best.card.date = other.card.date;
      }
      localStorage.setItem(PREFIX + id, JSON.stringify(best)); n++;
    }
    if (data.name && !localStorage.getItem('electro-name')) localStorage.setItem('electro-name', data.name);
    return n;
  }

  window.ProgressFile = {
    download() {
      const blob = new Blob([encode(collect())], { type: 'application/octet-stream' });
      const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
      a.download = `мій-прогрес-${new Date().toISOString().slice(0, 10)}.electro`; a.click();
    },
    async upload(file) { return merge(decode(await file.text())); },
    decode   // для сторінки-переглядача викладача
  };
})();
