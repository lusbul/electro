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
          <img src="${root}img/logo-section.webp" alt="" class="sh-emblem">
          <span class="sh-name"><b>${S.title}</b><small>Київська МАН · секція</small></span>
        </a>
        <nav class="sh-nav" id="sh-nav">
          ${NAV.map(n => `<a href="${n.href}" class="${n.id === active ? 'active' : ''} ${n.accent ? 'accent' : ''}">${n.text}</a>`).join('')}
        </nav>
        <a class="sh-kman" href="${hub}" title="Київська МАН · Відділення інженерії та матеріалознавства"><img src="${root}img/logo-kman.webp" alt="Київська МАН"></a>
        <button class="sh-burger" aria-label="Меню" aria-expanded="false" aria-controls="sh-nav">☰</button>
      </div>
    </header>`;
  }

  function footer() {
    const a = S.author, L = S.links;
    const nick = (a.telegram || '').replace(/^@/, '');
    const ext = (href, text) => `<a href="${href}" target="_blank" rel="noopener">${text}</a>`;
    // Кожен контакт — окремий рядок з емодзі; порожні не показуються
    const contacts = [
      a.org && `<li>🏛️ ${a.orgUrl ? ext(a.orgUrl, a.org) : a.org}</li>`,
      a.phone && `<li>📞 <a href="tel:${a.phone.replace(/[^+\d]/g, '')}">${a.phone}</a></li>`,
      a.email && `<li>✉️ <a href="mailto:${a.email}">${a.email}</a></li>`,
      nick && `<li>💬 ${ext('https://t.me/' + nick, 'Telegram: @' + nick)}</li>`,
      L.joinForm && `<li>👥 ${ext(L.joinForm, 'Долучитися до чату секції')}</li>`,
      L.labChannel && `<li>📣 ${ext(L.labChannel, 'Telegram-канал лабораторії')}</li>`
    ].filter(Boolean).join('');
    return `<footer class="site-footer">
      <div class="sf-row">
        <div class="sf-col">
          <p class="sf-org"><a href="${S.kman.official}" target="_blank" rel="noopener">${S.kman.name} ↗</a><span>${S.kman.department}</span><span>${S.kman.section}</span></p>
        </div>
        <div class="sf-col sf-contacts">
          <h3>Контакти</h3>
          <p class="sf-who">Керівник секції:<br><b>${a.name}</b></p>
          ${contacts ? `<ul>${contacts}</ul>` : ''}
        </div>
      </div>
      <div class="sf-bottom">
        <p class="sf-copy">© ${new Date().getFullYear()} ${a.name}. ${S.license}${S.aiNote ? `<br>${S.aiNote} <a href="${root}about.html#ai">Детальніше</a>` : ''}${S.privacy ? `<br>${S.privacy}` : ''}</p>
      </div>
    </footer>`;
  }

  window.renderSiteChrome = function (active) {
    document.body.insertAdjacentHTML('afterbegin', header(active));
    document.body.insertAdjacentHTML('beforeend', footer());
    const b = document.querySelector('.sh-burger'), nav = document.getElementById('sh-nav');
    b.onclick = () => { const o = nav.classList.toggle('open'); b.setAttribute('aria-expanded', o); };
  };
  window.SITE.signupHref = S.links.signup || root + 'join.html';
})();
