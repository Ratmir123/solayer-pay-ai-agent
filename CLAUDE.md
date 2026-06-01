# Solayer Pay — Frog Voice Agent

Прототип голосового AI-агента оплаты/заказа («лягушка»-маскот) внутри iPhone-мокапа.
**No-build React 18** через in-browser Babel (без сборщика и npm). Это git-репозиторий.

> Этот файл — карта проекта для сессий Claude. Опирайся на него вместо повторного
> исследования с нуля. Монолиты (`frog-agent.jsx`, `agent.css`) **большие — не читай
> целиком**: грепай по имени функции / CSS-секции либо читай нужный диапазон (offset/limit).
> Тяжёлые папки с ассетами (см. внизу) — **не код приложения, не читать**.

## Запуск и проверка
- `python serve.py 5174` → http://localhost:5174
- `serve.py` (stdlib): статик-сервер с отключённым кэшем + прокси OpenAI STT
  (`POST /api/transcribe`). Ключ `OPENAI_API_KEY` берётся из `.env`, живёт только на
  сервере, в браузер не уходит. STT-модель — `whisper-1` (override env `OPENAI_STT_MODEL`).
- Стартовая фаза в коде — `listening` (голосовой экран). Крестик `.vc-side` → idle/чат.
- Проверка в этом окружении: вкладка превью рендерится скрытой, движущиеся анимации
  (дрейф карусели, кольцо Face ID) не наблюдаемы → проверяй DOM/стили/загрузку картинок
  через `preview_eval`/`preview_snapshot`/`preview_inspect`, живые анимации — в обычном браузере.

## Как это собрано
- `index.html` грузит с CDN: React 18.3 + ReactDOM + Babel standalone. **Сборки нет.**
- Скрипты подключаются по порядку, всё живёт в **global scope** (нет import/export):
  `apple-emoji.js` → `image-slot.js` → `motion.js` → `ios-frame.jsx` →
  `tweaks-panel.jsx` → `svg-frog.jsx` → `frog-agent.jsx` → `app.jsx`.
- Имена (компоненты, `THEMES`, `STORES`…) видны между файлами глобально.

## Файлы (актуальные размеры)
| Файл | Строк | Что |
|---|---|---|
| `frog-agent.jsx` | 2101 | Вся логика + разметка всех экранов (монолит) |
| `agent.css` | 3119 | Все стили (монолит) |
| `responsive.css` | 110 | Фуллскрин-слой для телефона (грузится последним) |
| `tweaks-panel.jsx` | 530 | Dev-панель (тема/интенсивность/частицы) |
| `ios-frame.jsx` | 407 | Мокап iPhone (на телефоне отключается) |
| `image-slot.js` | 661 | Веб-компонент `<image-slot>` — **загружен, но в разметке не используется** (мёртвый) |
| `apple-emoji.js` | 169 | Подмена системных эмодзи на Apple-набор |
| `svg-frog.jsx` | 131 | SVG-аватар лягушки |
| `app.jsx` | 80 | Сборка: iOS-frame + `FrogAgent` + Tweaks, применение темы |
| `motion.js` | 81 | Утилиты анимации (toggle `.is-loaded` для fade-in картинок) |
| `serve.py` | 136 | Сервер + STT-прокси |
| `gen_images.py` / `gen_icons.py` | 156 / 122 | Генерация картинок/иконок (gpt-image-1, env-ключ) |

## Карта `frog-agent.jsx` (грепай имя функции, строки — ориентир)
**Данные/конфиг:** `THEMES` (9) · `CATEGORIES` (77) · `STORES` (89) · `MENUS` (142) ·
`INTENT_PATTERNS`+`detectIntent` (227/239) · `SEED_PAST_ORDERS` (246) · `MOCK_TX` (1618) ·
`CARD_TX` (1665) · `TRACK_STEPS` (2008).

**Голос/STT — не трогать без просьбы:** `useMic` (256) · `pickRecMime` (339) ·
`useTranscript` (358) — шлют аудио на `serve.py /api/transcribe`. Визуал: `VoiceOrb` (389,
он же `MorphBlob`) · `Ripples` (444) · `Particles` (456) · `VoiceTranscript` (593).

**Маскот — не трогать без просьбы:** `FrogAvatarSmall` (531) · `AnimatedFrogAvatar` (556)
(`FROG_ANIM_SEQUENCE` 555, проигрывает спрайт-стрипы).

