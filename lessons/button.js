/* Тема 1.4 програми (урок 5 на сайті; файл button): «Цифрові датчики та кнопка». if/else, порівняння й Serial — уже з уроку 4 (тема 1.5).
   Цифровий вхід і активний рівень уже знайомі з теми 1.3 (датчик перешкод). Тут: модулі перешкод/Холла/звуку,
   Serial Monitor як засіб налагодження, millis() — інтервал між подіями (час реакції).
   Подія → рівень на виводі → рішення програми; if / else; == і =; плаваючий вхід; INPUT_PULLUP (натиснуто = LOW);
   bool як факт події; логічне заперечення !; сума двох подій 0/1. Підрахунок натискань у часі — не вводимо. */
(function () {
  const lnOf = (code, t) => code.split('\n').findIndex(l => l.includes(t)) + 1;   // номер рядка з текстом t (для кроків, де рядки вимикають)
  const HOLD = `#define BTN 2
long start = 0;
bool wasPressed = false;

void setup() {
  pinMode(BTN, INPUT_PULLUP);
  Serial.begin(9600);
}

void loop() {
  bool isPressed = (digitalRead(BTN) == LOW);
  if (isPressed && !wasPressed) {      // щойно натиснули
    start = millis();
  }
  if (!isPressed && wasPressed) {      // щойно відпустили
    Serial.print("Тримали: ");
    Serial.print(millis() - start);
    Serial.println(" мс");
  }
  wasPressed = isPressed;
}`;   // «Скільки тримали кнопку?» і «Навіщо wasPressed?»
  /* Світлодіод на D13 через 220 Ом; катод — до GND біля D13 (як на справжній платі) */
  const LED = {
    parts: { R1: { type: 'resistor', value: 220, x: 240, y: 30 }, L1: { type: 'led', color: 'red', x: 370, y: 20 } },
    nets: { sig: ['U1.D13', 'R1.1'], mid: ['R1.2', 'L1.A'], lk: ['L1.K', 'U1.GND2'] },
    via: { lk: [[490, 50], [490, 8], [220, 8], [220, 28]] }
  };

  /* Модуль цифрового датчика: живлення 5V/GND, вихід DO → D2 */
  const sens = {
    view: 'real', viewBox: '-190 -30 720 450',
    parts: { U1: { type: 'arduino-uno', x: 0, y: 0 }, S1: { type: 'dsensor', kind: 'sound', x: -170, y: 30 }, ...LED.parts },
    nets: { v: ['S1.VCC', 'U1.5V'], g: ['S1.GND', 'U1.GND'], d: ['S1.DO', 'U1.D2'], ...LED.nets },
    via: { v: [[-25, 50], [-25, 70]], g: [[-35, 75], [-35, 96]], d: [[-50, 395], [230, 395], [230, 292]], ...LED.via },
    colors: { v: '#d93025', g: '#222', d: '#e07b1a', sig: '#d93025', lk: '#222' }
  };

  /* Кнопка між D2 і GND */
  const btn = {
    view: 'real', viewBox: '-50 -30 580 450',
    parts: { U1: { type: 'arduino-uno', x: 0, y: 0 }, B1: { type: 'button', x: 240, y: 252 }, ...LED.parts },
    nets: { in: ['U1.D2', 'B1.1'], bg: ['B1.2', 'U1.GND'], ...LED.nets },
    via: { bg: [[370, 292], [370, 395], [-25, 395], [-25, 96]], ...LED.via },
    viaReal: { in: [[255, 292], [255, 340], [276, 340]], bg: [[304, 340], [370, 340], [370, 395], [-25, 395], [-25, 96]] },
    colors: { in: '#e07b1a', bg: '#222', sig: '#d93025', lk: '#222' }
  };

  /* Дві кнопки: A — D2, B — D7, обидві до GND */
  const btn2 = {
    view: 'real', viewBox: '-50 -30 470 450',
    parts: { U1: { type: 'arduino-uno', x: 0, y: 0 }, B2: { type: 'button', label: 'B', x: 240, y: 142 }, B1: { type: 'button', label: 'A', x: 240, y: 252 }, JB: { type: 'junction', x: 370, y: 292 } },
    nets: { a: ['U1.D2', 'B1.1'], b: ['U1.D7', 'B2.1'], ag: ['B1.2', 'JB.p'], bgnd: ['B2.2', 'JB.p'], jg: ['JB.p', 'U1.GND'] },
    via: { bgnd: [[370, 182]], jg: [[370, 395], [-25, 395], [-25, 96]] },
    viaReal: { a: [[255, 292], [255, 340], [276, 340]], b: [[255, 182], [255, 230], [276, 230]], ag: [[304, 340], [370, 340]], bgnd: [[304, 230], [370, 230]] },
    colors: { a: '#e07b1a', b: '#7048e8', ag: '#222', bgnd: '#222', jg: '#222' }
  };

  /* ---------- Тренажер: рівень на вході, факт події, світлодіод, сума подій ---------- */
  const sch = c => ({ ...c, view: 'schematic' });
  const word = v => v ? 'HIGH (1)' : 'LOW (0)';
  const st = p => p ? 'натиснута' : 'відпущена';
  const tLevel = (R, p) => ({ circuit: sch(btn), buttons: [['B1', p]],
    q: `<code>pinMode(2, INPUT_PULLUP);</code><br>Кнопка між D2 і GND <b>${st(p)}</b>.<br>Що поверне <code>digitalRead(2)</code>?`,
    choices: ['HIGH', 'LOW'], a: p ? 1 : 0, hint: 'Підтягувальний резистор тягне вхід до 5&nbsp;В. Натиснута кнопка з’єднує вхід із GND.',
    sol: p ? 'Кнопка з’єднала вхід із GND → <b>LOW</b>.' : 'Кнопка розімкнена, резистор підтягує вхід до 5&nbsp;В → <b>HIGH</b>.' });
  const tFact = (R, p) => ({ circuit: sch(btn), buttons: [['B1', p]],
    q: `<code>pinMode(2, INPUT_PULLUP);</code><br>Кнопка <b>${st(p)}</b>.<br><code>bool isPressed = (digitalRead(2) == LOW);</code><br>Чому дорівнює <code>isPressed</code>?`,
    choices: ['true', 'false'], a: p ? 0 : 1, hint: 'Спочатку визнач рівень на вході, потім перевір, чи він дорівнює LOW.',
    sol: `Рівень ${word(!p)}; порівняння «== LOW» ${p ? 'істинне' : 'хибне'} → <b>${p ? 'true' : 'false'}</b>.` });
  const tLed = (R, p, neg) => ({ circuit: sch(btn), buttons: [['B1', p]],
    q: `<code>pinMode(2, INPUT_PULLUP);</code><br>Кнопка <b>${st(p)}</b>.<br><code>isPressed = (digitalRead(2) == LOW);</code><br><code>if (${neg ? '!' : ''}isPressed) { digitalWrite(13, HIGH); }</code><br><code>else { digitalWrite(13, LOW); }</code><br>Чи світиться світлодіод?`,
    choices: ['світиться', 'не світиться'], a: (neg ? !p : p) ? 0 : 1, hint: neg ? '«!» перетворює true на false і навпаки.' : 'isPressed = true, коли кнопка натиснута.',
    sol: `isPressed = ${p ? 'true' : 'false'}${neg ? `, !isPressed = ${p ? 'false' : 'true'}` : ''} → світлодіод <b>${(neg ? !p : p) ? 'світиться' : 'не світиться'}</b>.` });
  const tSum = (R, a, b) => ({ circuit: sch(btn2), buttons: [['B1', a], ['B2', b]],
    q: `Обидві кнопки — <code>INPUT_PULLUP</code>.<br>Кнопка A <b>${st(a)}</b>, кнопка B <b>${st(b)}</b>.<br>a = 1, якщо A натиснута (інакше 0); так само b.<br><code>count = a + b;</code><br>Чому дорівнює count?`,
    unit: '', a: (a ? 1 : 0) + (b ? 1 : 0), abs: 0.1, hint: 'Рахуємо факти натискання, а не сирі рівні: натиснута кнопка дає LOW, але подія = 1.',
    sol: `a = ${a ? 1 : 0}, b = ${b ? 1 : 0} → count = <b>${(a ? 1 : 0) + (b ? 1 : 0)}</b>.` });

  window.LESSON = {
    id: 'button',
    number: 5,
    title: 'Цифрові датчики та кнопка',
    shareText: 'Урок «Цифрові датчики та кнопка» пройдено! Кнопка, датчики й час реакції — під контролем 🔘',
    cardLines: ['Кнопка', 'під контролем!'],

    circuits: { sens, btn, btn2 },

    steps: [
      {
        type: 'live',
        circuit: 'sens', pin: 13, led: 'L1', ledNets: ['sig', 'mid', 'lk'], monitor: false,
        inputs: [{ pin: 2, kind: 'sensor', part: 'S1', label: '🔊 Звук: є / немає' }],
        title: 'Датчик вирішує, коли світити',
        code: `#define SENSOR 2
#define LED 13

void setup() {
  pinMode(SENSOR, INPUT);
  pinMode(LED, OUTPUT);
}

void loop() {
  if (digitalRead(SENSOR) == HIGH) {
    digitalWrite(LED, HIGH);
  } else {
    digitalWrite(LED, LOW);
  }
  delay(20);
}`,
        text: 'Ліворуч — модуль датчика звуку. Коли звук гучний, на виході <b>DO</b> з’являється HIGH (≈ 5&nbsp;В), коли тихо — LOW (≈ 0&nbsp;В).<br>У симуляторі звуку немає: кнопка «Звук» лише перемикає вихід DO, так, ніби датчик почув звук.<br>Увімкни й вимкни «звук» і подивись на світлодіод та рядки коду, що підсвічуються.',
        goal: (M, ctx) => ctx.seen['1:1'] && ctx.seen['0:0']
          ? { ok: true, msg: 'Знайомий if, як у нічнику, тільки тепер умова — цифровий рівень HIGH або LOW. Сьогодні розберемося з цифровими датчиками й кнопкою.' } : false
      },
      {
        type: 'scene',
        title: 'Подія, рівень, рішення',
        blocks: [
          { figure: 'chain' },
          { text: 'У цьому прикладі є три різні речі, і їх легко переплутати.<br><b>Подія</b> — те, що сталося у світі: звук, магніт, натискання.<br><b>Рівень на виводі</b> — що бачить Arduino: HIGH або LOW. Модуль датчика сам перетворює подію на рівень.<br><b>Рішення</b> — що програма робить з цим рівнем.<br>Важливо: HIGH не завжди означає «подія є». Як саме подія перетворюється на рівень, залежить від схеми — за кілька кроків побачимо це на кнопці.' }
        ],
        notes: { title: 'Подія → рівень → рішення', text: 'Подія — фізичне явище. Рівень — HIGH або LOW на виводі. Рішення — що робить програма. Зв’язок події і рівня визначає схема.' }
      },
      {
        type: 'scene',
        title: 'Мова схем: кнопка',
        blocks: [
          { figure: 'symbols', figureOpts: { items: [{ name: 'Кнопка', part: { type: 'button' } }] } },
          { text: 'Кнопка на схемі — два контакти і перемичка над ними.<br>Натискаєш — перемичка опускається й замикає контакти.<br>Відпускаєш — пружина піднімає її назад.' }
        ],
        notes: { title: 'Кнопка', text: 'Натиснута — контакти замкнені, відпущена — розімкнені.' }
      },
      {
        type: 'scene',
        title: 'Різні датчики — однаковий вихід',
        blocks: [
          { figure: 'modules', figureOpts: { kinds: ['sound', 'hall', 'obstacle'] } },
          { text: 'Модулі датчиків бувають дуже різні.<br><b>Датчик звуку</b> — мікрофон: реагує на гучний звук.<br><b>Датчик Холла</b> — реагує на магніт.<br><b>Датчик перешкод</b> — уже знайомий: інфрачервоне світло відбивається від перешкоди.<br>Кожен вимірює своє явище, але цифровий вихід <b>DO</b> в усіх працює однаково: HIGH або LOW.<br>Тому програма для них майже однакова. Змінюється лише <b>активний рівень</b> — яким рівнем модуль повідомляє про подію.<br>Його беруть з технічного опису модуля (<b>даташиту</b>) або перевіряють дослідом.' }
        ],
        
      },
      {
        type: 'scene',
        title: 'Замінимо датчик кнопкою',
        blocks: [
          { circuit: 'btn' },
          { text: 'Тактова кнопка має <b>чотири ніжки</b>. Вони з’єднані попарно всередині: ліві дві — між собою, праві дві — між собою. Натискання з’єднує ліву пару з правою.<br>Тому на макетці кнопку ставлять через «рівчак» посередині — так, щоб пари опинились у різних стовпцях.<br>Ми підключили кнопку між виводом <b>D2</b> і <b>GND</b>. Але чи вистачить цього?' }
        ],
        view: 'real',
        notes: { title: 'Тактова кнопка', text: '4 ніжки, з’єднані попарно. Натискання з’єднує пари між собою. На макетці — через рівчак.' }
      },
      {
        type: 'live',
        circuit: 'btn', view: 'real', pin: 13, led: 'L1', ledNets: ['sig', 'mid', 'lk'], monitor: false,
        inputs: [{ pin: 2, part: 'B1', wiring: 'gnd' }],
        title: 'Дивний світлодіод',
        code: `#define BTN 2
#define LED 13

void setup() {
  pinMode(BTN, INPUT);
  pinMode(LED, OUTPUT);
}

void loop() {
  if (digitalRead(BTN) == LOW) {
    digitalWrite(LED, HIGH);
  } else {
    digitalWrite(LED, LOW);
  }
  delay(150);
}`,
        text: 'Програма: якщо на D2 — LOW, світити. Натискання з’єднує D2 із GND, тобто дає LOW.<br><b>Поки нічого не натискай</b> і подивись на світлодіод. Потім натисни й потримай кнопку (мишкою на кнопці або кнопкою під схемою).',
        goal: (M, ctx) => ctx.seen['0:1'] && ctx.seen['0:0']
          ? { ok: true, msg: 'Кнопку не чіпали, а світлодіод блимає сам! Поки кнопка відпущена, D2 ні з чим не з’єднаний — вхід «плаває» і ловить будь-які завади. Arduino читає то HIGH, то LOW навмання.' } : false,
        notes: { title: 'Плаваючий вхід', text: 'Вхід, не з’єднаний ні з 5&nbsp;В, ні з GND, «плаває»: читається випадково. Йому потрібне підтягування.' }
      },
      {
        type: 'scene',
        title: 'Підтягувальний резистор',
        blocks: [
          { figure: 'pullpair' },
          { text: 'Щоб вхід не плавав, його через резистор з’єднують з відомим рівнем — «підтягують».<br>Ліворуч: резистор тягне вхід до GND, кнопка — до 5&nbsp;В. Відпущена — LOW, натиснута — HIGH.<br>Праворуч: резистор тягне вхід до 5&nbsp;В, кнопка — до GND. Відпущена — HIGH, натиснута — LOW.<br>Резистор великий (10&nbsp;кОм), тому коли кнопку натиснуто, через нього тече зовсім малий струм.<br>Важливо: кнопка не створює напругу. Вона лише з’єднує вхід з 5&nbsp;В або з GND.' }
        ],
        notes: { title: 'Підтягувальний резистор', text: 'Резистор до GND (кнопка до 5&nbsp;В): натиснута — HIGH. Резистор до 5&nbsp;В (кнопка до GND): натиснута — LOW. Кнопка лише з’єднує, а не створює напругу.' }
      },
      {
        type: 'scene',
        title: 'INPUT_PULLUP: резистор уже всередині',
        blocks: [
          { figure: 'pullup', figureOpts: { mode: 'internal', pressed: false } },
          { text: 'В Arduino такий резистор до 5&nbsp;В вже вбудований — як у правому варіанті. Окремий резистор на макетці не потрібен.<br>Вмикає його одна команда: <code>pinMode(BTN, INPUT_PULLUP);</code><br>Кнопку тоді ставлять між входом і GND.<br>Кнопка <b>відпущена</b> — вхід підтягнутий до 5&nbsp;В: <b>HIGH</b>.<br>Кнопка <b>натиснута</b> — вхід з’єднаний з GND: <b>LOW</b>.<br>Так роблять найчастіше: менше деталей і дротів.' }
        ],
        notes: { title: 'INPUT_PULLUP', text: 'Вбудований резистор до 5&nbsp;В. Кнопка між входом і GND: відпущена — HIGH, натиснута — LOW.' }
      },
      {
        type: 'predict',
        blocks: [
          { code: 'pinMode(BTN, INPUT_PULLUP);' },
          { text: 'Кнопку натиснули.' },
          { figure: 'pullup', figureOpts: { mode: 'internal', pressed: true, hideRead: true } }
        ],
        question: 'Що поверне digitalRead(BTN)?',
        options: [
          { text: 'LOW', correct: true, feedback: 'Так. Натиснута кнопка з’єднує вхід із GND. З INPUT_PULLUP «натиснуто» = LOW — це треба пам’ятати, щоб не переплутати в умові.' },
          { text: 'HIGH', feedback: 'HIGH буде, поки кнопка відпущена: резистор підтягує вхід до 5&nbsp;В.' },
          { text: 'То HIGH, то LOW навмання', feedback: 'Так було без підтягування. Тепер вхід завжди з’єднаний з чимось.' }
        ]
      },
      {
        type: 'live',
        circuit: 'btn', view: 'real', pin: 13, led: 'L1', ledNets: ['sig', 'mid', 'lk'], monitor: false,
        inputs: [{ pin: 2, part: 'B1', wiring: 'gnd' }],
        title: 'Кнопка працює',
        code: `#define BTN 2
#define LED 13

void setup() {
  pinMode(BTN, INPUT_PULLUP);
  pinMode(LED, OUTPUT);
}

void loop() {
  if (digitalRead(BTN) == LOW) {
    digitalWrite(LED, HIGH);
  } else {
    digitalWrite(LED, LOW);
  }
  delay(20);
}`,
        text: 'Той самий код, змінено лише одне слово: <code>INPUT</code> → <code>INPUT_PULLUP</code>.<br>Натисни й відпусти кнопку кілька разів.',
        goal: (M, ctx) => ctx.seen['1:1'] && ctx.seen['0:0']
          ? { ok: true, msg: 'Тепер світлодіод слухається: натиснуто — світить, відпущено — гасне. Ніякого випадкового блимання.' } : false
      },
      {
        type: 'predict',
        blocks: [
          { text: 'Перевір себе. Учень зібрав кнопку з <code>INPUT_PULLUP</code> і написав:' },
          { code: 'if (digitalRead(BTN) == HIGH) {\n  digitalWrite(LED, HIGH);\n}' },
          { text: 'Він хотів, щоб світло вмикалося при натисканні.' }
        ],
        question: 'Що відбувається насправді?',
        options: [
          { text: 'Світить, поки кнопка відпущена, і гасне при натисканні', correct: true, feedback: 'Так. З INPUT_PULLUP відпущена кнопка — це HIGH. Виправлення: порівнювати з LOW або завести <code>isPressed = (digitalRead(BTN) == LOW)</code>.' },
          { text: 'Світить при натисканні — усе правильно', feedback: 'Натиснута кнопка з’єднує вхід із GND — це LOW, а не HIGH.' },
          { text: 'Не світить ніколи', feedback: 'Умова == HIGH виконується, поки кнопка відпущена.' }
        ]
      },
      {
        type: 'live',
        circuit: 'btn', view: 'schematic',
        inputs: [{ pin: 2, part: 'B1', wiring: 'gnd' }],
        title: 'Serial Monitor: що бачить програма',
        code: `#define BTN 2

void setup() {
  pinMode(BTN, INPUT_PULLUP);
  Serial.begin(9600);
}

void loop() {
  Serial.print("D2 = ");
  Serial.println(digitalRead(BTN));
  delay(300);
}`,
        text: 'Коли програма поводиться дивно, зазирни їй «у голову»: що вона зараз прочитала?<br>Виведи рівень на D2 у Serial Monitor — так само, як число з потенціометра в уроці 4.<br>Натисни й потримай кнопку, потім відпусти.',
        goal: (M, ctx) => ctx.seen['1:0'] && ctx.seen['0:0'] ? { ok: true, msg: 'Відпущено — 1 (HIGH), натиснуто — 0 (LOW). HIGH і LOW — це просто 1 і 0. Serial Monitor — головний інструмент пошуку помилок.' } : { ok: false, msg: 'Натисни й потримай кнопку, потім відпусти.' },
        notes: { title: 'HIGH і LOW у Serial', text: 'digitalRead повертає 1 (HIGH) або 0 (LOW) — так їх і виводить Serial.' }
      },
      {
        type: 'scene',
        title: 'bool: факт події',
        blocks: [
          { text: '<p>Рядок <code>digitalRead(BTN) == LOW</code> доводиться писати щоразу й щоразу згадувати, що з INPUT_PULLUP натискання — це LOW. Зручніше один раз записати <b>факт події</b> у змінну.</p>' },
          { code: 'bool isPressed = false;\n\nisPressed = (digitalRead(BTN) == LOW);\nif (isPressed) { … }', hl: 3 },
          { text: '<p>Змінна <b>bool</b> зберігає лише «так» або «ні»: <code>true</code> або <code>false</code>. Arduino програмують мовою <b>C++</b>, і тип bool у ній є.</p><p>Порівняння <code>digitalRead(BTN) == LOW</code> якраз дає true або false — його можна покласти в змінну. Тепер ім’я каже, <b>що сталося</b>: «кнопка натиснута».</p>' },
          { figure: 'ops', figureOpts: { ops: [['!', 'НЕ — перевертає true і false', '!false', '!true'],
          ['&&', 'І — обидві умови true', 'true && true', 'true && false'], ['||', 'АБО — хоча б одна true', 'false || true', 'false || false']] } },
          { text: '<p><b>!</b> — логічне «НЕ»: <code>!isPressed</code> означає «кнопка НЕ натиснута». Увага: <code>!</code> перевертає факт, але не змінює рівень на виводі — сирий рівень і далі LOW чи HIGH.</p><p>Факти можна поєднувати: <code>&&</code> — «і» (true, лише коли обидва true), <code>||</code> — «або» (true, коли хоча б один true). Наприклад, <code>if (isPressed && isDark)</code> — «кнопку натиснуто, і темно».</p>' }
        ],
        notes: { title: 'bool, !, && і ||', text: 'bool — true або false (тип мови C++). isPressed = (digitalRead(BTN) == LOW); — факт натискання. !isPressed — «не натиснута». && — і, || — або.' }
      },
      {
        type: 'live',
        circuit: 'btn', view: 'schematic', pin: 13, led: 'L1', ledNets: ['sig', 'mid', 'lk'], monitor: false,
        inputs: [{ pin: 2, part: 'B1', wiring: 'gnd' }],
        title: 'Навпаки: світло, поки кнопка відпущена',
        code: `#define BTN 2
#define LED 13
bool isPressed = false;

void setup() {
  pinMode(BTN, INPUT_PULLUP);
  pinMode(LED, OUTPUT);
}

void loop() {
  isPressed = (digitalRead(BTN) [[sel:…|==|=|!=]] LOW);
  if ([[sel:…|isPressed|!isPressed]]) {
    digitalWrite(LED, HIGH);
  } else {
    digitalWrite(LED, LOW);
  }
  delay(20);
}`,
        text: 'Зроби так, щоб світлодіод <b>світив, поки кнопка відпущена</b>, і гас, коли її натискають (як підсвітка, що вимикається від дотику).<br>Обери варіанти в обох списках, потім перевір кнопкою.',
        goal: (M, ctx, src) => {
          if (src.includes('…')) return { ok: false, msg: 'Обери варіант у кожному списку.' };
          if (!src.includes('== LOW')) return { ok: false, msg: 'isPressed має бути true, коли кнопка натиснута. Яким порівнянням це записати?' };
          if (!src.includes('!isPressed')) return { ok: false, msg: 'Зараз світлодіод світить, коли кнопку натиснуто. Як перевернути умову?' };
          return ctx.seen['0:1'] && ctx.seen['1:0'] ? { ok: true, msg: 'Готово: відпущено — світить, натиснуто — гасне. Рівень на виводі той самий, змінилося лише рішення програми.' }
            : { ok: false, msg: 'Код правильний. Тепер натисни й відпусти кнопку.' };
        }
      },
      {
        type: 'live',
        circuit: 'btn2', view: 'schematic',
        inputs: [{ pin: 2, part: 'B1', wiring: 'gnd', kind: 'toggle', label: 'Кнопка A' }, { pin: 7, part: 'B2', wiring: 'gnd', kind: 'toggle', label: 'Кнопка B' }],
        title: 'Сейф із двома ключами',
        code: `#define BTN_A 2
#define BTN_B 7

void setup() {
  pinMode(BTN_A, INPUT_PULLUP);
  pinMode(BTN_B, INPUT_PULLUP);
  Serial.begin(9600);
}

void loop() {
  bool a = (digitalRead(BTN_A) == LOW);
  bool b = (digitalRead(BTN_B) == LOW);
  if (a [[sel:…¦&&¦||]] b) {
    Serial.println("Сейф відчинено");
  } else {
    Serial.println("Зачинено");
  }
  delay(500);
}`,
        hl: 13,
        text: 'Сейф у банку відчиняється, лише коли <b>обидва</b> охоронці одночасно повернули свої ключі — кнопки A і B.<br>Кнопки тут фіксуються: клацни, щоб натиснути, ще раз — щоб відпустити.<br>Обери оператор у рядку з <code>if</code> і перевір усі чотири комбінації кнопок.',
        goal: (M, ctx, src) => {
          if (!src.includes('&&')) return { ok: false, msg: 'Зараз сейф відчиняється від одного ключа. Потрібно, щоб були натиснуті <b>обидві</b> кнопки.' };
          const done = ['00', '10', '01', '11'].filter(p => Object.keys(ctx.seen).some(k => k.startsWith(p + ':'))).length;
          return done === 4 ? { ok: true, msg: 'Так: <code>a && b</code> — true лише тоді, коли натиснуті обидві кнопки. В інших трьох комбінаціях сейф зачинений.' } : { ok: false, msg: `Перевір усі комбінації кнопок: ${done} з 4.` };
        }
      },
      {
        type: 'live',
        circuit: 'btn2', view: 'schematic',
        inputs: [{ pin: 2, part: 'B1', wiring: 'gnd', kind: 'toggle', label: 'Кнопка A' }, { pin: 7, part: 'B2', wiring: 'gnd', kind: 'toggle', label: 'Кнопка B' }],
        title: 'Дзвінок із двох дверей',
        code: `#define BTN_A 2
#define BTN_B 7

void setup() {
  pinMode(BTN_A, INPUT_PULLUP);
  pinMode(BTN_B, INPUT_PULLUP);
  Serial.begin(9600);
}

void loop() {
  bool a = (digitalRead(BTN_A) == LOW);
  bool b = (digitalRead(BTN_B) == LOW);
  if (a [[sel:…¦&&¦||]] b) {
    Serial.println("Дзвінок!");
  } else {
    Serial.println("Тиша");
  }
  delay(500);
}`,
        hl: 13,
        text: 'Тепер навпаки: у будинку двоє дверей, біля кожних — кнопка дзвінка. Дзвінок має дзвонити, коли натиснули <b>будь-яку</b> з кнопок (або обидві).<br>Обери оператор і перевір усі чотири комбінації.',
        goal: (M, ctx, src) => {
          if (!src.includes('||')) return { ok: false, msg: 'Зараз дзвінок дзвонить, лише коли натиснуті обидві кнопки. А має — від будь-якої.' };
          const done = ['00', '10', '01', '11'].filter(p => Object.keys(ctx.seen).some(k => k.startsWith(p + ':'))).length;
          return done === 4 ? { ok: true, msg: 'Так: <code>a || b</code> — true, коли натиснута хоча б одна кнопка. Тиша лише тоді, коли не натиснута жодна.' } : { ok: false, msg: `Перевір усі комбінації кнопок: ${done} з 4.` };
        }
      },
      {
        type: 'match',
        circuit: 'btn', view: 'schematic',
        title: 'Чотири стани',
        text: 'Кнопка (BTN) між D2 і GND, режим <code>INPUT_PULLUP</code>, світлодіод (LED) на D13.<br>Для кожного коду й кожного рівня BTN обери, що робить світлодіод.',
        choices: ['Світиться', 'Не світиться'],
        groups: [
          { title: 'Код 1', hl: 2, code: 'isPressed = (digitalRead(BTN) == LOW);\nif (isPressed) {\n  digitalWrite(LED, HIGH);\n} else {\n  digitalWrite(LED, LOW);\n}' },
          { title: 'Код 2', hl: 2, code: 'isPressed = (digitalRead(BTN) == LOW);\nif (!isPressed) {\n  digitalWrite(LED, HIGH);\n} else {\n  digitalWrite(LED, LOW);\n}' }
        ],
        items: [
          { g: 0, label: 'BTN is LOW', text: 'кнопка натиснута', answer: 0, ok: 'isPressed = true — виконується перша гілка.', why: 'LOW означає «натиснута», isPressed = true.' },
          { g: 0, label: 'BTN is HIGH', text: 'кнопка відпущена', answer: 1, ok: 'isPressed = false — працює else.', why: 'HIGH — кнопка відпущена, isPressed = false.' },
          { g: 1, label: 'BTN is LOW', text: 'кнопка натиснута', answer: 1, ok: '!isPressed = false — світлодіод гасне.', why: 'isPressed = true, а «!» перевертає його на false.' },
          { g: 1, label: 'BTN is HIGH', text: 'кнопка відпущена', answer: 0, ok: '!isPressed = true — світить.', why: 'isPressed = false, тож !isPressed = true.' }
        ],
        done: 'Правильно! Рівні на D2 однакові для обох кодів — різниться лише рішення програми.'
      },
      {
        type: 'gen',
        bonus: { key: 'b', need: 20, text: '20 задач про кнопку розв’язано! Ось твоя ексклюзивна наліпка!' },
        title: 'Рівні та події',
        text: 'Визнач, що прочитає програма і що вона зробить. Кожного разу умова інша.',
        need: 3,
        first: [R => tLevel(R, true), R => tFact(R, false), R => tLed(R, true, true)],
        make: R => {
          const k = R.pick(['lv', 'fact', 'led', 'led', 'sum']);
          if (k === 'lv') return tLevel(R, R.pick([true, false]));
          if (k === 'fact') return tFact(R, R.pick([true, false]));
          if (k === 'led') return tLed(R, R.pick([true, false]), R.pick([true, false]));
          return tSum(R, R.pick([true, false]), R.pick([true, false]));
        }
      },
      {
        type: 'live',
        circuit: 'btn2', view: 'real',
        inputs: [{ pin: 2, part: 'B1', wiring: 'gnd', kind: 'toggle', label: 'Кнопка A' }, { pin: 7, part: 'B2', wiring: 'gnd', kind: 'toggle', label: 'Кнопка B' }],
        title: 'Скільки подій зараз?',
        code: `#define BTN_A 2
#define BTN_B 7
int a = 0;
int b = 0;
int count = 0;

void setup() {
  pinMode(BTN_A, INPUT_PULLUP);
  pinMode(BTN_B, INPUT_PULLUP);
  Serial.begin(9600);
}

void loop() {
  if (digitalRead(BTN_A) == LOW) { a = 1; } else { a = 0; }
  if (digitalRead(BTN_B) == LOW) { b = 1; } else { b = 0; }
  count = a + b;
  Serial.print("Натиснуто: ");
  Serial.println(count);
  delay(300);
}`,
        text: 'Дві кнопки — дві можливі події. Програма спочатку перетворює кожен рівень на <b>факт події</b>: 1 — натиснута, 0 — ні. Лише потім додає.<br>Чому не можна просто додати <code>digitalRead(BTN_A) + digitalRead(BTN_B)</code>? З INPUT_PULLUP відпущена кнопка дає HIGH (1) — і сума рахувала б <b>відпущені</b> кнопки.<br>Кнопки тут фіксуються: клацни, щоб натиснути, ще раз — щоб відпустити. Перевір усі чотири комбінації.',
        goal: (M, ctx) => ['00', '10', '01', '11'].every(p => Object.keys(ctx.seen).some(k => k.startsWith(p + ':')))
          ? { ok: true, msg: 'Чотири комбінації — три можливі суми: 0, 1 або 2 події. Сума працює, бо ми додаємо факти (0/1), а не сирі рівні.' }
          : { ok: false, msg: `Перевірено комбінацій: ${['00', '10', '01', '11'].filter(p => Object.keys(ctx.seen).some(k => k.startsWith(p + ':'))).length} з 4.` }
      },
      {
        type: 'scene',
        title: 'millis(): годинник усередині Arduino',
        blocks: [
          { text: '<p>Як дізнатися, скільки часу минуло між двома подіями?</p><p>Arduino має вбудований годинник. <code>millis()</code> повертає, скільки мілісекунд минуло від запуску програми.</p><p><i>Аналогія:</i> секундомір, який ніхто не зупиняє. Щоб виміряти інтервал, запам’ятовують показ на початку і віднімають його від показу в кінці.</p><p>Це число швидко росте: за хвилину — 60&nbsp;000. У звичайну змінну int (до 32&nbsp;767) воно не вміститься, тому беремо тип <b>long</b> — «довге» ціле.</p>' },
          { code: 'long start = millis();      // показ на початку\n…                            // тут щось відбувається\nlong interval = millis() - start;   // скільки минуло', hl: 3 }
        ],
        notes: { title: 'millis()', text: 'millis() — мілісекунди від запуску програми. Інтервал = millis() − start, де start — показ на початку. Тип long, бо число велике.' }
      },
      {
        type: 'live',
        circuit: 'btn', view: 'schematic', pin: 13, led: 'L1', ledNets: ['sig', 'mid', 'lk'],
        inputs: [{ pin: 2, part: 'B1', wiring: 'gnd' }],
        title: 'Скільки тримали кнопку?',
        code: `#define BTN 2
long start = 0;
bool wasPressed = false;

void setup() {
  pinMode(BTN, INPUT_PULLUP);
  Serial.begin(9600);
}

void loop() {
  bool isPressed = (digitalRead(BTN) == LOW);
  if (isPressed && !wasPressed) {      // щойно натиснули
    start = millis();
  }
  if (!isPressed && wasPressed) {      // щойно відпустили
    Serial.print("Тримали: ");
    Serial.print(millis() - start);
    Serial.println(" мс");
  }
  wasPressed = isPressed;
}`,
        hl: [13, 17],
        text: 'Перший приклад із millis(). Програма запам’ятовує показ годинника, коли кнопку <b>натиснули</b>, і рахує різницю, коли її <b>відпустили</b>.<br>Як програма дізнається, що кнопку «щойно» натиснули? Порівнює зараз (<code>isPressed</code>) із тим, що було на попередньому колі loop() (<code>wasPressed</code>).<br>Натисни кнопку тричі: коротко, довше й ще довше.',
        goal: (M, ctx) => ctx.lines >= 3
          ? { ok: true, msg: 'Кожне число — інтервал між двома подіями: натисканням і відпусканням. Саме так міряють будь-який час у програмах: запам’ятати показ millis() на початку й відняти в кінці.' }
          : { ok: false, msg: `Вимірювань: ${ctx.lines} з 3.` },
        notes: { title: 'Інтервал між подіями', text: 'start = millis() у момент першої події; millis() − start у момент другої. Подію «щойно натиснули» помічаємо, порівнюючи стан зараз і на попередньому колі loop().' }
      },
      {
        type: 'live',
        circuit: 'btn', view: 'schematic', pin: 13, led: 'L1', ledNets: ['sig', 'mid', 'lk'],
        inputs: [{ pin: 2, part: 'B1', wiring: 'gnd' }],
        removable: true,
        title: 'Навіщо wasPressed?',
        code: HOLD,
        text: 'Клацни по рядку коду — він вимкнеться (стане закресленим), і програма працюватиме без нього. Ще клацання — рядок повернеться.<br>Вимкни останній рядок loop() — <code>wasPressed = isPressed;</code> — і натисни кнопку кілька разів. Чому програма мовчить?',
        goal: (M, ctx) => !ctx.off.includes(lnOf(HOLD, 'wasPressed = isPressed'))
          ? { ok: false, msg: 'Вимкни рядок <code>wasPressed = isPressed;</code> — клацни по ньому.' }
          : ctx.presses >= 2
            ? { ok: true, msg: 'Без цього рядка wasPressed завжди false. Поки кнопку тримають, програма на кожному колі вважає, що її «щойно натиснули», і знову скидає start. А «щойно відпустили» (<code>!isPressed && wasPressed</code>) не настає ніколи — тож і друку немає. Пам’ять про попередній стан — ключ до помічання подій.' }
            : { ok: false, msg: 'Натисни й відпусти кнопку кілька разів.' }
      },
      {
        type: 'live',
        circuit: 'btn', view: 'schematic', pin: 13, led: 'L1', ledNets: ['sig', 'mid', 'lk'],
        inputs: [{ pin: 2, part: 'B1', wiring: 'gnd' }],
        title: 'Виміряй свою реакцію',
        code: `#define BTN 2
#define LED 13
long start = 0;     // коли засвітився сигнал (або коли гасили)
bool lit = false;   // чи світиться сигнал зараз

void setup() {
  pinMode(BTN, INPUT_PULLUP);
  pinMode(LED, OUTPUT);
  Serial.begin(9600);
}

void loop() {
  bool isPressed = (digitalRead(BTN) == LOW);
  if (!lit && !isPressed && millis() - start >= 2000) {   // минуло 2 с — сигнал!
    digitalWrite(LED, HIGH);
    lit = true;
    start = millis();
  }
  if (lit && isPressed) {                                 // натиснули — рахуємо реакцію
    long reaction = millis() - start;
    digitalWrite(LED, LOW);
    lit = false;
    start = millis();
    Serial.print("Реакція: ");
    Serial.print(reaction);
    Serial.println(" мс");
  }
}`,
        text: 'Тренажер реакції: через 2&nbsp;с після попереднього вимірювання світлодіод спалахує, а ти якомога швидше натискаєш кнопку.<br>Програма не чекає й не «спить»: loop() крутиться весь час і на кожному колі перевіряє дві умови — чи пора засвітити сигнал і чи вже натиснули кнопку.<br>Зроби три спроби. Чи однаковий результат?',
        goal: (M, ctx) => ctx.lines >= 3
          ? { ok: true, msg: 'Результати щоразу трохи різні — це нормально: будь-яке вимірювання має розкид. Типова реакція людини на світло — 200–300&nbsp;мс (у симуляторі додається ще затримка браузера).' }
          : { ok: false, msg: `Спроб: ${ctx.lines} з 3.` },
        notes: { title: 'Вимірювання інтервалу', text: 'start = millis() у момент першої події; millis() − start у момент другої — інтервал між ними в мілісекундах.' }
      }
    ],

    skills: [
      'Розрізняю подію, рівень на виводі й рішення програми',
      'Пояснюю плаваючий вхід і роль підтягувального резистора',
      'Підключаю кнопку з INPUT_PULLUP і знаю, що натиснуто = LOW',
      'Зберігаю факт події в bool і перевертаю його через !',
      'Поєдную факти через && («і») та || («або»)',
      'Додаю факти подій (0/1), а не сирі рівні',
      'Виводжу дані в Serial Monitor, щоб перевірити програму',
      'Вимірюю інтервал між подіями за допомогою millis() — без зупинки програми'
    ],

    practice: {
      intro: 'Збери в Tinkercad Circuits: <b>Arduino Uno R3</b>, тактову кнопку між D2 і GND (через рівчак макетки) і світлодіод з резистором 220&nbsp;Ом на D13.',
      tasks: [
        'Зроби світло, що працює, поки кнопку утримують. Запиши стан входу (HIGH/LOW) і стан світлодіода для натиснутої й відпущеної кнопки.',
        'Перероби: світло працює, поки кнопка відпущена. Запиши таблицю чотирьох станів (2 варіанти × 2 положення кнопки).',
        'Знайди й виправ помилку: <code>if (digitalRead(2) == HIGH)</code> у схемі з INPUT_PULLUP, де світло мало вмикатися натисканням.',
        'Заміни INPUT_PULLUP на INPUT і подивись, що робить світлодіод. Поясни, чому.',
        'Додай другу кнопку і виведи в Serial Monitor кількість натиснутих кнопок (0, 1 або 2). Перевір усі чотири комбінації.',
        'Збери тренажер реакції з millis(). Зроби 5 спроб і запиши результати в таблицю. Яка найкраща? Наскільки відрізняються найшвидша й найповільніша?',
        'Із зірочкою: поясни своїми словами, чому кнопка сама не створює напругу.'
      ]
    },

    next: { id: 'neopixel' },
    teaser: 'Наступного разу: адресна стрічка NeoPixel, цикл for і чому 5 / 2 = 2.'
  };
})();
