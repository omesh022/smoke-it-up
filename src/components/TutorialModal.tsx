import { useState } from 'react';
import {
  SmokeIcon,
  FlameIcon,
  LungsIcon,
  ZapIcon,
  StarIcon,
  PlayIcon,
  FruitIconRenderer,
} from './Icons';

interface TutorialModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function TutorialModal({ isOpen, onClose }: TutorialModalProps) {
  const [step, setStep] = useState(0);

  if (!isOpen) return null;

  const steps = [
    {
      title: 'Hold to Smoke & Fill',
      badge: 'Step 1 of 3 · Basic Exhale',
      icon: <SmokeIcon className="w-8 h-8 text-amber-300 animate-pulse" />,
      desc: 'Hold down anywhere on the screen or press the dedicated SMOKE button (or Space/J) to exhale smoke into the container.',
      tips: [
        'Smoking continuously burns through your lung health gauge.',
        'Release to stop exhaling and preserve your remaining lung health.',
        'Passive lung recovery starts after 1.0 second of not smoking (up to 80% HP).',
      ],
      preview: (
        <div className="flex items-center justify-center gap-3 rounded-2xl border border-amber-400/30 bg-amber-500/10 p-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-400/20 shadow-[0_0_15px_rgba(251,191,36,0.35)]">
            <FlameIcon className="w-6 h-6 text-amber-300" />
          </div>
          <div className="text-left text-xs">
            <div className="font-black text-amber-200">HOLD SCREEN OR BUTTON</div>
            <div className="text-white/60">Smoke flows smoothly into the jar</div>
          </div>
        </div>
      ),
    },
    {
      title: 'Fill Jars & Chain Combos',
      badge: 'Step 2 of 3 · Precision & Cash',
      icon: <StarIcon className="w-8 h-8 text-pink-300" />,
      desc: 'Fill each container to 100% to earn its cash bounty and advance towards the level quota.',
      tips: [
        'Complete jars in rapid succession to build massive combo multipliers (up to 30x!).',
        'Higher-tier characters and tools dramatically increase your jar payouts and fill speeds.',
        'All container earnings feature a permanent +35% payout bonus in whole dollar amounts.',
      ],
      preview: (
        <div className="flex items-center justify-center gap-3 rounded-2xl border border-pink-400/30 bg-pink-500/10 p-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-pink-400/20 shadow-[0_0_15px_rgba(244,114,182,0.35)]">
            <StarIcon className="w-6 h-6 text-pink-300" />
          </div>
          <div className="text-left text-xs">
            <div className="font-black text-pink-200">100% CONTAINER FILL</div>
            <div className="text-white/60">+$ Cash banked forever + Combo x1.5+</div>
          </div>
        </div>
      ),
    },
    {
      title: 'Lung Health & Recovery Items',
      badge: 'Step 3 of 3 · Survival & Healing',
      icon: <LungsIcon className="w-8 h-8 text-emerald-300" />,
      desc: 'If lung health drops to 0%, your run ends. Keep your lungs conditioned with fruit and drinks.',
      tips: [
        'Eat fruits from the quick bar or Shop to restore lost lung health instantly.',
        'Avocado is the ultimate full-recovery fruit: it restores lung health to exactly 100% HP from any level.',
        'Drink Energy Cans (press E or tap drink) for active passive regeneration over time.',
      ],
      preview: (
        <div className="flex items-center justify-around gap-2 rounded-2xl border border-emerald-400/30 bg-emerald-500/10 p-3">
          <div className="flex items-center gap-1.5 text-xs text-emerald-200">
            <div className="rounded-lg bg-emerald-500/20 p-1.5">
              <FruitIconRenderer icon="avocado" className="w-5 h-5" />
            </div>
            <span><b>Avocado:</b> 100% Full HP</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-cyan-200">
            <div className="rounded-lg bg-cyan-500/20 p-1.5">
              <ZapIcon className="w-5 h-5 text-cyan-300" />
            </div>
            <span><b>Drink:</b> +HP Regen</span>
          </div>
        </div>
      ),
    },
  ];

  const cur = steps[step];
  const isLast = step === steps.length - 1;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="How to Play Tutorial"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-3 sm:p-4 backdrop-blur-md"
      onTouchStart={(e) => e.stopPropagation()}
    >
      <div className="relative flex max-h-[92dvh] w-full max-w-md flex-col justify-between overflow-hidden rounded-3xl border border-white/15 bg-gradient-to-b from-slate-900/98 via-[#160d29]/98 to-slate-950/98 p-4 sm:p-6 shadow-2xl text-white">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-amber-400/40 bg-amber-400/10">
              {cur.icon}
            </div>
            <div className="text-left">
              <div className="text-[10px] font-black uppercase tracking-wider text-amber-300">
                {cur.badge}
              </div>
              <h2 className="text-base sm:text-lg font-black tracking-tight">{cur.title}</h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close tutorial"
            className="rounded-xl border border-white/10 bg-white/5 px-2.5 py-1 text-xs font-bold text-white/60 transition hover:bg-white/10"
          >
            Skip
          </button>
        </div>

        {/* Step Body */}
        <div className="my-3 flex-1 overflow-y-auto custom-scrollbar space-y-3 pr-1 text-left">
          {cur.preview}

          <p className="text-xs sm:text-sm font-semibold leading-relaxed text-white/90">
            {cur.desc}
          </p>

          <div className="space-y-1.5 rounded-2xl border border-white/10 bg-black/40 p-3">
            <div className="text-[10px] font-black uppercase tracking-widest text-white/40">
              Pro Tips
            </div>
            {cur.tips.map((tip, idx) => (
              <div key={idx} className="flex items-start gap-2 text-[11px] sm:text-xs text-white/70">
                <span className="text-amber-400 font-bold">•</span>
                <span>{tip}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer & Nav */}
        <div className="border-t border-white/10 pt-3">
          {/* Dot indicators */}
          <div className="mb-3 flex justify-center gap-1.5">
            {steps.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setStep(idx)}
                aria-label={`Go to step ${idx + 1}`}
                className={`h-1.5 rounded-full transition-all ${
                  idx === step ? 'w-6 bg-amber-400' : 'w-2 bg-white/20'
                }`}
              />
            ))}
          </div>

          <div className="flex items-center gap-2">
            {step > 0 ? (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="flex-1 rounded-2xl border border-white/15 bg-white/5 py-3 text-xs font-bold uppercase tracking-wider text-white/80 transition hover:bg-white/10 active:scale-95"
              >
                Back
              </button>
            ) : (
              <button
                type="button"
                onClick={onClose}
                className="flex-1 rounded-2xl border border-white/10 bg-white/5 py-3 text-xs font-bold uppercase tracking-wider text-white/50 transition hover:bg-white/10 active:scale-95"
              >
                Skip
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                if (isLast) {
                  onClose();
                } else {
                  setStep(step + 1);
                }
              }}
              className="flex-[2] flex items-center justify-center gap-1.5 rounded-2xl bg-gradient-to-r from-amber-400 via-pink-500 to-purple-500 py-3 text-xs sm:text-sm font-black uppercase tracking-wider text-slate-950 shadow-lg shadow-pink-500/25 transition hover:brightness-110 active:scale-[0.98]"
            >
              {isLast ? (
                <>
                  <PlayIcon className="w-4 h-4" />
                  <span>Got It — Start Playing</span>
                </>
              ) : (
                <span>Next Step →</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
