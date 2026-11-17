/* Тема 1.6 програми (урок 6 на сайті; файл neopixel): «NeoPixel: арифметика та цикли».
   Адресний піксель (індекс 0…N−1, канали R, G, B); бібліотека, #include, клас Adafruit_NeoPixel, об’єкт strip, метод;
   підготовка кадру (setPixelColor, clear) і показ (show); ділення int і float, дужки й порядок дій;
   перший for: початок, умова, крок i++; повернення до value / 4. Остача % — у наступному уроці. */
(function () {
  const lnOf = (code, t) => code.split('\n').findIndex(l => l.includes(t)) + 1;   // номер рядка з текстом t (для кроків, де рядки вимикають)
  const strip = (n = 8) => ({
    view: 'real', viewBox: '-50 -40 740 460',
    parts: { U1: { type: 'arduino-uno', x: 0, y: 0 }, S1: { type: 'neopixel', n, x: 300, y: 174 } },
    nets: { p5: ['U1.5V', 'S1.5V'], din: ['U1.D6', 'S1.DIN'], gnd: ['U1.GND', 'S1.GND'] },
    via: { p5: [[-20, 70], [-20, -20], [250, -20], [250, 184]], gnd: [[-30, 96], [-30, 395], [245, 395], [245, 224]] },
    colors: { p5: '#d93025', din: '#2f9e44', gnd: '#222' }
  });
  const HEAD = `#include <Adafruit_NeoPixel.h>
#define PIN 6
#define N 8
Adafruit_NeoPixel strip(N, PIN, NEO_GRB + NEO_KHZ800);
`;
  const lit = ctx => (ctx.lastFrame || []).filter(Boolean).length;
  const FILL = HEAD + `
void setup() {
  strip.begin();
  for (int i = 0; i < N; i++) {
    strip.setPixelColor(i, 0, 0, 255);
  }
  strip.show();
}

void loop() {
}`;   // уся стрічка синя (крок «А без show()?»)

  /* ---------- Тренажер: ділення, дужки, індекси ---------- */
  const tDiv = (R, a, b, fl) => ({ circuit: { ...strip(), view: 'schematic' },
    q: `Що виведе <code>Serial.println(${fl ? a + '.0' : a} / ${b});</code>?`, unit: '', a: fl ? a / b : Math.trunc(a / b), abs: fl ? 0.006 : 0.1,
    hint: fl ? 'Хоча б одне число з крапкою — ділення дробове.' : 'Обидва числа цілі — дробова частина відкидається.',
    sol: fl ? `${a}.0 / ${b} = <b>${(a / b).toFixed(2)}</b>.` : `${a} / ${b} = ${(a / b).toFixed(2)} → дробова частина відкидається → <b>${Math.trunc(a / b)}</b>.` });
  const tStore = (R, a, b) => ({ circuit: { ...strip(), view: 'schematic' },
    q: `<code>float result = ${a} / ${b};</code> Що виведе <code>Serial.println(result);</code>?`, unit: '', a: Math.trunc(a / b), abs: 0.006,
    hint: 'Спочатку обчислюється права частина. Обидва числа цілі.',
    sol: `${a} / ${b} — ціле ділення = ${Math.trunc(a / b)}; у float це ${Math.trunc(a / b)}.00 → <b>${Math.trunc(a / b)}.00</b>. Втрачену частину float не повертає.` });
  const tOrder = (R, a, b, c, par) => ({ circuit: { ...strip(), view: 'schematic' },
    q: `Чому дорівнює <code>${par ? `(${a} + ${b}) * ${c}` : `${a} + ${b} * ${c}`}</code>?`, unit: '', a: par ? (a + b) * c : a + b * c, abs: 0.1,
    hint: 'Спершу дужки, потім * і /, потім + і −.', sol: par ? `(${a + b}) · ${c} = <b>${(a + b) * c}</b>.` : `${b} · ${c} = ${b * c}; ${a} + ${b * c} = <b>${a + b * c}</b>.` });
  const tLast = (R, n) => ({ circuit: { ...strip(n), view: 'schematic' },
    q: `У стрічці <b>${n}</b> пікселів. Який номер (індекс) має <b>останній</b> піксель?`, unit: '', a: n - 1, abs: 0.1,
    hint: 'Нумерація починається з 0.', sol: `Номери 0…${n - 1} → <b>${n - 1}</b>.` });
  const tCount = (R, s0, cond, n) => { const end = cond === '<' ? n : n + 1; const cnt = Math.max(0, end - s0);
    return { circuit: { ...strip(), view: 'schematic' },
      q: `<code>for (int i = ${s0}; i ${cond} ${n}; i++) { … }</code> Скільки разів виконається тіло циклу?`, unit: '', a: cnt, abs: 0.1,
      hint: `i пробігає від ${s0} доти, доки умова істинна.`, sol: `i = ${s0}, …, ${end - 1} → <b>${cnt}</b> разів.` }; };

  window.LESSON = {
    id: 'neopixel',
    number: 6,
    title: 'NeoPixel: арифметика та цикли',
    shareText: 'Урок «NeoPixel: арифметика та цикли» пройдено! Моя стрічка світиться циклом for 🌈',
    cardLines: ['Стрічка світиться', 'циклом for!'],

    circuits: { strip: strip(8) },

    steps: [
      {
        type: 'live',
        circuit: 'strip', strip: 'S1', monitor: false,
        title: 'Вісім вогників — один дріт',
        code: HEAD + `
void setup() {
  strip.begin();
}

void loop() {
  for (int i = 0; i < N; i++) {
    strip.clear();
    strip.setPixelColor(i, 0, 120, 255);
    strip.show();
    delay(150);
  }
}`,
        text: 'Це стрічка з восьми кольорових світлодіодів. Але до Arduino вона під’єднана лише <b>трьома</b> дротами: живлення, «земля» і один сигнальний — <b>DIN</b>.<br>Як по одному дроту керувати вісьмома вогниками окремо? І що це за рядки на початку програми?',
        goal: (M, ctx) => (ctx.frames || 0) >= 9 ? { ok: true, msg: 'Вогник біжить стрічкою. Кожен піксель має свій номер, а команди йдуть по одному дроту одна за одною.' } : false
      },
      {
        type: 'scene',
        title: 'Адресний піксель',
        blocks: [
          { figure: 'symbols', figureOpts: { items: [{ name: 'Адресна стрічка', part: { type: 'neopixel', n: 4 } }] } },
          { text: 'У кожному пікселі стрічки — три світлодіоди (червоний, зелений, синій) і маленька мікросхема-керувальник.<br>Arduino надсилає по дроту DIN послідовність чисел: «піксель 0 — такий колір, піксель 1 — такий…». Кожен піксель бере свою частину, решту передає далі.<br>Тому піксель має <b>адресу — номер</b>. Нумерація, як і в програмуванні, починається з <b>0</b>: у стрічці з 8 пікселів номери 0…7.<br>Колір задають трьома числами 0–255: скільки червоного, зеленого і синього (як у мікшері з лабораторної).<br>Це <b>не ШІМ</b> і не analogWrite: яскравість кожного каналу задає мікросхема всередині пікселя.<br>На схемах стрічку малюють як ряд квадратів-пікселів із номерами. Виводи: 5V, DIN (вхід даних) і GND.' }
        ],
        notes: { title: 'NeoPixel', text: 'Адресні пікселі: номер (індекс) 0…N−1, колір — три канали R, G, B по 0–255. Дані йдуть по одному дроту DIN. Це не analogWrite.' }
      },
      {
        type: 'scene',
        title: 'Бібліотека, клас, об’єкт, метод',
        blocks: [
          { figure: 'classobj' },
          { text: `<pre class="code-mini">#include &lt;Adafruit_NeoPixel.h&gt;                          // ① бібліотека
Adafruit_NeoPixel strip(8, 6, NEO_GRB + NEO_KHZ800);    // ② клас і ③ об’єкт
strip.begin();                                          // ④ метод
strip.setPixelColor(2, 255, 0, 0);
strip.show();</pre>
① <b>Бібліотека</b> — готовий код, який хтось уже написав. <code>#include</code> підключає його до програми. Самі ми не знаємо, як точно передавати біти в стрічку — бібліотека знає.<br>
② <b>Клас</b> <code>Adafruit_NeoPixel</code> — опис того, що вміє будь-яка така стрічка. Аналогія: креслення.<br>
③ <b>Об’єкт</b> <code>strip</code> — конкретна стрічка, зроблена за цим кресленням: 8 пікселів, вивід 6, тип GRB. Аналогія: річ, виготовлена за кресленням.<br>
④ <b>Метод</b> — дія об’єкта, пишуть через крапку: <code>strip.show()</code> — «стрічко, покажи».<br>
У бібліотеці можуть бути й звичайні функції, не лише класи. Власні класи ми поки не пишемо — лише користуємося готовим.` }
        ],
        notes: { title: 'Бібліотека → клас → об’єкт → метод', text: '#include підключає бібліотеку. Клас — опис («креслення»), об’єкт — конкретна річ (strip). Метод — дія через крапку: strip.show().' }
      },
      {
        type: 'live',
        circuit: 'strip', strip: 'S1', monitor: false,
        title: 'Засвіти один піксель',
        code: HEAD + `
void setup() {
  strip.begin();
  strip.setPixelColor([[num:]], [[num:]], [[num:]], [[num:]]);
  strip.show();
}

void loop() {
}`,
        text: 'Засвіти <b>четвертий</b> піксель (якщо рахувати зліва 1, 2, 3, 4) <b>червоним</b>.<br>Впиши числа: <code>strip.setPixelColor(номер, червоний, зелений, синій)</code>. Кожен канал — від 0 до 255.',
        goal: (M, ctx, src) => {
          if (src.includes('…')) return { ok: false, msg: 'Впиши всі чотири числа: номер пікселя і три канали кольору.' };
          const f = ctx.lastFrame || [];
          if (+((src.match(/setPixelColor\((\d+)/) || [])[1] ?? 0) >= 8) return { ok: false, msg: 'Пікселя з номером 8 немає: у стрічці 8 пікселів, номери 0…7. Бібліотека мовчки пропускає такий рядок.' };
          if (f[3] === 0xFF0000) return { ok: true, msg: 'Так! Четвертий за рахунком піксель має номер 3, бо нумерація починається з 0.' };
          if (f[4]) return { ok: false, msg: 'Світиться п’ятий за рахунком. Номери починаються з 0: перший — 0, другий — 1…' };
          return { ok: false, msg: 'Подивись на номери під пікселями і на колір: червоний — це (255, 0, 0).' };
        }
      },
      {
        type: 'predict',
        blocks: [
          { text: `<pre class="code-mini">strip.clear();
strip.setPixelColor(0, 255, 0, 0);
strip.setPixelColor(1, 0, 255, 0);
// strip.show() забули</pre>` }
        ],
        question: 'Що покаже стрічка?',
        options: [
          { text: 'Нічого не зміниться', correct: true, feedback: 'Так. setPixelColor і clear лише <b>готують кадр</b> у пам’яті Arduino. На стрічку він потрапить тільки після <code>strip.show()</code>. Аналогія: малюєш на аркуші — і лише show() показує його глядачам.' },
          { text: 'Піксель 0 червоний, 1 — зелений', feedback: 'Кадр підготовлено, але не показано. Бракує strip.show().' },
          { text: 'Усі пікселі згаснуть', feedback: 'clear() теж лише змінює підготовлений кадр.' }
        ]
      },
      {
        type: 'scene',
        title: 'Особливості ділення чисел',
        blocks: [
          { formula: '5 / 2 = 2 &nbsp;&nbsp;&nbsp; 5.0 / 2 = 2.5' },
          { examples: [
          { given: '<code>int half = 255 / 2;</code>', lines: ['255 / 2 = 127,5 → ціле ділення → <b>127</b>'] },
          { title: 'Приклад 2 · пастка', given: '<code>float result = 5 / 2;</code>', lines: ['Спершу права частина: 5 / 2 = 2 (обидва цілі)', 'Потім 2 кладеться у float → <b>2.00</b>, а не 2.5'] }
        ] },
          { text: 'Якщо обидва числа цілі (<code>int</code>), Arduino ділить <b>націло</b>: дробова частина просто відкидається, без округлення. 7 / 2 = 3, 9 / 10 = 0.<br>Якщо хоча б одне число дробове (з крапкою, тип <code>float</code>), ділення дробове: 5.0 / 2 = 2.5.<br>Присвоювання спочатку обчислює праву частину, а вже потім кладе результат у змінну. Тому <code>float result = 5 / 2;</code> зберігає 2.0 — втрачене вже не повернути.<br><i>Примітка.</i> Порядок дій — як у математиці: спершу дужки, потім * і /, потім + і −.' }
        ],
        notes: { title: 'int і float', text: 'int / int — ціле ділення (дробова частина відкидається): 5 / 2 = 2. 5.0 / 2 = 2.5. float result = 5 / 2; → 2.00. Порядок: дужки, * /, + −.' }
      },
      {
        type: 'live',
        title: 'Перевір у Serial Monitor',
        code: `void setup() {
  Serial.begin(9600);
  Serial.println(5 / 2);
  Serial.println(5.0 / 2);
  float result = 5 / 2;
  Serial.println(result);
  Serial.println(2 + 3 * 4);
  Serial.println((2 + 3) * 4);
  Serial.println([[sel:…|7 / 2|7.0 / 2|7 / 2.0]]);
}

void loop() {
}`,
        text: 'Програма виводить кілька обчислень. Порівняй кожен рядок монітора з рядком коду.<br>В останньому рядку обери варіант, щоб отримати <b>3.50</b>.',
        goal: (M, ctx, src) => {
          if (src.includes('…')) return { ok: false, msg: 'Обери варіант в останньому рядку.' };
          return src.includes('7 / 2)') ? { ok: false, msg: '7 / 2 — обидва цілі, тому 3. Як зробити ділення дробовим?' }
            : { ok: true, msg: 'Так: достатньо, щоб хоча б одне число було дробовим — 7.0 / 2 і 7 / 2.0 дають 3.50. А 5 / 2 = 2, і 2 + 3 · 4 = 14, але (2 + 3) · 4 = 20.' };
        }
      },
      {
        type: 'live',
        circuit: 'strip', strip: 'S1', monitor: false,
        title: 'Ділення на стрічці',
        code: HEAD + `
void setup() {
  strip.begin();
  strip.setPixelColor(N / [[num:]], 255, 0, 0);
  strip.show();
}

void loop() {
}`,
        text: 'Номер пікселя тут обчислює ділення: <code>N / дільник</code>, а N = 8.<br>Знайди <b>два різні</b> дільники, з якими засвітиться піксель з номером <b>2</b>. Пробуй по черзі.',
        goal: (() => { const divs = new Set(); return (M, ctx, src) => {   // знайдені дільники пам’ятаємо між запусками
          if (src.includes('…')) return { ok: false, msg: 'Впиши дільник.' };
          const d = +((src.match(/N \/ (\d+)/) || [])[1]);
          if (d === 0) return { ok: false, msg: 'На нуль ділити не можна — результат не визначений.' };
          const k = Math.floor(8 / d);
          if (k !== 2) return { ok: false, msg: `8 / ${d} = ${k} — засвітився піксель ${k}${k > 7 ? ', а такого немає' : ''}. Потрібен номер 2.` };
          divs.add(d);
          if (divs.size < 2) return { ok: false, msg: `Так, 8 / ${d} = 2. А тепер знайди інший дільник, який теж дасть 2.` };
          return { ok: true, msg: 'Обидва підходять: 8 / 3 = 2 і 8 / 4 = 2. Ціле ділення відкидає дробову частину (8 / 3 = 2,66… → 2), тому різні дільники можуть дати однаковий номер.' };
        }; })()
      },
      {
        type: 'scene',
        title: 'Цикл for',
        blocks: [
          { text: `Щоб засвітити всю стрічку, довелося б писати 8 однакових рядків:<pre class="code-mini">strip.setPixelColor(0, 0, 0, 255);
strip.setPixelColor(1, 0, 0, 255);
… ще 6 рядків …</pre>Цикл <b>for</b> робить те саме одним записом:<pre class="code-mini">for (int i = 0; i &lt; N; i++) {
  strip.setPixelColor(i, 0, 0, 255);
}
strip.show();</pre>
У дужках — три частини через «;»:<br>① <b>початок</b> <code>int i = 0</code> — лічильник створюється й отримує 0;<br>② <b>умова</b> <code>i &lt; N</code> — поки вона істинна, тіло циклу виконується;<br>③ <b>крок</b> <code>i++</code> — після кожного проходу i збільшується на 1. Це те саме, що <code>i = i + 1</code>.<br>Лічильник <code>i</code> існує <b>лише всередині</b> циклу.<br>Не плутай: <b>loop()</b> повторюється безкінечно, а <b>for</b> — рівно стільки разів, скільки дозволяє умова.` }
        ],
        notes: { title: 'for', text: 'for (початок; умова; крок) { … }. i++ — те саме, що i = i + 1. Лічильник живе лише всередині циклу. loop() — безкінечно, for — поки умова істинна.' }
      },
      {
        type: 'live',
        circuit: 'strip', strip: 'S1', monitor: false,
        title: 'Засвіти всю стрічку',
        code: HEAD + `
void setup() {
  strip.begin();
  strip.clear();
  for (int i = [[sel:…|0|1]]; i [[sel:…|< N|<= N|< N - 1]]; i++) {
    strip.setPixelColor(i, 0, 0, 255);
  }
  strip.show();
}

void loop() {
}`,
        text: 'Обери початок і умову так, щоб засвітились <b>усі вісім</b> пікселів і програма не зверталась до неіснуючого пікселя.',
        goal: (M, ctx, src) => {
          if (src.includes('…')) return { ok: false, msg: 'Обери початок і умову.' };
          const n = lit(ctx);
          if (M.warnings.some(w => /не існує/.test(w.msg))) return { ok: false, msg: '«<= N» доходить до i = 8, а пікселя 8 немає. Останній номер — N − 1.' };
          if (n === 8) return { ok: true, msg: 'Уся стрічка світиться: i пробігає 0, 1, …, 7 — рівно 8 разів.' };
          return { ok: false, msg: `Світиться ${n} з 8. Перевір перший номер (з якого починається нумерація?) і останній.` };
        }
      },
      {
        type: 'live',
        circuit: 'strip', strip: 'S1', monitor: false,
        removable: true,
        title: 'А без show()?',
        code: FILL,
        text: 'Клацни по рядку коду — він вимкнеться (стане закресленим), і програма запрацює без нього. Ще клацання — рядок повернеться.<br>Вимкни рядок <code>strip.show();</code>. Що стало зі стрічкою? А якщо замість нього вимкнути <code>strip.setPixelColor…</code>?',
        goal: (M, ctx) => !ctx.off.includes(lnOf(FILL, 'strip.show()'))
          ? { ok: false, msg: 'Вимкни рядок <code>strip.show();</code> — клацни по ньому.' }
          : { ok: true, msg: 'Стрічка темна, хоча цикл виконався й «розфарбував» усі пікселі. setPixelColor лише записує колір у пам’ять Arduino, а show() відправляє ці кольори в стрічку одним пакетом.' }
      },
      {
        type: 'live',
        circuit: 'strip', strip: 'S1', monitor: false,
        title: 'Де стоїть show()?',
        code: HEAD + `
void setup() {
  strip.begin();
}

void loop() {
  strip.clear();
  strip.show();
  delay(300);
  for (int i = 0; i < N; i++) {
    strip.setPixelColor(i, 255, 120, 0);
    [[sel:…|strip.show(); delay(100);|// show() після циклу]]
  }
  strip.show();
  delay(600);
}`,
        text: 'Порівняй два варіанти. У першому <code>show()</code> і пауза — <b>всередині</b> циклу: кадр показується після кожного нового пікселя. У другому кадр готується повністю, а показується один раз — після циклу.',
        goal: (M, ctx, src) => !src.includes('…') && (ctx.frames || 0) >= 4
          ? { ok: true, msg: src.includes('strip.show(); delay(100)') ? 'Show всередині циклу — стрічка заповнюється поступово, піксель за пікселем. Спробуй і другий варіант.' : 'Show після циклу — уся стрічка спалахує одночасно: кадр готувався «за кадром». Спробуй і перший варіант.' } : false
      },
      {
        type: 'gen',
        bonus: { key: 'b', need: 20, text: '20 задач про ділення й цикли розв’язано! Ось твоя ексклюзивна наліпка!' },
        title: 'Ділення, дужки, індекси',
        text: 'Обчисли результат так, як його обчислить Arduino.',
        need: 3,
        first: [R => tDiv(R, 5, 2, false), R => tStore(R, 7, 2), R => tLast(R, 8)],
        make: R => {
          const k = R.pick(['div', 'div', 'store', 'order', 'last', 'count']);
          if (k === 'div') return tDiv(R, R.int(3, 25), R.pick([2, 3, 4, 5, 8]), R.pick([true, false]));
          if (k === 'store') return tStore(R, R.int(3, 25), R.pick([2, 3, 4]));
          if (k === 'order') return tOrder(R, R.int(1, 9), R.int(1, 9), R.int(2, 6), R.pick([true, false]));
          if (k === 'last') return tLast(R, R.pick([4, 6, 8, 10, 12, 16, 20, 24]));
          return tCount(R, R.pick([0, 0, 1, 2]), R.pick(['<', '<=']), R.pick([4, 5, 8, 10]));
        }
      },
      {
        type: 'scene',
        title: 'Повернемось до value / 4',
        blocks: [
          { formula: 'brightness = value / 4' },
          { examples: [
          { given: 'value = 1023', lines: ['1023 / 4 = 255,75 → ціле ділення → <b>255</b> — якраз максимум analogWrite'] },
          { title: 'Приклад 2', given: 'value = 2', lines: ['2 / 4 = 0,5 → <b>0</b>: дуже маленькі значення стають нулем'] },
          { title: 'Приклад 3 · переповнення', wide: true, given: '<code>int b = value * 255 / 1023;</code> &nbsp; value = 1023', lines: ['Спершу множення: 1023 · 255 = 260 865. Але <code>int</code> вміщає лише числа від −32 768 до 32 767.', 'Зайве «перекручується по колу»: 260 865 − 4 · 65 536 = <b>−1 279</b>. Аналогія: лічильник кілометрів після 99 999 показує 00 000.', 'Далі −1 279 / 1023 = <b>−1</b>. Замість 255 отримали −1!'] },
          { title: 'Приклад 4 · спершу ділення', wide: true, given: '<code>int b = value / 1023 * 255;</code> &nbsp; value = 700', lines: ['Тепер ділимо першими: 700 / 1023 = 0,68 → ціле ділення → <b>0</b>.', 'Далі 0 · 255 = <b>0</b>. Для будь-якого value від 0 до 1022 результат 0, і лише при 1023 буде 255.', 'Яскравість лише «вимкнено» або «на повну», без проміжних. Тому й пишемо <code>value / 4</code>: одна дія — ні переповнення, ні нуля.'] }
        ] },
          { text: 'Тепер зрозуміло готове правило з уроку 4. АЦП дає 0–1023, а analogWrite приймає 0–255. 1024 / 256 = 4 — тому ділимо на 4.<br>Ділення цілочисельне, тож результат завжди ціле число в межах 0–255 — і жодного переповнення.<br>А <code>value * 255 / 1023</code> дав би точніший результат, але 1023 · 255 = 260 865 — це більше за найбільше <code>int</code> (32 767). Тому порядок дій і тип змінних важливі.' }
        ],
        
      },
      {
        type: 'predict',
        blocks: [
          { text: 'Перевір себе. N = 8.' },
          { code: 'for (int i = 1; i <= N; i++) {\n  strip.setPixelColor(i, 0, 255, 0);\n}\nstrip.show();' }
        ],
        question: 'Що покаже стрічка?',
        options: [
          { text: 'Пікселі 1…7 зелені, піксель 0 не горить', correct: true, feedback: 'Так. i починається з 1 — піксель 0 пропущено. А на i = 8 команда звертається до неіснуючого пікселя: бібліотека мовчки пропускає її. Правильно: for (int i = 0; i < N; i++).' },
          { text: 'Усі 8 зелені', feedback: 'Подивись, з якого числа починається i.' },
          { text: 'Програма зупиниться з помилкою', feedback: 'Справжня бібліотека не зупиняє програму — вона мовчки пропускає неіснуючий піксель. Тому такі помилки треба шукати самому.' }
        ]
      }
    ],

    skills: [
      'Пояснюю адресний піксель: номер 0…N−1 і три канали кольору',
      'Розрізняю бібліотеку, клас, об’єкт і метод на прикладі strip.show()',
      'Розумію різницю між підготовкою кадру (setPixelColor, clear) і показом (show)',
      'Передбачаю результат ділення int і float та порядок дій з дужками',
      'Пишу цикл for з правильними межами і розрізняю for і loop()',
      'Пояснюю правило value / 4 для перетворення АЦП у ШІМ'
    ],

    practice: {
      intro: 'Збери в Tinkercad Circuits: Arduino Uno R3 і стрічку «NeoPixel Strip 8» (у Tinkercad є готові стрічки на 4, 6, 8, 10, 12, 16 і 20 пікселів та кільця на 12, 16 і 24). DIN — до виводу 6, живлення 5V і GND.',
      tasks: [
        'Спершу передбач, потім перевір у Serial Monitor: 9 / 4, 9.0 / 4, float x = 9 / 4, (1 + 2) * 3, 1 + 2 * 3.',
        'Засвіти всю стрічку одним кольором циклом for. Запиши перший і останній індекс.',
        'Зміни крок на i = i + 2 — засвітиться кожен другий піксель. Які номери?',
        'Почни з i = 1 і передбач, які пікселі засвітяться.',
        'Зроби «біжучий вогник»: show і delay всередині циклу.',
        'Поясни правило brightness = value / 4 з уроку 4 і чому результат не перевищує 255.',
        'Із зірочкою: зроби «заповнення» стрічки і потім гасіння у зворотному напрямку.'
      ]
    },

    next: { id: 'sound' },
    teaser: 'Наступного разу: зумер, мелодії з масивів і загадкова остача від ділення %.'
  };
})();
