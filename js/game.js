/* ============== PASTA TD MAIN GAME ENGINE ============== */
// Canvas-based tower defense engine with emoji sprites.

const Game = {
  canvas: null,
  ctx: null,
  state: null,
  save: null,
  path: [],          // waypoints [{x,y}]
  pathSegments: [],  // [{x1,y1,x2,y2,len}]
  pathTotalLen: 0,
  buildGrid: [],     // 2D grid: 0=empty, 1=path, 2=tower
  cellSize: 40,
  cols: 0,
  rows: 0,
  selectedTowerType: null,
  selectedTower: null,
  hoverCell: null,
  paused: false,
  speedMult: 1,
  spawnQueue: [],
  spawnTimer: 0,
  lastSaveTime: 0,
  audioCtx: null,
  bossAlive: false,
  endlessWave: 0,
  tauntTimer: 0,
  introQueue: [],
  pendingNewRun: false,

  init() {
    this.canvas = document.getElementById('game');
    this.ctx = this.canvas.getContext('2d');
    this.cols = Math.floor(this.canvas.width / this.cellSize);
    this.rows = Math.floor(this.canvas.height / this.cellSize);
    this.generatePath();

    // Input (mouse)
    this.canvas.addEventListener('mousemove', e => this.onMouseMove(e));
    this.canvas.addEventListener('click', e => this.onClick(e));
    this.canvas.addEventListener('mouseleave', () => { this.hoverCell = null; });
    // Input (touch) — translate to mousemove/click semantics
    this.canvas.addEventListener('touchstart', e => {
      if (e.touches.length !== 1) return;
      e.preventDefault();
      const t = e.touches[0];
      this.onMouseMove({ clientX: t.clientX, clientY: t.clientY });
    }, { passive: false });
    this.canvas.addEventListener('touchmove', e => {
      if (e.touches.length !== 1) return;
      e.preventDefault();
      const t = e.touches[0];
      this.onMouseMove({ clientX: t.clientX, clientY: t.clientY });
    }, { passive: false });
    this.canvas.addEventListener('touchend', e => {
      e.preventDefault();
      const t = e.changedTouches[0];
      if (t) this.onClick({ clientX: t.clientX, clientY: t.clientY });
    }, { passive: false });

    // Buttons
    UI.el.btnStartWave.addEventListener('click', () => this.startWave());
    UI.el.btnPause.addEventListener('click', () => this.togglePause());
    UI.el.btnSpeed.addEventListener('click', () => this.cycleSpeed());
    UI.el.btnRestart.addEventListener('click', () => {
      UI.el.gameOverModal.classList.remove('visible');
      this.newRun(true, { clearLastRun: true });
    });
    UI.el.btnPrestigeFromGO.addEventListener('click', () => {
      UI.el.gameOverModal.classList.remove('visible');
      this.doPrestige();
    });
    UI.el.btnVictoryPrestige.addEventListener('click', () => {
      UI.el.victoryModal.classList.remove('visible');
      this.doPrestige();
    });
    UI.el.btnVictoryEndless.addEventListener('click', () => {
      UI.el.victoryModal.classList.remove('visible');
      this.state.endlessMode = true;
      UI.toast('♾️ Endless Mode Engaged!');
      this.startWave();
    });

    // Keyboard
    document.addEventListener('keydown', e => {
      if (!UI.el.gameScreen.classList.contains('visible')) return;
      if (document.activeElement && document.activeElement.tagName === 'INPUT') return;
      if (e.key === ' ' || e.key === 'p') { e.preventDefault(); this.togglePause(); }
      if (e.key === 'Escape') { this.deselectAll(); }
      if (e.key === 'Enter') { if (!this.state.waveActive) this.startWave(); }
      if (/^[1-9]$/.test(e.key)) {
        const idx = parseInt(e.key, 10) - 1;
        if (TOWERS[idx]) {
          const t = TOWERS[idx];
          const perks = this.save.prestigePerks || {};
          if (perks.fastStart || (this.state.wave + 1) >= t.unlockWave) {
            this.selectTowerType(t);
          }
        }
      }
    });

    // Save periodically
    setInterval(() => this.saveGame(), 15000);
    window.addEventListener('beforeunload', () => this.saveGame());
  },

  start() {
    this.save = SaveSystem.load();
    this.newRun(true);
    if (!this.running) {
      this.running = true;
      requestAnimationFrame(this.loop.bind(this));
    }
  },

  stop() {
    this.running = false;
  },

  newRun(firstStart, opts) {
    opts = opts || {};
    // Regenerate path for selected map before computing state
    this.generatePath();
    const mapDef = this.getCurrentMap();
    this.state = makeRunState(this.save, mapDef);
    // Per-wave trackers
    this.state.lethalShieldsLeft = 0;
    this.state.firstStrikeUsed = false;
    this.selectedTowerType = null;
    this.selectedTower = null;
    this.spawnQueue = [];
    this.bossAlive = false;
    this.endlessWave = 0;
    this.introQueue = [];
    this.buildGrid = Array.from({ length: this.rows }, () => new Array(this.cols).fill(0));
    this.markPathOnGrid();
    // Only clear stored run if requested (after game over or prestige)
    if (opts.clearLastRun && this.save) { this.save.lastRun = null; this.saveGame(); }
    UI.hideUpgradePanel();
    UI.renderTowerShop();
    UI.renderWavePreview();
    UI.updateStats(this.state);
    UI.renderPowersBar();
    UI.setFooter('Pick a kitchen tool and place it. Hit Start Wave when ready!');
    if (firstStart) UI.banner('Get cooking! 🍝', 1500);
    UI.el.btnStartWave.disabled = false;
    UI.el.btnStartWave.textContent = '▶ Start Wave 1';
    // EPIC: Show hero select on fresh runs (unless a hero is already chosen)
    if (firstStart && !this.state.heroId) {
      setTimeout(() => UI.showHeroSelect(), 250);
    }
  },

  // ============ PATH GENERATION ============
  getCurrentMap() {
    const id = (this.save && this.save.selectedMap) || 'kitchen';
    return MAPS.find(m => m.id === id) || MAPS[0];
  },
  generatePath() {
    const cs = this.cellSize;
    const map = this.getCurrentMap();
    const pts = map.path;
    this.currentMap = map;
    // Translate cell coords to pixel centers
    this.path = pts.map(([cx, cy]) => ({ x: cx * cs + cs / 2, y: cy * cs + cs / 2 }));
    // Build segments
    this.pathSegments = [];
    this.pathTotalLen = 0;
    for (let i = 0; i < this.path.length - 1; i++) {
      const a = this.path[i], b = this.path[i + 1];
      const dx = b.x - a.x, dy = b.y - a.y;
      const len = Math.hypot(dx, dy);
      this.pathSegments.push({ x1: a.x, y1: a.y, x2: b.x, y2: b.y, len, dx: dx/len, dy: dy/len });
      this.pathTotalLen += len;
    }
  },
  switchMap(mapId) {
    if (this.save) {
      this.save.selectedMap = mapId;
      SaveSystem.save(this.save);
    }
    this.generatePath();
    if (this.state) {
      this.buildGrid = Array.from({ length: this.rows }, () => new Array(this.cols).fill(0));
      this.markPathOnGrid();
    }
  },
  markPathOnGrid() {
    // Mark all cells covered by path lines as 'path' (1)
    for (const seg of this.pathSegments) {
      const steps = Math.ceil(seg.len / 5);
      for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        const px = seg.x1 + (seg.x2 - seg.x1) * t;
        const py = seg.y1 + (seg.y2 - seg.y1) * t;
        const cx = Math.floor(px / this.cellSize);
        const cy = Math.floor(py / this.cellSize);
        // Mark 3x3 cells around path for visual width
        for (let dx = -1; dx <= 1; dx++) {
          for (let dy = -1; dy <= 1; dy++) {
            const x = cx + dx, y = cy + dy;
            if (x >= 0 && x < this.cols && y >= 0 && y < this.rows) {
              // Only mark direct cells (1-cell wide path block)
              if (Math.abs(dx) + Math.abs(dy) <= 1) {
                this.buildGrid[y][x] = 1;
              }
            }
          }
        }
      }
    }
  },

  // ============ TOWERS ============
  makeTower(def, x, y) {
    return {
      def,
      x, y,
      upgrades: { damage: 0, range: 0, fireRate: 0, splash: 0, slowFactor: 0, slowDuration: 0, aura: 0 },
      fireCooldown: 0,
      kills: 0,
      totalSpent: Math.floor(def.cost * Game.computeStat('costMult', 1)),
      target: null,
      laserTarget: null, // for linguine
      targetMode: 'first', // first | last | strong | close | weak
      getDamage() {
        const base = this.def.damage + (this.upgrades.damage || 0) * (this.def.upgrades.damage?.increment || 0);
        const auraBoost = Game.computeAuraBoost(this);
        let skill = Game.computeStat('damageMult', 1) * (1 + auraBoost);
        // Power Strike: +6% damage per total upgrade level on this tower
        const totalUpgrades = Object.values(this.upgrades).reduce((a,b)=>a+b, 0);
        skill += Game.computeStat('upgradeDmgMult', 0) * totalUpgrades;
        const perk = 1 + (Game.save.prestigePerks.globalDmg || 0) * 0.05;
        return base * skill * perk;
      },
      getRange() {
        const base = this.def.range + (this.upgrades.range || 0) * (this.def.upgrades.range?.increment || 0);
        let mult = Game.computeStat('rangeMult', 1);
        mult *= 1 + (Game.save.prestigePerks.globalRange || 0) * 0.03;
        return base * mult;
      },
      getFireRate() {
        const base = this.def.fireRate + (this.upgrades.fireRate || 0) * (this.def.upgrades.fireRate?.increment || 0);
        let mult = Game.computeStat('fireRateMult', 1);
        // Frenzy stacks (skill rate2)
        const now = performance.now()/1000;
        if (this.frenzyUntil && now < this.frenzyUntil) {
          const stacks = this.frenzyStacks || 0;
          const frenzyVal = Game.computeStat('frenzy', 0);
          mult += frenzyVal * stacks;
        } else if (this.frenzyStacks) {
          this.frenzyStacks = 0;
        }
        mult *= 1 + (Game.save.prestigePerks.globalRate || 0) * 0.03;
        return base * mult;
      },
      getSplash() {
        if (!this.def.splash) return 0;
        const base = this.def.splash + (this.upgrades.splash || 0) * (this.def.upgrades.splash?.increment || 0);
        return base * Game.computeStat('splashMult', 1);
      },
      getSlowFactor() {
        if (!this.def.slow) return 0;
        return Math.min(0.9, this.def.slow.factor + (this.upgrades.slowFactor || 0) * (this.def.upgrades.slowFactor?.increment || 0));
      },
      getSlowDuration() {
        if (!this.def.slow) return 0;
        const base = this.def.slow.duration + (this.upgrades.slowDuration || 0) * (this.def.upgrades.slowDuration?.increment || 0);
        // Frostbite skill + Grandma's slow boost
        const durMult = 1 + Game.computeStat('slowDurMult', 0);
        return base * durMult;
      },
      getAura() {
        if (!this.def.aura) return 0;
        return this.def.aura + (this.upgrades.aura || 0) * (this.def.upgrades.aura?.increment || 0);
      }
    };
  },

  selectTowerType(t) {
    this.selectedTowerType = t;
    this.selectedTower = null;
    UI.hideUpgradePanel();
    UI.showTowerInfo(t);
    UI.renderTowerShop();
  },
  deselectAll() {
    this.selectedTowerType = null;
    this.selectedTower = null;
    UI.hideUpgradePanel();
    UI.renderTowerShop();
  },

  upgradeTower(tower, key) {
    const upDef = tower.def.upgrades[key];
    if (!upDef) return;
    const lvl = tower.upgrades[key] || 0;
    if (lvl >= upDef.max) return;
    // Bargain Upgrades skill reduces upgrade cost
    const upgMult = 1 + this.computeStat('upgradeCostMult', 0);
    const cost = Math.floor(upDef.cost * Math.pow(1.5, lvl) * Math.max(0.3, upgMult));
    if (this.state.gold < cost) { UI.toast('Not enough gold!'); return; }
    this.state.gold -= cost;
    tower.upgrades[key] = lvl + 1;
    tower.totalSpent += cost;
    this.playSound('upgrade');
    UI.showUpgradePanel(tower);
    UI.updateStats(this.state);
    UI.renderTowerShop();
  },

  setTargetMode(tower, mode) {
    const modes = ['first', 'last', 'strong', 'weak', 'close'];
    if (!modes.includes(mode)) return;
    tower.targetMode = mode;
    UI.showUpgradePanel(tower);
    this.playSound('upgrade');
  },

  sellTower(tower) {
    // Base 70% + prestige sellRefund 5% per level + skill sellFull
    let pct = 0.7 + (this.save.prestigePerks.sellRefund || 0) * 0.05;
    if (this.state.skillPoints && this.state.skillPoints.sell1) pct = 1.0;
    pct = Math.min(1.0, pct);
    const refund = Math.floor(tower.totalSpent * pct);
    this.state.gold += refund;
    const idx = this.state.towers.indexOf(tower);
    if (idx >= 0) this.state.towers.splice(idx, 1);
    // Free grid
    const cx = Math.floor(tower.x / this.cellSize);
    const cy = Math.floor(tower.y / this.cellSize);
    if (this.buildGrid[cy] && this.buildGrid[cy][cx] === 2) this.buildGrid[cy][cx] = 0;
    this.selectedTower = null;
    UI.hideUpgradePanel();
    UI.updateStats(this.state);
    UI.renderTowerShop();
    this.playSound('sell');
    UI.toast('💰 Sold for ' + refund + ' gold');
  },

  // ============ HEROES ============
  makeHero(heroDef, x, y) {
    const hero = {
      def: { // Minimal "def" shape compatible with renderer/upgrade panel
        id: heroDef.id,
        name: heroDef.name,
        emoji: heroDef.emoji,
        desc: heroDef.desc,
        color: heroDef.color,
        cost: 0,
        damage: heroDef.damage,
        range: heroDef.range,
        fireRate: heroDef.fireRate,
        projectileSpeed: heroDef.projectileSpeed,
        projectile: heroDef.projectile || '•',
        projKind: heroDef.projKind || '_default',
        splash: heroDef.splash || 0,
        upgrades: {},
        taunts: [],
      },
      x, y,
      isHero: true,
      heroDef: heroDef,
      level: 1,
      xp: 0,
      xpNext: 100,
      ability: heroDef.ability,
      abilityReadyAt: 0,
      // Active ability state
      flambeUntil: 0,
      precisionTarget: null,
      precisionShotsLeft: 0,
      upgrades: { damage: 0, range: 0, fireRate: 0, splash: 0, slowFactor: 0, slowDuration: 0, aura: 0 },
      fireCooldown: 0,
      kills: 0,
      totalSpent: 0,
      target: null,
      laserTarget: null,
      targetMode: 'first',
      canSeeStealth: !!heroDef.canSeeStealth,
      getDamage() {
        const base = this.heroDef.damage * (1 + this.heroDef.levelDmg * (this.level - 1));
        let mult = Game.computeStat('damageMult', 1);
        // Flambe: triple rate but base dmg unchanged
        // Power Strike doesn't apply to heroes (no purchased upgrades)
        const perk = 1 + (Game.save.prestigePerks.globalDmg || 0) * 0.05;
        return base * mult * perk;
      },
      getRange() {
        const base = this.heroDef.range * (1 + this.heroDef.levelRange * (this.level - 1));
        let mult = Game.computeStat('rangeMult', 1);
        mult *= 1 + (Game.save.prestigePerks.globalRange || 0) * 0.03;
        return base * mult;
      },
      getFireRate() {
        let base = this.heroDef.fireRate * (1 + this.heroDef.levelRate * (this.level - 1));
        let mult = Game.computeStat('fireRateMult', 1);
        // Flambe: x3 rate
        if (this.flambeUntil && performance.now()/1000 < this.flambeUntil) mult *= 3;
        mult *= 1 + (Game.save.prestigePerks.globalRate || 0) * 0.03;
        return base * mult;
      },
      getSplash() {
        if (!this.heroDef.splash) return 0;
        return this.heroDef.splash * Game.computeStat('splashMult', 1);
      },
      getSlowFactor() { return 0; },
      getSlowDuration() { return 0; },
      getAura() { return 0; },
    };
    return hero;
  },

  selectHero(heroId) {
    if (!this.state) return;
    this.state.heroId = heroId;
    this.state.heroPlaced = false;
    const heroDef = HEROES.find(h => h.id === heroId);
    if (!heroDef) return;
    // Pretend selection like a tower for placement
    this.selectedTowerType = {
      id: heroDef.id,
      name: heroDef.name,
      emoji: heroDef.emoji,
      cost: 0,
      range: heroDef.range,
      color: heroDef.color,
      _isHeroPick: true,
      _heroDef: heroDef,
    };
    UI.toast(`Placing ${heroDef.emoji} ${heroDef.name} — click a tile!`);
  },

  placeHero(cx, cy) {
    if (!this.state || this.state.heroPlaced) return false;
    if (!this.state.heroId) return false;
    const heroDef = HEROES.find(h => h.id === this.state.heroId);
    if (!heroDef) return false;
    if (this.buildGrid[cy] && this.buildGrid[cy][cx] !== 0) return false;
    const x = cx * this.cellSize + this.cellSize / 2;
    const y = cy * this.cellSize + this.cellSize / 2;
    const hero = this.makeHero(heroDef, x, y);
    this.state.towers.push(hero);
    this.buildGrid[cy][cx] = 2;
    this.state.heroPlaced = true;
    this.selectedTowerType = null;
    this.playSound('upgrade');
    UI.toast(`${heroDef.emoji} ${heroDef.name} joins the kitchen!`);
    UI.renderTowerShop();
    UI.updateStats(this.state);
    return true;
  },

  awardXP(hero, amount) {
    if (!hero || !hero.isHero) return;
    hero.xp += amount;
    while (hero.xp >= hero.xpNext && hero.level < 20) {
      hero.xp -= hero.xpNext;
      hero.level++;
      hero.xpNext = Math.floor(hero.xpNext * 1.45);
      this.state.effects.push({ kind: 'text', text: `LEVEL ${hero.level}!`, x: hero.x, y: hero.y - 30, life: 1.5, vy: -28, color: '#ffd700' });
      this.playSound('upgrade');
      if (this.selectedTower === hero) UI.showUpgradePanel(hero);
    }
  },

  triggerHeroAbility(hero) {
    if (!hero || !hero.isHero || !hero.ability) return;
    const now = performance.now() / 1000;
    if (now < (hero.abilityReadyAt || 0)) { UI.toast('Ability on cooldown!'); return; }
    if (hero.level < (hero.ability.unlockLevel || 1)) {
      UI.toast(`Unlocks at Hero Lv ${hero.ability.unlockLevel}`);
      return;
    }
    const abId = hero.ability.id;
    const heroDef = hero.heroDef;
    if (abId === 'rolling_pin') {
      const dmg = hero.getDamage() * 3;
      let hits = 0;
      for (const e of this.state.enemies) {
        if (e._dead || e.hp <= 0) continue;
        this.damageEnemy(e, dmg, hero);
        if (!e._dead) {
          e.stun = { until: now + 1.0 };
        }
        hits++;
      }
      this.state.effects.push({ kind: 'shake', life: 0.5 });
      this.state.effects.push({ kind: 'flash', life: 0.4, color: '#ffd700' });
      UI.toast(`🥖 Rolling Pin Smash! ${hits} pasta crushed!`);
    } else if (abId === 'flambe') {
      hero.flambeUntil = now + 8;
      this.state.effects.push({ kind: 'text', text: '🔥 FLAMBÉ!', x: hero.x, y: hero.y - 30, life: 1.2, vy: -20, color: '#ff6b00' });
      UI.toast('🔥 Flambé Frenzy! Triple rate + burn!');
    } else if (abId === 'precision_shot') {
      // Pick closest enemy in range as marked target
      let best = null, bestD2 = Infinity;
      const range = hero.getRange();
      for (const e of this.state.enemies) {
        if (e._dead || e.hp <= 0) continue;
        const dx = e.x - hero.x, dy = e.y - hero.y;
        const d2 = dx*dx + dy*dy;
        if (d2 > range*range) continue;
        if (d2 < bestD2) { bestD2 = d2; best = e; }
      }
      if (!best) { UI.toast('No target in range!'); return; }
      hero.precisionTarget = best;
      hero.precisionShotsLeft = 5;
      best.marked = { until: now + 8 };
      UI.toast('🎯 Target marked! Next 5 shots deal +200%!');
    } else if (abId === 'volcano') {
      // Spawn 8 fireballs over 4s on random enemies
      hero._volcanoEndAt = now + 4;
      hero._volcanoShotsLeft = 8;
      hero._volcanoNextAt = now;
      UI.toast('🌋 Volcanic Eruption!');
    }
    hero.abilityReadyAt = now + hero.ability.cooldown;
    this.playSound('explode');
    if (this.selectedTower === hero) UI.showUpgradePanel(hero);
  },

  // ============ POWERS (consumables) ============
  selectPower(powerId) {
    const power = POWERS.find(p => p.id === powerId);
    if (!power) return;
    const now = performance.now() / 1000;
    const ready = (this.state.powerCooldowns[powerId] || 0);
    if (now < ready) { UI.toast('Power on cooldown!'); return; }
    if (this.state.gold < power.cost) { UI.toast('Not enough gold!'); return; }
    if (power.targeted) {
      this.state.pendingPowerTarget = powerId;
      this.selectedTowerType = null;
      UI.toast(`${power.icon} Click the target location!`);
      UI.renderPowersBar();
      return;
    }
    this.usePower(power, 0, 0);
  },

  usePower(power, x, y) {
    const now = performance.now() / 1000;
    this.state.gold -= power.cost;
    this.state.powerCooldowns[power.id] = now + power.cooldown;
    this.state.pendingPowerTarget = null;
    if (power.id === 'pasta_bomb') {
      // AOE at (x,y)
      let hits = 0;
      for (const e of this.state.enemies) {
        if (e._dead || e.hp <= 0) continue;
        const dx = e.x - x, dy = e.y - y;
        if (dx*dx + dy*dy <= power.radius * power.radius) {
          this.damageEnemy(e, power.damage, null);
          hits++;
        }
      }
      this.state.effects.push({ kind: 'explosion', x, y, life: 0.7, radius: power.radius, color: '#ff5500' });
      this.state.effects.push({ kind: 'shake', life: 0.3 });
      this.playSound('explode');
      UI.toast(`💣 BOOM! ${hits} pasta blasted!`);
    } else if (power.id === 'freeze') {
      for (const e of this.state.enemies) {
        if (e._dead || e.hp <= 0) continue;
        e.frozen = { until: now + power.duration };
      }
      this.state.effects.push({ kind: 'flash', life: 0.5, color: '#74b9ff' });
      UI.toast('❄️ All pasta frozen!');
    } else if (power.id === 'pay_day') {
      this.state.gold += power.gold;
      this.state.effects.push({ kind: 'text', text: `+${power.gold}🪙`, x: this.canvas.width/2, y: this.canvas.height/2, life: 1.2, vy: -40, color: '#ffd700' });
      UI.toast(`💰 +${power.gold} gold!`);
    } else if (power.id === 'garlic_bread') {
      const before = this.state.lives;
      this.state.lives = Math.min(this.state.maxLives, this.state.lives + power.heal);
      const gained = this.state.lives - before;
      UI.toast(`🥖 +${gained} lives restored!`);
    } else if (power.id === 'sauce_storm') {
      for (const e of this.state.enemies) {
        if (e._dead || e.hp <= 0) continue;
        e.slow = { factor: power.slow, until: now + power.slowDur };
        e.burn = { dps: power.burnDps, until: now + power.burnDur };
      }
      this.state.effects.push({ kind: 'flash', life: 0.4, color: '#ff8c00' });
      UI.toast('🌪️ Sauce Storm engulfs the kitchen!');
    }
    UI.updateStats(this.state);
    UI.renderPowersBar();
    this.saveGame();
  },

  // ============ BOONS (mid-run choices) ============
  rollBoonChoices(count = 3) {
    const owned = new Set(this.state.boons || []);
    const usedKeystones = new Set(this.state.boonKeystonesUsed || []);
    // Weight by tier
    const pool = BOONS.filter(b => {
      if (b.tier === 'legendary' && usedKeystones.has(b.id)) return false;
      // Allow same boon to repeat (stacks)
      return true;
    });
    const weights = { common: 50, rare: 25, epic: 10, legendary: 3 };
    const choices = [];
    const taken = new Set();
    let safety = 50;
    while (choices.length < count && safety-- > 0) {
      // Build weighted list excluding already-taken
      const candidates = pool.filter(b => !taken.has(b.id));
      if (!candidates.length) break;
      const totalW = candidates.reduce((s, b) => s + (weights[b.tier] || 5), 0);
      let r = Math.random() * totalW;
      for (const b of candidates) {
        r -= (weights[b.tier] || 5);
        if (r <= 0) {
          choices.push(b);
          taken.add(b.id);
          break;
        }
      }
    }
    return choices;
  },

  pickBoon(boonId) {
    const boon = BOONS.find(b => b.id === boonId);
    if (!boon) return;
    if (!this.state.boons) this.state.boons = [];
    this.state.boons.push(boonId);
    if (boon.tier === 'legendary') {
      if (!this.state.boonKeystonesUsed) this.state.boonKeystonesUsed = [];
      this.state.boonKeystonesUsed.push(boonId);
    }
    // Apply immediate effects (one-time)
    if (boon.effect.maxLives) {
      this.state.maxLives += boon.effect.maxLives;
      this.state.lives = Math.min(this.state.maxLives, this.state.lives + boon.effect.maxLives);
    }
    if (boon.effect.goldMult && boon.id === 'sauce_master') {
      // Sauce Master is keystone — applied via computeStat naturally
    }
    this.state.pendingBoonWave = 0;
    UI.toast(`✨ Boon acquired: ${boon.icon} ${boon.name}!`);
    UI.closeBoonModal();
    UI.updateStats(this.state);
    UI.renderPowersBar();
    this.saveGame();
  },

  // ============ ENEMIES ============
  spawnEnemy(type) {
    const def = ENEMIES[type];
    if (!def) return;
    // Bestiary discovery — first-time popup
    if (!this.save.discoveredEnemies) this.save.discoveredEnemies = {};
    if (!this.save.discoveredEnemies[type]) {
      this.save.discoveredEnemies[type] = true;
      // Put intro into queue, show after current popup dismissed (if any)
      this.introQueue.push(type);
      if (!UI.el.enemyIntroModal.classList.contains('visible')) {
        const nextType = this.introQueue.shift();
        UI.showEnemyIntro(nextType);
      }
      this.saveGame();
    }
    const scale = 1 + this.endlessWave * 0.25;
    const mapMods = (this.state && this.state.mods) || { enemyHp: 1, enemySpeed: 1, gold: 1 };
    const hpScale = (this.state.endlessMode ? scale * scale : 1) * (mapMods.enemyHp || 1);
    const goldScale = (this.state.endlessMode ? scale : 1) * (mapMods.gold || 1);
    // Prestige: Heavy Air (-2% speed per level)
    const prestigeSlow = 1 + (this.save.prestigePerks.enemySlow || 0) * -0.02;
    const speedScale = (mapMods.enemySpeed || 1) * Math.max(0.5, prestigeSlow);
    const enemy = {
      type,
      def,
      x: this.path[0].x,
      y: this.path[0].y,
      hp: def.hp * hpScale,
      maxHp: def.hp * hpScale,
      speed: def.speed * speedScale * (1 + (Game.computeStat('enemySpeedMult', 0))),
      baseSpeed: def.speed * speedScale,
      progress: 0,
      pathDist: 0,
      segIdx: 0,
      segT: 0,
      armor: def.armor || 0,
      gold: Math.floor(def.gold * goldScale),
      slow: null,        // {factor, until}
      scale: def.scale || 1,
      isBoss: !!def.boss,
      dot: null,
      flashUntil: 0,
      // EPIC enemy properties
      shield: def.shield || 0,       // # hits absorbed before damage applies
      stealth: !!def.stealth,        // invisible to non-detection towers
      bossPhase: 0,                  // 0=phase1, 1=phase2 (<50%), 2=phase3 (<25%)
      lastDamageAt: 0
    };
    this.state.enemies.push(enemy);
    if (enemy.isBoss) this.bossAlive = true;
  },

  damageEnemy(enemy, amount, srcTower) {
    if (enemy.hp <= 0) return;
    // Shield absorbs first N hits
    if (enemy.shield && enemy.shield > 0) {
      enemy.shield--;
      this.state.effects.push({ kind: 'text', text: 'BLOCKED!', x: enemy.x, y: enemy.y - 22, life: 0.5, vy: -32, color: '#74b9ff' });
      return;
    }
    // Dodge: some pasta types shimmy past attacks
    if (enemy.def && enemy.def.dodge && Math.random() < enemy.def.dodge) {
      this.state.effects.push({ kind: 'text', text: 'DODGE!', x: enemy.x, y: enemy.y - 22, life: 0.5, vy: -32, color: '#74b9ff' });
      return;
    }
    const skills = this.state.skillPoints || {};
    const now = performance.now() / 1000;
    // Crit (extra from Chef Sergio hero scaling)
    let critChance = this.computeStat('critChance', 0) + (this.save.prestigePerks.critBase || 0) * 0.03;
    if (srcTower && srcTower.isHero && srcTower.heroDef.bonusCrit) {
      critChance += srcTower.heroDef.bonusCrit + (srcTower.heroDef.levelCrit || 0) * ((srcTower.level || 1) - 1);
    }
    let dmg = amount;
    let isCrit = false;
    if (Math.random() < critChance) {
      const critMult = 2 + this.computeStat('critMult', 0);
      dmg *= critMult;
      isCrit = true;
      this.state.effects.push({ kind: 'text', text: 'CRIT!', x: enemy.x, y: enemy.y - 20, life: 0.6, vy: -40, color: '#ffd700' });
    }
    // Marked target — bonus damage (Precision Shot)
    if (enemy.marked && now < enemy.marked.until) {
      dmg *= 3;
      this.state.effects.push({ kind: 'text', text: 'MARKED!', x: enemy.x, y: enemy.y - 26, life: 0.4, vy: -24, color: '#27ae60' });
      // Hero ammo
      if (srcTower && srcTower.isHero && srcTower.precisionTarget === enemy) {
        srcTower.precisionShotsLeft--;
        if (srcTower.precisionShotsLeft <= 0) {
          srcTower.precisionTarget = null;
          enemy.marked = null;
        }
      }
    }
    // Boss bonus damage
    if (enemy.isBoss) {
      const bossMult = 1 + this.computeStat('bossDmgMult', 0);
      dmg *= bossMult;
    }
    // First Strike (prestige): first shot of wave is x3
    if (this.save.prestigePerks.firstStrike && !this.state.firstStrikeUsed && this.state.waveActive) {
      dmg *= 3;
      this.state.firstStrikeUsed = true;
      this.state.effects.push({ kind: 'text', text: 'FIRST STRIKE!', x: enemy.x, y: enemy.y - 30, life: 0.8, vy: -40, color: '#ff6b6b' });
    }
    // Armor reduces damage, but armorPierce skill / weak-spot crits ignore
    let effectiveArmor = enemy.armor || 0;
    const pierce = this.computeStat('armorPierce', 0);
    effectiveArmor = Math.max(0, effectiveArmor - pierce);
    if (isCrit && skills.critPierce) effectiveArmor = 0;
    if (effectiveArmor > 0) dmg *= (1 - effectiveArmor);
    // Apply global slow on hit (iceField keystone-tier)
    if (skills.iceField) {
      const factor = 0.92; // 8% slower
      enemy.slow = { factor: Math.min(enemy.slow ? enemy.slow.factor : 1, factor), until: performance.now()/1000 + 1 };
    }
    enemy.hp -= dmg;
    enemy.lastDamageAt = now; // for regen pause
    enemy.flashUntil = now + 0.08;
    // Regen indicator: pause regen for X seconds after last hit (handled in update loop)
    // === STATUS EFFECTS FROM BOONS & HEROES ===
    // Burn on hit (Pyromaniac boon / Lil Pepe hero / Flambé)
    if (enemy.hp > 0) {
      let burnDps = 0, burnDur = 0;
      const boonBurn = this.getBoonEffect('burnOnHit');
      if (boonBurn) { burnDps = Math.max(burnDps, boonBurn.dps); burnDur = Math.max(burnDur, boonBurn.duration); }
      if (srcTower && srcTower.isHero) {
        const hd = srcTower.heroDef;
        if (hd && hd.burnOnHit) { burnDps = Math.max(burnDps, hd.burnOnHit.dps); burnDur = Math.max(burnDur, hd.burnOnHit.duration); }
        // Flambé: all hero shots burn while active
        if (srcTower.flambeUntil && now < srcTower.flambeUntil) {
          burnDps = Math.max(burnDps, 8); burnDur = Math.max(burnDur, 3);
        }
      }
      if (burnDps > 0) {
        const until = now + burnDur;
        enemy.burn = enemy.burn && enemy.burn.until > until
          ? { dps: Math.max(enemy.burn.dps, burnDps), until: enemy.burn.until }
          : { dps: burnDps, until };
      }
      // Stun chance (Frostbite boon)
      const stunChance = this.hasBoonField('stunChance');
      if (stunChance && Math.random() < stunChance) {
        const sd = this.hasBoonField('stunDur') || 0.5;
        enemy.stun = { until: now + sd };
      }
      // Chain lightning (Static Charge boon)
      const chainChance = this.hasBoonField('chainChance');
      if (chainChance && Math.random() < chainChance && srcTower) {
        // Hit one nearby enemy for 50% damage (no further chain)
        let near = null, bestD2 = Infinity;
        for (const o of this.state.enemies) {
          if (o === enemy || o._dead || o.hp <= 0) continue;
          const dx = o.x - enemy.x, dy = o.y - enemy.y;
          const d2 = dx*dx + dy*dy;
          if (d2 < 100*100 && d2 < bestD2) { bestD2 = d2; near = o; }
        }
        if (near) {
          this.state.effects.push({ kind: 'lightning', x1: enemy.x, y1: enemy.y, x2: near.x, y2: near.y, life: 0.25 });
          this.damageEnemy(near, dmg * 0.5, srcTower);
        }
      }
    }
    // Frenzy: track recent kills on tower
    if (enemy.hp <= 0 && srcTower) {
      const frenzy = this.computeStat('frenzy', 0);
      if (frenzy > 0) {
        srcTower.frenzyStacks = Math.min(5, (srcTower.frenzyStacks || 0) + 1);
        srcTower.frenzyUntil = now + 1.5;
      }
    }
    if (enemy.hp <= 0) {
      this.killEnemy(enemy, srcTower);
    } else if (enemy.isBoss) {
      // Boss phases: 50% → enrage (gain shield + speed boost), 25% → second wind (spawn minions)
      const ratio = enemy.hp / enemy.maxHp;
      if (enemy.bossPhase < 1 && ratio < 0.5) {
        enemy.bossPhase = 1;
        enemy.shield = (enemy.shield || 0) + 5;
        enemy.baseSpeed *= 1.25;
        this.state.effects.push({ kind: 'text', text: 'ENRAGED!', x: enemy.x, y: enemy.y - 30, life: 1.5, vy: -24, color: '#e74c3c' });
        this.state.effects.push({ kind: 'flash', life: 0.3, color: '#ff0000' });
      } else if (enemy.bossPhase < 2 && ratio < 0.25) {
        enemy.bossPhase = 2;
        // Spawn 3 minion meatballs at boss position
        for (let i = 0; i < 3; i++) {
          const def = ENEMIES['meatball'];
          if (!def) break;
          const minion = {
            type: 'meatball', def,
            x: enemy.x + (Math.random()-0.5)*30, y: enemy.y + (Math.random()-0.5)*30,
            hp: def.hp * 0.6, maxHp: def.hp * 0.6,
            speed: def.speed * 1.4, baseSpeed: def.speed * 1.4,
            progress: enemy.progress, pathDist: Math.max(0, enemy.pathDist - 20 + i*10),
            segIdx: enemy.segIdx, segT: enemy.segT,
            armor: 0, gold: 5, slow: null, scale: 0.7,
            isBoss: false, dot: null, flashUntil: 0, shield: 0, stealth: false, bossPhase: 0
          };
          this.state.enemies.push(minion);
        }
        this.state.effects.push({ kind: 'text', text: 'SECOND WIND!', x: enemy.x, y: enemy.y - 30, life: 1.5, vy: -24, color: '#ff6b00' });
      }
    }
  },

  killEnemy(enemy, srcTower) {
    if (enemy._dead) return;
    enemy._dead = true;
    // Mark discovered (in case spawn missed it)
    if (this.save.discoveredEnemies) this.save.discoveredEnemies[enemy.type] = true;
    // Track per-enemy kill counts for dex depth
    if (!this.save.enemyKills) this.save.enemyKills = {};
    this.save.enemyKills[enemy.type] = (this.save.enemyKills[enemy.type] || 0) + 1;
    // Sometimes taunt on kill (significantly reduced from 0.18 → 0.05)
    if (srcTower && Math.random() < 0.05 && srcTower.def.taunts && this.tauntsEnabled()) {
      const t = srcTower.def.taunts[Math.floor(Math.random() * srcTower.def.taunts.length)];
      UI.spawnTaunt(t, srcTower.x, srcTower.y - 18);
    }
    // SPLITS: pasta that splits into smaller versions on death (gemelli)
    if (enemy.def && enemy.def.splits && !enemy._wasSplit) {
      const half = {
        type: enemy.type, def: enemy.def,
        x: enemy.x, y: enemy.y,
        hp: enemy.maxHp * 0.5, maxHp: enemy.maxHp * 0.5,
        speed: enemy.speed * 1.2, baseSpeed: enemy.baseSpeed * 1.2,
        progress: enemy.progress, pathDist: enemy.pathDist,
        segIdx: enemy.segIdx, segT: enemy.segT,
        armor: enemy.armor, gold: Math.floor(enemy.gold * 0.5),
        slow: null, scale: (enemy.scale || 1) * 0.75,
        isBoss: false, dot: null, flashUntil: 0, _wasSplit: true
      };
      this.state.enemies.push(half);
    }
    let gold = enemy.gold;
    gold *= this.computeStat('goldMult', 1);
    gold *= 1 + (this.save.prestigePerks.globalGold || 0) * 0.05;
    // Boss gold bonus (bountyHunter)
    if (enemy.isBoss) gold *= (1 + this.computeStat('bossGold', 0));
    gold = Math.floor(gold);
    this.state.gold += gold;
    const scoreMult = (this.state.mods && this.state.mods.score) || 1;
    this.state.score += Math.floor(enemy.maxHp * 0.5 * scoreMult);
    if (srcTower) srcTower.kills = (srcTower.kills || 0) + 1;
    // Award XP to ALL heroes (regardless of who killed) so heroes always progress
    const xpAmount = enemy.isBoss ? 80 : Math.max(5, Math.floor((enemy.maxHp || 10) / 4));
    for (const t of this.state.towers) {
      if (t.isHero) this.awardXP(t, xpAmount);
    }
    this.state.effects.push({ kind: 'pop', x: enemy.x, y: enemy.y, life: 0.5, color: enemy.def.color });
    this.state.effects.push({ kind: 'text', text: '+' + gold, x: enemy.x, y: enemy.y - 10, life: 0.7, vy: -30, color: '#ffd700' });
    this.playSound(enemy.isBoss ? 'bossDie' : 'kill');
    if (enemy.isBoss) this.bossAlive = false;
  },

  // ============ TARGETING ============
  // Per-tower targeting modes:
  //   first  — furthest along path (closest to goal) — default
  //   last   — least along path (newest spawn)
  //   strong — highest current HP
  //   weak   — lowest current HP (finish them)
  //   close  — physically closest to tower
  pickTarget(tower, enemies) {
    const range = tower.getRange();
    const r2 = range * range;
    const mode = tower.targetMode || 'first';
    let best = null;
    let bestScore = Infinity;
    for (const e of enemies) {
      if (e.hp <= 0 || e._dead) continue;
      if (e.stealth && !tower.canSeeStealth) continue;
      const dx = e.x - tower.x, dy = e.y - tower.y;
      const d2 = dx*dx + dy*dy;
      if (d2 > r2) continue;
      let score;
      switch (mode) {
        case 'last':   score = e.pathDist; break;
        case 'strong': score = -e.hp; break;
        case 'weak':   score = e.hp; break;
        case 'close':  score = d2; break;
        case 'first':
        default:       score = -e.pathDist; break;
      }
      if (score < bestScore) { bestScore = score; best = e; }
    }
    return best;
  },

  // ============ STATS COMPUTATION ============
  computeStat(type, base) {
    let val = base;
    const skills = this.state.skillPoints || {};
    Object.entries(SKILL_TREE).forEach(([bid, branch]) => {
      branch.nodes.forEach(node => {
        if (node.effect.type !== type) return;
        const lvl = skills[node.id] || 0;
        if (lvl <= 0) return;
        val += node.effect.value * lvl;
      });
    });
    // Keystone bonuses
    if (skills.gordon) {
      if (type === 'damageMult') val += 0.30;
      if (type === 'fireRateMult') val += 0.20;
    }
    if (skills.grandma) {
      if (type === 'rangeMult') val += 0.25;
      if (type === 'slowDurMult') val += 0.20;
    }
    if (skills.goldenAge) {
      if (type === 'goldMult') val += 0.30;
    }
    // Boons (mid-run buffs) — sum scalar effects of matching type
    const boons = this.state.boons || [];
    for (const boonId of boons) {
      const boon = BOONS.find(b => b.id === boonId);
      if (!boon || !boon.effect) continue;
      const v = boon.effect[type];
      if (typeof v === 'number') val += v;
    }
    return val;
  },

  // Convenience: aggregate boon effects of a non-scalar type (e.g. burnOnHit).
  // Returns the FIRST matching effect object or null.
  getBoonEffect(key) {
    const boons = this.state.boons || [];
    for (const boonId of boons) {
      const boon = BOONS.find(b => b.id === boonId);
      if (boon && boon.effect && boon.effect[key]) return boon.effect[key];
    }
    return null;
  },

  hasBoonField(key) {
    const boons = this.state.boons || [];
    for (const boonId of boons) {
      const boon = BOONS.find(b => b.id === boonId);
      if (boon && boon.effect && boon.effect[key] !== undefined) return boon.effect[key];
    }
    return null;
  },

  computeAuraBoost(tower) {
    let boost = 0;
    for (const other of this.state.towers) {
      if (other === tower) continue;
      // Standard aura towers (lasagna)
      if (other.def.aura) {
        const r = other.getRange();
        const dx = other.x - tower.x, dy = other.y - tower.y;
        if (dx*dx + dy*dy <= r*r) boost += other.getAura();
      }
      // Hero aura (Nonna: damageMult to nearby towers based on her level)
      if (other.isHero && other.def.auraType === 'damageMult' && other.def.auraValue) {
        const ar = other.def.auraRange || 120;
        const dx = other.x - tower.x, dy = other.y - tower.y;
        if (dx*dx + dy*dy <= ar*ar) {
          boost += other.def.auraValue * (other.level || 1);
        }
      }
    }
    return boost;
  },

  // ============ WAVES ============
  startWave() {
    if (this.state.waveActive) return;
    if (this.state.wave >= MAX_WAVES && !this.state.endlessMode) return;
    this.state.waveActive = true;
    // Reset per-wave trackers
    this.state.lethalShieldsLeft = this.computeStat('lethalShield', 0);
    this.state.firstStrikeUsed = false;
    const waveIdx = this.state.wave;
    let wave;
    if (waveIdx >= MAX_WAVES) {
      // Endless - generate random
      this.endlessWave = waveIdx - MAX_WAVES + 1;
      wave = this.makeEndlessWave(this.endlessWave);
    } else {
      wave = WAVES[waveIdx];
    }
    // Queue spawns
    this.spawnQueue = [];
    let t = 0;
    wave.enemies.forEach(group => {
      for (let i = 0; i < group.count; i++) {
        this.spawnQueue.push({ type: group.type, time: t });
        t += group.spacing;
      }
    });
    this.spawnTimer = 0;
    UI.banner(`Wave ${waveIdx + 1}${wave.boss ? ' — BOSS!' : ''}`, 1400);
    UI.setFooter(`🌊 Wave ${waveIdx + 1} incoming...`);
    UI.el.btnStartWave.disabled = true;
    UI.el.btnStartWave.textContent = '⏳ Wave in progress';
    this.playSound('waveStart');
  },

  makeEndlessWave(n) {
    // Increasingly hard random pool from the full pasta endless pool
    const pool = (typeof ENDLESS_POOL !== 'undefined') ? ENDLESS_POOL :
      ['spaghetti','penne','fusilli','rigatoni','farfalle','ziti','bucatini','gnocchi','angelHair','conchiglie','marinara'];
    const count = 15 + n * 5;
    const enemies = [];
    for (let i = 0; i < count; i++) {
      enemies.push({ type: pool[Math.floor(Math.random() * pool.length)], count: 1, spacing: 0.4 });
    }
    if (n % 3 === 0) {
      const bossPool = (typeof ENDLESS_BOSSES !== 'undefined') ? ENDLESS_BOSSES : ['radiatori','lasagna'];
      const bossType = bossPool[Math.floor(Math.random() * bossPool.length)];
      enemies.push({ type: bossType, count: Math.min(5, Math.floor(n / 3)), spacing: 2.0 });
    }
    return { enemies, reward: 200 + n * 100, boss: n % 3 === 0 };
  },

  finishWave() {
    this.state.waveActive = false;
    const waveIdx = this.state.wave;
    let wave;
    if (waveIdx >= MAX_WAVES) {
      wave = this.makeEndlessWave(this.endlessWave);
    } else {
      wave = WAVES[waveIdx];
    }
    const mapMods = (this.state && this.state.mods) || { gold: 1, score: 1 };
    const waveBonus = Math.floor(wave.reward * this.computeStat('waveBonusMult', 1) * (mapMods.gold || 1));
    this.state.gold += waveBonus;
    // Interest (compound)
    const interest = this.computeStat('interest', 0);
    if (interest > 0) this.state.gold += Math.floor(this.state.gold * interest);
    // Passive Tip Jar gold
    const passive = this.computeStat('passiveGold', 0);
    if (passive > 0) this.state.gold += passive;
    // Marinara marks (base + bosses + skill/perk bonuses)
    let marks = 1;
    if (wave.boss) marks += 2;
    if (wave.final) marks += 5;
    const newWave = this.state.wave + 1;
    // Skill: Mark Collector — +1 mark per 10 waves
    if (newWave % 10 === 0) marks += this.computeStat('extraMarks', 0);
    // Keystone: Golden Age — +1 mark every wave
    if (this.state.skillPoints && this.state.skillPoints.goldenAge) marks += 1;
    // Prestige perk: Marinara Vintage (+10% per level)
    const markBoost = 1 + (this.save.prestigePerks.marksBoost || 0) * 0.10;
    marks = Math.max(1, Math.floor(marks * markBoost));
    this.state.marks += marks;
    // Life regen — skill Soup of the Day fires every 4 waves now
    const regen = this.computeStat('lifeRegen', 0);
    if (regen > 0 && (waveIdx + 1) % 4 === 0) {
      this.state.lives = Math.min(this.state.maxLives, this.state.lives + Math.floor(regen));
    }
    // Reset per-wave shields/firstStrike trackers
    const lethal = this.computeStat('lethalShield', 0);
    this.state.lethalShieldsLeft = lethal;
    if (this.save.prestigePerks.firstStrike) this.state.firstStrikeUsed = false;
    this.state.wave++;
    if (this.state.wave > this.save.highWave) this.save.highWave = this.state.wave;
    // Per-map high wave tracking (used for unlocks)
    const mapId = this.state.mapId || (this.save.selectedMap || 'kitchen');
    if (!this.save.mapHighWaves) this.save.mapHighWaves = {};
    if (this.state.wave > (this.save.mapHighWaves[mapId] || 0)) {
      this.save.mapHighWaves[mapId] = this.state.wave;
    }

    UI.toast(`Wave complete! +🪙${waveBonus} +🥫${marks}`);
    UI.setFooter('💰 Wave complete! Plan your next defense.');
    UI.el.btnStartWave.disabled = false;
    UI.el.btnStartWave.textContent = '▶ Start Wave ' + (this.state.wave + 1);
    UI.renderTowerShop();
    UI.renderWavePreview();
    UI.updateStats(this.state);
    this.saveGame();

    if (this.state.wave >= MAX_WAVES && !this.state.endlessMode) {
      UI.showVictory();
      return;
    }
    // BOONS: every 5 waves, offer 3-choice boon (skip on victory wave)
    const w = this.state.wave;
    if (w > 0 && w % 5 === 0) {
      const choices = this.rollBoonChoices(3);
      if (choices.length) {
        this.state.pendingBoonWave = w;
        UI.showBoonChoice(choices);
      }
    }
  },

  gameOver() {
    UI.showGameOver('lives');
    this.saveGame();
  },

  // ============ PRESTIGE ============
  computePrestigeGain() {
    const wave = this.state.wave;
    if (wave < 5) return 0;
    // Sauce = waves^1.2 / 8, scaled
    return Math.floor(Math.pow(wave, 1.3) / 6);
  },

  doPrestige() {
    const gain = this.computePrestigeGain();
    if (gain < 1) { UI.toast('Need wave 5+ to prestige!'); return; }
    this.save.sauce += gain;
    this.save.prestigeLevel++;
    this.save.totalScore += this.state.score;
    this.save.runsCompleted++;
    this.save.lastRun = null; // clear run state before saving
    SaveSystem.save(this.save);
    UI.el.prestigeModal.classList.remove('visible');
    UI.banner(`+${gain} Sauce!`, 2000);
    this.newRun(true, { clearLastRun: true });
    setTimeout(() => UI.openPrestige(), 500);
  },

  buyPerk(id) {
    const perk = PRESTIGE_PERKS.find(p => p.id === id);
    if (!perk) return;
    const lvl = this.save.prestigePerks[id] || 0;
    if (lvl >= perk.max) return;
    const cost = perk.cost * (lvl + 1);
    if (this.save.sauce < cost) return;
    this.save.sauce -= cost;
    this.save.prestigePerks[id] = lvl + 1;
    this.saveGame(true);
    UI.updateStats(this.state);
    UI.toast('🌟 Perk upgraded!');
    this.playSound('upgrade');
  },

  buySkill(branchId, nodeId) {
    const branch = SKILL_TREE[branchId];
    const node = branch.nodes.find(n => n.id === nodeId);
    if (!node) return;
    const lvl = this.state.skillPoints[nodeId] || 0;
    if (lvl >= node.max) return;
    // Check prerequisites
    if (node.requires) {
      for (const req of node.requires) {
        if ((this.state.skillPoints[req.id] || 0) < req.lvl) {
          UI.toast('Locked! Prerequisite not met.');
          return;
        }
      }
    }
    const cost = node.costs[lvl];
    if (this.state.marks < cost) { UI.toast('Not enough marks!'); return; }
    this.state.marks -= cost;
    this.state.skillPoints[nodeId] = lvl + 1;
    // Apply immediate effects
    if (node.effect.type === 'maxLives') {
      this.state.maxLives += node.effect.value;
      this.state.lives += node.effect.value;
    }
    // Keystone immediate bonuses
    if (nodeId === 'grandma') {
      this.state.maxLives += 15;
      this.state.lives += 15;
    } else if (nodeId === 'goldenAge') {
      this.state.marks += 10;
    }
    UI.updateStats(this.state);
    if (UI.el.towerShop) UI.renderTowerShop();
    this.playSound('upgrade');
    this.saveGame();
  },

  // ============ INPUT ============
  onMouseMove(e) {
    const rect = this.canvas.getBoundingClientRect();
    const scaleX = this.canvas.width / rect.width;
    const scaleY = this.canvas.height / rect.height;
    const mx = (e.clientX - rect.left) * scaleX;
    const my = (e.clientY - rect.top) * scaleY;
    this.mouseX = mx;
    this.mouseY = my;
    this.hoverCell = { cx: Math.floor(mx / this.cellSize), cy: Math.floor(my / this.cellSize) };
  },

  onClick(e) {
    const rect = this.canvas.getBoundingClientRect();
    const scaleX = this.canvas.width / rect.width;
    const scaleY = this.canvas.height / rect.height;
    const mx = (e.clientX - rect.left) * scaleX;
    const my = (e.clientY - rect.top) * scaleY;

    // 1) Pending power target — resolve here
    if (this.state.pendingPowerTarget) {
      const power = POWERS.find(p => p.id === this.state.pendingPowerTarget);
      if (power) this.usePower(power, mx, my);
      return;
    }

    // 2) Hero placement
    if (this.selectedTowerType && this.selectedTowerType._isHeroPick) {
      const cx = Math.floor(mx / this.cellSize);
      const cy = Math.floor(my / this.cellSize);
      this.placeHero(cx, cy);
      return;
    }

    // 3) Click existing tower?
    let clicked = null;
    let bestD = 35 * 35;
    for (const t of this.state.towers) {
      const dx = t.x - mx, dy = t.y - my;
      const d = dx*dx + dy*dy;
      if (d < bestD) { bestD = d; clicked = t; }
    }
    if (clicked) {
      this.selectedTower = clicked;
      this.selectedTowerType = null;
      UI.showUpgradePanel(clicked);
      UI.renderTowerShop();
      return;
    }

    if (this.selectedTowerType) {
      this.tryPlaceTower(mx, my);
    } else {
      this.selectedTower = null;
      UI.hideUpgradePanel();
    }
  },

  tryPlaceTower(mx, my) {
    const cx = Math.floor(mx / this.cellSize);
    const cy = Math.floor(my / this.cellSize);
    if (cx < 0 || cx >= this.cols || cy < 0 || cy >= this.rows) return;
    if (this.buildGrid[cy][cx] !== 0) {
      UI.toast('Can\'t build there!');
      this.playSound('error');
      return;
    }
    const def = this.selectedTowerType;
    const cost = Math.floor(def.cost * this.computeStat('costMult', 1));
    if (this.state.gold < cost) { UI.toast('Not enough gold!'); return; }
    this.state.gold -= cost;
    const tx = cx * this.cellSize + this.cellSize / 2;
    const ty = cy * this.cellSize + this.cellSize / 2;
    const tower = this.makeTower(def, tx, ty);
    this.state.towers.push(tower);
    this.buildGrid[cy][cx] = 2;
    // Track in Pastadex
    if (!this.save.discoveredTowers) this.save.discoveredTowers = {};
    if (!this.save.discoveredTowers[def.id]) {
      this.save.discoveredTowers[def.id] = true;
      this.saveGame();
    }
    this.playSound('place');
    UI.updateStats(this.state);
    UI.renderTowerShop();
    // Stay selected so player can spam-place
    if (this.state.gold < cost) this.deselectAll();
  },

  togglePause() {
    this.paused = !this.paused;
    UI.el.btnPause.textContent = this.paused ? '▶' : '⏸';
    UI.toast(this.paused ? 'Paused' : 'Resumed');
  },

  cycleSpeed() {
    const allowed3x = !!this.save.prestigePerks.speed3x;
    const allowed5x = !!this.save.prestigePerks.extraSpeed && allowed3x;
    const speeds = allowed5x ? [1, 2, 3, 5] : (allowed3x ? [1, 2, 3] : [1, 2]);
    const idx = speeds.indexOf(this.speedMult);
    this.speedMult = speeds[(idx + 1) % speeds.length];
    UI.el.btnSpeed.textContent = '▶ ' + this.speedMult + 'x';
  },

  // ============ MAIN LOOP ============
  lastT: 0,
  loop(now) {
    const dt = Math.min(0.05, (now - this.lastT) / 1000) || 0;
    this.lastT = now;
    if (!this.paused && this.state) {
      for (let s = 0; s < this.speedMult; s++) {
        this.update(dt);
      }
    }
    this.render();
    requestAnimationFrame(this.loop.bind(this));
  },

  update(dt) {
    // Spawn enemies from queue
    if (this.state.waveActive) {
      this.spawnTimer += dt;
      while (this.spawnQueue.length && this.spawnTimer >= this.spawnQueue[0].time) {
        const s = this.spawnQueue.shift();
        this.spawnEnemy(s.type);
      }
    }

    // Move enemies along path
    const enemies = this.state.enemies;
    const nowT = performance.now() / 1000;
    for (let i = enemies.length - 1; i >= 0; i--) {
      const e = enemies[i];
      if (e._dead || e.hp <= 0) { enemies.splice(i, 1); continue; }
      // === Status effects: freeze/stun overrides slow ===
      let frozen = (e.frozen && nowT < e.frozen.until) || (e.stun && nowT < e.stun.until);
      if (e.frozen && nowT >= e.frozen.until) e.frozen = null;
      if (e.stun && nowT >= e.stun.until) e.stun = null;
      // Burn DoT
      if (e.burn) {
        if (nowT >= e.burn.until) e.burn = null;
        else this.damageEnemy(e, e.burn.dps * dt, null);
        if (e._dead || e.hp <= 0) { enemies.splice(i, 1); continue; }
      }
      // Regen (enemy property — only if not damaged recently)
      if (e.def && e.def.regen && !frozen) {
        const safe = !e.lastDamageAt || (nowT - e.lastDamageAt) > 2.5;
        if (safe && e.hp < e.maxHp) {
          e.hp = Math.min(e.maxHp, e.hp + e.def.regen * dt);
        }
      }
      // Slow effect
      let speedFactor = 1;
      if (e.slow && nowT < e.slow.until) {
        speedFactor = 1 - e.slow.factor;
      } else {
        e.slow = null;
      }
      // Frozen/stunned: skip movement entirely
      if (frozen) {
        continue;
      }
      const enemySpeedAdj = 1 + this.computeStat('enemySpeedMult', 0);
      const speed = e.baseSpeed * enemySpeedAdj * speedFactor;
      let remain = speed * dt;
      while (remain > 0 && e.segIdx < this.pathSegments.length) {
        const seg = this.pathSegments[e.segIdx];
        const left = seg.len - e.segT;
        if (remain >= left) {
          remain -= left;
          e.pathDist += left;
          e.segT = 0;
          e.segIdx++;
        } else {
          e.segT += remain;
          e.pathDist += remain;
          remain = 0;
        }
      }
      if (e.segIdx >= this.pathSegments.length) {
        // Reached goal - lose life
        let damage = e.isBoss ? Math.max(3, Math.floor(e.maxHp / 1000)) : 1;
        // Prestige: Tougher Plates (-10% per level)
        const hitMult = 1 + (this.save.prestigePerks.enemyHitMult || 0) * -0.10;
        damage = Math.max(1, Math.floor(damage * Math.max(0.3, hitMult)));
        // Lethal Shield (basil skill) — survive a lethal hit once per wave
        if (this.state.lethalShieldsLeft && this.state.lethalShieldsLeft > 0 && damage >= this.state.lives) {
          this.state.lethalShieldsLeft--;
          this.state.effects.push({ kind: 'text', text: 'SHIELDED!', x: e.x, y: e.y - 24, life: 1.0, vy: -30, color: '#6ab04c' });
          damage = Math.max(0, this.state.lives - 1); // leave 1 life
        }
        this.state.lives -= damage;
        // Sauce Splatter (thorns) — when losing lives, damage all enemies on screen
        const thorns = this.computeStat('thorns', 0);
        if (thorns > 0) {
          for (const other of enemies) {
            if (other === e || other._dead) continue;
            other.hp -= other.maxHp * thorns;
            if (other.hp <= 0) this.killEnemy(other);
          }
        }
        enemies.splice(i, 1);
        this.state.effects.push({ kind: 'shake', life: 0.3 });
        this.playSound('lifeLost');
        if (this.state.lives <= 0) {
          this.state.lives = 0;
          this.state.waveActive = false;
          this.gameOver();
        }
        continue;
      }
      const seg = this.pathSegments[e.segIdx];
      e.x = seg.x1 + seg.dx * e.segT;
      e.y = seg.y1 + seg.dy * e.segT;
      // DoT
      if (e.dot && performance.now() / 1000 < e.dot.until) {
        this.damageEnemy(e, e.dot.dps * dt);
      }
    }

    // Towers
    for (const tower of this.state.towers) {
      const fr = tower.getFireRate();
      if (!fr) continue;
      tower.fireCooldown -= dt;
      // Linguine: continuous beam handled separately
      if (tower.def.pierce) {
        // Find target line: pick farthest enemy in range, fire beam through
        let best = this.pickTarget(tower, enemies);
        tower.laserTarget = best;
        if (best && tower.fireCooldown <= 0) {
          // Hit all enemies along the line from tower to past best
          const range = tower.getRange();
          const dx = best.x - tower.x, dy = best.y - tower.y;
          const len = Math.hypot(dx, dy) || 1;
          const ux = dx / len, uy = dy / len;
          const beamLen = range;
          for (const e of enemies) {
            const ex = e.x - tower.x, ey = e.y - tower.y;
            const t = ex * ux + ey * uy;
            if (t < 0 || t > beamLen) continue;
            const px = ux * t, py = uy * t;
            const dist = Math.hypot(ex - px, ey - py);
            if (dist <= 14) this.damageEnemy(e, tower.getDamage(), tower);
          }
          tower.fireCooldown = 1 / fr;
        }
        continue;
      }
      // Hero volcano ability ticks (independent of normal firing)
      if (tower.isHero && tower._volcanoEndAt && nowT < tower._volcanoEndAt && tower._volcanoShotsLeft > 0) {
        if (nowT >= (tower._volcanoNextAt || 0)) {
          // Pick random enemy
          const alive = enemies.filter(e => !e._dead && e.hp > 0);
          if (alive.length) {
            const tgt = alive[Math.floor(Math.random() * alive.length)];
            // Spawn fireball as splash projectile from sky
            this.state.projectiles.push({
              x: tgt.x + (Math.random() - 0.5) * 80, y: -20,
              targetEnemy: tgt,
              speed: 600,
              damage: 60,
              splash: 60,
              slow: null,
              symbol: '🔥',
              kind: '_default',
              angle: Math.PI / 2,
              spin: 0,
              color: '#ff5500',
              srcTower: tower,
              life: 2,
              pierceLeft: 0,
              hitSet: null,
              fireball: true
            });
            tower._volcanoShotsLeft--;
            tower._volcanoNextAt = nowT + (4 / 8);
          }
        }
      }
      if (tower.fireCooldown > 0) continue;
      // Hero precision shot: force fire at marked target
      let target;
      if (tower.isHero && tower.precisionTarget && !tower.precisionTarget._dead && tower.precisionTarget.hp > 0) {
        const px = tower.precisionTarget.x - tower.x, py = tower.precisionTarget.y - tower.y;
        const range = tower.getRange();
        if (px*px + py*py <= range*range) {
          target = tower.precisionTarget;
        } else {
          target = this.pickTarget(tower, enemies);
        }
      } else {
        target = this.pickTarget(tower, enemies);
      }
      tower.target = target;
      if (!target) continue;
      tower.fireCooldown = 1 / fr;
      // Spawn projectile
      const pierceCount = this.computeStat('pierce', 0);
      const splashOnHit = this.hasBoonField('splashOnHit') || 0;
      const dx = target.x - tower.x, dy = target.y - tower.y;
      const angle = Math.atan2(dy, dx);
      const baseSplash = tower.getSplash();
      const baseProj = {
        x: tower.x, y: tower.y,
        targetEnemy: target,
        speed: tower.def.projectileSpeed || 500,
        damage: tower.getDamage(),
        splash: Math.max(baseSplash, splashOnHit),
        slow: tower.def.slow ? { factor: tower.getSlowFactor(), duration: tower.getSlowDuration() } : null,
        symbol: tower.def.projectile || '•',
        kind: tower.def.projKind || '_default',
        angle: angle,
        spin: 0,
        color: tower.def.color,
        srcTower: tower,
        life: 3,
        pierceLeft: pierceCount,
        hitSet: null
      };
      this.state.projectiles.push(baseProj);
      // Multishot (Double Tap boon + skill tree multishot)
      const msChance = this.computeStat('multishot', 0) + (this.hasBoonField('multishot') || 0);
      if (msChance > 0 && Math.random() < msChance) {
        // Find an alternate target if available
        let altTarget = target;
        for (const e of enemies) {
          if (e === target || e._dead || e.hp <= 0) continue;
          const ex = e.x - tower.x, ey = e.y - tower.y;
          if (ex*ex + ey*ey > tower.getRange() * tower.getRange()) continue;
          altTarget = e; break;
        }
        const ang2 = Math.atan2(altTarget.y - tower.y, altTarget.x - tower.x);
        this.state.projectiles.push({ ...baseProj, targetEnemy: altTarget, angle: ang2, x: tower.x, y: tower.y });
      }
      // Aim tower at last target (for visual rotation)
      tower.angle = angle;
      this.playSound('shoot');
    }

    // Projectiles
    const projs = this.state.projectiles;
    for (let i = projs.length - 1; i >= 0; i--) {
      const p = projs[i];
      p.life -= dt;
      if (p.life <= 0) { projs.splice(i, 1); continue; }
      const tgt = p.targetEnemy;
      if (!tgt || tgt._dead || tgt.hp <= 0) {
        // Find another target
        const newTgt = this.pickTarget(p.srcTower, enemies);
        if (!newTgt) { projs.splice(i, 1); continue; }
        p.targetEnemy = newTgt;
      }
      const t = p.targetEnemy;
      const dx = t.x - p.x, dy = t.y - p.y;
      const d = Math.hypot(dx, dy) || 1;
      const step = p.speed * dt;
      if (step >= d) {
        // Hit!
        this.onProjectileHit(p, t);
        // Pierce: keep projectile alive and pick next target if any
        if (p.pierceLeft && p.pierceLeft > 0 && !p.splash) {
          p.pierceLeft--;
          if (!p.hitSet) p.hitSet = new Set();
          p.hitSet.add(t);
          // Find next nearby enemy not yet hit
          let next = null, bestD2 = Infinity;
          for (const e of enemies) {
            if (e === t || e._dead || e.hp <= 0) continue;
            if (p.hitSet.has(e)) continue;
            const ex = e.x - p.x, ey = e.y - p.y;
            const d2 = ex*ex + ey*ey;
            if (d2 < 90000 && d2 < bestD2) { bestD2 = d2; next = e; }
          }
          if (next) {
            p.targetEnemy = next;
            continue;
          }
        }
        projs.splice(i, 1);
      } else {
        p.x += (dx / d) * step;
        p.y += (dy / d) * step;
        // Update spin + angle for visual
        p.spin = (p.spin || 0) + dt * 14;
        p.angle = Math.atan2(dy, dx);
      }
    }

    // Effects
    const fx = this.state.effects;
    for (let i = fx.length - 1; i >= 0; i--) {
      const f = fx[i];
      f.life -= dt;
      if (f.vy) f.y += f.vy * dt;
      if (f.life <= 0) fx.splice(i, 1);
    }

    // Taunt timer — periodic random taunts from active towers (reduced frequency)
    this.tauntTimer -= dt;
    if (this.tauntTimer <= 0) {
      this.tauntTimer = 10 + Math.random() * 8;
      this.tryRandomTaunt();
    }

    // Throttled powers bar update (every ~0.5s) so cooldowns tick visibly
    this._powerBarTimer = (this._powerBarTimer || 0) - dt;
    if (this._powerBarTimer <= 0) {
      this._powerBarTimer = 0.5;
      UI.renderPowersBar();
      // Also refresh upgrade panel if a hero is selected (for ability CD ticking)
      if (this.selectedTower && this.selectedTower.isHero) UI.showUpgradePanel(this.selectedTower);
    }

    // Check wave end
    if (this.state.waveActive && this.spawnQueue.length === 0 && enemies.length === 0) {
      this.finishWave();
    }
  },

  tauntsEnabled() {
    return !this.save || !this.save.settings || this.save.settings.taunts !== false;
  },
  tryRandomTaunt() {
    if (!this.tauntsEnabled()) return;
    if (this.state.enemies.length === 0) return;
    // Only ~30% of timer ticks actually fire a taunt — keeps chatter rare
    if (Math.random() > 0.3) return;
    // Pick a tower with at least one enemy in range and taunts
    const candidates = this.state.towers.filter(t => t.def.taunts && t.def.taunts.length > 0);
    if (candidates.length === 0) return;
    // Shuffle, find one with an enemy in range
    for (let i = candidates.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [candidates[i], candidates[j]] = [candidates[j], candidates[i]];
    }
    for (const tower of candidates) {
      const range = tower.getRange();
      const hasEnemyInRange = this.state.enemies.some(e => {
        const dx = e.x - tower.x, dy = e.y - tower.y;
        return dx * dx + dy * dy <= range * range;
      });
      if (hasEnemyInRange) {
        const t = tower.def.taunts[Math.floor(Math.random() * tower.def.taunts.length)];
        UI.spawnTaunt(t, tower.x, tower.y - 18);
        return;
      }
    }
  },

  onProjectileHit(p, target) {
    if (p.splash > 0) {
      // AOE
      for (const e of this.state.enemies) {
        if (e._dead || e.hp <= 0) continue;
        const dx = e.x - p.x, dy = e.y - p.y;
        if (dx*dx + dy*dy <= p.splash * p.splash) {
          this.damageEnemy(e, p.damage, p.srcTower);
          if (p.slow) e.slow = { factor: p.slow.factor, until: performance.now()/1000 + p.slow.duration };
        }
      }
      this.state.effects.push({ kind: 'explosion', x: p.x, y: p.y, life: 0.4, radius: p.splash, color: p.color });
      this.playSound('explode');
    } else {
      this.damageEnemy(target, p.damage, p.srcTower);
      if (p.slow) target.slow = { factor: p.slow.factor, until: performance.now()/1000 + p.slow.duration };
      this.state.effects.push({ kind: 'hit', x: p.x, y: p.y, life: 0.2, color: p.color });
    }
    UI.updateStats(this.state);
  },

  // ============ RENDER ============
  render() {
    const ctx = this.ctx;
    // Background — map-specific
    const map = this.currentMap || MAPS[0];
    ctx.fillStyle = map.bgColor || '#4a3520';
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    // Grid (faint)
    ctx.strokeStyle = 'rgba(0,0,0,0.1)';
    ctx.lineWidth = 1;
    for (let x = 0; x <= this.cols; x++) {
      ctx.beginPath();
      ctx.moveTo(x * this.cellSize, 0);
      ctx.lineTo(x * this.cellSize, this.canvas.height);
      ctx.stroke();
    }
    for (let y = 0; y <= this.rows; y++) {
      ctx.beginPath();
      ctx.moveTo(0, y * this.cellSize);
      ctx.lineTo(this.canvas.width, y * this.cellSize);
      ctx.stroke();
    }
    // Decorative grass patches
    ctx.fillStyle = '#5a4030';
    for (let i = 0; i < 30; i++) {
      const seed = (i * 73 + 13) % 1000;
      const x = (seed * 37) % this.canvas.width;
      const y = (seed * 19) % this.canvas.height;
      ctx.fillRect(x, y, 3, 3);
    }

    // Path
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#8b6914';
    ctx.lineWidth = 38;
    ctx.beginPath();
    ctx.moveTo(this.path[0].x, this.path[0].y);
    for (let i = 1; i < this.path.length; i++) ctx.lineTo(this.path[i].x, this.path[i].y);
    ctx.stroke();
    // Inner path — map-tinted
    ctx.strokeStyle = map.color || '#d4a574';
    ctx.lineWidth = 30;
    ctx.beginPath();
    ctx.moveTo(this.path[0].x, this.path[0].y);
    for (let i = 1; i < this.path.length; i++) ctx.lineTo(this.path[i].x, this.path[i].y);
    ctx.stroke();
    // Dashed center line
    ctx.strokeStyle = 'rgba(255,255,255,0.18)';
    ctx.lineWidth = 2;
    ctx.setLineDash([8, 6]);
    ctx.beginPath();
    ctx.moveTo(this.path[0].x, this.path[0].y);
    for (let i = 1; i < this.path.length; i++) ctx.lineTo(this.path[i].x, this.path[i].y);
    ctx.stroke();
    ctx.setLineDash([]);

    // Start/End markers
    ctx.font = '24px serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🍽️', this.path[0].x, this.path[0].y);
    const last = this.path[this.path.length - 1];
    ctx.fillText('🏠', last.x, last.y);

    // Time for sprite animations
    const renderTime = performance.now() / 1000;

    // Hover placement preview
    if (this.selectedTowerType && this.hoverCell) {
      const { cx, cy } = this.hoverCell;
      if (cx >= 0 && cx < this.cols && cy >= 0 && cy < this.rows) {
        const x = cx * this.cellSize + this.cellSize / 2;
        const y = cy * this.cellSize + this.cellSize / 2;
        const valid = this.buildGrid[cy][cx] === 0;
        // Range preview
        ctx.fillStyle = valid ? 'rgba(106,176,76,0.15)' : 'rgba(214,48,49,0.15)';
        ctx.strokeStyle = valid ? 'rgba(106,176,76,0.7)' : 'rgba(214,48,49,0.7)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(x, y, this.selectedTowerType.range * this.computeStat('rangeMult', 1), 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        // Tower ghost (or hero emoji)
        ctx.globalAlpha = 0.65;
        if (this.selectedTowerType._isHeroPick) {
          ctx.font = 'bold 28px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillStyle = this.selectedTowerType.color;
          ctx.fillText(this.selectedTowerType.emoji, x, y);
        } else {
          Sprites.drawTower(ctx, this.selectedTowerType.id, this.selectedTowerType, x, y, 36, renderTime, 0);
        }
        ctx.globalAlpha = 1.0;
      }
    }
    // Power targeting reticle
    if (this.state.pendingPowerTarget && this.hoverCell) {
      const power = POWERS.find(p => p.id === this.state.pendingPowerTarget);
      const mx = this.hoverCell.cx * this.cellSize + this.cellSize/2;
      const my = this.hoverCell.cy * this.cellSize + this.cellSize/2;
      if (power && power.radius) {
        ctx.strokeStyle = '#ff5500';
        ctx.fillStyle = 'rgba(255,85,0,0.15)';
        ctx.lineWidth = 2;
        ctx.setLineDash([6, 4]);
        ctx.beginPath(); ctx.arc(mx, my, power.radius, 0, Math.PI*2);
        ctx.fill(); ctx.stroke();
        ctx.setLineDash([]);
      }
      ctx.font = 'bold 24px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(power.icon, mx, my);
    }

    // Selected tower range
    if (this.selectedTower) {
      const t = this.selectedTower;
      ctx.fillStyle = 'rgba(255,215,0,0.10)';
      ctx.strokeStyle = 'rgba(255,215,0,0.6)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(t.x, t.y, t.getRange(), 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }

    // Aura ranges (subtle)
    for (const t of this.state.towers) {
      if (!t.def.aura) continue;
      ctx.strokeStyle = 'rgba(214,48,49,0.25)';
      ctx.setLineDash([4, 6]);
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(t.x, t.y, t.getRange(), 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Towers
    for (const t of this.state.towers) {
      // Tile base (subtle dark pad)
      ctx.fillStyle = 'rgba(0,0,0,0.3)';
      ctx.beginPath();
      ctx.ellipse(t.x, t.y + 16, 16, 5, 0, 0, Math.PI*2);
      ctx.fill();
      const totalUp = Object.values(t.upgrades).reduce((a, b) => a + b, 0);
      // Custom sprite (or hero-specific render)
      if (t.isHero) {
        // Hero medallion: glowing circle with emoji + level badge
        const pulse = 0.5 + Math.sin(renderTime * 3) * 0.5;
        ctx.save();
        // Hero aura ring
        if (t.heroDef.auraRange) {
          ctx.strokeStyle = `rgba(255, 215, 0, ${0.15 + pulse * 0.1})`;
          ctx.lineWidth = 1.5;
          ctx.setLineDash([4, 6]);
          ctx.beginPath(); ctx.arc(t.x, t.y, t.heroDef.auraRange, 0, Math.PI * 2); ctx.stroke();
          ctx.setLineDash([]);
        }
        // Outer glow disc
        const grad = ctx.createRadialGradient(t.x, t.y, 4, t.x, t.y, 26);
        grad.addColorStop(0, t.def.color + 'ee');
        grad.addColorStop(0.6, t.def.color + '88');
        grad.addColorStop(1, t.def.color + '00');
        ctx.fillStyle = grad;
        ctx.beginPath(); ctx.arc(t.x, t.y, 26, 0, Math.PI * 2); ctx.fill();
        // Hero emoji
        ctx.font = 'bold 28px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(t.def.emoji, t.x, t.y);
        // Level badge
        ctx.fillStyle = '#ffd700';
        ctx.strokeStyle = '#2a1810';
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(t.x + 14, t.y + 12, 9, 0, Math.PI*2); ctx.fill(); ctx.stroke();
        ctx.fillStyle = '#2a1810';
        ctx.font = 'bold 11px sans-serif';
        ctx.fillText(t.level, t.x + 14, t.y + 12);
        // Precision marker line (if active)
        if (t.precisionTarget && !t.precisionTarget._dead) {
          ctx.strokeStyle = 'rgba(39,174,96,0.7)';
          ctx.lineWidth = 1.5;
          ctx.setLineDash([5, 4]);
          ctx.beginPath();
          ctx.moveTo(t.x, t.y);
          ctx.lineTo(t.precisionTarget.x, t.precisionTarget.y);
          ctx.stroke();
          ctx.setLineDash([]);
        }
        // Ability ready indicator
        const cdLeft = Math.max(0, (t.abilityReadyAt || 0) - renderTime);
        if (cdLeft <= 0 && t.level >= (t.ability?.unlockLevel || 1)) {
          ctx.strokeStyle = `rgba(255, 215, 0, ${0.5 + pulse * 0.5})`;
          ctx.lineWidth = 2;
          ctx.beginPath(); ctx.arc(t.x, t.y, 22, 0, Math.PI * 2); ctx.stroke();
        }
        ctx.restore();
      } else {
        Sprites.drawTower(ctx, t.def.id, t.def, t.x, t.y, 38, renderTime, totalUp);
      }
      // Lasagna aura visual
      if (t.def.aura) {
        ctx.fillStyle = 'rgba(214,48,49,0.05)';
        ctx.beginPath();
        ctx.arc(t.x, t.y, t.getRange(), 0, Math.PI * 2);
        ctx.fill();
      }
      // Linguine beam
      if (t.def.pierce && t.laserTarget && !t.laserTarget._dead) {
        ctx.strokeStyle = t.def.color;
        ctx.lineWidth = 4;
        ctx.globalAlpha = 0.4;
        ctx.beginPath();
        ctx.moveTo(t.x, t.y);
        const tx = t.laserTarget.x, ty = t.laserTarget.y;
        const dx = tx - t.x, dy = ty - t.y;
        const len = Math.hypot(dx, dy) || 1;
        const r = t.getRange();
        ctx.lineTo(t.x + dx/len * r, t.y + dy/len * r);
        ctx.stroke();
        ctx.globalAlpha = 1;
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = '#fff';
        ctx.beginPath();
        ctx.moveTo(t.x, t.y);
        ctx.lineTo(t.x + dx/len * r, t.y + dy/len * r);
        ctx.stroke();
      }
    }

    // Projectiles — custom canvas sprites
    for (const p of this.state.projectiles) {
      Sprites.drawProjectile(ctx, p);
    }

    // Enemies — custom canvas sprites
    const nowS = performance.now() / 1000;
    for (const e of this.state.enemies) {
      const sz = 36 * (e.scale || 1);
      // Soft shadow under enemy
      ctx.fillStyle = 'rgba(0,0,0,0.35)';
      ctx.beginPath();
      ctx.ellipse(e.x, e.y + sz/2 - 2, sz/2.2, sz/7, 0, 0, Math.PI*2);
      ctx.fill();
      // Flashing white tint when hit
      const flashing = nowS < e.flashUntil;
      Sprites.drawEnemy(ctx, e.type, e.def, e.x, e.y, sz, renderTime, { flash: flashing });
      if (flashing) {
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        ctx.globalAlpha = 0.45;
        ctx.fillStyle = '#ffffff';
        ctx.beginPath(); ctx.arc(e.x, e.y, sz/2, 0, Math.PI*2); ctx.fill();
        ctx.restore();
      }
      // HP Bar
      const hpw = sz * 1.0;
      const hpr = e.hp / e.maxHp;
      ctx.fillStyle = 'rgba(0,0,0,0.75)';
      ctx.fillRect(e.x - hpw/2 - 1, e.y - sz/2 - 10, hpw + 2, 5);
      ctx.fillStyle = hpr > 0.5 ? '#6ab04c' : (hpr > 0.25 ? '#f5d76e' : '#d63031');
      ctx.fillRect(e.x - hpw/2, e.y - sz/2 - 9, hpw * hpr, 3);
      // Slow indicator
      if (e.slow) {
        ctx.strokeStyle = '#74b9ff';
        ctx.lineWidth = 2;
        ctx.setLineDash([3,3]);
        ctx.beginPath();
        ctx.arc(e.x, e.y, sz/2 + 4, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
      }
      // === Status effect icons (small badges around enemy) ===
      const badges = [];
      if (e.burn && nowS < e.burn.until) badges.push({ icon: '🔥', color: '#ff5500' });
      if (e.frozen && nowS < e.frozen.until) badges.push({ icon: '❄', color: '#74b9ff' });
      if (e.stun && nowS < e.stun.until) badges.push({ icon: '⚡', color: '#ffd700' });
      if (e.marked && nowS < e.marked.until) badges.push({ icon: '🎯', color: '#27ae60' });
      if (e.shield > 0) badges.push({ icon: '🛡', color: '#74b9ff', count: e.shield });
      if (e.def && e.def.regen) badges.push({ icon: '💚', color: '#6ab04c' });
      if (e.bossPhase >= 1) badges.push({ icon: '⚔', color: '#e74c3c' });
      badges.forEach((b, i) => {
        const bx = e.x + (i - (badges.length - 1) / 2) * 10;
        const by = e.y - sz/2 - 16;
        ctx.font = 'bold 11px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillStyle = b.color;
        ctx.strokeStyle = 'rgba(0,0,0,0.85)';
        ctx.lineWidth = 3;
        ctx.strokeText(b.icon, bx, by);
        ctx.fillText(b.icon, bx, by);
        if (b.count !== undefined) {
          ctx.fillStyle = '#fff';
          ctx.font = 'bold 8px sans-serif';
          ctx.strokeText(b.count, bx, by + 5);
          ctx.fillText(b.count, bx, by + 5);
        }
      });
      // Burn fire flicker overlay
      if (e.burn && nowS < e.burn.until) {
        ctx.save();
        ctx.globalAlpha = 0.35 + Math.sin(nowS * 18) * 0.15;
        ctx.fillStyle = '#ff6b00';
        ctx.beginPath(); ctx.arc(e.x, e.y, sz/2 + 2, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
      }
      // Frozen blue overlay
      if (e.frozen && nowS < e.frozen.until) {
        ctx.save();
        ctx.globalAlpha = 0.35;
        ctx.fillStyle = '#74b9ff';
        ctx.beginPath(); ctx.arc(e.x, e.y, sz/2 + 2, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
      }
      // Boss label
      if (e.isBoss) {
        ctx.fillStyle = '#ff6b6b';
        ctx.strokeStyle = 'rgba(0,0,0,0.8)';
        ctx.lineWidth = 3;
        ctx.font = 'bold 11px sans-serif';
        ctx.textAlign = 'center';
        ctx.strokeText(e.def.name, e.x, e.y + sz/2 + 14);
        ctx.fillText(e.def.name, e.x, e.y + sz/2 + 14);
      }
    }

    // Effects
    for (const f of this.state.effects) {
      if (f.kind === 'explosion') {
        ctx.fillStyle = f.color;
        ctx.globalAlpha = f.life / 0.4;
        ctx.beginPath();
        ctx.arc(f.x, f.y, f.radius * (1 - f.life / 0.4 + 0.3), 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      } else if (f.kind === 'pop') {
        ctx.fillStyle = f.color;
        ctx.globalAlpha = f.life / 0.5;
        ctx.beginPath();
        ctx.arc(f.x, f.y, (0.5 - f.life) * 60 + 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      } else if (f.kind === 'hit') {
        ctx.fillStyle = f.color;
        ctx.globalAlpha = f.life / 0.2;
        ctx.beginPath();
        ctx.arc(f.x, f.y, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      } else if (f.kind === 'text') {
        ctx.fillStyle = f.color;
        ctx.globalAlpha = Math.min(1, f.life * 2);
        ctx.font = 'bold 14px sans-serif';
        ctx.textAlign = 'center';
        ctx.strokeStyle = 'rgba(0,0,0,0.7)';
        ctx.lineWidth = 3;
        ctx.strokeText(f.text, f.x, f.y);
        ctx.fillText(f.text, f.x, f.y);
        ctx.globalAlpha = 1;
      } else if (f.kind === 'lightning') {
        // Jagged lightning bolt between two points
        ctx.strokeStyle = '#ffffff';
        ctx.shadowColor = '#74b9ff';
        ctx.shadowBlur = 10;
        ctx.lineWidth = 2;
        ctx.globalAlpha = Math.min(1, f.life / 0.25);
        ctx.beginPath();
        const segs = 5;
        let px = f.x1, py = f.y1;
        ctx.moveTo(px, py);
        for (let s = 1; s <= segs; s++) {
          const t = s / segs;
          const tx = f.x1 + (f.x2 - f.x1) * t + (s < segs ? (Math.random() - 0.5) * 12 : 0);
          const ty = f.y1 + (f.y2 - f.y1) * t + (s < segs ? (Math.random() - 0.5) * 12 : 0);
          ctx.lineTo(tx, ty);
          px = tx; py = ty;
        }
        ctx.stroke();
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1;
      } else if (f.kind === 'flash') {
        ctx.fillStyle = f.color || '#ffffff';
        ctx.globalAlpha = (f.life / 0.5) * 0.5;
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        ctx.globalAlpha = 1;
      }
    }
  },

  // ============ SAVE ============
  saveGame(showToast) {
    if (!this.save) return;
    // Don't write a "dead" lastRun (lives <= 0) so we don't auto-resume into game-over state
    let lastRun = this.save.lastRun || null;
    if (this.state && this.state.lives > 0) {
      lastRun = {
        wave: this.state.wave,
        gold: this.state.gold,
        lives: this.state.lives,
        maxLives: this.state.maxLives,
        marks: this.state.marks,
        score: this.state.score,
        skillPoints: this.state.skillPoints,
        endlessMode: this.state.endlessMode,
        mapId: this.state.mapId,
        towers: (this.state.towers || []).map(t => ({
          defId: t.def.id, x: t.x, y: t.y, upgrades: t.upgrades, kills: t.kills, totalSpent: t.totalSpent,
          targetMode: t.targetMode,
          isHero: !!t.isHero, heroId: t.isHero ? t.heroDef.id : null,
          level: t.level || 0, xp: t.xp || 0, xpNext: t.xpNext || 100,
          abilityReadyAt: t.abilityReadyAt || 0
        })),
        heroId: this.state.heroId,
        heroPlaced: this.state.heroPlaced,
        boons: this.state.boons || [],
        boonKeystonesUsed: this.state.boonKeystonesUsed || [],
        powerCooldowns: this.state.powerCooldowns || {}
      };
    } else if (this.state && this.state.lives <= 0) {
      lastRun = null; // wipe on death
    }
    const data = Object.assign({}, this.save, { lastRun });
    const ok = SaveSystem.save(data);
    if (ok && showToast) UI.toast('💾 Saved!');
    this.save = data;
  },

  // ============ SOUND (Web Audio API) ============
  ensureAudio() {
    if (!this.audioCtx) {
      try { this.audioCtx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) {}
    }
  },
  playSound(type) {
    this.ensureAudio();
    if (!this.audioCtx) return;
    const ctx = this.audioCtx;
    const now = ctx.currentTime;
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.connect(g); g.connect(ctx.destination);
    switch (type) {
      case 'shoot':
        o.type = 'square'; o.frequency.setValueAtTime(700, now); o.frequency.exponentialRampToValueAtTime(300, now + 0.05);
        g.gain.setValueAtTime(0.04, now); g.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
        o.start(now); o.stop(now + 0.06); break;
      case 'kill':
        o.type = 'triangle'; o.frequency.setValueAtTime(400, now); o.frequency.exponentialRampToValueAtTime(80, now + 0.15);
        g.gain.setValueAtTime(0.06, now); g.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
        o.start(now); o.stop(now + 0.16); break;
      case 'bossDie':
        o.type = 'sawtooth'; o.frequency.setValueAtTime(200, now); o.frequency.exponentialRampToValueAtTime(40, now + 0.6);
        g.gain.setValueAtTime(0.18, now); g.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
        o.start(now); o.stop(now + 0.7); break;
      case 'place':
        o.type = 'sine'; o.frequency.setValueAtTime(600, now); o.frequency.exponentialRampToValueAtTime(900, now + 0.1);
        g.gain.setValueAtTime(0.08, now); g.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
        o.start(now); o.stop(now + 0.12); break;
      case 'sell':
        o.type = 'sine'; o.frequency.setValueAtTime(800, now); o.frequency.exponentialRampToValueAtTime(400, now + 0.15);
        g.gain.setValueAtTime(0.08, now); g.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
        o.start(now); o.stop(now + 0.16); break;
      case 'upgrade':
        o.type = 'sine'; o.frequency.setValueAtTime(440, now); o.frequency.linearRampToValueAtTime(880, now + 0.2);
        g.gain.setValueAtTime(0.1, now); g.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
        o.start(now); o.stop(now + 0.22); break;
      case 'error':
        o.type = 'square'; o.frequency.setValueAtTime(120, now);
        g.gain.setValueAtTime(0.08, now); g.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
        o.start(now); o.stop(now + 0.16); break;
      case 'waveStart':
        o.type = 'triangle';
        o.frequency.setValueAtTime(220, now); o.frequency.linearRampToValueAtTime(440, now + 0.2); o.frequency.linearRampToValueAtTime(660, now + 0.4);
        g.gain.setValueAtTime(0.1, now); g.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
        o.start(now); o.stop(now + 0.6); break;
      case 'lifeLost':
        o.type = 'sawtooth'; o.frequency.setValueAtTime(150, now); o.frequency.exponentialRampToValueAtTime(50, now + 0.3);
        g.gain.setValueAtTime(0.15, now); g.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
        o.start(now); o.stop(now + 0.32); break;
      case 'explode':
        // Noise burst
        const buf = ctx.createBuffer(1, ctx.sampleRate * 0.2, ctx.sampleRate);
        const d = buf.getChannelData(0);
        for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / d.length);
        const src = ctx.createBufferSource();
        src.buffer = buf;
        const g2 = ctx.createGain();
        g2.gain.value = 0.15;
        src.connect(g2); g2.connect(ctx.destination);
        src.start(now);
        return;
    }
  }
};

// Resume last run if exists
function resumeRunIfAvailable() {
  if (!Game.save.lastRun) return;
  const lr = Game.save.lastRun;
  if (typeof lr.wave !== 'number') return;
  // If the saved run is from a different map, skip resume (path doesn't match)
  const currentMapId = Game.save.selectedMap || 'kitchen';
  if (lr.mapId && lr.mapId !== currentMapId) return;
  // Resume if there's any progress: wave, towers, skills, or extra marks
  const startMarks = (Game.save.prestigePerks && (Game.save.prestigePerks.startMarks || 0)) * 1;
  const hasProgress = lr.wave > 0
    || (lr.towers && lr.towers.length > 0)
    || (lr.skillPoints && Object.keys(lr.skillPoints).length > 0)
    || ((lr.marks || 0) > startMarks);
  if (!hasProgress) return;
  // Restore state
  Game.state.wave = lr.wave;
  Game.state.gold = lr.gold;
  Game.state.lives = lr.lives;
  Game.state.maxLives = lr.maxLives;
  Game.state.marks = lr.marks;
  Game.state.score = lr.score;
  Game.state.skillPoints = lr.skillPoints || {};
  Game.state.endlessMode = !!lr.endlessMode;
  Game.state.towers = [];
  // EPIC: restore hero + boon state
  Game.state.heroId = lr.heroId || null;
  Game.state.heroPlaced = !!lr.heroPlaced;
  Game.state.boons = lr.boons || [];
  Game.state.boonKeystonesUsed = lr.boonKeystonesUsed || [];
  Game.state.powerCooldowns = lr.powerCooldowns || {};
  if (lr.towers) {
    for (const td of lr.towers) {
      let tower;
      if (td.isHero && td.heroId) {
        const heroDef = HEROES.find(h => h.id === td.heroId);
        if (!heroDef) continue;
        tower = Game.makeHero(heroDef, td.x, td.y);
        tower.level = td.level || 1;
        tower.xp = td.xp || 0;
        tower.xpNext = td.xpNext || 100;
        tower.kills = td.kills || 0;
        tower.abilityReadyAt = td.abilityReadyAt || 0;
        tower.targetMode = td.targetMode || 'first';
      } else {
        const def = TOWERS.find(t => t.id === td.defId);
        if (!def) continue;
        tower = Game.makeTower(def, td.x, td.y);
        tower.upgrades = Object.assign(tower.upgrades, td.upgrades || {});
        tower.kills = td.kills || 0;
        tower.totalSpent = td.totalSpent || def.cost;
        tower.targetMode = td.targetMode || 'first';
      }
      Game.state.towers.push(tower);
      const cx = Math.floor(td.x / Game.cellSize);
      const cy = Math.floor(td.y / Game.cellSize);
      if (Game.buildGrid[cy]) Game.buildGrid[cy][cx] = 2;
    }
  }
  UI.renderTowerShop();
  UI.renderWavePreview();
  UI.updateStats(Game.state);
  UI.renderPowersBar();
  // If hero was already chosen, dismiss the hero-select modal that newRun queued
  if (lr.heroId && UI.el.heroSelectModal) UI.el.heroSelectModal.classList.remove('visible');
  if (UI.el.btnStartWave) UI.el.btnStartWave.textContent = '▶ Start Wave ' + (Game.state.wave + 1);
}

// Hook into game start to restore
const _origStart = Game.start.bind(Game);
Game.start = function() {
  _origStart();
  resumeRunIfAvailable();
};

// Boot
window.addEventListener('load', () => {
  UI.init();
  Game.init();
});
