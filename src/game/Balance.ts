// ============================================================================
// SMOKE IT UP - CENTRALIZED GAME BALANCE & ECONOMY ENGINE
// Single source of truth for all damage, payouts, recovery, and scaling math.
// ============================================================================

export const GLOBAL_TOOL_DAMAGE_MULT = 0.90; // Exactly 10% reduction to all smoking tool lung drain
export const GLOBAL_EARNINGS_MULT = 1.35;    // Exactly +35% payout increase to all jars/containers

export const PASSIVE_RECOVERY_DELAY = 1.0;   // Inactivity seconds required before automatic healing begins
export const PASSIVE_RECOVERY_RATE = 2.8;    // HP per second restored during passive recovery
export const PASSIVE_RECOVERY_CAP = 80.0;    // Maximum HP achievable through passive recovery (strictly capped at 80%)
export const AVOCADO_RECOVERY_HP = 100.0;    // Avocado restores lung health to exactly 100% full health

export const STAR_TO_CASH = 250;             // Base conversion rate per Golden Star

// ---- Game Mode Multipliers ----
export interface GameModeConfig {
  id: 'classic' | 'relaxed' | 'rush';
  name: string;
  desc: string;
  earnMult: number;
  drainMult: number;
  scoreMult: number;
  damageMult: number;
  fillSpeedMult: number;
  recoveryRateMult: number;
  badge: string;
}

export const GAME_MODES: Record<'classic' | 'relaxed' | 'rush', GameModeConfig> = {
  classic: {
    id: 'classic',
    name: 'Classic',
    desc: 'Standard arcade rules & progression',
    earnMult: 1.0,
    drainMult: 1.0,
    scoreMult: 1.0,
    damageMult: 1.0,
    fillSpeedMult: 1.0,
    recoveryRateMult: 1.0,
    badge: 'Classic',
  },
  relaxed: {
    id: 'relaxed',
    name: 'Relaxed',
    desc: '30% less lung drain, 15% lower jar payout',
    earnMult: 0.85,
    drainMult: 0.70,
    scoreMult: 0.85,
    damageMult: 0.70,
    fillSpeedMult: 1.0,
    recoveryRateMult: 1.5,
    badge: 'Relaxed',
  },
  rush: {
    id: 'rush',
    name: 'Rush',
    desc: '35% faster drain, +20% jar cash bonus',
    earnMult: 1.20,
    drainMult: 1.35,
    scoreMult: 1.25,
    damageMult: 1.35,
    fillSpeedMult: 1.35,
    recoveryRateMult: 0.8,
    badge: 'Rush',
  },
};

// ---- Challenge Modifiers ----
export interface ChallengeModDef {
  id: string;
  name: string;
  icon: string;
  desc: string;
  drainMult?: number;
  fillMult?: number;
  earnMult?: number;
  healMult?: number;
}

export const CHALLENGE_MODS: ChallengeModDef[] = [
  { id: 'huge', name: 'Giant Jars', icon: 'scale', desc: 'Jars need 2x smoke — pay 2.2x', fillMult: 0.5, earnMult: 2.20 },
  { id: 'flu', name: 'The Flu', icon: 'thermometer', desc: 'Sick! +30% lung drain, constant cough', drainMult: 1.30 },
  { id: 'storm', name: 'Heavy Storm', icon: 'wind', desc: 'Rain & dark skies. Healing cut in half', healMult: 0.50 },
  { id: 'blackout', name: 'Blackout', icon: 'zapoff', desc: 'Darker everywhere. +15% lung drain', drainMult: 1.15 },
  { id: 'dud', name: 'Dud Tools', icon: 'alert', desc: 'Your tool fills 40% slower', fillMult: 0.60 },
  { id: 'thin', name: 'Thin Smoke', icon: 'lungs', desc: 'Less smoke per drag. Fill 25% slower', fillMult: 0.75 },
  { id: 'burn', name: 'Burning Lungs', icon: 'flame', desc: 'Lung drain +50%', drainMult: 1.50 },
  { id: 'weak', name: 'Weak Body', icon: 'lungs', desc: 'Healing 40% less effective', healMult: 0.60 },
  { id: 'windy', name: 'Crosswinds', icon: 'wind', desc: 'Strong wind scatters smoke', fillMult: 0.85 },
  { id: 'choke', name: 'Choke Hold', icon: 'alert', desc: 'Fill speed cut 25%, drain +20%', fillMult: 0.75, drainMult: 1.20 },
  { id: 'tax', name: 'Smoke Tax', icon: 'money', desc: 'Jar payouts cut 25%', earnMult: 0.75 },
  { id: 'night', name: 'All-Nighter', icon: 'scale', desc: 'Dark + cough more often' },
];

// ---- Payout & Reward Calculations ----
export interface JarRewardParams {
  baseJarValue: number;
  charMult?: number;
  toolEarn?: number;
  combo?: number;
  earnPenalty?: number;
  gameMode?: 'classic' | 'relaxed' | 'rush';
  challengeMods?: string[];
  globalMult?: number;
}

