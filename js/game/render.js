import {
  SEG,
  OPSEG,
  EQSEG,
  TOKEN_W,
  GAP,
  slotsOf,
  has,
} from './model.js';

export class BoardRenderer {
  constructor(svgElement) {
    this.svg = svgElement;
    this.setupDefs();
  }

  setupDefs() {
    this.svg.innerHTML = `
      <defs>
        <!-- Wood body gradient -->
        <linearGradient id="woodGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#f7d89a"/>
          <stop offset="50%" stop-color="#e2b46a"/>
          <stop offset="100%" stop-color="#a8743a"/>
        </linearGradient>

        <!-- Burned charred wood gradient -->
        <linearGradient id="charredGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#3a2a24"/>
          <stop offset="60%" stop-color="#180e0a"/>
          <stop offset="100%" stop-color="#050303"/>
        </linearGradient>

        <!-- Sulfur match head radial gradient -->
        <radialGradient id="headGrad" cx="35%" cy="35%" r="65%">
          <stop offset="0%" stop-color="#ff9b8e"/>
          <stop offset="45%" stop-color="#e3241f"/>
          <stop offset="100%" stop-color="#7a0808"/>
        </radialGradient>

        <!-- Ashen burned head gradient -->
        <radialGradient id="ashGrad" cx="35%" cy="35%" r="65%">
          <stop offset="0%" stop-color="#a8a29e"/>
          <stop offset="60%" stop-color="#57534e"/>
          <stop offset="100%" stop-color="#1c1917"/>
        </radialGradient>

        <!-- Ember glowing speck gradient -->
        <radialGradient id="emberGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#ffffff"/>
          <stop offset="30%" stop-color="#ffb347"/>
          <stop offset="70%" stop-color="#e11d2a"/>
          <stop offset="100%" stop-color="transparent"/>
        </radialGradient>

        <!-- Flame gradient for burn sequence -->
        <radialGradient id="flameGrad" cx="50%" cy="80%" r="80%">
          <stop offset="0%" stop-color="#ffffff"/>
          <stop offset="30%" stop-color="#ffe484"/>
          <stop offset="70%" stop-color="#ff5722"/>
          <stop offset="100%" stop-color="transparent"/>
        </radialGradient>

        <!-- Drop Shadow Filter -->
        <filter id="stickShadow" x="-20%" y="-20%" width="150%" height="150%">
          <feDropShadow dx="2" dy="5" stdDeviation="3" flood-color="#000000" flood-opacity="0.65"/>
        </filter>

        <!-- Glow Filter for Picked Stick -->
        <filter id="pickedGlow" x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="0" stdDeviation="6" flood-color="#ffb347" flood-opacity="0.85"/>
        </filter>

        <!-- Green Glow for Hint Target -->
        <filter id="targetGlow" x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="0" stdDeviation="6" flood-color="#4ade80" flood-opacity="0.9"/>
        </filter>
      </defs>
      <g id="boardScene"></g>
      <g id="fxLayer"></g>
    `;
    this.scene = this.svg.querySelector('#boardScene');
    this.fxLayer = this.svg.querySelector('#fxLayer');
  }

