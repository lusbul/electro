/**
 * Скрипт секції «Електроніка та приладобудування» для Google-таблиці, у якій є:
 *   • аркуш відповідей Google-форми здачі лабораторних;
 *   • аркуш «Відгуки» (скрипт створить його сам).
 *
 * Що робить:
 *   1. Приймає відгуки з сайту → аркуш «Відгуки» + лист на пошту (doPost).
 *   2. Показує учню сторінку «Мої лабораторні» (doGet): учень вводить email і прізвище —
 *      бачить, які роботи здано, які вже перевірено і скільки балів.
 *
 * ЯК ПІДКЛЮЧИТИ (один раз):
 * 1. Відкрийте таблицю, куди форма складає відповіді: Розширення → Apps Script.
 *    Видаліть усе в редакторі й вставте цей файл. Збережіть (💾).
 * 2. Розгорнути → Нове розгортання → тип «Вебзастосунок»:
 *      Виконувати від імені: «Я»;  Хто має доступ: «Будь-хто».
 *    «Розгорнути», дозвольте доступ (це ваш власний скрипт).
 * 3. Скопіюйте «URL вебзастосунку» (закінчується на /exec):
 *      • у settings.js сайту:  Скрипт для відгуків: https://script.google.com/macros/s/…/exec
 *      • у налаштування форми → Презентація → Повідомлення про підтвердження (це адреса сторінки «Мої лабораторні»).
 * 4. На аркуші відповідей форми допишіть праворуч від останнього стовпця два заголовки:
 *      Бали    Коментар викладача
 *    Коли перевірите роботу — впишіть бали (і за бажанням коментар) у рядок цієї здачі.
 *
 * Якщо пізніше зміните код — Розгорнути → Керувати розгортаннями → ✏️ → Версія: «Нова» → Розгорнути
 * (адреса залишиться та сама).
 */

/* ---------- Налаштування ---------- */
const EMAIL = '';                    // куди надсилати листи з відгуками; порожньо — власнику таблиці
const SEND_MAIL = true;              // false — відгуки лише в таблицю, без листів
const FEEDBACK_SHEET = 'Відгуки';    // аркуш для відгуків (створюється автоматично)
const FORM_SHEET = '';               // назва аркуша відповідей форми; порожньо — знайти автоматично
const TOTAL_LABS = 6;                // скільки лабораторних за рік (для «здано N з …»); 0 — не показувати

/* Заголовки стовпців на аркуші відповідей (шукаються за початком назви, без урахування регістру) */
const COL = {
  email:   [/^адреса електронної пошти/i, /^email/i, /^електронна пошта/i],
  name:    [/^прізвище/i, /^піб/i],
  lab:     [/^лабораторна робота/i],
  time:    [/^позначка часу/i, /^timestamp/i],
  points:  [/^бали/i],
  comment: [/^коментар/i]
};

const FACES = ['', '😣', '😕', '😐', '🙂', '🤩'];

/* ================= 1. Відгуки з сайту ================= */
function doPost(e) {
  try {
    const d = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    const rating = Math.max(1, Math.min(5, parseInt(d.rating, 10) || 0));
    const clean = (s, n) => String(s || '').replace(/[\u0000-\u0008\u000B-\u001F]/g, '').slice(0, n);
    const lesson = clean(d.lesson, 20), title = clean(d.title, 200), text = clean(d.text, 2000), name = clean(d.name, 100);
    if (!lesson) return out('bad');

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sh = ss.getSheetByName(FEEDBACK_SHEET) || ss.insertSheet(FEEDBACK_SHEET);
    if (sh.getLastRow() === 0) sh.appendRow(['Дата', 'Урок', 'Назва', 'Оцінка', '', 'Відгук', 'Ім’я']);
    // апостроф — щоб таблиця не сприйняла текст, що починається з «=», як формулу
    const safe = s => /^[=+\-@]/.test(s) ? "'" + s : s;
    sh.appendRow([new Date(), lesson, safe(title), rating, FACES[rating], safe(text), safe(name)]);

    if (SEND_MAIL) {
      const to = EMAIL || Session.getEffectiveUser().getEmail();
      MailApp.sendEmail(to, `Відгук ${FACES[rating]} — ${lesson} ${title}`,
        `Урок: ${lesson} — ${title}\nОцінка: ${rating} з 5 ${FACES[rating]}\nІм’я: ${name || '—'}\n\n${text || '(без тексту)'}\n\nУсі відгуки: ${ss.getUrl()}`);
    }
    return out('ok');
  } catch (err) {
    return out('error');
  }
}

