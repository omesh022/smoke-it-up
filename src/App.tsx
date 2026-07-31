import { useEffect, useRef, useState } from 'react';
import { Game, type GameState, type GameStats } from './game/Game';

const defaultStats: GameStats = {
  lungHealth: 100,
  money: 0,
  score: 0,
  combo: 1,
  fruitPrice: 20,
  cigarettesSmoked: 0,
  containersFilled: 0,
  highScore: 0,
  fruitBought: 0,
};

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameRef = useRef<Game | null>(null);
  const [state, setState] = useState<GameState>('menu');
  const [stats, setStats] = useState<GameStats>(defaultStats);
  const [showTutorial, setShowTutorial] = useState(true);

  useEffect(() => {
    if (!canvasRef.current) return;
    const g = new Game(canvasRef.current);
    gameRef.current = g;
    g.onStateChange = (s) => setState(s);
    g.onStatsChange = (st) => setStats(st);
    setStats(g.getStats());
    return () => g.destroy();
  }, []);

  useEffect(() => {
    if (state === 'playing' && showTutorial) {
      const t = setTimeout(() => setShowTutorial(false), 3200);
      return () => clearTimeout(t);
    }
  }, [state, showTutorial]);

  const healthPct = Math.max(0, Math.min(100, stats.lungHealth));
  const healthColor =
    healthPct > 60 ? '#5eead4' : healthPct > 30 ? '#fbbf24' : '#f87171';
  const canAffordFruit = stats.money >= stats.fruitPrice && stats.lungHealth < 100;

  const lowHealth = healthPct < 30;

  return (
    <div className="fixed inset-0 overflow-hidden bg-[#1a0b2e] font-sans text-white select-none touch-none">
      {/* Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 h-full w-full"
        style={{ imageRendering: 'auto' }}
      />

      {/* HUD - top bar */}
      {state === 'playing' && (
        <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex items-start justify-between gap-3 p-3 sm:p-5">
          {/* Left stats */}
          <div className="flex flex-col gap-2">
            {/* Lung health */}
            <div className="rounded-2xl border border-white/10 bg-black/40 px-3 py-2 backdrop-blur-md sm:px-4">
              <div className="mb-1 flex items-center gap-2">
                <LungIcon color={healthColor} pulse={lowHealth} />
                <span className="text-xs font-bold uppercase tracking-widest text-white/70">
                  Lung Health
                </span>
                <span
                  className="ml-auto text-sm font-bold tabular-nums"
                  style={{ color: healthColor }}
                >
                  {Math.round(healthPct)}%
                </span>
              </div>
              <div className="relative h-3 w-48 overflow-hidden rounded-full bg-white/10 sm:w-64">
                <div
                  className="h-full rounded-full transition-[width] duration-100 ease-out"
                  style={{
                    width: `${healthPct}%`,
                    background: `linear-gradient(90deg, ${healthColor}, ${healthColor}dd)`,
                    boxShadow: `0 0 12px ${healthColor}`,
                  }}
                />
                {lowHealth && (
                  <div className="absolute inset-0 animate-pulse rounded-full bg-red-500/30" />
                )}
              </div>
            </div>

            {/* Score */}
            <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-black/40 px-3 py-2 backdrop-blur-md sm:px-4">
              <span className="text-xl">💰</span>
              <div className="leading-tight">
                <div className="text-[10px] font-bold uppercase tracking-widest text-white/60">
                  Money
                </div>
                <div className="text-lg font-black tabular-nums text-yellow-300 drop-shadow-[0_0_6px_rgba(253,224,71,0.6)]">
                  ${stats.money}
                </div>
              </div>
            </div>

            {/* Score + combo */}
            <div className="flex items-center gap-2">
              <div className="rounded-xl border border-white/10 bg-black/40 px-3 py-1.5 backdrop-blur-md">
                <div className="text-[10px] font-bold uppercase tracking-widest text-white/60">
                  Score
                </div>
                <div className="text-base font-black tabular-nums">
                  {stats.score.toLocaleString()}
                </div>
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
                  <div className="text-[10px] font-bold uppercase tracking-widest text-pink-200">
                    Combo
                  </div>
                  <div className="text-base font-black tabular-nums text-pink-100">
                    x{stats.combo.toFixed(1)}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right - Fruit shop */}
          <div className="flex flex-col items-end gap-2">
            <button
              type="button"
              onClick={() => gameRef.current?.buyFruit()}
              disabled={!canAffordFruit}
              className={`pointer-events-auto group relative overflow-hidden rounded-2xl border-2 px-4 py-2.5 text-left backdrop-blur-md transition-all active:scale-95 ${
                canAffordFruit
                  ? 'border-emerald-400/70 bg-emerald-500/20 hover:bg-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.4)]'
                  : 'border-white/10 bg-black/40 opacity-70'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span className="text-2xl drop-shadow-md transition-transform group-hover:scale-110">
                  🍎
                </span>
                <div className="leading-tight">
                  <div className="text-[10px] font-bold uppercase tracking-widest text-emerald-200">
                    Buy Fruit
                  </div>
                  <div className="text-base font-black tabular-nums text-yellow-300">
                    ${stats.fruitPrice}
                  </div>
                </div>
                <kbd className="ml-2 hidden rounded border border-white/20 bg-black/40 px-1.5 py-0.5 text-[10px] font-mono text-white/60 sm:inline">
                  F
                </kbd>
              </div>
            </button>

            <button
              type="button"
              onClick={() => gameRef.current?.pause()}
              className="pointer-events-auto rounded-xl border border-white/10 bg-black/40 px-3 py-1.5 text-xs font-bold uppercase tracking-widest text-white/70 backdrop-blur-md transition hover:bg-black/60"
            >
              ⏸ Pause
            </button>

            <div className="rounded-xl border border-white/10 bg-black/40 px-3 py-1.5 text-right backdrop-blur-md">
              <div className="text-[10px] font-bold uppercase tracking-widest text-white/60">
                High
              </div>
              <div className="text-sm font-black tabular-nums text-amber-200">
                {stats.highScore.toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tutorial hint (bottom center) */}
      {state === 'playing' && showTutorial && (
        <div className="pointer-events-none absolute inset-x-0 bottom-6 z-10 flex justify-center">
          <div className="animate-pulse rounded-full border border-white/20 bg-black/50 px-5 py-2.5 text-center text-sm font-bold backdrop-blur-md sm:text-base">
            <span className="text-yellow-300">HOLD</span>{' '}
            <span className="text-white/80">
              <span className="hidden sm:inline">SPACE</span>
              <span className="sm:hidden">SCREEN</span>
            </span>{' '}
            <span className="text-white/60">to smoke</span>
            <span className="mx-2 text-white/30">•</span>
            <span className="text-emerald-300">TAP 🍎</span>{' '}
            <span className="text-white/60">to heal</span>
          </div>
        </div>
      )}

      {/* Start menu */}
      {state === 'menu' && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="mx-4 w-full max-w-md rounded-3xl border border-white/10 bg-gradient-to-br from-purple-900/80 via-slate-900/80 to-indigo-950/80 p-6 shadow-2xl sm:p-8">
            <div className="mb-5 text-center">
              <div className="mb-2 text-6xl">🚬</div>
              <h1 className="bg-gradient-to-r from-amber-300 via-pink-300 to-purple-300 bg-clip-text text-4xl font-black uppercase tracking-tight text-transparent sm:text-5xl">
                Smoke It Up
              </h1>
              <p className="mt-1 text-sm font-bold uppercase tracking-widest text-white/60">
                Fill jars · Cash out · Stay alive
              </p>
            </div>

            <div className="mb-6 space-y-2 rounded-2xl border border-white/10 bg-black/30 p-4 text-sm">
              <div className="flex items-start gap-3">
                <span className="text-lg">💨</span>
                <div>
                  <div className="font-bold text-amber-200">Exhale into jars</div>
                  <div className="text-white/60">Hold SPACE or tap &amp; hold to smoke.</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-lg">💰</span>
                <div>
                  <div className="font-bold text-yellow-300">Sell full jars</div>
                  <div className="text-white/60">Chain-fill for combo multiplier!</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-lg">🍎</span>
                <div>
                  <div className="font-bold text-emerald-300">Buy fruit to heal</div>
                  <div className="text-white/60">Press F. Prices rise each buy.</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-lg">⚠️</span>
                <div>
                  <div className="font-bold text-rose-300">Don't let lungs hit 0%</div>
                  <div className="text-white/60">Release to recover. Eat fruit.</div>
                </div>
              </div>
            </div>

            {stats.highScore > 0 && (
              <div className="mb-4 rounded-2xl border border-amber-400/30 bg-amber-500/10 px-4 py-3 text-center">
                <div className="text-[10px] font-bold uppercase tracking-widest text-amber-200">
                  High Score
                </div>
                <div className="text-2xl font-black tabular-nums text-amber-300">
                  ${stats.highScore.toLocaleString()}
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={() => gameRef.current?.start()}
              className="w-full rounded-2xl bg-gradient-to-r from-amber-400 to-pink-500 px-6 py-4 text-lg font-black uppercase tracking-wider text-slate-900 shadow-lg shadow-pink-500/30 transition hover:brightness-110 active:scale-[0.98]"
            >
              ▶ Start Smoking
            </button>
            <div className="mt-3 text-center text-[11px] text-white/40">
              Keys: SPACE / click / touch to smoke • F to buy fruit • P pause • R restart
            </div>
          </div>
        </div>
      )}

      {/* Pause overlay */}
      {state === 'paused' && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="mx-4 w-full max-w-sm rounded-3xl border border-white/10 bg-slate-900/90 p-6 text-center shadow-2xl sm:p-8">
            <div className="mb-2 text-5xl">⏸</div>
            <h2 className="mb-4 text-3xl font-black uppercase tracking-tight">Paused</h2>
            <div className="mb-5 grid grid-cols-2 gap-3 text-left text-sm">
              <div className="rounded-xl border border-white/10 bg-black/40 p-3">
                <div className="text-[10px] uppercase text-white/50">Score</div>
                <div className="text-lg font-black">${stats.score.toLocaleString()}</div>
              </div>
              <div className="rounded-xl border border-white/10 bg-black/40 p-3">
                <div className="text-[10px] uppercase text-white/50">Jars</div>
                <div className="text-lg font-black">{stats.containersFilled}</div>
              </div>
              <div className="rounded-xl border border-white/10 bg-black/40 p-3">
                <div className="text-[10px] uppercase text-white/50">Cigs</div>
                <div className="text-lg font-black">{stats.cigarettesSmoked}</div>
              </div>
              <div className="rounded-xl border border-white/10 bg-black/40 p-3">
                <div className="text-[10px] uppercase text-white/50">Combo</div>
                <div className="text-lg font-black">x{stats.combo.toFixed(1)}</div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => gameRef.current?.resume()}
              className="w-full rounded-2xl bg-gradient-to-r from-emerald-400 to-teal-500 px-6 py-3 text-base font-black uppercase tracking-wider text-slate-900 shadow-lg shadow-emerald-500/30 transition hover:brightness-110 active:scale-[0.98]"
            >
              ▶ Resume
            </button>
            <button
              type="button"
              onClick={() => {
                gameRef.current?.restart();
              }}
              className="mt-2 w-full rounded-2xl border border-white/10 bg-black/40 px-6 py-2.5 text-sm font-bold uppercase tracking-wider text-white/70 transition hover:bg-black/60"
            >
              Quit to Menu
            </button>
          </div>
        </div>
      )}

      {/* Game over */}
      {state === 'gameover' && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/75 backdrop-blur-sm">
          <div className="mx-4 w-full max-w-sm rounded-3xl border border-rose-500/30 bg-gradient-to-br from-rose-950/90 via-slate-900/90 to-slate-950/90 p-6 text-center shadow-2xl sm:p-8">
            <div className="mb-2 text-5xl">💀</div>
            <h2 className="mb-1 bg-gradient-to-r from-rose-300 to-amber-300 bg-clip-text text-3xl font-black uppercase tracking-tight text-transparent sm:text-4xl">
              Lungs Gave Out
            </h2>
            <p className="mb-5 text-sm text-white/50">
              You smoked {stats.cigarettesSmoked} cigarette
              {stats.cigarettesSmoked === 1 ? '' : 's'}.
            </p>

            <div className="mb-4 space-y-2">
              <div className="rounded-2xl border border-amber-400/30 bg-amber-500/10 p-4">
                <div className="text-[10px] font-bold uppercase tracking-widest text-amber-200">
                  Final Score
                </div>
                <div className="text-4xl font-black tabular-nums text-amber-300">
                  ${stats.score.toLocaleString()}
                </div>
              </div>

              {stats.score >= stats.highScore && stats.score > 0 && (
                <div className="rounded-xl border border-pink-400/40 bg-pink-500/20 px-3 py-2 text-sm font-bold text-pink-200 shadow-[0_0_12px_rgba(236,72,153,0.4)]">
                  🏆 NEW HIGH SCORE!
                </div>
              )}

              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="rounded-lg border border-white/10 bg-black/30 p-2">
                  <div className="text-white/50">Jars</div>
                  <div className="font-black">{stats.containersFilled}</div>
                </div>
                <div className="rounded-lg border border-white/10 bg-black/30 p-2">
                  <div className="text-white/50">Fruit</div>
                  <div className="font-black">{stats.fruitBought}</div>
                </div>
                <div className="rounded-lg border border-white/10 bg-black/30 p-2">
                  <div className="text-white/50">Best</div>
                  <div className="font-black">${stats.highScore}</div>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => gameRef.current?.restart()}
              className="w-full rounded-2xl bg-gradient-to-r from-amber-400 to-pink-500 px-6 py-3.5 text-base font-black uppercase tracking-wider text-slate-900 shadow-lg shadow-pink-500/30 transition hover:brightness-110 active:scale-[0.98]"
            >
              🔄 Try Again
            </button>
            <div className="mt-3 text-center text-[11px] text-white/40">
              Press ENTER or R to restart
            </div>
          </div>
        </div>
      )}

      {/* Bottom-right credits / tip */}
      <div className="pointer-events-none absolute bottom-2 right-3 z-10 text-[10px] font-bold uppercase tracking-widest text-white/25">
        Not medical advice · Quit IRL
      </div>
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
