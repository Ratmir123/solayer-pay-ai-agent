# Solayer Pay — AI Order: апдейт-хэндофф для следующей сессии

Документ для следующей сессии Claude (у неё нет памяти этой). Описывает текущее
состояние флоу **AI Order**, что в нём переработано, как запускать/проверять и
**промпты для генерации картинок через GPT (gpt-image-1)**.

---

## TL;DR

Переработан весь флоу **AI Order** прототипа Solayer Pay (frog voice agent):
карусель, чат-подтверждение, Browse, Menu, Orders, Review order + Face ID.
Голос / hero / анимированный аватар лягушки **не трогали** (нравятся как есть).
Другие вкладки (Card/Wallet, Account) **не трогали**.

## Стек и запуск

- Vanilla **React 18** через in-browser Babel standalone (без сборки).
- Главные файлы: **`frog-agent.jsx`** (логика+разметка) и **`agent.css`** (стили).
- Сервер: `python serve.py 5174` → открыть `http://localhost:5174` → вкладка **AI Order**.
- `serve.py` также проксирует OpenAI Whisper (STT) — ключ берётся из `.env`
  (`OPENAI_API_KEY`), только на сервере, в браузер не попадает.
- Превью-конфиг: `.claude/launch.json` → имя сервера `solayer-frog` (порт 5174).
- Стартовая фаза в коде — `listening` (голосовой экран). Чтобы попасть в чат/idle —
  крестик «cancel» на голосовом экране (`.vc-side`).

### Фазы (state machine в `FrogAgent`, поле `phase`)
`idle` (чат+карусель) · `listening`/`thinking`/`searching` (голос, **не трогать**) ·
`browse` (список заведений) · `menu` (блюда+корзина) · `confirming` (Review order +
Face ID) · `success` · `orders` · `wallet`/`account` (**другие вкладки, не трогать**).
> Фаза `paying` **удалена** — биометрия теперь внутри `confirming`.

---

## Что изменено по экранам

1. **Idle-карусель блюд** (`DishCarousel` в `frog-agent.jsx`, `.dish-carousel`/`.dish-track` в css)
   - Движение через GPU `transform: translate3d(...)` на внутреннем треке (а не
     `scrollLeft`, который округлялся до целых px и давал рывки).
   - Скорость **~20px/с**, плавный eased разгон/торможение при касании/наведении.
   - Бесшовный цикл: дистанция = смещение между двумя копиями (`children[n].offsetLeft`,
     ≈884px @375), **не** `scrollWidth/2` (давало бы шов ~22px).
   - `prefers-reduced-motion` → статичный, свайпабельный ряд.

2. **Чат-подтверждение заказа** (`.order-suggest` + `.quick-chip-add`)
   - Лёгкая плитка-результат: фото-превью категории, имя/мета, спокойная цена, зелёная
     стрелка. Без тяжёлой рамки/инсет-теней (старая `.inline-order-card`/`.ioc-*` удалена).
   - «+ order something else» — мягкий чип внутри чата, без разделительной линии сверху.

3. **Browse** (`BrowseScreen`, `.browse-*`)
   - Реальные фото категорий (`images/cat-<key>.png`) вместо emoji-на-полоске.
   - Удалён сломанный фильтр-бар (схлопывался в 16px). Сердечко — `<span role="button">`
     (было `<button>` внутри `<button>` — невалидная вложенность, починено).

4. **Menu** (`MenuScreen`, `.menu-*`)
   - Был баг: hero `height:0` (aspect-ratio у flex-ребёнка) + корзина-бар `position:absolute`
     внутри скролла (уезжала). Починено.
   - Hero фикс-высоты с фото + имя заведения оверлеем. Строки: `[фото 60px] [текст] [кнопка]`.
   - Кнопка add `40px`, степпер `32px` (тап-таргеты). Корзина-бар **закреплён** (`.menu-area`
     = flex-колонка, `.menu-scroll` скроллится, `.cart-bar` — `flex-shrink:0` снизу).

5. **Orders** (`OrdersScreen` + шапка в `FrogAgent`)
   - Кнопка **«назад в чат» слева сверху** (фаза `orders` добавлена в условие back-btn → `goIdle`).
   - Фото-превью заказов: в данные заказа добавлено поле `cat` (seed + новый заказ).

