/* ============== PASTA TD CONTENT ============== */
// All towers, enemies, waves, skill tree, prestige data.

const TOWERS = [
  {
    id: 'spaghetti',
    name: 'Spaghetti Sniper',
    emoji: '🍝',
    desc: 'Long noodles, long range. Single-target high damage.',
    cost: 75,
    damage: 25,
    range: 220,
    fireRate: 1.2, // shots per second
    projectileSpeed: 600,
    projectile: '•',
    color: '#f5d76e',
    unlockWave: 1,
    upgrades: {
      damage: { increment: 18, cost: 60, max: 5 },
      range: { increment: 30, cost: 50, max: 4 },
      fireRate: { increment: 0.4, cost: 70, max: 4 }
    }
  },
  {
    id: 'penne',
    name: 'Penne Pummeler',
    emoji: '🪈', // pipe-like
    desc: 'Tubular toughness. Medium AOE splash damage.',
    cost: 120,
    damage: 14,
    range: 130,
    fireRate: 1.0,
    projectileSpeed: 380,
    splash: 45,
    projectile: '◯',
    color: '#e67e22',
    unlockWave: 2,
    upgrades: {
      damage: { increment: 10, cost: 80, max: 5 },
      range: { increment: 20, cost: 60, max: 4 },
      splash: { increment: 15, cost: 70, max: 4 }
    }
  },
  {
    id: 'fusilli',
    name: 'Fusilli Flinger',
    emoji: '🌀',
    desc: 'Spiraling spurts! Super fast attack speed.',
    cost: 90,
    damage: 8,
    range: 150,
    fireRate: 4.0,
    projectileSpeed: 500,
    projectile: '※',
    color: '#f39c12',
    unlockWave: 3,
    upgrades: {
      damage: { increment: 6, cost: 70, max: 5 },
      fireRate: { increment: 1.2, cost: 90, max: 4 },
      range: { increment: 25, cost: 60, max: 4 }
    }
  },
  {
    id: 'ravioli',
    name: 'Ravioli Rocket',
    emoji: '🥟',
    desc: 'Stuffed with explosives. Huge AOE damage.',
    cost: 200,
    damage: 50,
    range: 180,
    fireRate: 0.5,
    projectileSpeed: 320,
    splash: 80,
    projectile: '★',
    color: '#d63031',
    unlockWave: 5,
    upgrades: {
      damage: { increment: 30, cost: 130, max: 5 },
      splash: { increment: 25, cost: 100, max: 4 },
      fireRate: { increment: 0.25, cost: 150, max: 4 }
    }
  },
  {
    id: 'tortellini',
    name: 'Tortellini Twister',
    emoji: '🌪️',
    desc: 'Dizzies enemies — slows by 50% for 2s.',
    cost: 110,
    damage: 5,
    range: 160,
    fireRate: 1.5,
    projectileSpeed: 450,
    slow: { factor: 0.5, duration: 2.0 },
    projectile: '〰',
    color: '#9b59b6',
    unlockWave: 4,
    upgrades: {
      slowFactor: { increment: 0.1, cost: 80, max: 3 }, // increases slow strength
      slowDuration: { increment: 0.5, cost: 70, max: 4 },
      range: { increment: 25, cost: 50, max: 4 }
    }
  },
  {
    id: 'linguine',
    name: 'Linguine Laser',
    emoji: '⚡',
    desc: 'Continuous laser beam — pierces all in line!',
    cost: 250,
    damage: 12, // damage per tick (10 ticks/sec)
    range: 200,
    fireRate: 10.0, // continuous beam
    pierce: true,
    color: '#ff6b6b',
    unlockWave: 8,
    upgrades: {
      damage: { increment: 8, cost: 140, max: 5 },
      range: { increment: 30, cost: 100, max: 4 },
      fireRate: { increment: 3, cost: 130, max: 3 }
    }
  },
  {
    id: 'macaroni',
    name: 'Macaroni Machine Gun',
    emoji: '🔫',
    desc: 'Rapid-fire cheesy chaos. Many tiny bullets.',
    cost: 160,
    damage: 5,
    range: 140,
    fireRate: 6.0,
    projectileSpeed: 700,
    projectile: '·',
    color: '#f1c40f',
    unlockWave: 6,
    upgrades: {
      damage: { increment: 4, cost: 90, max: 5 },
      fireRate: { increment: 1.5, cost: 110, max: 4 },
      range: { increment: 20, cost: 70, max: 4 }
    }
  },
  {
    id: 'gnocchi',
    name: 'Gnocchi Cannon',
    emoji: '💣',
    desc: 'Heavy potato dumplings. Massive single-shot damage.',
    cost: 300,
    damage: 120,
    range: 250,
    fireRate: 0.3,
    projectileSpeed: 380,
    splash: 50,
    projectile: '●',
    color: '#7f8c8d',
    unlockWave: 10,
    upgrades: {
      damage: { increment: 70, cost: 180, max: 5 },
      range: { increment: 35, cost: 130, max: 4 },
      splash: { increment: 20, cost: 120, max: 3 }
    }
  },
  {
    id: 'lasagna',
    name: 'Lasagna Layered Defense',
    emoji: '🟫',
    desc: 'Boosts adjacent towers damage by +25%.',
    cost: 180,
    damage: 0,
    range: 90, // boost range
    fireRate: 0,
    aura: 0.25,
    color: '#c0392b',
    unlockWave: 7,
    upgrades: {
      aura: { increment: 0.15, cost: 130, max: 4 },
      range: { increment: 20, cost: 90, max: 4 }
    }
  }
];

