import { useEffect, useRef } from "react";
import { audioService } from "../services/audioService";
import "./styles/ButterflyFlight.css";

interface ButterflyInstance {
  id: number;
  startX: number;
  startY: number;
  x: number;
  y: number;
  pushVx: number;
  pushVy: number;
  progress: number;
  speed: number;
  flapPhase: number;
  flapSpeed: number;
  bankTilt: number;
  scale: number;
  opacity: number;
  blur: number;
  active: boolean;
  driftPhase: number;
  zone: number;
  themeIdx: number;
}

interface StarParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  color: string;
  isStar: boolean;
  isMist: boolean;
  rotation: number;
  rotSpeed: number;
}

const FAIRY_COLORS = [
  "#ffd700", // Vibrant Starlight Gold
  "#38bdf8", // Electric Bioluminescent Cyan
  "#f472b6", // Cosmic Lotus Pink
  "#c084fc", // Radiant Violet
  "#34d399", // Emerald Aurora
  "#ffffff", // Pure Diamond White
];

const WING_THEMES = [
  {
    gradId: "wing-violet",
    topColor: "#c084fc",
    midColor: "#7e22ce",
    bottomColor: "#38bdf8",
  },
  {
    gradId: "wing-cyan",
    topColor: "#38bdf8",
    midColor: "#0284c7",
    bottomColor: "#34d399",
  },
  {
    gradId: "wing-pink",
    topColor: "#f472b6",
    midColor: "#db2777",
    bottomColor: "#ffd700",
  },
];

const TOTAL_BUTTERFLIES = 3;

