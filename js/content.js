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
      "Penne for your thoughts!",
      "You're toast, fettuccine!",
      "Cut the spaghetti talk!",
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
      "Use your noodle!",
      "Bad linguine! BAD!",
      "That's a-spicy meat-no!",
      "Mamma's not impasta-pressed!",
      "Get OFF my marinara!"
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
      "Whisk-y business!",
      "You wanna get beat? Egg-cellent.",
      "Spin cycle activated!",
      "I'm on a roll-ini!",
      "Stay frothy, fettuccine!"
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
      "Pan-demonium!",
      "You're al dente done.",
      "Sizzle, ravioli!",
      "Get fried, farfalle!",
      "That's a-burning sensation!"
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
      "Take a salt-y L!",
      "Season's greetings, gnocchi!",
      "You're getting cured!",
      "Salt in the wound!",
      "Sodium say goodbye!"
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
      "Get char-falled out!",
      "I'm well-pesto with you!",
      "Bake it 'til you make it!",
      "You're absolute pizza work!",
      "Crust-y customer!"
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
      "Pound your pasta!",
      "Tortellini? More like TENDER-ini!",
      "Hammer the lasagna!",
      "Soft pasta, harder problem!",
      "Pound for pound, you lose!"
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
      "Roll out, ravioli!",
      "You're flat-out done!",
      "Pasta got rolled!",
      "Spaghett-ing flat!",
      "Dough-not pass GO!"
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
      "You smell that, fusilli?",
      "Bad pasta hates ME!",
      "Aroma-geddon!",
      "Garlic-bread your tears!",
      "Sniff this, ziti!"
    ]
  }
];

