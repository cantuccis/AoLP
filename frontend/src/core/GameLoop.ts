/**
 * Fixed-timestep game loop with decoupled render
 * Updates at fixed 60Hz regardless of render FPS
 */
export class GameLoop {
  private isRunning = false;
  private lastTime = 0;
  private accumulator = 0;
  private readonly fixedDeltaTime = 1000 / 60; // 60Hz in milliseconds

  private updateCallback: (deltaTime: number) => void;
  private renderCallback: (alpha: number) => void;

  constructor(
    updateCallback: (deltaTime: number) => void,
    renderCallback: (alpha: number) => void
  ) {
    this.updateCallback = updateCallback;
    this.renderCallback = renderCallback;
  }

  start(): void {
    if (this.isRunning) return;
    this.isRunning = true;
    this.lastTime = performance.now();
    this.loop(this.lastTime);
  }

  stop(): void {
    this.isRunning = false;
  }

  private loop = (currentTime: number): void => {
    if (!this.isRunning) return;

    requestAnimationFrame(this.loop);

    const deltaTime = currentTime - this.lastTime;
    this.lastTime = currentTime;

    // Accumulate frame time
    this.accumulator += deltaTime;

    // Fixed timestep updates
    let updateCount = 0;
    while (this.accumulator >= this.fixedDeltaTime) {
      this.updateCallback(this.fixedDeltaTime / 1000); // Convert to seconds
      this.accumulator -= this.fixedDeltaTime;
      updateCount++;

      // Prevent spiral of death
      if (updateCount > 5) {
        this.accumulator = 0;
        break;
      }
    }

    // Calculate interpolation alpha for smooth rendering
    const alpha = this.accumulator / this.fixedDeltaTime;
    this.renderCallback(alpha);
  };
}

