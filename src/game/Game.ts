import { AudioManager } from './Audio';
import {
  GLOBAL_TOOL_DAMAGE_MULT,
  GLOBAL_EARNINGS_MULT,
  PASSIVE_RECOVERY_DELAY,
  PASSIVE_RECOVERY_RATE,
  PASSIVE_RECOVERY_CAP,
  AVOCADO_RECOVERY_HP,
  STAR_TO_CASH,
  GAME_MODES,
  CHALLENGE_MODS,
  calculateJarReward,
  calculateLiveDrainRate,
  getBaseToolDrain,
  updatePassiveRecovery,
  calculateFruitHeal,
  type ChallengeModDef,
} from './Balance';

export {
  GLOBAL_TOOL_DAMAGE_MULT,
  GLOBAL_EARNINGS_MULT,
  PASSIVE_RECOVERY_DELAY,
  PASSIVE_RECOVERY_RATE,
  PASSIVE_RECOVERY_CAP,
  AVOCADO_RECOVERY_HP,
  STAR_TO_CASH,
  GAME_MODES,
  CHALLENGE_MODS,
  calculateJarReward,
  calculateLiveDrainRate,
  getBaseToolDrain,
  updatePassiveRecovery,
  calculateFruitHeal,
};

export type GameState = 'menu' | 'playing' | 'paused' | 'gameover';
export type GameMode = 'classic' | 'relaxed' | 'rush';

export interface ActionFeedback {
  success: boolean;
  reason?:
    | 'INSUFFICIENT_FUNDS'
    | 'ALREADY_OWNED'
    | 'LOCKED'
    | 'FULL_HEALTH'
    | 'OUT_OF_STOCK'
    | 'MAX_STOCK'
    | 'JAR_FULL'
    | 'INVALID_STATE';
  message: string;
}

// ============ Defs ============

export type HairStyle = 'long' | 'short' | 'braids' | 'curly' | 'buzz' | 'fade' | 'bald';
export type Accessory = 'sunglasses' | 'glasses' | 'chain' | 'grill' | 'cap' | 'star' | 'none';
export type Outfit = 'hoodie' | 'tee' | 'suit' | 'flannel' | 'jacket';

export interface CharacterDef {
  id: string;
  name: string;
  cost: number;
  mult: number;
  icon: string;
  blurb: string;
  skin: string;
  skinDark: string;
  hair: HairStyle;
  hairColor: string;
  beard: boolean;
  beardColor: string;
  accessory: Accessory;
  outfit: Outfit;
  shirt: string;
  shirtDark: string;
  accent: string;
}

export interface ToolDef {
  id: string;
  name: string;
  cost: number;
  fill: number;
  drain: number;
  earn: number; // jar payout multiplier
  icon: string;
  blurb: string;
  interval: number;
  count: number;
  size: number;
  palette: string[];
  led?: string;
}

export interface FruitDef {
  id: string;
  name: string;
  icon: string;
  cost: number;
  heal: number;
  blurb: string;
}

export type ChallengeMod = ChallengeModDef;

export interface AchievementDef {
  id: string;
  name: string;
  desc: string;
  icon: string;
  stars?: number;
  blasters?: number;
}

export const CHARACTERS: CharacterDef[] = [
  {
    id: 'jid', name: 'JID', cost: 0, mult: 1.0, icon: 'mic',
    skin: '#8a5a34', skinDark: '#7a4c28', hair: 'braids', hairColor: '#241a12',
    beard: true, beardColor: '#241a12', accessory: 'glasses', outfit: 'tee',
    shirt: '#2f5d8a', shirtDark: '#244a6e', accent: '#ffd93d',
    blurb: 'The Forever Story begins here. Default legend.',
  },
  {
    id: '21savage', name: '21 Savage', cost: 700, mult: 1.15, icon: 'flame',
    skin: '#5c3a26', skinDark: '#4a2c1a', hair: 'short', hairColor: '#161616',
    beard: true, beardColor: '#161616', accessory: 'chain', outfit: 'hoodie',
    shirt: '#101014', shirtDark: '#0a0a0c', accent: '#b23a3a',
    blurb: 'Straight out the Slaughter Gang.',
  },
  {
    id: 'jcole', name: 'J. Cole', cost: 1800, mult: 1.3, icon: 'disc',
    skin: '#8a5a34', skinDark: '#7a4c28', hair: 'fade', hairColor: '#241a12',
    beard: false, beardColor: '', accessory: 'cap', outfit: 'hoodie',
    shirt: '#3a6ea5', shirtDark: '#2f5d8a', accent: '#f0f0f0',
    blurb: 'Dreamville certified. No dreams — just smoke.',
  },
  {
    id: 'future', name: 'Future', cost: 4200, mult: 1.5, icon: 'glasses',
    skin: '#5c3a26', skinDark: '#4a2c1a', hair: 'braids', hairColor: '#181818',
    beard: true, beardColor: '#181818', accessory: 'grill', outfit: 'hoodie',
    shirt: '#1c1c24', shirtDark: '#14141a', accent: '#c9a227',
    blurb: 'Pluto. Mask on, lungs off. Brrr.',
  },
  {
    id: 'carti', name: 'Playboi Carti', cost: 8000, mult: 1.75, icon: 'sparkles',
    skin: '#e0a882', skinDark: '#d09870', hair: 'long', hairColor: '#141414',
    beard: false, beardColor: '', accessory: 'star', outfit: 'tee',
    shirt: '#d43a4a', shirtDark: '#b02e3c', accent: '#f0f0f0',
    blurb: 'Whole Lotta Smoke. Vamp mode: engaged.',
  },
  {
    id: 'kanye', name: 'Kanye West', cost: 14000, mult: 2.05, icon: 'glasses',
    skin: '#7a4c28', skinDark: '#6a3e20', hair: 'buzz', hairColor: '#1a1208',
    beard: true, beardColor: '#1a1208', accessory: 'sunglasses', outfit: 'hoodie',
    shirt: '#1a1a1f', shirtDark: '#121216', accent: '#8a8a8a',
    blurb: 'I am a god... of smoke.',
  },
  {
    id: 'eminem', name: 'Eminem', cost: 15000, mult: 2.35, icon: 'mic',
    skin: '#f2dcc8', skinDark: '#e8ccb0', hair: 'buzz', hairColor: '#e8d8a0',
    beard: false, beardColor: '', accessory: 'none', outfit: 'hoodie',
    shirt: '#d8d8d8', shirtDark: '#c8c8c8', accent: '#5a5a5a',
    blurb: 'Will the real slim shady please light up?',
  },
  {
    id: 'nas', name: 'Nas', cost: 22000, mult: 2.7, icon: 'crown',
    skin: '#6a4428', skinDark: '#5a3820', hair: 'fade', hairColor: '#1a1208',
    beard: true, beardColor: '#1a1208', accessory: 'chain', outfit: 'suit',
    shirt: '#1a1a22', shirtDark: '#121218', accent: '#ffffff',
    blurb: 'Illmatic. Queensbridge royalty of smoke.',
  },
  {
    id: 'kendrick', name: 'Kendrick Lamar', cost: 32000, mult: 3.05, icon: 'trophy',
    skin: '#7a4c28', skinDark: '#6a3e20', hair: 'short', hairColor: '#1a1208',
    beard: true, beardColor: '#1a1208', accessory: 'none', outfit: 'hoodie',
    shirt: '#2a2a34', shirtDark: '#1e1e26', accent: '#c9a227',
    blurb: 'DAMN. The king of lyrical lung capacity.',
  },
  {
    id: 'rocky', name: 'ASAP Rocky', cost: 45000, mult: 3.4, icon: 'hat',
    skin: '#a06a3e', skinDark: '#905a32', hair: 'long', hairColor: '#1c1410',
    beard: false, beardColor: '', accessory: 'glasses', outfit: 'jacket',
    shirt: '#c25a8a', shirtDark: '#a84872', accent: '#111111',
    blurb: 'Fashion Killa. Swag on the smoke, style on the sell.',
  },
  {
    id: 'cardi', name: 'Cardi B', cost: 62000, mult: 3.8, icon: 'diamond',
    skin: '#8a5a34', skinDark: '#7a4c28', hair: 'curly', hairColor: '#141414',
    beard: false, beardColor: '', accessory: 'chain', outfit: 'jacket',
    shirt: '#d43a4a', shirtDark: '#b02e3c', accent: '#ffd93d',
    blurb: 'Bodak Yellow. Money moves only — OKURRR.',
  },
  {
    id: 'lilwayne', name: 'Lil Wayne', cost: 85000, mult: 4.2, icon: 'guitar',
    skin: '#5c3a26', skinDark: '#4a2c1a', hair: 'braids', hairColor: '#141414',
    beard: false, beardColor: '', accessory: 'grill', outfit: 'tee',
    shirt: '#b23a3a', shirtDark: '#982e2e', accent: '#ffffff',
    blurb: 'A Milli. The GOAT of bars and blunts.',
  },
  {
    id: 'snoop', name: 'Snoop Dogg', cost: 110000, mult: 4.6, icon: 'leaf',
    skin: '#b5785a', skinDark: '#a5684a', hair: 'long', hairColor: '#201008',
    beard: true, beardColor: '#201008', accessory: 'chain', outfit: 'tee',
    shirt: '#5a2d8a', shirtDark: '#4a2370', accent: '#ffd93d',
    blurb: 'The O.G. Drop it like it\'s hot — literally.',
  },
  {
    id: 'wiz', name: 'Wiz Khalifa', cost: 145000, mult: 5.1, icon: 'leaf',
    skin: '#e8b88a', skinDark: '#d8a47a', hair: 'long', hairColor: '#c9a86a',
    beard: false, beardColor: '', accessory: 'chain', outfit: 'tee',
    shirt: '#6a2d8e', shirtDark: '#5a2378', accent: '#d9b64a',
    blurb: 'Taylor Gang or die. Premium gas lungs.',
  },
  {
    id: 'drake', name: 'Drake', cost: 190000, mult: 5.7, icon: 'crown',
    skin: '#a06a3e', skinDark: '#905a32', hair: 'fade', hairColor: '#1c1410',
    beard: true, beardColor: '#241a12', accessory: 'chain', outfit: 'tee',
    shirt: '#e8e6e2', shirtDark: '#d8d6d2', accent: '#5a5a5a',
    blurb: 'Started from the bottom, now here selling smoke containers.',
  },
  {
    id: 'weeknd', name: 'The Weeknd', cost: 250000, mult: 6.3, icon: 'glasses',
    skin: '#a8765a', skinDark: '#98664a', hair: 'curly', hairColor: '#141414',
    beard: false, beardColor: '', accessory: 'glasses', outfit: 'jacket',
    shirt: '#d23c3c', shirtDark: '#b02e2e', accent: '#111111',
    blurb: 'Blinding lights, blurry lungs. Save your fruit.',
  },
  {
    id: 'travis', name: 'Travis Scott', cost: 320000, mult: 7.0, icon: 'flame',
    skin: '#c88a5a', skinDark: '#b87a4a', hair: 'braids', hairColor: '#201008',
    beard: false, beardColor: '', accessory: 'chain', outfit: 'flannel',
    shirt: '#8a6a4a', shirtDark: '#7a5a3a', accent: '#2a2a2a',
    blurb: 'Astroworld. Cactus Jack says: keep smoking, keep selling.',
  },
  {
    id: 'jayz', name: 'Jay-Z', cost: 420000, mult: 7.8, icon: 'crown',
    skin: '#4a2c1c', skinDark: '#3c2214', hair: 'bald', hairColor: '',
    beard: true, beardColor: '#241a12', accessory: 'chain', outfit: 'suit',
    shirt: '#101014', shirtDark: '#08080a', accent: '#e8e8e8',
    blurb: 'Hova. The businessman of smoke. 99 problems.',
  },
];

export const TOOLS: ToolDef[] = [
  {
    id: 'cig', name: 'Cigarette', cost: 0, fill: 0.85, drain: 1.75, earn: 1.0, icon: 'cigarette',
    interval: 0.018, count: 2, size: 12, palette: ['#cfcfcf', '#c2c2c2'],
    blurb: 'Slow & harsh. Holding forever will kill you.',
  },
  {
    id: 'ecig', name: 'E-Cigarette', cost: 520, fill: 0.9, drain: 1.3, earn: 1.08, icon: 'vape',
    interval: 0.015, count: 2, size: 11, palette: ['#dfe8f8', '#cdd9ef'], led: '#5adcff',
    blurb: 'Safer lungs, still slow. Best early upgrade.',
  },
  {
    id: 'pod', name: 'Pod', cost: 1400, fill: 1.15, drain: 1.7, earn: 1.28, icon: 'modbox',
    interval: 0.014, count: 2, size: 12, palette: ['#e9ecf8', '#d9deee'], led: '#c77dff',
    blurb: 'Modest speed & pay. Still needs careful bursts.',
  },
  {
    id: 'cigar', name: 'Cigar', cost: 3200, fill: 1.55, drain: 2.85, earn: 1.7, icon: 'cigar',
    interval: 0.013, count: 2, size: 15, palette: ['#cbb59a', '#bfa888'],
    blurb: 'Faster fill & better pay. Real lung pressure.',
  },
  {
    id: 'hookah', name: 'Hookah', cost: 9000, fill: 2.35, drain: 4.0, earn: 2.35, icon: 'hookah',
    interval: 0.01, count: 2, size: 17, palette: ['#c9a8e8', '#f0a8c8', '#a8d8e8', '#f0d8a8'],
    blurb: 'Fast money. Heavy drain — heal often or die.',
  },
  {
    id: 'bong', name: 'Bong', cost: 20000, fill: 3.15, drain: 5.1, earn: 3.1, icon: 'bong',
    interval: 0.009, count: 2, size: 18, palette: ['#e8e8f0', '#f0f0f5'],
    blurb: 'Huge pay, brutal lungs. Experts only.',
  },
  {
    id: 'blunt', name: 'Blunt', cost: 45000, fill: 4.0, drain: 6.2, earn: 4.0, icon: 'blunt',
    interval: 0.011, count: 2, size: 15, palette: ['#a8c49a', '#95b887'],
    blurb: 'Endgame glass cannon. Insane fill & pay.',
  },
];

export const FRUITS: FruitDef[] = [
  { id: 'apple', name: 'Apple', icon: 'apple', cost: 10, heal: 18, blurb: 'Best early value. +18 HP' },
  { id: 'orange', name: 'Orange', icon: 'orange', cost: 18, heal: 30, blurb: 'Solid mid heal. +30 HP' },
  { id: 'blueberry', name: 'Blueberries', icon: 'blueberry', cost: 38, heal: 50, blurb: 'Strong recovery. +50 HP' },
  { id: 'guava', name: 'Guava', icon: 'guava', cost: 70, heal: 72, blurb: 'Big heal. +72 HP' },
  { id: 'avocado', name: 'Avocado', icon: 'avocado', cost: 120, heal: 100, blurb: 'Full health recovery. Restores to 100% HP' },
];

export const ENERGY_DRINK = {
  cost: 15,
  instant: 8,
  regenRate: 3.0,
  regenTime: 8,
  icon: 'zap',
  maxStock: 12,
  blurb: '+8 now, then +3 HP/s for 8s. Only passive regen!',
};

export const ACHIEVEMENTS: AchievementDef[] = [
  { id: 'first', name: 'First Jar', desc: 'Fill your very first jar', icon: 'trophy', stars: 1 },
  { id: 'jars10', name: 'Jar Collector', desc: 'Fill 10 jars (lifetime)', icon: 'award', stars: 2 },
  { id: 'jars50', name: 'Jar Hoarder', desc: 'Fill 50 jars (lifetime)', icon: 'trophy', stars: 3 },
  { id: 'jars100', name: 'Jar Factory', desc: 'Fill 100 jars (lifetime)', icon: 'trophy', stars: 4, blasters: 1 },
  { id: 'jars200', name: 'Jar Tycoon', desc: 'Fill 200 jars (lifetime)', icon: 'trophy', stars: 5, blasters: 1 },
  { id: 'jars500', name: 'Smoke Empire', desc: 'Fill 500 jars (lifetime)', icon: 'crown', stars: 8, blasters: 2 },
  { id: 'combo5', name: 'On Fire', desc: 'Reach a 5.0 combo', icon: 'flame', stars: 2 },
  { id: 'combo10', name: 'Unstoppable', desc: 'Reach a 10.0 combo', icon: 'zap', stars: 3, blasters: 1 },
  { id: 'combo15', name: 'Blazing Path', desc: 'Reach a 15.0 combo', icon: 'flame', stars: 4 },
  { id: 'combo20', name: 'Godly Streak', desc: 'Reach a 20.0 combo', icon: 'zap', stars: 5, blasters: 1 },
  { id: 'combo30', name: 'Untouchable', desc: 'Reach a 30.0 combo', icon: 'crown', stars: 8, blasters: 2 },
  { id: 'gold5', name: 'Golden Touch', desc: 'Fill 5 golden jars (lifetime)', icon: 'star', stars: 2 },
  { id: 'gold20', name: 'Midas', desc: 'Fill 20 golden jars (lifetime)', icon: 'star', stars: 4, blasters: 1 },
  { id: 'gold50', name: 'Gold Rush', desc: 'Fill 50 golden jars (lifetime)', icon: 'star', stars: 6, blasters: 1 },
  { id: 'lv10', name: 'Getting Serious', desc: 'Reach level 10', icon: 'level', stars: 2 },
  { id: 'lv25', name: 'Veteran', desc: 'Reach level 25', icon: 'level', stars: 3, blasters: 1 },
  { id: 'lv40', name: 'Hardened', desc: 'Reach level 40', icon: 'shield', stars: 4 },
  { id: 'lv50', name: 'Smoke Legend', desc: 'Reach level 50', icon: 'trophy', stars: 5, blasters: 1 },
  { id: 'lv75', name: 'Iron Lungs', desc: 'Reach level 75', icon: 'shield', stars: 6, blasters: 1 },
  { id: 'lv100', name: 'Immortal Lungs', desc: 'Reach level 100', icon: 'crown', stars: 10, blasters: 2 },
  { id: 'fruit30', name: 'Fruit Fanatic', desc: 'Eat 30 fruits (lifetime)', icon: 'apple', stars: 2 },
  { id: 'fruit100', name: 'Orchard Boss', desc: 'Eat 100 fruits (lifetime)', icon: 'avocado', stars: 4 },
  { id: 'energy20', name: 'Caffeinated', desc: 'Drink 20 energy drinks (lifetime)', icon: 'zap', stars: 2 },
  { id: 'energy50', name: 'Wired', desc: 'Drink 50 energy drinks (lifetime)', icon: 'zap', stars: 3 },
  { id: 'challenge3', name: 'Storm Slayer', desc: 'Clear 3 challenge levels', icon: 'shield', stars: 3, blasters: 1 },
  { id: 'challenge10', name: 'Challenge King', desc: 'Clear 10 challenge levels', icon: 'shield', stars: 5, blasters: 1 },
  { id: 'challenge25', name: 'Unbreakable', desc: 'Clear 25 challenge levels', icon: 'shield', stars: 8, blasters: 2 },
  { id: 'milestone', name: 'Flawless', desc: 'Earn your first combo milestone', icon: 'diamond', stars: 2 },
  { id: 'milestones5', name: 'Streak Artist', desc: 'Earn 5 combo milestones (lifetime)', icon: 'diamond', stars: 4, blasters: 1 },
  { id: 'rich', name: 'Grand Hustle', desc: 'Hold $1,000 in your bank at once', icon: 'money', stars: 3 },
  { id: 'rich2', name: 'Baller', desc: 'Hold $10,000 in your bank at once', icon: 'money', stars: 5, blasters: 1 },
  { id: 'rich3', name: 'Whale', desc: 'Hold $50,000 in your bank at once', icon: 'money', stars: 8, blasters: 2 },
  { id: 'chars5', name: 'Talent Scout', desc: 'Own 5 different smokers', icon: 'mic', stars: 3 },
  { id: 'chars10', name: 'Roster Builder', desc: 'Own 10 different smokers', icon: 'crown', stars: 5, blasters: 1 },
  { id: 'toolsAll', name: 'Toolbox', desc: 'Own every smoking tool', icon: 'blunt', stars: 6, blasters: 2 },
  { id: 'perfect10', name: 'Perfect 10', desc: 'Land 10 perfect jars in a row', icon: 'star', stars: 3, blasters: 1 },
  { id: 'perfect20', name: 'Machine', desc: 'Land 20 perfect jars in a row', icon: 'star', stars: 5, blasters: 1 },
  { id: 'closeCall', name: 'Close Call', desc: 'Survive a jar with under 10% lungs', icon: 'shield', stars: 2 },
  { id: 'blaster1', name: 'First Blast', desc: 'Use a Smoke Blaster once', icon: 'blaster', stars: 1 },
  { id: 'blaster10', name: 'Demolition', desc: 'Use 10 Smoke Blasters', icon: 'blaster', stars: 4 },
  { id: 'stars10', name: 'Star Collector', desc: 'Earn 10 golden stars total', icon: 'star', stars: 2 },
  { id: 'stars50', name: 'Constellation', desc: 'Earn 50 golden stars total', icon: 'star', stars: 5, blasters: 1 },
];

