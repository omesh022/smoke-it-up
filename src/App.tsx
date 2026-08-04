import { useEffect, useRef, useState } from 'react';
import {
  Game,
  CHARACTERS,
  TOOLS,
  FRUITS,
  ENERGY_DRINK,
  CHALLENGE_MODS,
  ACHIEVEMENTS,
  STAR_TO_CASH,
  type GameState,
  type GameStats,
  type CharacterDef,
  type ToolDef,
  type FruitDef,
  type AchievementDef,
} from './game/Game';
import { AudioManager } from './game/Audio';

const defaultStats: GameStats = {
  lungHealth: 100,
  money: 0,
  score: 0,
  combo: 1,
  bestCombo: 1,
  drags: 0,
  containersFilled: 0,
  fruitBought: 0,
  highScore: 0,
  selectedChar: 0,
  selectedTool: 0,
  unlockedChars: [true],
  unlockedTools: [true],
  level: 1,
  jarsThisLevel: 0,
  levelQuota: 3,
  bestLevel: 0,
  goldenFilled: 0,
  fruitDrops: 0,
  scores: [],
  drinkStock: 0,
  regenBuff: 0,
  energyDrinksUsed: 0,
  costMult: 1,
  inChallenge: false,
  challengeMods: [],
  perfectChain: 0,
  achievements: [],
  activeEffects: [],
  nextJarX2: false,
  goldenStars: 0,
  smokeBlasters: 0,
  lifetimeStars: 0,
  lifetimeBlastersUsed: 0,
};

