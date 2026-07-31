export type GameState = 'menu' | 'playing' | 'paused' | 'gameover';

export interface GameStats {
  lungHealth: number;
  money: number;
  score: number;
  combo: number;
  fruitPrice: number;
  cigarettesSmoked: number;
  containersFilled: number;
  highScore: number;
  fruitBought: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  type: 'smoke' | 'ember' | 'heart' | 'star' | 'coin' | 'puff';
  color: string;
  rotation: number;
  rotSpeed: number;
  gravity: number;
  drag: number;
}

interface Floater {
  x: number;
  y: number;
  text: string;
  color: string;
  life: number;
  maxLife: number;
  vy: number;
  scale: number;
  size: number;
}

interface Jar {
  x: number;
  y: number;
  w: number;
  h: number;
  fill: number;
  value: number;
  shake: number;
  enter: number;
  pop: number;
  hue: number;
}

const LS_KEY = 'smokeItUp.highScore';

export class Game {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private width = 0;
  private height = 0;
  private dpr = 1;

  private state: GameState = 'menu';
  private running = false;
  private lastTime = 0;
  private rafId = 0;
  private totalTime = 0;

  // Game state
  private lungHealth = 100;
  private money = 0;
  private score = 0;
  private combo = 1;
  private comboTimer = 0;
  private cigarettesSmoked = 0;
  private containersFilled = 0;
  private fruitBought = 0;
  private fruitPrice = 20;
  private highScore = 0;
  private chainTime = 0;

  // Character
  private charX = 0;
  private charY = 0;
  private charBreath = 0;
  private coughTime = 0;

  // Active jar
  private jar: Jar;

  // Input
  private smoking = false;

  // Effects
  private particles: Particle[] = [];
  private floaters: Floater[] = [];
  private shakeIntensity = 0;
  private shakeX = 0;
  private shakeY = 0;
  private flash = 0;
  private smokeEmitTimer = 0;

