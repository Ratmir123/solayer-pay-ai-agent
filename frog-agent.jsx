// frog-agent.jsx — Solayer AI voice agent + ordering flow
// Exports to window: FrogAgent, THEMES

const { useState, useRef, useEffect, useCallback } = React;

// ─────────────────────────────────────────────────────────────
// Theme tokens — mirroring the Figma "AI agent" variable modes
// ─────────────────────────────────────────────────────────────
const THEMES = {
  solayerAI: {
    label: 'Solayer AI',
    bgClass: 'theme-solayerAI',
    // brand palette from the Solayer app Figma file:
    // secondary green #00ffa3 (signature) + primary green #084d3e (deep)
    accent: '#00ffa3',
    blob: ['#7CFFD4', '#00ffa3', '#084d3e'],
    haze: 'rgba(0,255,163,0.22)',
    ink: '#ffffff',
    sub: 'rgba(255,255,255,0.55)',
    chip: 'rgba(255,255,255,0.06)',
    chipBorder: 'rgba(255,255,255,0.06)',
    bubble: 'rgba(255,255,255,0.07)',
    card: 'rgba(255,255,255,0.05)',
    cardBorder: 'rgba(255,255,255,0.08)',
    pill: 'rgba(255,255,255,0.10)',
    pillInk: '#ffffff',
    primaryPill: '#084d3e',
    primaryPillInk: '#ffffff',
    surfaceSoft: 'rgba(255,255,255,0.04)',
    surfaceSoftHover: 'rgba(255,255,255,0.08)'
  },
  indigo: {
    label: 'Indigo',
    bgClass: 'theme-indigo',
    accent: '#6155F5',
    blob: ['#A7AAFF', '#6155F5', '#1B1453'],
    haze: 'rgba(97,85,245,0.30)',
    ink: '#ffffff',
    sub: 'rgba(255,255,255,0.58)',
    chip: 'rgba(255,255,255,0.06)',
    chipBorder: 'rgba(255,255,255,0.06)',
    bubble: 'rgba(255,255,255,0.07)',
    card: 'rgba(255,255,255,0.05)',
    cardBorder: 'rgba(255,255,255,0.08)',
    pill: 'rgba(255,255,255,0.10)',
    pillInk: '#ffffff',
    primaryPill: '#084D3E',
    primaryPillInk: '#ffffff',
    surfaceSoft: 'rgba(255,255,255,0.04)',
    surfaceSoftHover: 'rgba(255,255,255,0.08)'
  },
  lily: {
    label: 'Lily',
    bgClass: 'theme-lily',
    accent: '#3f7026',
    blob: ['#cfe89a', '#3f7026', '#1c3a0d'],
    haze: 'rgba(63,112,38,0.22)',
    ink: '#0f1f06',
    sub: 'rgba(15,31,6,0.55)',
    chip: 'rgba(15,31,6,0.05)',
    chipBorder: 'rgba(15,31,6,0.08)',
    bubble: 'rgba(255,255,255,0.65)',
    card: 'rgba(255,255,255,0.55)',
    cardBorder: 'rgba(15,31,6,0.1)',
    pill: 'rgba(255,255,255,0.7)',
    pillInk: '#0f1f06',
    primaryPill: '#084D3E',
    primaryPillInk: '#ffffff',
    surfaceSoft: 'rgba(15,31,6,0.04)',
    surfaceSoftHover: 'rgba(15,31,6,0.07)'
  }
};

// ─────────────────────────────────────────────────────────────
// Categories + mock nearby stores
// ─────────────────────────────────────────────────────────────
const CATEGORIES = [
{ key: 'pizza', label: 'Pizza', emoji: '🍕', tint: '#c2410c' },
{ key: 'coffee', label: 'Coffee', emoji: '☕', tint: '#78350f' },
{ key: 'sushi', label: 'Sushi', emoji: '🍣', tint: '#0e7490' },
{ key: 'burger', label: 'Burger', emoji: '🍔', tint: '#9a3412' },
{ key: 'chinese', label: 'Chinese', emoji: '🥡', tint: '#a16207' },
{ key: 'dessert', label: 'Dessert', emoji: '🍰', tint: '#be185d' },
{ key: 'ride', label: 'Ride', emoji: '🚗', tint: '#1e40af' },
{ key: 'groceries', label: 'Groceries', emoji: '🛒', tint: '#15803d' },
{ key: 'hotels', label: 'Hotels', emoji: '🏨', tint: '#6d28d9' }];


const STORES = {
  pizza: [
  { name: "Joe's Slice Shop", item: 'Large pepperoni pizza', price: 18.50, eta: '18 min', dist: '0.4 mi', rating: 4.7, swatch: '#c2410c', img: 'store-pizza-joes' },
  { name: "Tony's Brick Oven", item: 'Margherita, fresh basil', price: 24.00, eta: '32 min', dist: '0.8 mi', rating: 4.9, swatch: '#7c2d12', img: 'store-pizza-tonys' },
  { name: 'Crust & Co.', item: 'Cheese slice combo', price: 14.50, eta: '14 min', dist: '0.3 mi', rating: 4.5, swatch: '#dc6803', img: 'store-pizza-crust' }],

  sushi: [
  { name: 'Tokyo Sushi', item: 'Salmon avocado roll set', price: 24.00, eta: '32 min', dist: '0.7 mi', rating: 4.8, swatch: '#0e7490', img: 'store-sushi-tokyo' },
  { name: 'Edomae House', item: 'Omakase 8 piece', price: 38.00, eta: '40 min', dist: '1.1 mi', rating: 4.9, swatch: '#155e75', img: 'store-sushi-edomae' },
  { name: 'Wabi Roll', item: 'Spicy tuna + miso', price: 19.50, eta: '24 min', dist: '0.5 mi', rating: 4.6, swatch: '#0891b2', img: 'store-sushi-wabi' }],

  coffee: [
  { name: 'Bean Lab', item: 'Iced oat latte, 16 oz', price: 6.50, eta: '9 min', dist: '0.2 mi', rating: 4.7, swatch: '#78350f', img: 'store-coffee-beanlab' },
  { name: 'Verve', item: 'Cortado + biscotti', price: 8.20, eta: '12 min', dist: '0.4 mi', rating: 4.8, swatch: '#92400e', img: 'store-coffee-verve' },
  { name: 'Daydream Coffee', item: 'Maple cold brew', price: 7.00, eta: '10 min', dist: '0.3 mi', rating: 4.6, swatch: '#b45309', img: 'store-coffee-daydream' }],

  ride: [
  { name: 'Solana Wheels', item: 'Ride to Mission St', price: 12.40, eta: '4 min', dist: '0.1 mi', rating: 4.9, swatch: '#1e40af', img: 'store-ride-solana' },
  { name: 'MetroLift', item: 'Shared ride · 2 stops', price: 8.80, eta: '7 min', dist: '0.2 mi', rating: 4.6, swatch: '#1d4ed8', img: 'store-ride-metrolift' },
  { name: 'RideNow', item: 'Premium SUV', price: 22.00, eta: '5 min', dist: '0.1 mi', rating: 4.8, swatch: '#1e3a8a', img: 'store-ride-ridenow' }],

  groceries: [
  { name: 'FreshCart', item: 'Eggs, milk, sourdough', price: 14.20, eta: '25 min', dist: '0.5 mi', rating: 4.5, swatch: '#15803d', img: 'store-groceries-freshcart' },
  { name: 'GreenBasket', item: 'Organic produce box', price: 28.00, eta: '40 min', dist: '0.9 mi', rating: 4.7, swatch: '#166534', img: 'store-groceries-greenbasket' },
  { name: 'CornerMart', item: 'Essentials bundle', price: 12.50, eta: '20 min', dist: '0.3 mi', rating: 4.3, swatch: '#14532d', img: 'store-groceries-cornermart' }],

  burger: [
  { name: 'Smash House', item: 'Double smash + fries', price: 16.50, eta: '20 min', dist: '0.5 mi', rating: 4.8, swatch: '#9a3412', img: 'store-burger-smash' },
  { name: 'Burger Bros.', item: 'Bacon cheeseburger combo', price: 14.20, eta: '16 min', dist: '0.3 mi', rating: 4.6, swatch: '#7c2d12', img: 'store-burger-bros' },
  { name: 'Char & Co.', item: 'Wagyu burger, truffle aioli', price: 22.00, eta: '28 min', dist: '0.8 mi', rating: 4.9, swatch: '#92400e', img: 'store-burger-char' }],

  chinese: [
  { name: 'Dragon Noodle', item: 'Beef chow fun + spring rolls', price: 17.50, eta: '22 min', dist: '0.6 mi', rating: 4.7, swatch: '#a16207', img: 'store-chinese-dragon' },
  { name: 'Sichuan Garden', item: 'Mapo tofu + jasmine rice', price: 15.00, eta: '26 min', dist: '0.7 mi', rating: 4.8, swatch: '#854d0e', img: 'store-chinese-sichuan' },
  { name: 'Lucky Wok', item: 'Orange chicken combo', price: 13.50, eta: '18 min', dist: '0.4 mi', rating: 4.5, swatch: '#713f12', img: 'store-chinese-lucky' }],

  dessert: [
  { name: 'Sugar Lab', item: 'Brown butter cookies × 6', price: 12.00, eta: '20 min', dist: '0.4 mi', rating: 4.9, swatch: '#be185d', img: 'store-dessert-sugarlab' },
  { name: 'Frost & Co.', item: 'Black sesame soft serve', price: 8.50, eta: '15 min', dist: '0.3 mi', rating: 4.8, swatch: '#9d174d', img: 'store-dessert-frost' },
  { name: 'Madeleine', item: 'Tiramisu slice + espresso', price: 11.00, eta: '24 min', dist: '0.6 mi', rating: 4.7, swatch: '#831843', img: 'store-dessert-madeleine' }],

  hotels: [
  { name: 'The Emerald', item: 'Deluxe king · 1 night', price: 240.00, eta: 'tonight', dist: '0.6 mi', rating: 4.9, swatch: '#6d28d9', img: 'store-hotel-emerald' },
  { name: 'Marina Bay Hotel', item: 'Ocean-view suite', price: 360.00, eta: 'tonight', dist: '1.2 mi', rating: 4.8, swatch: '#5b21b6', img: 'store-hotel-marina' },
  { name: 'Skyline Loft', item: 'City studio loft', price: 180.00, eta: 'tonight', dist: '0.4 mi', rating: 4.7, swatch: '#7c3aed', img: 'store-hotel-skyline' }]

};

// Pick the store-specific photo if present, else fall back to the category photo.
const storeImg = (s, cat) => `images/${s && s.img ? s.img : 'cat-' + cat}.webp`;

