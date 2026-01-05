class SoundService {
  private ctx: AudioContext | null = null;

  private init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  }

  private playTone(freq: number, type: OscillatorType, duration: number, volume: number = 0.1, slideTo?: number) {
    this.init();
    if (!this.ctx || this.ctx.state === 'suspended') {
        this.ctx?.resume();
    }
    const osc = this.ctx!.createOscillator();
    const gain = this.ctx!.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, this.ctx!.currentTime);
    if (slideTo) {
      osc.frequency.exponentialRampToValueAtTime(slideTo, this.ctx!.currentTime + duration);
    }
    
    gain.gain.setValueAtTime(volume, this.ctx!.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx!.currentTime + duration);

    osc.connect(gain);
    gain.connect(this.ctx!.destination);

    osc.start();
    osc.stop(this.ctx!.currentTime + duration);
  }

  playHover() { this.playTone(800, 'sine', 0.05, 0.02); }
  playClick() { this.playTone(400, 'square', 0.1, 0.05); }
  playRoll() { this.playTone(150, 'sawtooth', 0.5, 0.05, 50); }
  playCollision() { this.playTone(1200, 'triangle', 0.03, 0.03); }
  playWhirr(duration: number) { this.playTone(100, 'sine', duration, 0.05, 300); }
  playWin() {
    const now = this.ctx?.currentTime || 0;
    [523.25, 659.25, 783.99, 1046.50].forEach((f, i) => {
      setTimeout(() => this.playTone(f, 'sine', 0.6, 0.1), i * 100);
    });
  }
  playLose() {
    this.playTone(150, 'sawtooth', 0.4, 0.1);
    this.playTone(100, 'sawtooth', 0.6, 0.1);
  }
  playDeal() { this.playTone(600, 'triangle', 0.1, 0.05); }
}

export const sounds = new SoundService();