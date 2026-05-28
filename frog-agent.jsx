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
    primaryPillInk: '#ffffff'
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
    primaryPillInk: '#ffffff'
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
    primaryPillInk: '#ffffff'
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
{ key: 'groceries', label: 'Groceries', emoji: '🛒', tint: '#15803d' }];


const STORES = {
  pizza: [
  { name: "Joe's Slice Shop", item: 'Large pepperoni pizza', price: 18.50, eta: '18 min', dist: '0.4 mi', rating: 4.7, swatch: '#c2410c' },
  { name: "Tony's Brick Oven", item: 'Margherita, fresh basil', price: 24.00, eta: '32 min', dist: '0.8 mi', rating: 4.9, swatch: '#7c2d12' },
  { name: 'Crust & Co.', item: 'Cheese slice combo', price: 14.50, eta: '14 min', dist: '0.3 mi', rating: 4.5, swatch: '#dc6803' }],

  sushi: [
  { name: 'Tokyo Sushi', item: 'Salmon avocado roll set', price: 24.00, eta: '32 min', dist: '0.7 mi', rating: 4.8, swatch: '#0e7490' },
  { name: 'Edomae House', item: 'Omakase 8 piece', price: 38.00, eta: '40 min', dist: '1.1 mi', rating: 4.9, swatch: '#155e75' },
  { name: 'Wabi Roll', item: 'Spicy tuna + miso', price: 19.50, eta: '24 min', dist: '0.5 mi', rating: 4.6, swatch: '#0891b2' }],

  coffee: [
  { name: 'Bean Lab', item: 'Iced oat latte, 16 oz', price: 6.50, eta: '9 min', dist: '0.2 mi', rating: 4.7, swatch: '#78350f' },
  { name: 'Verve', item: 'Cortado + biscotti', price: 8.20, eta: '12 min', dist: '0.4 mi', rating: 4.8, swatch: '#92400e' },
  { name: 'Daydream Coffee', item: 'Maple cold brew', price: 7.00, eta: '10 min', dist: '0.3 mi', rating: 4.6, swatch: '#b45309' }],

  ride: [
  { name: 'Solana Wheels', item: 'Ride to Mission St', price: 12.40, eta: '4 min', dist: '0.1 mi', rating: 4.9, swatch: '#1e40af' },
  { name: 'MetroLift', item: 'Shared ride · 2 stops', price: 8.80, eta: '7 min', dist: '0.2 mi', rating: 4.6, swatch: '#1d4ed8' },
  { name: 'RideNow', item: 'Premium SUV', price: 22.00, eta: '5 min', dist: '0.1 mi', rating: 4.8, swatch: '#1e3a8a' }],

  groceries: [
  { name: 'FreshCart', item: 'Eggs, milk, sourdough', price: 14.20, eta: '25 min', dist: '0.5 mi', rating: 4.5, swatch: '#15803d' },
  { name: 'GreenBasket', item: 'Organic produce box', price: 28.00, eta: '40 min', dist: '0.9 mi', rating: 4.7, swatch: '#166534' },
  { name: 'CornerMart', item: 'Essentials bundle', price: 12.50, eta: '20 min', dist: '0.3 mi', rating: 4.3, swatch: '#14532d' }],

  burger: [
  { name: 'Smash House', item: 'Double smash + fries', price: 16.50, eta: '20 min', dist: '0.5 mi', rating: 4.8, swatch: '#9a3412' },
  { name: 'Burger Bros.', item: 'Bacon cheeseburger combo', price: 14.20, eta: '16 min', dist: '0.3 mi', rating: 4.6, swatch: '#7c2d12' },
  { name: 'Char & Co.', item: 'Wagyu burger, truffle aioli', price: 22.00, eta: '28 min', dist: '0.8 mi', rating: 4.9, swatch: '#92400e' }],

  chinese: [
  { name: 'Dragon Noodle', item: 'Beef chow fun + spring rolls', price: 17.50, eta: '22 min', dist: '0.6 mi', rating: 4.7, swatch: '#a16207' },
  { name: 'Sichuan Garden', item: 'Mapo tofu + jasmine rice', price: 15.00, eta: '26 min', dist: '0.7 mi', rating: 4.8, swatch: '#854d0e' },
  { name: 'Lucky Wok', item: 'Orange chicken combo', price: 13.50, eta: '18 min', dist: '0.4 mi', rating: 4.5, swatch: '#713f12' }],

  dessert: [
  { name: 'Sugar Lab', item: 'Brown butter cookies × 6', price: 12.00, eta: '20 min', dist: '0.4 mi', rating: 4.9, swatch: '#be185d' },
  { name: 'Frost & Co.', item: 'Black sesame soft serve', price: 8.50, eta: '15 min', dist: '0.3 mi', rating: 4.8, swatch: '#9d174d' },
  { name: 'Madeleine', item: 'Tiramisu slice + espresso', price: 11.00, eta: '24 min', dist: '0.6 mi', rating: 4.7, swatch: '#831843' }]

};

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
  { name: 'Dark chocolate bar', desc: '70% — single origin', price: 4.50, emoji: '🍫' }]

};

