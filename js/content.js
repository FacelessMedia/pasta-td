/* ============== PASTA TD CONTENT ============== */
// THEME: Pasta has invaded your kitchen! Defend with kitchen tools.
// Towers = kitchen utensils; Enemies = sentient pasta dishes.

const TOWERS = [
  {
    id: 'spaghetti', // keeping old id for save compat
    name: 'Knife Block Knight',
    emoji: '🔪',
    desc: 'Long-range single-target. The kitchen\'s most reliable defender.',
    lore: 'A trained set of cutlery, each blade sworn to protect the pantry. Especially effective against soft pasta.',
    cost: 70,
    damage: 22,
    range: 220,
    fireRate: 1.2,
    projectileSpeed: 650,
    projectile: '🗡',
    color: '#dfe6e9',
    unlockWave: 1,
    upgrades: {
      damage: { increment: 16, cost: 55, max: 5 },
      range: { increment: 30, cost: 50, max: 4 },
      fireRate: { increment: 0.4, cost: 70, max: 4 }
    },
    taunts: [
      "Time to dice you, pasta!",
      "I'm gonna SLICE you up!",
      "You've been chopped!",
      "En garde, noodle!",
      "Cut to the chase!"
    ]
  },
  {
    id: 'penne',
    name: 'Wooden Spoon Whacker',
    emoji: '🥄',
    desc: 'Bonks pasta with splash damage. Grandma\'s favorite weapon.',
    lore: 'Wielded by generations of Italian grandmothers. Each whack is a love letter — a violent one.',
    cost: 110,
    damage: 14,
    range: 130,
    fireRate: 1.0,
    projectileSpeed: 380,
    splash: 50,
    projectile: '💢',
    color: '#cd853f',
    unlockWave: 2,
    upgrades: {
      damage: { increment: 11, cost: 75, max: 5 },
      range: { increment: 22, cost: 55, max: 4 },
      splash: { increment: 15, cost: 70, max: 4 }
    },
    taunts: [
      "Get off my counter!",
      "Mamma's not happy!",
      "BONK!",
      "I'll whack you sauceless!",
      "Bad pasta! BAD!"
    ]
  },
  {
    id: 'fusilli',
    name: 'Whisk Whirlwind',
    emoji: '🌀',
    desc: 'Spins furiously, beating pasta to death. Extremely fast attacks.',
    lore: 'A possessed wire whisk that found a taste for vengeance after one too many lumpy gravies.',
    cost: 95,
    damage: 7,
    range: 140,
    fireRate: 4.2,
    projectileSpeed: 520,
    projectile: '✦',
    color: '#74b9ff',
    unlockWave: 3,
    upgrades: {
      damage: { increment: 6, cost: 70, max: 5 },
      fireRate: { increment: 1.3, cost: 90, max: 4 },
      range: { increment: 25, cost: 60, max: 4 }
    },
    taunts: [
      "WHISK-A-WHISK-A!",
      "I'm BEATING you!",
      "Aerate THIS!",
      "Whip whip whip!",
      "Fluffy time!"
    ]
  },
  {
    id: 'ravioli',
    name: 'Frying Pan Phantom',
    emoji: '🍳',
    desc: 'Smashes down hot — huge explosive splash damage.',
    lore: 'A cast-iron classic with a serious grudge. Specializes in flattening anything that dares enter the kitchen.',
    cost: 200,
    damage: 55,
    range: 175,
    fireRate: 0.55,
    projectileSpeed: 360,
    splash: 85,
    projectile: '🔥',
    color: '#2d3436',
    unlockWave: 5,
    upgrades: {
      damage: { increment: 35, cost: 130, max: 5 },
      splash: { increment: 25, cost: 100, max: 4 },
      fireRate: { increment: 0.28, cost: 150, max: 4 }
    },
    taunts: [
      "PAN-CAKE!",
      "Flatten that pasta!",
      "Sizzle, baby, SIZZLE!",
      "BAM! Flip it!",
      "I'm gettin' HOT!"
    ]
  },
  {
    id: 'tortellini',
    name: 'Salt Shaker Slowmer',
    emoji: '🧂',
    desc: 'Sprinkles salt — slows enemies in their tracks.',
    lore: 'It dehydrates pasta on contact. Cruel, but effective.',
    cost: 100,
    damage: 4,
    range: 160,
    fireRate: 1.6,
    projectileSpeed: 480,
    slow: { factor: 0.5, duration: 2.0 },
    projectile: '⋅',
    color: '#dfe6e9',
    unlockWave: 4,
    upgrades: {
      slowFactor: { increment: 0.1, cost: 85, max: 3 },
      slowDuration: { increment: 0.5, cost: 70, max: 4 },
      range: { increment: 25, cost: 55, max: 4 }
    },
    taunts: [
      "Eat my salt!",
      "Take the L (for low sodium)!",
      "Season's greetings!",
      "Get DEHYDRATED!",
      "Tastes a little off, no?"
    ]
  },
  {
    id: 'linguine',
    name: 'Pizza Oven Inferno',
    emoji: '🔥',
    desc: 'Shoots a continuous laser beam — pierces ALL pasta in a line.',
    lore: 'Burns at 900°F. The only oven the pasta truly fears.',
    cost: 250,
    damage: 13,
    range: 200,
    fireRate: 10.0,
    pierce: true,
    color: '#ff7675',
    unlockWave: 8,
    upgrades: {
      damage: { increment: 8, cost: 140, max: 5 },
      range: { increment: 30, cost: 100, max: 4 },
      fireRate: { increment: 3, cost: 130, max: 3 }
    },
    taunts: [
      "Feel the BURN!",
      "I'm well-done with you!",
      "Crispy time!",
      "Toasted!",
      "Hope you like char marks!"
    ]
  },
  {
    id: 'macaroni',
    name: 'Tenderizer Tornado',
    emoji: '🔨',
    desc: 'Bashes pasta into oblivion. Rapid-fire heavy hits.',
    lore: 'A meat mallet possessed by the soul of a butcher. Now it tenderizes anything that moves.',
    cost: 165,
    damage: 6,
    range: 140,
    fireRate: 5.5,
    projectileSpeed: 700,
    projectile: '◾',
    color: '#636e72',
    unlockWave: 6,
    upgrades: {
      damage: { increment: 5, cost: 95, max: 5 },
      fireRate: { increment: 1.5, cost: 110, max: 4 },
      range: { increment: 20, cost: 70, max: 4 }
    },
    taunts: [
      "TENDERIZE!",
      "Pound town, baby!",
      "Soften up!",
      "Hammer time!",
      "BASH-BASH-BASH!"
    ]
  },
  {
    id: 'gnocchi',
    name: 'Rolling Pin Cannon',
    emoji: '🥖',
    desc: 'Heavy, slow, devastating. Massive single-target damage.',
    lore: 'When grandma rolls out the dough, the dough rolls out the door. Or gets flattened. Usually flattened.',
    cost: 290,
    damage: 130,
    range: 250,
    fireRate: 0.32,
    projectileSpeed: 380,
    splash: 55,
    projectile: '🟫',
    color: '#a0522d',
    unlockWave: 10,
    upgrades: {
      damage: { increment: 80, cost: 180, max: 5 },
      range: { increment: 35, cost: 130, max: 4 },
      splash: { increment: 20, cost: 120, max: 3 }
    },
    taunts: [
      "FLATTEN!",
      "Roll out, dough boy!",
      "Steamroller comin' through!",
      "Squashed!",
      "Bread you out!"
    ]
  },
  {
    id: 'lasagna',
    name: 'Garlic Press Aura',
    emoji: '🧄',
    desc: 'No attack — boosts adjacent towers\' damage by +25%. Pasta hates garlic!',
    lore: 'The pungent perimeter. Pasta gives a wide berth, and your other tools strike harder in its presence.',
    cost: 175,
    damage: 0,
    range: 95,
    fireRate: 0,
    aura: 0.25,
    color: '#ffeaa7',
    unlockWave: 7,
    upgrades: {
      aura: { increment: 0.15, cost: 130, max: 4 },
      range: { increment: 20, cost: 90, max: 4 }
    },
    taunts: [
      "Smell that?",
      "GAR-LICK YOU!",
      "Vampires AND pasta hate me!",
      "Pungent power!",
      "Aroma-therapy!"
    ]
  }
];

