/* Тема 1.8 програми (урок 8 на сайті; файл seg7): «Семисегментний індикатор. Власні функції».
   Будова індикатора зі спільним катодом (7 світлодіодів, резистор на кожен сегмент); власна функція: опис, виклик,
   параметр, область видимості; кнопковий лічильник (подія = перехід «відпущено → натиснуто»);
   неблокувальні інтервали: millis() − last ≥ інтервал замість delay(). return — у темі 2.1. */
(function () {
  const lnOf = (code, t) => code.split('\n').findIndex(l => l.includes(t)) + 1;   // номер рядка з текстом t (для кроків, де рядки вимикають)
  const BLOCK = `int notes[] = {262, 330, 392, 523};
int index = 0;

void setup() {
  pinMode(2, INPUT_PULLUP);
  pinMode(13, OUTPUT);
}

void loop() {
  if (digitalRead(2) == LOW) {
    digitalWrite(13, HIGH);
  } else {
    digitalWrite(13, LOW);
  }
  tone(8, notes[index], 400);
  delay(500);
  index = (index + 1) % 4;
}`;   // «Кнопка не слухається» і «Може, просто прибрати delay?»
  const ORDER = ['g', 'f', 'e', 'd', 'c', 'b', 'a'];                   // зверху вниз, як виводи D8…D2
  const PIN = { a: 2, b: 3, c: 4, d: 5, e: 6, f: 7, g: 8 };
  const DIG = ['1111110', '0110000', '1101101', '1111001', '0110011', '1011011', '1011111', '1110000', '1111111', '1111011'];
  const segNets = Object.fromEntries(ORDER.flatMap((n, k) => [['w' + k, ['U1.D' + PIN[n], 'RB.i' + k]], ['s' + k, ['RB.o' + k, 'D1.' + n]]]));
  const segColors = Object.fromEntries(ORDER.flatMap((n, k) => [['w' + k, '#e07b1a'], ['s' + k, '#e07b1a']]));
  /* Arduino D2…D8 → 7 резисторів → сегменти a…g; спільний катод — до GND */
  const seg = {
    view: 'real', viewBox: '-50 -40 600 460',
    parts: { U1: { type: 'arduino-uno', x: 0, y: 0 }, RB: { type: 'rbank', n: 7, x: 240, y: 160 }, D1: { type: 'seg7', x: 340, y: 140 } },
    nets: { ...segNets, com: ['D1.COM', 'U1.GND2'] },
    via: { com: [[420, 8], [215, 8], [215, 28]] },
    colors: { ...segColors, com: '#222' }
  };
  /* + кнопка на D12 до GND */
  const segb = {
    ...seg,
    parts: { ...seg.parts, B1: { type: 'button', label: 'кнопка', x: 240, y: 54 } },
    nets: { ...seg.nets, bin: ['U1.D12', 'B1.1'], bg: ['B1.2', 'U1.GND2'] },
    via: { ...seg.via, bg: [[370, 94], [370, 8], [215, 8], [215, 28]] },
    viaReal: { bin: [[255, 94], [255, 135], [276, 135]], bg: [[304, 135], [370, 135], [370, 8], [215, 8], [215, 28]] },
    colors: { ...seg.colors, bin: '#7048e8', bg: '#222' }
  };
  /* Зумер на D8, кнопка на D2, світлодіод на D13 */
  const mel = {
    view: 'real', viewBox: '-50 -40 600 450',
    parts: { U1: { type: 'arduino-uno', x: 0, y: 0 }, Z1: { type: 'buzzer', x: 260, y: 120 }, B1: { type: 'button', x: 240, y: 252 },
      R1: { type: 'resistor', value: 220, x: 240, y: 30 }, L1: { type: 'led', color: 'green', x: 370, y: 20 } },
    nets: { s: ['U1.D8', 'Z1.+'], zg: ['Z1.-', 'U1.GND2'], in: ['U1.D2', 'B1.1'], bg: ['B1.2', 'U1.GND'], sig: ['U1.D13', 'R1.1'], mid: ['R1.2', 'L1.A'], lk: ['L1.K', 'U1.GND2'] },
    via: { s: [[230, 160], [230, 180]], zg: [[400, 180], [400, 8], [220, 8], [220, 28]], bg: [[370, 292], [370, 395], [-25, 395], [-25, 96]], lk: [[490, 50], [490, 8], [220, 8], [220, 28]] },
    viaReal: { in: [[255, 292], [255, 340], [276, 340]], bg: [[304, 340], [370, 340], [370, 395], [-25, 395], [-25, 96]] },
    colors: { s: '#d93025', zg: '#222', in: '#e07b1a', bg: '#222', sig: '#d93025', lk: '#222' }
  };
  const SEG7 = { part: 'D1', pins: PIN };

  /* Спільні частини коду */
  const SHOWSEG = `void showSeg(int a, int b, int c, int d, int e, int f, int g) {
  digitalWrite(2, a);
  digitalWrite(3, b);
  digitalWrite(4, c);
  digitalWrite(5, d);
  digitalWrite(6, e);
  digitalWrite(7, f);
  digitalWrite(8, g);
}`;
  const SHOWDIGIT = `void showDigit(int n) {
  if (n == 0) showSeg(1, 1, 1, 1, 1, 1, 0);
  if (n == 1) showSeg(0, 1, 1, 0, 0, 0, 0);
  if (n == 2) showSeg(1, 1, 0, 1, 1, 0, 1);
  if (n == 3) showSeg(1, 1, 1, 1, 0, 0, 1);
  if (n == 4) showSeg(0, 1, 1, 0, 0, 1, 1);
  if (n == 5) showSeg(1, 0, 1, 1, 0, 1, 1);
  if (n == 6) showSeg(1, 0, 1, 1, 1, 1, 1);
  if (n == 7) showSeg(1, 1, 1, 0, 0, 0, 0);
  if (n == 8) showSeg(1, 1, 1, 1, 1, 1, 1);
  if (n == 9) showSeg(1, 1, 1, 1, 0, 1, 1);
}`;
  const SETUP_SEG = `  for (int p = 2; p <= 8; p++) {
    pinMode(p, OUTPUT);
  }`;
  const digitOf = pat => DIG.indexOf(pat);

  /* ---------- Тренажер ---------- */
  const sch = { ...seg, view: 'schematic' };
  const args = d => DIG[d].split('').join(', ');
  const tSeg = (R, d) => ({ circuit: sch,
    q: `<code>showSeg(${args(d)});</code><br>Порядок параметрів — a, b, c, d, e, f, g. Яку цифру покаже індикатор?`,
    unit: '', a: d, abs: 0.1, hint: 'Познач на малюнку індикатора сегменти, де стоїть 1: a — верхній, далі по колу b, c, d, e, f, g — середній.',
    sol: `Світяться сегменти ${'abcdefg'.split('').filter((_, k) => DIG[d][k] === '1').join(', ')} → цифра <b>${d}</b>.` });
  const tCount = (R, d) => ({ circuit: sch,
    q: `Скільки сегментів світиться, коли індикатор показує цифру <b>${d}</b>?`,
    unit: '', a: DIG[d].split('').filter(x => x === '1').length, abs: 0.1, hint: 'Уяви цифру на індикаторі й порахуй риски.',
    sol: `Цифра ${d}: сегменти ${'abcdefg'.split('').filter((_, k) => DIG[d][k] === '1').join(', ')} → <b>${DIG[d].split('').filter(x => x === '1').length}</b>.` });
  const tCall = (R, n, ms) => ({ circuit: { ...mel, view: 'schematic' },
    q: `<pre class="code-mini">void blinkLed(int times, int pause) {
  for (int i = 0; i &lt; times; i++) {
    digitalWrite(13, HIGH);
    delay(pause);
    digitalWrite(13, LOW);
    delay(pause);
  }
}</pre>Виклик <code>blinkLed(${n}, ${ms});</code> Скільки мілісекунд він триватиме?`,
    unit: 'мс', a: n * 2 * ms, abs: 0.5, hint: 'times отримує перше число, pause — друге. За один повтор — дві паузи.',
    sol: `times = ${n}, pause = ${ms}: ${n} · 2 · ${ms} = <b>${n * 2 * ms}&nbsp;мс</b>.` });
  const tMs = (R, last, now, iv) => ({ circuit: { ...mel, view: 'schematic' },
    q: `<code>if (millis() - last &gt;= ${iv}) { … }</code><br>Зараз <code>last = ${last}</code>, а <code>millis()</code> повертає <b>${now}</b>. Чи виконаються дії в дужках?`,
    choices: ['так', 'ні'], a: now - last >= iv ? 0 : 1, hint: 'Обчисли, скільки часу минуло: millis() − last.',
    sol: `${now} − ${last} = ${now - last} ${now - last >= iv ? '≥' : '<'} ${iv} → <b>${now - last >= iv ? 'так' : 'ні'}</b>.` });

  window.LESSON = {
    id: 'seg7',
    number: 8,
    title: 'Семисегментний індикатор і власні функції',
    shareText: 'Урок «Семисегментний індикатор і власні функції» пройдено! Мій прилад показує цифри й не «засинає» на delay 🔢',
    cardLines: ['Цифра', 'на корпусі!'],

    circuits: { seg, segb, mel },

    steps: [
      {
        type: 'live',
        circuit: 'seg', seg7: SEG7, monitor: false,
        title: 'Цифра на корпусі',
        code: `${SHOWSEG}

${SHOWDIGIT}

int count = 0;

void setup() {
${SETUP_SEG}
}

void loop() {
  showDigit(count);
  count = (count + 1) % 10;
  delay(700);
}`,
        text: 'Мікрохвильовка, ліфт, годинник на плиті — цифри на корпусі приладів часто показує <b>семисегментний індикатор</b>.<br>Тут він рахує від 0 до 9 і знову з нуля.<br>Подивись, як складається кожна цифра. А код поки не розбирай — він довгий, але за урок стане зрозумілим.',
        goal: (M, ctx) => Object.keys(ctx.segSeen || {}).filter(p => digitOf(p) >= 0).length >= 6
          ? { ok: true, msg: 'Кожна цифра — це набір рисок, що світяться. Таких рисок (сегментів) лише сім. Розберемо, як ними керувати.' } : false
      },
      {
        type: 'scene',
        title: 'Сім світлодіодів в одному корпусі',
        blocks: [
          { circuit: 'seg' },
          { text: 'Кожен сегмент — це окремий <b>світлодіод</b>. Їх позначають літерами: <b>a</b> — верхній, далі за годинниковою стрілкою <b>b, c, d, e, f</b>, а <b>g</b> — середній.<br>Катоди (мінуси) усіх семи світлодіодів з’єднані всередині й виведені на один вивід <b>COM</b>. Це індикатор <b>зі спільним катодом</b>: COM — до GND.<br>Аноди виведені окремо. Подаємо HIGH на вивід сегмента — він світиться.<br>Тож індикатор — це просто сім світлодіодів, а ти вже вмієш вмикати світлодіод з уроку 3.' }
        ],
        view: 'schematic', views: false,
        notes: { title: 'Семисегментний індикатор', text: 'Сегменти a–g — окремі світлодіоди. Спільний катод (COM) — до GND; HIGH на вивід сегмента — він світиться.' }
      },
      {
        type: 'scene',
        title: 'Мова схем: індикатор',
        blocks: [
          { figure: 'symbols', figureOpts: { items: [{ name: 'Семисегментний індикатор', part: { type: 'seg7' } }] } },
          { text: 'На схемі індикатор малюють прямокутником з «вісімкою» всередині.<br>Ліворуч — виводи сегментів a…g, зверху — спільний вивід COM.<br>Виводів сегментів у справжнього індикатора більше: є ще крапка <b>dp</b>. Нам вона не знадобиться.' }
        ],
        notes: { title: 'Позначення індикатора', text: 'Прямокутник з «вісімкою», виводи сегментів a–g (і dp) та спільний вивід COM.' }
      },
      {
        type: 'predict',
        blocks: [
          { text: 'Кожен сегмент підключено через власний резистор 220&nbsp;Ом. Учень хоче зекономити: один резистор на вивід COM замість семи.' },
          { circuit: 'seg' }
        ],
        view: 'schematic',
        question: 'Що станеться?',
        options: [
          { text: 'Яскравість залежатиме від цифри: «1» світитиме яскраво, «8» — тьмяно', correct: true, feedback: 'Так. Через один резистор проходить сумарний струм усіх сегментів, що світяться. Сегментів два — кожному дістається більше струму, сім — значно менше. Тому резистор ставлять на кожен сегмент.' },
          { text: 'Усе працюватиме так само', feedback: 'Струм через спільний резистор ділиться між сегментами, що світяться. А їх кількість змінюється від цифри до цифри.' },
          { text: 'Індикатор згорить', feedback: 'Один резистор однаково обмежує струм, тож нічого не згорить. Але є інша проблема — подумай про різні цифри.' }
        ]
      },
      {
        type: 'live',
        circuit: 'seg', seg7: SEG7, monitor: false,
        title: 'Склади цифру 2',
        code: `void setup() {
${SETUP_SEG}
}

void loop() {
  digitalWrite(2, [[sel:LOW|HIGH]]);   // a
  digitalWrite(3, [[sel:LOW|HIGH]]);   // b
  digitalWrite(4, [[sel:LOW|HIGH]]);   // c
  digitalWrite(5, [[sel:LOW|HIGH]]);   // d
  digitalWrite(6, [[sel:LOW|HIGH]]);   // e
  digitalWrite(7, [[sel:LOW|HIGH]]);   // f
  digitalWrite(8, [[sel:LOW|HIGH]]);   // g
  delay(100);
}`,
        text: 'Сегмент a — на виводі 2, b — на 3 і так далі до g на виводі 8.<br>Обери рівні так, щоб індикатор показав цифру <b>2</b>.<br><code>for (int p = 2; p &lt;= 8; p++)</code> у setup() — знайомий цикл: робить виводи 2…8 виходами одним рядком замість семи.',
        goal: (M, ctx) => ctx.segPat === DIG[2]
          ? { ok: true, msg: 'Цифра 2: сегменти a, b, d, e, g. Сім рядків — заради однієї цифри. А якщо цифр треба десять, і показувати їх у різних місцях програми?' }
          : { ok: false, msg: 'Поки що не 2. Які риски потрібні для «двійки»? Верхня, права верхня, середня, ліва нижня, нижня.' }
      },
      {
        type: 'scene',
        title: 'Власна функція: одна назва замість семи рядків',
        blocks: [
          { text: `<pre class="code-mini">${SHOWSEG.replace(/</g, '&lt;')}

void loop() {
  showSeg(1, 1, 0, 1, 1, 0, 1);   // цифра 2
}</pre>
Сім однакових рядків можна «загорнути» в одну команду з власною назвою. Це <b>власна функція</b>.<br><b>Опис</b> функції: <code>void showSeg(…) { … }</code> — назва і що вона робить. Описують її поза setup() і loop().<br><b>Виклик</b>: <code>showSeg(1, 1, 0, …);</code> — у тому місці, де треба виконати ці дії.<br><code>void</code> означає «функція нічого не повертає» — лише виконує дії. Ти вже бачив void у <code>void setup()</code> і <code>void loop()</code>: це теж функції, тільки викликає їх сама Arduino.<br>Аналогія: рецепт у кулінарній книзі. Записуєш один раз, а потім кажеш лише «зроби млинці».` }
        ],
        notes: { title: 'Власна функція', text: 'Опис: void назва(параметри) { дії } — поза setup() і loop(). Виклик: назва(значення); void — функція нічого не повертає.' }
      },
      {
        type: 'scene',
        title: 'Параметр — значення, яке функція отримує під час виклику',
        blocks: [
          { text: `<pre class="code-mini">void showSeg(int a, int b, int c, int d, int e, int f, int g) { … }

showSeg(1, 1, 0, 1, 1, 0, 1);
//      a  b  c  d  e  f  g</pre>
У дужках опису — <b>параметри</b>: змінні, які функція отримує ззовні. Кожен з типом: <code>int a</code>.<br>Під час виклику значення підставляються <b>по порядку</b>: перше число — в a, друге — в b і так далі.<br>Ти вже давно передаєш значення у вбудовані функції: <code>delay(500)</code>, <code>digitalWrite(13, HIGH)</code>. Тепер так само працюють і твої.<br>Функція з параметром — універсальна: та сама showSeg показує будь-яку комбінацію сегментів.` }
        ],
        notes: { title: 'Параметри', text: 'Параметри — змінні в дужках опису функції (з типом). Під час виклику значення підставляються по порядку.' }
      },
      {
        type: 'live',
        circuit: 'seg', seg7: SEG7, monitor: false,
        title: 'Функція показу цифри',
        code: `${SHOWSEG}

${SHOWDIGIT}

void setup() {
${SETUP_SEG}
}

void loop() {
  showDigit([[sel:…|3|7|9]]);
  delay(100);
}`,
        text: 'Друга функція — <code>showDigit(int n)</code>. Вона отримує цифру й сама обирає, які сегменти засвітити, викликаючи showSeg.<br>Функції можуть викликати одна одну.<br>Тепер у loop() досить одного рядка, щоб показати будь-яку цифру. Обери цифру й подивись на індикатор.',
        goal: (M, ctx, src) => src.includes('…') ? { ok: false, msg: 'Обери цифру в списку.' }
          : (digitOf(ctx.segPat) >= 0 ? { ok: true, msg: `Індикатор показує ${digitOf(ctx.segPat)}. Виклик showDigit(${digitOf(ctx.segPat)}) → n = ${digitOf(ctx.segPat)} → спрацьовує один з десяти if → showSeg(…) → сім digitalWrite.` } : false)
      },
      {
        type: 'scene',
        title: 'Область видимості',
        blocks: [
          { text: `<pre class="code-mini">int count = 0;            // глобальна: видно всюди

void showDigit(int n) {   // n видно лише тут
  int lit = 0;            // lit видно лише тут
  …
}

void loop() {
  showDigit(count);       // можна: count глобальна
  lit = 5;                // помилка: lit тут не існує
}</pre>
Змінна живе <b>всередині фігурних дужок</b>, де її оголосили. Це її <b>область видимості</b>.<br>Параметри й змінні, оголошені всередині функції, — <b>локальні</b>: вони з’являються під час виклику й зникають після нього.<br>Змінні, оголошені на початку програми поза функціями, — <b>глобальні</b>: їх видно в усіх функціях.<br>Навіщо так? Кожна функція має власні «чернетки» й не може випадково зіпсувати змінні інших.` }
        ],
        notes: { title: 'Область видимості', text: 'Локальна змінна (у функції або параметр) існує лише всередині своїх фігурних дужок. Глобальна (поза функціями) — видно всюди.' }
      },
      {
        type: 'predict',
        blocks: [
          { text: `<pre class="code-mini">int n = 7;

void showDigit(int n) {
  …
}

void loop() {
  showDigit(3);
  Serial.println(n);
}</pre>` }
        ],
        question: 'Що виведе Serial Monitor?',
        options: [
          { text: '7', correct: true, feedback: 'Так. Параметр n у showDigit — окрема локальна змінна, хоч і з тим самим ім’ям. Вона отримала 3 і зникла після виклику. Глобальна n лишилась 7. Щоб не плутатись, різним змінним краще давати різні імена.' },
          { text: '3', feedback: 'Значення 3 отримав параметр n — локальна змінна всередині showDigit. Після виклику вона зникла, а println бачить глобальну n.' },
          { text: 'Помилку', feedback: 'Помилки немає: всередині функції параметр n просто «затуляє» глобальну змінну з тим самим ім’ям.' }
        ]
      },
      {
        type: 'live',
        circuit: 'segb', seg7: SEG7, monitor: false,
        inputs: [{ pin: 12, part: 'B1', wiring: 'gnd' }],
        title: 'Лічильник «скаче»',
        code: `${SHOWSEG}

${SHOWDIGIT}

int count = 0;

void setup() {
${SETUP_SEG}
  pinMode(12, INPUT_PULLUP);
  showDigit(0);
}

void loop() {
  if (digitalRead(12) == LOW) {
    count++;
    showDigit(count % 10);
  }
  delay(20);
}`,
        text: 'Хочемо кнопковий лічильник: одне натискання — плюс один.<br>Натисни кнопку один раз і потримай секунду. Скільки додалося?',
        goal: (M, ctx) => Object.keys(ctx.segSeen || {}).filter(p => digitOf(p) >= 0).length >= 4
          ? { ok: true, msg: 'Одне натискання — а лічильник промчав кілька цифр! loop() перевіряє кнопку кожні 20&nbsp;мс. Поки її тримаєш, умова «натиснуто» виконується знову й знову. А рахувати треба не стан, а <b>подію</b> — мить, коли кнопку тільки-но натиснули.' } : false
      },
      {
        type: 'live',
        circuit: 'segb', seg7: SEG7, monitor: false,
        inputs: [{ pin: 12, part: 'B1', wiring: 'gnd' }],
        title: 'Рахуємо подію, а не стан',
        code: `${SHOWSEG}

${SHOWDIGIT}

int count = 0;
bool wasPressed = false;

void setup() {
${SETUP_SEG}
  pinMode(12, INPUT_PULLUP);
  showDigit(0);
}

void loop() {
  bool isPressed = (digitalRead(12) == LOW);
  if (isPressed && !wasPressed) {
    count++;
    showDigit(count % 10);
  }
  wasPressed = isPressed;
  delay(20);
}`,
        text: 'Програма пам’ятає, якою кнопка була на <b>попередньому</b> проході: змінна <code>wasPressed</code> оголошена поза loop(), тож не зникає.<br>Подія «натиснули» — це коли кнопка зараз натиснута, <b>і</b> раніше не була: <code>isPressed && !wasPressed</code>.<br>Наприкінці loop() запам’ятовуємо поточний стан на наступний раз.<br>Натисни кнопку тричі.',
        goal: (M, ctx) => ctx.segSeen && ctx.segSeen[DIG[3]]
          ? { ok: true, msg: 'Тепер кожне натискання — рівно +1, хоч скільки тримай кнопку. Це прийом «виявлення зміни стану»: він знадобиться ще багато разів.' } : { ok: false, msg: 'Натискай кнопку, доки лічильник не дійде до 3.' }
      },
      {
        type: 'gen',
        bonus: { key: 'b', need: 20, text: '20 задач про індикатор і функції розв’язано! Ось твоя ексклюзивна наліпка!' },
        title: 'Сегменти, функції й час',
        text: 'Розшифруй сегменти, порахуй виклики й інтервали. Кожного разу числа нові.',
        need: 3,
        first: [R => tSeg(R, 7), R => tCount(R, 1), R => tCall(R, 3, 200)],
        make: R => {
          const k = R.pick(['seg', 'seg', 'cnt', 'call', 'ms']);
          if (k === 'seg') return tSeg(R, R.int(0, 9));
          if (k === 'cnt') return tCount(R, R.int(0, 9));
          if (k === 'call') return tCall(R, R.int(2, 6), R.pick([100, 150, 200, 250, 300, 500]));
          const last = R.pick([1000, 2400, 5000, 12300]), iv = R.pick([200, 500, 1000]);
          return tMs(R, last, last + iv + R.pick([-150, -60, -1, 0, 30, 400]), iv);
        }
      },
      {
        type: 'live',
        circuit: 'mel', buzzer: 'Z1', pin: 13, led: 'L1', ledNets: ['sig', 'mid', 'lk'], monitor: false,
        inputs: [{ pin: 2, part: 'B1', wiring: 'gnd' }],
        title: 'Кнопка не слухається',
        code: `int notes[] = {262, 330, 392, 523};
int index = 0;

void setup() {
  pinMode(2, INPUT_PULLUP);
  pinMode(13, OUTPUT);
}

void loop() {
  if (digitalRead(2) == LOW) {
    digitalWrite(13, HIGH);
  } else {
    digitalWrite(13, LOW);
  }
  tone(8, notes[index], 400);
  delay(500);
  index = (index + 1) % 4;
}`,
        text: 'Прилад грає мелодію і водночас має реагувати на кнопку: поки її тримають, світиться зелений світлодіод.<br>Увімкни звук кнопкою під схемою, якщо хочеш його чути.<br>Коротко натисни кнопку кілька разів — швидко, як клацають мишкою.',
        goal: (M, ctx) => ctx.presses >= 4
          ? { ok: true, msg: 'Частина коротких натискань просто «губиться», а світлодіод реагує із запізненням. Програма перевіряє кнопку раз на 500&nbsp;мс, а решту часу «спить» у delay(500) і нічого не помічає.' } : false
      },
      {
        type: 'live',
        circuit: 'mel', buzzer: 'Z1', pin: 13, led: 'L1', ledNets: ['sig', 'mid', 'lk'], monitor: false,
        inputs: [{ pin: 2, part: 'B1', wiring: 'gnd' }],
        removable: true,
        title: 'Може, просто прибрати delay?',
        code: BLOCK,
        text: 'Клацни по рядку коду — він вимкнеться (стане закресленим). Ще клацання — рядок повернеться.<br>Вимкни рядок <code>delay(500);</code> і знову поклацай кнопку. Кнопка тепер слухається? А що з мелодією? (Увімкни звук під схемою.)',
        goal: (M, ctx) => !ctx.off.includes(lnOf(BLOCK, 'delay(500)'))
          ? { ok: false, msg: 'Вимкни рядок <code>delay(500);</code> — клацни по ньому.' }
          : ctx.presses >= 3
            ? { ok: true, msg: 'Кнопка реагує миттєво, але мелодії більше немає: loop() крутиться тисячі разів на секунду, і ноти змінюються так швидко, що зливаються в тріск. Отже, delay не можна просто прибрати — пауза потрібна, але така, що не «присипляє» програму. Як це зробити — далі.' }
            : { ok: false, msg: 'Поклацай кнопку кілька разів.' }
      },
      {
        type: 'scene',
        title: 'Не спати, а поглядати на годинник',
        blocks: [
          { text: `<pre class="code-mini">long last = 0;

void loop() {
  if (millis() - last &gt;= 500) {   // минуло 500 мс?
    last = millis();                // запам’ятали момент
    … наступна нота …
  }
  … перевірка кнопки — на кожному проході …
}</pre>
<code>delay(500)</code> зупиняє всю програму. Поки вона «спить», нічого іншого не відбувається.<br>Інший спосіб: loop() крутиться без пауз і на кожному проході <b>поглядає на годинник</b> — чи вже пора?<br>Скільки минуло, рахуємо так само, як у тренажері реакції: <code>millis() − last</code>. Минуло 500&nbsp;мс — робимо дію і запам’ятовуємо новий момент.<br>Аналогія: ти вариш яйця 5 хвилин. Можна стояти й дивитися в каструлю (це delay). А можна робити інші справи й час від часу поглядати на годинник.<br>Такі інтервали називають <b>неблокувальними</b>: вони не блокують решту програми.` }
        ],
        notes: { title: 'Неблокувальний інтервал', text: 'if (millis() − last >= інтервал) { last = millis(); дія; } — дія повторюється з інтервалом, а решта loop() працює без зупинок.' }
      },
      {
        type: 'live',
        circuit: 'mel', buzzer: 'Z1', pin: 13, led: 'L1', ledNets: ['sig', 'mid', 'lk'], monitor: false,
        inputs: [{ pin: 2, part: 'B1', wiring: 'gnd' }],
        title: 'Мелодія і кнопка разом',
        code: `int notes[] = {262, 330, 392, 523};
int index = 0;
long last = 0;

void setup() {
  pinMode(2, INPUT_PULLUP);
  pinMode(13, OUTPUT);
}

void loop() {
  if (digitalRead(2) == LOW) {
    digitalWrite(13, HIGH);
  } else {
    digitalWrite(13, LOW);
  }
  if (millis() - last >= 500) {
    last = millis();
    tone(8, notes[index], 400);
    index = (index + 1) % 4;
  }
}`,
        text: 'Та сама програма, але без delay. Нота змінюється раз на 500&nbsp;мс, а кнопка перевіряється на кожному проході loop().<br>Знову коротко натисни кнопку кілька разів.',
        goal: (M, ctx) => ctx.presses >= 4 && (ctx.tones || 0) >= 6
          ? { ok: true, msg: 'Світлодіод відгукується миттєво на кожне натискання, а мелодія грає рівно. Програма більше не «засинає».' } : false
      },
      {
        type: 'predict',
        blocks: [
          { text: 'Перевір себе. Учень зробив неблокувальний маячок, але забув рядок <code>last = millis();</code>:' },
          { code: 'long last = 0;\n\nvoid loop() {\n  if (millis() - last >= 500) {\n    // last = millis();  ← цього рядка немає\n    … дія …\n  }\n}' }
        ],
        question: 'Що станеться після перших 500&nbsp;мс?',
        options: [
          { text: 'Дія виконуватиметься на кожному проході loop() — без жодного інтервалу', correct: true, feedback: 'Так. last лишається 0, тож millis() − last ≥ 500 відтепер завжди true. Без «запам’ятати момент» годинник не перезапускається.' },
          { text: 'Дія виконається лише один раз', feedback: 'Умова з часом тільки зростає й лишається true — дія повторюватиметься постійно.' },
          { text: 'Нічого не зміниться', feedback: 'Саме цей рядок перезапускає відлік інтервалу.' }
        ]
      }
    ],

    skills: [
      'Пояснюю будову семисегментного індикатора зі спільним катодом',
      'Підключаю сегменти через окремі резистори',
      'Описую власну функцію з параметрами і викликаю її',
      'Розрізняю локальні й глобальні змінні',
      'Рахую натискання як подію, а не стан',
      'Замінюю delay() неблокувальним інтервалом з millis()'
    ],

    practice: {
      intro: 'Збери в Tinkercad Circuits: <b>Arduino Uno R3</b>, семисегментний індикатор (<b>7 Segment Display</b>, у налаштуваннях — Common: <b>Cathode</b>), сегменти a…g — через резистори 220&nbsp;Ом на виводи 2…8, спільний вивід — до GND.',
      tasks: [
        'Засвіти по черзі кожен сегмент і перевір, що літери a…g відповідають виводам 2…8.',
        'Опиши функцію showSeg з сімома параметрами і покажи цифри 0, 1 і 8.',
        'Опиши функцію showDigit(int n) і зроби лічильник 0…9 з паузою 1&nbsp;с.',
        'Додай кнопку з INPUT_PULLUP і зроби кнопковий лічильник: кожне натискання — +1, після 9 — знову 0.',
        'Перероби лічильник з паузою 1&nbsp;с на неблокувальний (millis) і додай кнопку «скинути на 0», яка реагує миттєво.',
        'Із зірочкою: прилад грає мелодію з масивів (урок 7) і водночас рахує натискання кнопки на індикаторі.'
      ]
    },

    next: { id: 'lab02' },
    teaser: 'Розділ 1 пройдено! Попереду лабораторна 2 «Сигналізатор умов». А на секції ти збереш справжній індикатор на макетній платі.'
  };
})();