// Enemies (waves use these)
const ENEMIES = {
  meatball: {
    name: 'Meatball Minion', emoji: '🟤', hp: 30, speed: 60, gold: 5, color: '#8b4513'
  },
  tomato: {
    name: 'Tomato Tank', emoji: '🍅', hp: 80, speed: 40, gold: 10, color: '#d63031'
  },
  garlic: {
    name: 'Garlic Ghoul', emoji: '🧄', hp: 50, speed: 75, gold: 8, color: '#ecf0f1'
  },
  pepperoni: {
    name: 'Pepperoni Pest', emoji: '🔴', hp: 25, speed: 95, gold: 7, color: '#b33939'
  },
  olive: {
    name: 'Olive Oligarch', emoji: '🫒', hp: 150, speed: 50, gold: 18, color: '#4a5d23'
  },
  basil: {
    name: 'Basil Brute', emoji: '🌿', hp: 200, speed: 55, gold: 22, color: '#27ae60'
  },
  mozzarella: {
    name: 'Mozzarella Monster', emoji: '⚪', hp: 350, speed: 45, gold: 35, color: '#fff5e6'
  },
  anchovy: {
    name: 'Anchovy Assassin', emoji: '🐟', hp: 90, speed: 140, gold: 25, color: '#5d6d7e',
    fast: true
  },
  parmesan: {
    name: 'Parmesan Predator', emoji: '🟡', hp: 500, speed: 50, gold: 50, armor: 0.3, color: '#f39c12'
  },
  cheeseWheel: {
    name: 'Cheese Wheel BOSS', emoji: '🧀', hp: 3000, speed: 35, gold: 250, color: '#f1c40f',
    boss: true, scale: 1.8
  },
  spicyPepper: {
    name: 'Spicy Pepper', emoji: '🌶️', hp: 600, speed: 80, gold: 70, color: '#ff4444'
  },
  pizza: {
    name: 'Pizza Pizzaiolo', emoji: '🍕', hp: 1200, speed: 45, gold: 120, armor: 0.2, color: '#e67e22',
    scale: 1.3
  },
  pastaSauce: {
    name: 'Sauce Specter', emoji: '🩸', hp: 250, speed: 110, gold: 40, color: '#7a1c1c', fast: true
  },
  finalBoss: {
    name: 'THE BIG MEATBALL', emoji: '🍖', hp: 15000, speed: 28, gold: 1500, color: '#5d2e0f',
    boss: true, scale: 2.5, armor: 0.4
  }
};