type ShopTab = 'smokers' | 'tools' | 'drinks' | 'fruit';

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameRef = useRef<Game | null>(null);
  const audioRef = useRef<AudioManager | null>(null);
  const [state, setState] = useState<GameState>('menu');
  const [stats, setStats] = useState<GameStats>(defaultStats);
  const [showTutorial, setShowTutorial] = useState(true);
  const [shopOpen, setShopOpen] = useState(false);
  const [shopTab, setShopTab] = useState<ShopTab>('smokers');
  const [musicOn, setMusicOn] = useState(true);
  const [sfxOn, setSfxOn] = useState(true);
  const [masterVol, setMasterVol] = useState(90);
  const [showCloud, setShowCloud] = useState(false);
  const [showAch, setShowAch] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [generatedCode, setGeneratedCode] = useState('');
  const [inputCode, setInputCode] = useState('');
  const [cloudMsg, setCloudMsg] = useState('');
  const [toast, setToast] = useState<{ ach: AchievementDef; key: number } | null>(null);
  const shopOpenRef = useRef(false);
  shopOpenRef.current = shopOpen;

  useEffect(() => {
    if (!canvasRef.current) return;
    const audio = new AudioManager();
    audio.loadPrefs();
    audioRef.current = audio;
    setMusicOn(audio.musicOn);
    setSfxOn(audio.sfxOn);
    setMasterVol(Math.round(audio.masterVol * 100));

    const g = new Game(canvasRef.current);
    g.setAudio(audio);
    gameRef.current = g;
    g.onStateChange = (s) => setState(s);
    g.onStatsChange = (st) => setStats(st);
    g.onToast = (ach) => {
      setToast({ ach, key: Date.now() });
    };
    setStats(g.getStats());
    return () => g.destroy();
  }, []);

  // Auto-dismiss achievement toast
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3600);
    return () => clearTimeout(t);
  }, [toast]);

  // Audio unlock + music start on first gesture
  useEffect(() => {
    const unlock = () => {
      audioRef.current?.init();
    };
    window.addEventListener('pointerdown', unlock, { once: true });
    window.addEventListener('keydown', unlock, { once: true });
    return () => {
      window.removeEventListener('pointerdown', unlock);
      window.removeEventListener('keydown', unlock);
    };
  }, []);

  // Keyboard
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.repeat) return;
      const g = gameRef.current;
      if (!g) return;
      const st = g.getState();
      if (e.code === 'Digit1') st === 'playing' && !shopOpenRef.current && g.eatFruit(0);
      else if (e.code === 'Digit2') st === 'playing' && !shopOpenRef.current && g.eatFruit(1);
      else if (e.code === 'Digit3') st === 'playing' && !shopOpenRef.current && g.eatFruit(2);
      else if (e.code === 'Digit4') st === 'playing' && !shopOpenRef.current && g.eatFruit(3);
      else if (e.code === 'Digit5') st === 'playing' && !shopOpenRef.current && g.eatFruit(4);
      else if (e.code === 'Digit6') st === 'playing' && !shopOpenRef.current && g.eatFruit(5);
      else if (e.code === 'KeyE') st === 'playing' && !shopOpenRef.current && g.drinkEnergy();
      else if (e.code === 'KeyB') st === 'playing' && !shopOpenRef.current && g.useBlaster();
      else if (e.code === 'KeyS') {
        if (st === 'playing' || st === 'menu') {
          if (shopOpenRef.current) closeShop();
          else openShop();
        }
      } else if (e.code === 'Escape') {
        if (shopOpenRef.current) closeShop();
        else if (st === 'playing') g.pause();
        else if (st === 'paused') g.resume();
      } else if (e.code === 'KeyP') {
        if (st === 'playing' && !shopOpenRef.current) g.pause();
        else if (st === 'paused') g.resume();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (state === 'playing' && showTutorial) {
      const t = setTimeout(() => setShowTutorial(false), 4500);
      return () => clearTimeout(t);
    }
  }, [state, showTutorial]);

  const openShop = (tab?: ShopTab) => {
    setShopTab(tab ?? shopTab);
    setShopOpen(true);
    gameRef.current?.setShopOpen(true);
  };
  const closeShop = () => {
    setShopOpen(false);
    gameRef.current?.setShopOpen(false);
  };

  const toggleMusic = () => {
    const a = audioRef.current;
    if (!a) return;
    a.init();
    a.setMusicOn(!a.musicOn);
    setMusicOn(a.musicOn);
  };
  const toggleSfx = () => {
    const a = audioRef.current;
    if (!a) return;
    a.init();
    a.setSfxOn(!a.sfxOn);
    setSfxOn(a.sfxOn);
  };
  const changeVolume = (v: number) => {
    setMasterVol(v);
    audioRef.current?.init();
    audioRef.current?.setMasterVolume(v / 100);
  };

  const healthPct = Math.max(0, Math.min(100, stats.lungHealth));
  const healthColor =
    healthPct > 60 ? '#5eead4' : healthPct > 30 ? '#fbbf24' : '#f87171';
  const lowHealth = healthPct < 30;
  const fullHealth = healthPct >= 100;
  const curChar = CHARACTERS[stats.selectedChar] ?? CHARACTERS[0];
  const curTool = TOOLS[stats.selectedTool] ?? TOOLS[0];
  const levelProgress = Math.min(100, (stats.jarsThisLevel / stats.levelQuota) * 100);
  const inRun = state === 'playing';
  const activeMods = stats.challengeMods
    .map((id) => CHALLENGE_MODS.find((m) => m.id === id))
    .filter(Boolean) as typeof CHALLENGE_MODS;
  const achCount = ACHIEVEMENTS.length;
  const achUnlocked = stats.achievements.length;

  const genCloudCode = () => {
    const code = gameRef.current?.exportProgress() ?? '';
    setGeneratedCode(code);
    setCloudMsg(code ? 'Copy this code — it contains all your progress.' : 'Failed to encode.');
  };
  const restoreCloud = () => {
    const ok = gameRef.current?.importProgress(inputCode) ?? false;
    setCloudMsg(ok ? '✅ Progress restored!' : '❌ Invalid code.');
  };
  const copyCloud = async () => {
    try {
      await navigator.clipboard.writeText(generatedCode);
      setCloudMsg('Copied to clipboard!');
    } catch {
      setCloudMsg('Copy manually — code is in the box.');
    }
  };

  return (
    <div className="fixed inset-0 overflow-hidden bg-[#1a0b2e] font-sans text-white select-none touch-none">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 h-full w-full"
        style={{ imageRendering: 'auto' }}
      />

      {/* Achievement toast */}
      {toast && (
        <div
          key={toast.key}
          className="pointer-events-none absolute inset-x-0 top-16 z-40 flex justify-center"
        >
          <div className="ach-toast flex items-center gap-3 rounded-2xl border border-amber-400/50 bg-gradient-to-r from-amber-500/25 to-pink-500/25 px-5 py-3 shadow-[0_0_30px_rgba(251,191,36,0.45)] backdrop-blur-md">
            <span className="text-3xl">{toast.ach.emoji}</span>
            <div>
              <div className="text-[10px] font-black uppercase tracking-widest text-amber-300">
                Achievement Unlocked!
              </div>
              <div className="text-base font-black">{toast.ach.name}</div>
              <div className="text-[11px] text-white/60">{toast.ach.desc}</div>
              {(toast.ach.stars || toast.ach.blasters) && (
                <div className="mt-0.5 text-[11px] font-black text-amber-200">
                  {toast.ach.stars ? `+${toast.ach.stars}⭐` : ''}
                  {toast.ach.stars && toast.ach.blasters ? '  ·  ' : ''}
                  {toast.ach.blasters ? `+${toast.ach.blasters}💥 Blaster` : ''}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ============ HUD (playing) ============ */}
      {inRun && !shopOpen && (
        <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex items-start justify-between gap-3 p-3 sm:p-5">
          <div className="flex flex-col gap-2">
            {/* Level chip */}
            <div className="rounded-2xl border border-white/10 bg-black/40 px-3 py-2 backdrop-blur-md sm:px-4">
              <div className="mb-1 flex items-center gap-2">
                {stats.inChallenge ? (
                  <span className="animate-pulse text-xs font-black uppercase tracking-widest text-rose-300">
                    ⚠ CHALLENGE {stats.level}
                  </span>
                ) : (
                  <span className="text-xs font-black uppercase tracking-widest text-amber-300">
                    🎚 Level {stats.level}
                  </span>
                )}
                {activeMods.map((m) => (
                  <span key={m.id} title={m.name + ' — ' + m.desc} className="text-sm">
                    {m.emoji}
                  </span>
                ))}
                {stats.activeEffects.map((e) => (
                  <span
                    key={e}
                    className={`animate-pulse rounded px-1.5 py-0.5 text-[9px] font-black ${
                      e === '2X' || e === 'BOOST'
                        ? 'bg-purple-400/20 text-purple-300'
                        : e === '-20%'
                          ? 'bg-sky-400/20 text-sky-300'
                          : 'bg-amber-400/20 text-amber-300'
                    }`}
                  >
                    {e}
                  </span>
                ))}
                <span className="ml-auto text-[10px] font-bold text-white/50">
                  {stats.jarsThisLevel}/{stats.levelQuota} jars
                </span>
              </div>
              <div className="relative h-2.5 w-44 overflow-hidden rounded-full bg-white/10 sm:w-64">
                <div
                  className={`h-full rounded-full transition-[width] duration-200 ${
                    stats.inChallenge
                      ? 'bg-gradient-to-r from-rose-500 to-orange-400'
                      : 'bg-gradient-to-r from-amber-400 via-pink-500 to-purple-500'
                  }`}
                  style={{ width: `${levelProgress}%`, boxShadow: '0 0 10px rgba(251,191,36,0.7)' }}
                />
              </div>
            </div>

            {/* Lung health */}
            <div className="rounded-2xl border border-white/10 bg-black/40 px-3 py-2 backdrop-blur-md sm:px-4">
              <div className="mb-1 flex items-center gap-2">
                <LungIcon color={healthColor} pulse={lowHealth} />
                <span className="text-xs font-bold uppercase tracking-widest text-white/70">
                  Lung Health
                </span>
                {stats.regenBuff > 0 && (
                  <span className="animate-pulse rounded bg-cyan-400/20 px-1.5 py-0.5 text-[10px] font-black text-cyan-300">
                    ⚡ REGEN
                  </span>
                )}
                <span className="ml-auto text-sm font-bold tabular-nums" style={{ color: healthColor }}>
                  {Math.round(healthPct)}%
                </span>
              </div>
              <div className="relative h-3 w-44 overflow-hidden rounded-full bg-white/10 sm:w-64">
                <div
                  className="h-full rounded-full transition-[width] duration-100 ease-out"
                  style={{
                    width: `${healthPct}%`,
                    background: `linear-gradient(90deg, ${healthColor}, ${healthColor}dd)`,
                    boxShadow: `0 0 12px ${healthColor}`,
                  }}
                />
                {stats.regenBuff > 0 && (
                  <div className="absolute inset-0 animate-pulse rounded-full bg-cyan-400/25" />
                )}
                {lowHealth && <div className="absolute inset-0 animate-pulse rounded-full bg-red-500/30" />}
              </div>
            </div>

            {/* Bank + stars */}
            <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-black/40 px-3 py-2 backdrop-blur-md sm:px-4">
              <span className="text-xl">💰</span>
              <div className="leading-tight">
                <div className="text-[10px] font-bold uppercase tracking-widest text-white/60">
                  Cash <span className="text-emerald-300/80">(saved)</span>
                </div>
                <div className="text-lg font-black tabular-nums text-yellow-300 drop-shadow-[0_0_6px_rgba(253,224,71,0.6)]">
                  ${stats.money.toLocaleString()}
                </div>
              </div>
              <div className="ml-1 border-l border-white/10 pl-2 leading-tight">
                <div className="text-[10px] font-bold uppercase tracking-widest text-amber-200/70">⭐ Stars</div>
                <div className="text-base font-black tabular-nums text-amber-300">{stats.goldenStars}</div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="rounded-xl border border-white/10 bg-black/40 px-3 py-1.5 backdrop-blur-md">
                <div className="text-[10px] font-bold uppercase tracking-widest text-white/60">Score</div>
                <div className="text-base font-black tabular-nums">{stats.score.toLocaleString()}</div>
              </div>
              {stats.combo > 1.1 && (
                <div
                  className="rounded-xl border px-3 py-1.5 backdrop-blur-md"
                  style={{
                    background: 'linear-gradient(135deg, rgba(236,72,153,0.4), rgba(168,85,247,0.4))',
                    borderColor: 'rgba(236,72,153,0.6)',
                    boxShadow: '0 0 16px rgba(236,72,153,0.5)',
                    transform: `scale(${1 + Math.min(0.2, (stats.combo - 1) * 0.1)})`,
                    transition: 'transform 120ms',
                  }}
                >
                  <div className="text-[10px] font-bold uppercase tracking-widest text-pink-200">Combo</div>
                  <div className="text-base font-black tabular-nums text-pink-100">
                    x{stats.combo.toFixed(1)}
                  </div>
                  {stats.perfectChain >= 2 && (
                    <div className="text-center text-[9px] font-black text-amber-300">
                      🔥 {stats.perfectChain} perfect
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right controls */}
          <div className="pointer-events-auto flex flex-col items-end gap-2">
            <div className="flex gap-1.5">
              <button
                type="button"
                onClick={() => setShowHelp(true)}
                title="How to Play"
                className="rounded-xl border border-sky-400/40 bg-sky-500/20 px-2.5 py-1.5 text-xs font-black uppercase tracking-wide text-sky-100 backdrop-blur-md transition hover:bg-sky-500/30 active:scale-90"
              >
                ❓ Help
              </button>
              <button
                type="button"
                onClick={toggleMusic}
                title="Music"
                className={`rounded-xl border px-2.5 py-1.5 text-sm backdrop-blur-md transition active:scale-90 ${
                  musicOn ? 'border-emerald-400/40 bg-emerald-500/20' : 'border-white/10 bg-black/40 opacity-60'
                }`}
              >
                {musicOn ? '🎵' : '🔇'}
              </button>
              <button
                type="button"
                onClick={toggleSfx}
                title="Sound effects"
                className={`rounded-xl border px-2.5 py-1.5 text-sm backdrop-blur-md transition active:scale-90 ${
                  sfxOn ? 'border-emerald-400/40 bg-emerald-500/20' : 'border-white/10 bg-black/40 opacity-60'
                }`}
              >
                {sfxOn ? '🔊' : '🔈'}
              </button>
            </div>
            <button
              type="button"
              onClick={() => openShop()}
              className="group relative flex items-center gap-2 rounded-2xl bg-gradient-to-r from-amber-400 to-pink-500 px-4 py-2.5 font-black uppercase tracking-wider text-slate-900 shadow-lg shadow-pink-500/30 transition hover:brightness-110 active:scale-95"
            >
              <span className="text-lg">🛒</span>
              <span className="hidden text-sm sm:inline">Shop</span>
              <kbd className="hidden rounded border border-slate-900/30 bg-black/10 px-1 text-[10px] font-mono sm:inline">S</kbd>
            </button>

            <button
              type="button"
              onClick={() => gameRef.current?.pause()}
              className="rounded-xl border border-white/10 bg-black/40 px-3 py-1.5 text-xs font-bold uppercase tracking-widest text-white/70 backdrop-blur-md transition hover:bg-black/60"
            >
              ⏸
            </button>

            <div className="rounded-xl border border-white/10 bg-black/40 px-3 py-1.5 text-right backdrop-blur-md">
              <div className="text-[10px] font-bold uppercase tracking-widest text-white/60">High</div>
              <div className="text-sm font-black tabular-nums text-amber-200">{stats.highScore.toLocaleString()}</div>
            </div>
          </div>
        </div>
      )}

      {/* ============ Bottom: quick fruit bar + loadout chips ============ */}
      {inRun && !shopOpen && (
        <div className="pointer-events-none absolute inset-x-0 bottom-2 z-10 flex flex-col items-center gap-1.5 px-2 sm:px-3">
          <div className="pointer-events-auto flex w-full max-w-xl gap-1.5 overflow-x-auto rounded-2xl border border-white/10 bg-black/50 p-1.5 backdrop-blur-md">
            {FRUITS.map((f, i) => {
              const affordable = stats.money >= f.cost;
              return (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => gameRef.current?.eatFruit(i)}
                  disabled={!affordable || fullHealth}
                  className={`flex min-w-[52px] flex-1 flex-col items-center rounded-xl px-1 py-1.5 transition active:scale-90 ${
                    fullHealth
                      ? 'bg-white/5 text-white/30'
                      : affordable
                        ? 'bg-gradient-to-b from-emerald-500/30 to-emerald-600/10 hover:from-emerald-500/45'
                        : 'bg-white/5 text-white/35'
                  }`}
                >
                  <span className={`text-xl ${fullHealth ? 'grayscale' : ''}`}>{f.emoji}</span>
                  <span className="text-[9px] font-black tabular-nums text-yellow-300">
                    {fullHealth ? 'FULL' : `$${f.cost}`}
                  </span>
                </button>
              );
            })}
            <button
              type="button"
              onClick={() => gameRef.current?.drinkEnergy()}
              disabled={fullHealth || stats.drinkStock <= 0}
              className={`flex min-w-[52px] flex-1 flex-col items-center rounded-xl px-1 py-1.5 transition active:scale-90 ${
                fullHealth || stats.drinkStock <= 0
                  ? 'bg-white/5 text-white/35'
                  : 'bg-gradient-to-b from-cyan-500/30 to-cyan-600/10 hover:from-cyan-500/45'
              }`}
            >
              <span className={`text-xl ${fullHealth ? 'grayscale' : ''}`}>⚡</span>
              <span className="text-[9px] font-black tabular-nums text-cyan-300">×{stats.drinkStock}</span>
            </button>
            <button
              type="button"
              onClick={() => gameRef.current?.useBlaster()}
              disabled={stats.smokeBlasters <= 0}
              className={`flex min-w-[52px] flex-1 flex-col items-center rounded-xl px-1 py-1.5 transition active:scale-90 ${
                stats.smokeBlasters <= 0
                  ? 'bg-white/5 text-white/35'
                  : 'bg-gradient-to-b from-orange-500/35 to-red-600/15 hover:from-orange-500/50 shadow-[0_0_12px_rgba(249,115,22,0.35)]'
              }`}
              title="Smoke Blaster — fills the whole jar instantly (B)"
            >
              <span className={`text-xl ${stats.smokeBlasters <= 0 ? 'grayscale' : ''}`}>💥</span>
              <span className="text-[9px] font-black tabular-nums text-orange-300">×{stats.smokeBlasters}</span>
            </button>
          </div>

          <div className="pointer-events-auto hidden w-full max-w-xl items-center justify-between gap-2 sm:flex">
            <div className="flex gap-1.5">
              <button
                type="button"
                onClick={() => openShop('smokers')}
                className="flex items-center gap-2 rounded-xl border border-white/10 bg-black/50 px-3 py-1.5 backdrop-blur-md transition hover:bg-black/70 active:scale-95"
              >
                <span className="text-lg">{curChar.emoji}</span>
                <div className="text-left leading-tight">
                  <div className="text-[9px] font-bold uppercase tracking-widest text-white/50">Smoker</div>
                  <div className="text-xs font-black">{curChar.name}</div>
                </div>
                <span className="rounded-md bg-amber-400/20 px-1.5 py-0.5 text-[10px] font-black text-amber-300">
                  x{curChar.mult.toFixed(1)}
                </span>
              </button>
              <button
                type="button"
                onClick={() => openShop('tools')}
                className="flex items-center gap-2 rounded-xl border border-white/10 bg-black/50 px-3 py-1.5 backdrop-blur-md transition hover:bg-black/70 active:scale-95"
              >
                <span className="text-lg">{curTool.emoji}</span>
                <div className="text-left leading-tight">
                  <div className="text-[9px] font-bold uppercase tracking-widest text-white/50">Tool</div>
                  <div className="text-xs font-black">{curTool.name}</div>
                </div>
                <span className="rounded-md bg-sky-400/20 px-1.5 py-0.5 text-[10px] font-black text-sky-300">
                  {curTool.fill.toFixed(1)}x
                </span>
                <span className="rounded-md bg-amber-400/20 px-1.5 py-0.5 text-[10px] font-black text-amber-300">
                  {curTool.earn.toFixed(1)}$
                </span>
              </button>
            </div>
            <div className="text-[10px] font-bold text-white/35">
              <kbd className="rounded border border-white/15 bg-black/40 px-1 font-mono">1-6</kbd> fruit ·{' '}
              <kbd className="rounded border border-white/15 bg-black/40 px-1 font-mono">E</kbd> ⚡ ·{' '}
              <kbd className="rounded border border-white/15 bg-black/40 px-1 font-mono">B</kbd> 💥
            </div>
          </div>
        </div>
      )}

      {/* Tutorial */}
      {inRun && !shopOpen && showTutorial && (
        <div className="pointer-events-none absolute inset-x-0 top-24 z-10 flex justify-center">
          <div className="animate-pulse rounded-full border border-white/20 bg-black/60 px-5 py-2.5 text-center text-sm font-bold backdrop-blur-md">
            <span className="text-yellow-300">HOLD</span>{' '}
            <span className="text-white/80">
              <span className="hidden sm:inline">SPACE</span>
              <span className="sm:hidden">SCREEN</span>
            </span>{' '}
            <span className="text-white/60">to fill jars</span>
            <span className="mx-2 text-white/30">•</span>
            <span className="text-emerald-300">🍎 eat to heal</span>
            <span className="mx-2 text-white/30">•</span>
            <span className="text-cyan-300">⚡ drink to regen</span>
          </div>
        </div>
      )}

      {/* ============ SHOP (menu + in-run) ============ */}
      {(inRun || state === 'menu') && shopOpen && (
        <div
          className="absolute inset-0 z-30 flex items-end justify-center bg-black/60 backdrop-blur-sm sm:items-center"
          onClick={closeShop}
        >
          <div
            className="flex max-h-[92vh] w-full max-w-lg flex-col rounded-t-3xl border border-white/10 bg-gradient-to-b from-slate-900/95 to-[#1a0b2e]/95 shadow-2xl sm:rounded-3xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-2 border-b border-white/10 p-4">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🛒</span>
                <h2 className="text-lg font-black uppercase tracking-tight">Smoke Shop</h2>
                {stats.costMult > 1.01 && (
                  <span className="rounded bg-orange-500/15 px-1.5 py-0.5 text-[10px] font-black text-orange-300">
                    ×{stats.costMult.toFixed(2)} prices (Lv {stats.level})
                  </span>
                )}
                {stats.activeEffects.includes('-20%') && (
                  <span className="rounded bg-sky-500/20 px-1.5 py-0.5 text-[10px] font-black text-sky-300">
                    SALE −20%
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="rounded-lg bg-emerald-500/15 px-2.5 py-1 font-black tabular-nums text-emerald-300">
                  💰 ${stats.money.toLocaleString()}
                </span>
                <button
                  type="button"
                  onClick={closeShop}
                  className="rounded-lg border border-white/15 bg-white/5 px-2.5 py-1 font-bold text-white/70 transition hover:bg-white/15"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="flex gap-1.5 border-b border-white/10 p-2">
              <ShopTabButton active={shopTab === 'smokers'} onClick={() => setShopTab('smokers')}>
                🎤 Smokers
              </ShopTabButton>
              <ShopTabButton active={shopTab === 'tools'} onClick={() => setShopTab('tools')}>
                💨 Tools
              </ShopTabButton>
              <ShopTabButton active={shopTab === 'fruit'} onClick={() => setShopTab('fruit')}>
                🍎 Fruit
              </ShopTabButton>
              <ShopTabButton active={shopTab === 'drinks'} onClick={() => setShopTab('drinks')}>
                ⚡ Drinks
              </ShopTabButton>
            </div>

            <div className="flex-1 overflow-y-auto p-3">
              {shopTab === 'smokers' && (
                <div className="space-y-2">
                  {CHARACTERS.map((c, i) => (
                    <CharacterRow
                      key={c.id}
                      char={c}
                      owned={stats.unlockedChars[i]}
                      selected={stats.selectedChar === i}
                      money={stats.money}
                      costMult={stats.costMult}
                      onAction={() =>
                        stats.unlockedChars[i]
                          ? gameRef.current?.selectCharacter(i)
                          : gameRef.current?.buyCharacter(i)
                      }
                    />
                  ))}
                  <p className="px-1 pt-1 text-[11px] leading-relaxed text-white/40">
                    Higher-tier smokers multiply every jar&apos;s sell price. Top legends demand serious
                    grinding — cash is saved forever.
                  </p>
                </div>
              )}

              {shopTab === 'tools' && (
                <div className="space-y-2">
                  {TOOLS.map((t, i) => (
                    <ToolRow
                      key={t.id}
                      tool={t}
                      owned={stats.unlockedTools[i]}
                      selected={stats.selectedTool === i}
                      money={stats.money}
                      costMult={stats.costMult}
                      onAction={() =>
                        stats.unlockedTools[i]
                          ? gameRef.current?.selectTool(i)
                          : gameRef.current?.buyTool(i)
                      }
                    />
                  ))}
                  <p className="px-1 pt-1 text-[11px] leading-relaxed text-white/40">
                    Fast tools fill jars quicker — but ⚠ damage burns your lungs. The Blunt is the
                    ultimate endgame tool.
                  </p>
                </div>
              )}

              {shopTab === 'fruit' && (
                <div className="space-y-2">
                  {FRUITS.map((f, i) => (
                    <FruitRow
                      key={f.id}
                      fruit={f}
                      money={stats.money}
                      health={healthPct}
                      onBuy={() => {
                        gameRef.current?.eatFruit(i);
                      }}
                    />
                  ))}
                  <p className="px-1 pt-1 text-[11px] leading-relaxed text-white/40">
                    Cheap fruit = quick top-ups. Pineapple is the only full heal — worth every penny.
                  </p>
                </div>
              )}

              {shopTab === 'drinks' && (
                <div className="space-y-2">
                  <div className="flex items-center gap-3 rounded-2xl border border-cyan-400/20 bg-black/30 p-3">
                    <span className="text-3xl">⚡</span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-black">Energy Drink</span>
                        <span className="rounded-md bg-cyan-400/15 px-1.5 py-0.5 text-[10px] font-black text-cyan-300">
                          ${ENERGY_DRINK.cost}/can
                        </span>
                      </div>
                      <div className="text-[11px] text-white/40">{ENERGY_DRINK.blurb}</div>
                      <div className="mt-0.5 text-[11px] font-bold text-cyan-200/80">
                        Stock: {stats.drinkStock}/{ENERGY_DRINK.maxStock}
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {[1, 3, 6].map((n) => {
                      const cost = ENERGY_DRINK.cost * n;
                      const affordable = stats.money >= cost;
                      return (
                        <button
                          key={n}
                          type="button"
                          onClick={() => gameRef.current?.buyDrinks(n)}
                          disabled={!affordable}
                          className={`rounded-xl px-3 py-3 text-sm font-black transition active:scale-95 ${
                            affordable
                              ? 'bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-900 shadow-lg shadow-cyan-500/25 hover:brightness-110'
                              : 'border border-white/10 bg-white/5 text-white/40'
                          }`}
                        >
                          ×{n}
                          <div className="text-xs tabular-nums">${cost}</div>
                        </button>
                      );
                    })}
                  </div>
                  <p className="px-1 pt-1 text-[11px] leading-relaxed text-white/40">
                    Energy drinks are the ONLY way to regenerate over time. Can&apos;t drink when full.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ============ START MENU ============ */}
      {state === 'menu' && !shopOpen && !showCloud && !showAch && !showHelp && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="mx-4 max-h-[94vh] w-full max-w-md overflow-y-auto rounded-3xl border border-white/10 bg-gradient-to-br from-purple-900/80 via-slate-900/80 to-indigo-950/80 p-6 shadow-2xl sm:p-8">
            <div className="mb-4 text-center">
              <div className="mb-2 text-6xl">🚬</div>
              <h1 className="bg-gradient-to-r from-amber-300 via-pink-300 to-purple-300 bg-clip-text text-4xl font-black uppercase tracking-tight text-transparent sm:text-5xl">
                Smoke It Up
              </h1>
              <p className="mt-1 text-sm font-bold uppercase tracking-widest text-white/60">
                Fill jars · Survive challenges · Bank the cash
              </p>
            </div>

            <div className="mb-4 grid grid-cols-3 gap-2 text-center text-xs">
              <div className="rounded-xl border border-emerald-400/30 bg-emerald-500/10 p-3">
                <div className="text-lg">💰</div>
                <div className="text-lg font-black tabular-nums text-emerald-300">
                  ${stats.money.toLocaleString()}
                </div>
                <div className="text-[10px] uppercase tracking-widest text-white/50">Saved cash</div>
              </div>
              <div className="rounded-xl border border-amber-400/30 bg-amber-500/10 p-3">
                <div className="text-lg">🏆</div>
                <div className="text-lg font-black tabular-nums text-amber-300">
                  ${stats.highScore.toLocaleString()}
                </div>
                <div className="text-[10px] uppercase tracking-widest text-white/50">High score</div>
              </div>
              <div className="rounded-xl border border-purple-400/30 bg-purple-500/10 p-3">
                <div className="text-lg">🎚</div>
                <div className="text-lg font-black tabular-nums text-purple-300">
                  Level {stats.bestLevel || 1}
                </div>
                <div className="text-[10px] uppercase tracking-widest text-white/50">Best level</div>
              </div>
              <div className="rounded-xl border border-pink-400/30 bg-pink-500/10 p-3">
                <div className="text-lg">🏅</div>
                <div className="text-lg font-black tabular-nums text-pink-300">
                  {achUnlocked}/{achCount}
                </div>
                <div className="text-[10px] uppercase tracking-widest text-white/50">Achievements</div>
              </div>
              <div className="rounded-xl border border-amber-400/30 bg-amber-500/10 p-3">
                <div className="text-lg">⭐</div>
                <div className="text-lg font-black tabular-nums text-amber-300">{stats.goldenStars}</div>
                <div className="text-[10px] uppercase tracking-widest text-white/50">Stars</div>
              </div>
              <div className="rounded-xl border border-orange-400/30 bg-orange-500/10 p-3">
                <div className="text-lg">💥</div>
                <div className="text-lg font-black tabular-nums text-orange-300">{stats.smokeBlasters}</div>
                <div className="text-[10px] uppercase tracking-widest text-white/50">Blasters</div>
              </div>
            </div>

            {stats.scores.length > 0 && (
              <div className="mb-4 rounded-2xl border border-white/10 bg-black/30 p-3">
                <div className="mb-1.5 text-center text-[10px] font-bold uppercase tracking-widest text-white/50">
                  🏅 Top Scores
                </div>
                <div className="space-y-1">
                  {stats.scores.slice(0, 3).map((s, i) => (
                    <div key={i} className="flex items-center justify-between px-2 text-sm">
                      <span className="font-bold text-white/70">
                        {i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉'} #{i + 1}
                      </span>
                      <span className="font-black tabular-nums text-amber-300">${s.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="mb-4 space-y-1.5 rounded-2xl border border-white/10 bg-black/30 p-4 text-sm">
              <div className="flex items-start gap-3">
                <span className="text-lg">💨</span>
                <div>
                  <div className="font-bold text-amber-200">Exhale to fill jars</div>
                  <div className="text-white/60">HOLD SPACE / tap &amp; hold. Fill the quota to level up.</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-lg">⚠️</span>
                <div>
                  <div className="font-bold text-rose-300">Random challenge levels</div>
                  <div className="text-white/60">
                    Storms, flu, blackouts, dud tools… Clear them for huge bonuses.
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-lg">🎲</span>
                <div>
                  <div className="font-bold text-purple-300">Every level is different</div>
                  <div className="text-white/60">
                    Wind, fog, heatwaves, 2X jars, lucky customers, discounts — surprises everywhere.
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-lg">📈</span>
                <div>
                  <div className="font-bold text-purple-300">It gets harder</div>
                  <div className="text-white/60">
                    Bigger jars, faster lung drain, pricier upgrades every 10 levels. No free regen —
                    fruit (1-6) &amp; ⚡ energy (E) only.
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => gameRef.current?.start()}
                className="flex-1 rounded-2xl bg-gradient-to-r from-amber-400 to-pink-500 px-6 py-4 text-lg font-black uppercase tracking-wider text-slate-900 shadow-lg shadow-pink-500/30 transition hover:brightness-110 active:scale-[0.98]"
              >
                ▶ Start
              </button>
              <button
                type="button"
                onClick={() => openShop()}
                className="rounded-2xl border-2 border-emerald-400/60 bg-emerald-500/15 px-5 py-4 text-lg font-black uppercase tracking-wider text-emerald-300 shadow-lg shadow-emerald-500/20 transition hover:bg-emerald-500/25 active:scale-[0.98]"
              >
                🛒 Shop
              </button>
            </div>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setShowAch(true)}
                className="rounded-2xl border border-pink-400/40 bg-pink-500/10 px-4 py-2.5 text-sm font-black uppercase tracking-wider text-pink-300 transition hover:bg-pink-500/20"
              >
                🏅 Achievements ({achUnlocked}/{achCount})
              </button>
              <button
                type="button"
                onClick={() => setShowCloud(true)}
                className="rounded-2xl border border-white/10 bg-black/40 px-4 py-2.5 text-sm font-bold uppercase tracking-wider text-white/70 transition hover:bg-black/60"
              >
                ☁️ Cloud Save
              </button>
              <button
                type="button"
                onClick={() => setShowHelp(true)}
                className="col-span-2 rounded-2xl border border-sky-400/40 bg-sky-500/10 px-4 py-2.5 text-sm font-black uppercase tracking-wider text-sky-200 transition hover:bg-sky-500/20"
              >
                ❓ How to Play?
              </button>
            </div>
            <div className="mt-3 text-center text-[11px] text-white/40">
              1-6 eat fruit • E energy • B blaster • S shop • P pause • R restart
            </div>
          </div>
        </div>
      )}

      {/* ============ HOW TO PLAY ============ */}
      {showHelp && (
        <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="mx-3 flex max-h-[92vh] w-full max-w-2xl flex-col rounded-3xl border border-white/10 bg-gradient-to-b from-slate-900/98 to-[#1a0b2e]/98 shadow-2xl">
            <div className="flex items-center justify-between gap-2 border-b border-white/10 p-4 sm:p-5">
              <div>
                <h2 className="text-2xl font-black uppercase tracking-tight">❓ How to Play</h2>
                <p className="text-xs text-white/50">Mobile-first guide · PC notes at the end</p>
              </div>
              <button
                type="button"
                onClick={() => setShowHelp(false)}
                className="rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 font-bold text-white/70 transition hover:bg-white/15"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 space-y-5 overflow-y-auto p-4 text-sm leading-relaxed text-white/80 sm:p-5">
              <section>
                <h3 className="mb-1.5 text-base font-black uppercase tracking-wide text-amber-300">What is Smoke It Up?</h3>
                <p>
                  You play as a celebrity smoker. <b className="text-white">Hold the screen</b> to blow smoke into jars,
                  sell full jars for cash, and keep your lungs alive. Spend cash on fruit, energy drinks, stronger tools,
                  and famous smokers. Progress saves automatically. Climb levels, beat rare challenges, unlock
                  achievements, earn ⭐ stars, and collect 💥 smoke blasters.
                </p>
                <p className="mt-2 text-white/50">Fiction only — not medical advice. Please don&apos;t smoke in real life.</p>
              </section>

              <section>
                <h3 className="mb-1.5 text-base font-black uppercase tracking-wide text-amber-300">How to play (mobile)</h3>
                <ol className="list-decimal space-y-1.5 pl-5">
                  <li><b className="text-white">Tap &amp; hold</b> anywhere on the game screen to smoke and fill the jar.</li>
                  <li><b className="text-white">Let go</b> to stop smoking. Holding forever will empty your lungs.</li>
                  <li>When the jar hits <b className="text-white">100%</b>, it sells automatically for cash + score.</li>
                  <li>Fill the jar quota on the top bar to <b className="text-purple-300">level up</b>.</li>
                  <li>If <b className="text-rose-300">Lung Health</b> hits 0%, the run ends — your cash &amp; unlocks stay.</li>
                  <li>Use the <b className="text-white">bottom buttons</b> to heal, drink energy, or fire a blaster.</li>
                  <li>Tap <b className="text-white">🛒 Shop</b> (top right) to buy smokers, tools, fruit, and drinks.</li>
                </ol>
              </section>

              <section>
                <h3 className="mb-1.5 text-base font-black uppercase tracking-wide text-amber-300">Mobile controls</h3>
                <div className="overflow-hidden rounded-2xl border border-white/10">
                  <table className="w-full text-left text-xs sm:text-sm">
                    <tbody className="divide-y divide-white/10">
                      <tr className="bg-black/20"><td className="px-3 py-2.5 font-black text-amber-200">Hold screen</td><td className="px-3 py-2.5">Smoke / fill jar</td></tr>
                      <tr><td className="px-3 py-2.5 font-black text-amber-200">Release</td><td className="px-3 py-2.5">Stop smoking</td></tr>
                      <tr className="bg-black/20"><td className="px-3 py-2.5 font-black text-amber-200">🍎–🍍 buttons</td><td className="px-3 py-2.5">Buy &amp; eat fruit (instant heal)</td></tr>
                      <tr><td className="px-3 py-2.5 font-black text-amber-200">⚡ button</td><td className="px-3 py-2.5">Drink energy can</td></tr>
                      <tr className="bg-black/20"><td className="px-3 py-2.5 font-black text-amber-200">💥 button</td><td className="px-3 py-2.5">Smoke Blaster (fill jar instantly)</td></tr>
                      <tr><td className="px-3 py-2.5 font-black text-amber-200">🛒 Shop</td><td className="px-3 py-2.5">Buy smokers, tools, fruit, drinks</td></tr>
                      <tr className="bg-black/20"><td className="px-3 py-2.5 font-black text-amber-200">⏸</td><td className="px-3 py-2.5">Pause</td></tr>
                      <tr><td className="px-3 py-2.5 font-black text-amber-200">❓ Help</td><td className="px-3 py-2.5">This guide</td></tr>
                      <tr className="bg-black/20"><td className="px-3 py-2.5 font-black text-amber-200">🎵 / 🔊</td><td className="px-3 py-2.5">Music &amp; sound toggles</td></tr>
                    </tbody>
                  </table>
                </div>
                <p className="mt-2 text-white/50">Tip: smoke in short bursts. Tap fruit when the HP bar turns yellow/red.</p>
              </section>

              <section>
                <h3 className="mb-1.5 text-base font-black uppercase tracking-wide text-amber-300">Lung Health</h3>
                <ul className="list-disc space-y-1 pl-5">
                  <li>Starts at <b className="text-white">100%</b>. Smoking drains it. Stronger tools &amp; higher levels drain faster.</li>
                  <li>At <b className="text-rose-300">0%</b> the run ends. Cash, unlocks, stars, and blasters are kept.</li>
                  <li>Stop smoking for about <b className="text-white">2 seconds</b> → slow passive regen (~0.4%/sec). Too slow to rely on alone.</li>
                  <li><b className="text-white">Fruits</b> and <b className="text-white">energy drinks</b> are your main heals.</li>
                  <li>Low HP = heartbeat, heavy breathing, red screen, coughing. Heal early.</li>
                </ul>
              </section>

              <section>
                <h3 className="mb-1.5 text-base font-black uppercase tracking-wide text-amber-300">Cash 💰</h3>
                <ul className="list-disc space-y-1 pl-5">
                  <li>Earn cash by filling jars. The $ number above the jar is what you get when it sells.</li>
                  <li><b className="text-white">Cash is saved forever</b> between runs — dying does not wipe your bank.</li>
                  <li>Also earn from level-ups, challenge clears, combo milestones, lucky events, and converting ⭐ stars.</li>
                  <li>Early levels: spend mostly on survival (fruit / energy). Big unlocks take longer saving.</li>
                </ul>
              </section>

              <section>
                <h3 className="mb-1.5 text-base font-black uppercase tracking-wide text-amber-300">Fruits 🍎🍊🫐🍈🥑🍍</h3>
                <p className="mb-2">Bottom bar fruit buttons buy &amp; eat instantly. Also in Shop → Fruit. Can&apos;t use at full HP.</p>
                <ul className="list-disc space-y-1 pl-5">
                  <li><b>Apple</b> — cheapest, best early value</li>
                  <li><b>Orange</b> — cheap mid heal</li>
                  <li><b>Blueberries</b> — solid recovery</li>
                  <li><b>Guava</b> — big heal</li>
                  <li><b>Avocado</b> — near-full heal</li>
                  <li><b>Pineapple</b> — full 100% heal (most expensive)</li>
                </ul>
                <p className="mt-2 text-white/50">Bonus fruit sometimes drops on the counter — rare. Don&apos;t count on it.</p>
              </section>

              <section>
                <h3 className="mb-1.5 text-base font-black uppercase tracking-wide text-amber-300">Energy Drinks ⚡</h3>
                <ul className="list-disc space-y-1 pl-5">
                  <li>Buy cans in Shop → Drinks. Stock is saved between runs.</li>
                  <li>Tap the <b className="text-white">⚡</b> button to drink one.</li>
                  <li>Small instant heal + temporary regen buff (great while you keep playing carefully).</li>
                  <li>Can&apos;t drink at full HP. Stock is limited — manage it.</li>
                </ul>
              </section>

              <section>
                <h3 className="mb-1.5 text-base font-black uppercase tracking-wide text-amber-300">Smoking Tools 💨</h3>
                <p className="mb-2">Shop → Tools (or tap your tool chip). Each tool shows:</p>
                <ul className="list-disc space-y-1 pl-5">
                  <li><b className="text-sky-300">Fill</b> — jar fill speed</li>
                  <li><b className="text-amber-300">$</b> — money multiplier</li>
                  <li><b className="text-rose-300">⚠ Dmg</b> — lung damage</li>
                </ul>
                <p className="mt-2">
                  Free <b>Cigarette</b> is slow and harsh. <b>E-Cig / Pod</b> are safer early picks.
                  <b> Cigar → Hookah → Bong → Blunt</b> earn more and fill faster, but destroy lungs much faster. Blunt is the endgame power tool.
                </p>
              </section>

              <section>
                <h3 className="mb-1.5 text-base font-black uppercase tracking-wide text-amber-300">Characters / Smokers 🎤</h3>
                <ul className="list-disc space-y-1 pl-5">
                  <li>You start with free <b className="text-white">JID</b>.</li>
                  <li>Shop → Smokers to hire legends. Each multiplies jar pay.</li>
                  <li>Top names cost a lot on purpose — long-term goals, not day-one unlocks.</li>
                  <li>Unlocks are permanent. Switch owned smokers anytime from the shop or the smoker chip.</li>
                </ul>
              </section>

              <section>
                <h3 className="mb-1.5 text-base font-black uppercase tracking-wide text-amber-300">Levels</h3>
                <ul className="list-disc space-y-1 pl-5">
                  <li>Top bar shows your level and jar quota (e.g. 2/5 jars).</li>
                  <li>1–10 easy learning, 10–25 tougher, 25–50 hard, 50+ keeps climbing.</li>
                  <li>Higher levels = bigger jars, faster lung drain, higher shop prices.</li>
                  <li>Skies, wind, fog, and heat can change so levels don&apos;t feel identical.</li>
                </ul>
              </section>

              <section>
                <h3 className="mb-1.5 text-base font-black uppercase tracking-wide text-amber-300">Challenge levels ⚠️</h3>
                <p className="mb-2">
                  Sometimes a level becomes a red <b className="text-rose-300">Challenge</b>. Uncommon and random.
                </p>
                <ul className="list-disc space-y-1 pl-5">
                  <li>Examples: giant jars, flu, storm, blackout, dud tools, thin smoke, burning lungs, weak healing, crosswinds, smoke tax, all-nighter</li>
                  <li>Harder but always possible with careful play</li>
                  <li>Clearing one pays a big cash bonus + heal</li>
                </ul>
              </section>

              <section>
                <h3 className="mb-1.5 text-base font-black uppercase tracking-wide text-amber-300">Combos 🔥</h3>
                <ul className="list-disc space-y-1 pl-5">
                  <li>Fill jars back-to-back to grow combo and perfect-chain count.</li>
                  <li>Wait too long and the combo drops.</li>
                  <li>Long perfect chains hit milestones (5 / 10 / 20 / 30) for bonus cash.</li>
                </ul>
              </section>

              <section>
                <h3 className="mb-1.5 text-base font-black uppercase tracking-wide text-amber-300">Surprise events 🎲</h3>
                <ul className="list-disc space-y-1 pl-5">
                  <li><b className="text-white">Good:</b> 2X jar, lucky customer, coin rain, smoke boost, shop discount, mystery reward</li>
                  <li><b className="text-white">Bad (short):</b> wet tool, wind gust, coughing fit</li>
                  <li>Active effects show as chips on the level bar (2X, BOOST, WET, WIND, −20%)</li>
                </ul>
              </section>

              <section>
                <h3 className="mb-1.5 text-base font-black uppercase tracking-wide text-amber-300">Achievements 🏅</h3>
                <ul className="list-disc space-y-1 pl-5">
                  <li>Open from the main menu. Goals for jars, combos, levels, challenges, wealth, and more.</li>
                  <li>Permanent. Unlock toasts pop up when you earn one.</li>
                  <li>Many awards <b className="text-amber-300">⭐ golden stars</b> and sometimes <b className="text-orange-300">💥 smoke blasters</b>.</li>
                </ul>
              </section>

              <section>
                <h3 className="mb-1.5 text-base font-black uppercase tracking-wide text-amber-300">Golden Stars ⭐</h3>
                <ul className="list-disc space-y-1 pl-5">
                  <li>Earned from achievements. Shown next to your cash.</li>
                  <li>In Achievements, convert stars to money: <b className="text-white">1⭐ = ${STAR_TO_CASH}</b> (or Convert All).</li>
                  <li>Perfect when you&apos;re short on a heal or almost able to buy an upgrade.</li>
                </ul>
              </section>

              <section>
                <h3 className="mb-1.5 text-base font-black uppercase tracking-wide text-amber-300">Smoke Blasters 💥</h3>
                <ul className="list-disc space-y-1 pl-5">
                  <li>Rare achievement rewards. Stock is saved forever.</li>
                  <li>Tap the <b className="text-white">💥</b> button on the bottom bar.</li>
                  <li><b className="text-white">Fills the whole jar in one blast</b>, then sells normally (combo still counts).</li>
                  <li>Save for emergencies: low HP, challenge giant jars, or almost finishing a level.</li>
                </ul>
              </section>

              <section>
                <h3 className="mb-1.5 text-base font-black uppercase tracking-wide text-amber-300">Shop 🛒</h3>
                <ul className="list-disc space-y-1 pl-5">
                  <li>Tap Shop on the main menu or top-right during a run.</li>
                  <li>Tabs: Smokers · Tools · Fruit · Drinks</li>
                  <li>Prices can rise with your level. Rare SALE −20% events discount your next buy.</li>
                  <li>Shop pauses smoking so you won&apos;t die while buying.</li>
                </ul>
              </section>

              <section>
                <h3 className="mb-1.5 text-base font-black uppercase tracking-wide text-amber-300">Cloud Save ☁️</h3>
                <ul className="list-disc space-y-1 pl-5">
                  <li>Progress auto-saves (cash, unlocks, scores, stars, blasters, achievements).</li>
                  <li>Menu → Cloud Save → generate a code → copy it → paste on another phone/device to restore.</li>
                  <li>Use this before switching devices or clearing app data.</li>
                </ul>
              </section>

              <section>
                <h3 className="mb-1.5 text-base font-black uppercase tracking-wide text-amber-300">Audio</h3>
                <ul className="list-disc space-y-1 pl-5">
                  <li>Top-right: 🎵 music, 🔊 sound effects.</li>
                  <li>Pause menu has a master volume slider.</li>
                </ul>
              </section>

              <section>
                <h3 className="mb-1.5 text-base font-black uppercase tracking-wide text-amber-300">Quick tips</h3>
                <ul className="list-disc space-y-1 pl-5">
                  <li>Short smoke bursts beat holding forever.</li>
                  <li>Early game: apples + energy first, upgrades later.</li>
                  <li>E-cig is the safe first tool upgrade.</li>
                  <li>Protect combos — milestones pay.</li>
                  <li>On challenges, heal earlier and play safer.</li>
                  <li>Blasters for clutch jars. Stars when cash is tight.</li>
                </ul>
              </section>

              <section>
                <h3 className="mb-1.5 text-base font-black uppercase tracking-wide text-amber-300">FAQ</h3>
                <div className="space-y-3">
                  <div>
                    <div className="font-black text-white">Why did I die so fast?</div>
                    <p>Smoking drains lungs. Stronger tools and higher levels hit harder. Heal, pause for idle regen, or use safer tools.</p>
                  </div>
                  <div>
                    <div className="font-black text-white">Does letting go heal me?</div>
                    <p>A little, after ~2 seconds. Fruits and energy drinks are still the real heals.</p>
                  </div>
                  <div>
                    <div className="font-black text-white">Do I lose money when I die?</div>
                    <p>No. Cash, unlocks, stars, blasters, and achievements stay. Only the current run score ends.</p>
                  </div>
                  <div>
                    <div className="font-black text-white">How do I unlock expensive smokers / the Blunt?</div>
                    <p>Many successful levels, challenges, combos, star conversions, and saving. They&apos;re long-term goals.</p>
                  </div>
                  <div>
                    <div className="font-black text-white">What&apos;s a golden jar?</div>
                    <p>A rare glowing high-value jar worth several times a normal one.</p>
                  </div>
                  <div>
                    <div className="font-black text-white">What does the blaster do?</div>
                    <p>One tap fills the current jar completely. Use the 💥 button.</p>
                  </div>
                  <div>
                    <div className="font-black text-white">I lost my progress</div>
                    <p>Saves are on your device. Use Cloud Save codes before switching phones or clearing data.</p>
                  </div>
                  <div>
                    <div className="font-black text-white">Is this promoting smoking?</div>
                    <p>No — it&apos;s a silly risk/reward arcade fantasy. Real smoking is harmful. Quit IRL.</p>
                  </div>
                </div>
              </section>

              <section className="rounded-2xl border border-sky-400/20 bg-sky-500/10 p-4">
                <h3 className="mb-1.5 text-base font-black uppercase tracking-wide text-sky-200">PC / desktop (short)</h3>
                <p className="mb-2 text-white/70">
                  Same game. Hold <b className="text-white">Space</b> or click-and-hold to smoke. Everything else is buttons too.
                </p>
                <ul className="list-disc space-y-1 pl-5 text-white/70">
                  <li><b className="text-white">1–6</b> fruit · <b className="text-white">E</b> energy · <b className="text-white">B</b> blaster</li>
                  <li><b className="text-white">S</b> shop · <b className="text-white">P / Esc</b> pause · <b className="text-white">R / Enter</b> restart</li>
                  <li>Mouse works on all menus, shop tabs, and HUD buttons</li>
                </ul>
              </section>

              <section className="rounded-2xl border border-white/10 bg-black/30 p-3 text-center text-xs text-white/45">
                Smoke It Up · Fill jars · Hire legends · Stay alive · Bank the cash
              </section>
            </div>

            <div className="border-t border-white/10 p-3">
              <button
                type="button"
                onClick={() => setShowHelp(false)}
                className="w-full rounded-2xl bg-gradient-to-r from-sky-400 to-indigo-500 px-4 py-3 text-sm font-black uppercase tracking-wider text-slate-900 transition hover:brightness-110 active:scale-[0.98]"
              >
                Got it — Let&apos;s Play
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============ ACHIEVEMENTS PANEL ============ */}
      {state === 'menu' && showAch && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/75 backdrop-blur-sm">
          <div className="mx-4 flex max-h-[88vh] w-full max-w-lg flex-col rounded-3xl border border-white/10 bg-slate-900/95 p-5 shadow-2xl">
            <div className="mb-1 flex items-center justify-between">
              <h2 className="text-2xl font-black uppercase tracking-tight">
                🏅 Achievements{' '}
                <span className="text-base text-white/50">
                  {achUnlocked}/{achCount}
                </span>
              </h2>
              <button
                type="button"
                onClick={() => setShowAch(false)}
                className="rounded-lg border border-white/15 bg-white/5 px-2.5 py-1 font-bold text-white/70 transition hover:bg-white/15"
              >
                ✕
              </button>
            </div>
            <div className="mb-3 h-2 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-gradient-to-r from-amber-400 to-pink-500 transition-[width] duration-500"
                style={{ width: `${(achUnlocked / achCount) * 100}%` }}
              />
            </div>
            <div className="mb-3 grid grid-cols-2 gap-2">
              <div className="rounded-2xl border border-amber-400/30 bg-amber-500/10 p-3 text-center">
                <div className="text-lg">⭐ {stats.goldenStars}</div>
                <div className="text-[10px] uppercase tracking-widest text-white/50">Golden Stars</div>
                <div className="mt-2 flex gap-1">
                  <button
                    type="button"
                    disabled={stats.goldenStars < 1}
                    onClick={() => gameRef.current?.convertStars(1)}
                    className="flex-1 rounded-lg bg-amber-400/20 px-2 py-1.5 text-[10px] font-black text-amber-200 transition enabled:hover:bg-amber-400/35 disabled:opacity-40"
                  >
                    1⭐→${STAR_TO_CASH}
                  </button>
                  <button
                    type="button"
                    disabled={stats.goldenStars < 1}
                    onClick={() => gameRef.current?.convertStars(stats.goldenStars)}
                    className="flex-1 rounded-lg bg-amber-400/20 px-2 py-1.5 text-[10px] font-black text-amber-200 transition enabled:hover:bg-amber-400/35 disabled:opacity-40"
                  >
                    Convert All
                  </button>
                </div>
              </div>
              <div className="rounded-2xl border border-orange-400/30 bg-orange-500/10 p-3 text-center">
                <div className="text-lg">💥 {stats.smokeBlasters}</div>
                <div className="text-[10px] uppercase tracking-widest text-white/50">Smoke Blasters</div>
                <div className="mt-2 text-[10px] leading-snug text-white/45">
                  Instantly fill a whole jar. Press <b>B</b> in-run.
                </div>
              </div>
            </div>
            <div className="grid flex-1 auto-rows-min grid-cols-2 gap-2 overflow-y-auto sm:grid-cols-3">
              {ACHIEVEMENTS.map((a) => {
                const got = stats.achievements.includes(a.id);
                return (
                  <div
                    key={a.id}
                    title={a.desc}
                    className={`rounded-2xl border p-2.5 text-center transition ${
                      got
                        ? 'border-amber-400/50 bg-gradient-to-b from-amber-500/20 to-pink-500/10 shadow-[0_0_14px_rgba(251,191,36,0.25)]'
                        : 'border-white/10 bg-black/30 opacity-60'
                    }`}
                  >
                    <div className={`text-2xl ${got ? '' : 'grayscale'}`}>{a.emoji}</div>
                    <div className={`mt-0.5 text-[11px] font-black leading-tight ${got ? 'text-amber-200' : 'text-white/50'}`}>
                      {a.name}
                    </div>
                    <div className="mt-0.5 text-[9px] leading-tight text-white/40">{a.desc}</div>
                    {(a.stars || a.blasters) && (
                      <div className="mt-1 text-[9px] font-black text-amber-300/90">
                        {a.stars ? `+${a.stars}⭐` : ''}
                        {a.stars && a.blasters ? ' · ' : ''}
                        {a.blasters ? `+${a.blasters}💥` : ''}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ============ CLOUD SAVE ============ */}
      {state === 'menu' && showCloud && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/75 backdrop-blur-sm">
          <div className="mx-4 w-full max-w-md rounded-3xl border border-white/10 bg-slate-900/95 p-6 shadow-2xl">
            <div className="mb-1 flex items-center justify-between">
              <h2 className="text-2xl font-black uppercase tracking-tight">☁️ Cloud Save</h2>
              <button
                type="button"
                onClick={() => {
                  setShowCloud(false);
                  setCloudMsg('');
                }}
                className="rounded-lg border border-white/15 bg-white/5 px-2.5 py-1 font-bold text-white/70 transition hover:bg-white/15"
              >
                ✕
              </button>
            </div>
            <p className="mb-4 text-xs text-white/50">
              Your progress is a <b>Cloud Code</b>. Generate it here, then paste it on any other device
              to restore your bank, unlocks, achievements, high scores and cans instantly.
            </p>

            <button
              type="button"
              onClick={genCloudCode}
              className="w-full rounded-2xl bg-gradient-to-r from-sky-400 to-indigo-500 px-4 py-3 text-sm font-black uppercase tracking-wider text-slate-900 transition hover:brightness-110 active:scale-[0.98]"
            >
              📤 Generate My Cloud Code
            </button>

            {generatedCode && (
              <div className="mt-3">
                <textarea
                  readOnly
                  value={generatedCode}
                  rows={3}
                  className="w-full resize-none rounded-xl border border-white/15 bg-black/50 p-2 font-mono text-[11px] text-emerald-300 outline-none"
                />
                <button
                  type="button"
                  onClick={copyCloud}
                  className="mt-1 w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-xs font-bold text-white/70 transition hover:bg-white/15"
                >
                  📋 Copy Code
                </button>
              </div>
            )}

            <div className="my-4 border-t border-white/10" />

            <textarea
              value={inputCode}
              onChange={(e) => setInputCode(e.target.value)}
              rows={3}
              placeholder="Paste a Cloud Code here…"
              className="w-full resize-none rounded-xl border border-white/15 bg-black/50 p-2 font-mono text-[11px] text-white outline-none placeholder:text-white/30"
            />
            <button
              type="button"
              onClick={restoreCloud}
              className="mt-2 w-full rounded-2xl bg-gradient-to-r from-emerald-400 to-teal-500 px-4 py-3 text-sm font-black uppercase tracking-wider text-slate-900 transition hover:brightness-110 active:scale-[0.98]"
            >
              📥 Restore Progress
            </button>

            {cloudMsg && <p className="mt-2 text-center text-xs font-bold text-white/70">{cloudMsg}</p>}
          </div>
        </div>
      )}

      {/* ============ PAUSE ============ */}
      {state === 'paused' && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="mx-4 w-full max-w-sm rounded-3xl border border-white/10 bg-slate-900/90 p-6 text-center shadow-2xl sm:p-8">
            <div className="mb-2 text-5xl">⏸</div>
            <h2 className="mb-4 text-3xl font-black uppercase tracking-tight">Paused</h2>
            <div className="mb-5 grid grid-cols-2 gap-3 text-left text-sm">
              <StatBox label="Level" value={String(stats.level)} />
              <StatBox label="Score" value={`$${stats.score.toLocaleString()}`} />
              <StatBox label="Cash (saved)" value={`$${stats.money.toLocaleString()}`} />
              <StatBox label="⚡ Cans" value={String(stats.drinkStock)} />
              <StatBox label="⭐ Stars" value={String(stats.goldenStars)} />
              <StatBox label="💥 Blasters" value={String(stats.smokeBlasters)} />
            </div>
            <div className="mb-4 space-y-2">
              <div className="flex flex-wrap justify-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowHelp(true)}
                  className="rounded-xl border border-sky-400/40 bg-sky-500/20 px-3 py-2 text-sm font-black text-sky-100 transition active:scale-90"
                >
                  ❓ How to Play
                </button>
                <button
                  type="button"
                  onClick={toggleMusic}
                  className={`rounded-xl border px-3 py-2 text-sm transition active:scale-90 ${
                    musicOn ? 'border-emerald-400/40 bg-emerald-500/20' : 'border-white/10 bg-black/40'
                  }`}
                >
                  {musicOn ? '🎵 Music On' : '🔇 Music Off'}
                </button>
                <button
                  type="button"
                  onClick={toggleSfx}
                  className={`rounded-xl border px-3 py-2 text-sm transition active:scale-90 ${
                    sfxOn ? 'border-emerald-400/40 bg-emerald-500/20' : 'border-white/10 bg-black/40'
                  }`}
                >
                  {sfxOn ? '🔊 SFX On' : '🔈 SFX Off'}
                </button>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-xs font-black uppercase tracking-widest text-white/50">Volume</span>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={masterVol}
                  onChange={(e) => changeVolume(Number(e.target.value))}
                  className="flex-1 accent-emerald-400"
                />
                <span className="w-8 text-right text-xs font-black tabular-nums text-white/70">{masterVol}</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => gameRef.current?.resume()}
              className="w-full rounded-2xl bg-gradient-to-r from-emerald-400 to-teal-500 px-6 py-3 text-base font-black uppercase tracking-wider text-slate-900 shadow-lg shadow-emerald-500/30 transition hover:brightness-110 active:scale-[0.98]"
            >
              ▶ Resume
            </button>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => gameRef.current?.restart()}
                className="rounded-2xl border border-white/10 bg-black/40 px-4 py-2.5 text-sm font-bold uppercase tracking-wider text-white/70 transition hover:bg-black/60"
              >
                🔄 Restart
              </button>
              <button
                type="button"
                onClick={() => gameRef.current?.toMenu()}
                className="rounded-2xl border border-white/10 bg-black/40 px-4 py-2.5 text-sm font-bold uppercase tracking-wider text-white/70 transition hover:bg-black/60"
              >
                🏠 Menu
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============ GAME OVER ============ */}
      {state === 'gameover' && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/75 backdrop-blur-sm">
          <div className="mx-4 w-full max-w-sm rounded-3xl border border-rose-500/30 bg-gradient-to-br from-rose-950/90 via-slate-900/90 to-slate-950/90 p-6 text-center shadow-2xl sm:p-8">
            <div className="mb-2 text-5xl">💀</div>
            <h2 className="mb-1 bg-gradient-to-r from-rose-300 to-amber-300 bg-clip-text text-3xl font-black uppercase tracking-tight text-transparent sm:text-4xl">
              Lungs Gave Out
            </h2>
            <p className="mb-4 text-sm text-white/50">
              You reached <span className="font-black text-purple-300">Level {stats.level}</span> as{' '}
              <span className="font-bold text-white/80">{curChar.name}</span>.
            </p>

            <div className="mb-3 space-y-2">
              <div className="rounded-2xl border border-amber-400/30 bg-amber-500/10 p-3">
                <div className="text-[10px] font-bold uppercase tracking-widest text-amber-200">Run Score</div>
                <div className="text-3xl font-black tabular-nums text-amber-300">
                  ${stats.score.toLocaleString()}
                </div>
              </div>
              <div className="rounded-2xl border border-emerald-400/30 bg-emerald-500/10 p-3">
                <div className="text-[10px] font-bold uppercase tracking-widest text-emerald-200">
                  Banked (kept forever)
                </div>
                <div className="text-2xl font-black tabular-nums text-emerald-300">
                  💰 ${stats.money.toLocaleString()}
                </div>
              </div>

              {stats.score >= stats.highScore && stats.score > 0 && (
                <div className="rounded-xl border border-pink-400/40 bg-pink-500/20 px-3 py-2 text-sm font-bold text-pink-200 shadow-[0_0_12px_rgba(236,72,153,0.4)]">
                  🏆 NEW HIGH SCORE!
                </div>
              )}

              <div className="grid grid-cols-4 gap-1.5 text-[11px]">
                <MiniStat label="Jars" value={String(stats.containersFilled)} />
                <MiniStat label="⭐ Gold" value={String(stats.goldenFilled)} />
                <MiniStat label="⚡ Drinks" value={String(stats.energyDrinksUsed)} />
                <MiniStat label="Combo" value={`x${stats.bestCombo.toFixed(1)}`} />
              </div>
            </div>

            {stats.scores.length > 0 && (
              <div className="mb-3 rounded-xl border border-white/10 bg-black/30 p-2.5">
                <div className="mb-1 text-[9px] font-bold uppercase tracking-widest text-white/40">
                  🏅 Top Scores
                </div>
                <div className="space-y-0.5">
                  {stats.scores.slice(0, 3).map((s, i) => (
                    <div
                      key={i}
                      className={`flex items-center justify-between px-2 text-xs ${
                        s === stats.score ? 'text-amber-300' : 'text-white/50'
                      }`}
                    >
                      <span className="font-bold">{i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉'} #{i + 1}</span>
                      <span className="font-black tabular-nums">${s.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={() => gameRef.current?.restart()}
              className="w-full rounded-2xl bg-gradient-to-r from-amber-400 to-pink-500 px-6 py-3.5 text-base font-black uppercase tracking-wider text-slate-900 shadow-lg shadow-pink-500/30 transition hover:brightness-110 active:scale-[0.98]"
            >
              🔄 Try Again
            </button>
            <button
              type="button"
              onClick={() => gameRef.current?.toMenu()}
              className="mt-2 w-full rounded-2xl border border-white/10 bg-black/40 px-6 py-2 text-sm font-bold uppercase tracking-wider text-white/70 transition hover:bg-black/60"
            >
              🏠 Menu
            </button>
            <div className="mt-3 text-center text-[11px] text-white/40">Press ENTER or R to restart</div>
          </div>
        </div>
      )}

      <div className="pointer-events-none absolute bottom-2 right-3 z-10 text-[10px] font-bold uppercase tracking-widest text-white/25">
        Not medical advice · Quit IRL
      </div>
    </div>
  );
}

function ShopTabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex-1 rounded-xl px-3 py-2 text-sm font-black uppercase tracking-wide transition active:scale-95 ${
        active
          ? 'bg-gradient-to-r from-amber-400/80 to-pink-500/80 text-slate-900'
          : 'border border-white/10 bg-white/5 text-white/60 hover:bg-white/10'
      }`}
    >
      {children}
    </button>
  );
}

function CharacterRow({
  char,
  owned,
  selected,
  money,
  costMult,
  onAction,
}: {
  char: CharacterDef;
  owned: boolean;
  selected: boolean;
  money: number;
  costMult: number;
  onAction: () => void;
}) {
  const price = Math.round(char.cost * costMult);
  const affordable = money >= price;
  return (
    <div
      className={`flex items-center gap-3 rounded-2xl border p-3 transition ${
        selected ? 'border-amber-400/60 bg-amber-500/10' : 'border-white/10 bg-black/30'
      }`}
    >
      <span className="text-3xl">{char.emoji}</span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="font-black">{char.name}</span>
          <span className="rounded-md bg-amber-400/15 px-1.5 py-0.5 text-[10px] font-black text-amber-300">
            x{char.mult.toFixed(1)} pay
          </span>
        </div>
        <div className="text-[11px] text-white/40">{char.blurb}</div>
      </div>
      <button
        type="button"
        onClick={onAction}
        disabled={!owned && !affordable}
        className={`rounded-xl px-3.5 py-2 text-sm font-black transition active:scale-95 ${
          selected
            ? 'border border-amber-400/50 bg-amber-400/20 text-amber-200'
            : owned || affordable
              ? 'bg-gradient-to-r from-amber-400 to-pink-500 text-slate-900 shadow-lg shadow-pink-500/25 hover:brightness-110'
              : 'border border-white/10 bg-white/5 text-white/40'
        }`}
      >
        {selected ? 'Using ✓' : owned ? 'Use' : `$${price.toLocaleString()}`}
      </button>
    </div>
  );
}

function ToolRow({
  tool,
  owned,
  selected,
  money,
  costMult,
  onAction,
}: {
  tool: ToolDef;
  owned: boolean;
  selected: boolean;
  money: number;
  costMult: number;
  onAction: () => void;
}) {
  const price = Math.round(tool.cost * costMult);
  const affordable = money >= price;
  const riskColor = tool.drain >= 2.5 ? 'text-rose-300' : tool.drain >= 1.3 ? 'text-orange-300' : 'text-emerald-300';
  return (
    <div
      className={`flex items-center gap-3 rounded-2xl border p-3 transition ${
        selected ? 'border-sky-400/60 bg-sky-500/10' : 'border-white/10 bg-black/30'
      }`}
    >
      <span className="text-3xl">{tool.emoji}</span>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="font-black">{tool.name}</span>
          <span className="rounded-md bg-sky-400/15 px-1.5 py-0.5 text-[10px] font-black text-sky-300">
            {tool.fill.toFixed(2)}x fill
          </span>
          <span className="rounded-md bg-amber-400/15 px-1.5 py-0.5 text-[10px] font-black text-amber-300">
            {tool.earn.toFixed(2)}x $
          </span>
          <span className={`rounded-md bg-black/40 px-1.5 py-0.5 text-[10px] font-black ${riskColor}`}>
            ⚠ {tool.drain.toFixed(2)}x dmg
          </span>
        </div>
        <div className="text-[11px] text-white/40">{tool.blurb}</div>
      </div>
      <button
        type="button"
        onClick={onAction}
        disabled={!owned && !affordable}
        className={`rounded-xl px-3.5 py-2 text-sm font-black transition active:scale-95 ${
          selected
            ? 'border border-sky-400/50 bg-sky-400/20 text-sky-200'
            : owned || affordable
              ? 'bg-gradient-to-r from-sky-400 to-indigo-500 text-slate-900 shadow-lg shadow-sky-500/25 hover:brightness-110'
              : 'border border-white/10 bg-white/5 text-white/40'
        }`}
      >
        {selected ? 'Using ✓' : owned ? 'Use' : `$${price.toLocaleString()}`}
      </button>
    </div>
  );
}

function FruitRow({
  fruit,
  money,
  health,
  onBuy,
}: {
  fruit: FruitDef;
  money: number;
  health: number;
  onBuy: () => void;
}) {
  const affordable = money >= fruit.cost;
  const full = health >= 100;
  const heal = Math.min(fruit.heal, 100 - health);
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/30 p-3">
      <span className="text-3xl">{fruit.emoji}</span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="font-black">{fruit.name}</span>
          <span className="rounded-md bg-emerald-400/15 px-1.5 py-0.5 text-[10px] font-black text-emerald-300">
            +{heal} HP
          </span>
        </div>
        <div className="text-[11px] text-white/40">{fruit.blurb}</div>
      </div>
      <button
        type="button"
        onClick={onBuy}
        disabled={!affordable || full}
        className={`rounded-xl px-3.5 py-2 text-sm font-black tabular-nums transition active:scale-95 ${
          full
            ? 'border border-white/10 bg-white/5 text-white/30'
            : affordable
              ? 'bg-gradient-to-r from-emerald-400 to-teal-500 text-slate-900 shadow-lg shadow-emerald-500/25 hover:brightness-110'
              : 'border border-white/10 bg-white/5 text-white/40'
        }`}
      >
        {full ? 'Full' : `$${fruit.cost}`}
      </button>
    </div>
  );
}

function StatBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-black/40 p-3">
      <div className="text-[10px] uppercase text-white/50">{label}</div>
      <div className="text-lg font-black">{value}</div>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-white/10 bg-black/30 p-1.5">
      <div className="text-[9px] uppercase text-white/40">{label}</div>
      <div className="font-black">{value}</div>
    </div>
  );
}

function LungIcon({ color, pulse }: { color: string; pulse: boolean }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      className={pulse ? 'animate-pulse' : ''}
      style={{ color }}
    >
      <path
        d="M12 3v10M12 3c-1 0-2 1-2 2v4c-3 0-6 2-6 6 0 4 3 6 6 6 1 0 2-1 2-2M12 3c1 0 2 1 2 2v4c3 0 6 2 6 6 0 4-3 6-6 6-1 0-2-1-2-2"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="currentColor"
        fillOpacity="0.25"
      />
    </svg>
  );
}
