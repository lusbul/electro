/* Перелік уроків для головної сторінки — за навчальною програмою
   «Електроніка та приладобудування» (детальна розбивка на теми). Один урок сайту = одна тема програми (10-годинні теми 3.5, 3.7, 3.8 — по два уроки).
   Розділ 5 (основи дослідницької діяльності) вплетено в теми 1.2, 1.4 і 2.1. Теми 1.4 і 1.5 переставлено (за рішенням авторки): if і Serial — у 1.5.
   module: '' — продовження попереднього розділу після лабораторної (без заголовка).
   id — кодове ім’я уроку: файл lessons/<id>.js, наліпки lessons/stickers/<id>.sticker.js, прогрес у браузері. Не залежить від номера (n) і теми — при перестановці уроків не змінюється.
   ready: true — урок опубліковано. lab — лабораторна після блоку (ready: true — є сторінка lab.html?l=<id>). */
window.COURSE = [
  { module: 'Вступ', lessons: [
    { id: 'intro', n: 0, topic: 'Вступ', title: 'Знайомство з курсом', ready: true }
  ]},
  { module: 'Розділ 1 · Електричні кола та мікроконтролерні пристрої', lessons: [
    { id: 'ohm', n: 1, topic: '1.1', title: 'Що керує струмом', ready: true, trainers: [{ key: 'b', topic: 'Закон Ома', need: 20 }] },
    { id: 'circuits', n: 2, topic: '1.2', title: 'З’єднання та мова схем', ready: true, trainers: [{ key: 'b', topic: 'Послідовне й паралельне з’єднання', need: 20 }, { key: 'k', topic: 'Закони Кірхгофа', need: 20 }] },
    { id: 'blink', n: 3, topic: '1.3', title: 'Світло за командою', ready: true, trainers: [{ key: 'b', topic: 'Резистор для світлодіода', need: 20 }, { key: 'p', topic: 'Що зробить програма?', need: 20 }] },
    { id: 'analog', n: 4, topic: '1.5', title: 'Аналоговий вхід, ШІМ і поріг', ready: true, trainers: [{ key: 'b', topic: 'Вольти, АЦП, ШІМ і поріг', need: 20 }] }
  ], lab: { id: 'lab01', n: 1, title: 'Коло, яке можна пояснити', ready: true, form: '' }},
  { module: '', lessons: [
    { id: 'button', n: 5, topic: '1.4', title: 'Цифрові датчики та кнопка', ready: true, trainers: [{ key: 'b', topic: 'Кнопка: рівні та події', need: 20 }] },
    { id: 'neopixel', n: 6, topic: '1.6', title: 'NeoPixel: арифметика та цикли', ready: true, trainers: [{ key: 'b', topic: 'Ділення, дужки, індекси', need: 20 }] },
    { id: 'sound', n: 7, topic: '1.7', title: 'Звук, масиви та остача від ділення', ready: true, trainers: [{ key: 'b', topic: 'Масиви й остача', need: 20 }] },
    { id: 'seg7', n: 8, topic: '1.8', title: 'Семисегментний індикатор і власні функції', ready: true, trainers: [{ key: 'b', topic: 'Сегменти, функції й час', need: 20 }] }
  ], lab: { id: 'lab02', n: 2, title: 'Сигналізатор умов', ready: true, form: '' }},
  { module: 'Розділ 2 · Електронні вимірювальні прилади', lessons: [
    { id: 'thermometer', n: 9, topic: '2.1', title: 'Електронний термометр. Похибка вимірювання', ready: true },
    { id: 'rangefinder', n: 10, topic: '2.2', title: 'Ультразвуковий далекомір', ready: true },
    { id: 'weather', n: 11, topic: '2.3', title: 'Кімнатна метеостанція. Журнал вимірювань', ready: true }
  ], lab: { n: 3, title: 'Прилад, якому можна довіряти', form: '' }},
  { module: '', lessons: [
    { id: 'iot', n: 12, topic: '2.4', title: 'Інтернет речей: покази на відстані', ready: true },
    { id: 'tachometer', n: 13, topic: '2.5', title: 'Безконтактний лічильник обертів', ready: true },
    { id: 'piezo', n: 14, topic: '2.6', title: 'П’єзо- та піроефект. Датчик руху', ready: true }
  ], lab: { n: 4, title: 'Прилад, що помічає подію', form: '' }},
  { module: 'Розділ 3 · Аналогова та цифрова схемотехніка', lessons: [
    { id: 'rc', n: 15, topic: '3.1', title: 'Конденсатор. RC-коло', ready: true },
    { id: 'diodes', n: 16, topic: '3.2', title: 'Діоди. Сонячний елемент', ready: true },
    { id: 'power', n: 17, topic: '3.3', title: 'Живлення електронних приладів', ready: true },
    { id: 'transistor', n: 18, topic: '3.4', title: 'Транзисторний ключ. Реле', ready: true }
  ], lab: { n: 5, title: 'Живлення та керування навантаженням', form: '' }},
  { module: '', lessons: [
    { id: 'opamp', n: 19, topic: '3.5', title: 'Операційний підсилювач', ready: true },
    { id: 'comparator', n: 20, topic: '3.5', title: 'Компаратор і гістерезис', ready: true },
    { id: 'ne555', n: 21, topic: '3.6', title: 'Таймер NE555: генератор без програми', ready: true }
  ], lab: { n: 6, title: 'Два способи створити сигнал', form: '' }},
  { module: '', lessons: [
    { id: 'logic', n: 22, topic: '3.7', title: 'Логічні елементи. Суматор', ready: true },
    { id: 'triggers', n: 23, topic: '3.7', title: 'Тригери RS і D', ready: true },
    { id: 'counter', n: 24, topic: '3.8', title: 'Лічильник і дешифратор', ready: true },
    { id: 'registers', n: 25, topic: '3.8', title: 'Регістри', ready: true }
  ], lab: { n: 7, title: 'Цифровий автомат', form: '' }},
  { module: 'Розділ 4 · Виконавчі пристрої та керування ними', lessons: [
    { id: 'servo', n: 26, topic: '4.1', title: 'Сервопривід і джойстик. Зворотний зв’язок', ready: true },
    { id: 'stepper', n: 27, topic: '4.2', title: 'Кроковий двигун', ready: true },
    { id: 'remote', n: 28, topic: '4.3', title: 'Дистанційне керування', ready: true },
    { id: 'platform', n: 29, topic: '4.4', title: 'Мобільна платформа', ready: true }
  ], lab: { n: 8, title: 'Прилад, що рухається', form: '' }}
];
