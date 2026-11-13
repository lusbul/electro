/* Віджет відгуку наприкінці уроку / лабораторної.
   Надсилає відгук скрипту Google Apps Script (адреса — у settings.js, рядок «Скрипт для відгуків»),
   який дописує рядок у Google-таблицю і надсилає лист авторці курсу.
   Не більше 3 відгуків на урок з одного браузера. Якщо адресу скрипта не вказано — віджет не показується. */
window.Feedback = (function () {
  const MAX = 3;
  const FACES = [['😣', 'Дуже складно / не сподобалось'], ['😕', 'Так собі'], ['😐', 'Нормально'], ['🙂', 'Добре'], ['🤩', 'Дуже сподобалось']];
  const url = () => (window.SITE && SITE.links && SITE.links.feedback) || '';
  const key = id => 'electro-feedback-' + id;
  const sent = id => { try { return +localStorage.getItem(key(id)) || 0; } catch (e) { return 0; } };

  function mount(el, info) {
    if (!el || !url()) return;
    const id = info.id, n = sent(id);
    if (n >= MAX) { el.innerHTML = '<div class="fb-box done"><b>Дякуємо за відгуки!</b> Для цього уроку їх уже достатньо 🙂</div>'; return; }
    let rating = 0;
    el.innerHTML = `<div class="fb-box">
      <h3>${info.question || 'Як тобі урок?'}</h3>
      <div class="fb-faces" role="radiogroup">${FACES.map((f, k) => `<button type="button" class="fb-face" data-r="${k + 1}" title="${f[1]}" aria-label="${f[1]}">${f[0]}</button>`).join('')}</div>
      <textarea class="fb-text" rows="3" maxlength="2000" placeholder="Що сподобалось, що було незрозуміло, що покращити? (необов’язково)"></textarea>
      <input class="fb-name" maxlength="100" placeholder="Ім’я (необов’язково)" autocomplete="given-name">
      <div class="fb-row"><button type="button" class="primary fb-send" disabled>Надіслати відгук</button><span class="small fb-msg"></span></div>
    </div>`;
    const btn = el.querySelector('.fb-send'), msg = el.querySelector('.fb-msg');
    el.querySelectorAll('.fb-face').forEach(b => b.onclick = () => {
      rating = +b.dataset.r;
      el.querySelectorAll('.fb-face').forEach(x => x.classList.toggle('on', x === b));
      btn.disabled = false;
    });
    btn.onclick = () => {
      btn.disabled = true; msg.textContent = 'Надсилаю…';
      const body = JSON.stringify({
        lesson: id, title: info.title || '', rating,
        text: el.querySelector('.fb-text').value.trim().slice(0, 2000),
        name: el.querySelector('.fb-name').value.trim().slice(0, 100)
      });
      // no-cors: відповідь скрипта прочитати не можна, але запит доходить і з file://, і з GitHub Pages
      fetch(url(), { method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body })
        .then(() => {
          try { localStorage.setItem(key(id), String(n + 1)); } catch (e) {}
          el.innerHTML = `<div class="fb-box done"><b>Дякуємо!</b> Відгук надіслано 💌${n + 1 < MAX ? ` <button type="button" class="ghost fb-more">Написати ще</button>` : ''}</div>`;
          const more = el.querySelector('.fb-more'); if (more) more.onclick = () => mount(el, info);
        })
        .catch(() => { btn.disabled = false; msg.textContent = 'Не вдалося надіслати — перевір інтернет і спробуй ще раз.'; });
    };
  }
  return { mount };
})();