// Generate waves - 30 waves, scaling difficulty
function generateWaves() {
  const waves = [];
  // Wave format: { enemies: [{type, count, spacing}], reward (bonus gold) }
  // Wave 1-3: tutorial
  waves.push({ enemies: [{ type: 'meatball', count: 8, spacing: 0.8 }], reward: 30 });
  waves.push({ enemies: [{ type: 'meatball', count: 12, spacing: 0.7 }], reward: 35 });
  waves.push({ enemies: [{ type: 'meatball', count: 10, spacing: 0.5 }, { type: 'pepperoni', count: 5, spacing: 0.6 }], reward: 40 });
  // 4-6: introduce variety
  waves.push({ enemies: [{ type: 'tomato', count: 8, spacing: 0.7 }, { type: 'pepperoni', count: 6, spacing: 0.5 }], reward: 50 });
  waves.push({ enemies: [{ type: 'garlic', count: 12, spacing: 0.5 }, { type: 'tomato', count: 6, spacing: 0.7 }], reward: 60 });
  waves.push({ enemies: [{ type: 'pepperoni', count: 15, spacing: 0.4 }], reward: 70 });
  // 7-9: heat up
  waves.push({ enemies: [{ type: 'tomato', count: 10, spacing: 0.6 }, { type: 'garlic', count: 10, spacing: 0.5 }], reward: 80 });
  waves.push({ enemies: [{ type: 'olive', count: 8, spacing: 0.8 }, { type: 'pepperoni', count: 10, spacing: 0.4 }], reward: 90 });
  waves.push({ enemies: [{ type: 'basil', count: 8, spacing: 0.8 }, { type: 'anchovy', count: 6, spacing: 0.5 }], reward: 100 });
  // 10: BOSS
  waves.push({ enemies: [{ type: 'cheeseWheel', count: 1, spacing: 1 }, { type: 'meatball', count: 15, spacing: 0.4 }], reward: 200, boss: true });
  // 11-15: ramping
  waves.push({ enemies: [{ type: 'olive', count: 14, spacing: 0.6 }], reward: 110 });
  waves.push({ enemies: [{ type: 'basil', count: 10, spacing: 0.7 }, { type: 'anchovy', count: 10, spacing: 0.5 }], reward: 120 });
  waves.push({ enemies: [{ type: 'mozzarella', count: 10, spacing: 0.8 }], reward: 140 });
  waves.push({ enemies: [{ type: 'anchovy', count: 20, spacing: 0.3 }], reward: 150 });
  waves.push({ enemies: [{ type: 'parmesan', count: 6, spacing: 0.9 }, { type: 'basil', count: 10, spacing: 0.5 }], reward: 180 });
  // 16-19: tough
  waves.push({ enemies: [{ type: 'mozzarella', count: 12, spacing: 0.6 }, { type: 'pastaSauce', count: 10, spacing: 0.5 }], reward: 200 });
  waves.push({ enemies: [{ type: 'spicyPepper', count: 8, spacing: 0.7 }, { type: 'anchovy', count: 15, spacing: 0.3 }], reward: 220 });
  waves.push({ enemies: [{ type: 'parmesan', count: 10, spacing: 0.8 }], reward: 240 });
  waves.push({ enemies: [{ type: 'pizza', count: 5, spacing: 1.0 }, { type: 'mozzarella', count: 10, spacing: 0.5 }], reward: 280 });
  // 20: BOSS
  waves.push({ enemies: [{ type: 'cheeseWheel', count: 2, spacing: 2.0 }, { type: 'tomato', count: 25, spacing: 0.3 }], reward: 400, boss: true });
  // 21-25: hard
  waves.push({ enemies: [{ type: 'spicyPepper', count: 15, spacing: 0.5 }], reward: 300 });
  waves.push({ enemies: [{ type: 'pastaSauce', count: 25, spacing: 0.3 }], reward: 320 });
  waves.push({ enemies: [{ type: 'pizza', count: 10, spacing: 0.8 }, { type: 'spicyPepper', count: 12, spacing: 0.5 }], reward: 360 });
  waves.push({ enemies: [{ type: 'parmesan', count: 15, spacing: 0.6 }, { type: 'anchovy', count: 20, spacing: 0.25 }], reward: 400 });
  waves.push({ enemies: [{ type: 'pizza', count: 15, spacing: 0.7 }], reward: 450 });
  // 26-29: brutal
  waves.push({ enemies: [{ type: 'mozzarella', count: 25, spacing: 0.4 }, { type: 'pastaSauce', count: 20, spacing: 0.3 }], reward: 500 });
  waves.push({ enemies: [{ type: 'pizza', count: 12, spacing: 0.6 }, { type: 'spicyPepper', count: 20, spacing: 0.3 }], reward: 600 });
  waves.push({ enemies: [{ type: 'cheeseWheel', count: 3, spacing: 1.5 }, { type: 'anchovy', count: 30, spacing: 0.2 }], reward: 700, boss: true });
  waves.push({ enemies: [{ type: 'pizza', count: 20, spacing: 0.4 }, { type: 'parmesan', count: 15, spacing: 0.5 }], reward: 800 });
  // 30: FINAL BOSS
  waves.push({
    enemies: [
      { type: 'finalBoss', count: 1, spacing: 0 },
      { type: 'cheeseWheel', count: 4, spacing: 2.0 },
      { type: 'spicyPepper', count: 30, spacing: 0.3 },
      { type: 'mozzarella', count: 30, spacing: 0.3 }
    ],
    reward: 2000, boss: true, final: true
  });
  return waves;
}

const WAVES = generateWaves();
const MAX_WAVES = WAVES.length;