  render(state, options = {}) {
    const {
      picked = null,
      hint = null,
      dragCoord = null,
      burnedIndices = new Set(),
      charredIndices = new Set(),
    } = options;

    if (!state || state.length === 0) return;

    const totalW = state.length * TOKEN_W + (state.length - 1) * GAP;
    this.svg.setAttribute('viewBox', `-16 -16 ${totalW + 32} 144`);

    this.scene.innerHTML = '';
    this.fxLayer.innerHTML = '';

    // Render Tokens
    state.forEach((token, tokenIdx) => {
      const offsetX = tokenIdx * (TOKEN_W + GAP);
      const tokenG = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      tokenG.setAttribute('transform', `translate(${offsetX}, 0)`);
      tokenG.dataset.tokenIdx = tokenIdx;

      if (token.t === 'e') {
        // Equal Sign (Fixed matches)
        EQSEG.forEach(([x1, y1, x2, y2], idx) => {
          const key = `fixed-${idx}`;
          const isCharred = charredIndices.has(`e-${tokenIdx}-${key}`);
          this.drawStick(tokenG, [x1, y1, x2, y2], {
            isFixed: true,
            isCharred,
            key: `e-${tokenIdx}-${key}`,
          });
        });
        this.scene.appendChild(tokenG);
        return;
      }

      const geo = token.t === 'd' ? SEG : OPSEG;
      const slotKeys = slotsOf(token);

      slotKeys.forEach((k) => {
        const [x1, y1, x2, y2] = geo[k];
        const isFilled = has(token, k);
        const stickId = `${tokenIdx}-${k}`;
        const isPicked = picked && picked[0] === tokenIdx && picked[1] === k;
        const isHintFrom = hint && hint.from && hint.from[0] === tokenIdx && hint.from[1] === k;
        const isHintTo = hint && hint.to && hint.to[0] === tokenIdx && hint.to[1] === k;
        const isBurning = burnedIndices.has(stickId);
        const isCharred = charredIndices.has(stickId);

        if (isFilled) {
          if (isPicked && dragCoord) {
            // Render dragged stick at drag position on top
            this.drawDraggedStick([x1, y1, x2, y2], dragCoord);
          } else {
            this.drawStick(tokenG, [x1, y1, x2, y2], {
              stickId,
              tokenIdx,
              slotKey: k,
              isPicked,
              isHintFrom,
              isBurning,
              isCharred,
            });
          }
        } else if (picked || isHintTo) {
          // Empty slot (interactive drop target)
          this.drawSlot(tokenG, [x1, y1, x2, y2], {
            tokenIdx,
            slotKey: k,
            isHintTo,
          });
        }
      });

      this.scene.appendChild(tokenG);
    });

    // If hint is active, draw animated trajectory arc from source to target!
    if (hint && hint.from && hint.to) {
      this.drawHintTrajectory(state, hint);
    }
  }

  drawStick(parent, [x1, y1, x2, y2], opts) {
    const {
      stickId = '',
      tokenIdx,
      slotKey,
      isPicked = false,
      isHintFrom = false,
      isBurning = false,
      isCharred = false,
      isFixed = false,
    } = opts;

    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    g.setAttribute('class', `match-stick ${isPicked ? 'picked' : ''} ${isHintFrom ? 'hint-source' : ''} ${isBurning ? 'burning' : ''} ${isCharred ? 'charred' : ''}`);
    g.dataset.tokenIdx = tokenIdx;
    g.dataset.slotKey = slotKey;
    g.dataset.stickId = stickId;

    if (!isFixed) {
      g.setAttribute('filter', isPicked ? 'url(#pickedGlow)' : 'url(#stickShadow)');
    }

    // Wooden Body
    const body = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    body.setAttribute('x1', x1);
    body.setAttribute('y1', y1);
    body.setAttribute('x2', x2);
    body.setAttribute('y2', y2);
    body.setAttribute('stroke', isCharred ? 'url(#charredGrad)' : 'url(#woodGrad)');
    body.setAttribute('stroke-width', '7.5');
    body.setAttribute('stroke-linecap', 'round');
    g.appendChild(body);

    // Subtle Wood Grain lines
    if (!isCharred) {
      const mx = (x1 + x2) / 2;
      const my = (y1 + y2) / 2;
      const grain = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      grain.setAttribute('x1', (x1 + mx) / 2);
      grain.setAttribute('y1', (y1 + my) / 2);
      grain.setAttribute('x2', (x2 + mx) / 2);
      grain.setAttribute('y2', (y2 + my) / 2);
      grain.setAttribute('stroke', '#a8743a');
      grain.setAttribute('stroke-width', '1.8');
      grain.setAttribute('stroke-linecap', 'round');
      grain.setAttribute('opacity', '0.5');
      g.appendChild(grain);
    }

    // Sulfur Match Head
    const head = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse');
    head.setAttribute('cx', x1);
    head.setAttribute('cy', y1);
    head.setAttribute('rx', '6');
    head.setAttribute('ry', '6');
    head.setAttribute('fill', isCharred ? 'url(#ashGrad)' : 'url(#headGrad)');
    g.appendChild(head);

    // Specular Highlight
    if (!isCharred) {
      const spec = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse');
      spec.setAttribute('cx', x1 - 1.5);
      spec.setAttribute('cy', y1 - 1.5);
      spec.setAttribute('rx', '1.6');
      spec.setAttribute('ry', '1.3');
      spec.setAttribute('fill', '#ffffff');
      spec.setAttribute('opacity', '0.85');
      g.appendChild(spec);
    }

    // If burning, add active flame on head and rising smoke
    if (isBurning) {
      const flame = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse');
      flame.setAttribute('cx', x1);
      flame.setAttribute('cy', y1 - 7);
      flame.setAttribute('rx', '7');
      flame.setAttribute('ry', '12');
      flame.setAttribute('fill', 'url(#flameGrad)');
      flame.setAttribute('class', 'active-stick-flame');
      g.appendChild(flame);
    }

    // Large invisible hit target for effortless mobile touch
    if (!isFixed) {
      const hit = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      hit.setAttribute('x1', x1);
      hit.setAttribute('y1', y1);
      hit.setAttribute('x2', x2);
      hit.setAttribute('y2', y2);
      hit.setAttribute('stroke', 'transparent');
      hit.setAttribute('stroke-width', '32');
      hit.setAttribute('stroke-linecap', 'round');
      hit.setAttribute('class', 'stick-hit');
      g.appendChild(hit);
    }

    parent.appendChild(g);
  }

