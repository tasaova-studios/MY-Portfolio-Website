import { useEffect, useRef } from "react";
import "./styles/SkillsBalls.css";

interface SkillBall {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  baseRadius: number;
  label: string;
  color1: string;
  color2: string;
  glowColor: string;
  textColor: string;
  mass: number;
  squish: number;
  floatPhase: number;
  floatSpeed: number;
}

const SKILLS_DATA = [
  { label: "Blender", color1: "#ff8c1a", color2: "#d95000", glowColor: "rgba(255, 140, 26, 0.6)", textColor: "#ffffff", radius: 55 },
  { label: "Unity 3D", color1: "#f1f5f9", color2: "#334155", glowColor: "rgba(255, 255, 255, 0.5)", textColor: "#0f172a", radius: 54 },
  { label: "C#", color1: "#c084fc", color2: "#7e22ce", glowColor: "rgba(192, 132, 252, 0.6)", textColor: "#ffffff", radius: 48 },
  { label: "Product Viz", color1: "#38bdf8", color2: "#0284c7", glowColor: "rgba(56, 189, 248, 0.65)", textColor: "#ffffff", radius: 56 },
  { label: "3D Renders", color1: "#fb7185", color2: "#e11d48", glowColor: "rgba(251, 113, 133, 0.65)", textColor: "#ffffff", radius: 54 },
  { label: "Website Dev", color1: "#06b6d4", color2: "#0e7490", glowColor: "rgba(6, 182, 212, 0.65)", textColor: "#ffffff", radius: 55 },
  { label: "AI Tools", color1: "#2dd4bf", color2: "#0f766e", glowColor: "rgba(45, 212, 191, 0.65)", textColor: "#ffffff", radius: 52 },
  { label: "Game Dev", color1: "#fbbf24", color2: "#d97706", glowColor: "rgba(251, 191, 36, 0.65)", textColor: "#ffffff", radius: 53 },
  { label: "Low-Poly", color1: "#a78bfa", color2: "#6d28d9", glowColor: "rgba(167, 139, 250, 0.6)", textColor: "#ffffff", radius: 50 },
  { label: "3D Anime", color1: "#f472b6", color2: "#db2777", glowColor: "rgba(244, 114, 182, 0.65)", textColor: "#ffffff", radius: 51 },
  { label: "Optimized", color1: "#34d399", color2: "#059669", glowColor: "rgba(52, 211, 153, 0.65)", textColor: "#ffffff", radius: 52 },
];