// Intent detection — regex match on transcript
const INTENT_PATTERNS = [
{ match: /pizza|slice|pepperoni|margherita|calzone/i, cat: 'pizza' },
{ match: /sushi|nigiri|sashimi|maki|roll|omakase|edamame/i, cat: 'sushi' },
{ match: /coffee|latte|espresso|cappuccino|mocha|cold ?brew|macchiato/i, cat: 'coffee' },
{ match: /ride|uber|lyft|taxi|car|trip|driver/i, cat: 'ride' },
{ match: /grocer|grocery|milk|eggs|bread|produce|veggies/i, cat: 'groceries' },
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
{ id: 'p1', store: 'Tokyo Sushi', emoji: '🍣', swatch: '#0e7490', summary: 'Salmon avocado roll, miso soup', when: '2 days ago', status: 'done', statusLabel: 'delivered', total: 24.00 },
{ id: 'p2', store: 'Bean Lab', emoji: '☕', swatch: '#78350f', summary: 'Iced oat latte', when: '3 days ago', status: 'done', statusLabel: 'delivered', total: 6.50 },
{ id: 'p3', store: 'Solana Wheels', emoji: '🚗', swatch: '#1e40af', summary: 'Ride to Mission St', when: '5 days ago', status: 'done', statusLabel: 'completed', total: 12.40 },
{ id: 'p4', store: 'Smash House', emoji: '🐔', swatch: '#9a3412', summary: '2 items · burger + fries', when: 'last week', status: 'done', statusLabel: 'delivered', total: 21.50 }];


