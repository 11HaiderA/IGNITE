import { audio } from './audio.js';
import { storage } from './storage.js';
import { build, clone, applyMove, evaluate, sticks, applyRemove, applyAdd } from './game/model.js';
import { solve } from './game/solver.js';
import { generatePuzzle } from './game/generator.js';
import { BoardRenderer } from './game/render.js';
import { InputHandler } from './game/input.js';

import { SplashScreen } from './ui/splash.js';
import { HomeScreen } from './ui/home.js';
import { HowToPlayModal } from './ui/howtoplay.js';
import { SettingsModal } from './ui/settings.js';
import { PauseModal } from './ui/pause.js';
import { HintModal } from './ui/hint.js';
import { WinModal } from './ui/win.js';
import { LevelsModal } from './ui/levels.js';

class GameApp {
  constructor() {
    this.appEl = document.getElementById('app');
    this.modalLayer = document.getElementById('modalLayer');
    this.levels = [];

    this.currentScreen = 'splash';
    this.currentLevel = 1;
    this.levelData = null;

    // Board & gameplay state
    this.puzzleState = null;
    this.curState = null;
    this.history = [];
    this.picked = null;
    this.hint = null;
    this.hintUsed = false;
    this.wrongAttempts = 0;
    this.isLocked = false;
    this.startTime = 0;
    this.movesTaken = 0;

    this.initEmbers();
    this.loadLevels();
  }

  async loadLevels() {
    try {
      const res = await fetch('./levels/levels.json');
      this.levels = await res.json();
    } catch (e) {
      console.warn('Could not load levels.json directly, using procedural fallback');
    }
    this.showSplash();
  }

