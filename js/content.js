/* ============== PASTA TD CONTENT ============== */
// THEME: Pasta has invaded your kitchen! Defend with kitchen tools.
// Towers = kitchen utensils; Enemies = sentient pasta dishes.

// ============== MAPS ==============
// Path waypoints in cell coords. Canvas is 20 cols x 15 rows (800x600 / 40).
// Each map has difficulty, gold/score modifiers, and unlock requirements.
const MAPS = [
  {
    id: 'kitchen',
    name: 'The Kitchen',
    emoji: '🍳',
    difficulty: 'Easy',
    diffStars: 1,
    desc: 'A spacious counter with one gentle curve. Perfect for first-time chefs.',
    color: '#d4a574',
    bgColor: '#3d2418',
    path: [[0, 7], [6, 7], [6, 3], [14, 3], [14, 11], [19, 11]],
    unlockHighWave: 0,
    mods: { gold: 1.0, score: 1.0, lives: 0, enemyHp: 1.0, enemySpeed: 1.0, startGold: 0 }
  },
  {
    id: 'pizzeria',
    name: 'Pizzeria Patio',
    emoji: '🍕',
    difficulty: 'Medium',
    diffStars: 2,
    desc: 'A pizza joint with checkerboard tiles. Tighter corners, +15% gold.',
    color: '#e74c3c',
    bgColor: '#4a1a1a',
    path: [[0, 2], [5, 2], [5, 6], [10, 6], [10, 2], [15, 2], [15, 10], [4, 10], [4, 13], [19, 13]],
    unlockHighWave: 5,
    mods: { gold: 1.15, score: 1.2, lives: 0, enemyHp: 1.0, enemySpeed: 1.0, startGold: 0 }
  },
  {
    id: 'garden',
    name: 'Herb Garden',
    emoji: '🌿',
    difficulty: 'Hard',
    diffStars: 3,
    desc: 'A winding garden path. Long route — pasta has plenty of time to charge. -5 starting lives, +30% gold.',
    color: '#27ae60',
    bgColor: '#1a3d1a',
    path: [[0, 1], [3, 1], [3, 5], [7, 5], [7, 1], [11, 1], [11, 8], [3, 8], [3, 13], [12, 13], [12, 11], [16, 11], [16, 5], [19, 5]],
    unlockHighWave: 12,
    mods: { gold: 1.3, score: 1.5, lives: -5, enemyHp: 1.0, enemySpeed: 1.0, startGold: 50 }
  },
  {
    id: 'factory',
    name: 'Pasta Factory',
    emoji: '🏭',
    difficulty: 'Expert',
    diffStars: 4,
    desc: 'Pasta production line! Long S-curve, tougher enemies, +50% gold.',
    color: '#7f8c8d',
    bgColor: '#1a2a2e',
    path: [[0, 13], [4, 13], [4, 2], [9, 2], [9, 13], [14, 13], [14, 2], [19, 2]],
    unlockHighWave: 20,
    mods: { gold: 1.5, score: 2.0, lives: -8, enemyHp: 1.15, enemySpeed: 1.05, startGold: 100 }
  },
  {
    id: 'trattoria',
    name: 'The Trattoria',
    emoji: '🍝',
    difficulty: 'Master',
    diffStars: 5,
    desc: 'The infamous boss maze. Brutal turns, fast enemies, +75% gold for the brave.',
    color: '#c0392b',
    bgColor: '#2a1010',
    path: [[0, 2], [4, 2], [4, 6], [10, 6], [10, 2], [14, 2], [14, 10], [6, 10], [6, 13], [16, 13], [16, 5], [19, 5], [19, 14]],
    unlockHighWave: 28,
    mods: { gold: 1.75, score: 3.0, lives: -10, enemyHp: 1.25, enemySpeed: 1.15, startGold: 150 }
  }
];