// Skill tree - 3 branches
const SKILL_TREE = {
  tomato: {
    name: '🍅 Tomato (Offense)', color: '#d63031',
    nodes: [
      { id: 'dmg1', name: 'Saucier Shots', desc: '+10% tower damage', max: 5, costs: [1,1,2,3,4], effect: { type: 'damageMult', value: 0.10 } },
      { id: 'rate1', name: 'Heat the Stove', desc: '+8% attack speed', max: 5, costs: [1,1,2,3,4], effect: { type: 'fireRateMult', value: 0.08 } },
      { id: 'splash1', name: 'Bigger Pots', desc: '+15% splash radius', max: 3, costs: [2,3,4], effect: { type: 'splashMult', value: 0.15 } },
      { id: 'crit1', name: 'Chef\'s Special', desc: '+5% crit chance (x2 damage)', max: 4, costs: [2,3,4,5], effect: { type: 'critChance', value: 0.05 } }
    ]
  },
  garlic: {
    name: '🧄 Garlic (Economy)', color: '#f5d76e',
    nodes: [
      { id: 'gold1', name: 'Loot Drops', desc: '+10% gold from kills', max: 5, costs: [1,1,2,3,4], effect: { type: 'goldMult', value: 0.10 } },
      { id: 'cost1', name: 'Bulk Buying', desc: '-5% tower cost', max: 4, costs: [2,2,3,4], effect: { type: 'costMult', value: -0.05 } },
      { id: 'wave1', name: 'Bigger Tips', desc: '+25% wave reward gold', max: 4, costs: [1,2,3,4], effect: { type: 'waveBonusMult', value: 0.25 } },
      { id: 'interest', name: 'Saver\'s Bonus', desc: '+2% gold per wave (compound)', max: 3, costs: [3,4,5], effect: { type: 'interest', value: 0.02 } }
    ]
  },
  basil: {
    name: '🌿 Basil (Defense)', color: '#6ab04c',
    nodes: [
      { id: 'lives1', name: 'Extra Bowls', desc: '+5 max lives', max: 4, costs: [1,2,3,4], effect: { type: 'maxLives', value: 5 } },
      { id: 'regen1', name: 'Pasta Heal', desc: '+1 life every 5 waves', max: 3, costs: [2,3,4], effect: { type: 'lifeRegen', value: 1 } },
      { id: 'range1', name: 'Long Noodles', desc: '+10% tower range', max: 4, costs: [1,2,3,4], effect: { type: 'rangeMult', value: 0.10 } },
      { id: 'slow1', name: 'Sticky Sauce', desc: 'All enemies -5% speed', max: 4, costs: [2,3,4,5], effect: { type: 'enemySpeedMult', value: -0.05 } }
    ]
  }
};

// Prestige Perks (permanent across runs)
const PRESTIGE_PERKS = [
  { id: 'startGold', name: '💰 Starting Cash', desc: '+50 starting gold per level', max: 10, cost: 1, effect: { startGold: 50 } },
  { id: 'globalDmg', name: '⚔️ Permanent Power', desc: '+5% damage per level', max: 20, cost: 1, effect: { damageMult: 0.05 } },
  { id: 'globalGold', name: '🪙 Permanent Profit', desc: '+5% gold gain per level', max: 20, cost: 1, effect: { goldMult: 0.05 } },
  { id: 'startLives', name: '❤️ Bigger Pot', desc: '+2 starting lives per level', max: 10, cost: 1, effect: { startLives: 2 } },
  { id: 'startMarks', name: '🥫 Sauce Stockpile', desc: '+1 starting Marinara Mark per level', max: 10, cost: 2, effect: { startMarks: 1 } },
  { id: 'fastStart', name: '🚀 Pre-Boil', desc: 'First 3 towers unlocked from start', max: 1, cost: 5, effect: { fastStart: true } },
  { id: 'speedBoost', name: '⏩ Faster Cooking', desc: 'Unlock 3x game speed', max: 1, cost: 3, effect: { speed3x: true } },
  { id: 'critBase', name: '💥 Lucky Chef', desc: '+3% global crit chance per level', max: 5, cost: 2, effect: { critBase: 0.03 } }
];

// Default save state factory
function makeDefaultSave() {
  return {
    version: 1,
    username: null,
    sauce: 0,           // prestige currency
    prestigeLevel: 0,
    prestigePerks: {},  // {id: level}
    totalScore: 0,
    runsCompleted: 0,
    highWave: 0
  };
}

// New run state
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
    wave: 0, // current wave index, increments when starting
    waveActive: false,
    score: 0,
    skillPoints: {}, // {nodeId: level}
    towers: [],     // placed towers
    enemies: [],
    projectiles: [],
    effects: [],    // visual fx
    endlessMode: false
  };
}
