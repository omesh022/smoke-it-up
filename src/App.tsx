import { useEffect, useRef, useState } from 'react';
import {
  Game,
  CHARACTERS,
  TOOLS,
  FRUITS,
  ENERGY_DRINK,
  CHALLENGE_MODS,
  ACHIEVEMENTS,
  GAME_MODES,
  GLOBAL_TOOL_DAMAGE_MULT,
  type GameState,
  type GameStats,
  type CharacterDef,
  type ToolDef,
  type FruitDef,
  type AchievementDef,
  type GameMode,
  type ActionFeedback,
  type GameSettings,
} from './game/Game';
import { AudioManager } from './game/Audio';
import { NavigationManager, type OverlayId } from './game/Navigation';
import { TutorialModal } from './components/TutorialModal';
import { PlaceholderModal, type PlaceholderType } from './components/PlaceholderModal';
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
  const navRef = useRef(new NavigationManager());

  const [state, setState] = useState<GameState>('menu');
  const [stats, setStats] = useState<GameStats>(defaultStats);
  const [settings, setSettings] = useState<GameSettings>({
    reducedMotion: false,
    lowEffects: false,
    highContrast: false,
    haptics: true,
    leftHanded: false,
    showFps: false,
  });

  const [showTutorialModal, setShowTutorialModal] = useState(false);
  const [placeholderModal, setPlaceholderModal] = useState<PlaceholderType | null>(null);

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
  const [feedbackToast, setFeedbackToast] = useState<{
    message: string;
    success: boolean;
    key: number;
  } | null>(null);

  const shopOpenRef = useRef(false);
  shopOpenRef.current = shopOpen;

  const openOverlay = (id: OverlayId, customTab?: ShopTab) => {
    if (id === 'shop') {
      setShopTab(customTab ?? shopTab);
      setShopOpen(true);
      gameRef.current?.setShopOpen(true);
    } else if (id === 'levels') {
      setShowLevels(true);
    } else if (id === 'settings') {
      setShowSettings(true);
    } else if (id === 'help') {
      setShowHelp(true);
    } else if (id === 'achievements') {
      setShowAch(true);
    } else if (id === 'cloud') {
      setShowCloud(true);
    }
    navRef.current.push(id);
    gameRef.current?.setOverlayOpen(true);
  };

  const closeOverlay = (id: OverlayId) => {
    navRef.current.close(id);
    if (id === 'shop') {
      setShopOpen(false);
      gameRef.current?.setShopOpen(false);
    } else if (id === 'levels') {
      setShowLevels(false);
    } else if (id === 'settings') {
      setShowSettings(false);
    } else if (id === 'help') {
      setShowHelp(false);
    } else if (id === 'achievements') {
      setShowAch(false);
    } else if (id === 'cloud') {
      setShowCloud(false);
      setCloudMsg('');
    } else if (id === 'confirm') {
      setConfirmModal(null);
    }

    if (navRef.current.getStack().length === 0) {
      gameRef.current?.setOverlayOpen(false);
    }
  };

  const openShop = (tab?: ShopTab) => openOverlay('shop', tab);
  const closeShop = () => closeOverlay('shop');

  const popTopOverlay = (): boolean => {
    const top = navRef.current.getTop();
    if (top) {
      closeOverlay(top);
      return true;
    }
    return false;
  };

  const triggerConfirm = (modal: {
    title: string;
    message: string;
    confirmText: string;
    cancelText?: string;
    isDestructive?: boolean;
    onConfirm: () => void;
  }) => {
    setConfirmModal(modal);
    navRef.current.push('confirm');
    gameRef.current?.setOverlayOpen(true);
  };

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
    g.onFeedback = (fb: ActionFeedback) => {
      setFeedbackToast({ message: fb.message, success: fb.success, key: Date.now() });
    };
    setStats(g.getStats());
    setSettings(g.getSettings());

    // Check first-run tutorial
    try {
      const tutorialSeen = localStorage.getItem('smokeItUp.tutorialSeen.v1');
      if (!tutorialSeen) {
        setShowTutorialModal(true);
      }
    } catch {
      // ignore
    }

    return () => g.destroy();
  }, []);

  // Update Game Settings
  const updateSettings = (partial: Partial<GameSettings>) => {
    if (!gameRef.current) return;
    gameRef.current.setSettings(partial);
    setSettings(gameRef.current.getSettings());
  };

  // Auto-dismiss toasts
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3600);
    return () => clearTimeout(t);
  }, [toast]);

  useEffect(() => {
    if (!feedbackToast) return;
    const t = setTimeout(() => setFeedbackToast(null), 2500);
    return () => clearTimeout(t);
  }, [feedbackToast]);

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

  // Hardware/Android back button support
  useEffect(() => {
    const handlePopState = (e: PopStateEvent) => {
      e.preventDefault();
      if (placeholderModal) {
        setPlaceholderModal(null);
        return;
      }
      if (showTutorialModal) {
        setShowTutorialModal(false);
        return;
      }
      const popped = popTopOverlay();
      if (!popped && gameRef.current?.getState() === 'playing') {
        gameRef.current.pause();
      }
      window.history.pushState(null, '', window.location.href);
    };
    window.history.pushState(null, '', window.location.href);
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [placeholderModal, showTutorialModal]);

  // Keyboard controls
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.repeat) return;
      const g = gameRef.current;
      if (!g) return;
      const st = g.getState();
      const hasAnyOverlay = navRef.current.getStack().length > 0;

      if (e.code === 'Digit1') (st === 'playing' || st === 'paused') && g.eatFruit(0);
      else if (e.code === 'Digit2') (st === 'playing' || st === 'paused') && g.eatFruit(1);
      else if (e.code === 'Digit3') (st === 'playing' || st === 'paused') && g.eatFruit(2);
      else if (e.code === 'Digit4') (st === 'playing' || st === 'paused') && g.eatFruit(3);
      else if (e.code === 'Digit5') (st === 'playing' || st === 'paused') && g.eatFruit(4);
      else if (e.code === 'KeyE') (st === 'playing' || st === 'paused') && g.drinkEnergy();
      else if (e.code === 'KeyB') (st === 'playing' || st === 'paused') && g.useBlaster();
      else if (e.code === 'KeyS') {
        if (shopOpenRef.current) closeOverlay('shop');
        else openOverlay('shop');
      } else if (e.code === 'Escape') {
        e.preventDefault();
        if (placeholderModal) {
          setPlaceholderModal(null);
          return;
        }
        if (showTutorialModal) {
          setShowTutorialModal(false);
          return;
        }
        const popped = popTopOverlay();
        if (!popped) {
          if (st === 'playing') g.pause();
          else if (st === 'paused') g.resume();
        }
      } else if (e.code === 'KeyP') {
        if (st === 'playing' && !hasAnyOverlay) g.pause();
        else if (st === 'paused' && !hasAnyOverlay) g.resume();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [placeholderModal, showTutorialModal]);

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
  const healthColor = healthPct > 60 ? '#5eead4' : healthPct > 30 ? '#fbbf24' : '#f87171';
  const lowHealth = healthPct < 30;
  const fullHealth = healthPct >= 100;
  const curChar = CHARACTERS[stats.selectedChar] ?? CHARACTERS[0];
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
    <div
      className={`fixed inset-0 h-[100dvh] max-h-[100dvh] w-screen overflow-hidden bg-[#0b0914] font-sans text-white select-none touch-none ${
        settings.highContrast ? 'high-contrast-mode' : ''
      }`}
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 h-full w-full"
        style={{ imageRendering: 'auto' }}
      />

      {/* Achievement toast */}
      {toast && (
        <div
          key={toast.key}
          className="pointer-events-none absolute inset-x-0 top-14 z-50 flex justify-center px-4 safe-pt"
        >
          <div className="ach-toast flex items-center gap-3 rounded-2xl border border-amber-400/50 bg-gradient-to-r from-amber-500/30 to-pink-500/30 px-5 py-3 shadow-[0_0_30px_rgba(251,191,36,0.45)] backdrop-blur-md">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-400/20 border border-amber-400/40">
              <AchievementIconRenderer icon={toast.ach.icon} className="w-6 h-6 text-amber-300" />
            </div>
            <div>
              <div className="text-[10px] font-black uppercase tracking-widest text-amber-300">
                Achievement Unlocked!
              </div>
              <div className="text-base font-black">{toast.ach.name}</div>
              <div className="text-[11px] text-white/70">{toast.ach.desc}</div>
              {(toast.ach.stars || toast.ach.blasters) && (
                <div className="mt-0.5 text-[11px] font-black text-amber-200">
                  {toast.ach.stars ? `+${toast.ach.stars} Stars` : ''}
                  {toast.ach.stars && toast.ach.blasters ? '  ·  ' : ''}
                  {toast.ach.blasters ? `+${toast.ach.blasters} Blaster` : ''}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Action / Purchase Feedback Toast */}
      {feedbackToast && (
        <div
          key={feedbackToast.key}
          className="pointer-events-none absolute inset-x-0 bottom-24 z-50 flex justify-center px-4"
        >
          <div
            className={`flex items-center gap-2 rounded-2xl border px-4 py-2.5 text-xs sm:text-sm font-black shadow-2xl backdrop-blur-md transition-all ${
              feedbackToast.success
                ? 'border-emerald-400/60 bg-emerald-950/90 text-emerald-200 shadow-emerald-500/25'
                : 'border-rose-400/60 bg-rose-950/90 text-rose-200 shadow-rose-500/25'
            }`}
          >
            <span className="text-base">{feedbackToast.success ? '✓' : '⚠'}</span>
            <span>{feedbackToast.message}</span>
          </div>
        </div>
      )}

      {/* ============ HUD (playing) ============ */}
      {inRun && !shopOpen && (
        <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex items-start justify-between gap-2 p-2 sm:p-4 safe-pt safe-pl safe-pr">
          <div className="flex flex-col gap-1 sm:gap-2">
            {/* Level chip */}
            <div className="rounded-2xl border border-white/10 bg-black/40 px-2.5 py-1.5 backdrop-blur-md sm:px-4 sm:py-2">
              <div className="mb-1 flex items-center gap-1.5 sm:gap-2 flex-wrap max-w-[200px] sm:max-w-none">
                {stats.inChallenge ? (
                  <span className="flex items-center gap-1 animate-pulse text-[10px] sm:text-xs font-black uppercase tracking-widest text-rose-300">
                    <AlertTriangleIcon className="w-3 h-3 text-rose-400" /> CHAL {stats.level}
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-[10px] sm:text-xs font-black uppercase tracking-widest text-amber-300">
                    <LevelIcon className="w-3 h-3 text-amber-300" /> Lv {stats.level}
                  </span>
                )}
                {/* Mode Badge */}
                <span
                  className={`rounded px-1.5 py-0.5 text-[8px] sm:text-[9px] font-black uppercase tracking-wider ${
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
                    <ChallengeIconRenderer icon={m.icon} className="w-3 h-3 text-amber-300" />
                  </span>
                ))}
                {stats.activeEffects.map((e) => (
                  <span
                    key={e}
                    className={`animate-pulse rounded px-1.5 py-0.5 text-[8px] font-black ${
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
                <span className="ml-auto text-[9px] sm:text-[10px] font-bold text-white/50">
                  {stats.jarsThisLevel}/{stats.levelQuota}
                </span>
              </div>
              <div className="relative h-2 sm:h-2.5 w-32 sm:w-48 md:w-64 overflow-hidden rounded-full bg-white/10">
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
                  <LungsIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" pulse={lowHealth && !settings.reducedMotion} />
                </div>
                <span className="text-[9px] sm:text-xs font-bold uppercase tracking-widest text-white/70">
                  Lungs
                </span>
                {stats.isPassiveRecovering && (
                  <span className="flex items-center gap-1 animate-pulse rounded bg-emerald-400/25 px-1.5 py-0.5 text-[8px] sm:text-[10px] font-black text-emerald-300 border border-emerald-400/40">
                    <ShieldIcon className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-emerald-300" /> Regen
                  </span>
                )}
                {stats.regenBuff > 0 && (
                  <span className="flex items-center gap-0.5 animate-pulse rounded bg-cyan-400/20 px-1.5 py-0.5 text-[8px] sm:text-[10px] font-black text-cyan-300">
                    <ZapIcon className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-cyan-300" /> DRINK
                  </span>
                )}
                <span
                  className="ml-auto text-xs sm:text-sm font-bold tabular-nums"
                  style={{ color: healthColor }}
                >
                  {Math.round(healthPct)}%
                </span>
              </div>
              <div className="relative h-2 sm:h-2.5 w-32 sm:w-48 md:w-64 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full transition-[width] duration-100 ease-out"
                  style={{
                    width: `${healthPct}%`,
                    background: `linear-gradient(90deg, ${healthColor}, ${healthColor}dd)`,
                    boxShadow: `0 0 10px ${healthColor}`,
                  }}
                />
                {stats.regenBuff > 0 && (
                  <div className="absolute inset-0 animate-pulse rounded-full bg-cyan-400/25" />
                )}
                {lowHealth && !settings.reducedMotion && (
                  <div className="absolute inset-0 animate-pulse rounded-full bg-red-500/30" />
                )}
              </div>
            </div>

            {/* Bank + Score row */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              <div className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-black/40 px-2 py-1 backdrop-blur-md sm:px-3 sm:py-1.5">
                <MoneyIcon className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-xs sm:text-sm font-black tabular-nums text-emerald-300">
                  ${stats.money.toLocaleString()}
                </span>
              </div>
              <div className="rounded-xl border border-white/10 bg-black/40 px-2 py-1 backdrop-blur-md sm:px-3 sm:py-1.5 text-left">
                <span className="text-xs sm:text-sm font-black tabular-nums text-amber-300">
                  Score: ${stats.score.toLocaleString()}
                </span>
              </div>
              {stats.combo > 1.05 && (
                <div
                  className="rounded-xl border border-pink-500/60 bg-pink-500/20 px-2 py-0.5 text-center backdrop-blur-md shadow-[0_0_12px_rgba(236,72,153,0.4)]"
                  style={{
                    transform: `scale(${1 + Math.min(0.2, (stats.combo - 1) * 0.1)})`,
                  }}
                >
                  <span className="text-xs font-black tabular-nums text-pink-200">
                    x{stats.combo.toFixed(1)}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Right quick controls */}
          <div className="pointer-events-auto flex flex-col items-end gap-1.5 sm:gap-2">
            <div className="flex gap-1 sm:gap-1.5">
              <button
                type="button"
                onClick={() => setShowHelp(true)}
                onTouchStart={(e) => e.stopPropagation()}
                aria-label="How to play guide"
                className="tap-target-44 flex items-center justify-center gap-1 rounded-xl border border-sky-400/40 bg-sky-500/20 px-2.5 py-1 text-xs font-black uppercase text-sky-100 backdrop-blur-md transition hover:bg-sky-500/30 active:scale-90"
              >
                <HelpIcon className="w-4 h-4 text-sky-300" />
                <span className="hidden sm:inline">Help</span>
              </button>
              <button
                type="button"
                onClick={toggleMusic}
                onTouchStart={(e) => e.stopPropagation()}
                aria-label={musicOn ? 'Mute background music' : 'Unmute background music'}
                className={`tap-target-44 flex items-center justify-center rounded-xl border px-2.5 py-1 text-xs backdrop-blur-md transition active:scale-90 ${
                  musicOn
                    ? 'border-emerald-400/40 bg-emerald-500/20 text-emerald-300'
                    : 'border-white/10 bg-black/40 opacity-60 text-white/50'
                }`}
              >
                {musicOn ? <MusicIcon className="w-4 h-4" /> : <VolumeOffIcon className="w-4 h-4" />}
              </button>
              <button
                type="button"
                onClick={toggleSfx}
                onTouchStart={(e) => e.stopPropagation()}
                aria-label={sfxOn ? 'Mute sound effects' : 'Unmute sound effects'}
                className={`tap-target-44 flex items-center justify-center rounded-xl border px-2.5 py-1 text-xs backdrop-blur-md transition active:scale-90 ${
                  sfxOn
                    ? 'border-emerald-400/40 bg-emerald-500/20 text-emerald-300'
                    : 'border-white/10 bg-black/40 opacity-60 text-white/50'
                }`}
              >
                {sfxOn ? <VolumeOnIcon className="w-4 h-4" /> : <VolumeOffIcon className="w-4 h-4" />}
              </button>
            </div>

            <div className="flex gap-1.5">
              <button
                type="button"
                onClick={() => openShop()}
                onTouchStart={(e) => e.stopPropagation()}
                aria-label="Open smoke shop"
                className="tap-target-44 flex items-center justify-center gap-1.5 rounded-2xl bg-gradient-to-r from-amber-400 to-pink-500 px-3.5 py-2 font-black uppercase text-slate-900 shadow-md shadow-pink-500/25 transition hover:brightness-110 active:scale-95"
              >
                <ShopIcon className="w-4 h-4 text-slate-900" />
                <span className="text-xs sm:text-sm">Shop</span>
              </button>

              <button
                type="button"
                onClick={() => gameRef.current?.pause()}
                onTouchStart={(e) => e.stopPropagation()}
                aria-label="Pause game"
                className="tap-target-44 flex items-center justify-center gap-1 rounded-xl border border-white/15 bg-black/50 px-3 py-1 text-xs font-bold uppercase text-white/80 backdrop-blur-md transition hover:bg-black/70"
              >
                <PauseIcon className="w-4 h-4" />
                <span>Pause</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============ BOTTOM CONTROLS & DEDICATED HOLD-TO-SMOKE BUTTON ============ */}
      {inRun && !shopOpen && (
        <div
          className={`pointer-events-none absolute inset-x-0 bottom-2 z-10 flex items-center justify-between gap-2 px-2 sm:px-4 safe-pb safe-pl safe-pr ${
            settings.leftHanded ? 'flex-row-reverse' : 'flex-row'
          }`}
        >
          {/* Quick Fruits & Items Bar */}
          <div className="pointer-events-auto flex max-w-[calc(100vw-90px)] sm:max-w-xl gap-1 overflow-x-auto rounded-2xl border border-white/10 bg-black/60 p-1 backdrop-blur-md custom-scrollbar">
            {FRUITS.map((f, i) => {
              const affordable = stats.money >= f.cost;
              return (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => gameRef.current?.eatFruit(i)}
                  onTouchStart={(e) => e.stopPropagation()}
                  disabled={!affordable || fullHealth}
                  aria-label={`Buy and eat ${f.name} for $${f.cost}`}
                  className={`tap-target-44 flex min-w-[44px] sm:min-w-[54px] flex-col items-center justify-center rounded-xl p-1 transition active:scale-90 ${
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
              aria-label={`Drink Energy Can, ${stats.drinkStock} in stock`}
              className={`tap-target-44 flex min-w-[44px] sm:min-w-[54px] flex-col items-center justify-center rounded-xl p-1 transition active:scale-90 ${
                fullHealth || stats.drinkStock <= 0
                  ? 'bg-white/5 text-white/35'
                  : 'bg-gradient-to-b from-cyan-500/30 to-cyan-600/10 hover:from-cyan-500/45'
              }`}
            >
              <div className={`p-0.5 ${fullHealth || stats.drinkStock <= 0 ? 'grayscale opacity-40' : ''}`}>
                <ZapIcon className="w-5 h-5 sm:w-6 sm:h-6 text-cyan-300" />
              </div>
              <span className="text-[8px] sm:text-[9px] font-black tabular-nums text-cyan-300">
                ×{stats.drinkStock}
              </span>
            </button>
            <button
              type="button"
              onClick={() => gameRef.current?.useBlaster()}
              onTouchStart={(e) => e.stopPropagation()}
              disabled={stats.smokeBlasters <= 0}
              aria-label={`Use Smoke Blaster, ${stats.smokeBlasters} remaining`}
              className={`tap-target-44 flex min-w-[44px] sm:min-w-[54px] flex-col items-center justify-center rounded-xl p-1 transition active:scale-90 ${
                stats.smokeBlasters <= 0
                  ? 'bg-white/5 text-white/35'
                  : 'bg-gradient-to-b from-orange-500/35 to-red-600/15 hover:from-orange-500/50 shadow-[0_0_12px_rgba(249,115,22,0.35)]'
              }`}
            >
              <div className={`p-0.5 ${stats.smokeBlasters <= 0 ? 'grayscale opacity-40' : ''}`}>
                <BlasterIcon className="w-5 h-5 sm:w-6 sm:h-6 text-orange-400" />
              </div>
              <span className="text-[8px] sm:text-[9px] font-black tabular-nums text-orange-300">
                ×{stats.smokeBlasters}
              </span>
            </button>
          </div>

          {/* Dedicated Hold-to-Smoke Touch Action Button */}
          <div className="pointer-events-auto">
            <button
              type="button"
              onTouchStart={(e) => {
                e.preventDefault();
                e.stopPropagation();
                gameRef.current?.startSmoking();
              }}
              onTouchEnd={(e) => {
                e.preventDefault();
                e.stopPropagation();
                gameRef.current?.stopSmoking();
              }}
              onTouchCancel={(e) => {
                e.preventDefault();
                e.stopPropagation();
                gameRef.current?.stopSmoking();
              }}
              onMouseDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
                gameRef.current?.startSmoking();
              }}
              onMouseUp={(e) => {
                e.preventDefault();
                e.stopPropagation();
                gameRef.current?.stopSmoking();
              }}
              onMouseLeave={(e) => {
                e.preventDefault();
                e.stopPropagation();
                gameRef.current?.stopSmoking();
              }}
              aria-label="Hold to smoke"
              className="smoke-button-pulse flex h-14 w-14 sm:h-16 sm:w-16 flex-col items-center justify-center rounded-2xl border-2 border-amber-300 bg-gradient-to-br from-amber-400 via-orange-500 to-pink-600 text-slate-950 shadow-2xl transition active:scale-90"
            >
              <FlameIcon className="w-6 h-6 text-slate-950" />
              <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-tighter">SMOKE</span>
            </button>
          </div>
        </div>
      )}

      {/* ============ SHOP MODAL ============ */}
      {shopOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Smoke Shop"
          className="fixed inset-0 z-40 flex items-center justify-center bg-black/80 backdrop-blur-md p-3 sm:p-4"
          onClick={closeShop}
          onTouchStart={(e) => e.stopPropagation()}
        >
          <div
            className="flex max-h-[88dvh] w-full max-w-lg flex-col justify-between overflow-hidden rounded-3xl border border-white/15 bg-gradient-to-b from-slate-900/98 via-[#160d29]/98 to-slate-950/98 shadow-2xl text-white"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between gap-2 border-b border-white/10 p-3 sm:p-4">
              <div className="flex items-center gap-2">
                <ShopIcon className="w-5 h-5 text-amber-300" />
                <h2 className="text-base sm:text-lg font-black uppercase tracking-tight">Smoke Shop</h2>
                {stats.activeEffects.includes('-20%') && (
                  <span className="rounded bg-sky-500/20 px-1.5 py-0.5 text-[9px] font-black text-sky-300">
                    SALE −20%
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="flex items-center gap-1 rounded-lg bg-emerald-500/15 px-2.5 py-1 font-black tabular-nums text-emerald-300">
                  <MoneyIcon className="w-3.5 h-3.5 text-emerald-400" /> ${stats.money.toLocaleString()}
                </span>
                <button
                  type="button"
                  onClick={closeShop}
                  aria-label="Close shop"
                  className="rounded-lg border border-white/15 bg-white/5 px-2.5 py-1 font-bold text-white/70 transition hover:bg-white/15"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 border-b border-white/10 p-2">
              <ShopTabButton active={shopTab === 'smokers'} onClick={() => setShopTab('smokers')}>
                <span className="flex items-center justify-center gap-1">
                  <MicIcon className="w-3.5 h-3.5" /> Smokers
                </span>
              </ShopTabButton>
              <ShopTabButton active={shopTab === 'tools'} onClick={() => setShopTab('tools')}>
                <span className="flex items-center justify-center gap-1">
                  <FlameIcon className="w-3.5 h-3.5" /> Tools
                </span>
              </ShopTabButton>
              <ShopTabButton active={shopTab === 'fruit'} onClick={() => setShopTab('fruit')}>
                <span className="flex items-center justify-center gap-1">
                  <AppleIcon className="w-3.5 h-3.5" /> Fruit
                </span>
              </ShopTabButton>
              <ShopTabButton active={shopTab === 'drinks'} onClick={() => setShopTab('drinks')}>
                <span className="flex items-center justify-center gap-1">
                  <ZapIcon className="w-3.5 h-3.5" /> Drinks
                </span>
              </ShopTabButton>
            </div>

            {/* Content Body */}
            <div className="flex-1 overflow-y-auto p-3 custom-scrollbar">
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
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-white/10 p-2.5 sm:p-3">
              <button
                type="button"
                onClick={closeShop}
                className="w-full rounded-2xl bg-gradient-to-r from-amber-400 to-pink-500 py-3 text-xs sm:text-sm font-black uppercase tracking-wider text-slate-950 transition hover:brightness-110 active:scale-[0.98]"
              >
                Back to Game
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============ START MENU ============ */}
      {state === 'menu' &&
        !shopOpen &&
        !showCloud &&
        !showAch &&
        !showHelp &&
        !showLevels &&
        !showSettings &&
        !showTutorialModal &&
        !placeholderModal && (
          <div
            className="fixed inset-0 z-20 flex items-center justify-center bg-black/70 backdrop-blur-md p-2 sm:p-4 safe-pt safe-pb safe-pl safe-pr overflow-y-auto custom-scrollbar"
            onTouchStart={(e) => e.stopPropagation()}
          >
            <div className="relative flex max-h-[96dvh] w-full max-w-md flex-col justify-between overflow-y-auto custom-scrollbar rounded-3xl border border-white/15 bg-gradient-to-b from-slate-900/95 via-[#160d29]/95 to-slate-950/95 p-3 sm:p-4 text-center shadow-2xl">
              {/* Header */}
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

              {/* Game Mode Selector */}
              <div className="my-2 rounded-2xl border border-white/10 bg-black/40 p-2 text-left">
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
                        className={`tap-target-44 flex items-center justify-center gap-1 rounded-xl border py-1.5 px-1 text-center transition active:scale-95 ${
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
              </div>

              {/* Primary Action Buttons */}
              <div className="space-y-1.5 my-1">
                {stats.hasActiveRun ? (
                  <>
                    <button
                      type="button"
                      onClick={() => gameRef.current?.continueRun()}
                      className="tap-target-44 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 py-3 text-sm font-black uppercase tracking-wider text-slate-950 shadow-lg shadow-emerald-500/30 transition hover:brightness-110 active:scale-[0.98]"
                    >
                      <PlayIcon className="w-4 h-4" />
                      <span>
                        Continue Run (Lv {stats.activeRunLevel || stats.level} · $
                        {(stats.activeRunScore || stats.score).toLocaleString()})
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        triggerConfirm({
                          title: 'Start New Run?',
                          message: `You have an active run in progress at Level ${
                            stats.activeRunLevel || stats.level
                          } ($${(stats.activeRunScore || stats.score).toLocaleString()}). Starting a new run will overwrite it. Your banked cash and achievements are kept permanently.`,
                          confirmText: 'Start New Run',
                          cancelText: 'Keep Saved Run',
                          isDestructive: true,
                          onConfirm: () => {
                            closeOverlay('confirm');
                            gameRef.current?.start(selectedMode);
                          },
                        })
                      }
                      className="tap-target-44 flex w-full items-center justify-center gap-1.5 rounded-xl border border-white/15 bg-white/5 py-2 text-xs font-bold uppercase tracking-wider text-white/70 transition hover:bg-white/10 active:scale-95"
                    >
                      <RotateCcwIcon className="w-3.5 h-3.5 text-white/60" />
                      <span>New Game ({GAME_MODES[selectedMode]?.name})</span>
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => gameRef.current?.start(selectedMode)}
                    className="tap-target-44 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber-400 via-pink-500 to-purple-500 py-3 text-sm font-black uppercase tracking-wider text-slate-950 shadow-lg shadow-pink-500/30 transition hover:brightness-110 active:scale-[0.98]"
                  >
                    <PlayIcon className="w-4 h-4" />
                    <span>Start Run ({GAME_MODES[selectedMode]?.name})</span>
                  </button>
                )}
              </div>

              {/* Quick Metrics */}
              <div className="grid grid-cols-3 gap-1.5 text-center text-xs my-1">
                <div className="rounded-xl border border-emerald-400/25 bg-emerald-500/10 p-1.5">
                  <div className="flex items-center justify-center gap-1 text-emerald-400 mb-0.5">
                    <MoneyIcon className="w-3 h-3" />
                    <span className="text-[9px] uppercase tracking-wider text-white/50">Bank</span>
                  </div>
                  <div className="text-xs sm:text-sm font-black tabular-nums text-emerald-300 truncate">
                    ${stats.money.toLocaleString()}
                  </div>
                </div>
                <div className="rounded-xl border border-amber-400/25 bg-amber-500/10 p-1.5">
                  <div className="flex items-center justify-center gap-1 text-amber-400 mb-0.5">
                    <TrophyIcon className="w-3 h-3" />
                    <span className="text-[9px] uppercase tracking-wider text-white/50">High</span>
                  </div>
                  <div className="text-xs sm:text-sm font-black tabular-nums text-amber-300 truncate">
                    ${stats.highScore.toLocaleString()}
                  </div>
                </div>
                <div className="rounded-xl border border-purple-400/25 bg-purple-500/10 p-1.5">
                  <div className="flex items-center justify-center gap-1 text-purple-400 mb-0.5">
                    <LevelIcon className="w-3 h-3" />
                    <span className="text-[9px] uppercase tracking-wider text-white/50">Best</span>
                  </div>
                  <div className="text-xs sm:text-sm font-black tabular-nums text-purple-300 truncate">
                    Lv {stats.bestLevel || 1}
                  </div>
                </div>
              </div>

              {/* Primary Game Features (6 Grid items) */}
              <div className="my-1">
                <div className="mb-1 text-left text-[9px] font-black uppercase tracking-widest text-white/40">
                  Game Features
                </div>
                <div className="grid grid-cols-3 gap-1 text-xs">
                  <button
                    type="button"
                    onClick={() => openOverlay('shop')}
                    className="tap-target-44 flex items-center justify-center gap-1 rounded-xl border border-amber-400/30 bg-amber-500/10 py-2 px-1 text-[11px] font-bold text-amber-200 transition hover:bg-amber-500/20 active:scale-95"
                  >
                    <ShopIcon className="w-3.5 h-3.5 text-amber-300" />
                    <span>Shop</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => openOverlay('levels')}
                    className="tap-target-44 flex items-center justify-center gap-1 rounded-xl border border-purple-400/30 bg-purple-500/10 py-2 px-1 text-[11px] font-bold text-purple-200 transition hover:bg-purple-500/20 active:scale-95"
                  >
                    <LevelIcon className="w-3.5 h-3.5 text-purple-300" />
                    <span>Levels</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => openOverlay('achievements')}
                    className="tap-target-44 flex items-center justify-center gap-1 rounded-xl border border-pink-400/30 bg-pink-500/10 py-2 px-1 text-[11px] font-bold text-pink-200 transition hover:bg-pink-500/20 active:scale-95"
                  >
                    <AwardIcon className="w-3.5 h-3.5 text-pink-300" />
                    <span>Badges</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => openOverlay('cloud')}
                    className="tap-target-44 flex items-center justify-center gap-1 rounded-xl border border-sky-400/30 bg-sky-500/10 py-2 px-1 text-[11px] font-bold text-sky-200 transition hover:bg-sky-500/20 active:scale-95"
                  >
                    <CloudIcon className="w-3.5 h-3.5 text-sky-300" />
                    <span>Cloud</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => openOverlay('settings')}
                    className="tap-target-44 flex items-center justify-center gap-1 rounded-xl border border-slate-400/30 bg-slate-500/10 py-2 px-1 text-[11px] font-bold text-slate-200 transition hover:bg-slate-500/20 active:scale-95"
                  >
                    <SettingsIcon className="w-3.5 h-3.5 text-slate-300" />
                    <span>Settings</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => openOverlay('help')}
                    className="tap-target-44 flex items-center justify-center gap-1 rounded-xl border border-cyan-400/30 bg-cyan-500/10 py-2 px-1 text-[11px] font-bold text-cyan-200 transition hover:bg-cyan-500/20 active:scale-95"
                  >
                    <HelpIcon className="w-3.5 h-3.5 text-cyan-300" />
                    <span>Guide</span>
                  </button>
                </div>
              </div>

              {/* Online & Community Placeholders (Clearly marked Demo / Offline) */}
              <div className="my-1">
                <div className="mb-1 text-left text-[9px] font-black uppercase tracking-widest text-amber-300/70">
                  Online &amp; Rewards (Play Store Demo)
                </div>
                <div className="grid grid-cols-4 gap-1 text-[10px]">
                  <button
                    type="button"
                    onClick={() => setPlaceholderModal('leaderboards')}
                    className="tap-target-44 flex flex-col items-center justify-center rounded-xl border border-amber-400/20 bg-black/40 p-1 text-amber-200/90 transition hover:bg-black/60 active:scale-95"
                  >
                    <TrophyIcon className="w-4 h-4 text-amber-300 mb-0.5" />
                    <span className="font-bold">Ranks</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPlaceholderModal('topup')}
                    className="tap-target-44 flex flex-col items-center justify-center rounded-xl border border-yellow-400/20 bg-black/40 p-1 text-yellow-200/90 transition hover:bg-black/60 active:scale-95"
                  >
                    <StarIcon className="w-4 h-4 text-yellow-400 mb-0.5" />
                    <span className="font-bold">Top-Up</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPlaceholderModal('remove_ads')}
                    className="tap-target-44 flex flex-col items-center justify-center rounded-xl border border-purple-400/20 bg-black/40 p-1 text-purple-200/90 transition hover:bg-black/60 active:scale-95"
                  >
                    <ShieldIcon className="w-4 h-4 text-purple-300 mb-0.5" />
                    <span className="font-bold">VIP Pass</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPlaceholderModal('account')}
                    className="tap-target-44 flex flex-col items-center justify-center rounded-xl border border-sky-400/20 bg-black/40 p-1 text-sky-200/90 transition hover:bg-black/60 active:scale-95"
                  >
                    <CloudIcon className="w-4 h-4 text-sky-300 mb-0.5" />
                    <span className="font-bold">Account</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      {/* ============ HOW TO PLAY MODAL ============ */}
      {showHelp && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="How to play guide"
          className="fixed inset-0 z-40 flex items-center justify-center bg-black/80 backdrop-blur-md p-3 sm:p-4"
        >
          <div className="mx-auto flex max-h-[88dvh] w-full max-w-lg flex-col justify-between rounded-3xl border border-white/10 bg-gradient-to-b from-slate-900/98 to-[#1a0b2e]/98 shadow-2xl">
            <div className="flex items-center justify-between gap-2 border-b border-white/10 p-3 sm:p-4">
              <div className="flex items-center gap-2">
                <HelpIcon className="w-5 h-5 text-cyan-300" />
                <h2 className="text-base sm:text-lg font-black uppercase tracking-tight">How to Play</h2>
              </div>
              <button
                type="button"
                onClick={() => closeOverlay('help')}
                className="rounded-lg border border-white/15 bg-white/5 px-2.5 py-1 text-xs font-bold text-white/70 transition hover:bg-white/15"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 space-y-4 overflow-y-auto p-4 text-xs sm:text-sm leading-relaxed text-white/80 custom-scrollbar">
              <section>
                <h3 className="mb-1 text-sm font-black uppercase tracking-wide text-amber-300">Basic Gameplay</h3>
                <p>
                  Hold the <b className="text-white">SMOKE button</b> (or tap/hold anywhere on screen) to blow smoke into the jar. Fill each jar to 100% to bank cash. Release to preserve your lungs.
                </p>
              </section>

              <section>
                <h3 className="mb-1 text-sm font-black uppercase tracking-wide text-emerald-300">Lung Health &amp; Passive Healing</h3>
                <p>
                  Smoking burns your lung health. Stop smoking for <b className="text-white">1.0 second</b> to activate automatic passive recovery (up to 80% HP). Eat fruit to heal immediately, or use Avocado for instant <b className="text-amber-200">100% full recovery</b>.
                </p>
              </section>

              <section>
                <h3 className="mb-1 text-sm font-black uppercase tracking-wide text-purple-300">Permanent Upgrades</h3>
                <p>
                  Cash and golden stars are saved permanently. Upgrade to legendary celebrity smokers and power smoking tools in the Shop!
                </p>
              </section>
            </div>

            <div className="border-t border-white/10 p-3">
              <button
                type="button"
                onClick={() => closeOverlay('help')}
                className="w-full rounded-2xl bg-gradient-to-r from-sky-400 to-indigo-500 py-3 text-xs font-black uppercase tracking-wider text-slate-950 transition hover:brightness-110 active:scale-[0.98]"
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============ ACHIEVEMENTS PANEL ============ */}
      {showAch && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Achievements"
          className="fixed inset-0 z-40 flex items-center justify-center bg-black/75 backdrop-blur-md p-3 sm:p-4"
          onTouchStart={(e) => e.stopPropagation()}
        >
          <div className="mx-auto flex max-h-[88dvh] w-full max-w-lg flex-col justify-between rounded-3xl border border-white/10 bg-slate-900/98 p-4 shadow-2xl custom-scrollbar overflow-y-auto">
            <div className="mb-2 flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-xl font-black uppercase tracking-tight">
                <AwardIcon className="w-5 h-5 text-amber-300" />
                <span>Achievements</span>
                <span className="text-sm text-white/50">
                  {achUnlocked}/{achCount}
                </span>
              </h2>
              <button
                type="button"
                onClick={() => closeOverlay('achievements')}
                className="rounded-lg border border-white/15 bg-white/5 px-2.5 py-1 text-xs font-bold text-white/70 transition hover:bg-white/15"
              >
                ✕
              </button>
            </div>

            <div className="grid flex-1 auto-rows-min grid-cols-2 gap-2 overflow-y-auto sm:grid-cols-3 custom-scrollbar">
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
                      <AchievementIconRenderer icon={a.icon} className="w-6 h-6" />
                    </div>
                    <div className={`text-[11px] font-black leading-tight ${got ? 'text-amber-200' : 'text-white/50'}`}>
                      {a.name}
                    </div>
                    <div className="mt-0.5 text-[9px] leading-tight text-white/40">{a.desc}</div>
                  </div>
                );
              })}
            </div>

            <div className="border-t border-white/10 pt-3 mt-2">
              <button
                type="button"
                onClick={() => closeOverlay('achievements')}
                className="w-full rounded-2xl bg-gradient-to-r from-pink-500 to-purple-500 py-2.5 text-xs font-black uppercase text-slate-950"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============ CLOUD SAVE ============ */}
      {showCloud && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Cloud Save"
          className="fixed inset-0 z-40 flex items-center justify-center bg-black/75 backdrop-blur-md p-3 sm:p-4"
          onTouchStart={(e) => e.stopPropagation()}
        >
          <div className="mx-auto w-full max-w-md rounded-3xl border border-white/10 bg-slate-900/98 p-5 shadow-2xl">
            <div className="mb-2 flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-xl font-black uppercase tracking-tight">
                <CloudIcon className="w-5 h-5 text-sky-300" />
                <span>Cloud Save</span>
              </h2>
              <button
                type="button"
                onClick={() => closeOverlay('cloud')}
                className="rounded-lg border border-white/15 bg-white/5 px-2.5 py-1 text-xs font-bold text-white/70 transition hover:bg-white/15"
              >
                ✕
              </button>
            </div>
            <p className="mb-3 text-xs text-white/50">Export or import backup save codes</p>

            <button
              type="button"
              onClick={genCloudCode}
              className="w-full rounded-2xl bg-gradient-to-r from-sky-400 to-indigo-500 px-4 py-2.5 text-xs font-black uppercase tracking-wider text-slate-900 transition hover:brightness-110 active:scale-[0.98]"
            >
              Generate Cloud Code
            </button>

            {generatedCode && (
              <div className="mt-2">
                <textarea
                  readOnly
                  value={generatedCode}
                  rows={2}
                  className="w-full resize-none rounded-xl border border-white/15 bg-black/50 p-2 font-mono text-[10px] text-white outline-none"
                />
                <button
                  type="button"
                  onClick={copyCloud}
                  className="mt-1 w-full rounded-xl border border-sky-400/40 bg-sky-500/15 py-1.5 text-xs font-black uppercase text-sky-200 transition hover:bg-sky-500/25 active:scale-95"
                >
                  Copy Code
                </button>
              </div>
            )}

            <div className="my-3 border-t border-white/10" />

            <textarea
              value={inputCode}
              onChange={(e) => setInputCode(e.target.value)}
              rows={2}
              placeholder="Paste a Cloud Code here…"
              className="w-full resize-none rounded-xl border border-white/15 bg-black/50 p-2 font-mono text-[10px] text-white outline-none placeholder:text-white/30"
            />
            <button
              type="button"
              onClick={restoreCloud}
              className="mt-2 w-full rounded-2xl bg-gradient-to-r from-emerald-400 to-teal-500 px-4 py-2.5 text-xs font-black uppercase tracking-wider text-slate-900 transition hover:brightness-110 active:scale-[0.98]"
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
          onClose={() => closeOverlay('levels')}
        />
      )}

      {/* ============ SETTINGS MODAL ============ */}
      {showSettings && (
        <SettingsModal
          settings={settings}
          updateSettings={updateSettings}
          musicOn={musicOn}
          sfxOn={sfxOn}
          masterVol={masterVol}
          toggleMusic={toggleMusic}
          toggleSfx={toggleSfx}
          changeVolume={changeVolume}
          onReplayTutorial={() => {
            closeOverlay('settings');
            setShowTutorialModal(true);
          }}
          onClose={() => closeOverlay('settings')}
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
          onCancel={() => closeOverlay('confirm')}
        />
      )}

      {/* ============ TUTORIAL MODAL ============ */}
      <TutorialModal
        isOpen={showTutorialModal}
        onClose={() => {
          try {
            localStorage.setItem('smokeItUp.tutorialSeen.v1', 'true');
          } catch {
            // ignore
          }
          setShowTutorialModal(false);
        }}
      />

      {/* ============ PLACEHOLDER MODALS ============ */}
      <PlaceholderModal
        type={placeholderModal}
        bank={stats.money}
        goldenStars={stats.goldenStars}
        highScore={stats.highScore}
        onClose={() => setPlaceholderModal(null)}
      />

      {/* ============ PAUSE MENU ============ */}
      {state === 'paused' &&
        !shopOpen &&
        !showLevels &&
        !showSettings &&
        !showAch &&
        !showCloud &&
        !showHelp &&
        !confirmModal &&
        !placeholderModal &&
        !showTutorialModal && (
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Pause menu"
            className="fixed inset-0 z-30 flex items-center justify-center bg-black/75 p-3 backdrop-blur-md safe-pt safe-pb safe-pl safe-pr"
            onTouchStart={(e) => e.stopPropagation()}
          >
            <div className="mx-auto flex max-h-[88dvh] w-full max-w-md flex-col justify-between overflow-y-auto custom-scrollbar rounded-3xl border border-white/15 bg-gradient-to-b from-slate-900/98 to-[#150a26]/98 p-4 text-center shadow-2xl sm:p-5">
              <div>
                <div className="mb-1 text-3xl">⏸</div>
                <h2 className="text-xl font-black uppercase tracking-tight text-white sm:text-2xl">
                  Game Paused
                </h2>
                <div className="mb-2 flex items-center justify-center gap-2">
                  <span
                    className={`rounded-lg px-2 py-0.5 text-[10px] font-black uppercase tracking-wider ${
                      stats.gameMode === 'relaxed'
                        ? 'border border-teal-400/40 bg-teal-500/20 text-teal-300'
                        : stats.gameMode === 'rush'
                          ? 'border border-amber-400/40 bg-amber-500/20 text-amber-300'
                          : 'border border-indigo-400/40 bg-indigo-500/20 text-indigo-300'
                    }`}
                  >
                    {GAME_MODES[stats.gameMode]?.name || 'Classic'} Mode
                  </span>
                  <span className="text-xs font-bold text-white/60">Level {stats.level}</span>
                </div>

                <div className="mb-3 grid grid-cols-3 gap-1.5 text-left text-xs">
                  <StatBox label="Score" value={`$${stats.score.toLocaleString()}`} />
                  <StatBox label="Cash" value={`$${stats.money.toLocaleString()}`} />
                  <StatBox label="HP" value={`${Math.round(healthPct)}%`} />
                </div>
              </div>

              {/* 1. Resume Game */}
              <button
                type="button"
                onClick={() => gameRef.current?.resume()}
                className="tap-target-44 mb-1.5 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-400 to-teal-400 py-3 text-sm font-black uppercase tracking-wider text-slate-950 shadow-lg shadow-emerald-500/30 transition hover:brightness-110 active:scale-[0.98]"
              >
                <PlayIcon className="w-4 h-4" />
                <span>Resume Game</span>
              </button>

              {/* 2. Save & Main Menu */}
              <button
                type="button"
                onClick={() => gameRef.current?.saveAndToMenu()}
                className="tap-target-44 mb-2 flex w-full items-center justify-center gap-2 rounded-2xl border border-sky-400/40 bg-sky-500/20 py-2.5 text-xs font-black uppercase tracking-wider text-sky-200 shadow-md transition hover:bg-sky-500/30 active:scale-[0.98]"
              >
                <HomeIcon className="w-4 h-4 text-sky-300" />
                <span>Save &amp; Main Menu</span>
              </button>

              {/* In-Run System Panels */}
              <div className="mb-2 grid grid-cols-3 gap-1 text-xs">
                <button
                  type="button"
                  onClick={() => openOverlay('levels')}
                  className="tap-target-44 flex items-center justify-center gap-1 rounded-xl border border-purple-400/40 bg-purple-500/15 py-2 font-black text-purple-200"
                >
                  <LevelIcon className="w-3.5 h-3.5 text-purple-300" />
                  <span>Levels</span>
                </button>
                <button
                  type="button"
                  onClick={() => openOverlay('shop')}
                  className="tap-target-44 flex items-center justify-center gap-1 rounded-xl border border-amber-400/40 bg-amber-500/15 py-2 font-black text-amber-200"
                >
                  <ShopIcon className="w-3.5 h-3.5 text-amber-300" />
                  <span>Shop</span>
                </button>
                <button
                  type="button"
                  onClick={() => openOverlay('settings')}
                  className="tap-target-44 flex items-center justify-center gap-1 rounded-xl border border-slate-400/40 bg-slate-500/15 py-2 font-black text-slate-200"
                >
                  <SettingsIcon className="w-3.5 h-3.5 text-slate-300" />
                  <span>Settings</span>
                </button>
              </div>

              {/* Destructive Actions */}
              <div className="grid grid-cols-2 gap-1.5 border-t border-white/10 pt-2">
                <button
                  type="button"
                  onClick={() =>
                    triggerConfirm({
                      title: 'Restart Run?',
                      message:
                        'Are you sure you want to restart this run from Level 1? All cash earned up to this point is safely banked, but current run progress will reset.',
                      confirmText: 'Yes, Restart Run',
                      cancelText: 'Cancel',
                      isDestructive: true,
                      onConfirm: () => {
                        closeOverlay('confirm');
                        gameRef.current?.restart();
                      },
                    })
                  }
                  className="tap-target-44 flex items-center justify-center gap-1 rounded-xl border border-rose-500/30 bg-rose-500/10 py-2 text-xs font-bold uppercase tracking-wider text-rose-300"
                >
                  <RotateCcwIcon className="w-3.5 h-3.5 text-rose-400" />
                  <span>Restart</span>
                </button>
                <button
                  type="button"
                  onClick={() =>
                    triggerConfirm({
                      title: 'End Active Run?',
                      message:
                        'Are you sure you want to end this run? Your earned run cash and score will be banked permanently and the run will finish.',
                      confirmText: 'End Run & Bank',
                      cancelText: 'Stay in Run',
                      isDestructive: true,
                      onConfirm: () => {
                        closeOverlay('confirm');
                        gameRef.current?.endRun();
                      },
                    })
                  }
                  className="tap-target-44 flex items-center justify-center gap-1 rounded-xl border border-white/15 bg-white/5 py-2 text-xs font-bold uppercase tracking-wider text-white/70"
                >
                  <HomeIcon className="w-3.5 h-3.5 text-white/70" />
                  <span>End Run</span>
                </button>
              </div>
            </div>
          </div>
        )}

      {/* ============ GAME OVER ============ */}
      {state === 'gameover' && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Game over"
          className="fixed inset-0 z-20 flex items-center justify-center bg-black/75 backdrop-blur-sm p-3 safe-pt safe-pb"
        >
          <div className="mx-auto w-full max-w-sm rounded-3xl border border-rose-500/30 bg-gradient-to-br from-rose-950/90 via-slate-900/90 to-slate-950/90 p-5 text-center shadow-2xl">
            <div className="mx-auto mb-1 flex h-12 w-12 items-center justify-center rounded-2xl border border-rose-500/40 bg-rose-500/15">
              <AlertTriangleIcon className="w-6 h-6 text-rose-400" />
            </div>
            <h2 className="mb-0.5 bg-gradient-to-r from-rose-300 to-amber-300 bg-clip-text text-2xl sm:text-3xl font-black uppercase tracking-tight text-transparent">
              Lungs Gave Out
            </h2>
            <p className="mb-3 text-xs text-white/50">
              You reached <span className="font-black text-purple-300">Level {stats.level}</span> as{' '}
              <span className="font-bold text-white/80">{curChar.name}</span>.
            </p>

            <div className="mb-3 space-y-1.5">
              <div className="rounded-2xl border border-amber-400/30 bg-amber-500/10 p-2.5">
                <div className="text-[9px] font-bold uppercase tracking-widest text-amber-200">Run Score</div>
                <div className="text-2xl font-black tabular-nums text-amber-300">
                  ${stats.score.toLocaleString()}
                </div>
              </div>
              <div className="rounded-2xl border border-emerald-400/30 bg-emerald-500/10 p-2.5">
                <div className="text-[9px] font-bold uppercase tracking-widest text-emerald-200">
                  Banked (kept forever)
                </div>
                <div className="text-xl font-black tabular-nums text-emerald-300 flex items-center justify-center gap-1">
                  <MoneyIcon className="w-4 h-4 text-emerald-400" />
                  <span>${stats.money.toLocaleString()}</span>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-1 text-[10px]">
                <MiniStat label="Jars" value={String(stats.containersFilled)} />
                <MiniStat label="Gold" value={String(stats.goldenFilled)} />
                <MiniStat label="Drinks" value={String(stats.energyDrinksUsed)} />
                <MiniStat label="Combo" value={`x${stats.bestCombo.toFixed(1)}`} />
              </div>
            </div>

            <button
              type="button"
              onClick={() => gameRef.current?.restart()}
              className="tap-target-44 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber-400 to-pink-500 px-6 py-3 text-sm font-black uppercase tracking-wider text-slate-900 shadow-lg shadow-pink-500/30 transition hover:brightness-110 active:scale-[0.98]"
            >
              <RotateCcwIcon className="w-4 h-4" />
              <span>Try Again</span>
            </button>
            <button
              type="button"
              onClick={() => gameRef.current?.toMenu()}
              className="tap-target-44 mt-1.5 flex w-full items-center justify-center gap-1.5 rounded-2xl border border-white/10 bg-black/40 px-6 py-2 text-xs font-bold uppercase tracking-wider text-white/70 transition hover:bg-black/60"
            >
              <HomeIcon className="w-4 h-4" />
              <span>Menu</span>
            </button>
          </div>
        </div>
      )}
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
      className={`tap-target-44 flex-1 rounded-xl px-2 py-1.5 text-xs font-black uppercase tracking-wide transition active:scale-95 ${
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
      className={`flex items-center gap-2.5 rounded-2xl border p-2.5 transition ${
        selected ? 'border-amber-400/60 bg-amber-500/10' : 'border-white/10 bg-black/30'
      }`}
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5">
        <CharacterIconRenderer icon={char.icon} className="w-5 h-5 text-amber-300" />
      </div>
      <div className="min-w-0 flex-1 text-left">
        <div className="flex items-center gap-2">
          <span className="font-black text-xs sm:text-sm">{char.name}</span>
          <span className="rounded-md bg-amber-400/15 px-1.5 py-0.5 text-[9px] font-black text-amber-300">
            x{char.mult.toFixed(1)} pay
          </span>
        </div>
        <div className="text-[10px] text-white/40 truncate">{char.blurb}</div>
      </div>
      <button
        type="button"
        onClick={onAction}
        disabled={!owned && !affordable}
        className={`tap-target-44 rounded-xl px-3 py-1.5 text-xs font-black transition active:scale-95 ${
          selected
            ? 'border border-amber-400/50 bg-amber-400/20 text-amber-200'
            : owned || affordable
              ? 'bg-gradient-to-r from-amber-400 to-pink-500 text-slate-900 shadow-md shadow-pink-500/25 hover:brightness-110'
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
  const riskColor =
    displayedDrain >= 2.5
      ? 'text-rose-300'
      : displayedDrain >= 1.3
        ? 'text-orange-300'
        : 'text-emerald-300';
  return (
    <div
      className={`flex items-center gap-2.5 rounded-2xl border p-2.5 transition ${
        selected ? 'border-sky-400/60 bg-sky-500/10' : 'border-white/10 bg-black/30'
      }`}
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5">
        <ToolIconRenderer icon={tool.icon} className="w-5 h-5 text-sky-300" />
      </div>
      <div className="min-w-0 flex-1 text-left">
        <div className="flex flex-wrap items-center gap-1">
          <span className="font-black text-xs sm:text-sm">{tool.name}</span>
          <span className="rounded-md bg-sky-400/15 px-1 py-0.5 text-[8px] sm:text-[9px] font-black text-sky-300">
            {tool.fill.toFixed(2)}x fill
          </span>
          <span className="rounded-md bg-amber-400/15 px-1 py-0.5 text-[8px] sm:text-[9px] font-black text-amber-300">
            {tool.earn.toFixed(2)}x $
          </span>
          <span className={`rounded-md bg-black/40 px-1 py-0.5 text-[8px] sm:text-[9px] font-black ${riskColor}`}>
            {displayedDrain.toFixed(2)}x dmg
          </span>
        </div>
        <div className="text-[10px] text-white/40 truncate">{tool.blurb}</div>
      </div>
      <button
        type="button"
        onClick={onAction}
        disabled={!owned && !affordable}
        className={`tap-target-44 rounded-xl px-3 py-1.5 text-xs font-black transition active:scale-95 ${
          selected
            ? 'border border-sky-400/50 bg-sky-400/20 text-sky-200'
            : owned || affordable
              ? 'bg-gradient-to-r from-sky-400 to-indigo-500 text-slate-900 shadow-md shadow-sky-500/25 hover:brightness-110'
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
    <div className="flex items-center gap-2.5 rounded-2xl border border-white/10 bg-black/30 p-2.5">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5">
        <FruitIconRenderer icon={fruit.icon} className="w-5 h-5" />
      </div>
      <div className="min-w-0 flex-1 text-left">
        <div className="flex items-center gap-2">
          <span className="font-black text-xs sm:text-sm">{fruit.name}</span>
          <span
            className={`rounded-md px-1.5 py-0.5 text-[9px] font-black ${
              isAvocado
                ? 'bg-amber-400/20 text-amber-300 border border-amber-400/30'
                : 'bg-emerald-400/15 text-emerald-300'
            }`}
          >
            {isAvocado ? 'FULL 100% HP' : `+${heal} HP`}
          </span>
        </div>
        <div className="text-[10px] text-white/40 truncate">{fruit.blurb}</div>
      </div>
      <button
        type="button"
        onClick={onBuy}
        disabled={!affordable || full}
        className={`tap-target-44 rounded-xl px-3 py-1.5 text-xs font-black tabular-nums transition active:scale-95 ${
          full
            ? 'border border-white/10 bg-white/5 text-white/30'
            : affordable
              ? 'bg-gradient-to-r from-emerald-400 to-teal-500 text-slate-900 shadow-md shadow-emerald-500/25 hover:brightness-110'
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
    <div className="rounded-xl border border-white/10 bg-black/40 p-2 sm:p-2.5 text-center">
      <div className="text-[9px] uppercase text-white/50">{label}</div>
      <div className="text-sm sm:text-base font-black truncate">{value}</div>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-white/10 bg-black/30 p-1">
      <div className="text-[8px] uppercase text-white/40">{label}</div>
      <div className="font-black text-[11px] truncate">{value}</div>
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
      role="dialog"
      aria-modal="true"
      aria-label={title}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md"
      onTouchStart={(e) => e.stopPropagation()}
    >
      <div className="w-full max-w-sm rounded-3xl border border-white/15 bg-slate-900/98 p-5 text-center shadow-2xl">
        <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
          {isDestructive ? (
            <AlertTriangleIcon className="w-5 h-5 text-rose-400" />
          ) : (
            <HelpIcon className="w-5 h-5 text-amber-400" />
          )}
        </div>
        <h3 className="mb-1 text-lg font-black uppercase tracking-wide text-white">{title}</h3>
        <p className="mb-4 text-xs text-white/70 leading-relaxed">{message}</p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="tap-target-44 flex-1 rounded-2xl border border-white/15 bg-white/5 py-2.5 text-xs font-bold uppercase tracking-wider text-white/80 transition hover:bg-white/10 active:scale-95"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`tap-target-44 flex-1 rounded-2xl py-2.5 text-xs font-black uppercase tracking-wider text-slate-950 transition active:scale-95 ${
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
  onClose,
}: {
  stats: GameStats;
  onClose: () => void;
}) {
  const activeMods = stats.challengeMods
    .map((id) => CHALLENGE_MODS.find((m) => m.id === id))
    .filter(Boolean) as typeof CHALLENGE_MODS;
  const levelProgress = Math.min(100, (stats.jarsThisLevel / stats.levelQuota) * 100);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Level and progress"
      className="fixed inset-0 z-40 flex items-center justify-center bg-black/80 p-3 backdrop-blur-md sm:p-4"
      onTouchStart={(e) => e.stopPropagation()}
    >
      <div className="flex max-h-[88dvh] w-full max-w-lg flex-col justify-between rounded-3xl border border-white/15 bg-slate-900/98 shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between border-b border-white/10 p-3 sm:p-4">
          <div className="flex items-center gap-2">
            <LevelIcon className="w-5 h-5 text-purple-300" />
            <h2 className="text-base sm:text-lg font-black uppercase tracking-tight text-white">
              Level &amp; Progression
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-white/15 bg-white/5 px-2.5 py-1 text-xs font-bold text-white/70 transition hover:bg-white/15 active:scale-90"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 space-y-3 overflow-y-auto p-3 sm:p-4 text-xs text-white/80 custom-scrollbar">
          {/* Active Level Card */}
          <div className="rounded-2xl border border-purple-400/30 bg-gradient-to-br from-purple-500/15 via-slate-900 to-indigo-950/40 p-3">
            <div className="flex items-center justify-between gap-2">
              <div>
                <span className="text-[9px] font-black uppercase tracking-widest text-purple-300">
                  Current Run
                </span>
                <div className="text-xl font-black text-white">Level {stats.level}</div>
              </div>
              <span
                className={`rounded-lg px-2 py-0.5 text-[10px] font-black uppercase tracking-wider ${
                  stats.gameMode === 'relaxed'
                    ? 'border border-teal-400/40 bg-teal-500/20 text-teal-300'
                    : stats.gameMode === 'rush'
                      ? 'border border-amber-400/40 bg-amber-500/20 text-amber-300'
                      : 'border border-indigo-400/40 bg-indigo-500/20 text-indigo-300'
                }`}
              >
                {GAME_MODES[stats.gameMode]?.name || 'Classic'} Mode
              </span>
            </div>

            <div className="mt-2">
              <div className="mb-1 flex justify-between text-[11px] font-bold text-white/70">
                <span>Quota Progress</span>
                <span className="text-amber-300">
                  {stats.jarsThisLevel} / {stats.levelQuota} Jars
                </span>
              </div>
              <div className="h-2.5 w-full overflow-hidden rounded-full bg-black/40">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-amber-400 via-pink-500 to-purple-500 transition-all duration-300"
                  style={{ width: `${levelProgress}%` }}
                />
              </div>
            </div>
          </div>

          {/* Active Challenge Modifiers */}
          {stats.inChallenge ? (
            <div className="rounded-2xl border border-rose-500/40 bg-rose-950/20 p-3">
              <div className="mb-1.5 flex items-center gap-1.5 text-rose-300">
                <AlertTriangleIcon className="w-4 h-4 text-rose-400" />
                <span className="font-black uppercase tracking-wider text-[11px]">
                  Active Challenge Modifiers
                </span>
              </div>
              <div className="space-y-1.5">
                {activeMods.map((m) => (
                  <div key={m.id} className="flex items-center gap-2 rounded-xl bg-black/30 p-2 text-xs">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-rose-500/20 text-rose-300">
                      <ChallengeIconRenderer icon={m.icon} className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <div className="font-black text-rose-200 text-xs">{m.name}</div>
                      <div className="text-white/60 text-[10px]">{m.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/15 p-3 text-xs text-emerald-200">
              <span className="font-bold">Standard Weather & Clear Skies.</span> Challenge levels appear randomly every few stages with lucrative cash bonuses!
            </div>
          )}

          {/* Global Balance Perks */}
          <div className="rounded-2xl border border-white/10 bg-black/30 p-3">
            <h4 className="mb-1.5 text-[11px] font-black uppercase tracking-wider text-amber-300">
              Active Game Balance
            </h4>
            <div className="grid grid-cols-2 gap-1.5 text-xs">
              <div className="rounded-xl border border-white/5 bg-white/5 p-2">
                <div className="text-[9px] uppercase text-white/50">Tool Damage</div>
                <div className="font-black text-emerald-300">-10% Base (0.90x)</div>
              </div>
              <div className="rounded-xl border border-white/5 bg-white/5 p-2">
                <div className="text-[9px] uppercase text-white/50">Jar Earnings</div>
                <div className="font-black text-amber-300">+35% Cash (1.35x)</div>
              </div>
              <div className="rounded-xl border border-white/5 bg-white/5 p-2">
                <div className="text-[9px] uppercase text-white/50">Passive Healing</div>
                <div className="font-black text-cyan-300">1.0s delay (Max 80%)</div>
              </div>
              <div className="rounded-xl border border-white/5 bg-white/5 p-2">
                <div className="text-[9px] uppercase text-white/50">Avocado Item</div>
                <div className="font-black text-lime-300">100% Full Health</div>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 p-3">
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-2xl bg-gradient-to-r from-purple-500 to-indigo-500 py-2.5 text-xs font-black uppercase tracking-wider text-white transition hover:brightness-110 active:scale-95"
          >
            Back to Game
          </button>
        </div>
      </div>
    </div>
  );
}

function SettingsModal({
  settings,
  updateSettings,
  musicOn,
  sfxOn,
  masterVol,
  toggleMusic,
  toggleSfx,
  changeVolume,
  onReplayTutorial,
  onClose,
}: {
  settings: GameSettings;
  updateSettings: (s: Partial<GameSettings>) => void;
  musicOn: boolean;
  sfxOn: boolean;
  masterVol: number;
  toggleMusic: () => void;
  toggleSfx: () => void;
  changeVolume: (v: number) => void;
  onReplayTutorial: () => void;
  onClose: () => void;
}) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Settings and accessibility"
      className="fixed inset-0 z-40 flex items-center justify-center bg-black/80 p-3 backdrop-blur-md sm:p-4"
      onTouchStart={(e) => e.stopPropagation()}
    >
      <div className="flex max-h-[88dvh] w-full max-w-md flex-col justify-between overflow-hidden rounded-3xl border border-white/15 bg-slate-900/98 shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/10 p-3 sm:p-4">
          <div className="flex items-center gap-2">
            <SettingsIcon className="w-5 h-5 text-slate-300" />
            <h2 className="text-base sm:text-lg font-black uppercase tracking-tight text-white">
              Settings &amp; Accessibility
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-white/15 bg-white/5 px-2.5 py-1 text-xs font-bold text-white/70 transition hover:bg-white/15 active:scale-90"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 space-y-3 overflow-y-auto p-3 sm:p-4 text-xs text-white/80 custom-scrollbar">
          {/* Audio Controls */}
          <div className="rounded-2xl border border-white/10 bg-black/30 p-3 space-y-2.5">
            <h4 className="text-[11px] font-black uppercase tracking-wider text-amber-300">
              Audio Settings
            </h4>

            <div className="flex items-center justify-between">
              <div>
                <div className="font-bold text-white text-xs">Background Music</div>
                <div className="text-[10px] text-white/50">Chill lo-fi synth soundtrack</div>
              </div>
              <button
                type="button"
                onClick={toggleMusic}
                aria-label={musicOn ? 'Disable music' : 'Enable music'}
                className={`tap-target-44 flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-black transition active:scale-90 ${
                  musicOn
                    ? 'border-emerald-400/50 bg-emerald-500/20 text-emerald-300'
                    : 'border-white/10 bg-black/40 text-white/40'
                }`}
              >
                {musicOn ? <MusicIcon className="w-3.5 h-3.5" /> : <VolumeOffIcon className="w-3.5 h-3.5" />}
                <span>{musicOn ? 'ON' : 'OFF'}</span>
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="font-bold text-white text-xs">Sound Effects</div>
                <div className="text-[10px] text-white/50">Inhales, pops &amp; rewards</div>
              </div>
              <button
                type="button"
                onClick={toggleSfx}
                aria-label={sfxOn ? 'Disable sound effects' : 'Enable sound effects'}
                className={`tap-target-44 flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-black transition active:scale-90 ${
                  sfxOn
                    ? 'border-emerald-400/50 bg-emerald-500/20 text-emerald-300'
                    : 'border-white/10 bg-black/40 text-white/40'
                }`}
              >
                {sfxOn ? <VolumeOnIcon className="w-3.5 h-3.5" /> : <VolumeOffIcon className="w-3.5 h-3.5" />}
                <span>{sfxOn ? 'ON' : 'OFF'}</span>
              </button>
            </div>

            <div className="pt-1">
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
                aria-label="Master volume slider"
                className="w-full accent-emerald-400 cursor-pointer"
              />
            </div>
          </div>

          {/* Controls & Ergonomics */}
          <div className="rounded-2xl border border-white/10 bg-black/30 p-3 space-y-2">
            <h4 className="text-[11px] font-black uppercase tracking-wider text-amber-300">
              Controls &amp; Ergonomics
            </h4>

            <div className="flex items-center justify-between">
              <div>
                <div className="font-bold text-white text-xs">Left-Handed Layout</div>
                <div className="text-[10px] text-white/50">Swaps smoke button to bottom-left</div>
              </div>
              <button
                type="button"
                onClick={() => updateSettings({ leftHanded: !settings.leftHanded })}
                aria-label={settings.leftHanded ? 'Disable left-handed layout' : 'Enable left-handed layout'}
                className={`tap-target-44 flex items-center justify-center rounded-xl border px-3 py-1.5 text-xs font-black transition ${
                  settings.leftHanded
                    ? 'border-purple-400/50 bg-purple-500/20 text-purple-300'
                    : 'border-white/10 bg-black/40 text-white/40'
                }`}
              >
                {settings.leftHanded ? 'ON' : 'OFF'}
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="font-bold text-white text-xs">Haptic Feedback</div>
                <div className="text-[10px] text-white/50">Vibrate on fill and low health</div>
              </div>
              <button
                type="button"
                onClick={() => updateSettings({ haptics: !settings.haptics })}
                aria-label={settings.haptics ? 'Disable haptic feedback' : 'Enable haptic feedback'}
                className={`tap-target-44 flex items-center justify-center rounded-xl border px-3 py-1.5 text-xs font-black transition ${
                  settings.haptics
                    ? 'border-teal-400/50 bg-teal-500/20 text-teal-300'
                    : 'border-white/10 bg-black/40 text-white/40'
                }`}
              >
                {settings.haptics ? 'ON' : 'OFF'}
              </button>
            </div>
          </div>

          {/* Visuals & Accessibility */}
          <div className="rounded-2xl border border-white/10 bg-black/30 p-3 space-y-2">
            <h4 className="text-[11px] font-black uppercase tracking-wider text-amber-300">
              Visuals &amp; Accessibility
            </h4>

            <div className="flex items-center justify-between">
              <div>
                <div className="font-bold text-white text-xs">Reduced Motion</div>
                <div className="text-[10px] text-white/50">Disables screen shake and flashes</div>
              </div>
              <button
                type="button"
                onClick={() => updateSettings({ reducedMotion: !settings.reducedMotion })}
                aria-label={settings.reducedMotion ? 'Disable reduced motion' : 'Enable reduced motion'}
                className={`tap-target-44 flex items-center justify-center rounded-xl border px-3 py-1.5 text-xs font-black transition ${
                  settings.reducedMotion
                    ? 'border-sky-400/50 bg-sky-500/20 text-sky-300'
                    : 'border-white/10 bg-black/40 text-white/40'
                }`}
              >
                {settings.reducedMotion ? 'ON' : 'OFF'}
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="font-bold text-white text-xs">Low-Effects Mode</div>
                <div className="text-[10px] text-white/50">Limits particles for battery/smoothness</div>
              </div>
              <button
                type="button"
                onClick={() => updateSettings({ lowEffects: !settings.lowEffects })}
                aria-label={settings.lowEffects ? 'Disable low-effects mode' : 'Enable low-effects mode'}
                className={`tap-target-44 flex items-center justify-center rounded-xl border px-3 py-1.5 text-xs font-black transition ${
                  settings.lowEffects
                    ? 'border-amber-400/50 bg-amber-500/20 text-amber-300'
                    : 'border-white/10 bg-black/40 text-white/40'
                }`}
              >
                {settings.lowEffects ? 'ON' : 'OFF'}
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="font-bold text-white text-xs">High Contrast Mode</div>
                <div className="text-[10px] text-white/50">Sharper borders and bolder text</div>
              </div>
              <button
                type="button"
                onClick={() => updateSettings({ highContrast: !settings.highContrast })}
                aria-label={settings.highContrast ? 'Disable high contrast mode' : 'Enable high contrast mode'}
                className={`tap-target-44 flex items-center justify-center rounded-xl border px-3 py-1.5 text-xs font-black transition ${
                  settings.highContrast
                    ? 'border-yellow-400/50 bg-yellow-500/20 text-yellow-300'
                    : 'border-white/10 bg-black/40 text-white/40'
                }`}
              >
                {settings.highContrast ? 'ON' : 'OFF'}
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="font-bold text-white text-xs">Dev FPS Overlay</div>
                <div className="text-[10px] text-white/50">Display live frame-rate counter</div>
              </div>
              <button
                type="button"
                onClick={() => updateSettings({ showFps: !settings.showFps })}
                aria-label={settings.showFps ? 'Disable FPS overlay' : 'Enable FPS overlay'}
                className={`tap-target-44 flex items-center justify-center rounded-xl border px-3 py-1.5 text-xs font-black transition ${
                  settings.showFps
                    ? 'border-emerald-400/50 bg-emerald-500/20 text-emerald-300'
                    : 'border-white/10 bg-black/40 text-white/40'
                }`}
              >
                {settings.showFps ? 'ON' : 'OFF'}
              </button>
            </div>
          </div>

          {/* Interactive Tutorial Replay */}
          <div className="rounded-2xl border border-white/10 bg-black/30 p-3">
            <button
              type="button"
              onClick={onReplayTutorial}
              className="tap-target-44 flex w-full items-center justify-center gap-2 rounded-xl border border-sky-400/40 bg-sky-500/15 py-2 text-xs font-black uppercase text-sky-200 transition hover:bg-sky-500/25 active:scale-95"
            >
              <HelpIcon className="w-4 h-4 text-sky-300" />
              <span>Replay 3-Step Interactive Tutorial</span>
            </button>
          </div>
        </div>

        <div className="border-t border-white/10 p-3">
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-2xl bg-gradient-to-r from-sky-400 to-indigo-500 py-2.5 text-xs font-black uppercase tracking-wider text-slate-900 transition hover:brightness-110 active:scale-95"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
