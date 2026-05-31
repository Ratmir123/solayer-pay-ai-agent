/* apple-emoji.js — render every emoji as the real Apple (iOS) artwork instead of
   the platform's default set (Segoe UI Emoji on Windows, Noto on Android, etc.).

   The whole app draws emoji from data strings (menu items, past orders, the
   transaction feed, category tiles, the inline party/wave bits...). Rather than
   touch dozens of render sites, we patch React's classic createElement (Babel-
   standalone uses the classic runtime) so any emoji inside a host element's text is
   swapped for an <img> pointing at the Apple emoji image set. These are the genuine
   iOS glyphs, not generated.

   Purely presentational: the underlying data keeps the original emoji characters,
   and if an Apple image ever fails to load we fall back to the original glyph, so a
   wrong guess or an offline CDN can never leave a broken tile. No render sites change.
   To turn this off, remove the <script src="apple-emoji.js"> line in index.html. */
(function () {
  if (typeof React === 'undefined' || !React.createElement || React.__appleEmoji) return;
  React.__appleEmoji = true;

  // original, captured before we patch it — everything below builds with this one
  var create = React.createElement.bind(React);

  // 160px Apple artwork first (crisp on hi-dpi displays); the 64px npm set is a
  // fallback, and a still-missing image finally reverts to the raw glyph.
  var BASES = [
    'https://cdn.jsdelivr.net/gh/iamcal/emoji-data/img-apple-160/',
    'https://cdn.jsdelivr.net/npm/emoji-datasource-apple/img/apple/64/'
  ];

  // A pictographic emoji incl. optional variation selector (FE0F/FE0E) and ZWJ
  // (200D) sequences — skin tones, family/profession joins, etc. Non-emoji symbols
  // the app uses for typography (star, multiply-x, middot) either don't match here,
  // or 404 against the Apple set and harmlessly revert to the original glyph.
  var VS = '(?:️|︎)?';                 // optional emoji/text variation selector
  var PICTO = '\\p{Extended_Pictographic}';
  var SRC = PICTO + VS + '(?:‍' + PICTO + VS + ')*';  // base + ZWJ-joined sequences
  var EMOJI_ONE = new RegExp(SRC, 'u');       // non-global → safe for .test()
  var EMOJI_ALL = new RegExp(SRC, 'gu');      // global → used for splitting

  function hexOf(str, dropVS) {
    var out = [];
    for (var i = 0; i < str.length; ) {
      var cp = str.codePointAt(i);
      i += cp > 0xffff ? 2 : 1;
      if (dropVS && (cp === 0xfe0f || cp === 0xfe0e)) continue;
      out.push(cp.toString(16));
    }
    return out.join('-');
  }

  // Full image URLs to try, most-likely first. emoji-datasource keeps "-fe0f" for
  // some glyphs and drops it for others, so try the literal form, the bare form,
  // then bare+fe0f — across both sizes — and finally give up to the raw character.
  function candidates(emoji) {
    var asis = hexOf(emoji, false);
    var bare = hexOf(emoji, true);
    var names = [asis];
    if (bare !== asis) names.push(bare);
    if (bare.indexOf('-') === -1 && names.indexOf(bare + '-fe0f') === -1) names.push(bare + '-fe0f');
    var urls = [];
    for (var b = 0; b < BASES.length; b++)
      for (var n = 0; n < names.length; n++) urls.push(BASES[b] + names[n] + '.png');
    return urls;
  }

  function AppleEmoji(props) {
    var emoji = props.emoji;
    var st = React.useState(0);
    var step = st[0], setStep = st[1];
    // Track whether the current candidate's pixels have actually painted, so we
    // can fade the <img> from opacity 0 → 1 on a successful load. Reset to
    // false when we advance to the next candidate so the new src starts hidden
    // and fades in on its own load event.
    var ld = React.useState(false);
    var loaded = ld[0], setLoaded = ld[1];
    var ref = React.useRef(null);
    var cands = candidates(emoji);

    // Cached-image guard: if the browser already had this src in cache, the
    // load event may have fired before our listener attached (or not fire at
    // all). Sync .is-loaded from img.complete after commit so cached emoji
    // never get stuck at opacity 0. Runs every render and early-returns once
    // loaded, so no re-render loop.
    React.useEffect(function () {
      if (loaded) return;
      var img = ref.current;
      if (img && img.complete && img.naturalWidth > 0) setLoaded(true);
    });

    if (step >= cands.length) return emoji; // every Apple image failed → original glyph

    return create('img', {
      ref: ref,
      className: loaded ? 'apple-emoji is-loaded' : 'apple-emoji',
      src: cands[step],
      alt: emoji,
      'aria-label': emoji,
      role: 'img',
      draggable: false,
      decoding: 'async',
      onLoad: function () { setLoaded(true); },
      // Advance to the next candidate and reset the fade so the new src starts
      // hidden again; the next successful load fades it in.
      onError: function () { setLoaded(false); setStep(step + 1); }
    });
  }

  // "a <coffee> b"  ->  ["a ", <AppleEmoji/>, " b"]
  function split(str) {
    var parts = [], last = 0, m, k = 0;
    EMOJI_ALL.lastIndex = 0;
    while ((m = EMOJI_ALL.exec(str)) !== null) {
      if (m.index > last) parts.push(str.slice(last, m.index));
      parts.push(create(AppleEmoji, { emoji: m[0], key: 'ae' + (k++) }));
      last = m.index + m[0].length;
      if (EMOJI_ALL.lastIndex === m.index) EMOJI_ALL.lastIndex++;
    }
    if (last < str.length) parts.push(str.slice(last));
    return parts;
  }

  // elements whose text must stay literal text
  var SKIP = { textarea: 1, option: 1, title: 1, style: 1, script: 1, pre: 1 };

  React.createElement = function (type, config) {
    var n = arguments.length;
    if (n > 2 && typeof type === 'string' && !SKIP[type]) {
      var changed = false, kids = [];
      for (var i = 2; i < n; i++) {
        var c = arguments[i];
        if (typeof c === 'string' && c && EMOJI_ONE.test(c)) {
          changed = true;
          var p = split(c);
          for (var j = 0; j < p.length; j++) kids.push(p[j]);
        } else {
          kids.push(c);
        }
      }
      if (changed) return create.apply(null, [type, config].concat(kids));
    }
    return create.apply(null, arguments);
  };

  // Default: size to surrounding text. In the order/menu/transaction tiles the emoji
  // sits alone on a plate, so let it fill more of that plate (≈30% larger) — the
  // 160px art stays crisp at this size.
  // Calm, barely-there fade in: emoji <img> starts at opacity 0 and lands at 1
  // when its pixels paint (toggled by .is-loaded from onLoad / the cached-image
  // effect). If every candidate fails, the component returns the raw glyph
  // text instead of an <img>, so the fallback never sits at opacity 0.
  var css =
    '.apple-emoji{width:1em;height:1em;object-fit:contain;vertical-align:-0.15em;' +
    'display:inline-block;-webkit-user-select:none;user-select:none;pointer-events:none;' +
    'opacity:0;transition:opacity var(--dur-fast,160ms) var(--ease-out,cubic-bezier(0.22,1,0.36,1))}' +
    '.apple-emoji.is-loaded{opacity:1}' +
    '.order-emoji .apple-emoji,.cart-line-emoji .apple-emoji,.tx-emoji .apple-emoji,' +
    '.quick-chip-emoji .apple-emoji,.orders-empty-emoji .apple-emoji' +
    '{width:1.3em;height:1.3em;vertical-align:-0.18em}' +
    // the menu tiles are the biggest plates (60px) — let the emoji sit a touch larger
    '.menu-row-emoji .apple-emoji{width:1.45em;height:1.45em;vertical-align:-0.2em}';
  function injectCSS() {
    if (document.querySelector('style[data-apple-emoji]')) return;
    var st = document.createElement('style');
    st.setAttribute('data-apple-emoji', '');
    st.appendChild(document.createTextNode(css));
    (document.head || document.documentElement).appendChild(st);
  }
  if (document.head || document.documentElement) injectCSS();
  else document.addEventListener('DOMContentLoaded', injectCSS);
})();
