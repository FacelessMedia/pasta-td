/* ============== PASTA TD UI ============== */
const UI = {
  el: {},

  init() {
    this.el = {
      loginScreen: document.getElementById('loginScreen'),
      menuScreen: document.getElementById('menuScreen'),
      gameScreen: document.getElementById('gameScreen'),
      tabBtns: document.querySelectorAll('.tab-btn'),
      tabPanels: document.querySelectorAll('.tab-panel'),
      loginUser: document.getElementById('loginUser'),
      loginPass: document.getElementById('loginPass'),
      loginMsg: document.getElementById('loginMsg'),
      regUser: document.getElementById('regUser'),
      regPass: document.getElementById('regPass'),
      regMsg: document.getElementById('regMsg'),
      btnLogin: document.getElementById('btnLogin'),
      btnRegister: document.getElementById('btnRegister'),
      btnGuest: document.getElementById('btnGuest'),
      userLabel: document.getElementById('userLabel'),
      menuUserLabel: document.getElementById('menuUserLabel'),
      menuSummary: document.getElementById('menuSummary'),

      // Menu buttons
      mnuPlay: document.getElementById('mnuPlay'),
      mnuTutorial: document.getElementById('mnuTutorial'),
      mnuBestiary: document.getElementById('mnuBestiary'),
      mnuSkillTree: document.getElementById('mnuSkillTree'),
      mnuPrestige: document.getElementById('mnuPrestige'),
      mnuLogout: document.getElementById('mnuLogout'),

      // Map select
      mapScreen: document.getElementById('mapScreen'),
      mapGrid: document.getElementById('mapGrid'),
      btnMapBack: document.getElementById('btnMapBack'),

      // Stats
      statLives: document.getElementById('statLives'),
      statGold: document.getElementById('statGold'),
      statMarks: document.getElementById('statMarks'),
      statSauce: document.getElementById('statSauce'),
      statWave: document.getElementById('statWave'),
      statMaxWave: document.getElementById('statMaxWave'),
      statScore: document.getElementById('statScore'),

      towerShop: document.getElementById('towerShop'),
      towerInfo: document.getElementById('towerInfo'),
      upgradePanel: document.getElementById('upgradePanel'),
      wavePreview: document.getElementById('wavePreview'),
      enemyHoverPanel: document.getElementById('enemyHoverPanel'),
      footerMsg: document.getElementById('footerMsg'),
      toast: document.getElementById('toast'),
      waveBanner: document.getElementById('waveBanner'),
      canvasWrap: document.querySelector('.canvas-wrap'),

      btnStartWave: document.getElementById('btnStartWave'),
      btnPause: document.getElementById('btnPause'),
      btnSpeed: document.getElementById('btnSpeed'),
      btnSave: document.getElementById('btnSave'),
      btnSkillTree: document.getElementById('btnSkillTree'),
      btnPrestige: document.getElementById('btnPrestige'),
      btnBestiary: document.getElementById('btnBestiary'),
      btnMenu: document.getElementById('btnMenu'),
      btnOpenTutorial: document.getElementById('btnOpenTutorial'),
      btnTutorialDone: document.getElementById('btnTutorialDone'),

      // Modals
      skillTreeModal: document.getElementById('skillTreeModal'),
      skillTreeGrid: document.getElementById('skillTreeGrid'),
      marksDisplay: document.getElementById('marksDisplay'),
      prestigeModal: document.getElementById('prestigeModal'),
      prestigeInfo: document.getElementById('prestigeInfo'),
      prestigePerks: document.getElementById('prestigePerks'),
      btnDoPrestige: document.getElementById('btnDoPrestige'),
      bestiaryModal: document.getElementById('bestiaryModal'),
      bestiaryGrid: document.getElementById('bestiaryGrid'),
      tutorialModal: document.getElementById('tutorialModal'),
      enemyIntroModal: document.getElementById('enemyIntroModal'),
      enemyIntroBody: document.getElementById('enemyIntroBody'),
      btnEnemyIntroOK: document.getElementById('btnEnemyIntroOK'),
      // EPIC: heroes / boons / powers
      heroSelectModal: document.getElementById('heroSelectModal'),
      heroSelectGrid: document.getElementById('heroSelectGrid'),
      boonModal: document.getElementById('boonModal'),
      boonChoices: document.getElementById('boonChoices'),
      powersBar: document.getElementById('powersBar'),

      gameOverModal: document.getElementById('gameOverModal'),
      gameOverTitle: document.getElementById('gameOverTitle'),
      gameOverText: document.getElementById('gameOverText'),
      gameOverStats: document.getElementById('gameOverStats'),
      btnRestart: document.getElementById('btnRestart'),
      btnPrestigeFromGO: document.getElementById('btnPrestigeFromGO'),
      btnGOMenu: document.getElementById('btnGOMenu'),

      victoryModal: document.getElementById('victoryModal'),
      victoryStats: document.getElementById('victoryStats'),
      btnVictoryPrestige: document.getElementById('btnVictoryPrestige'),
      btnVictoryEndless: document.getElementById('btnVictoryEndless')
    };

    // Tab switching
    this.el.tabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const tab = btn.dataset.tab;
        this.el.tabBtns.forEach(b => b.classList.toggle('active', b === btn));
        this.el.tabPanels.forEach(p => p.classList.toggle('active', p.id === 'tab-' + tab));
      });
    });

    // Auth buttons
    this.el.btnLogin.addEventListener('click', () => this.doLogin());
    this.el.btnRegister.addEventListener('click', () => this.doRegister());
    this.el.btnGuest.addEventListener('click', () => this.doGuest());

    // Enter key support
    this.el.loginPass.addEventListener('keydown', e => { if (e.key === 'Enter') this.doLogin(); });
    this.el.regPass.addEventListener('keydown', e => { if (e.key === 'Enter') this.doRegister(); });

    // Menu navigation
    this.el.mnuPlay.addEventListener('click', () => this.openMapSelect());
    this.el.btnMapBack.addEventListener('click', () => this.goToMenu());
    this.el.mnuTutorial.addEventListener('click', () => this.openTutorial());
    this.el.mnuBestiary.addEventListener('click', () => this.openBestiary());
    this.el.mnuSkillTree.addEventListener('click', () => this.openSkillTree());
    this.el.mnuPrestige.addEventListener('click', () => this.openPrestige());
    this.el.mnuLogout.addEventListener('click', () => this.doLogout());

    this.el.btnMenu.addEventListener('click', () => this.goToMenu());
    this.el.btnOpenTutorial.addEventListener('click', () => this.openTutorial());
    this.el.btnTutorialDone.addEventListener('click', () => {
      this.el.tutorialModal.classList.remove('visible');
      if (Game.save) { Game.save.tutorialSeen = true; Game.saveGame(); }
    });

    // Close modal buttons
    document.querySelectorAll('[data-close]').forEach(b => {
      b.addEventListener('click', () => document.getElementById(b.dataset.close).classList.remove('visible'));
    });
    document.querySelectorAll('.modal').forEach(m => {
      m.addEventListener('click', e => { if (e.target === m) m.classList.remove('visible'); });
    });

    // In-game modal openers
    this.el.btnSkillTree.addEventListener('click', () => this.openSkillTree());
    this.el.btnPrestige.addEventListener('click', () => this.openPrestige());
    this.el.btnBestiary.addEventListener('click', () => this.openBestiary());
    this.el.btnSave.addEventListener('click', () => Game.saveGame(true));
    this.el.btnDoPrestige.addEventListener('click', () => Game.doPrestige());
    this.el.btnEnemyIntroOK.addEventListener('click', () => this.dismissEnemyIntro());

    // GO/Victory buttons
    this.el.btnGOMenu.addEventListener('click', () => {
      this.el.gameOverModal.classList.remove('visible');
      // Clear failed run before going to menu
      if (Game.save) { Game.save.lastRun = null; Game.state = null; SaveSystem.save(Game.save); }
      this.goToMenu();
    });

    // Auto-login
    const session = SaveSystem.getSession();
    if (session) {
      if (session === 'guest') {
        SaveSystem.setSession('guest');
        this.showMenu();
      } else {
        const users = SaveSystem.loadUsers();
        if (users[session]) {
          SaveSystem.setSession(session);
          this.showMenu();
        }
      }
    }
  },

  doLogin() {
    const u = this.el.loginUser.value;
    const p = this.el.loginPass.value;
    const res = SaveSystem.login(u, p);
    this.el.loginMsg.textContent = res.msg;
    this.el.loginMsg.style.color = res.ok ? '#6ab04c' : '#ff6b6b';
    if (res.ok) {
      SaveSystem.setSession(u);
      setTimeout(() => this.showMenu(), 400);
    }
  },
  doRegister() {
    const u = this.el.regUser.value;
    const p = this.el.regPass.value;
    const res = SaveSystem.register(u, p);
    this.el.regMsg.textContent = res.msg;
    this.el.regMsg.style.color = res.ok ? '#6ab04c' : '#ff6b6b';
    if (res.ok) {
      SaveSystem.setSession(u);
      setTimeout(() => this.showMenu(), 400);
    }
  },
  doGuest() {
    SaveSystem.setSession('guest');
    this.showMenu();
  },
  doLogout() {
    if (Game.save) Game.saveGame();
    SaveSystem.clearSession();
    this.el.gameScreen.classList.remove('visible');
    this.el.menuScreen.classList.remove('visible');
    this.el.mapScreen.classList.remove('visible');
    this.el.loginScreen.classList.add('visible');
    Game.stop();
  },

  showMenu() {
    // Load save before showing menu to populate stats
    Game.save = SaveSystem.load();
    // Ensure Game.state exists so skill tree / prestige work from menu
    if (!Game.state) {
      Game.state = makeRunState(Game.save);
      // Restore in-progress run data if available
      if (Game.save.lastRun) {
        const lr = Game.save.lastRun;
        Game.state.marks = lr.marks || Game.state.marks;
        Game.state.skillPoints = lr.skillPoints || {};
        Game.state.wave = lr.wave || 0;
        Game.state.score = lr.score || 0;
      }
    }
    this.el.loginScreen.classList.remove('visible');
    this.el.gameScreen.classList.remove('visible');
    this.el.mapScreen.classList.remove('visible');
    this.el.menuScreen.classList.add('visible');
    const name = SaveSystem.currentUser === 'guest' ? 'Guest Chef' : SaveSystem.currentUser;
    this.el.menuUserLabel.textContent = name;
    this.renderMenuSummary();

    // Auto-show tutorial first time
    if (Game.save && !Game.save.tutorialSeen) {
      setTimeout(() => this.openTutorial(), 300);
    }
  },

  renderMenuSummary() {
    const s = Game.save;
    const discovered = Object.keys(s.discoveredEnemies || {}).length;
    const total = Object.keys(ENEMIES).length;
    const map = MAPS.find(m => m.id === (s.selectedMap || 'kitchen')) || MAPS[0];
    const unlockedMaps = MAPS.filter(m => (s.highWave || 0) >= m.unlockHighWave).length;
    this.el.menuSummary.innerHTML = `
      <div class="ms-item">🗺️ Map: <b>${map.emoji} ${map.name}</b> (${unlockedMaps}/${MAPS.length})</div>
      <div class="ms-item">🍅 Sauce: <b>${s.sauce}</b></div>
      <div class="ms-item">✨ Prestige: <b>${s.prestigeLevel}</b></div>
      <div class="ms-item">🏆 Best Wave: <b>${s.highWave}</b></div>
      <div class="ms-item">� Pastadex: <b>${discovered}/${total}</b></div>
      <div class="ms-item">🔁 Runs: <b>${s.runsCompleted}</b></div>
    `;
  },

  goToMenu() {
    if (Game.save) Game.saveGame();
    this.el.gameScreen.classList.remove('visible');
    this.el.mapScreen.classList.remove('visible');
    this.el.menuScreen.classList.add('visible');
    this.renderMenuSummary();
  },

  openMapSelect() {
    this.el.menuScreen.classList.remove('visible');
    this.el.gameScreen.classList.remove('visible');
    this.el.mapScreen.classList.add('visible');
    this.renderMaps();
  },

  renderMaps() {
    this.el.mapGrid.innerHTML = '';
    const highWave = Game.save.highWave || 0;
    const mapHigh = Game.save.mapHighWaves || {};
    const selected = Game.save.selectedMap || 'kitchen';
    MAPS.forEach(map => {
      const unlocked = highWave >= map.unlockHighWave;
      const best = mapHigh[map.id] || 0;
      const card = document.createElement('div');
      card.className = 'map-card' + (unlocked ? '' : ' locked') + (selected === map.id ? ' selected' : '');

      // Build path SVG preview
      const svgPath = this.makeMapSvgPath(map.path);
      const mods = map.mods;
      const goldPct = Math.round((mods.gold - 1) * 100);
      const livesDelta = mods.lives;
      const hpPct = Math.round((mods.enemyHp - 1) * 100);
      const speedPct = Math.round((mods.enemySpeed - 1) * 100);

      const modPills = [];
      if (goldPct > 0) modPills.push(`<span class="pos">+${goldPct}% 🪙</span>`);
      if (mods.startGold > 0) modPills.push(`<span class="pos">+${mods.startGold} start🪙</span>`);
      if (livesDelta < 0) modPills.push(`<span class="neg">${livesDelta} ❤️</span>`);
      if (hpPct > 0) modPills.push(`<span class="neg">+${hpPct}% HP</span>`);
      if (speedPct > 0) modPills.push(`<span class="neg">+${speedPct}% spd</span>`);

      const stars = '★'.repeat(map.diffStars) + '☆'.repeat(5 - map.diffStars);

      card.innerHTML = `
        <div class="map-preview" style="background:${map.bgColor}">
          <div class="map-emoji">${map.emoji}</div>
          <svg class="map-svg" viewBox="0 0 20 15" preserveAspectRatio="none">
            <path d="${svgPath}" stroke="${map.color}" stroke-width="1.4" fill="none" stroke-linecap="round" stroke-linejoin="round" opacity="0.95"/>
            <circle cx="${map.path[0][0]}" cy="${map.path[0][1]}" r="0.5" fill="#6ab04c"/>
            <circle cx="${map.path[map.path.length-1][0]}" cy="${map.path[map.path.length-1][1]}" r="0.5" fill="#d63031"/>
          </svg>
        </div>
        ${!unlocked ? `<div class="lock-badge">🔒 Wave ${map.unlockHighWave}</div>` : (best > 0 ? `<div class="best-wave-badge">🏆 W${best}</div>` : '')}
        <div class="map-name">${map.emoji} ${map.name}</div>
        <div class="map-diff"><span class="stars">${stars}</span> ${map.difficulty}</div>
        <div class="map-desc">${map.desc}</div>
        <div class="map-stats">${modPills.join('')}</div>
      `;
      if (unlocked) {
        card.addEventListener('click', () => this.selectMapAndPlay(map.id));
      }
      this.el.mapGrid.appendChild(card);
    });
  },

  makeMapSvgPath(pts) {
    if (!pts || pts.length === 0) return '';
    let d = `M ${pts[0][0] + 0.5} ${pts[0][1] + 0.5}`;
    for (let i = 1; i < pts.length; i++) d += ` L ${pts[i][0] + 0.5} ${pts[i][1] + 0.5}`;
    return d;
  },

  selectMapAndPlay(mapId) {
    if (!Game.save) return;
    // Switching maps wipes lastRun (path geometry changes)
    if (Game.save.selectedMap !== mapId) {
      Game.save.selectedMap = mapId;
      Game.save.lastRun = null;
      Game.state = null;
      SaveSystem.save(Game.save);
    }
    this.enterGame();
  },

  enterGame() {
    this.el.menuScreen.classList.remove('visible');
    this.el.mapScreen.classList.remove('visible');
    this.el.loginScreen.classList.remove('visible');
    this.el.gameScreen.classList.add('visible');
    const name = SaveSystem.currentUser === 'guest' ? '👤 Guest' : '🧑‍🍳 ' + SaveSystem.currentUser;
    this.el.userLabel.textContent = name;
    // Update brand to show current map
    const map = MAPS.find(m => m.id === (Game.save.selectedMap || 'kitchen')) || MAPS[0];
    const brand = document.querySelector('#gameScreen .brand');
    if (brand) brand.innerHTML = `${map.emoji} <span style="font-size:11px;opacity:0.85">${map.name}</span>`;
    Game.start();
  },

  // ===== Stats =====
  updateStats(s) {
    this.el.statLives.textContent = s.lives;
    this.el.statGold.textContent = Math.floor(s.gold);
    this.el.statMarks.textContent = s.marks;
    this.el.statSauce.textContent = Game.save.sauce;
    this.el.statWave.textContent = Math.min(s.wave + 1, MAX_WAVES + (s.endlessMode ? 999 : 0));
    this.el.statMaxWave.textContent = MAX_WAVES;
    this.el.statScore.textContent = s.score;
  },

  // ===== Tower Shop =====
  renderTowerShop() {
    this.el.towerShop.innerHTML = '';
    const s = Game.state;
    const perks = Game.save.prestigePerks || {};
    const fastStart = !!perks.fastStart;
    const costMult = Game.computeStat('costMult', 1);
    TOWERS.forEach((t, i) => {
      const unlocked = fastStart || (s.wave + 1) >= t.unlockWave;
      const cost = Math.floor(t.cost * costMult);
      const canAfford = s.gold >= cost;
      const card = document.createElement('div');
      card.className = 'tower-card' + (!unlocked ? ' locked' : (!canAfford ? ' cant-afford' : ''));
      if (Game.selectedTowerType && Game.selectedTowerType.id === t.id) card.classList.add('selected');
      card.innerHTML = `
        <div class="tower-emoji"></div>
        <div class="tower-meta">
          <div class="name">${t.name} <span style="opacity:0.5;font-size:9px">[${i + 1}]</span></div>
          <div class="cost">${unlocked ? '🪙 ' + cost : '🔒 Wave ' + t.unlockWave}</div>
          <div class="desc">${t.desc}</div>
        </div>
      `;
      const thumbHolder = card.querySelector('.tower-emoji');
      const thumbCanvas = Sprites.thumbCanvas(unlocked ? 'tower' : 'locked', t.id, t, 48);
      thumbHolder.appendChild(thumbCanvas);
      if (unlocked) {
        card.addEventListener('click', () => {
          if (s.gold < cost) {
            this.toast('Not enough gold! 🪙');
            return;
          }
          Game.selectTowerType(t);
        });
        card.addEventListener('mouseenter', () => this.showTowerInfo(t));
      }
      this.el.towerShop.appendChild(card);
    });
  },

  showTowerInfo(t) {
    if (Game.selectedTower) return;
    this.el.towerInfo.innerHTML = `
      <h3>${t.emoji} ${t.name}</h3>
      <p style="color:#f5d76e;font-size:11px">"${t.lore}"</p>
      <p>${t.desc}</p>
      <p>💥 Damage: <b>${t.damage || '—'}</b></p>
      <p>🎯 Range: <b>${t.range}</b></p>
      <p>⚡ Rate: <b>${t.fireRate || '—'} / sec</b></p>
      ${t.splash ? `<p>💢 Splash: <b>${t.splash}</b></p>` : ''}
      ${t.slow ? `<p>🌀 Slow: <b>${Math.round(t.slow.factor*100)}% for ${t.slow.duration}s</b></p>` : ''}
      ${t.aura ? `<p>✨ Aura: <b>+${Math.round(t.aura*100)}% dmg to nearby</b></p>` : ''}
      ${t.pierce ? `<p>🔫 <b>Piercing beam</b></p>` : ''}
      <p>🪙 Cost: <b>${Math.floor(t.cost * Game.computeStat('costMult', 1))}</b></p>
    `;
  },

  showUpgradePanel(tower) {
    this.el.towerInfo.style.display = 'none';
    this.el.upgradePanel.style.display = 'block';
    const t = tower.def;
    const isHero = !!tower.isHero;
    // XP bar for heroes
    const xpBar = isHero ? `
      <div class="hero-xp-bar"><div class="hero-xp-fill" style="width:${Math.min(100, (tower.xp / tower.xpNext) * 100)}%"></div></div>
      <div class="stat-row hero-lvl"><span>⭐ Hero Lv</span><b>${tower.level} <small>(${tower.xp}/${tower.xpNext} XP)</small></b></div>
    ` : '';
    let html = `
      <div class="name">${t.emoji} ${t.name}${isHero ? ' <span class="hero-badge">HERO</span>' : ''}</div>
      ${xpBar}
      <div class="stat-row"><span>💥 Damage</span><b>${tower.getDamage().toFixed(1)}</b></div>
      <div class="stat-row"><span>🎯 Range</span><b>${tower.getRange().toFixed(0)}</b></div>
      <div class="stat-row"><span>⚡ Rate</span><b>${tower.getFireRate().toFixed(2)}/s</b></div>
      ${t.splash ? `<div class="stat-row"><span>💢 Splash</span><b>${tower.getSplash().toFixed(0)}</b></div>` : ''}
      <div class="stat-row"><span>💀 Kills</span><b>${tower.kills}</b></div>
    `;
    // Targeting modes (skip for pure aura/beam towers)
    if (!t.aura) {
      const modes = [
        { id: 'first',  label: 'First',  desc: 'Furthest along path' },
        { id: 'last',   label: 'Last',   desc: 'Newest spawn' },
        { id: 'strong', label: 'Strong', desc: 'Highest HP' },
        { id: 'weak',   label: 'Weak',   desc: 'Lowest HP' },
        { id: 'close',  label: 'Close',  desc: 'Nearest tower' },
      ];
      const cur = tower.targetMode || 'first';
      html += `<div class="target-modes"><div class="tm-label">🎯 Target Priority</div><div class="tm-row">`;
      modes.forEach(m => {
        html += `<button class="tm-btn${cur === m.id ? ' active' : ''}" data-tmode="${m.id}" title="${m.desc}">${m.label}</button>`;
      });
      html += `</div></div>`;
    }
    // Hero ability button
    if (isHero && tower.ability) {
      const cdLeft = Math.max(0, (tower.abilityReadyAt || 0) - performance.now() / 1000);
      const ready = cdLeft <= 0;
      const lvlReq = tower.ability.unlockLevel || 1;
      const locked = tower.level < lvlReq;
      html += `
        <div class="hero-ability">
          <button class="ability-btn${ready && !locked ? ' ready' : ''}" data-ability="1" ${ready && !locked ? '' : 'disabled'}>
            <span class="ab-icon">${tower.ability.icon}</span>
            <span class="ab-name">${tower.ability.name}</span>
            <span class="ab-cd">${locked ? `🔒 Lv${lvlReq}` : (ready ? 'READY!' : cdLeft.toFixed(1) + 's')}</span>
          </button>
          <div class="ab-desc">${tower.ability.desc}</div>
        </div>
      `;
    }
    // Heroes don't use gold-based upgrades — they level via XP
    const upgradesObj = isHero ? {} : (t.upgrades || {});
    Object.entries(upgradesObj).forEach(([key, up]) => {
      const lvl = tower.upgrades[key] || 0;
      const maxed = lvl >= up.max;
      const cost = Math.floor(up.cost * Math.pow(1.5, lvl));
      const canAfford = Game.state.gold >= cost;
      const upgradeName = {
        damage: '💥 Damage',
        range: '🎯 Range',
        fireRate: '⚡ Fire Rate',
        splash: '💢 Splash',
        slowFactor: '🌀 Slow Strength',
        slowDuration: '🌀 Slow Duration',
        aura: '✨ Aura Boost'
      }[key] || key;
      html += `<button data-upgrade="${key}" ${maxed || !canAfford ? 'disabled' : ''}>${upgradeName} ${maxed ? '(MAX)' : `Lv${lvl}/${up.max} — 🪙${cost}`}</button>`;
    });
    // Heroes can't be sold (only 1 per run)
    if (!isHero) {
      const sellValue = Math.floor(tower.totalSpent * 0.7);
      html += `<button class="sell" data-sell="1">Sell — 🪙${sellValue}</button>`;
    }
    this.el.upgradePanel.innerHTML = html;

    Object.keys(upgradesObj).forEach(key => {
      const btn = this.el.upgradePanel.querySelector(`[data-upgrade="${key}"]`);
      if (btn) btn.addEventListener('click', () => Game.upgradeTower(tower, key));
    });
    const sellBtn = this.el.upgradePanel.querySelector('[data-sell]');
    if (sellBtn) sellBtn.addEventListener('click', () => Game.sellTower(tower));
    // Targeting mode buttons
    this.el.upgradePanel.querySelectorAll('[data-tmode]').forEach(btn => {
      btn.addEventListener('click', () => Game.setTargetMode(tower, btn.dataset.tmode));
    });
    // Hero ability
    const abBtn = this.el.upgradePanel.querySelector('[data-ability]');
    if (abBtn) abBtn.addEventListener('click', () => Game.triggerHeroAbility(tower));
  },

  hideUpgradePanel() {
    this.el.towerInfo.style.display = 'block';
    this.el.upgradePanel.style.display = 'none';
  },

  // ===== Wave Preview with hover info =====
  renderWavePreview() {
    const s = Game.state;
    const nextWaveIdx = s.wave;
    if (nextWaveIdx >= MAX_WAVES && !s.endlessMode) {
      this.el.wavePreview.innerHTML = '<span style="font-size:11px">🏆 All waves complete!</span>';
      return;
    }
    let wave;
    if (nextWaveIdx >= MAX_WAVES) {
      wave = { enemies: [], boss: false };
      this.el.wavePreview.innerHTML = '<span style="font-size:11px">♾️ Endless: random pasta swarm</span>';
      return;
    } else {
      wave = WAVES[nextWaveIdx];
    }
    this.el.wavePreview.innerHTML = '';
    wave.enemies.forEach(group => {
      const def = ENEMIES[group.type];
      if (!def) return;
      const div = document.createElement('div');
      div.className = 'preview-enemy';
      div.title = `${def.name} x${group.count} — hover for details`;
      const cv = Sprites.thumbCanvas('enemy', group.type, def, 36);
      div.appendChild(cv);
      div.dataset.count = group.count;
      div.addEventListener('mouseenter', () => this.showEnemyHover(group.type, group.count));
      div.addEventListener('click', () => this.showEnemyHover(group.type, group.count));
      this.el.wavePreview.appendChild(div);
    });
    if (wave.boss) {
      const b = document.createElement('div');
      b.textContent = '⚠️ BOSS WAVE';
      b.style.cssText = 'color:#ff6b6b;font-weight:bold;font-size:11px;width:100%;margin-top:4px;';
      this.el.wavePreview.appendChild(b);
    }
  },

  showEnemyHover(typeId, count) {
    const def = ENEMIES[typeId];
    if (!def) return;
    const tags = (def.tags || []).map(t => `<span class="tag ${t}">${t}</span>`).join(' ');
    this.el.enemyHoverPanel.classList.add('has-data');
    this.el.enemyHoverPanel.innerHTML = `
      <div class="header">
        <span class="emoji-big">${def.emoji}</span>
        <div>
          <div class="name">${def.name}${count ? ' ×' + count : ''}</div>
          <div style="font-size:10px">${tags}</div>
        </div>
      </div>
      <div class="stat-row"><span>❤️ HP</span><b>${def.hp}</b></div>
      <div class="stat-row"><span>👟 Speed</span><b>${def.speed}</b></div>
      <div class="stat-row"><span>🪙 Reward</span><b>${def.gold}</b></div>
      ${def.armor ? `<div class="stat-row"><span>🛡️ Armor</span><b>${Math.round(def.armor*100)}%</b></div>` : ''}
      <div class="stat-row"><span>💪 Strength</span><b>${def.strength || '—'}</b></div>
      <div class="stat-row"><span>💔 Weakness</span><b>${def.weakness || '—'}</b></div>
      <div class="lore">"${def.lore}"</div>
    `;
  },

  // ===== Toast =====
  toast(text, ms = 1800) {
    this.el.toast.textContent = text;
    this.el.toast.classList.add('show');
    clearTimeout(this._toastT);
    this._toastT = setTimeout(() => this.el.toast.classList.remove('show'), ms);
  },
  banner(text, ms = 1400) {
    this.el.waveBanner.textContent = text;
    this.el.waveBanner.classList.add('show');
    clearTimeout(this._bannerT);
    this._bannerT = setTimeout(() => this.el.waveBanner.classList.remove('show'), ms);
  },
  setFooter(text) {
    this.el.footerMsg.textContent = text;
  },

  // ===== Taunt bubbles =====
  spawnTaunt(text, canvasX, canvasY) {
    const rect = Game.canvas.getBoundingClientRect();
    const wrapRect = this.el.canvasWrap.getBoundingClientRect();
    const scaleX = rect.width / Game.canvas.width;
    const scaleY = rect.height / Game.canvas.height;
    const px = (canvasX * scaleX) + (rect.left - wrapRect.left);
    const py = (canvasY * scaleY) + (rect.top - wrapRect.top);
    const bubble = document.createElement('div');
    bubble.className = 'taunt-bubble';
    bubble.textContent = text;
    bubble.style.left = px + 'px';
    bubble.style.top = py + 'px';
    this.el.canvasWrap.appendChild(bubble);
    setTimeout(() => bubble.remove(), 1900);
  },

  // ===== SKILL TREE =====
  openSkillTree() {
    if (!Game.state) Game.state = makeRunState(Game.save);
    this.renderSkillTree();
    this.el.skillTreeModal.classList.add('visible');
  },
  renderSkillTree() {
    this.el.marksDisplay.textContent = Game.state.marks;
    this.el.skillTreeGrid.innerHTML = '';

    // RADIAL LAYOUT — one big spider tree with 5 branches occupying wedges.
    // Each branch's nodes have `angle` (0-72° within wedge) and `radius` (0-100% from center).
    const container = document.createElement('div');
    container.className = 'skill-radial';

    // SVG layer for connection lines (covers full radial space)
    const SVG_NS = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(SVG_NS, 'svg');
    svg.classList.add('skill-radial-svg');
    svg.setAttribute('viewBox', '-100 -100 200 200');
    svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
    container.appendChild(svg);

    // Background rings (visual concentric guides)
    [22, 42, 60, 76, 92].forEach((r) => {
      const c = document.createElementNS(SVG_NS, 'circle');
      c.setAttribute('cx', 0); c.setAttribute('cy', 0); c.setAttribute('r', r);
      c.setAttribute('class', 'radial-ring');
      svg.appendChild(c);
    });

    // Wedge dividers
    const branchIds = Object.keys(SKILL_TREE);
    branchIds.forEach((bid) => {
      const branch = SKILL_TREE[bid];
      const [start] = branch.wedge;
      const a = (start - 90) * Math.PI / 180;
      const line = document.createElementNS(SVG_NS, 'line');
      line.setAttribute('x1', 0); line.setAttribute('y1', 0);
      line.setAttribute('x2', Math.cos(a) * 95);
      line.setAttribute('y2', Math.sin(a) * 95);
      line.setAttribute('class', 'radial-wedge-divider');
      svg.appendChild(line);
      // Branch label arc text
      const midA = (branch.wedge[0] + branch.wedge[1]) / 2;
      const labelA = (midA - 90) * Math.PI / 180;
      const tx = Math.cos(labelA) * 105;
      const ty = Math.sin(labelA) * 105;
      const text = document.createElementNS(SVG_NS, 'text');
      text.setAttribute('x', tx); text.setAttribute('y', ty);
      text.setAttribute('class', 'radial-branch-label');
      text.setAttribute('fill', branch.color);
      text.setAttribute('text-anchor', 'middle');
      text.setAttribute('dominant-baseline', 'middle');
      text.textContent = branch.name;
      svg.appendChild(text);
    });

    // Compute pos for any node by branch wedge + angle/radius
    const nodeMap = {}; // id -> node
    const branchOfNode = {}; // id -> branchId
    Object.entries(SKILL_TREE).forEach(([bid, branch]) => {
      branch.nodes.forEach(n => { nodeMap[n.id] = n; branchOfNode[n.id] = bid; });
    });
    function posOf(node) {
      const branch = SKILL_TREE[branchOfNode[node.id]];
      const wedgeStart = branch.wedge[0];
      const wedgeSize = branch.wedge[1] - wedgeStart;
      // node.angle is 0-72 within wedge
      const angleDeg = wedgeStart + (node.angle / 72) * wedgeSize - 90;
      const a = angleDeg * Math.PI / 180;
      return { x: Math.cos(a) * node.radius, y: Math.sin(a) * node.radius, angleDeg, branch };
    }

    // Draw connection lines first
    Object.values(SKILL_TREE).forEach(branch => {
      branch.nodes.forEach(node => {
        (node.requires || []).forEach(req => {
          const parent = nodeMap[req.id];
          if (!parent) return;
          const p = posOf(parent);
          const c = posOf(node);
          const parentLvl = Game.state.skillPoints[req.id] || 0;
          const active = parentLvl >= req.lvl;
          const line = document.createElementNS(SVG_NS, 'line');
          line.setAttribute('x1', p.x); line.setAttribute('y1', p.y);
          line.setAttribute('x2', c.x); line.setAttribute('y2', c.y);
          line.setAttribute('stroke', active ? branch.color : '#3a2a1e');
          line.setAttribute('stroke-width', active ? 0.8 : 0.4);
          line.setAttribute('stroke-dasharray', active ? '' : '1.5 1');
          line.setAttribute('opacity', active ? 0.9 : 0.45);
          svg.appendChild(line);
        });
      });
    });

    // Center hub
    const hub = document.createElementNS(SVG_NS, 'circle');
    hub.setAttribute('cx', 0); hub.setAttribute('cy', 0); hub.setAttribute('r', 10);
    hub.setAttribute('class', 'radial-hub');
    svg.appendChild(hub);
    const hubText = document.createElementNS(SVG_NS, 'text');
    hubText.setAttribute('x', 0); hubText.setAttribute('y', 0);
    hubText.setAttribute('class', 'radial-hub-label');
    hubText.setAttribute('text-anchor', 'middle');
    hubText.setAttribute('dominant-baseline', 'middle');
    hubText.textContent = '🍝';
    svg.appendChild(hubText);

    // Render nodes as absolutely-positioned DOM elements on top of the SVG
    Object.entries(SKILL_TREE).forEach(([bid, branch]) => {
      branch.nodes.forEach(node => {
        const lvl = Game.state.skillPoints[node.id] || 0;
        const maxed = lvl >= node.max;
        const cost = !maxed ? node.costs[lvl] : 0;
        const prereqMet = (node.requires || []).every(req => (Game.state.skillPoints[req.id] || 0) >= req.lvl);
        const canAfford = !maxed && Game.state.marks >= cost;
        const available = prereqMet && !maxed;
        const buyable = available && canAfford;
        const locked = !prereqMet && !maxed;
        const pos = posOf(node);
        const nodeDiv = document.createElement('div');
        nodeDiv.className = 'skill-node-radial' + (maxed ? ' maxed' : '') + (locked ? ' locked' : '') + (buyable ? ' buyable' : '') + (node.keystone ? ' keystone' : '') + (available && !canAfford && !maxed ? ' poor' : '');
        // Convert SVG coord to % (range -100..100 → 0..100%)
        const left = ((pos.x + 100) / 200) * 100;
        const top = ((pos.y + 100) / 200) * 100;
        nodeDiv.style.left = left + '%';
        nodeDiv.style.top = top + '%';
        if (node.keystone) {
          nodeDiv.style.borderColor = branch.color;
          nodeDiv.style.boxShadow = `0 0 14px ${branch.color}`;
        } else if (lvl > 0) {
          nodeDiv.style.borderColor = branch.color;
        }
        const lockMsg = locked
          ? `🔒 Requires: ${(node.requires||[]).map(r => `${nodeMap[r.id]?.name || r.id} Lv${r.lvl}`).join(', ')}`
          : '';
        const costLabel = maxed ? '✓ MAX' : (locked ? '🔒' : `🥫${cost}`);
        const icon = node.keystone ? '★' : (node.name.match(/[A-Z]/) || ['•'])[0];
        nodeDiv.innerHTML = `
          <div class="snr-icon">${icon}</div>
          <div class="snr-lvl">${lvl}/${node.max}</div>
          <div class="snr-tooltip">
            <div class="snr-title" style="color:${branch.color}">${node.name}</div>
            <div class="snr-desc">${node.desc}</div>
            <div class="snr-stats">Lv ${lvl}/${node.max} <span class="sep">·</span> Cost ${costLabel}</div>
            ${lockMsg ? `<div class="snr-lock">${lockMsg}</div>` : ''}
          </div>
        `;
        if (buyable) {
          nodeDiv.addEventListener('click', () => {
            Game.buySkill(bid, node.id);
            this.renderSkillTree();
          });
        }
        container.appendChild(nodeDiv);
      });
    });

    this.el.skillTreeGrid.appendChild(container);
  },

  // ===== PRESTIGE =====
  openPrestige() {
    if (!Game.state) Game.state = makeRunState(Game.save);
    this.renderPrestige();
    this.el.prestigeModal.classList.add('visible');
  },
  renderPrestige() {
    const s = Game.state;
    const sauceGain = Game.computePrestigeGain();
    this.el.prestigeInfo.innerHTML = `
      <p>Current run: Wave <b>${s.wave}</b>, Score <b>${s.score}</b></p>
      <p>You will earn: <b style="color:#ff6b6b">🍅 ${sauceGain} Sauce Points</b></p>
      <p>Current Sauce: <b>🍅 ${Game.save.sauce}</b> | Prestige Lv: <b>${Game.save.prestigeLevel}</b></p>
      ${sauceGain < 1 ? '<p style="color:#ff6b6b"><b>Need to reach at least wave 5 to prestige!</b></p>' : ''}
    `;
    this.el.btnDoPrestige.disabled = sauceGain < 1;

    this.el.prestigePerks.innerHTML = '';
    const categories = {
      atk: { label: '⚔️ Offense', color: '#d63031' },
      def: { label: '🛡️ Defense', color: '#6ab04c' },
      eco: { label: '🪙 Economy', color: '#ffd700' },
      qol: { label: '⏩ Quality of Life', color: '#74b9ff' }
    };
    Object.entries(categories).forEach(([catId, cat]) => {
      const section = document.createElement('div');
      section.className = 'perk-category';
      section.innerHTML = `<h4 style="color:${cat.color};grid-column:1/-1;margin:8px 0 4px;border-bottom:1px solid ${cat.color}44;padding-bottom:3px">${cat.label}</h4>`;
      const sectionPerks = PRESTIGE_PERKS.filter(p => p.category === catId);
      sectionPerks.forEach(perk => {
        const lvl = Game.save.prestigePerks[perk.id] || 0;
        const maxed = lvl >= perk.max;
        const cost = perk.cost * (lvl + 1);
        const canAfford = !maxed && Game.save.sauce >= cost;
        const div = document.createElement('div');
        div.className = 'perk' + (maxed ? ' maxed' : '');
        div.innerHTML = `
          <div class="name">${perk.name} ${maxed ? '✓' : ''}</div>
          <div class="desc">${perk.desc}</div>
          <div class="level">Lv ${lvl}/${perk.max} ${maxed ? '' : '— 🍅 ' + cost}</div>
        `;
        if (!maxed && canAfford) {
          div.addEventListener('click', () => {
            Game.buyPerk(perk.id);
            this.renderPrestige();
            this.renderMenuSummary();
          });
        } else if (!maxed) {
          div.style.opacity = '0.6';
        }
        section.appendChild(div);
      });
      this.el.prestigePerks.appendChild(section);
    });
  },

  // ===== PASTADEX =====
  pastadexTab: 'enemies',
  openBestiary() {
    if (!this._pdexTabsBound) {
      document.querySelectorAll('.pdex-tab').forEach(btn => {
        btn.addEventListener('click', () => {
          this.pastadexTab = btn.dataset.pdex;
          document.querySelectorAll('.pdex-tab').forEach(b => b.classList.toggle('active', b === btn));
          this.renderBestiary();
        });
      });
      this._pdexTabsBound = true;
    }
    this.renderBestiary();
    this.el.bestiaryModal.classList.add('visible');
  },
  renderBestiary() {
    this.el.bestiaryGrid.innerHTML = '';
    // Update counts
    const discE = Game.save.discoveredEnemies || {};
    const discT = Game.save.discoveredTowers || {};
    const totalE = Object.keys(ENEMIES).length;
    const totalT = TOWERS.length;
    const seenE = Object.keys(discE).length;
    const seenT = Object.keys(discT).length;
    const eCount = document.getElementById('pdexEnemyCount');
    const tCount = document.getElementById('pdexTowerCount');
    if (eCount) eCount.textContent = seenE + '/' + totalE;
    if (tCount) tCount.textContent = seenT + '/' + totalT;
    // Render active tab
    if (this.pastadexTab === 'towers') {
      this.renderPastadexTowers(discT, seenT, totalT);
    } else {
      this.renderPastadexEnemies(discE, seenE, totalE);
    }
  },
  renderPastadexEnemies(discovered, seen, total) {
    const fill = document.getElementById('pdexBarFill');
    const lbl = document.getElementById('pdexBarLabel');
    if (fill) fill.style.width = (total ? (seen/total*100) : 0) + '%';
    if (lbl) lbl.textContent = `${seen} / ${total} pasta discovered`;
    Object.entries(ENEMIES).forEach(([id, def]) => {
      const isSeen = !!discovered[id];
      const div = document.createElement('div');
      div.className = 'bestiary-card' + (def.boss ? ' boss' : '') + (isSeen ? '' : ' undiscovered');
      // Canvas thumbnail
      const thumbWrap = document.createElement('div');
      thumbWrap.className = 'pdex-thumb';
      const canvas = Sprites.thumbCanvas(isSeen ? 'enemy' : 'locked', id, def, 96);
      thumbWrap.appendChild(canvas);
      div.appendChild(thumbWrap);
      const body = document.createElement('div');
      body.className = 'pdex-body';
      if (isSeen) {
        const tags = (def.tags || []).map(t => `<span class="tag ${t}">${t}</span>`).join(' ');
        body.innerHTML = `
          <div class="name">${def.name}${def.boss ? ' <span style="color:#ffd700">👑</span>' : ''}</div>
          <div class="tag-row">${tags}</div>
          <div class="stats">
            ❤️ <b>${def.hp}</b> HP &nbsp; 👟 <b>${def.speed}</b> &nbsp; 🪙 <b>${def.gold}</b>
            ${def.armor ? '<br>🛡️ <b>' + Math.round(def.armor*100) + '%</b> armor' : ''}
            <br>💪 ${def.strength}
            <br>💔 Weak to: ${def.weakness}
          </div>
          <div class="lore">"${def.lore}"</div>
        `;
      } else {
        body.innerHTML = `
          <div class="name unknown">??? UNDISCOVERED</div>
          <div class="stats" style="opacity:0.6">Encounter this pasta to reveal it!</div>
        `;
      }
      div.appendChild(body);
      this.el.bestiaryGrid.appendChild(div);
    });
  },
  renderPastadexTowers(discovered, seen, total) {
    const fill = document.getElementById('pdexBarFill');
    const lbl = document.getElementById('pdexBarLabel');
    if (fill) fill.style.width = (total ? (seen/total*100) : 0) + '%';
    if (lbl) lbl.textContent = `${seen} / ${total} kitchen tools collected`;
    TOWERS.forEach((def) => {
      const isSeen = !!discovered[def.id];
      const div = document.createElement('div');
      div.className = 'bestiary-card tower' + (isSeen ? '' : ' undiscovered');
      const thumbWrap = document.createElement('div');
      thumbWrap.className = 'pdex-thumb';
      const canvas = Sprites.thumbCanvas(isSeen ? 'tower' : 'locked', def.id, def, 96);
      thumbWrap.appendChild(canvas);
      div.appendChild(thumbWrap);
      const body = document.createElement('div');
      body.className = 'pdex-body';
      if (isSeen) {
        body.innerHTML = `
          <div class="name">${def.name}</div>
          <div class="stats">
            💥 <b>${def.damage}</b> dmg &nbsp; 🎯 <b>${def.range}</b> range &nbsp; ⚡ <b>${def.fireRate}</b>/s
            ${def.splash ? '<br>💢 Splash: <b>' + def.splash + '</b>' : ''}
            ${def.slow ? '<br>🌀 Slow: <b>' + Math.round(def.slow.factor*100) + '% / ' + def.slow.duration + 's</b>' : ''}
            ${def.aura ? '<br>✨ Aura: <b>+' + Math.round(def.aura*100) + '%</b> dmg' : ''}
            ${def.pierce ? '<br>🔫 <b>Piercing beam</b>' : ''}
            <br>🪙 Cost: <b>${def.cost}</b>
          </div>
          <div class="lore">"${def.lore}"</div>
        `;
      } else {
        body.innerHTML = `
          <div class="name unknown">??? LOCKED</div>
          <div class="stats" style="opacity:0.6">Unlocks at wave <b>${def.unlockWave}</b>. Place one to collect!</div>
        `;
      }
      div.appendChild(body);
      this.el.bestiaryGrid.appendChild(div);
    });
  },

  // ===== TUTORIAL =====
  openTutorial() {
    this.el.tutorialModal.classList.add('visible');
  },

  // ===== ENEMY INTRO POPUP =====
  showEnemyIntro(typeId) {
    const def = ENEMIES[typeId];
    if (!def) return;
    const tags = (def.tags || []).map(t => `<span class="tag ${t}">${t}</span>`).join(' ');
    this.el.enemyIntroBody.innerHTML = `
      <div class="enemy-intro-emoji" id="enemyIntroThumb"></div>
      <div class="enemy-intro-info">
        <h3>${def.name}${def.boss ? ' 👑' : ''}</h3>
        <div style="margin-bottom:6px">${tags}</div>
        <div class="stat-line"><span>❤️ Health</span><b>${def.hp}</b></div>
        <div class="stat-line"><span>👟 Speed</span><b>${def.speed}</b></div>
        <div class="stat-line"><span>🪙 Bounty</span><b>${def.gold}</b></div>
        ${def.armor ? `<div class="stat-line"><span>🛡️ Armor</span><b>${Math.round(def.armor*100)}%</b></div>` : ''}
        <div class="stat-line"><span>💪 Strength</span><b>${def.strength || '—'}</b></div>
        <div class="stat-line"><span>💔 Weakness</span><b>${def.weakness || '—'}</b></div>
        <div class="lore">"${def.lore}"</div>
      </div>
    `;
    const thumbHolder = document.getElementById('enemyIntroThumb');
    if (thumbHolder) thumbHolder.appendChild(Sprites.thumbCanvas('enemy', typeId, def, 140));
    Game.paused = true;
    this.el.btnPause.textContent = '▶';
    this.el.enemyIntroModal.classList.add('visible');
  },
  dismissEnemyIntro() {
    this.el.enemyIntroModal.classList.remove('visible');
    // Show next in queue (if any)
    if (Game.introQueue && Game.introQueue.length > 0) {
      const nextType = Game.introQueue.shift();
      setTimeout(() => this.showEnemyIntro(nextType), 200);
      return;
    }
    Game.paused = false;
    this.el.btnPause.textContent = '⏸';
  },

  // ===== HERO SELECT =====
  showHeroSelect() {
    if (!this.el.heroSelectGrid) return;
    this.el.heroSelectGrid.innerHTML = '';
    HEROES.forEach(hero => {
      const card = document.createElement('div');
      card.className = 'hero-card';
      card.style.borderColor = hero.color;
      card.innerHTML = `
        <div class="hero-emoji" style="background: radial-gradient(circle at 35% 30%, ${hero.color}cc 0%, ${hero.color}33 100%)">${hero.emoji}</div>
        <div class="hero-name" style="color:${hero.color}">${hero.name}</div>
        <div class="hero-title">${hero.title}</div>
        <div class="hero-desc">${hero.desc}</div>
        <div class="hero-stats">
          <span>💥 ${hero.damage}</span>
          <span>🎯 ${hero.range}</span>
          <span>⚡ ${hero.fireRate}/s</span>
        </div>
        <div class="hero-ability-preview">
          <b>${hero.ability.icon} ${hero.ability.name}</b>
          <small>(Lv ${hero.ability.unlockLevel}+, ${hero.ability.cooldown}s CD)</small>
          <div>${hero.ability.desc}</div>
        </div>
        <div class="hero-flavor">${hero.flavor}</div>
        <button class="big-btn hero-pick-btn" data-hero="${hero.id}">⭐ Pick ${hero.name.split(' ')[0]}</button>
      `;
      card.querySelector('[data-hero]').addEventListener('click', () => {
        this.el.heroSelectModal.classList.remove('visible');
        Game.selectHero(hero.id);
      });
      this.el.heroSelectGrid.appendChild(card);
    });
    this.el.heroSelectModal.classList.add('visible');
  },

  // ===== BOON CHOICE =====
  showBoonChoice(choices) {
    if (!this.el.boonChoices) return;
    this.el.boonChoices.innerHTML = '';
    choices.forEach(boon => {
      const card = document.createElement('div');
      card.className = `boon-card tier-${boon.tier}`;
      card.innerHTML = `
        <div class="boon-tier">${boon.tier.toUpperCase()}</div>
        <div class="boon-icon">${boon.icon}</div>
        <div class="boon-name">${boon.name}</div>
        <div class="boon-desc">${boon.desc}</div>
        <button class="big-btn boon-pick-btn" data-boon="${boon.id}">Take</button>
      `;
      card.querySelector('[data-boon]').addEventListener('click', () => Game.pickBoon(boon.id));
      this.el.boonChoices.appendChild(card);
    });
    // Also add a "skip" option (small)
    const skip = document.createElement('button');
    skip.className = 'boon-skip-btn';
    skip.textContent = 'Skip (no boon)';
    skip.addEventListener('click', () => {
      Game.state.pendingBoonWave = 0;
      this.closeBoonModal();
    });
    this.el.boonChoices.appendChild(skip);
    this.el.boonModal.classList.add('visible');
  },
  closeBoonModal() {
    if (this.el.boonModal) this.el.boonModal.classList.remove('visible');
  },

  // ===== POWERS BAR =====
  renderPowersBar() {
    if (!this.el.powersBar || !Game.state) return;
    const now = performance.now() / 1000;
    this.el.powersBar.innerHTML = '';
    POWERS.forEach(p => {
      const cdReadyAt = (Game.state.powerCooldowns || {})[p.id] || 0;
      const cdLeft = Math.max(0, cdReadyAt - now);
      const ready = cdLeft <= 0;
      const canAfford = Game.state.gold >= p.cost;
      const pending = Game.state.pendingPowerTarget === p.id;
      const btn = document.createElement('button');
      btn.className = `power-btn${ready ? ' ready' : ''}${!canAfford ? ' poor' : ''}${pending ? ' pending' : ''}`;
      btn.title = `${p.name} — ${p.desc}`;
      btn.innerHTML = `
        <span class="pw-icon">${p.icon}</span>
        <span class="pw-cost">${p.cost > 0 ? `🪙${p.cost}` : 'FREE'}</span>
        <span class="pw-cd">${ready ? 'READY' : cdLeft.toFixed(0) + 's'}</span>
        <span class="pw-name">${p.name}</span>
      `;
      btn.disabled = !(ready && canAfford);
      btn.addEventListener('click', () => Game.selectPower(p.id));
      this.el.powersBar.appendChild(btn);
    });
  },

  // ===== END GAME =====
  showGameOver(reason) {
    this.el.gameOverTitle.textContent = '💀 Kitchen Fallen!';
    this.el.gameOverText.textContent = `Pasta breached the dining room after ${Game.state.wave} waves.`;
    const sauceGain = Game.computePrestigeGain();
    this.el.gameOverStats.innerHTML = `
      <p>⭐ Score: <b>${Game.state.score}</b></p>
      <p>🌊 Waves Survived: <b>${Game.state.wave}</b></p>
      <p>🥫 Marinara Marks: <b>${Game.state.marks}</b></p>
      ${sauceGain >= 1 ? `<p>🍅 Sauce available: <b>${sauceGain}</b></p>` : '<p style="color:#ff6b6b">Reach wave 5 to earn Sauce.</p>'}
    `;
    this.el.btnPrestigeFromGO.style.display = sauceGain >= 1 ? 'inline-block' : 'none';
    this.el.gameOverModal.classList.add('visible');
  },
  showVictory() {
    this.el.victoryStats.innerHTML = `
      <p>⭐ Score: <b>${Game.state.score}</b></p>
      <p>🪙 Gold remaining: <b>${Math.floor(Game.state.gold)}</b></p>
      <p>❤️ Lives remaining: <b>${Game.state.lives}/${Game.state.maxLives}</b></p>
      <p>🍅 Sauce available: <b>${Game.computePrestigeGain()}</b></p>
    `;
    this.el.victoryModal.classList.add('visible');
  }
};
