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

  init() {
    this.canvas = document.getElementById('game');
    this.ctx = this.canvas.getContext('2d');
    this.cols = Math.floor(this.canvas.width / this.cellSize);
    this.rows = Math.floor(this.canvas.height / this.cellSize);
    this.generatePath();

    // Input
    this.canvas.addEventListener('mousemove', e => this.onMouseMove(e));
    this.canvas.addEventListener('click', e => this.onClick(e));
    this.canvas.addEventListener('mouseleave', () => { this.hoverCell = null; });

    // Buttons
    UI.el.btnStartWave.addEventListener('click', () => this.startWave());
    UI.el.btnPause.addEventListener('click', () => this.togglePause());
    UI.el.btnSpeed.addEventListener('click', () => this.cycleSpeed());
    UI.el.btnRestart.addEventListener('click', () => {
      UI.el.gameOverModal.classList.remove('visible');
      this.newRun();
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
    this.running = true;
    requestAnimationFrame(this.loop.bind(this));
  },

  newRun(firstStart) {
    this.state = makeRunState(this.save);
    this.selectedTowerType = null;
    this.selectedTower = null;
    this.spawnQueue = [];
    this.bossAlive = false;
    this.endlessWave = 0;
    this.buildGrid = Array.from({ length: this.rows }, () => new Array(this.cols).fill(0));
    this.markPathOnGrid();
    UI.hideUpgradePanel();
    UI.renderTowerShop();
    UI.renderWavePreview();
    UI.updateStats(this.state);
    UI.setFooter('🍝 Pick a pasta and place it. Hit Start Wave when ready!');
    if (firstStart) UI.banner('Get cooking! 🍝', 1500);
  },

  // ============ PATH GENERATION ============
  generatePath() {
    // Hand-crafted path through the canvas grid: winding S-curve
    const cs = this.cellSize;
    // Path waypoints (in cell coords). Canvas is 20 cols x 15 rows (800x600 / 40).
    const pts = [
      [0, 2], [4, 2], [4, 6], [10, 6], [10, 2], [14, 2], [14, 10], [6, 10], [6, 13], [16, 13], [16, 5], [19, 5], [19, 14]
    ];
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
      getDamage() {
        const base = this.def.damage + (this.upgrades.damage || 0) * (this.def.upgrades.damage?.increment || 0);
        const auraBoost = Game.computeAuraBoost(this);
        const skill = Game.computeStat('damageMult', 1) * (1 + auraBoost);
        const perk = 1 + (Game.save.prestigePerks.globalDmg || 0) * 0.05;
        return base * skill * perk;
      },
      getRange() {
        const base = this.def.range + (this.upgrades.range || 0) * (this.def.upgrades.range?.increment || 0);
        return base * Game.computeStat('rangeMult', 1);
      },
      getFireRate() {
        const base = this.def.fireRate + (this.upgrades.fireRate || 0) * (this.def.upgrades.fireRate?.increment || 0);
        return base * Game.computeStat('fireRateMult', 1);
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
        return this.def.slow.duration + (this.upgrades.slowDuration || 0) * (this.def.upgrades.slowDuration?.increment || 0);
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
    const cost = Math.floor(upDef.cost * Math.pow(1.5, lvl));
    if (this.state.gold < cost) { UI.toast('Not enough gold!'); return; }
    this.state.gold -= cost;
    tower.upgrades[key] = lvl + 1;
    tower.totalSpent += cost;
    this.playSound('upgrade');
    UI.showUpgradePanel(tower);
    UI.updateStats(this.state);
    UI.renderTowerShop();
  },

  sellTower(tower) {
    const refund = Math.floor(tower.totalSpent * 0.7);
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

  // ============ ENEMIES ============
  spawnEnemy(type) {
    const def = ENEMIES[type];
    if (!def) return;
    const scale = 1 + this.endlessWave * 0.25;
    const hpScale = this.state.endlessMode ? scale * scale : 1;
    const goldScale = this.state.endlessMode ? scale : 1;
    const enemy = {
      type,
      def,
      x: this.path[0].x,
      y: this.path[0].y,
      hp: def.hp * hpScale,
      maxHp: def.hp * hpScale,
      speed: def.speed * (1 + (Game.computeStat('enemySpeedMult', 0))),
      baseSpeed: def.speed,
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
      flashUntil: 0
    };
    this.state.enemies.push(enemy);
    if (enemy.isBoss) this.bossAlive = true;
  },

  damageEnemy(enemy, amount, srcTower) {
    if (enemy.hp <= 0) return;
    // Crit
    const critChance = this.computeStat('critChance', 0) + (this.save.prestigePerks.critBase || 0) * 0.03;
    let dmg = amount;
    if (Math.random() < critChance) {
      dmg *= 2;
      this.state.effects.push({ kind: 'text', text: 'CRIT!', x: enemy.x, y: enemy.y - 20, life: 0.6, vy: -40, color: '#ffd700' });
    }
    // Armor reduces damage
    if (enemy.armor) dmg *= (1 - enemy.armor);
    enemy.hp -= dmg;
    enemy.flashUntil = performance.now() / 1000 + 0.08;
    if (enemy.hp <= 0) {
      this.killEnemy(enemy, srcTower);
    }
  },

  killEnemy(enemy, srcTower) {
    if (enemy._dead) return;
    enemy._dead = true;
    let gold = enemy.gold;
    gold *= this.computeStat('goldMult', 1);
    gold *= 1 + (this.save.prestigePerks.globalGold || 0) * 0.05;
    gold = Math.floor(gold);
    this.state.gold += gold;
    this.state.score += Math.floor(enemy.maxHp * 0.5);
    if (srcTower) srcTower.kills = (srcTower.kills || 0) + 1;
    this.state.effects.push({ kind: 'pop', x: enemy.x, y: enemy.y, life: 0.5, color: enemy.def.color });
    this.state.effects.push({ kind: 'text', text: '+' + gold, x: enemy.x, y: enemy.y - 10, life: 0.7, vy: -30, color: '#ffd700' });
    this.playSound(enemy.isBoss ? 'bossDie' : 'kill');
    if (enemy.isBoss) this.bossAlive = false;
  },

  // ============ TARGETING ============
  pickTarget(tower, enemies) {
    const range = tower.getRange();
    let best = null;
    let bestDist = Infinity;
    for (const e of enemies) {
      if (e.hp <= 0 || e._dead) continue;
      const dx = e.x - tower.x, dy = e.y - tower.y;
      const d = dx*dx + dy*dy;
      if (d > range * range) continue;
      // Prefer enemy furthest along path (closest to goal)
      const score = -e.pathDist;
      if (score < bestDist) {
        bestDist = score;
        best = e;
      }
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
    return val;
  },

  computeAuraBoost(tower) {
    let boost = 0;
    for (const other of this.state.towers) {
      if (other === tower) continue;
      if (!other.def.aura) continue;
      const r = other.getRange();
      const dx = other.x - tower.x, dy = other.y - tower.y;
      if (dx*dx + dy*dy <= r*r) {
        boost += other.getAura();
      }
    }
    return boost;
  },

  // ============ WAVES ============
  startWave() {
    if (this.state.waveActive) return;
    if (this.state.wave >= MAX_WAVES && !this.state.endlessMode) return;
    this.state.waveActive = true;
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
    // Increasingly hard random pool
    const pool = ['tomato', 'pepperoni', 'olive', 'basil', 'mozzarella', 'parmesan', 'pizza', 'spicyPepper', 'pastaSauce', 'anchovy'];
    const count = 15 + n * 5;
    const enemies = [];
    for (let i = 0; i < count; i++) {
      enemies.push({ type: pool[Math.floor(Math.random() * pool.length)], count: 1, spacing: 0.4 });
    }
    if (n % 3 === 0) enemies.push({ type: 'cheeseWheel', count: Math.min(5, Math.floor(n / 3)), spacing: 2.0 });
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
    const waveBonus = Math.floor(wave.reward * this.computeStat('waveBonusMult', 1));
    this.state.gold += waveBonus;
    // Interest
    const interest = this.computeStat('interest', 0);
    if (interest > 0) this.state.gold += Math.floor(this.state.gold * interest);
    // Marinara mark
    let marks = 1;
    if (wave.boss) marks += 2;
    if (wave.final) marks += 5;
    this.state.marks += marks;
    // Life regen
    const regen = this.computeStat('lifeRegen', 0);
    if (regen > 0 && (waveIdx + 1) % 5 === 0) {
      this.state.lives = Math.min(this.state.maxLives, this.state.lives + Math.floor(regen));
    }
    this.state.wave++;
    if (this.state.wave > this.save.highWave) this.save.highWave = this.state.wave;

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
    this.saveGame(true);
    UI.el.prestigeModal.classList.remove('visible');
    UI.banner(`🍅 +${gain} Sauce!`, 2000);
    this.newRun();
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
    const cost = node.costs[lvl];
    if (this.state.marks < cost) { UI.toast('Not enough marks!'); return; }
    this.state.marks -= cost;
    this.state.skillPoints[nodeId] = lvl + 1;
    // Apply effects that modify state directly
    if (node.effect.type === 'maxLives') {
      this.state.maxLives += node.effect.value;
      this.state.lives += node.effect.value;
    }
    UI.updateStats(this.state);
    UI.renderTowerShop();
    this.playSound('upgrade');
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

    // Click existing tower?
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
    const speeds = allowed3x ? [1, 2, 3] : [1, 2];
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
    for (let i = enemies.length - 1; i >= 0; i--) {
      const e = enemies[i];
      if (e._dead || e.hp <= 0) { enemies.splice(i, 1); continue; }
      // Slow effect
      let speedFactor = 1;
      if (e.slow && performance.now() / 1000 < e.slow.until) {
        speedFactor = 1 - e.slow.factor;
      } else {
        e.slow = null;
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
        const damage = e.isBoss ? Math.max(3, Math.floor(e.maxHp / 1000)) : 1;
        this.state.lives -= damage;
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
      if (tower.fireCooldown > 0) continue;
      // Find target
      const target = this.pickTarget(tower, enemies);
      tower.target = target;
      if (!target) continue;
      tower.fireCooldown = 1 / fr;
      // Spawn projectile
      const proj = {
        x: tower.x, y: tower.y,
        targetEnemy: target,
        speed: tower.def.projectileSpeed || 500,
        damage: tower.getDamage(),
        splash: tower.getSplash(),
        slow: tower.def.slow ? { factor: tower.getSlowFactor(), duration: tower.getSlowDuration() } : null,
        symbol: tower.def.projectile || '•',
        color: tower.def.color,
        srcTower: tower,
        life: 3
      };
      this.state.projectiles.push(proj);
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
        projs.splice(i, 1);
      } else {
        p.x += (dx / d) * step;
        p.y += (dy / d) * step;
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

    // Check wave end
    if (this.state.waveActive && this.spawnQueue.length === 0 && enemies.length === 0) {
      this.finishWave();
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
    // Background
    ctx.fillStyle = '#4a3520';
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
    // Inner path
    ctx.strokeStyle = '#d4a574';
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
        // Tower ghost
        ctx.globalAlpha = 0.7;
        ctx.font = '28px serif';
        ctx.fillText(this.selectedTowerType.emoji, x, y);
        ctx.globalAlpha = 1.0;
      }
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
      // Base
      ctx.fillStyle = 'rgba(0,0,0,0.25)';
      ctx.beginPath();
      ctx.arc(t.x, t.y + 14, 14, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = t.def.color;
      ctx.globalAlpha = 0.5;
      ctx.beginPath();
      ctx.arc(t.x, t.y, 18, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
      // Emoji
      ctx.font = '28px serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(t.def.emoji, t.x, t.y);
      // Upgrade dots
      const totalUp = Object.values(t.upgrades).reduce((a, b) => a + b, 0);
      if (totalUp > 0) {
        ctx.fillStyle = '#ffd700';
        for (let i = 0; i < Math.min(totalUp, 6); i++) {
          ctx.beginPath();
          ctx.arc(t.x - 14 + i * 5, t.y - 18, 2, 0, Math.PI * 2);
          ctx.fill();
        }
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

    // Projectiles
    for (const p of this.state.projectiles) {
      ctx.fillStyle = p.color || '#fff';
      ctx.font = '16px serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(p.symbol, p.x, p.y);
    }

    // Enemies
    const nowS = performance.now() / 1000;
    for (const e of this.state.enemies) {
      const sz = 26 * (e.scale || 1);
      // Shadow
      ctx.fillStyle = 'rgba(0,0,0,0.3)';
      ctx.beginPath();
      ctx.ellipse(e.x, e.y + sz/3, sz/2.5, sz/6, 0, 0, Math.PI*2);
      ctx.fill();
      // Body
      ctx.font = sz + 'px serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      if (nowS < e.flashUntil) {
        ctx.fillStyle = '#fff';
        ctx.fillRect(e.x - sz/2, e.y - sz/2, sz, sz);
      }
      ctx.fillStyle = '#000';
      ctx.fillText(e.def.emoji, e.x, e.y);
      // HP Bar
      const hpw = sz * 1.2;
      const hpr = e.hp / e.maxHp;
      ctx.fillStyle = 'rgba(0,0,0,0.7)';
      ctx.fillRect(e.x - hpw/2 - 1, e.y - sz/2 - 8, hpw + 2, 5);
      ctx.fillStyle = hpr > 0.5 ? '#6ab04c' : (hpr > 0.25 ? '#f5d76e' : '#d63031');
      ctx.fillRect(e.x - hpw/2, e.y - sz/2 - 7, hpw * hpr, 3);
      // Slow indicator
      if (e.slow) {
        ctx.strokeStyle = '#9b59b6';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(e.x, e.y, sz/2 + 4, 0, Math.PI * 2);
        ctx.stroke();
      }
      // Boss label
      if (e.isBoss) {
        ctx.fillStyle = '#ff6b6b';
        ctx.font = 'bold 11px sans-serif';
        ctx.fillText(e.def.name, e.x, e.y + sz/2 + 12);
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
        ctx.fillText(f.text, f.x, f.y);
        ctx.globalAlpha = 1;
      }
    }
  },

  // ============ SAVE ============
  saveGame(showToast) {
    if (!this.save) return;
    // Persist meta state only (sauce, perks, etc); also persist current run for resume
    const data = Object.assign({}, this.save, {
      lastRun: {
        wave: this.state.wave,
        gold: this.state.gold,
        lives: this.state.lives,
        maxLives: this.state.maxLives,
        marks: this.state.marks,
        score: this.state.score,
        skillPoints: this.state.skillPoints,
        endlessMode: this.state.endlessMode,
        towers: this.state.towers.map(t => ({
          defId: t.def.id, x: t.x, y: t.y, upgrades: t.upgrades, kills: t.kills, totalSpent: t.totalSpent
        }))
      }
    });
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
  // Only resume if user has not prestiged since (i.e., quick reload)
  if (typeof lr.wave !== 'number') return;
  if (lr.wave === 0 && (!lr.towers || lr.towers.length === 0)) return;
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
  if (lr.towers) {
    for (const td of lr.towers) {
      const def = TOWERS.find(t => t.id === td.defId);
      if (!def) continue;
      const tower = Game.makeTower(def, td.x, td.y);
      tower.upgrades = Object.assign(tower.upgrades, td.upgrades || {});
      tower.kills = td.kills || 0;
      tower.totalSpent = td.totalSpent || def.cost;
      Game.state.towers.push(tower);
      const cx = Math.floor(td.x / Game.cellSize);
      const cy = Math.floor(td.y / Game.cellSize);
      if (Game.buildGrid[cy]) Game.buildGrid[cy][cx] = 2;
    }
  }
  UI.renderTowerShop();
  UI.renderWavePreview();
  UI.updateStats(Game.state);
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
