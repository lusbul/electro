/* =====================================================================
   Значення за замовчуванням. ЗМІНЮВАТИ ЇХ ТРЕБА У ФАЙЛІ settings.js
   (у корені сайту) — він перекриває все, що нижче.
   ===================================================================== */
window.SITE = {
  title: 'Електроніка та приладобудування',
  url: 'https://lusbul.github.io/electro/',          // адреса опублікованого сайту

  kman: {
    name: 'КПЗО «Київська мала академія наук»',
    department: 'Відділення інженерії та матеріалознавства',
    section: 'Секція «Електроніка та приладобудування»',
    hub: '/kman/',                                     // сторінка відділення в межах lusbul.github.io
    hubAbsolute: 'https://lusbul.github.io/kman/',     // те саме — для перегляду з диска
    official: 'https://kman.kyiv.ua/'
  },

  author: {
    name: 'Шевлякова Ганна Вікторівна',
    role: 'керівниця секції «Електроніка та приладобудування» Київської МАН',
    position: 'старша викладачка кафедри електронної інженерії, мікро- та біомедичної електроніки',
    org: 'Факультет електроніки КПІ ім. Ігоря Сікорського',
    orgUrl: 'https://fel.kpi.ua/',
    phone: '',                                         // TODO: '+380 XX XXX XX XX'
    email: '',                                         // TODO
    telegram: ''                                       // TODO: нік без @
  },

  links: {
    joinForm: '',          // TODO: Google-форма «долучитися до Telegram-чату секції»
    labChannel: '',        // TODO: Telegram-канал лабораторії
    signup: '',            // TODO: запис на секцію (форма КМАН), якщо відрізняється
    labForm: '',           // Google-форма для здачі лабораторних (одна на всі)
    feedback: ''           // вебзастосунок Apps Script для відгуків
  },

  license: 'Матеріали курсу: CC BY-NC-ND 4.0',
  privacy: 'Сайт не використовує cookies: прогрес і ім’я зберігаються лише у вашому браузері. Передаються тільки відгуки, які ви надсилаєте самі.',
  aiNote: 'Під час створення матеріалів використано інструменти штучного інтелекту; зміст перевірено й відредаговано авторкою.'
};

/* ---------------- Дані з settings.js (текст «Назва: значення») ---------------- */
(function () {
  if (!window.SETTINGS) return;
  const S = window.SITE, kv = {};
  window.SETTINGS.split('\n').forEach(line => {
    const t = line.trim(); if (!t || t[0] === '#') return;
    const i = t.indexOf(':'); if (i < 0) return;
    kv[t.slice(0, i).trim()] = t.slice(i + 1).trim();
  });
  const set = (key, obj, field) => { if (key in kv) obj[field] = kv[key]; };
  set('Керівник секції', S.author, 'name');
  set('Роль у МАН', S.author, 'role');
  set('Посада', S.author, 'position');
  set('Основне місце роботи', S.author, 'org');
  set('Посилання на місце роботи', S.author, 'orgUrl');
  set('Телефон', S.author, 'phone');
  set('Email', S.author, 'email');
  set('Telegram', S.author, 'telegram');
  set('Google-форма для чату секції', S.links, 'joinForm');
  set('Запис на секцію', S.links, 'signup');
  set('Telegram-канал лабораторії', S.links, 'labChannel');
  set('Google-форма для здачі лабораторних', S.links, 'labForm');
  set('Скрипт для відгуків', S.links, 'feedback');
  set('Адреса сайту секції (для поширення наліпок)', S, 'url');
  // Сайт з усіма секціями: на тому ж домені посилання стає відносним (/kman/), інакше — повна адреса
  const hubUrl = kv['Головна сторінка сайту з усіма секціями'];
  if (hubUrl) {
    S.kman.hubAbsolute = hubUrl;
    try { const u = new URL(hubUrl); S.kman.hub = u.hostname === location.hostname ? u.pathname : hubUrl; } catch (e) { S.kman.hub = hubUrl; }
  }
})();