// Menus — per-category menus (all stores in a category share the menu;
// the store carries the "featured" line item for voice-flow shortcuts).
const MENUS = {
  pizza: [
  { name: 'Cheese slice', desc: 'San Marzano, mozzarella', price: 4.00, emoji: '🍕' },
  { name: 'Pepperoni slice', desc: 'Cured pepperoni, hot honey', price: 4.75, emoji: '🍕' },
  { name: 'Margherita pie', desc: '12" — basil, fresh mozz', price: 18.00, emoji: '🍕' },
  { name: 'Pepperoni pie', desc: '16" — double cheese', price: 24.00, emoji: '🍕' },
  { name: 'Garlic knots', desc: '6 pc — olive oil, parm', price: 6.00, emoji: '🥖' },
  { name: 'Caesar salad', desc: 'Romaine, parmesan, croutons', price: 9.00, emoji: '🥗' },
  { name: 'Italian soda', desc: '12 oz — blood orange', price: 3.50, emoji: '🥤' }],

  coffee: [
  { name: 'Espresso', desc: 'Single shot · 1 oz', price: 3.50, emoji: '☕' },
  { name: 'Cortado', desc: 'Double + steamed milk', price: 5.00, emoji: '☕' },
  { name: 'Iced oat latte', desc: '16 oz — double + oat', price: 6.50, emoji: '🧊' },
  { name: 'Maple cold brew', desc: '16 oz — slow-steeped', price: 6.50, emoji: '🧊' },
  { name: 'Almond croissant', desc: 'Frangipane, sliced almonds', price: 5.50, emoji: '🥐' },
  { name: 'Banana bread', desc: 'Brown butter, walnut', price: 4.50, emoji: '🍌' },
  { name: 'Avocado toast', desc: 'Sourdough, chili crisp', price: 9.00, emoji: '🥑' }],

  sushi: [
  { name: 'Spicy tuna roll', desc: '8 pc — togarashi mayo', price: 14.00, emoji: '🍣' },
  { name: 'Salmon avocado roll', desc: '8 pc — sesame, scallion', price: 13.00, emoji: '🍣' },
  { name: 'California roll', desc: '8 pc — crab, cucumber', price: 11.00, emoji: '🍣' },
  { name: 'Nigiri set', desc: "6 pc — chef's selection", price: 22.00, emoji: '🐟' },
  { name: 'Edamame', desc: 'Steamed, sea salt', price: 6.50, emoji: '🫛' },
  { name: 'Miso soup', desc: 'Tofu, wakame, scallion', price: 4.50, emoji: '🍲' },
  { name: 'Yuzu lemonade', desc: '16 oz — sparkling', price: 5.00, emoji: '🥤' }],

  burger: [
  { name: 'Smash burger', desc: 'Single — onion, cheese', price: 11.00, emoji: '🍔' },
  { name: 'Double smash', desc: 'Double — bacon, cheese', price: 14.50, emoji: '🍔' },
  { name: 'Mushroom melt', desc: 'Swiss, sautéed mushrooms', price: 12.50, emoji: '🍔' },
  { name: 'Crinkle fries', desc: 'Sea salt, smoked paprika', price: 5.00, emoji: '🍟' },
  { name: 'Truffle fries', desc: 'Truffle oil, parm', price: 8.00, emoji: '🍟' },
  { name: 'Vanilla shake', desc: '16 oz — Madagascar vanilla', price: 6.50, emoji: '🥤' },
  { name: 'Onion rings', desc: '8 pc — beer-battered', price: 6.00, emoji: '🧅' }],

  chinese: [
  { name: 'Mapo tofu', desc: 'Sichuan peppercorn, scallion', price: 14.00, emoji: '🌶️' },
  { name: 'Orange chicken', desc: 'Crispy, zest glaze', price: 13.50, emoji: '🍗' },
  { name: 'Beef chow fun', desc: 'Wide noodles, bean sprout', price: 15.00, emoji: '🍜' },
  { name: 'Pork dumplings', desc: '8 pc — pan-fried', price: 10.00, emoji: '🥟' },
  { name: 'Veggie spring rolls', desc: '4 pc — sweet chili', price: 7.00, emoji: '🥬' },
  { name: 'Jasmine rice', desc: 'Steamed, side', price: 3.00, emoji: '🍚' },
  { name: 'Iced jasmine tea', desc: '20 oz', price: 4.00, emoji: '🧊' }],

  dessert: [
  { name: 'Brown butter cookie', desc: 'Chewy, sea salt', price: 4.00, emoji: '🍪' },
  { name: 'Black sesame soft serve', desc: 'Single cup', price: 6.50, emoji: '🍦' },
  { name: 'Tiramisu slice', desc: 'Mascarpone, espresso', price: 8.00, emoji: '🍰' },
  { name: 'Matcha basque', desc: 'Burnt cheesecake', price: 9.00, emoji: '🍰' },
  { name: 'Chocolate babka', desc: 'Dark chocolate swirl', price: 7.00, emoji: '🍫' },
  { name: 'Vanilla macaron', desc: '3 pc — bourbon vanilla', price: 9.00, emoji: '🧁' },
  { name: 'Yuzu sorbet', desc: 'Single scoop', price: 5.50, emoji: '🍋' }],

  ride: [
  { name: 'Standard', desc: 'Sedan, up to 4 riders', price: 12.40, emoji: '🚗' },
  { name: 'XL', desc: 'SUV, up to 6 riders', price: 22.00, emoji: '🚙' },
  { name: 'Premium', desc: 'Luxury sedan', price: 28.00, emoji: '🚘' },
  { name: 'Shared', desc: '2 stops, slower · save 30%', price: 8.80, emoji: '🚗' },
  { name: 'Pet-friendly', desc: 'Standard + crate', price: 14.50, emoji: '🐾' },
  { name: 'Bike rack', desc: 'Standard + rack', price: 13.50, emoji: '🚲' },
  { name: 'Hourly hire', desc: 'Driver waits · per hour', price: 45.00, emoji: '⏱️' }],

  groceries: [
  { name: 'Farm eggs', desc: '1 dozen — pasture-raised', price: 6.00, emoji: '🥚' },
  { name: 'Whole milk', desc: '64 oz — organic', price: 5.50, emoji: '🥛' },
  { name: 'Sourdough loaf', desc: 'Bakery-fresh', price: 7.00, emoji: '🥖' },
  { name: 'Avocados', desc: '3 ct — ripe', price: 5.00, emoji: '🥑' },
  { name: 'Roma tomatoes', desc: '1 lb', price: 3.50, emoji: '🍅' },
  { name: 'Cold brew, 32 oz', desc: 'Bottled — black', price: 8.00, emoji: '☕' },
  { name: 'Dark chocolate bar', desc: '70% — single origin', price: 4.50, emoji: '🍫' }],

  hotels: [
  { name: 'Standard queen', desc: '1 queen bed · city view', price: 160.00, emoji: '🛏️' },
  { name: 'Deluxe king', desc: '1 king bed · high floor', price: 240.00, emoji: '🛏️' },
  { name: 'Ocean-view suite', desc: 'King + lounge · balcony', price: 360.00, emoji: '🌊' },
  { name: 'Studio loft', desc: 'Open plan · kitchenette', price: 180.00, emoji: '🏙️' },
  { name: 'Family room', desc: '2 queens · sleeps 4', price: 300.00, emoji: '🛌' },
  { name: 'Penthouse suite', desc: 'Top floor · panoramic', price: 620.00, emoji: '🌆' },
  { name: 'Breakfast for two', desc: 'Daily · add-on', price: 28.00, emoji: '🥐' }]

};

// Intent detection — regex match on transcript
const INTENT_PATTERNS = [
{ match: /pizza|slice|pepperoni|margherita|calzone/i, cat: 'pizza' },
{ match: /sushi|nigiri|sashimi|maki|roll|omakase|edamame/i, cat: 'sushi' },
{ match: /coffee|latte|espresso|cappuccino|mocha|cold ?brew|macchiato/i, cat: 'coffee' },
{ match: /ride|uber|lyft|taxi|car|trip|driver/i, cat: 'ride' },
{ match: /grocer|grocery|milk|eggs|bread|produce|veggies/i, cat: 'groceries' },
{ match: /hotel|room|suite|stay|lodging|book.*(room|night)|check.?in/i, cat: 'hotels' },
{ match: /burger|cheeseburger|smash ?burger|patty/i, cat: 'burger' },
{ match: /chinese|noodle|fried rice|orange chicken|mapo|chow|wok|dumpling/i, cat: 'chinese' },
{ match: /dessert|cookie|ice ?cream|cake|donut|pastry|tiramisu|sweet/i, cat: 'dessert' }];


function detectIntent(text) {
  if (!text) return null;
  for (const p of INTENT_PATTERNS) if (p.match.test(text)) return p.cat;
  return null;
}

// Seed orders history
const SEED_PAST_ORDERS = [
{ id: 'p1', store: 'Tokyo Sushi', cat: 'sushi', emoji: '🍣', swatch: '#0e7490', summary: 'Salmon avocado roll, miso soup', when: '2 days ago', status: 'done', statusLabel: 'delivered', total: 24.00 },
{ id: 'p2', store: 'Bean Lab', cat: 'coffee', emoji: '☕', swatch: '#78350f', summary: 'Iced oat latte', when: '3 days ago', status: 'done', statusLabel: 'delivered', total: 6.50 },
{ id: 'p3', store: 'Solana Wheels', cat: 'ride', emoji: '🚗', swatch: '#1e40af', summary: 'Ride to Mission St', when: '5 days ago', status: 'done', statusLabel: 'completed', total: 12.40 },
{ id: 'p4', store: 'Smash House', cat: 'burger', emoji: '🐔', swatch: '#9a3412', summary: '2 items · burger + fries', when: 'last week', status: 'done', statusLabel: 'delivered', total: 21.50 }];


// ─────────────────────────────────────────────────────────────
// useMic — getUserMedia + AnalyserNode RMS → CSS var
// ─────────────────────────────────────────────────────────────
// One shared AudioContext for the whole app, created lazily and REUSED across
// listening sessions. iOS Safari stops delivering mic audio after the first
// session when you create + close an AudioContext every time; a single resumed
// context is reliable. (Fixes "mic catches once, then nothing on the 2nd tap".)
let _sharedAudioCtx = null;
function getSharedAudioCtx() {
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return null;
  if (!_sharedAudioCtx || _sharedAudioCtx.state === 'closed') _sharedAudioCtx = new AC();
  return _sharedAudioCtx;
}

function useMic(active, levelRef, hostRef, recRef) {
  useEffect(() => {
    if (!active) {
      if (hostRef.current) hostRef.current.style.setProperty('--vol', '0');
      levelRef.current = 0;
      return;
    }
    let audioCtx,analyser,source,raf,stream,rec,alive = true;
    let chunks = [];
    let smoothed = 0;
    let lastVol = '';   // last --vol string written → skip redundant orb repaints
    const start = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        if (!alive) {stream.getTracks().forEach((t) => t.stop());return;}
        // record the same stream so Whisper can produce the final transcript
        if (recRef && window.MediaRecorder) {
          try {
            const mime = pickRecMime();
            rec = mime ? new MediaRecorder(stream, { mimeType: mime }) : new MediaRecorder(stream);
            rec.ondataavailable = (e) => {if (e.data && e.data.size) chunks.push(e.data);};
            rec.start();
            recRef.current = { stop: () => new Promise((resolve) => {
              const make = () => new Blob(chunks, { type: rec && rec.mimeType || 'audio/webm' });
              if (!rec || rec.state === 'inactive') {resolve(make());return;}
              rec.onstop = () => resolve(make());
              try {rec.stop();} catch (e) {resolve(make());}
            }) };
          } catch (e) {console.warn('recorder unavailable', e?.name || e);if (recRef) recRef.current = null;}
        }
        // Reuse the shared context (see getSharedAudioCtx) and make sure it's
        // running — iOS leaves a fresh/idle context 'suspended' and the analyser
        // then reads silence on the 2nd+ session.
        audioCtx = getSharedAudioCtx();
        if (!audioCtx) return;                 // no WebAudio → recorder still works
        if (audioCtx.state === 'suspended') { try { await audioCtx.resume(); } catch (_) {} }
        if (!alive) { stream.getTracks().forEach((t) => t.stop()); return; }
        source = audioCtx.createMediaStreamSource(stream);
        analyser = audioCtx.createAnalyser();
        analyser.fftSize = 512;
        analyser.smoothingTimeConstant = 0.55;
        source.connect(analyser);
        const data = new Uint8Array(analyser.frequencyBinCount);
        const loop = () => {
          if (!alive) return;
          analyser.getByteFrequencyData(data);
          let sum = 0;
          for (let i = 0; i < data.length; i++) {
            const w = i < 48 ? 1.2 : 0.6;
            sum += data[i] * w;
          }
          const avg = sum / data.length / 220;
          // heavier low-pass = smoother, floatier orb scaling ("плавнее")
          smoothed = smoothed * 0.85 + avg * 0.15;
          const v = Math.max(0, Math.min(1.4, smoothed));
          levelRef.current = v;
          // Each --vol write repaints the orb's reactive glow (box-shadow, which
          // isn't GPU-composited). Only touch the DOM when the value changes at
          // 0.01 granularity: at silence/steady state this skips nearly every
          // write, and the step is imperceptible given the low-pass smoothing
          // above + the CSS transitions on the reactive elements. Keeps the
          // "floaty" feel, drops a constant repaint source on the voice screen.
          const s = v.toFixed(2);
          if (s !== lastVol) {
            lastVol = s;
            if (hostRef.current) hostRef.current.style.setProperty('--vol', s);
          }
          raf = requestAnimationFrame(loop);
        };
        loop();
      } catch (e) {
        console.warn('Mic permission denied or unavailable', e?.name || e);
        showMicHint('mic blocked — try tapping a chip below');
      }
    };
    start();
    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      try {if (rec && rec.state !== 'inactive') rec.stop();} catch (e) {}
      if (recRef) recRef.current = null;
      if (stream) stream.getTracks().forEach((t) => t.stop());
      // Disconnect this session's nodes but DO NOT close the shared context —
      // closing + recreating it per session is what made iOS drop the mic.
      try { if (source) source.disconnect(); } catch (e) {}
      try { if (analyser) analyser.disconnect(); } catch (e) {}
      if (hostRef.current) hostRef.current.style.setProperty('--vol', '0');
      levelRef.current = 0;
    };
  }, [active]);
}

function showMicHint(msg) {
  const el = document.getElementById('mic-hint');
  if (!el) return;
  el.textContent = msg;
  el.classList.add('on');
  clearTimeout(showMicHint._t);
  showMicHint._t = setTimeout(() => el.classList.remove('on'), 2600);
}

// ── OpenAI Whisper STT via the local serve.py proxy (the key stays server-side,
//    never in the browser). We POST the recorded audio blob and get back text. ──
function pickRecMime() {
  if (!window.MediaRecorder) return '';
  const types = ['audio/webm;codecs=opus', 'audio/webm', 'audio/ogg;codecs=opus', 'audio/mp4'];
  for (const t of types) {try {if (MediaRecorder.isTypeSupported(t)) return t;} catch (e) {}}
  return '';
}
async function transcribeWhisper(blob) {
  const res = await fetch('/api/transcribe', {
    method: 'POST',
    headers: { 'Content-Type': blob.type || 'audio/webm' },
    body: blob });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.detail || data.error || ('HTTP ' + res.status));
  return (data.text || '').trim();
}