/**
 * Calculates the exact whole-dollar payout for completing a jar.
 * Formula:
 *   rawReward = baseJarValue * charMult * toolEarn * combo * earnPenalty * modeEarnMult * challengeEarnMult * GLOBAL_EARNINGS_MULT
 * Rounding Rule:
 *   Standard half-up rounding (Math.round) resulting in an integer >= 1.
 */
export function calculateJarReward(params: JarRewardParams): number {
  const base = Math.max(1, params.baseJarValue);
  const char = Math.max(0.1, params.charMult ?? 1.0);
  const tool = Math.max(0.1, params.toolEarn ?? 1.0);
  const combo = Math.max(1.0, params.combo ?? 1.0);
  const penalty = Math.max(0.1, params.earnPenalty ?? 1.0);
  const modeMult = GAME_MODES[params.gameMode ?? 'classic']?.earnMult ?? 1.0;
  
  let challengeEarnMult = 1.0;
  const mods = params.challengeMods ?? [];
  if (mods.includes('huge')) {
    challengeEarnMult *= 2.20; // Giant Jar 2.2x payout
  }
  if (mods.includes('tax')) {
    challengeEarnMult *= 0.75; // Smoke Tax 25% payout cut
  }

  const global = params.globalMult ?? GLOBAL_EARNINGS_MULT;
  const rawReward = base * char * tool * combo * penalty * modeMult * challengeEarnMult * global;

  // Rounding rule: Round to nearest whole integer
  return Math.max(1, Math.round(rawReward));
}

// ---- Tool Drain & Damage Calculations ----

/**
 * Calculates the balanced base lung damage for a tool (includes the 10% global reduction).
 */
export function getBaseToolDrain(rawToolDrain: number): number {
  return rawToolDrain * GLOBAL_TOOL_DAMAGE_MULT;
}

/**
 * Calculates the live per-second lung drain rate during active smoking.
 */
export function calculateLiveDrainRate(
  rawToolDrain: number,
  gameMode: 'classic' | 'relaxed' | 'rush' = 'classic',
  challengeMods: string[] = [],
  levelDrainMult: number = 1.0
): number {
  const balancedBase = getBaseToolDrain(rawToolDrain);
  const modeMult = GAME_MODES[gameMode]?.drainMult ?? 1.0;
  
  let challengeDrainMult = 1.0;
  if (challengeMods.includes('flu')) challengeDrainMult *= 1.30;
  if (challengeMods.includes('burn')) challengeDrainMult *= 1.50;
  if (challengeMods.includes('blackout')) challengeDrainMult *= 1.15;
  if (challengeMods.includes('choke')) challengeDrainMult *= 1.20;

  return balancedBase * modeMult * challengeDrainMult * Math.max(0.1, levelDrainMult);
}

// ---- Healing & Recovery Calculations ----

/**
 * Calculates passive lung recovery over a timestep `dt`.
 * Rules:
 * - Begins only after `PASSIVE_RECOVERY_DELAY` (1.0s) of continuous non-smoking.
 * - Caps strictly at `PASSIVE_RECOVERY_CAP` (80.0% HP).
 * - Suspended when smoking or paused.
 */
export function updatePassiveRecovery(
  currentHealth: number,
  idleTimer: number,
  isSmoking: boolean,
  isPaused: boolean,
  dt: number
): { health: number; idleTimer: number; isRecovering: boolean } {
  if (isPaused) {
    return { health: currentHealth, idleTimer, isRecovering: false };
  }

  if (isSmoking) {
    return { health: currentHealth, idleTimer: 0, isRecovering: false };
  }

  const newIdleTimer = idleTimer + dt;
  if (newIdleTimer >= PASSIVE_RECOVERY_DELAY && currentHealth < PASSIVE_RECOVERY_CAP && currentHealth > 0) {
    const healAmount = PASSIVE_RECOVERY_RATE * dt;
    const newHealth = Math.min(PASSIVE_RECOVERY_CAP, currentHealth + healAmount);
    return { health: newHealth, idleTimer: newIdleTimer, isRecovering: true };
  }

  return { health: currentHealth, idleTimer: newIdleTimer, isRecovering: false };
}

/**
 * Calculates the actual HP healed from fruit consumption.
 * - Avocado restores to 100% full health regardless of debuffs.
 * - Other fruits apply healing debuffs if present (storm: 0.50x, weak: 0.60x).
 */
export function calculateFruitHeal(
  fruitId: string,
  baseFruitHeal: number,
  currentHealth: number,
  challengeMods: string[] = []
): number {
  if (currentHealth >= 100) return 0;

  if (fruitId === 'avocado') {
    return Math.max(0, AVOCADO_RECOVERY_HP - currentHealth);
  }

  let healMult = 1.0;
  if (challengeMods.includes('storm')) healMult *= 0.50;
  if (challengeMods.includes('weak')) healMult *= 0.60; // Weak Body: 40% less effective = 60% effectiveness

  const effectiveHeal = baseFruitHeal * healMult;
  return Math.min(effectiveHeal, Math.max(0, 100 - currentHealth));
}
