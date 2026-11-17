/* Тема 1.7 програми (урок 7 на сайті; файл sound): «Звук, масиви та остача від ділення».
   Частота, тривалість, пауза; активний і пасивний зумер; tone; масив — впорядкований набір з індексами від 0;
   два узгоджені масиви однакової довжини count; остача %: index = (index + 1) % count;
   індекс зберігається між проходами loop (оголошений поза loop). */
(function () {
  const lnOf = (code, t) => code.split('\n').findIndex(l => l.includes(t)) + 1;   // номер рядка з текстом t (для кроків, де рядки вимикають)
  const buz = {
    view: 'real', viewBox: '-50 -40 480 450',
    parts: { U1: { type: 'arduino-uno', x: 0, y: 0 }, Z1: { type: 'buzzer', x: 260, y: 168 } },
    nets: { s: ['U1.D8', 'Z1.+'], g: ['Z1.-', 'U1.GND2'] },
    via: { g: [[380, 228], [380, 8], [220, 8], [220, 28]] },
    colors: { s: '#d93025', g: '#222' }
  };
  const MEL = `int notes[] = {262, 294, 330, 392};
int durs[] = {200, 200, 200, 400};
int count = 4;
int index = 0;
`;
  const SONG = MEL + `
void setup() {
  Serial.begin(9600);
}

void loop() {
  tone(8, notes[index], durs[index]);
  Serial.println(index);
  delay(durs[index] + 50);
  index = (index + 1) % count;
}`;   // мелодія по колу (крок «Без чого мелодія не йде далі?»)

  /* ---------- Тренажер ---------- */
  const sch = { ...buz, view: 'schematic' };
  const tMod = (R, a, b) => ({ circuit: sch, q: `Чому дорівнює <code>${a} % ${b}</code>?`, unit: '', a: a % b, abs: 0.1,
    hint: 'Остача — те, що лишається після ділення націло.', sol: `${a} = ${b} · ${Math.trunc(a / b)} + ${a % b} → <b>${a % b}</b>.` });
  const tNext = (R, i, n) => ({ circuit: sch, q: `<code>count = ${n};</code> зараз <code>index = ${i};</code> Яким стане index після <code>index = (index + 1) % count;</code>?`,
    unit: '', a: (i + 1) % n, abs: 0.1, hint: 'Спершу дужки: index + 1, потім остача від ділення на count.',
    sol: `(${i} + 1) % ${n} = ${i + 1} % ${n} = <b>${(i + 1) % n}</b>.` });
  const tElem = (R, arr, i) => ({ circuit: sch, q: `<code>int notes[] = {${arr.join(', ')}};</code> Чому дорівнює <code>notes[${i}]</code>?`,
    unit: '', a: arr[i], abs: 0.1, hint: 'Перший елемент має індекс 0.', sol: `notes[0] = ${arr[0]}, … notes[${i}] = <b>${arr[i]}</b>.` });
  const tLen = (R, arr) => ({ circuit: sch, q: `<code>int notes[] = {${arr.join(', ')}};</code> Який найбільший допустимий індекс?`,
    unit: '', a: arr.length - 1, abs: 0.1, hint: 'Елементів ' + arr.length + ', а нумерація з нуля.', sol: `Індекси 0…${arr.length - 1} → <b>${arr.length - 1}</b>.` });
  const tTime = (R, d) => ({ circuit: sch, q: `<code>int durs[] = {${d.join(', ')}};</code> Між нотами ще пауза 50&nbsp;мс. Скільки мілісекунд триває один повний прохід мелодії?`,
    unit: 'мс', a: d.reduce((a, b) => a + b, 0) + 50 * d.length, abs: 0.5, hint: 'Сума всіх тривалостей + пауза після кожної ноти.',
    sol: `${d.join(' + ')} + ${d.length} · 50 = <b>${d.reduce((a, b) => a + b, 0) + 50 * d.length}</b> мс.` });

  window.LESSON = {
    id: 'sound',
    number: 7,
    title: 'Звук, масиви та остача від ділення',
    shareText: 'Урок «Звук, масиви та остача» пройдено! Моя мелодія грає по колу без жодної помилки 🎵',
    cardLines: ['Мелодія', 'грає по колу!'],

    circuits: { buz },

    steps: [
      {
        type: 'live',
        circuit: 'buz', buzzer: 'Z1',
        title: 'Arduino співає',
        code: MEL + `
void setup() {
  Serial.begin(9600);
}

void loop() {
  tone(8, notes[index], durs[index]);
  Serial.println(index);
  delay(durs[index] + 50);
  index = (index + 1) % count;
}`,
        text: 'До виводу 8 під’єднано маленький зумер. Увімкни звук (якщо хочеш) і послухай: чотири ноти по колу.<br>Подивись на Serial Monitor: які числа виводить програма? І що це за дивний рядок з <code>%</code> у кінці?',
        goal: (M, ctx) => (ctx.tones || 0) >= 9 ? { ok: true, msg: 'Індекси йдуть 0, 1, 2, 3, 0, 1, 2, 3… Мелодія повторюється без кінця й без помилок. Розберемо, як це влаштовано.' } : false
      },
      {
        type: 'scene',
        title: 'Звук: частота, тривалість, пауза',
        blocks: [
          { text: 'Звук — це коливання повітря. Зумер має пластинку, яка коливається, коли на неї подають імпульси.<br><b>Частота</b> (герци, Гц) — скільки коливань за секунду. Більша частота — вищий звук: 262&nbsp;Гц — «до» першої октави, 523&nbsp;Гц — «до» наступної.<br><b>Тривалість</b> — скільки мілісекунд звучить нота. <b>Пауза</b> — тиша між нотами.<br><b>Активний</b> зумер має власний генератор: подаєш HIGH — він пищить однією частотою. <b>Пасивний</b> генератора не має: частоту задає Arduino командою <code>tone(вивід, частота, тривалість)</code>. Сьогодні в нас пасивний.<br>Важливо: <code>tone</code> лише <b>запускає</b> звук і одразу переходить до наступного рядка — тому після нього потрібен <code>delay</code>.' }
        ],
        notes: { title: 'Звук і tone', text: 'Частота (Гц) — висота, тривалість — скільки звучить, пауза — тиша. Пасивний зумер: tone(вивід, частота, тривалість) — запускає звук і не чекає.' }
      },
      {
        type: 'scene',
        title: 'Мова схем: зумер',
        blocks: [
          { figure: 'symbols', figureOpts: { items: [{ name: 'Зумер (п’єзовипромінювач)', part: { type: 'buzzer' } }] } },
          { text: 'Зумер на схемі схожий на маленький гучномовець. Знак «+» показує вивід, який з’єднують із сигналом Arduino; другий — з GND.' }
        ],
        
      },
      {
        type: 'predict',
        blocks: [
          { text: `<pre class="code-mini">tone(8, 440, 300);
tone(8, 330, 300);
delay(300);</pre>` }
        ],
        question: 'Що почуємо?',
        options: [
          { text: 'Лише другу ноту, 330&nbsp;Гц', correct: true, feedback: 'Так. tone не чекає: перша нота лише почалася — і її одразу замінила друга. Щоб почути обидві, між ними потрібен delay(300).' },
          { text: 'Дві ноти одна за одною', feedback: 'tone запускає звук і миттєво переходить далі. Без паузи між ними перша нота не встигає прозвучати.' },
          { text: 'Дві ноти одночасно', feedback: 'Один вивід може видавати лише одну частоту за раз.' }
        ]
      },
      {
        type: 'scene',
        title: 'Масив: ряд комірок з номерами',
        blocks: [
          { text: `<pre class="code-mini">int notes[] = {262, 294, 330, 392};   // частоти
int durs[]  = {200, 200, 200, 400};   // тривалості
int count = 4;                        // скільки елементів</pre>
<b>Масив</b> — впорядкований набір значень одного типу під одним ім’ям. Кожен елемент має <b>індекс</b> — номер від 0.<br><code>notes[0]</code> = 262, <code>notes[3]</code> = 392. Індексу 4 тут немає!<br>Аналогія: шафка з пронумерованими комірками — <code>notes</code> — це назва шафки, а <code>[2]</code> — номер комірки. Ім’я масиву й індекс — різні речі.<br>Два масиви <b>узгоджені</b>: <code>notes[i]</code> і <code>durs[i]</code> описують одну й ту саму ноту. Тому вони мають однакову довжину — <code>count</code>.` }
        ],
        notes: { title: 'Масив', text: 'int a[] = {…}; — набір значень. Індекси 0…count−1. a[i] — елемент з номером i. Узгоджені масиви мають однакову довжину.' }
      },
      {
        type: 'live',
        circuit: 'buz', buzzer: 'Z1',
        title: 'Що буде після останньої ноти?',
        code: MEL + `
void setup() {
  Serial.begin(9600);
}

void loop() {
  tone(8, notes[index], durs[index]);
  Serial.println(index);
  delay(durs[index] + 50);
  [[sel:…|index = index + 1;|index = (index + 1) % count;]]
}`,
        text: 'Спробуй спершу варіант <code>index = index + 1;</code> і подивись, що станеться після четвертої ноти. Потім — другий варіант.',
        goal: (M, ctx, src) => {
          if (src.includes('…')) return { ok: false, msg: 'Обери варіант.' };
          if (src.includes('index = index + 1')) return { ok: false, msg: 'Після індексу 3 index стає 4 — а комірки notes[4] немає. Справжня плата не зупиниться: вона прочитає «сміття» з пам’яті й заграє дивні звуки. Наш симулятор зупиняє програму й показує помилку. Спробуй другий варіант.' };
          return (ctx.tones || 0) >= 6 ? { ok: true, msg: 'Після 3 іде 0 — мелодія повертається на початок. Це робить остача від ділення %.' } : false;
        }
      },
      {
        type: 'scene',
        title: 'Остача від ділення %',
        blocks: [
          { formula: 'index = (index + 1) % count' },
          { examples: [
          { given: '7 % 3', lines: ['7 = 3 · 2 + <b>1</b> → остача 1'] },
          { title: 'Приклад 2 · по колу', given: 'count = 4', lines: ['index 0 → 1 % 4 = 1', 'index 2 → 3 % 4 = 3', 'index 3 → 4 % 4 = <b>0</b> — назад на початок'] }
        ] },
          { text: '<code>%</code> — <b>остача від ділення</b> цілих чисел: що лишається після ділення націло.<br>Остача від ділення на count завжди в межах 0…count−1 — рівно ті індекси, що є в масиві.<br>Тому <code>(index + 1) % count</code> збільшує індекс, а після останнього повертає його до 0. Це не «додатковий ефект», а спосіб пройти масив по колу, ніколи не вийшовши за його межі.<br>Чому не <code>/</code>? <code>(3 + 1) / 4</code> = 1, а <code>(0 + 1) / 4</code> = 0 — ділення дає не індекс, а «скільки разів поміщається».' }
        ],
        notes: { title: 'Остача %', text: 'a % b — остача від ділення націло: 7 % 3 = 1. index = (index + 1) % count — індекс по колу 0…count−1.' }
      },
      {
        type: 'live',
        circuit: 'buz', buzzer: 'Z1',
        removable: true,
        title: 'Без чого мелодія не йде далі?',
        code: SONG,
        text: 'Клацни по рядку коду — він вимкнеться (стане закресленим). Ще клацання — рядок повернеться.<br>Вимкни рядок з остачею — <code>index = (index + 1) % count;</code>. Що показує Serial Monitor? (Увімкни звук під схемою, щоб почути.)',
        goal: (M, ctx) => !ctx.off.includes(lnOf(SONG, '% count'))
          ? { ok: false, msg: 'Вимкни рядок <code>index = (index + 1) % count;</code> — клацни по ньому.' }
          : (ctx.tones || 0) >= 3
            ? { ok: true, msg: 'Грає одна й та сама нота, а Serial Monitor весь час показує 0: index більше ніхто не змінює. Масив сам по собі не «прокручується» — індекс змінює лише наша програма.' }
            : false
      },
      {
        type: 'predict',
        blocks: [
          { text: 'Зараз:' },
          { code: 'count = 5;\nindex = 4;' }
        ],
        question: 'Яким стане index після index = (index + 1) % count?',
        options: [
          { text: '0', correct: true, feedback: 'Так: (4 + 1) % 5 = 5 % 5 = 0. Індекс 4 — останній у масиві з 5 елементів, далі — знову перший.' },
          { text: '5', feedback: '5 — це index + 1. Але % count повертає остачу: 5 % 5 = 0.' },
          { text: '1', feedback: '(4 + 1) / 5 = 1 — це ділення. Остача 5 % 5 = 0.' }
        ]
      },
      {
        type: 'scene',
        title: 'Де живе index',
        blocks: [
          { text: `<div class="two-col"><div><b>Пам’ятає ✓</b><pre class="code-mini">int index = 0;   // поза loop()

void loop() {
  tone(8, notes[index], …);
  …
  index = (index + 1) % count;
}</pre></div><div><b>Забуває ✗</b><pre class="code-mini">void loop() {
  int index = 0;  // щоразу 0!
  tone(8, notes[index], …);
  …
  index = (index + 1) % count;
}</pre></div></div>
Змінна, оголошена <b>всередині</b> loop(), створюється заново на кожному проході і знову отримує початкове значення.<br>Індекс має «пам’ятати» номер ноти між проходами loop(). Тому його оголошують <b>поза</b> loop().<br>У правому варіанті index на кожному проході знову стає 0 — мелодія «застрягне» на першій ноті.` }
        ],
        
      },
      {
        type: 'gen',
        bonus: { key: 'b', need: 20, text: '20 задач про масиви й остачу розв’язано! Ось твоя ексклюзивна наліпка!' },
        title: 'Масиви й остача',
        text: 'Обчисли остачу, наступний індекс, елемент масиву або тривалість мелодії.',
        need: 3,
        first: [R => tMod(R, 7, 3), R => tNext(R, 3, 4), R => tElem(R, [262, 294, 330, 392], 2)],
        make: R => {
          const k = R.pick(['mod', 'next', 'next', 'elem', 'len', 'time']);
          if (k === 'mod') return tMod(R, R.int(0, 30), R.pick([2, 3, 4, 5, 6, 8]));
          if (k === 'next') { const n = R.pick([3, 4, 5, 6, 8]); return tNext(R, R.int(0, n - 1), n); }
          const pool = [262, 294, 330, 349, 392, 440, 494, 523];
          const arr = Array.from({ length: R.pick([3, 4, 5, 6]) }, () => R.pick(pool));
          if (k === 'elem') return tElem(R, arr, R.int(0, arr.length - 1));
          if (k === 'len') return tLen(R, arr);
          return tTime(R, Array.from({ length: R.pick([3, 4, 5]) }, () => R.pick([100, 150, 200, 250, 300, 400])));
        }
      },
      {
        type: 'live',
        circuit: 'buz', buzzer: 'Z1',
        title: 'Додай п’яту ноту',
        code: `int notes[] = {262, 294, 330, 392, [[sel:…|440|440, 494]]};
int durs[] = {200, 200, 200, 400, [[sel:…|400|400, 400]]};
int count = [[sel:…|4|5|6]];
int index = 0;

void setup() {
  Serial.begin(9600);
}

void loop() {
  tone(8, notes[index], durs[index]);
  Serial.println(index);
  delay(durs[index] + 50);
  index = (index + 1) % count;
}`,
        text: 'Додай до мелодії одну ноту — 440&nbsp;Гц тривалістю 400&nbsp;мс. Обидва масиви й count мають бути узгоджені.<br>Перевір, що в Serial Monitor індекси пробігають 0…4 і повертаються до 0.',
        goal: (M, ctx, src) => {
          if (src.includes('…')) return { ok: false, msg: 'Обери варіант у кожному списку.' };
          const nN = (src.match(/notes\[\] = \{([^}]*)\}/)[1].split(',').length), nD = (src.match(/durs\[\] = \{([^}]*)\}/)[1].split(',').length), c = +src.match(/count = (\d)/)[1];
          if (nN !== nD) return { ok: false, msg: `У notes ${nN} елементів, а в durs — ${nD}. Узгоджені масиви мають однакову довжину.` };
          if (c > nN) return { ok: false, msg: `count = ${c}, а елементів ${nN}: програма вийде за межі масиву.` };
          if (c < nN) return { ok: false, msg: `count = ${c}, а елементів ${nN}: остання нота ніколи не зазвучить.` };
          if (nN !== 5) return { ok: false, msg: 'Треба додати рівно одну ноту — разом 5.' };
          return (ctx.tones || 0) >= 7 ? { ok: true, msg: 'Мелодія з п’яти нот грає по колу. Масиви узгоджені, count = 5, а остача % сама повертає індекс з 4 на 0.' } : false;
        }
      },
      {
        type: 'scene',
        title: 'count можна порахувати',
        blocks: [
          { text: `<pre class="code-mini">int notes[] = {262, 294, 330, 392, 440};
int count = sizeof(notes) / sizeof(notes[0]);</pre>
<code>sizeof(notes)</code> — скільки байтів займає весь масив (на Arduino Uno один int — 2&nbsp;байти: 5 · 2 = 10).<br><code>sizeof(notes[0])</code> — скільки займає один елемент (2).<br>10 / 2 = 5 — кількість елементів. Тепер, додаючи ноту, не треба вручну змінювати count — головне, щоб durs мав стільки ж елементів.` }
        ],
        
      },
      {
        type: 'predict',
        blocks: [
          { text: 'Перевір себе.' },
          { code: 'int notes[] = {262, 330, 392};\nint count = 4;\n…\nindex = (index + 1) % count;' }
        ],
        question: 'Що станеться?',
        options: [
          { text: 'На четвертому кроці програма прочитає notes[3], якого немає', correct: true, feedback: 'Так. count більший за кількість елементів: індекс дійде до 3, а в масиві лише 0…2. Остача не рятує, якщо count неправильний.' },
          { text: 'Мелодія з трьох нот гратиме по колу', feedback: 'Остача від ділення на 4 дає 0, 1, 2, 3 — а елемента з індексом 3 немає.' },
          { text: 'Четверта нота буде тишею', feedback: 'Масив не має «порожніх» місць за межами — програма прочитає випадкові дані з пам’яті.' }
        ]
      }
    ],

    skills: [
      'Розрізняю частоту, тривалість і паузу; знаю різницю між активним і пасивним зумером',
      'Запускаю звук командою tone і розумію, що вона не чекає',
      'Створюю масив і звертаюся до елемента за індексом від 0',
      'Узгоджую два масиви однакової довжини count',
      'Обчислюю остачу % і проходжу масив по колу: index = (index + 1) % count',
      'Зберігаю індекс між проходами loop()'
    ],

    practice: {
      intro: 'Збери в Tinkercad Circuits: Arduino Uno R3 і п’єзо-зумер (Piezo): «+» — до виводу 8, другий вивід — до GND.',
      tasks: [
        'Склади власну мелодію з 4–6 нот у двох масивах (частоти й тривалості).',
        'Виведи в Serial Monitor індекс кожної ноти і заповни таблицю індексів за два повні проходи.',
        'Додай одну ноту (разом із тривалістю), зміни count і передбач, коли індекс повернеться до 0.',
        'Прибери одну ноту з обох масивів і перевір мелодію.',
        'Заміни % на / і поясни, що змінилося і чому.',
        'Зміни один елемент масиву частот і спершу передбач, як зміниться звук.',
        'Із зірочкою: обчисли count через sizeof.'
      ]
    },

    next: { id: 'seg7' },
    teaser: 'Наступного разу: семисегментний індикатор, власні функції і прилад, який грає мелодію й водночас слухає кнопку.'
  };
})();