// ============ Stats ============

export interface GameStats {
  lungHealth: number;
  money: number;
  score: number;
  combo: number;
  bestCombo: number;
  drags: number;
  containersFilled: number;
  fruitBought: number;
  highScore: number;
  selectedChar: number;
  selectedTool: number;
  unlockedChars: boolean[];
  unlockedTools: boolean[];
  level: number;
  jarsThisLevel: number;
  levelQuota: number;
  bestLevel: number;
  goldenFilled: number;
  fruitDrops: number;
  scores: number[];
  drinkStock: number;
  regenBuff: number;
  energyDrinksUsed: number;
  costMult: number;
  inChallenge: boolean;
  challengeMods: string[];
  perfectChain: number;
  achievements: string[];
  activeEffects: string[];
  nextJarX2: boolean;
  goldenStars: number;
  smokeBlasters: number;
  lifetimeStars: number;
  lifetimeBlastersUsed: number;
  gameMode: GameMode;
  isPassiveRecovering: boolean;
  hasActiveRun: boolean;
  activeRunLevel?: number;
  activeRunScore?: number;
  activeRunMode?: GameMode;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  type: 'smoke' | 'ember' | 'heart' | 'star' | 'coin' | 'puff' | 'rain' | 'fog';
  color: string;
  rotation: number;
  rotSpeed: number;
  gravity: number;
  drag: number;
}

interface Floater {
  x: number;
  y: number;
  text: string;
  color: string;
  life: number;
  maxLife: number;
  vy: number;
  scale: number;
  size: number;
}

interface Jar {
  x: number;
  y: number;
  w: number;
  h: number;
  fill: number;
  value: number;
  golden: boolean;
  shake: number;
  enter: number;
  pop: number;
  hue: number;
}

interface FruitDrop {
  fruit: FruitDef;
  x: number;
  y: number;
  life: number;
  maxLife: number;
}

interface Banner {
  title: string;
  sub: string;
  color: string;
  life: number;
  maxLife: number;
}

interface LevelTheme {
  skyTop: string;
  skyMid: string;
  skyBot: string;
  weather: 'clear' | 'fog' | 'heat';
  wind: number;
  fillVar: number;
  windowTint: string;
}

interface Progress {
  highScore: number;
  bank: number;
  bestLevel: number;
  scores: number[];
  unlockedChars: number[];
  selectedChar: number;
  unlockedTools: number[];
  selectedTool: number;
  drinkStock: number;
  achievements: string[];
  lifetimeJars: number;
  lifetimeFruit: number;
  lifetimeDrinks: number;
  lifetimeGold: number;
  lifetimeChallenges: number;
  lifetimeMilestones: number;
  lastRunLevel: number;
  bestComboEver: number;
  goldenStars: number;
  smokeBlasters: number;
  lifetimeStars: number;
  lifetimeBlastersUsed: number;
  preferredMode?: GameMode;
}

const LS_KEY = 'smokeItUp.progress.v5';
const ACTIVE_RUN_KEY = 'smokeItUp.activeRun.v2';

export interface ActiveRunSave {
  version: 2;
  gameMode: GameMode;
  level: number;
  jarsThisLevel: number;
  jar: {
    fill: number;
    value: number;
    golden: boolean;
    hue: number;
    w: number;
    h: number;
  };
  lungHealth: number;
  score: number;
  earnedThisRun: number;
  combo: number;
  bestCombo: number;
  perfectChain: number;
  chainTime: number;
  selectedChar: number;
  selectedTool: number;
  inChallenge: boolean;
  challengeMods: string[];
  theme: LevelTheme;
  boostTimer: number;
  wetTimer: number;
  gustTimer: number;
  regenBuff: number;
  idleHealTimer: number;
  isPassiveRecovering: boolean;
  earnPenalty: number;
  drags: number;
  containersFilled: number;
  goldenFilled: number;
  fruitBought: number;
  energyDrinksUsed: number;
  timestamp: number;
}

const COMBO_MILESTONES = [
  { need: 5, reward: 18, label: 'FLAWLESS!', color: '#8ecae6' },
  { need: 10, reward: 60, label: 'PERFECT STREAK!', color: '#95d5b2' },
  { need: 20, reward: 180, label: 'LEGENDARY!', color: '#c77dff' },
  { need: 30, reward: 550, label: 'UNREAL!!!', color: '#ffd700' },
];

const THEMES: LevelTheme[] = [
  { skyTop: '#1a0b2e', skyMid: '#2a1245', skyBot: '#0f0520', weather: 'clear', wind: 0, fillVar: 1, windowTint: '255,200,100' },
  { skyTop: '#141c34', skyMid: '#1e2c4d', skyBot: '#0a0f20', weather: 'clear', wind: 0, fillVar: 1.04, windowTint: '150,190,255' },
  { skyTop: '#2e1230', skyMid: '#421a45', skyBot: '#180a18', weather: 'clear', wind: 0, fillVar: 0.96, windowTint: '255,180,120' },
  { skyTop: '#1a2a22', skyMid: '#24403a', skyBot: '#0c1a14', weather: 'clear', wind: 0, fillVar: 1.02, windowTint: '160,255,200' },
  { skyTop: '#232033', skyMid: '#352f4d', skyBot: '#12101c', weather: 'fog', wind: 0.15, fillVar: 0.97, windowTint: '255,220,170' },
  { skyTop: '#0f1a2e', skyMid: '#1a2c4a', skyBot: '#080f1c', weather: 'fog', wind: -0.15, fillVar: 1.05, windowTint: '170,210,255' },
  { skyTop: '#2a2418', skyMid: '#443a24', skyBot: '#16110a', weather: 'heat', wind: 0.3, fillVar: 0.94, windowTint: '255,200,130' },
  { skyTop: '#1a1436', skyMid: '#2c2250', skyBot: '#0c0a20', weather: 'heat', wind: -0.3, fillVar: 1.03, windowTint: '200,170,255' },
];

export class Game {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private width = 0;
  private height = 0;
  private dpr = 1;

  private state: GameState = 'menu';
  private running = false;
  private lastTime = 0;
  private rafId = 0;
  private totalTime = 0;

  // Run state
  private lungHealth = 100;
  private score = 0;
  private combo = 1;
  private comboTimer = 0;
  private bestCombo = 1;
  private drags = 0;
  private containersFilled = 0;
  private fruitBought = 0;
  private chainTime = 0;
  private coughTime = 0;
  private perfectChain = 0;
  private earnedThisRun = 0;
  private idleHealTimer = 0;
  private gameMode: GameMode = 'classic';
  private preferredMode: GameMode = 'classic';
  private isPassiveRecovering = false;
  private autoSaveTimer = 0;
  public isOverlayOpen = false;

  // Persistent economy + meta
  private bank = 0;
  private highScore = 0;
  private scores: number[] = [];
  private bestLevel = 0;
  private unlockedChars: boolean[];
  private selectedChar = 0;
  private unlockedTools: boolean[];
  private selectedTool = 0;
  private drinkStock = 0;
  private achievements: string[] = [];
  private goldenStars = 0;
  private smokeBlasters = 0;
  private lifetimeStars = 0;
  private lifetimeBlastersUsed = 0;
  private lifetimeJars = 0;
  private survivedLowHealth = false;
  private lifetimeFruit = 0;
  private lifetimeDrinks = 0;
  private lifetimeGold = 0;
  private lifetimeChallenges = 0;
  private lifetimeMilestones = 0;
  private lastRunLevel = 0;
  private bestComboEver = 1;

  // Regen buff
  private regenBuff = 0;
  private energyDrinksUsed = 0;

  // Level system
  private level = 1;
  private jarsThisLevel = 0;
  private goldenFilled = 0;
  private fruitDrops = 0;
  private lastFruitDropAt = -99;
  private theme: LevelTheme = THEMES[0];

  // Challenge levels
  private challengeActive = false;
  private challengeMods: string[] = [];

  // Dynamic balancing (subtle, invisible)
  private balanceEase = 1;
  private earnPenalty = 1;

  // Surprise / negative events
  private nextJarX2 = false;
  private boostTimer = 0;
  private wetTimer = 0;
  private gustTimer = 0;
  private discountActive = false;

  // Rewards
  private fruitDrop: FruitDrop | null = null;
  private banner: Banner | null = null;

  // Audio
  private audio: AudioManager | null = null;
  private hbTimer = 0;

  // Character
  private charX = 0;
  private charY = 0;
  private charBreath = 0;

  // Active jar
  private jar: Jar;

  // Input
  private smoking = false;
  private shopOpen = false;

  // Effects
  private particles: Particle[] = [];
  private floaters: Floater[] = [];
  private shakeIntensity = 0;
  private shakeX = 0;
  private shakeY = 0;
  private flash = 0;
  private smokeEmitTimer = 0;

  private cachedActiveRun: ActiveRunSave | null = null;