// ─────────────────────────────────────────────────────────────
// useMic — getUserMedia + AnalyserNode RMS → CSS var
// ─────────────────────────────────────────────────────────────
function useMic(active, levelRef, hostRef) {
  useEffect(() => {
    if (!active) {
      if (hostRef.current) hostRef.current.style.setProperty('--vol', '0');
      levelRef.current = 0;
      return;
    }
    let audioCtx,analyser,raf,stream,alive = true;
    let smoothed = 0;
    const start = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        if (!alive) {stream.getTracks().forEach((t) => t.stop());return;}
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const source = audioCtx.createMediaStreamSource(stream);
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
          smoothed = smoothed * 0.7 + avg * 0.3;
          const v = Math.max(0, Math.min(1.4, smoothed));
          levelRef.current = v;
          if (hostRef.current) hostRef.current.style.setProperty('--vol', v.toFixed(3));
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
      if (stream) stream.getTracks().forEach((t) => t.stop());
      if (audioCtx) audioCtx.close().catch(() => {});
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
// Back-compat alias for any old callers
const MorphBlob = VoiceOrb;

function Ripples({ theme, show }) {
  if (!show) return null;
  return (
    <div className="ripples">
      {[0, 1, 2].map((i) =>
      <span key={i} className="ripple"
      style={{ animationDelay: `${i * 0.7}s`, borderColor: theme.accent }} />
      )}
    </div>);

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
function FrogAvatarSmall({ id = 'frog-avatar-sm', size = 36 }) {
  return (
    <img
      id={id}
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

// ─────────────────────────────────────────────────────────────
// Main agent
// ─────────────────────────────────────────────────────────────
function FrogAgent({ theme, intensity = 1, showParticles = true }) {
  // phase: idle | listening | thinking | searching | confirming | paying | success
  // open on the voice screen (the "talk, we order" selling point);
  // chat is the optional fallback (keyboard button in the voice controls)
  const [phase, setPhase] = useState('listening');
  const [transcript, setTranscript] = useState('');
  const [intent, setIntent] = useState(null); // 'pizza' etc
  const [storeIdx, setStoreIdx] = useState(0);
  // cart: array of { name, desc, price, emoji, qty }
  const [cart, setCart] = useState([]);
  // chat thread messages
  const [messages, setMessages] = useState([]);
  // composer text (chat screen typing)
  const [typed, setTyped] = useState('');
  // recording duration
  const [elapsed, setElapsed] = useState(0);
  // orders history
  const [orders, setOrders] = useState(() => ({
    upcoming: [],
    past: SEED_PAST_ORDERS
  }));
  const hostRef = useRef(null);
  const levelRef = useRef(0);

  const listening = phase === 'listening';
  useMic(listening, levelRef, hostRef);
  useTranscript(listening, setTranscript);

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
  const goSpeak = useCallback(() => {
    setTranscript('');setIntent(null);setStoreIdx(0);setPhase('listening');
  }, []);
  const startListen = useCallback(() => {
    setTranscript('');setIntent(null);setStoreIdx(0);setCart([]);setPhase('listening');
  }, []);
  const stopAndProcess = useCallback(() => {
    const text = transcript.trim();
    // empty → just slide over to chat without adding a message
    if (!text) {setPhase('idle');setTranscript('');return;}
    setPhase('thinking');
    setTimeout(() => {
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
    }, 1500);
  }, [transcript]);
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
  const showOtherStore = useCallback(() => {
    if (!intent) return;
    setStoreIdx((i) => (i + 1) % STORES[intent].length);
  }, [intent]);
  const confirmPay = useCallback(() => {
    setPhase('paying');
    setTimeout(() => {
      // record the order, then advance to success
      setOrders((prev) => {
        const cat = CATEGORIES.find((c) => c.key === intent);
        const newOrder = {
          id: `o-${Date.now()}`,
          store: store?.name || 'Store',
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
    }, 1900);
  }, [intent, store, cart, cartTotal]);

  // ── header copy by phase ──
  const headerByPhase = {
    idle: { name: 'Solayer AI', sub: messages.length ? `${Math.ceil(messages.length / 2)} · ready for next order` : 'You talk, we order' },
    listening: { name: 'Solayer AI', sub: 'tap when finished' },
    thinking: { name: 'Solayer AI', sub: 'hmm, let me think' },
    searching: { name: 'Solayer AI', sub: `searching nearby ${intent || ''}…` },
    browse: { name: CATEGORIES.find((c) => c.key === intent)?.label || 'Browse', sub: `${(STORES[intent] || []).length} places nearby` },
    menu: { name: store?.name || 'Menu', sub: store ? `${store.rating}★ · ${store.eta} · ${store.dist}` : '' },
    confirming: { name: 'Review order', sub: store?.name || '' },
    paying: { name: 'Solayer Pay', sub: `paying $${cartTotal.toFixed(2)}` },
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
      '--intensity': intensity
    }}>

      {/* header — adapts to phase */}
      <header className="agent-header">
        {phase === 'confirming' || phase === 'paying' || phase === 'success' || phase === 'browse' || phase === 'menu' ?
        <button className="icon-btn back-btn" onClick={() => {
          if (phase === 'menu') {setPhase('browse');setCart([]);} else
          if (phase === 'confirming') {setPhase(menu.length ? 'menu' : 'idle');} else
          goIdle();
        }} aria-label="back">
            <ChevLeft color={theme.ink} />
          </button> :
        phase === 'orders' || phase === 'wallet' || phase === 'account' ?
        <div className="icon-btn" aria-hidden="true" style={{ width: 40, height: 40 }} /> :

        <div className="header-id">
            <div className="avatar-wrap">
              <FrogAvatarSmall id="frog-header" size={52} />
            </div>
            <div className="header-text">
              <div className="header-title">{h.name}</div>
              <div className="header-sub">{h.sub}</div>
            </div>
          </div>
        }
        {(phase === 'confirming' || phase === 'paying' || phase === 'success' || phase === 'browse' || phase === 'menu' || phase === 'orders') &&
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

      {/* ── IDLE: chat thread + categories + greeting ── */}
      {phase === 'idle' &&
      <div className="chat-area">
          {messages.length === 0 &&
        <div className="cat-section">
              <div className="section-row">
                <h3 className="section-title">Popular categories</h3>
                <span className="section-tag">most ordered</span>
              </div>
              <div className="cat-row" role="list">
                {CATEGORIES.map((c, i) =>
            <button key={c.key} className="cat-item"
            style={{ animationDelay: `${i * 50}ms` }}
            onClick={() => pickCategory(c.key)}>
                    <span className="cat-circle" style={{ '--cat-tint': c.tint }}>
                      <span className="cat-emoji">{c.emoji}</span>
                    </span>
                    <span className="cat-label">{c.label}</span>
                  </button>
            )}
              </div>
            </div>
        }

          <div className="chat-thread">
            {messages.length === 0 ?
          <div className="msg msg-frog">
                <FrogAvatarSmall id="frog-msg-1" size={36} />
                <div className="bubble bubble-frog">
                  <span>Hey!</span> <span className="wave-emoji">👋</span>{' '}
                  <span>Pick a category or tap the mic and tell me what you're craving.</span>
                </div>
              </div> :

          messages.map((m) =>
          m.from === 'user' ?
          <div key={m.id} className="msg msg-user">
                    <div className="bubble bubble-user">{m.text}</div>
                  </div> :

          <div key={m.id} className="msg msg-frog">
                    <FrogAvatarSmall id={`frog-${m.id}`} size={36} />
                    <div className="frog-msg-stack">
                      <div className="bubble bubble-frog">{m.text}</div>
                      {m.card?.kind === 'order' &&
              <button className="inline-order-card" onClick={() => acceptOrderCard(m.card)}>
                          <span className="ioc-emoji" style={{ background: m.card.store.swatch }}>{CATEGORIES.find((c) => c.key === m.card.cat)?.emoji}</span>
                          <span className="ioc-body">
                            <span className="ioc-store">{m.card.store.name}</span>
                            <span className="ioc-meta">{m.card.store.rating}★ · {m.card.store.eta} · {m.card.store.dist}</span>
                          </span>
                          <span className="ioc-cta">
                            <span className="ioc-price">${m.card.item.price.toFixed(2)}</span>
                            <span className="ioc-action">order →</span>
                          </span>
                        </button>
              }
                    </div>
                  </div>

          )
          }
          </div>

          {messages.length > 0 &&
        <div className="cat-section quiet">
              <div className="section-row">
                <h3 className="section-title">Order something else</h3>
              </div>
              <div className="cat-row" role="list">
                {CATEGORIES.map((c, i) =>
            <button key={c.key} className="cat-item"
            style={{ animationDelay: `${i * 30}ms` }}
            onClick={() => pickCategory(c.key)}>
                    <span className="cat-circle" style={{ '--cat-tint': c.tint }}>
                      <span className="cat-emoji">{c.emoji}</span>
                    </span>
                    <span className="cat-label">{c.label}</span>
                  </button>
            )}
              </div>
            </div>
        }
        </div>
      }

      {/* ── LISTENING / THINKING / SEARCHING: voice orb + transcript ── */}
      {showStage &&
      <div className="stage">
          {showParticles && phase !== 'listening' && <Particles theme={theme} listening={blobLive} />}

          <div className="blob-stack" onClick={blobLive ? stopAndProcess : undefined}>
            <div className="blob-scaler">
              <VoiceOrb theme={theme} listening={blobLive} />
            </div>
          </div>

          {phase === 'listening' &&
        <div className="voice-stage-text">
              <div className="voice-transcript">
                {transcript ?
              <span>{transcript}<span className="vt-caret" aria-hidden="true">|</span></span> :
              <span className="vt-hint">say what you'd like to order…</span>
              }
              </div>
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
        onPick={() => {}}
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

      {/* ── CONFIRMING: review cart ── */}
      {phase === 'confirming' && store &&
      <div className="screen-pad confirm-pad">
          <div className="msg msg-frog tight">
            <FrogAvatarSmall id="frog-confirm" size={36} />
            <div className="bubble bubble-frog">
              <span>Ordering from <b>{store.name}</b> — <b>${cartTotal.toFixed(2)}</b>.
                Ready in {store.eta}. Confirm with Solayer Pay?</span>
            </div>
          </div>

          <article className="store-card">
            <header className="store-card-head">
              <div className="store-thumb" style={{ background: store.swatch }}>
                <span className="store-emoji">{CATEGORIES.find((c) => c.key === intent)?.emoji}</span>
              </div>
              <div className="store-id">
                <div className="store-name">{store.name}</div>
                <div className="store-meta">
                  <span className="meta-pill"><Star color="#FFC857" /> {store.rating}</span>
                  <span className="meta-pill"><Pin /> {store.dist}</span>
                  <span className="meta-pill">{store.eta}</span>
                </div>
              </div>
            </header>

            <ul className="cart-lines">
              {cart.map((l) =>
            <li key={l.name} className="cart-line">
                  <span className="cart-line-qty">{l.qty}×</span>
                  <span className="cart-line-emoji">{l.emoji}</span>
                  <span className="cart-line-name">{l.name}</span>
                  <span className="cart-line-price">${(l.qty * l.price).toFixed(2)}</span>
                </li>
            )}
            </ul>

            <div className="cart-totals">
              <div className="cart-total-row"><span>subtotal</span><span>${cartTotal.toFixed(2)}</span></div>
              <div className="cart-total-row"><span>network fee</span><span className="good">$0.00</span></div>
              <div className="cart-total-row grand"><span>total</span><span>${cartTotal.toFixed(2)} USDC</span></div>
            </div>

            <div className="store-actions">
              <button className="cta primary" onClick={confirmPay}>
                <ShieldGlyph />
                <span>Pay with Solayer</span>
              </button>
            </div>
          </article>
        </div>
      }

      {/* ── PAYING: Solayer Pay biometric ── */}
      {phase === 'paying' && store &&
      <PayingScreen theme={theme} store={store} total={cartTotal} />
      }

      {/* ── SUCCESS: receipt ── */}
      {phase === 'success' && store &&
      <SuccessScreen theme={theme} store={store} cart={cart} total={cartTotal} onDone={goIdle} onMore={startListen} />
      }

      {/* footer CTAs only on AI flow phases */}
      {(phase === 'idle' || phase === 'listening' || phase === 'thinking' || phase === 'searching') &&
      <footer className="agent-footer">
        {phase === 'idle' &&
        <div className="composer">
            <input
            className="composer-input"
            type="text"
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
            onKeyDown={(e) => {if (e.key === 'Enter') submitTyped();}}
            placeholder="Type or tap mic to order…"
            aria-label="Order request" />
          
            {typed.trim() ?
          <button className="composer-send" onClick={submitTyped} aria-label="send">
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <path d="M9 14V4M9 4l-5 5M9 4l5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button> :

          <button className="composer-mic" onClick={startListen} aria-label="tap to speak">
                <MicGlyph />
              </button>
          }
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
            <button className="vc-stop" onClick={stopAndProcess}
              aria-label={transcript ? 'send' : 'stop recording'}>
              <span className="vc-stop-core">
                {transcript ?
              <svg width="28" height="28" viewBox="0 0 22 22" fill="none">
                    <path d="M11 17V5M11 5l-5 5M11 5l5 5" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg> :
              <svg width="30" height="30" viewBox="0 0 22 22" fill="none">
                    <rect x="5.5" y="5.5" width="11" height="11" rx="3" fill="currentColor" />
                  </svg>
              }
              </span>
            </button>
            <button className="vc-side" onClick={() => {setTranscript('');setPhase('idle');}}
              aria-label="type instead" title="type instead">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <rect x="2.5" y="4.5" width="13" height="9" rx="2" stroke="currentColor" strokeWidth="1.4"/>
                <path d="M5 8.5h.6M7.2 8.5h.6M9.4 8.5h.6M11.6 8.5h.6M5 11h8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
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
// Solayer Pay screen
// ─────────────────────────────────────────────────────────────
function PayingScreen({ theme, store, total }) {
  const [held, setHeld] = useState(0);
  useEffect(() => {
    let raf,t0 = performance.now();
    const tick = (t) => {
      const p = Math.min(1, (t - t0) / 1800);
      setHeld(p);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);
  return (
    <div className="screen-pad pay-screen">
      <div className="pay-amount">
        <div className="pay-currency">USDC</div>
        <div className="pay-total">${total.toFixed(2)}</div>
        <div className="pay-sub">to {store.name}</div>
      </div>

      <div className="pay-source">
        <div className="pay-source-row">
          <div className="pay-source-id">
            <div className="pay-logo">
              <Sparkle color={theme.accent} size={14} />
            </div>
            <div>
              <div className="pay-source-name">Solayer Wallet</div>
              <div className="pay-source-bal">balance · 2,481.39 USDC</div>
            </div>
          </div>
          <div className="pay-net">Solana · gasless</div>
        </div>
        <div className="pay-source-row">
          <div className="pay-source-lbl">network fee</div>
          <div className="pay-source-val">$0.00</div>
        </div>
        <div className="pay-source-row total">
          <div className="pay-source-lbl">you pay</div>
          <div className="pay-source-val pay-source-final">${total.toFixed(2)} USDC</div>
        </div>
      </div>

      <div className="pay-biometric">
        <div className="pay-bio-ring" style={{
          background: `conic-gradient(${theme.primaryPill} ${held * 360}deg, rgba(255,255,255,0.06) 0deg)`
        }}>
          <div className="pay-bio-inner">
            <FaceIdGlyph color={theme.ink} />
          </div>
        </div>
        <div className="pay-bio-label">
          {held < 1 ? 'Hold to confirm with Face ID' : 'authorized'}
        </div>
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

function ShieldGlyph() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M7 1l5 2v4c0 3-2 5-5 6-3-1-5-3-5-6V3l5-2z" stroke="currentColor" strokeWidth="1.5" fill="none" />
      <path d="M4.5 7l1.7 1.7L9.5 5.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
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

// small in-line frog avatar for confirm chat bubble (deprecated, kept for back-compat)
function SvgFrogChip({ phase = 'idle' }) {
  return (
    <div style={{ width: 36, height: 36, flexShrink: 0, marginRight: -2 }}>
      {typeof SvgFrog === 'function' ? <SvgFrog phase={phase} /> : null}
    </div>);

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
          {cart.map((l) =>
          <li key={l.name} className="receipt-cart-row">
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
  { key: 'ai', label: 'AI Order' },
  { key: 'card', label: 'Card' },
  { key: 'account', label: 'Account' }];

  return (
    <nav className="bottom-tabs" aria-label="primary">
      {TABS.map((t) => {
        const isActive = t.key === active;
        return (
          <button key={t.key}
          className={`tab ${isActive ? 'is-active' : ''}`}
          onClick={() => onNav(t.key)}
          aria-label={t.label}>
              {t.key === 'ai' &&
            <span className="tab-frog">
                  <img src="mascot.png" alt="" className="tab-frog-img" />
                </span>
            }
              {t.key === 'card' &&
            <span className="tab-line-icon" aria-hidden="true">
                  <svg width="28" height="22" viewBox="0 0 28 22" fill="none">
                    <rect x="2" y="3" width="24" height="16" rx="3" stroke="currentColor" strokeWidth="1.6" />
                    <path d="M2 8h24" stroke="currentColor" strokeWidth="1.6" />
                  </svg>
                </span>
            }
              {t.key === 'account' &&
            <span className="tab-line-icon" aria-hidden="true">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" strokeWidth="1.6" />
                    <circle cx="12" cy="10" r="2.6" stroke="currentColor" strokeWidth="1.6" />
                    <path d="M7 18.5c1.2-2.2 3-3.2 5-3.2s3.8 1 5 3.2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                  </svg>
                </span>
            }
              <span className="tab-label">{t.label}</span>
          </button>);

      })}
    </nav>);

}

function TabIconAI({ active }) {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <path d="M11 2.5L12.6 7.3L17.5 8.5L13.6 11.7L14.6 16.5L11 14L7.4 16.5L8.4 11.7L4.5 8.5L9.4 7.3L11 2.5Z"
      fill={active ? 'currentColor' : 'none'}
      stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M18 3L18.5 4.5L20 5L18.5 5.5L18 7L17.5 5.5L16 5L17.5 4.5L18 3Z" fill="currentColor" />
    </svg>);

}
function TabIconOrders({ active }) {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <rect x="5" y="4.5" width="12" height="14.5" rx="2.5"
      stroke="currentColor" strokeWidth="1.6"
      fill={active ? 'currentColor' : 'none'} fillOpacity={active ? 0.18 : 0} />
      <rect x="8" y="3" width="6" height="3.2" rx="1" fill="currentColor" />
      <path d="M8.5 10h5M8.5 13h5M8.5 16h3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>);

}
function TabIconWallet({ active }) {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <rect x="3" y="6" width="16" height="12" rx="2.5"
      stroke="currentColor" strokeWidth="1.6"
      fill={active ? 'currentColor' : 'none'} fillOpacity={active ? 0.18 : 0} />
      <path d="M3 10h16" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="15.5" cy="14.5" r="1.2" fill="currentColor" />
    </svg>);

}
function TabIconAccount({ active }) {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <circle cx="11" cy="8" r="3.5"
      stroke="currentColor" strokeWidth="1.6"
      fill={active ? 'currentColor' : 'none'} fillOpacity={active ? 0.18 : 0} />
      <path d="M4 18.5c1.3-2.8 4-4.5 7-4.5s5.7 1.7 7 4.5"
      stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" fill="none" />
    </svg>);

}

// ─────────────────────────────────────────────────────────────
// Wallet screen
// ─────────────────────────────────────────────────────────────
const MOCK_TX = [
{ id: 't1', to: "Joe's Slice Shop", emoji: '🍕', when: '2 min ago', amt: -18.50, note: 'Large pepperoni pizza' },
{ id: 't2', to: 'Bean Lab', emoji: '☕', when: '3 days ago', amt: -6.50, note: 'Iced oat latte' },
{ id: 't3', from: 'USDC top-up', emoji: '⬇️', when: '4 days ago', amt: 500.00, note: 'from Phantom wallet' },
{ id: 't4', to: 'Tokyo Sushi', emoji: '🍣', when: '5 days ago', amt: -24.00, note: 'Salmon avocado roll set' },
{ id: 't5', to: 'Solana Wheels', emoji: '🚗', when: '6 days ago', amt: -12.40, note: 'Ride to Mission St' },
{ id: 't6', from: 'USDC earn', emoji: '✨', when: '1 wk ago', amt: 8.31, note: 'reward · Solayer staking' }];

function WalletScreen({ theme, orders }) {
  return (
    <div className="wallet-area">
      <section className="wallet-balance">
        <div className="wallet-bal-lbl">Available · USDC</div>
        <div className="wallet-bal-amt">2,481.39</div>
        <div className="wallet-bal-sub">on Solana · synced 12s ago</div>
        <div className="wallet-actions">
          <WalletAction label="Top up" glyph="↓" primary />
          <WalletAction label="Send" glyph="↑" />
          <WalletAction label="Receive" glyph="↗" />
          <WalletAction label="Earn" glyph="✨" />
        </div>
      </section>

      <section className="wallet-section">
        <div className="section-row">
          <h3 className="section-title">Activity</h3>
          <span className="section-tag">last 7 days</span>
        </div>
        <ul className="tx-list">
          {MOCK_TX.map((t) =>
          <li key={t.id} className="tx-row">
              <span className="tx-emoji">{t.emoji}</span>
              <span className="tx-body">
                <span className="tx-name">{t.to || t.from}</span>
                <span className="tx-note">{t.note}</span>
              </span>
              <span className="tx-side">
                <span className={`tx-amt ${t.amt < 0 ? 'out' : 'in'}`}>
                  {t.amt < 0 ? '−' : '+'}${Math.abs(t.amt).toFixed(2)}
                </span>
                <span className="tx-when">{t.when}</span>
              </span>
            </li>
          )}
        </ul>
      </section>
    </div>);

}
function WalletAction({ label, glyph, primary }) {
  return (
    <button className={`wallet-action ${primary ? 'is-primary' : ''}`}>
      <span className="wa-icon">{glyph}</span>
      <span className="wa-label">{label}</span>
    </button>);

}

// ─────────────────────────────────────────────────────────────
// Account screen (placeholder)
// ─────────────────────────────────────────────────────────────
function AccountScreen({ theme }) {
  const items = [
  { group: 'Profile', rows: [
    { lbl: 'Address', val: 'Sol4y...e8Q9' },
    { lbl: 'Display name', val: 'Frog enjoyer' },
    { lbl: 'Email', val: 'pepe@solayer.org' }]
  },
  { group: 'Solayer Pay', rows: [
    { lbl: 'Auto-pay limit', val: '$50 / order' },
    { lbl: 'Default network', val: 'Solana' },
    { lbl: 'Biometric', val: 'Face ID · on', accent: true }]
  },
  { group: 'Preferences', rows: [
    { lbl: 'Voice language', val: 'English (US)' },
    { lbl: 'Frog responses', val: 'Friendly' },
    { lbl: 'Haptics', val: 'on' }]
  }];

  return (
    <div className="account-area">
      <section className="account-header-card">
        <div className="account-avatar">
          <img id="account-avatar" src="mascot.png" alt="Solayer mascot"
          style={{ width: '72px', height: '72px', display: 'block', objectFit: 'contain', objectPosition: 'center', borderRadius: 14, imageRendering: 'auto' }} />
          <span className="account-sparkle"><Sparkle color={theme.accent} size={14} /></span>
        </div>
        <div className="account-id">
          <div className="account-name">Frog enjoyer</div>
          <div className="account-handle">@pepe · joined Mar 2026</div>
          <div className="account-stats">
            <span className="meta-pill">142 orders</span>
            <span className="meta-pill solana">Solayer member</span>
          </div>
        </div>
      </section>

      {items.map((g, gi) =>
      <section key={g.group} className="account-section">
          <h3 className="section-title small">{g.group}</h3>
          <ul className="account-list">
            {g.rows.map((r, ri) =>
          <li key={ri} className="account-row">
                <span className="account-row-lbl">{r.lbl}</span>
                <span className={`account-row-val ${r.accent ? 'accent' : ''}`}>{r.val} <span className="dim">›</span></span>
              </li>
          )}
          </ul>
        </section>
      )}

      <button className="cta ghost-link signout">sign out</button>
    </div>);

}

// ─────────────────────────────────────────────────────────────
// Browse screen — list of stores under a category
// ─────────────────────────────────────────────────────────────
function BrowseScreen({ category, stores, onPick, accent }) {
  if (!category) return null;
  return (
    <div className="browse-area">
      <div className="browse-filterbar">
        <span className="filter-chip is-active">All</span>
        <span className="filter-chip">Top rated</span>
        <span className="filter-chip">Under 20m</span>
        <span className="filter-chip">Solayer Pay ✓</span>
      </div>

      <div className="browse-count">
        <span><b>{stores.length} places</b> nearby</span>
        <span className="browse-sort">sort: distance ↓</span>
      </div>

      <div className="browse-list">
        {stores.map((s, i) =>
        <button key={s.name} className="browse-card"
        style={{ animationDelay: `${i * 70}ms` }}
        onClick={() => onPick(i)}>
            <div className="browse-img" style={{ background: s.swatch }}>
              <div className="browse-img-stripe" aria-hidden="true" />
              <div className="browse-img-emoji">{category.emoji}</div>
              <div className="browse-img-tag">
                <span className="dot" style={{ background: accent }} />
                <span>Solayer Pay</span>
              </div>
              <button className="browse-heart" onClick={(e) => e.stopPropagation()} aria-label="favorite">
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <path d="M9 15.5s-5.5-3.4-5.5-7.2A3.3 3.3 0 0 1 9 6.4a3.3 3.3 0 0 1 5.5 1.9c0 3.8-5.5 7.2-5.5 7.2z"
                stroke="#fff" strokeWidth="1.6" strokeLinejoin="round" fill="rgba(0,0,0,0.25)" />
                </svg>
              </button>
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
      {/* hero */}
      <div className="menu-hero" style={{ background: store.swatch }}>
        <div className="browse-img-stripe" aria-hidden="true" />
        <div className="menu-hero-emoji">{category.emoji}</div>
        <div className="menu-hero-tag">
          <span className="dot" style={{ background: theme.accent }} />
          <span>Solayer Pay accepted</span>
        </div>
      </div>

      {/* store meta strip */}
      <div className="menu-meta-strip">
        <span className="meta-pill"><Star color="#FFC857" /> {store.rating}</span>
        <span className="meta-pill">{store.eta}</span>
        <span className="meta-pill"><Pin /> {store.dist}</span>
        <span className="meta-pill solana">on Solana</span>
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
              <div className="menu-row-text">
                <div className="menu-row-name">{it.name}</div>
                <div className="menu-row-desc">{it.desc}</div>
                <div className="menu-row-price">${it.price.toFixed(2)}</div>
              </div>
              <div className="menu-row-thumb-wrap">
                <div className="menu-row-thumb" style={{ background: store.swatch }}>
                  <span className="menu-row-emoji">{it.emoji}</span>
                </div>
                {q === 0 ?
                <button className="menu-plus" aria-label={`add ${it.name}`}
                onClick={() => onAdd(it)}>+</button> :

                <div className="menu-stepper">
                    <button className="step-btn" aria-label="decrease"
                  onClick={() => onDec(it.name)}>−</button>
                    <span className="step-qty">{q}</span>
                    <button className="step-btn" aria-label="increase"
                  onClick={() => onAdd(it)}>+</button>
                  </div>
                }
              </div>
            </li>);

        })}
      </ul>

      {/* sticky cart bar */}
      {cartCount > 0 &&
      <button className="cart-bar" onClick={onCheckout}>
          <span className="cart-bar-badge">{cartCount}</span>
          <span className="cart-bar-mid">
            <span className="cart-bar-title">Checkout via Solayer Pay</span>
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
function OrdersScreen({ theme, upcoming, past, onPick, onClose }) {
  const [tab, setTab] = React.useState(upcoming.length ? 'upcoming' : 'past');
  const list = tab === 'upcoming' ? upcoming : past;
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

      {list.length === 0 ?
      <div className="orders-empty">
          <div className="orders-empty-emoji">{tab === 'upcoming' ? '🕒' : '📜'}</div>
          <div className="orders-empty-title">
            {tab === 'upcoming' ? 'no upcoming orders' : 'no past orders yet'}
          </div>
          <div className="orders-empty-sub">
            {tab === 'upcoming' ? 'tap the mic to start one' : "let's get you fed"}
          </div>
        </div> :

      <ul className="orders-list">
          {list.map((o) =>
        <li key={o.id} className="order-card">
              <div className="order-thumb" style={{ background: o.swatch }}>
                <span className="order-emoji">{o.emoji}</span>
              </div>
              <div className="order-body">
                <div className="order-top-row">
                  <span className="order-name">{o.store}</span>
                  <span className={`order-status status-${o.status}`}>
                    <span className="status-dot" />{o.statusLabel}
                  </span>
                </div>
                <div className="order-items">{o.summary}</div>
                <div className="order-bottom-row">
                  <span className="order-meta">{o.when}</span>
                  <span className="order-price">${o.total.toFixed(2)} <span className="dim">USDC</span></span>
                </div>
              </div>
            </li>
        )}
        </ul>
      }
    </div>);

}