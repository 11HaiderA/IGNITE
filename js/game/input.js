// Pointer interaction handler supporting drag & drop and tap-to-place

export class InputHandler {
  constructor(svgElement, callbacks = {}) {
    this.svg = svgElement;
    this.callbacks = callbacks; // { onPick, onDrop, onCancel, onShake }

    this.isDragging = false;
    this.draggedStick = null; // [tokenIdx, slotKey]
    this.pointerId = null;

    this.bindEvents();
  }

  bindEvents() {
    this.svg.addEventListener('pointerdown', this.onPointerDown.bind(this));
    window.addEventListener('pointermove', this.onPointerMove.bind(this));
    window.addEventListener('pointerup', this.onPointerUp.bind(this));
    window.addEventListener('pointercancel', this.onPointerCancel.bind(this));
  }

  getSvgPoint(e) {
    const pt = this.svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    return pt.matrixTransform(this.svg.getScreenCTM().inverse());
  }

  onPointerDown(e) {
    if (this.callbacks.isLocked && this.callbacks.isLocked()) return;

    // Check if clicked stick or slot
    const stickEl = e.target.closest('.match-stick');
    const slotEl = e.target.closest('.match-slot');

    if (stickEl && !stickEl.classList.contains('fixed')) {
      const tokenIdx = parseInt(stickEl.dataset.tokenIdx, 10);
      const slotKey = stickEl.dataset.slotKey;

      if (this.callbacks.picked) {
        const curPicked = this.callbacks.getPicked();
        if (curPicked && curPicked[0] === tokenIdx && curPicked[1] === slotKey) {
          // Tapped same stick: cancel
          this.callbacks.onCancel?.();
          return;
        }
      }

      this.isDragging = true;
      this.draggedStick = [tokenIdx, slotKey];
      this.pointerId = e.pointerId;

      const svgPt = this.getSvgPoint(e);
      this.callbacks.onPick?.(tokenIdx, slotKey, svgPt);
    } else if (slotEl) {
      const tokenIdx = parseInt(slotEl.dataset.tokenIdx, 10);
      const slotKey = slotEl.dataset.slotKey;
      this.callbacks.onDropSlot?.(tokenIdx, slotKey);
    }
  }

  onPointerMove(e) {
    if (!this.isDragging || e.pointerId !== this.pointerId) return;
    const svgPt = this.getSvgPoint(e);
    this.callbacks.onDragMove?.(svgPt);
  }

  onPointerUp(e) {
    if (!this.isDragging || e.pointerId !== this.pointerId) return;
    this.isDragging = false;
    this.pointerId = null;

    // Find if released near a valid empty slot
    const targetEl = document.elementFromPoint(e.clientX, e.clientY);
    const slotEl = targetEl ? targetEl.closest('.match-slot') : null;

    if (slotEl) {
      const tokenIdx = parseInt(slotEl.dataset.tokenIdx, 10);
      const slotKey = slotEl.dataset.slotKey;
      this.callbacks.onDropSlot?.(tokenIdx, slotKey);
    } else {
      this.callbacks.onDragEnd?.();
    }
  }

  onPointerCancel() {
    if (this.isDragging) {
      this.isDragging = false;
      this.pointerId = null;
      this.callbacks.onDragEnd?.();
    }
  }
}