  public onStatsChange?: (stats: GameStats) => void;
  public onStateChange?: (state: GameState) => void;
  public onToast?: (ach: AchievementDef) => void;
  public onFeedback?: (fb: ActionFeedback) => void;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('No 2d context');
    this.ctx = ctx;
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);

    const prog = this.loadProgress();
    this.preferredMode = prog.preferredMode && GAME_MODES[prog.preferredMode] ? prog.preferredMode : 'classic';
    this.gameMode = this.preferredMode;
    this.unlockedChars = CHARACTERS.map((_, i) => prog.unlockedChars.includes(i));
    this.unlockedTools = TOOLS.map((_, i) => prog.unlockedTools.includes(i));
    this.selectedChar = Math.min(prog.selectedChar, CHARACTERS.length - 1);
    this.selectedTool = Math.min(prog.selectedTool, TOOLS.length - 1);
    this.highScore = prog.highScore;
    this.scores = prog.scores;
    this.cachedActiveRun = this.loadActiveRunFromStorage();
    this.bestLevel = prog.bestLevel;
    this.bank = prog.bank;
    this.drinkStock = prog.drinkStock;
    this.achievements = prog.achievements;
    this.goldenStars = prog.goldenStars;
    this.smokeBlasters = prog.smokeBlasters;
    this.lifetimeStars = prog.lifetimeStars;
    this.lifetimeBlastersUsed = prog.lifetimeBlastersUsed;
    this.lifetimeJars = prog.lifetimeJars;
    this.lifetimeFruit = prog.lifetimeFruit;
    this.lifetimeDrinks = prog.lifetimeDrinks;
    this.lifetimeGold = prog.lifetimeGold;
    this.lifetimeChallenges = prog.lifetimeChallenges;
    this.lifetimeMilestones = prog.lifetimeMilestones;
    this.lastRunLevel = prog.lastRunLevel;
    this.bestComboEver = prog.bestComboEver;
    if (prog.fresh) {
      this.bank = 22;
      this.drinkStock = 2;
    }
    if (!this.unlockedChars[this.selectedChar]) this.unlockedChars[this.selectedChar] = true;
    if (!this.unlockedTools[this.selectedTool]) this.unlockedTools[this.selectedTool] = true;

    this.jar = this.spawnJar();
    this.resize();

    window.addEventListener('resize', this.resize);
    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('keyup', this.onKeyUp);
    document.addEventListener('visibilitychange', this.onVisibilityChange);
    window.addEventListener('pagehide', this.onPageHide);
    window.addEventListener('beforeunload', this.onPageHide);
    canvas.addEventListener('touchstart', this.onTouchStart, { passive: false });
    canvas.addEventListener('touchend', this.onTouchEnd);
    canvas.addEventListener('touchcancel', this.onTouchEnd);
    canvas.addEventListener('mousedown', this.onMouseDown);
    canvas.addEventListener('mouseup', this.onMouseUp);
    canvas.addEventListener('mouseleave', this.onMouseUp);
  }

  destroy() {
    this.stop();
    window.removeEventListener('resize', this.resize);
    window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('keyup', this.onKeyUp);
    document.removeEventListener('visibilitychange', this.onVisibilityChange);
    window.removeEventListener('pagehide', this.onPageHide);
    window.removeEventListener('beforeunload', this.onPageHide);
    this.canvas.removeEventListener('touchstart', this.onTouchStart);
    this.canvas.removeEventListener('touchend', this.onTouchEnd);
    this.canvas.removeEventListener('touchcancel', this.onTouchEnd);
    this.canvas.removeEventListener('mousedown', this.onMouseDown);
    this.canvas.removeEventListener('mouseup', this.onMouseUp);
    this.canvas.removeEventListener('mouseleave', this.onMouseUp);
  }

  private onVisibilityChange = () => {
    if (document.hidden) {
      if (this.state === 'playing') {
        this.pause();
      }
      this.saveActiveRun();
      this.saveProgress();
    }
  };

  private onPageHide = () => {
    if (this.state === 'playing' || this.state === 'paused') {
      this.saveActiveRun();
      this.saveProgress();
    }
  };

  setAudio(a: AudioManager | null) {
    this.audio = a;
  }

  // ---- Input ----
  private onKeyDown = (e: KeyboardEvent) => {
    if (e.repeat) return;
    if (e.code === 'Space' || e.code === 'KeyJ') {
      e.preventDefault();
      if (this.state === 'playing' && !this.shopOpen && !this.isOverlayOpen) this.setSmoking(true);
    } else if (e.code === 'KeyR') {
      if (this.state === 'gameover') this.restart();
    } else if (e.code === 'Enter') {
      if (this.state === 'menu') {
        if (!this.hasActiveRun()) this.start();
      } else if (this.state === 'gameover') {
        this.restart();
      }
    }
  };

  private onKeyUp = (e: KeyboardEvent) => {
    if (e.code === 'Space' || e.code === 'KeyJ') this.setSmoking(false);
  };

  private onTouchStart = (e: TouchEvent) => {
    if (this.state === 'playing' && !this.shopOpen && !this.isOverlayOpen) {
      e.preventDefault();
      this.setSmoking(true);
    }
  };

  private onTouchEnd = () => this.setSmoking(false);

  private onMouseDown = () => {
    if (this.state === 'playing' && !this.shopOpen && !this.isOverlayOpen) this.setSmoking(true);
  };

  private onMouseUp = () => this.setSmoking(false);

  private setSmoking(v: boolean) {
    if (this.shopOpen || this.isOverlayOpen || this.state !== 'playing') v = false;
    if (this.smoking === v) return;
    this.smoking = v;
    if (v) {
      this.drags += 1;
      this.charBreath = 0;
      this.audio?.playSfx('inhale');
      this.audio?.setSmoking(true);
    } else {
      this.audio?.setSmoking(false);
    }
  }

  // ---- Public API ----
  start(mode?: GameMode) {
    if (this.state === 'playing') return;
    if (mode && GAME_MODES[mode]) {
      this.gameMode = mode;
      this.preferredMode = mode;
      this.saveProgress();
    } else {
      this.gameMode = this.preferredMode || 'classic';
    }
    this.clearActiveRun();
    this.resetGame();
    // Dynamic balancing: if the last run ended way below best, ease up quietly
    if (this.lastRunLevel > 0 && this.bestLevel >= 10 && this.lastRunLevel < Math.max(4, this.bestLevel - 8)) {
      this.balanceEase = 0.9;
    } else {
      this.balanceEase = 1;
    }
    this.earnPenalty = 1;
    this.state = 'playing';
    this.showLevelBanner();
    this.saveActiveRun();
    this.onStateChange?.(this.state);
    this.emitStats();
    if (!this.running) this.loopStart();
    this.audio?.playSfx('click');
  }

  continueRun(): boolean {
    if (!this.hasActiveRun()) return false;
    const ok = this.restoreActiveRun();
    if (!ok) return false;
    this.state = 'playing';
    this.lastTime = performance.now();
    this.showLevelBanner();
    this.onStateChange?.(this.state);
    this.emitStats();
    if (!this.running) this.loopStart();
    this.audio?.playSfx('click');
    return true;
  }

  pause() {
    if (this.state !== 'playing') return;
    this.state = 'paused';
    this.setSmoking(false);
    this.saveActiveRun();
    this.onStateChange?.(this.state);
  }

  resume() {
    if (this.state !== 'paused') return;
    this.state = 'playing';
    this.lastTime = performance.now();
    this.onStateChange?.(this.state);
  }

  restart() {
    this.clearActiveRun();
    this.start(this.gameMode);
  }

  toMenu() {
    this.state = 'menu';
    this.smoking = false;
    this.shopOpen = false;
    this.isOverlayOpen = false;
    this.challengeActive = false;
    this.challengeMods = [];
    this.fruitDrop = null;
    this.banner = null;
    this.audio?.setSmoking(false);
    this.clearActiveRun();
    this.emitStats();
    this.onStateChange?.(this.state);
  }

  setGameMode(m: GameMode) {
    if (GAME_MODES[m]) {
      this.preferredMode = m;
      if (this.state === 'menu') {
        this.gameMode = m;
      }
      this.saveProgress();
      this.emitStats();
    }
  }

  getGameMode(): GameMode {
    return this.gameMode;
  }

  getPreferredMode(): GameMode {
    return this.preferredMode;
  }

  setOverlayOpen(v: boolean) {
    this.isOverlayOpen = v;
    if (v) this.setSmoking(false);
  }

  getModeDamageMult(): number {
    return GAME_MODES[this.gameMode]?.damageMult ?? 1.0;
  }

  getModeEarnMult(): number {
    return GAME_MODES[this.gameMode]?.earnMult ?? 1.0;
  }

  getModeFillSpeedMult(): number {
    return GAME_MODES[this.gameMode]?.fillSpeedMult ?? 1.0;
  }

  getPassiveRecoveryRate(): number {
    return 2.5 * (GAME_MODES[this.gameMode]?.recoveryRateMult ?? 1.0);
  }

  setShopOpen(v: boolean) {
    this.shopOpen = v;
    if (v) this.setSmoking(false);
  }

  get charMult() {
    return CHARACTERS[this.selectedChar].mult;
  }

  get toolFill() {
    return TOOLS[this.selectedTool].fill;
  }

  // ---- Difficulty (smooth tiers, no spikes) ----
  private diff(level: number) {
    const l = Math.max(1, level);
    let drain = 9;
    let jarFillReq = 1;
    let costMult = 1;
    if (l <= 10) {
      // L1: 8.5 → L10: 13 — still needs care, but one jar is recoverable
      drain = 8.5 + (l - 1) * 0.5;
      jarFillReq = 1 + (l - 1) * 0.022;
      costMult = 1 + (l - 1) * 0.018;
    } else if (l <= 25) {
      // L10: 13 → L25: 22
      drain = 13 + (l - 10) * 0.6;
      jarFillReq = 1.2 + (l - 10) * 0.03;
      costMult = 1.162 + (l - 10) * 0.045;
    } else if (l <= 50) {
      // L25: 22 → L50: 36
      drain = 22 + (l - 25) * 0.56;
      jarFillReq = 1.65 + (l - 25) * 0.026;
      costMult = 1.837 + (l - 25) * 0.04;
    } else if (l <= 100) {
      // L50: 36 → L100: 52
      drain = 36 + (l - 50) * 0.32;
      jarFillReq = 2.3 + (l - 50) * 0.013;
      costMult = 2.837 + (l - 50) * 0.022;
    } else {
      drain = 52 + (l - 100) * 0.18;
      jarFillReq = 2.95 + (l - 100) * 0.008;
      costMult = 3.937 + (l - 100) * 0.012;
    }
    // Slow jar-value growth — income comes from tools/characters
    const valueMult = 1 + (l - 1) * 0.04;
    return { drain, jarFillReq, costMult, valueMult };
  }

  costMult() {
    return this.diff(this.level).costMult;
  }

  private levelQuota() {
    return 2 + this.level;
  }

  private effFillReq() {
    let r = this.diff(this.level).jarFillReq * this.theme.fillVar;
    if (this.hasMod('huge')) r *= 2;
    return r;
  }

  private hasMod(id: string) {
    return this.challengeMods.includes(id);
  }

  // ---- Achievements ----
  private unlockAchievement(id: string) {
    if (this.achievements.includes(id)) return;
    this.achievements.push(id);
    const def = ACHIEVEMENTS.find((a) => a.id === id);
    if (def) {
      const stars = def.stars ?? 0;
      const blasters = def.blasters ?? 0;
      if (stars > 0) {
        this.goldenStars += stars;
        this.lifetimeStars += stars;
      }
      if (blasters > 0) this.smokeBlasters += blasters;
      this.onToast?.(def);
      this.audio?.playSfx('unlock');
      if (stars > 0 || blasters > 0) {
        const bits: string[] = [];
        if (stars > 0) bits.push('+' + stars + '⭐');
        if (blasters > 0) bits.push('+' + blasters + '💥');
        this.addFloater(this.width / 2, this.height * 0.38, bits.join('  '), '#ffd700', 26);
      }
    }
    this.saveProgress();
    this.emitStats();
  }

  private checkAchievements() {
    const has = (id: string) => this.achievements.includes(id);
    const combo = this.bestComboEver;
    const bank = this.bank;
    const chars = this.unlockedChars.filter(Boolean).length;
    const tools = this.unlockedTools.filter(Boolean).length;
    if (!has('first') && this.lifetimeJars >= 1) this.unlockAchievement('first');
    if (!has('jars10') && this.lifetimeJars >= 10) this.unlockAchievement('jars10');
    if (!has('jars50') && this.lifetimeJars >= 50) this.unlockAchievement('jars50');
    if (!has('jars100') && this.lifetimeJars >= 100) this.unlockAchievement('jars100');
    if (!has('jars200') && this.lifetimeJars >= 200) this.unlockAchievement('jars200');
    if (!has('jars500') && this.lifetimeJars >= 500) this.unlockAchievement('jars500');
    if (!has('combo5') && combo >= 5) this.unlockAchievement('combo5');
    if (!has('combo10') && combo >= 10) this.unlockAchievement('combo10');
    if (!has('combo15') && combo >= 15) this.unlockAchievement('combo15');
    if (!has('combo20') && combo >= 20) this.unlockAchievement('combo20');
    if (!has('combo30') && combo >= 30) this.unlockAchievement('combo30');
    if (!has('gold5') && this.lifetimeGold >= 5) this.unlockAchievement('gold5');
    if (!has('gold20') && this.lifetimeGold >= 20) this.unlockAchievement('gold20');
    if (!has('gold50') && this.lifetimeGold >= 50) this.unlockAchievement('gold50');
    if (!has('lv10') && this.bestLevel >= 10) this.unlockAchievement('lv10');
    if (!has('lv25') && this.bestLevel >= 25) this.unlockAchievement('lv25');
    if (!has('lv40') && this.bestLevel >= 40) this.unlockAchievement('lv40');
    if (!has('lv50') && this.bestLevel >= 50) this.unlockAchievement('lv50');
    if (!has('lv75') && this.bestLevel >= 75) this.unlockAchievement('lv75');
    if (!has('lv100') && this.bestLevel >= 100) this.unlockAchievement('lv100');
    if (!has('fruit30') && this.lifetimeFruit >= 30) this.unlockAchievement('fruit30');
    if (!has('fruit100') && this.lifetimeFruit >= 100) this.unlockAchievement('fruit100');
    if (!has('energy20') && this.lifetimeDrinks >= 20) this.unlockAchievement('energy20');
    if (!has('energy50') && this.lifetimeDrinks >= 50) this.unlockAchievement('energy50');
    if (!has('challenge3') && this.lifetimeChallenges >= 3) this.unlockAchievement('challenge3');
    if (!has('challenge10') && this.lifetimeChallenges >= 10) this.unlockAchievement('challenge10');
    if (!has('challenge25') && this.lifetimeChallenges >= 25) this.unlockAchievement('challenge25');
    if (!has('milestone') && this.lifetimeMilestones >= 1) this.unlockAchievement('milestone');
    if (!has('milestones5') && this.lifetimeMilestones >= 5) this.unlockAchievement('milestones5');
    if (!has('rich') && bank >= 1000) this.unlockAchievement('rich');
    if (!has('rich2') && bank >= 10000) this.unlockAchievement('rich2');
    if (!has('rich3') && bank >= 50000) this.unlockAchievement('rich3');
    if (!has('chars5') && chars >= 5) this.unlockAchievement('chars5');
    if (!has('chars10') && chars >= 10) this.unlockAchievement('chars10');
    if (!has('toolsAll') && tools >= TOOLS.length) this.unlockAchievement('toolsAll');
    if (!has('perfect10') && this.perfectChain >= 10) this.unlockAchievement('perfect10');
    if (!has('perfect20') && this.perfectChain >= 20) this.unlockAchievement('perfect20');
    if (!has('closeCall') && this.survivedLowHealth) this.unlockAchievement('closeCall');
    if (!has('blaster1') && this.lifetimeBlastersUsed >= 1) this.unlockAchievement('blaster1');
    if (!has('blaster10') && this.lifetimeBlastersUsed >= 10) this.unlockAchievement('blaster10');
    if (!has('stars10') && this.lifetimeStars >= 10) this.unlockAchievement('stars10');
    if (!has('stars50') && this.lifetimeStars >= 50) this.unlockAchievement('stars50');
  }

  // ---- Shop actions ----
  private shopPrice(base: number) {
    const d = this.discountActive ? 0.8 : 1;
    return Math.max(1, Math.round(base * this.costMult() * d));
  }

  private celebrate(label: string, sub: string, color: string) {
    this.banner = { title: label, sub, color, life: 0, maxLife: 2.4 };
    this.flash = 0.5;
    this.shakeIntensity = 16;
    const colors = ['#ffd93d', '#ff6ec7', '#8ecae6', '#95d5b2', '#ff9f1c', '#c77dff'];
    for (let i = 0; i < 46; i++) {
      const a = Math.random() * Math.PI * 2;
      const sp = 140 + Math.random() * 260;
      this.particles.push({
        x: this.width / 2 + (Math.random() - 0.5) * 160,
        y: this.height * 0.3,
        vx: Math.cos(a) * sp,
        vy: Math.sin(a) * sp - 140,
        life: 0,
        maxLife: 1.3 + Math.random() * 0.7,
        size: 6 + Math.random() * 8,
        type: 'star',
        color: colors[i % colors.length],
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 10,
        gravity: 320,
        drag: 0.98,
      });
    }
    this.audio?.playSfx('unlock');
  }

  buyCharacter(i: number): ActionFeedback {
    if (this.state !== 'playing' && this.state !== 'paused' && this.state !== 'menu') {
      const fb: ActionFeedback = { success: false, reason: 'INVALID_STATE', message: 'Cannot buy character now' };
      this.onFeedback?.(fb);
      return fb;
    }
    const c = CHARACTERS[i];
    if (!c) {
      const fb: ActionFeedback = { success: false, reason: 'INVALID_STATE', message: 'Unknown character' };
      this.onFeedback?.(fb);
      return fb;
    }
    if (this.unlockedChars[i]) {
      const fb: ActionFeedback = { success: false, reason: 'ALREADY_OWNED', message: `${c.name} is already hired` };
      this.onFeedback?.(fb);
      return fb;
    }
    const price = this.shopPrice(c.cost);
    if (this.bank < price) {
      const fb: ActionFeedback = { success: false, reason: 'INSUFFICIENT_FUNDS', message: `Need $${price.toLocaleString()} to hire ${c.name}` };
      this.addFloater(this.width / 2, this.height * 0.3, 'Need $' + price.toLocaleString(), '#ff6b6b', 24);
      this.onFeedback?.(fb);
      return fb;
    }
    this.bank -= price;
    this.unlockedChars[i] = true;
    this.selectedChar = i;
    this.saveProgress();
    if (this.state === 'playing' || this.state === 'paused') {
      this.saveActiveRun();
    }
    this.celebrate(`${c.name} HIRED!`, `x${c.mult.toFixed(1)} PAY MULTIPLIER`, '#ffd93d');
    this.checkAchievements();
    this.emitStats();

    const fb: ActionFeedback = { success: true, message: `Successfully hired ${c.name}!` };
    this.onFeedback?.(fb);
    return fb;
  }

  selectCharacter(i: number): ActionFeedback {
    const c = CHARACTERS[i];
    if (!c || !this.unlockedChars[i]) {
      const fb: ActionFeedback = { success: false, reason: 'LOCKED', message: `${c?.name || 'Character'} is locked. Hire in Shop!` };
      this.onFeedback?.(fb);
      return fb;
    }
    if (i === this.selectedChar) {
      const fb: ActionFeedback = { success: true, message: `Already playing as ${c.name}` };
      this.onFeedback?.(fb);
      return fb;
    }

    this.selectedChar = i;
    this.saveProgress();
    if (this.state === 'playing' || this.state === 'paused') {
      this.saveActiveRun();
    }
    this.addFloater(this.charX, this.charY - 90, c.name, '#ffd93d', 24);
    this.audio?.playSfx('click');
    this.emitStats();

    const fb: ActionFeedback = { success: true, message: `Selected ${c.name}` };
    this.onFeedback?.(fb);
    return fb;
  }

  buyTool(i: number): ActionFeedback {
    const t = TOOLS[i];
    if (!t) {
      const fb: ActionFeedback = { success: false, reason: 'INVALID_STATE', message: 'Unknown tool' };
      this.onFeedback?.(fb);
      return fb;
    }
    if (this.unlockedTools[i]) {
      const fb: ActionFeedback = { success: false, reason: 'ALREADY_OWNED', message: `${t.name} is already acquired` };
      this.onFeedback?.(fb);
      return fb;
    }
    const price = this.shopPrice(t.cost);
    if (this.bank < price) {
      const fb: ActionFeedback = {
        success: false,
        reason: 'INSUFFICIENT_FUNDS',
        message: `Need $${price.toLocaleString()} to acquire ${t.name}`,
      };
      this.addFloater(this.width / 2, this.height * 0.3, 'Need $' + price.toLocaleString(), '#ff6b6b', 24);
      this.onFeedback?.(fb);
      return fb;
    }

    this.bank -= price;
    this.unlockedTools[i] = true;
    this.selectedTool = i;
    this.saveProgress();
    if (this.state === 'playing' || this.state === 'paused') {
      this.saveActiveRun();
    }
    this.celebrate(`${t.name} ACQUIRED!`, `${t.fill.toFixed(1)}x FILL SPEED`, '#8ecae6');
    this.checkAchievements();
    this.emitStats();

    const fb: ActionFeedback = { success: true, message: `Acquired ${t.name}!` };
    this.onFeedback?.(fb);
    return fb;
  }

  selectTool(i: number): ActionFeedback {
    const t = TOOLS[i];
    if (!t || !this.unlockedTools[i]) {
      const fb: ActionFeedback = { success: false, reason: 'LOCKED', message: `${t?.name || 'Tool'} is locked. Buy in Shop!` };
      this.onFeedback?.(fb);
      return fb;
    }
    if (i === this.selectedTool) {
      const fb: ActionFeedback = { success: true, message: `Already using ${t.name}` };
      this.onFeedback?.(fb);
      return fb;
    }

    this.selectedTool = i;
    this.saveProgress();
    if (this.state === 'playing' || this.state === 'paused') {
      this.saveActiveRun();
    }
    this.addFloater(this.charX, this.charY - 90, t.name, '#8ecae6', 24);
    this.audio?.playSfx('click');
    this.emitStats();

    const fb: ActionFeedback = { success: true, message: `Equipped ${t.name}` };
    this.onFeedback?.(fb);
    return fb;
  }

  eatFruit(i: number): ActionFeedback {
    if (this.state !== 'playing' && this.state !== 'paused') {
      const fb: ActionFeedback = { success: false, reason: 'INVALID_STATE', message: 'Fruits can only be eaten during a run' };
      this.onFeedback?.(fb);
      return fb;
    }
    const f = FRUITS[i];
    if (!f) {
      const fb: ActionFeedback = { success: false, reason: 'INVALID_STATE', message: 'Unknown fruit' };
      this.onFeedback?.(fb);
      return fb;
    }
    if (this.lungHealth >= 100) {
      const fb: ActionFeedback = { success: false, reason: 'FULL_HEALTH', message: 'Lung health is already at 100% full!' };
      this.addFloater(this.width / 2, this.height * 0.3, 'Already at 100% HP!', '#8ecae6', 24);
      this.onFeedback?.(fb);
      return fb;
    }
    if (this.bank < f.cost) {
      const fb: ActionFeedback = { success: false, reason: 'INSUFFICIENT_FUNDS', message: `Need $${f.cost} to buy ${f.name}` };
      this.addFloater(this.width / 2, this.height * 0.3, 'Need $' + f.cost, '#ff6b6b', 24);
      this.onFeedback?.(fb);
      return fb;
    }

    this.bank -= f.cost;
    const heal = calculateFruitHeal(f.id, f.heal, this.lungHealth, this.challengeMods);
    this.lungHealth = Math.min(100, this.lungHealth + heal);
    if (f.id === 'avocado') this.lungHealth = AVOCADO_RECOVERY_HP;

    this.fruitBought += 1;
    this.lifetimeFruit += 1;
    this.flash = 0.3;
    this.shakeIntensity = 4;
    this.audio?.playSfx('eat');
    this.saveProgress();
    this.saveActiveRun();

    for (let p = 0; p < 12; p++) {
      const a = Math.random() * Math.PI * 2;
      const sp = 90 + Math.random() * 150;
      this.particles.push({
        x: this.charX,
        y: this.charY - 60,
        vx: Math.cos(a) * sp,
        vy: Math.sin(a) * sp - 70,
        life: 0,
        maxLife: 0.9 + Math.random() * 0.5,
        size: 7 + Math.random() * 8,
        type: 'heart',
        color: '#ff4d6d',
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 6,
        gravity: 220,
        drag: 0.98,
      });
    }
    this.addFloater(this.charX, this.charY - 80, `+${Math.round(heal)} HP`, '#ff4d6d', 26);
    this.checkAchievements();
    this.emitStats();

    const fb: ActionFeedback = { success: true, message: `Ate ${f.name} (+${Math.round(heal)} HP)` };
    this.onFeedback?.(fb);
    return fb;
  }

  drinkEnergy(): ActionFeedback {
    if (this.state !== 'playing' && this.state !== 'paused') {
      const fb: ActionFeedback = { success: false, reason: 'INVALID_STATE', message: 'Energy drinks can only be used in a run' };
      this.onFeedback?.(fb);
      return fb;
    }
    if (this.lungHealth >= 100) {
      const fb: ActionFeedback = { success: false, reason: 'FULL_HEALTH', message: 'Lung health is already at 100% full!' };
      this.addFloater(this.width / 2, this.height * 0.3, 'Already full!', '#8ecae6', 24);
      this.onFeedback?.(fb);
      return fb;
    }
    if (this.drinkStock <= 0) {
      const fb: ActionFeedback = { success: false, reason: 'OUT_OF_STOCK', message: 'No energy cans in stock! Top up in Shop' };
      this.addFloater(this.width / 2, this.height * 0.3, 'No cans! Shop → Drinks', '#ff6b6b', 22);
      this.onFeedback?.(fb);
      return fb;
    }

    this.drinkStock -= 1;
    this.energyDrinksUsed += 1;
    this.lifetimeDrinks += 1;
    const healMult = (this.hasMod('storm') ? 0.5 : 1) * (this.hasMod('weak') ? 0.6 : 1);
    const instantHeal = ENERGY_DRINK.instant * healMult;
    this.lungHealth = Math.min(100, this.lungHealth + instantHeal);
    this.regenBuff = ENERGY_DRINK.regenTime;
    this.flash = 0.3;
    this.shakeIntensity = 4;
    this.audio?.playSfx('drink');
    this.saveProgress();
    this.saveActiveRun();

    for (let p = 0; p < 14; p++) {
      const a = Math.random() * Math.PI * 2;
      const sp = 90 + Math.random() * 150;
      this.particles.push({
        x: this.charX + 10,
        y: this.charY - 60,
        vx: Math.cos(a) * sp,
        vy: Math.sin(a) * sp - 60,
        life: 0,
        maxLife: 0.8 + Math.random() * 0.5,
        size: 4 + Math.random() * 5,
        type: 'star',
        color: '#5adcff',
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 8,
        gravity: 160,
        drag: 0.98,
      });
    }
    this.addFloater(this.charX, this.charY - 90, `+${Math.round(instantHeal)} HP & REGEN!`, '#5adcff', 26);
    this.checkAchievements();
    this.emitStats();

    const fb: ActionFeedback = { success: true, message: `Drank Energy Can (+${Math.round(instantHeal)} HP + Regen)` };
    this.onFeedback?.(fb);
    return fb;
  }

  buyDrinks(n: number): ActionFeedback {
    const cost = this.shopPrice(ENERGY_DRINK.cost * n);
    if (this.bank < cost) {
      const fb: ActionFeedback = { success: false, reason: 'INSUFFICIENT_FUNDS', message: `Need $${cost} to buy ${n} energy can(s)` };
      this.addFloater(this.width / 2, this.height * 0.3, 'Need $' + cost, '#ff6b6b', 24);
      this.onFeedback?.(fb);
      return fb;
    }
    if (this.drinkStock >= ENERGY_DRINK.maxStock) {
      const fb: ActionFeedback = { success: false, reason: 'MAX_STOCK', message: `Energy Drink stock is full (${ENERGY_DRINK.maxStock}/${ENERGY_DRINK.maxStock})` };
      this.addFloater(this.width / 2, this.height * 0.3, 'Stock full!', '#8ecae6', 22);
      this.onFeedback?.(fb);
      return fb;
    }

    this.bank -= cost;
    this.drinkStock = Math.min(ENERGY_DRINK.maxStock, this.drinkStock + n);
    this.audio?.playSfx('click');
    this.saveProgress();
    if (this.state === 'playing' || this.state === 'paused') {
      this.saveActiveRun();
    }
    this.addFloater(this.width / 2, this.height * 0.3, `+${n} Energy Can(s)`, '#5adcff', 24);
    this.emitStats();

    const fb: ActionFeedback = { success: true, message: `Purchased +${n} Energy Can(s)` };
    this.onFeedback?.(fb);
    return fb;
  }

  useBlaster(): ActionFeedback {
    if (this.state !== 'playing' && this.state !== 'paused') {
      const fb: ActionFeedback = { success: false, reason: 'INVALID_STATE', message: 'Smoke Blaster can only be used during a run' };
      this.onFeedback?.(fb);
      return fb;
    }
    if (this.smokeBlasters <= 0) {
      const fb: ActionFeedback = { success: false, reason: 'OUT_OF_STOCK', message: 'No Smoke Blasters left! Earn from achievements' };
      this.addFloater(this.width / 2, this.height * 0.3, 'No Blasters Left!', '#ff6b6b', 24);
      this.onFeedback?.(fb);
      return fb;
    }
    if (this.jar.fill >= 1) {
      const fb: ActionFeedback = { success: false, reason: 'JAR_FULL', message: 'Jar is already 100% full!' };
      this.onFeedback?.(fb);
      return fb;
    }

    this.smokeBlasters -= 1;
    this.lifetimeBlastersUsed += 1;
    this.jar.fill = 1;
    this.flash = 0.6;
    this.shakeIntensity = 28;
    this.audio?.playSfx('blaster');
    this.saveProgress();
    this.saveActiveRun();

    for (let p = 0; p < 45; p++) {
      const a = Math.random() * Math.PI * 2;
      const sp = 160 + Math.random() * 260;
      this.particles.push({
        x: this.jar.x,
        y: this.jar.y,
        vx: Math.cos(a) * sp,
        vy: Math.sin(a) * sp - 50,
        life: 0,
        maxLife: 1.0 + Math.random() * 0.6,
        size: 8 + Math.random() * 12,
        type: 'star',
        color: '#ff9f1c',
        rotation: 0,
        rotSpeed: 6,
        gravity: 240,
        drag: 0.98,
      });
    }

    this.addFloater(this.jar.x, this.jar.y - 80, 'SMOKE BLASTER!', '#ff9f1c', 32);
    this.completeJar();
    this.emitStats();

    const fb: ActionFeedback = { success: true, message: 'Smoke Blaster fired! Jar filled instantly.' };
    this.onFeedback?.(fb);
    return fb;
  }

  convertStars(count: number): ActionFeedback {
    const n = Math.min(this.goldenStars, Math.max(1, count));
    if (n < 1 || this.goldenStars < 1) {
      const fb: ActionFeedback = { success: false, reason: 'OUT_OF_STOCK', message: 'No Golden Stars available to convert' };
      this.onFeedback?.(fb);
      return fb;
    }

    const cash = n * STAR_TO_CASH;
    this.goldenStars -= n;
    this.bank += cash;
    this.audio?.playSfx('coin');
    this.addFloater(this.width / 2, this.height * 0.35, `+${n} Stars → +$${cash.toLocaleString()}`, '#ffd700', 26);
    this.saveProgress();
    if (this.state === 'playing' || this.state === 'paused') {
      this.saveActiveRun();
    }
    this.emitStats();

    const fb: ActionFeedback = { success: true, message: `Converted ${n} star(s) for +$${cash.toLocaleString()} cash!` };
    this.onFeedback?.(fb);
    return fb;
  }

  // ---- Cloud save ----
  exportProgress(): string {
    try {
      const d = {
        v: 2,
        bank: Math.round(this.bank),
        highScore: this.highScore,
        scores: this.scores,
        bestLevel: this.bestLevel,
        chars: this.unlockedChars.map((v, i) => (v ? i : -1)).filter((i) => i >= 0),
        selChar: this.selectedChar,
        tools: this.unlockedTools.map((v, i) => (v ? i : -1)).filter((i) => i >= 0),
        selTool: this.selectedTool,
        drinks: this.drinkStock,
        ach: this.achievements,
        lj: this.lifetimeJars,
        lf: this.lifetimeFruit,
        ld: this.lifetimeDrinks,
        lg: this.lifetimeGold,
        lc: this.lifetimeChallenges,
        lm: this.lifetimeMilestones,
        lr: this.lastRunLevel,
        bc: this.bestComboEver,
        gs: this.goldenStars,
        sb: this.smokeBlasters,
        ls: this.lifetimeStars,
        lbu: this.lifetimeBlastersUsed,
      };
      return btoa(JSON.stringify(d));
    } catch {
      return '';
    }
  }

  importProgress(code: string): boolean {
    try {
      const d = JSON.parse(atob(code.trim())) as Record<string, unknown>;
      if (!d || typeof d !== 'object') return false;
      const num = (k: string, def: number) => (typeof d[k] === 'number' ? (d[k] as number) : def);
      const arr = (k: string): number[] => (Array.isArray(d[k]) ? (d[k] as number[]).map(Number).filter((n) => !isNaN(n)) : []);
      this.bank = num('bank', 0);
      this.highScore = num('highScore', 0);
      this.scores = arr('scores');
      this.bestLevel = num('bestLevel', 0);
      this.drinkStock = num('drinks', 0);
      this.lifetimeJars = num('lj', 0);
      this.lifetimeFruit = num('lf', 0);
      this.lifetimeDrinks = num('ld', 0);
      this.lifetimeGold = num('lg', 0);
      this.lifetimeChallenges = num('lc', 0);
      this.lifetimeMilestones = num('lm', 0);
      this.lastRunLevel = num('lr', 0);
      this.bestComboEver = Math.max(1, num('bc', 1));
      this.goldenStars = num('gs', 0);
      this.smokeBlasters = num('sb', 0);
      this.lifetimeStars = num('ls', 0);
      this.lifetimeBlastersUsed = num('lbu', 0);
      this.achievements = Array.isArray(d.ach) ? (d.ach as string[]).filter((s) => typeof s === 'string') : [];
      const chars = arr('chars');
      this.unlockedChars = CHARACTERS.map((_, i) => (chars.length ? chars.includes(i) : i === 0));
      const tools = arr('tools');
      this.unlockedTools = TOOLS.map((_, i) => (tools.length ? tools.includes(i) : i === 0));
      this.selectedChar = Math.min(num('selChar', 0), CHARACTERS.length - 1);
      this.selectedTool = Math.min(num('selTool', 0), TOOLS.length - 1);
      if (!this.unlockedChars[this.selectedChar]) this.unlockedChars[this.selectedChar] = true;
      if (!this.unlockedTools[this.selectedTool]) this.unlockedTools[this.selectedTool] = true;
      this.saveProgress();
      this.flash = 0.4;
      this.emitStats();
      return true;
    } catch {
      return false;
    }
  }

  getState() {
    return this.state;
  }

  getStats(): GameStats {
    const effects: string[] = [];
    if (this.nextJarX2) effects.push('2X');
    if (this.boostTimer > 0) effects.push('BOOST');
    if (this.wetTimer > 0) effects.push('WET');
    if (this.gustTimer > 0) effects.push('WIND');
    if (this.discountActive) effects.push('-20%');

    const activeInfo = this.getActiveRunInfo();

    return {
      lungHealth: this.lungHealth,
      money: this.bank,
      score: this.score,
      combo: this.combo,
      bestCombo: this.bestCombo,
      drags: this.drags,
      containersFilled: this.containersFilled,
      fruitBought: this.fruitBought,
      highScore: this.highScore,
      selectedChar: this.selectedChar,
      selectedTool: this.selectedTool,
      unlockedChars: [...this.unlockedChars],
      unlockedTools: [...this.unlockedTools],
      level: this.level,
      jarsThisLevel: this.jarsThisLevel,
      levelQuota: this.levelQuota(),
      bestLevel: this.bestLevel,
      goldenFilled: this.goldenFilled,
      fruitDrops: this.fruitDrops,
      scores: [...this.scores],
      drinkStock: this.drinkStock,
      regenBuff: this.regenBuff,
      energyDrinksUsed: this.energyDrinksUsed,
      costMult: this.costMult(),
      inChallenge: this.challengeActive,
      challengeMods: [...this.challengeMods],
      perfectChain: this.perfectChain,
      achievements: [...this.achievements],
      activeEffects: effects,
      nextJarX2: this.nextJarX2,
      goldenStars: this.goldenStars,
      smokeBlasters: this.smokeBlasters,
      lifetimeStars: this.lifetimeStars,
      lifetimeBlastersUsed: this.lifetimeBlastersUsed,
      gameMode: this.gameMode,
      isPassiveRecovering: this.isPassiveRecovering,
      hasActiveRun: this.hasActiveRun(),
      activeRunLevel: activeInfo?.level,
      activeRunScore: activeInfo?.score,
      activeRunMode: activeInfo?.mode,
    };
  }

  saveAndToMenu() {
    this.saveActiveRun();
    this.state = 'menu';
    this.smoking = false;
    this.shopOpen = false;
    this.isOverlayOpen = false;
    this.audio?.setSmoking(false);
    this.emitStats();
    this.onStateChange?.(this.state);
  }

  endRun() {
    if (this.score > 0) {
      this.scores.push(this.score);
      this.scores.sort((a, b) => b - a);
      this.scores = this.scores.slice(0, 5);
      if (this.score > this.highScore) this.highScore = this.score;
    }
    this.clearActiveRun();
    this.saveProgress();
    this.state = 'menu';
    this.smoking = false;
    this.shopOpen = false;
    this.isOverlayOpen = false;
    this.challengeActive = false;
    this.challengeMods = [];
    this.fruitDrop = null;
    this.banner = null;
    this.audio?.setSmoking(false);
    this.emitStats();
    this.onStateChange?.(this.state);
  }

  // ---- Active Run Persistence (Cached & Schema Versioned) ----
  private loadActiveRunFromStorage(): ActiveRunSave | null {
    try {
      const raw = localStorage.getItem(ACTIVE_RUN_KEY) || localStorage.getItem('smokeItUp.activeRun.v1');
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== 'object') return null;
      return this.migrateActiveRunData(parsed);
    } catch {
      return null;
    }
  }

  private migrateActiveRunData(raw: any): ActiveRunSave | null {
    if (!raw || typeof raw !== 'object') return null;
    if (typeof raw.level !== 'number' || typeof raw.lungHealth !== 'number') return null;
    const level = Math.max(1, Math.min(9999, !isNaN(raw.level) ? raw.level : 1));
    const lungHealth = Math.max(0, Math.min(100, !isNaN(raw.lungHealth) ? raw.lungHealth : 0));
    if (lungHealth <= 0) return null;

    const gameMode: GameMode = raw.gameMode && GAME_MODES[raw.gameMode as GameMode] ? (raw.gameMode as GameMode) : 'classic';
    const jarsThisLevel = Math.max(0, typeof raw.jarsThisLevel === 'number' && !isNaN(raw.jarsThisLevel) ? raw.jarsThisLevel : 0);

    let jar: { fill: number; value: number; golden: boolean; hue: number; w: number; h: number };
    if (raw.jar && typeof raw.jar === 'object') {
      jar = {
        fill: Math.max(0, Math.min(0.99, typeof raw.jar.fill === 'number' && !isNaN(raw.jar.fill) ? raw.jar.fill : 0)),
        value: Math.max(1, typeof raw.jar.value === 'number' && !isNaN(raw.jar.value) ? raw.jar.value : 14),
        golden: Boolean(raw.jar.golden),
        hue: typeof raw.jar.hue === 'number' && !isNaN(raw.jar.hue) ? raw.jar.hue : 200,
        w: typeof raw.jar.w === 'number' && !isNaN(raw.jar.w) ? raw.jar.w : 110,
        h: typeof raw.jar.h === 'number' && !isNaN(raw.jar.h) ? raw.jar.h : 140,
      };
    } else {
      jar = {
        fill: Math.max(0, Math.min(0.99, typeof raw.jarFill === 'number' && !isNaN(raw.jarFill) ? raw.jarFill : 0)),
        value: Math.max(1, typeof raw.jarValue === 'number' && !isNaN(raw.jarValue) ? raw.jarValue : 14),
        golden: Boolean(raw.jarGolden),
        hue: typeof raw.jarHue === 'number' && !isNaN(raw.jarHue) ? raw.jarHue : 200,
        w: 110,
        h: 140,
      };
    }

    const theme: LevelTheme =
      raw.theme && typeof raw.theme === 'object' && typeof raw.theme.skyTop === 'string'
        ? raw.theme
        : THEMES[0];

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
      selectedChar: Math.max(0, Math.min(CHARACTERS.length - 1, typeof raw.selectedChar === 'number' ? raw.selectedChar : 0)),
      selectedTool: Math.max(0, Math.min(TOOLS.length - 1, typeof raw.selectedTool === 'number' ? raw.selectedTool : 0)),
      inChallenge: Boolean(raw.inChallenge),
      challengeMods: Array.isArray(raw.challengeMods) ? (raw.challengeMods.filter((id: unknown) => typeof id === 'string') as string[]) : [],
      theme,
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

  hasActiveRun(): boolean {
    return Boolean(this.cachedActiveRun && this.cachedActiveRun.level >= 1 && this.cachedActiveRun.lungHealth > 0);
  }

  getActiveRunInfo(): { level: number; score: number; mode: GameMode; charIndex: number } | null {
    if (!this.cachedActiveRun || this.cachedActiveRun.lungHealth <= 0) return null;
    return {
      level: this.cachedActiveRun.level,
      score: this.cachedActiveRun.score,
      mode: this.cachedActiveRun.gameMode,
      charIndex: this.cachedActiveRun.selectedChar,
    };
  }

  saveActiveRun() {
    if (this.state !== 'playing' && this.state !== 'paused') return;
    if (this.lungHealth <= 0) {
      this.clearActiveRun();
      return;
    }

    try {
      const data: ActiveRunSave = {
        version: 2,
        gameMode: this.gameMode,
        level: this.level,
        jarsThisLevel: this.jarsThisLevel,
        jar: {
          fill: this.jar ? this.jar.fill : 0,
          value: this.jar ? this.jar.value : 14,
          golden: this.jar ? this.jar.golden : false,
          hue: this.jar ? this.jar.hue : 200,
          w: this.jar ? this.jar.w : 110,
          h: this.jar ? this.jar.h : 140,
        },
        lungHealth: this.lungHealth,
        score: this.score,
        earnedThisRun: this.earnedThisRun,
        combo: this.combo,
        bestCombo: this.bestCombo,
        perfectChain: this.perfectChain,
        chainTime: this.chainTime,
        selectedChar: this.selectedChar,
        selectedTool: this.selectedTool,
        inChallenge: this.challengeActive,
        challengeMods: [...this.challengeMods],
        theme: { ...this.theme },
        boostTimer: this.boostTimer,
        wetTimer: this.wetTimer,
        gustTimer: this.gustTimer,
        regenBuff: this.regenBuff,
        idleHealTimer: this.idleHealTimer,
        isPassiveRecovering: this.isPassiveRecovering,
        earnPenalty: this.earnPenalty,
        drags: this.drags,
        containersFilled: this.containersFilled,
        goldenFilled: this.goldenFilled,
        fruitBought: this.fruitBought,
        energyDrinksUsed: this.energyDrinksUsed,
        timestamp: Date.now(),
      };

      this.cachedActiveRun = data;
      localStorage.setItem(ACTIVE_RUN_KEY, JSON.stringify(data));
    } catch {
      // ignore storage quota errors
    }
  }

  clearActiveRun() {
    this.cachedActiveRun = null;
    try {
      localStorage.removeItem(ACTIVE_RUN_KEY);
      localStorage.removeItem('smokeItUp.activeRun.v1');
    } catch {
      // ignore
    }
  }

  restoreActiveRun(): boolean {
    if (!this.cachedActiveRun) {
      this.cachedActiveRun = this.loadActiveRunFromStorage();
    }
    const data = this.cachedActiveRun;
    if (!data || data.lungHealth <= 0) return false;

    try {
      this.gameMode = data.gameMode && GAME_MODES[data.gameMode] ? data.gameMode : 'classic';
      this.level = Math.max(1, data.level);
      this.jarsThisLevel = Math.max(0, data.jarsThisLevel);
      this.lungHealth = Math.max(1, Math.min(100, data.lungHealth));
      this.score = Math.max(0, data.score);
      this.earnedThisRun = Math.max(0, data.earnedThisRun);
      this.combo = Math.max(1, data.combo);
      this.bestCombo = Math.max(1, data.bestCombo);
      this.perfectChain = Math.max(0, data.perfectChain);
      this.chainTime = Math.max(0, data.chainTime);
      if (typeof data.selectedChar === 'number' && this.unlockedChars[data.selectedChar]) {
        this.selectedChar = data.selectedChar;
      }
      if (typeof data.selectedTool === 'number' && this.unlockedTools[data.selectedTool]) {
        this.selectedTool = data.selectedTool;
      }
      this.challengeActive = Boolean(data.inChallenge);
      this.challengeMods = Array.isArray(data.challengeMods) ? data.challengeMods : [];
      if (data.theme && typeof data.theme === 'object') {
        this.theme = { ...data.theme };
      }
      this.boostTimer = Math.max(0, data.boostTimer);
      this.wetTimer = Math.max(0, data.wetTimer);
      this.gustTimer = Math.max(0, data.gustTimer);
      this.regenBuff = Math.max(0, data.regenBuff);
      this.idleHealTimer = Math.max(0, data.idleHealTimer);
      this.isPassiveRecovering = Boolean(data.isPassiveRecovering);
      this.earnPenalty = Math.max(0.1, Math.min(1.0, data.earnPenalty));
      this.drags = Math.max(0, data.drags);
      this.containersFilled = Math.max(0, data.containersFilled);
      this.goldenFilled = Math.max(0, data.goldenFilled);
      this.fruitBought = Math.max(0, data.fruitBought);
      this.energyDrinksUsed = Math.max(0, data.energyDrinksUsed);

      this.jar = this.spawnJar();
      if (data.jar) {
        this.jar.fill = Math.max(0, Math.min(0.99, data.jar.fill));
        this.jar.value = Math.max(1, data.jar.value);
        this.jar.golden = Boolean(data.jar.golden);
        this.jar.hue = data.jar.hue;
        this.jar.w = data.jar.w || 110;
        this.jar.h = data.jar.h || 140;
      }
      this.jar.x = this.width * (this.width < 500 ? 0.76 : 0.72);
      this.jar.y = this.height * (this.width < 500 ? 0.53 : 0.62);

      this.smoking = false;
      this.shopOpen = false;
      this.lastTime = performance.now();
      return true;
    } catch {
      return false;
    }
  }

  private resetGame() {
    this.lungHealth = 100;
    this.score = 0;
    this.combo = 1;
    this.comboTimer = 0;
    this.bestCombo = 1;
    this.drags = 0;
    this.containersFilled = 0;
    this.fruitBought = 0;
    this.level = 1;
    this.jarsThisLevel = 0;
    this.goldenFilled = 0;
    this.fruitDrops = 0;
    this.energyDrinksUsed = 0;
    this.regenBuff = 0;
    this.challengeActive = false;
    this.challengeMods = [];
    this.perfectChain = 0;
    this.earnedThisRun = 0;
    this.hbTimer = 0;
    this.survivedLowHealth = false;
    this.idleHealTimer = 0;
    this.isPassiveRecovering = false;
    this.nextJarX2 = false;
    this.boostTimer = 0;
    this.wetTimer = 0;
    this.gustTimer = 0;
    this.discountActive = false;
    this.smoking = false;
    this.shopOpen = false;
    this.particles = [];
    this.floaters = [];
    this.shakeIntensity = 0;
    this.flash = 0;
    this.coughTime = 0;
    this.chainTime = 0;
    this.smokeEmitTimer = 0;
    this.fruitDrop = null;
    this.banner = null;
    this.theme = THEMES[Math.floor(Math.random() * THEMES.length)];
    this.jar = this.spawnJar();
    this.jar.x = this.width * (this.width < 500 ? 0.76 : 0.72);
    this.jar.y = this.height * (this.width < 500 ? 0.53 : 0.62);
    this.lastTime = performance.now();
  }

  private loadProgress(): Progress & { fresh: boolean } {
    const def: Progress & { fresh: boolean } = {
      highScore: 0, bank: 0, bestLevel: 0, scores: [], drinkStock: 0,
      unlockedChars: [0], selectedChar: 0, unlockedTools: [0], selectedTool: 0,
      achievements: [], lifetimeJars: 0, lifetimeFruit: 0, lifetimeDrinks: 0,
      lifetimeGold: 0, lifetimeChallenges: 0, lifetimeMilestones: 0,
      lastRunLevel: 0, bestComboEver: 1,
      goldenStars: 0, smokeBlasters: 0, lifetimeStars: 0, lifetimeBlastersUsed: 0,
      preferredMode: 'classic',
      fresh: true,
    };
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (!raw) return def;
      const p = JSON.parse(raw) as Partial<Progress>;
      return {
        highScore: typeof p.highScore === 'number' ? p.highScore : 0,
        bank: typeof p.bank === 'number' ? p.bank : 0,
        bestLevel: typeof p.bestLevel === 'number' ? p.bestLevel : 0,
        scores: Array.isArray(p.scores) ? p.scores.map((n) => Number(n)).filter((n) => !isNaN(n)) : [],
        drinkStock: typeof p.drinkStock === 'number' ? p.drinkStock : 0,
        unlockedChars: Array.isArray(p.unlockedChars) ? p.unlockedChars : [0],
        selectedChar: typeof p.selectedChar === 'number' ? p.selectedChar : 0,
        unlockedTools: Array.isArray(p.unlockedTools) ? p.unlockedTools : [0],
        selectedTool: typeof p.selectedTool === 'number' ? p.selectedTool : 0,
        achievements: Array.isArray(p.achievements) ? p.achievements : [],
        lifetimeJars: typeof p.lifetimeJars === 'number' ? p.lifetimeJars : 0,
        lifetimeFruit: typeof p.lifetimeFruit === 'number' ? p.lifetimeFruit : 0,
        lifetimeDrinks: typeof p.lifetimeDrinks === 'number' ? p.lifetimeDrinks : 0,
        lifetimeGold: typeof p.lifetimeGold === 'number' ? p.lifetimeGold : 0,
        lifetimeChallenges: typeof p.lifetimeChallenges === 'number' ? p.lifetimeChallenges : 0,
        lifetimeMilestones: typeof p.lifetimeMilestones === 'number' ? p.lifetimeMilestones : 0,
        lastRunLevel: typeof p.lastRunLevel === 'number' ? p.lastRunLevel : 0,
        bestComboEver: typeof p.bestComboEver === 'number' ? p.bestComboEver : 1,
        goldenStars: typeof p.goldenStars === 'number' ? p.goldenStars : 0,
        smokeBlasters: typeof p.smokeBlasters === 'number' ? p.smokeBlasters : 0,
        lifetimeStars: typeof p.lifetimeStars === 'number' ? p.lifetimeStars : 0,
        lifetimeBlastersUsed: typeof p.lifetimeBlastersUsed === 'number' ? p.lifetimeBlastersUsed : 0,
        preferredMode: p.preferredMode && GAME_MODES[p.preferredMode] ? p.preferredMode : 'classic',
        fresh: false,
      };
    } catch {
      return def;
    }
  }

  private saveProgress() {
    try {
      const p: Progress = {
        highScore: this.highScore,
        bank: Math.round(this.bank),
        bestLevel: this.bestLevel,
        scores: this.scores,
        drinkStock: this.drinkStock,
        unlockedChars: this.unlockedChars.map((v, i) => (v ? i : -1)).filter((i) => i >= 0),
        selectedChar: this.selectedChar,
        unlockedTools: this.unlockedTools.map((v, i) => (v ? i : -1)).filter((i) => i >= 0),
        selectedTool: this.selectedTool,
        achievements: this.achievements,
        lifetimeJars: this.lifetimeJars,
        lifetimeFruit: this.lifetimeFruit,
        lifetimeDrinks: this.lifetimeDrinks,
        lifetimeGold: this.lifetimeGold,
        lifetimeChallenges: this.lifetimeChallenges,
        lifetimeMilestones: this.lifetimeMilestones,
        lastRunLevel: this.lastRunLevel,
        bestComboEver: this.bestComboEver,
        goldenStars: this.goldenStars,
        smokeBlasters: this.smokeBlasters,
        lifetimeStars: this.lifetimeStars,
        lifetimeBlastersUsed: this.lifetimeBlastersUsed,
        preferredMode: this.preferredMode,
      };
      localStorage.setItem(LS_KEY, JSON.stringify(p));
    } catch {
      // ignore
    }
  }

  private resize = () => {
    const rect = this.canvas.getBoundingClientRect();
    this.width = rect.width;
    this.height = rect.height;
    this.canvas.width = Math.floor(rect.width * this.dpr);
    this.canvas.height = Math.floor(rect.height * this.dpr);
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    this.charX = this.width * (this.width < 500 ? 0.22 : 0.18);
    this.charY = this.height * (this.width < 500 ? 0.53 : 0.62);
    this.jar.x = this.width * (this.width < 500 ? 0.76 : 0.72);
    this.jar.y = this.height * (this.width < 500 ? 0.53 : 0.62);
  };

  private barY() {
    return this.height * 0.82;
  }

  private toolBase() {
    return { x: Math.max(52, this.charX - 100), y: this.barY() };
  }

  private spawnJar(): Jar {
    const golden = Math.random() < 0.07;
    const v = this.diff(this.level).valueMult;
    const x2 = this.nextJarX2;
    this.nextJarX2 = false;
    return {
      x: 0, y: 0, w: 110, h: 140, fill: 0,
      value: Math.round((14 + Math.floor(Math.random() * 3)) * v * (golden ? 4.5 : 1) * (x2 ? 2 : 1)),
      golden,
      shake: 0, enter: 0, pop: 0, hue: x2 ? 275 : golden ? 45 : 190 + Math.random() * 80,
    };
  }

  private emitStats() {
    this.onStatsChange?.(this.getStats());
  }

  private addFloater(x: number, y: number, text: string, color: string, size = 22) {
    this.floaters.push({ x, y, text, color, life: 0, maxLife: 1.4, vy: -60, scale: 1.4, size });
  }

  // ---- Loop ----
  private loopStart() {
    this.running = true;
    this.lastTime = performance.now();
    const step = (t: number) => {
      if (!this.running) return;
      const dt = Math.min(0.05, (t - this.lastTime) / 1000);
      this.lastTime = t;
      this.totalTime += dt;
      if (this.state === 'playing') this.update(dt, this.shopOpen);
      else if (this.state === 'menu') this.update(dt, true);
      this.render(dt);
      if (Math.floor(this.totalTime * 8) !== Math.floor((this.totalTime - dt) * 8)) {
        this.emitStats();
      }
      this.rafId = requestAnimationFrame(step);
    };
    this.rafId = requestAnimationFrame(step);
  }

  stop() {
    this.running = false;
    cancelAnimationFrame(this.rafId);
  }

  private update(dt: number, ambientOnly: boolean) {
    if (ambientOnly) {
      this.isPassiveRecovering = false;
      this.updateParticles(dt);
      this.updateFloaters(dt);
      this.updateEffects(dt);
      this.spawnIdleEmbers();
      this.spawnRain();
      this.spawnFog();
      return;
    }

    // Periodic auto-save active run
    this.autoSaveTimer += dt;
    if (this.autoSaveTimer >= 3.0) {
      this.autoSaveTimer = 0;
      this.saveActiveRun();
    }

    const tool = TOOLS[this.selectedTool];
    const healMult = this.hasMod('storm') || this.hasMod('weak') ? 0.5 : 1;

    // Count down short event timers
    if (this.boostTimer > 0) this.boostTimer = Math.max(0, this.boostTimer - dt);
    if (this.wetTimer > 0) this.wetTimer = Math.max(0, this.wetTimer - dt);
    if (this.gustTimer > 0) this.gustTimer = Math.max(0, this.gustTimer - dt);

    // Energy drink regen
    if (this.regenBuff > 0) {
      this.regenBuff = Math.max(0, this.regenBuff - dt);
      this.lungHealth = Math.min(100, this.lungHealth + ENERGY_DRINK.regenRate * healMult * dt);
      if (Math.random() < 0.2) {
        this.particles.push({
          x: this.charX + (Math.random() - 0.5) * 50,
          y: this.charY - 50 + (Math.random() - 0.5) * 40,
          vx: (Math.random() - 0.5) * 20,
          vy: -30 - Math.random() * 40,
          life: 0, maxLife: 0.6, size: 2.5 + Math.random() * 3,
          type: 'star', color: '#5adcff', rotation: 0, rotSpeed: 3, gravity: -20, drag: 0.99,
        });
      }
    }

    if (this.smoking) {
      this.idleHealTimer = 0;
      this.isPassiveRecovering = false;
      const d = this.diff(this.level);
      // Tool damage with exact -10% global reduction and mode multiplier applied
      let drainRate = (tool.drain * GLOBAL_TOOL_DAMAGE_MULT) * d.drain * this.balanceEase * this.getModeDamageMult();
      if (this.hasMod('flu')) drainRate *= 1.3;
      if (this.hasMod('burn')) drainRate *= 1.5;
      if (this.hasMod('blackout')) drainRate *= 1.15;
      if (this.hasMod('choke')) drainRate *= 1.2;
      this.lungHealth -= drainRate * dt;
      if (this.lungHealth < 10) this.survivedLowHealth = true;
      this.charBreath = Math.min(1, this.charBreath + dt * 2.2);
      this.smokeEmitTimer += dt;
      const interval = tool.interval * (this.hasMod('thin') ? 1.3 : 1);
      while (this.smokeEmitTimer > interval) {
        this.smokeEmitTimer -= interval;
        this.emitSmokePuff(tool);
      }
      let fillSpeed = (0.46 * tool.fill / this.effFillReq()) * this.getModeFillSpeedMult();
      if (this.hasMod('dud')) fillSpeed *= 0.6;
      if (this.hasMod('thin')) fillSpeed *= 0.75;
      if (this.hasMod('choke')) fillSpeed *= 0.75;
      if (this.hasMod('windy')) fillSpeed *= 0.85;
      if (this.boostTimer > 0) fillSpeed *= 1.5;
      if (this.wetTimer > 0) fillSpeed *= 0.65;
      if (this.gustTimer > 0) fillSpeed *= 0.8;
      this.jar.fill = Math.min(1, this.jar.fill + dt * fillSpeed);
      this.jar.shake = Math.min(1, this.jar.shake + dt * 3);
      this.chainTime += dt;

      if (this.jar.fill >= 1 && this.jar.pop <= 0) this.completeJar();

      if (this.lungHealth < 35 || this.hasMod('night') || this.hasMod('flu')) {
        this.coughTime += dt;
        const coughEvery = this.hasMod('flu') || this.hasMod('night') ? 0.7 : 1.3;
        if (this.coughTime > coughEvery) {
          this.coughTime = 0;
          this.shakeIntensity = Math.max(this.shakeIntensity, 5);
          this.audio?.playSfx('cough');
          for (let i = 0; i < 8; i++) {
            this.particles.push({
              x: this.charX + 40, y: this.charY - 30, vx: 80 + Math.random() * 60,
              vy: -40 + Math.random() * 40, life: 0, maxLife: 0.6, size: 6 + Math.random() * 6,
              type: 'puff', color: '#8b5a3c', rotation: 0, rotSpeed: 0, gravity: 40, drag: 0.98,
            });
          }
        }
      }

      if (Math.random() < 0.6) {
        this.particles.push({
          x: this.charX + 60 + Math.random() * 6, y: this.charY - 24 + (Math.random() - 0.5) * 4,
          vx: 30 + Math.random() * 40, vy: -40 - Math.random() * 50, life: 0,
          maxLife: 0.5 + Math.random() * 0.5, size: 2 + Math.random() * 2, type: 'ember',
          color: '#ffaa3b', rotation: 0, rotSpeed: 0, gravity: -20, drag: 0.99,
        });
      }
    } else {
      this.charBreath = Math.max(0, this.charBreath - dt * 2);
      this.jar.shake = Math.max(0, this.jar.shake - dt * 4);
      this.comboTimer += dt;
      if (this.comboTimer > 3 && this.combo > 1) {
        this.combo = Math.max(1, this.combo - dt * 1.2);
        if (this.combo < 1.5) this.perfectChain = 0;
      }
      this.coughTime = 0;

      // Automatic lung recovery:
      // Begins after continuously not smoking for 1.0s.
      // Must stop when lung health reaches 80% (never increases above 80%).
      // If health is already 80% or higher, passive recovery does not begin.
      if (this.lungHealth < 80) {
        this.idleHealTimer += dt;
        if (this.idleHealTimer >= 1.0) {
          this.isPassiveRecovering = true;
          this.lungHealth = Math.min(80, this.lungHealth + this.getPassiveRecoveryRate() * dt);
          if (this.lungHealth >= 80) {
            this.isPassiveRecovering = false;
          }
        } else {
          this.isPassiveRecovering = false;
        }
      } else {
        this.isPassiveRecovering = false;
      }
    }

    this.lungHealth = Math.max(0, Math.min(100, this.lungHealth));
    if (this.lungHealth <= 0) {
      this.gameOver();
      return;
    }

    // Heartbeat + heavy breathing at critical health
    if (this.lungHealth < 50) {
      this.hbTimer -= dt;
      if (this.hbTimer <= 0) {
        const t = 0.45 + (this.lungHealth / 50) * 0.95;
        this.hbTimer = t;
        this.audio?.playSfx('heart');
        if (this.lungHealth < 25 && Math.random() < 0.4) this.audio?.playSfx('breath');
      }
    } else {
      this.hbTimer = 0.4;
    }

    // Golden jar sparkles
    if (this.jar.golden && Math.random() < 0.5) {
      this.particles.push({
        x: this.jar.x + (Math.random() - 0.5) * this.jar.w,
        y: this.jar.y + (Math.random() - 0.5) * this.jar.h,
        vx: (Math.random() - 0.5) * 30, vy: -30 - Math.random() * 40, life: 0,
        maxLife: 0.6 + Math.random() * 0.5, size: 3 + Math.random() * 3, type: 'star',
        color: '#ffd93d', rotation: 0, rotSpeed: 2, gravity: -10, drag: 0.99,
      });
    }

    if (this.jar.enter < 1) this.jar.enter = Math.min(1, this.jar.enter + dt * 3);
    if (this.jar.pop > 0) this.jar.pop = Math.max(0, this.jar.pop - dt * 2.5);

    this.updateParticles(dt);
    this.updateFloaters(dt);
    this.updateEffects(dt);
    this.spawnRain();
    this.spawnFog();
  }

  private spawnRain() {
    if (!this.hasMod('storm')) return;
    if (this.particles.length > 340) return;
    for (let i = 0; i < 3; i++) {
      this.particles.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height * 0.9,
        vx: -60 - Math.random() * 60,
        vy: 500 + Math.random() * 300,
        life: 0,
        maxLife: 1.1,
        size: 1.5 + Math.random() * 1.5,
        type: 'rain',
        color: 'rgba(150,180,255,0.5)',
        rotation: 0, rotSpeed: 0, gravity: 0, drag: 1,
      });
    }
  }

  private spawnFog() {
    if (this.theme.weather !== 'fog') return;
    if (this.particles.length > 240) return;
    this.particles.push({
      x: Math.random() * this.width,
      y: this.height * (0.2 + Math.random() * 0.5),
      vx: this.theme.wind * 120 + (Math.random() - 0.5) * 40,
      vy: (Math.random() - 0.5) * 10,
      life: 0,
      maxLife: 5 + Math.random() * 3,
      size: 100 + Math.random() * 140,
      type: 'fog',
      color: 'rgba(200,210,230,0.05)',
      rotation: 0, rotSpeed: 0, gravity: 0, drag: 1,
    });
  }

  private updateEffects(dt: number) {
    this.shakeIntensity *= Math.pow(0.001, dt);
    if (this.shakeIntensity < 0.05) this.shakeIntensity = 0;
    this.shakeX = (Math.random() - 0.5) * this.shakeIntensity;
    this.shakeY = (Math.random() - 0.5) * this.shakeIntensity;
    this.flash = Math.max(0, this.flash - dt * 2);
    if (this.banner) {
      this.banner.life += dt;
      if (this.banner.life >= this.banner.maxLife) this.banner = null;
    }
    if (this.fruitDrop) {
      this.fruitDrop.life += dt;
      if (this.fruitDrop.life >= this.fruitDrop.maxLife) this.fruitDrop = null;
    }
  }

  private spawnIdleEmbers() {
    if (Math.random() < 0.15) {
      this.particles.push({
        x: this.charX + 60 + Math.random() * 4, y: this.charY - 24,
        vx: 20 + Math.random() * 20, vy: -30 - Math.random() * 30, life: 0,
        maxLife: 0.6 + Math.random() * 0.5, size: 1.5 + Math.random() * 1.5, type: 'ember',
        color: '#ff7a2a', rotation: 0, rotSpeed: 0, gravity: -10, drag: 0.99,
      });
    }
  }

  private emitSmokePuff(tool: ToolDef) {
    if (this.particles.length > 460) return;
    const origin = this.smokeOrigin(tool);
    const dx = this.jar.x - origin.x;
    const dy = this.jar.y - origin.y;
    const len = Math.max(1, Math.hypot(dx, dy));
    const baseVx = (dx / len) * 220 + this.theme.wind * 40;
    const baseVy = (dy / len) * 220;
    const count = this.hasMod('thin') ? 1 : tool.count;
    for (let i = 0; i < count; i++) {
      const spread = 0.35;
      const a = (Math.random() - 0.5) * spread;
      const ca = Math.cos(a), sa = Math.sin(a);
      const vx = baseVx * ca - baseVy * sa;
      const vy = baseVx * sa + baseVy * ca;
      const color = tool.palette[Math.floor(Math.random() * tool.palette.length)];
      this.particles.push({
        x: origin.x + (Math.random() - 0.5) * 6,
        y: origin.y + (Math.random() - 0.5) * 6,
        vx: vx * (0.6 + Math.random() * 0.6),
        vy: vy * (0.6 + Math.random() * 0.6) - 20,
        life: 0,
        maxLife: 1.3 + Math.random() * 0.6,
        size: tool.size + Math.random() * 6,
        type: 'smoke',
        color,
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 1.5,
        gravity: -12,
        drag: 0.995,
      });
    }
  }

  private smokeOrigin(tool: ToolDef) {
    if (tool.id === 'hookah' || tool.id === 'bong') {
      const tb = this.toolBase();
      return { x: tb.x, y: tb.y - (tool.id === 'hookah' ? 72 : 62) };
    }
    return { x: this.charX + 55, y: this.charY - 24 };
  }

  private updateParticles(dt: number) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life += dt;
      if (p.life >= p.maxLife) {
        this.particles.splice(i, 1);
        continue;
      }
      p.vx *= p.drag;
      p.vy *= p.drag;
      p.vy += p.gravity * dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.rotation += p.rotSpeed * dt;

      if (p.type === 'smoke') {
        // Wind pushes smoke gently
        const windBoost = this.hasMod('windy') ? 2.4 : 1;
        p.vx += this.theme.wind * 26 * windBoost * dt;
        if (this.gustTimer > 0 || this.hasMod('windy')) p.vx += (this.theme.wind || 0.25) * 90 * dt;
        p.size += dt * 28;
        const dx = this.jar.x - p.x;
        const dy = this.jar.y - p.y;
        const d = Math.hypot(dx, dy);
        if (d > 10) {
          p.vx += (dx / d) * 30 * dt;
          p.vy += (dy / d) * 30 * dt;
        }
        if (
          Math.abs(p.x - this.jar.x) < this.jar.w / 2 + 10 &&
          Math.abs(p.y - this.jar.y) < this.jar.h / 2 + 10 &&
          p.life > 0.25
        ) {
          p.life = Math.max(p.life, p.maxLife - 0.2);
        }
      }
    }
  }

  private updateFloaters(dt: number) {
    for (let i = this.floaters.length - 1; i >= 0; i--) {
      const f = this.floaters[i];
      f.life += dt;
      if (f.life >= f.maxLife) {
        this.floaters.splice(i, 1);
        continue;
      }
      f.y += f.vy * dt;
      f.vy *= 0.94;
      f.scale += (1 - f.scale) * dt * 4;
    }
  }

  // ---- Rewards ----
  private completeJar() {
    const golden = this.jar.golden;
    const x2 = this.jar.hue === 275;
    const toolEarn = TOOLS[this.selectedTool].earn;
    const reward = calculateJarReward({
      baseJarValue: this.jar.value,
      charMult: this.charMult,
      toolEarn,
      combo: this.combo,
      earnPenalty: this.earnPenalty,
      gameMode: this.gameMode,
      challengeMods: this.challengeMods,
    });
    this.bank += reward;
    this.score += reward;
    this.earnedThisRun += reward;
    this.containersFilled += 1;
    this.lifetimeJars += 1;
    if (golden) {
      this.goldenFilled += 1;
      this.lifetimeGold += 1;
    }

    // Combo / perfect chain
    const chained = this.chainTime < 3 && this.containersFilled > 1;
    if (chained) {
      this.combo = Math.min(30, this.combo + 0.2);
      this.perfectChain += 1;
    } else {
      this.combo = 1;
      this.perfectChain = 1;
    }
    if (this.combo > this.bestCombo) this.bestCombo = this.combo;
    if (this.combo > this.bestComboEver) this.bestComboEver = this.combo;
    this.chainTime = 0;

    // Milestone rewards (skill-gated, rare)
    let milestoneBonus = 0;
    let milestoneLabel = '';
    let milestoneColor = '#ffffff';
    for (const m of COMBO_MILESTONES) {
      if (this.perfectChain === m.need) {
        milestoneBonus = m.reward;
        milestoneLabel = m.label;
        milestoneColor = m.color;
        this.perfectChain = 0;
        this.lifetimeMilestones += 1;
        break;
      }
    }
    if (milestoneBonus > 0) {
      this.bank += milestoneBonus;
      this.score += milestoneBonus;
      this.audio?.playSfx('milestone');
      this.addFloater(this.jar.x, this.jar.y - 120, milestoneLabel + ' +$' + milestoneBonus, milestoneColor, 30);
      for (let i = 0; i < 22; i++) {
        const a = Math.random() * Math.PI * 2;
        const sp = 120 + Math.random() * 180;
        this.particles.push({
          x: this.jar.x, y: this.jar.y - 60, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 80,
          life: 0, maxLife: 1.1, size: 5 + Math.random() * 5, type: 'star',
          color: milestoneColor, rotation: 0, rotSpeed: 4, gravity: 200, drag: 0.98,
        });
      }
    }

    this.shakeIntensity = golden ? 22 : 14 + this.combo * 1.5;
    this.flash = 0.35;
    this.jar.pop = 1;
    this.audio?.playSfx('pop');
    this.audio?.playSfx('coin');

    // Burst
    for (let i = 0; i < 26; i++) {
      const a = Math.random() * Math.PI * 2;
      const sp = 140 + Math.random() * 220;
      this.particles.push({
        x: this.jar.x, y: this.jar.y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 40,
        life: 0, maxLife: 0.8 + Math.random() * 0.5, size: 8 + Math.random() * 10,
        type: 'puff', color: '#ffffff', rotation: 0, rotSpeed: 0, gravity: 60, drag: 0.97,
      });
    }
    for (let i = 0; i < 10; i++) {
      const a = Math.random() * Math.PI * 2;
      const sp = 80 + Math.random() * 140;
      this.particles.push({
        x: this.jar.x, y: this.jar.y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 80,
        life: 0, maxLife: 0.8 + Math.random() * 0.4, size: 6 + Math.random() * 4,
        type: 'coin', color: golden ? '#ffd700' : '#ffd93d', rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 8, gravity: 260, drag: 0.98,
      });
    }
    if (golden) {
      for (let i = 0; i < 14; i++) {
        const a = Math.random() * Math.PI * 2;
        const sp = 120 + Math.random() * 200;
        this.particles.push({
          x: this.jar.x, y: this.jar.y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 90,
          life: 0, maxLife: 1.0 + Math.random() * 0.5, size: 5 + Math.random() * 5,
          type: 'star', color: '#ffd700', rotation: Math.random() * Math.PI * 2,
          rotSpeed: (Math.random() - 0.5) * 10, gravity: 200, drag: 0.98,
        });
      }
    }

    this.addFloater(this.jar.x, this.jar.y - 40, (golden ? '⭐+' : x2 ? '2X+' : '+$') + reward, '#ffd93d', golden || x2 ? 38 : 32);
    if (golden) this.addFloater(this.jar.x, this.jar.y - 80, 'GOLDEN JAR!', '#ffd700', 22);
    if (x2) this.addFloater(this.jar.x, this.jar.y - 80, 'DOUBLE MONEY!', '#c77dff', 22);

    // Bonus fruit drop (rare, weighted toward cheap fruit)
    if (this.fruitDrop) this.collectFruitDrop();
    this.jarsThisLevel += 1;
    if (this.jarsThisLevel >= this.levelQuota()) {
      this.levelUp();
    } else if (this.containersFilled - this.lastFruitDropAt >= 16 && Math.random() < 0.035) {
      this.spawnFruitDrop();
    }

    this.saveProgress();
    this.saveActiveRun();
    this.checkAchievements();
    this.nextJar();
    this.emitStats();
  }

  private nextJar() {
    this.jar.fill = 0;
    this.jar.shake = 0;
    this.jar.enter = 0;
    this.jar.golden = Math.random() < 0.07;
    const x2 = this.nextJarX2;
    this.nextJarX2 = false;
    const base = 14 + Math.floor(Math.random() * 3);
    this.jar.value = Math.round(base * this.diff(this.level).valueMult * (this.jar.golden ? 4.5 : 1) * (x2 ? 2 : 1));
    this.jar.hue = x2 ? 275 : this.jar.golden ? 45 : 190 + Math.random() * 80;
  }

  private rollBonusFruit(): FruitDef {
    const r = Math.random() * 100;
    if (r < 45) return FRUITS[0]; // apple
    if (r < 75) return FRUITS[1]; // orange
    if (r < 90) return FRUITS[2]; // blueberry
    if (r < 97) return FRUITS[3]; // guava
    return FRUITS[4]; // avocado (100% full heal)
  }

  private spawnFruitDrop() {
    if (this.fruitDrop) return;
    const fruit = this.rollBonusFruit();
    this.fruitDrop = {
      fruit,
      x: this.jar.x,
      y: this.barY() - 30,
      life: 0,
      maxLife: 8,
    };
    this.lastFruitDropAt = this.containersFilled;
    this.addFloater(this.jar.x, this.barY() - 70, fruit.name.toUpperCase() + ' BONUS!', '#ffd93d', 18);
    this.audio?.playSfx('event');
  }

  private collectFruitDrop() {
    if (!this.fruitDrop) return;
    const fd = this.fruitDrop;
    const healMult = this.hasMod('storm') || this.hasMod('weak') ? 0.5 : 1;
    const heal = Math.min(Math.round(fd.fruit.heal * healMult), 100 - this.lungHealth);
    if (heal > 0) {
      this.lungHealth += heal;
      this.audio?.playSfx('eat');
      this.addFloater(fd.x, fd.y - 30, '+' + Math.round(heal) + ' HP', '#ff4d6d', 24);
    } else {
      this.bank += 25;
      this.score += 25;
      this.audio?.playSfx('coin');
      this.addFloater(fd.x, fd.y - 30, '+$25 BONUS', '#ffd93d', 24);
    }
    this.fruitDrops += 1;
    for (let i = 0; i < 14; i++) {
      const a = Math.random() * Math.PI * 2;
      const sp = 100 + Math.random() * 160;
      this.particles.push({
        x: fd.x, y: fd.y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 80,
        life: 0, maxLife: 0.9 + Math.random() * 0.5, size: 7 + Math.random() * 8,
        type: 'heart', color: '#ff4d6d', rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 6, gravity: 220, drag: 0.98,
      });
    }
    this.fruitDrop = null;
    this.emitStats();
  }

  private rollTheme() {
    this.theme = THEMES[Math.floor(Math.random() * THEMES.length)];
  }

  private maybeRollEvents() {
    if (this.challengeActive) return; // never stack with challenge
    const r = Math.random();
    const announce = (title: string, sub: string, color: string, x: number, y: number, size = 22) => {
      // Prefer the big banner, but always leave a floater trail
      if (!this.banner) {
        this.banner = { title, sub, color, life: 0, maxLife: 2 };
      }
      this.addFloater(x, y, title + ' ' + sub, color, size);
    };
    if (r < 0.07) {
      const pick = Math.floor(Math.random() * 6);
      const cx = this.width / 2;
      const cy = this.height * 0.42;
      switch (pick) {
        case 0:
          this.nextJarX2 = true;
          announce('2X MONEY JAR!', 'next jar pays double', '#c77dff', cx, cy);
          break;
        case 1: {
          const cash = 40 + Math.floor(Math.random() * 40);
          this.bank += cash;
          this.score += cash;
          announce('LUCKY CUSTOMER!', '+$' + cash, '#ffd93d', cx, cy);
          break;
        }
        case 2: {
          const cash = 25 + Math.floor(Math.random() * 30);
          this.bank += cash;
          this.score += cash;
          announce('COIN RAIN!', '+$' + cash, '#ffd700', cx, cy);
          for (let i = 0; i < 26; i++) {
            const a = Math.random() * Math.PI * 2;
            const sp = 120 + Math.random() * 180;
            this.particles.push({
              x: this.width / 2, y: this.height * 0.25, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 100,
              life: 0, maxLife: 1.2, size: 6 + Math.random() * 4, type: 'coin', color: '#ffd93d',
              rotation: Math.random() * Math.PI * 2, rotSpeed: (Math.random() - 0.5) * 8,
              gravity: 300, drag: 0.98,
            });
          }
          break;
        }
        case 3:
          this.boostTimer = 12;
          announce('SMOKE BOOST!', '12s of 1.5x fill', '#95d5b2', cx, cy);
          break;
        case 4:
          this.discountActive = true;
          announce('SHOP DISCOUNT!', '20% off next buy', '#8ecae6', cx, cy);
          break;
        case 5: {
          const mystery = Math.random() < 0.5;
          if (mystery) {
            const cash = 30 + Math.floor(Math.random() * 50);
            this.bank += cash;
            this.score += cash;
            announce('MYSTERY REWARD!', '+$' + cash, '#c77dff', cx, cy);
          } else {
            const heal = Math.min(30, 100 - this.lungHealth);
            this.lungHealth += heal;
            announce('MYSTERY REWARD!', '+' + Math.round(heal) + ' HP', '#ff6ec7', cx, cy);
          }
          break;
        }
      }
      this.audio?.playSfx('event');
      this.flash = 0.3;
    } else if (r < 0.12) {
      // Negative mini-event (brief, fair)
      const cx = this.width / 2;
      const cy = this.height * 0.42;
      const pick = Math.floor(Math.random() * 3);
      if (pick === 0) {
        this.wetTimer = 10;
        announce('WET TOOL!', '10s slower fill', '#8ecae6', cx, cy);
      } else if (pick === 1) {
        this.gustTimer = 10;
        announce('WIND GUST!', 'smoke blown off course', '#a8dadc', cx, cy);
      } else {
        this.lungHealth = Math.max(0, this.lungHealth - 6);
        this.shakeIntensity = Math.max(this.shakeIntensity, 8);
        announce('COUGHING FIT!', '-6 ❤', '#f4a261', cx, cy);
        this.audio?.playSfx('cough');
      }
      this.audio?.playSfx('event');
    }
  }

  private showLevelBanner() {
    if (this.challengeActive) {
      const mods = this.challengeMods
        .map((id) => CHALLENGE_MODS.find((m) => m.id === id))
        .filter(Boolean)
        .map((m) => m!.name)
        .join('  ·  ');
      this.banner = {
        title: '⚠ CHALLENGE ' + this.level,
        sub: mods,
        color: '#ff6b6b',
        life: 0,
        maxLife: 2.6,
      };
      this.audio?.playSfx('challenge');
    } else {
      const weather = this.theme.weather === 'fog' ? '  · Foggy' : this.theme.weather === 'heat' ? '  · Heatwave' : '';
      this.banner = {
        title: 'LEVEL ' + this.level + weather,
        sub: 'Fill ' + this.levelQuota() + ' jars!',
        color: '#ffd93d',
        life: 0,
        maxLife: 1.8,
      };
    }
  }

  private levelUp() {
    this.level += 1;
    this.jarsThisLevel = 0;
    this.rollTheme();

    // Dynamic balancing: if earnings are too fat, quietly trim
    if (this.level >= 10 && this.earnedThisRun / this.level > 140 && this.earnPenalty === 1) {
      this.earnPenalty = 0.82;
    }

    if (this.challengeActive) {
      // The level we just finished was a challenge — cleared!
      this.lifetimeChallenges += 1;
      const bonus = 55 + 22 * this.level;
      this.bank += bonus;
      this.score += bonus;
      this.lungHealth = Math.min(100, this.lungHealth + 12);
      this.spawnFruitDrop();
      this.banner = {
        title: 'CHALLENGE CLEARED!',
        sub: '+$' + bonus + ' BONUS  ·  +15 ❤',
        color: '#95d5b2',
        life: 0,
        maxLife: 2.4,
      };
      this.audio?.playSfx('level');
      this.flash = 0.5;
      this.shakeIntensity = 20;
      this.challengeActive = false;
      this.challengeMods = [];
    } else {
      // Normal level — pay bonus, then maybe roll a challenge for the new level
      const bonus = 8 + 5 * this.level;
      this.bank += bonus;
      this.score += bonus;
      if (this.level >= 3 && Math.random() < 0.2) {
        this.challengeActive = true;
        this.rollChallenge();
      }
      this.showLevelBanner();
    }

    this.bestLevel = Math.max(this.bestLevel, this.level);
    this.audio?.playSfx('level');
    this.flash = 0.4;
    this.shakeIntensity = 14;

    const colors = ['#ffd93d', '#ff6ec7', '#8ecae6', '#95d5b2', '#ff9f1c', '#c77dff'];
    for (let i = 0; i < 36; i++) {
      const a = Math.random() * Math.PI * 2;
      const sp = 150 + Math.random() * 260;
      this.particles.push({
        x: this.width / 2 + (Math.random() - 0.5) * 140,
        y: this.height * 0.18,
        vx: Math.cos(a) * sp,
        vy: Math.sin(a) * sp - 120,
        life: 0,
        maxLife: 1.4 + Math.random() * 0.6,
        size: 6 + Math.random() * 8,
        type: 'star',
        color: colors[i % colors.length],
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 10,
        gravity: 300,
        drag: 0.98,
      });
    }
    this.maybeRollEvents();
    this.saveProgress();
    this.saveActiveRun();
    this.checkAchievements();
    this.emitStats();
  }

  private rollChallenge() {
    const pool = CHALLENGE_MODS.filter((m) => m.id !== 'thin');
    const pick1 = pool[Math.floor(Math.random() * pool.length)];
    const mods = [pick1.id];
    if (Math.random() < 0.3) {
      const rest = pool.filter((m) => m.id !== pick1.id && m.id !== 'dud');
      if (rest.length > 0) {
        const pick2 = rest[Math.floor(Math.random() * rest.length)];
        mods.push(pick2.id);
      }
    }
    this.challengeMods = mods;
  }

  private gameOver() {
    this.state = 'gameover';
    this.smoking = false;
    this.isPassiveRecovering = false;
    this.lastRunLevel = this.level;
    this.audio?.setSmoking(false);
    this.audio?.playSfx('gameover');
    this.scores.push(this.score);
    this.scores.sort((a, b) => b - a);
    this.scores = this.scores.slice(0, 5);
    if (this.score > this.highScore) this.highScore = this.score;
    this.clearActiveRun();
    this.saveProgress();
    this.checkAchievements();
    this.shakeIntensity = 22;
    this.emitStats();
    this.onStateChange?.(this.state);
  }

  // ================= Rendering =================

  private render(_dt: number) {
    const ctx = this.ctx;
    const W = this.width;
    const H = this.height;
    const th = this.theme;

    const darkness = this.hasMod('blackout') || this.hasMod('night') ? 0.3 : this.hasMod('storm') ? 0.18 : 0;

    const bg = ctx.createLinearGradient(0, 0, 0, H);
    bg.addColorStop(0, th.skyTop);
    bg.addColorStop(0.5, th.skyMid);
    bg.addColorStop(1, th.skyBot);
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    if (darkness > 0) {
      ctx.fillStyle = `rgba(0,0,0,${darkness * 0.6})`;
      ctx.fillRect(0, 0, W, H);
    }

    // Heat haze tint
    if (th.weather === 'heat') {
      ctx.fillStyle = 'rgba(255, 190, 90, 0.05)';
      ctx.fillRect(0, 0, W, H);
    }

    for (let i = 0; i < 60; i++) {
      const x = (i * 137.5) % W;
      const y = (i * 89.3) % (H * 0.5);
      const tw = 0.4 + 0.6 * Math.abs(Math.sin(this.totalTime * 2 + i));
      ctx.fillStyle = `rgba(255,255,255,${(0.15 + tw * 0.35) * (1 - darkness)})`;
      ctx.fillRect(x, y, 1.5, 1.5);
    }

    ctx.fillStyle = 'rgba(15, 5, 32, 0.9)';
    ctx.beginPath();
    ctx.moveTo(0, H * 0.78);
    let x = 0;
    while (x < W) {
      const bw = 40 + ((x * 31) % 70);
      const bh = 60 + ((x * 17) % 120);
      ctx.lineTo(x, H * 0.78 - bh);
      ctx.lineTo(x + bw, H * 0.78 - bh);
      x += bw;
    }
    ctx.lineTo(W, H * 0.78);
    ctx.lineTo(W, H);
    ctx.lineTo(0, H);
    ctx.closePath();
    ctx.fill();

    for (let i = 0; i < 30; i++) {
      const wx = (i * 71) % W;
      const wy = H * 0.78 - 20 - ((i * 23) % 80);
      const flick = Math.sin(this.totalTime * 3 + i) > 0 ? 1 : 0.3;
      ctx.globalAlpha = flick * (1 - darkness * 0.6);
      ctx.fillStyle = `rgba(${th.windowTint}, 0.6)`;
      ctx.fillRect(wx, wy, 3, 4);
      ctx.globalAlpha = 1;
    }

    const barY = this.barY();
    const barGrad = ctx.createLinearGradient(0, barY, 0, H);
    barGrad.addColorStop(0, '#6b3a1a');
    barGrad.addColorStop(0.3, '#4a2810');
    barGrad.addColorStop(1, '#2a1508');
    ctx.fillStyle = barGrad;
    ctx.fillRect(0, barY, W, H - barY);
    ctx.fillStyle = 'rgba(255, 200, 140, 0.3)';
    ctx.fillRect(0, barY, W, 4);
    ctx.fillStyle = 'rgba(255, 200, 140, 0.08)';
    ctx.fillRect(0, barY + 4, W, 12);

    ctx.save();
    ctx.translate(this.shakeX, this.shakeY);

    this.drawToolObject(ctx);
    this.drawCharacter(ctx);
    this.drawJar(ctx);
    this.drawFruitDrop(ctx);
    this.drawParticles(ctx);
    this.drawFloaters(ctx);
    this.drawHose(ctx);
    this.drawBanner(ctx);

    ctx.restore();

    if (this.flash > 0) {
      ctx.fillStyle = `rgba(255, 255, 255, ${this.flash * 0.4})`;
      ctx.fillRect(0, 0, W, H);
    }

    const vg = ctx.createRadialGradient(W / 2, H / 2, H * 0.3, W / 2, H / 2, H * 0.85);
    vg.addColorStop(0, 'rgba(0,0,0,0)');
    vg.addColorStop(1, 'rgba(0,0,0,0.55)');
    ctx.fillStyle = vg;
    ctx.fillRect(0, 0, W, H);

    // Critical-health pressure
    if (this.lungHealth < 30) {
      const intensity = (1 - this.lungHealth / 30) * 0.4;
      const pulse = 0.5 + 0.5 * Math.sin(this.totalTime * 6);
      ctx.fillStyle = `rgba(255, 30, 60, ${intensity * pulse})`;
      ctx.fillRect(0, 0, W, H);
    }
  }

  private drawFruitDrop(ctx: CanvasRenderingContext2D) {
    if (!this.fruitDrop) return;
    const fd = this.fruitDrop;
    const t = fd.life / fd.maxLife;
    const pulse = 0.5 + 0.5 * Math.sin(this.totalTime * 6);
    const x = fd.x;
    const y = fd.y;

    const g = ctx.createRadialGradient(x, y, 0, x, y, 36);
    g.addColorStop(0, `rgba(255, 200, 100, ${0.35 + pulse * 0.25})`);
    g.addColorStop(1, 'rgba(255,200,100,0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, 36, 0, Math.PI * 2);
    ctx.fill();

    const fruitColors: Record<string, { bg: string; stroke: string; label: string }> = {
      apple: { bg: '#ef4444', stroke: '#fca5a5', label: '+18' },
      orange: { bg: '#f97316', stroke: '#fdba74', label: '+30' },
      blueberry: { bg: '#3b82f6', stroke: '#93c5fd', label: '+50' },
      guava: { bg: '#10b981', stroke: '#6ee7b7', label: '+72' },
      avocado: { bg: '#84cc16', stroke: '#bef264', label: '100%' },
    };
    const fc = fruitColors[fd.fruit.icon] || { bg: '#10b981', stroke: '#6ee7b7', label: '+HP' };

    ctx.save();
    ctx.fillStyle = fc.bg;
    ctx.strokeStyle = fc.stroke;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(x, y, 22, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.font = 'bold 12px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(fc.label, x, y);
    ctx.restore();

    ctx.strokeStyle = 'rgba(255,255,255,0.55)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(x, y, 42, -Math.PI / 2, -Math.PI / 2 + (1 - t) * Math.PI * 2);
    ctx.stroke();
    ctx.strokeStyle = 'rgba(255,255,255,0.15)';
    ctx.beginPath();
    ctx.arc(x, y, 42, 0, Math.PI * 2);
    ctx.stroke();
  }

  private drawBanner(ctx: CanvasRenderingContext2D) {
    if (!this.banner) return;
    const b = this.banner;
    const t = b.life / b.maxLife;
    const scale = easeOutBack(Math.min(1, t * 4));
    const alpha = t > 0.78 ? 1 - (t - 0.78) / 0.22 : 1;
    ctx.save();
    ctx.globalAlpha = Math.max(0, alpha);
    const bannerY = Math.max(75, Math.min(this.height * 0.19, 130));
    ctx.translate(this.width / 2, bannerY);
    ctx.scale(scale, scale);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const titleSize = Math.max(20, Math.min(34, this.width * 0.07));
    const subSize = Math.max(13, Math.min(17, this.width * 0.04));
    ctx.font = `900 ${titleSize}px system-ui, sans-serif`;
    ctx.lineWidth = 6;
    ctx.strokeStyle = 'rgba(0,0,0,0.85)';
    ctx.strokeText(b.title, 0, 0);
    ctx.fillStyle = b.color;
    ctx.fillText(b.title, 0, 0);
    ctx.font = `bold ${subSize}px system-ui, sans-serif`;
    ctx.lineWidth = 4;
    ctx.strokeText(b.sub, 0, titleSize * 0.85);
    ctx.fillStyle = '#ffffff';
    ctx.fillText(b.sub, 0, titleSize * 0.85);
    ctx.restore();
  }

  // ---- Character ----
  private drawCharacter(ctx: CanvasRenderingContext2D) {
    const c = CHARACTERS[this.selectedChar];
    const x = this.charX;
    const y = this.charY;
    const breath = this.charBreath;
    const bodyScale = 1 + breath * 0.06;

    ctx.save();
    ctx.translate(x, y);

    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    ctx.beginPath();
    ctx.ellipse(0, 70, 45, 8, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.save();
    ctx.scale(bodyScale, bodyScale);
    this.drawTorso(ctx, c);
    ctx.restore();

    const headBob = Math.sin(this.totalTime * 3) * 1.5;
    ctx.save();
    ctx.translate(0, -32 + headBob);
    this.drawHead(ctx, c, breath);
    ctx.restore();

    if (this.lungHealth < 40) {
      ctx.fillStyle = `rgba(255, 80, 80, ${0.3 + (1 - this.lungHealth / 40) * 0.3})`;
      ctx.beginPath();
      ctx.arc(x - 14, y - 28, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(x + 14, y - 28, 5, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  private drawTorso(ctx: CanvasRenderingContext2D, c: CharacterDef) {
    const grad = ctx.createLinearGradient(-30, -10, 30, 60);
    grad.addColorStop(0, c.shirt);
    grad.addColorStop(1, c.shirtDark);
    ctx.fillStyle = grad;
    roundRect(ctx, -32, 0, 64, 70, 14);
    ctx.fill();

    ctx.fillStyle = c.shirtDark;
    roundRect(ctx, -42, 6, 14, 50, 7);
    ctx.fill();
    roundRect(ctx, 28, 6, 14, 50, 7);
    ctx.fill();

    if (c.outfit === 'hoodie') {
      ctx.fillStyle = c.shirtDark;
      ctx.beginPath();
      ctx.arc(0, -6, 34, Math.PI * 0.9, Math.PI * 0.1);
      ctx.fill();
      ctx.strokeStyle = c.accent;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-6, 8);
      ctx.lineTo(-8, 22);
      ctx.moveTo(6, 8);
      ctx.lineTo(8, 22);
      ctx.stroke();
      ctx.fillStyle = 'rgba(0,0,0,0.25)';
      roundRect(ctx, -14, 34, 28, 18, 9);
      ctx.fill();
    } else if (c.outfit === 'tee') {
      ctx.fillStyle = c.accent;
      ctx.beginPath();
      ctx.moveTo(-8, 2);
      ctx.lineTo(0, 16);
      ctx.lineTo(8, 2);
      ctx.closePath();
      ctx.fill();
    } else if (c.outfit === 'suit') {
      ctx.fillStyle = c.accent;
      ctx.beginPath();
      ctx.moveTo(-10, 2);
      ctx.lineTo(0, 22);
      ctx.lineTo(10, 2);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = 'rgba(0,0,0,0.4)';
      ctx.beginPath();
      ctx.moveTo(-10, 2);
      ctx.lineTo(-2, 20);
      ctx.lineTo(0, 2);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(10, 2);
      ctx.lineTo(2, 20);
      ctx.lineTo(0, 2);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#c9c9c9';
      ctx.beginPath();
      ctx.arc(0, 30, 2, 0, Math.PI * 2);
      ctx.fill();
    } else if (c.outfit === 'flannel') {
      ctx.save();
      roundRect(ctx, -32, 0, 64, 70, 14);
      ctx.clip();
      ctx.strokeStyle = c.accent;
      ctx.lineWidth = 2;
      for (let gx = -32; gx <= 32; gx += 12) {
        ctx.beginPath();
        ctx.moveTo(gx, 0);
        ctx.lineTo(gx, 70);
        ctx.stroke();
      }
      for (let gy = 0; gy <= 70; gy += 12) {
        ctx.beginPath();
        ctx.moveTo(-32, gy);
        ctx.lineTo(32, gy);
        ctx.stroke();
      }
      ctx.restore();
      ctx.fillStyle = c.accent;
      ctx.beginPath();
      ctx.moveTo(-8, 2);
      ctx.lineTo(0, 16);
      ctx.lineTo(8, 2);
      ctx.closePath();
      ctx.fill();
    } else if (c.outfit === 'jacket') {
      ctx.fillStyle = c.accent;
      ctx.beginPath();
      ctx.moveTo(-10, 2);
      ctx.lineTo(0, 18);
      ctx.lineTo(10, 2);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = 'rgba(0,0,0,0.3)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(0, 2);
      ctx.lineTo(0, 70);
      ctx.stroke();
    }

    if (c.accessory === 'chain') {
      ctx.strokeStyle = '#d9b64a';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-6, 6);
      ctx.quadraticCurveTo(-2, 26, -8, 40);
      ctx.stroke();
      ctx.fillStyle = '#ffd93d';
      ctx.beginPath();
      ctx.arc(-8, 42, 4, 0, Math.PI * 2);
      ctx.fill();
    }

    if (c.accessory === 'star') {
      ctx.fillStyle = '#ffffff';
      drawStar(ctx, 16, 26, 7, 5);
    }
  }

  private drawHead(ctx: CanvasRenderingContext2D, c: CharacterDef, breath: number) {
    const headGrad = ctx.createRadialGradient(-6, -6, 2, 0, 0, 34);
    headGrad.addColorStop(0, c.skin);
    headGrad.addColorStop(1, c.skinDark);
    ctx.fillStyle = headGrad;
    ctx.beginPath();
    ctx.arc(0, 0, 32, 0, Math.PI * 2);
    ctx.fill();

    this.drawHair(ctx, c);

    if (c.accessory === 'cap') {
      ctx.fillStyle = c.shirt;
      ctx.beginPath();
      ctx.arc(0, -6, 31, Math.PI, 0);
      ctx.lineTo(31, -4);
      ctx.quadraticCurveTo(0, -14, -31, -4);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(0, -34, 31, 8, 0, Math.PI, 0);
      ctx.fill();
      ctx.fillStyle = c.shirtDark;
      ctx.beginPath();
      ctx.ellipse(25, -3, 13, 4.5, -0.15, 0, Math.PI * 2);
      ctx.fill();
    }

    if (c.beard) {
      ctx.fillStyle = c.beardColor;
      ctx.beginPath();
      ctx.ellipse(0, 14, 26, 15, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.save();
      ctx.beginPath();
      ctx.arc(0, 0, 31, 0, Math.PI * 2);
      ctx.clip();
      ctx.fillStyle = c.beardColor;
      ctx.fillRect(-32, 0, 64, 40);
      ctx.restore();
    }

    if (c.accessory === 'sunglasses') {
      ctx.fillStyle = '#111118';
      roundRect(ctx, -24, -8, 19, 11, 3);
      ctx.fill();
      roundRect(ctx, 5, -8, 19, 11, 3);
      ctx.fill();
      ctx.fillRect(-5, -4, 10, 2.5);
      ctx.fillStyle = 'rgba(255,255,255,0.45)';
      ctx.fillRect(-21, -6, 5, 2);
      ctx.fillRect(8, -6, 5, 2);
    } else if (c.accessory === 'glasses') {
      ctx.strokeStyle = '#222';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(-14, -3, 9, 0, Math.PI * 2);
      ctx.moveTo(14, -3);
      ctx.arc(14, -3, 9, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(-5, -3);
      ctx.lineTo(5, -3);
      ctx.stroke();
      ctx.fillStyle = '#241a12';
      ctx.beginPath();
      ctx.arc(-14, -3, 2, 0, Math.PI * 2);
      ctx.arc(14, -3, 2, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.fillStyle = '#241a12';
      ctx.beginPath();
      ctx.arc(-10, -4, 3, 0, Math.PI * 2);
      ctx.arc(10, -4, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#241a12';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-14, -10);
      ctx.lineTo(-5, -8);
      ctx.moveTo(14, -10);
      ctx.lineTo(5, -8);
      ctx.stroke();
    }

    if (c.accessory === 'grill') {
      ctx.fillStyle = '#ffd93d';
      roundRect(ctx, -10, 10, 20, 4, 1);
      ctx.fill();
      ctx.fillStyle = '#c9a227';
      for (let i = -6; i <= 6; i += 4) {
        ctx.fillRect(i, 10, 1.5, 4);
      }
    }

    // Flu visual: red nose + tissue
    if (this.hasMod('flu')) {
      ctx.fillStyle = '#ff5a5a';
      ctx.beginPath();
      ctx.arc(0, 8, 4.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(4, 6, 14, 8);
      ctx.strokeStyle = 'rgba(0,0,0,0.2)';
      ctx.lineWidth = 1;
      ctx.strokeRect(4, 6, 14, 8);
      ctx.fillStyle = '#8ecae6';
      ctx.beginPath();
      ctx.arc(-18, -14, 3, 0, Math.PI * 2);
      ctx.fill();
    }

    this.drawMouthpiece(ctx, breath);
  }

  private drawHair(ctx: CanvasRenderingContext2D, c: CharacterDef) {
    const col = c.hairColor;
    if (c.hair === 'bald') return;

    if (c.hair === 'long' || c.hair === 'braids') {
      const strands = c.hair === 'braids' ? 6 : 7;
      ctx.fillStyle = col;
      for (let i = 0; i < strands; i++) {
        const sx = -22 + (44 * i) / (strands - 1);
        const w = c.hair === 'braids' ? 6 : 7;
        const len = c.hair === 'braids' ? 38 : 46;
        const sway = Math.sin(this.totalTime * 2 + i) * 2;
        roundRect(ctx, sx - w / 2, -28, w, len, 3);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(sx + sway, -28 + len - 1, w / 2, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.beginPath();
      ctx.arc(0, -8, 32, Math.PI, 0);
      ctx.fill();
    } else if (c.hair === 'short') {
      ctx.fillStyle = col;
      for (let i = -2; i <= 2; i++) {
        ctx.beginPath();
        ctx.arc(i * 10, -26, 8, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.beginPath();
      ctx.arc(0, -8, 32, Math.PI, 0);
      ctx.fill();
    } else if (c.hair === 'curly') {
      ctx.fillStyle = col;
      for (let i = 0; i < 9; i++) {
        const a = (i / 9) * Math.PI + Math.PI;
        ctx.beginPath();
        ctx.arc(Math.cos(a) * 22, -30 + Math.sin(a) * 8, 9, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.beginPath();
      ctx.arc(0, -10, 32, Math.PI, 0);
      ctx.fill();
    } else if (c.hair === 'buzz') {
      ctx.fillStyle = col;
      ctx.lineWidth = 7;
      ctx.strokeStyle = col;
      ctx.beginPath();
      ctx.arc(0, -8, 31, Math.PI * 1.05, Math.PI * 0.95);
      ctx.stroke();
    } else if (c.hair === 'fade') {
      const fade = ctx.createLinearGradient(0, -34, 0, -4);
      fade.addColorStop(0, col);
      fade.addColorStop(1, c.skinDark);
      ctx.fillStyle = fade;
      ctx.beginPath();
      ctx.arc(0, -10, 31, Math.PI * 1.02, Math.PI * 0.98);
      ctx.closePath();
      ctx.fill();
    }
  }

  private drawMouthpiece(ctx: CanvasRenderingContext2D, breath: number) {
    const tool = TOOLS[this.selectedTool];
    const time = this.totalTime;
    ctx.save();
    ctx.translate(14, 10);
    ctx.rotate(-0.08 + breath * 0.02);

    if (tool.id === 'cig') {
      ctx.fillStyle = '#f4e5c7';
      ctx.fillRect(0, -2, 22, 4);
      ctx.fillStyle = '#c9935a';
      ctx.fillRect(0, -2, 5, 4);
      const pulse = 0.7 + 0.3 * Math.sin(time * 20);
      ctx.fillStyle = smokingColor(breath, pulse);
      ctx.beginPath();
      ctx.arc(22, 0, 3.5, 0, Math.PI * 2);
      ctx.fill();
      this.drawEmberGlow(ctx, 22, breath);
    } else if (tool.id === 'ecig') {
      ctx.fillStyle = '#3a3f4a';
      ctx.fillRect(0, -2.5, 18, 5);
      ctx.fillStyle = '#2a2e38';
      ctx.fillRect(0, -2.5, 18, 1.8);
      const pulse = 0.5 + 0.5 * Math.sin(time * 14);
      ctx.fillStyle = `rgba(90, 220, 255, ${0.4 + pulse * 0.6})`;
      ctx.beginPath();
      ctx.arc(18, 0, 2.6, 0, Math.PI * 2);
      ctx.fill();
      this.drawTipGlow(ctx, 18, tool.led || '#5adcff', breath);
    } else if (tool.id === 'pod') {
      roundRect(ctx, -2, -4, 12, 8, 2);
      ctx.fillStyle = '#4a4f5a';
      ctx.fill();
      roundRect(ctx, -2, -4, 12, 3, 2);
      ctx.fillStyle = '#6a7080';
      ctx.fill();
      roundRect(ctx, 10, -2.5, 6, 5, 1.5);
      ctx.fillStyle = '#2a2e38';
      ctx.fill();
      const pulse = 0.5 + 0.5 * Math.sin(time * 16);
      ctx.fillStyle = `rgba(199, 125, 255, ${0.4 + pulse * 0.6})`;
      ctx.beginPath();
      ctx.arc(16, 0, 2.4, 0, Math.PI * 2);
      ctx.fill();
      this.drawTipGlow(ctx, 16, tool.led || '#c77dff', breath);
    } else if (tool.id === 'cigar') {
      ctx.fillStyle = '#7a4a24';
      ctx.fillRect(0, -3.5, 18, 7);
      ctx.fillStyle = '#9a6234';
      ctx.fillRect(0, -3.5, 18, 2.5);
      ctx.fillStyle = '#e8b84a';
      ctx.fillRect(11, -3.5, 3, 7);
      const pulse = 0.7 + 0.3 * Math.sin(time * 18);
      ctx.fillStyle = smokingColor(breath, pulse);
      ctx.beginPath();
      ctx.arc(18, 0, 5, 0, Math.PI * 2);
      ctx.fill();
      this.drawEmberGlow(ctx, 18, breath);
    } else if (tool.id === 'blunt') {
      ctx.fillStyle = '#5a7a3a';
      ctx.fillRect(0, -4, 16, 8);
      ctx.fillStyle = '#7a9a52';
      ctx.fillRect(0, -4, 16, 3);
      const pulse = 0.7 + 0.3 * Math.sin(time * 16);
      ctx.fillStyle = smokingColor(breath, pulse);
      ctx.beginPath();
      ctx.arc(16, 0, 4.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#4a6a2c';
      ctx.beginPath();
      ctx.arc(15, -3, 3, 0, Math.PI * 2);
      ctx.fill();
      this.drawEmberGlow(ctx, 16, breath);
    } else {
      ctx.fillStyle = '#b8b8c0';
      roundRect(ctx, -2, -3, 10, 6, 2);
      ctx.fill();
      ctx.fillStyle = '#8a8a92';
      ctx.fillRect(6, -3, 3, 6);
    }
    ctx.restore();
  }

  private drawEmberGlow(ctx: CanvasRenderingContext2D, ex: number, breath: number) {
    const glow = ctx.createRadialGradient(ex, 0, 0, ex, 0, 14);
    glow.addColorStop(0, `rgba(255, 150, 60, ${0.5 + breath * 0.4})`);
    glow.addColorStop(1, 'rgba(255, 150, 60, 0)');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(ex, 0, 14, 0, Math.PI * 2);
    ctx.fill();
  }

  private drawTipGlow(ctx: CanvasRenderingContext2D, ex: number, color: string, breath: number) {
    const glow = ctx.createRadialGradient(ex, 0, 0, ex, 0, 12);
    glow.addColorStop(0, `${hexToRgba(color, 0.55 + breath * 0.3)}`);
    glow.addColorStop(1, `${hexToRgba(color, 0)}`);
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(ex, 0, 12, 0, Math.PI * 2);
    ctx.fill();
  }

  // ---- Tool object (hookah / bong) ----
  private drawToolObject(ctx: CanvasRenderingContext2D) {
    const tool = TOOLS[this.selectedTool];
    const tb = this.toolBase();
    const tx = tb.x;
    const ty = tb.y;

    if (tool.id === 'hookah') {
      const vase = ctx.createLinearGradient(tx - 24, 0, tx + 24, 0);
      vase.addColorStop(0, '#5a2d8a');
      vase.addColorStop(0.5, '#8a4ab8');
      vase.addColorStop(1, '#4a2370');
      ctx.fillStyle = vase;
      ctx.beginPath();
      ctx.ellipse(tx, ty - 26, 22, 26, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(180, 120, 240, 0.4)';
      ctx.beginPath();
      ctx.ellipse(tx, ty - 16, 16, 12, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#3a2a1a';
      ctx.fillRect(tx - 4, ty - 56, 8, 30);
      ctx.fillStyle = '#2a1a10';
      ctx.beginPath();
      ctx.moveTo(tx - 10, ty - 64);
      ctx.lineTo(tx + 10, ty - 64);
      ctx.lineTo(tx, ty - 74);
      ctx.closePath();
      ctx.fill();
      if (this.smoking) {
        const glow = ctx.createRadialGradient(tx, ty - 68, 0, tx, ty - 68, 20);
        glow.addColorStop(0, 'rgba(255, 160, 80, 0.5)');
        glow.addColorStop(1, 'rgba(255, 160, 80, 0)');
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(tx, ty - 68, 20, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (tool.id === 'bong') {
      ctx.fillStyle = '#8a5ac8';
      roundRect(ctx, tx - 14, ty - 34, 28, 34, 8);
      ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.2)';
      roundRect(ctx, tx - 10, ty - 34, 6, 34, 3);
      ctx.fill();
      ctx.fillStyle = 'rgba(180, 180, 220, 0.7)';
      ctx.fillRect(tx - 6, ty - 58, 12, 24);
      ctx.fillStyle = 'rgba(150, 190, 255, 0.5)';
      ctx.fillRect(tx - 6, ty - 44, 12, 10);
      ctx.fillStyle = '#2a1a10';
      ctx.beginPath();
      ctx.moveTo(tx - 7, ty - 62);
      ctx.lineTo(tx + 7, ty - 62);
      ctx.lineTo(tx, ty - 70);
      ctx.closePath();
      ctx.fill();
      if (this.smoking) {
        const glow = ctx.createRadialGradient(tx, ty - 66, 0, tx, ty - 66, 18);
        glow.addColorStop(0, 'rgba(255, 160, 80, 0.5)');
        glow.addColorStop(1, 'rgba(255, 160, 80, 0)');
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(tx, ty - 66, 18, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  private drawHose(ctx: CanvasRenderingContext2D) {
    const tool = TOOLS[this.selectedTool];
    if (tool.id !== 'hookah' && tool.id !== 'bong') return;
    const tb = this.toolBase();
    const sx = tb.x - 14;
    const sy = tb.y - 44;
    const mx = this.charX + 16;
    const my = this.charY - 20;
    ctx.strokeStyle = '#4a3020';
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.quadraticCurveTo(sx - 30, my + 20, mx, my);
    ctx.stroke();
    ctx.strokeStyle = 'rgba(255,255,255,0.12)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(sx, sy - 1);
    ctx.quadraticCurveTo(sx - 30, my + 20, mx, my - 1);
    ctx.stroke();
  }

  // ---- Jar ----
  private drawJar(ctx: CanvasRenderingContext2D) {
    const j = this.jar;
    const enter = easeOutBack(j.enter);
    const pop = j.pop;
    const visualScale = Math.min(1.4, 0.85 + this.effFillReq() * 0.16);
    const scale = enter * (1 + pop * 0.3) * visualScale;
    const x2 = j.hue === 275;

    ctx.save();
    ctx.translate(j.x, j.y);
    ctx.scale(scale, scale);
    const shakeOff = (Math.random() - 0.5) * j.shake * 3;
    ctx.translate(shakeOff, shakeOff * 0.5);

    const w = j.w;
    const h = j.h;
    const gold = j.golden;

    const glowGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, w);
    glowGrad.addColorStop(0, gold ? 'rgba(255, 215, 100, 0.45)' : x2 ? 'rgba(199, 125, 255, 0.4)' : `hsla(${j.hue}, 80%, 60%, 0.3)`);
    glowGrad.addColorStop(1, 'rgba(255, 215, 100, 0)');
    ctx.fillStyle = glowGrad;
    ctx.beginPath();
    ctx.arc(0, 0, w, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = gold ? 'rgba(255, 215, 120, 0.95)' : x2 ? 'rgba(199, 125, 255, 0.9)' : `hsla(${j.hue}, 60%, 80%, 0.9)`;
    ctx.lineWidth = 3;
    ctx.fillStyle = gold ? 'rgba(255, 230, 160, 0.12)' : x2 ? 'rgba(199, 125, 255, 0.1)' : 'rgba(200, 230, 255, 0.08)';
    roundRect(ctx, -w / 2, -h / 2, w, h, 12);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = gold ? '#8a6a20' : x2 ? '#5a2d8a' : '#4a2810';
    roundRect(ctx, -w / 2 - 4, -h / 2 - 10, w + 8, 14, 4);
    ctx.fill();
    ctx.strokeStyle = gold ? '#c9a227' : x2 ? '#8a4ab8' : '#6b3a1a';
    ctx.lineWidth = 1;
    ctx.stroke();

    if (j.fill > 0) {
      ctx.save();
      ctx.beginPath();
      roundRect(ctx, -w / 2 + 3, -h / 2 + 3, w - 6, h - 6, 10);
      ctx.clip();
      const fillH = (h - 6) * j.fill;
      const fillY = h / 2 - 3 - fillH;
      const fg = ctx.createLinearGradient(0, fillY, 0, h / 2);
      fg.addColorStop(0, gold ? 'rgba(255, 240, 200, 0.95)' : x2 ? 'rgba(235, 205, 255, 0.95)' : 'rgba(245, 245, 250, 0.9)');
      fg.addColorStop(1, gold ? 'rgba(240, 215, 150, 0.95)' : x2 ? 'rgba(210, 170, 245, 0.95)' : 'rgba(200, 200, 220, 0.95)');
      ctx.fillStyle = fg;
      ctx.beginPath();
      ctx.moveTo(-w / 2 + 3, fillY);
      const waves = 6;
      for (let i = 0; i <= waves; i++) {
        const wx = -w / 2 + 3 + ((w - 6) * i) / waves;
        const wy = fillY + Math.sin(this.totalTime * 4 + i) * 3;
        ctx.lineTo(wx, wy);
      }
      ctx.lineTo(w / 2 - 3, h / 2 - 3);
      ctx.lineTo(-w / 2 + 3, h / 2 - 3);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = gold ? 'rgba(200, 170, 100, 0.45)' : x2 ? 'rgba(170, 130, 220, 0.45)' : 'rgba(150, 150, 170, 0.4)';
      for (let i = 0; i < 3; i++) {
        const sx = -w / 2 + 10 + ((w - 20) * ((this.totalTime * 0.3 + i * 0.33) % 1));
        const sy = fillY + fillH * 0.3 + Math.sin(this.totalTime * 2 + i) * 10;
        ctx.beginPath();
        ctx.arc(sx, sy, 8, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }

    ctx.fillStyle = 'rgba(255,255,255,0.18)';
    roundRect(ctx, -w / 2 + 8, -h / 2 + 6, 6, h - 16, 3);
    ctx.fill();

    if (j.fill > 0 && j.fill < 1) {
      ctx.fillStyle = 'rgba(255,255,255,0.9)';
      ctx.font = 'bold 16px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(Math.round(j.fill * 100) + '%', 0, h / 2 + 22);
    }

    if (j.fill < 1) {
      ctx.fillStyle = gold ? '#ffd700' : x2 ? '#c77dff' : '#ffd93d';
      ctx.font = 'bold 14px system-ui, sans-serif';
      ctx.textAlign = 'center';
      const estReward = calculateJarReward({
        baseJarValue: j.value,
        charMult: this.charMult,
        toolEarn: TOOLS[this.selectedTool].earn,
        combo: this.combo,
        earnPenalty: this.earnPenalty,
        gameMode: this.gameMode,
        challengeMods: this.challengeMods,
      });
      ctx.fillText(
        (gold ? 'GOLD $' : x2 ? '2X $' : '$') + estReward,
        0,
        -h / 2 - 20
      );
    }

    if (gold || x2) {
      if (gold) {
        ctx.fillStyle = '#ffd700';
        drawStar(ctx, 0, -h / 2 - 38, 9, 5);
      } else {
        ctx.fillStyle = '#c77dff';
        ctx.font = 'bold 16px system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('2X', 0, -h / 2 - 38);
      }
    }

    ctx.restore();
  }

  // ---- Particles ----
  private drawParticles(ctx: CanvasRenderingContext2D) {
    // Rain + fog first (behind)
    for (const p of this.particles) {
      if (p.type !== 'rain' && p.type !== 'fog') continue;
      if (p.type === 'rain') {
        const t = p.life / p.maxLife;
        ctx.strokeStyle = p.color;
        ctx.globalAlpha = (1 - t) * 0.7;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x - p.vx * 0.03, p.y - p.vy * 0.03);
        ctx.stroke();
        ctx.globalAlpha = 1;
      } else {
        const t = p.life / p.maxLife;
        ctx.fillStyle = p.color;
        ctx.globalAlpha = Math.sin(Math.min(1, t * 2) * Math.PI) * 0.55;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      }
    }

    for (const p of this.particles) {
      if (p.type !== 'smoke' && p.type !== 'puff') continue;
      const t = p.life / p.maxLife;
      const alpha = (1 - t) * (p.type === 'smoke' ? 0.55 : 0.7);
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
    for (const p of this.particles) {
      if (p.type === 'smoke' || p.type === 'puff' || p.type === 'rain' || p.type === 'fog') continue;
      const t = p.life / p.maxLife;
      const alpha = 1 - t;
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);
      if (p.type === 'ember') {
        ctx.fillStyle = p.color;
        ctx.shadowColor = '#ff7a2a';
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(0, 0, p.size, 0, Math.PI * 2);
        ctx.fill();
      } else if (p.type === 'heart') {
        ctx.fillStyle = p.color;
        ctx.shadowColor = '#ff4d6d';
        ctx.shadowBlur = 10;
        drawHeart(ctx, 0, 0, p.size);
      } else if (p.type === 'coin') {
        ctx.fillStyle = p.color;
        ctx.strokeStyle = '#b8860b';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(0, 0, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#b8860b';
        ctx.font = `bold ${Math.round(p.size * 1.2)}px system-ui`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('$', 0, 1);
      } else if (p.type === 'star') {
        ctx.fillStyle = p.color;
        drawStar(ctx, 0, 0, p.size, 5);
      }
      ctx.restore();
    }
  }

  private drawFloaters(ctx: CanvasRenderingContext2D) {
    for (const f of this.floaters) {
      const t = f.life / f.maxLife;
      const alpha = 1 - t;
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.translate(f.x, f.y);
      ctx.scale(f.scale, f.scale);
      ctx.font = `bold ${f.size}px system-ui, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.lineWidth = 4;
      ctx.strokeStyle = 'rgba(0,0,0,0.7)';
      ctx.strokeText(f.text, 0, 0);
      ctx.fillStyle = f.color;
      ctx.fillText(f.text, 0, 0);
      ctx.restore();
    }
  }
}

// ---- Helpers ----
function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function drawHeart(ctx: CanvasRenderingContext2D, cx: number, cy: number, size: number) {
  ctx.beginPath();
  const s = size / 2;
  ctx.moveTo(cx, cy + s * 0.8);
  ctx.bezierCurveTo(cx + s * 1.6, cy - s * 0.3, cx + s * 0.8, cy - s * 1.2, cx, cy - s * 0.4);
  ctx.bezierCurveTo(cx - s * 0.8, cy - s * 1.2, cx - s * 1.6, cy - s * 0.3, cx, cy + s * 0.8);
  ctx.closePath();
  ctx.fill();
}

function drawStar(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number, points: number) {
  ctx.beginPath();
  for (let i = 0; i < points * 2; i++) {
    const a = (i * Math.PI) / points - Math.PI / 2;
    const rad = i % 2 === 0 ? r : r * 0.45;
    const x = cx + Math.cos(a) * rad;
    const y = cy + Math.sin(a) * rad;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fill();
}

function easeOutBack(t: number) {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
}

function smokingColor(breath: number, pulse: number) {
  const r = 255;
  const g = Math.round(100 + pulse * 80 + breath * 40);
  const b = 20;
  return `rgb(${r},${g},${b})`;
}

function hexToRgba(hex: string, alpha: number) {
  const h = hex.replace('#', '');
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}