  initEmbers() {
    const canvas = document.getElementById('emberCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resize);
    resize();

    const particles = Array.from({ length: 32 }, () => ({
      x: Math.random() * canvas.width,
      y: canvas.height + Math.random() * 80,
      size: 1 + Math.random() * 2.5,
      speedY: 0.4 + Math.random() * 0.8,
      speedX: (Math.random() - 0.5) * 0.5,
      opacity: 0.2 + Math.random() * 0.5,
      flicker: Math.random() * 0.05,
    }));

    const renderEmbers = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        p.y -= p.speedY;
        p.x += p.speedX;
        p.opacity += (Math.random() - 0.5) * p.flicker;
        if (p.opacity < 0.1) p.opacity = 0.1;
        if (p.opacity > 0.6) p.opacity = 0.6;

        if (p.y < -10) {
          p.y = canvas.height + 10;
          p.x = Math.random() * canvas.width;
        }

        ctx.fillStyle = `rgba(255, ${Math.floor(120 + Math.random() * 60)}, 26, ${p.opacity})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      });
      requestAnimationFrame(renderEmbers);
    };

    requestAnimationFrame(renderEmbers);
  }

  showSplash() {
    this.currentScreen = 'splash';
    const splash = new SplashScreen(this.appEl, () => {
      this.showHome();
    });
    splash.show();
  }

  showHome() {
    this.currentScreen = 'home';
    const home = new HomeScreen(this.appEl, {
      onPlay: (level) => {
        this.startLevel(level);
      },
      onHowToPlay: () => {
        new HowToPlayModal(this.modalLayer).show();
      },
      onSettings: () => {
        new SettingsModal(this.modalLayer).show();
      },
      onLevels: () => {
        new LevelsModal(this.modalLayer, (lvl) => {
          this.startLevel(lvl);
        }).show();
      },
    });
    home.show();
  }

  startLevel(lvlNum) {
    this.currentScreen = 'gameplay';
    this.currentLevel = lvlNum;

    // Retrieve level from levels.json or procedural
    let lvl = this.levels.find((l) => l.id === lvlNum);
    if (!lvl) {
      lvl = generatePuzzle(lvlNum, 'move-1');
      lvl.id = lvlNum;
    }
    this.levelData = lvl;

    this.puzzleState = build(lvl.equation);
    this.curState = clone(this.puzzleState);
    this.history = [];
    this.picked = null;
    this.hint = null;
    this.hintUsed = false;
    this.wrongAttempts = 0;
    this.isLocked = false;
    this.movesTaken = 0;
    this.startTime = Date.now();

    this.renderGameplayScreen();

    // Check if first time Level 1: show How To Play automatically!
    const prog = storage.getProgress();
    if (lvlNum === 1 && !prog.howToPlaySeen) {
      setTimeout(() => {
        new HowToPlayModal(this.modalLayer).show();
      }, 400);
    }
  }

  renderGameplayScreen() {
    const modeText = this.levelData.mode === 'remove-1'
      ? 'REMOVE 1 STICK'
      : this.levelData.mode === 'add-1'
      ? 'ADD 1 STICK'
      : this.levelData.mode === 'move-2'
      ? 'MOVE 2 STICKS'
      : 'MOVE 1 STICK';

    this.appEl.innerHTML = `
      <div class="screen game-screen" id="gameScreen">
        <!-- Top HUD -->
        <header class="game-hud">
          <button class="icon-btn" id="btnPause" aria-label="Pause">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <rect x="6" y="4" width="4" height="16" rx="1"/>
              <rect x="14" y="4" width="4" height="16" rx="1"/>
            </svg>
          </button>

          <div class="level-chip">
            <span class="level-chip-label">LEVEL ${this.currentLevel}</span>
          </div>

          <button class="icon-btn hint-ad-btn" id="btnHint" aria-label="Hint">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9 18h6"/>
              <path d="M10 22h4"/>
              <path d="M12 2a7 7 0 0 0-7 7c0 2.5 1.5 4.5 3 6h8c1.5-1.5 3-3.5 3-6a7 7 0 0 0-7-7z"/>
            </svg>
            <span class="ad-badge">AD</span>
          </button>
        </header>

        <!-- Objective Banner -->
        <div class="objective-banner">
          <span class="objective-text">${modeText}</span>
        </div>

        <!-- Central SVG Board -->
        <main class="board-wrapper" id="boardWrapper">
          <svg class="match-board-svg" id="boardSvg"></svg>
        </main>

        <!-- Bottom Controls -->
        <footer class="game-footer">
          <div class="footer-actions">
            <button class="icon-btn" id="btnResetBoard" title="Reset level">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
                <path d="M3 3v5h5"/>
              </svg>
            </button>
            <button class="icon-btn" id="btnUndoMove" title="Undo move">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                <path d="M9 14L4 9l5-5"/>
                <path d="M4 9h10.5a5.5 5.5 0 0 1 5.5 5.5v0a5.5 5.5 0 0 1-5.5 5.5H11"/>
              </svg>
            </button>
          </div>

          <div class="moves-stars-status" id="movesStatus">
            MOVES ${this.movesTaken}/${this.levelData.movesAllowed || 1} · ★★★
          </div>
        </footer>
      </div>
    `;

    const svgEl = this.appEl.querySelector('#boardSvg');
    this.renderer = new BoardRenderer(svgEl);

    this.inputHandler = new InputHandler(svgEl, {
      isLocked: () => this.isLocked,
      getPicked: () => this.picked,
      onPick: (tokenIdx, slotKey) => {
        if (this.levelData.mode === 'remove-1') {
          // Direct tap to remove
          this.executeRemove(tokenIdx, slotKey);
          return;
        }
        audio.playWoodTick();
        this.picked = [tokenIdx, slotKey];
        this.updateBoard();
      },
      onDropSlot: (tokenIdx, slotKey) => {
        if (!this.picked) return;
        this.executeMove(this.picked, [tokenIdx, slotKey]);
      },
      onCancel: () => {
        audio.playWoodTick();
        this.picked = null;
        this.updateBoard();
      },
      onDragEnd: () => {
        this.updateBoard();
      },
    });

    // Controls
    this.appEl.querySelector('#btnPause').addEventListener('click', () => {
      new PauseModal(this.modalLayer, {
        onResume: () => {},
        onRestart: () => this.startLevel(this.currentLevel),
        onLevels: () => {
          new LevelsModal(this.modalLayer, (lvl) => this.startLevel(lvl)).show();
        },
        onHome: () => this.showHome(),
      }).show();
    });

    this.appEl.querySelector('#btnHint').addEventListener('click', () => {
      new HintModal(this.modalLayer, () => {
        this.revealHint();
      }).show();
    });

    this.appEl.querySelector('#btnResetBoard').addEventListener('click', () => {
      if (this.isLocked) return;
      audio.playClick();
      this.curState = clone(this.puzzleState);
      this.history = [];
      this.picked = null;
      this.hint = null;
      this.movesTaken = 0;
      this.updateBoard();
    });

    this.appEl.querySelector('#btnUndoMove').addEventListener('click', () => {
      if (this.isLocked || this.history.length === 0) return;
      audio.playClick();
      this.curState = this.history.pop();
      this.movesTaken = Math.max(0, this.movesTaken - 1);
      this.picked = null;
      this.updateBoard();
    });

    this.updateBoard();
  }

  updateBoard(opts = {}) {
    if (!this.renderer) return;
    this.renderer.render(this.curState, {
      picked: this.picked,
      hint: this.hint,
      ...opts,
    });

    const statusEl = this.appEl.querySelector('#movesStatus');
    if (statusEl) {
      const allowed = this.levelData.movesAllowed || 1;
      const starsDisplay = this.hintUsed ? '★☆☆' : this.wrongAttempts > 0 ? '★★☆' : '★★★';
      statusEl.textContent = `MOVES ${this.movesTaken}/${allowed} · ${starsDisplay}`;
    }
  }

  executeMove(from, to) {
    audio.playWoodTock();
    this.history.push(clone(this.curState));
    this.curState = applyMove(this.curState, from, to);
    this.movesTaken++;
    this.picked = null;
    this.hint = null;

    this.updateBoard();

    // Check evaluate
    const ev = evaluate(this.curState);
    if (ev.valid && ev.correct) {
      this.triggerSolveSequence();
    } else {
      // Check if max moves exceeded
      const allowed = this.levelData.movesAllowed || 1;
      if (this.movesTaken >= allowed) {
        this.triggerFailSequence(ev);
      }
    }
  }

  executeRemove(tokenIdx, slotKey) {
    audio.playWoodTock();
    this.history.push(clone(this.curState));
    this.curState = applyRemove(this.curState, [tokenIdx, slotKey]);
    this.movesTaken++;
    this.updateBoard();

    const ev = evaluate(this.curState);
    if (ev.valid && ev.correct) {
      this.triggerSolveSequence();
    } else {
      this.triggerFailSequence(ev);
    }
  }

  triggerFailSequence(ev) {
    this.isLocked = true;
    this.wrongAttempts++;
    audio.playWrong();

    if (navigator.vibrate) {
      navigator.vibrate([40, 60, 40]);
    }

    const boardWrapper = this.appEl.querySelector('#boardWrapper');
    if (boardWrapper) {
      boardWrapper.classList.remove('board-shake');
      void boardWrapper.offsetWidth;
      boardWrapper.classList.add('board-shake');
    }

    setTimeout(() => {
      if (this.history.length > 0) {
        this.curState = this.history.pop();
        this.movesTaken = Math.max(0, this.movesTaken - 1);
      } else {
        this.curState = clone(this.puzzleState);
        this.movesTaken = 0;
      }
      this.isLocked = false;
      this.updateBoard();
    }, 850);
  }

  async triggerSolveSequence() {
    this.isLocked = true;
    const elapsedSec = Math.max(1, Math.round((Date.now() - this.startTime) / 1000));
    const stars = this.hintUsed ? 1 : (this.wrongAttempts > 0 || elapsedSec > 60) ? 2 : 3;

    // Collect all filled matchstick IDs
    const { filled } = sticks(this.curState);
    const burningSet = new Set();
    const charredSet = new Set();

    audio.playStrike();
    audio.startCrackle();

    // Fire spreads stick to stick sequentially (~80ms apart)
    for (let i = 0; i < filled.length; i++) {
      const [tIdx, slotK] = filled[i];
      const stickId = `${tIdx}-${slotK}`;
      burningSet.add(stickId);
      this.updateBoard({ burnedIndices: burningSet, charredIndices: charredSet });

      // After 220ms, it turns charred black
      setTimeout(() => {
        burningSet.delete(stickId);
        charredSet.add(stickId);
        this.updateBoard({ burnedIndices: burningSet, charredIndices: charredSet });
      }, 240);

      await new Promise((r) => setTimeout(r, 75));
    }

    // Stop crackle after burn sequence finishes
    setTimeout(() => {
      audio.stopCrackle();
    }, 1200);

    // Save progression
    storage.recordLevelWin(this.currentLevel, stars, elapsedSec);

    // After 1.6s, show Win popup
    setTimeout(() => {
      new WinModal(this.modalLayer, {
        onNext: () => this.startLevel(this.currentLevel + 1),
        onRestart: () => this.startLevel(this.currentLevel),
        onLevels: () => {
          new LevelsModal(this.modalLayer, (lvl) => this.startLevel(lvl)).show();
        },
        onHome: () => this.showHome(),
      }).show({
        levelId: this.currentLevel,
        stars,
        timeSec: elapsedSec,
      });
    }, 1600);
  }

  revealHint() {
    const sols = solve(this.puzzleState, this.levelData.mode || 'move-1');
    if (!sols || sols.length === 0) return;

    this.hint = sols[0];
    this.hintUsed = true;
    this.updateBoard();
  }
}

// Boot game when DOM is loaded
window.addEventListener('DOMContentLoaded', () => {
  new GameApp();
});