// ─────────────────────────────────────────────────────────────
// useTranscript — webkitSpeechRecognition
// ─────────────────────────────────────────────────────────────
function useTranscript(active, setTranscript) {
  useEffect(() => {
    if (!active) return;
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;
    const rec = new SR();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = 'en-US';
    let final = '';
    rec.onresult = (e) => {
      let interim = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const t = e.results[i][0].transcript;
        if (e.results[i].isFinal) final += t + ' ';else
        interim += t;
      }
      setTranscript((final + interim).trim());
    };
    rec.onerror = () => {};
    rec.onend = () => {};
    try {rec.start();} catch (e) {}
    return () => {try {rec.stop();} catch (e) {}};
  }, [active]);
}

// ─────────────────────────────────────────────────────────────
// Voice Orb — premium gradient sphere (After Effects "gradient sphere" recipe
// rebuilt in CSS): top→bottom depth gradient, bright rim light, floating
// diffuse inner blobs, outer bloom. Reacts to mic level via --vlive.
// ─────────────────────────────────────────────────────────────
function VoiceOrb({ theme, listening }) {
  // Per-theme palette: [topHighlight, mid, deepShadow, bottomGlow, blobAccent]
  const P = {
    'theme-solayerAI': {
      top: '#9CFFE0', mid: '#0c5a47', deep: '#04130f',
      bottom: '#15E0D8', blob: '#7CFFD4', blob2: '#2BE0C8', rim: '#7CFFD9',
    },
    'theme-indigo': {
      top: '#C9BBFF', mid: '#3a2f8f', deep: '#0a0820',
      bottom: '#7C6BFF', blob: '#B6A0FF', blob2: '#6155F5', rim: '#C9BBFF',
    },
    'theme-lily': {
      top: '#E6F6C8', mid: '#4a7a2e', deep: '#16330c',
      bottom: '#9FE070', blob: '#cfe89a', blob2: '#7FB04D', rim: '#E6F6C8',
    },
  }[theme.bgClass] || {
    top: '#9CFFE0', mid: '#0c5a47', deep: '#04130f',
    bottom: '#15E0D8', blob: '#7CFFD4', blob2: '#2BE0C8', rim: '#7CFFD9',
  };
  return (
    <div className={`vorb ${listening ? 'is-live' : ''}`}
      style={{
        '--top': P.top, '--mid': P.mid, '--deep': P.deep,
        '--bottom': P.bottom, '--blob': P.blob, '--blob2': P.blob2, '--rim': P.rim,
      }}>
      {/* outer bloom */}
      <div className="vorb-bloom" />
      {/* stage — disc + edge glow + beam all share ONE box so the border
          beam is always locked to the sphere at any size or scale */}
      <div className="vorb-stage">
        {/* sphere body — clips the floating blobs */}
        <div className="vorb-disc">
          <div className="vorb-gradient" />
          <div className="vorb-blobs">
            <span className="vb-blob vb-b1" />
            <span className="vb-blob vb-b2" />
            <span className="vb-blob vb-b3" />
            <span className="vb-blob vb-b4" />
            <span className="vb-blob vb-b5" />
          </div>
          <div className="vorb-noise" />
          <div className="vorb-innerglow" />
          <div className="vorb-toplight" />
          <div className="vorb-rim" />
        </div>
        {/* animated deep edge glow — breathing halo + travelling border beam */}
        <div className="vorb-ring" />
        <div className="vorb-beam"><span className="vorb-beam-light" /></div>
      </div>
    </div>
  );
}

function Particles({ theme, listening }) {
  const dots = Array.from({ length: 14 });
  return (
    <div className={`particles ${listening ? 'is-live' : ''}`}>
      {dots.map((_, i) =>
      <span key={i} className="particle"
      style={{
        left: `${i * 37 % 100}%`,
        top: `${i * 53 % 100}%`,
        background: theme.accent,
        animationDelay: `${i * 0.31 % 4}s`,
        animationDuration: `${4 + i % 5}s`
      }} />
      )}
    </div>);

}

// ─────────────────────────────────────────────────────────────
// Icons
// ─────────────────────────────────────────────────────────────
function Sparkle({ color = '#00ffa3', size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
      <path d="M8 1.5L9.3 6.2L14 7.5L9.3 8.8L8 13.5L6.7 8.8L2 7.5L6.7 6.2L8 1.5Z" fill={color} />
      <path d="M13 1L13.5 2.5L15 3L13.5 3.5L13 5L12.5 3.5L11 3L12.5 2.5L13 1Z" fill={color} opacity="0.7" />
    </svg>);

}
function Clipboard({ color = '#fff' }) {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <rect x="5" y="3.5" width="12" height="15" rx="2.5" stroke={color} strokeWidth="1.6" />
      <rect x="8" y="2" width="6" height="3.2" rx="1" fill={color} />
      <path d="M8.5 9h5M8.5 12h5M8.5 15h3" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    </svg>);

}
function ChevLeft({ color = '#fff' }) {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M11 3L5 9l6 6" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>);

}
function MicGlyph() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <rect x="6" y="2" width="4" height="7.5" rx="2" fill="currentColor" />
      <path d="M3.5 7.5a4.5 4.5 0 009 0M8 12v2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" fill="none" />
    </svg>);

}
function Pin({ color = 'currentColor' }) {
  return (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
      <path d="M6.5 1.5C4 1.5 2 3.4 2 5.8c0 3.5 4.5 5.7 4.5 5.7s4.5-2.2 4.5-5.7c0-2.4-2-4.3-4.5-4.3z" stroke={color} strokeWidth="1.2" />
      <circle cx="6.5" cy="5.8" r="1.6" fill={color} />
    </svg>);

}
function Star({ color = '#FFC857' }) {
  return (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
      <path d="M6.5 1l1.6 3.3 3.6.5-2.6 2.5.6 3.6L6.5 9.2 3.3 11l.6-3.6L1.3 4.8l3.6-.5L6.5 1z" fill={color} />
    </svg>);

}
function CheckGlyph({ size = 28, color = '#fff' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="none">
      <path d="M5 14.5l5.5 5.5L23 8" stroke={color} strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>);

}
function FrogAvatarSmall({ id = 'frog-avatar-sm', size = 36, animated = false }) {
  if (animated) return <AnimatedFrogAvatar id={id} size={size} />;
  return (
    <img
      id={id}
      className="img-fade"
      src="mascot.png"
      alt="Solayer mascot"
      style={{
        width: `${size}px`, height: `${size}px`,
        display: 'block', flexShrink: 0,
        objectFit: 'contain', objectPosition: 'center',
        borderRadius: 8,
        imageRendering: 'auto'
      }} />);

}

// The header avatar replays a looped clip every 5s, CYCLING through blink →
// bubble-gum → glitch. The blink plays in place; bubble and glitch live on
// larger, centred layers (their source canvas was widened so effects can spill
// past the avatar box). The in-place frog is hidden while bubble/glitch play, so
// only one frog is ever on screen — no doubling. Frame 0 of every clip === the
// resting frog, so swapping layers is seamless.
const FROG_ANIM_SEQUENCE = ['blink', 'bubble', 'glitch'];
function AnimatedFrogAvatar({ id, size }) {
  const [anim, setAnim] = useState(null); // null | 'blink' | 'bubble' | 'glitch'
  const iRef = useRef(0);
  useEffect(() => {
    const t = setInterval(() => {
      setAnim(FROG_ANIM_SEQUENCE[iRef.current % FROG_ANIM_SEQUENCE.length]);
      iRef.current += 1;
    }, 5000);
    return () => clearInterval(t);
  }, []);
  const rest = () => setAnim(null);
  const hideBase = anim === 'bubble' || anim === 'glitch';
  return (
    <span className="mascot-avatar"
      style={{ '--mascot-size': `${size}px`, width: `${size}px`, height: `${size}px` }}>
      <span
        id={id}
        className={`mascot-blink${anim === 'blink' ? ' playing' : ''}${hideBase ? ' hidden' : ''}`}
        onAnimationEnd={rest}
        role="img"
        aria-label="Solayer mascot" />
      <span
        className={`mascot-bubble${anim === 'bubble' ? ' playing' : ''}`}
        onAnimationEnd={rest}
        aria-hidden="true" />
      <span
        className={`mascot-glitch${anim === 'glitch' ? ' playing' : ''}`}
        onAnimationEnd={rest}
        aria-hidden="true" />
    </span>);

}

// Single-line dictation transcript: words stream in left→right; once the line
// fills the viewport it glides left (CSS transform transition retargets smoothly
// as it grows) and older words dissolve under a left-edge mask. No wrapping, so
// nothing below ever shifts.
function VoiceTranscript({ transcript }) {
  const viewRef = useRef(null);
  const streamRef = useRef(null);
  useEffect(() => {
    const view = viewRef.current, stream = streamRef.current;
    if (!view) return;
    if (!stream) { view.classList.remove('is-scrolling'); return; }
    const viewW = view.clientWidth, streamW = stream.scrollWidth;
    const overflow = streamW - viewW;
    if (overflow > 0) {
      stream.style.transform = `translateX(${-overflow}px)`;   // pin the end to the right edge
      view.classList.add('is-scrolling');                       // turn on the left fade
    } else {
      stream.style.transform = `translateX(${(viewW - streamW) / 2}px)`; // centred while it fits
      view.classList.remove('is-scrolling');
    }
  }, [transcript]);

  if (!transcript) {
    return (
      <div className="voice-transcript" ref={viewRef}>
        <span className="vt-hint">say what you'd like to order…</span>
      </div>);
  }
  const words = transcript.split(/\s+/).filter(Boolean);
  return (
    <div className="voice-transcript" ref={viewRef}>
      <span className="vt-stream" ref={streamRef}>
        {words.map((w, i) =>
        <React.Fragment key={i}><span className="vt-word">{w}</span>{' '}</React.Fragment>
        )}
        <span className="vt-caret" aria-hidden="true">|</span>
      </span>
    </div>);

}