// ============== ENEMIES ==============
// Sentient pasta dishes invading the kitchen!
// `endlessOnly: true` means this enemy NEVER appears in waves 1-30 — only endless mode.
// `kills` and `firstSeenWave` for dex depth tracking.
const ENEMIES = {
  // ------ TIER 1: BASIC PASTA ------
  meatball: {
    name: 'Meatball Marauder', emoji: '🟤', hp: 28, speed: 60, gold: 5, color: '#8b4513',
    lore: 'A defector from the spaghetti dish. Now rolls solo, looking for trouble — and your pantry.',
    strength: 'Numbers', weakness: 'Single hits', tags: ['basic']
  },
  spaghetti: {
    name: 'Spaghetti Squirmer', emoji: '�', hp: 48, speed: 78, gold: 8, color: '#f5d76e',
    lore: 'A noodle so slippery it spawned an idiom. Wriggles past defenses like buttered floss.',
    strength: 'Speed', weakness: 'AOE attacks', tags: ['fast']
  },
  penne: {
    name: 'Penne Punk', emoji: '🍝', hp: 38, speed: 72, gold: 7, color: '#e8b878',
    lore: 'Diagonal-cut delinquent. Each tube is a hollow threat with a sharp attitude.',
    strength: 'Decent stats all around', weakness: 'Pierce', tags: ['basic']
  },
  orzo: {
    name: 'Orzo Outlaw', emoji: '🌾', hp: 18, speed: 105, gold: 6, color: '#f4d294',
    lore: 'Rice-shaped renegades. So tiny you almost feel bad squishing them. Almost.',
    strength: 'Swarm + speed', weakness: 'Splash damage', tags: ['fast', 'basic']
  },

  // ------ TIER 2: STANDARD PASTA ------
  fusilli: {
    name: 'Fusilli Frenzy', emoji: '�', hp: 88, speed: 95, gold: 13, color: '#f1c40f',
    dodge: 0.15,
    lore: 'Corkscrew chaos. Their tight twists let them shimmy past 15% of incoming attacks.',
    strength: '15% dodge chance', weakness: 'Slow + heavy hits', tags: ['fast']
  },
  rigatoni: {
    name: 'Rigatoni Rampager', emoji: '�', hp: 130, speed: 48, gold: 14, color: '#d68a52',
    lore: 'Ridged tube-soldier. The ridges grip sauce — and grudges — equally well.',
    strength: 'Tanky body', weakness: 'Splash damage', tags: ['tank']
  },
  fettuccine: {
    name: 'Fettuccine Fighter', emoji: '🍜', hp: 165, speed: 58, gold: 18, color: '#f5d488',
    lore: 'Flat ribbon brawler. Each bite is wider than the last. Alfredo-coated for extra resistance.',
    strength: 'Balanced HP+Speed', weakness: 'Burst damage', tags: ['tank']
  },
  ravioli: {
    name: 'Ravioli Rumbler', emoji: '🥟', hp: 240, speed: 50, gold: 22, color: '#e0a050',
    lore: 'Plump pillow of pasta packed with mystery filling. Squishy outside, dense inside.',
    strength: 'High HP', weakness: 'Heavy damage', tags: ['tank']
  },
  farfalle: {
    name: 'Farfalle Flier', emoji: '🦋', hp: 110, speed: 110, gold: 19, color: '#f7d774',
    lore: 'Bow-tie pasta with a dapper menace. Flits between defenses like an upscale moth.',
    strength: 'Fast and slim', weakness: 'AOE / Slow', tags: ['fast']
  },
  ziti: {
    name: 'Ziti Zealot', emoji: '�', hp: 195, speed: 55, gold: 24, color: '#daa56a',
    lore: 'Smooth straight tubes. Marches in formation, baked into devotion.',
    strength: 'Durable rank', weakness: 'Single-target burst', tags: ['tank', 'basic']
  },

  // ------ TIER 3: ELITE PASTA ------
  bucatini: {
    name: 'Bucatini Bandit', emoji: '🍝', hp: 270, speed: 88, gold: 32, color: '#e3b97a',
    lore: 'Looks like spaghetti — until you see the secret hollow core. Twice the bite.',
    strength: 'Fast tank', weakness: 'Pierce + Splash', tags: ['fast', 'tank']
  },
  tortellini: {
    name: 'Tortellini Twirler', emoji: '🥟', hp: 200, speed: 105, gold: 30, color: '#e9c389',
    lore: 'Belly-button-shaped. Comes in pairs — kill one and the other gets twice as twirly.',
    strength: 'Pairs spawn', weakness: 'Heavy splash', tags: ['fast']
  },
  gnocchi: {
    name: 'Gnocchi Goon', emoji: '🥔', hp: 420, speed: 38, gold: 38, color: '#f5e6c8',
    lore: 'A potato dumpling with a grudge. Hits the floor harder than your dough rolling.',
    strength: 'Massive HP', weakness: 'Sustained DPS', tags: ['tank']
  },
  angelHair: {
    name: 'Angel Hair Assassin', emoji: '✨', hp: 105, speed: 155, gold: 28, color: '#fff4d6', fast: true,
    lore: 'Whisper-thin and lightning-quick. You blink, it\'s through. Capellini\'s deadlier cousin.',
    strength: 'BLAZING speed', weakness: 'Slow effects', tags: ['fast']
  },
  pappardelle: {
    name: 'Pappardelle Pummeler', emoji: '🍜', hp: 580, speed: 35, gold: 55, color: '#e8b56c',
    lore: 'Wide as a doormat, heavy as a doorstop. Comes at you in slow, devastating waves.',
    strength: 'Huge HP', weakness: 'High DPS', tags: ['tank']
  },
  conchiglie: {
    name: 'Conchiglie Crusher', emoji: '�', hp: 540, speed: 50, gold: 52, armor: 0.3, color: '#e6a878',
    lore: 'Shell pasta with literal armor. Cracks reveal sharp salty bites and ancient resentment.',
    strength: '30% armor', weakness: 'Heavy single hits', tags: ['armor']
  },
  cannelloni: {
    name: 'Cannelloni Cannon', emoji: '🌯', hp: 760, speed: 42, gold: 68, armor: 0.15, color: '#d49a5e',
    scale: 1.15,
    lore: 'Massive stuffed tubes packed with explosive ricotta. Lobs surprise sauce-shells at your tools.',
    strength: 'Big + armored', weakness: 'Pierce + burst', tags: ['armor', 'tank']
  },
  arrabbiata: {
    name: 'Arrabbiata Avenger', emoji: '🌶️', hp: 640, speed: 82, gold: 75, color: '#e74c3c',
    lore: 'Pasta drowning in angry red sauce. The hotter the sauce, the louder the screams.',
    strength: 'Speed + HP', weakness: 'Salt (slow effects)', tags: ['fast', 'tank']
  },
  marinara: {
    name: 'Marinara Mist', emoji: '🩸', hp: 320, speed: 115, gold: 50, color: '#7a1c1c', fast: true,
    lore: 'A semi-corporeal puddle of marinara that learned to walk. Slithers between cracks.',
    strength: 'Speed', weakness: 'AOE splash', tags: ['fast']
  },

  // ------ TIER 4: MINI-BOSSES & BOSSES ------
  radiatori: {
    name: 'Radiatori Reactor', emoji: '⚙️', hp: 2200, speed: 40, gold: 220, armor: 0.25, color: '#e88e3a',
    boss: true, scale: 1.4,
    lore: 'A pasta shaped like a radiator core. Bristling, ridged, and somehow leaking heat.',
    strength: 'Big armored boss', weakness: 'Pierce + DPS', tags: ['boss', 'armor']
  },
  lasagna: {
    name: 'Lasagna Layer', emoji: '🧱', hp: 3400, speed: 30, gold: 320, armor: 0.20, color: '#c9742a',
    boss: true, scale: 1.7,
    lore: 'A multi-layered behemoth bound by béchamel. Every layer is a new HP bar in spirit.',
    strength: 'Massive HP + armor', weakness: 'Sustained DPS', tags: ['boss', 'armor']
  },
  manicotti: {
    name: 'Manicotti Mauler', emoji: '🌯', hp: 1500, speed: 46, gold: 150, armor: 0.20, color: '#d9883a',
    scale: 1.3,
    lore: 'Crepe-wrapped pasta packed with stuffed fury. The mid-game tank you didn\'t want to meet.',
    strength: 'Armor + HP', weakness: 'Pierce + burst', tags: ['armor', 'tank']
  },
  carbonara: {
    name: 'THE CARBONARA CATASTROPHE', emoji: '🍳', hp: 22000, speed: 28, gold: 2200, color: '#f5d76e',
    boss: true, scale: 2.6, armor: 0.4, final: true,
    lore: 'Egg, guanciale, pecorino, pepper — fused into an unholy primordial dish. The kitchen\'s final test.',
    strength: 'EVERYTHING', weakness: 'Throw the entire kitchen sink at it', tags: ['boss', 'armor']
  },

  // ------ ENDLESS-ONLY: never seen in waves 1-30 ------
  gemelli: {
    name: 'Gemelli Twins', emoji: '👯', hp: 180, speed: 92, gold: 24, color: '#f1c984',
    endlessOnly: true, splits: true,
    lore: 'Two braided strands that walk as one. Defeating one releases its twin — same HP, double the fury.',
    strength: 'Splits on death', weakness: 'Splash splash splash', tags: ['fast']
  },
  tagliatelle: {
    name: 'Tagliatelle Terror', emoji: '🍜', hp: 850, speed: 60, gold: 95, color: '#e3a85a',
    endlessOnly: true,
    lore: 'Long flat ribbons that whip through your defenses. Found only in the endless trenches.',
    strength: 'Big + agile', weakness: 'Slow + burst', tags: ['tank']
  },
  orecchiette: {
    name: 'Orecchiette Orblings', emoji: '👂', hp: 70, speed: 130, gold: 12, color: '#f5d29a',
    endlessOnly: true,
    lore: '"Little ears." They hear your tools coming and dodge before you fire.',
    strength: 'Fast swarm', weakness: 'AOE', tags: ['fast', 'basic']
  },
  pastina: {
    name: 'Pastina Particle', emoji: '·', hp: 9, speed: 150, gold: 4, color: '#fff0c8',
    endlessOnly: true, scale: 0.6,
    lore: 'The smallest pasta. Comes in swarms thick enough to clog drains and defenses alike.',
    strength: 'Hyperswarm', weakness: 'AOE', tags: ['fast', 'basic']
  },
  cavatappi: {
    name: 'Cavatappi Corkscrew', emoji: '🌀', hp: 380, speed: 105, gold: 55, dodge: 0.25, color: '#e8a55c',
    endlessOnly: true,
    lore: 'Long hollow corkscrews that spin so fast they bend incoming attacks around them.',
    strength: '25% dodge', weakness: 'Pierce + Slow', tags: ['fast']
  },
  stelline: {
    name: 'Stelline Star-Shooter', emoji: '⭐', hp: 28, speed: 125, gold: 7, color: '#f7d774',
    endlessOnly: true,
    lore: 'Tiny star-shaped pasta. Sharp points, sharper attitude. Comes in constellations.',
    strength: 'Numbers', weakness: 'Anything AOE', tags: ['fast', 'basic']
  },
  pesto: {
    name: 'Pesto Phantom', emoji: '🌿', hp: 720, speed: 90, gold: 110, color: '#27ae60',
    endlessOnly: true, dodge: 0.10,
    lore: 'A possessed mound of basil-pine paste. Smells incredible. Hits harder than it has any right to.',
    strength: 'Speed + dodge', weakness: 'Burst', tags: ['fast', 'tank']
  },
  alfredo: {
    name: 'Alfredo Abomination', emoji: '🥛', hp: 1800, speed: 38, gold: 200, armor: 0.25, color: '#fff4d6',
    endlessOnly: true, boss: true, scale: 1.5,
    lore: 'A creamy white horror. Drips parmesan tears that congeal into permanent stains.',
    strength: 'Bulk + armor', weakness: 'High DPS', tags: ['boss', 'tank']
  }
};

