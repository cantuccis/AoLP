/**
 * Simple FPS and performance stats display
 */
export class Stats {
  private container: HTMLDivElement;
  private fpsText: HTMLDivElement;
  private msText: HTMLDivElement;
  
  private frames = 0;
  private lastTime = performance.now();
  private lastFpsUpdate = performance.now();

  constructor() {
    this.container = document.createElement('div');
    this.container.style.cssText = `
      position: fixed;
      top: 10px;
      left: 10px;
      padding: 8px 12px;
      background: rgba(0, 0, 0, 0.7);
      color: #0f0;
      font-family: monospace;
      font-size: 12px;
      border-radius: 4px;
      z-index: 10000;
      pointer-events: none;
    `;

    this.fpsText = document.createElement('div');
    this.fpsText.textContent = 'FPS: 60';
    
    this.msText = document.createElement('div');
    this.msText.textContent = 'MS: 16.67';

    this.container.appendChild(this.fpsText);
    this.container.appendChild(this.msText);

    const statsElement = document.getElementById('stats');
    if (statsElement) {
      statsElement.appendChild(this.container);
    }
  }

  update(): void {
    this.frames++;
    const currentTime = performance.now();
    const deltaTime = currentTime - this.lastTime;
    this.lastTime = currentTime;

    // Update FPS every 500ms
    if (currentTime >= this.lastFpsUpdate + 500) {
      const fps = Math.round((this.frames * 1000) / (currentTime - this.lastFpsUpdate));
      this.fpsText.textContent = `FPS: ${fps}`;
      this.frames = 0;
      this.lastFpsUpdate = currentTime;
    }

    this.msText.textContent = `MS: ${deltaTime.toFixed(2)}`;
  }

  show(): void {
    this.container.style.display = 'block';
  }

  hide(): void {
    this.container.style.display = 'none';
  }
}

