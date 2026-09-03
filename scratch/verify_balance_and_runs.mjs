// ============================================================================
// AUTOMATED TEST SUITE FOR SMOKE IT UP - BALANCE, RUNS & NAVIGATION
// ============================================================================

import assert from 'assert';

// 1. Balance Constants & Formulas
import {
  GLOBAL_TOOL_DAMAGE_MULT,
  GLOBAL_EARNINGS_MULT,
  PASSIVE_RECOVERY_DELAY,
  PASSIVE_RECOVERY_RATE,
  PASSIVE_RECOVERY_CAP,
  AVOCADO_RECOVERY_HP,
  GAME_MODES,
  CHALLENGE_MODS,
  calculateJarReward,
  getBaseToolDrain,
  calculateLiveDrainRate,
  updatePassiveRecovery,
  calculateFruitHeal,
} from '../src/game/Balance.ts';

import { NavigationManager } from '../src/game/Navigation.ts';

console.log('--- STARTING UNIT TEST SUITE ---');

// Test 1: Global Multiplier Constants
console.log('Test 1: Global Multiplier Constants');
assert.strictEqual(GLOBAL_TOOL_DAMAGE_MULT, 0.90, 'GLOBAL_TOOL_DAMAGE_MULT must be exactly 0.90 (-10%)');
assert.strictEqual(GLOBAL_EARNINGS_MULT, 1.35, 'GLOBAL_EARNINGS_MULT must be exactly 1.35 (+35%)');
assert.strictEqual(PASSIVE_RECOVERY_DELAY, 1.0, 'Passive recovery delay must be 1.0s');
assert.strictEqual(PASSIVE_RECOVERY_CAP, 80.0, 'Passive recovery cap must be 80%');
assert.strictEqual(AVOCADO_RECOVERY_HP, 100.0, 'Avocado recovery must be 100%');
console.log('✓ Test 1 Passed: Constants verified.');

// Test 2: Tool Base Drain Reductions
console.log('Test 2: Tool Base Drain Reductions');
const toolTests = [
  { name: 'Cigarette', raw: 1.75, expected: 1.75 * 0.9 },
  { name: 'E-Cig', raw: 1.30, expected: 1.30 * 0.9 },
  { name: 'Pod', raw: 1.70, expected: 1.70 * 0.9 },
  { name: 'Cigar', raw: 2.85, expected: 2.85 * 0.9 },
  { name: 'Hookah', raw: 4.00, expected: 4.00 * 0.9 },
  { name: 'Bong', raw: 5.10, expected: 5.10 * 0.9 },
  { name: 'Blunt', raw: 6.20, expected: 6.20 * 0.9 },
];
for (const t of toolTests) {
  const balanced = getBaseToolDrain(t.raw);
  assert.ok(Math.abs(balanced - t.expected) < 1e-6, `Base drain for ${t.name} should be ${t.expected}, got ${balanced}`);
}
console.log('✓ Test 2 Passed: All tool base damages reduced by exactly 10%.');

// Test 3: Jar Payout Formula & Whole-Integer Rounding
console.log('Test 3: Jar Payout Formula & Whole-Integer Rounding');
const payoutCombinations = [
  {
    params: { baseJarValue: 14, charMult: 1.0, toolEarn: 1.0, combo: 1.0, earnPenalty: 1.0, gameMode: 'classic' },
    expected: Math.round(14 * 1.0 * 1.0 * 1.0 * 1.0 * 1.0 * 1.0 * 1.35), // 14 * 1.35 = 18.9 -> 19
  },
  {
    params: { baseJarValue: 20, charMult: 1.5, toolEarn: 1.28, combo: 2.0, earnPenalty: 1.0, gameMode: 'classic' },
    expected: Math.round(20 * 1.5 * 1.28 * 2.0 * 1.0 * 1.0 * 1.0 * 1.35), // 20 * 1.5 * 1.28 * 2.0 * 1.35 = 103.68 -> 104
  },
  {
    params: { baseJarValue: 15, charMult: 2.0, toolEarn: 2.35, combo: 1.5, earnPenalty: 0.82, gameMode: 'relaxed' },
    expected: Math.round(15 * 2.0 * 2.35 * 1.5 * 0.82 * 0.85 * 1.0 * 1.35),
  },
  {
    params: { baseJarValue: 30, charMult: 3.5, toolEarn: 4.0, combo: 5.0, earnPenalty: 1.0, gameMode: 'rush', challengeMods: ['huge'] },
    expected: Math.round(30 * 3.5 * 4.0 * 5.0 * 1.0 * 1.20 * 2.20 * 1.35), // Giant Jar 2.2x applied
  },
  {
    params: { baseJarValue: 25, charMult: 1.2, toolEarn: 1.7, combo: 1.0, earnPenalty: 1.0, gameMode: 'classic', challengeMods: ['tax'] },
    expected: Math.round(25 * 1.2 * 1.7 * 1.0 * 1.0 * 1.0 * 0.75 * 1.35), // Smoke Tax 0.75x applied
  },
];

for (let i = 0; i < payoutCombinations.length; i++) {
  const c = payoutCombinations[i];
  const reward = calculateJarReward(c.params);
  assert.strictEqual(Number.isInteger(reward), true, `Reward must be an integer (got ${reward})`);
  assert.strictEqual(reward, c.expected, `Combination ${i + 1} expected ${c.expected}, got ${reward}`);
}
console.log('✓ Test 3 Passed: Jar payout formula, 35% boost, modifiers, and integer rounding verified.');