/* ---------------- Шапка, навігація, футер ---------------- */
(function () {
  const S = window.SITE;
  const local = location.protocol === 'file:' || !/lusbul\.github\.io$/.test(location.hostname);
  const hub = local ? S.kman.hubAbsolute : S.kman.hub;
  // Шлях до кореня сайту (сторінки можуть лежати в підпапках)
  const root = document.currentScript.src.replace(/js\/site\.js.*$/, '');

  const NAV = [
    { id: 'lessons', text: 'Уроки', href: root + 'index.html' },
    { id: 'achievements', text: 'Досягнення', href: root + 'achievements.html' },
    { id: 'about', text: 'Про автора курсу', href: root + 'about.html' },
    { id: 'join', text: 'Хочу більше', href: root + 'join.html', accent: true }
  ];

  function header(active) {
    return `<header class="site-header">
      <div class="sh-row">
        <a class="sh-brand" href="${root}index.html" title="До переліку уроків">
          <img src="${root}img/logo-section.svg" alt="" class="sh-emblem">
          <span class="sh-name"><b>${S.title}</b><small>Київська МАН · секція</small></span>
        </a>
        <nav class="sh-nav" id="sh-nav">
          ${NAV.map(n => `<a href="${n.href}" class="${n.id === active ? 'active' : ''} ${n.accent ? 'accent' : ''}">${n.text}</a>`).join('')}
        </nav>
        <a class="sh-kman" href="${hub}" title="Перейти до всіх курсів відділення"><img src="${root}img/logo-department.webp" alt="Відділення інженерії та матеріалознавства Київської МАН"><span class="sh-tip">Перейти до всіх курсів відділення</span></a>
        <button class="sh-burger" aria-label="Меню" aria-expanded="false" aria-controls="sh-nav">☰</button>
      </div>
    </header>`;
  }

  /* Футер: ліворуч — заклад і відділення, по центру — емблема КМАН, праворуч — сторінки про курс і ресурс.
     Контакти авторки — на сторінці «Про автора курсу», чат і канал — у «Хочу більше», умови й приватність — у «Про ресурс». */
  function footer() {
    return `<footer class="site-footer">
      <div class="sf-row">
        <div class="sf-col">
          <p class="sf-org"><a href="${S.kman.official}" target="_blank" rel="noopener">${S.kman.name} ↗</a><span>${S.kman.department}</span><span>${S.kman.section}</span></p>
          <a class="sf-hub" href="${hub}">Усі курси відділення →</a>
        </div>
        <a class="sf-emblem" href="${S.kman.official}" target="_blank" rel="noopener" title="Київська мала академія наук"><img src="${root}img/logo-kman-b.webp" alt="Київська мала академія наук"></a>
        <div class="sf-col sf-links">
          <h3>Про курс</h3>
          <ul>
            <li><a href="${root}about.html">Про автора курсу</a></li>
            <li><a href="${root}join.html">Хочу більше: секція, чат, канал лабораторії</a></li>
            <li><a href="${root}resource.html">Про ресурс: умови використання, прогрес, сервіси</a></li>
          </ul>
        </div>
      </div>
      <div class="sf-bottom">
        <p class="sf-copy">© ${new Date().getFullYear()} ${S.author.name}. <a href="${root}resource.html#res-license">${S.license}</a></p>
      </div>
    </footer>`;
  }

  /* Сторінки уроків і лабораторних: компактний футер + навчальна навігація між уроками */
  const shortName = n => { const p = (n || '').split(/\s+/); return p.length >= 2 ? p[1] + ' ' + p[0] : n; };   // «Шевлякова Ганна …» → «Ганна Шевлякова»
  function footerCompact() {
    return `<nav class="course-nav" aria-label="Навігація між уроками"></nav>
    <footer class="site-footer sf-compact">
      <p><a href="${S.kman.official}" target="_blank" rel="noopener">Київська МАН</a> · ${S.kman.department} · <a href="${hub}">Усі курси відділення</a></p>
      <p>${S.title} © ${new Date().getFullYear()} ${shortName(S.author.name)} · <a href="${root}resource.html">Про ресурс</a></p>
    </footer>`;
  }
  /* Попередній / наступний пункт курсу (уроки й лабораторні в порядку переліку) */
  function fillCourseNav() {
    const nav = document.querySelector('.course-nav'); if (!nav || !window.COURSE) return;
    const items = [];
    window.COURSE.forEach(m => { m.lessons.forEach(l => items.push({ id: l.id, href: `${root}lesson.html?l=${l.id}`, t: `${l.n === 0 ? 'Вступ' : 'Урок ' + l.n}. ${l.title}`, ready: l.ready }));
      if (m.lab) items.push({ id: m.lab.id || 'lab' + m.lab.n, href: `${root}lab.html?l=${m.lab.id}`, t: `Лабораторна ${m.lab.n}. ${m.lab.title}`, ready: m.lab.ready }); });
    const cur = (new URLSearchParams(location.search).get('l') || '').replace(/[^a-z0-9_-]/gi, '');
    const k = items.findIndex(x => x.id === cur);
    const link = (x, dir) => !x ? '<span></span>' : x.ready
      ? `<a class="cn-${dir}" href="${x.href}"><small>${dir === 'prev' ? '← Попередній' : 'Наступний →'}</small><b>${x.t}</b></a>`
      : `<span class="cn-${dir} off"><small>${dir === 'prev' ? '← Попередній' : 'Наступний →'}</small><b>${x.t}</b><i>готується</i></span>`;
    nav.innerHTML = `<div class="cn-row">${link(k > 0 ? items[k - 1] : null, 'prev')}<a class="cn-list" href="${root}index.html">☰ До переліку уроків</a>${link(k >= 0 ? items[k + 1] : null, 'next')}</div>`;
  }

  window.renderSiteChrome = function (active) {
    const compact = /(lesson|lab)\.html$/.test(location.pathname);
    document.body.insertAdjacentHTML('afterbegin', header(active));
    document.body.insertAdjacentHTML('beforeend', compact ? footerCompact() : footer());
    if (compact) window.addEventListener('load', fillCourseNav);
    const b = document.querySelector('.sh-burger'), nav = document.getElementById('sh-nav');
    b.onclick = () => { const o = nav.classList.toggle('open'); b.setAttribute('aria-expanded', o); };
  };
  window.SITE.signupHref = S.links.signup || root + 'join.html';
})();
