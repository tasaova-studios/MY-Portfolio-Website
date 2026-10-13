import { useEffect } from "react";
import "./styles/FuturisticBoxTrace.css";

// Web Audio API Synthesizer for Silky Wind Whoosh Breeze Sound ("batas er so sobdo")
class WindWhooshSoundEngine {
  private ctx: AudioContext | null = null;
  private lastPlayTime = 0;

  public init() {
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume();
    }
  }

  public playWindWhoosh() {
    this.init();
    if (!this.ctx) return;

    const now = performance.now();
    // Throttle slightly (220ms) so rapid card transitions sound clean and majestic
    if (now - this.lastPlayTime < 220) return;
    this.lastPlayTime = now;

    try {
      const t = this.ctx.currentTime;
      const duration = 0.58;

      // 1. Organic Wind Air Buffer (Pink-filtered noise for smooth wind gust)
      const bufferSize = Math.floor(this.ctx.sampleRate * duration);
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      let b0 = 0,
        b1 = 0,
        b2 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555;
        b1 = 0.99332 * b1 + white * 0.075;
        b2 = 0.969 * b2 + white * 0.153;
        data[i] = (b0 + b1 + b2) * 0.38;
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      // 2. Resonant Bandpass Filter Sweeping with the Wind Gust ("sooo... whooosh")
      const filter = this.ctx.createBiquadFilter();
      filter.type = "bandpass";
      filter.frequency.setValueAtTime(280, t);
      filter.frequency.exponentialRampToValueAtTime(740, t + 0.24);
      filter.frequency.exponentialRampToValueAtTime(190, t + duration);
      filter.Q.value = 2.7;

      // 3. Luxurious Soft Wind Gain Envelope
      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.linearRampToValueAtTime(0.085, t + 0.19);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + duration);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      noise.start(t);
      noise.stop(t + duration);

      // 4. Ethereal High Shimmer Whispering Layer (Silky breeze air texture)
      const airNoise = this.ctx.createBufferSource();
      airNoise.buffer = buffer;
      const highFilter = this.ctx.createBiquadFilter();
      highFilter.type = "highpass";
      highFilter.frequency.setValueAtTime(1150, t);

      const highGain = this.ctx.createGain();
      highGain.gain.setValueAtTime(0.0001, t);
      highGain.gain.linearRampToValueAtTime(0.022, t + 0.2);
      highGain.gain.exponentialRampToValueAtTime(0.0001, t + duration);

      airNoise.connect(highFilter);
      highFilter.connect(highGain);
      highGain.connect(this.ctx.destination);

      airNoise.start(t);
      airNoise.stop(t + duration);
    } catch {}
  }
}

const windAudio = new WindWhooshSoundEngine();

const TARGET_BOX_SELECTORS = [
  ".what-content",
  ".perk-card",
  ".perks-banner",
  ".contact-box",
  ".skills-balls-wrapper",
];

const FuturisticBoxTrace = () => {
  useEffect(() => {
    const cleanupFns: (() => void)[] = [];

    const setupCards = () => {
      const cards = document.querySelectorAll<HTMLElement>(
        TARGET_BOX_SELECTORS.join(", ")
      );

      cards.forEach((card) => {
        if (card.querySelector(".neon-trace-svg-overlay")) return;

        const computedStyle = window.getComputedStyle(card);
        const radiusVal = parseFloat(computedStyle.borderRadius) || 18;

        const svg = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "svg"
        );
        svg.setAttribute("class", "neon-trace-svg-overlay");
        svg.setAttribute("width", "100%");
        svg.setAttribute("height", "100%");

        const rect = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "rect"
        );
        rect.setAttribute("class", "neon-trace-rect");
        rect.setAttribute("x", "1");
        rect.setAttribute("y", "1");
        rect.setAttribute("width", "calc(100% - 2px)");
        rect.setAttribute("height", "calc(100% - 2px)");
        rect.setAttribute("rx", `${radiusVal}`);
        rect.setAttribute("ry", `${radiusVal}`);
        rect.setAttribute("pathLength", "100");

        svg.appendChild(rect);
        card.appendChild(svg);

        let timeoutId: ReturnType<typeof setTimeout> | null = null;
        let lastTriggerTime = 0;

        const triggerTrace = () => {
          const now = performance.now();
          if (now - lastTriggerTime < 750) return;
          lastTriggerTime = now;

          windAudio.playWindWhoosh();

          card.classList.remove("neon-trace-running");
          requestAnimationFrame(() => {
            card.classList.add("neon-trace-running");
          });

          if (timeoutId) clearTimeout(timeoutId);
          timeoutId = setTimeout(() => {
            card.classList.remove("neon-trace-running");
          }, 980);
        };

        card.addEventListener("pointerenter", triggerTrace);
        card.addEventListener("touchstart", triggerTrace, { passive: true });

        cleanupFns.push(() => {
          if (timeoutId) clearTimeout(timeoutId);
          card.removeEventListener("pointerenter", triggerTrace);
          card.removeEventListener("touchstart", triggerTrace);
        });
      });
    };

    setupCards();
    const timer = setTimeout(setupCards, 800);

    return () => {
      clearTimeout(timer);
      cleanupFns.forEach((fn) => fn());
    };
  }, []);

  return (
    <svg width="0" height="0" style={{ position: "absolute", pointerEvents: "none" }}>
      <defs>
        {/* Neon Laser Loading Gradient */}
        <linearGradient
          id="neon-trace-laser-gradient"
          x1="0%"
          y1="0%"
          x2="100%"
          y2="100%"
        >
          <stop offset="0%" stopColor="rgba(194, 164, 255, 0)" />
          <stop offset="35%" stopColor="#a855f7" />
          <stop offset="70%" stopColor="#38bdf8" />
          <stop offset="100%" stopColor="#ffffff" />
        </linearGradient>
      </defs>
    </svg>
  );
};

export default FuturisticBoxTrace;