const ButterflyFlight = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const unitRefs = useRef<(HTMLDivElement | null)[]>([]);
  const leftWingRefs = useRef<(HTMLDivElement | null)[]>([]);
  const rightWingRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const onResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", onResize);

    // Track scroll
    let scrollY = window.scrollY || 0;
    const onScroll = () => {
      scrollY = window.scrollY || document.documentElement.scrollTop || 0;
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    // Interactive mouse / touch tracking for collision & evasion
    const pointer = {
      x: -2000,
      y: -2000,
      prevX: -2000,
      prevY: -2000,
      vx: 0,
      vy: 0,
    };

    const updatePointer = (clientX: number, clientY: number) => {
      pointer.vx = (clientX - pointer.prevX) * 0.6;
      pointer.vy = (clientY - pointer.prevY) * 0.6;
      pointer.prevX = pointer.x;
      pointer.prevY = pointer.y;
      pointer.x = clientX;
      pointer.y = clientY;
    };

    const onMouseMove = (e: MouseEvent) => updatePointer(e.clientX, e.clientY);
    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        updatePointer(e.touches[0].clientX, e.touches[0].clientY);
      }
    };
    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        pointer.prevX = e.touches[0].clientX;
        pointer.prevY = e.touches[0].clientY;
        updatePointer(e.touches[0].clientX, e.touches[0].clientY);
      }
    };

    window.addEventListener("mousemove", onMouseMove, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("touchstart", onTouchStart, { passive: true });

    // Floating colorful fairy stars & mist particles
    const particles: StarParticle[] = [];

    // 3 concurrent butterflies spanning left, center, right across the FULL PAGE WIDTH
    const butterflies: ButterflyInstance[] = Array.from({ length: TOTAL_BUTTERFLIES }, (_, i) => ({
      id: i,
      startX: 0,
      startY: 0,
      x: 0,
      y: 0,
      pushVx: 0,
      pushVy: 0,
      progress: 1, // ready to spawn
      speed: 0.0028 + i * 0.0003,
      flapPhase: i * 1.6,
      flapSpeed: 0.14,
      bankTilt: 0,
      scale: 1,
      opacity: 0,
      blur: 0,
      active: false,
      driftPhase: Math.random() * Math.PI * 2,
      zone: i,
      themeIdx: i % WING_THEMES.length,
    }));

    let spawnTimer = 0;

    // Spawn across the ENTIRE PAGE WIDTH (Left, Center, Right)
    const spawnButterfly = (b: ButterflyInstance) => {
      const isMobile = width < 768;

      const zoneWidth = width / 3;
      const zoneMinX = b.zone * zoneWidth + (isMobile ? 35 : 65);
      const zoneMaxX = (b.zone + 1) * zoneWidth - (isMobile ? 35 : 65);

      const startX = Math.max(
        isMobile ? 40 : 75,
        Math.min(width - (isMobile ? 40 : 75), zoneMinX + Math.random() * (zoneMaxX - zoneMinX))
      );
      const startY = -70;

      b.startX = startX;
      b.startY = startY;
      b.x = startX;
      b.y = startY;
      b.pushVx = 0;
      b.pushVy = 0;
      b.progress = 0;
      b.speed = isMobile ? 0.0033 : 0.0028; // slow and majestic
      b.flapPhase = Math.random() * Math.PI * 2;
      b.scale = isMobile ? 0.88 : 1.0;
      b.opacity = 0;
      b.blur = 0;
      b.bankTilt = 0;
      b.active = true;
      b.driftPhase = Math.random() * Math.PI * 2;
      b.themeIdx = Math.floor(Math.random() * WING_THEMES.length);
    };

    let animId: number;
    let time = 0;

    const loop = () => {
      animId = requestAnimationFrame(loop);
      time += 0.02;

      pointer.vx *= 0.85;
      pointer.vy *= 0.85;

      spawnTimer++;
      if (!butterflies[0].active) {
        spawnButterfly(butterflies[0]);
      }
      if (!butterflies[1].active && butterflies[0].progress > 0.35 && spawnTimer > 80) {
        spawnButterfly(butterflies[1]);
      }
      if (!butterflies[2].active && butterflies[1].progress > 0.4 && spawnTimer > 160) {
        spawnButterfly(butterflies[2]);
        spawnTimer = 0;
      }

      ctx.clearRect(0, 0, width, height);

      // Render & update stardust particles
      for (let s = particles.length - 1; s >= 0; s--) {
        const p = particles[s];
        p.x += p.vx;
        p.y += p.vy;
        p.rotation += p.rotSpeed;

        if (p.isMist) {
          p.size += 0.4;
          p.alpha -= 0.012;
          p.vx += 0.08;
        } else {
          p.vy *= 0.96;
          p.vx *= 0.96;
          p.alpha -= 0.015;
        }

        if (p.alpha <= 0) {
          particles.splice(s, 1);
          continue;
        }

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.globalAlpha = Math.max(0, p.alpha);

        if (p.isStar) {
          ctx.fillStyle = p.color;

          const r = p.size;
          ctx.beginPath();
          ctx.moveTo(0, -r * 1.6);
          ctx.quadraticCurveTo(0, 0, r * 1.6, 0);
          ctx.quadraticCurveTo(0, 0, 0, r * 1.6);
          ctx.quadraticCurveTo(0, 0, -r * 1.6, 0);
          ctx.quadraticCurveTo(0, 0, 0, -r * 1.6);
          ctx.fill();
        } else {
          ctx.beginPath();
          ctx.arc(0, 0, p.size, 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.fill();
        }

        ctx.restore();
      }

      // Read audio metrics once per frame
      const audioMetrics = audioService.getMetrics();
      const audioBass = audioMetrics.bass;

      // Update butterfly instances
      for (let i = 0; i < TOTAL_BUTTERFLIES; i++) {
        const b = butterflies[i];
        const el = unitRefs.current[i];
        const leftWing = leftWingRefs.current[i];
        const rightWing = rightWingRefs.current[i];

        if (!el) continue;

        if (!b.active) {
          el.style.opacity = "0";
          continue;
        }

        // Advance progress slowly with audio rhythm
        b.progress += b.speed;
        b.flapPhase += b.flapSpeed * (1 + audioBass * 0.35);

        // Wing 3D flapping angle
        const wingFlapAngle = Math.sin(b.flapPhase) * 48; // expressive 3D wing flap

        // Flight paths
        const isMobile = width < 768;
        const targetY = b.startY + b.progress * (height * 0.88);
        const sway = Math.sin(time * 1.4 + b.driftPhase) * (isMobile ? 22 : 38);

        // Interactive mouse dodge & evasion - smaller hit radius
        const distToMouse = Math.hypot(b.x - pointer.x, b.y - pointer.y);
        const hitRadius = isMobile ? 55 : 75;

        if (distToMouse < hitRadius && distToMouse > 0) {
          const proximity = Math.pow(1 - distToMouse / hitRadius, 1.3);
          const nx = (b.x - pointer.x) / distToMouse;
          const ny = (b.y - pointer.y) / distToMouse;

          const pushStrength = 6;
          b.pushVx += nx * proximity * pushStrength + pointer.vx * 0.4;
          b.pushVy += ny * proximity * pushStrength + pointer.vy * 0.4;

          b.flapPhase += 0.35;
          b.bankTilt += nx * proximity * 30;

          // Spray delicate colorful stars in the dodge direction
          for (let k = 0; k < 2; k++) {
            const isStarShape = Math.random() < 0.6;
            const chosenColor = FAIRY_COLORS[Math.floor(Math.random() * FAIRY_COLORS.length)];
            particles.push({
              x: b.x + (Math.random() - 0.5) * 8,
              y: b.y - 6,
              vx: nx * (1.8 + Math.random() * 3) + (Math.random() - 0.5) * 1.5,
              vy: ny * (1.8 + Math.random() * 3) - (1 + Math.random() * 1.8),
              size: isStarShape ? 2.0 + Math.random() * 1.6 : 1.3 + Math.random() * 1.3,
              alpha: 1,
              color: chosenColor,
              isStar: isStarShape,
              isMist: false,
              rotation: Math.random() * Math.PI * 2,
              rotSpeed: (Math.random() - 0.5) * 0.15,
            });
          }
        }

        b.pushVx *= 0.93;
        b.pushVy *= 0.93;
        b.bankTilt *= 0.92;

        b.x = b.startX + sway + b.pushVx * 4;
        b.y = targetY + b.pushVy * 4;

        // Viewport boundaries
        const marginX = isMobile ? 30 : 50;
        if (b.x < marginX) {
          b.x = marginX;
          b.pushVx = Math.abs(b.pushVx) * 0.5;
        } else if (b.x > width - marginX) {
          b.x = width - marginX;
          b.pushVx = -Math.abs(b.pushVx) * 0.5;
        }

        // Lifecycle:
        // 0 to 0.2: Smooth entry
        // 0.2 to 0.7: Full glowing butterfly
        // 0.7 to 1.0: "Batas er moto mile jabe"
        const baseScale = isMobile ? 0.85 : 1.0;
        if (b.progress < 0.2) {
          b.opacity = b.progress / 0.2;
          b.blur = 0;
          b.scale = baseScale * (0.94 + (b.progress / 0.2) * 0.06);
        } else if (b.progress < 0.7) {
          b.opacity = 1;
          b.blur = 0;
          b.scale = baseScale;
        } else {
          const dissolveT = (b.progress - 0.7) / 0.3;
          b.opacity = Math.max(0, 1 - dissolveT);
          b.blur = dissolveT * 12;
          b.scale = baseScale * (1.0 + dissolveT * 0.15);
        }

        // Emit delicate fairy dust directly from butterfly
        if (b.progress < 0.72) {
          if (Math.random() < 0.75) {
            const isStarShape = Math.random() < 0.55;
            const chosenColor = FAIRY_COLORS[Math.floor(Math.random() * FAIRY_COLORS.length)];

            particles.push({
              x: b.x + (Math.random() - 0.5) * 4,
              y: b.y - 6 - Math.random() * 4,
              vx: (Math.random() - 0.5) * 1.8 + b.pushVx * 0.25,
              vy: -1.2 - Math.random() * 2.0 + b.pushVy * 0.25,
              size: isStarShape ? 1.8 + Math.random() * 1.4 : 1.2 + Math.random() * 1.2,
              alpha: 0.95,
              color: chosenColor,
              isStar: isStarShape,
              isMist: false,
              rotation: Math.random() * Math.PI * 2,
              rotSpeed: (Math.random() - 0.5) * 0.1,
            });
          }
        } else {
          // Wind mist particles when dissolving
          if (Math.random() < 0.55) {
            const chosenColor = FAIRY_COLORS[Math.floor(Math.random() * FAIRY_COLORS.length)];
            particles.push({
              x: b.x + (Math.random() - 0.5) * 35,
              y: b.y + (Math.random() - 0.5) * 14,
              vx: 0.7 + Math.random() * 1.1,
              vy: -0.2 + (Math.random() - 0.5) * 0.6,
              size: 2.8 + Math.random() * 3.0,
              alpha: 0.5,
              color: chosenColor,
              isStar: false,
              isMist: true,
              rotation: 0,
              rotSpeed: 0,
            });
          }
        }

        // Apply transform
        const naturalBankTilt = Math.cos(time * 1.4 + b.driftPhase) * 6;
        const totalTilt = Math.max(-30, Math.min(30, naturalBankTilt + b.bankTilt));

        el.style.opacity = `${b.opacity.toFixed(2)}`;
        if (b.blur > 0.1) {
          el.style.filter = `blur(${b.blur.toFixed(1)}px)`;
        } else if (el.style.filter !== "none") {
          el.style.filter = "none";
        }
        el.style.transform = `translate3d(${b.x.toFixed(1)}px, ${b.y.toFixed(1)}px, 0) translate(-50%, -50%) rotate(${totalTilt.toFixed(1)}deg) scale(${b.scale.toFixed(2)})`;

        // 3D wing flapping
        if (leftWing) {
          leftWing.style.transform = `rotateY(${wingFlapAngle.toFixed(1)}deg)`;
        }
        if (rightWing) {
          rightWing.style.transform = `rotateY(${(-wingFlapAngle).toFixed(1)}deg)`;
        }

        if (b.progress >= 1) {
          b.active = false;
        }
      }
    };

    loop();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchstart", onTouchStart);
    };
  }, []);

  return (
    <div className="butterfly-flight-container" aria-hidden="true">
      <canvas ref={canvasRef} className="butterfly-trail-canvas" />

      {/* SVG Definitions for Butterfly Wing Gradients */}
      <svg width="0" height="0" style={{ position: "absolute", pointerEvents: "none" }}>
        <defs>
          <linearGradient id="butterfly-grad-violet" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#e9d5ff" />
            <stop offset="45%" stopColor="#c084fc" />
            <stop offset="100%" stopColor="#38bdf8" />
          </linearGradient>
          <linearGradient id="butterfly-grad-cyan" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="40%" stopColor="#38bdf8" />
            <stop offset="100%" stopColor="#34d399" />
          </linearGradient>
          <linearGradient id="butterfly-grad-pink" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fbcfe8" />
            <stop offset="45%" stopColor="#f472b6" />
            <stop offset="100%" stopColor="#ffd700" />
          </linearGradient>
        </defs>
      </svg>

      {Array.from({ length: TOTAL_BUTTERFLIES }).map((_, idx) => {
        const themeGrad = idx === 1 ? "url(#butterfly-grad-cyan)" : idx === 2 ? "url(#butterfly-grad-pink)" : "url(#butterfly-grad-violet)";

        return (
          <div
            key={`butterfly-unit-${idx}`}
            ref={(el) => {
              unitRefs.current[idx] = el;
            }}
            className="butterfly-flight-unit"
            style={{ opacity: 0 }}
          >
            <div className="butterfly-creature">
              {/* Left Wing */}
              <div
                ref={(el) => {
                  leftWingRefs.current[idx] = el;
                }}
                className="butterfly-wing-wrap wing-left-wrap"
              >
                <svg
                  className="butterfly-svg-wing"
                  viewBox="0 0 48 46"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  {/* Upper and lower wings combined contour */}
                  <path
                    d="M46 23 C38 10, 26 2, 8 4 C-3 6, -1 18, 14 23 C4 26, -1 34, 6 42 C16 47, 32 38, 46 23 Z"
                    fill={themeGrad}
                    fillOpacity="0.88"
                    stroke="rgba(255, 255, 255, 0.75)"
                    strokeWidth="0.9"
                  />
                  {/* Wing veins */}
                  <path
                    d="M46 23 Q22 17 10 7"
                    stroke="rgba(255, 255, 255, 0.65)"
                    strokeWidth="0.8"
                    strokeLinecap="round"
                  />
                  <path
                    d="M46 23 Q26 24 14 38"
                    stroke="rgba(255, 255, 255, 0.65)"
                    strokeWidth="0.8"
                    strokeLinecap="round"
                  />
                  <path
                    d="M28 20 Q18 14 8 11"
                    stroke="rgba(255, 255, 255, 0.45)"
                    strokeWidth="0.6"
                  />
                  <path
                    d="M30 25 Q20 30 11 35"
                    stroke="rgba(255, 255, 255, 0.45)"
                    strokeWidth="0.6"
                  />
                  {/* Luminous margin sparkles */}
                  <circle cx="8" cy="6" r="1.1" fill="#ffffff" />
                  <circle cx="3" cy="15" r="0.9" fill="#ffffff" />
                  <circle cx="7" cy="40" r="1.1" fill="#ffffff" />
                  <circle cx="18" cy="44" r="0.9" fill="#ffffff" />
                </svg>
              </div>

              {/* Slender Central Thorax & Antennae Body */}
              <div className="butterfly-center-body">
                <div className="butterfly-antennae">
                  <div className="butterfly-antenna left-ant">
                    <span className="butterfly-antenna-spark antenna-spark-left">✦</span>
                  </div>
                  <div className="butterfly-antenna right-ant">
                    <span className="butterfly-antenna-spark antenna-spark-right">✦</span>
                  </div>
                </div>
                <div className="butterfly-thorax" />
              </div>

              {/* Right Wing (Symmetrically mirrored) */}
              <div
                ref={(el) => {
                  rightWingRefs.current[idx] = el;
                }}
                className="butterfly-wing-wrap wing-right-wrap"
              >
                <svg
                  className="butterfly-svg-wing"
                  viewBox="0 0 48 46"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  style={{ transform: "scaleX(-1)" }}
                >
                  <path
                    d="M46 23 C38 10, 26 2, 8 4 C-3 6, -1 18, 14 23 C4 26, -1 34, 6 42 C16 47, 32 38, 46 23 Z"
                    fill={themeGrad}
                    fillOpacity="0.88"
                    stroke="rgba(255, 255, 255, 0.75)"
                    strokeWidth="0.9"
                  />
                  <path
                    d="M46 23 Q22 17 10 7"
                    stroke="rgba(255, 255, 255, 0.65)"
                    strokeWidth="0.8"
                    strokeLinecap="round"
                  />
                  <path
                    d="M46 23 Q26 24 14 38"
                    stroke="rgba(255, 255, 255, 0.65)"
                    strokeWidth="0.8"
                    strokeLinecap="round"
                  />
                  <path
                    d="M28 20 Q18 14 8 11"
                    stroke="rgba(255, 255, 255, 0.45)"
                    strokeWidth="0.6"
                  />
                  <path
                    d="M30 25 Q20 30 11 35"
                    stroke="rgba(255, 255, 255, 0.45)"
                    strokeWidth="0.6"
                  />
                  <circle cx="8" cy="6" r="1.1" fill="#ffffff" />
                  <circle cx="3" cy="15" r="0.9" fill="#ffffff" />
                  <circle cx="7" cy="40" r="1.1" fill="#ffffff" />
                  <circle cx="18" cy="44" r="0.9" fill="#ffffff" />
                </svg>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ButterflyFlight;