function out(s) { return ContentService.createTextOutput(s).setMimeType(ContentService.MimeType.TEXT); }

/* ================= 2. Сторінка «Мої лабораторні» ================= */
function doGet() {
  return HtmlService.createHtmlOutput(PAGE)
    .setTitle('Мої лабораторні — секція «Електроніка та приладобудування»')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

/* Викликається зі сторінки. Повертає лише роботи, де збігаються і email, і прізвище. */
function myLabs(email, surname) {
  const norm = s => String(s || '').trim().toLowerCase().replace(/[’ʼ`']/g, '\'').replace(/\s+/g, ' ');
  const em = norm(email), sn = norm(surname).split(' ')[0];
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(em) || sn.length < 2) return { error: 'Перевір email і прізвище.' };

  const sh = formSheet_();
  if (!sh) return { error: 'Таблицю відповідей не знайдено. Повідом керівницю секції.' };
  const data = sh.getDataRange().getValues();
  const head = data[0].map(h => String(h).trim());
  const col = k => head.findIndex(h => COL[k].some(re => re.test(h)));
  const c = { email: col('email'), name: col('name'), lab: col('lab'), time: col('time'), points: col('points'), comment: col('comment') };
  if (c.email < 0 || c.name < 0 || c.lab < 0) return { error: 'У таблиці бракує стовпців email / ПІБ / лабораторна. Повідом керівницю секції.' };

  // Остання здача кожної лабораторної
  const labs = {};
  for (let r = 1; r < data.length; r++) {
    const row = data[r];
    if (norm(row[c.email]) !== em) continue;
    if (norm(row[c.name]).split(' ')[0] !== sn) continue;
    const lab = String(row[c.lab]).trim(); if (!lab) continue;
    const isDate = c.time >= 0 && row[c.time] instanceof Date;
    const pts = c.points >= 0 ? row[c.points] : '';
    const item = {
      lab, t: isDate ? row[c.time].getTime() : r,
      date: isDate ? Utilities.formatDate(row[c.time], 'Europe/Kyiv', 'dd.MM.yyyy') : '',
      points: pts === '' || pts === null ? null : String(pts),
      comment: c.comment >= 0 ? String(row[c.comment] || '') : '',
      tries: 1
    };
    const prev = labs[lab];
    if (prev) {
      item.tries = prev.tries + 1;
      if (prev.t > item.t) { prev.tries = item.tries; continue; }
    }
    labs[lab] = item;
  }
  const list = Object.values(labs).sort((a, b) => a.lab.localeCompare(b.lab, 'uk', { numeric: true }));
  if (!list.length) return { error: 'Не знайшли жодної здачі з таким email і прізвищем. Перевір, чи вводиш так само, як у формі.' };
  const checked = list.filter(x => x.points !== null);
  const sum = checked.reduce((s, x) => s + (parseFloat(x.points.replace(',', '.')) || 0), 0);
  return { list, submitted: list.length, checked: checked.length, sum: Math.round(sum * 100) / 100, total: TOTAL_LABS };
}

function formSheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  if (FORM_SHEET) return ss.getSheetByName(FORM_SHEET);
  return ss.getSheets().find(s => {
    if (s.getName() === FEEDBACK_SHEET || s.getLastRow() < 1) return false;
    const head = s.getRange(1, 1, 1, s.getLastColumn()).getValues()[0].map(h => String(h).trim());
    return head.some(h => COL.lab.some(re => re.test(h))) && head.some(h => COL.email.some(re => re.test(h)));
  }) || null;
}

const PAGE = `<!DOCTYPE html><html lang="uk"><head><base target="_top"><meta charset="utf-8">
<style>
  body{font-family:system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;margin:0;background:#f4f7fc;color:#1F3B63}
  .wrap{max-width:640px;margin:0 auto;padding:24px 16px}
  h1{color:#003FB8;font-size:1.5rem;margin:0 0 4px} .sub{color:#5a6573;margin:0 0 20px}
  .card{background:#fff;border-radius:14px;padding:20px;box-shadow:0 2px 10px rgba(0,40,120,.08);margin-bottom:16px}
  label{display:block;font-weight:600;margin:10px 0 4px} input{width:100%;box-sizing:border-box;padding:10px 12px;font-size:1rem;border:1.5px solid #c9d3e3;border-radius:8px}
  button{margin-top:16px;background:#003FB8;color:#fff;border:0;border-radius:8px;padding:11px 20px;font-size:1rem;font-weight:700;cursor:pointer} button:disabled{opacity:.6}
  .stats{display:flex;gap:12px;flex-wrap:wrap} .st{flex:1;min-width:120px;background:#eef3fc;border-radius:10px;padding:12px;text-align:center}
  .st b{display:block;font-size:1.7rem;color:#003FB8}
  table{width:100%;border-collapse:collapse;margin-top:14px} th,td{text-align:left;padding:9px 6px;border-bottom:1px solid #e3e8f0;vertical-align:top} th{font-size:.85rem;color:#5a6573}
  .ok{color:#1d7a3a;font-weight:700} .wait{color:#b26a00} .cm{font-size:.88rem;color:#5a6573;margin-top:3px}
  .err{color:#c0392b;margin-top:12px} .small{font-size:.85rem;color:#5a6573}
</style></head><body><div class="wrap">
  <h1>Мої лабораторні</h1>
  <p class="sub">Київська МАН · секція «Електроніка та приладобудування»</p>
  <div class="card">
    <label for="em">Email (той самий, що у формі здачі)</label><input id="em" type="email" autocomplete="email">
    <label for="sn">Прізвище</label><input id="sn" autocomplete="family-name">
    <button id="go">Показати</button>
    <div id="err" class="err"></div>
  </div>
  <div id="res"></div>
  <p class="small">Бали з’являються після перевірки роботи викладачем.</p>
</div>
<script>
  const $ = id => document.getElementById(id);
  const el = (tag, cls, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; };
  function show(r) {
    $('go').disabled = false; $('res').innerHTML = '';
    if (r.error) { $('err').textContent = r.error; return; }
    $('err').textContent = '';
    const card = el('div', 'card'), st = el('div', 'stats');
    [[r.submitted + (r.total ? ' з ' + r.total : ''), 'здано'], [r.checked, 'перевірено'], [r.sum, 'балів']].forEach(([v, t]) => { const d = el('div', 'st'); d.append(el('b', '', v), el('span', '', t)); st.append(d); });
    card.append(st);
    const tb = el('table'); const hr = el('tr'); ['Робота', 'Здано', 'Стан'].forEach(h => hr.append(el('th', '', h))); tb.append(hr);
    r.list.forEach(x => {
      const tr = el('tr'); tr.append(el('td', '', x.lab), el('td', '', x.date + (x.tries > 1 ? ' (здач: ' + x.tries + ')' : '')));
      const td = el('td');
      td.append(x.points !== null ? el('span', 'ok', '✓ ' + x.points + ' б.') : el('span', 'wait', 'на перевірці'));
      if (x.comment) td.append(el('div', 'cm', x.comment));
      tr.append(td); tb.append(tr);
    });
    card.append(tb); $('res').append(card);
  }
  $('go').onclick = () => {
    $('go').disabled = true; $('err').textContent = 'Шукаю…';
    google.script.run.withSuccessHandler(show).withFailureHandler(() => show({ error: 'Не вдалося завантажити. Спробуй ще раз.' })).myLabs($('em').value, $('sn').value);
  };
  ['em', 'sn'].forEach(id => $(id).addEventListener('keydown', e => { if (e.key === 'Enter') $('go').click(); }));
</script></body></html>`;
