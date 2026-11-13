/* Рушій лабораторної: вибір проєкту → індивідуальні параметри (видаються один раз і зберігаються в браузері) →
   тест (одна спроба, випадкові питання з банку) → екзаменаційний лист (друк у PDF) → здача через Google Форму.
   Скидання лабораторної стирає все: новий проєкт, нові параметри, новий тест. */
(function () {
  const LAB = window.LAB, KEY = 'electro-lab-' + LAB.id;
  const root = document.getElementById('lab');
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const load = () => { try { return JSON.parse(localStorage.getItem(KEY) || 'null') || {}; } catch (e) { return {}; } };
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} };
  let S = load();
  const P = () => LAB.projects.find(p => p.id === S.project);
  const labInfo = (window.COURSE || []).map(m => m.lab).find(l => l && l.id === LAB.id) || {};
  const labForm = labInfo.form || (window.SITE && SITE.links && SITE.links.labForm) || '';
  const fmt = x => (Math.round(x * 100) / 100).toString().replace('.', ',');
  const today = () => new Date().toLocaleDateString('uk-UA');

  /* Контрольний код екзаменаційного листа: зміна імені, варіанта, відповідей чи балів його змінює */
  const checkCode = () => {
    const s = JSON.stringify([S.name, S.attempt, S.variant, S.project, S.params, S.report, S.test && S.test.answers, S.test && S.test.score, 'kman-electro']);
    let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
    return (h >>> 0).toString(36).toUpperCase().padStart(7, '0').slice(-6);
  };

  function makeTest() {
    const idx = LAB.test.bank.map((_, i) => i).sort(() => Math.random() - 0.5).slice(0, LAB.test.size);
    return idx.map(i => {
      const q = LAB.test.bank[i]();
      if (q.kind === 'one') {   // перемішати варіанти, запам’ятати правильний
        const order = q.options.map((_, k) => k).sort(() => Math.random() - 0.5);
        return { kind: 'one', q: q.q, options: order.map(k => q.options[k]), a: order.indexOf(q.a) };
      }
      return q;
    });
  }
  const parseNum = s => { const x = parseFloat(String(s).replace(',', '.').replace(/\s/g, '')); return isFinite(x) ? x : null; };
  const isRight = (q, ans) => q.kind === 'one' ? ans === q.a : (parseNum(ans) !== null && Math.abs(parseNum(ans) - q.a) <= q.abs);
  const rightText = q => q.kind === 'one' ? q.options[q.a] : `${fmt(q.a)}${q.unit ? ' ' + q.unit : ''}`;
  const ansText = (q, a) => a === undefined || a === null || a === '' ? '—' : q.kind === 'one' ? q.options[a] : `${a}${q.unit ? ' ' + q.unit : ''}`;

  const openQs = () => [...(P().open ? P().open(S.params) : []), ...LAB.open];


  /* ---------- Звіт: усе, що учень пише сам, — на сайті й у PDF ---------- */
  const reportItems = p => [
    ...p.prove(S.params).map((x, i) => typeof x === 'string' ? { key: 'p' + i, text: x } : { key: 'p' + i, ...x }),
    ...openQs().map((x, i) => ({ key: 'o' + i, text: x, open: true }))
  ];
  const R = () => (S.report = S.report || {});
  const filled = it => it.table ? (R()[it.key] || []).some(r => r && r.some(c => String(c || '').trim())) : String(R()[it.key] || '').trim().length > 0;
  function reportBlock(p) {
    const it = reportItems(p), r = R();
    const field = x => x.table
      ? `<table class="rp-table"><tr>${x.table.map(c => `<th>${c}</th>`).join('')}</tr>${Array.from({ length: x.rows || 3 }, (_, i) => `<tr>${x.table.map((_, j) => `<td><input data-t="${x.key}" data-r="${i}" data-c="${j}" value="${esc(((r[x.key] || [])[i] || [])[j] || '')}"></td>`).join('')}</tr>`).join('')}</table>`
      : `<textarea data-k="${x.key}" rows="${x.open ? 4 : 3}" placeholder="${x.open ? 'Поясни своїми словами' : 'Формули, числа, одиниці'}">${esc(r[x.key] || '')}</textarea>`;
    const sec = (title, list) => `<h3>${title}</h3>${list.map((x, i) => `<div class="rp-item"><div class="rp-q"><b>${i + 1}.</b> ${x.text}</div>${field(x)}</div>`).join('')}`;
    return `<section class="lab-card-box report"><h2 class="lab-h2">Звіт</h2>
      <p class="small">Заповнюй, поки працюєш у Tinkercad. Усе зберігається в цьому браузері й потрапить в екзаменаційний лист.</p>
      ${sec('Розрахунки й вимірювання', it.filter(x => !x.open))}
      ${sec('Поясни', it.filter(x => x.open))}
    </section>`;
  }
  const reportSheet = p => {
    const r = R(), rows = x => {
      const t = (r[x.key] || []).filter(row => row && row.some(c => String(c || '').trim()));
      return t.length ? `<table class="sh-t"><tr>${x.table.map(c => `<th>${c}</th>`).join('')}</tr>${t.map(row => `<tr>${x.table.map((_, j) => `<td>${esc(row[j] || '')}</td>`).join('')}</tr>`).join('')}</table>` : '<div class="sh-ans">—</div>';
    };
    const it = reportItems(p);
    const sec = list => list.map((x, i) => `<div class="sh-item"><div class="sh-q">${i + 1}. ${x.text}</div>${x.table ? rows(x) : `<div class="sh-ans">${esc(r[x.key] || '—')}</div>`}</div>`).join('');
    return `<h3>Розрахунки й вимірювання</h3>${sec(it.filter(x => !x.open))}
      <h3>Пояснення</h3>${sec(it.filter(x => x.open))}`;
  };

  /* ---------- Екрани ---------- */
  function render() {
    const p = P();
    root.innerHTML = `
      <div class="lab-head">
        <div><small>Лабораторна робота ${LAB.n} · ${LAB.lessons} · для сертифіката</small><h1>${LAB.title}</h1></div>
        ${p ? '<button class="ghost no-print" id="lab-reset">↺ Скинути лабораторну</button>' : ''}
      </div>
      ${p ? task(p) + reportBlock(p) + testBlock() + submitBlock() : choose()}`;
    bind();
  }

  function choose() {
    return `<div class="lab-card-box">
      <p class="lead">${LAB.intro}</p>
      <ol class="lab-steps"><li>Обери проєкт — отримаєш власне технічне завдання з числами.</li><li>Збери пристрій у Tinkercad Circuits і перевір, що він відповідає вимогам.</li><li>Пройди тест (${LAB.test.size} питань, одна спроба).</li><li>Збережи екзаменаційний лист у PDF і здай роботу через форму.</li></ol>
      <label class="lab-name">Прізвище та ім’я <input id="lab-name" value="${esc(S.name || '')}" placeholder="Як у списку секції" autocomplete="name"></label>
    </div>
    <h2 class="lab-h2">Обери проєкт</h2>
    <div class="lab-projects">${LAB.projects.map(p => `
      <button class="lab-proj" data-p="${p.id}"><span class="lp-ic">${p.icon}</span><b>${p.title}</b><span>${p.teaser}</span></button>`).join('')}
    </div>
    <p class="small">Параметри видаються один раз і зберігаються в цьому браузері. Змінити проєкт можна, лише скинувши лабораторну, — тоді параметри й тест будуть нові.</p>`;
  }

  function task(p) {
    const v = S.params;
    return `<section class="lab-card-box tz">
      <div class="tz-top"><span class="lp-ic">${p.icon}</span><div><small>Технічне завдання · варіант ${S.variant} · спроба ${S.attempt || 1}</small><h2>${p.title}</h2><div class="small">${esc(S.name)} · видано ${S.issued}</div></div></div>
      <p class="lead">${p.goal(v)}</p>
      <h3>Твої параметри</h3>
      <table class="tz-params">${p.params(v).map(r => `<tr><th>${r[0]}</th><td>${r[1]}</td></tr>`).join('')}</table>
      <h3>Вимоги</h3><ol>${p.reqs(v).map(r => `<li>${r}</li>`).join('')}</ol>
      <div class="tz-hint">💡 ${p.hint}</div>
      <p class="small">Розрахунки, вимірювання й пояснення заповнюй у розділі «Звіт» нижче — вони потраплять в екзаменаційний лист.</p>
    </section>`;
  }

  function testBlock() {
    const t = S.test;
    if (!t) return `<section class="lab-card-box no-print"><h2 class="lab-h2">Тест</h2>
      <p>${LAB.test.size} питань за уроками 1–4. <b>Одна спроба</b>: після завершення відповіді не змінити. Відповіді зберігаються, тож можна закрити сторінку й повернутися.</p>
      <button class="primary" id="test-start">Почати тест</button></section>`;
    return `<section class="lab-card-box"><h2 class="lab-h2">Тест ${t.submitted ? `— ${t.score} з ${t.qs.length}` : ''}</h2>
      <ol class="lab-test">${t.qs.map((q, i) => {
        const a = t.answers[i], ok = t.submitted && isRight(q, a);
        const mark = t.submitted ? `<div class="lt-mark ${ok ? 'ok' : 'bad'}">${ok ? '✓ правильно' : '✗ правильна відповідь: ' + rightText(q)}</div>` : '';
        const input = q.kind === 'one'
          ? q.options.map((o, k) => `<label class="lt-opt"><input type="radio" name="q${i}" value="${k}" ${a === k ? 'checked' : ''} ${t.submitted ? 'disabled' : ''}> ${o}</label>`).join('')
          : `<label class="lt-num"><input inputmode="decimal" data-q="${i}" value="${esc(a ?? '')}" ${t.submitted ? 'disabled' : ''}> ${q.unit || ''}</label>`;
        return `<li class="${t.submitted ? (ok ? 'ok' : 'bad') : ''}"><div class="lt-q">${q.q}</div>${input}${mark}</li>`;
      }).join('')}</ol>
      ${t.submitted ? '' : '<p class="small no-print">Числа можна писати з комою або крапкою. Округлюй розумно — невелика похибка допускається.</p><button class="primary no-print" id="test-finish">Завершити тест</button>'}
    </section>`;
  }

  function submitBlock() {
    if (!S.test || !S.test.submitted) return '';
    const p = P(), empty = reportItems(p).filter(x => !filled(x)).length;
    return `<section class="lab-card-box no-print"><h2 class="lab-h2">Здача роботи</h2>
      ${empty ? `<p class="rp-warn">Не заповнено пунктів звіту: ${empty}. Лист можна зберегти й так, але ментор оцінює саме звіт.</p>` : ''}
      <ol class="lab-steps">
        <li><button class="primary" id="sheet">📄 Зберегти екзаменаційний лист у PDF</button><div class="small">У лист потрапляють твоє завдання, звіт і результат тесту. Відкриється вікно друку — обери «Зберегти як PDF».</div></li>
        <li>${labForm ? `<a class="primary" href="${labForm}" target="_blank" rel="noopener">Здати роботу через форму ↗</a><div class="small">У формі: ПІБ, email, посилання на проєкт у Tinkercad і цей PDF.</div>` : '<b>Форма для здачі з’явиться тут</b> — ментор повідомить, коли її відкрито. Знадобляться ПІБ, email, посилання на проєкт у Tinkercad і цей PDF.'}</li>
      </ol><div class="fb-slot"></div></section>`;
  }

  function sheet() {
    const p = P(), t = S.test;
    const w = document.getElementById('sheet-box');
    w.innerHTML = `<div class="sheet">
      <div class="sh-head"><div><b>Київська МАН · секція «Електроніка та приладобудування»</b><br>Лабораторна робота ${LAB.n} «${LAB.title}» · екзаменаційний лист</div><div class="sh-code">Код перевірки<br><b>${checkCode()}</b></div></div>
      <table class="sh-meta"><tr><th>Учень</th><td>${esc(S.name)}</td><th>Дата тесту</th><td>${t.at}</td></tr>
        <tr><th>Проєкт</th><td>${p.title}</td><th>Варіант</th><td>${S.variant} (видано ${S.issued})</td></tr>
        <tr><th>Спроба</th><td>${S.attempt || 1}</td><th>Результат тесту</th><td><b>${t.score} з ${t.qs.length}</b></td></tr></table>
      <h3>Параметри технічного завдання</h3>
      <table class="sh-t">${p.params(S.params).map(r => `<tr><th>${r[0]}</th><td>${r[1]}</td></tr>`).join('')}</table>
      <h3>Тест: ${t.score} з ${t.qs.length}</h3>
      <table class="sh-t sh-test"><tr><th>№</th><th>Питання</th><th>Відповідь учня</th><th>Правильна</th><th></th></tr>
        ${t.qs.map((q, i) => { const ok = isRight(q, t.answers[i]); return `<tr><td>${i + 1}</td><td>${q.q}</td><td>${ansText(q, t.answers[i])}</td><td>${rightText(q)}</td><td>${ok ? '✓' : '✗'}</td></tr>`; }).join('')}
      </table>
      ${reportSheet(p)}
      <p class="small">Лист сформовано автоматично на сайті секції. Код перевірки змінюється, якщо змінити ім’я, варіант, звіт, відповіді чи бали.</p>
    </div>`;
    document.body.classList.add('print-sheet');
    const done = () => { document.body.classList.remove('print-sheet'); window.removeEventListener('afterprint', done); };
    window.addEventListener('afterprint', done);
    setTimeout(() => window.print(), 50);
  }

  function bind() {
    const $ = id => document.getElementById(id);
    const name = $('lab-name');
    if (name) name.oninput = () => { S.name = name.value.trim(); save(); };
    root.querySelectorAll('.lab-proj').forEach(b => b.onclick = () => {
      if (!S.name || S.name.length < 3) { name.focus(); name.classList.add('need'); return; }
      const p = LAB.projects.find(x => x.id === b.dataset.p);
      if (!confirm(`Обрати проєкт «${p.title}»?\nПараметри видаються один раз. Змінити проєкт можна лише скинувши лабораторну.`)) return;
      S = { name: S.name, attempt: (S.attempt || 0) + 1, project: p.id, params: p.gen(), variant: String(1000 + Math.floor(Math.random() * 9000)), issued: today() };
      save(); render(); window.scrollTo(0, 0);
    });
    const rs = $('lab-reset');
    if (rs) rs.onclick = () => {
      if (!confirm('Скинути лабораторну?\nПараметри, тест і результат буде видалено. Ти зможеш обрати інший проєкт і отримаєш нові параметри та новий тест. Номер спроби буде вказано в екзаменаційному листі.')) return;
      S = { name: S.name, attempt: S.attempt || 1 }; save(); render(); window.scrollTo(0, 0);
    };
    root.querySelectorAll('.report textarea').forEach(t => t.oninput = () => { R()[t.dataset.k] = t.value; save(); });
    root.querySelectorAll('.report input[data-t]').forEach(t => t.oninput = () => {
      const a = R()[t.dataset.t] = R()[t.dataset.t] || []; (a[+t.dataset.r] = a[+t.dataset.r] || [])[+t.dataset.c] = t.value; save();
    });
    const st = $('test-start');
    if (st) st.onclick = () => { S.test = { qs: makeTest(), answers: [], submitted: false }; save(); render(); };
    if (S.test && !S.test.submitted) {
      root.querySelectorAll('.lab-test input[type=radio]').forEach(r => r.onchange = () => { S.test.answers[+r.name.slice(1)] = +r.value; save(); });
      root.querySelectorAll('.lab-test input[data-q]').forEach(r => r.oninput = () => { S.test.answers[+r.dataset.q] = r.value.trim(); save(); });
    }
    const fin = $('test-finish');
    if (fin) fin.onclick = () => {
      const t = S.test, empty = t.qs.filter((_, i) => t.answers[i] === undefined || t.answers[i] === '').length;
      if (!confirm((empty ? `Без відповіді: ${empty}. ` : '') + 'Завершити тест? Змінити відповіді потім не вийде.')) return;
      t.submitted = true; t.at = today(); t.score = t.qs.filter((q, i) => isRight(q, t.answers[i])).length;
      save(); render();
    };
    const fbs = root.querySelector('.fb-slot');
    if (fbs && window.Feedback) Feedback.mount(fbs, { id: LAB.id, title: LAB.title, question: 'Як тобі лабораторна?' });
    const sh = $('sheet');
    if (sh) sh.onclick = sheet;
  }

  render();
})();