// ============== ENEMIES ==============
// Pasta dishes invading the kitchen!
const ENEMIES = {
  meatball: {
    name: 'Meatball Marauder', emoji: '🟤', hp: 28, speed: 60, gold: 5, color: '#8b4513',
    lore: 'Basic ground-beef brawler. Comes in herds. Easy alone, deadly in groups.',
    strength: 'Numbers', weakness: 'Single hits', tags: ['basic']
  },
  tomato: {
    name: 'Tomato Trooper', emoji: '🍅', hp: 78, speed: 42, gold: 11, color: '#d63031',
    lore: 'Plump and pulpy. Splatters when squished — your tools will need rinsing.',
    strength: 'Tanky', weakness: 'Splash damage', tags: ['tank']
  },
  garlic: {
    name: 'Spaghetti Slug', emoji: '🍝', hp: 48, speed: 78, gold: 8, color: '#f5d76e',
    lore: 'Slippery strings that wriggle past defenses. Hard to grab, fast to flank.',
    strength: 'Speed', weakness: 'AOE attacks', tags: ['fast']
  },
  pepperoni: {
    name: 'Pepperoni Pest', emoji: '🍕', hp: 24, speed: 100, gold: 7, color: '#b33939',
    lore: 'Tiny spicy disks. Quick as a wink, weak as a wafer.',
    strength: 'Very fast', weakness: 'Slow + DPS', tags: ['fast']
  },
  olive: {
    name: 'Olive Oligarch', emoji: '🫒', hp: 160, speed: 48, gold: 19, color: '#4a5d23',
    lore: 'Pit-bossed. Comes from old money and old vines. Hard to crack.',
    strength: 'HP', weakness: 'Heavy damage', tags: ['tank']
  },
  basil: {
    name: 'Basil Brute', emoji: '🌿', hp: 210, speed: 55, gold: 23, color: '#27ae60',
    lore: 'Aromatic and athletic. Sneaks through your defenses with herb-y grace.',
    strength: 'Balanced HP+Speed', weakness: 'Burst damage', tags: ['tank']
  },
  mozzarella: {
    name: 'Mozzarella Monster', emoji: '⚪', hp: 380, speed: 42, gold: 36, color: '#fff5e6',
    lore: 'Stretchy, gooey, hard to kill. Bites stretch but never break.',
    strength: 'Bulk', weakness: 'Continuous DPS', tags: ['tank']
  },
  anchovy: {
    name: 'Anchovy Assassin', emoji: '🐟', hp: 95, speed: 145, gold: 26, color: '#5d6d7e',
    fast: true,
    lore: 'Tiny, salty, fast. Hates everyone equally. Especially you.',
    strength: 'BLAZING speed', weakness: 'Slow effects', tags: ['fast']
  },
  parmesan: {
    name: 'Parmesan Predator', emoji: '🟡', hp: 540, speed: 50, gold: 52, armor: 0.3, color: '#f39c12',
    lore: 'Aged 24 months. Armored hard rind. Cracks reveal sharp salty bites.',
    strength: '30% Armor', weakness: 'Heavy single hits', tags: ['armor']
  },
  cheeseWheel: {
    name: 'Wheel of Cheddar', emoji: '🧀', hp: 3000, speed: 35, gold: 280, color: '#f1c40f',
    boss: true, scale: 1.8,
    lore: 'The cheese-mafia\'s wheel of misfortune. Rolls relentlessly toward your dining room.',
    strength: 'Massive HP', weakness: 'Sustained DPS', tags: ['boss']
  },
  spicyPepper: {
    name: 'Spicy Pepper Pest', emoji: '🌶️', hp: 640, speed: 82, gold: 75, color: '#ff4444',
    lore: 'Scorching hot and hopping mad. Kitchen tools feel the heat.',
    strength: 'Speed + HP', weakness: 'Salt (slow effects)', tags: ['fast', 'tank']
  },
  pizza: {
    name: 'Pizza Pizzaiolo', emoji: '🍕', hp: 1300, speed: 46, gold: 130, armor: 0.2, color: '#e67e22',
    scale: 1.3,
    lore: 'A weaponized pizza pie. The crust is solid armor; the toppings are throwing stars.',
    strength: 'Armor + HP', weakness: 'Pierce + burst', tags: ['armor', 'tank']
  },
  pastaSauce: {
    name: 'Sauce Specter', emoji: '🩸', hp: 270, speed: 115, gold: 44, color: '#7a1c1c', fast: true,
    lore: 'A semi-corporeal puddle of marinara. Slithers between cracks in your defense.',
    strength: 'Speed', weakness: 'AOE splash', tags: ['fast']
  },
  finalBoss: {
    name: 'THE NOODLE NIGHTMARE', emoji: '🍝', hp: 18000, speed: 28, gold: 1800, color: '#5d2e0f',
    boss: true, scale: 2.5, armor: 0.4,
    lore: 'The matriarch of all pasta. A primordial plate of starch that has hungered for eons. The kitchen\'s final test.',
    strength: 'EVERYTHING', weakness: 'Throw the entire kitchen sink at it', tags: ['boss', 'armor']
  }
};