  // Callbacks
  public onStatsChange?: (stats: GameStats) => void;
  public onStateChange?: (state: GameState) => void;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('No 2d context');
    this.ctx = ctx;
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);

    this.jar = this.spawnJar();
    this.loadHighScore();
    this.resize();

    window.addEventListener('resize', this.resize);
    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('keyup', this.onKeyUp);
    canvas.addEventListener('touchstart', this.onTouchStart, { passive: false });
    canvas.addEventListener('touchend', this.onTouchEnd);
    canvas.addEventListener('touchcancel', this.onTouchEnd);
    canvas.addEventListener('mousedown', this.onMouseDown);
    canvas.addEventListener('mouseup', this.onMouseUp);
    canvas.addEventListener('mouseleave', this.onMouseUp);
  }

  destroy() {
    this.stop();
    window.removeEventListener('resize', this.resize);
    window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('keyup', this.onKeyUp);
    this.canvas.removeEventListener('touchstart', this.onTouchStart);
    this.canvas.removeEventListener('touchend', this.onTouchEnd);
    this.canvas.removeEventListener('touchcancel', this.onTouchEnd);
    this.canvas.removeEventListener('mousedown', this.onMouseDown);
    this.canvas.removeEventListener('mouseup', this.onMouseUp);
    this.canvas.removeEventListener('mouseleave', this.onMouseUp);
  }

  // ---- Input ----
  private onKeyDown = (e: KeyboardEvent) => {
    if (e.repeat) return;
    if (e.code === 'Space' || e.code === 'KeyJ') {
      e.preventDefault();
      if (this.state === 'playing') this.setSmoking(true);
    } else if (e.code === 'KeyP' || e.code === 'Escape') {
      if (this.state === 'playing') this.pause();
      else if (this.state === 'paused') this.resume();
    } else if (e.code === 'KeyR') {
      if (this.state === 'gameover') this.restart();
    } else if (e.code === 'KeyF') {
      if (this.state === 'playing') this.buyFruit();
    } else if (e.code === 'Enter') {
      if (this.state === 'menu') this.start();
      else if (this.state === 'gameover') this.restart();
    }
  };

  private onKeyUp = (e: KeyboardEvent) => {
    if (e.code === 'Space' || e.code === 'KeyJ') {
      this.setSmoking(false);
    }
  };

  private onTouchStart = (e: TouchEvent) => {
    e.preventDefault();
    if (this.state === 'playing') this.setSmoking(true);
  };

  private onTouchEnd = () => {
    this.setSmoking(false);
  };

  private onMouseDown = () => {
    if (this.state === 'playing') this.setSmoking(true);
  };

  private onMouseUp = () => {
    this.setSmoking(false);
  };

  private setSmoking(v: boolean) {
    if (this.smoking === v) return;
    this.smoking = v;
    if (v) {
      this.cigarettesSmoked += 1;
      this.charBreath = 0;
    }
  }

  // ---- Public API ----
  start() {
    if (this.state === 'playing') return;
    this.resetGame();
    this.state = 'playing';
    this.onStateChange?.(this.state);
    this.emitStats();
    if (!this.running) this.loopStart();
  }

  pause() {
    if (this.state !== 'playing') return;
    this.state = 'paused';
    this.onStateChange?.(this.state);
  }

  resume() {
    if (this.state !== 'paused') return;
    this.state = 'playing';
    this.lastTime = performance.now();
    this.onStateChange?.(this.state);
  }

  restart() {
    this.start();
  }

  buyFruit() {
    if (this.state !== 'playing') return;
    if (this.money < this.fruitPrice) {
      this.addFloater(
        this.width / 2,
        this.height * 0.3,
        'Need $' + this.fruitPrice,
        '#ff6b6b',
        24
      );
      return;
    }
    if (this.lungHealth >= 100) {
      this.addFloater(
        this.width / 2,
        this.height * 0.3,
        'Already healthy!',
        '#8ecae6',
        24
      );
      return;
    }
    this.money -= this.fruitPrice;
    this.lungHealth = Math.min(100, this.lungHealth + 35);
    this.fruitBought += 1;
    this.fruitPrice = Math.round(this.fruitPrice * 1.18);
    this.flash = 0.4;
    this.shakeIntensity = 6;

    // Hearts burst from fruit area
    const fx = this.width - 80;
    const fy = this.height * 0.22;
    for (let i = 0; i < 18; i++) {
      const a = Math.random() * Math.PI * 2;
      const sp = 120 + Math.random() * 180;
      this.particles.push({
        x: fx,
        y: fy,
        vx: Math.cos(a) * sp,
        vy: Math.sin(a) * sp - 60,
        life: 0,
        maxLife: 1.0 + Math.random() * 0.6,
        size: 8 + Math.random() * 10,
        type: 'heart',
        color: '#ff4d6d',
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 4,
        gravity: 220,
        drag: 0.98,
      });
    }
    this.addFloater(this.charX, this.charY - 80, '+35 ❤', '#ff4d6d', 28);
    this.emitStats();
  }

  getState() {
    return this.state;
  }

  getStats(): GameStats {
    return {
      lungHealth: this.lungHealth,
      money: this.money,
      score: this.score,
      combo: this.combo,
      fruitPrice: this.fruitPrice,
      cigarettesSmoked: this.cigarettesSmoked,
      containersFilled: this.containersFilled,
      highScore: this.highScore,
      fruitBought: this.fruitBought,
    };
  }

  // ---- Internal ----
  private resetGame() {
    this.lungHealth = 100;
    this.money = 0;
    this.score = 0;
    this.combo = 1;
    this.comboTimer = 0;
    this.cigarettesSmoked = 0;
    this.containersFilled = 0;
    this.fruitBought = 0;
    this.fruitPrice = 20;
    this.smoking = false;
    this.particles = [];
    this.floaters = [];
    this.shakeIntensity = 0;
    this.flash = 0;
    this.coughTime = 0;
    this.chainTime = 0;
    this.jar = this.spawnJar();
    this.jar.x = this.width * 0.72;
    this.jar.y = this.height * 0.62;
    this.lastTime = performance.now();
  }

  private loadHighScore() {
    try {
      const v = localStorage.getItem(LS_KEY);
      this.highScore = v ? parseInt(v, 10) || 0 : 0;
    } catch {
      this.highScore = 0;
    }
  }

  private saveHighScore() {
    try {
      localStorage.setItem(LS_KEY, String(this.highScore));
    } catch {
      // ignore
    }
  }

  private resize = () => {
    const rect = this.canvas.getBoundingClientRect();
    this.width = rect.width;
    this.height = rect.height;
    this.canvas.width = Math.floor(rect.width * this.dpr);
    this.canvas.height = Math.floor(rect.height * this.dpr);
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);

    // Reposition characters/jars based on size
    this.charX = this.width * 0.18;
    this.charY = this.height * 0.62;
    this.jar.x = this.width * 0.72;
    this.jar.y = this.height * 0.62;
  };

  private spawnJar(): Jar {
    return {
      x: 0,
      y: 0,
      w: 110,
      h: 140,
      fill: 0,
      value: 10 + Math.floor(Math.random() * 10),
      shake: 0,
      enter: 0,
      pop: 0,
      hue: 190 + Math.random() * 80,
    };
  }

  private emitStats() {
    this.onStatsChange?.(this.getStats());
  }

  private addFloater(x: number, y: number, text: string, color: string, size = 22) {
    this.floaters.push({
      x,
      y,
      text,
      color,
      life: 0,
      maxLife: 1.4,
      vy: -60,
      scale: 1.4,
      size,
    });
  }

  // ---- Loop ----
  private loopStart() {
    this.running = true;
    this.lastTime = performance.now();
    const step = (t: number) => {
      if (!this.running) return;
      const dt = Math.min(0.05, (t - this.lastTime) / 1000);
      this.lastTime = t;
      this.totalTime += dt;
      if (this.state === 'playing') this.update(dt);
      this.render(dt);
      this.rafId = requestAnimationFrame(step);
    };
    this.rafId = requestAnimationFrame(step);
  }

  stop() {
    this.running = false;
    cancelAnimationFrame(this.rafId);
  }

  private update(dt: number) {
    // Lung health
    if (this.smoking) {
      // Drain faster when combo is high, and when health is low
      const drainRate = 14 + (this.combo - 1) * 1.2;
      this.lungHealth -= drainRate * dt;
      this.charBreath = Math.min(1, this.charBreath + dt * 2.2);
      this.smokeEmitTimer += dt;
      // Emit smoke stream
      const emitInterval = 0.018;
      while (this.smokeEmitTimer > emitInterval) {
        this.smokeEmitTimer -= emitInterval;
        this.emitSmokePuff();
      }
      // Fill container
      this.jar.fill = Math.min(1, this.jar.fill + dt * 0.38);
      this.jar.shake = Math.min(1, this.jar.shake + dt * 3);
      this.chainTime += dt;

      if (this.jar.fill >= 1 && this.jar.pop <= 0) {
        this.completeJar();
      }

      // Occasional cough at low health
      if (this.lungHealth < 35) {
        this.coughTime += dt;
        if (this.coughTime > 1.2) {
          this.coughTime = 0;
          this.shakeIntensity = Math.max(this.shakeIntensity, 5);
          for (let i = 0; i < 8; i++) {
            this.particles.push({
              x: this.charX + 40,
              y: this.charY - 30,
              vx: 80 + Math.random() * 60,
              vy: -40 + Math.random() * 40,
              life: 0,
              maxLife: 0.6,
              size: 6 + Math.random() * 6,
              type: 'puff',
              color: '#8b5a3c',
              rotation: 0,
              rotSpeed: 0,
              gravity: 40,
              drag: 0.98,
            });
          }
        }
      }

      // Ember flickers
      if (Math.random() < 0.6) {
        this.particles.push({
          x: this.charX + 60 + Math.random() * 6,
          y: this.charY - 24 + (Math.random() - 0.5) * 4,
          vx: 30 + Math.random() * 40,
          vy: -40 - Math.random() * 50,
          life: 0,
          maxLife: 0.5 + Math.random() * 0.5,
          size: 2 + Math.random() * 2,
          type: 'ember',
          color: '#ffaa3b',
          rotation: 0,
          rotSpeed: 0,
          gravity: -20,
          drag: 0.99,
        });
      }
    } else {
      // Regenerate slowly
      this.lungHealth += 4.5 * dt;
      this.charBreath = Math.max(0, this.charBreath - dt * 2);
      this.jar.shake = Math.max(0, this.jar.shake - dt * 4);
      this.comboTimer += dt;
      if (this.comboTimer > 4 && this.combo > 1) {
        this.combo = Math.max(1, this.combo - dt * 0.8);
      }
      this.coughTime = 0;
    }

    this.lungHealth = Math.max(0, Math.min(100, this.lungHealth));

    if (this.lungHealth <= 0) {
      this.gameOver();
      return;
    }

    // Update jar enter/pop
    if (this.jar.enter < 1) this.jar.enter = Math.min(1, this.jar.enter + dt * 3);
    if (this.jar.pop > 0) this.jar.pop = Math.max(0, this.jar.pop - dt * 2.5);

    // Update particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life += dt;
      if (p.life >= p.maxLife) {
        this.particles.splice(i, 1);
        continue;
      }
      p.vx *= p.drag;
      p.vy *= p.drag;
      p.vy += p.gravity * dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.rotation += p.rotSpeed * dt;

      if (p.type === 'smoke') {
        // Grow and slow
        p.size += dt * 28;
        // Attract gently toward jar
        const dx = this.jar.x - p.x;
        const dy = this.jar.y - p.y;
        const d = Math.hypot(dx, dy);
        if (d > 10) {
          p.vx += (dx / d) * 30 * dt;
          p.vy += (dy / d) * 30 * dt;
        }
        // Get absorbed near jar
        if (
          Math.abs(p.x - this.jar.x) < this.jar.w / 2 + 10 &&
          Math.abs(p.y - this.jar.y) < this.jar.h / 2 + 10 &&
          p.life > 0.25
        ) {
          p.life = Math.max(p.life, p.maxLife - 0.2);
        }
      }
    }

    // Update floaters
    for (let i = this.floaters.length - 1; i >= 0; i--) {
      const f = this.floaters[i];
      f.life += dt;
      if (f.life >= f.maxLife) {
        this.floaters.splice(i, 1);
        continue;
      }
      f.y += f.vy * dt;
      f.vy *= 0.94;
      f.scale += (1 - f.scale) * dt * 4;
    }

    // Shake decay
    this.shakeIntensity *= Math.pow(0.001, dt);
    if (this.shakeIntensity < 0.05) this.shakeIntensity = 0;
    this.shakeX = (Math.random() - 0.5) * this.shakeIntensity;
    this.shakeY = (Math.random() - 0.5) * this.shakeIntensity;

    // Flash decay
    this.flash = Math.max(0, this.flash - dt * 2);

    // Ambient embers when idle
    if (!this.smoking && Math.random() < 0.15) {
      this.particles.push({
        x: this.charX + 60 + Math.random() * 4,
        y: this.charY - 24,
        vx: 20 + Math.random() * 20,
        vy: -30 - Math.random() * 30,
        life: 0,
        maxLife: 0.6 + Math.random() * 0.5,
        size: 1.5 + Math.random() * 1.5,
        type: 'ember',
        color: '#ff7a2a',
        rotation: 0,
        rotSpeed: 0,
        gravity: -10,
        drag: 0.99,
      });
    }

    // Periodically emit stats for UI
    if (Math.floor(this.totalTime * 10) !== Math.floor((this.totalTime - dt) * 10)) {
      this.emitStats();
    }
  }

  private emitSmokePuff() {
    const cx = this.charX + 58;
    const cy = this.charY - 24;
    const tx = this.jar.x;
    const ty = this.jar.y;
    const dx = tx - cx;
    const dy = ty - cy;
    const len = Math.max(1, Math.hypot(dx, dy));
    const baseVx = (dx / len) * 220;
    const baseVy = (dy / len) * 220;
    const count = 2;
    for (let i = 0; i < count; i++) {
      const spread = 0.35;
      const a = (Math.random() - 0.5) * spread;
      const ca = Math.cos(a),
        sa = Math.sin(a);
      const vx = baseVx * ca - baseVy * sa;
      const vy = baseVx * sa + baseVy * ca;
      const gray = 200 + Math.floor(Math.random() * 55);
      this.particles.push({
        x: cx + (Math.random() - 0.5) * 6,
        y: cy + (Math.random() - 0.5) * 6,
        vx: vx * (0.6 + Math.random() * 0.6),
        vy: vy * (0.6 + Math.random() * 0.6) - 20,
        life: 0,
        maxLife: 1.3 + Math.random() * 0.6,
        size: 10 + Math.random() * 6,
        type: 'smoke',
        color: `rgb(${gray},${gray},${gray + 8})`,
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 1.5,
        gravity: -12,
        drag: 0.995,
      });
    }
  }

  private completeJar() {
    const reward = Math.round(this.jar.value * this.combo);
    this.money += reward;
    this.score += reward;
    this.containersFilled += 1;

    // Combo grows
    this.comboTimer = 0;
    if (this.chainTime < 3 && this.containersFilled > 1) {
      this.combo = Math.min(9, this.combo + 0.25);
    }
    this.chainTime = 0;

    // Effects
    this.shakeIntensity = 14 + this.combo * 1.5;
    this.flash = 0.35;
    this.jar.pop = 1;

    // Burst particles
    for (let i = 0; i < 26; i++) {
      const a = Math.random() * Math.PI * 2;
      const sp = 140 + Math.random() * 220;
      this.particles.push({
        x: this.jar.x,
        y: this.jar.y,
        vx: Math.cos(a) * sp,
        vy: Math.sin(a) * sp - 40,
        life: 0,
        maxLife: 0.8 + Math.random() * 0.5,
        size: 8 + Math.random() * 10,
        type: 'puff',
        color: '#ffffff',
        rotation: 0,
        rotSpeed: 0,
        gravity: 60,
        drag: 0.97,
      });
    }
    for (let i = 0; i < 10; i++) {
      const a = Math.random() * Math.PI * 2;
      const sp = 80 + Math.random() * 140;
      this.particles.push({
        x: this.jar.x,
        y: this.jar.y,
        vx: Math.cos(a) * sp,
        vy: Math.sin(a) * sp - 80,
        life: 0,
        maxLife: 0.8 + Math.random() * 0.4,
        size: 6 + Math.random() * 4,
        type: 'coin',
        color: '#ffd93d',
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 8,
        gravity: 260,
        drag: 0.98,
      });
    }
    this.addFloater(this.jar.x, this.jar.y - 40, '+$' + reward, '#ffd93d', 32);
    if (this.combo > 1.5) {
      this.addFloater(
        this.jar.x,
        this.jar.y - 80,
        'x' + this.combo.toFixed(1) + ' COMBO!',
        '#ff6ec7',
        22
      );
    }

    // Reset jar in place for next round
    this.jar.fill = 0;
    this.jar.shake = 0;
    this.jar.enter = 0;
    this.jar.value = 10 + Math.floor(Math.random() * 10);
    this.jar.hue = 190 + Math.random() * 80;
    this.emitStats();
  }

  private gameOver() {
    this.state = 'gameover';
    this.smoking = false;
    if (this.score > this.highScore) {
      this.highScore = this.score;
      this.saveHighScore();
    }
    this.shakeIntensity = 22;
    this.emitStats();
    this.onStateChange?.(this.state);
  }

  // ---- Rendering ----
  private render(_dt: number) {
    const ctx = this.ctx;
    const W = this.width;
    const H = this.height;

    // Background
    const bg = ctx.createLinearGradient(0, 0, 0, H);
    bg.addColorStop(0, '#1a0b2e');
    bg.addColorStop(0.5, '#2a1245');
    bg.addColorStop(1, '#0f0520');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    // Stars
    ctx.save();
    for (let i = 0; i < 60; i++) {
      const x = (i * 137.5) % W;
      const y = (i * 89.3) % (H * 0.5);
      const tw = 0.4 + 0.6 * Math.abs(Math.sin(this.totalTime * 2 + i));
      ctx.fillStyle = `rgba(255,255,255,${0.15 + tw * 0.35})`;
      ctx.fillRect(x, y, 1.5, 1.5);
    }
    ctx.restore();

    // Distant city silhouette
    ctx.fillStyle = 'rgba(15, 5, 32, 0.9)';
    ctx.beginPath();
    ctx.moveTo(0, H * 0.78);
    let x = 0;
    while (x < W) {
      const bw = 40 + ((x * 31) % 70);
      const bh = 60 + ((x * 17) % 120);
      ctx.lineTo(x, H * 0.78 - bh);
      ctx.lineTo(x + bw, H * 0.78 - bh);
      x += bw;
    }
    ctx.lineTo(W, H * 0.78);
    ctx.lineTo(W, H);
    ctx.lineTo(0, H);
    ctx.closePath();
    ctx.fill();

    // Window lights
    ctx.fillStyle = 'rgba(255, 200, 100, 0.6)';
    for (let i = 0; i < 30; i++) {
      const wx = (i * 71) % W;
      const wy = H * 0.78 - 20 - ((i * 23) % 80);
      const flick = Math.sin(this.totalTime * 3 + i) > 0 ? 1 : 0.3;
      ctx.fillRect(wx, wy, 3, 4);
      ctx.globalAlpha = flick;
      ctx.fillRect(wx, wy, 3, 4);
      ctx.globalAlpha = 1;
    }

    // Bar counter
    const barY = H * 0.82;
    const barGrad = ctx.createLinearGradient(0, barY, 0, H);
    barGrad.addColorStop(0, '#6b3a1a');
    barGrad.addColorStop(0.3, '#4a2810');
    barGrad.addColorStop(1, '#2a1508');
    ctx.fillStyle = barGrad;
    ctx.fillRect(0, barY, W, H - barY);

    // Bar top shine
    ctx.fillStyle = 'rgba(255, 200, 140, 0.3)';
    ctx.fillRect(0, barY, W, 4);
    ctx.fillStyle = 'rgba(255, 200, 140, 0.08)';
    ctx.fillRect(0, barY + 4, W, 12);

    // Apply shake
    ctx.save();
    ctx.translate(this.shakeX, this.shakeY);

    // Character
    this.drawCharacter(ctx);

    // Jar
    this.drawJar(ctx);

    // Particles (smoke)
    this.drawParticles(ctx);

    // Floaters
    this.drawFloaters(ctx);

    ctx.restore();

    // Flash
    if (this.flash > 0) {
      ctx.fillStyle = `rgba(255, 255, 255, ${this.flash * 0.4})`;
      ctx.fillRect(0, 0, W, H);
    }

    // Vignette
    const vg = ctx.createRadialGradient(W / 2, H / 2, H * 0.3, W / 2, H / 2, H * 0.85);
    vg.addColorStop(0, 'rgba(0,0,0,0)');
    vg.addColorStop(1, 'rgba(0,0,0,0.55)');
    ctx.fillStyle = vg;
    ctx.fillRect(0, 0, W, H);

    // Low-health red tint
    if (this.lungHealth < 30) {
      const intensity = (1 - this.lungHealth / 30) * 0.4;
      const pulse = 0.5 + 0.5 * Math.sin(this.totalTime * 6);
      ctx.fillStyle = `rgba(255, 30, 60, ${intensity * pulse})`;
      ctx.fillRect(0, 0, W, H);
    }
  }

  private drawCharacter(ctx: CanvasRenderingContext2D) {
    const x = this.charX;
    const y = this.charY;
    const breath = this.charBreath;
    const bodyScale = 1 + breath * 0.06;

    ctx.save();
    ctx.translate(x, y);

    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    ctx.beginPath();
    ctx.ellipse(0, 70, 45, 8, 0, 0, Math.PI * 2);
    ctx.fill();

    // Body
    ctx.save();
    ctx.scale(bodyScale, bodyScale);
    // Torso
    const torsoGrad = ctx.createLinearGradient(-30, -10, 30, 60);
    torsoGrad.addColorStop(0, '#7b3f9e');
    torsoGrad.addColorStop(1, '#4a1f6b');
    ctx.fillStyle = torsoGrad;
    roundRect(ctx, -32, 0, 64, 70, 14);
    ctx.fill();

    // Shirt stripe
    ctx.fillStyle = '#ffd93d';
    ctx.fillRect(-32, 22, 64, 4);

    // Arms
    ctx.fillStyle = '#6a2d8e';
    roundRect(ctx, -42, 6, 14, 50, 7);
    ctx.fill();
    roundRect(ctx, 28, 6, 14, 50, 7);
    ctx.fill();

    ctx.restore();

    // Head
    const headBob = Math.sin(this.totalTime * 3) * 1.5;
    ctx.save();
    ctx.translate(0, -32 + headBob);

    // Head circle
    const headGrad = ctx.createRadialGradient(-6, -6, 2, 0, 0, 34);
    headGrad.addColorStop(0, '#ffd9b3');
    headGrad.addColorStop(1, '#e8a67a');
    ctx.fillStyle = headGrad;
    ctx.beginPath();
    ctx.arc(0, 0, 32, 0, Math.PI * 2);
    ctx.fill();

    // Hair
    ctx.fillStyle = '#2a1a0f';
    ctx.beginPath();
    ctx.arc(0, -8, 32, Math.PI, 0);
    ctx.lineTo(30, -2);
    ctx.quadraticCurveTo(0, -18, -30, -2);
    ctx.closePath();
    ctx.fill();

    // Sunglasses
    ctx.fillStyle = '#1a1a2a';
    roundRect(ctx, -22, -6, 18, 10, 3);
    ctx.fill();
    roundRect(ctx, 4, -6, 18, 10, 3);
    ctx.fill();
    ctx.fillRect(-4, -3, 8, 2);
    // Lens shine
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.fillRect(-19, -4, 5, 2);
    ctx.fillRect(7, -4, 5, 2);

    // Mouth area
    // Cigarette
    const cigLen = 22;
    ctx.save();
    ctx.translate(14, 10);
    ctx.rotate(-0.08 + breath * 0.02);
    // Paper
    ctx.fillStyle = '#f4e5c7';
    ctx.fillRect(0, -2, cigLen, 4);
    // Filter
    ctx.fillStyle = '#c9935a';
    ctx.fillRect(0, -2, 5, 4);
    // Ember
    const emberPulse = 0.7 + 0.3 * Math.sin(this.totalTime * 20);
    ctx.fillStyle = smokingColor(breath, emberPulse);
    ctx.beginPath();
    ctx.arc(cigLen, 0, 3.5, 0, Math.PI * 2);
    ctx.fill();
    // Ember glow
    const glowGrad = ctx.createRadialGradient(cigLen, 0, 0, cigLen, 0, 14);
    glowGrad.addColorStop(0, `rgba(255, 150, 60, ${0.5 + breath * 0.4})`);
    glowGrad.addColorStop(1, 'rgba(255, 150, 60, 0)');
    ctx.fillStyle = glowGrad;
    ctx.beginPath();
    ctx.arc(cigLen, 0, 14, 0, Math.PI * 2);
    ctx.fill();
    // Smoke wisp at tip when smoking
    if (breath > 0.3) {
      ctx.globalAlpha = breath * 0.5;
      ctx.fillStyle = '#e0e0e0';
      ctx.beginPath();
      ctx.arc(cigLen + 3, -5 - Math.sin(this.totalTime * 10) * 2, 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    }
    ctx.restore();

    ctx.restore();

    // Cheek blush when low health
    if (this.lungHealth < 40) {
      ctx.fillStyle = `rgba(255, 80, 80, ${0.3 + (1 - this.lungHealth / 40) * 0.3})`;
      ctx.beginPath();
      ctx.arc(x - 14, y - 28, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(x + 14, y - 28, 5, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  private drawJar(ctx: CanvasRenderingContext2D) {
    const j = this.jar;
    const enter = easeOutBack(j.enter);
    const pop = j.pop;
    const scale = enter * (1 + pop * 0.3);

    ctx.save();
    ctx.translate(j.x, j.y);
    ctx.scale(scale, scale);
    const shakeOff = (Math.random() - 0.5) * j.shake * 3;
    ctx.translate(shakeOff, shakeOff * 0.5);

    const w = j.w;
    const h = j.h;

    // Glow behind jar
    const glowGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, w);
    glowGrad.addColorStop(0, `hsla(${j.hue}, 80%, 60%, 0.3)`);
    glowGrad.addColorStop(1, `hsla(${j.hue}, 80%, 60%, 0)`);
    ctx.fillStyle = glowGrad;
    ctx.beginPath();
    ctx.arc(0, 0, w, 0, Math.PI * 2);
    ctx.fill();

    // Jar body
    ctx.strokeStyle = `hsla(${j.hue}, 60%, 80%, 0.9)`;
    ctx.lineWidth = 3;
    ctx.fillStyle = 'rgba(200, 230, 255, 0.08)';
    roundRect(ctx, -w / 2, -h / 2, w, h, 12);
    ctx.fill();
    ctx.stroke();

    // Jar lid
    ctx.fillStyle = '#4a2810';
    roundRect(ctx, -w / 2 - 4, -h / 2 - 10, w + 8, 14, 4);
    ctx.fill();
    ctx.strokeStyle = '#6b3a1a';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Fill smoke inside jar
    if (j.fill > 0) {
      ctx.save();
      ctx.beginPath();
      roundRect(ctx, -w / 2 + 3, -h / 2 + 3, w - 6, h - 6, 10);
      ctx.clip();
      const fillH = (h - 6) * j.fill;
      const fillY = h / 2 - 3 - fillH;
      const fg = ctx.createLinearGradient(0, fillY, 0, h / 2);
      fg.addColorStop(0, 'rgba(245, 245, 250, 0.9)');
      fg.addColorStop(1, 'rgba(200, 200, 220, 0.95)');
      ctx.fillStyle = fg;
      // Wavy top
      ctx.beginPath();
      ctx.moveTo(-w / 2 + 3, fillY);
      const waves = 6;
      for (let i = 0; i <= waves; i++) {
        const wx = -w / 2 + 3 + ((w - 6) * i) / waves;
        const wy = fillY + Math.sin(this.totalTime * 4 + i) * 3;
        ctx.lineTo(wx, wy);
      }
      ctx.lineTo(w / 2 - 3, h / 2 - 3);
      ctx.lineTo(-w / 2 + 3, h / 2 - 3);
      ctx.closePath();
      ctx.fill();

      // Smoke swirls inside
      ctx.fillStyle = 'rgba(150, 150, 170, 0.4)';
      for (let i = 0; i < 3; i++) {
        const sx = -w / 2 + 10 + ((w - 20) * ((this.totalTime * 0.3 + i * 0.33) % 1));
        const sy = fillY + fillH * 0.3 + Math.sin(this.totalTime * 2 + i) * 10;
        ctx.beginPath();
        ctx.arc(sx, sy, 8, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }

    // Shine
    ctx.fillStyle = 'rgba(255,255,255,0.18)';
    roundRect(ctx, -w / 2 + 8, -h / 2 + 6, 6, h - 16, 3);
    ctx.fill();

    // Fill percentage label
    if (j.fill > 0 && j.fill < 1) {
      ctx.fillStyle = 'rgba(255,255,255,0.9)';
      ctx.font = 'bold 16px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(Math.round(j.fill * 100) + '%', 0, h / 2 + 22);
    }

    // Value tag
    if (j.fill < 1) {
      ctx.fillStyle = '#ffd93d';
      ctx.font = 'bold 14px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('$' + j.value, 0, -h / 2 - 20);
    }

    ctx.restore();
  }

  private drawParticles(ctx: CanvasRenderingContext2D) {
    // Draw smoke first (behind)
    for (const p of this.particles) {
      if (p.type !== 'smoke' && p.type !== 'puff') continue;
      const t = p.life / p.maxLife;
      const alpha = (1 - t) * (p.type === 'smoke' ? 0.55 : 0.7);
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
    // Then the others on top
    for (const p of this.particles) {
      if (p.type === 'smoke' || p.type === 'puff') continue;
      const t = p.life / p.maxLife;
      const alpha = 1 - t;
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);
      if (p.type === 'ember') {
        ctx.fillStyle = p.color;
        ctx.shadowColor = '#ff7a2a';
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(0, 0, p.size, 0, Math.PI * 2);
        ctx.fill();
      } else if (p.type === 'heart') {
        ctx.fillStyle = p.color;
        ctx.shadowColor = '#ff4d6d';
        ctx.shadowBlur = 10;
        drawHeart(ctx, 0, 0, p.size);
      } else if (p.type === 'coin') {
        ctx.fillStyle = p.color;
        ctx.strokeStyle = '#b8860b';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(0, 0, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#b8860b';
        ctx.font = `bold ${Math.round(p.size * 1.2)}px system-ui`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('$', 0, 1);
      } else if (p.type === 'star') {
        ctx.fillStyle = p.color;
        drawStar(ctx, 0, 0, p.size, 5);
      }
      ctx.restore();
    }
  }

  private drawFloaters(ctx: CanvasRenderingContext2D) {
    for (const f of this.floaters) {
      const t = f.life / f.maxLife;
      const alpha = 1 - t;
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.translate(f.x, f.y);
      ctx.scale(f.scale, f.scale);
      ctx.font = `bold ${f.size}px system-ui, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.lineWidth = 4;
      ctx.strokeStyle = 'rgba(0,0,0,0.7)';
      ctx.strokeText(f.text, 0, 0);
      ctx.fillStyle = f.color;
      ctx.fillText(f.text, 0, 0);
      ctx.restore();
    }
  }
}

// ---- Helpers ----
function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
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
  ctx.closePath();
}

function drawHeart(ctx: CanvasRenderingContext2D, cx: number, cy: number, size: number) {
  ctx.beginPath();
  const s = size / 2;
  ctx.moveTo(cx, cy + s * 0.8);
  ctx.bezierCurveTo(cx + s * 1.6, cy - s * 0.3, cx + s * 0.8, cy - s * 1.2, cx, cy - s * 0.4);
  ctx.bezierCurveTo(cx - s * 0.8, cy - s * 1.2, cx - s * 1.6, cy - s * 0.3, cx, cy + s * 0.8);
  ctx.closePath();
  ctx.fill();
}

function drawStar(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  r: number,
  points: number
) {
  ctx.beginPath();
  for (let i = 0; i < points * 2; i++) {
    const a = (i * Math.PI) / points - Math.PI / 2;
    const rad = i % 2 === 0 ? r : r * 0.45;
    const x = cx + Math.cos(a) * rad;
    const y = cy + Math.sin(a) * rad;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fill();
}

function easeOutBack(t: number) {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
}

function smokingColor(breath: number, pulse: number) {
  const r = 255;
  const g = Math.round(100 + pulse * 80 + breath * 40);
  const b = 20;
  return `rgb(${r},${g},${b})`;
}