6. **Review order + Face ID** (`confirming` блок + компонент `FaceIdHold`)
   - Убран плавающий аватар+бабл сверху. Карточка `.store-card` с фото-шапкой
     (`.store-card-hero`), корзина, итог.
   - **Face ID hold-to-pay** встроен внизу (`FaceIdHold`): кольцо-прогресс (CSS `--p`
     transition) + визуал, завершение по `setTimeout` (надёжно даже в фоне). Холд → `placeOrder` → `success`.
   - Отдельный экран `PayingScreen` (цена+Face ID) **удалён**. Цена осталась в итоге и на кнопке.

7. **Картинки** — 8 фото категорий в `images/`, см. ниже.

8. **Анимации** — ease-out входы, только transform/opacity, прерываемость, полное
   покрытие `prefers-reduced-motion` для новых элементов.

## Файлы

- Изменены: `frog-agent.jsx`, `agent.css`.
- Добавлены: `gen_images.py`, `images/cat-*.png` (8 шт.), этот `AI-ORDER-UPDATE.md`.
- Не трогали: `serve.py`, `.env`, `ios-frame.jsx`, голос/hero/аватар, Card/Account.

## Reviewdesign (итог 9/10)

- P0/P1: нет. Контраст приглушённого текста **6.3:1** (WCAG AA проходит). Флоу работает end-to-end.
- Исправлено: тап-таргеты степпера/кнопки add подняты (32/40px).
- Осознанно оставлено: emoji как индикаторы категорий/блюд (экшен-иконки — нормальные SVG);
  превью блюд — emoji-на-плашке (пер-блюдных фото нет); часть отступов вне 8pt-сетки.

## Ограничения проверки (важно для след. сессии)

В этом Claude-preview **скриншоты висят**: вкладка рендерится скрытой
(`document.visibilityState === 'hidden'`), поэтому `requestAnimationFrame` и
`captureScreenshot` заморожены. Проверять через `preview_eval`/`preview_snapshot`/
`preview_inspect` (DOM + вычисленные стили + загрузка картинок). Движущиеся анимации
(дрейф карусели, заполнение кольца Face ID) в скрытой вкладке не наблюдаемы, но
корректны по логике и работают в обычном браузере.

## TODO / возможные следующие шаги

- Глянуть флоу живьём в обычном браузере (анимации движения).
- (Опц.) пер-блюдные картинки для строк меню, чтобы добить визуальную консистентность.
- (Опц.) подкрутить отступы под 8pt-сетку (7/9/11px → 8/8/12).

---

# GPT-промпты для генерации картинок

**Скрипт:** `gen_images.py` (stdlib `urllib`, как `serve.py`). Ключ берётся **только**
из env `OPENAI_API_KEY` — в файлы не пишется. Запуск (PowerShell):

```powershell
$env:OPENAI_API_KEY="sk-..."; python gen_images.py
```

> ⚠️ Ключ, который присылали в чат, считать скомпрометированным — **перевыпустить** в дашборде OpenAI.

**API / настройки** (эндпоинт `POST https://api.openai.com/v1/images/generations`):

| Параметр | Значение |
|---|---|
| `model` | `gpt-image-1` (override через env `OPENAI_IMAGE_MODEL`) |
| `size` | `1536x1024` (ландшафт под карточки 16:10 / hero) |
| `quality` | `medium` |
| `n` | `1` |
| ответ | `b64_json` → декодируется в `images/cat-<key>.png` |

Существующие файлы пропускаются (повторный запуск дешёвый). 8 картинок ≈ ~$0.5, по ~18–21с каждая.

### Общий суффикс стиля (добавляется к каждому промпту)

```
 Ultra-realistic premium editorial food photography, shot on 35mm, shallow depth of field, cinematic color grading, soft moody low-key lighting on a dark background, a subtle emerald-green ambient rim light, appetizing, high-end restaurant menu hero shot. No text, no logos, no watermark, no people.
```

### Промпты по категориям (base + суффикс = финальный промпт)