  drawSlot(parent, [x1, y1, x2, y2], opts) {
    const { tokenIdx, slotKey, isHintTo } = opts;

    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    g.setAttribute('class', `match-slot ${isHintTo ? 'hint-target' : ''}`);
    g.dataset.tokenIdx = tokenIdx;
    g.dataset.slotKey = slotKey;

    if (isHintTo) {
      g.setAttribute('filter', 'url(#targetGlow)');
    }

    // Slot ghost line
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', x1);
    line.setAttribute('y1', y1);
    line.setAttribute('x2', x2);
    line.setAttribute('y2', y2);
    line.setAttribute('stroke', isHintTo ? '#4ade80' : 'rgba(255, 122, 26, 0.45)');
    line.setAttribute('stroke-width', isHintTo ? '6' : '4');
    line.setAttribute('stroke-dasharray', isHintTo ? '3, 4' : '4, 6');
    line.setAttribute('stroke-linecap', 'round');
    line.setAttribute('class', 'slot-ghost');
    g.appendChild(line);

    // Invisible hit target
    const hit = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    hit.setAttribute('x1', x1);
    hit.setAttribute('y1', y1);
    hit.setAttribute('x2', x2);
    hit.setAttribute('y2', y2);
    hit.setAttribute('stroke', 'transparent');
    hit.setAttribute('stroke-width', '32');
    hit.setAttribute('class', 'slot-hit');
    g.appendChild(hit);

    parent.appendChild(g);
  }

  drawDraggedStick([x1, y1, x2, y2], coord) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const curX1 = coord.x - dx / 2;
    const curY1 = coord.y - dy / 2;
    const curX2 = coord.x + dx / 2;
    const curY2 = coord.y + dy / 2;

    this.drawStick(this.fxLayer, [curX1, curY1, curX2, curY2], {
      isPicked: true,
      isFixed: false,
    });
  }

  drawHintTrajectory(state, hint) {
    try {
      const fromToken = state[hint.from[0]];
      const toToken = state[hint.to[0]];
      const fromGeo = fromToken.t === 'd' ? SEG : OPSEG;
      const toGeo = toToken.t === 'd' ? SEG : OPSEG;

      const fCoords = fromGeo[hint.from[1]];
      const tCoords = toGeo[hint.to[1]];

      const fx = hint.from[0] * (TOKEN_W + GAP) + (fCoords[0] + fCoords[2]) / 2;
      const fy = (fCoords[1] + fCoords[3]) / 2;
      const tx = hint.to[0] * (TOKEN_W + GAP) + (tCoords[0] + tCoords[2]) / 2;
      const ty = (tCoords[1] + tCoords[3]) / 2;

      const midX = (fx + tx) / 2;
      const midY = Math.min(fy, ty) - 30; // arch upward

      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', `M ${fx} ${fy} Q ${midX} ${midY} ${tx} ${ty}`);
      path.setAttribute('fill', 'none');
      path.setAttribute('stroke', '#ffb347');
      path.setAttribute('stroke-width', '3');
      path.setAttribute('stroke-dasharray', '5, 5');
      path.setAttribute('class', 'hint-trajectory-path');

      this.fxLayer.appendChild(path);
    } catch (e) {}
  }
}
