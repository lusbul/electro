/* Урок 3 за концептом: «Світло за командою».
   Світлодіод (полярність, пряма напруга, струмообмежувальний резистор), Arduino UNO (виводи, 5V/GND, HIGH/LOW),
   структура скетчу (setup/loop), виклик функції й аргумент, #define, int, =, + і *. Цикл for і float — не вводимо.
   Тема 1.3 програми: наприкінці — цифровий вхід: датчик перешкод, digitalRead, активний рівень (без if — він у темі 1.4). */
(function () {
  const VB_ARD = '-60 -30 620 460';

  /* Маленький світлодіод заданого кольору для таблиці */
  const ledIcon = (c, glow = true) => `<svg class="led-ico" viewBox="0 0 40 56" width="28" height="40" aria-hidden="true">
    ${glow ? `<circle cx="20" cy="16" r="17" fill="${c}" opacity=".28"/>` : ''}
    <path d="M15 30 V54 M25 30 V46" stroke="#9aa1a8" stroke-width="3" stroke-linecap="round"/>
    <path d="M10 30 V14 A10 10 0 0 1 30 14 V30 Z" fill="${c}" stroke="rgba(0,0,0,.35)" stroke-width="1.5"/>
    <path d="M8 29 H32 V34 H8 Z" fill="${c}" stroke="rgba(0,0,0,.35)" stroke-width="1.5"/>
    <path d="M14 13 A6 6 0 0 1 20 7" stroke="#fff" stroke-width="2.5" fill="none" stroke-linecap="round" opacity=".8"/></svg>`;

  /* Батарейка → резистор → світлодіод */
  const bat = (R = 470) => ({
    view: 'real', viewBox: '-50 -40 540 270',
    parts: {
      B1: { type: 'battery', value: 9, x: 40, y: 80 },
      R1: { type: 'resistor', value: R, x: 150, y: 10 },
      L1: { type: 'led', color: 'red', x: 300, y: 0 }
    },
    nets: { plus: ['B1.plus', 'R1.1'], mid: ['R1.2', 'L1.A'], minus: ['L1.K', 'B1.minus'] },
    via: { plus: [[70, 30]], minus: [[440, 30], [440, 215], [70, 215]] },
    viaReal: { minus: [[440, 30], [440, 215], [130, 215], [130, 90]] }
  });

  /* Arduino: вивід 9 → резистор 220 Ом → світлодіод → GND */
  const ard = pin => {
    const y = 50 + ['D13', 'D12', 'D11', 'D10', 'D9', 'D8', 'D7', 'D6', 'D5', 'D4', 'D3', 'D2'].indexOf('D' + pin) * 22;
    return {
      view: 'real', viewBox: VB_ARD,
      parts: {
        U1: { type: 'arduino-uno', x: 0, y: 0 },
        R1: { type: 'resistor', value: 220, x: 250, y: y - 20 },
        L1: { type: 'led', color: 'red', x: 400, y: y - 30 }
      },
      nets: { sig: ['U1.D' + pin, 'R1.1'], mid: ['R1.2', 'L1.A'], gnd: ['L1.K', 'U1.GND'] },
      via: { gnd: [[530, y], [530, 405], [-35, 405], [-35, 96]] },
      colors: { sig: '#d93025', gnd: '#222' }
    };
  };

  /* Два світлодіоди: червоний на виводі 9, синій на виводі 10, спільний GND */
  const ard2 = {
    view: 'real', viewBox: VB_ARD,
    parts: {
      U1: { type: 'arduino-uno', x: 0, y: 0 },
      R1: { type: 'resistor', value: 220, x: 250, y: 118 }, L1: { type: 'led', color: 'red', x: 400, y: 108 },
      R2: { type: 'resistor', value: 220, x: 250, y: 20 }, L2: { type: 'led', color: 'blue', x: 400, y: 10 },
      J1: { type: 'junction', x: 530, y: 138 }
    },
    nets: {
      s1: ['U1.D9', 'R1.1'], m1: ['R1.2', 'L1.A'], g1: ['L1.K', 'J1.p'],
      s2: ['U1.D10', 'R2.1'], m2: ['R2.2', 'L2.A'], g2: ['L2.K', 'J1.p'],
      gnd: ['J1.p', 'U1.GND']
    },
    via: { s2: [[225, 116], [225, 40]], g2: [[530, 40]], gnd: [[530, 405], [-35, 405], [-35, 96]] },
    colors: { s1: '#d93025', s2: '#1e63d6', g1: '#222', g2: '#222', gnd: '#222' }
  };

  /* Датчик перешкод (DO → D2) і світлодіод на виводі 9 */
  const sensd = (() => {
    const c = ard(9);
    return {
      ...c, viewBox: '-260 -30 820 460',
      parts: { ...c.parts, S1: { type: 'dsensor', kind: 'obstacle', x: -170, y: 30 } },
      nets: { ...c.nets, gnd: ['L1.K', 'U1.GND2'], v: ['S1.VCC', 'U1.5V'], g: ['S1.GND', 'U1.GND'], d: ['S1.DO', 'U1.D2'] },
      via: { gnd: [[530, 138], [530, 8], [235, 8], [235, 28]], v: [[-25, 50], [-25, 70]], g: [[-35, 75], [-35, 96]], d: [[-50, 400], [235, 400], [235, 292]] },
      colors: { ...c.colors, v: '#d93025', g: '#222', d: '#e07b1a' }
    };
  })();
  const BLINK = (a, b) => `void setup() {
  pinMode(9, OUTPUT);
}

void loop() {
  digitalWrite(9, HIGH);
  delay(${a});
  digitalWrite(9, LOW);
  delay(${b});
}`;

  /* Схема для тренажера: джерело, резистор, світлодіод (вольтметр на ньому), амперметр у колі */
  const ledC = (U, rLabel, Vf, iText) => {
    const Y = 110;
    return {
      circuit: {
        view: 'schematic', viewBox: '0 0 520 320',
        parts: {
          B1: { type: 'battery', value: U, x: 40, y: Y },
          R1: { type: 'resistor', value: 0, label: rLabel, x: 150, y: Y - 20 },
          L1: { type: 'led', color: 'red', x: 310, y: Y - 30 },
          J1: { type: 'junction', x: 290, y: Y }, J2: { type: 'junction', x: 430, y: Y },
          V1: { type: 'multimeter', mode: 'V', x: 310, y: Y - 110 },
          A1: { type: 'multimeter', mode: 'A', x: 230, y: Y + 125 }
        },
        nets: {
          plus: ['B1.plus', 'R1.1'], r: ['R1.2', 'J1.p'], a: ['J1.p', 'L1.A'], k: ['L1.K', 'J2.p'],
          va: ['J1.p', 'V1.1'], vb: ['V1.2', 'J2.p'], ret: ['J2.p', 'A1.2'], back: ['A1.1', 'B1.minus']
        },
        via: { va: [[290, Y - 85]], vb: [[430, Y - 85]], ret: [[470, Y], [470, Y + 150]], back: [[70, Y + 150]] }
      },
      meters: { V1: String(Vf).replace('.', ',') + ' В', A1: iText }
    };
  };

  /* Тренажер 1: резистор для світлодіода */
  const tR = (R, U, Vf, I) => {
    const r = (U - Vf) / (I / 1000);
    return {
      ...ledC(U, '? Ом', Vf, I + ' мА'),
      q: `Джерело <b>${R.num(U)}&nbsp;В</b>, світлодіод з прямою напругою <b>${R.num(Vf)}&nbsp;В</b>, потрібний струм <b>${I}&nbsp;мА</b>. Який опір резистора потрібен?`,
      unit: 'Ом', a: r, tol: 0.02,
      hint: 'Спершу знайди напругу на резисторі: U − U<sub>LED</sub>. Потім R = U / I, струм — в амперах.',
      sol: `<i>U</i><sub>R</sub> = ${R.num(U)} − ${R.num(Vf)} = ${R.num(U - Vf)}&nbsp;В; <i>R</i> = ${R.num(U - Vf)} / ${R.num(I / 1000, 3)} ≈ <b>${R.num(r, 0)}&nbsp;Ом</b>.`
    };
  };
  const tI = (R, U, Vf, Rr) => {
    const I = (U - Vf) / Rr * 1000;
    return {
      ...ledC(U, fmtR(Rr), Vf, '? мА'),
      q: `Джерело <b>${R.num(U)}&nbsp;В</b>, світлодіод <b>${R.num(Vf)}&nbsp;В</b>, резистор <b>${fmtR(Rr)}</b>. Що покаже амперметр?`,
      unit: 'мА', a: I, tol: 0.03,
      hint: 'Напруга на резисторі U − U<sub>LED</sub>, далі закон Ома I = U / R. Переведи в міліампери.',
      sol: `<i>I</i> = (${R.num(U)} − ${R.num(Vf)}) / ${Rr} ≈ ${R.num(I / 1000, 4)}&nbsp;А ≈ <b>${R.num(I, 1)}&nbsp;мА</b>.`
    };
  };

  /* Тренажер 2: що зробить програма */
  const prog = ({ pin, a, on, off, set }) => `#define LED_PIN ${pin}
int pauseMs = ${a};

void setup() {
  pinMode(LED_PIN, OUTPUT);${set != null ? `\n  pauseMs = ${set};` : ''}
}

void loop() {
  digitalWrite(LED_PIN, HIGH);
  delay(${on});
  digitalWrite(LED_PIN, LOW);
  delay(${off});
}`;
  const evalD = (e, p) => Function('pauseMs', `return ${e};`)(p);
  const tP = (R, o, ask) => {
    const p = o.set != null ? o.set : o.a, tOn = evalD(o.on, p), tOff = evalD(o.off, p);
    const show = e => e === 'pauseMs' ? `pauseMs = ${p}` : `${e} = ${e.replace('pauseMs', p)} = ${evalD(e, p)}`;
    const Q = {
      on: ['Скільки мілісекунд світлодіод <b>світиться</b> за один повтор loop()?', tOn, 'мс', `Перший delay: <code>${show(o.on)}</code> → <b>${tOn}&nbsp;мс</b>.`],
      off: ['Скільки мілісекунд світлодіод <b>не світиться</b> за один повтор loop()?', tOff, 'мс', `Другий delay: <code>${show(o.off)}</code> → <b>${tOff}&nbsp;мс</b>.`],
      per: ['Який <b>період</b> блимання (світло + темрява)?', tOn + tOff, 'мс', `Світло <code>${show(o.on)}</code>, темрява <code>${show(o.off)}</code>; ${tOn} + ${tOff} = <b>${tOn + tOff}&nbsp;мс</b>.`],
      pin: ['До якого <b>виводу</b> Arduino підключено світлодіод?', o.pin, '', `LED_PIN підставляється як <b>${o.pin}</b>.`]
    }[ask];
    return {
      q: `<pre class="code-mini">${prog(o).replace(/</g, '&lt;')}</pre>${Q[0]}`,
      unit: Q[2], a: Q[1], tol: 0, abs: 0.01,
      hint: o.set != null ? 'Зверни увагу на setup(): там pauseMs отримує нове значення ще до першого loop().' : '#define підставляє текст, int pauseMs — комірка з числом. Обчисли вирази в дужках delay.',
      sol: (o.set != null ? `Після pauseMs = ${o.set}; у змінній уже ${o.set}. ` : '') + Q[3]
    };
  };

  window.LESSON = {
    id: 'blink',
    number: 3,
    title: 'Світло за командою',
    shareText: 'Урок «Світло за командою» пройдено! Світлодіод блимає за моєю програмою 💡',
    cardLines: ['Світлодіод блимає', 'за моєю програмою!'],

    circuits: { sensd, bat: bat(470), tune: bat(1000), ard: ard(9), ard2 },

    steps: [
      {
        type: 'flip',
        circuit: 'bat', part: 'L1',
        model: 'ledSeries', params: { V: 9, R: 470, Vf: 2 },
        title: 'Світлодіод має «плюс» і «мінус»',
        text: 'Батарейка, резистор і <b>світлодіод</b> (англ. LED). Коло замкнене, світлодіод світиться. Натисни на світлодіод, щоб розвернути його іншим боком.',
        msgs: {
          off: 'Світлодіод погас, хоча коло так само замкнене! Світлодіод пропускає струм лише в одному напрямку: від довшої ніжки (<b>анод</b>, «+») до коротшої (<b>катод</b>, «−»). Натисни ще раз, щоб повернути, як було.',
          on: 'Знову світиться: довга ніжка (анод) — до «+», коротка (катод) — до «−».'
        },
        notes: { title: 'Полярність світлодіода', text: 'Світлодіод пропускає струм лише в одному напрямку: від анода (довша ніжка, «+») до катода (коротша ніжка, «−»). Якщо ввімкнути його навпаки, він не світиться.' }
      },
      {
        type: 'scene',
        title: 'Мова схем: світлодіод',
        blocks: [
          { figure: 'symbols', figureOpts: { items: [
          { name: 'Світлодіод (LED)', part: { type: 'led', color: 'red' } }
        ] } },
          { text: 'На схемі світлодіод — трикутник із рискою: трикутник показує напрямок, у якому йде струм (від анода до катода), а дві стрілочки — що він випромінює світло.' }
        ],
        notes: { title: 'Умовне позначення світлодіода', text: 'Світлодіод — трикутник із рискою і двома стрілочками; трикутник вказує напрямок струму від анода до катода.' }
      },
      {
        type: 'scene',
        title: 'Яку напругу «забирає» світлодіод',
        blocks: [
          { text: `Щоб світлодіод світився, на ньому має бути певна напруга — <b>пряма напруга</b>. Вона залежить від кольору.` },
          { cards: [
          { sym: `${ledIcon('#ff3b30')}`, name: '1,8–2&nbsp;В', unit: 'червоний' },
          { sym: `${ledIcon('#facc15')}`, name: '2&nbsp;В', unit: 'жовтий' },
          { sym: `${ledIcon('#22c55e')}`, name: '2–3&nbsp;В', unit: 'зелений' },
          { sym: `${ledIcon('#3b82f6')}`, name: '3–3,3&nbsp;В', unit: 'синій' },
          { sym: `${ledIcon('#eef3ff')}`, name: '3–3,3&nbsp;В', unit: 'білий' }
        ] },
          { text: `Точне значення пишуть у документації до світлодіода. Решту напруги джерела має «забрати» резистор — згадай другий закон Кірхгофа: напруги на послідовних деталях додаються.` }
        ],
        notes: { title: 'Пряма напруга світлодіода', text: 'Червоний ≈ 1,8–2&nbsp;В, жовтий ≈ 2&nbsp;В, зелений ≈ 2–3&nbsp;В, синій і білий ≈ 3–3,3&nbsp;В (орієнтовно; точно — у документації).' }
      
      },
      {
        type: 'tune',
        circuit: 'tune',
        title: 'Підбери резистор',
        text: 'Батарейка 9&nbsp;В і червоний світлодіод. Змінюй опір резистора й стеж за струмом і яскравістю. Світлодіод має світити яскраво, але не перегріватися: робочий струм — <b>10–20&nbsp;мА</b>.',
        model: 'ledSeries',
        params: { V: 9, Vf: 2 },
        control: { param: 'R', part: 'R1', label: 'Опір резистора', series: 'E', start: 4700 },
        led: 'L1',
        goal: { min: 10, max: 20 },
        messages: {
          dim: 'Світить тьмяно: струм замалий. Зменш опір.',
          ok: 'Чудово! Струм у робочому діапазоні: яскраво й безпечно.',
          hot: 'Обережно: струм завеликий, світлодіод перегрівається. Збільш опір.',
          burnt: 'Світлодіод згорів! Без достатнього опору струм через нього стає дуже великим. Візьми новий і збільш опір.'
        },
        notes: { title: 'Навіщо резистор', text: 'Світлодіод майже не обмежує струм сам. Без резистора струм стає завеликим, і світлодіод згорає. Резистор, увімкнений послідовно, обмежує струм до робочого (зазвичай 10–20&nbsp;мА).' }
      },
      {
        type: 'scene',
        title: 'Як розрахувати резистор',
        blocks: [
          { formula: '<i>R</i> = <span class="frac"><span><i>U</i> − <i>U</i><sub>LED</sub></span><span><i>I</i></span></span>' },
          { examples: [
          {
            given: 'Arduino дає 5&nbsp;В, червоний світлодіод 2&nbsp;В, потрібно 15&nbsp;мА.',
            lines: ['На резисторі: 5&nbsp;В − 2&nbsp;В = 3&nbsp;В', '<i>R</i> = 3&nbsp;В / 0,015&nbsp;А = <b>200&nbsp;Ом</b> → беремо найближчий стандартний <b>220&nbsp;Ом</b>']
          },
          {
            title: 'Приклад 2 · зворотна задача',
            given: 'Джерело 5&nbsp;В, світлодіод 2&nbsp;В, резистор 330&nbsp;Ом. Яка сила струму?',
            lines: ['<i>I</i> = (5&nbsp;В − 2&nbsp;В) / 330&nbsp;Ом ≈ 0,009&nbsp;А ≈ <b>9&nbsp;мА</b> — світитиме, але трохи слабше']
          }
        ] },
          { text: 'Напруга джерела ділиться між світлодіодом і резистором (другий закон Кірхгофа). На резистор припадає <i>U</i> − <i>U</i><sub>LED</sub>, а струм через обидва однаковий, бо вони з’єднані послідовно. Далі — закон Ома. Якщо такого номіналу немає, беремо найближчий <b>більший</b>: струм буде трохи меншим, і це безпечно.' }
        ],
        
      },
      {
        type: 'gen',
        bonus: { key: 'b', need: 20, text: '20 задач на резистор для світлодіода розв’язано! Ось твоя ексклюзивна наліпка!' },
        title: 'Резистор для світлодіода',
        text: 'Розрахуй резистор або струм. Вольтметр показує напругу на світлодіоді, амперметр — струм у колі.',
        need: 3,
        first: [R => tR(R, 5, 2, 15), R => tR(R, 9, 2, 20), R => tI(R, 5, 2, 300)],
        make: R => R.pick([0, 0, 1]) === 0
          ? tR(R, R.pick([5, 9, 12]), R.pick([1.8, 2, 2.2, 3, 3.2]), R.pick([10, 15, 20]))
          : tI(R, R.pick([5, 9]), R.pick([1.8, 2, 3]), R.pick([150, 220, 330, 470, 680, 1000]))
      },
      {
        type: 'scene',
        title: 'Arduino — ключ, яким керує програма',
        blocks: [
          { text: '<p><b>Мікроконтролер</b> — це крихітний «мозок»-комп’ютер, який зчитує інформацію з датчиків і керує лампочками чи моторчиками.</p><p><b>Arduino</b> — це його «супергеройський костюм» із зручними роз’ємами. Його придумали спеціально для того, щоб зробити складну електроніку простою і доступною не лише для суворих інженерів із паяльниками, а й для школярів, студентів та всіх, хто хоче швидко втілити свої креативні ідеї.</p>' },
          { image: 'img/arduino-boards.webp', alt: 'Плати Arduino: Uno, Mega, Nano, Leonardo', wide: true },
          { text: '<p>Плат Arduino є кілька видів — більші, менші, з різною кількістю виводів. Ми працюватимемо з найпоширенішою — <b>Arduino Uno</b>.</p><p>Виводи <b>5V</b> і <b>GND</b> («земля») працюють як «+» і «−» батарейки, де мінус слугує точкою відліку в 0&nbsp;В.</p><p>Програма може керувати напругою на цифрових виводах <b>D0–D13</b>: <br> - <b>HIGH</b> — на виводі 5&nbsp;В,<br> - <b>LOW</b> — 0&nbsp;В.</p>' }
        ],
        notes: { title: 'Arduino, HIGH і LOW', text: 'Мікроконтролер — крихітний «мозок»-комп’ютер, який виконує програму й керує виводами.<br> Для зручної роботи з мікроконтролером була придумана плата Arduino.<br> 5V і GND — як «+» і «−» батарейки; GND — точка 0&nbsp;В. Цифровий вивід (кожен з D0–D13) може бути в одному з двох станів: HIGH (5&nbsp;В) або LOW (0&nbsp;В).<br> На схемі Arduino — прямокутник із підписаними виводами (D2–D13, 5V, GND).' }
      },
      {
        type: 'code',
        circuit: 'ard', view: 'real', pin: 9, led: 'L1', meter: true,
        title: 'Перша команда',
        code: `void setup() {
  pinMode(9, OUTPUT);
  digitalWrite(9, [[sel:HIGH|LOW]]);
}

void loop() {
}`,
        text: 'Це програма для Arduino (її називають <b>скетч</b>).<br>Команди в <code>setup() { … }</code> виконуються <b>один раз</b> після ввімкнення.<br><code>pinMode(9, OUTPUT)</code> робить вивід 9 виходом.<br><code>digitalWrite(9, …)</code> задає на ньому <code>HIGH</code> або <code>LOW</code>.<br>Зміни <code>HIGH</code> на <code>LOW</code> і назад. <p><em>Тут світлодіод через резистор 220&nbsp;Ом підключено до виводу 9 і до GND.<br><b>Натисни «Схема»</b>: на схемах Arduino позначають прямокутником із підписаними виводами.</em></p>',
        goal: res => res.levels[9] === 0 ? { ok: true, msg: 'LOW — на виводі 0&nbsp;В, світлодіод не світиться. HIGH — 5&nbsp;В, світиться. Ось і все керування!' } : false,
        notes: { title: 'Виклик функції', text: '<code>pinMode</code>, <code>digitalWrite</code>, <code>delay</code> — готові <b>функції</b>. Щоб викликати функцію, пишемо її назву, а в круглих дужках — <b>аргументи</b> через кому: <code>digitalWrite(9, HIGH);</code>. Крапка з комою завершує команду. Великі й малі літери різняться.' } 
      },
      {
        type: 'scene',
        title: 'setup() і loop(): що і коли виконується',
        blocks: [
          { figure: 'setuploop' },
          { text: `У кожному скетчі є дві обов’язкові частини — <code>setup()</code> і <code>loop()</code>.<br>
<b><code>setup()</code></b> — виконується <b>один раз</b> одразу після ввімкнення. Тут налаштовують: який вивід — вихід, яке початкове значення.<br>
<b><code>loop()</code></b> — виконується <b>знову і знову</b>, доки Arduino має живлення. Тут те, що треба робити постійно: вмикати, чекати, вимикати.<br>
У попередньому кроці <code>loop()</code> був порожній, тому світлодіод лише раз увімкнувся і так і світив.<br>
А <b>над</b> <code>setup()</code>, на самому початку, пишуть те, що має бути відомо всій програмі, — імена й змінні. Про них поговоримо трохи згодом.
<pre class="code-mini">// на початку: імена й змінні (про них — далі)

void setup() {
  // один раз: налаштування
}

void loop() {
  // знову і знову: робота
}</pre>` }
        ],
        notes: { title: 'setup і loop', text: '<code>setup()</code> виконується один раз після ввімкнення (налаштування), <code>loop()</code> — повторюється безкінечно, доки є живлення (робота).' }
      },
      {
        type: 'code',
        circuit: 'ard', view: 'real', pin: 9, led: 'L1', diagram: true, T: 4000,
        title: 'Blink: світлодіод блимає',
        code: `void setup() {
  pinMode(9, OUTPUT);
}

void loop() {
  digitalWrite(9, HIGH);
  delay([[num:1000]]);
  digitalWrite(9, LOW);
  delay([[num:1000]]);
}`,
        text: 'Тепер команди стоять у <code>loop()</code>, тож повторюються знову і знову.<br><code>delay(1000)</code> — пауза 1000 мілісекунд (1&nbsp;с).<br>Помаранчева смуга показує рядок, який зараз виконується.<br>Зміни числа в delay і подивись, як змінюються блимання й часова діаграма.',
        goal: (res, src) => /delay\((?!1000\))\d+\)/.test(src) ? { ok: true, msg: 'Бачиш? Час світіння й паузи задають числа в delay, а часова діаграма показує це на графіку.' } : false,
        notes: { title: 'setup і loop', text: '<code>setup()</code> виконується один раз після ввімкнення, <code>loop()</code> — повторюється безкінечно. <code>delay(мс)</code> зупиняє програму на задану кількість мілісекунд (1000&nbsp;мс = 1&nbsp;с).' }
      },
      {
        type: 'predict',
        blocks: [
          { text: `<pre class="code-mini">void loop() {
  digitalWrite(9, HIGH);
  delay(300);
  digitalWrite(9, LOW);
  delay(700);
}</pre>` }
        ],
        question: 'Скільки триває один повний цикл блимання (світло + темрява)?',
        options: [
          { text: '1000&nbsp;мс', correct: true, feedback: 'Так: 300&nbsp;мс світиться + 700&nbsp;мс темно = 1000&nbsp;мс. Це <b>період</b> сигналу.' },
          { text: '300&nbsp;мс', feedback: 'Це лише час світіння. Додай ще паузу, коли світлодіод не світиться.' },
          { text: '700&nbsp;мс', feedback: 'Це лише час, коли темно. Період — світло й темрява разом.' }
        ]
      },
      {
        type: 'scene',
        title: 'Імена замість чисел: #define і int',
        blocks: [
          { text: `<div class="two-col">
<div class="col">
<h3>#define — ім’я для числа, яке не змінюється</h3>
<p>Якщо світлодіод перенести на інший вивід, число 9 доведеться виправляти в кількох місцях. Зручніше дати йому <b>ім’я</b>:</p>
<pre class="code-mini">#define LED_PIN 9</pre>
<p>Перед компіляцією всюди, де написано <code>LED_PIN</code>, підставляється текст <code>9</code>. Це не команда, тому <b>без</b> «=» і <b>без</b> крапки з комою. Під час роботи програми змінити його не можна.</p>
${FIGURES.varbox({ only: 'define' })}
<p class="small"><b>Коли використовують:</b> для того, що не змінюється, поки працює програма, — номери виводів, сталі числа. Пишуть на самому початку, перед <code>setup()</code>.</p>
<pre class="code-mini">pinMode(LED_PIN, OUTPUT);
digitalWrite(LED_PIN, HIGH);</pre>
</div>
<div class="col">
<h3>Змінна — значення, яке можна міняти</h3>
<p>А що, як ми хочемо, щоб світлодіод блимав то швидше, то повільніше? Тоді паузу треба змінювати <b>під час роботи</b> програми. Для цього є <b>змінна</b>:</p>
<pre class="code-mini">int pauseMs = 250;</pre>
<p>Це комірка в пам’яті, де зберігається ціле число (<code>int</code> — тип «ціле»). Знак <b>=</b> означає «поклади значення в комірку» (присвоювання), а не «дорівнює».</p>
${FIGURES.varbox({ only: 'int' })}
<p class="small"><b>Коли використовують:</b> для значень, які програма змінює або обчислює, — паузи, лічильники. Оголошують теж на початку, перед <code>setup()</code>, щоб змінну бачили і <code>setup()</code>, і <code>loop()</code>.</p>
<pre class="code-mini">delay(pauseMs);
pauseMs = 500;        // нове значення
delay(2 * pauseMs);   // обчислення</pre>
</div>
</div>
<p class="small">Наліпка й коробка — лише <b>аналогія</b>, але з нею легше запам’ятати різницю.</p>` }
        ],
        notes: { title: '#define і int', text: '<code>#define ІМ’Я значення</code> — підстановка тексту до компіляції, без «=» і без «;». <code>int назва = значення;</code> — оголошення змінної (комірки з цілим числом) з початковим значенням. <code>назва = нове;</code> — присвоювання: значення в комірці змінюється під час роботи. У виразах можна рахувати: <code>delay(2 * pauseMs)</code>.' }
      },
      {
        type: 'predict',
        blocks: [
          { text: `<pre class="code-mini">#define LED_PIN 9
int pauseMs = 250;

void setup() {
  pinMode(LED_PIN, OUTPUT);
  pauseMs = 500;
}

void loop() {
  digitalWrite(LED_PIN, HIGH);
  delay(pauseMs);
  digitalWrite(LED_PIN, LOW);
  delay(pauseMs);
}</pre>` }
        ],
        question: 'Скільки мілісекунд світиться світлодіод у loop()?',
        options: [
          { text: '500&nbsp;мс', correct: true, feedback: 'Так. Спершу в комірці 250, але в setup() рядок <code>pauseMs = 500;</code> кладе туди 500 — ще до першого loop(). А от <code>LED_PIN = 6;</code> написати не вийде: LED_PIN — лише підстановка тексту, а не комірка.' },
          { text: '250&nbsp;мс', feedback: '250 — це початкове значення. Але setup() виконується раніше за loop(), і там у комірку кладуть нове значення.' },
          { text: '750&nbsp;мс', feedback: 'Знак = не додає, а замінює значення в комірці.' }
        ]
      },
      {
        type: 'gen',
        bonus: { key: 'p', need: 20, text: '20 програм прочитано без запуску! Ось твоя ексклюзивна наліпка!' },
        title: 'Що зробить програма?',
        text: 'Прочитай програму й дай відповідь без запуску. Кожного разу програма нова.',
        need: 3,
        first: [
          R => tP(R, { pin: 9, a: 200, on: 'pauseMs', off: 'pauseMs' }, 'on'),
          R => tP(R, { pin: 6, a: 250, on: 'pauseMs', off: '2 * pauseMs' }, 'per'),
          R => tP(R, { pin: 9, a: 300, on: 'pauseMs', off: 'pauseMs', set: 100 }, 'on')
        ],
        make: R => {
          const o = { pin: R.pick([3, 5, 6, 9, 10, 11, 13]), a: R.pick([100, 150, 200, 250, 300, 400, 500]),
            on: R.pick(['pauseMs', '2 * pauseMs', 'pauseMs + 100', '3 * pauseMs']), off: R.pick(['pauseMs', '2 * pauseMs', 'pauseMs + 200', '500']) };
          if (R.pick([0, 0, 1])) o.set = R.pick([50, 100, 150, 600, 1000]);
          return tP(R, o, R.pick(['on', 'off', 'per', 'per', 'pin']));
        }
      },
      {
        type: 'sort',
        circuit: 'ard', view: 'real', pin: 9, led: 'L1', diagram: true, T: 3000,
        title: 'Збери маячок',
        text: 'Перетягни рядки коду в потрібні частини програми так, щоб світлодіод на виводі 9 світився 300&nbsp;мс, а потім 600&nbsp;мс було темно. Порядок рядків у loop() теж важливий.',
        chips: [
          { t: '#define LED_PIN 9', zone: 0 }, { t: 'int pauseMs = 300;', zone: 0 },
          { t: 'pinMode(LED_PIN, OUTPUT);', zone: 1 },
          { t: 'digitalWrite(LED_PIN, HIGH);', zone: 2 }, { t: 'delay(pauseMs);', zone: 2 },
          { t: 'digitalWrite(LED_PIN, LOW);', zone: 2 }, { t: 'delay(2 * pauseMs);', zone: 2 }
        ],
        goal: res => {
          const w = res.events.filter(e => e.kind === 'write' && e.pin === 9);
          return !res.warnings.length && w.length >= 3 && w[0].val === 1 && w[1].val === 0 && w[1].t - w[0].t === 300 && w[2].t - w[1].t === 600;
        },
        hint: 'Програма запускається, але блимає не так. Перевір: спочатку HIGH, потім пауза 300&nbsp;мс, потім LOW і пауза 600&nbsp;мс. А pinMode має виконатися один раз — у setup().'
      },
      {
        type: 'code',
        editable: true,
        circuit: 'ard', view: 'schematic', pin: 9, led: 'L1', diagram: true, T: 4000,
        title: 'Напиши свій маячок',
        code: `#define LED_PIN 9
int pauseMs = 200;

void setup() {
  pinMode(LED_PIN, OUTPUT);
}

void loop() {

}`,
        text: 'Допиши loop(): світлодіод на виводі 9 має світитися <code>pauseMs</code>, а темна пауза має бути <b>довшою</b> — отримай її множенням, наприклад <code>3 * pauseMs</code>. Натисни «Запустити». Якщо є помилка, симулятор підкаже рядок.',
        goal: (res, src) => {
          const w = res.events.filter(e => e.kind === 'write' && e.pin === 9);
          if (res.warnings.length) return { ok: false, msg: 'Майже: подивись на підказку над кодом.' };
          if (w.length < 3) return { ok: false, msg: 'Світлодіод має вмикатися й вимикатися знову і знову: у loop() потрібні digitalWrite HIGH і LOW, кожен з delay.' };
          if (!/\*/.test(src.split('void loop')[1] || '')) return { ok: false, msg: 'Блимає! Тепер зроби темну паузу довшою за допомогою множення «*».' };
          if (!/LED_PIN/.test(src.split('void loop')[1] || '')) return { ok: false, msg: 'Працює, але в loop() використай ім’я LED_PIN замість числа.' };
          const onT = w[1].t - w[0].t, offT = w[2].t - w[1].t;
          if (w[0].val !== 1 || offT <= onT) return { ok: false, msg: 'Темна пауза має бути довшою за світлу.' };
          return { ok: true, msg: `Чудово! Світиться ${onT}&nbsp;мс, темно ${offT}&nbsp;мс, період ${onT + offT}&nbsp;мс. Це твоя перша програма!` };
        }
      },
      {
        type: 'code',
        removable: true,
        circuit: 'ard2', view: 'real', diagram: true, T: 4000,
        leds: [
          { pin: 9, led: 'L1', color: '#d93025', label: 'вивід 9 — червоний', nets: ['s1', 'm1', 'g1', 'gnd'] },
          { pin: 10, led: 'L2', color: '#1e63d6', label: 'вивід 10 — синій', nets: ['s2', 'm2', 'g2', 'gnd'] }
        ],
        title: 'Два світлодіоди по черзі',
        code: `#define RED 9
#define BLUE 10

void setup() {
  pinMode(RED, OUTPUT);
  pinMode(BLUE, OUTPUT);
}

void loop() {
  digitalWrite(RED, HIGH);
  delay(500);
  digitalWrite(RED, LOW);
  delay(300);
  digitalWrite(BLUE, HIGH);
  delay(500);
  digitalWrite(BLUE, LOW);
}`,
        text: 'Тепер світлодіодів два: червоний на виводі 9 і синій на виводі 10. Кожен має власне ім’я через <code>#define</code>.<br>Зараз між червоним і синім є момент, коли не світить жоден — це видно на часовій діаграмі.<br><b>Який рядок треба прибрати, щоб червоний одразу змінювався синім?</b> Натисни на рядок, щоб закреслити його (натисни ще раз — повернеш).',
        goal: res => {
          if (!res.ok) return false;
          const end = Math.min(res.end, 4000);
          if (end < 600) return { ok: false, msg: 'Світлодіоди тепер перемикаються так швидко, що блимання не видно. Поверни цей рядок і спробуй інший.' };
          let both = 0, any9 = 0, any10 = 0;
          for (let t = 1; t < end; t += 10) {
            const a = ArduinoSim.levelAt(res, 9, t), b = ArduinoSim.levelAt(res, 10, t);
            if (!a && !b) both++; if (a) any9++; if (b) any10++;
          }
          if (!any9 || !any10) return { ok: false, msg: 'Тепер один зі світлодіодів не світиться взагалі. Поверни цей рядок.' };
          if (both > 2) return { ok: false, msg: 'Пауза, коли не світить жоден, ще є. Подивись на діаграму: що відбувається одразу після того, як червоний вимикається?' };
          return { ok: true, msg: 'Так! Прибрали <code>delay(300)</code> — паузу, коли обидва світлодіоди вимкнені. Тепер одразу після <code>digitalWrite(RED, LOW)</code> вмикається синій. Команди без delay виконуються за мільйонні частки секунди, тож перемикання миттєве.' };
        },
        notes: { title: 'Кілька виводів', text: 'Кожен вивід керується окремо своїм digitalWrite. Команди без delay виконуються майже миттєво, тож пауза між подіями — лише там, де стоїть delay.' }
      },
      {
        type: 'predict',
        blocks: [
          { text: 'Перевір себе. У програмі з <code>#define LED_PIN 9</code> світлодіод перенесли на вивід 6.' }
        ],
        question: 'Що треба змінити в коді?',
        options: [
          { text: 'Лише рядок #define: LED_PIN 6', correct: true, feedback: 'Так. Усі команди звертаються до LED_PIN, тож досить змінити одне місце. Саме для цього й дають імена.' },
          { text: 'Кожну команду digitalWrite і pinMode', feedback: 'Так довелося б робити, якби всюди стояло число 9. А з іменем досить змінити один рядок.' },
          { text: 'Написати в loop(): LED_PIN = 6;', feedback: 'LED_PIN — підстановка тексту, а не змінна. Присвоїти їй нове значення не можна.' }
        ]
      },
      {
        type: 'scene',
        title: 'Вивід може й слухати',
        blocks: [
          { text: '<p>Досі вивід Arduino лише <b>говорив</b>: давав 5&nbsp;В або 0&nbsp;В.<br>Але вивід може й <b>слухати</b>: дізнаватися, яка напруга на ньому зараз.<br>Таку напругу дають цифрові датчики.</p><p>Модуль датчика має три виводи: <b>VCC</b> (живлення 5&nbsp;В), <b>GND</b> і <b>DO</b> — цифровий вихід.<br>На DO буває лише два рівні: HIGH (≈ 5&nbsp;В) або LOW (≈ 0&nbsp;В).<br>На схемі модуль малюють прямокутником з назвою і цими трьома виводами.<br>Датчик перешкод має інфрачервоний світлодіод і фотоприймач.</p>' },
          { figure: 'obsIntro', figureOpts: { items: [{ name: 'Модуль датчика перешкод', part: { type: 'dsensor', kind: 'obstacle', label: 'Датчик перешкод' } }] } },
          { text: 'Якщо перед датчиком є перешкода, невидиме світло відбивається від неї й потрапляє у фотоприймач.<br>Чорна поверхня поглинає інфрачервоне світло, тож чорну перешкоду датчик може не помітити.' }
        ],
        notes: { title: 'Модуль цифрового датчика', text: 'Виводи: VCC — живлення, GND — земля, DO — цифровий вихід (HIGH або LOW).' }
      },
      {
        type: 'live',
        circuit: 'sensd', view: 'real', pin: 9, led: 'L1', ledNets: ['sig', 'mid', 'gnd'], monitor: false,
        inputs: [{ pin: 2, kind: 'sensor', active: 'low', part: 'S1', label: '✋ Перешкода: є / немає' }],
        title: 'Датчик перешкод',
        code: `#define SENSOR 2
#define LED 9

void setup() {
  pinMode(SENSOR, INPUT);
  pinMode(LED, OUTPUT);
}

void loop() {
  int level = digitalRead(SENSOR);
  digitalWrite(LED, level);
}`,
        text: 'У програмі дві нові речі.<br><code>pinMode(SENSOR, INPUT)</code> — вивід 2 тепер <b>слухає</b>.<br><code>digitalRead(SENSOR)</code> — читає рівень на виводі: HIGH або LOW. Його кладемо в змінну level.<br>А <code>digitalWrite(LED, level)</code> просто <b>передає</b> цей рівень на світлодіод.<br>Постав і прибери перешкоду кнопкою під схемою. Стеж за світлодіодом.',
        goal: (M, ctx) => ctx.seen['1:0'] && ctx.seen['0:1']
          ? { ok: true, msg: 'Дивно: перешкоди немає — світлодіод світить, є перешкода — гасне. Світлодіод чесно повторює рівень на DO. Отже, при перешкоді датчик дає LOW.' } : false,
        notes: { title: 'digitalRead', text: 'pinMode(pin, INPUT) — вивід слухає. digitalRead(pin) повертає рівень на виводі: HIGH або LOW.' }
      },
      {
        type: 'scene',
        title: 'Активний рівень',
        blocks: [
          { text: `<table class="led-table"><tr><th>Перешкода</th><th>Вихід DO</th><th>Світлодіод</th></tr>
<tr><td>немає</td><td>HIGH</td><td>світиться</td></tr><tr><td>є</td><td><b>LOW</b></td><td>не світиться</td></tr></table>
Рівень, який датчик видає, коли подія <b>сталася</b>, називають <b>активним рівнем</b>.<br>У цього датчика перешкод активний рівень — <b>LOW</b>.<br>Це не помилка, а особливість схеми модуля. Його власний світлодіод-індикатор теж світиться саме при перешкоді.<br>В інших модулях активний рівень може бути HIGH.<br>Дізнатися його можна з опису модуля або простим дослідом — як ми щойно.<br>Щоб наш світлодіод світив саме <b>при перешкоді</b>, програма має вміти вирішувати. Цього навчимося в наступному уроці.` }
        ],
        notes: { title: 'Активний рівень', text: 'Активний рівень — рівень на виході датчика, коли подія сталася. У датчика перешкод — LOW. Перевіряють в описі модуля або дослідом.' }
      },
      {
        type: 'predict',
        blocks: [
          { text: 'Датчик лінії стоїть над підлогою. Над білим папером на його виході DO — LOW, над чорною смугою — HIGH.' }
        ],
        question: 'Подія — «під датчиком чорна лінія». Який активний рівень цього датчика?',
        options: [
          { text: 'HIGH', correct: true, feedback: 'Так. Подія (чорна лінія) — і на виході HIGH. Тож з програмою <code>digitalWrite(LED, level)</code> світлодіод світитиме саме над лінією.' },
          { text: 'LOW', feedback: 'LOW буває над білим папером, тобто коли лінії немає. А активний — рівень під час події.' },
          { text: 'Залежить від програми', feedback: 'Активний рівень задає схема модуля, а не програма. Програма лише читає його.' }
        ]
      }
    ],

    skills: [
      'Вмикаю світлодіод правильною полярністю',
      'Розраховую резистор для світлодіода',
      'Знаю, що таке вивід Arduino, 5V, GND, HIGH і LOW',
      'Розумію, що виконується в setup(), а що — в loop()',
      'Керую світлодіодом командами digitalWrite і delay',
      'Розрізняю #define і змінну int, рахую період блимання',
      'Читаю цифровий датчик командою digitalRead і визначаю його активний рівень'
    ],

    practice: {
      intro: 'Збери коло в Tinkercad Circuits: <b>Arduino Uno R3</b>, резистор 220&nbsp;Ом і світлодіод на макетній платі. Відкрий <b>Code → Text</b>.',
      tasks: [
        'Підключи світлодіод через резистор 220&nbsp;Ом до виводу 9 і до GND. Перевір полярність: довга ніжка (анод) — до резистора.',
        'Запусти Blink і зміни паузи: 100&nbsp;мс світла і 900&nbsp;мс темряви. Порахуй період.',
        'Додай <code>#define LED_PIN 9</code> і заміни всі числа 9 на LED_PIN.',
        'Перенеси світлодіод на вивід 6. Зміни лише один рядок коду.',
        'Додай <code>int pauseMs = 250;</code> і використай змінну в delay. Зроби темну паузу втричі довшою множенням.',
        'Додай у setup() рядок <code>pauseMs = 500;</code>. Спрогнозуй, як зміниться блимання, а потім перевір.',
        'Заміни резистор на 1&nbsp;кОм. Розрахуй струм і порівняй яскравість.',
        'Додай другий світлодіод зі своїм резистором на вивід 10. Дай йому ім’я через #define і зроби так, щоб світлодіоди блимали <b>по черзі</b>, як світлофор на переїзді.',
        'Із зірочкою: зроби сигнал SOS (три короткі, три довгі, три короткі спалахи) лише з digitalWrite і delay.',
        'Датчик: у Tinkercad немає модуля датчика перешкод, тому його замінить <b>повзунковий перемикач</b> (Slide Switch). Крайні виводи — до 5V і GND, середній — до D2. Передай рівень з D2 на світлодіод через digitalRead і перевір обидва положення.'
      ]
    },

    next: { id: 'analog' },
    teaser: 'Не запускається програма у Tinkercad? На секції ментор допоможе знайти помилку, а ще ти запрограмуєш справжню Arduino.'
  };
})();
