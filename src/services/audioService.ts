// Audio Service with Web Audio API Analyser & Beat Detection

export interface AudioMetrics {
  bass: number;       // 0 to 1 (sub-bass / kick 20Hz - 140Hz)
  mid: number;        // 0 to 1 (snare / synth 200Hz - 2000Hz)
  high: number;       // 0 to 1 (sparkles / hats 2000Hz - 12000Hz)
  overall: number;    // 0 to 1 (normalized total energy)
  isBeat: boolean;    // true on instantaneous kick drum hit
  beatCount: number;  // monotonic beat counter
}

type AudioListener = (metrics: AudioMetrics) => void;

class AudioService {
  private audio: HTMLAudioElement | null = null;
  private audioCtx: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private sourceNode: MediaElementAudioSourceNode | null = null;
  private dataArray: Uint8Array | null = null;

  private isInitialized = false;
  private isPlaying = false;
  private volume = 0.75;
  private isMuted = false;
  private trackName = "Indila — Love Story (Instrumental)";
  private customTrackActive = false;

  private listeners: Set<AudioListener> = new Set();
  private animFrameId: number | null = null;

  // Beat detection state
  private beatCutoff = 0;
  private beatDecayRate = 0.96;
  private beatHold = 0;
  private beatCount = 0;

  // Smoothed metrics for animations
  private metrics: AudioMetrics = {
    bass: 0,
    mid: 0,
    high: 0,
    overall: 0,
    isBeat: false,
    beatCount: 0,
  };

  constructor() {
    // Lazy initialize on first interaction or programmatic trigger
  }

  private init() {
    if (this.isInitialized) return;
    try {
      this.audio = new Audio("/audio/bgm.mp3");
      this.audio.loop = true;
      this.audio.crossOrigin = "anonymous";
      this.audio.preload = "auto";
      this.audio.volume = this.volume;

      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        this.audioCtx = new AudioContextClass();
        this.analyser = this.audioCtx.createAnalyser();
        this.analyser.fftSize = 256;
        this.analyser.smoothingTimeConstant = 0.75;

        this.sourceNode = this.audioCtx.createMediaElementSource(this.audio);
        this.sourceNode.connect(this.analyser);
        this.analyser.connect(this.audioCtx.destination);

        this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);
      }

      this.audio.addEventListener("play", () => {
        this.isPlaying = true;
        this.startAnalysisLoop();
      });

      this.audio.addEventListener("pause", () => {
        this.isPlaying = false;
      });

