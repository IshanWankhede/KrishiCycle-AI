// Shared pointer tracker to prevent redundant window pointer listeners across multiple specular cards

type PointerListener = (x: number, y: number, known: boolean) => void;

class GlobalPointerTracker {
  public x = 0;
  public y = 0;
  public known = false;
  private listeners = new Set<PointerListener>();
  private initialized = false;

  private onPointerMove = (e: PointerEvent) => {
    this.x = e.clientX;
    this.y = e.clientY;
    this.known = true;
    this.notify();
  };

  private onPointerEnd = (e: PointerEvent) => {
    if (e.pointerType === 'mouse') return;
    this.known = false;
    this.notify();
  };

  private onPointerLeave = () => {
    this.known = false;
    this.notify();
  };

  private notify() {
    for (const listener of this.listeners) {
      listener(this.x, this.y, this.known);
    }
  }

  public subscribe(listener: PointerListener) {
    this.listeners.add(listener);
    if (!this.initialized && typeof window !== 'undefined') {
      window.addEventListener('pointermove', this.onPointerMove, { passive: true });
      window.addEventListener('pointerup', this.onPointerEnd, { passive: true });
      window.addEventListener('pointercancel', this.onPointerEnd, { passive: true });
      document.documentElement.addEventListener('pointerleave', this.onPointerLeave);
      this.initialized = true;
    }

    return () => {
      this.listeners.delete(listener);
      if (this.listeners.size === 0 && this.initialized && typeof window !== 'undefined') {
        window.removeEventListener('pointermove', this.onPointerMove);
        window.removeEventListener('pointerup', this.onPointerEnd);
        window.removeEventListener('pointercancel', this.onPointerEnd);
        document.documentElement.removeEventListener('pointerleave', this.onPointerLeave);
        this.initialized = false;
      }
    };
  }
}

export const globalPointerTracker = new GlobalPointerTracker();