// ============== WAVES ==============
// 30 hand-crafted waves. Enemy introductions deliberately spread out so the
// Pastadex doesn't fill in a single run — new pasta debuts every 2-3 waves,
// with some types ONLY appearing on harder maps or endless mode.
function generateWaves() {
  const waves = [];
  // === ACT I: THE PANTRY (Waves 1-10) ===
  // 1-2: Meatball only
  waves.push({ enemies: [{ type: 'meatball', count: 6, spacing: 0.85 }], reward: 50 });
  waves.push({ enemies: [{ type: 'meatball', count: 10, spacing: 0.7 }], reward: 60 });
  // 3: Introduce SPAGHETTI
  waves.push({ enemies: [{ type: 'meatball', count: 8, spacing: 0.6 }, { type: 'spaghetti', count: 4, spacing: 0.55 }], reward: 70 });
  // 4-5: Mix
  waves.push({ enemies: [{ type: 'meatball', count: 10, spacing: 0.5 }, { type: 'spaghetti', count: 6, spacing: 0.5 }], reward: 85 });
  // 5: Introduce PENNE
  waves.push({ enemies: [{ type: 'penne', count: 10, spacing: 0.55 }, { type: 'spaghetti', count: 5, spacing: 0.5 }], reward: 100 });
  // 6: Introduce ORZO swarm
  waves.push({ enemies: [{ type: 'orzo', count: 18, spacing: 0.35 }, { type: 'meatball', count: 6, spacing: 0.5 }], reward: 115 });
  // 7: Introduce FUSILLI
  waves.push({ enemies: [{ type: 'fusilli', count: 7, spacing: 0.6 }, { type: 'penne', count: 8, spacing: 0.45 }], reward: 135 });
  // 8: Introduce RIGATONI
  waves.push({ enemies: [{ type: 'rigatoni', count: 8, spacing: 0.7 }, { type: 'orzo', count: 12, spacing: 0.35 }], reward: 155 });
  // 9: Mixed assault — no new intro
  waves.push({ enemies: [{ type: 'fusilli', count: 8, spacing: 0.55 }, { type: 'rigatoni', count: 6, spacing: 0.75 }, { type: 'spaghetti', count: 8, spacing: 0.45 }], reward: 175 });
  // 10: FIRST BOSS — RADIATORI REACTOR (introduces a real boss)
  waves.push({ enemies: [{ type: 'radiatori', count: 1, spacing: 1 }, { type: 'meatball', count: 18, spacing: 0.4 }], reward: 280, boss: true });

  // === ACT II: THE FRIDGE (Waves 11-20) ===
  // 11: Introduce FETTUCCINE — no boss, breather wave
  waves.push({ enemies: [{ type: 'fettuccine', count: 9, spacing: 0.7 }, { type: 'orzo', count: 12, spacing: 0.35 }], reward: 165 });
  // 12: Introduce RAVIOLI
  waves.push({ enemies: [{ type: 'ravioli', count: 7, spacing: 0.8 }, { type: 'fusilli', count: 8, spacing: 0.5 }], reward: 180 });
  // 13: Introduce FARFALLE
  waves.push({ enemies: [{ type: 'farfalle', count: 10, spacing: 0.45 }, { type: 'ravioli', count: 4, spacing: 0.85 }], reward: 200 });
  // 14: Mixed
  waves.push({ enemies: [{ type: 'rigatoni', count: 10, spacing: 0.55 }, { type: 'farfalle', count: 10, spacing: 0.4 }], reward: 215 });
  // 15: Introduce ZITI
  waves.push({ enemies: [{ type: 'ziti', count: 11, spacing: 0.65 }, { type: 'fettuccine', count: 7, spacing: 0.55 }], reward: 235 });
  // 16: Introduce BUCATINI
  waves.push({ enemies: [{ type: 'bucatini', count: 9, spacing: 0.65 }, { type: 'farfalle', count: 8, spacing: 0.4 }], reward: 260 });
  // 17: Introduce TORTELLINI (pairs)
  waves.push({ enemies: [{ type: 'tortellini', count: 14, spacing: 0.4 }, { type: 'ziti', count: 7, spacing: 0.65 }], reward: 285 });
  // 18: Introduce GNOCCHI tank
  waves.push({ enemies: [{ type: 'gnocchi', count: 7, spacing: 0.9 }, { type: 'bucatini', count: 8, spacing: 0.55 }], reward: 310 });
  // 19: Introduce ANGEL HAIR speed demons
  waves.push({ enemies: [{ type: 'angelHair', count: 18, spacing: 0.28 }, { type: 'gnocchi', count: 4, spacing: 0.9 }], reward: 340 });
  // 20: SECOND BOSS — LASAGNA LAYER
  waves.push({ enemies: [{ type: 'lasagna', count: 1, spacing: 1 }, { type: 'rigatoni', count: 14, spacing: 0.4 }, { type: 'spaghetti', count: 14, spacing: 0.32 }], reward: 480, boss: true });

  // === ACT III: THE TRATTORIA (Waves 21-30) ===
  // 21: Introduce PAPPARDELLE
  waves.push({ enemies: [{ type: 'pappardelle', count: 7, spacing: 1.0 }, { type: 'angelHair', count: 12, spacing: 0.3 }], reward: 360 });
  // 22: Introduce CONCHIGLIE (armor)
  waves.push({ enemies: [{ type: 'conchiglie', count: 8, spacing: 0.85 }, { type: 'tortellini', count: 12, spacing: 0.4 }], reward: 395 });
  // 23: Introduce MARINARA mist
  waves.push({ enemies: [{ type: 'marinara', count: 20, spacing: 0.32 }, { type: 'conchiglie', count: 4, spacing: 0.9 }], reward: 425 });
  // 24: Introduce CANNELLONI mini-boss
  waves.push({ enemies: [{ type: 'cannelloni', count: 5, spacing: 1.1 }, { type: 'pappardelle', count: 6, spacing: 0.9 }], reward: 460 });
  // 25: Introduce ARRABBIATA
  waves.push({ enemies: [{ type: 'arrabbiata', count: 10, spacing: 0.6 }, { type: 'marinara', count: 14, spacing: 0.32 }], reward: 500 });
  // 26: Introduce MANICOTTI
  waves.push({ enemies: [{ type: 'manicotti', count: 6, spacing: 1.0 }, { type: 'arrabbiata', count: 10, spacing: 0.5 }], reward: 560 });
  // 27: All-out hard mix — no intro
  waves.push({ enemies: [{ type: 'cannelloni', count: 5, spacing: 1.0 }, { type: 'conchiglie', count: 10, spacing: 0.7 }, { type: 'marinara', count: 14, spacing: 0.32 }], reward: 640 });
  // 28: BOSS REMATCH — Radiatori x3
  waves.push({ enemies: [{ type: 'radiatori', count: 3, spacing: 1.6 }, { type: 'angelHair', count: 24, spacing: 0.22 }], reward: 760, boss: true });
  // 29: Pre-final crescendo
  waves.push({ enemies: [{ type: 'manicotti', count: 10, spacing: 0.7 }, { type: 'cannelloni', count: 8, spacing: 0.9 }, { type: 'arrabbiata', count: 14, spacing: 0.4 }], reward: 870 });
  // 30: FINAL BOSS — CARBONARA CATASTROPHE
  waves.push({
    enemies: [
      { type: 'carbonara', count: 1, spacing: 0 },
      { type: 'lasagna', count: 2, spacing: 2.5 },
      { type: 'radiatori', count: 2, spacing: 2.5 },
      { type: 'arrabbiata', count: 22, spacing: 0.35 },
      { type: 'manicotti', count: 8, spacing: 0.9 }
    ],
    reward: 3000, boss: true, final: true
  });
  return waves;
}

