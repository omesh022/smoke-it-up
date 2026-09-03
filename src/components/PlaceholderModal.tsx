import {
  TrophyIcon,
  StarIcon,
  CloudIcon,
  ShieldIcon,
} from './Icons';

export type PlaceholderType = 'leaderboards' | 'topup' | 'remove_ads' | 'account';

interface PlaceholderModalProps {
  type: PlaceholderType | null;
  onClose: () => void;
  bank: number;
  goldenStars: number;
  highScore: number;
}

export function PlaceholderModal({
  type,
  onClose,
  bank,
  goldenStars,
  highScore,
}: PlaceholderModalProps) {
  if (!type) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Feature Modal"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-3 sm:p-4 backdrop-blur-md"
      onTouchStart={(e) => e.stopPropagation()}
    >
      <div className="relative flex max-h-[90dvh] w-full max-w-md flex-col justify-between overflow-hidden rounded-3xl border border-white/15 bg-gradient-to-b from-slate-900/98 via-[#160d29]/98 to-slate-950/98 p-5 text-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2.5">
            {type === 'leaderboards' && (
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-amber-400/40 bg-amber-400/10">
                <TrophyIcon className="w-6 h-6 text-amber-300" />
              </div>
            )}
            {type === 'topup' && (
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-yellow-400/40 bg-yellow-400/10">
                <StarIcon className="w-6 h-6 text-yellow-300" />
              </div>
            )}
            {type === 'remove_ads' && (
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-purple-400/40 bg-purple-400/10">
                <ShieldIcon className="w-6 h-6 text-purple-300" />
              </div>
            )}
            {type === 'account' && (
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-sky-400/40 bg-sky-400/10">
                <CloudIcon className="w-6 h-6 text-sky-300" />
              </div>
            )}
            <div className="text-left">
              <div className="text-[10px] font-black uppercase tracking-wider text-amber-300">
                {type === 'leaderboards' && 'Arcade Rankings'}
                {type === 'topup' && 'Star Top-Up'}
                {type === 'remove_ads' && 'VIP Ad-Free Pass'}
                {type === 'account' && 'Player Profile'}
              </div>
              <h2 className="text-lg font-black tracking-tight">
                {type === 'leaderboards' && 'Leaderboards'}
                {type === 'topup' && 'Top-Up Stars'}
                {type === 'remove_ads' && 'Remove Ads'}
                {type === 'account' && 'Account & Sync'}
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="rounded-xl border border-white/15 bg-white/5 px-2.5 py-1 text-xs font-bold text-white/70 transition hover:bg-white/15"
          >
            ✕
          </button>
        </div>

        {/* Modal Body */}
        <div className="my-4 flex-1 overflow-y-auto custom-scrollbar space-y-3 text-left">
          {type === 'leaderboards' && (
            <>
              <div className="rounded-2xl border border-amber-400/30 bg-amber-500/10 p-3 text-center">
                <div className="text-[10px] font-black uppercase tracking-widest text-amber-300">
                  Your High Score Record
                </div>
                <div className="text-2xl font-black text-amber-200">
                  ${highScore.toLocaleString()}
                </div>
                <div className="mt-1 text-[10px] text-white/50">
                  Offline Season · Local Device Leader
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="text-[10px] font-black uppercase tracking-widest text-white/40">
                  Top Local Ranks
                </div>
                {[
                  { rank: 1, name: 'You (Champion)', score: `$${highScore.toLocaleString()}`, badge: '👑' },
                  { rank: 2, name: 'Arcade Legend', score: '$45,200', badge: '🥈' },
                  { rank: 3, name: 'Smoke Master', score: '$31,800', badge: '🥉' },
                ].map((row) => (
                  <div
                    key={row.rank}
                    className="flex items-center justify-between rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-black text-amber-300">#{row.rank}</span>
                      <span>{row.name}</span>
                    </div>
                    <span className="font-bold tabular-nums text-emerald-300">{row.score}</span>
                  </div>
                ))}
              </div>

              <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-center text-[11px] text-white/60">
                <span className="font-black text-amber-300">⚡ Google Play Global Leaderboards</span>
                <p className="mt-0.5">Online worldwide rankings will activate with Google Play Games integration.</p>
              </div>
            </>
          )}

          {type === 'topup' && (
            <>
              <div className="flex items-center justify-between rounded-2xl border border-yellow-400/30 bg-yellow-500/10 p-3">
                <div className="flex items-center gap-2">
                  <StarIcon className="w-6 h-6 text-yellow-400" />
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-white/50">Current Balance</div>
                    <div className="text-lg font-black text-yellow-300">{goldenStars} Stars</div>
                  </div>
                </div>
                <div className="text-right text-xs">
                  <div className="text-white/50">Bank Cash</div>
                  <div className="font-bold text-emerald-300">${bank.toLocaleString()}</div>
                </div>
              </div>

              <div className="space-y-2">
                {[
                  { stars: 10, bonus: 'Starter Pack', price: '$0.99' },
                  { stars: 50, bonus: '+10 Bonus Stars', price: '$3.99' },
                  { stars: 150, bonus: '+50 Bonus Stars', price: '$9.99' },
                ].map((pack, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/40 p-3"
                  >
                    <div className="flex items-center gap-2">
                      <StarIcon className="w-5 h-5 text-amber-400" />
                      <div>
                        <div className="text-xs font-black">{pack.stars} Golden Stars</div>
                        <div className="text-[10px] text-amber-300">{pack.bonus}</div>
                      </div>
                    </div>
                    <button
                      type="button"
                      disabled
                      className="rounded-xl border border-amber-400/30 bg-amber-500/15 px-3 py-1.5 text-xs font-black text-amber-200 opacity-60"
                    >
                      {pack.price} (Demo)
                    </button>
                  </div>
                ))}
              </div>

              <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-center text-[11px] text-white/60">
                <span className="font-black text-yellow-300">ℹ️ Store Demo Mode</span>
                <p className="mt-0.5">Google Play In-App Billing will be configured during the store upload phase. You can earn stars free from Achievements!</p>
              </div>
            </>
          )}

          {type === 'remove_ads' && (
            <>
              <div className="rounded-2xl border border-purple-400/30 bg-purple-500/15 p-4 text-center">
                <ShieldIcon className="mx-auto w-10 h-10 text-purple-300 mb-2" />
                <h3 className="text-base font-black text-purple-200">Ad-Free Gaming Experience</h3>
                <p className="mt-1 text-xs text-white/70">
                  This game is currently 100% ad-free! When banner and interstitial ads are added in the Play Store build, the VIP pass will permanently remove all ads.
                </p>
              </div>

              <div className="rounded-2xl border border-emerald-400/30 bg-emerald-500/10 p-3 text-center">
                <div className="text-xs font-black text-emerald-300">✓ CURRENT STATUS: NO ADS ACTIVE</div>
                <div className="text-[10px] text-white/60">Enjoy uninterrupted pure arcade gameplay.</div>
              </div>
            </>
          )}

          {type === 'account' && (
            <>
              <div className="rounded-2xl border border-sky-400/30 bg-sky-500/10 p-3">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500/20 font-black text-sky-300">
                    ID
                  </div>
                  <div>
                    <div className="text-xs font-black">Local Player Profile</div>
                    <div className="text-[10px] font-mono text-white/50">Device Save ID: #SIU-{Math.abs(highScore * 31 + 7919).toString(16).toUpperCase()}</div>
                  </div>
                </div>
              </div>

              <div className="space-y-1.5 text-xs text-white/80">
                <div className="font-bold text-white/60 text-[10px] uppercase">Synced Data:</div>
                <div className="flex justify-between rounded-xl border border-white/10 bg-black/40 px-3 py-2">
                  <span>Bank Cash:</span>
                  <span className="font-black text-emerald-300">${bank.toLocaleString()}</span>
                </div>
                <div className="flex justify-between rounded-xl border border-white/10 bg-black/40 px-3 py-2">
                  <span>Golden Stars:</span>
                  <span className="font-black text-amber-300">{goldenStars}</span>
                </div>
                <div className="flex justify-between rounded-xl border border-white/10 bg-black/40 px-3 py-2">
                  <span>High Score:</span>
                  <span className="font-black text-purple-300">${highScore.toLocaleString()}</span>
                </div>
              </div>

              <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-center text-[11px] text-white/60">
                <span className="font-black text-sky-300">☁️ Google Play Cloud Save</span>
                <p className="mt-0.5">Use the Cloud Save tab on the main menu to manually export/import backup codes across devices.</p>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-white/10 pt-3">
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-2xl bg-gradient-to-r from-sky-400 to-indigo-500 py-3 text-xs font-black uppercase tracking-wider text-slate-950 shadow-md transition hover:brightness-110 active:scale-[0.98]"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