**`FrogAgent` (633) — ГЛАВНЫЙ компонент, машина состояний (поле `phase`).** Разметка
экранов idle / listening / confirming (Review order + Face ID) / success живёт инлайн
внутри него. Отдельные экраны как компоненты ниже.

**Заказ/оплата:** `CategoryIcon` (1217) · `DishCarousel` (1231, idle-карусель) ·
`FaceIdHold` (1372, hold-to-pay, используется в `confirming`).

**Экраны-компоненты:** `SuccessScreen` (1475) · `WalletScreen` (1684, = вкладка **Card**) ·
`AccountScreen` (1765) · `BrowseScreen` (1824) · `MenuScreen` (1880) · `OrdersScreen` (1962)
с `LiveOrderCard` (2010) / `PastOrderCard` (2055) / `OrdersEmpty` (2088).

**Навигация:** `BottomTabs` (1537) + иконки `TabIcon*` (1571–1603).

**Мелкие SVG-глифы (обычно не трогать):** `Sparkle` `Clipboard` `ChevLeft` `MicGlyph`
`Pin` `Star` `CheckGlyph` `FaceIdGlyph` `ShieldGlyph` `SearchSpinner` `SvgFrogChip` `Ph*`.

### Фазы (`FrogAgent.phase`)
`idle` (чат+карусель) · `listening`/`thinking`/`searching` (голос, **не трогать**) ·
`browse` → `menu` → `confirming` (Review + Face ID) → `success` · `orders` · `wallet`
(экран Card) · `account`. Фазы `paying` нет — биометрия внутри `confirming`.

## Карта `agent.css` (грепай по `/* ───` / `/* ===`)
mascot sprites (115/134) · screen entrance (200) · chat area (216) · chat thread (269) ·
stage listening/thinking/searching (322) · SVG Frog expressions (404) · ripples (497) ·
particles (514) · voice bubble (542) · section heads (625) · BROWSE (640) ·
store card / confirming (751) · review photo header (767) · Face ID hold-to-pay (828) ·
Success (893) · footer/CTAs (955) · record FAB (1016) · inline order suggestion (1074) ·
composer (1146) · MENU (1282) · cart lines (1504) · ORDERS (1573) · BOTTOM TABS (1882) ·
AI tab logo (1936) · CARD/wallet (1963) · balance (2015) · card stack (2026) · transactions (2058).

## Картинки (рантайм — только `.webp`)
- Категории/иконки/заведения: `images/cat-<key>.webp`, `images/icon-<key>.webp`,
  `images/store-<...>.webp`. Пути формируются шаблоном (`storeImg()`, `images/icon-${cat.key}.webp`).
  Имя файла = `key` категории/заведения из `STORES`/`CATEGORIES`.
- Маскот: `mascot.png` + спрайт-стрипы в корне: `mascot-anim-strip.webp` и
  `mascot-bubble-strip.webp` (по 72 кадра), `mascot-glitch-strip.webp` (97 кадров).
- Прочее (корень): `fig-card-texture.webp`, `Emerald Logo.png`, `fig-mlogo-solayer.png`,
  `fig-mlogo-mcd.png`, `fig-solayer-wordmark.svg`.
- Добавить категорию: ключ в `STORES`/`CATEGORIES` → прогнать `gen_images.py` →
  появится `images/cat-<key>.webp`, подхватится везде автоматически.

## Конвенции
- Анимации: только `transform`/`opacity`, прерываемость, всегда покрывать `prefers-reduced-motion`.
- **Не трогать без явной просьбы:** голос (`VoiceOrb`/STT), hero, аватар-маскот, вкладки Card/Account.
- Маскот/орб: чистый глянцевый шар — без WebGL-liquid/metaball и pixel-маскотов (фидбек пользователя).
- Стиль фото: тёмный фон, изумрудный rim-light, без текста/логотипов/людей.

## Тяжёлые папки — НЕ код приложения (не читать, не индексировать)
Рантайму нужны только `images/*.webp` и спрайт-стрипы в корне. Остальное — исходники,
бэкапы и рефы (~174 MB), оставлены на месте, но это **не нужно читать** при работе над приложением:
- `Mascot_anim/` (Blink/Bubble/Glitch) — исходные кадры маскота; в рантайме уже скомпилены в `mascot-*-strip.webp`.
- `_img-backup/` — PNG-оригиналы до конвертации в webp (уже в `.gitignore`).
- `uploads/`, `_fig/` — пользовательские рефы/скриншоты.
- `.goal/` — логи оркестратора `/goal`, к приложению отношения не имеют (в `.gitignore`).