// ============== WAVES ==============
// 30 hand-crafted waves with smooth difficulty ramp.
function generateWaves() {
  const waves = [];
  // 1-3: tutorial — only meatballs, easy
  waves.push({ enemies: [{ type: 'meatball', count: 6, spacing: 0.85 }], reward: 35 });
  waves.push({ enemies: [{ type: 'meatball', count: 10, spacing: 0.7 }], reward: 40 });
  waves.push({ enemies: [{ type: 'meatball', count: 8, spacing: 0.55 }, { type: 'pepperoni', count: 4, spacing: 0.55 }], reward: 50 });
  // 4-6: introduce variety
  waves.push({ enemies: [{ type: 'tomato', count: 6, spacing: 0.7 }, { type: 'pepperoni', count: 6, spacing: 0.45 }], reward: 60 });
  waves.push({ enemies: [{ type: 'garlic', count: 10, spacing: 0.5 }, { type: 'tomato', count: 5, spacing: 0.7 }], reward: 70 });
  waves.push({ enemies: [{ type: 'pepperoni', count: 14, spacing: 0.38 }], reward: 80 });
  // 7-9: heat up
  waves.push({ enemies: [{ type: 'tomato', count: 8, spacing: 0.6 }, { type: 'garlic', count: 10, spacing: 0.45 }], reward: 95 });
  waves.push({ enemies: [{ type: 'olive', count: 7, spacing: 0.85 }, { type: 'pepperoni', count: 10, spacing: 0.4 }], reward: 110 });
  waves.push({ enemies: [{ type: 'basil', count: 7, spacing: 0.85 }, { type: 'anchovy', count: 6, spacing: 0.5 }], reward: 125 });
  // 10: BOSS WAVE
  waves.push({ enemies: [{ type: 'cheeseWheel', count: 1, spacing: 1 }, { type: 'meatball', count: 15, spacing: 0.4 }], reward: 250, boss: true });
  // 11-15: ramping
  waves.push({ enemies: [{ type: 'olive', count: 12, spacing: 0.65 }], reward: 130 });
  waves.push({ enemies: [{ type: 'basil', count: 9, spacing: 0.7 }, { type: 'anchovy', count: 10, spacing: 0.5 }], reward: 145 });
  waves.push({ enemies: [{ type: 'mozzarella', count: 8, spacing: 0.8 }], reward: 165 });
  waves.push({ enemies: [{ type: 'anchovy', count: 18, spacing: 0.32 }], reward: 175 });
  waves.push({ enemies: [{ type: 'parmesan', count: 5, spacing: 0.95 }, { type: 'basil', count: 10, spacing: 0.5 }], reward: 200 });
  // 16-19: tough
  waves.push({ enemies: [{ type: 'mozzarella', count: 10, spacing: 0.6 }, { type: 'pastaSauce', count: 10, spacing: 0.5 }], reward: 220 });
  waves.push({ enemies: [{ type: 'spicyPepper', count: 7, spacing: 0.75 }, { type: 'anchovy', count: 14, spacing: 0.32 }], reward: 245 });
  waves.push({ enemies: [{ type: 'parmesan', count: 9, spacing: 0.85 }], reward: 270 });
  waves.push({ enemies: [{ type: 'pizza', count: 4, spacing: 1.1 }, { type: 'mozzarella', count: 10, spacing: 0.5 }], reward: 310 });
  // 20: BOSS WAVE
  waves.push({ enemies: [{ type: 'cheeseWheel', count: 2, spacing: 2.0 }, { type: 'tomato', count: 22, spacing: 0.32 }], reward: 450, boss: true });
  // 21-25: hard
  waves.push({ enemies: [{ type: 'spicyPepper', count: 14, spacing: 0.5 }], reward: 330 });
  waves.push({ enemies: [{ type: 'pastaSauce', count: 22, spacing: 0.32 }], reward: 360 });
  waves.push({ enemies: [{ type: 'pizza', count: 8, spacing: 0.85 }, { type: 'spicyPepper', count: 10, spacing: 0.5 }], reward: 400 });
  waves.push({ enemies: [{ type: 'parmesan', count: 13, spacing: 0.6 }, { type: 'anchovy', count: 18, spacing: 0.28 }], reward: 440 });
  waves.push({ enemies: [{ type: 'pizza', count: 13, spacing: 0.75 }], reward: 490 });
  // 26-29: brutal
  waves.push({ enemies: [{ type: 'mozzarella', count: 22, spacing: 0.42 }, { type: 'pastaSauce', count: 18, spacing: 0.32 }], reward: 540 });
  waves.push({ enemies: [{ type: 'pizza', count: 10, spacing: 0.65 }, { type: 'spicyPepper', count: 18, spacing: 0.32 }], reward: 640 });
  waves.push({ enemies: [{ type: 'cheeseWheel', count: 3, spacing: 1.6 }, { type: 'anchovy', count: 28, spacing: 0.22 }], reward: 750, boss: true });
  waves.push({ enemies: [{ type: 'pizza', count: 18, spacing: 0.42 }, { type: 'parmesan', count: 14, spacing: 0.5 }], reward: 850 });
  // 30: FINAL BOSS
  waves.push({
    enemies: [
      { type: 'finalBoss', count: 1, spacing: 0 },
      { type: 'cheeseWheel', count: 3, spacing: 2.5 },
      { type: 'spicyPepper', count: 22, spacing: 0.35 },
      { type: 'mozzarella', count: 22, spacing: 0.35 }
    ],
    reward: 2500, boss: true, final: true
  });
  return waves;
}

