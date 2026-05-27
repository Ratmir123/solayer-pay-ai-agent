// svg-frog.jsx — animated, expressive frog mascot
// Exports: SvgFrog (window-global)
//
// Phases: idle | listening | thinking | response
// Reactivity comes from a parent-scoped --vlive CSS variable (0..~1.4),
// which scales the mouth open-ness and pupil dilation in real time.

function SvgFrog({ phase = 'idle' }) {
  return (
    <svg
      className={`svg-frog phase-${phase}`}
      viewBox="0 0 220 220"
      width="100%"
      height="100%"
      preserveAspectRatio="xMidYMid meet"
      style={{ overflow: 'visible', display: 'block' }}
    >
      <defs>
        <radialGradient id="frog-hood" cx="50%" cy="38%" r="65%">
          <stop offset="0%" stopColor="#2a2a2a"/>
          <stop offset="100%" stopColor="#070808"/>
        </radialGradient>
        <radialGradient id="frog-face" cx="50%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#9bc94d"/>
          <stop offset="55%" stopColor="#558d2c"/>
          <stop offset="100%" stopColor="#2a5e15"/>
        </radialGradient>
        <radialGradient id="frog-eye-bump" cx="50%" cy="35%" r="60%">
          <stop offset="0%" stopColor="#a8d24f"/>
          <stop offset="100%" stopColor="#3f7026"/>
        </radialGradient>
        <radialGradient id="frog-cheek" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#d1ff6e" stopOpacity="0.55"/>
          <stop offset="100%" stopColor="#d1ff6e" stopOpacity="0"/>
        </radialGradient>
        <filter id="frog-softshadow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3"/>
        </filter>
      </defs>

      {/* ground shadow */}
      <ellipse cx="110" cy="208" rx="62" ry="5" fill="rgba(0,0,0,0.35)" filter="url(#frog-softshadow)"/>

      <g className="frog-head">
        {/* hood */}
        <path
          d="M30 110 Q30 30 110 26 Q190 30 190 110 Q190 175 162 198 Q110 220 58 198 Q30 175 30 110 Z"
          fill="url(#frog-hood)"
        />

        {/* face proper (where chin/mouth live) */}
        <ellipse cx="110" cy="135" rx="62" ry="52" fill="url(#frog-face)"/>

        {/* eye bumps — sit on top of head */}
        <g className="eye-bumps">
          <circle cx="78" cy="92" r="24" fill="url(#frog-eye-bump)" stroke="rgba(0,0,0,0.4)" strokeWidth="1.2"/>
          <circle cx="142" cy="92" r="24" fill="url(#frog-eye-bump)" stroke="rgba(0,0,0,0.4)" strokeWidth="1.2"/>
        </g>

        {/* eye whites */}
        <g className="eye-whites">
          <circle cx="78" cy="92" r="15" fill="#ffffff"/>
          <circle cx="142" cy="92" r="15" fill="#ffffff"/>
        </g>

        {/* pupils — wrapped in <g> for combinable transforms */}
        <g className="pupil pupil-l"><circle cx="78" cy="92" r="5.5" fill="#0a0a0a"/></g>
        <g className="pupil pupil-r"><circle cx="142" cy="92" r="5.5" fill="#0a0a0a"/></g>

        {/* tiny eye shine */}
        <circle className="shine" cx="80.5" cy="89" r="1.6" fill="#fff"/>
        <circle className="shine" cx="144.5" cy="89" r="1.6" fill="#fff"/>

        {/* eyelids — drop down for blink (filled with skin gradient + dark rim) */}
        <g className="lids">
          <g className="lid lid-l">
            <ellipse cx="78" cy="92" rx="16" ry="16" fill="url(#frog-eye-bump)"/>
            <path d="M62 92 Q78 86 94 92" stroke="rgba(0,0,0,0.55)" strokeWidth="2" fill="none" strokeLinecap="round"/>
          </g>
          <g className="lid lid-r">
            <ellipse cx="142" cy="92" rx="16" ry="16" fill="url(#frog-eye-bump)"/>
            <path d="M126 92 Q142 86 158 92" stroke="rgba(0,0,0,0.55)" strokeWidth="2" fill="none" strokeLinecap="round"/>
          </g>
        </g>

        {/* brows — lift in surprise, furrow in thinking */}
        <g className="brows">
          <path className="brow brow-l" d="M58 70 Q78 60 96 70" stroke="#1a2207" strokeWidth="3.2" fill="none" strokeLinecap="round"/>
          <path className="brow brow-r" d="M124 70 Q142 60 162 70" stroke="#1a2207" strokeWidth="3.2" fill="none" strokeLinecap="round"/>
        </g>

        {/* cheeks (subtle blush) */}
        <ellipse cx="74" cy="148" rx="14" ry="7" fill="url(#frog-cheek)"/>
        <ellipse cx="146" cy="148" rx="14" ry="7" fill="url(#frog-cheek)"/>

        {/* mouth — multiple variants layered, opacity toggled per phase */}
        <g className="mouth">
          {/* idle: subtle smirk */}
          <path className="m m-smirk"
                d="M86 160 Q110 168 134 160"
                stroke="#0c1a04" strokeWidth="3" fill="none" strokeLinecap="round"/>

          {/* listening: open oval that scales with --vlive */}
          <g className="m m-talk">
            <ellipse className="m-talk-shape" cx="110" cy="162" rx="14" ry="3"
                     fill="#1a0808"/>
            {/* tongue hint */}
            <ellipse className="m-talk-tongue" cx="110" cy="164" rx="9" ry="2"
                     fill="#c0464a" opacity="0.85"/>
          </g>

          {/* thinking: small "hmm" line, off-center */}
          <path className="m m-hmm"
                d="M96 160 Q104 156 116 160"
                stroke="#0c1a04" strokeWidth="3" fill="none" strokeLinecap="round"/>

          {/* response: big smile */}
          <path className="m m-smile"
                d="M80 152 Q110 178 140 152"
                stroke="#0c1a04" strokeWidth="3.4" fill="none" strokeLinecap="round"/>
          {/* smile inner */}
          <path className="m m-smile-fill"
                d="M82 154 Q110 176 138 154 Q110 168 82 154 Z"
                fill="#1a0808" opacity="0.65"/>
        </g>
      </g>
    </svg>
  );
}

window.SvgFrog = SvgFrog;
