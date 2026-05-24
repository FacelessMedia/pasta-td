/* ============== PASTA TD UI ============== */

const UI = {
  // Cached elements
  el: {},

  init() {
    this.el = {
      loginScreen: document.getElementById('loginScreen'),
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
      btnLogout: document.getElementById('btnLogout'),

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
      footerMsg: document.getElementById('footerMsg'),
      toast: document.getElementById('toast'),
      waveBanner: document.getElementById('waveBanner'),

      btnStartWave: document.getElementById('btnStartWave'),
      btnPause: document.getElementById('btnPause'),
      btnSpeed: document.getElementById('btnSpeed'),
      btnSave: document.getElementById('btnSave'),
      btnSkillTree: document.getElementById('btnSkillTree'),
      btnPrestige: document.getElementById('btnPrestige'),

      // Modals
      skillTreeModal: document.getElementById('skillTreeModal'),
      skillTreeGrid: document.getElementById('skillTreeGrid'),
      marksDisplay: document.getElementById('marksDisplay'),
      prestigeModal: document.getElementById('prestigeModal'),
      prestigeInfo: document.getElementById('prestigeInfo'),
      prestigePerks: document.getElementById('prestigePerks'),
      btnDoPrestige: document.getElementById('btnDoPrestige'),

      gameOverModal: document.getElementById('gameOverModal'),
      gameOverTitle: document.getElementById('gameOverTitle'),
      gameOverText: document.getElementById('gameOverText'),
      gameOverStats: document.getElementById('gameOverStats'),
      btnRestart: document.getElementById('btnRestart'),
      btnPrestigeFromGO: document.getElementById('btnPrestigeFromGO'),

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
    this.el.btnLogout.addEventListener('click', () => this.doLogout());

    // Enter key support
    this.el.loginPass.addEventListener('keydown', e => { if (e.key === 'Enter') this.doLogin(); });
    this.el.regPass.addEventListener('keydown', e => { if (e.key === 'Enter') this.doRegister(); });

    // Close modal buttons
    document.querySelectorAll('[data-close]').forEach(b => {
      b.addEventListener('click', () => {
        document.getElementById(b.dataset.close).classList.remove('visible');
      });
    });

    // Click outside modal to close
    document.querySelectorAll('.modal').forEach(m => {
      m.addEventListener('click', e => { if (e.target === m) m.classList.remove('visible'); });
    });

    // Modal openers
    this.el.btnSkillTree.addEventListener('click', () => this.openSkillTree());
    this.el.btnPrestige.addEventListener('click', () => this.openPrestige());
    this.el.btnSave.addEventListener('click', () => Game.saveGame(true));
    this.el.btnDoPrestige.addEventListener('click', () => Game.doPrestige());

    // Auto-login if session exists
    const session = SaveSystem.getSession();
    if (session) {
      if (session === 'guest') {
        this.doGuest(true);
      } else {
        const users = SaveSystem.loadUsers();
        if (users[session]) {
          SaveSystem.setSession(session);
          this.enterGame();
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
      setTimeout(() => this.enterGame(), 400);
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
      setTimeout(() => this.enterGame(), 400);
    }
  },
  doGuest(silent) {
    SaveSystem.setSession('guest');
    this.enterGame();
  },
  doLogout() {
    Game.saveGame();
    SaveSystem.clearSession();
    this.el.gameScreen.classList.remove('visible');
    this.el.loginScreen.classList.add('visible');
  },

  enterGame() {
    this.el.loginScreen.classList.remove('visible');
    this.el.gameScreen.classList.add('visible');
    this.el.userLabel.textContent = SaveSystem.currentUser === 'guest' ? '👤 Guest' : '🧑‍🍳 ' + SaveSystem.currentUser;
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
    TOWERS.forEach(t => {
      const unlocked = fastStart || (s.wave + 1) >= t.unlockWave;
      const cost = Math.floor(t.cost * costMult);
      const canAfford = s.gold >= cost;
      const card = document.createElement('div');
      card.className = 'tower-card' + (!unlocked ? ' locked' : (!canAfford ? ' cant-afford' : ''));
      if (Game.selectedTowerType && Game.selectedTowerType.id === t.id) card.classList.add('selected');
      card.innerHTML = `
        <div class="tower-emoji">${t.emoji}</div>
        <div class="tower-meta">
          <div class="name">${t.name}</div>
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
    if (Game.selectedTower) return; // don't override upgrade panel
    this.el.towerInfo.innerHTML = `
      <h3>${t.emoji} ${t.name}</h3>
      <p style="color:#f5d76e">${t.desc}</p>
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

  // ===== Wave Preview =====
  renderWavePreview() {
    const s = Game.state;
    const nextWaveIdx = s.waveActive ? s.wave : s.wave; // current upcoming
    if (nextWaveIdx >= MAX_WAVES) {
      if (s.endlessMode) {
        this.el.wavePreview.innerHTML = '<span style="font-size:11px">♾️ Endless mode — random scaling enemies</span>';
      } else {
        this.el.wavePreview.innerHTML = '<span style="font-size:11px">🏆 No more waves!</span>';
      }
      return;
    }
    const wave = WAVES[nextWaveIdx];
    this.el.wavePreview.innerHTML = '';
    wave.enemies.forEach(group => {
      const def = ENEMIES[group.type];
      if (!def) return;
      const div = document.createElement('div');
      div.className = 'preview-enemy';
      div.title = `${def.name} x${group.count}`;
      div.textContent = def.emoji;
      div.dataset.count = group.count;
      this.el.wavePreview.appendChild(div);
    });
    if (wave.boss) {
      const b = document.createElement('div');
      b.textContent = '⚠️ BOSS WAVE';
      b.style.cssText = 'color:#ff6b6b;font-weight:bold;font-size:11px;width:100%;margin-top:4px;';
      this.el.wavePreview.appendChild(b);
    }
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

  // ===== SKILL TREE =====
  openSkillTree() {
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
        });
      } else if (!maxed) {
        div.style.opacity = '0.6';
      }
      this.el.prestigePerks.appendChild(div);
    });
  },

  showGameOver(reason) {
    this.el.gameOverTitle.textContent = reason === 'lives' ? '💀 Game Over — Diners Stole the Pasta!' : '🍝 Game Over';
    this.el.gameOverText.textContent = `You survived ${Game.state.wave} waves.`;
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
