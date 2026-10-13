import React, { useEffect, useRef } from "react";
import "./styles/TwilightForestBg.css";

interface Particle {
  x: number;
  y: number;
  size: number;
  vx: number;
  vy: number;
  alpha: number;
  alphaSpeed: number;
  color: string;
}

const TwilightForestBg: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    const particles: Particle[] = [];
    const colors = ["#ffd700", "#ff79c6", "#bd93f9", "#8be9fd", "#ffffff"];
    const count = Math.min(90, Math.floor((width * height) / 14000));

    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: 1 + Math.random() * 2.8,
        vx: (Math.random() - 0.5) * 0.3,
        vy: -0.2 - Math.random() * 0.4,
        alpha: Math.random(),
        alphaSpeed: 0.01 + Math.random() * 0.025,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Draw twinkling star particles & fireflies
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.y < 0) {
          p.y = height;
          p.x = Math.random() * width;
        }
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;

        p.alpha += p.alphaSpeed;
        if (p.alpha > 1 || p.alpha < 0.15) {
          p.alphaSpeed = -p.alphaSpeed;
        }

        ctx.save();
        ctx.globalAlpha = Math.max(0.1, Math.min(1, p.alpha));
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 12;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="twilight-forest-wrapper">
      <div className="twilight-image-bg"></div>
      <canvas ref={canvasRef} className="twilight-canvas" />
    </div>
  );
};

export default TwilightForestBg;