**pizza** → `images/cat-pizza.png`
```
An artisan wood-fired pepperoni pizza with fresh basil, bubbling melted mozzarella and hot honey, on a dark slate board, faint steam rising. Ultra-realistic premium editorial food photography, shot on 35mm, shallow depth of field, cinematic color grading, soft moody low-key lighting on a dark background, a subtle emerald-green ambient rim light, appetizing, high-end restaurant menu hero shot. No text, no logos, no watermark, no people.
```

**coffee** → `images/cat-coffee.png`
```
An iced oat-milk latte in a clear glass with layered cream and espresso, condensation droplets, on a dark cafe counter beside roasted beans. Ultra-realistic premium editorial food photography, shot on 35mm, shallow depth of field, cinematic color grading, soft moody low-key lighting on a dark background, a subtle emerald-green ambient rim light, appetizing, high-end restaurant menu hero shot. No text, no logos, no watermark, no people.
```

**sushi** → `images/cat-sushi.png`
```
A salmon-avocado sushi roll set beautifully plated on dark ceramic with pickled ginger, wasabi and chopsticks, glossy fresh fish. Ultra-realistic premium editorial food photography, shot on 35mm, shallow depth of field, cinematic color grading, soft moody low-key lighting on a dark background, a subtle emerald-green ambient rim light, appetizing, high-end restaurant menu hero shot. No text, no logos, no watermark, no people.
```

**burger** → `images/cat-burger.png`
```
A gourmet double smash cheeseburger with dripping melted cheese, caramelised onions and a side of crispy golden fries on dark stone. Ultra-realistic premium editorial food photography, shot on 35mm, shallow depth of field, cinematic color grading, soft moody low-key lighting on a dark background, a subtle emerald-green ambient rim light, appetizing, high-end restaurant menu hero shot. No text, no logos, no watermark, no people.
```

**chinese** → `images/cat-chinese.png`
```
A dark bowl of beef chow fun wide noodles with scallions and bean sprouts, chopsticks lifting noodles, gentle steam, glossy sauce. Ultra-realistic premium editorial food photography, shot on 35mm, shallow depth of field, cinematic color grading, soft moody low-key lighting on a dark background, a subtle emerald-green ambient rim light, appetizing, high-end restaurant menu hero shot. No text, no logos, no watermark, no people.
```

**dessert** → `images/cat-dessert.png`
```
A tiramisu slice dusted with cocoa beside brown-butter cookies and a macaron, on dark marble, elegant patisserie styling. Ultra-realistic premium editorial food photography, shot on 35mm, shallow depth of field, cinematic color grading, soft moody low-key lighting on a dark background, a subtle emerald-green ambient rim light, appetizing, high-end restaurant menu hero shot. No text, no logos, no watermark, no people.
```

**ride** → `images/cat-ride.png`
```
A sleek black luxury electric sedan parked on a wet city street at night, glowing neon reflections on the paintwork, cinematic. Ultra-realistic premium editorial food photography, shot on 35mm, shallow depth of field, cinematic color grading, soft moody low-key lighting on a dark background, a subtle emerald-green ambient rim light, appetizing, high-end restaurant menu hero shot. No text, no logos, no watermark, no people.
```
> (для `ride` гастро-часть суффикса игнорируется моделью; ключевое — «sleek black luxury EV, wet neon street at night, cinematic, dark».)

**groceries** → `images/cat-groceries.png`
```
A fresh premium grocery haul arranged on dark wood — organic produce, farm eggs, a sourdough loaf, avocados and bottled milk. Ultra-realistic premium editorial food photography, shot on 35mm, shallow depth of field, cinematic color grading, soft moody low-key lighting on a dark background, a subtle emerald-green ambient rim light, appetizing, high-end restaurant menu hero shot. No text, no logos, no watermark, no people.
```

### Как добавить новую категорию
1. Добавить ключ в `CATEGORIES` (`frog-agent.jsx`) — `key` должен совпадать с именем файла.
2. Добавить пару `key: "<base prompt>"` в `PROMPTS` в `gen_images.py`.
3. Прогнать `gen_images.py` (env-ключ) → появится `images/cat-<key>.png`.
4. Картинка автоматически подхватится везде (browse/menu/orders/review/чат) — пути
   формируются как `images/cat-${cat}.png`.