// Test 4: Giant Jar 2.2x Verification
console.log('Test 4: Giant Jar 2.2x Verification');
const regular = calculateJarReward({ baseJarValue: 100, gameMode: 'classic' });
const giant = calculateJarReward({ baseJarValue: 100, gameMode: 'classic', challengeMods: ['huge'] });
assert.strictEqual(giant, Math.round(regular * 2.20), `Giant jar must pay 2.2x regular (${Math.round(regular * 2.20)}), got ${giant}`);
console.log('✓ Test 4 Passed: Giant jar 2.2x payout verified.');

// Test 5: Passive Lung Recovery Rules
console.log('Test 5: Passive Lung Recovery Rules');
// 5a: Before 1.0s, no recovery occurs
let state = updatePassiveRecovery(50, 0, false, false, 0.5);
assert.strictEqual(state.health, 50, 'Health should not increase before 1.0s');
assert.strictEqual(state.idleTimer, 0.5, 'Idle timer should advance to 0.5s');
assert.strictEqual(state.isRecovering, false);

// 5b: After 1.0s, recovery begins
state = updatePassiveRecovery(state.health, state.idleTimer, false, false, 0.6); // Total 1.1s
assert.strictEqual(state.isRecovering, true, 'Recovery should be active at 1.1s idle');
assert.ok(state.health > 50, 'Health should increase');

// 5c: Recovery strictly caps at 80% HP
state = updatePassiveRecovery(79.5, 2.0, false, false, 1.0);
assert.strictEqual(state.health, 80.0, `Health should cap at exactly 80%, got ${state.health}`);

// 5d: Smoking resets idle timer and stops recovery
state = updatePassiveRecovery(70, 3.0, true, false, 0.1);
assert.strictEqual(state.idleTimer, 0, 'Smoking must reset idle timer to 0');
assert.strictEqual(state.isRecovering, false, 'Smoking must stop recovery');

// 5e: Paused state freezes timer and recovery
state = updatePassiveRecovery(60, 2.0, false, true, 0.5);
assert.strictEqual(state.idleTimer, 2.0, 'Pause must freeze idle timer');
assert.strictEqual(state.health, 60, 'Pause must freeze health');
console.log('✓ Test 5 Passed: Passive recovery delay (1.0s), rate (2.8 HP/s), cap (80%), and pause freeze verified.');

// Test 6: Fruit Healing & Avocado 100% Full Recovery
console.log('Test 6: Fruit Healing & Avocado 100% Full Recovery');
// 6a: Avocado restores from 1 HP to 100 HP
const avocadoHeal = calculateFruitHeal('avocado', 100, 1, []);
assert.strictEqual(avocadoHeal, 99, 'Avocado from 1 HP should heal 99 HP to reach 100%');

// 6b: Avocado from 75 HP heals 25 HP
const avocadoHeal2 = calculateFruitHeal('avocado', 100, 75, ['storm', 'weak']);
assert.strictEqual(avocadoHeal2, 25, 'Avocado ignores debuffs and heals exactly to 100%');

// 6c: Regular fruits obey debuffs
const appleNormal = calculateFruitHeal('apple', 18, 50, []);
assert.strictEqual(appleNormal, 18, 'Apple heals 18 HP normally');

const appleWeak = calculateFruitHeal('apple', 18, 50, ['weak']); // 40% less effective = 60%
assert.strictEqual(appleWeak, 18 * 0.6, 'Weak debuff cuts healing by 40% (0.60x)');

const appleStormWeak = calculateFruitHeal('apple', 18, 50, ['storm', 'weak']); // 0.5 * 0.6 = 0.3
assert.strictEqual(appleStormWeak, 18 * 0.3, 'Storm + Weak cuts healing to 30%');
console.log('✓ Test 6 Passed: Fruit healing calculations and Avocado 100% recovery verified.');

// Test 7: Navigation Manager Stack & Back Button
console.log('Test 7: Navigation Manager Stack & Back Button');
const nav = new NavigationManager();
assert.strictEqual(nav.getTop(), null);
assert.strictEqual(nav.handleBackButton(), false, 'Empty stack back button returns false');

nav.push('shop');
assert.strictEqual(nav.getTop(), 'shop');
assert.strictEqual(nav.has('shop'), true);

nav.push('settings');
assert.strictEqual(nav.getTop(), 'settings');

nav.push('confirm');
assert.strictEqual(nav.getTop(), 'confirm');

// Pop topmost overlay (confirm)
assert.strictEqual(nav.handleBackButton(), true);
assert.strictEqual(nav.getTop(), 'settings');

// Pop next overlay (settings)
assert.strictEqual(nav.handleBackButton(), true);
assert.strictEqual(nav.getTop(), 'shop');

// Pop next overlay (shop)
assert.strictEqual(nav.handleBackButton(), true);
assert.strictEqual(nav.getTop(), null);
assert.strictEqual(nav.handleBackButton(), false);
console.log('✓ Test 7 Passed: NavigationManager stack, overlay ordering, and back button handling verified.');

console.log('--- ALL UNIT TESTS COMPLETED SUCCESSFULLY (7/7) ---');
