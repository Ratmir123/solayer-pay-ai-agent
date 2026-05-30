// app.jsx — assembly: iOS frame + FrogAgent + Tweaks

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "theme": "solayerAI",
  "intensity": 1.0,
  "particles": true
}/*EDITMODE-END*/;

// On a phone the app renders fullscreen (native, no fake device frame). On wider
// screens it stays inside the iPhone mockup for presentation. Reactive to resize.
// "Handheld" = a narrow screen OR a real touch device with no hover (covers
// phones in landscape that are wider than 820px). A laptop/desktop keeps the
// presentation mockup unless its window is genuinely narrow.
function useIsPhone(query = '(max-width: 820px), (hover: none) and (pointer: coarse)') {
  const get = () => typeof window !== 'undefined' && window.matchMedia(query).matches;
  const [phone, setPhone] = React.useState(get);
  React.useEffect(() => {
    const mq = window.matchMedia(query);
    const on = () => setPhone(mq.matches);
    on();
    mq.addEventListener ? mq.addEventListener('change', on) : mq.addListener(on);
    return () => { mq.removeEventListener ? mq.removeEventListener('change', on) : mq.removeListener(on); };
  }, [query]);
  return phone;
}

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const theme = THEMES[t.theme] || THEMES.solayerAI;
  const isDark = t.theme !== 'lily';
  const isPhone = useIsPhone();

  React.useEffect(() => {
    document.body.classList.remove('theme-cosmic', 'theme-lily', 'theme-solayerAI', 'theme-indigo');
    document.body.classList.add(theme.bgClass);
  }, [theme.bgClass]);

  React.useEffect(() => {
    document.body.classList.toggle('is-phone', isPhone);
    document.body.classList.toggle('is-desktop', !isPhone);
  }, [isPhone]);

  const agent = (
    <div className="agent-mount" style={{ position: 'relative', height: '100%', zIndex: 1 }}>
      <FrogAgent theme={theme} intensity={t.intensity} showParticles={t.particles}/>
    </div>
  );

  return (
    <React.Fragment>
      {isPhone
        ? <div className="app-fullscreen">{agent}</div>
        : <IOSDevice dark={isDark}>{agent}</IOSDevice>}

      <TweaksPanel>
        <TweakSection label="Theme"/>
        <TweakRadio
          label="Mode"
          value={t.theme}
          options={['solayerAI', 'indigo', 'lily']}
          onChange={(v) => setTweak('theme', v)}
        />
        <TweakSection label="Motion"/>
        <TweakSlider
          label="Voice reactivity"
          value={t.intensity}
          min={0.3} max={2.2} step={0.1}
          onChange={(v) => setTweak('intensity', v)}
        />
        <TweakToggle
          label="Floating particles"
          value={t.particles}
          onChange={(v) => setTweak('particles', v)}
        />
      </TweaksPanel>
    </React.Fragment>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App/>);
