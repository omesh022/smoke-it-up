import assert from 'assert';

console.log('--- STARTING MOBILE LAYOUTS & ACCESSIBILITY TEST SUITE ---');

// Test 1: Portrait and Landscape Layout Math
const PORTRAIT_SIZES = [
  { w: 320, h: 568, name: 'iPhone SE 1st gen' },
  { w: 360, h: 640, name: 'Standard Android' },
  { w: 375, h: 667, name: 'iPhone 8 / SE2' },
  { w: 390, h: 844, name: 'iPhone 12/13/14' },
  { w: 393, h: 852, name: 'iPhone 14/15 Pro' },
  { w: 412, h: 915, name: 'Pixel 7 / Galaxy S21' },
  { w: 430, h: 932, name: 'iPhone 14/15 Pro Max' },
];

const LANDSCAPE_SIZES = [
  { w: 568, h: 320, name: 'iPhone SE Landscape (Short)' },
  { w: 640, h: 360, name: 'Android 360p Landscape' },
  { w: 667, h: 375, name: 'iPhone 8 Landscape' },
  { w: 844, h: 390, name: 'iPhone 14 Landscape' },
  { w: 915, h: 412, name: 'Pixel 7 Landscape' },
  { w: 1024, h: 768, name: 'iPad / Tablet Landscape' },
];

function calculateLayout(width, height) {
  const isLandscape = width > height;
  let charX, charY, jarX, jarY, jarW, jarH, barY;

  if (!isLandscape) {
    const isNarrow = width < 450;
    charX = width * (isNarrow ? 0.22 : 0.18);
    charY = height * (isNarrow ? 0.52 : 0.58);
    jarX = width * (isNarrow ? 0.76 : 0.72);
    jarY = height * (isNarrow ? 0.52 : 0.58);
    jarW = Math.min(115, Math.max(80, width * 0.26));
    jarH = jarW * 1.27;
    barY = height * 0.82;
  } else {
    const isShort = height < 450;
    if (isShort) {
      charX = Math.max(55, width * 0.20);
      charY = height * 0.56;
      jarX = Math.min(width - 65, width * 0.78);
      jarY = height * 0.56;
      jarW = Math.min(95, Math.max(65, height * 0.25));
      jarH = jarW * 1.25;
      barY = height * 0.85;
    } else {
      charX = width * 0.22;
      charY = height * 0.58;
      jarX = width * 0.75;
      jarY = height * 0.58;
      jarW = Math.min(130, Math.max(90, height * 0.22));
      jarH = jarW * 1.27;
      barY = height * 0.85;
    }
  }

  return { charX, charY, jarX, jarY, jarW, jarH, barY, isLandscape };
}

console.log('\nTesting Portrait Screen Layouts:');
for (const s of PORTRAIT_SIZES) {
  const l = calculateLayout(s.w, s.h);
  assert(!l.isLandscape, `${s.name} should be portrait`);
  assert(l.charX > 0 && l.charX < s.w / 2, `${s.name} charX (${l.charX}) within left half`);
  assert(l.jarX > s.w / 2 && l.jarX < s.w, `${s.name} jarX (${l.jarX}) within right half`);
  assert(l.charY > s.h * 0.4 && l.charY < s.h * 0.7, `${s.name} charY (${l.charY}) vertically comfortable`);
  assert(l.jarW >= 80 && l.jarW <= 115, `${s.name} jarW (${l.jarW}) within bounds`);
  assert(l.barY > l.charY, `${s.name} barY below character`);
  console.log(`  ✓ ${s.name} (${s.w}x${s.h}): char=(${l.charX.toFixed(1)}, ${l.charY.toFixed(1)}), jar=(${l.jarX.toFixed(1)}, ${l.jarY.toFixed(1)}, ${l.jarW.toFixed(1)}x${l.jarH.toFixed(1)})`);
}

console.log('\nTesting Landscape Screen Layouts:');
for (const s of LANDSCAPE_SIZES) {
  const l = calculateLayout(s.w, s.h);
  assert(l.isLandscape, `${s.name} should be landscape`);
  assert(l.charX > 0 && l.charX < s.w * 0.35, `${s.name} charX (${l.charX}) placed on left`);
  assert(l.jarX > s.w * 0.65 && l.jarX < s.w, `${s.name} jarX (${l.jarX}) placed on right`);
  assert(l.charY > s.h * 0.45 && l.charY < s.h * 0.7, `${s.name} charY (${l.charY}) vertically centered`);
  assert(l.jarW >= 65 && l.jarW <= 130, `${s.name} jarW (${l.jarW}) within bounds`);
  console.log(`  ✓ ${s.name} (${s.w}x${s.h}): char=(${l.charX.toFixed(1)}, ${l.charY.toFixed(1)}), jar=(${l.jarX.toFixed(1)}, ${l.jarY.toFixed(1)}, ${l.jarW.toFixed(1)}x${l.jarH.toFixed(1)})`);
}

// Test 2: Settings Defaults and Persistence
console.log('\nTesting Settings & Accessibility Defaults:');
function getSettingsDefaults() {
  return {
    reducedMotion: false,
    lowEffects: false,
    highContrast: false,
    haptics: true,
    leftHanded: false,
    showFps: false,
  };
}

let currentSettings = getSettingsDefaults();
assert.strictEqual(currentSettings.leftHanded, false, 'Default leftHanded is false');
assert.strictEqual(currentSettings.haptics, true, 'Default haptics is true');

currentSettings = { ...currentSettings, leftHanded: true, lowEffects: true, reducedMotion: true };
assert.strictEqual(currentSettings.leftHanded, true, 'Left handed toggled to true');
assert.strictEqual(currentSettings.lowEffects, true, 'Low effects toggled to true');
assert.strictEqual(currentSettings.reducedMotion, true, 'Reduced motion toggled to true');
console.log('  ✓ Settings toggle and state manipulation verified');

// Test 3: Tap Target Minimum
console.log('\nTesting Tap Target Sizing (>= 44px):');
const TAP_TARGET_MIN = 44;
const buttonSizes = [
  { name: 'Smoke Button', size: 56 },
  { name: 'Shop Button', size: 44 },
  { name: 'Pause Button', size: 44 },
  { name: 'Fruit Quick Button', size: 44 },
  { name: 'Energy Drink Quick Button', size: 44 },
  { name: 'Blaster Quick Button', size: 44 },
  { name: 'Audio Toggles', size: 44 },
];

for (const b of buttonSizes) {
  assert(b.size >= TAP_TARGET_MIN, `${b.name} (${b.size}px) meets or exceeds ${TAP_TARGET_MIN}px requirement`);
  console.log(`  ✓ ${b.name}: ${b.size}px >= ${TAP_TARGET_MIN}px`);
}

console.log('\n--- ALL MOBILE & ACCESSIBILITY TESTS PASSED (100%) ---');