// Pool of enemies that can appear in endless mode (waves 31+).
// Mixes regular and endless-only enemies for rotation.
const ENDLESS_POOL = [
  'penne','fusilli','rigatoni','fettuccine','ravioli','farfalle','ziti',
  'bucatini','tortellini','gnocchi','angelHair','pappardelle','conchiglie',
  'cannelloni','arrabbiata','marinara','manicotti',
  // endless-only:
  'gemelli','tagliatelle','orecchiette','pastina','cavatappi','stelline','pesto'
];
const ENDLESS_BOSSES = ['radiatori','lasagna','alfredo'];

const WAVES = generateWaves();
const MAX_WAVES = WAVES.length;

// ============== SKILL TREE (LEGACY 3-BRANCH) ==============
// Kept for save backwards-compat — superseded by RADIAL_SKILL_TREE below.
const LEGACY_SKILL_TREE = {
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

// ============== RADIAL SKILL TREE (5 branches × ~12 nodes = 60 nodes) ==============
// Spider/star layout — each branch occupies a 72° wedge radiating outward from
// a central hub. Nodes have (angle, radius) coordinates within their wedge.
// Prerequisites can be cross-branch for advanced "synergy" nodes.
//   angle: 0-72 within the wedge (0 = clockwise edge, 72 = counter-clockwise edge)
//   radius: 0-100 percent from center to outer rim
const SKILL_TREE = {
  sauce: {
    name: '🍅 Sauce — Offense', color: '#d63031', wedge: [-90, -18],
    nodes: [
      // Inner ring (T1) — entry points
      { id: 'sauce_dmg1', angle: 10, radius: 22, name: 'Saucier Shots', desc: '+7% tower damage', max: 5, costs: [2,3,4,5,7], requires: [], effect: { type: 'damageMult', value: 0.07 } },
      { id: 'sauce_rate1', angle: 36, radius: 22, name: 'Heat the Stove', desc: '+5% attack speed', max: 5, costs: [2,3,4,5,7], requires: [], effect: { type: 'fireRateMult', value: 0.05 } },
      { id: 'sauce_range1', angle: 62, radius: 22, name: 'Long Reach', desc: '+7% tower range', max: 5, costs: [2,3,4,5,7], requires: [], effect: { type: 'rangeMult', value: 0.07 } },
      // T2 (radius 42)
      { id: 'sauce_dmg2', angle: 8, radius: 42, name: 'Power Strike', desc: 'Upgrades grant +6% extra dmg', max: 4, costs: [4,6,8,11], requires: [{ id: 'sauce_dmg1', lvl: 2 }], effect: { type: 'upgradeDmgMult', value: 0.06 } },
      { id: 'sauce_crit1', angle: 22, radius: 42, name: 'Chef\'s Eye', desc: '+3% crit chance', max: 5, costs: [3,5,7,10,13], requires: [{ id: 'sauce_dmg1', lvl: 1 }], effect: { type: 'critChance', value: 0.03 } },
      { id: 'sauce_frenzy', angle: 40, radius: 42, name: 'Kitchen Frenzy', desc: 'On kill, +5% rate for 1.5s (stacks 5x)', max: 3, costs: [5,8,12], requires: [{ id: 'sauce_rate1', lvl: 2 }], effect: { type: 'frenzy', value: 0.05 } },
      { id: 'sauce_splash1', angle: 62, radius: 42, name: 'Bigger Pots', desc: '+10% splash radius', max: 4, costs: [4,6,8,11], requires: [{ id: 'sauce_range1', lvl: 2 }], effect: { type: 'splashMult', value: 0.10 } },
      // T3 (radius 60)
      { id: 'sauce_pierce1', angle: 14, radius: 60, name: 'Skewer Shots', desc: 'Projectiles pierce +1 enemy', max: 3, costs: [10,14,20], requires: [{ id: 'sauce_dmg2', lvl: 1 }], effect: { type: 'pierce', value: 1 } },
      { id: 'sauce_crit2', angle: 28, radius: 60, name: 'Sharp Knives', desc: 'Crits deal +50% extra damage', max: 2, costs: [12,18], requires: [{ id: 'sauce_crit1', lvl: 3 }], effect: { type: 'critMult', value: 0.5 } },
      { id: 'sauce_boss1', angle: 50, radius: 60, name: 'Boss Buster', desc: '+15% damage to bosses', max: 4, costs: [7,10,13,18], requires: [{ id: 'sauce_splash1', lvl: 1 }], effect: { type: 'bossDmgMult', value: 0.15 } },
      // T4 (radius 75)
      { id: 'sauce_multishot', angle: 22, radius: 76, name: 'Double Tap', desc: '8% chance to fire a 2nd shot', max: 3, costs: [12,18,25], requires: [{ id: 'sauce_pierce1', lvl: 1 }, { id: 'sauce_crit2', lvl: 1 }], effect: { type: 'multishot', value: 0.08 } },
      // Keystone (outer rim)
      { id: 'sauce_gordon', angle: 36, radius: 92, name: 'GORDON MODE', desc: 'KEYSTONE — All towers +30% dmg & +20% rate', max: 1, costs: [50], requires: [{ id: 'sauce_multishot', lvl: 1 }, { id: 'sauce_boss1', lvl: 2 }], keystone: true, effect: { type: 'gordon', value: 1 } }
    ]
  },
  basilica: {
    name: '🌿 Basilica — Defense', color: '#27ae60', wedge: [-18, 54],
    nodes: [
      { id: 'def_lives1', angle: 10, radius: 22, name: 'Extra Plates', desc: '+3 max lives', max: 5, costs: [2,3,4,5,7], requires: [], effect: { type: 'maxLives', value: 3 } },
      { id: 'def_slow1', angle: 36, radius: 22, name: 'Sticky Sauce', desc: 'All enemies -3% speed', max: 5, costs: [2,3,4,5,7], requires: [], effect: { type: 'enemySpeedMult', value: -0.03 } },
      { id: 'def_regen1', angle: 62, radius: 22, name: 'Soup of the Day', desc: '+1 life every 4 waves', max: 4, costs: [3,4,5,7], requires: [], effect: { type: 'lifeRegen', value: 1 } },
      { id: 'def_armor1', angle: 12, radius: 42, name: 'Iron Cookware', desc: 'All damage ignores 4% enemy armor', max: 5, costs: [3,5,7,10,13], requires: [{ id: 'def_lives1', lvl: 2 }], effect: { type: 'armorPierce', value: 0.04 } },
      { id: 'def_dodgePierce', angle: 26, radius: 42, name: 'Skewer Twist', desc: 'Dodging enemies still take 25% damage', max: 1, costs: [10], requires: [{ id: 'def_lives1', lvl: 1 }], effect: { type: 'dodgePierce', value: 0.25 } },
      { id: 'def_slowDur', angle: 40, radius: 42, name: 'Frostbite', desc: 'Slow effects last 20% longer', max: 4, costs: [4,6,8,11], requires: [{ id: 'def_slow1', lvl: 2 }], effect: { type: 'slowDurMult', value: 0.2 } },
      { id: 'def_shield', angle: 62, radius: 42, name: 'Last Stand', desc: 'Survive 1 lethal hit per wave', max: 3, costs: [8,12,16], requires: [{ id: 'def_regen1', lvl: 2 }], effect: { type: 'lethalShield', value: 1 } },
      { id: 'def_critPierce', angle: 14, radius: 60, name: 'Weak Spot', desc: 'Crits ignore 100% of armor', max: 1, costs: [18], requires: [{ id: 'def_armor1', lvl: 2 }], effect: { type: 'critArmorPierce', value: 1 } },
      { id: 'def_iceField', angle: 36, radius: 60, name: 'Glacial Field', desc: 'All hits slow by 8% for 1s', max: 1, costs: [20], requires: [{ id: 'def_slowDur', lvl: 2 }], effect: { type: 'globalSlow', value: 0.08 } },
      { id: 'def_thorns', angle: 58, radius: 60, name: 'Sauce Splatter', desc: 'Reflect 20% damage to leaking enemies', max: 3, costs: [8,12,16], requires: [{ id: 'def_shield', lvl: 1 }], effect: { type: 'thorns', value: 0.2 } },
      { id: 'def_resilience', angle: 30, radius: 76, name: 'Sturdy Plates', desc: 'Enemies deal -15% lives damage', max: 2, costs: [12,18], requires: [{ id: 'def_critPierce', lvl: 1 }, { id: 'def_iceField', lvl: 1 }], effect: { type: 'enemyHitMult', value: -0.15 } },
      { id: 'def_grandma', angle: 36, radius: 92, name: 'GRANDMA\'S WRATH', desc: 'KEYSTONE — +25% range, +15 max lives, all slows +20%', max: 1, costs: [50], requires: [{ id: 'def_resilience', lvl: 1 }, { id: 'def_thorns', lvl: 1 }], keystone: true, effect: { type: 'grandma', value: 1 } }
    ]
  },
  pantry: {
    name: '🧄 Pantry — Economy', color: '#ffeaa7', wedge: [54, 126],
    nodes: [
      { id: 'eco_gold1', angle: 10, radius: 22, name: 'Loot Drops', desc: '+7% gold from kills', max: 5, costs: [2,3,4,5,7], requires: [], effect: { type: 'goldMult', value: 0.07 } },
      { id: 'eco_cost1', angle: 36, radius: 22, name: 'Bulk Buying', desc: '-4% tower cost', max: 4, costs: [3,4,5,7], requires: [], effect: { type: 'costMult', value: -0.04 } },
      { id: 'eco_wave1', angle: 62, radius: 22, name: 'Bigger Tips', desc: '+15% wave reward gold', max: 4, costs: [3,4,5,7], requires: [], effect: { type: 'waveBonusMult', value: 0.15 } },
      { id: 'eco_interest', angle: 12, radius: 42, name: 'Compound Interest', desc: '+1.5% of held gold per wave', max: 4, costs: [5,7,10,13], requires: [{ id: 'eco_gold1', lvl: 2 }], effect: { type: 'interest', value: 0.015 } },
      { id: 'eco_earlyBird', angle: 26, radius: 42, name: 'Early Bird', desc: '+15 gold per wave (waves 1-5 only)', max: 3, costs: [4,7,10], requires: [{ id: 'eco_gold1', lvl: 1 }], effect: { type: 'earlyGold', value: 15 } },
      { id: 'eco_sell', angle: 40, radius: 42, name: 'Resale Value', desc: 'Sell refunds 100% (was 70%)', max: 1, costs: [10], requires: [{ id: 'eco_cost1', lvl: 2 }], effect: { type: 'sellFull', value: 1 } },
      { id: 'eco_upg', angle: 62, radius: 42, name: 'Bargain Upgrades', desc: '-10% upgrade cost', max: 3, costs: [5,8,12], requires: [{ id: 'eco_wave1', lvl: 2 }], effect: { type: 'upgradeCostMult', value: -0.1 } },
      { id: 'eco_bounty', angle: 14, radius: 60, name: 'Bounty Hunter', desc: '+40% gold from boss kills', max: 3, costs: [8,12,16], requires: [{ id: 'eco_interest', lvl: 1 }], effect: { type: 'bossGold', value: 0.4 } },
      { id: 'eco_tip', angle: 36, radius: 60, name: 'Tip Jar', desc: '+4 passive gold per wave', max: 4, costs: [7,10,13,16], requires: [{ id: 'eco_sell', lvl: 1 }], effect: { type: 'passiveGold', value: 4 } },
      { id: 'eco_mark1', angle: 58, radius: 60, name: 'Mark Collector', desc: '+1 Marinara Mark per 10 waves', max: 3, costs: [10,14,18], requires: [{ id: 'eco_upg', lvl: 1 }], effect: { type: 'extraMarks', value: 1 } },
      { id: 'eco_streak', angle: 30, radius: 76, name: 'Kill Streak', desc: 'Every 10 kills in a row → +5 gold burst', max: 3, costs: [10,14,18], requires: [{ id: 'eco_bounty', lvl: 1 }, { id: 'eco_tip', lvl: 1 }], effect: { type: 'killStreak', value: 5 } },
      { id: 'eco_golden', angle: 36, radius: 92, name: 'GOLDEN AGE', desc: 'KEYSTONE — +30% all gold, +1 mark every wave', max: 1, costs: [55], requires: [{ id: 'eco_streak', lvl: 1 }, { id: 'eco_mark1', lvl: 1 }], keystone: true, effect: { type: 'goldenAge', value: 1 } }
    ]
  },
  hearth: {
    name: '🔥 Hearth — Tempo', color: '#ff7675', wedge: [126, 198],
    nodes: [
      { id: 'tmp_rate1', angle: 10, radius: 22, name: 'Quick Fingers', desc: '+5% fire rate', max: 5, costs: [2,3,4,5,7], requires: [], effect: { type: 'fireRateMult', value: 0.05 } },
      { id: 'tmp_speed1', angle: 36, radius: 22, name: 'Open Flame', desc: '+5% projectile speed', max: 4, costs: [2,3,4,5], requires: [], effect: { type: 'projSpeedMult', value: 0.05 } },
      { id: 'tmp_warmup', angle: 62, radius: 22, name: 'Warm Pans', desc: 'First shot of each tower lands instantly', max: 1, costs: [4], requires: [], effect: { type: 'warmup', value: 1 } },
      { id: 'tmp_rate2', angle: 14, radius: 42, name: 'Cooking Speed', desc: '+8% fire rate', max: 4, costs: [5,7,10,13], requires: [{ id: 'tmp_rate1', lvl: 2 }], effect: { type: 'fireRateMult', value: 0.08 } },
      { id: 'tmp_burst', angle: 28, radius: 42, name: 'Burst Cook', desc: 'First 3 shots of each wave +50% dmg', max: 2, costs: [8,12], requires: [{ id: 'tmp_speed1', lvl: 2 }], effect: { type: 'burstShots', value: 3 } },
      { id: 'tmp_combo', angle: 50, radius: 42, name: 'Combo Heat', desc: 'Each kill: +1% next-shot dmg (max 50%, resets on miss)', max: 1, costs: [12], requires: [{ id: 'tmp_warmup', lvl: 1 }], effect: { type: 'comboHeat', value: 0.01 } },
      { id: 'tmp_flame', angle: 14, radius: 60, name: 'Lingering Flame', desc: 'Hits apply 8% dmg/sec for 2s', max: 3, costs: [9,13,18], requires: [{ id: 'tmp_rate2', lvl: 1 }], effect: { type: 'dotDamage', value: 0.08 } },
      { id: 'tmp_ricochet', angle: 36, radius: 60, name: 'Ricochet', desc: 'Projectiles bounce to nearby enemy (10% chance)', max: 3, costs: [10,15,20], requires: [{ id: 'tmp_burst', lvl: 1 }], effect: { type: 'ricochet', value: 0.10 } },
      { id: 'tmp_speedX', angle: 58, radius: 60, name: 'Unlock 5×', desc: 'Unlock 5× game speed permanently', max: 1, costs: [15], requires: [{ id: 'tmp_combo', lvl: 1 }], effect: { type: 'speed5x', value: 1 } },
      { id: 'tmp_multistrike', angle: 24, radius: 76, name: 'Multistrike', desc: '15% chance to fire +1 extra shot', max: 2, costs: [14,20], requires: [{ id: 'tmp_flame', lvl: 1 }, { id: 'tmp_ricochet', lvl: 1 }], effect: { type: 'multishot', value: 0.15 } },
      { id: 'tmp_fury', angle: 36, radius: 92, name: 'FURY MODE', desc: 'KEYSTONE — Fire rate doubles while below 50% lives', max: 1, costs: [50], requires: [{ id: 'tmp_multistrike', lvl: 1 }, { id: 'tmp_speedX', lvl: 1 }], keystone: true, effect: { type: 'fury', value: 1 } }
    ]
  },
  forgia: {
    name: '⚙️ Forgia — Mastery', color: '#9b59b6', wedge: [198, 270],
    nodes: [
      // Per-tower-type specialization (uses 'towerBonus_<id>' effect, key auto-applied in computeStat)
      { id: 'frg_knife', angle: 10, radius: 22, name: 'Knife Mastery', desc: 'Knife Block +12% damage', max: 5, costs: [2,3,4,5,7], requires: [], effect: { type: 'towerBonus_spaghetti', value: 0.12 } },
      { id: 'frg_spoon', angle: 36, radius: 22, name: 'Spoon Mastery', desc: 'Wooden Spoon +12% splash', max: 5, costs: [2,3,4,5,7], requires: [], effect: { type: 'towerSplashBonus_penne', value: 0.12 } },
      { id: 'frg_whisk', angle: 62, radius: 22, name: 'Whisk Mastery', desc: 'Whisk +15% fire rate', max: 4, costs: [3,5,7,10], requires: [], effect: { type: 'towerRateBonus_fusilli', value: 0.15 } },
      { id: 'frg_pan', angle: 14, radius: 42, name: 'Pan Mastery', desc: 'Frying Pan +15% damage', max: 4, costs: [4,6,8,11], requires: [{ id: 'frg_knife', lvl: 2 }], effect: { type: 'towerBonus_ravioli', value: 0.15 } },
      { id: 'frg_salt', angle: 28, radius: 42, name: 'Salt Mastery', desc: 'Salt Shaker +20% slow strength', max: 3, costs: [5,8,12], requires: [{ id: 'frg_spoon', lvl: 1 }], effect: { type: 'towerSlowBonus_tortellini', value: 0.2 } },
      { id: 'frg_oven', angle: 40, radius: 42, name: 'Oven Mastery', desc: 'Pizza Oven beam +25% damage', max: 3, costs: [6,10,14], requires: [{ id: 'frg_whisk', lvl: 1 }], effect: { type: 'towerBonus_linguine', value: 0.25 } },
      { id: 'frg_hammer', angle: 62, radius: 42, name: 'Tenderizer Mastery', desc: 'Tenderizer +20% fire rate', max: 3, costs: [5,8,12], requires: [{ id: 'frg_whisk', lvl: 2 }], effect: { type: 'towerRateBonus_macaroni', value: 0.2 } },
      { id: 'frg_pin', angle: 14, radius: 60, name: 'Rolling Pin Mastery', desc: 'Rolling Pin +30% damage', max: 3, costs: [10,14,18], requires: [{ id: 'frg_pan', lvl: 1 }], effect: { type: 'towerBonus_gnocchi', value: 0.3 } },
      { id: 'frg_press', angle: 36, radius: 60, name: 'Garlic Press Mastery', desc: 'Garlic Press aura range +25%', max: 3, costs: [9,13,18], requires: [{ id: 'frg_salt', lvl: 1 }], effect: { type: 'towerRangeBonus_lasagna', value: 0.25 } },
      { id: 'frg_synergy', angle: 58, radius: 60, name: 'Kitchen Synergy', desc: 'Towers within 100px share +10% damage', max: 3, costs: [10,15,22], requires: [{ id: 'frg_oven', lvl: 1 }], effect: { type: 'adjacencyBonus', value: 0.10 } },
      { id: 'frg_overdrive', angle: 30, radius: 76, name: 'Overdrive', desc: 'Every 7th shot of any tower deals +300% dmg', max: 1, costs: [25], requires: [{ id: 'frg_pin', lvl: 1 }, { id: 'frg_synergy', lvl: 1 }], effect: { type: 'overdrive', value: 3.0 } },
      { id: 'frg_maestro', angle: 36, radius: 92, name: 'MAESTRO', desc: 'KEYSTONE — All "Mastery" nodes are 2× more effective', max: 1, costs: [55], requires: [{ id: 'frg_overdrive', lvl: 1 }], keystone: true, effect: { type: 'maestro', value: 1 } }
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
    enemyKills: {},         // {enemyId: count} — per-enemy kill counters for dex depth
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