const WAVES = generateWaves();
const MAX_WAVES = WAVES.length;

// ============== SKILL TREE ==============
const SKILL_TREE = {
  tomato: {
    name: '🍅 Tomato (Offense)', color: '#d63031',
    nodes: [
      { id: 'dmg1', name: 'Saucier Shots', desc: '+10% tower damage', max: 5, costs: [1,1,2,3,4], effect: { type: 'damageMult', value: 0.10 } },
      { id: 'rate1', name: 'Heat the Stove', desc: '+8% attack speed', max: 5, costs: [1,1,2,3,4], effect: { type: 'fireRateMult', value: 0.08 } },
      { id: 'splash1', name: 'Bigger Pots', desc: '+15% splash radius', max: 3, costs: [2,3,4], effect: { type: 'splashMult', value: 0.15 } },
      { id: 'crit1', name: 'Chef\'s Special', desc: '+5% crit chance (x2 dmg)', max: 4, costs: [2,3,4,5], effect: { type: 'critChance', value: 0.05 } }
    ]
  },
  garlic: {
    name: '🧄 Garlic (Economy)', color: '#ffeaa7',
    nodes: [
      { id: 'gold1', name: 'Loot Drops', desc: '+10% gold from kills', max: 5, costs: [1,1,2,3,4], effect: { type: 'goldMult', value: 0.10 } },
      { id: 'cost1', name: 'Bulk Buying', desc: '-5% tower cost', max: 4, costs: [2,2,3,4], effect: { type: 'costMult', value: -0.05 } },
      { id: 'wave1', name: 'Bigger Tips', desc: '+25% wave reward gold', max: 4, costs: [1,2,3,4], effect: { type: 'waveBonusMult', value: 0.25 } },
      { id: 'interest', name: 'Saver\'s Bonus', desc: '+2% gold per wave', max: 3, costs: [3,4,5], effect: { type: 'interest', value: 0.02 } }
    ]
  },
  basil: {
    name: '🌿 Basil (Defense)', color: '#6ab04c',
    nodes: [
      { id: 'lives1', name: 'Extra Plates', desc: '+5 max lives', max: 4, costs: [1,2,3,4], effect: { type: 'maxLives', value: 5 } },
      { id: 'regen1', name: 'Soup of the Day', desc: '+1 life every 5 waves', max: 3, costs: [2,3,4], effect: { type: 'lifeRegen', value: 1 } },
      { id: 'range1', name: 'Long Arms', desc: '+10% tower range', max: 4, costs: [1,2,3,4], effect: { type: 'rangeMult', value: 0.10 } },
      { id: 'slow1', name: 'Sticky Sauce', desc: 'All enemies -5% speed', max: 4, costs: [2,3,4,5], effect: { type: 'enemySpeedMult', value: -0.05 } }
    ]
  }
};

