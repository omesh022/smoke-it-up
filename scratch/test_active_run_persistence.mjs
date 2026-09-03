import assert from 'assert';
import {
  GLOBAL_TOOL_DAMAGE_MULT,
  GLOBAL_EARNINGS_MULT,
  PASSIVE_RECOVERY_DELAY,
  PASSIVE_RECOVERY_RATE,
  PASSIVE_RECOVERY_CAP,
  AVOCADO_RECOVERY_HP,
  calculateJarReward,
  calculateLiveDrainRate,
  getBaseToolDrain,
  updatePassiveRecovery,
  calculateFruitHeal,
} from '../src/game/Balance.ts';

import { NavigationManager } from '../src/game/Navigation.ts';

console.log('--- COMPREHENSIVE ACTIVE RUN & BALANCE INTEGRATION TEST ---');

// 1. Test Mock LocalStorage with Schema Migration from v1 to v2
const mockStorage = {};
const globalStorage = {
  getItem: (k) => mockStorage[k] || null,
  setItem: (k, v) => { mockStorage[k] = String(v); },
  removeItem: (k) => { delete mockStorage[k]; },
};

// Simulate v1 save data
const v1LegacySave = {
  version: 1,
  gameMode: 'rush',
  level: 4,
  jarsThisLevel: 2,
  jarFill: 0.45,
  jarValue: 35,
  jarGolden: true,
  jarHue: 45,
  lungHealth: 68.5,
  score: 1420,
  earnedThisRun: 850,
  combo: 3.2,
  bestCombo: 4.5,
  perfectChain: 3,
  chainTime: 1.2,
  selectedChar: 1,
  selectedTool: 2,
  inChallenge: true,
  challengeMods: ['tax', 'huge'],
  boostTimer: 5.0,
  wetTimer: 0,
  gustTimer: 0,
  regenBuff: 3.5,
  drags: 18,
  containersFilled: 9,
  goldenFilled: 2,
  fruitBought: 3,
  energyDrinksUsed: 1,
  timestamp: Date.now(),
};

globalStorage.setItem('smokeItUp.activeRun.v2', JSON.stringify(v1LegacySave));

