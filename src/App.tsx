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
  GAME_MODES,
  GLOBAL_TOOL_DAMAGE_MULT,
  GLOBAL_EARNINGS_MULT,
  type GameState,
  type GameStats,
  type CharacterDef,
  type ToolDef,
  type FruitDef,
  type AchievementDef,
  type GameMode,
} from './game/Game';
import { AudioManager } from './game/Audio';
import {
  PlayIcon,
  PauseIcon,
  RotateCcwIcon,
  HomeIcon,
  SettingsIcon,
  HelpIcon,
  CloudIcon,
  ShopIcon,
  LevelIcon,
  MoneyIcon,
  TrophyIcon,
  AwardIcon,
  StarIcon,
  BlasterIcon,
  ZapIcon,
  FlameIcon,
  SmokeIcon,
  ShieldIcon,
  AlertTriangleIcon,
  VolumeOnIcon,
  VolumeOffIcon,
  MusicIcon,
  ScaleIcon,
  AppleIcon,
  MicIcon,
  LungsIcon,
  FruitIconRenderer,
  ToolIconRenderer,
  CharacterIconRenderer,
  ChallengeIconRenderer,
  AchievementIconRenderer,
} from './components/Icons';

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
  gameMode: 'classic',
  isPassiveRecovering: false,
  hasActiveRun: false,
  activeRunLevel: 1,
  activeRunScore: 0,
  activeRunMode: 'classic',
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
  const [showLevels, setShowLevels] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [selectedMode, setSelectedMode] = useState<GameMode>('classic');
  const [confirmModal, setConfirmModal] = useState<{
    title: string;
    message: string;
    confirmText: string;
    cancelText?: string;
    isDestructive?: boolean;
    onConfirm: () => void;
  } | null>(null);
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
        <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex items-start justify-between gap-2 p-2.5 sm:p-5">
          <div className="flex flex-col gap-1.5 sm:gap-2">
            {/* Level chip */}
            <div className="rounded-2xl border border-white/10 bg-black/40 px-2.5 py-1.5 backdrop-blur-md sm:px-4 sm:py-2">
              <div className="mb-1 flex items-center gap-1.5 sm:gap-2 flex-wrap max-w-[220px] sm:max-w-none">
                {stats.inChallenge ? (
                  <span className="flex items-center gap-1 animate-pulse text-[11px] sm:text-xs font-black uppercase tracking-widest text-rose-300">
                    <AlertTriangleIcon className="w-3 h-3 text-rose-400" /> CHAL {stats.level}
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-[11px] sm:text-xs font-black uppercase tracking-widest text-amber-300">
                    <LevelIcon className="w-3 h-3 text-amber-300" /> Lv {stats.level}
                  </span>
                )}
                {/* Mode Badge */}
                <span
                  className={`rounded px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider ${
                    stats.gameMode === 'relaxed'
                      ? 'border border-teal-400/40 bg-teal-500/20 text-teal-300'
                      : stats.gameMode === 'rush'
                        ? 'border border-amber-400/40 bg-amber-500/20 text-amber-300'
                        : 'border border-indigo-400/40 bg-indigo-500/20 text-indigo-300'
                  }`}
                >
                  {GAME_MODES[stats.gameMode]?.name || 'Classic'}
                </span>
                {activeMods.map((m) => (
                  <span key={m.id} title={m.name + ' — ' + m.desc} className="flex items-center">
                    <ChallengeIconRenderer icon={m.icon} className="w-3.5 h-3.5 text-amber-300" />
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
                  {stats.jarsThisLevel}/{stats.levelQuota}
                </span>
              </div>
              <div className="relative h-2 sm:h-2.5 w-36 sm:w-48 md:w-64 overflow-hidden rounded-full bg-white/10">
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
            <div className="rounded-2xl border border-white/10 bg-black/40 px-2.5 py-1.5 backdrop-blur-md sm:px-4 sm:py-2">
              <div className="mb-1 flex items-center gap-1.5 sm:gap-2">
                <div style={{ color: healthColor }}>
                  <LungsIcon className="w-4 h-4" pulse={lowHealth} />
                </div>
                <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-white/70">
                  Lungs
                </span>
                {stats.isPassiveRecovering && (
                  <span className="flex items-center gap-1 animate-pulse rounded bg-emerald-400/25 px-1.5 py-0.5 text-[9px] sm:text-[10px] font-black text-emerald-300 border border-emerald-400/40">
                    <ShieldIcon className="w-3 h-3 text-emerald-300" /> Recovering
                  </span>
                )}
                {stats.regenBuff > 0 && (
                  <span className="flex items-center gap-0.5 animate-pulse rounded bg-cyan-400/20 px-1.5 py-0.5 text-[9px] sm:text-[10px] font-black text-cyan-300">
                    <ZapIcon className="w-3 h-3 text-cyan-300" /> REGEN
                  </span>
                )}
                <span className="ml-auto text-xs sm:text-sm font-bold tabular-nums" style={{ color: healthColor }}>
                  {Math.round(healthPct)}%
                </span>
              </div>
              <div className="relative h-2.5 sm:h-3 w-36 sm:w-48 md:w-64 overflow-hidden rounded-full bg-white/10">
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
            <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-black/40 px-2.5 py-1 backdrop-blur-md sm:px-4 sm:py-1.5">
              <MoneyIcon className="w-4 h-4 text-emerald-400" />
              <div className="leading-tight">
                <div className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-white/60">
                  Cash <span className="text-emerald-300/80">(saved)</span>
                </div>
                <div className="text-xs sm:text-sm font-black tabular-nums text-emerald-300">
                  ${stats.money.toLocaleString()}
                </div>
              </div>
              {stats.goldenStars > 0 && (
                <div className="ml-2 flex items-center gap-1 border-l border-white/10 pl-2 text-xs font-bold text-amber-300">
                  <StarIcon className="w-3.5 h-3.5 text-amber-400" /> {stats.goldenStars}
                </div>
              )}
            </div>

            {/* Score + combo */}
            <div className="flex items-center gap-2">
              <div className="rounded-xl border border-white/10 bg-black/40 px-2.5 py-1 text-left backdrop-blur-md sm:px-3 sm:py-1.5">
                <div className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-white/60">Run Score</div>
                <div className="text-xs sm:text-base font-black tabular-nums text-amber-300">
                  ${stats.score.toLocaleString()}
                </div>
              </div>
              {stats.combo > 1.05 && (
                <div
                  className="rounded-xl border px-2 py-0.5 text-center backdrop-blur-md sm:px-2.5 sm:py-1"
                  style={{
                    background: 'linear-gradient(135deg, rgba(236,72,153,0.4), rgba(168,85,247,0.4))',
                    borderColor: 'rgba(236,72,153,0.6)',
                    boxShadow: '0 0 16px rgba(236,72,153,0.5)',
                    transform: `scale(${1 + Math.min(0.2, (stats.combo - 1) * 0.1)})`,
                    transition: 'transform 120ms',
                  }}
                >
                  <div className="text-[8px] sm:text-[10px] font-bold uppercase tracking-widest text-pink-200">Combo</div>
                  <div className="text-xs sm:text-base font-black tabular-nums text-pink-100">
                    x{stats.combo.toFixed(1)}
                  </div>
                  {stats.perfectChain >= 2 && (
                    <div className="flex items-center justify-center gap-0.5 text-center text-[8px] sm:text-[9px] font-black text-amber-300">
                      <FlameIcon className="w-2.5 h-2.5 text-amber-400" /> {stats.perfectChain}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right controls */}
          <div className="pointer-events-auto flex flex-col items-end gap-1.5 sm:gap-2">
            <div className="flex gap-1 sm:gap-1.5">
              <button
                type="button"
                onClick={() => setShowHelp(true)}
                onTouchStart={(e) => e.stopPropagation()}
                title="How to Play"
                className="flex items-center gap-1 rounded-xl border border-sky-400/40 bg-sky-500/20 px-2 py-1 sm:px-2.5 sm:py-1.5 text-xs font-black uppercase tracking-wide text-sky-100 backdrop-blur-md transition hover:bg-sky-500/30 active:scale-90"
              >
                <HelpIcon className="w-3.5 h-3.5 text-sky-300" />
                <span className="hidden sm:inline">Help</span>
              </button>
              <button
                type="button"
                onClick={toggleMusic}
                onTouchStart={(e) => e.stopPropagation()}
                title="Music"
                className={`rounded-xl border px-2 py-1 sm:px-2.5 sm:py-1.5 text-xs sm:text-sm backdrop-blur-md transition active:scale-90 ${
                  musicOn ? 'border-emerald-400/40 bg-emerald-500/20 text-emerald-300' : 'border-white/10 bg-black/40 opacity-60 text-white/50'
                }`}
              >
                {musicOn ? <MusicIcon className="w-3.5 h-3.5" /> : <VolumeOffIcon className="w-3.5 h-3.5" />}
              </button>
              <button
                type="button"
                onClick={toggleSfx}
                onTouchStart={(e) => e.stopPropagation()}
                title="Sound effects"
                className={`rounded-xl border px-2 py-1 sm:px-2.5 sm:py-1.5 text-xs sm:text-sm backdrop-blur-md transition active:scale-90 ${
                  sfxOn ? 'border-emerald-400/40 bg-emerald-500/20 text-emerald-300' : 'border-white/10 bg-black/40 opacity-60 text-white/50'
                }`}
              >
                {sfxOn ? <VolumeOnIcon className="w-3.5 h-3.5" /> : <VolumeOffIcon className="w-3.5 h-3.5" />}
              </button>
            </div>
            <button
              type="button"
              onClick={() => openShop()}
              onTouchStart={(e) => e.stopPropagation()}
              className="group relative flex items-center gap-1.5 sm:gap-2 rounded-2xl bg-gradient-to-r from-amber-400 to-pink-500 px-3 py-2 sm:px-4 sm:py-2.5 font-black uppercase tracking-wider text-slate-900 shadow-lg shadow-pink-500/30 transition hover:brightness-110 active:scale-95"
            >
              <ShopIcon className="w-4 h-4 text-slate-900" />
              <span className="text-xs sm:text-sm">Shop</span>
              <kbd className="hidden rounded border border-slate-900/30 bg-black/10 px-1 text-[10px] font-mono sm:inline">S</kbd>
            </button>

            <button
              type="button"
              onClick={() => gameRef.current?.pause()}
              onTouchStart={(e) => e.stopPropagation()}
              className="flex items-center gap-1 rounded-xl border border-white/10 bg-black/40 px-3 py-1 sm:px-3 sm:py-1.5 text-xs font-bold uppercase tracking-widest text-white/70 backdrop-blur-md transition hover:bg-black/60"
            >
              <PauseIcon className="w-3 h-3" />
              <span>Pause</span>
            </button>

            <div className="rounded-xl border border-white/10 bg-black/40 px-2.5 py-1 text-right backdrop-blur-md sm:px-3 sm:py-1.5">
              <div className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-white/60">High</div>
              <div className="text-xs sm:text-sm font-black tabular-nums text-amber-200">{stats.highScore.toLocaleString()}</div>
            </div>
          </div>
        </div>
      )}

      {/* ============ Bottom: quick fruit bar + loadout chips ============ */}
      {inRun && !shopOpen && (
        <div className="pointer-events-none absolute inset-x-0 bottom-2 z-10 flex flex-col items-center gap-1.5 px-1.5 sm:px-3">
          <div className="pointer-events-auto flex w-full max-w-xl gap-1 sm:gap-1.5 overflow-x-auto rounded-2xl border border-white/10 bg-black/50 p-1 sm:p-1.5 backdrop-blur-md custom-scrollbar">
            {FRUITS.map((f, i) => {
              const affordable = stats.money >= f.cost;
              return (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => gameRef.current?.eatFruit(i)}
                  onTouchStart={(e) => e.stopPropagation()}
                  disabled={!affordable || fullHealth}
                  className={`flex min-w-[40px] sm:min-w-[56px] flex-1 flex-col items-center rounded-xl px-0.5 sm:px-1 py-1 sm:py-1.5 transition active:scale-90 ${
                    fullHealth
                      ? 'bg-white/5 text-white/30'
                      : affordable
                        ? 'bg-gradient-to-b from-emerald-500/30 to-emerald-600/10 hover:from-emerald-500/45'
                        : 'bg-white/5 text-white/35'
                  }`}
                >
                  <div className={`p-0.5 ${fullHealth ? 'grayscale opacity-40' : ''}`}>
                    <FruitIconRenderer icon={f.icon} className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <span className="text-[8px] sm:text-[9px] font-black tabular-nums text-yellow-300">
                    {fullHealth ? 'FULL' : `$${f.cost}`}
                  </span>
                </button>
              );
            })}
            <button
              type="button"
              onClick={() => gameRef.current?.drinkEnergy()}
              onTouchStart={(e) => e.stopPropagation()}
              disabled={fullHealth || stats.drinkStock <= 0}
              className={`flex min-w-[40px] sm:min-w-[56px] flex-1 flex-col items-center rounded-xl px-0.5 sm:px-1 py-1 sm:py-1.5 transition active:scale-90 ${
                fullHealth || stats.drinkStock <= 0
                  ? 'bg-white/5 text-white/35'
                  : 'bg-gradient-to-b from-cyan-500/30 to-cyan-600/10 hover:from-cyan-500/45'
              }`}
            >
              <div className={`p-0.5 ${fullHealth || stats.drinkStock <= 0 ? 'grayscale opacity-40' : ''}`}>
                <ZapIcon className="w-5 h-5 sm:w-6 sm:h-6 text-cyan-300" />
              </div>
              <span className="text-[8px] sm:text-[9px] font-black tabular-nums text-cyan-300">×{stats.drinkStock}</span>
            </button>
            <button
              type="button"
              onClick={() => gameRef.current?.useBlaster()}
              onTouchStart={(e) => e.stopPropagation()}
              disabled={stats.smokeBlasters <= 0}
              className={`flex min-w-[40px] sm:min-w-[56px] flex-1 flex-col items-center rounded-xl px-0.5 sm:px-1 py-1 sm:py-1.5 transition active:scale-90 ${
                stats.smokeBlasters <= 0
                  ? 'bg-white/5 text-white/35'
                  : 'bg-gradient-to-b from-orange-500/35 to-red-600/15 hover:from-orange-500/50 shadow-[0_0_12px_rgba(249,115,22,0.35)]'
              }`}
              title="Smoke Blaster — fills the whole jar instantly (B)"
            >
              <div className={`p-0.5 ${stats.smokeBlasters <= 0 ? 'grayscale opacity-40' : ''}`}>
                <BlasterIcon className="w-5 h-5 sm:w-6 sm:h-6 text-orange-400" />
              </div>
              <span className="text-[8px] sm:text-[9px] font-black tabular-nums text-orange-300">×{stats.smokeBlasters}</span>
            </button>
          </div>

          <div className="pointer-events-auto hidden w-full max-w-xl items-center justify-between gap-2 sm:flex">
            <div className="flex gap-1.5">
              <button
                type="button"
                onClick={() => openShop('smokers')}
                className="flex items-center gap-2 rounded-xl border border-white/10 bg-black/50 px-3 py-1.5 backdrop-blur-md transition hover:bg-black/70 active:scale-95"
              >
                <CharacterIconRenderer icon={curChar.icon} className="w-4 h-4 text-amber-300" />
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
                <ToolIconRenderer icon={curTool.icon} className="w-4 h-4 text-sky-300" />
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
              <kbd className="rounded border border-white/15 bg-black/40 px-1 font-mono">1-5</kbd> fruit ·{' '}
              <kbd className="rounded border border-white/15 bg-black/40 px-1 font-mono">E</kbd> energy ·{' '}
              <kbd className="rounded border border-white/15 bg-black/40 px-1 font-mono">B</kbd> blaster
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
            <span className="text-emerald-300 font-bold">Eat fruit to heal</span>
            <span className="mx-2 text-white/30">•</span>
            <span className="text-cyan-300 font-bold">Drink to regen</span>
          </div>
        </div>
      )}

      {/* ============ SHOP (menu + in-run + pause) ============ */}
      {shopOpen && (
        <div
          className="absolute inset-0 z-40 flex items-end justify-center bg-black/60 backdrop-blur-sm sm:items-center"
          onClick={closeShop}
          onTouchStart={(e) => e.stopPropagation()}
        >
          <div
            className="flex max-h-[92vh] w-full max-w-lg flex-col rounded-t-3xl border border-white/10 bg-gradient-to-b from-slate-900/95 to-[#1a0b2e]/95 shadow-2xl sm:rounded-3xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-2 border-b border-white/10 p-4">
              <div className="flex items-center gap-2">
                <ShopIcon className="w-5 h-5 text-amber-300" />
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
                <span className="flex items-center gap-1 rounded-lg bg-emerald-500/15 px-2.5 py-1 font-black tabular-nums text-emerald-300">
                  <MoneyIcon className="w-3.5 h-3.5 text-emerald-400" /> ${stats.money.toLocaleString()}
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
                <span className="flex items-center justify-center gap-1.5"><MicIcon className="w-3.5 h-3.5" /> Smokers</span>
              </ShopTabButton>
              <ShopTabButton active={shopTab === 'tools'} onClick={() => setShopTab('tools')}>
                <span className="flex items-center justify-center gap-1.5"><FlameIcon className="w-3.5 h-3.5" /> Tools</span>
              </ShopTabButton>
              <ShopTabButton active={shopTab === 'fruit'} onClick={() => setShopTab('fruit')}>
                <span className="flex items-center justify-center gap-1.5"><AppleIcon className="w-3.5 h-3.5" /> Fruit</span>
              </ShopTabButton>
              <ShopTabButton active={shopTab === 'drinks'} onClick={() => setShopTab('drinks')}>
                <span className="flex items-center justify-center gap-1.5"><ZapIcon className="w-3.5 h-3.5" /> Drinks</span>
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
                    Fast tools fill jars quicker — but damage burns your lungs. All tools feature an
                    improved 10% damage reduction!
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
                    Cheap fruit = quick top-ups. Avocado is the full-health recovery item that restores lung health to
                    exactly 100% HP from any health level.
                  </p>
                </div>
              )}

              {shopTab === 'drinks' && (
                <div className="space-y-2">
                  <div className="flex items-center gap-3 rounded-2xl border border-cyan-400/20 bg-black/30 p-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-cyan-400/30 bg-cyan-500/10">
                      <ZapIcon className="w-7 h-7 text-cyan-300" />
                    </div>
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

      {/* ============ START MENU (ZERO SCROLL, FULL SCREEN FIT) ============ */}
      {state === 'menu' && !shopOpen && !showCloud && !showAch && !showHelp && !showLevels && !showSettings && (
        <div
          className="absolute inset-0 z-20 flex items-center justify-center bg-black/65 backdrop-blur-md p-2.5 sm:p-4"
          onTouchStart={(e) => e.stopPropagation()}
        >
          <div className="relative flex h-full max-h-[100dvh] w-full max-w-md flex-col justify-between overflow-hidden rounded-3xl border border-white/15 bg-gradient-to-b from-slate-900/95 via-[#160d29]/95 to-slate-950/95 p-3 sm:p-4 text-center shadow-2xl">
            {/* Header: Title + Tagline */}
            <div className="flex flex-col items-center">
              <div className="mb-1 flex items-center justify-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl border border-amber-400/40 bg-amber-400/10 shadow-[0_0_12px_rgba(251,191,36,0.3)]">
                  <FlameIcon className="w-4 h-4 text-amber-300" />
                </div>
                <div className="flex h-8 w-8 items-center justify-center rounded-xl border border-purple-400/40 bg-purple-400/10 shadow-[0_0_12px_rgba(192,132,252,0.3)]">
                  <SmokeIcon className="w-4 h-4 text-purple-300" />
                </div>
              </div>
              <h1 className="bg-gradient-to-r from-amber-300 via-pink-300 to-purple-300 bg-clip-text text-2xl font-black uppercase tracking-wider text-transparent sm:text-3xl">
                Smoke It Up
              </h1>
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/50">
                Precision Exhale Arcade
              </p>
            </div>

            {/* Active Run Banner (if active) */}
            {stats.hasActiveRun && (
              <div className="rounded-2xl border border-emerald-400/40 bg-gradient-to-r from-emerald-500/20 to-teal-500/15 p-2.5 shadow-[0_0_18px_rgba(52,211,153,0.25)] text-left">
                <div className="flex items-center justify-between text-[9px] font-black uppercase tracking-wider text-emerald-300">
                  <span className="flex items-center gap-1">
                    <span className="inline-block h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                    Active Run: Lv {stats.activeRunLevel || stats.level}
                  </span>
                  <span className="tabular-nums text-amber-300">
                    ${(stats.activeRunScore || stats.score).toLocaleString()}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => gameRef.current?.continueRun()}
                  className="mt-1.5 flex w-full items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-400 py-2 text-xs font-black uppercase tracking-wider text-slate-950 shadow-md shadow-emerald-500/30 transition hover:brightness-110 active:scale-95"
                >
                  <PlayIcon className="w-3.5 h-3.5" /> Continue Run
                </button>
              </div>
            )}

            {/* Game Mode Selector */}
            <div className="rounded-2xl border border-white/10 bg-black/40 p-2 text-left">
              <div className="mb-1 flex items-center justify-between">
                <span className="text-[9px] font-black uppercase tracking-widest text-amber-300">
                  Game Mode
                </span>
                <span className="text-[9px] text-white/50">
                  {GAME_MODES[selectedMode]?.name}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-1">
                {(['classic', 'relaxed', 'rush'] as GameMode[]).map((m) => {
                  const def = GAME_MODES[m];
                  const active = selectedMode === m;
                  return (
                    <button
                      key={m}
                      type="button"
                      onClick={() => {
                        setSelectedMode(m);
                        gameRef.current?.setGameMode(m);
                      }}
                      className={`flex items-center justify-center gap-1 rounded-xl border py-1.5 px-1 text-center transition active:scale-95 ${
                        active
                          ? m === 'relaxed'
                            ? 'border-teal-400 bg-teal-500/25 text-teal-200 shadow-[0_0_10px_rgba(45,212,191,0.25)]'
                            : m === 'rush'
                              ? 'border-amber-400 bg-amber-500/25 text-amber-200 shadow-[0_0_10px_rgba(251,191,36,0.25)]'
                              : 'border-purple-400 bg-purple-500/25 text-purple-200 shadow-[0_0_10px_rgba(192,132,252,0.25)]'
                          : 'border-white/10 bg-white/5 text-white/60 hover:bg-white/10'
                      }`}
                    >
                      {m === 'classic' && <ScaleIcon className="w-3.5 h-3.5" />}
                      {m === 'relaxed' && <LungsIcon className="w-3.5 h-3.5" />}
                      {m === 'rush' && <ZapIcon className="w-3.5 h-3.5" />}
                      <span className="text-[11px] font-black">{def.name}</span>
                    </button>
                  );
                })}
              </div>
              <div className="mt-1 text-[9px] text-white/60 truncate">
                {GAME_MODES[selectedMode]?.desc}
              </div>
            </div>

            {/* Main Action Button */}
            <button
              type="button"
              onClick={() => {
                if (stats.hasActiveRun) {
                  setConfirmModal({
                    title: 'Start New Game?',
                    message: `You have an active run in progress at Level ${stats.activeRunLevel || stats.level} with $${(stats.activeRunScore || stats.score).toLocaleString()}. Starting a new run will discard it. Bank cash and lifetime unlocks are permanently saved.`,
                    confirmText: 'Start New Run',
                    cancelText: 'Keep Saved Run',
                    isDestructive: true,
                    onConfirm: () => {
                      setConfirmModal(null);
                      gameRef.current?.start(selectedMode);
                    },
                  });
                } else {
                  gameRef.current?.start(selectedMode);
                }
              }}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber-400 via-pink-500 to-purple-500 py-3 text-sm font-black uppercase tracking-wider text-slate-950 shadow-lg shadow-pink-500/30 transition hover:brightness-110 active:scale-[0.98]"
            >
              <PlayIcon className="w-4 h-4" />
              <span>New Run ({GAME_MODES[selectedMode]?.name})</span>
            </button>

            {/* Quick Metrics (Single 3-item row) */}
            <div className="grid grid-cols-3 gap-1.5 text-center text-xs">
              <div className="rounded-xl border border-emerald-400/25 bg-emerald-500/10 p-1.5 sm:p-2">
                <div className="flex items-center justify-center gap-1 text-emerald-400 mb-0.5">
                  <MoneyIcon className="w-3.5 h-3.5" />
                  <span className="text-[9px] uppercase tracking-wider text-white/50">Bank</span>
                </div>
                <div className="text-xs sm:text-sm font-black tabular-nums text-emerald-300 truncate">
                  ${stats.money.toLocaleString()}
                </div>
              </div>
              <div className="rounded-xl border border-amber-400/25 bg-amber-500/10 p-1.5 sm:p-2">
                <div className="flex items-center justify-center gap-1 text-amber-400 mb-0.5">
                  <TrophyIcon className="w-3.5 h-3.5" />
                  <span className="text-[9px] uppercase tracking-wider text-white/50">High</span>
                </div>
                <div className="text-xs sm:text-sm font-black tabular-nums text-amber-300 truncate">
                  ${stats.highScore.toLocaleString()}
                </div>
              </div>
              <div className="rounded-xl border border-purple-400/25 bg-purple-500/10 p-1.5 sm:p-2">
                <div className="flex items-center justify-center gap-1 text-purple-400 mb-0.5">
                  <LevelIcon className="w-3.5 h-3.5" />
                  <span className="text-[9px] uppercase tracking-wider text-white/50">Best</span>
                </div>
                <div className="text-xs sm:text-sm font-black tabular-nums text-purple-300 truncate">
                  Lv {stats.bestLevel || 1}
                </div>
              </div>
            </div>

            {/* Secondary Navigation System Buttons (6 Compact Buttons, 3x2 Grid) */}
            <div className="grid grid-cols-3 gap-1 sm:gap-1.5 text-xs">
              <button
                type="button"
                onClick={() => openShop()}
                className="flex items-center justify-center gap-1 rounded-xl border border-amber-400/30 bg-amber-500/10 py-2 px-1 text-[11px] font-bold text-amber-200 transition hover:bg-amber-500/20 active:scale-95"
              >
                <ShopIcon className="w-3.5 h-3.5 text-amber-300" />
                <span>Shop</span>
              </button>
              <button
                type="button"
                onClick={() => setShowLevels(true)}
                className="flex items-center justify-center gap-1 rounded-xl border border-purple-400/30 bg-purple-500/10 py-2 px-1 text-[11px] font-bold text-purple-200 transition hover:bg-purple-500/20 active:scale-95"
              >
                <LevelIcon className="w-3.5 h-3.5 text-purple-300" />
                <span>Levels</span>
              </button>
              <button
                type="button"
                onClick={() => setShowAch(true)}
                className="flex items-center justify-center gap-1 rounded-xl border border-pink-400/30 bg-pink-500/10 py-2 px-1 text-[11px] font-bold text-pink-200 transition hover:bg-pink-500/20 active:scale-95"
              >
                <AwardIcon className="w-3.5 h-3.5 text-pink-300" />
                <span>Badges</span>
              </button>
              <button
                type="button"
                onClick={() => setShowCloud(true)}
                className="flex items-center justify-center gap-1 rounded-xl border border-sky-400/30 bg-sky-500/10 py-2 px-1 text-[11px] font-bold text-sky-200 transition hover:bg-sky-500/20 active:scale-95"
              >
                <CloudIcon className="w-3.5 h-3.5 text-sky-300" />
                <span>Cloud</span>
              </button>
              <button
                type="button"
                onClick={() => setShowSettings(true)}
                className="flex items-center justify-center gap-1 rounded-xl border border-slate-400/30 bg-slate-500/10 py-2 px-1 text-[11px] font-bold text-slate-200 transition hover:bg-slate-500/20 active:scale-95"
              >
                <SettingsIcon className="w-3.5 h-3.5 text-slate-300" />
                <span>Audio</span>
              </button>
              <button
                type="button"
                onClick={() => setShowHelp(true)}
                className="flex items-center justify-center gap-1 rounded-xl border border-cyan-400/30 bg-cyan-500/10 py-2 px-1 text-[11px] font-bold text-cyan-200 transition hover:bg-cyan-500/20 active:scale-95"
              >
                <HelpIcon className="w-3.5 h-3.5 text-cyan-300" />
                <span>Guide</span>
              </button>
            </div>

            {/* Compact Footer */}
            <div className="text-[10px] text-white/35">
              1-5 fruit · E energy · B blaster · Space/Tap to smoke
            </div>
          </div>
        </div>
      )}

      {/* ============ HOW TO PLAY ============ */}
      {showHelp && (
        <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/80 backdrop-blur-sm p-3 sm:p-4">
          <div className="mx-auto flex max-h-[92vh] w-full max-w-2xl flex-col rounded-3xl border border-white/10 bg-gradient-to-b from-slate-900/98 to-[#1a0b2e]/98 shadow-2xl">
            <div className="flex items-center justify-between gap-2 border-b border-white/10 p-4 sm:p-5">
              <div className="flex items-center gap-2">
                <HelpIcon className="w-6 h-6 text-cyan-300" />
                <div>
                  <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight">How to Play</h2>
                  <p className="text-xs text-white/50">Mobile-first guide · PC notes at the end</p>
                </div>
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
                  achievements, earn stars, and collect smoke blasters.
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
                  <li>Tap <b className="text-white">Shop</b> (top right) to buy smokers, tools, fruit, and drinks.</li>
                </ol>
              </section>

              <section>
                <h3 className="mb-1.5 text-base font-black uppercase tracking-wide text-amber-300">Mobile controls</h3>
                <div className="overflow-hidden rounded-2xl border border-white/10">
                  <table className="w-full text-left text-xs sm:text-sm">
                    <tbody className="divide-y divide-white/10">
                      <tr className="bg-black/20"><td className="px-3 py-2.5 font-black text-amber-200">Hold screen</td><td className="px-3 py-2.5">Smoke / fill jar</td></tr>
                      <tr><td className="px-3 py-2.5 font-black text-amber-200">Release</td><td className="px-3 py-2.5">Stop smoking</td></tr>
                      <tr className="bg-black/20"><td className="px-3 py-2.5 font-black text-amber-200">Fruit buttons (1–5)</td><td className="px-3 py-2.5">Buy &amp; eat fruit (instant heal)</td></tr>
                      <tr><td className="px-3 py-2.5 font-black text-amber-200">Energy (E)</td><td className="px-3 py-2.5">Drink energy can</td></tr>
                      <tr className="bg-black/20"><td className="px-3 py-2.5 font-black text-amber-200">Blaster (B)</td><td className="px-3 py-2.5">Smoke Blaster (fill jar instantly)</td></tr>
                      <tr><td className="px-3 py-2.5 font-black text-amber-200">Shop</td><td className="px-3 py-2.5">Buy smokers, tools, fruit, drinks</td></tr>
                      <tr className="bg-black/20"><td className="px-3 py-2.5 font-black text-amber-200">Pause</td><td className="px-3 py-2.5">Pause game</td></tr>
                      <tr><td className="px-3 py-2.5 font-black text-amber-200">Help</td><td className="px-3 py-2.5">This guide</td></tr>
                      <tr className="bg-black/20"><td className="px-3 py-2.5 font-black text-amber-200">Audio</td><td className="px-3 py-2.5">Music &amp; sound toggles</td></tr>
                    </tbody>
                  </table>
                </div>
                <p className="mt-2 text-white/50">Tip: smoke in short bursts. Tap fruit when the HP bar turns yellow/red.</p>
              </section>

              <section>
                <h3 className="mb-1.5 text-base font-black uppercase tracking-wide text-amber-300">Lung Health & Passive Recovery</h3>
                <ul className="list-disc space-y-1 pl-5">
                  <li>Starts at <b className="text-white">100%</b>. Smoking drains it. (All tools have an improved <b className="text-emerald-300">10% damage reduction</b>!).</li>
                  <li>At <b className="text-rose-300">0%</b> the run ends. Cash, unlocks, stars, and blasters are safely kept.</li>
                  <li>Stop smoking continuously for <b className="text-white">1.0 second</b> → <b className="text-emerald-300">Automatic Passive Recovery</b> begins! A subtle indicator appears.</li>
                  <li>Automatic recovery stops strictly when lung health reaches <b className="text-white">80%</b> and never heals above 80%. Smoking again immediately stops passive recovery.</li>
                  <li><b className="text-white">Fruits</b> and <b className="text-white">energy drinks</b> can heal you beyond 80%, up to <b className="text-white">100% HP</b>.</li>
                  <li>Low HP = heartbeat, heavy breathing, red screen, coughing. Heal early!</li>
                </ul>
              </section>

              <section>
                <h3 className="mb-1.5 text-base font-black uppercase tracking-wide text-amber-300">Cash Economy</h3>
                <ul className="list-disc space-y-1 pl-5">
                  <li>Earn cash by filling jars. Every completed jar has a global <b className="text-amber-300">+35% Cash Boost</b> applied with clean whole-dollar payouts!</li>
                  <li><b className="text-white">Cash is saved forever</b> between runs — dying does not wipe your bank.</li>
                  <li>Also earn from level-ups, challenge clears, combo milestones, lucky events, and converting stars.</li>
                  <li>Early levels: spend mostly on survival (fruit / energy). Big unlocks take longer saving.</li>
                </ul>
              </section>

              <section>
                <h3 className="mb-1.5 text-base font-black uppercase tracking-wide text-amber-300">Fresh Fruits</h3>
                <p className="mb-2">Bottom bar fruit buttons buy &amp; eat instantly. Also in Shop → Fruit. Can&apos;t use at full HP.</p>
                <ul className="list-disc space-y-1.5 pl-5">
                  <li><b>Apple</b> — cheapest, best early value (+18 HP)</li>
                  <li><b>Orange</b> — cheap mid heal (+30 HP)</li>
                  <li><b>Blueberries</b> — solid recovery (+50 HP)</li>
                  <li><b>Guava</b> — big heal (+72 HP)</li>
                  <li><b className="text-amber-300">Avocado</b> — <span className="font-bold text-amber-200">FULL HEALTH RECOVERY</span>. Instantly restores lung health to exactly <b className="text-white">100% HP</b> from any health level!</li>
                </ul>
                <p className="mt-2 text-white/50">Bonus fruit sometimes drops on the counter — rare. Don&apos;t count on it.</p>
              </section>

              <section>
                <h3 className="mb-1.5 text-base font-black uppercase tracking-wide text-amber-300">Energy Drinks</h3>
                <ul className="list-disc space-y-1 pl-5">
                  <li>Buy cans in Shop → Drinks. Stock is saved between runs.</li>
                  <li>Tap the <b className="text-white">Energy</b> button to drink one.</li>
                  <li>Small instant heal + temporary regen buff (great while you keep playing carefully).</li>
                  <li>Can&apos;t drink at full HP. Stock is limited — manage it.</li>
                </ul>
              </section>

              <section>
                <h3 className="mb-1.5 text-base font-black uppercase tracking-wide text-amber-300">Smoking Tools</h3>
                <p className="mb-2">Shop → Tools (or tap your tool chip). Each tool shows:</p>
                <ul className="list-disc space-y-1 pl-5">
                  <li><b className="text-sky-300">Fill</b> — jar fill speed</li>
                  <li><b className="text-amber-300">$</b> — money multiplier</li>
                  <li><b className="text-rose-300">Damage</b> — lung damage (includes 10% global balancing reduction)</li>
                </ul>
                <p className="mt-2">
                  Free <b>Cigarette</b> is slow and harsh. <b>E-Cig / Pod</b> are safer early picks.
                  <b> Cigar → Hookah → Bong → Blunt</b> earn more and fill faster, but burn lungs faster. Blunt is the endgame power tool.
                </p>
              </section>

              <section>
                <h3 className="mb-1.5 text-base font-black uppercase tracking-wide text-amber-300">Celebrity Smokers</h3>
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
                <h3 className="mb-1.5 text-base font-black uppercase tracking-wide text-amber-300">Challenge Modifiers</h3>
                <p className="mb-2">
                  Sometimes a level becomes a red <b className="text-rose-300">Challenge</b>. Uncommon and random.
                </p>
                <ul className="list-disc space-y-1 pl-5">
                  <li>Examples: giant jars, flu, storm, blackout, dud tools, thin smoke, burning lungs, weak healing, crosswinds, smoke tax, all-nighter</li>
                  <li>Harder but always possible with careful play</li>
                </ul>
              </section>

              <section>
                <h3 className="mb-1.5 text-base font-black uppercase tracking-wide text-amber-300">Audio</h3>
                <ul className="list-disc space-y-1 pl-5">
                  <li>Top-right: music and sound effects toggles.</li>
                  <li>Pause menu has a master volume slider.</li>
                </ul>
              </section>

              <section>
                <h3 className="mb-1.5 text-base font-black uppercase tracking-wide text-amber-300">Quick Tips</h3>
                <ul className="list-disc space-y-1 pl-5">
                  <li>Short smoke bursts beat holding forever.</li>
                  <li>Early game: apples + energy first, upgrades later.</li>
                  <li>E-cig is the safe first tool upgrade.</li>
                  <li>Protect combos — milestones pay.</li>
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
                    <p>Yes, automatic recovery begins after 1.0s of idle time and heals up to 80% HP.</p>
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
                    <div className="font-black text-white">What is a golden jar?</div>
                    <p>A rare glowing high-value jar worth several times a normal one.</p>
                  </div>
                  <div>
                    <div className="font-black text-white">What does the blaster do?</div>
                    <p>One tap fills the current jar completely. Press B or tap the blaster icon.</p>
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
                <h3 className="mb-1.5 text-base font-black uppercase tracking-wide text-sky-200">PC / Desktop Controls</h3>
                <p className="mb-2 text-white/70">
                  Same game. Hold <b className="text-white">Space</b> or click-and-hold to smoke. Everything else is buttons too.
                </p>
                <ul className="list-disc space-y-1 pl-5 text-white/70">
                  <li><b className="text-white">1–5</b> fruit · <b className="text-white">E</b> energy · <b className="text-white">B</b> blaster</li>
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
      {showAch && (
        <div
          className="absolute inset-0 z-40 flex items-center justify-center bg-black/75 backdrop-blur-sm p-3 sm:p-4"
          onTouchStart={(e) => e.stopPropagation()}
        >
          <div className="mx-auto flex max-h-[88vh] w-full max-w-lg flex-col rounded-3xl border border-white/10 bg-slate-900/95 p-5 shadow-2xl custom-scrollbar overflow-y-auto">
            <div className="mb-1 flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-2xl font-black uppercase tracking-tight">
                <AwardIcon className="w-6 h-6 text-amber-300" />
                <span>Achievements</span>
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
                <div className="flex items-center justify-center gap-1.5 text-lg font-black text-amber-300">
                  <StarIcon className="w-5 h-5 text-amber-400" /> {stats.goldenStars}
                </div>
                <div className="text-[10px] uppercase tracking-widest text-white/50">Golden Stars</div>
                <div className="mt-2 flex gap-1">
                  <button
                    type="button"
                    disabled={stats.goldenStars < 1}
                    onClick={() => gameRef.current?.convertStars(1)}
                    className="flex-1 rounded-lg bg-amber-400/20 px-2 py-1.5 text-[10px] font-black text-amber-200 transition enabled:hover:bg-amber-400/35 disabled:opacity-40"
                  >
                    1 Star → ${STAR_TO_CASH}
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
                <div className="flex items-center justify-center gap-1.5 text-lg font-black text-orange-400">
                  <BlasterIcon className="w-5 h-5 text-orange-400" /> {stats.smokeBlasters}
                </div>
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
                    <div className={`my-1 flex justify-center ${got ? 'text-amber-300' : 'text-white/30'}`}>
                      <AchievementIconRenderer icon={a.icon} className="w-7 h-7" />
                    </div>
                    <div className={`mt-0.5 text-[11px] font-black leading-tight ${got ? 'text-amber-200' : 'text-white/50'}`}>
                      {a.name}
                    </div>
                    <div className="mt-0.5 text-[9px] leading-tight text-white/40">{a.desc}</div>
                    {(a.stars || a.blasters) && (
                      <div className="mt-1 text-[9px] font-black text-amber-300/90">
                        {a.stars ? `+${a.stars} STARS` : ''}
                        {a.stars && a.blasters ? ' · ' : ''}
                        {a.blasters ? `+${a.blasters} BLASTERS` : ''}
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
      {showCloud && (
        <div
          className="absolute inset-0 z-40 flex items-center justify-center bg-black/75 backdrop-blur-sm p-3 sm:p-4"
          onTouchStart={(e) => e.stopPropagation()}
        >
          <div className="mx-auto w-full max-w-md rounded-3xl border border-white/10 bg-slate-900/95 p-5 shadow-2xl sm:p-6">
            <div className="mb-1 flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-2xl font-black uppercase tracking-tight">
                <CloudIcon className="w-6 h-6 text-sky-300" />
                <span>Cloud Save</span>
              </h2>
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
            <p className="mb-3 text-xs text-white/50">Export or import your saved bank, unlocks, and records</p>

            <button
              type="button"
              onClick={genCloudCode}
              className="w-full rounded-2xl bg-gradient-to-r from-sky-400 to-indigo-500 px-4 py-3 text-sm font-black uppercase tracking-wider text-slate-900 transition hover:brightness-110 active:scale-[0.98]"
            >
              Generate Cloud Code
            </button>

            {generatedCode && (
              <div className="mt-3">
                <textarea
                  readOnly
                  value={generatedCode}
                  rows={3}
                  className="w-full resize-none rounded-xl border border-white/15 bg-black/50 p-2 font-mono text-[11px] text-white outline-none"
                />
                <button
                  type="button"
                  onClick={copyCloud}
                  className="mt-1 w-full rounded-xl border border-sky-400/40 bg-sky-500/15 py-2 text-xs font-black uppercase text-sky-200 transition hover:bg-sky-500/25 active:scale-95"
                >
                  Copy Code
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
              Restore Progress
            </button>

            {cloudMsg && <p className="mt-2 text-center text-xs font-bold text-white/70">{cloudMsg}</p>}
          </div>
        </div>
      )}

      {/* ============ LEVELS MODAL ============ */}
      {showLevels && (
        <LevelsModal
          stats={stats}
          curChar={curChar}
          curTool={curTool}
          onClose={() => setShowLevels(false)}
        />
      )}

      {/* ============ SETTINGS MODAL ============ */}
      {showSettings && (
        <SettingsModal
          musicOn={musicOn}
          sfxOn={sfxOn}
          masterVol={masterVol}
          toggleMusic={toggleMusic}
          toggleSfx={toggleSfx}
          changeVolume={changeVolume}
          onClose={() => setShowSettings(false)}
        />
      )}

      {/* ============ CONFIRMATION MODAL ============ */}
      {confirmModal && (
        <ConfirmModal
          title={confirmModal.title}
          message={confirmModal.message}
          confirmText={confirmModal.confirmText}
          cancelText={confirmModal.cancelText}
          isDestructive={confirmModal.isDestructive}
          onConfirm={confirmModal.onConfirm}
          onCancel={() => setConfirmModal(null)}
        />
      )}

      {/* ============ PAUSE ============ */}
      {state === 'paused' && !shopOpen && !showLevels && !showSettings && !showAch && !showCloud && !showHelp && !confirmModal && (
        <div
          className="absolute inset-0 z-30 flex items-center justify-center bg-black/75 p-3 backdrop-blur-md"
          onTouchStart={(e) => e.stopPropagation()}
        >
          <div className="mx-auto flex max-h-[92vh] w-full max-w-md flex-col rounded-3xl border border-white/15 bg-gradient-to-b from-slate-900/98 to-[#150a26]/98 p-5 text-center shadow-2xl custom-scrollbar overflow-y-auto sm:p-6">
            <div className="mb-1 text-4xl">⏸</div>
            <h2 className="mb-1 text-2xl font-black uppercase tracking-tight text-white sm:text-3xl">Game Paused</h2>
            <div className="mb-3 flex items-center justify-center gap-2">
              <span className={`rounded-lg px-2 py-0.5 text-[10px] font-black uppercase tracking-wider ${
                stats.gameMode === 'relaxed'
                  ? 'border border-teal-400/40 bg-teal-500/20 text-teal-300'
                  : stats.gameMode === 'rush'
                    ? 'border border-amber-400/40 bg-amber-500/20 text-amber-300'
                    : 'border border-indigo-400/40 bg-indigo-500/20 text-indigo-300'
              }`}>
                {GAME_MODES[stats.gameMode]?.name || 'Classic'} Mode
              </span>
              <span className="text-xs font-bold text-white/60">Level {stats.level}</span>
            </div>

            <div className="mb-4 grid grid-cols-3 gap-2 text-left text-xs">
              <StatBox label="Score" value={`$${stats.score.toLocaleString()}`} />
              <StatBox label="Cash" value={`$${stats.money.toLocaleString()}`} />
              <StatBox label="HP" value={`${Math.round(healthPct)}%`} />
              <StatBox label="Energy Cans" value={String(stats.drinkStock)} />
              <StatBox label="Golden Stars" value={String(stats.goldenStars)} />
              <StatBox label="Blasters" value={String(stats.smokeBlasters)} />
            </div>

            {/* 1. Resume */}
            <button
              type="button"
              onClick={() => gameRef.current?.resume()}
              className="mb-3 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-400 to-teal-400 py-3.5 text-base font-black uppercase tracking-wider text-slate-950 shadow-lg shadow-emerald-500/30 transition hover:brightness-110 active:scale-[0.98]"
            >
              <PlayIcon className="w-4 h-4" />
              <span>Resume Game</span>
            </button>

            {/* In-Run System Panels */}
            <div className="mb-3 grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => setShowLevels(true)}
                className="flex items-center justify-center gap-2 rounded-2xl border border-purple-400/40 bg-purple-500/15 p-3 font-black text-purple-200 transition hover:bg-purple-500/25 active:scale-95"
              >
                <LevelIcon className="w-4 h-4 text-purple-300" />
                <span>Levels &amp; Info</span>
              </button>
              <button
                type="button"
                onClick={() => openShop()}
                className="flex items-center justify-center gap-2 rounded-2xl border border-amber-400/40 bg-amber-500/15 p-3 font-black text-amber-200 transition hover:bg-amber-500/25 active:scale-95"
              >
                <ShopIcon className="w-4 h-4 text-amber-300" />
                <span>Top-Ups &amp; Shop</span>
              </button>
              <button
                type="button"
                onClick={() => setShowAch(true)}
                className="flex items-center justify-center gap-2 rounded-2xl border border-pink-400/40 bg-pink-500/15 p-3 font-black text-pink-200 transition hover:bg-pink-500/25 active:scale-95"
              >
                <AwardIcon className="w-4 h-4 text-pink-300" />
                <span>Achievements</span>
              </button>
              <button
                type="button"
                onClick={() => setShowCloud(true)}
                className="flex items-center justify-center gap-2 rounded-2xl border border-sky-400/40 bg-sky-500/15 p-3 font-black text-sky-200 transition hover:bg-sky-500/25 active:scale-95"
              >
                <CloudIcon className="w-4 h-4 text-sky-300" />
                <span>Cloud Save</span>
              </button>
              <button
                type="button"
                onClick={() => setShowSettings(true)}
                className="flex items-center justify-center gap-2 rounded-2xl border border-slate-400/40 bg-slate-500/15 p-3 font-black text-slate-200 transition hover:bg-slate-500/25 active:scale-95"
              >
                <SettingsIcon className="w-4 h-4 text-slate-300" />
                <span>Settings &amp; Audio</span>
              </button>
              <button
                type="button"
                onClick={() => setShowHelp(true)}
                className="flex items-center justify-center gap-2 rounded-2xl border border-cyan-400/40 bg-cyan-500/15 p-3 font-black text-cyan-200 transition hover:bg-cyan-500/25 active:scale-95"
              >
                <HelpIcon className="w-4 h-4 text-cyan-300" />
                <span>How to Play</span>
              </button>
            </div>

            {/* Destructive Actions with Confirmation */}
            <div className="grid grid-cols-2 gap-2 border-t border-white/10 pt-3">
              <button
                type="button"
                onClick={() =>
                  setConfirmModal({
                    title: 'Restart Run?',
                    message:
                      'Are you sure you want to restart this run from Level 1? All cash earned up to this point is safely banked, but current run level and progress will reset.',
                    confirmText: 'Yes, Restart Run',
                    cancelText: 'Cancel',
                    isDestructive: true,
                    onConfirm: () => {
                      setConfirmModal(null);
                      gameRef.current?.restart();
                    },
                  })
                }
                className="flex items-center justify-center gap-1.5 rounded-2xl border border-rose-500/30 bg-rose-500/10 py-2.5 text-xs font-bold uppercase tracking-wider text-rose-300 transition hover:bg-rose-500/20 active:scale-95"
              >
                <RotateCcwIcon className="w-3.5 h-3.5 text-rose-400" />
                <span>Restart Run</span>
              </button>
              <button
                type="button"
                onClick={() =>
                  setConfirmModal({
                    title: 'Exit to Main Menu?',
                    message:
                      'Exiting to the main menu will end your active run at Level ' +
                      stats.level +
                      '. Your bank balance and lifetime achievements are already permanently saved.',
                    confirmText: 'Exit to Menu',
                    cancelText: 'Stay in Run',
                    isDestructive: true,
                    onConfirm: () => {
                      setConfirmModal(null);
                      gameRef.current?.toMenu();
                    },
                  })
                }
                className="flex items-center justify-center gap-1.5 rounded-2xl border border-white/15 bg-white/5 py-2.5 text-xs font-bold uppercase tracking-wider text-white/70 transition hover:bg-white/10 active:scale-95"
              >
                <HomeIcon className="w-3.5 h-3.5 text-white/70" />
                <span>Main Menu</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============ GAME OVER ============ */}
      {state === 'gameover' && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/75 backdrop-blur-sm p-3">
          <div className="mx-auto w-full max-w-sm rounded-3xl border border-rose-500/30 bg-gradient-to-br from-rose-950/90 via-slate-900/90 to-slate-950/90 p-6 text-center shadow-2xl sm:p-8">
            <div className="mx-auto mb-2 flex h-14 w-14 items-center justify-center rounded-2xl border border-rose-500/40 bg-rose-500/15">
              <AlertTriangleIcon className="w-7 h-7 text-rose-400" />
            </div>
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
                <div className="text-2xl font-black tabular-nums text-emerald-300 flex items-center justify-center gap-1">
                  <MoneyIcon className="w-5 h-5 text-emerald-400" />
                  <span>${stats.money.toLocaleString()}</span>
                </div>
              </div>

              {stats.score >= stats.highScore && stats.score > 0 && (
                <div className="flex items-center justify-center gap-1.5 rounded-xl border border-pink-400/40 bg-pink-500/20 px-3 py-2 text-sm font-bold text-pink-200 shadow-[0_0_12px_rgba(236,72,153,0.4)]">
                  <TrophyIcon className="w-4 h-4 text-pink-300" />
                  <span>NEW HIGH SCORE!</span>
                </div>
              )}

              <div className="grid grid-cols-4 gap-1.5 text-[11px]">
                <MiniStat label="Jars" value={String(stats.containersFilled)} />
                <MiniStat label="Gold" value={String(stats.goldenFilled)} />
                <MiniStat label="Drinks" value={String(stats.energyDrinksUsed)} />
                <MiniStat label="Combo" value={`x${stats.bestCombo.toFixed(1)}`} />
              </div>
            </div>

            {stats.scores.length > 0 && (
              <div className="mb-3 rounded-xl border border-white/10 bg-black/30 p-2.5">
                <div className="mb-1 text-[9px] font-bold uppercase tracking-widest text-white/40">
                  Top Scores
                </div>
                <div className="space-y-0.5">
                  {stats.scores.slice(0, 3).map((s, i) => (
                    <div
                      key={i}
                      className={`flex items-center justify-between px-2 text-xs ${
                        s === stats.score ? 'text-amber-300' : 'text-white/50'
                      }`}
                    >
                      <span className="font-bold font-mono text-[11px]">
                        {i === 0 ? '★ #1' : i === 1 ? '• #2' : '· #3'}
                      </span>
                      <span className="font-black tabular-nums">${s.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={() => gameRef.current?.restart()}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber-400 to-pink-500 px-6 py-3.5 text-base font-black uppercase tracking-wider text-slate-900 shadow-lg shadow-pink-500/30 transition hover:brightness-110 active:scale-[0.98]"
            >
              <RotateCcwIcon className="w-4 h-4" />
              <span>Try Again</span>
            </button>
            <button
              type="button"
              onClick={() => gameRef.current?.toMenu()}
              className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-2xl border border-white/10 bg-black/40 px-6 py-2 text-sm font-bold uppercase tracking-wider text-white/70 transition hover:bg-black/60"
            >
              <HomeIcon className="w-4 h-4" />
              <span>Menu</span>
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
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5">
        <CharacterIconRenderer icon={char.icon} className="w-6 h-6 text-amber-300" />
      </div>
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
  const displayedDrain = tool.drain * GLOBAL_TOOL_DAMAGE_MULT;
  const riskColor = displayedDrain >= 2.5 ? 'text-rose-300' : displayedDrain >= 1.3 ? 'text-orange-300' : 'text-emerald-300';
  return (
    <div
      className={`flex items-center gap-3 rounded-2xl border p-3 transition ${
        selected ? 'border-sky-400/60 bg-sky-500/10' : 'border-white/10 bg-black/30'
      }`}
    >
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5">
        <ToolIconRenderer icon={tool.icon} className="w-6 h-6 text-sky-300" />
      </div>
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
            {displayedDrain.toFixed(2)}x dmg
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
  const isAvocado = fruit.id === 'avocado';
  const heal = isAvocado ? Math.round(100 - health) : Math.min(fruit.heal, Math.round(100 - health));
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/30 p-3">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5">
        <FruitIconRenderer icon={fruit.icon} className="w-6 h-6" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="font-black">{fruit.name}</span>
          <span className={`rounded-md px-1.5 py-0.5 text-[10px] font-black ${
            isAvocado ? 'bg-amber-400/20 text-amber-300 border border-amber-400/30' : 'bg-emerald-400/15 text-emerald-300'
          }`}>
            {isAvocado ? 'FULL 100% HP' : `+${heal} HP`}
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

function ConfirmModal({
  title,
  message,
  confirmText,
  cancelText = 'Cancel',
  isDestructive = true,
  onConfirm,
  onCancel,
}: {
  title: string;
  message: string;
  confirmText: string;
  cancelText?: string;
  isDestructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md"
      onTouchStart={(e) => e.stopPropagation()}
    >
      <div className="w-full max-w-sm rounded-3xl border border-white/15 bg-slate-900/95 p-6 text-center shadow-2xl">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
          {isDestructive ? <AlertTriangleIcon className="w-6 h-6 text-rose-400" /> : <HelpIcon className="w-6 h-6 text-amber-400" />}
        </div>
        <h3 className="mb-2 text-xl font-black uppercase tracking-wide text-white">{title}</h3>
        <p className="mb-6 text-sm text-white/70 leading-relaxed">{message}</p>
        <div className="flex gap-2.5">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 rounded-2xl border border-white/15 bg-white/5 py-3 text-sm font-bold uppercase tracking-wider text-white/80 transition hover:bg-white/10 active:scale-95"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`flex-1 rounded-2xl py-3 text-sm font-black uppercase tracking-wider text-slate-950 transition active:scale-95 ${
              isDestructive
                ? 'bg-gradient-to-r from-rose-500 to-amber-500 hover:brightness-110 shadow-lg shadow-rose-500/30'
                : 'bg-gradient-to-r from-emerald-400 to-teal-400 hover:brightness-110 shadow-lg shadow-emerald-500/30'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

function LevelsModal({
  stats,
  curChar,
  curTool,
  onClose,
}: {
  stats: GameStats;
  curChar: CharacterDef;
  curTool: ToolDef;
  onClose: () => void;
}) {
  const activeMods = stats.challengeMods
    .map((id) => CHALLENGE_MODS.find((m) => m.id === id))
    .filter(Boolean) as typeof CHALLENGE_MODS;
  const levelProgress = Math.min(100, (stats.jarsThisLevel / stats.levelQuota) * 100);

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-black/80 p-3 backdrop-blur-md sm:p-4"
      onTouchStart={(e) => e.stopPropagation()}
    >
      <div className="flex max-h-[90vh] w-full max-w-lg flex-col rounded-3xl border border-white/15 bg-slate-900/95 shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/10 p-4 sm:p-5">
          <div className="flex items-center gap-2">
            <LevelIcon className="w-6 h-6 text-purple-300" />
            <div>
              <h2 className="text-xl font-black uppercase tracking-tight text-white sm:text-2xl">Level & Progress</h2>
              <p className="text-xs text-white/50">Run stats, difficulty scaling & challenge intel</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-white/15 bg-white/5 px-3 py-1.5 font-bold text-white/70 transition hover:bg-white/15 active:scale-90"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto p-4 text-sm text-white/80 custom-scrollbar sm:p-5">
          {/* Active Level Card */}
          <div className="rounded-2xl border border-purple-400/30 bg-gradient-to-br from-purple-500/15 via-slate-900 to-indigo-950/40 p-4">
            <div className="flex items-center justify-between gap-2">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-purple-300">Current Run</span>
                <div className="text-2xl font-black text-white">Level {stats.level}</div>
              </div>
              <span className={`rounded-lg px-2.5 py-1 text-xs font-black uppercase tracking-wider ${
                stats.gameMode === 'relaxed'
                  ? 'border border-teal-400/40 bg-teal-500/20 text-teal-300'
                  : stats.gameMode === 'rush'
                    ? 'border border-amber-400/40 bg-amber-500/20 text-amber-300'
                    : 'border border-indigo-400/40 bg-indigo-500/20 text-indigo-300'
              }`}>
                {GAME_MODES[stats.gameMode]?.name || 'Classic'} Mode
              </span>
            </div>

            <div className="mt-3">
              <div className="mb-1 flex justify-between text-xs font-bold text-white/70">
                <span>Quota Progress</span>
                <span className="text-amber-300">{stats.jarsThisLevel} / {stats.levelQuota} Jars</span>
              </div>
              <div className="h-3 w-full overflow-hidden rounded-full bg-black/40">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-amber-400 via-pink-500 to-purple-500 transition-all duration-300"
                  style={{ width: `${levelProgress}%` }}
                />
              </div>
            </div>
          </div>

          {/* Active Challenge Modifiers */}
          {stats.inChallenge ? (
            <div className="rounded-2xl border border-rose-500/40 bg-rose-950/20 p-4">
              <div className="mb-2 flex items-center gap-2 text-rose-300">
                <AlertTriangleIcon className="w-4 h-4 text-rose-400" />
                <span className="font-black uppercase tracking-wider text-xs">Active Challenge Modifiers</span>
              </div>
              <div className="space-y-2">
                {activeMods.map((m) => (
                  <div key={m.id} className="flex items-center gap-2.5 rounded-xl bg-black/30 p-2.5 text-xs">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-500/20 text-rose-300">
                      <ChallengeIconRenderer icon={m.icon} className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-black text-rose-200">{m.name}</div>
                      <div className="text-white/60 text-[11px]">{m.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/15 p-3.5 text-xs text-emerald-200">
              <span className="font-bold">Standard Weather & Clear Skies.</span> Challenge levels appear randomly every few stages with lucrative cash bonuses!
            </div>
          )}

          {/* Global Balance Perks */}
          <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
            <h4 className="mb-2 text-xs font-black uppercase tracking-wider text-amber-300">Active Game Modifiers</h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="rounded-xl border border-white/5 bg-white/5 p-2.5">
                <div className="text-[10px] uppercase text-white/50">Global Damage Mult</div>
                <div className="font-black text-emerald-300">-10% Base (0.90x)</div>
              </div>
              <div className="rounded-xl border border-white/5 bg-white/5 p-2.5">
                <div className="text-[10px] uppercase text-white/50">Jar Earnings Mult</div>
                <div className="font-black text-amber-300">+{Math.round((GLOBAL_EARNINGS_MULT - 1) * 100)}% Cash ({GLOBAL_EARNINGS_MULT}x)</div>
              </div>
              <div className="rounded-xl border border-white/5 bg-white/5 p-2.5">
                <div className="text-[10px] uppercase text-white/50">Passive Lung Recovery</div>
                <div className="font-black text-cyan-300">Auto after 1.0s (Max 80%)</div>
              </div>
              <div className="rounded-xl border border-white/5 bg-white/5 p-2.5">
                <div className="text-[10px] uppercase text-white/50">Full HP Healer</div>
                <div className="font-black text-lime-300">Avocado (100% HP)</div>
              </div>
            </div>
          </div>

          {/* Loadout Synergy */}
          <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
            <h4 className="mb-2 text-xs font-black uppercase tracking-wider text-amber-300">Current Loadout</h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="rounded-xl border border-white/5 bg-white/5 p-2.5">
                <div className="flex items-center gap-1.5 text-sm font-black">
                  <CharacterIconRenderer icon={curChar.icon} className="w-4 h-4 text-amber-300" />
                  <span>{curChar.name}</span>
                </div>
                <div className="text-amber-300 font-bold mt-1">x{curChar.mult.toFixed(1)} Pay Multiplier</div>
              </div>
              <div className="rounded-xl border border-white/5 bg-white/5 p-2.5">
                <div className="flex items-center gap-1.5 text-sm font-black">
                  <ToolIconRenderer icon={curTool.icon} className="w-4 h-4 text-sky-300" />
                  <span>{curTool.name}</span>
                </div>
                <div className="text-sky-300 font-bold mt-1">{curTool.fill.toFixed(1)}x Fill · {curTool.earn.toFixed(1)}x $</div>
              </div>
            </div>
          </div>

          {/* Difficulty Scaling */}
          <div className="rounded-2xl border border-white/10 bg-black/30 p-4 text-xs">
            <h4 className="mb-2 font-black uppercase tracking-wider text-amber-300">Level Progression Guide</h4>
            <div className="space-y-1.5 text-white/70">
              <div className="flex justify-between border-b border-white/5 pb-1">
                <span className="font-bold text-white">Levels 1–10:</span>
                <span>Gentle learning tier (Base drain)</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-1">
                <span className="font-bold text-white">Levels 11–25:</span>
                <span>Moderate challenge (1.2x fill req, faster drain)</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-1">
                <span className="font-bold text-white">Levels 26–50:</span>
                <span>Hardcore scaling (1.65x fill req, high risk)</span>
              </div>
              <div className="flex justify-between">
                <span className="font-bold text-white">Levels 51+:</span>
                <span>Master tier (Max difficulty, massive payouts)</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 p-3 sm:p-4">
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-2xl bg-gradient-to-r from-purple-500 to-indigo-500 py-3 text-sm font-black uppercase tracking-wider text-white shadow-lg shadow-purple-500/25 transition hover:brightness-110 active:scale-95"
          >
            Back to Game
          </button>
        </div>
      </div>
    </div>
  );
}

function SettingsModal({
  musicOn,
  sfxOn,
  masterVol,
  toggleMusic,
  toggleSfx,
  changeVolume,
  onClose,
}: {
  musicOn: boolean;
  sfxOn: boolean;
  masterVol: number;
  toggleMusic: () => void;
  toggleSfx: () => void;
  changeVolume: (v: number) => void;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-black/80 p-3 backdrop-blur-md sm:p-4"
      onTouchStart={(e) => e.stopPropagation()}
    >
      <div className="flex max-h-[90vh] w-full max-w-md flex-col rounded-3xl border border-white/15 bg-slate-900/95 shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/10 p-4 sm:p-5">
          <div className="flex items-center gap-2">
            <SettingsIcon className="w-6 h-6 text-slate-300" />
            <div>
              <h2 className="text-xl font-black uppercase tracking-tight text-white">Settings & Audio</h2>
              <p className="text-xs text-white/50">Sound, controls & game options</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-white/15 bg-white/5 px-3 py-1.5 font-bold text-white/70 transition hover:bg-white/15 active:scale-90"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto p-4 text-sm text-white/80 custom-scrollbar sm:p-5">
          {/* Audio Controls */}
          <div className="rounded-2xl border border-white/10 bg-black/30 p-4 space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-amber-300">Audio Settings</h4>

            <div className="flex items-center justify-between">
              <div>
                <div className="font-bold text-white">Background Music</div>
                <div className="text-[11px] text-white/50">Chill lo-fi synth groove</div>
              </div>
              <button
                type="button"
                onClick={toggleMusic}
                className={`flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-black transition active:scale-90 ${
                  musicOn ? 'border-emerald-400/50 bg-emerald-500/20 text-emerald-300' : 'border-white/10 bg-black/40 text-white/40'
                }`}
              >
                {musicOn ? <MusicIcon className="w-3.5 h-3.5" /> : <VolumeOffIcon className="w-3.5 h-3.5" />}
                <span>{musicOn ? 'Music ON' : 'Music OFF'}</span>
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="font-bold text-white">Sound Effects</div>
                <div className="text-[11px] text-white/50">Inhale, coughs, jar pops & rewards</div>
              </div>
              <button
                type="button"
                onClick={toggleSfx}
                className={`flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-black transition active:scale-90 ${
                  sfxOn ? 'border-emerald-400/50 bg-emerald-500/20 text-emerald-300' : 'border-white/10 bg-black/40 text-white/40'
                }`}
              >
                {sfxOn ? <VolumeOnIcon className="w-3.5 h-3.5" /> : <VolumeOffIcon className="w-3.5 h-3.5" />}
                <span>{sfxOn ? 'SFX ON' : 'SFX OFF'}</span>
              </button>
            </div>

            <div className="pt-2">
              <div className="mb-1 flex justify-between text-xs font-bold">
                <span className="text-white/70">Master Volume</span>
                <span className="text-amber-300 font-mono">{masterVol}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                value={masterVol}
                onChange={(e) => changeVolume(Number(e.target.value))}
                className="w-full accent-emerald-400 cursor-pointer"
              />
            </div>
          </div>

          {/* Controls Reference */}
          <div className="rounded-2xl border border-white/10 bg-black/30 p-4 text-xs space-y-2">
            <h4 className="font-black uppercase tracking-wider text-amber-300">Keyboard Shortcuts</h4>
            <div className="grid grid-cols-2 gap-2 text-white/70">
              <div><kbd className="rounded border border-white/20 bg-black/50 px-1 font-mono">SPACE</kbd> Smoke / Exhale</div>
              <div><kbd className="rounded border border-white/20 bg-black/50 px-1 font-mono">1–5</kbd> Eat Fruit</div>
              <div><kbd className="rounded border border-white/20 bg-black/50 px-1 font-mono">E</kbd> Drink Energy Can</div>
              <div><kbd className="rounded border border-white/20 bg-black/50 px-1 font-mono">B</kbd> Smoke Blaster</div>
              <div><kbd className="rounded border border-white/20 bg-black/50 px-1 font-mono">S</kbd> Open Shop</div>
              <div><kbd className="rounded border border-white/20 bg-black/50 px-1 font-mono">P / ESC</kbd> Pause Game</div>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 p-3 sm:p-4">
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-2xl bg-gradient-to-r from-sky-400 to-indigo-500 py-3 text-sm font-black uppercase tracking-wider text-slate-900 shadow-lg shadow-sky-500/25 transition hover:brightness-110 active:scale-95"
          >
            Save & Close
          </button>
        </div>
      </div>
    </div>
  );
}