// ============== PRESTIGE PERKS ==============
const PRESTIGE_PERKS = [
  { id: 'startGold', name: '💰 Starting Cash', desc: '+50 starting gold per level', max: 10, cost: 1, effect: { startGold: 50 } },
  { id: 'globalDmg', name: '⚔️ Permanent Power', desc: '+5% damage per level', max: 20, cost: 1, effect: { damageMult: 0.05 } },
  { id: 'globalGold', name: '🪙 Permanent Profit', desc: '+5% gold gain per level', max: 20, cost: 1, effect: { goldMult: 0.05 } },
  { id: 'startLives', name: '❤️ Bigger Pot', desc: '+2 starting lives per level', max: 10, cost: 1, effect: { startLives: 2 } },
  { id: 'startMarks', name: '🥫 Sauce Stockpile', desc: '+1 starting Marinara Mark per level', max: 10, cost: 2, effect: { startMarks: 1 } },
  { id: 'fastStart', name: '🚀 Pre-Boil', desc: 'All towers unlocked from wave 1', max: 1, cost: 5, effect: { fastStart: true } },
  { id: 'speedBoost', name: '⏩ Faster Cooking', desc: 'Unlock 3x game speed', max: 1, cost: 3, effect: { speed3x: true } },
  { id: 'critBase', name: '💥 Lucky Chef', desc: '+3% global crit chance per level', max: 5, cost: 2, effect: { critBase: 0.03 } }
];

// ============== SAVE FACTORY ==============
function makeDefaultSave() {
  return {
    version: 2,
    username: null,
    sauce: 0,
    prestigeLevel: 0,
    prestigePerks: {},
    totalScore: 0,
    runsCompleted: 0,
    highWave: 0,
    discoveredEnemies: {},  // {enemyId: true}  — bestiary tracking
    tutorialSeen: false,
    settings: { taunts: true, sfx: true }
  };
}

function makeRunState(saveData) {
  const perks = saveData.prestigePerks || {};
  const startGold = 200 + (perks.startGold || 0) * 50;
  const startLives = 20 + (perks.startLives || 0) * 2;
  const startMarks = (perks.startMarks || 0) * 1;
  return {
    gold: startGold,
    lives: startLives,
    maxLives: startLives,
    marks: startMarks,
    wave: 0,
    waveActive: false,
    score: 0,
    skillPoints: {},
    towers: [],
    enemies: [],
    projectiles: [],
    effects: [],
    taunts: [],
    endlessMode: false
  };
}
