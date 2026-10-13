import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { audioService } from "../services/audioService";
import "./styles/InteractiveWave.css";

gsap.registerPlugin(ScrollTrigger);

const VIDEO_URL =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260624_052448_43259007-b7c4-4269-90bd-e3ab14e80075.mp4";

interface WindFoliageParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  color: string;
  rotation: number;
  rotSpeed: number;
  type: "leaf" | "petal" | "spore" | "firefly";
  oscSpeed: number;
  oscRadius: number;
  baseX: number;
  flapPhase: number;
  flapSpeed: number;
}

const InteractiveWave = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    const wrapper = wrapperRef.current;
    const overlay = overlayRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    // Paused by default - scrubbed directly by user scrolling
    video.pause();
    video.currentTime = 0;

    let targetProgress = 0;
    let currentProgress = 0;
    let scrollVelocity = 0;
    let lastScrollY = window.scrollY;
    let scrollTimeout: ReturnType<typeof setTimeout> | null = null;

    const onMeta = () => {
      video.pause();
      ScrollTrigger.refresh();
    };

    video.addEventListener("loadedmetadata", onMeta);
    if (video.readyState >= 1) {
      onMeta();
    }

    // High performance seek gate: updates video frame smoothly with scrollbar
    const performSeek = () => {
      if (!video || !video.duration || isNaN(video.duration)) return;
      if (video.seeking) return;

      const dur = video.duration;
      const targetTime = Math.min(dur - 0.02, Math.max(0, currentProgress * dur));
      const diff = Math.abs(video.currentTime - targetTime);

      if (diff > 0.03) {
        if ("fastSeek" in video && typeof (video as any).fastSeek === "function") {
          (video as any).fastSeek(targetTime);
        } else {
          video.currentTime = targetTime;
        }
      }
    };

    const onSeeked = () => {
      if (!video || !video.duration || isNaN(video.duration)) return;
      const dur = video.duration;
      const targetTime = Math.min(dur - 0.02, Math.max(0, currentProgress * dur));
      if (Math.abs(video.currentTime - targetTime) > 0.04) {
        performSeek();
      }
    };

    video.addEventListener("seeked", onSeeked);

    // ScrollTrigger strictly controls target video time via scroll progress
    const trigger = ScrollTrigger.create({
      start: 0,
      end: "max",
      onUpdate: (self) => {
        targetProgress = self.progress;

        const currentY = window.scrollY;
        const delta = Math.abs(currentY - lastScrollY);
        lastScrollY = currentY;
        scrollVelocity = Math.min(delta / 10, 3.0);

        if (scrollTimeout) clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
          scrollVelocity = 0;
        }, 100);
      },
    });

    // --- AUDIO-REACTIVE LIVING CANVAS & PARTICLES ---
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let animId: number;
    let isTabVisible = true;

    const onVisibilityChange = () => {
      isTabVisible = !document.hidden;
    };
    document.addEventListener("visibilitychange", onVisibilityChange);

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas, { passive: true });

    const particles: WindFoliageParticle[] = [];

    const colors = [
      "rgba(192, 132, 252, ", // Mystic purple
      "rgba(244, 114, 182, ", // Glowing magenta/pink
      "rgba(168, 85, 247, ",  // Violet
      "rgba(56, 189, 248, ",  // Cyan bioluminescent
      "rgba(134, 239, 172, ", // Vibrant foliage green
      "rgba(255, 255, 255, ", // Pure starlight
    ];

    const particleCount = window.innerWidth < 768 ? 22 : 40;

    for (let i = 0; i < particleCount; i++) {
      const rand = Math.random();
      const type: WindFoliageParticle["type"] =
        rand > 0.65 ? "leaf" : rand > 0.35 ? "petal" : rand > 0.15 ? "spore" : "firefly";

      const size =
        type === "leaf"
          ? 6 + Math.random() * 7
          : type === "petal"
          ? 4 + Math.random() * 5
          : type === "firefly"
          ? 3 + Math.random() * 3
          : 1.5 + Math.random() * 2.5;

      const x = Math.random() * window.innerWidth;
      const y = Math.random() * window.innerHeight;

      particles.push({
        x,
        baseX: x,
        y,
        vx: 0.6 + Math.random() * 1.2,
        vy: -0.3 + (Math.random() - 0.5) * 0.8,
        size,
        alpha: 0.4 + Math.random() * 0.55,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.05,
        type,
        oscSpeed: 0.015 + Math.random() * 0.025,
        oscRadius: 18 + Math.random() * 32,
        flapPhase: Math.random() * Math.PI * 2,
        flapSpeed: 0.04 + Math.random() * 0.06,
      });
    }

    let time = 0;
    let lastBass = -1;

    const renderLoop = () => {
      animId = requestAnimationFrame(renderLoop);

      if (!isTabVisible) return;

      time += 0.02;

      // Smooth interpolation for scroll-driven video progress
      currentProgress += (targetProgress - currentProgress) * 0.14;
      performSeek();

      // Read real-time audio metrics
      const audioMetrics = audioService.getMetrics();
      const bass = audioMetrics.bass;
      const mid = audioMetrics.mid;

      // Pulse video wrapper & overlay slightly on beat without heavy paint operations
      if (Math.abs(bass - lastBass) > 0.02) {
        lastBass = bass;

        if (wrapper) {
          const beatScale = (1.0 + bass * 0.025).toFixed(3);
          wrapper.style.transform = `scale(${beatScale})`;
        }

        if (overlay) {
          overlay.style.opacity = `${(0.85 + bass * 0.15).toFixed(2)}`;
        }
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const ambientBreeze = Math.sin(time * 1.2) * 0.5;
      const beatImpulse = bass * 1.8;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        p.flapPhase += p.flapSpeed * (1 + mid * 1.2);
        const currentWind = p.vx + ambientBreeze + scrollVelocity * 1.5 + beatImpulse;

        p.baseX += currentWind;
        p.x = p.baseX + Math.sin(time * p.oscSpeed * 40 + i) * (p.oscRadius * (1 + bass * 0.35));
        p.y += p.vy + Math.cos(time * p.oscSpeed * 30 + i) * 0.8 - scrollVelocity * 0.6;
        p.rotation += p.rotSpeed + (scrollVelocity > 0 ? 0.02 : 0);

        if (p.x > canvas.width + 40) {
          p.x = -30;
          p.baseX = -30;
          p.y = Math.random() * canvas.height;
        }
        if (p.y < -30) p.y = canvas.height + 20;
        if (p.y > canvas.height + 30) p.y = -20;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);

        const flutter = Math.sin(p.flapPhase);
        const dynamicAlpha = Math.min(1, p.alpha * (1 + bass * 0.45));
        const dynamicSize = p.size * (1 + bass * 0.2);

        if (p.type === "leaf") {
          ctx.beginPath();
          ctx.ellipse(0, 0, dynamicSize * (0.6 + 0.4 * flutter), dynamicSize * 1.8, 0, 0, Math.PI * 2);
          ctx.fillStyle = `${p.color}${dynamicAlpha * 0.75})`;
          ctx.fill();

          ctx.beginPath();
          ctx.moveTo(0, -dynamicSize * 1.4);
          ctx.lineTo(0, dynamicSize * 1.4);
          ctx.strokeStyle = `rgba(255, 255, 255, ${dynamicAlpha * 0.35})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        } else if (p.type === "petal") {
          ctx.beginPath();
          ctx.ellipse(0, 0, dynamicSize * (0.8 + 0.2 * flutter), dynamicSize * 1.5, 0.3, 0, Math.PI * 2);
          ctx.fillStyle = `${p.color}${dynamicAlpha * 0.8})`;
          ctx.fill();
        } else if (p.type === "firefly") {
          const pulse = 0.5 + 0.5 * Math.sin(time * (3 + mid * 6) + i);
          const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, dynamicSize * 2.5);
          grad.addColorStop(0, `${p.color}${dynamicAlpha * pulse})`);
          grad.addColorStop(1, `${p.color}0)`);
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(0, 0, dynamicSize * 2.5, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.beginPath();
          ctx.arc(0, 0, dynamicSize, 0, Math.PI * 2);
          ctx.fillStyle = `${p.color}${dynamicAlpha})`;
          ctx.fill();
        }

        ctx.restore();
      }
    };

    renderLoop();

    return () => {
      cancelAnimationFrame(animId);
      trigger.kill();
      if (scrollTimeout) clearTimeout(scrollTimeout);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("resize", resizeCanvas);
      video.removeEventListener("loadedmetadata", onMeta);
      video.removeEventListener("seeked", onSeeked);
    };
  }, []);

  return (
    <div className="site-video-background-container">
      <div ref={wrapperRef} className="site-video-wind-wrapper">
        <video
          ref={videoRef}
          className="site-video-background"
          muted
          playsInline
          preload="auto"
          tabIndex={-1}
        >
          <source src="/reference_video.mp4" type="video/mp4" />
          <source
            src="/hf_20260624_052448_43259007-b7c4-4269-90bd-e3ab14e80075.mp4"
            type="video/mp4"
          />
          <source src={VIDEO_URL} type="video/mp4" />
        </video>
      </div>

      <canvas ref={canvasRef} className="site-video-blast-canvas" />
      <div ref={overlayRef} className="site-video-overlay" />
    </div>
  );
};

export default InteractiveWave;