const SkillsBalls = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = (canvas.width = container.clientWidth);
    let height = (canvas.height = container.clientHeight);

    let cachedRect = canvas.getBoundingClientRect();
    const updateRect = () => {
      cachedRect = canvas.getBoundingClientRect();
    };

    const getScale = (w: number) => (w < 480 ? 0.68 : w < 768 ? 0.84 : 1.05);

    // Initial positioning in a playful distributed cloud
    const balls: SkillBall[] = SKILLS_DATA.map((item, idx) => {
      const scale = getScale(width);
      const radius = Math.round(item.radius * scale);

      const cols = 4;
      const row = Math.floor(idx / cols);
      const col = idx % cols;
      const cellW = (width - radius * 2) / cols;
      const cellH = (height - radius * 2) / 3.5;

      const initX = radius + col * cellW + Math.random() * (cellW * 0.7);
      const initY = radius + row * cellH + Math.random() * (cellH * 0.7);

      return {
        x: Math.max(radius, Math.min(width - radius, initX)),
        y: Math.max(radius, Math.min(height - radius, initY)),
        vx: (Math.random() - 0.5) * 1.8,
        vy: (Math.random() - 0.5) * 1.8,
        radius,
        baseRadius: radius,
        label: item.label,
        color1: item.color1,
        color2: item.color2,
        glowColor: item.glowColor,
        textColor: item.textColor,
        mass: radius * 0.8,
        squish: 1,
        floatPhase: Math.random() * Math.PI * 2,
        floatSpeed: 0.015 + Math.random() * 0.02,
      };
    });

    const pointer = {
      x: -2000,
      y: -2000,
      isDown: false,
      isOver: false,
      draggedBall: null as SkillBall | null,
      prevX: 0,
      prevY: 0,
      vx: 0,
      vy: 0,
    };

    const getCanvasPos = (clientX: number, clientY: number) => {
      return {
        x: clientX - cachedRect.left,
        y: clientY - cachedRect.top,
      };
    };

    const handlePointerDown = (clientX: number, clientY: number) => {
      updateRect();
      const pos = getCanvasPos(clientX, clientY);
      pointer.isDown = true;
      pointer.isOver = true;
      pointer.x = pos.x;
      pointer.y = pos.y;
      pointer.prevX = pos.x;
      pointer.prevY = pos.y;
      pointer.vx = 0;
      pointer.vy = 0;

      for (let i = balls.length - 1; i >= 0; i--) {
        const b = balls[i];
        const dist = Math.hypot(b.x - pos.x, b.y - pos.y);
        if (dist <= b.radius * 1.1) {
          pointer.draggedBall = b;
          b.squish = 0.86;
          break;
        }
      }
    };

    const handlePointerMove = (clientX: number, clientY: number) => {
      const pos = getCanvasPos(clientX, clientY);
      pointer.vx = (pos.x - pointer.prevX) * 0.9;
      pointer.vy = (pos.y - pointer.prevY) * 0.9;
      pointer.x = pos.x;
      pointer.y = pos.y;
      pointer.prevX = pos.x;
      pointer.prevY = pos.y;

      if (pointer.draggedBall) {
        pointer.draggedBall.vx = pointer.vx * 1.2;
        pointer.draggedBall.vy = pointer.vy * 1.2;
        pointer.draggedBall.x = pos.x;
        pointer.draggedBall.y = pos.y;
      }
    };

    const handlePointerUp = () => {
      if (pointer.draggedBall) {
        pointer.draggedBall.vx = Math.max(-14, Math.min(14, pointer.vx * 1.4));
        pointer.draggedBall.vy = Math.max(-14, Math.min(14, pointer.vy * 1.4));
        pointer.draggedBall.squish = 1.15;
      }
      pointer.isDown = false;
      pointer.draggedBall = null;
    };

    const onMouseDown = (e: MouseEvent) => handlePointerDown(e.clientX, e.clientY);
    const onCanvasMouseMove = (e: MouseEvent) => {
      pointer.isOver = true;
      handlePointerMove(e.clientX, e.clientY);
    };
    const onWindowMouseMove = (e: MouseEvent) => {
      // Only process window mouse movement if dragging a ball outside the canvas boundary
      if (pointer.isDown && pointer.draggedBall) {
        handlePointerMove(e.clientX, e.clientY);
      }
    };
    const onMouseLeave = () => {
      if (!pointer.isDown) {
        pointer.isOver = false;
        pointer.x = -2000;
        pointer.y = -2000;
      }
    };
    const onMouseUp = () => handlePointerUp();

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        handlePointerDown(e.touches[0].clientX, e.touches[0].clientY);
      }
    };
    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        handlePointerMove(e.touches[0].clientX, e.touches[0].clientY);
      }
    };
    const onTouchEnd = () => handlePointerUp();

    canvas.addEventListener("mousedown", onMouseDown);
    canvas.addEventListener("mousemove", onCanvasMouseMove, { passive: true });
    canvas.addEventListener("mouseleave", onMouseLeave, { passive: true });
    window.addEventListener("mousemove", onWindowMouseMove, { passive: true });
    window.addEventListener("mouseup", onMouseUp);

    canvas.addEventListener("touchstart", onTouchStart, { passive: true });
    canvas.addEventListener("touchmove", onTouchMove, { passive: true });
    canvas.addEventListener("touchend", onTouchEnd);

    const onResize = () => {
      width = canvas.width = container.clientWidth;
      height = canvas.height = container.clientHeight;
      updateRect();
      const scale = getScale(width);
      balls.forEach((b, i) => {
        b.baseRadius = Math.round(SKILLS_DATA[i].radius * scale);
        b.radius = b.baseRadius;
        b.mass = b.radius * 0.8;
      });
    };
    window.addEventListener("resize", onResize, { passive: true });
    window.addEventListener("scroll", updateRect, { passive: true });

    let animId: number;
    const damping = 0.994;
    const bounce = 0.92;

    const animate = () => {
      animId = requestAnimationFrame(animate);

      ctx.clearRect(0, 0, width, height);

      // 1. Update ball positions & buoyant physics
      for (let i = 0; i < balls.length; i++) {
        const b = balls[i];

        b.squish += (1 - b.squish) * 0.12;

        if (b !== pointer.draggedBall) {
          b.floatPhase += b.floatSpeed;
          const ambientDriftX = Math.cos(b.floatPhase) * 0.045;
          const ambientDriftY = Math.sin(b.floatPhase * 0.8) * 0.045;

          b.vx += ambientDriftX;
          b.vy += ambientDriftY;

          b.vx *= damping;
          b.vy *= damping;

          if (pointer.isOver || pointer.isDown) {
            const distPointer = Math.hypot(b.x - pointer.x, b.y - pointer.y);
            const pushRadius = b.radius + 95;

            if (distPointer < pushRadius && distPointer > 0) {
              const proximityFactor = Math.pow(1 - distPointer / pushRadius, 1.3);
              const pushMagnitude = pointer.isDown ? 5.5 : 3.8;
              const nx = (b.x - pointer.x) / distPointer;
              const ny = (b.y - pointer.y) / distPointer;

              b.vx += nx * proximityFactor * pushMagnitude;
              b.vy += ny * proximityFactor * pushMagnitude;
              b.squish = Math.max(0.88, 1 - proximityFactor * 0.15);
            }
          }

          b.x += b.vx;
          b.y += b.vy;

          if (b.x - b.radius < 4) {
            b.x = b.radius + 4;
            b.vx = -b.vx * bounce;
            b.squish = 0.88;
          } else if (b.x + b.radius > width - 4) {
            b.x = width - b.radius - 4;
            b.vx = -b.vx * bounce;
            b.squish = 0.88;
          }

          if (b.y - b.radius < 4) {
            b.y = b.radius + 4;
            b.vy = -b.vy * bounce;
            b.squish = 0.88;
          } else if (b.y + b.radius > height - 4) {
            b.y = height - b.radius - 4;
            b.vy = -b.vy * bounce;
            b.squish = 0.88;
          }
        }
      }

      // 2. Ball-to-Ball Elastic Collisions
      for (let i = 0; i < balls.length; i++) {
        for (let j = i + 1; j < balls.length; j++) {
          const b1 = balls[i];
          const b2 = balls[j];

          const dx = b2.x - b1.x;
          const dy = b2.y - b1.y;
          const dist = Math.hypot(dx, dy);
          const minDist = b1.radius + b2.radius;

          if (dist < minDist && dist > 0) {
            const overlap = (minDist - dist) * 0.5;
            const nx = dx / dist;
            const ny = dy / dist;

            if (b1 !== pointer.draggedBall) {
              b1.x -= nx * overlap;
              b1.y -= ny * overlap;
            }
            if (b2 !== pointer.draggedBall) {
              b2.x += nx * overlap;
              b2.y += ny * overlap;
            }

            const kx = b1.vx - b2.vx;
            const ky = b1.vy - b2.vy;
            const p = (2 * (nx * kx + ny * ky)) / (b1.mass + b2.mass);

            if (b1 !== pointer.draggedBall) {
              b1.vx -= p * b2.mass * nx * bounce;
              b1.vy -= p * b2.mass * ny * bounce;
              b1.squish = 0.9;
            }
            if (b2 !== pointer.draggedBall) {
              b2.vx += p * b1.mass * nx * bounce;
              b2.vy += p * b1.mass * ny * bounce;
              b2.squish = 0.9;
            }
          }
        }
      }

      // 3. Render Cute 3D Glassy Bubble Spheres
      for (let i = 0; i < balls.length; i++) {
        const b = balls[i];
        const isHovered = b === pointer.draggedBall || Math.hypot(b.x - pointer.x, b.y - pointer.y) < b.radius;

        ctx.save();
        ctx.translate(b.x, b.y);

        const scaleX = b.squish;
        const scaleY = 2 - b.squish;
        ctx.scale(scaleX, scaleY);

        ctx.shadowColor = b.glowColor;
        ctx.shadowBlur = isHovered ? 34 : 18;

        const bodyGrad = ctx.createRadialGradient(
          -b.radius * 0.35,
          -b.radius * 0.35,
          b.radius * 0.08,
          0,
          0,
          b.radius
        );
        bodyGrad.addColorStop(0, b.color1);
        bodyGrad.addColorStop(0.65, b.color2);
        bodyGrad.addColorStop(1, "#0d0814");

        ctx.beginPath();
        ctx.arc(0, 0, b.radius, 0, Math.PI * 2);
        ctx.fillStyle = bodyGrad;
        ctx.fill();

        ctx.shadowBlur = 0;
        ctx.beginPath();
        ctx.arc(0, 0, b.radius - 1.5, 0, Math.PI * 2);
        ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.save();
        ctx.beginPath();
        ctx.ellipse(
          -b.radius * 0.32,
          -b.radius * 0.38,
          b.radius * 0.45,
          b.radius * 0.22,
          -Math.PI / 4.5,
          0,
          Math.PI * 2
        );
        const glintGrad = ctx.createLinearGradient(
          -b.radius * 0.32,
          -b.radius * 0.5,
          -b.radius * 0.32,
          -b.radius * 0.2
        );
        glintGrad.addColorStop(0, "rgba(255, 255, 255, 0.85)");
        glintGrad.addColorStop(0.6, "rgba(255, 255, 255, 0.35)");
        glintGrad.addColorStop(1, "rgba(255, 255, 255, 0)");
        ctx.fillStyle = glintGrad;
        ctx.fill();
        ctx.restore();

        ctx.beginPath();
        ctx.arc(
          b.radius * 0.28,
          b.radius * 0.28,
          b.radius * 0.14,
          0,
          Math.PI * 2
        );
        ctx.fillStyle = "rgba(255, 255, 255, 0.22)";
        ctx.fill();

        ctx.beginPath();
        ctx.arc(
          -b.radius * 0.52,
          -b.radius * 0.16,
          Math.max(2, b.radius * 0.045),
          0,
          Math.PI * 2
        );
        ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
        ctx.fill();

        ctx.shadowColor = "rgba(0, 0, 0, 0.75)";
        ctx.shadowBlur = 6;
        ctx.shadowOffsetY = 2;

        const words = b.label.split(" ");
        if (words.length === 2) {
          const fontSize = Math.max(12, Math.floor(b.radius * 0.27));
          ctx.font = `800 ${fontSize}px 'Plus Jakarta Sans', sans-serif`;
          ctx.fillStyle = b.textColor;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(words[0], 0, -fontSize * 0.56);
          ctx.fillText(words[1], 0, fontSize * 0.58);
        } else {
          const fontSize = Math.max(13, Math.floor(b.radius * 0.31));
          ctx.font = `800 ${fontSize}px 'Plus Jakarta Sans', sans-serif`;
          ctx.fillStyle = b.textColor;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(b.label, 0, 2);
        }

        ctx.restore();
      }
    };

    let isVisible = true;
    let observer: IntersectionObserver | null = null;

    if (typeof IntersectionObserver !== "undefined") {
      observer = new IntersectionObserver(
        (entries) => {
          const entry = entries[0];
          isVisible = entry.isIntersecting;
          if (isVisible) {
            updateRect();
            cancelAnimationFrame(animId);
            animate();
          } else {
            cancelAnimationFrame(animId);
          }
        },
        { threshold: 0.05 }
      );
      observer.observe(container);
    } else {
      animate();
    }

    return () => {
      cancelAnimationFrame(animId);
      observer?.disconnect();
      canvas.removeEventListener("mousedown", onMouseDown);
      canvas.removeEventListener("mousemove", onCanvasMouseMove);
      canvas.removeEventListener("mouseleave", onMouseLeave);
      window.removeEventListener("mousemove", onWindowMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      canvas.removeEventListener("touchstart", onTouchStart);
      canvas.removeEventListener("touchmove", onTouchMove);
      canvas.removeEventListener("touchend", onTouchEnd);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", updateRect);
    };
  }, []);

  return (
    <div ref={containerRef} className="skills-balls-wrapper">
      <div className="skills-balls-header">
        <div className="skills-balls-title">
          <span>Interactive Skills Arena</span>
        </div>
        <div className="skills-balls-hint">
          Touch, drag, or push the weightless skill spheres
        </div>
      </div>
      <div className="skills-interactive-callout">
        <span className="skills-callout-ping">
          <span className="skills-callout-ring"></span>
          <span className="skills-callout-core"></span>
        </span>
        <span className="skills-callout-text">Drag or Hover Spheres ⚡</span>
      </div>
      <canvas ref={canvasRef} className="skills-balls-canvas" />
    </div>
  );
};

export default SkillsBalls;