// ─────────────────────────────────────────────────────────────
// Main agent
// ─────────────────────────────────────────────────────────────
function FrogAgent({ theme, intensity = 1, showParticles = true }) {
  // phase: idle | listening | thinking | searching | confirming | paying | success
  // open on the voice screen (the "talk, we order" selling point);
  // chat is the optional fallback (keyboard button in the voice controls).
  // Exception — preview/automation host: the voice phase auto-requests the mic
  // and renders a heavy backdrop-filter orb, which hangs preview screenshots/eval
  // and pops a mic prompt nobody answers. The Claude preview is an Electron app
  // (navigator.webdriver is false there), so detect it by UA and open on the
  // lighter idle chat instead. Real browsers (Chrome/Safari/Firefox) are
  // unaffected and still open on the voice hero.
  const isPreviewHost = typeof navigator !== 'undefined' && (
    navigator.webdriver === true ||
    /\bElectron\b|\bClaude\//.test(navigator.userAgent || '')
  );
  const [phase, setPhase] = useState(isPreviewHost ? 'idle' : 'listening');
  const [transcript, setTranscript] = useState('');
  const [intent, setIntent] = useState(null); // 'pizza' etc
  const [storeIdx, setStoreIdx] = useState(0);
  // cart: array of { name, desc, price, emoji, qty }
  const [cart, setCart] = useState([]);
  // chat thread messages
  const [messages, setMessages] = useState([]);
  // composer text (chat screen typing)
  const [typed, setTyped] = useState('');
  // in-conversation: reveal the full category strip when the user wants more
  const [showMoreChips, setShowMoreChips] = useState(false);
  // computed once on mount — time-of-day greeting word for the idle hero
  const [timeGreeting] = useState(() => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 18) return 'Good afternoon';
    return 'Good evening';
  });
  // recording duration
  const [elapsed, setElapsed] = useState(0);
  // orders history
  const [orders, setOrders] = useState(() => ({
    upcoming: [],
    past: SEED_PAST_ORDERS
  }));
  const hostRef = useRef(null);
  const levelRef = useRef(0);
  const recCtrlRef = useRef(null); // { stop: () => Promise<Blob> } while recording

  const listening = phase === 'listening';
  useMic(listening, levelRef, hostRef, recCtrlRef);
  useTranscript(listening, setTranscript);

  // Speed up the rim beam during thinking/searching WITHOUT restarting it.
  // Changing its CSS animation-duration would remap the sweep (it'd jump to a new
  // spot); nudging the running animation's playbackRate just makes it accelerate
  // in place. is-live keeps every other orb animation at a constant duration, so
  // the gradient + beam carry straight through the press untouched.
  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const rate = (phase === 'thinking' || phase === 'searching') ? 2 : 1;
    host.querySelectorAll('.vorb-beam-light').forEach((b) => {
      if (b.getAnimations) b.getAnimations().forEach((a) => { a.playbackRate = rate; });
    });
  }, [phase]);

  // Preload every image once, up-front, so opening any tab later is instant and
  // the browser never re-fetches/re-decodes on each mount (paired with the
  // session caching serve.py now sends for images). Runs once on mount.
  useEffect(() => {
    const urls = new Set();
    (CATEGORIES || []).forEach((c) => {
      urls.add(`images/icon-${c.key}.webp`);
      urls.add(`images/cat-${c.key}.webp`);
    });
    Object.keys(STORES || {}).forEach((cat) => {
      (STORES[cat] || []).forEach((s) => urls.add(storeImg(s, cat)));
    });
    (typeof CARD_TX !== 'undefined' ? CARD_TX : []).forEach((t) => { if (t.img) urls.add(t.img); });
    ['mascot.png', 'fig-card-texture.webp', 'fig-solayer-wordmark.svg', 'Emerald Logo.png',
      'mascot-anim-strip.webp', 'mascot-bubble-strip.webp', 'mascot-glitch-strip.webp']
      .forEach((u) => urls.add(u));
    urls.forEach((u) => { const im = new Image(); im.decoding = 'async'; im.src = u; });

    // Warm the Apple-emoji cache too (menu/category/order emoji are fetched from
    // a CDN; preloading them once removes the visible pop-in when a screen opens).
    if (typeof window !== 'undefined' && typeof window.preloadAppleEmoji === 'function') {
      const emoji = [];
      (CATEGORIES || []).forEach((c) => { if (c.emoji) emoji.push(c.emoji); });
      Object.keys(typeof MENUS !== 'undefined' ? MENUS : {}).forEach((cat) => {
        (MENUS[cat] || []).forEach((m) => { if (m.emoji) emoji.push(m.emoji); });
      });
      ['👋', '✨', '🎉', '🍴', '⬇️'].forEach((e) => emoji.push(e));
      window.preloadAppleEmoji(emoji);
    }
  }, []);

  // recording timer
  useEffect(() => {
    if (!listening) {setElapsed(0);return;}
    const t = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(t);
  }, [listening]);

  useEffect(() => {
    if (!hostRef.current) return;
    hostRef.current.style.setProperty('--intensity', String(intensity));
  }, [intensity]);

  const store = intent ? STORES[intent]?.[storeIdx] : null;
  const menu = intent ? MENUS[intent] || [] : [];
  const cartCount = cart.reduce((n, l) => n + l.qty, 0);
  const cartTotal = cart.reduce((s, l) => s + l.qty * l.price, 0);

  // ── cart helpers ──
  const addToCart = useCallback((item) => {
    setCart((prev) => {
      const i = prev.findIndex((l) => l.name === item.name);
      if (i >= 0) {
        const next = prev.slice();
        next[i] = { ...next[i], qty: next[i].qty + 1 };
        return next;
      }
      return [...prev, { ...item, qty: 1 }];
    });
  }, []);
  const decFromCart = useCallback((name) => {
    setCart((prev) => {
      const i = prev.findIndex((l) => l.name === name);
      if (i < 0) return prev;
      const next = prev.slice();
      if (next[i].qty <= 1) next.splice(i, 1);else
      next[i] = { ...next[i], qty: next[i].qty - 1 };
      return next;
    });
  }, []);
  const qtyOf = useCallback((name) => {
    const l = cart.find((l) => l.name === name);return l ? l.qty : 0;
  }, [cart]);

  // ── phase transitions ──
  const goIdle = useCallback(() => {
    setPhase('idle');setTranscript('');setIntent(null);setStoreIdx(0);setCart([]);
  }, []);
  const startListen = useCallback(() => {
    setTranscript('');setIntent(null);setStoreIdx(0);setCart([]);setPhase('listening');
  }, []);
  // Orb press feedback: a quick squish-in + (where supported) a small haptic
  // "impact" on finger-down; release springs back with the CSS overshoot.
  const orbPressDown = useCallback((e) => {
    try { if (navigator.vibrate) navigator.vibrate(8); } catch (_) {}
    e.currentTarget.classList.add('is-pressing');   // gentle squish from the center (CSS)
  }, []);
  const orbPressUp = useCallback((e) => { e.currentTarget.classList.remove('is-pressing'); }, []);
  const buildOrderFrom = useCallback((text) => {
    const cat = detectIntent(text) || 'pizza';
    const s = STORES[cat][0];
    const emoji = CATEGORIES.find((c) => c.key === cat)?.emoji;
    const item = { name: s.item, desc: 'featured order', price: s.price, emoji, qty: 1 };
    setIntent(cat);setStoreIdx(0);setCart([item]);
    const id = Date.now();
    setMessages((prev) => [
    ...prev,
    { id: `m-${id}-u`, from: 'user', text },
    { id: `m-${id}-f`, from: 'frog',
      text: `Found ${s.name} nearby — ${s.item.toLowerCase()} for $${s.price.toFixed(2)}, ready in ${s.eta}.`,
      card: { kind: 'order', cat, store: s, item } }]
    );
    setTranscript('');
    setPhase('idle');
  }, []);
  const stopAndProcess = useCallback(async () => {
    const liveText = transcript.trim();
    // grab the recording while we're still "listening" (before useMic cleanup)
    let blob = null;
    const ctrl = recCtrlRef.current;
    if (ctrl && ctrl.stop) {try {blob = await ctrl.stop();} catch (e) {}}
    // nothing said and nothing recorded → just slide to chat, no message
    if (!liveText && !(blob && blob.size > 1200)) {setPhase('idle');setTranscript('');return;}
    setPhase('thinking');
    // OpenAI Whisper is the source of truth; fall back to the live transcript
    let text = liveText;
    if (blob && blob.size > 1200) {
      try {
        const whisper = await transcribeWhisper(blob);
        if (whisper) text = whisper;
      } catch (e) {
        console.warn('Whisper failed, using live transcript:', e?.message || e);
        if (!text) showMicHint('voice transcription unavailable');
      }
    }
    text = (text || '').trim();
    if (!text) {setPhase('idle');setTranscript('');return;}
    buildOrderFrom(text);
  }, [transcript, buildOrderFrom]);
  const pickChip = useCallback((cat) => {
    setTranscript(`I want ${cat}`);setIntent(cat);setStoreIdx(0);
    setPhase('searching');
    setTimeout(() => setPhase('confirming'), 1000);
  }, []);
  const pickCategory = useCallback((cat) => {
    // tap a popular-category circle → show the browse list (no mic)
    setIntent(cat);setStoreIdx(0);setTranscript('');setCart([]);
    setPhase('browse');
  }, []);
  const pickStoreFromBrowse = useCallback((idx) => {
    // tap a store in browse → open its menu (no auto-confirm)
    setStoreIdx(idx);setCart([]);setPhase('menu');
  }, []);
  const checkoutCart = useCallback(() => {
    if (cart.length === 0) return;
    setPhase('confirming');
  }, [cart.length]);
  const submitTyped = useCallback(() => {
    const text = typed.trim();
    if (!text) return;
    const cat = detectIntent(text) || 'pizza';
    const s = STORES[cat][0];
    const emoji = CATEGORIES.find((c) => c.key === cat)?.emoji;
    const item = { name: s.item, desc: 'featured order', price: s.price, emoji, qty: 1 };
    setIntent(cat);setStoreIdx(0);setCart([item]);setTyped('');
    const id = Date.now();
    setMessages((prev) => [
    ...prev,
    { id: `m-${id}-u`, from: 'user', text },
    { id: `m-${id}-f`, from: 'frog',
      text: `Found ${s.name} nearby — ${s.item.toLowerCase()} for $${s.price.toFixed(2)}, ready in ${s.eta}.`,
      card: { kind: 'order', cat, store: s, item } }]
    );
  }, [typed]);
  const acceptOrderCard = useCallback((card) => {
    setIntent(card.cat);setStoreIdx(0);setCart([card.item]);setPhase('confirming');
  }, []);
  // "Order again" from a past order = repeat the EXACT order: same store + same
  // items/total, straight to Review + Face ID. (No re-picking a category/store.)
  const reorderPast = useCallback((o) => {
    const list = STORES[o.cat] || [];
    const idx = list.findIndex((s) => s.name === o.store);
    setIntent(o.cat);
    setStoreIdx(idx >= 0 ? idx : 0);
    setCart([{ name: o.summary, price: o.total, qty: 1, emoji: o.emoji }]);
    setTranscript('');
    setPhase('confirming');
  }, []);

  // tab navigation — AI tab opens voice first; if a chat is already going, keep it
  const navTab = useCallback((k) => {
    if (k === 'ai') setPhase(messages.length ? 'idle' : 'listening');else
    if (k === 'card') setPhase('wallet');else
    if (k === 'account') setPhase('account');
  }, [messages.length]);
  const activeTab =
  phase === 'wallet' && 'card' ||
  phase === 'account' && 'account' ||
  'ai'; // orders + AI flow all roll up to the AI Order tab
  // Face ID hold completes → record the order and go straight to success.
  // (The old standalone "paying" screen is gone; biometric auth now lives inside
  // the Review-order screen, so there's no redundant price+FaceID step.)
  const placeOrder = useCallback(() => {
    setOrders((prev) => {
      const cat = CATEGORIES.find((c) => c.key === intent);
      const newOrder = {
        id: `o-${Date.now()}`,
        store: store?.name || 'Store',
        cat: intent,
        img: store?.img || null,
        emoji: cat?.emoji || '🍴',
        swatch: store?.swatch || '#444',
        summary: cart.length === 1 ? cart[0].name : `${cart.reduce((n, l) => n + l.qty, 0)} items`,
        when: 'just now',
        status: 'preparing',
        statusLabel: `ETA ${store?.eta || '20 min'}`,
        total: cartTotal
      };
      return { ...prev, upcoming: [newOrder, ...prev.upcoming] };
    });
    setPhase('success');
  }, [intent, store, cart, cartTotal]);

  // ── header copy by phase ──
  const headerByPhase = {
    idle: { name: 'Solayer AI', sub: messages.length ? 'ready when you are' : 'your everyday ordering AI' },
    listening: { name: 'Solayer AI', sub: 'tap when finished' },
    thinking: { name: 'Solayer AI', sub: 'hmm, let me think' },
    searching: { name: 'Solayer AI', sub: `searching nearby ${intent || ''}…` },
    browse: { name: CATEGORIES.find((c) => c.key === intent)?.label || 'Browse', sub: `${(STORES[intent] || []).length} places nearby` },
    menu: { name: store?.name || 'Menu', sub: store ? `${store.rating}★ · ${store.eta} · ${store.dist}` : '' },
    confirming: { name: 'Review order', sub: store?.name || '' },
    success: { name: 'Order placed', sub: store ? `${store.name} · ETA ${store.eta}` : '' },
    orders: { name: 'Your orders', sub: `${orders.upcoming.length} upcoming · ${orders.past.length} past` },
    wallet: { name: 'Card', sub: 'Solayer Pay · USDC on Solana' },
    account: { name: 'Account', sub: 'manage your profile' }
  };
  const h = headerByPhase[phase];

  // ── frog phase mapping ──
  const frogPhase =
  phase === 'listening' ? 'listening' :
  phase === 'thinking' ? 'thinking' :
  phase === 'searching' ? 'thinking' :
  phase === 'success' ? 'response' :
  'idle';

  // ── show centerpiece stage in these phases ──
  const stagePhases = ['listening', 'thinking', 'searching'];
  const showStage = stagePhases.includes(phase);
  const blobLive = phase === 'listening';

  return (
    <div className={`agent-host phase-${phase} ${theme.bgClass}`}
    ref={hostRef}
    style={{
      '--ink': theme.ink,
      '--sub': theme.sub,
      '--haze': theme.haze,
      '--accent': theme.accent,
      '--chip': theme.chip,
      '--chip-border': theme.chipBorder,
      '--bubble': theme.bubble,
      '--card': theme.card,
      '--card-border': theme.cardBorder,
      '--pill': theme.pill,
      '--pill-ink': theme.pillInk,
      '--primary-pill': theme.primaryPill,
      '--primary-pill-ink': theme.primaryPillInk,
      '--surface-soft': theme.surfaceSoft,
      '--surface-soft-hover': theme.surfaceSoftHover,
      '--intensity': intensity
    }}>

      {/* header — adapts to phase (the Card tab renders its own Figma header) */}
      {phase !== 'wallet' &&
      <header className="agent-header">
        {phase === 'confirming' || phase === 'browse' || phase === 'menu' || phase === 'orders' ?
        <button className="icon-btn back-btn" onClick={() => {
          if (phase === 'menu') {setPhase('browse');setCart([]);} else
          if (phase === 'confirming') {setPhase(menu.length ? 'menu' : 'idle');} else
          goIdle();
        }} aria-label={phase === 'orders' ? 'back to chat' : 'back'}>
            <ChevLeft color={theme.ink} />
          </button> :
        phase === 'wallet' || phase === 'account' || phase === 'success' ?
        <div className="icon-btn" aria-hidden="true" style={{ width: 44, height: 44, background: 'transparent', border: 'none' }} /> :

        <div className="header-id">
            <div className="avatar-wrap">
              <FrogAvatarSmall id="frog-header" size={52} animated />
            </div>
            <div className="header-text">
              <div className="header-title">{h.name}</div>
              <div className="header-sub">{h.sub}</div>
            </div>
          </div>
        }
        {(phase === 'confirming' || phase === 'success' || phase === 'browse' || phase === 'menu' || phase === 'orders') &&
        <div className="header-center">
            <div className="header-title-center">{h.name}</div>
            <div className="header-sub-center">{h.sub}</div>
          </div>
        }
        <button className="icon-btn" aria-label="orders" onClick={() => setPhase('orders')}
        style={{ visibility: phase === 'wallet' || phase === 'account' || phase === 'orders' ? 'hidden' : 'visible' }}>
          <Clipboard color={theme.ink} />
          {orders.upcoming.length > 0 &&
          <span className="icon-btn-badge">{orders.upcoming.length}</span>
          }
        </button>
      </header>
      }

      {/* ── IDLE: greeting hero + compact category chips ── */}
      {phase === 'idle' &&
      <div className="chat-area">
          {messages.length === 0 ?
        <div className="idle-empty">
              <div className="greet-hero">
                <span className="greet-hello">
                  {timeGreeting} <span className="wave-emoji" aria-hidden="true">👋</span>
                </span>
                <span className="greet-line" role="heading" aria-level={2}>What are you feeling?</span>
              </div>

              {/* Solayer Card with AI icon */}
              <div className="solayer-card-widget">
                <div className="scw-bg-glow" aria-hidden="true" />
                <div className="scw-top">
                  <img src="fig-solayer-wordmark.svg" className="scw-wordmark" alt="Solayer" draggable="false" />
                  <div className="scw-ai-badge" aria-label="AI powered">
                    <svg width="12" height="12" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                      <path d="M10 2v2M10 16v2M2 10h2M16 10h2M4.22 4.22l1.42 1.42M14.36 14.36l1.42 1.42M4.22 15.78l1.42-1.42M14.36 5.64l1.42-1.42" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      <circle cx="10" cy="10" r="3" fill="currentColor"/>
                    </svg>
                    <span>AI</span>
                  </div>
                </div>
                <div className="scw-balance-label">Available Balance</div>
                <div className="scw-balance">$2,450.00</div>
                <div className="scw-bottom">
                  <div className="scw-chip" aria-hidden="true">
                    <svg width="28" height="20" viewBox="0 0 28 20" fill="none">
                      <rect width="28" height="20" rx="4" fill="url(#chip-grad)"/>
                      <line x1="0" y1="7" x2="28" y2="7" stroke="rgba(0,0,0,0.18)" strokeWidth="1"/>
                      <line x1="0" y1="13" x2="28" y2="13" stroke="rgba(0,0,0,0.18)" strokeWidth="1"/>
                      <line x1="9" y1="0" x2="9" y2="20" stroke="rgba(0,0,0,0.18)" strokeWidth="1"/>
                      <line x1="19" y1="0" x2="19" y2="20" stroke="rgba(0,0,0,0.18)" strokeWidth="1"/>
                      <defs>
                        <linearGradient id="chip-grad" x1="0" y1="0" x2="28" y2="20" gradientUnits="userSpaceOnUse">
                          <stop stopColor="#e0c97a"/>
                          <stop offset="1" stopColor="#b8972e"/>
                        </linearGradient>
                      </defs>
                    </svg>
                  </div>
                  <div className="scw-number">•••• •••• •••• 4291</div>
                </div>
              </div>

              <DishCarousel categories={CATEGORIES} onPick={pickCategory} />
            </div> :

        <>
              <div className="chat-thread">
                {messages.map((m) =>
            m.from === 'user' ?
            <div key={m.id} className="msg msg-user">
                      <div className="bubble bubble-user">{m.text}</div>
                    </div> :

            <div key={m.id} className="msg msg-frog">
                      <div className="frog-msg-stack">
                        <div className="bubble bubble-frog">{m.text}</div>
                        {m.card?.kind === 'order' &&
              <button
                className="order-suggest"
                type="button"
                onClick={() => acceptOrderCard(m.card)}
                aria-label={`Review order from ${m.card.store.name}, $${m.card.item.price.toFixed(2)}`}>
                            <span className="os-thumb" aria-hidden="true"
                  style={{ backgroundColor: m.card.store.swatch }}>
                              <img className="os-thumb-img img-fade" src={storeImg(m.card.store, m.card.cat)} alt="" aria-hidden="true" loading="lazy" decoding="async" draggable="false" />
                            </span>
                            <span className="os-body">
                              <span className="os-store">{m.card.store.name}</span>
                              <span className="os-meta">{m.card.store.rating}★ · {m.card.store.eta} · {m.card.store.dist}</span>
                            </span>
                            <span className="os-cta" aria-hidden="true">
                              <span className="os-price">${m.card.item.price.toFixed(2)}</span>
                              <span className="os-go">
                                <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><path d="M5 3l5 4.5L5 12" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" /></svg>
                              </span>
                            </span>
                          </button>
              }
                      </div>
                    </div>
            )
            }
              </div>
              {!showMoreChips ?
            <div className="quick-chips-more-row">
                  <button
                className="quick-chip-add"
                type="button"
                onClick={() => setShowMoreChips(true)}
                aria-expanded="false"
                aria-label="Order something else">
                    <span aria-hidden="true">+</span> order something else
                  </button>
                </div> :
            <div className="quick-chips quick-chips-quiet" role="list" aria-label="Order something else">
                  {CATEGORIES.map((c, i) =>
              <button key={c.key} className="quick-chip"
              type="button"
              style={{ '--cat-tint': c.tint, animationDelay: `${i * 25}ms` }}
              onClick={() => {pickCategory(c.key);setShowMoreChips(false);}}
              aria-label={`Order ${c.label.toLowerCase()}`}>
                      <CategoryIcon cat={c} />
                      <span className="quick-chip-label">{c.label}</span>
                    </button>
              )}
                </div>
            }
            </>
        }
        </div>
      }

      {/* ── LISTENING / THINKING / SEARCHING: voice orb + transcript ── */}
      {showStage &&
      <div className="stage">
          {showParticles && phase !== 'listening' && <Particles theme={theme} listening={blobLive} />}

          <div className="blob-stack"
            onClick={blobLive ? stopAndProcess : undefined}
            onPointerDown={blobLive ? orbPressDown : undefined}
            onPointerUp={blobLive ? orbPressUp : undefined}
            onPointerLeave={blobLive ? orbPressUp : undefined}
            onPointerCancel={blobLive ? orbPressUp : undefined}>
            <div className="blob-scaler">
              <VoiceOrb theme={theme} listening={showStage} />
            </div>
          </div>

          {phase === 'listening' &&
        <div className="voice-stage-text">
              <VoiceTranscript transcript={transcript} />
              <div className="voice-meta">
                <span className="voice-dot" aria-hidden="true" />
                <span className="voice-label">Listening</span>
              </div>
            </div>
        }
          {phase === 'thinking' &&
        <div className="live-transcript thinking-label">thinking…</div>
        }
          {phase === 'searching' &&
        <div className="live-transcript thinking-label">
              <SearchSpinner color={theme.accent} /> searching nearby {intent}…
            </div>
        }
        </div>
      }

      {/* ── BROWSE: list of stores in category ── */}
      {phase === 'browse' && intent &&
      <BrowseScreen
        category={CATEGORIES.find((c) => c.key === intent)}
        stores={STORES[intent] || []}
        onPick={pickStoreFromBrowse}
        accent={theme.accent} />

      }

      {/* ── ORDERS: tabs (past / upcoming) ── */}
      {phase === 'orders' &&
      <OrdersScreen
        theme={theme}
        upcoming={orders.upcoming}
        past={orders.past}
        onReorder={reorderPast}
        onClose={goIdle} />

      }

      {/* ── WALLET: Solayer Pay balance ── */}
      {phase === 'wallet' &&
      <WalletScreen theme={theme} orders={orders} />
      }

      {/* ── ACCOUNT: profile placeholder ── */}
      {phase === 'account' &&
      <AccountScreen theme={theme} />
      }

      {/* ── MENU: store menu with cart ── */}
      {phase === 'menu' && store &&
      <MenuScreen
        theme={theme}
        store={store}
        category={CATEGORIES.find((c) => c.key === intent)}
        menu={menu}
        qtyOf={qtyOf}
        onAdd={addToCart}
        onDec={decFromCart}
        cart={cart}
        cartTotal={cartTotal}
        cartCount={cartCount}
        onCheckout={checkoutCart} />

      }

      {/* ── CONFIRMING: review order + Face-ID hold-to-pay (paying merged in) ── */}
      {phase === 'confirming' && store &&
      <div className="screen-pad confirm-pad">
          <article className="store-card">
            <div className="store-card-hero"
          style={{ backgroundColor: store.swatch }}>
              <img className="store-card-hero-img img-fade" src={storeImg(store, intent)} alt="" aria-hidden="true" loading="lazy" decoding="async" draggable="false" />
              <div className="store-card-hero-shade" aria-hidden="true" />
              <div className="store-card-hero-id">
                <div className="store-name">{store.name}</div>
                <div className="store-meta">
                  <span className="meta-pill ghost"><Star color="#FFC857" /> {store.rating}</span>
                  <span className="meta-pill ghost"><Pin color="#fff" /> {store.dist}</span>
                  <span className="meta-pill ghost">{store.eta}</span>
                </div>
              </div>
            </div>

            <ul className="cart-lines">
              {cart.map((l, i) =>
            <li key={l.name} className="cart-line"
            style={{ animationDelay: `${Math.min(i, 8) * 40}ms` }}>
                  <span className="cart-line-qty">{l.qty}×</span>
                  <span className="cart-line-emoji">{l.emoji}</span>
                  <span className="cart-line-name">{l.name}</span>
                  <span className="cart-line-price">${(l.qty * l.price).toFixed(2)}</span>
                </li>
            )}
            </ul>

            <div className="cart-totals">
              <div className="cart-total-row"><span>subtotal</span><span>${cartTotal.toFixed(2)}</span></div>
              <div className="cart-total-row"><span>network fee</span><span className="good">$0.00 · gasless</span></div>
              <div className="cart-total-row grand"><span>total</span><span>${cartTotal.toFixed(2)} USDC</span></div>
            </div>
          </article>

          <FaceIdHold theme={theme} amount={cartTotal} store={store} onComplete={placeOrder} />
        </div>
      }

      {/* ── SUCCESS: receipt ── */}
      {phase === 'success' && store &&
      <SuccessScreen theme={theme} store={store} cart={cart} total={cartTotal} onDone={goIdle} onMore={startListen} />
      }

      {/* footer CTAs only on AI flow phases */}
      {(phase === 'idle' || phase === 'listening' || phase === 'thinking' || phase === 'searching') &&
      <footer className="agent-footer">
        {phase === 'idle' &&
        <div className="composer" role="search">
            <input
            className="composer-input"
            type="text"
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
            onKeyDown={(e) => {if (e.key === 'Enter') submitTyped();}}
            placeholder="Type or tap mic to order…"
            aria-label="Type your order"
            inputMode="text"
            enterKeyHint="send"
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
            maxLength={240} />

            <div className="composer-actions" data-active={typed.trim() ? 'send' : 'mic'}>
              <button
                className="composer-mic"
                type="button"
                onClick={startListen}
                aria-label="Speak your order"
                tabIndex={typed.trim() ? -1 : 0}
                aria-hidden={typed.trim() ? 'true' : undefined}>
                <MicGlyph />
              </button>
              <button
                className="composer-send"
                type="button"
                onClick={submitTyped}
                aria-label="Send order"
                tabIndex={typed.trim() ? 0 : -1}
                aria-hidden={typed.trim() ? undefined : 'true'}>
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                  <path d="M9 14V4M9 4l-5 5M9 4l5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
          </div>
        }
        {phase === 'listening' &&
        <div className="voice-controls">
            <button className="vc-side" onClick={() => {setTranscript('');setPhase('idle');}}
              aria-label="cancel">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M5 5l8 8M13 5l-8 8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
              </svg>
            </button>
          </div>
        }
        {(phase === 'thinking' || phase === 'searching') &&
        <div className="cta ghost">processing…</div>
        }
      </footer>
      }

      {/* ── always-visible bottom tabs ── */}
      <BottomTabs active={activeTab} onNav={navTab} ordersCount={orders.upcoming.length} accent={theme.accent} />
    </div>);

}

