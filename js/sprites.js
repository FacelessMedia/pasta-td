/* ============== PASTA TD — CUSTOM SPRITES ============== */
// All enemies, towers, and projectiles are drawn procedurally with canvas
// primitives. No emoji fallbacks in-world. Each sprite supports animation
// via the `time` parameter (seconds).

const Sprites = {
  // ============ PUBLIC: ENEMIES ============
  drawEnemy(ctx, type, def, x, y, size, time, opts) {
    opts = opts || {};
    const fn = this.enemyDrawers[type] || this.enemyDrawers._default;
    ctx.save();
    ctx.translate(x, y);
    // Slight idle bob unless boss (boss is too imposing to bob)
    if (!def.boss) {
      const bob = Math.sin(time * 4 + x * 0.07) * size * 0.04;
      ctx.translate(0, bob);
    }
    if (opts.flash) {
      // Tint glow surrounding the sprite
      ctx.shadowColor = '#ffffff';
      ctx.shadowBlur = size * 0.6;
    }
    fn.call(this, ctx, def, size, time);
    ctx.restore();
  },

  // Draw a static enemy for UI thumbnails (no bob/time anim)
  drawEnemyStatic(ctx, type, def, x, y, size) {
    const fn = this.enemyDrawers[type] || this.enemyDrawers._default;
    ctx.save();
    ctx.translate(x, y);
    fn.call(this, ctx, def, size, 0);
    ctx.restore();
  },

  // ============ PUBLIC: TOWERS ============
  drawTower(ctx, type, def, x, y, size, time, upgrades) {
    const fn = this.towerDrawers[type] || this.towerDrawers._default;
    ctx.save();
    ctx.translate(x, y);
    fn.call(this, ctx, def, size, time, upgrades || 0);
    ctx.restore();
  },

  drawTowerStatic(ctx, type, def, x, y, size) {
    const fn = this.towerDrawers[type] || this.towerDrawers._default;
    ctx.save();
    ctx.translate(x, y);
    fn.call(this, ctx, def, size, 0, 0);
    ctx.restore();
  },

  // ============ PUBLIC: PROJECTILES ============
  drawProjectile(ctx, p) {
    const fn = this.projectileDrawers[p.kind] || this.projectileDrawers._default;
    ctx.save();
    ctx.translate(p.x, p.y);
    fn.call(this, ctx, p);
    ctx.restore();
  },

  // ============ PUBLIC: THUMBNAIL HELPER ============
  // kind: 'enemy' | 'tower' | 'locked'
  // Returns a DOM <canvas> element with the sprite drawn centered
  thumbCanvas(kind, type, def, size) {
    size = size || 64;
    const c = document.createElement('canvas');
    c.width = size;
    c.height = size;
    const ctx = c.getContext('2d');
    if (kind === 'enemy') {
      this.drawEnemyStatic(ctx, type, def, size/2, size/2, Math.floor(size*0.7));
    } else if (kind === 'tower') {
      this.drawTowerStatic(ctx, type, def, size/2, size/2 + size*0.05, Math.floor(size*0.65));
    } else {
      this.drawLocked(ctx, size/2, size/2, Math.floor(size*0.85));
    }
    return c;
  },

  // ============ PUBLIC: PASTA "?" FOR LOCKED ENTRIES ============
  drawLocked(ctx, x, y, size) {
    ctx.save();
    ctx.translate(x, y);
    const s = size;
    // Dark background plate
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    this._roundedRect(ctx, -s/2, -s/2, s, s, s*0.12);
    ctx.fill();
    // Noodle '?' — twisted pasta strand bent into a question mark
    const noodleW = s * 0.16;
    // Outer ring of the '?'
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    // Shadow stroke for depth
    ctx.strokeStyle = '#3a2a08';
    ctx.lineWidth = noodleW * 1.3;
    this._questionPath(ctx, s);
    ctx.stroke();
    // Main noodle
    const grad = ctx.createLinearGradient(0, -s*0.5, 0, s*0.5);
    grad.addColorStop(0, '#fff4b8');
    grad.addColorStop(0.5, '#f5d76e');
    grad.addColorStop(1, '#c9a73d');
    ctx.strokeStyle = grad;
    ctx.lineWidth = noodleW;
    this._questionPath(ctx, s);
    ctx.stroke();
    // Highlight squiggle
    ctx.strokeStyle = 'rgba(255,255,255,0.55)';
    ctx.lineWidth = noodleW * 0.25;
    this._questionPath(ctx, s, -noodleW*0.25);
    ctx.stroke();
    // Dot of '?'
    ctx.fillStyle = '#3a2a08';
    ctx.beginPath(); ctx.arc(0, s*0.32, noodleW*0.55, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = grad;
    ctx.beginPath(); ctx.arc(0, s*0.32, noodleW*0.45, 0, Math.PI*2); ctx.fill();
    ctx.restore();
  },

  _questionPath(ctx, s, off) {
    off = off || 0;
    ctx.beginPath();
    // Top curve of '?' — half circle from left, sweeping over top, down right
    ctx.arc(0, -s*0.18 + off, s*0.22, Math.PI, Math.PI*2.05, false);
    // Tail going down
    ctx.lineTo(0, s*0.18 + off);
  },

  // ============ HELPERS ============
  _roundedRect(ctx, x, y, w, h, r) {
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
  },
  _shine(ctx, x, y, rx, ry, rot) {
    ctx.fillStyle = 'rgba(255,255,255,0.45)';
    ctx.beginPath();
    ctx.ellipse(x, y, rx, ry, rot || -0.5, 0, Math.PI*2);
    ctx.fill();
  },
  _eyes(ctx, s, expr) {
    // expr: 'angry' | 'mean' | 'wide' | 'dead' | 'crazy'
    const eyeY = -s*0.05;
    const eyeR = s*0.075;
    const offX = s*0.16;
    // Sclera
    ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.arc(-offX, eyeY, eyeR, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(offX, eyeY, eyeR, 0, Math.PI*2); ctx.fill();
    // Pupils
    ctx.fillStyle = '#111';
    const pr = eyeR * 0.55;
    ctx.beginPath(); ctx.arc(-offX, eyeY, pr, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(offX, eyeY, pr, 0, Math.PI*2); ctx.fill();
    // Angry brows
    if (expr === 'angry' || expr === 'mean') {
      ctx.strokeStyle = '#111';
      ctx.lineWidth = Math.max(1.5, s*0.05);
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(-offX - eyeR, eyeY - eyeR*1.8);
      ctx.lineTo(-offX + eyeR*0.5, eyeY - eyeR*0.6);
      ctx.moveTo(offX + eyeR, eyeY - eyeR*1.8);
      ctx.lineTo(offX - eyeR*0.5, eyeY - eyeR*0.6);
      ctx.stroke();
    }
    if (expr === 'crazy') {
      // Bigger sclera + smaller pupils
      ctx.fillStyle = '#fff';
      ctx.beginPath(); ctx.arc(-offX, eyeY, eyeR*1.2, 0, Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.arc(offX, eyeY, eyeR*1.2, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = '#c0392b';
      ctx.beginPath(); ctx.arc(-offX, eyeY, eyeR*0.45, 0, Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.arc(offX, eyeY, eyeR*0.45, 0, Math.PI*2); ctx.fill();
    }
  },

  // ============ PASTA HELPERS (shared geometry) ============
  _pastaShade(ctx, color, r) {
    // Returns a radial gradient suited for pasta dough (golden core, browned edges)
    const g = ctx.createRadialGradient(-r*0.3, -r*0.35, r*0.1, 0, 0, r);
    g.addColorStop(0, this._tint(color, 0.35));
    g.addColorStop(0.55, color);
    g.addColorStop(1, this._tint(color, -0.4));
    return g;
  },
  _tint(hex, amt) {
    // Lighten (amt > 0) or darken (amt < 0) a #rrggbb color
    const c = hex.replace('#','');
    const r = parseInt(c.slice(0,2),16), g = parseInt(c.slice(2,4),16), b = parseInt(c.slice(4,6),16);
    const f = amt < 0 ? (1 + amt) : 1;
    const o = amt > 0 ? amt * 255 : 0;
    const clamp = v => Math.max(0, Math.min(255, Math.round(v * f + o)));
    return `rgb(${clamp(r)},${clamp(g)},${clamp(b)})`;
  },
  _ridges(ctx, x, y, w, h, count, color) {
    // Draw vertical ridge lines (for ridged pasta)
    ctx.strokeStyle = color || 'rgba(0,0,0,0.25)';
    ctx.lineWidth = 1;
    for (let i = 0; i < count; i++) {
      const lx = x + (w * (i + 1)) / (count + 1);
      ctx.beginPath();
      ctx.moveTo(lx, y);
      ctx.lineTo(lx, y + h);
      ctx.stroke();
    }
  },

  // ============ ENEMY DRAWERS ============
  enemyDrawers: {
    _default(ctx, def, s) {
      ctx.fillStyle = def.color || '#aaa';
      ctx.beginPath(); ctx.arc(0, 0, s/2, 0, Math.PI*2); ctx.fill();
    },

    // 🟤 -> proper meatball with herbs, shine, angry eyes
    meatball(ctx, def, s, time) {
      const r = s/2;
      // Body — radial gradient brown sphere
      const g = ctx.createRadialGradient(-r*0.3, -r*0.35, r*0.1, 0, 0, r);
      g.addColorStop(0, '#b97a4a');
      g.addColorStop(0.55, '#8b4513');
      g.addColorStop(1, '#3a1c08');
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI*2); ctx.fill();
      // Outer rim
      ctx.strokeStyle = '#2a1206'; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI*2); ctx.stroke();
      // Herb flecks (parsley)
      ctx.fillStyle = '#2d6a3a';
      const flecks = [[0.25,-0.2,0.05],[-0.2,0.12,0.06],[0.05,0.28,0.04],[-0.32,-0.05,0.04],[0.32,0.08,0.05]];
      flecks.forEach(([fx,fy,fr])=>{
        ctx.beginPath(); ctx.arc(fx*r, fy*r, fr*r, 0, Math.PI*2); ctx.fill();
      });
      // Eyes (angry)
      Sprites._eyes(ctx, s, 'angry');
      // Glossy shine
      Sprites._shine(ctx, -r*0.35, -r*0.4, r*0.22, r*0.1);
    },

    tomato(ctx, def, s, time) {
      const r = s/2;
      // Body
      const g = ctx.createRadialGradient(-r*0.3, -r*0.3, r*0.1, 0, 0, r);
      g.addColorStop(0, '#ff8a80');
      g.addColorStop(0.7, '#d63031');
      g.addColorStop(1, '#7a1010');
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI*2); ctx.fill();
      // Subtle vertical segment lines
      ctx.strokeStyle = 'rgba(0,0,0,0.18)'; ctx.lineWidth = 1;
      for (let i=0; i<3; i++) {
        const angle = -Math.PI/2 + (i-1)*0.35;
        ctx.beginPath();
        ctx.moveTo(Math.cos(angle)*r*0.95, Math.sin(angle)*r*0.95);
        ctx.quadraticCurveTo(Math.cos(angle)*r*0.3, 0, Math.cos(angle)*r*0.95, -Math.sin(angle)*r*0.95);
        ctx.stroke();
      }
      // Stem base
      ctx.fillStyle = '#2c5e1a';
      ctx.beginPath();
      ctx.moveTo(-r*0.18, -r*0.95);
      ctx.lineTo(-r*0.05, -r*1.1);
      ctx.lineTo(r*0.05, -r*1.1);
      ctx.lineTo(r*0.18, -r*0.95);
      ctx.closePath(); ctx.fill();
      // Leaves
      ctx.fillStyle = '#3da846';
      [[-r*0.45,-r*0.85,-0.5],[r*0.45,-r*0.85,0.5],[0,-r*1.0,0]].forEach(([lx,ly,rot])=>{
        ctx.save();
        ctx.translate(lx, ly); ctx.rotate(rot);
        ctx.beginPath();
        ctx.ellipse(0, 0, r*0.28, r*0.12, 0, 0, Math.PI*2);
        ctx.fill();
        ctx.restore();
      });
      // Leaf vein
      ctx.strokeStyle = '#2c5e1a'; ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(-r*0.7, -r*0.85);
      ctx.lineTo(r*0.7, -r*0.85);
      ctx.stroke();
      // Eyes (mean)
      Sprites._eyes(ctx, s, 'mean');
      // Shine
      Sprites._shine(ctx, -r*0.35, -r*0.4, r*0.22, r*0.1);
    },

    // Spaghetti Slug — wiggling noodle worm
    garlic(ctx, def, s, time) {
      const r = s/2;
      // Body — squished oval with wiggle
      const wob = Math.sin(time*5)*0.08;
      ctx.save();
      ctx.rotate(wob);
      // Main body
      const g = ctx.createLinearGradient(0, -r*0.6, 0, r*0.6);
      g.addColorStop(0, '#fff4b8');
      g.addColorStop(0.5, '#f5d76e');
      g.addColorStop(1, '#c9a73d');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.ellipse(0, 0, r*0.95, r*0.7, 0, 0, Math.PI*2);
      ctx.fill();
      ctx.strokeStyle = '#7a5a1a'; ctx.lineWidth = 1;
      ctx.stroke();
      // Noodle strands wrapping body
      ctx.strokeStyle = '#c9a73d'; ctx.lineWidth = 1.5; ctx.lineCap = 'round';
      for (let i=0; i<5; i++) {
        const off = (i - 2) * r * 0.35;
        ctx.beginPath();
        ctx.moveTo(-r*0.9, off*0.5);
        ctx.bezierCurveTo(-r*0.3, off*0.5 - r*0.3 + Math.sin(time*4+i)*r*0.1, r*0.3, off*0.5 + r*0.3, r*0.9, off*0.5);
        ctx.stroke();
      }
      // Eyes on left side (slug head)
      ctx.save();
      ctx.translate(-r*0.5, -r*0.15);
      ctx.scale(0.7, 0.7);
      Sprites._eyes(ctx, s, 'crazy');
      ctx.restore();
      ctx.restore();
    },

    pepperoni(ctx, def, s, time) {
      const r = s/2;
      // Disk body
      const g = ctx.createRadialGradient(-r*0.25, -r*0.25, r*0.1, 0, 0, r);
      g.addColorStop(0, '#e74c3c');
      g.addColorStop(0.7, '#b33939');
      g.addColorStop(1, '#5a1010');
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI*2); ctx.fill();
      // Rim
      ctx.strokeStyle = '#7a1c1c'; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.arc(0, 0, r*0.95, 0, Math.PI*2); ctx.stroke();
      // Darker spots
      ctx.fillStyle = '#5a0a0a';
      [[0.3,-0.2,0.12],[-0.3,0.1,0.14],[0.05,0.35,0.1],[-0.05,-0.4,0.08]].forEach(([fx,fy,fr])=>{
        ctx.beginPath(); ctx.arc(fx*r, fy*r, fr*r, 0, Math.PI*2); ctx.fill();
      });
      // Eyes (angry, small)
      ctx.save(); ctx.scale(0.85, 0.85);
      Sprites._eyes(ctx, s, 'angry');
      ctx.restore();
      Sprites._shine(ctx, -r*0.35, -r*0.4, r*0.2, r*0.07);
    },

    olive(ctx, def, s, time) {
      const r = s/2;
      // Body — dark green oval
      const g = ctx.createRadialGradient(-r*0.3, -r*0.4, r*0.1, 0, 0, r);
      g.addColorStop(0, '#6b8e23');
      g.addColorStop(0.6, '#4a5d23');
      g.addColorStop(1, '#1c2a10');
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.ellipse(0, 0, r*0.85, r, 0, 0, Math.PI*2); ctx.fill();
      ctx.strokeStyle = '#0c1a05'; ctx.lineWidth = 1.5;
      ctx.stroke();
      // Pimento hole at top
      ctx.fillStyle = '#1a1a1a';
      ctx.beginPath(); ctx.ellipse(0, -r*0.55, r*0.18, r*0.1, 0, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = '#c0392b';
      ctx.beginPath(); ctx.ellipse(0, -r*0.55, r*0.12, r*0.06, 0, 0, Math.PI*2); ctx.fill();
      // Eyes
      ctx.save(); ctx.translate(0, r*0.15);
      Sprites._eyes(ctx, s*0.85, 'mean');
      ctx.restore();
      Sprites._shine(ctx, -r*0.3, -r*0.2, r*0.18, r*0.08);
    },

    basil(ctx, def, s, time) {
      const r = s/2;
      // Cluster of leaves
      const leaves = [
        [0, -0.3, 0.5, -0.6],
        [-0.4, -0.1, 0.55, -1.1],
        [0.4, -0.1, 0.55, -0.1],
        [-0.3, 0.3, 0.5, 0.5],
        [0.3, 0.3, 0.5, -2.6],
        [0, 0.4, 0.45, Math.PI],
      ];
      // Back row (darker)
      ctx.fillStyle = '#1c5a1f';
      leaves.forEach(([lx,ly,sz,rot])=>{
        ctx.save();
        ctx.translate(lx*r, ly*r); ctx.rotate(rot);
        ctx.beginPath(); ctx.ellipse(0, 0, r*sz, r*sz*0.45, 0, 0, Math.PI*2); ctx.fill();
        ctx.restore();
      });
      // Front (lighter)
      const g = ctx.createRadialGradient(0, 0, r*0.1, 0, 0, r);
      g.addColorStop(0, '#67c46f');
      g.addColorStop(1, '#27ae60');
      ctx.fillStyle = g;
      leaves.forEach(([lx,ly,sz,rot])=>{
        ctx.save();
        ctx.translate(lx*r*0.85, ly*r*0.85); ctx.rotate(rot);
        ctx.beginPath(); ctx.ellipse(0, 0, r*sz*0.85, r*sz*0.38, 0, 0, Math.PI*2); ctx.fill();
        // Vein
        ctx.strokeStyle = '#1c5a1f'; ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(-r*sz*0.85, 0); ctx.lineTo(r*sz*0.85, 0); ctx.stroke();
        ctx.restore();
      });
      // Eyes peeking
      Sprites._eyes(ctx, s*0.9, 'angry');
    },

    mozzarella(ctx, def, s, time) {
      const r = s/2;
      // Pearly white blob with drip
      const g = ctx.createRadialGradient(-r*0.3, -r*0.4, r*0.1, 0, 0, r);
      g.addColorStop(0, '#ffffff');
      g.addColorStop(0.6, '#f5e6d3');
      g.addColorStop(1, '#c9a373');
      ctx.fillStyle = g;
      // Drippy bottom
      ctx.beginPath();
      ctx.moveTo(-r, 0);
      ctx.bezierCurveTo(-r, -r, r, -r, r, 0);
      ctx.bezierCurveTo(r, r*0.5, r*0.5, r*0.6, r*0.4, r*0.95);
      ctx.bezierCurveTo(r*0.3, r*1.1, r*0.1, r*1.1, 0, r*0.95);
      ctx.bezierCurveTo(-r*0.1, r*1.1, -r*0.3, r*1.1, -r*0.4, r*0.95);
      ctx.bezierCurveTo(-r*0.5, r*0.6, -r, r*0.5, -r, 0);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#8b6f3d'; ctx.lineWidth = 1.2;
      ctx.stroke();
      // Stretchy strings
      ctx.strokeStyle = 'rgba(255,255,255,0.7)'; ctx.lineWidth = 1.5;
      for (let i=0; i<3; i++) {
        ctx.beginPath();
        ctx.moveTo(-r*0.5 + i*r*0.4, -r*0.7);
        ctx.bezierCurveTo(-r*0.5 + i*r*0.4 + Math.sin(time*3+i)*r*0.1, -r*0.2, -r*0.5 + i*r*0.4 - Math.sin(time*3+i)*r*0.1, r*0.3, -r*0.5 + i*r*0.4, r*0.7);
        ctx.stroke();
      }
      // Eyes
      Sprites._eyes(ctx, s, 'mean');
      Sprites._shine(ctx, -r*0.35, -r*0.5, r*0.25, r*0.1);
    },

    // Anchovy — silver fish, swims with tail wag
    anchovy(ctx, def, s, time) {
      const r = s/2;
      const wag = Math.sin(time*9) * 0.3;
      // Body
      const g = ctx.createLinearGradient(0, -r*0.5, 0, r*0.5);
      g.addColorStop(0, '#dfe6e9');
      g.addColorStop(0.5, '#95a5a6');
      g.addColorStop(1, '#3d4a52');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.moveTo(-r*0.95, 0);
      ctx.bezierCurveTo(-r*0.5, -r*0.55, r*0.5, -r*0.55, r*0.6, 0);
      ctx.bezierCurveTo(r*0.5, r*0.55, -r*0.5, r*0.55, -r*0.95, 0);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#2c3a3f'; ctx.lineWidth = 1.2;
      ctx.stroke();
      // Tail fin
      ctx.fillStyle = '#7f8c8d';
      ctx.beginPath();
      ctx.moveTo(r*0.55, 0);
      ctx.lineTo(r*0.95 + wag*r*0.2, -r*0.45);
      ctx.lineTo(r*0.85 + wag*r*0.1, 0);
      ctx.lineTo(r*0.95 + wag*r*0.2, r*0.45);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      // Side stripe
      ctx.strokeStyle = '#2c3a3f'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(-r*0.6, 0); ctx.lineTo(r*0.5, 0); ctx.stroke();
      // Gill
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(-r*0.3, -r*0.25); ctx.lineTo(-r*0.3, r*0.25); ctx.stroke();
      // Eye
      ctx.fillStyle = '#fff';
      ctx.beginPath(); ctx.arc(-r*0.55, -r*0.1, r*0.12, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = '#111';
      ctx.beginPath(); ctx.arc(-r*0.58, -r*0.1, r*0.06, 0, Math.PI*2); ctx.fill();
      // Speed streaks
      ctx.strokeStyle = 'rgba(255,255,255,0.5)'; ctx.lineWidth = 1;
      for (let i=0; i<3; i++) {
        ctx.beginPath();
        ctx.moveTo(r*0.9 + i*r*0.15, -r*0.1 + i*r*0.1);
        ctx.lineTo(r*1.2 + i*r*0.15, -r*0.1 + i*r*0.1);
        ctx.stroke();
      }
    },

    parmesan(ctx, def, s, time) {
      const r = s/2;
      // Wedge shape
      const g = ctx.createLinearGradient(-r*0.6, -r*0.5, r*0.6, r*0.5);
      g.addColorStop(0, '#ffe9a3');
      g.addColorStop(0.5, '#f39c12');
      g.addColorStop(1, '#a85e0a');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.moveTo(-r*0.9, r*0.5);
      ctx.lineTo(r*0.7, r*0.5);
      ctx.lineTo(r*0.2, -r*0.9);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#6b3a08'; ctx.lineWidth = 2;
      ctx.stroke();
      // Crystalline cracks (parmesan crystals)
      ctx.strokeStyle = 'rgba(255,255,255,0.55)'; ctx.lineWidth = 1;
      for (let i=0; i<6; i++) {
        const a = (i/6) * Math.PI*2;
        ctx.beginPath();
        ctx.moveTo(Math.cos(a)*r*0.2, Math.sin(a)*r*0.2 - r*0.1);
        ctx.lineTo(Math.cos(a)*r*0.4, Math.sin(a)*r*0.4 - r*0.1);
        ctx.stroke();
      }
      // Hard rind on right (armor)
      ctx.fillStyle = '#6b3a08';
      ctx.beginPath();
      ctx.moveTo(r*0.7, r*0.5);
      ctx.lineTo(r*0.2, -r*0.9);
      ctx.lineTo(r*0.05, -r*0.85);
      ctx.lineTo(r*0.5, r*0.5);
      ctx.closePath();
      ctx.fill();
      // Eyes
      ctx.save();
      ctx.translate(-r*0.1, r*0.05);
      Sprites._eyes(ctx, s*0.85, 'mean');
      ctx.restore();
      // Sparkle
      ctx.fillStyle = '#fff';
      ctx.beginPath(); ctx.arc(-r*0.4, -r*0.1, r*0.05, 0, Math.PI*2); ctx.fill();
      // Armor indicator (shield glint top)
      ctx.fillStyle = 'rgba(255,255,255,0.7)';
      ctx.beginPath();
      ctx.moveTo(0, -r*0.6); ctx.lineTo(r*0.1, -r*0.4); ctx.lineTo(-r*0.05, -r*0.4);
      ctx.closePath(); ctx.fill();
    },

    cheeseWheel(ctx, def, s, time) {
      const r = s/2;
      // Wheel body
      const g = ctx.createRadialGradient(-r*0.3, -r*0.3, r*0.2, 0, 0, r);
      g.addColorStop(0, '#fff4a3');
      g.addColorStop(0.7, '#f1c40f');
      g.addColorStop(1, '#a8810a');
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI*2); ctx.fill();
      // Outer rind
      ctx.strokeStyle = '#6b4a06'; ctx.lineWidth = r*0.13;
      ctx.beginPath(); ctx.arc(0, 0, r*0.94, 0, Math.PI*2); ctx.stroke();
      // Inner rim shading
      ctx.strokeStyle = '#c69b08'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(0, 0, r*0.82, 0, Math.PI*2); ctx.stroke();
      // Swiss-style holes
      ctx.fillStyle = '#6b4a06';
      [[0.25,-0.15,0.13],[-0.2,0.2,0.1],[0.0,-0.35,0.08],[-0.3,-0.15,0.07],[0.15,0.25,0.09]].forEach(([fx,fy,fr])=>{
        ctx.beginPath(); ctx.arc(fx*r, fy*r, fr*r, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = '#3a2a08';
        ctx.beginPath(); ctx.arc(fx*r+1, fy*r+1, fr*r*0.7, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = '#6b4a06';
      });
      // Crown (boss marker)
      ctx.fillStyle = '#ffd700';
      const cx = 0, cy = -r*1.05;
      ctx.beginPath();
      ctx.moveTo(cx-r*0.3, cy);
      ctx.lineTo(cx-r*0.22, cy-r*0.2);
      ctx.lineTo(cx-r*0.1, cy-r*0.05);
      ctx.lineTo(cx, cy-r*0.25);
      ctx.lineTo(cx+r*0.1, cy-r*0.05);
      ctx.lineTo(cx+r*0.22, cy-r*0.2);
      ctx.lineTo(cx+r*0.3, cy);
      ctx.closePath(); ctx.fill();
      ctx.strokeStyle = '#a8810a'; ctx.lineWidth = 1.5;
      ctx.stroke();
      // Eyes
      Sprites._eyes(ctx, s*0.85, 'crazy');
      // Imposing aura ring
      const pulse = 0.5 + Math.sin(time*3) * 0.3;
      ctx.strokeStyle = 'rgba(255,215,0,' + (pulse*0.4) + ')';
      ctx.lineWidth = 3;
      ctx.beginPath(); ctx.arc(0, 0, r*1.1 + pulse*4, 0, Math.PI*2); ctx.stroke();
    },

    spicyPepper(ctx, def, s, time) {
      const r = s/2;
      // Flame aura
      const pulse = 0.5 + Math.sin(time*8)*0.5;
      ctx.fillStyle = 'rgba(255,80,0,' + (0.18 + pulse*0.15) + ')';
      ctx.beginPath();
      for (let i=0; i<12; i++) {
        const a = (i/12)*Math.PI*2;
        const len = r*0.95 + Math.sin(time*10 + i)*r*0.18;
        const x = Math.cos(a)*len, y = Math.sin(a)*len;
        if (i===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
      }
      ctx.closePath(); ctx.fill();
      // Body — curved chili
      ctx.save();
      ctx.rotate(0.3);
      const g = ctx.createLinearGradient(-r*0.5, 0, r*0.5, 0);
      g.addColorStop(0, '#ff4444');
      g.addColorStop(0.5, '#c0392b');
      g.addColorStop(1, '#7a0a0a');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.moveTo(-r*0.7, -r*0.1);
      ctx.bezierCurveTo(-r*0.4, -r*0.7, r*0.5, -r*0.6, r*0.7, r*0.2);
      ctx.bezierCurveTo(r*0.6, r*0.5, -r*0.4, r*0.5, -r*0.7, -r*0.1);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#5a0a0a'; ctx.lineWidth = 1.5;
      ctx.stroke();
      // Highlight
      ctx.strokeStyle = 'rgba(255,255,255,0.5)'; ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-r*0.3, -r*0.3); ctx.bezierCurveTo(0, -r*0.5, r*0.3, -r*0.4, r*0.5, -r*0.2);
      ctx.stroke();
      // Stem
      ctx.fillStyle = '#27ae60';
      ctx.beginPath();
      ctx.moveTo(-r*0.7, -r*0.1);
      ctx.lineTo(-r*0.95, -r*0.4);
      ctx.lineTo(-r*0.85, -r*0.5);
      ctx.lineTo(-r*0.6, -r*0.25);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
      // Eyes (crazy)
      ctx.save(); ctx.translate(r*0.1, -r*0.05);
      Sprites._eyes(ctx, s*0.7, 'crazy');
      ctx.restore();
    },

    pizza(ctx, def, s, time) {
      const r = s/2;
      // Crust (triangular slice)
      ctx.fillStyle = '#c9a373';
      ctx.beginPath();
      ctx.moveTo(-r*0.9, r*0.6);
      ctx.lineTo(r*0.9, r*0.6);
      ctx.lineTo(0, -r*0.9);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#7a5a1a'; ctx.lineWidth = 1.5;
      ctx.stroke();
      // Crust bottom ridge
      ctx.fillStyle = '#a87a3a';
      ctx.beginPath();
      ctx.moveTo(-r*0.9, r*0.6);
      ctx.lineTo(r*0.9, r*0.6);
      ctx.lineTo(r*0.7, r*0.4);
      ctx.lineTo(-r*0.7, r*0.4);
      ctx.closePath(); ctx.fill();
      // Cheese / sauce
      ctx.fillStyle = '#e67e22';
      ctx.beginPath();
      ctx.moveTo(-r*0.65, r*0.35);
      ctx.lineTo(r*0.65, r*0.35);
      ctx.lineTo(0, -r*0.7);
      ctx.closePath();
      ctx.fill();
      // Cheese
      ctx.fillStyle = '#fff4a3';
      ctx.beginPath();
      ctx.moveTo(-r*0.55, r*0.25);
      ctx.lineTo(r*0.55, r*0.25);
      ctx.lineTo(0, -r*0.55);
      ctx.closePath();
      ctx.fill();
      // Pepperoni dots
      ctx.fillStyle = '#c0392b';
      [[-0.2,-0.1,0.12],[0.2,0.05,0.12],[0,-0.35,0.1],[-0.05,0.15,0.1]].forEach(([fx,fy,fr])=>{
        ctx.beginPath(); ctx.arc(fx*r, fy*r, fr*r, 0, Math.PI*2); ctx.fill();
      });
      // Olives
      ctx.fillStyle = '#1c2a10';
      [[0.3,-0.2,0.05],[-0.3,0.05,0.05]].forEach(([fx,fy,fr])=>{
        ctx.beginPath(); ctx.arc(fx*r, fy*r, fr*r, 0, Math.PI*2); ctx.fill();
      });
      // Eyes
      ctx.save(); ctx.translate(0, r*0.05);
      Sprites._eyes(ctx, s*0.7, 'angry');
      ctx.restore();
    },

    pastaSauce(ctx, def, s, time) {
      const r = s/2;
      // Splatter shape with animated drips
      const g = ctx.createRadialGradient(0, 0, r*0.1, 0, 0, r);
      g.addColorStop(0, '#c0392b');
      g.addColorStop(0.7, '#7a1c1c');
      g.addColorStop(1, '#3a0a0a');
      ctx.fillStyle = g;
      ctx.beginPath();
      const blobs = 9;
      for (let i=0; i<blobs; i++) {
        const a = (i/blobs)*Math.PI*2;
        const wobble = Math.sin(time*3 + i*1.7) * 0.18;
        const rr = r * (0.85 + wobble);
        const x = Math.cos(a) * rr;
        const y = Math.sin(a) * rr;
        if (i===0) ctx.moveTo(x, y);
        else {
          const prevA = ((i-1)/blobs)*Math.PI*2;
          const cpA = (prevA + a)/2;
          const cpR = rr * 1.15;
          ctx.quadraticCurveTo(Math.cos(cpA)*cpR, Math.sin(cpA)*cpR, x, y);
        }
      }
      ctx.closePath(); ctx.fill();
      ctx.strokeStyle = '#5a0a0a'; ctx.lineWidth = 1;
      ctx.stroke();
      // Splatter drips
      ctx.fillStyle = '#7a1c1c';
      for (let i=0; i<4; i++) {
        const a = (i/4)*Math.PI*2 + time;
        ctx.beginPath();
        ctx.arc(Math.cos(a)*r*1.2, Math.sin(a)*r*1.2, r*0.08, 0, Math.PI*2);
        ctx.fill();
      }
      // Eyes (glowing red)
      ctx.fillStyle = '#fff';
      ctx.beginPath(); ctx.arc(-r*0.2, -r*0.05, r*0.1, 0, Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.arc(r*0.2, -r*0.05, r*0.1, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = '#ff4444';
      ctx.shadowColor = '#ff0000'; ctx.shadowBlur = 6;
      ctx.beginPath(); ctx.arc(-r*0.2, -r*0.05, r*0.06, 0, Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.arc(r*0.2, -r*0.05, r*0.06, 0, Math.PI*2); ctx.fill();
      ctx.shadowBlur = 0;
    },

    // ============ NEW PASTA-TYPE ENEMIES ============
    // Aliases (reuse existing visuals where appropriate)
    spaghetti(ctx, def, s, time) { Sprites.enemyDrawers.garlic.call(this, ctx, def, s, time); },
    arrabbiata(ctx, def, s, time) { Sprites.enemyDrawers.spicyPepper.call(this, ctx, def, s, time); },
    marinara(ctx, def, s, time) { Sprites.enemyDrawers.pastaSauce.call(this, ctx, def, s, time); },

    // Penne — angled-cut tube. Diagonal slice on both ends.
    penne(ctx, def, s, time) {
      const r = s/2;
      ctx.save();
      ctx.rotate(0.3);
      const g = ctx.createLinearGradient(-r*0.6, 0, r*0.6, 0);
      g.addColorStop(0, Sprites._tint(def.color, 0.3));
      g.addColorStop(0.5, def.color);
      g.addColorStop(1, Sprites._tint(def.color, -0.3));
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.moveTo(-r*0.7, -r*0.4);
      ctx.lineTo(r*0.4, -r*0.55);
      ctx.lineTo(r*0.7, r*0.4);
      ctx.lineTo(-r*0.4, r*0.55);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = Sprites._tint(def.color, -0.5); ctx.lineWidth = 1.5;
      ctx.stroke();
      // Ridges
      ctx.strokeStyle = 'rgba(0,0,0,0.22)'; ctx.lineWidth = 1;
      for (let i = -2; i <= 2; i++) {
        ctx.beginPath();
        ctx.moveTo(i*r*0.18, -r*0.5);
        ctx.lineTo(i*r*0.18 + r*0.05, r*0.5);
        ctx.stroke();
      }
      // Hollow openings (ellipses on the cut ends)
      ctx.fillStyle = Sprites._tint(def.color, -0.6);
      ctx.beginPath(); ctx.ellipse(-r*0.55, r*0.07, r*0.1, r*0.4, -0.3, 0, Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(r*0.55, -r*0.07, r*0.1, r*0.4, -0.3, 0, Math.PI*2); ctx.fill();
      ctx.restore();
      Sprites._eyes(ctx, s*0.7, 'angry');
    },

    // Orzo — rice-grain cluster (multiple little grains)
    orzo(ctx, def, s, time) {
      const r = s/2;
      // Cluster of 6 grain shapes
      const positions = [[-0.3,-0.2,-0.4],[0.2,-0.25,0.3],[-0.35,0.15,0.2],[0.3,0.1,-0.5],[0,0.3,0.1],[-0.05,-0.4,0]];
      positions.forEach(([px,py,rot])=>{
        ctx.save();
        ctx.translate(px*r, py*r);
        ctx.rotate(rot);
        const g = ctx.createLinearGradient(0, -r*0.18, 0, r*0.18);
        g.addColorStop(0, Sprites._tint(def.color, 0.2));
        g.addColorStop(1, Sprites._tint(def.color, -0.3));
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.ellipse(0, 0, r*0.32, r*0.13, 0, 0, Math.PI*2);
        ctx.fill();
        ctx.strokeStyle = Sprites._tint(def.color, -0.5); ctx.lineWidth = 1;
        ctx.stroke();
        ctx.restore();
      });
      // One tiny pair of eyes on the central grain
      ctx.save(); ctx.scale(0.5, 0.5);
      Sprites._eyes(ctx, s, 'mean');
      ctx.restore();
    },

    // Fusilli — corkscrew spiral
    fusilli(ctx, def, s, time) {
      const r = s/2;
      const spin = time * 2;
      ctx.save();
      ctx.rotate(spin * 0.3);
      // Body — vertical curl
      ctx.strokeStyle = def.color;
      ctx.lineWidth = r * 0.35;
      ctx.lineCap = 'round';
      ctx.beginPath();
      for (let t = 0; t <= 1; t += 0.05) {
        const y = (t - 0.5) * r * 1.6;
        const x = Math.sin(t * Math.PI * 5 + spin) * r * 0.45;
        if (t === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();
      // Highlight
      ctx.strokeStyle = Sprites._tint(def.color, 0.35);
      ctx.lineWidth = r * 0.1;
      ctx.beginPath();
      for (let t = 0; t <= 1; t += 0.05) {
        const y = (t - 0.5) * r * 1.6;
        const x = Math.sin(t * Math.PI * 5 + spin) * r * 0.45 - r*0.1;
        if (t === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();
      // Dark center groove
      ctx.strokeStyle = Sprites._tint(def.color, -0.45);
      ctx.lineWidth = r * 0.08;
      ctx.beginPath();
      for (let t = 0; t <= 1; t += 0.05) {
        const y = (t - 0.5) * r * 1.6;
        const x = Math.sin(t * Math.PI * 5 + spin) * r * 0.45;
        if (t === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.restore();
      // Eyes (crazy)
      Sprites._eyes(ctx, s*0.6, 'crazy');
    },

    // Rigatoni — ridged tube (horizontal)
    rigatoni(ctx, def, s, time) {
      const r = s/2;
      ctx.save();
      ctx.rotate(0.1);
      // Tube body
      const g = ctx.createLinearGradient(0, -r*0.5, 0, r*0.5);
      g.addColorStop(0, Sprites._tint(def.color, 0.3));
      g.addColorStop(0.5, def.color);
      g.addColorStop(1, Sprites._tint(def.color, -0.35));
      ctx.fillStyle = g;
      Sprites._roundedRect(ctx, -r*0.85, -r*0.45, r*1.7, r*0.9, r*0.12);
      ctx.fill();
      ctx.strokeStyle = Sprites._tint(def.color, -0.5); ctx.lineWidth = 1.5;
      Sprites._roundedRect(ctx, -r*0.85, -r*0.45, r*1.7, r*0.9, r*0.12);
      ctx.stroke();
      // Vertical ridges
      Sprites._ridges(ctx, -r*0.85, -r*0.45, r*1.7, r*0.9, 7, 'rgba(0,0,0,0.3)');
      // Hollow ends
      ctx.fillStyle = Sprites._tint(def.color, -0.55);
      ctx.beginPath(); ctx.ellipse(-r*0.8, 0, r*0.08, r*0.35, 0, 0, Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(r*0.8, 0, r*0.08, r*0.35, 0, 0, Math.PI*2); ctx.fill();
      ctx.restore();
      Sprites._eyes(ctx, s*0.7, 'angry');
    },

    // Ziti — smooth straight tube (like rigatoni but no ridges)
    ziti(ctx, def, s, time) {
      const r = s/2;
      ctx.save();
      ctx.rotate(0.05);
      const g = ctx.createLinearGradient(0, -r*0.5, 0, r*0.5);
      g.addColorStop(0, Sprites._tint(def.color, 0.35));
      g.addColorStop(0.5, def.color);
      g.addColorStop(1, Sprites._tint(def.color, -0.35));
      ctx.fillStyle = g;
      Sprites._roundedRect(ctx, -r*0.85, -r*0.4, r*1.7, r*0.8, r*0.18);
      ctx.fill();
      ctx.strokeStyle = Sprites._tint(def.color, -0.5); ctx.lineWidth = 1.5;
      Sprites._roundedRect(ctx, -r*0.85, -r*0.4, r*1.7, r*0.8, r*0.18);
      ctx.stroke();
      // Highlight stripe
      ctx.strokeStyle = 'rgba(255,255,255,0.4)'; ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-r*0.65, -r*0.22); ctx.lineTo(r*0.65, -r*0.22);
      ctx.stroke();
      // Hollow ends
      ctx.fillStyle = Sprites._tint(def.color, -0.55);
      ctx.beginPath(); ctx.ellipse(-r*0.8, 0, r*0.08, r*0.3, 0, 0, Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(r*0.8, 0, r*0.08, r*0.3, 0, 0, Math.PI*2); ctx.fill();
      ctx.restore();
      Sprites._eyes(ctx, s*0.7, 'mean');
    },

    // Bucatini — long thin hollow strands (bundle of 3)
    bucatini(ctx, def, s, time) {
      const r = s/2;
      const wob = Math.sin(time*5) * 0.06;
      ctx.save();
      ctx.rotate(wob);
      // 3 long thin tubes
      [-0.25, 0, 0.25].forEach(yOff => {
        ctx.save();
        ctx.translate(0, yOff * r);
        const g = ctx.createLinearGradient(0, -r*0.12, 0, r*0.12);
        g.addColorStop(0, Sprites._tint(def.color, 0.3));
        g.addColorStop(0.5, def.color);
        g.addColorStop(1, Sprites._tint(def.color, -0.3));
        ctx.fillStyle = g;
        Sprites._roundedRect(ctx, -r*0.95, -r*0.12, r*1.9, r*0.24, r*0.06);
        ctx.fill();
        ctx.strokeStyle = Sprites._tint(def.color, -0.5); ctx.lineWidth = 1;
        ctx.stroke();
        // Center hole (dark line)
        ctx.strokeStyle = Sprites._tint(def.color, -0.6); ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(-r*0.85, 0); ctx.lineTo(r*0.85, 0); ctx.stroke();
        ctx.restore();
      });
      ctx.restore();
      // Eyes on the front
      ctx.save(); ctx.translate(-r*0.4, 0); ctx.scale(0.6, 0.6);
      Sprites._eyes(ctx, s, 'mean');
      ctx.restore();
    },

    // Fettuccine — flat ribbon
    fettuccine(ctx, def, s, time) {
      const r = s/2;
      ctx.save();
      ctx.rotate(Math.sin(time*3) * 0.08);
      // 3 horizontal wavy ribbons
      [-0.3, 0, 0.3].forEach((yOff, i) => {
        ctx.save();
        ctx.translate(0, yOff * r);
        const g = ctx.createLinearGradient(0, -r*0.18, 0, r*0.18);
        g.addColorStop(0, Sprites._tint(def.color, 0.3));
        g.addColorStop(0.5, def.color);
        g.addColorStop(1, Sprites._tint(def.color, -0.3));
        ctx.fillStyle = g;
        ctx.beginPath();
        const waveOff = Math.sin(time*4 + i)*r*0.05;
        ctx.moveTo(-r*0.9, -r*0.16 + waveOff);
        ctx.bezierCurveTo(-r*0.4, -r*0.16 - waveOff, r*0.4, -r*0.16 + waveOff, r*0.9, -r*0.16 - waveOff);
        ctx.lineTo(r*0.9, r*0.16 - waveOff);
        ctx.bezierCurveTo(r*0.4, r*0.16 + waveOff, -r*0.4, r*0.16 - waveOff, -r*0.9, r*0.16 + waveOff);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = Sprites._tint(def.color, -0.5); ctx.lineWidth = 1;
        ctx.stroke();
        ctx.restore();
      });
      ctx.restore();
      Sprites._eyes(ctx, s*0.6, 'mean');
    },

    // Ravioli — square pillow with crimped edges
    ravioli(ctx, def, s, time) {
      const r = s/2;
      // Pillow body
      const g = ctx.createRadialGradient(-r*0.2, -r*0.25, r*0.1, 0, 0, r);
      g.addColorStop(0, Sprites._tint(def.color, 0.4));
      g.addColorStop(0.6, def.color);
      g.addColorStop(1, Sprites._tint(def.color, -0.35));
      ctx.fillStyle = g;
      // Rounded square shape
      Sprites._roundedRect(ctx, -r*0.85, -r*0.85, r*1.7, r*1.7, r*0.18);
      ctx.fill();
      ctx.strokeStyle = Sprites._tint(def.color, -0.5); ctx.lineWidth = 1.5;
      ctx.stroke();
      // Crimped edge dots all around
      ctx.fillStyle = Sprites._tint(def.color, -0.4);
      for (let i = 0; i < 12; i++) {
        const t = i / 12;
        const a = t * Math.PI * 2;
        const x = Math.cos(a) * r * 0.78;
        const y = Math.sin(a) * r * 0.78;
        ctx.beginPath(); ctx.arc(x, y, r*0.08, 0, Math.PI*2); ctx.fill();
      }
      // Center filling bump (lighter)
      ctx.fillStyle = Sprites._tint(def.color, 0.2);
      ctx.beginPath(); ctx.ellipse(0, 0, r*0.4, r*0.35, 0, 0, Math.PI*2); ctx.fill();
      // Eyes
      Sprites._eyes(ctx, s*0.85, 'angry');
    },

    // Farfalle — bow-tie / butterfly shape
    farfalle(ctx, def, s, time) {
      const r = s/2;
      const flap = Math.sin(time*6) * 0.08;
      ctx.save();
      const g = ctx.createLinearGradient(-r, 0, r, 0);
      g.addColorStop(0, Sprites._tint(def.color, -0.3));
      g.addColorStop(0.5, Sprites._tint(def.color, 0.3));
      g.addColorStop(1, Sprites._tint(def.color, -0.3));
      ctx.fillStyle = g;
      // Left wing
      ctx.save(); ctx.rotate(-flap);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.bezierCurveTo(-r*0.5, -r*0.8, -r*0.95, -r*0.7, -r*0.95, 0);
      ctx.bezierCurveTo(-r*0.95, r*0.7, -r*0.5, r*0.8, 0, 0);
      ctx.fill();
      ctx.strokeStyle = Sprites._tint(def.color, -0.5); ctx.lineWidth = 1;
      ctx.stroke();
      ctx.restore();
      // Right wing
      ctx.save(); ctx.rotate(flap);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.bezierCurveTo(r*0.5, -r*0.8, r*0.95, -r*0.7, r*0.95, 0);
      ctx.bezierCurveTo(r*0.95, r*0.7, r*0.5, r*0.8, 0, 0);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
      // Pinch center
      ctx.fillStyle = Sprites._tint(def.color, -0.4);
      Sprites._roundedRect(ctx, -r*0.12, -r*0.35, r*0.24, r*0.7, r*0.05);
      ctx.fill();
      // Crinkles on wings
      ctx.strokeStyle = 'rgba(0,0,0,0.2)'; ctx.lineWidth = 1;
      [-1, 1].forEach(sx => {
        for (let i = 0; i < 3; i++) {
          ctx.beginPath();
          ctx.moveTo(sx * r*0.25, -r*0.3 + i*r*0.3);
          ctx.lineTo(sx * r*0.85, -r*0.3 + i*r*0.3);
          ctx.stroke();
        }
      });
      ctx.restore();
      Sprites._eyes(ctx, s*0.55, 'mean');
    },

    // Tortellini — ring shape (belly-button pasta)
    tortellini(ctx, def, s, time) {
      const r = s/2;
      // Outer ring body
      const g = ctx.createRadialGradient(0, 0, r*0.45, 0, 0, r);
      g.addColorStop(0, Sprites._tint(def.color, -0.3));
      g.addColorStop(0.45, def.color);
      g.addColorStop(1, Sprites._tint(def.color, -0.3));
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(0, 0, r*0.95, 0, Math.PI*2);
      ctx.arc(0, 0, r*0.35, 0, Math.PI*2, true);
      ctx.fill('evenodd');
      // Outer rim
      ctx.strokeStyle = Sprites._tint(def.color, -0.5); ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.arc(0, 0, r*0.95, 0, Math.PI*2); ctx.stroke();
      // Inner rim
      ctx.beginPath(); ctx.arc(0, 0, r*0.35, 0, Math.PI*2); ctx.stroke();
      // Crimps along outer edge
      ctx.fillStyle = Sprites._tint(def.color, -0.4);
      for (let i = 0; i < 16; i++) {
        const a = (i/16) * Math.PI*2;
        const x = Math.cos(a) * r * 0.88;
        const y = Math.sin(a) * r * 0.88;
        ctx.beginPath(); ctx.arc(x, y, r*0.06, 0, Math.PI*2); ctx.fill();
      }
      // Eyes (inside the ring)
      ctx.save(); ctx.scale(0.5, 0.5);
      Sprites._eyes(ctx, s, 'crazy');
      ctx.restore();
    },

    // Gnocchi — soft potato dumpling with fork-press marks
    gnocchi(ctx, def, s, time) {
      const r = s/2;
      // Plump rounded shape
      const g = ctx.createRadialGradient(-r*0.25, -r*0.3, r*0.1, 0, 0, r);
      g.addColorStop(0, Sprites._tint(def.color, 0.3));
      g.addColorStop(0.7, def.color);
      g.addColorStop(1, Sprites._tint(def.color, -0.25));
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.ellipse(0, 0, r*0.85, r*0.95, 0, 0, Math.PI*2);
      ctx.fill();
      ctx.strokeStyle = Sprites._tint(def.color, -0.45); ctx.lineWidth = 1.5;
      ctx.stroke();
      // Fork press lines (4 horizontal grooves)
      ctx.strokeStyle = 'rgba(0,0,0,0.25)'; ctx.lineWidth = 1.5;
      for (let i = 0; i < 4; i++) {
        const y = -r*0.4 + i * r*0.27;
        ctx.beginPath();
        ctx.moveTo(-r*0.5, y); ctx.lineTo(r*0.5, y);
        ctx.stroke();
      }
      // Shine
      Sprites._shine(ctx, -r*0.3, -r*0.4, r*0.2, r*0.1);
      Sprites._eyes(ctx, s*0.85, 'mean');
    },

    // Angel Hair — thin strand bundle, fast and wispy
    angelHair(ctx, def, s, time) {
      const r = s/2;
      const wob = time * 4;
      // Many thin parallel strands
      ctx.strokeStyle = def.color; ctx.lineWidth = 1.5; ctx.lineCap = 'round';
      for (let i = -4; i <= 4; i++) {
        const off = i * r * 0.1;
        ctx.beginPath();
        ctx.moveTo(-r*0.9, off + Math.sin(wob)*r*0.05);
        ctx.bezierCurveTo(-r*0.3, off + Math.sin(wob+i)*r*0.15, r*0.3, off + Math.cos(wob+i)*r*0.15, r*0.9, off + Math.cos(wob)*r*0.05);
        ctx.stroke();
      }
      // Speed streaks
      ctx.strokeStyle = 'rgba(255,255,255,0.7)'; ctx.lineWidth = 1;
      for (let i = 0; i < 4; i++) {
        ctx.beginPath();
        ctx.moveTo(r*0.95, -r*0.3 + i*r*0.2);
        ctx.lineTo(r*1.2, -r*0.3 + i*r*0.2);
        ctx.stroke();
      }
      // Tiny eye on the front
      ctx.fillStyle = '#fff';
      ctx.beginPath(); ctx.arc(-r*0.55, -r*0.1, r*0.1, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = '#111';
      ctx.beginPath(); ctx.arc(-r*0.58, -r*0.1, r*0.05, 0, Math.PI*2); ctx.fill();
    },

    // Pappardelle — extra-wide ribbon (similar to fettuccine but bigger)
    pappardelle(ctx, def, s, time) {
      const r = s/2;
      ctx.save();
      ctx.rotate(Math.sin(time*2) * 0.05);
      const g = ctx.createLinearGradient(0, -r, 0, r);
      g.addColorStop(0, Sprites._tint(def.color, 0.35));
      g.addColorStop(0.5, def.color);
      g.addColorStop(1, Sprites._tint(def.color, -0.3));
      ctx.fillStyle = g;
      // One big wide wavy ribbon
      ctx.beginPath();
      const wOff = Math.sin(time*3)*r*0.1;
      ctx.moveTo(-r*0.95, -r*0.7 + wOff);
      ctx.bezierCurveTo(-r*0.3, -r*0.7 - wOff, r*0.3, -r*0.7 + wOff, r*0.95, -r*0.7 - wOff);
      ctx.lineTo(r*0.95, r*0.7 - wOff);
      ctx.bezierCurveTo(r*0.3, r*0.7 + wOff, -r*0.3, r*0.7 - wOff, -r*0.95, r*0.7 + wOff);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = Sprites._tint(def.color, -0.5); ctx.lineWidth = 1.5;
      ctx.stroke();
      // Surface texture lines
      ctx.strokeStyle = 'rgba(0,0,0,0.18)'; ctx.lineWidth = 1;
      for (let i = -2; i <= 2; i++) {
        ctx.beginPath();
        ctx.moveTo(-r*0.85, i*r*0.25);
        ctx.bezierCurveTo(-r*0.3, i*r*0.25 + wOff*0.5, r*0.3, i*r*0.25 - wOff*0.5, r*0.85, i*r*0.25);
        ctx.stroke();
      }
      ctx.restore();
      Sprites._eyes(ctx, s*0.7, 'angry');
    },

    // Conchiglie — shell pasta
    conchiglie(ctx, def, s, time) {
      const r = s/2;
      // Shell body
      const g = ctx.createRadialGradient(-r*0.3, -r*0.3, r*0.1, 0, 0, r);
      g.addColorStop(0, Sprites._tint(def.color, 0.35));
      g.addColorStop(0.6, def.color);
      g.addColorStop(1, Sprites._tint(def.color, -0.4));
      ctx.fillStyle = g;
      ctx.beginPath();
      // Curled shell shape
      ctx.moveTo(-r*0.7, r*0.6);
      ctx.bezierCurveTo(-r, -r*0.4, -r*0.3, -r*0.95, r*0.4, -r*0.85);
      ctx.bezierCurveTo(r*0.95, -r*0.6, r*0.95, r*0.3, r*0.7, r*0.7);
      ctx.bezierCurveTo(r*0.3, r*0.9, -r*0.3, r*0.85, -r*0.7, r*0.6);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = Sprites._tint(def.color, -0.55); ctx.lineWidth = 1.5;
      ctx.stroke();
      // Ridges fanning out from a point
      ctx.strokeStyle = Sprites._tint(def.color, -0.4); ctx.lineWidth = 1.5;
      for (let i = 0; i < 7; i++) {
        const a = -Math.PI * 0.5 + (i - 3) * 0.3;
        ctx.beginPath();
        ctx.moveTo(-r*0.4, r*0.5);
        ctx.quadraticCurveTo(Math.cos(a)*r*0.1, Math.sin(a)*r*0.1, Math.cos(a)*r*0.8, Math.sin(a)*r*0.7);
        ctx.stroke();
      }
      // Hollow opening (dark)
      ctx.fillStyle = 'rgba(0,0,0,0.4)';
      ctx.beginPath();
      ctx.ellipse(0, r*0.55, r*0.45, r*0.18, 0, 0, Math.PI*2);
      ctx.fill();
      // Eyes inside
      ctx.save(); ctx.translate(0, -r*0.1); ctx.scale(0.7, 0.7);
      Sprites._eyes(ctx, s, 'mean');
      ctx.restore();
      // Armor glint
      ctx.fillStyle = 'rgba(255,255,255,0.65)';
      ctx.beginPath(); ctx.moveTo(0, -r*0.7); ctx.lineTo(r*0.08, -r*0.5); ctx.lineTo(-r*0.05, -r*0.5); ctx.closePath(); ctx.fill();
    },

    // Cannelloni — large stuffed tube, mini-boss
    cannelloni(ctx, def, s, time) {
      const r = s/2;
      // Big tube
      const g = ctx.createLinearGradient(0, -r*0.5, 0, r*0.5);
      g.addColorStop(0, Sprites._tint(def.color, 0.3));
      g.addColorStop(0.5, def.color);
      g.addColorStop(1, Sprites._tint(def.color, -0.35));
      ctx.fillStyle = g;
      Sprites._roundedRect(ctx, -r*0.95, -r*0.5, r*1.9, r*1.0, r*0.18);
      ctx.fill();
      ctx.strokeStyle = Sprites._tint(def.color, -0.5); ctx.lineWidth = 2;
      Sprites._roundedRect(ctx, -r*0.95, -r*0.5, r*1.9, r*1.0, r*0.18);
      ctx.stroke();
      // Visible stuffing bulge on top (lighter)
      ctx.fillStyle = '#fff5e6';
      ctx.beginPath();
      ctx.ellipse(0, -r*0.45, r*0.7, r*0.15, 0, 0, Math.PI*2);
      ctx.fill();
      ctx.strokeStyle = '#c9a373'; ctx.lineWidth = 1;
      ctx.stroke();
      // Ricotta spots
      ctx.fillStyle = '#fff';
      [[-0.3,-0.45,0.04],[0,-0.42,0.05],[0.3,-0.45,0.04]].forEach(([fx,fy,fr])=>{
        ctx.beginPath(); ctx.arc(fx*r, fy*r, fr*r, 0, Math.PI*2); ctx.fill();
      });
      // Hollow ends
      ctx.fillStyle = Sprites._tint(def.color, -0.55);
      ctx.beginPath(); ctx.ellipse(-r*0.9, 0, r*0.08, r*0.35, 0, 0, Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(r*0.9, 0, r*0.08, r*0.35, 0, 0, Math.PI*2); ctx.fill();
      Sprites._eyes(ctx, s*0.7, 'angry');
    },

    // Manicotti — like cannelloni but with crepe wrap
    manicotti(ctx, def, s, time) {
      Sprites.enemyDrawers.cannelloni.call(this, ctx, def, s, time);
      const r = s/2;
      // Add a crepe wrap pattern (cross-hatch)
      ctx.strokeStyle = 'rgba(0,0,0,0.18)'; ctx.lineWidth = 1;
      for (let i = -2; i <= 2; i++) {
        ctx.beginPath(); ctx.moveTo(i*r*0.35, -r*0.5); ctx.lineTo(i*r*0.35 + r*0.2, r*0.5); ctx.stroke();
      }
    },

    // Radiatori — gear / radiator-shaped boss
    radiatori(ctx, def, s, time) {
      const r = s/2;
      // Rotating ridged exterior
      ctx.save();
      ctx.rotate(time * 0.6);
      ctx.fillStyle = Sprites._tint(def.color, -0.3);
      const teeth = 10;
      ctx.beginPath();
      for (let i = 0; i < teeth; i++) {
        const a = (i / teeth) * Math.PI * 2;
        const a2 = ((i + 0.5) / teeth) * Math.PI * 2;
        ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
        ctx.lineTo(Math.cos(a2) * r * 0.7, Math.sin(a2) * r * 0.7);
      }
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#3a1c08'; ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.restore();
      // Inner disc
      const g = ctx.createRadialGradient(0, 0, r*0.1, 0, 0, r*0.7);
      g.addColorStop(0, Sprites._tint(def.color, 0.4));
      g.addColorStop(0.7, def.color);
      g.addColorStop(1, Sprites._tint(def.color, -0.3));
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(0, 0, r*0.65, 0, Math.PI*2); ctx.fill();
      ctx.strokeStyle = Sprites._tint(def.color, -0.6); ctx.lineWidth = 2;
      ctx.stroke();
      // Heat glow inside
      const pulse = 0.5 + Math.sin(time*5)*0.5;
      ctx.fillStyle = `rgba(255,80,0,${0.15 + pulse*0.2})`;
      ctx.beginPath(); ctx.arc(0, 0, r*0.4, 0, Math.PI*2); ctx.fill();
      // Eyes
      Sprites._eyes(ctx, s*0.85, 'crazy');
    },

    // Lasagna — stacked sheets BOSS
    lasagna(ctx, def, s, time) {
      const r = s/2;
      // 4 stacked rectangular layers
      const layers = [
        { y: -r*0.6, color: def.color, sauce: false },
        { y: -r*0.3, color: '#fff5e6', sauce: false }, // ricotta
        { y: 0, color: '#c0392b', sauce: true }, // sauce
        { y: r*0.3, color: def.color, sauce: false },
        { y: r*0.6, color: '#f1c40f', sauce: false }, // cheese top
      ];
      layers.forEach(l => {
        const g = ctx.createLinearGradient(0, l.y - r*0.18, 0, l.y + r*0.18);
        g.addColorStop(0, Sprites._tint(l.color, 0.2));
        g.addColorStop(1, Sprites._tint(l.color, -0.25));
        ctx.fillStyle = g;
        Sprites._roundedRect(ctx, -r*0.95, l.y - r*0.18, r*1.9, r*0.36, r*0.05);
        ctx.fill();
        ctx.strokeStyle = Sprites._tint(l.color, -0.5); ctx.lineWidth = 1.5;
        Sprites._roundedRect(ctx, -r*0.95, l.y - r*0.18, r*1.9, r*0.36, r*0.05);
        ctx.stroke();
        // Sauce drip
        if (l.sauce) {
          ctx.fillStyle = l.color;
          for (let i = 0; i < 3; i++) {
            ctx.beginPath();
            ctx.arc(-r*0.6 + i*r*0.6, l.y + r*0.18, r*0.06, 0, Math.PI*2);
            ctx.fill();
          }
        }
      });
      // Cheese strings on top
      ctx.strokeStyle = '#fff5b8'; ctx.lineWidth = 1.5;
      for (let i = -2; i <= 2; i++) {
        ctx.beginPath();
        ctx.moveTo(i*r*0.3, r*0.7);
        ctx.bezierCurveTo(i*r*0.3 + r*0.1, r*0.85, i*r*0.3 - r*0.1, r*0.95, i*r*0.3, r*1.05);
        ctx.stroke();
      }
      // Crown for boss
      ctx.fillStyle = '#ffd700';
      ctx.beginPath();
      ctx.moveTo(-r*0.3, -r*0.85); ctx.lineTo(-r*0.2, -r*1.0); ctx.lineTo(-r*0.05, -r*0.9);
      ctx.lineTo(0, -r*1.05); ctx.lineTo(r*0.05, -r*0.9); ctx.lineTo(r*0.2, -r*1.0); ctx.lineTo(r*0.3, -r*0.85);
      ctx.closePath(); ctx.fill();
      ctx.strokeStyle = '#a8810a'; ctx.lineWidth = 1.5; ctx.stroke();
      // Eyes peering from middle layer
      Sprites._eyes(ctx, s*0.8, 'crazy');
    },

    // Carbonara — FINAL BOSS (replaces finalBoss)
    carbonara(ctx, def, s, time) {
      const r = s/2;
      const pulse = 0.5 + Math.sin(time*2)*0.5;
      // Outer aura
      ctx.fillStyle = `rgba(255,215,0,${0.15 + pulse*0.1})`;
      ctx.beginPath(); ctx.arc(0, 0, r*1.2, 0, Math.PI*2); ctx.fill();
      // Tentacle noodles (pale yellow strands)
      ctx.strokeStyle = '#f5d76e'; ctx.lineWidth = r * 0.12; ctx.lineCap = 'round';
      for (let i = 0; i < 10; i++) {
        const a = (i / 10) * Math.PI * 2 + time * 0.2;
        const len = r * 1.3 + Math.sin(time*3 + i)*r*0.15;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.bezierCurveTo(Math.cos(a)*r*0.5, Math.sin(a)*r*0.5,
          Math.cos(a+0.4)*r*0.9, Math.sin(a+0.4)*r*0.9,
          Math.cos(a)*len, Math.sin(a)*len);
        ctx.stroke();
      }
      // Yolk core
      const g = ctx.createRadialGradient(0, 0, r*0.2, 0, 0, r*0.9);
      g.addColorStop(0, '#ffeb3b');
      g.addColorStop(0.5, '#f39c12');
      g.addColorStop(1, '#7a3a08');
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(0, 0, r*0.85, 0, Math.PI*2); ctx.fill();
      ctx.strokeStyle = '#3a1c08'; ctx.lineWidth = 2; ctx.stroke();
      // Bacon (guanciale) bits
      ctx.fillStyle = '#c0392b';
      [[0.3,-0.2,0.13,0.4],[-0.3,0.1,0.14,-0.3],[0.05,0.35,0.1,0.1],[-0.1,-0.4,0.12,0.2]].forEach(([fx,fy,fr,rot])=>{
        ctx.save();
        ctx.translate(fx*r, fy*r); ctx.rotate(rot);
        Sprites._roundedRect(ctx, -fr*r, -fr*r*0.4, fr*r*2, fr*r*0.8, fr*r*0.2);
        ctx.fill();
        ctx.strokeStyle = '#5a0a0a'; ctx.lineWidth = 1; ctx.stroke();
        ctx.restore();
      });
      // Pecorino sparkles (cheese flecks)
      ctx.fillStyle = '#fff';
      for (let i = 0; i < 10; i++) {
        const a = Math.random() * Math.PI * 2;
        const rad = Math.random() * r * 0.7;
        ctx.beginPath(); ctx.arc(Math.cos(a)*rad, Math.sin(a)*rad, r*0.025, 0, Math.PI*2); ctx.fill();
      }
      // Big glowing eyes
      ctx.fillStyle = '#000';
      ctx.beginPath(); ctx.arc(-r*0.25, -r*0.1, r*0.16, 0, Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.arc(r*0.25, -r*0.1, r*0.16, 0, Math.PI*2); ctx.fill();
      ctx.shadowColor = '#ff0040'; ctx.shadowBlur = 12;
      ctx.fillStyle = '#ff2060';
      const pupR = r*0.09 * (0.8 + pulse*0.5);
      ctx.beginPath(); ctx.arc(-r*0.25, -r*0.1, pupR, 0, Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.arc(r*0.25, -r*0.1, pupR, 0, Math.PI*2); ctx.fill();
      ctx.shadowBlur = 0;
      // Fanged mouth
      ctx.fillStyle = '#000';
      ctx.beginPath();
      ctx.moveTo(-r*0.3, r*0.3); ctx.lineTo(r*0.3, r*0.3); ctx.lineTo(r*0.22, r*0.55); ctx.lineTo(-r*0.22, r*0.55);
      ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#fff';
      for (let i = 0; i < 3; i++) {
        const fx = -r*0.22 + i*r*0.15;
        ctx.beginPath();
        ctx.moveTo(fx, r*0.3); ctx.lineTo(fx + r*0.06, r*0.3); ctx.lineTo(fx + r*0.03, r*0.5);
        ctx.closePath(); ctx.fill();
      }
    },

    // Gemelli — twin braided strands
    gemelli(ctx, def, s, time) {
      const r = s/2;
      // Two intertwining strands
      ctx.lineWidth = r * 0.2;
      ctx.lineCap = 'round';
      for (let pass = 0; pass < 2; pass++) {
        ctx.strokeStyle = pass === 0 ? Sprites._tint(def.color, -0.2) : def.color;
        ctx.beginPath();
        for (let t = 0; t <= 1; t += 0.05) {
          const y = (t - 0.5) * r * 1.6;
          const x = Math.sin(t * Math.PI * 4 + (pass === 0 ? 0 : Math.PI)) * r * 0.35;
          if (t === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
      // Eyes
      Sprites._eyes(ctx, s*0.6, 'crazy');
    },

    // Tagliatelle — wide ribbon
    tagliatelle(ctx, def, s, time) {
      Sprites.enemyDrawers.fettuccine.call(this, ctx, def, s, time);
      // Make it slightly different — add edge serration
      const r = s/2;
      ctx.fillStyle = Sprites._tint(def.color, -0.4);
      for (let i = -3; i <= 3; i++) {
        ctx.beginPath();
        ctx.arc(i*r*0.25, -r*0.5, r*0.03, 0, Math.PI*2); ctx.fill();
        ctx.beginPath();
        ctx.arc(i*r*0.25, r*0.5, r*0.03, 0, Math.PI*2); ctx.fill();
      }
    },

    // Orecchiette — small ear-shaped (concave disc)
    orecchiette(ctx, def, s, time) {
      const r = s/2;
      // Disk body with concave dent
      const g = ctx.createRadialGradient(0, r*0.2, r*0.1, 0, 0, r);
      g.addColorStop(0, Sprites._tint(def.color, -0.2));
      g.addColorStop(0.5, def.color);
      g.addColorStop(1, Sprites._tint(def.color, -0.3));
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(0, 0, r*0.8, 0, Math.PI*2);
      ctx.fill();
      ctx.strokeStyle = Sprites._tint(def.color, -0.5); ctx.lineWidth = 1.5;
      ctx.stroke();
      // Concave shadow (dent in center)
      ctx.fillStyle = 'rgba(0,0,0,0.25)';
      ctx.beginPath(); ctx.ellipse(0, r*0.1, r*0.45, r*0.3, 0, 0, Math.PI*2); ctx.fill();
      // Highlight rim
      ctx.strokeStyle = 'rgba(255,255,255,0.45)'; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.arc(0, -r*0.05, r*0.65, Math.PI*1.1, Math.PI*1.9, false);
      ctx.stroke();
      Sprites._eyes(ctx, s*0.55, 'mean');
    },

    // Pastina — tiny particle (just a small dot)
    pastina(ctx, def, s, time) {
      const r = s/2;
      // Single small grain
      const g = ctx.createRadialGradient(-r*0.15, -r*0.15, r*0.05, 0, 0, r*0.6);
      g.addColorStop(0, Sprites._tint(def.color, 0.3));
      g.addColorStop(1, Sprites._tint(def.color, -0.2));
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.ellipse(0, 0, r*0.5, r*0.4, 0, 0, Math.PI*2); ctx.fill();
      ctx.strokeStyle = Sprites._tint(def.color, -0.5); ctx.lineWidth = 1;
      ctx.stroke();
      // Tiny dot eyes
      ctx.fillStyle = '#111';
      ctx.beginPath(); ctx.arc(-r*0.12, 0, r*0.05, 0, Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.arc(r*0.12, 0, r*0.05, 0, Math.PI*2); ctx.fill();
    },

    // Cavatappi — long hollow corkscrew
    cavatappi(ctx, def, s, time) {
      const r = s/2;
      const spin = time * 5;
      ctx.save();
      ctx.rotate(0.2);
      ctx.strokeStyle = def.color;
      ctx.lineWidth = r * 0.3;
      ctx.lineCap = 'round';
      ctx.beginPath();
      for (let t = 0; t <= 1; t += 0.04) {
        const x = (t - 0.5) * r * 1.7;
        const y = Math.sin(t * Math.PI * 6 + spin) * r * 0.4;
        if (t === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();
      // Hollow center groove
      ctx.strokeStyle = Sprites._tint(def.color, -0.4);
      ctx.lineWidth = r * 0.08;
      ctx.beginPath();
      for (let t = 0; t <= 1; t += 0.04) {
        const x = (t - 0.5) * r * 1.7;
        const y = Math.sin(t * Math.PI * 6 + spin) * r * 0.4;
        if (t === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.restore();
      Sprites._eyes(ctx, s*0.5, 'crazy');
    },

    // Stelline — star-shaped tiny pasta
    stelline(ctx, def, s, time) {
      const r = s/2;
      ctx.save();
      ctx.rotate(time * 1.5);
      // 5-point star
      ctx.fillStyle = def.color;
      ctx.beginPath();
      for (let i = 0; i < 10; i++) {
        const a = (i / 10) * Math.PI * 2 - Math.PI/2;
        const rad = i % 2 === 0 ? r*0.85 : r*0.4;
        const x = Math.cos(a) * rad;
        const y = Math.sin(a) * rad;
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = Sprites._tint(def.color, -0.4); ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.restore();
      // Tiny center eyes
      ctx.fillStyle = '#111';
      ctx.beginPath(); ctx.arc(-r*0.1, 0, r*0.05, 0, Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.arc(r*0.1, 0, r*0.05, 0, Math.PI*2); ctx.fill();
    },

    // Pesto — green basil blob
    pesto(ctx, def, s, time) {
      Sprites.enemyDrawers.pastaSauce.call(this, ctx, { ...def, color: '#27ae60' }, s, time);
      // Add little pine nut specks
      const r = s/2;
      ctx.fillStyle = '#f5e1a4';
      [[0.2,-0.15,0.05],[-0.25,0.1,0.04],[0.1,0.25,0.04],[-0.15,-0.3,0.04]].forEach(([fx,fy,fr])=>{
        ctx.beginPath(); ctx.ellipse(fx*r, fy*r, fr*r, fr*r*0.6, 0, 0, Math.PI*2); ctx.fill();
      });
    },

    // Alfredo — creamy white boss
    alfredo(ctx, def, s, time) {
      const r = s/2;
      // Pearly white drippy body (like mozzarella but bigger)
      Sprites.enemyDrawers.mozzarella.call(this, ctx, { ...def, color: '#fff4d6' }, s, time);
      // Add parmesan flecks
      const r2 = s/2;
      ctx.fillStyle = '#f1c40f';
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2;
        ctx.beginPath();
        ctx.arc(Math.cos(a)*r2*0.5, Math.sin(a)*r2*0.5, r2*0.04, 0, Math.PI*2);
        ctx.fill();
      }
    },

    // Carbonara replaces finalBoss visually but keep finalBoss as fallback for old saves
    finalBoss(ctx, def, s, time) {
      const r = s/2;
      // Outer dark mass with writhing tentacles
      const pulse = 0.5 + Math.sin(time*2)*0.5;
      // Tentacle limbs
      ctx.fillStyle = '#2c1a3a';
      for (let i=0; i<8; i++) {
        const a = (i/8)*Math.PI*2 + time*0.3;
        const len = r*1.2 + Math.sin(time*3 + i)*r*0.2;
        const tipX = Math.cos(a)*len;
        const tipY = Math.sin(a)*len;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(Math.cos(a+0.2)*r*0.6, Math.sin(a+0.2)*r*0.6);
        ctx.lineTo(tipX, tipY);
        ctx.lineTo(Math.cos(a-0.2)*r*0.6, Math.sin(a-0.2)*r*0.6);
        ctx.closePath();
        ctx.fill();
      }
      // Core body
      const g = ctx.createRadialGradient(0, 0, r*0.2, 0, 0, r);
      g.addColorStop(0, '#7a3a8a');
      g.addColorStop(0.6, '#3a1a4a');
      g.addColorStop(1, '#0a0010');
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI*2); ctx.fill();
      ctx.strokeStyle = '#000'; ctx.lineWidth = 2;
      ctx.stroke();
      // Pulsing aura
      ctx.strokeStyle = 'rgba(255,0,80,' + (0.3 + pulse*0.4) + ')';
      ctx.lineWidth = 3;
      ctx.beginPath(); ctx.arc(0, 0, r*1.05 + pulse*5, 0, Math.PI*2); ctx.stroke();
      // Big glowing eyes
      ctx.fillStyle = '#000';
      ctx.beginPath(); ctx.arc(-r*0.25, -r*0.1, r*0.18, 0, Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.arc(r*0.25, -r*0.1, r*0.18, 0, Math.PI*2); ctx.fill();
      ctx.shadowColor = '#ff0040'; ctx.shadowBlur = 12;
      ctx.fillStyle = '#ff2060';
      ctx.beginPath(); ctx.arc(-r*0.25, -r*0.1, r*0.1 * (0.8 + pulse*0.4), 0, Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.arc(r*0.25, -r*0.1, r*0.1 * (0.8 + pulse*0.4), 0, Math.PI*2); ctx.fill();
      ctx.shadowBlur = 0;
      // Fanged mouth
      ctx.fillStyle = '#000';
      ctx.beginPath();
      ctx.moveTo(-r*0.35, r*0.25);
      ctx.lineTo(r*0.35, r*0.25);
      ctx.lineTo(r*0.25, r*0.55);
      ctx.lineTo(-r*0.25, r*0.55);
      ctx.closePath(); ctx.fill();
      // Fangs
      ctx.fillStyle = '#fff';
      for (let i=0; i<4; i++) {
        const fx = -r*0.3 + i*r*0.2;
        ctx.beginPath();
        ctx.moveTo(fx, r*0.25);
        ctx.lineTo(fx + r*0.06, r*0.25);
        ctx.lineTo(fx + r*0.03, r*0.42);
        ctx.closePath(); ctx.fill();
      }
    },
  },

  // ============ TOWER DRAWERS ============
  // Towers face roughly toward target. We accept rotation via tower.angle if available.
  towerDrawers: {
    _default(ctx, def, s) {
      ctx.fillStyle = def.color || '#888';
      ctx.beginPath(); ctx.arc(0, 0, s/2, 0, Math.PI*2); ctx.fill();
    },

    // Knife Block Knight: wooden block + knife handles
    spaghetti(ctx, def, s, time, ups) {
      const r = s/2;
      // Block body (rect)
      const g = ctx.createLinearGradient(0, -r*0.4, 0, r);
      g.addColorStop(0, '#7a4a1a');
      g.addColorStop(1, '#3a1c08');
      ctx.fillStyle = g;
      Sprites._roundedRect(ctx, -r*0.8, -r*0.2, r*1.6, r*1.1, r*0.15);
      ctx.fill();
      ctx.strokeStyle = '#1c0a04'; ctx.lineWidth = 1.5;
      Sprites._roundedRect(ctx, -r*0.8, -r*0.2, r*1.6, r*1.1, r*0.15);
      ctx.stroke();
      // Wood grain lines
      ctx.strokeStyle = 'rgba(0,0,0,0.25)'; ctx.lineWidth = 1;
      for (let i=0; i<3; i++) {
        ctx.beginPath();
        ctx.moveTo(-r*0.7, -r*0.05 + i*r*0.3);
        ctx.lineTo(r*0.7, -r*0.05 + i*r*0.3);
        ctx.stroke();
      }
      // Knife handles sticking up (small ones at back)
      ['#2c3a3f','#2c3a3f','#2c3a3f'].forEach((c,i)=>{
        const x = -r*0.55 + i*r*0.55;
        ctx.fillStyle = c;
        Sprites._roundedRect(ctx, x-r*0.06, -r*0.5, r*0.12, r*0.35, r*0.04);
        ctx.fill();
      });
      // Big main knife in the middle (blade up)
      ctx.fillStyle = '#dfe6e9';
      ctx.beginPath();
      ctx.moveTo(0, -r*1.1);
      ctx.lineTo(r*0.18, -r*1.0);
      ctx.lineTo(r*0.18, -r*0.45);
      ctx.lineTo(-r*0.18, -r*0.45);
      ctx.lineTo(-r*0.18, -r*1.0);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#2c3a3f'; ctx.lineWidth = 1.2;
      ctx.stroke();
      // Blade edge highlight
      ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(-r*0.13, -r*1.0); ctx.lineTo(-r*0.13, -r*0.5);
      ctx.stroke();
      // Handle below blade
      ctx.fillStyle = '#1c1c1c';
      Sprites._roundedRect(ctx, -r*0.2, -r*0.45, r*0.4, r*0.18, r*0.04);
      ctx.fill();
      // Upgrade glow
      Sprites._upgradeGlow(ctx, r, ups);
    },

    // Wooden Spoon Whacker
    penne(ctx, def, s, time, ups) {
      const r = s/2;
      // Bowl scoop
      ctx.fillStyle = '#a87a3a';
      ctx.beginPath();
      ctx.ellipse(0, -r*0.4, r*0.55, r*0.4, 0, 0, Math.PI*2);
      ctx.fill();
      ctx.strokeStyle = '#5a3a1a'; ctx.lineWidth = 1.5;
      ctx.stroke();
      // Inner bowl
      ctx.fillStyle = '#6b4a1a';
      ctx.beginPath();
      ctx.ellipse(0, -r*0.4, r*0.4, r*0.28, 0, 0, Math.PI*2);
      ctx.fill();
      // Sauce in spoon
      ctx.fillStyle = '#c0392b';
      ctx.beginPath();
      ctx.ellipse(0, -r*0.42, r*0.32, r*0.22, 0, 0, Math.PI*2);
      ctx.fill();
      // Handle
      const g = ctx.createLinearGradient(-r*0.1, 0, r*0.1, 0);
      g.addColorStop(0, '#a87a3a');
      g.addColorStop(0.5, '#7a4a1a');
      g.addColorStop(1, '#3a1c08');
      ctx.fillStyle = g;
      Sprites._roundedRect(ctx, -r*0.12, -r*0.05, r*0.24, r*1.05, r*0.06);
      ctx.fill();
      ctx.strokeStyle = '#3a1c08'; ctx.lineWidth = 1;
      ctx.stroke();
      // Wood grain on handle
      ctx.strokeStyle = 'rgba(0,0,0,0.2)';
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, r*0.9); ctx.stroke();
      Sprites._upgradeGlow(ctx, r, ups);
    },

    // Whisk Whirlwind — chrome wire whisk spinning
    fusilli(ctx, def, s, time, ups) {
      const r = s/2;
      // Handle (vertical)
      const g = ctx.createLinearGradient(-r*0.1, 0, r*0.1, 0);
      g.addColorStop(0, '#7a4a1a');
      g.addColorStop(1, '#3a1c08');
      ctx.fillStyle = g;
      Sprites._roundedRect(ctx, -r*0.13, r*0.1, r*0.26, r*0.9, r*0.05);
      ctx.fill();
      ctx.strokeStyle = '#1c0a04'; ctx.stroke();
      // Metal cap
      ctx.fillStyle = '#95a5a6';
      Sprites._roundedRect(ctx, -r*0.15, r*0.05, r*0.3, r*0.15, r*0.04);
      ctx.fill();
      ctx.strokeStyle = '#2c3a3f'; ctx.stroke();
      // Whisk wires — rotating
      ctx.save();
      ctx.rotate(time*4);
      ctx.strokeStyle = '#dfe6e9'; ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      const wires = 6;
      for (let i=0; i<wires; i++) {
        const a = (i/wires) * Math.PI*2;
        ctx.beginPath();
        ctx.moveTo(0, r*0.05);
        ctx.bezierCurveTo(Math.cos(a)*r*0.75, -r*0.3, Math.cos(a)*r*0.7, -r*0.7, 0, -r*0.85);
        ctx.stroke();
      }
      // Outer ring
      ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.ellipse(0, -r*0.4, r*0.7, r*0.45, 0, 0, Math.PI*2); ctx.stroke();
      ctx.restore();
      Sprites._upgradeGlow(ctx, r, ups);
    },

    // Frying Pan Phantom
    ravioli(ctx, def, s, time, ups) {
      const r = s/2;
      // Handle (going right)
      ctx.fillStyle = '#1c1c1c';
      Sprites._roundedRect(ctx, r*0.4, -r*0.08, r*0.85, r*0.16, r*0.06);
      ctx.fill();
      ctx.strokeStyle = '#0a0a0a'; ctx.lineWidth = 1; ctx.stroke();
      // Pan body
      const g = ctx.createRadialGradient(-r*0.2, -r*0.2, r*0.1, 0, 0, r*0.85);
      g.addColorStop(0, '#5a5a5a');
      g.addColorStop(0.5, '#2c2c2c');
      g.addColorStop(1, '#0a0a0a');
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(0, 0, r*0.85, 0, Math.PI*2); ctx.fill();
      // Rim
      ctx.strokeStyle = '#1c1c1c'; ctx.lineWidth = r*0.1;
      ctx.beginPath(); ctx.arc(0, 0, r*0.8, 0, Math.PI*2); ctx.stroke();
      // Inner cooking surface
      ctx.fillStyle = '#1a1a1a';
      ctx.beginPath(); ctx.arc(0, 0, r*0.7, 0, Math.PI*2); ctx.fill();
      // Hot ember glow (animated)
      const pulse = 0.5 + Math.sin(time*4)*0.5;
      ctx.shadowColor = '#ff6600'; ctx.shadowBlur = 8 + pulse*6;
      ctx.fillStyle = 'rgba(255,100,0,' + (0.4 + pulse*0.3) + ')';
      ctx.beginPath(); ctx.arc(0, 0, r*0.5, 0, Math.PI*2); ctx.fill();
      ctx.shadowBlur = 0;
      // Center spark
      ctx.fillStyle = '#ffaa00';
      ctx.beginPath(); ctx.arc(0, 0, r*0.18 * (0.7 + pulse*0.5), 0, Math.PI*2); ctx.fill();
      Sprites._upgradeGlow(ctx, r, ups);
    },

    // Salt Shaker Slowmer
    tortellini(ctx, def, s, time, ups) {
      const r = s/2;
      // Glass body
      const g = ctx.createLinearGradient(-r*0.5, 0, r*0.5, 0);
      g.addColorStop(0, 'rgba(255,255,255,0.4)');
      g.addColorStop(0.5, 'rgba(220,220,255,0.7)');
      g.addColorStop(1, 'rgba(160,160,200,0.4)');
      ctx.fillStyle = g;
      Sprites._roundedRect(ctx, -r*0.55, -r*0.3, r*1.1, r*1.1, r*0.1);
      ctx.fill();
      ctx.strokeStyle = '#888'; ctx.lineWidth = 1.5;
      Sprites._roundedRect(ctx, -r*0.55, -r*0.3, r*1.1, r*1.1, r*0.1);
      ctx.stroke();
      // Salt inside
      ctx.fillStyle = '#fff';
      Sprites._roundedRect(ctx, -r*0.48, r*0.0, r*0.96, r*0.78, r*0.08);
      ctx.fill();
      // Salt grain texture
      ctx.fillStyle = 'rgba(0,0,0,0.1)';
      for (let i=0; i<10; i++) {
        ctx.beginPath();
        ctx.arc(-r*0.4 + (i%5)*r*0.18, r*0.15 + Math.floor(i/5)*r*0.25, r*0.02, 0, Math.PI*2);
        ctx.fill();
      }
      // Metal cap
      const cg = ctx.createLinearGradient(0, -r*0.7, 0, -r*0.3);
      cg.addColorStop(0, '#dfe6e9');
      cg.addColorStop(1, '#7f8c8d');
      ctx.fillStyle = cg;
      Sprites._roundedRect(ctx, -r*0.6, -r*0.6, r*1.2, r*0.35, r*0.08);
      ctx.fill();
      ctx.strokeStyle = '#2c3a3f'; ctx.stroke();
      // Holes in cap
      ctx.fillStyle = '#1c1c1c';
      for (let i=0; i<5; i++) {
        ctx.beginPath();
        ctx.arc(-r*0.4 + i*r*0.2, -r*0.45, r*0.04, 0, Math.PI*2);
        ctx.fill();
      }
      // Animated sprinkle
      ctx.fillStyle = 'rgba(255,255,255,0.85)';
      for (let i=0; i<3; i++) {
        const t = (time*3 + i*0.7) % 2;
        ctx.beginPath();
        ctx.arc(-r*0.3 + i*r*0.3, -r*0.7 - t*r*0.4, r*0.04, 0, Math.PI*2);
        ctx.fill();
      }
      Sprites._upgradeGlow(ctx, r, ups);
    },

    // Pizza Oven Inferno
    linguine(ctx, def, s, time, ups) {
      const r = s/2;
      // Stone arch base
      ctx.fillStyle = '#5a4a3a';
      Sprites._roundedRect(ctx, -r*0.95, -r*0.3, r*1.9, r*1.25, r*0.1);
      ctx.fill();
      ctx.strokeStyle = '#2a1c10'; ctx.lineWidth = 1.5;
      ctx.stroke();
      // Stone texture
      ctx.strokeStyle = 'rgba(0,0,0,0.3)';
      ctx.beginPath();
      ctx.moveTo(-r*0.3, -r*0.3); ctx.lineTo(-r*0.3, r*0.95);
      ctx.moveTo(r*0.3, -r*0.3); ctx.lineTo(r*0.3, r*0.95);
      ctx.moveTo(-r*0.95, r*0.3); ctx.lineTo(r*0.95, r*0.3);
      ctx.stroke();
      // Arch opening
      ctx.fillStyle = '#0a0000';
      ctx.beginPath();
      ctx.moveTo(-r*0.55, r*0.85);
      ctx.lineTo(-r*0.55, -r*0.05);
      ctx.bezierCurveTo(-r*0.55, -r*0.5, r*0.55, -r*0.5, r*0.55, -r*0.05);
      ctx.lineTo(r*0.55, r*0.85);
      ctx.closePath();
      ctx.fill();
      // Fire inside
      const pulse = 0.5 + Math.sin(time*8)*0.5;
      ctx.shadowColor = '#ff4400'; ctx.shadowBlur = 12 + pulse*8;
      const fg = ctx.createRadialGradient(0, r*0.4, r*0.05, 0, r*0.4, r*0.55);
      fg.addColorStop(0, '#ffeb3b');
      fg.addColorStop(0.4, '#ff6600');
      fg.addColorStop(1, 'rgba(255,40,0,0)');
      ctx.fillStyle = fg;
      ctx.beginPath();
      ctx.arc(0, r*0.4, r*0.55 * (0.85 + pulse*0.3), 0, Math.PI*2);
      ctx.fill();
      // Flame tongues
      ctx.fillStyle = '#ffcc00';
      for (let i=0; i<3; i++) {
        const fx = -r*0.3 + i*r*0.3;
        const fh = r*0.4 + Math.sin(time*10 + i)*r*0.15;
        ctx.beginPath();
        ctx.moveTo(fx - r*0.08, r*0.5);
        ctx.quadraticCurveTo(fx, r*0.5 - fh, fx + r*0.08, r*0.5);
        ctx.closePath();
        ctx.fill();
      }
      ctx.shadowBlur = 0;
      Sprites._upgradeGlow(ctx, r, ups);
    },

    // Tenderizer Tornado — meat mallet
    macaroni(ctx, def, s, time, ups) {
      const r = s/2;
      // Mallet head
      ctx.fillStyle = '#3a2a1a';
      Sprites._roundedRect(ctx, -r*0.7, -r*0.85, r*1.4, r*0.7, r*0.1);
      ctx.fill();
      ctx.strokeStyle = '#1c0a04'; ctx.lineWidth = 1.5;
      ctx.stroke();
      // Spike texture (tenderizer bumps)
      ctx.fillStyle = '#1c0a04';
      for (let row=0; row<2; row++) {
        for (let col=0; col<5; col++) {
          ctx.beginPath();
          ctx.arc(-r*0.55 + col*r*0.27, -r*0.7 + row*r*0.35, r*0.06, 0, Math.PI*2);
          ctx.fill();
        }
      }
      // Metallic shine on head
      ctx.fillStyle = 'rgba(255,255,255,0.15)';
      Sprites._roundedRect(ctx, -r*0.6, -r*0.78, r*1.2, r*0.15, r*0.05);
      ctx.fill();
      // Handle going down
      const hg = ctx.createLinearGradient(0, -r*0.15, 0, r);
      hg.addColorStop(0, '#a87a3a');
      hg.addColorStop(1, '#3a1c08');
      ctx.fillStyle = hg;
      Sprites._roundedRect(ctx, -r*0.13, -r*0.15, r*0.26, r*1.05, r*0.06);
      ctx.fill();
      ctx.strokeStyle = '#1c0a04'; ctx.stroke();
      // Rivets connecting head to handle
      ctx.fillStyle = '#7a7a7a';
      ctx.beginPath(); ctx.arc(-r*0.18, -r*0.15, r*0.06, 0, Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.arc(r*0.18, -r*0.15, r*0.06, 0, Math.PI*2); ctx.fill();
      Sprites._upgradeGlow(ctx, r, ups);
    },

    // Rolling Pin Cannon
    gnocchi(ctx, def, s, time, ups) {
      const r = s/2;
      // Main pin body (horizontal cylinder)
      const g = ctx.createLinearGradient(0, -r*0.35, 0, r*0.35);
      g.addColorStop(0, '#dfb077');
      g.addColorStop(0.5, '#a87a3a');
      g.addColorStop(1, '#5a3a1a');
      ctx.fillStyle = g;
      Sprites._roundedRect(ctx, -r*0.7, -r*0.35, r*1.4, r*0.7, r*0.18);
      ctx.fill();
      ctx.strokeStyle = '#3a1c08'; ctx.lineWidth = 1.5;
      ctx.stroke();
      // Wood grain
      ctx.strokeStyle = 'rgba(0,0,0,0.25)'; ctx.lineWidth = 1;
      [-0.18,0,0.18].forEach(y=>{
        ctx.beginPath();
        ctx.moveTo(-r*0.55, y*r);
        ctx.lineTo(r*0.55, y*r);
        ctx.stroke();
      });
      // End caps / handles
      ctx.fillStyle = '#5a3a1a';
      Sprites._roundedRect(ctx, -r*0.95, -r*0.18, r*0.25, r*0.36, r*0.08);
      ctx.fill();
      Sprites._roundedRect(ctx, r*0.7, -r*0.18, r*0.25, r*0.36, r*0.08);
      ctx.fill();
      ctx.strokeStyle = '#1c0a04'; ctx.stroke();
      // Highlight stripe
      ctx.strokeStyle = 'rgba(255,255,255,0.3)'; ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-r*0.5, -r*0.22); ctx.lineTo(r*0.5, -r*0.22);
      ctx.stroke();
      Sprites._upgradeGlow(ctx, r, ups);
    },

    // Garlic Press Aura — silver tool with garlic glow
    lasagna(ctx, def, s, time, ups) {
      const r = s/2;
      // Two arms (top + bottom)
      const g = ctx.createLinearGradient(0, -r, 0, r);
      g.addColorStop(0, '#dfe6e9');
      g.addColorStop(1, '#7f8c8d');
      ctx.fillStyle = g;
      Sprites._roundedRect(ctx, -r*0.85, -r*0.85, r*1.7, r*0.4, r*0.1);
      ctx.fill();
      ctx.strokeStyle = '#2c3a3f'; ctx.lineWidth = 1.5;
      ctx.stroke();
      Sprites._roundedRect(ctx, -r*0.85, r*0.45, r*1.7, r*0.4, r*0.1);
      ctx.fill();
      ctx.stroke();
      // Hinge
      ctx.fillStyle = '#3a3a3a';
      ctx.beginPath(); ctx.arc(-r*0.7, 0, r*0.12, 0, Math.PI*2); ctx.fill();
      // Press chamber (round)
      ctx.fillStyle = '#95a5a6';
      ctx.beginPath(); ctx.arc(0, 0, r*0.45, 0, Math.PI*2); ctx.fill();
      ctx.strokeStyle = '#2c3a3f'; ctx.lineWidth = 2;
      ctx.stroke();
      // Holes pattern in chamber
      ctx.fillStyle = '#1c1c1c';
      const holes = [[0,0,0.08],[0.18,0,0.06],[-0.18,0,0.06],[0,0.18,0.06],[0,-0.18,0.06],
                     [0.13,0.13,0.05],[-0.13,0.13,0.05],[0.13,-0.13,0.05],[-0.13,-0.13,0.05]];
      holes.forEach(([fx,fy,fr])=>{
        ctx.beginPath(); ctx.arc(fx*r, fy*r, fr*r, 0, Math.PI*2); ctx.fill();
      });
      // Garlic aura glow
      const pulse = 0.5 + Math.sin(time*3)*0.5;
      ctx.shadowColor = '#fff'; ctx.shadowBlur = 8 + pulse*8;
      ctx.fillStyle = 'rgba(255,250,200,' + (0.15 + pulse*0.1) + ')';
      ctx.beginPath(); ctx.arc(0, 0, r * (1.0 + pulse*0.1), 0, Math.PI*2); ctx.fill();
      ctx.shadowBlur = 0;
      Sprites._upgradeGlow(ctx, r, ups);
    },
  },

  // Upgrade glow + dots
  _upgradeGlow(ctx, r, ups) {
    if (!ups || ups <= 0) return;
    // Golden dots above
    ctx.fillStyle = '#ffd700';
    ctx.shadowColor = '#ffd700'; ctx.shadowBlur = 4;
    for (let i = 0; i < Math.min(ups, 6); i++) {
      ctx.beginPath();
      ctx.arc(-r*0.55 + i*r*0.22, -r*1.2, r*0.08, 0, Math.PI*2);
      ctx.fill();
    }
    ctx.shadowBlur = 0;
  },

  // ============ PROJECTILE DRAWERS ============
  projectileDrawers: {
    _default(ctx, p) {
      ctx.fillStyle = p.color || '#fff';
      ctx.beginPath();
      ctx.arc(0, 0, 4, 0, Math.PI*2);
      ctx.fill();
    },
    // Knife throw — sharp blade rotating
    blade(ctx, p) {
      const r = 9;
      ctx.rotate((p.spin || 0) + (p.angle || 0));
      ctx.fillStyle = '#dfe6e9';
      ctx.beginPath();
      ctx.moveTo(-r, -r*0.2);
      ctx.lineTo(r*0.7, -r*0.3);
      ctx.lineTo(r, 0);
      ctx.lineTo(r*0.7, r*0.3);
      ctx.lineTo(-r, r*0.2);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#2c3a3f'; ctx.lineWidth = 1.2;
      ctx.stroke();
      // Handle
      ctx.fillStyle = '#1c1c1c';
      Sprites._roundedRect(ctx, -r, -r*0.3, r*0.5, r*0.6, 2);
      ctx.fill();
    },
    // Spoon bonk — wooden orb
    bonk(ctx, p) {
      ctx.fillStyle = '#a87a3a';
      ctx.beginPath(); ctx.arc(0, 0, 8, 0, Math.PI*2); ctx.fill();
      ctx.strokeStyle = '#3a1c08'; ctx.lineWidth = 1;
      ctx.stroke();
      // Splash mark
      ctx.fillStyle = '#c0392b';
      ctx.beginPath(); ctx.arc(2, -2, 3, 0, Math.PI*2); ctx.fill();
    },
    // Whisk spin — fast metallic streak
    whisk(ctx, p) {
      ctx.rotate(p.spin || 0);
      ctx.strokeStyle = '#dfe6e9'; ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, 5, 0, Math.PI*1.5);
      ctx.stroke();
      ctx.fillStyle = '#fff';
      ctx.beginPath(); ctx.arc(0, 0, 2, 0, Math.PI*2); ctx.fill();
    },
    // Pan smash — red-hot ember
    ember(ctx, p) {
      ctx.shadowColor = '#ff4400'; ctx.shadowBlur = 8;
      ctx.fillStyle = '#ff6600';
      ctx.beginPath(); ctx.arc(0, 0, 6, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = '#ffeb3b';
      ctx.beginPath(); ctx.arc(0, 0, 3, 0, Math.PI*2); ctx.fill();
      ctx.shadowBlur = 0;
    },
    // Salt — small white grains in a triangle
    salt(ctx, p) {
      ctx.fillStyle = '#fff';
      ctx.beginPath(); ctx.arc(0, -2, 2, 0, Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.arc(-2, 2, 2, 0, Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.arc(2, 2, 2, 0, Math.PI*2); ctx.fill();
    },
    // Mallet bash
    bash(ctx, p) {
      ctx.fillStyle = '#2c3a3f';
      Sprites._roundedRect(ctx, -7, -4, 14, 8, 2);
      ctx.fill();
      ctx.strokeStyle = '#1c1c1c'; ctx.stroke();
      ctx.fillStyle = '#7a7a7a';
      ctx.beginPath(); ctx.arc(-4, 0, 1.5, 0, Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.arc(4, 0, 1.5, 0, Math.PI*2); ctx.fill();
    },
    // Rolling pin shot — flying wooden cylinder
    pin(ctx, p) {
      ctx.rotate((p.spin || 0) + (p.angle || 0));
      const g = ctx.createLinearGradient(0, -4, 0, 4);
      g.addColorStop(0, '#dfb077');
      g.addColorStop(1, '#5a3a1a');
      ctx.fillStyle = g;
      Sprites._roundedRect(ctx, -9, -4, 18, 8, 3);
      ctx.fill();
      ctx.strokeStyle = '#3a1c08'; ctx.stroke();
    },
  },
};
