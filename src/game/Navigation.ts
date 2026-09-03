// ============================================================================
// SMOKE IT UP - OVERLAY & NAVIGATION MANAGER
// Stack-based overlay navigation supporting Escape key & Android Back button.
// ============================================================================

export type OverlayId =
  | 'shop'
  | 'levels'
  | 'settings'
  | 'achievements'
  | 'cloud'
  | 'help'
  | 'confirm';

export class NavigationManager {
  private stack: OverlayId[] = [];
  private listeners: Array<(stack: OverlayId[]) => void> = [];

  constructor() {
    this.handleKeyDown = this.handleKeyDown.bind(this);
  }

  getStack(): OverlayId[] {
    return [...this.stack];
  }

  getTop(): OverlayId | null {
    return this.stack.length > 0 ? this.stack[this.stack.length - 1] : null;
  }

  has(id: OverlayId): boolean {
    return this.stack.includes(id);
  }

  push(id: OverlayId): void {
    if (this.stack.includes(id)) {
      // Move to top of stack if already present
      this.stack = this.stack.filter((item) => item !== id);
    }
    this.stack.push(id);
    this.notify();
  }

  pop(): OverlayId | null {
    if (this.stack.length === 0) return null;
    const popped = this.stack.pop() ?? null;
    this.notify();
    return popped;
  }

  close(id: OverlayId): void {
    if (!this.stack.includes(id)) return;
    this.stack = this.stack.filter((item) => item !== id);
    this.notify();
  }

  clear(): void {
    if (this.stack.length === 0) return;
    this.stack = [];
    this.notify();
  }

  /**
   * Universal back button handler (for Android hardware back button and Escape key).
   * Returns true if an overlay was closed, or false if at root level.
   */
  handleBackButton(): boolean {
    if (this.stack.length > 0) {
      this.pop();
      return true;
    }
    return false;
  }

  subscribe(listener: (stack: OverlayId[]) => void): () => void {
    this.listeners.push(listener);
    listener(this.getStack());
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notify(): void {
    const current = this.getStack();
    for (const listener of this.listeners) {
      listener(current);
    }
  }

  private handleKeyDown(e: KeyboardEvent): void {
    if (e.key === 'Escape') {
      if (this.handleBackButton()) {
        e.preventDefault();
        e.stopPropagation();
      }
    }
  }

  attachKeyboardListener(): () => void {
    window.addEventListener('keydown', this.handleKeyDown);
    return () => window.removeEventListener('keydown', this.handleKeyDown);
  }
}