const TOWERS = [
  {
    id: 'spaghetti', // keeping old id for save compat
    name: 'Knife Block Knight',
    emoji: '🔪',
    desc: 'Long-range single-target. The kitchen\'s most reliable defender.',
    lore: 'A trained set of cutlery, each blade sworn to protect the pantry. Especially effective against soft pasta.',
    cost: 60,
    damage: 24,
    range: 220,
    fireRate: 1.3,
    projectileSpeed: 650,
    projectile: '🗡',
    projKind: 'blade',
    color: '#dfe6e9',
    unlockWave: 1,
    upgrades: {
      damage: { increment: 18, cost: 50, max: 5 },
      range: { increment: 30, cost: 50, max: 4 },
      fireRate: { increment: 0.4, cost: 65, max: 4 }
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
    cost: 95,
    damage: 16,
    range: 140,
    fireRate: 1.1,
    projectileSpeed: 380,
    splash: 55,
    projectile: '💢',
    projKind: 'bonk',
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
    cost: 85,
    damage: 8,
    range: 145,
    fireRate: 4.5,
    projectileSpeed: 520,
    projectile: '✦',
    projKind: 'whisk',
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
    projKind: 'ember',
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
    cost: 90,
    damage: 5,
    range: 170,
    fireRate: 1.8,
    projectileSpeed: 480,
    slow: { factor: 0.5, duration: 2.2 },
    projectile: '⋅',
    projKind: 'salt',
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
    projKind: 'bash',
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
    projKind: 'pin',
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
  waves.push({ enemies: [{ type: 'meatball', count: 6, spacing: 0.85 }], reward: 50 });
  waves.push({ enemies: [{ type: 'meatball', count: 10, spacing: 0.7 }], reward: 60 });
  waves.push({ enemies: [{ type: 'meatball', count: 8, spacing: 0.55 }, { type: 'pepperoni', count: 4, spacing: 0.55 }], reward: 70 });
  // 4-6: introduce variety
  waves.push({ enemies: [{ type: 'tomato', count: 6, spacing: 0.7 }, { type: 'pepperoni', count: 6, spacing: 0.45 }], reward: 85 });
  waves.push({ enemies: [{ type: 'garlic', count: 10, spacing: 0.5 }, { type: 'tomato', count: 5, spacing: 0.7 }], reward: 100 });
  waves.push({ enemies: [{ type: 'pepperoni', count: 14, spacing: 0.38 }], reward: 115 });
  // 7-9: heat up
  waves.push({ enemies: [{ type: 'tomato', count: 8, spacing: 0.6 }, { type: 'garlic', count: 10, spacing: 0.45 }], reward: 135 });
  waves.push({ enemies: [{ type: 'olive', count: 7, spacing: 0.85 }, { type: 'pepperoni', count: 10, spacing: 0.4 }], reward: 155 });
  waves.push({ enemies: [{ type: 'basil', count: 7, spacing: 0.85 }, { type: 'anchovy', count: 6, spacing: 0.5 }], reward: 175 });
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
// 3 branches x 10 nodes each = 30 nodes, with prerequisites and tiered costs.
// Layout: tier (row 1-4) and col (0-2), keystone is tier 4 col 1.
// `requires` is array of {id, lvl} for prerequisite nodes.
const SKILL_TREE = {
  tomato: {
    name: '🍅 Tomato — Offense', color: '#d63031',
    nodes: [
      // Tier 1 (foundation)
      { id: 'dmg1', tier: 1, col: 0, name: 'Saucier Shots', desc: '+8% tower damage', max: 5, costs: [2,3,4,5,7], requires: [], effect: { type: 'damageMult', value: 0.08 } },
      { id: 'rate1', tier: 1, col: 1, name: 'Heat the Stove', desc: '+6% attack speed', max: 5, costs: [2,3,4,5,7], requires: [], effect: { type: 'fireRateMult', value: 0.06 } },
      { id: 'range1', tier: 1, col: 2, name: 'Long Reach', desc: '+8% tower range', max: 5, costs: [2,3,4,5,7], requires: [], effect: { type: 'rangeMult', value: 0.08 } },
      // Tier 2 (require T1 lvl 2+)
      { id: 'dmg2', tier: 2, col: 0, name: 'Power Strike', desc: 'Upgrades grant +6% extra dmg', max: 4, costs: [4,6,8,11], requires: [{ id: 'dmg1', lvl: 2 }], effect: { type: 'upgradeDmgMult', value: 0.06 } },
      { id: 'rate2', tier: 2, col: 1, name: 'Frenzy', desc: 'After a kill, +5% rate for 1.5s (stacks 5x)', max: 3, costs: [5,8,12], requires: [{ id: 'rate1', lvl: 2 }], effect: { type: 'frenzy', value: 0.05 } },
      { id: 'splash1', tier: 2, col: 2, name: 'Bigger Pots', desc: '+12% splash radius', max: 4, costs: [4,6,8,11], requires: [{ id: 'range1', lvl: 2 }], effect: { type: 'splashMult', value: 0.12 } },
      // Tier 3 (require T2 lvl 1+)
      { id: 'crit1', tier: 3, col: 0, name: 'Chef\'s Special', desc: '+4% crit chance (x2 dmg)', max: 5, costs: [6,9,12,15,18], requires: [{ id: 'dmg2', lvl: 1 }], effect: { type: 'critChance', value: 0.04 } },
      { id: 'pierce1', tier: 3, col: 1, name: 'Skewer Shots', desc: 'Projectiles pierce +1 enemy', max: 3, costs: [10,14,20], requires: [{ id: 'rate2', lvl: 1 }], effect: { type: 'pierce', value: 1 } },
      { id: 'boss1', tier: 3, col: 2, name: 'Boss Buster', desc: '+18% damage to bosses', max: 4, costs: [7,10,13,18], requires: [{ id: 'splash1', lvl: 1 }], effect: { type: 'bossDmgMult', value: 0.18 } },
      // Tier 4 keystone (require any 2 T3 lvl 2+)
      { id: 'gordon', tier: 4, col: 1, name: 'GORDON MODE', desc: 'KEYSTONE — All towers +30% dmg & +20% rate', max: 1, costs: [45], requires: [{ id: 'crit1', lvl: 2 }, { id: 'boss1', lvl: 2 }], keystone: true, effect: { type: 'gordon', value: 1 } }
    ]
  },
  basil: {
    name: '🌿 Basil — Defense', color: '#6ab04c',
    nodes: [
      // Tier 1
      { id: 'lives1', tier: 1, col: 0, name: 'Extra Plates', desc: '+4 max lives', max: 5, costs: [2,3,4,5,7], requires: [], effect: { type: 'maxLives', value: 4 } },
      { id: 'slow1', tier: 1, col: 1, name: 'Sticky Sauce', desc: 'All enemies -4% speed', max: 5, costs: [2,3,4,5,7], requires: [], effect: { type: 'enemySpeedMult', value: -0.04 } },
      { id: 'regen1', tier: 1, col: 2, name: 'Soup of the Day', desc: '+1 life every 4 waves', max: 4, costs: [3,4,5,7], requires: [], effect: { type: 'lifeRegen', value: 1 } },
      // Tier 2
      { id: 'armor1', tier: 2, col: 0, name: 'Iron Cookware', desc: 'All damage ignores 5% enemy armor', max: 4, costs: [4,6,9,12], requires: [{ id: 'lives1', lvl: 2 }], effect: { type: 'armorPierce', value: 0.05 } },
      { id: 'slowDur', tier: 2, col: 1, name: 'Frostbite', desc: 'Slow effects last 25% longer', max: 4, costs: [5,7,10,13], requires: [{ id: 'slow1', lvl: 2 }], effect: { type: 'slowDurMult', value: 0.25 } },
      { id: 'shieldOnce', tier: 2, col: 2, name: 'Last Stand', desc: 'Survive 1 lethal hit per wave', max: 3, costs: [8,12,16], requires: [{ id: 'regen1', lvl: 2 }], effect: { type: 'lethalShield', value: 1 } },
      // Tier 3
      { id: 'critPierce', tier: 3, col: 0, name: 'Weak Spot', desc: 'Crits ignore 100% of armor', max: 1, costs: [18], requires: [{ id: 'armor1', lvl: 1 }], effect: { type: 'critArmorPierce', value: 1 } },
      { id: 'iceField', tier: 3, col: 1, name: 'Glacial Field', desc: 'All hits slow target by 8% for 1s', max: 1, costs: [20], requires: [{ id: 'slowDur', lvl: 1 }], effect: { type: 'globalSlow', value: 0.08 } },
      { id: 'thorns', tier: 3, col: 2, name: 'Sauce Splatter', desc: 'Damage attackers reflect 25%', max: 3, costs: [10,14,18], requires: [{ id: 'shieldOnce', lvl: 1 }], effect: { type: 'thorns', value: 0.25 } },
      // Tier 4 keystone
      { id: 'grandma', tier: 4, col: 1, name: 'GRANDMA\'S WRATH', desc: 'KEYSTONE — +25% range, +15 max lives, all slows +20%', max: 1, costs: [45], requires: [{ id: 'critPierce', lvl: 1 }, { id: 'thorns', lvl: 1 }], keystone: true, effect: { type: 'grandma', value: 1 } }
    ]
  },
  garlic: {
    name: '🧄 Garlic — Economy', color: '#ffeaa7',
    nodes: [
      // Tier 1
      { id: 'gold1', tier: 1, col: 0, name: 'Loot Drops', desc: '+8% gold from kills', max: 5, costs: [2,3,4,5,7], requires: [], effect: { type: 'goldMult', value: 0.08 } },
      { id: 'cost1', tier: 1, col: 1, name: 'Bulk Buying', desc: '-4% tower cost', max: 4, costs: [3,4,5,7], requires: [], effect: { type: 'costMult', value: -0.04 } },
      { id: 'wave1', tier: 1, col: 2, name: 'Bigger Tips', desc: '+18% wave reward gold', max: 4, costs: [3,4,5,7], requires: [], effect: { type: 'waveBonusMult', value: 0.18 } },
      // Tier 2
      { id: 'interest', tier: 2, col: 0, name: 'Compound Interest', desc: '+2% of held gold per wave', max: 4, costs: [5,7,10,13], requires: [{ id: 'gold1', lvl: 2 }], effect: { type: 'interest', value: 0.02 } },
      { id: 'sell1', tier: 2, col: 1, name: 'Resale Value', desc: 'Sell refunds 100% (was 70%)', max: 1, costs: [10], requires: [{ id: 'cost1', lvl: 2 }], effect: { type: 'sellFull', value: 1 } },
      { id: 'upgCost', tier: 2, col: 2, name: 'Bargain Upgrades', desc: '-10% upgrade cost', max: 3, costs: [5,8,12], requires: [{ id: 'wave1', lvl: 2 }], effect: { type: 'upgradeCostMult', value: -0.10 } },
      // Tier 3
      { id: 'bountyHunter', tier: 3, col: 0, name: 'Bounty Hunter', desc: '+50% gold from boss kills', max: 3, costs: [8,12,16], requires: [{ id: 'interest', lvl: 1 }], effect: { type: 'bossGold', value: 0.50 } },
      { id: 'tipJar', tier: 3, col: 1, name: 'Tip Jar', desc: 'Passive: +5 gold per wave', max: 4, costs: [7,10,13,16], requires: [{ id: 'sell1', lvl: 1 }], effect: { type: 'passiveGold', value: 5 } },
      { id: 'mark1', tier: 3, col: 2, name: 'Mark Collector', desc: '+1 Marinara Mark per 10 waves', max: 3, costs: [10,14,18], requires: [{ id: 'upgCost', lvl: 1 }], effect: { type: 'extraMarks', value: 1 } },
      // Tier 4 keystone
      { id: 'goldenAge', tier: 4, col: 1, name: 'GOLDEN AGE', desc: 'KEYSTONE — +30% all gold, +1 mark every wave', max: 1, costs: [50], requires: [{ id: 'bountyHunter', lvl: 1 }, { id: 'mark1', lvl: 1 }], keystone: true, effect: { type: 'goldenAge', value: 1 } }
    ]
  }
};

// ============== PRESTIGE PERKS ==============
// Permanent meta-progression. Costs scale per level (cost * (lvl+1)).
const PRESTIGE_PERKS = [
  // ECONOMY
  { id: 'startGold',   category: 'eco', name: '💰 Starting Cash',     desc: '+50 starting gold',                    max: 10, cost: 1, effect: { startGold: 50 } },
  { id: 'globalGold',  category: 'eco', name: '🪙 Permanent Profit',  desc: '+5% gold gain (all sources)',          max: 20, cost: 1, effect: { goldMult: 0.05 } },
  { id: 'sellRefund',  category: 'eco', name: '♻️ Smart Selling',     desc: 'Sell refund +5% (caps at 100%)',       max: 6,  cost: 2, effect: { sellBonus: 0.05 } },
  { id: 'startMarks',  category: 'eco', name: '🥫 Sauce Stockpile',   desc: '+1 starting Marinara Mark',            max: 10, cost: 2, effect: { startMarks: 1 } },
  { id: 'marksBoost',  category: 'eco', name: '🍷 Marinara Vintage',  desc: '+10% Marinara Marks earned',           max: 5,  cost: 3, effect: { markGain: 0.10 } },
  // OFFENSE
  { id: 'globalDmg',   category: 'atk', name: '⚔️ Permanent Power',   desc: '+5% damage',                            max: 20, cost: 1, effect: { damageMult: 0.05 } },
  { id: 'critBase',    category: 'atk', name: '💥 Lucky Chef',        desc: '+3% global crit chance',                max: 5,  cost: 2, effect: { critBase: 0.03 } },
  { id: 'globalRate',  category: 'atk', name: '🔥 Quick Fingers',     desc: '+3% attack speed',                      max: 10, cost: 2, effect: { fireRateMult: 0.03 } },
  { id: 'globalRange', category: 'atk', name: '🎯 Eagle Eye',         desc: '+3% range',                             max: 10, cost: 2, effect: { rangeMult: 0.03 } },
  { id: 'firstStrike', category: 'atk', name: '⚡ First Strike',      desc: 'First shot of each wave is x3 dmg',    max: 1,  cost: 8, effect: { firstStrike: 1 } },
  // DEFENSE
  { id: 'startLives',  category: 'def', name: '❤️ Bigger Pot',        desc: '+2 starting lives',                     max: 10, cost: 1, effect: { startLives: 2 } },
  { id: 'enemySlow',   category: 'def', name: '🐌 Heavy Air',          desc: 'All enemies -2% speed',                 max: 8,  cost: 2, effect: { enemySpdMult: -0.02 } },
  { id: 'enemyDmg',    category: 'def', name: '🛡️ Tougher Plates',    desc: 'Enemies deal -10% lives damage at goal', max: 5, cost: 3, effect: { enemyHitMult: -0.10 } },
  // QOL & UNLOCKS
  { id: 'fastStart',   category: 'qol', name: '🚀 Pre-Boil',           desc: 'All towers unlocked from wave 1',       max: 1,  cost: 5, effect: { fastStart: true } },
  { id: 'speedBoost',  category: 'qol', name: '⏩ Faster Cooking',     desc: 'Unlock 3x game speed',                   max: 1,  cost: 3, effect: { speed3x: true } },
  { id: 'extraSpeed',  category: 'qol', name: '� Hyper Speed',        desc: 'Unlock 5x game speed (req 3x)',          max: 1,  cost: 8, effect: { speed5x: true } },
  { id: 'autoWave',    category: 'qol', name: '🤖 Auto-Wave',          desc: 'Waves auto-start after 8 seconds',      max: 1,  cost: 6, effect: { autoWave: true } }
];

// ============== SAVE FACTORY ==============
function makeDefaultSave() {
  return {
    version: 3,
    username: null,
    sauce: 0,
    prestigeLevel: 0,
    prestigePerks: {},
    totalScore: 0,
    runsCompleted: 0,
    highWave: 0,
    discoveredEnemies: {},  // {enemyId: true}  — Pastadex tracking
    discoveredTowers: {},   // {towerId: true}  — Pastadex tools tracking
    selectedMap: 'kitchen',
    mapHighWaves: {},       // {mapId: highestWave}
    tutorialSeen: false,
    settings: { taunts: true, sfx: true }
  };
}

function makeRunState(saveData, mapDef) {
  const perks = saveData.prestigePerks || {};
  const mods = (mapDef && mapDef.mods) || { gold: 1, score: 1, lives: 0, enemyHp: 1, enemySpeed: 1, startGold: 0 };
  const startGold = 200 + (perks.startGold || 0) * 50 + (mods.startGold || 0);
  const startLives = Math.max(5, 20 + (perks.startLives || 0) * 2 + (mods.lives || 0));
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
    endlessMode: false,
    mapId: (mapDef && mapDef.id) || saveData.selectedMap || 'kitchen',
    mods: mods
  };
}