// ─────────────────────────────────────────────────────────────
// Idle dish carousel — buttery auto-drift. The motion is a GPU-composited
// translate3d on an inner track (NOT scrollLeft, which rounds to whole pixels
// and visibly stutters at slow speeds). Two identical copies make a seamless
// loop. A speed multiplier eases to 0 on touch/hover and back to 1 on release,
// so the drift decelerates and re-accelerates softly instead of snapping. Under
// prefers-reduced-motion it's a static, freely-swipeable single row.
// ─────────────────────────────────────────────────────────────
// Category chip glyph. Prefers the generated glassy-emerald icon
// (images/icon-<key>.webp) and quietly falls back to the original emoji until
// that asset exists — so the carousel keeps working before the background
// generation finishes, then upgrades to the custom icons on next load.
function CategoryIcon({ cat }) {
  const [failed, setFailed] = React.useState(false);
  if (failed) {
    return <span className="quick-chip-emoji" aria-hidden="true">{cat.emoji}</span>;
  }
  return (
    <img
      className="quick-chip-icon img-fade"
      src={`images/icon-${cat.key}.webp`}
      alt="" aria-hidden="true" loading="lazy" decoding="async" draggable="false"
      onError={() => setFailed(true)} />);

}

function DishCarousel({ categories, onPick }) {
  const trackRef = useRef(null);
  const speedRef = useRef(1);   // eased current multiplier (0..1)
  const targetRef = useRef(1);  // 0 = paused, 1 = running
  const posRef = useRef(0);     // current scroll offset in px (auto-drift + drag share it)
  const dragRef = useRef({ active: false, startX: 0, startPos: 0, moved: false, captured: false, vel: 0, lastX: 0, lastT: 0, inertia: 0 });
  const [reduce] = useState(() =>
    typeof window !== 'undefined' && window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches);

  useEffect(() => {
    if (reduce) return undefined; // static row, swipeable via CSS overflow
    const track = trackRef.current;
    if (!track) return undefined;
    const SPEED = 20; // px/sec — calm, premium drift (frame-rate independent)
    const n = categories.length;
    let raf = 0, last = 0, loop = 0;
    const d = dragRef.current;

    // advance = distance from copy-A's first chip to copy-B's first chip.
    // (padding-agnostic; scrollWidth/2 would be wrong because the track's end
    // padding isn't repeated between the two copies → a seam every cycle.)
    const measure = () => {
      const second = track.children[n];
      loop = second ? Math.round(second.offsetLeft - track.children[0].offsetLeft) : 0;
    };
    const tick = (ts) => {
      if (!loop) measure(); // self-correct until layout/fonts settle
      const dt = last ? Math.min(ts - last, 50) : 16;
      last = ts;
      // ease the speed toward its target → soft decel on touch, soft accel on release
      if (!d.active) {
        // flick inertia decays first, then hands back to the calm auto-drift
        if (Math.abs(d.inertia) > 4) {
          posRef.current += d.inertia * dt / 1000;
          d.inertia *= Math.pow(0.95, dt / 16);
        } else { d.inertia = 0; }
        speedRef.current += (targetRef.current - speedRef.current) * 0.06;
        posRef.current += SPEED * speedRef.current * dt / 1000;
      }
      if (loop > 0) {
        posRef.current = ((posRef.current % loop) + loop) % loop; // wrap both ways
        track.style.transform = `translate3d(${(-posRef.current).toFixed(2)}px,0,0)`;
      }
      raf = requestAnimationFrame(tick);
    };
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { loop = 0; });
    raf = requestAnimationFrame(tick);

    // hover (desktop, fine pointer) gently pauses the drift
    const hoverPause = () => { if (!d.active) targetRef.current = 0; };
    const hoverResume = () => { if (!d.active) targetRef.current = 1; };
    track.addEventListener('pointerenter', hoverPause);
    track.addEventListener('pointerleave', hoverResume);

    // grab + drag to scroll (touch and mouse). Drift pauses while held; on
    // release a flick carries momentum, then the calm auto-drift eases back.
    const onDown = (e) => {
      d.active = true; d.moved = false; d.captured = false;
      d.startX = e.clientX; d.startPos = posRef.current;
      d.lastX = e.clientX; d.lastT = e.timeStamp || performance.now();
      d.vel = 0; d.inertia = 0;
      targetRef.current = 0; speedRef.current = 0;
      // Don't grab the pointer on a plain tap. Capturing here makes Blink (desktop
      // Chrome/Edge) retarget the trailing `click` to this <div> instead of the chip
      // <button>, so the chip's onClick never fires on desktop. (WebKit/iOS doesn't
      // retarget — that's why mobile worked.) We capture in onMove once a real drag begins.
    };
    const onMove = (e) => {
      if (!d.active) return;
      const dx = e.clientX - d.startX;
      if (!d.moved && Math.abs(dx) > 8) {          // tap vs swipe threshold
        d.moved = true;                            // it's a drag, not a tap → now grab
        try { track.setPointerCapture(e.pointerId); d.captured = true; } catch (_) {}
      }
      posRef.current = d.startPos - dx;            // strip follows the finger
      const now = e.timeStamp || performance.now();
      const dtv = now - d.lastT;
      if (dtv > 0) {
        const inst = -(e.clientX - d.lastX) / (dtv / 1000); // px/s of pos change
        d.vel = 0.8 * inst + 0.2 * d.vel;          // smoothed velocity for the flick
      }
      d.lastX = e.clientX; d.lastT = now;
    };
    const onUp = (e) => {
      if (!d.active) return;
      d.active = false;
      d.inertia = Math.max(-2600, Math.min(2600, d.vel)); // clamp flick speed
      targetRef.current = 1;                       // ease the calm drift back in
      if (d.captured) { try { track.releasePointerCapture(e.pointerId); } catch (_) {} d.captured = false; }
    };
    track.addEventListener('pointerdown', onDown);
    track.addEventListener('pointermove', onMove);
    track.addEventListener('pointerup', onUp);
    track.addEventListener('pointercancel', onUp);

    return () => {
      cancelAnimationFrame(raf);
      track.removeEventListener('pointerenter', hoverPause);
      track.removeEventListener('pointerleave', hoverResume);
      track.removeEventListener('pointerdown', onDown);
      track.removeEventListener('pointermove', onMove);
      track.removeEventListener('pointerup', onUp);
      track.removeEventListener('pointercancel', onUp);
    };
  }, [categories, reduce]);

  const copies = reduce ? [0] : [0, 1];
  return (
    <div className={`dish-carousel${reduce ? ' is-static' : ''}`} role="group" aria-label="Food categories">
      <div
        className="dish-track"
        ref={trackRef}
        onClickCapture={(e) => {
          // a drag must never fall through as a category tap
          if (dragRef.current.moved) { e.preventDefault(); e.stopPropagation(); dragRef.current.moved = false; }
        }}>

        {copies.map((copy) =>
          categories.map((c) =>
            <button
              key={`${copy}-${c.key}`}
              className="quick-chip dish-chip"
              type="button"
              style={{ '--cat-tint': c.tint }}
              tabIndex={copy === 1 ? -1 : 0}
              aria-hidden={copy === 1 ? 'true' : undefined}
              onClick={() => onPick(c.key)}
              aria-label={`Order ${c.label.toLowerCase()}`}>
              <CategoryIcon cat={c} />
              <span className="quick-chip-label">{c.label}</span>
            </button>
          )
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Solayer Pay screen
// ─────────────────────────────────────────────────────────────
// Hold-to-pay with Face ID — the biometric ring + glyph that used to live on a
// separate "paying" screen, now embedded at the foot of Review order. The ring
// fill is a CSS `--p` transition (smooth, GPU-friendly); completion is a
// setTimeout so it fires reliably even when the tab is backgrounded. Press-and-
// hold (pointer) or hold Enter/Space (keyboard) authorizes the payment.
function FaceIdHold({ theme, amount, store, onComplete }) {
  const [holding, setHolding] = useState(false);
  const [done, setDone] = useState(false);
  const timerRef = useRef(0);
  const doneRef = useRef(false);
  const [reduce] = useState(() =>
    typeof window !== 'undefined' && window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const DUR = reduce ? 320 : 1500;

  const begin = useCallback(() => {
    if (doneRef.current) return;
    setHolding(true);
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      doneRef.current = true;
      setDone(true);
      setTimeout(() => onComplete && onComplete(), 480); // brief "authorized" beat
    }, DUR);
  }, [DUR, onComplete]);

  const cancel = useCallback(() => {
    if (doneRef.current) return;
    setHolding(false);
    clearTimeout(timerRef.current);
  }, []);

  useEffect(() => () => clearTimeout(timerRef.current), []);

  return (
    <div className="pay-confirm">
      <button
        type="button"
        className={`pay-bio${holding ? ' is-holding' : ''}${done ? ' is-done' : ''}`}
        style={{ '--dur': `${DUR}ms` }}
        onPointerDown={(e) => { e.preventDefault(); begin(); }}
        onPointerUp={cancel}
        onPointerLeave={cancel}
        onPointerCancel={cancel}
        onKeyDown={(e) => { if ((e.key === 'Enter' || e.key === ' ') && !e.repeat) { e.preventDefault(); begin(); } }}
        onKeyUp={(e) => { if (e.key === 'Enter' || e.key === ' ') cancel(); }}
        aria-label={`Hold to pay $${amount.toFixed(2)} with Face ID`}>
        <span className="pay-bio-ring" aria-hidden="true">
          <span className="pay-bio-inner">
            {done ? <CheckGlyph size={30} color={theme.ink} /> : <FaceIdGlyph color={theme.ink} />}
          </span>
        </span>
        <span className="pay-bio-label">
          {done ? 'Authorized' : <>Hold to pay <b>${amount.toFixed(2)}</b> with Face ID</>}
        </span>
      </button>
      <div className="pay-bio-meta">
        <Sparkle color={theme.accent} size={12} />
        <span>Solayer Wallet · Solana · gasless</span>
      </div>
    </div>);

}

function FaceIdGlyph({ color = '#fff' }) {
  return (
    <svg width="44" height="44" viewBox="0 0 44 44" fill="none">
      <path d="M8 14V8h6M30 8h6v6M8 30v6h6M30 36h6v-6" stroke={color} strokeWidth="2.2" strokeLinecap="round" />
      <circle cx="16.5" cy="20" r="1.5" fill={color} />
      <circle cx="27.5" cy="20" r="1.5" fill={color} />
      <path d="M22 18v6h-2" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M16 28c1.6 1.6 4 2.4 6 2.4s4.4-0.8 6-2.4" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
    </svg>);

}

function SearchSpinner({ color = '#00ffa3' }) {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" style={{ verticalAlign: '-2px', marginRight: 6 }}>
      <circle cx="7" cy="7" r="5" stroke={color} strokeOpacity="0.25" strokeWidth="1.6" fill="none" />
      <path d="M7 2a5 5 0 015 5" stroke={color} strokeWidth="1.6" strokeLinecap="round" fill="none">
        <animateTransform attributeName="transform" type="rotate" from="0 7 7" to="360 7 7" dur="0.9s" repeatCount="indefinite" />
      </path>
    </svg>);

}

// ─────────────────────────────────────────────────────────────
// Success screen
// ─────────────────────────────────────────────────────────────
function SuccessScreen({ theme, store, cart, total, onDone, onMore }) {
  const summary = cart.length === 1 ?
  cart[0].name.toLowerCase() :
  `${cart.reduce((n, l) => n + l.qty, 0)} items`;
  return (
    <div className="screen-pad success-screen">
      <div className="success-burst">
        <div className="burst-ring" style={{ borderColor: theme.primaryPill }} />
        <div className="burst-disc" style={{ background: theme.primaryPill }}>
          <CheckGlyph size={36} color="#fff" />
        </div>
      </div>

      <div className="success-headline">
        Ordered <span style={{ display: 'inline-block' }}>🎉</span>
      </div>
      <div className="success-sub">
        {store.name} is preparing your {summary}
      </div>

      <article className="receipt">
        <ul className="receipt-cart">
          {cart.map((l, i) =>
          <li key={l.name} className="receipt-cart-row"
          style={{ animationDelay: `${Math.min(i, 8) * 40}ms` }}>
              <span className="receipt-cart-qty">{l.qty}×</span>
              <span className="receipt-cart-name">{l.name}</span>
              <span className="receipt-cart-price">${(l.qty * l.price).toFixed(2)}</span>
            </li>
          )}
        </ul>
        <div className="receipt-row">
          <span className="receipt-lbl">paid</span>
          <span className="receipt-val">${total.toFixed(2)} USDC</span>
        </div>
        <div className="receipt-row">
          <span className="receipt-lbl">eta</span>
          <span className="receipt-val">{store.eta}</span>
        </div>
        <div className="receipt-row dim">
          <span className="receipt-lbl">tx</span>
          <span className="receipt-val mono">5xK…2nQp ↗</span>
        </div>
      </article>

      <div className="success-actions">
        <button className="cta primary" onClick={onMore}>
          <MicGlyph />
          <span>Order something else</span>
        </button>
        <button className="cta ghost-link" onClick={onDone}>back to home</button>
      </div>
    </div>);

}

window.FrogAgent = FrogAgent;
window.THEMES = THEMES;

// ─────────────────────────────────────────────────────────────
// Bottom tabs (persistent nav)
// ─────────────────────────────────────────────────────────────
function BottomTabs({ active, onNav, ordersCount, accent }) {
  const TABS = [
  { key: 'card', label: 'Card' },
  { key: 'ai', label: 'AI Order' },
  { key: 'account', label: 'Account' }];

  return (
    <div className="tab-bar-dock">
      <nav className="bottom-tabs" aria-label="primary">
      {TABS.map((t) => {
        const isActive = t.key === active;
        return (
          <button key={t.key}
          className={`tab ${isActive ? 'is-active' : ''}`}
          onClick={() => onNav(t.key)}
          aria-label={t.label}>
              {t.key === 'ai' &&
            <span className="tab-emerald" aria-hidden="true" />
            }
              {t.key === 'card' &&
            <span className="tab-line-icon" aria-hidden="true"><PhCreditCard size={28} /></span>
            }
              {t.key === 'account' &&
            <span className="tab-line-icon" aria-hidden="true"><PhUserCircle size={28} /></span>
            }
              <span className="tab-label">{t.label}</span>
          </button>);

      })}
      </nav>
    </div>);

}

// Phosphor-style icons for the Card tab (recreated as inline SVG; currentColor).
function PhPlus({ size = 24 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 12h14M12 5v14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>;
}
function PhGift({ size = 24 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3.5" y="9" width="17" height="11.5" rx="1.6" stroke="currentColor" strokeWidth="1.6" />
      <path d="M2.5 9h19M12 9v11.5" stroke="currentColor" strokeWidth="1.6" />
      <path d="M12 9s-1-4.2-3.4-4.2A1.85 1.85 0 0 0 8 8.5c.95.55 4 .5 4 .5Zm0 0s1-4.2 3.4-4.2A1.85 1.85 0 0 1 16 8.5c-.95.55-4 .5-4 .5Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>);

}
function PhEye({ size = 16 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M2 12s3.6-6.5 10-6.5S22 12 22 12s-3.6 6.5-10 6.5S2 12 2 12Z" stroke="currentColor" strokeWidth="1.6" /><circle cx="12" cy="12" r="2.7" stroke="currentColor" strokeWidth="1.6" /></svg>;
}
function PhDownload({ size = 20 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 4v10m0 0l-3.6-3.6M12 14l3.6-3.6M5 19.5h14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}
function PhWallet({ size = 20 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 8.2V6.6A1.6 1.6 0 0 1 5.6 5H17v3.2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /><rect x="3" y="8.2" width="18" height="11.3" rx="2.4" stroke="currentColor" strokeWidth="1.6" /><circle cx="16.6" cy="13.8" r="1.25" fill="currentColor" /></svg>;
}
function PhCaretRight({ size = 16 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M9 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}
function PhClock({ size = 12 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="8.6" stroke="currentColor" strokeWidth="1.8" /><path d="M12 7.4V12l3.1 2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}
function PhXCircle({ size = 12 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="8.6" stroke="currentColor" strokeWidth="1.8" /><path d="M9.2 9.2l5.6 5.6M14.8 9.2l-5.6 5.6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>;
}
function PhCreditCard({ size = 28 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="2.5" y="5" width="19" height="14" rx="2.6" stroke="currentColor" strokeWidth="1.6" /><path d="M2.5 9.5h19" stroke="currentColor" strokeWidth="1.6" /></svg>;
}
function PhUserCircle({ size = 28 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" /><circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="1.6" /><path d="M6 18.4a7 7 0 0 1 12 0" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>;
}

// Card-tab transactions (exact data from the Figma "Card Default View").
const CARD_TX = [
{ id: 'c1', name: 'HungryPanda AU', kind: 'Transaction', method: 'Cash', amount: '$9,765.85', status: 'pending', letter: 'H' },
{ id: 'c2', name: 'Solayer Emerald Card', kind: 'Transaction', method: 'Card', amount: '$5.50', status: 'pending', img: 'fig-mlogo-solayer.png' },
{ id: 'c3', name: 'ALP*McDonalds', kind: 'Transaction', method: 'Food', amount: '$35.75', status: 'failed', dim: true, img: 'fig-mlogo-mcd.png' },
{ id: 'c4', name: 'EcoShop', kind: 'Refund', method: 'Debit', amount: '$50.00', status: null, letter: 'J' },
{ id: 'c5', name: 'FashionCorner', kind: 'Transaction', method: 'Debit', amount: '$89.99', status: null, letter: 'F' },
{ id: 'c6', name: 'BookHaven', kind: 'Transaction', method: 'Cash', amount: '$120.75', status: 'completed', letter: 'B' },
{ id: 'c7', name: 'Meet Fresh', kind: 'Transaction', method: 'Cash', amount: '$1,234.21', status: null, letter: 'M' },
{ id: 'c8', name: 'GadgetHub', kind: 'Purchase', method: 'Credit', amount: '$1,250.00', status: null, letter: 'G' },
{ id: 'c9', name: 'TechStore', kind: 'Purchase', method: 'Credit', amount: '$2,500.00', status: 'pending', letter: 'T' }];


function TxStatus({ status }) {
  if (status === 'failed')
  return <span className="cardx-status is-failed"><PhXCircle />Failed</span>;
  return <span className="cardx-status"><PhClock />{status === 'completed' ? 'Completed' : 'Pending'}</span>;
}

// Card tab — pixel rebuild of the Figma "Card Default View" (renders its own header).
function WalletScreen({ theme, orders }) {
  return (
    <div className="card-screen">
      <div className="card-scroll">
        <div className="cardx-header">
          <span className="cardx-title">Cards</span>
          <div className="cardx-header-actions">
            <button className="cardx-circle-btn" type="button" aria-label="Add card"><PhPlus size={24} /></button>
            <button className="cardx-circle-btn" type="button" aria-label="Rewards"><PhGift size={24} /></button>
          </div>
        </div>

        <div className="cardx-balance">
          <div className="cardx-bal-head">
            <span className="cardx-bal-lbl">Total balance</span>
            <PhEye size={16} />
          </div>
          <div className="cardx-bal-amt">$5,605.60</div>
          <div className="cardx-bal-row">
            <span className="cardx-bal-stat"><span className="dim">Available</span><span>$4035.20</span></span>
            <span className="cardx-bal-div" aria-hidden="true" />
            <span className="cardx-bal-stat"><span className="dim">Pending</span><span>$1570.40</span></span>
          </div>
        </div>

        <div className="cardx-cards">
          <div className="cardx-card">
            <img className="cardx-card-tex img-fade" src="fig-card-texture.webp" alt="" aria-hidden="true" loading="lazy" decoding="async" draggable="false" />
            <img className="cardx-card-logo img-fade" src="fig-solayer-wordmark.svg" alt="solayer" draggable="false" />
            <div className="cardx-card-num">
              <span className="cardx-card-dots" aria-hidden="true"><i /><i /><i /><i /></span>
              <span className="cardx-card-digits">8678</span>
            </div>
          </div>
          <div className="cardx-card cardx-card-peek" aria-hidden="true" />
        </div>

        <div className="cardx-actions">
          <button className="cardx-action" type="button"><PhDownload size={20} /><span>Deposit</span></button>
          <button className="cardx-action" type="button"><PhEye size={20} /><span>Card detail</span></button>
          <button className="cardx-action" type="button"><PhWallet size={20} /><span>Add to wallet</span></button>
        </div>

        <div className="cardx-tx">
          <div className="cardx-tx-head">
            <span className="cardx-tx-title">Transactions</span>
            <PhCaretRight size={16} />
          </div>
          <ul className="cardx-tx-list">
            {CARD_TX.map((t, i) =>
            <li key={t.id} className="cardx-tx-row"
            style={{ animationDelay: `${Math.min(i, 8) * 40}ms` }}>
                <div className="cardx-tx-info">
                  <span className="cardx-avatar">
                    {t.img ?
                  <img className="img-fade" src={t.img} alt="" /> :
                  <span className="cardx-avatar-letter">{t.letter}</span>}
                  </span>
                  <span className="cardx-tx-meta">
                    <span className="cardx-tx-name">{t.name}</span>
                    <span className="cardx-tx-sub">
                      <span>{t.kind}</span><span className="dot">•</span><span>{t.method}</span>
                    </span>
                  </span>
                </div>
                <div className="cardx-tx-amtcol">
                  <span className={`cardx-tx-amt${t.dim ? ' is-dim' : ''}`}>{t.amount}</span>
                  {t.status && <TxStatus status={t.status} />}
                </div>
              </li>
            )}
          </ul>
        </div>
      </div>
    </div>);

}

// ─────────────────────────────────────────────────────────────
// Account screen — faithful rebuild of the Figma "Account" tab
// (solayer-app, node 5475:11838). Dark-only with exact Figma colors,
// same convention as the Card tab. The mascot frog is kept as the
// avatar in place of the Figma merchant logo; the app background is
// left untouched (this layer is transparent over it).
// 24px line glyphs recreated inline (currentColor) to match the Figma.
// ─────────────────────────────────────────────────────────────
function IcoPerson() {
  return <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="8" r="3.4" stroke="currentColor" strokeWidth="1.6" /><path d="M5.5 19.2a6.5 6.5 0 0 1 13 0" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>;
}
function IcoPencil() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M16.4 4.6l3 3M3.6 20.4l1-4.1L15.9 5a1.7 1.7 0 0 1 2.4 0l.7.7a1.7 1.7 0 0 1 0 2.4L7.7 19.4l-4.1 1Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round" /></svg>;
}
function IcoShield() {
  return <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 3l7 2.6v5.1c0 4.4-3 7.7-7 9.3-4-1.6-7-4.9-7-9.3V5.6L12 3Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" /></svg>;
}
function IcoBook() {
  return <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 6.6C10.5 5.3 8.6 4.8 4.6 4.8v12.5c4 0 5.9.5 7.4 1.9 1.5-1.4 3.4-1.9 7.4-1.9V4.8c-4 0-5.9.5-7.4 1.8Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" /><path d="M12 6.6v12.6" stroke="currentColor" strokeWidth="1.6" /></svg>;
}
function IcoBell() {
  return <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M6 9.6a6 6 0 0 1 12 0c0 3.9 1.1 5.4 1.9 6.2.4.4.1 1.1-.5 1.1H4.6c-.6 0-.9-.7-.5-1.1.8-.8 1.9-2.3 1.9-6.2Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" /><path d="M10 20a2 2 0 0 0 4 0" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>;
}
function IcoShieldCheck() {
  return <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 3l7 2.6v5.1c0 4.4-3 7.7-7 9.3-4-1.6-7-4.9-7-9.3V5.6L12 3Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" /><path d="M9 11.7l2.1 2.1 4-4.2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}
function IcoGlobe() {
  return <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="8.4" stroke="currentColor" strokeWidth="1.6" /><path d="M3.7 12h16.6" stroke="currentColor" strokeWidth="1.6" /><path d="M12 3.6c2.2 2.3 3.4 5.3 3.4 8.4S14.2 18.1 12 20.4C9.8 18.1 6.6 15.1 6.6 12S9.8 5.9 12 3.6Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" /></svg>;
}
function IcoPhone() {
  return <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M7 4.6l1.8.3 1.1 2.9-1.5 1.3a9 9 0 0 0 4.2 4.2l1.3-1.5 2.9 1.1.3 1.8c0 .9-.7 1.6-1.6 1.5C11.9 17 7 12.1 6.5 6.2A1.5 1.5 0 0 1 7 4.6Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" /><path d="M14.6 4.6c1.1.2 2.1.7 2.9 1.5M14.2 7.4c.5.1 1 .4 1.4.8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" /></svg>;
}
function IcoLogout() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M14 8.4V6a1.6 1.6 0 0 0-1.6-1.6H6A1.6 1.6 0 0 0 4.4 6v12A1.6 1.6 0 0 0 6 19.6h6.4A1.6 1.6 0 0 0 14 18v-2.4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /><path d="M9.5 12h10m0 0l-3-3m3 3l-3 3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}
function IcoTrash() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4.5 6.6h15M9.5 6.6V5.1a1.3 1.3 0 0 1 1.3-1.3h2.4a1.3 1.3 0 0 1 1.3 1.3v1.5M6.6 6.6l.8 11.9a1.5 1.5 0 0 0 1.5 1.4h6.2a1.5 1.5 0 0 0 1.5-1.4l.8-11.9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /><path d="M10 10.4v6M14 10.4v6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>;
}

function AccountScreen() {
  const [notif, setNotif] = React.useState(true);

  // settings rows that simply navigate (icon + label + caret), split
  // around the special Notification row that carries the toggle.
  const linksTop = [
  { lbl: 'User Privacy', ico: <IcoShield /> },
  { lbl: 'End user agreement', ico: <IcoBook /> }];
  const linksBottom = [
  { lbl: 'Manage your passkey', ico: <IcoShieldCheck /> },
  { lbl: 'Change language', ico: <IcoGlobe /> },
  { lbl: 'Contact us', ico: <IcoPhone /> }];

  return (
    <div className="account-area acct">
      <div className="acct-profile">
        <div className="acct-avatar">
          <img className="img-fade" src="mascot.png" alt="Solayer mascot"
          decoding="async" draggable="false" />
        </div>
        <a className="acct-email" href="mailto:cc321@gmail.com">cc321@gmail.com</a>
      </div>

      <div className="acct-card">
        <div className="acct-row">
          <span className="acct-ico"><IcoPerson /></span>
          <span className="acct-lbl">Panda Hu</span>
          <button className="acct-edit" type="button" aria-label="Edit name"><IcoPencil /></button>
        </div>

        {linksTop.map((r) =>
        <button key={r.lbl} className="acct-row acct-row-link" type="button">
            <span className="acct-ico">{r.ico}</span>
            <span className="acct-lbl">{r.lbl}</span>
            <span className="acct-caret"><PhCaretRight size={20} /></span>
          </button>
        )}

        <div className="acct-row">
          <span className="acct-ico"><IcoBell /></span>
          <span className="acct-lbl">Notification</span>
          <button
          className={`acct-toggle${notif ? ' is-on' : ''}`}
          type="button" role="switch" aria-checked={notif} aria-label="Notifications"
          onClick={() => setNotif((v) => !v)}>
            <span className="acct-toggle-knob" />
          </button>
        </div>

        {linksBottom.map((r) =>
        <button key={r.lbl} className="acct-row acct-row-link" type="button">
            <span className="acct-ico">{r.ico}</span>
            <span className="acct-lbl">{r.lbl}</span>
            <span className="acct-caret"><PhCaretRight size={20} /></span>
          </button>
        )}
      </div>

      <div className="acct-actions">
        <button className="acct-btn acct-btn--logout" type="button">
          <IcoLogout /><span>Log Out</span>
        </button>
        <button className="acct-btn acct-btn--delete" type="button">
          <IcoTrash /><span>Delete Account</span>
        </button>
      </div>
    </div>);

}

// ─────────────────────────────────────────────────────────────
// Browse screen — list of stores under a category
// ─────────────────────────────────────────────────────────────
function BrowseScreen({ category, stores, onPick, accent }) {
  if (!category) return null;
  return (
    <div className="browse-area">
      <div className="browse-count">
        <span><b>{stores.length} places</b> nearby</span>
        <span className="browse-sort">sorted by distance</span>
      </div>

      <div className="browse-list">
        {stores.map((s, i) =>
        <button key={s.name} className="browse-card"
        style={{ animationDelay: `${i * 70}ms` }}
        onClick={() => onPick(i)}>
            <div className="browse-img"
          style={{ backgroundColor: s.swatch }}>
              <img className="browse-img-photo img-fade" src={storeImg(s, category.key)} alt="" aria-hidden="true" loading="lazy" decoding="async" draggable="false" />
              <div className="browse-img-shade" aria-hidden="true" />
              <div className="browse-img-tag">
                <span className="dot" style={{ background: accent }} />
                <span>Solayer Pay</span>
              </div>
              <span className="browse-heart" role="button" tabIndex={-1}
            onClick={(e) => e.stopPropagation()} aria-label="favorite">
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <path d="M9 15.5s-5.5-3.4-5.5-7.2A3.3 3.3 0 0 1 9 6.4a3.3 3.3 0 0 1 5.5 1.9c0 3.8-5.5 7.2-5.5 7.2z"
                stroke="#fff" strokeWidth="1.6" strokeLinejoin="round" fill="rgba(0,0,0,0.25)" />
                </svg>
              </span>
            </div>
            <div className="browse-info">
              <div className="browse-name-row">
                <span className="browse-name">{s.name}</span>
                <span className="browse-price">${s.price.toFixed(2)}</span>
              </div>
              <div className="browse-meta">
                <span className="browse-meta-pill">
                  <Star color="#FFC857" /> {s.rating} <span className="dim">({Math.round(s.rating * 320 + 80)}+)</span>
                </span>
                <span className="browse-meta-sep">·</span>
                <span>{s.eta}</span>
                <span className="browse-meta-sep">·</span>
                <span>{s.dist}</span>
              </div>
              <div className="browse-item">{s.item}</div>
            </div>
          </button>
        )}
      </div>
    </div>);

}

// ─────────────────────────────────────────────────────────────
// Menu screen — items + cart
// ─────────────────────────────────────────────────────────────
function MenuScreen({ theme, store, category, menu, qtyOf, onAdd, onDec, cart, cartTotal, cartCount, onCheckout }) {
  return (
    <div className="menu-area">
      {/* scroller — everything above the pinned cart bar */}
      <div className="menu-scroll">
        {/* hero — real category photo with the store identity overlaid */}
        <div className="menu-hero"
          style={{ backgroundColor: store.swatch }}>
          <img className="menu-hero-img img-fade" src={storeImg(store, category.key)} alt="" aria-hidden="true" loading="lazy" decoding="async" draggable="false" />
          <div className="menu-hero-shade" aria-hidden="true" />
          <div className="menu-hero-info">
            <div className="menu-hero-name">{store.name}</div>
            <div className="menu-hero-meta">
              <span className="meta-pill ghost"><Star color="#FFC857" /> {store.rating}</span>
              <span className="meta-pill ghost">{store.eta}</span>
              <span className="meta-pill ghost"><Pin color="#fff" /> {store.dist}</span>
            </div>
          </div>
          <div className="menu-hero-tag">
            <span className="dot" style={{ background: theme.accent }} />
            <span>Solayer Pay</span>
          </div>
        </div>

        <div className="menu-section-head">
          <h3 className="section-title">Menu</h3>
          <span className="section-tag">{menu.length} items</span>
        </div>

        <ul className="menu-list">
          {menu.map((it, i) => {
            const q = qtyOf(it.name);
            return (
              <li key={it.name} className={`menu-row ${q > 0 ? 'has-qty' : ''}`}
              style={{ animationDelay: `${i * 40}ms` }}>
                <div className="menu-row-thumb" style={{ background: store.swatch }}>
                  <span className="menu-row-emoji">{it.emoji}</span>
                </div>
                <div className="menu-row-text">
                  <div className="menu-row-name">{it.name}</div>
                  <div className="menu-row-desc">{it.desc}</div>
                  <div className="menu-row-price">${it.price.toFixed(2)}</div>
                </div>
                {q === 0 ?
                <button className="menu-add" aria-label={`add ${it.name}`}
                onClick={() => onAdd(it)}>
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M9 4v10M4 9h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
                  </button> :

                <div className="menu-stepper">
                    <button className="step-btn" aria-label="decrease"
                  onClick={() => onDec(it.name)}>−</button>
                    <span className="step-qty">{q}</span>
                    <button className="step-btn" aria-label="increase"
                  onClick={() => onAdd(it)}>+</button>
                  </div>
                }
              </li>);

          })}
        </ul>
      </div>

      {/* pinned cart bar — in normal flow at the bottom so it can never scroll
          out of view (the old position:absolute drifted with the scroller) */}
      {cartCount > 0 &&
      <button className="cart-bar" onClick={onCheckout}>
          <span className="cart-bar-badge">{cartCount}</span>
          <span className="cart-bar-mid">
            <span className="cart-bar-title">Review order</span>
            <span className="cart-bar-sub">{cart.length} {cart.length === 1 ? 'item' : 'items'} · ETA {store.eta}</span>
          </span>
          <span className="cart-bar-total">${cartTotal.toFixed(2)}</span>
        </button>
      }
    </div>);

}

// ─────────────────────────────────────────────────────────────
// Orders screen — past + upcoming tabs
// ─────────────────────────────────────────────────────────────
function OrdersScreen({ theme, upcoming, past, onReorder, onClose }) {
  const [tab, setTab] = React.useState(upcoming.length ? 'upcoming' : 'past');
  const pastTotal = past.reduce((n, o) => n + (o.total || 0), 0);
  return (
    <div className="orders-area">
      <div className="orders-tabs">
        <button className={`orders-tab ${tab === 'upcoming' ? 'is-active' : ''}`}
        onClick={() => setTab('upcoming')}>
          Upcoming
          {upcoming.length > 0 && <span className="orders-tab-count">{upcoming.length}</span>}
        </button>
        <button className={`orders-tab ${tab === 'past' ? 'is-active' : ''}`}
        onClick={() => setTab('past')}>
          Past
          <span className="orders-tab-count dim">{past.length}</span>
        </button>
        <span className="orders-tab-rail" aria-hidden="true"
        style={{ transform: tab === 'upcoming' ? 'translateX(0)' : 'translateX(100%)' }} />
      </div>

      {tab === 'upcoming' ?
      upcoming.length === 0 ?
      <OrdersEmpty kind="upcoming" /> :
      <ul className="orders-list orders-live-list">
          {upcoming.map((o, i) =>
        <LiveOrderCard key={o.id} o={o} index={i} />)}
        </ul> :

      past.length === 0 ?
      <OrdersEmpty kind="past" /> :
      <div className="orders-history">
          <div className="orders-summary">
            <span className="orders-summary-label">{past.length} {past.length === 1 ? 'order' : 'orders'} · last 30 days</span>
            <span className="orders-summary-total">${pastTotal.toFixed(2)} <span className="dim">USDC</span></span>
          </div>
          <ul className="orders-list">
            {past.map((o, i) =>
          <PastOrderCard key={o.id} o={o} index={i} onReorder={onReorder} />)}
          </ul>
        </div>}
    </div>);

}

// Delivery progress steps for a live order. A freshly placed order ('preparing')
// sits on step 1; the filled connector + pulsing node walk forward as it advances.
const TRACK_STEPS = ['Ordered', 'Preparing', 'On the way', 'Delivered'];

function LiveOrderCard({ o, index }) {
  const active =
  o.status === 'done' ? 3 :
  o.status === 'enroute' ? 2 :
  o.status === 'preparing' ? 1 : 0;
  const eta = (o.statusLabel || '').replace(/^ETA\s*/i, '').trim();
  return (
    <li className="order-card order-live" style={{ animationDelay: `${index * 70}ms` }}>
      <span className="order-live-glow" aria-hidden="true" />
      <div className="order-live-head">
        <div className="order-thumb order-thumb-lg"
        style={{ backgroundColor: o.swatch }}>
          {(o.img || o.cat) &&
          <img className="order-thumb-img img-fade" src={storeImg({ img: o.img }, o.cat)} alt="" aria-hidden="true" loading="lazy" decoding="async" draggable="false" />}
          {!o.cat && !o.img && <span className="order-emoji">{o.emoji}</span>}
        </div>
        <div className="order-live-info">
          <span className="order-name">{o.store}</span>
          <span className="order-items">{o.summary}</span>
          <span className="order-price">${o.total.toFixed(2)} <span className="dim">USDC</span></span>
        </div>
        {eta &&
        <div className="order-eta">
            <span className="order-eta-dot" aria-hidden="true" />
            <span className="order-eta-text">
              <span className="order-eta-cap">arriving in</span>
              <span className="order-eta-val">{eta}</span>
            </span>
          </div>}
      </div>
      <div className="order-track" role="list" aria-label="Delivery progress">
        {TRACK_STEPS.map((s, i) =>
        <div key={s} role="listitem"
        className={`track-step${i < active ? ' is-done' : ''}${i === active ? ' is-current' : ''}`}>
            <span className="track-node" aria-hidden="true">
              {i < active &&
            <svg width="9" height="9" viewBox="0 0 12 12" fill="none"><path d="M2.5 6.4l2.4 2.4L9.6 3.4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>}
            </span>
            <span className="track-label">{s}</span>
          </div>)}
      </div>
    </li>);

}

function PastOrderCard({ o, index, onReorder }) {
  return (
    <li className="order-card order-past" style={{ animationDelay: `${index * 50}ms` }}>
      <div className="order-thumb"
      style={{ backgroundColor: o.swatch }}>
        {(o.img || o.cat) &&
        <img className="order-thumb-img img-fade" src={storeImg({ img: o.img }, o.cat)} alt="" aria-hidden="true" loading="lazy" decoding="async" draggable="false" />}
        {!o.cat && !o.img && <span className="order-emoji">{o.emoji}</span>}
      </div>
      <div className="order-body">
        <div className="order-top-row">
          <span className="order-name">{o.store}</span>
          <span className="order-meta">{o.when}</span>
        </div>
        <div className="order-items">{o.summary}</div>
        <div className="order-bottom-row">
          <span className="order-status-done">
            <svg width="13" height="13" viewBox="0 0 14 14" fill="none" aria-hidden="true"><path d="M2.8 7.2l2.6 2.6L11.2 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
            {o.statusLabel}
          </span>
          <span className="order-price">${o.total.toFixed(2)} <span className="dim">USDC</span></span>
        </div>
      </div>
      {o.cat && onReorder &&
      <button className="order-reorder" type="button"
      onClick={() => onReorder(o)}
      aria-label={`Order again from ${o.store}`}>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M13.2 8a5.2 5.2 0 1 1-1.5-3.66M13.4 2.2v3h-3" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </button>}
    </li>);

}

function OrdersEmpty({ kind }) {
  const up = kind === 'upcoming';
  return (
    <div className="orders-empty">
      <span className="orders-empty-orb" aria-hidden="true">
        <span className="orders-empty-emoji">{up ? '🍽️' : '🧾'}</span>
      </span>
      <div className="orders-empty-title">{up ? 'nothing cooking yet' : 'no orders yet'}</div>
      <div className="orders-empty-sub">
        {up ? 'your live orders will track here' : "let's get you fed"}
      </div>
    </div>);

}