      this.isInitialized = true;
    } catch (e) {
      console.warn("AudioService init error:", e);
    }
  }

  private startAnalysisLoop() {
    if (this.animFrameId) return;

    const update = () => {
      this.analyzeFrame();
      this.animFrameId = requestAnimationFrame(update);
    };

    this.animFrameId = requestAnimationFrame(update);
  }

  private analyzeFrame() {
    if (!this.analyser || !this.dataArray || !this.isPlaying || this.isMuted) {
      // Smooth decay to zero when paused or muted
      this.metrics.bass *= 0.85;
      this.metrics.mid *= 0.85;
      this.metrics.high *= 0.85;
      this.metrics.overall *= 0.85;
      this.metrics.isBeat = false;
      this.notifyListeners();

      if (this.metrics.overall < 0.005) {
        this.metrics.bass = 0;
        this.metrics.mid = 0;
        this.metrics.high = 0;
        this.metrics.overall = 0;
        if (this.animFrameId) {
          cancelAnimationFrame(this.animFrameId);
          this.animFrameId = null;
        }
      }
      return;
    }

    // Read frequency data
    // Cast to any to satisfy TS compiler across various lib dom typings
    (this.analyser as any).getByteFrequencyData(this.dataArray);

    const length = this.dataArray.length;

    // 1. Bass (bins 1 to 6 ~ 40Hz to 150Hz)
    let rawBass = 0;
    const bassBins = Math.min(7, length);
    for (let i = 1; i < bassBins; i++) {
      rawBass += this.dataArray[i];
    }
    const currentBass = bassBins > 1 ? rawBass / ((bassBins - 1) * 255) : 0;

    // 2. Mid (bins 7 to 28 ~ 200Hz to 1500Hz)
    let rawMid = 0;
    const midBins = Math.min(28, length);
    for (let i = bassBins; i < midBins; i++) {
      rawMid += this.dataArray[i];
    }
    const currentMid = midBins > bassBins ? rawMid / ((midBins - bassBins) * 255) : 0;

    // 3. High (bins 29 to 70 ~ 1500Hz to 6000Hz)
    let rawHigh = 0;
    const highBins = Math.min(70, length);
    for (let i = midBins; i < highBins; i++) {
      rawHigh += this.dataArray[i];
    }
    const currentHigh = highBins > midBins ? rawHigh / ((highBins - midBins) * 255) : 0;

    // 4. Overall energy
    const currentOverall = (currentBass * 0.5 + currentMid * 0.35 + currentHigh * 0.15);

    // 5. Dynamic Beat Detection on Bass
    let isBeat = false;
    if (currentBass > this.beatCutoff && currentBass > 0.32) {
      if (this.beatHold <= 0) {
        isBeat = true;
        this.beatCount++;
        this.beatCutoff = currentBass * 1.15;
        this.beatHold = 10; // frames hold (~160ms lockout)
      }
    } else {
      this.beatCutoff *= this.beatDecayRate;
      this.beatCutoff = Math.max(this.beatCutoff, 0.28);
    }

    if (this.beatHold > 0) {
      this.beatHold--;
    }

    // Lerp smoothing for visuals
    this.metrics.bass = this.metrics.bass * 0.3 + currentBass * 0.7;
    this.metrics.mid = this.metrics.mid * 0.4 + currentMid * 0.6;
    this.metrics.high = this.metrics.high * 0.4 + currentHigh * 0.6;
    this.metrics.overall = this.metrics.overall * 0.35 + currentOverall * 0.65;
    this.metrics.isBeat = isBeat;
    this.metrics.beatCount = this.beatCount;

    // Publish to document root CSS variables for instant style reactivity
    if (typeof document !== "undefined") {
      const root = document.documentElement;
      root.style.setProperty("--beat-bass", this.metrics.bass.toFixed(3));
      root.style.setProperty("--beat-mid", this.metrics.mid.toFixed(3));
      root.style.setProperty("--beat-high", this.metrics.high.toFixed(3));
      root.style.setProperty("--beat-energy", this.metrics.overall.toFixed(3));
    }

    this.notifyListeners();
  }

  private notifyListeners() {
    this.listeners.forEach((cb) => cb(this.metrics));
  }

  // Start music (e.g. when loading finishes)
  public async play(): Promise<boolean> {
    this.init();
    if (!this.audio) return false;

    if (this.audioCtx && this.audioCtx.state === "suspended") {
      try {
        await this.audioCtx.resume();
      } catch (e) {
        // May require user interaction
      }
    }

    try {
      await this.audio.play();
      this.isPlaying = true;
      return true;
    } catch (err) {
      // Autoplay policy prevented playback
      this.isPlaying = false;
      this.setupAutoplayUnlock();
      return false;
    }
  }

  public pause() {
    if (this.audio) {
      this.audio.pause();
      this.isPlaying = false;
    }
  }

  public toggle(): Promise<boolean> | void {
    if (this.isPlaying) {
      this.pause();
      return;
    }
    return this.play();
  }

  public setVolume(val: number) {
    this.volume = Math.max(0, Math.min(1, val));
    if (this.audio) {
      this.audio.volume = this.isMuted ? 0 : this.volume;
    }
  }

  public toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.audio) {
      this.audio.volume = this.isMuted ? 0 : this.volume;
    }
    if (!this.isMuted && this.isPlaying) {
      this.startAnalysisLoop();
    }
    return this.isMuted;
  }

  // Load a user-provided audio file
  public async loadCustomAudioFile(file: File): Promise<boolean> {
    this.init();
    if (!this.audio) return false;

    const url = URL.createObjectURL(file);
    const wasPlaying = this.isPlaying;

    this.audio.pause();
    this.audio.src = url;
    this.trackName = file.name.replace(/\.[^/.]+$/, "");
    this.customTrackActive = true;

    if (this.audioCtx && this.audioCtx.state === "suspended") {
      await this.audioCtx.resume();
    }

    try {
      await this.audio.play();
      this.isPlaying = true;
      return true;
    } catch (e) {
      if (wasPlaying) {
        this.setupAutoplayUnlock();
      }
      return false;
    }
  }

  // Seamless unlock on first pointer interaction if browser blocked autoplay
  private setupAutoplayUnlock() {
    const unlock = () => {
      if (this.audio && !this.isPlaying) {
        if (this.audioCtx && this.audioCtx.state === "suspended") {
          this.audioCtx.resume();
        }
        this.audio.play().then(() => {
          this.isPlaying = true;
        }).catch(() => {});
      }
      cleanup();
    };

    const cleanup = () => {
      window.removeEventListener("click", unlock);
      window.removeEventListener("touchstart", unlock);
      window.removeEventListener("keydown", unlock);
      window.removeEventListener("scroll", unlock);
    };

    window.addEventListener("click", unlock, { once: true, passive: true });
    window.addEventListener("touchstart", unlock, { once: true, passive: true });
    window.addEventListener("keydown", unlock, { once: true, passive: true });
    window.addEventListener("scroll", unlock, { once: true, passive: true });
  }

  public subscribe(listener: AudioListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  public getMetrics(): AudioMetrics {
    return this.metrics;
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  public getVolume(): number {
    return this.volume;
  }

  public getTrackName(): string {
    return this.trackName;
  }

  public isCustomTrack(): boolean {
    return this.customTrackActive;
  }
}

export const audioService = new AudioService();
