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
    this.el.mnuPlay.addEventListener('click', () => this.enterGame());
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
    this.el.menuSummary.innerHTML = `
      <div class="ms-item">🍅 Sauce: <b>${s.sauce}</b></div>
      <div class="ms-item">✨ Prestige Lv: <b>${s.prestigeLevel}</b></div>
      <div class="ms-item">🏆 Best Wave: <b>${s.highWave}</b></div>
      <div class="ms-item">📚 Bestiary: <b>${discovered}/${total}</b></div>
      <div class="ms-item">🔁 Runs: <b>${s.runsCompleted}</b></div>
    `;
  },

  goToMenu() {
    if (Game.save) Game.saveGame();
    this.el.gameScreen.classList.remove('visible');
    this.el.menuScreen.classList.add('visible');
    this.renderMenuSummary();
  },

  enterGame() {
    this.el.menuScreen.classList.remove('visible');
    this.el.loginScreen.classList.remove('visible');
    this.el.gameScreen.classList.add('visible');
    const name = SaveSystem.currentUser === 'guest' ? '👤 Guest' : '🧑‍🍳 ' + SaveSystem.currentUser;
    this.el.userLabel.textContent = name;
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
        <div class="tower-emoji">${t.emoji}</div>
        <div class="tower-meta">
          <div class="name">${t.name} <span style="opacity:0.5;font-size:9px">[${i + 1}]</span></div>
          <div class="cost">${unlocked ? '🪙 ' + cost : '🔒 Wave ' + t.unlockWave}</div>
          <div class="desc">${t.desc}</div>
        </div>
      `;
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
    let html = `
      <div class="name">${t.emoji} ${t.name}</div>
      <div class="stat-row"><span>💥 Damage</span><b>${tower.getDamage().toFixed(1)}</b></div>
      <div class="stat-row"><span>🎯 Range</span><b>${tower.getRange().toFixed(0)}</b></div>
      <div class="stat-row"><span>⚡ Rate</span><b>${tower.getFireRate().toFixed(2)}/s</b></div>
      ${t.splash ? `<div class="stat-row"><span>💢 Splash</span><b>${tower.getSplash().toFixed(0)}</b></div>` : ''}
      <div class="stat-row"><span>💀 Kills</span><b>${tower.kills}</b></div>
    `;
    Object.entries(t.upgrades || {}).forEach(([key, up]) => {
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
    const sellValue = Math.floor(tower.totalSpent * 0.7);
    html += `<button class="sell" data-sell="1">Sell — 🪙${sellValue}</button>`;
    this.el.upgradePanel.innerHTML = html;

    Object.keys(t.upgrades || {}).forEach(key => {
      const btn = this.el.upgradePanel.querySelector(`[data-upgrade="${key}"]`);
      if (btn) btn.addEventListener('click', () => Game.upgradeTower(tower, key));
    });
    this.el.upgradePanel.querySelector('[data-sell]').addEventListener('click', () => Game.sellTower(tower));
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
      div.textContent = def.emoji;
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
    Object.entries(SKILL_TREE).forEach(([branchId, branch]) => {
      const div = document.createElement('div');
      div.className = 'skill-branch ' + branchId;
      div.innerHTML = `<h3 style="color:${branch.color}">${branch.name}</h3>`;
      branch.nodes.forEach(node => {
        const lvl = Game.state.skillPoints[node.id] || 0;
        const maxed = lvl >= node.max;
        const cost = node.costs[lvl];
        const canAfford = !maxed && Game.state.marks >= cost;
        const nodeDiv = document.createElement('div');
        nodeDiv.className = 'skill-node' + (maxed ? ' maxed' : (!canAfford ? ' locked' : ''));
        nodeDiv.innerHTML = `
          <div class="name">${node.name} <span class="cost">${maxed ? '✓ MAX' : '🥫 ' + cost}</span></div>
          <div class="desc">${node.desc}</div>
          <div class="level">Level ${lvl}/${node.max}</div>
        `;
        if (!maxed && canAfford) {
          nodeDiv.addEventListener('click', () => {
            Game.buySkill(branchId, node.id);
            this.renderSkillTree();
          });
        }
        div.appendChild(nodeDiv);
      });
      this.el.skillTreeGrid.appendChild(div);
    });
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
    PRESTIGE_PERKS.forEach(perk => {
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
      this.el.prestigePerks.appendChild(div);
    });
  },

  // ===== BESTIARY =====
  openBestiary() {
    this.renderBestiary();
    this.el.bestiaryModal.classList.add('visible');
  },
  renderBestiary() {
    this.el.bestiaryGrid.innerHTML = '';
    const discovered = Game.save.discoveredEnemies || {};
    Object.entries(ENEMIES).forEach(([id, def]) => {
      const seen = !!discovered[id];
      const div = document.createElement('div');
      div.className = 'bestiary-card' + (def.boss ? ' boss' : '') + (seen ? '' : ' undiscovered');
      const tags = (def.tags || []).map(t => `<span class="tag ${t}">${t}</span>`).join(' ');
      if (seen) {
        div.innerHTML = `
          <div class="emoji">${def.emoji}</div>
          <div class="name">${def.name}</div>
          <div style="margin-top:3px">${tags}</div>
          <div class="stats">
            ❤️ ${def.hp} HP &nbsp; 👟 ${def.speed} &nbsp; 🪙 ${def.gold}
            ${def.armor ? '<br>🛡️ ' + Math.round(def.armor*100) + '% armor' : ''}
            <br>💪 ${def.strength}
            <br>💔 ${def.weakness}
          </div>
          <div class="lore">"${def.lore}"</div>
        `;
      } else {
        div.innerHTML = `
          <div class="emoji">❓</div>
          <div class="name unknown">??? UNDISCOVERED</div>
          <div class="stats" style="opacity:0.6">Defeat one to reveal!</div>
        `;
      }
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
    const tags = (def.tags || []).map(t => `<span class="bestiary-card"><span class="tag ${t}">${t}</span></span>`).join(' ');
    this.el.enemyIntroBody.innerHTML = `
      <div class="enemy-intro-emoji">${def.emoji}</div>
      <div class="enemy-intro-info">
        <h3>${def.name}${def.boss ? ' 👑' : ''}</h3>
        <div class="stat-line"><span>❤️ Health</span><b>${def.hp}</b></div>
        <div class="stat-line"><span>👟 Speed</span><b>${def.speed}</b></div>
        <div class="stat-line"><span>🪙 Bounty</span><b>${def.gold}</b></div>
        ${def.armor ? `<div class="stat-line"><span>🛡️ Armor</span><b>${Math.round(def.armor*100)}%</b></div>` : ''}
        <div class="stat-line"><span>💪 Strength</span><b>${def.strength || '—'}</b></div>
        <div class="stat-line"><span>💔 Weakness</span><b>${def.weakness || '—'}</b></div>
        <div class="lore">"${def.lore}"</div>
      </div>
    `;
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
