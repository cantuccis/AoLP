/**
 * Keyboard controls for debugging
 */
export class KeyboardControls {
  private keyStates: Map<string, boolean> = new Map();
  private callbacks: Map<string, () => void> = new Map();

  constructor() {
    window.addEventListener('keydown', this.onKeyDown.bind(this));
    window.addEventListener('keyup', this.onKeyUp.bind(this));
  }

  private onKeyDown(event: KeyboardEvent): void {
    if (this.keyStates.get(event.key)) return; // Already pressed
    
    this.keyStates.set(event.key, true);
    
    const callback = this.callbacks.get(event.key);
    if (callback) {
      callback();
    }
  }

  private onKeyUp(event: KeyboardEvent): void {
    this.keyStates.set(event.key, false);
  }

  registerKey(key: string, callback: () => void): void {
    this.callbacks.set(key, callback);
  }

  isKeyPressed(key: string): boolean {
    return this.keyStates.get(key) || false;
  }

  dispose(): void {
    window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('keyup', this.onKeyUp);
  }
}

