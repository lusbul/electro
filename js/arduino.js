/* Міні-симулятор Arduino для уроків курсу (навчальна модель, не повний компілятор C++).
   Уроки 3–4: #define, int, = + - * / ( ), setup()/loop(), pinMode, digitalWrite, delay, analogRead, analogWrite, Serial.
   Модуль 2 (уроки 5–8): if / else, == != < > <= >=, && || !, bool, float, %, ++ --, += -=, for, while,
     digitalRead + INPUT_PULLUP, масиви та sizeof, tone / noTone, millis, бібліотека Adafruit_NeoPixel.
   Повертає хронологію подій (час, рядок, рівні виводів, кадри стрічки, звук) або зрозумілу помилку українською. */
(function () {
  const CONST = { HIGH: 1, LOW: 0, OUTPUT: 'OUTPUT', INPUT: 'INPUT', INPUT_PULLUP: 'INPUT_PULLUP', true: 1, false: 0,
    NEO_GRB: 0x52, NEO_RGB: 0x06, NEO_KHZ800: 0x0000, NEO_KHZ400: 0x0100 };
  const TYPES = { int: 'int', bool: 'bool', boolean: 'bool', float: 'float', double: 'float', long: 'long', byte: 'byte', uint32_t: 'long', uint8_t: 'byte', uint16_t: 'long' };
  const SIZE = { int: 2, bool: 1, float: 4, long: 4, byte: 1 };

  class CodeError extends Error { constructor(line, msg) { super(msg); this.line = line; } }

  /* ---------- Лексер ---------- */
  function lex(src) {
    const toks = [], defines = {}, defineLines = {}, includes = [];
    src.split('\n').forEach((raw, li) => {
      const line = li + 1;
      let s = raw.replace(/\/\/.*$/, '');
      if (/^\s*#/.test(s)) {
        const inc = s.match(/^\s*#\s*include\s*[<"]([\w./]+)[>"]\s*$/);
        if (inc) { includes.push(inc[1]); return; }
        const d = s.match(/^\s*#\s*define\s+(\w+)\s*(.*)$/);
        if (!d) throw new CodeError(line, 'Незрозумілий рядок з «#». Має бути: #define ІМ’Я значення або #include <Бібліотека.h>');
        const val = d[2].trim();
        if (!val) throw new CodeError(line, `Після #define ${d[1]} бракує значення`);
        if (/;\s*$/.test(val)) throw new CodeError(line, 'Після #define крапку з комою не ставлять: це не команда, а підстановка тексту');
        if (/(^|[^=!<>])=($|[^=])/.test(val)) throw new CodeError(line, 'У #define знак «=» не потрібен: пиши #define ІМ’Я значення');
        defines[d[1]] = val; defineLines[d[1]] = line;
        return;
      }
      const re = /\s*("(?:[^"\\]|\\.)*"?|[A-Za-z_]\w*|\d+\.\d*|\d+|==|!=|<=|>=|&&|\|\||\+\+|--|\+=|-=|\*=|\/=|%=|[(){}\[\];=,+\-*/%.<>!&|]|\S)/y;
      let m; re.lastIndex = 0;
      while (re.lastIndex < s.length && (m = re.exec(s))) {
        if (!m[1]) break;
        toks.push({ v: m[1], line });
      }
    });
    return { toks, defines, defineLines, includes };
  }

  /* ---------- Парсер ---------- */
  const ASSIGN = ['=', '+=', '-=', '*=', '/=', '%='];
  function parse(src) {
    const { toks, defines, defineLines, includes } = lex(src);
    const forVars = new Set();
    let p = 0;
    const peek = (k = 0) => toks[p + k], next = () => toks[p++];
    const is = v => peek() && peek().v === v;
    const lastLine = () => (toks[p - 1] || toks[0] || { line: 1 }).line;
    const expect = (v, msg) => {
      const t = peek();
      if (!t || t.v !== v) throw new CodeError(t && v !== ';' ? t.line : lastLine(), msg || `Очікувалось «${v}»`);
      return next();
    };
    const semi = () => expect(';', 'Бракує крапки з комою «;» у кінці рядка');
    const isIdent = t => t && /^[A-Za-z_]\w*$/.test(t.v);
    const args = () => {
      const a = [];
      if (!is(')')) { a.push(expr()); while (is(',')) { next(); a.push(expr()); } }
      expect(')', 'Бракує закриваючої дужки «)»');
      return a;
    };

    /* Вирази: || → && → == != → < > <= >= → + - → * / % → унарні → первинні */
    const bin = (sub, ops) => () => {
      let n = sub();
      while (peek() && ops.includes(peek().v)) { const t = next(); n = { op: t.v, a: n, b: sub(), line: t.line }; }
      return n;
    };
    function unary() {
      if (is('!')) { const t = next(); return { un: '!', a: unary(), line: t.line }; }
      if (is('-')) { const t = next(); return { un: '-', a: unary(), line: t.line }; }
      if (is('+')) { next(); return unary(); }
      return postfix();
    }
    function postfix() {
      let n = primary();
      while (is('[')) { const t = next(); const i = expr(); expect(']', 'Бракує закриваючої квадратної дужки «]»'); n = { idx: n, i, line: t.line }; }
      if (is('++') || is('--')) throw new CodeError(peek().line, '«++» і «--» пиши окремою командою, наприклад: i++;');
      return n;
    }
    function primary() {
      const t = next();
      if (!t) throw new CodeError(lastLine(), 'Вираз обірвався');
      if (/^\d/.test(t.v)) return { num: +t.v, fl: t.v.includes('.'), line: t.line };
      if (t.v[0] === '"') { if (t.v.length < 2 || !t.v.endsWith('"')) throw new CodeError(t.line, 'Бракує закриваючих лапок «"»'); return { str: t.v.slice(1, -1), line: t.line }; }
      if (t.v === '(') { const e = expr(); expect(')', 'Бракує закриваючої дужки «)»'); return e; }
      if (isIdent(t)) {
        if (t.v === 'sizeof') { expect('(', 'Після sizeof потрібні дужки'); const e = expr(); expect(')', 'Бракує «)»'); return { sizeof: e, line: t.line }; }
        if (is('.') && isIdent(peek(1))) {                              // strip.Color(…), strip.numPixels()
          next(); const m = next(); expect('(', `Після ${t.v}.${m.v} потрібні дужки ()`);
          return { mcall: t.v, m: m.v, args: args(), line: t.line };
        }
        if (is('(')) { next(); return { fcall: t.v, args: args(), line: t.line }; }
        return { name: t.v, line: t.line };
      }
      if (t.v === '=') throw new CodeError(t.line, 'Зайвий знак «=»');
      throw new CodeError(t.line, `Незрозумілий символ «${t.v}»`);
    }
    const mul = bin(unary, ['*', '/', '%']), add = bin(mul, ['+', '-']), rel = bin(add, ['<', '>', '<=', '>=']),
      eq = bin(rel, ['==', '!=']), and = bin(eq, ['&&']), expr = bin(and, ['||']);

    /* Умова в дужках if / while / for: перехоплюємо «=» замість «==» */
    function cond(what) {
      const e = expr();
      if (is('=')) throw new CodeError(peek().line, `В умові ${what} потрібне порівняння «==». Один знак «=» — це присвоювання: він кладе значення в змінну, а не порівнює`);
      return e;
    }

    function typeAt() {          // повертає тип і зсуває позицію, якщо тут оголошення
      let k = 0, isConst = false;
      if (peek(k) && peek(k).v === 'const') { isConst = true; k++; }
      let t = peek(k) && peek(k).v;
      if (t === 'unsigned' && peek(k + 1) && ['long', 'int'].includes(peek(k + 1).v)) { k++; t = 'long'; }
      if (!TYPES[t]) return null;
      for (let i = 0; i <= k; i++) next();
      return { type: TYPES[t], isConst };
    }
    function decl(ty, line, inFor) {
      const n = next();
      if (!isIdent(n)) throw new CodeError(line, `Після ${ty.type} має бути ім’я змінної`);
      if (is('(')) throw new CodeError(line, 'Власні функції з типом ще не вивчали — оголошуй змінні або void setup()/loop()');
      const d = { decl: n.v, type: ty.type, isConst: ty.isConst, line };
      if (is('[')) {
        next(); d.arr = true; d.size = is(']') ? null : expr(); expect(']', 'Бракує «]» після розміру масиву');
        if (is('=')) {
          next(); expect('{', 'Значення масиву пишуть у фігурних дужках: {1, 2, 3}');
          d.list = []; if (!is('}')) { d.list.push(expr()); while (is(',')) { next(); d.list.push(expr()); } }
          expect('}', 'Бракує закриваючої фігурної дужки «}» у списку значень');
        } else if (!d.size) throw new CodeError(line, 'Порожні дужки [] можна лише разом зі списком значень: int a[] = {…};');
      } else if (is('=')) { next(); d.e = expr(); }
      else if (ty.isConst) throw new CodeError(line, 'const-змінній треба одразу дати значення');
      if (!inFor) semi();
      return d;
    }
    function simple(noSemi) {     // присвоювання, ++/--, виклик — без крапки з комою, якщо noSemi
      let t = next();
      const fin = s => { if (!noSemi) semi(); return s; };
      if (!isIdent(t)) throw new CodeError(t.line, `Незрозуміле «${t.v}» на початку команди`);
      if (t.v === 'else') throw new CodeError(t.line, '«else» стоїть без «if» перед ним. Перевір фігурні дужки');
      let target = { name: t.v, line: t.line };
      if (is('.') && isIdent(peek(1))) {
        next(); const m = next();
        if (!is('(')) throw new CodeError(t.line, `Після «${t.v}.${m.v}» потрібні дужки ()`);
        next(); return fin({ call: t.v + '.' + m.v, obj: t.v, m: m.v, args: args(), line: t.line });
      }
      if (is('(')) { next(); return fin({ call: t.v, args: args(), line: t.line }); }
      while (is('[')) { next(); const i = expr(); expect(']', 'Бракує «]»'); target = { idx: target, i, line: t.line }; }
      if (is('++') || is('--')) { const op = next().v; return fin({ set: target, op: op === '++' ? '+=' : '-=', e: { num: 1 }, line: t.line, inc: op }); }
      if (peek() && ASSIGN.includes(peek().v)) { const op = next().v; const e = expr(); return fin({ set: target, op, e, line: t.line }); }
      if (is('==')) throw new CodeError(t.line, '«==» — це порівняння, воно нічого не змінює. Щоб покласти значення в змінну, потрібен один знак «=»');
      throw new CodeError(t.line, `Незрозуміла команда «${t.v}». Можливо, бракує дужок або знака «=»`);
    }
    function statement() {
      const t = peek();
      if (t.v === '{') return { blk: block(), line: t.line };
      if (t.v === 'if') {
        next(); expect('(', 'Після if потрібна умова в дужках: if (умова) { … }');
        const c = cond('if'); expect(')', 'Бракує «)» після умови');
        const then = body(); let els = null;
        if (is('else')) { next(); els = is('if') ? [statement()] : body(); }
        return { iff: c, then, els, line: t.line };
      }
      if (t.v === 'while') {
        next(); expect('(', 'Після while потрібна умова в дужках'); const c = cond('while'); expect(')', 'Бракує «)»');
        return { whl: c, body: body(), line: t.line };
      }
      if (t.v === 'for') {
        next(); expect('(', 'Після for потрібні дужки: for (початок; умова; крок)');
        let init = null;
        if (!is(';')) { const ty = typeAt(); init = ty ? decl(ty, t.line, true) : simple(true); if (init.decl) forVars.add(init.decl); }
        expect(';', 'У for між початком, умовою і кроком стоять крапки з комою «;»');
        const c = is(';') ? { num: 1 } : cond('for'); expect(';', 'У for між умовою і кроком потрібна «;»');
        const step = is(')') ? null : simple(true); expect(')', 'Бракує «)» у for');
        return { fr: true, init, c, step, body: body(), line: t.line };
      }
      if (t.v === 'return') { next(); if (!is(';')) expr(); semi(); return { ret: true, line: t.line }; }
      if (t.v === 'else') throw new CodeError(t.line, '«else» стоїть без «if» перед ним. Перевір фігурні дужки');
      const ty = typeAt(); if (ty) return decl(ty, t.line);
      if (isIdent(t) && isIdent(peek(1)) && /^[A-Z]/.test(t.v) && peek(2) && peek(2).v === '(') return objDecl();
      return simple();
    }
    function objDecl() {
      const cls = next(), name = next(); expect('(', '');
      const d = { obj: name.v, cls: cls.v, args: args(), line: cls.line }; semi(); return d;
    }
    function body() { return is('{') ? block() : [statement()]; }
    function block() {
      expect('{', 'Бракує відкриваючої фігурної дужки «{»');
      const b = [];
      while (peek() && !is('}')) b.push(statement());
      if (!peek()) throw new CodeError(lastLine(), 'Бракує закриваючої фігурної дужки «}»');
      next();
      return b;
    }

    const globals = [], funcs = {};
    while (p < toks.length) {
      const t = peek();
      if (t.v === 'void') {
        next(); const name = next();
        if (!name) throw new CodeError(t.line, 'Після void має бути назва функції');
        expect('(', `Після ${name.v} мають бути дужки ()`); expect(')', 'Бракує «)»');
        funcs[name.v] = { body: block(), line: name.line };
        continue;
      }
      const ty = typeAt();
      if (ty) { globals.push(decl(ty, t.line)); continue; }
      if (isIdent(t) && isIdent(peek(1)) && peek(2) && peek(2).v === '(') { globals.push(objDecl()); continue; }
      throw new CodeError(t.line, `«${t.v}» стоїть поза функціями. Команди пишуть усередині setup() { } або loop() { }`);
    }
    if (!funcs.setup) throw new CodeError(1, 'Немає функції setup()');
    if (!funcs.loop) throw new CodeError(1, 'Немає функції loop()');
    return { globals, funcs, defines, defineLines, includes, forVars };
  }

  /* ---------- Виконання ----------
     Одна «машина» для двох режимів: run() — швидко прорахувати хронологію, live() — у реальному часі з живими входами. */
  const KNOWN = { pinMode: [2], digitalWrite: [2], delay: [1], analogWrite: [2], tone: [2, 3], noTone: [1],
    'Serial.begin': [1], 'Serial.print': [1, 2], 'Serial.println': [0, 1, 2] };
  const EXPR_FUNCS = ['analogRead', 'digitalRead', 'millis'];
  const PWM_PINS = [3, 5, 6, 9, 10, 11];
  const ANALOG = { A0: 14, A1: 15, A2: 16, A3: 17, A4: 18, A5: 19 };
  const NEO = { begin: [0], show: [0], clear: [0], setPixelColor: [2, 4], setBrightness: [1] };

  const wrap = (type, v) => {
    if (type === 'float') return v;
    if (type === 'bool') return v ? 1 : 0;
    v = Math.trunc(v);
    if (type === 'int') return ((v + 32768) % 65536 + 65536) % 65536 - 32768;     // int в Arduino UNO — 16 біт
    if (type === 'byte') return ((v % 256) + 256) % 256;
    return v;
  };

  function machine(prog, io) {
    const scopes = [{}], modes = {}, levels = {}, warnings = [], defExpr = {}, objs = {};
    const M = { vars: scopes[0], modes, levels, warnings, objs, t: 0, baud: 0, events: [], ops: 0 };
    const look = nm => { for (let k = scopes.length - 1; k >= 0; k--) if (nm in scopes[k]) return scopes[k][nm]; return null; };
    const warnOnce = (key, w) => { if (!warnings.some(x => x.key === key)) warnings.push({ key, ...w }); };
    const unknown = (nm, line) => {
      const all = [...scopes.flatMap(s => Object.keys(s)), ...Object.keys(prog.defines), ...Object.keys(CONST), ...Object.keys(ANALOG)];
      const guess = all.find(k => k.toLowerCase() === nm.toLowerCase());
      if (!guess && prog.forVars && prog.forVars.has(nm)) return new CodeError(line, `«${nm}» оголошено в заголовку for — ця змінна існує лише всередині циклу`);
      return new CodeError(line, guess ? `Невідоме ім’я «${nm}». Можливо, «${guess}»? Великі й малі літери різняться`
        : `Невідоме ім’я «${nm}»: його не оголошено ні через #define, ні як змінну`);
    };

    /* чи дробовий вираз (float) — для ділення і виведення */
    const isF = n => {
      if (!n) return false;
      if (n.num !== undefined) return n.fl;
      if (n.name) { const v = look(n.name); if (v) return v.type === 'float'; if (n.name in prog.defines) return /\d\.\d*/.test(prog.defines[n.name]); return false; }
      if (n.idx) { const v = n.idx.name && look(n.idx.name); return !!v && v.type === 'float'; }
      if (n.un === '-') return isF(n.a);
      if (n.op && ['+', '-', '*', '/'].includes(n.op)) return isF(n.a) || isF(n.b);
      return false;
    };

    const val = (n, line) => {
      if (++M.ops > 200000) throw new CodeError(line, 'Програма «зависла»: цикл виконується без кінця і без delay. Перевір умову циклу');
      line = n.line || line;
      if (n.num !== undefined) return n.num;
      if (n.str !== undefined) return { s: n.str };
      if (n.un === '!') { const a = val(n.a, line); return a ? 0 : 1; }
      if (n.un === '-') return -num(val(n.a, line), line);
      if (n.op) {
        if (n.op === '&&') return num(val(n.a, line), line) && num(val(n.b, line), line) ? 1 : 0;
        if (n.op === '||') return num(val(n.a, line), line) || num(val(n.b, line), line) ? 1 : 0;
        const a = num(val(n.a, line), line), b = num(val(n.b, line), line);
        switch (n.op) {
          case '+': return a + b; case '-': return a - b; case '*': return a * b;
          case '/': if (b === 0) throw new CodeError(line, 'Ділення на нуль'); return isF(n.a) || isF(n.b) ? a / b : Math.trunc(a / b);   // int / int — ціле
          case '%':
            if (isF(n.a) || isF(n.b)) throw new CodeError(line, 'Остача «%» працює лише з цілими числами');
            if (b === 0) throw new CodeError(line, 'Остача від ділення на нуль не визначена'); return a % b;
          case '==': return a === b ? 1 : 0; case '!=': return a !== b ? 1 : 0;
          case '<': return a < b ? 1 : 0; case '>': return a > b ? 1 : 0; case '<=': return a <= b ? 1 : 0; case '>=': return a >= b ? 1 : 0;
        }
      }
      if (n.idx) {
        const v = n.idx.name ? look(n.idx.name) : null;
        if (!v) throw n.idx.name ? unknown(n.idx.name, line) : new CodeError(line, 'Квадратні дужки [ ] можна ставити лише після імені масиву');
        if (!v.arr) throw new CodeError(line, `«${n.idx.name}» — не масив, у нього немає елементів [ ]`);
        const i = num(val(n.i, line), line);
        if (i !== Math.trunc(i)) throw new CodeError(line, 'Номер елемента масиву має бути цілим');
        if (i < 0 || i >= v.arr.length) throw new CodeError(line, `Індекс ${i} поза межами масиву ${n.idx.name}: дозволено 0…${v.arr.length - 1}`);
        return v.arr[i];
      }
      if (n.sizeof) {
        const e = n.sizeof;
        if (e.name) { const v = look(e.name); if (!v) throw unknown(e.name, line); return SIZE[v.type] * (v.arr ? v.arr.length : 1); }
        if (e.idx && e.idx.name) { const v = look(e.idx.name); if (!v) throw unknown(e.idx.name, line); return SIZE[v.type]; }
        throw new CodeError(line, 'sizeof рахує розмір змінної або масиву: sizeof(notes)');
      }
      if (n.mcall) {
        const o = objs[n.mcall];
        if (!o) throw new CodeError(line, `Об’єкт «${n.mcall}» не створено`);
        const a = n.args.map(x => num(val(x, line), line));
        if (n.m === 'Color') { if (a.length !== 3) throw new CodeError(line, 'Color(червоний, зелений, синій) — три числа 0…255'); return ((a[0] & 255) << 16 | (a[1] & 255) << 8 | (a[2] & 255)) >>> 0; }
        if (n.m === 'numPixels') return o.n;
        if (NEO[n.m]) throw new CodeError(line, `${n.mcall}.${n.m}() — це дія, а не число. Пиши її окремим рядком`);
        throw new CodeError(line, `У об’єкта ${n.mcall} немає методу «${n.m}»`);
      }
      if (n.fcall) {
        const f = n.fcall;
        if (!EXPR_FUNCS.includes(f)) {
          const g = [...EXPR_FUNCS, ...Object.keys(KNOWN)].find(k => k.toLowerCase() === f.toLowerCase());
          if (KNOWN[f]) throw new CodeError(line, `${f}(…) — це команда, вона не повертає числа. Пиши її окремим рядком`);
          throw new CodeError(line, g ? `Невідома функція «${f}». Правильно: ${g}` : `Невідома функція «${f}» у виразі`);
        }
        if (f === 'millis') return Math.floor(M.t);
        const pin = n.args.length === 1 ? num(val(n.args[0], line), line) : null;
        if (pin === null) throw new CodeError(line, `${f} потребує одного аргументу — номера виводу`);
        if (f === 'analogRead') {
          if (pin < 14 || pin > 19) throw new CodeError(line, 'analogRead читає лише аналогові входи A0–A5');
          return Math.max(0, Math.min(1023, Math.round(io.analogRead ? io.analogRead(pin, M.t) : 0)));
        }
        const md = modes[pin];
        if (md !== 'INPUT' && md !== 'INPUT_PULLUP') warnOnce('in' + pin, { line, msg: `Вивід ${pin} не налаштовано як вхід: бракує pinMode(${pin}, INPUT_PULLUP) або pinMode(${pin}, INPUT) у setup()` });
        const r = io.digitalRead ? io.digitalRead(pin, M.t, md) : (md === 'INPUT_PULLUP' ? 1 : 0);
        return r ? 1 : 0;
      }
      const nm = n.name, v = look(nm);
      if (v) { if (v.arr) throw new CodeError(line, `«${nm}» — масив. Щоб узяти елемент, потрібен номер: ${nm}[0]`); return v.v; }
      if (nm in prog.defines) {
        if (!defExpr[nm]) defExpr[nm] = parse(`void setup(){x=${prog.defines[nm]};} void loop(){}`).funcs.setup.body[0].e;
        return val(defExpr[nm], line);
      }
      if (nm in CONST) return CONST[nm];
      if (nm in ANALOG) return ANALOG[nm];
      if (objs[nm]) throw new CodeError(line, `«${nm}» — об’єкт. Щоб щось з ним зробити, виклич метод: ${nm}.show();`);
      throw unknown(nm, line);
    };
    const num = (x, line) => { if (typeof x !== 'number') throw new CodeError(line, 'Текст у лапках не можна додавати, порівнювати чи множити'); return x; };
    const ev = e => { M.events.push(e); if (io.event) io.event(e); };
    const show = x => typeof x === 'object' ? x.s : x;

    function declare(st) {
      const scope = scopes[scopes.length - 1];
      if (st.decl in scope && scopes.length === 1) throw new CodeError(st.line, `Змінну «${st.decl}» уже оголошено вище`);
      if (st.arr) {
        const size = st.size ? num(val(st.size, st.line), st.line) : (st.list || []).length;
        if (size <= 0) throw new CodeError(st.line, 'Розмір масиву має бути додатним');
        if (st.list && st.list.length > size) throw new CodeError(st.line, `У масив на ${size} елементів записано ${st.list.length} значень`);
        const arr = Array.from({ length: size }, (_, k) => st.list && k < st.list.length ? wrap(st.type, num(val(st.list[k], st.line), st.line)) : 0);
        scope[st.decl] = { type: st.type, arr, isConst: st.isConst };
      } else {
        const v = st.e ? val(st.e, st.line) : 0;
        if (typeof v !== 'number') throw new CodeError(st.line, `У змінну ${st.type} можна покласти лише число`);
        scope[st.decl] = { type: st.type, v: wrap(st.type, v), isConst: st.isConst };
      }
    }
    function assign(st) {
      const tg = st.set;
      const nm = tg.name || (tg.idx && tg.idx.name);
      if (!nm) throw new CodeError(st.line, 'Ліворуч від «=» має бути ім’я змінної');
      if (nm in prog.defines && !look(nm)) throw new CodeError(st.line, `${nm} — це ім’я з #define. Його не можна змінити через «=»: це лише підстановка тексту`);
      const v = look(nm);
      if (!v) throw new CodeError(st.line, `Змінну «${nm}» не оголошено. Спершу: int ${nm} = …;`);
      if (v.isConst) throw new CodeError(st.line, `«${nm}» оголошено як const — її значення змінювати не можна`);
      let rhs = val(st.e, st.line);
      if (typeof rhs !== 'number') throw new CodeError(st.line, 'У змінну можна покласти лише число');
      const get = () => tg.idx ? val(tg, st.line) : (v.arr ? (() => { throw new CodeError(st.line, `«${nm}» — масив. Присвоювати можна лише елементу: ${nm}[0] = …`); })() : v.v);
      if (st.op !== '=') {
        const cur = get(), o = st.op[0];
        if (o === '/' && rhs === 0) throw new CodeError(st.line, 'Ділення на нуль');
        rhs = o === '+' ? cur + rhs : o === '-' ? cur - rhs : o === '*' ? cur * rhs : o === '/' ? (v.type === 'float' || isF(st.e) ? cur / rhs : Math.trunc(cur / rhs)) : cur % rhs;
      }
      rhs = wrap(v.type, rhs);
      if (tg.idx) {
        const i = num(val(tg.i, st.line), st.line);
        if (!v.arr) throw new CodeError(st.line, `«${nm}» — не масив`);
        if (i < 0 || i >= v.arr.length || i !== Math.trunc(i)) throw new CodeError(st.line, `Індекс ${i} поза межами масиву ${nm}: дозволено 0…${v.arr.length - 1}`);
        v.arr[i] = rhs;
      } else { if (v.arr) get(); v.v = rhs; }
      ev({ t: M.t, line: st.line, kind: 'set', name: nm, val: rhs });
    }

    function* execBlock(list, newScope = true) {
      if (newScope) scopes.push({});
      try { for (const s of list) yield* exec(s); }
      finally { if (newScope) scopes.pop(); }
    }
    function* exec(st) {
      ev({ t: M.t, line: st.line, kind: 'line' });
      if (++M.ops > 200000) throw new CodeError(st.line, 'Програма «зависла»: цикл виконується без кінця і без delay. Перевір умову циклу');
      if (st.decl !== undefined) return declare(st);
      if (st.obj !== undefined && st.cls) {
        if (st.cls !== 'Adafruit_NeoPixel') throw new CodeError(st.line, `Клас «${st.cls}» невідомий симулятору`);
        if (!prog.includes.some(i => /Adafruit_NeoPixel/.test(i))) throw new CodeError(st.line, 'Бракує рядка #include <Adafruit_NeoPixel.h> на початку програми: без нього клас Adafruit_NeoPixel невідомий');
        const a = st.args.map(x => num(val(x, st.line), st.line));
        if (a.length < 2) throw new CodeError(st.line, 'Adafruit_NeoPixel strip(кількість, вивід, тип);');
        objs[st.obj] = { n: a[0], pin: a[1], buf: Array.from({ length: a[0] }, () => 0), bright: 255, begun: false };
        return;
      }
      if (st.set !== undefined) return assign(st);
      if (st.blk) { yield* execBlock(st.blk); return; }
      if (st.iff !== undefined) {
        const c = num(val(st.iff, st.line), st.line);
        ev({ t: M.t, line: st.line, kind: 'if', val: c ? 1 : 0 });
        if (c) yield* execBlock(st.then); else if (st.els) yield* execBlock(st.els);
        return;
      }
      if (st.whl !== undefined) {
        while (num(val(st.whl, st.line), st.line)) yield* execBlock(st.body);
        return;
      }
      if (st.fr) {
        scopes.push({});
        try {
          if (st.init) { if (st.init.decl !== undefined) declare(st.init); else yield* exec(st.init); }
          while (num(val(st.c, st.line), st.line)) {
            yield* execBlock(st.body);
            if (st.step) yield* exec(st.step);
          }
        } finally { scopes.pop(); }
        return;
      }
      if (st.ret) return;
      if (st.obj && st.m) {                                    // виклик методу об’єкта: strip.show()
        if (st.obj === 'Serial') return yield* builtin('Serial.' + st.m, st);
        const o = objs[st.obj];
        if (!o) throw new CodeError(st.line, prog.includes.length || st.obj !== 'strip' ? `Об’єкт «${st.obj}» не створено` : 'Об’єкт strip не створено. Потрібні #include <Adafruit_NeoPixel.h> і рядок Adafruit_NeoPixel strip(…);');
        if (!NEO[st.m]) {
          const g = Object.keys(NEO).find(k => k.toLowerCase() === st.m.toLowerCase());
          throw new CodeError(st.line, g ? `У об’єкта ${st.obj} немає методу «${st.m}». Правильно: ${g}` : `У об’єкта ${st.obj} немає методу «${st.m}»`);
        }
        if (!NEO[st.m].includes(st.args.length)) throw new CodeError(st.line, st.m === 'setPixelColor' ? 'setPixelColor(номер, колір) або setPixelColor(номер, червоний, зелений, синій)' : `${st.obj}.${st.m}() — неправильна кількість аргументів`);
        const a = st.args.map(x => num(val(x, st.line), st.line));
        if (st.m === 'begin') o.begun = true;
        else if (st.m === 'setBrightness') o.bright = Math.max(0, Math.min(255, a[0]));
        else if (st.m === 'clear') o.buf.fill(0);
        else if (st.m === 'setPixelColor') {
          const c = a.length === 4 ? ((a[1] & 255) << 16 | (a[2] & 255) << 8 | (a[3] & 255)) >>> 0 : a[1] >>> 0;
          if (a[0] < 0 || a[0] >= o.n) warnOnce('px' + st.obj, { line: st.line, msg: `Піксель ${a[0]} не існує: у стрічці ${o.n} пікселів, номери 0…${o.n - 1}. Бібліотека мовчки пропускає такий рядок` });
          else o.buf[a[0]] = c;
        } else if (st.m === 'show') {
          if (!o.begun) warnOnce('begin' + st.obj, { line: st.line, msg: `Бракує ${st.obj}.begin(); у setup() — без нього стрічка не працюватиме` });
          ev({ t: M.t, line: st.line, kind: 'show', obj: st.obj, pin: o.pin, px: o.buf.slice(), bright: o.bright });
        }
        return;
      }
      yield* builtin(st.call, st);
    }
    function* builtin(f, st) {
      if (!(f in KNOWN)) {
        const g = Object.keys(KNOWN).find(k => k.toLowerCase() === f.toLowerCase());
        if (EXPR_FUNCS.includes(f)) throw new CodeError(st.line, `${f} повертає число — його треба покласти в змінну або використати в умові: value = ${f}(…);`);
        throw new CodeError(st.line, g ? `Невідома команда «${f}». Правильно: ${g} — великі й малі літери різняться` : `Невідома команда «${f}»`);
      }
      if (!KNOWN[f].includes(st.args.length)) throw new CodeError(st.line, `${f}: неправильна кількість аргументів`);
      const a = st.args.map(x => val(x, st.line));
      const pinOut = p => { if (modes[p] !== 'OUTPUT') warnOnce('out' + p, { pin: p, line: st.line, msg: `Вивід ${p} не налаштовано як вихід: бракує pinMode(${p}, OUTPUT) у setup()` }); };
      if (f === 'pinMode') {
        if (!['OUTPUT', 'INPUT', 'INPUT_PULLUP'].includes(a[1])) throw new CodeError(st.line, 'Другий аргумент pinMode — OUTPUT, INPUT або INPUT_PULLUP');
        modes[a[0]] = a[1]; ev({ t: M.t, line: st.line, kind: 'mode', pin: a[0], mode: a[1] });
      } else if (f === 'digitalWrite') {
        if (typeof a[1] !== 'number') throw new CodeError(st.line, 'Другий аргумент digitalWrite — HIGH або LOW');
        pinOut(a[0]);
        levels[a[0]] = a[1] ? 1 : 0; ev({ t: M.t, line: st.line, kind: 'write', pin: a[0], val: levels[a[0]] });
      } else if (f === 'analogWrite') {
        if (!PWM_PINS.includes(a[0])) throw new CodeError(st.line, `Вивід ${a[0]} не вміє ШІМ. На Arduino UNO це лише виводи з «~»: 3, 5, 6, 9, 10, 11`);
        const d = Math.max(0, Math.min(255, a[1] | 0));
        if (a[1] > 255) warnOnce('over', { over: 1, line: st.line, msg: `analogWrite отримав ${a[1]}, а максимум — 255. Перевір перетворення діапазону` });
        pinOut(a[0]);
        levels[a[0]] = d / 255; ev({ t: M.t, line: st.line, kind: 'pwm', pin: a[0], val: d });
      } else if (f === 'tone') {
        if (a[1] < 31) throw new CodeError(st.line, 'tone: частота має бути не менше 31 Гц');
        ev({ t: M.t, line: st.line, kind: 'tone', pin: a[0], f: a[1], dur: a.length === 3 ? a[2] : null });
      } else if (f === 'noTone') {
        ev({ t: M.t, line: st.line, kind: 'tone', pin: a[0], f: 0 });
      } else if (f === 'Serial.begin') {
        M.baud = a[0]; ev({ t: M.t, line: st.line, kind: 'baud', val: a[0] });
      } else if (f === 'Serial.print' || f === 'Serial.println') {
        if (!M.baud) throw new CodeError(st.line, 'Спершу відкрий зв’язок: Serial.begin(9600); у setup()');
        let v = a.length ? a[0] : '';
        let text = typeof v === 'object' ? v.s : (st.args.length && isF(st.args[0]) ? v.toFixed(a.length > 1 ? a[1] : 2) : String(v));
        ev({ t: M.t, line: st.line, kind: 'serial', text, nl: f === 'Serial.println' });
      } else if (f === 'delay') {
        if (a[0] < 0) throw new CodeError(st.line, 'delay не може бути від’ємним');
        ev({ t: M.t, line: st.line, kind: 'delay', ms: a[0] });
        M.ops = 0;
        yield a[0];
      }
    }
    function* program() {
      for (const st of prog.globals) yield* exec(st);
      yield* execBlock(prog.funcs.setup.body);
      if (!prog.funcs.loop.body.length) return;
      while (true) { yield* execBlock(prog.funcs.loop.body); M.ops = 0; yield -1; }   // -1: кінець одного проходу loop()
    }
    M.gen = program();
    return M;
  }

  function run(src, opt = {}) {
    const maxTime = opt.maxTime || 8000;
    let prog;
    try { prog = parse(src); } catch (e) { return { ok: false, error: { line: e.line, msg: e.message } }; }
    const M = machine(prog, opt);
    let steps = 0, iter = 0, loopT = 0;
    try {
      while (M.t < maxTime) {
        const r = M.gen.next();
        if (r.done) break;
        if (++steps > 20000) throw new CodeError(1, 'Програма виконує забагато команд без пауз');
        if (r.value === -1) {
          iter++;
          if (M.t === loopT && iter > 2 && !opt.noDelayOk) { M.warnings.push({ msg: 'У loop() немає delay: команди повторюються так швидко, що око не встигає побачити зміни' }); break; }
          if (iter > (opt.maxIter || 400)) break;
          loopT = M.t; continue;
        }
        M.t += r.value;
      }
    } catch (e) { return { ok: false, error: { line: e.line, msg: e.message }, events: M.events }; }
    return { ok: true, events: M.events, end: M.t, modes: M.modes, levels: M.levels, vars: M.vars, objs: M.objs, baud: M.baud, defines: prog.defines, warnings: M.warnings, loopLine: prog.funcs.loop.line, setupLine: prog.funcs.setup.line };
  }

  /* Живе виконання: tick(dt) просуває час на dt мс; входи читаються в момент виконання */
  function live(src, io = {}) {
    let prog;
    try { prog = parse(src); } catch (e) { return { ok: false, error: { line: e.line, msg: e.message } }; }
    const M = machine(prog, io);
    let wait = 0, done = false;
    M.ok = true;
    M.tick = dt => {
      if (done || !M.ok) return;
      const until = M.t + dt; let guard = 0, iters = 0;
      try {
        while (true) {
          if (wait > 0) { const step = Math.min(wait, until - M.t); M.t += step; wait -= step; if (wait > 0) break; }
          if (M.t >= until) break;
          const r = M.gen.next();
          if (r.done) { done = true; M.t = until; break; }
          if (r.value === -1) { if (++iters > 50) { M.t = until; break; } continue; }   // loop без delay: не більше 50 проходів за кадр
          wait = r.value;
          if (++guard > 5000) break;
        }
      } catch (e) { M.ok = false; M.error = { line: e.line, msg: e.message }; }
      if (M.events.length > 4000) M.events.splice(0, M.events.length - 2000);
    };
    M.line = () => { for (let k = M.events.length - 1; k >= 0; k--) { const e = M.events[k]; if (e.kind === 'delay' || e.kind === 'line') return e.line; } return null; };
    return M;
  }

  /* Рівень на виводі в момент часу t (мс) */
  function levelAt(res, pin, t) {
    let v = 0;
    for (const e of res.events) { if (e.t > t) break; if (e.kind === 'write' && e.pin === pin) v = e.val; }
    return v;
  }
  /* Рядок, що «виконується» в момент t: останній delay, що триває, або остання команда */
  function lineAt(res, t) {
    let ln = null;
    for (const e of res.events) {
      if (e.t > t) break;
      if (e.kind === 'delay' && t < e.t + e.ms) return e.line;
      if (e.kind === 'line') ln = e.line;
    }
    return ln;
  }

  /* Часова діаграма HIGH/LOW для одного виводу (SVG-рядок) */
  function diagram(res, pin, T, opt = {}) {
    const W = 640, H = 120, x0 = 54, x1 = W - 14, yH = 26, yL = 80, X = t => x0 + (x1 - x0) * t / T;
    let d = '', v = 0, cur = 0;
    const pts = [];
    for (const e of res.events) {
      if (e.t > T) break;
      if (e.kind === 'write' && e.pin === pin) { pts.push([e.t, e.val]); }
    }
    let path = `M${X(0)} ${yL}`; v = 0;
    pts.forEach(([t, val]) => { path += ` L${X(t)} ${v ? yH : yL} L${X(t)} ${val ? yH : yL}`; v = val; });
    path += ` L${X(T)} ${v ? yH : yL}`;
    const step = T <= 2000 ? 250 : T <= 5000 ? 500 : 1000;
    let ticks = '';
    for (let t = 0; t <= T + 1; t += step) ticks += `<line x1="${X(t)}" y1="${yL + 4}" x2="${X(t)}" y2="${yL + 9}" stroke="#8a93a0"/><text x="${X(t)}" y="${yL + 24}" text-anchor="middle" font-size="12" fill="#5a6573">${t}</text>`;
    return `<svg class="timing" viewBox="0 0 ${W} ${H}" role="img" aria-label="Часова діаграма виводу ${pin}">
      ${opt.label ? `<text x="${x1}" y="14" text-anchor="end" font-size="12" font-weight="700" fill="${opt.color || '#003FB8'}">${opt.label}</text>` : ''}
      <text x="6" y="${yH + 5}" font-size="13" font-weight="700" fill="#d93025">HIGH</text>
      <text x="6" y="${yL + 5}" font-size="13" font-weight="700" fill="#1F3B63">LOW</text>
      <line x1="${x0}" y1="${yL + 4}" x2="${x1}" y2="${yL + 4}" stroke="#c4cad3"/>
      ${ticks}<text x="${x1}" y="${H - 2}" text-anchor="end" font-size="11" fill="#5a6573">час, мс</text>
      <path d="${path}" fill="none" stroke="${opt.color || '#003FB8'}" stroke-width="3" stroke-linejoin="round"/>
      <line class="cursor" x1="${x0}" y1="12" x2="${x0}" y2="${yL + 6}" stroke="#EE7E42" stroke-width="2"/>
    </svg>`;
  }
  diagram.X = (T, t) => 54 + (640 - 14 - 54) * t / T;

  window.ArduinoSim = { run, live, levelAt, lineAt, diagram, PWM_PINS };
})();
