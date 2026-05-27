// app.jsx — assembly: iOS frame + FrogAgent + Tweaks

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "theme": "solayerAI",
  "intensity": 1.0,
  "particles": true
}/*EDITMODE-END*/;

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const theme = THEMES[t.theme] || THEMES.solayerAI;
  const isDark = t.theme !== 'lily';

  React.useEffect(() => {
    document.body.classList.remove('theme-cosmic', 'theme-lily', 'theme-solayerAI', 'theme-indigo');
    document.body.classList.add(theme.bgClass);
  }, [theme.bgClass]);

  return (
    <React.Fragment>
      <IOSDevice dark={isDark}>
        <div style={{ position: 'relative', height: '100%', zIndex: 1 }}>
          <FrogAgent theme={theme} intensity={t.intensity} showParticles={t.particles}/>
        </div>
      </IOSDevice>

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