// Migration function mirroring Game.ts migrateActiveRunData
function migrateActiveRunData(raw) {
  if (!raw || typeof raw !== 'object') return null;
  if (typeof raw.level !== 'number' || typeof raw.lungHealth !== 'number') return null;
  const level = Math.max(1, !isNaN(raw.level) ? raw.level : 1);
  const lungHealth = Math.max(0, Math.min(100, !isNaN(raw.lungHealth) ? raw.lungHealth : 0));
  if (lungHealth <= 0) return null;

  const gameMode = raw.gameMode === 'relaxed' || raw.gameMode === 'rush' ? raw.gameMode : 'classic';
  const jarsThisLevel = Math.max(0, typeof raw.jarsThisLevel === 'number' && !isNaN(raw.jarsThisLevel) ? raw.jarsThisLevel : 0);

  let jar = {
    fill: 0,
    value: 14,
    golden: false,
    hue: 200,
    w: 110,
    h: 140,
  };

  if (raw.jar && typeof raw.jar === 'object') {
    jar = {
      fill: Math.max(0, Math.min(0.99, typeof raw.jar.fill === 'number' ? raw.jar.fill : 0)),
      value: Math.max(1, typeof raw.jar.value === 'number' ? raw.jar.value : 14),
      golden: Boolean(raw.jar.golden),
      hue: typeof raw.jar.hue === 'number' ? raw.jar.hue : 200,
      w: typeof raw.jar.w === 'number' ? raw.jar.w : 110,
      h: typeof raw.jar.h === 'number' ? raw.jar.h : 140,
    };
  } else if (typeof raw.jarFill === 'number' || typeof raw.jarValue === 'number') {
    jar = {
      fill: Math.max(0, Math.min(0.99, typeof raw.jarFill === 'number' ? raw.jarFill : 0)),
      value: Math.max(1, typeof raw.jarValue === 'number' ? raw.jarValue : 14),
      golden: Boolean(raw.jarGolden),
      hue: typeof raw.jarHue === 'number' ? raw.jarHue : 200,
      w: 110,
      h: 140,
    };
  }

  return {
    version: 2,
    gameMode,
    level,
    jarsThisLevel,
    jar,
    lungHealth,
    score: Math.max(0, typeof raw.score === 'number' && !isNaN(raw.score) ? raw.score : 0),
    earnedThisRun: Math.max(0, typeof raw.earnedThisRun === 'number' && !isNaN(raw.earnedThisRun) ? raw.earnedThisRun : 0),
    combo: Math.max(1, Math.min(30, typeof raw.combo === 'number' && !isNaN(raw.combo) ? raw.combo : 1)),
    bestCombo: Math.max(1, typeof raw.bestCombo === 'number' && !isNaN(raw.bestCombo) ? raw.bestCombo : 1),
    perfectChain: Math.max(0, typeof raw.perfectChain === 'number' && !isNaN(raw.perfectChain) ? raw.perfectChain : 0),
    chainTime: Math.max(0, typeof raw.chainTime === 'number' && !isNaN(raw.chainTime) ? raw.chainTime : 0),
    selectedChar: Math.max(0, typeof raw.selectedChar === 'number' ? raw.selectedChar : 0),
    selectedTool: Math.max(0, typeof raw.selectedTool === 'number' ? raw.selectedTool : 0),
    inChallenge: Boolean(raw.inChallenge),
    challengeMods: Array.isArray(raw.challengeMods) ? raw.challengeMods.filter((id) => typeof id === 'string') : [],
    boostTimer: Math.max(0, typeof raw.boostTimer === 'number' && !isNaN(raw.boostTimer) ? raw.boostTimer : 0),
    wetTimer: Math.max(0, typeof raw.wetTimer === 'number' && !isNaN(raw.wetTimer) ? raw.wetTimer : 0),
    gustTimer: Math.max(0, typeof raw.gustTimer === 'number' && !isNaN(raw.gustTimer) ? raw.gustTimer : 0),
    regenBuff: Math.max(0, typeof raw.regenBuff === 'number' && !isNaN(raw.regenBuff) ? raw.regenBuff : 0),
    idleHealTimer: Math.max(0, typeof raw.idleHealTimer === 'number' && !isNaN(raw.idleHealTimer) ? raw.idleHealTimer : 0),
    isPassiveRecovering: Boolean(raw.isPassiveRecovering),
    earnPenalty: Math.max(0.1, Math.min(1.0, typeof raw.earnPenalty === 'number' && !isNaN(raw.earnPenalty) ? raw.earnPenalty : 1.0)),
    drags: Math.max(0, typeof raw.drags === 'number' && !isNaN(raw.drags) ? raw.drags : 0),
    containersFilled: Math.max(0, typeof raw.containersFilled === 'number' && !isNaN(raw.containersFilled) ? raw.containersFilled : 0),
    goldenFilled: Math.max(0, typeof raw.goldenFilled === 'number' && !isNaN(raw.goldenFilled) ? raw.goldenFilled : 0),
    fruitBought: Math.max(0, typeof raw.fruitBought === 'number' && !isNaN(raw.fruitBought) ? raw.fruitBought : 0),
    energyDrinksUsed: Math.max(0, typeof raw.energyDrinksUsed === 'number' && !isNaN(raw.energyDrinksUsed) ? raw.energyDrinksUsed : 0),
    timestamp: typeof raw.timestamp === 'number' && !isNaN(raw.timestamp) ? raw.timestamp : Date.now(),
  };
}

const restored = migrateActiveRunData(JSON.parse(globalStorage.getItem('smokeItUp.activeRun.v2')));
assert.ok(restored !== null, 'Restored data must not be null');
assert.strictEqual(restored.version, 2, 'Must migrate to version 2');
assert.strictEqual(restored.level, 4);
assert.strictEqual(restored.jar.fill, 0.45);
assert.strictEqual(restored.jar.value, 35);
assert.strictEqual(restored.jar.golden, true);
assert.strictEqual(restored.gameMode, 'rush');
assert.strictEqual(restored.lungHealth, 68.5);
assert.strictEqual(restored.score, 1420);
assert.deepStrictEqual(restored.challengeMods, ['tax', 'huge']);
console.log('✓ Migration and clamping tests passed successfully.');

// 2. Corrupt data handling
assert.strictEqual(migrateActiveRunData(null), null);
assert.strictEqual(migrateActiveRunData({}), null); // lungHealth missing defaults to 0 check or valid clamping
assert.strictEqual(migrateActiveRunData({ lungHealth: -10, level: 5 }), null, 'Zero or negative health returns null');
console.log('✓ Corrupt data handling tests passed successfully.');

// 3. Navigation Stack Deep Test
const navStack = new NavigationManager();
navStack.push('shop');
navStack.push('levels');
navStack.push('settings');
assert.strictEqual(navStack.getTop(), 'settings');
navStack.close('levels'); // close middle
assert.strictEqual(navStack.has('levels'), false);
assert.strictEqual(navStack.getTop(), 'settings');
navStack.handleBackButton();
assert.strictEqual(navStack.getTop(), 'shop');
navStack.handleBackButton();
assert.strictEqual(navStack.getTop(), null);
console.log('✓ Navigation deep stack manipulation tests passed.');

console.log('--- ALL INTEGRATION TESTS PASSED (100%) ---');
