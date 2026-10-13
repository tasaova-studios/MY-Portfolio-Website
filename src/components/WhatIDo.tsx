import { useEffect, useRef } from "react";
import "./styles/WhatIDo.css";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import gsap from "gsap";

gsap.registerPlugin(ScrollTrigger);

interface SparkleParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  color: string;
  isStar: boolean;
  rotation: number;
  rotSpeed: number;
}

const FAIRY_COLORS = [
  "#ffd700", // Starlight Gold
  "#38bdf8", // Electric Cyan
  "#f472b6", // Cosmic Pink
  "#c084fc", // Radiant Violet
  "#34d399", // Emerald Aurora
  "#ffffff", // Diamond White
];

const WhatIDo = () => {
  const containerRef = useRef<(HTMLDivElement | null)[]>([]);
  const sectionRef = useRef<HTMLDivElement>(null);
  const titleWrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const setRef = (el: HTMLDivElement | null, index: number) => {
    containerRef.current[index] = el;
  };

  useEffect(() => {
    const el = sectionRef.current;
    const titleWrap = titleWrapRef.current;
    const canvas = canvasRef.current;
    if (!el || !titleWrap || !canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = (canvas.width = titleWrap.clientWidth + 100);
    let height = (canvas.height = titleWrap.clientHeight + 140);

    const onResize = () => {
      width = canvas.width = titleWrap.clientWidth + 100;
      height = canvas.height = titleWrap.clientHeight + 140;
    };
    window.addEventListener("resize", onResize, { passive: true });

    const particles: SparkleParticle[] = [];

    // Helper to add upward rising fairy stars
    const spawnStar = (customX?: number, customY?: number, isBurst = false) => {
      const isStarShape = Math.random() < 0.55;
      const chosenColor = FAIRY_COLORS[Math.floor(Math.random() * FAIRY_COLORS.length)];
      const spawnX = customX !== undefined ? customX : Math.random() * width;
      const spawnY = customY !== undefined ? customY : height - 20 + (Math.random() - 0.5) * 30;

      particles.push({
        x: spawnX,
        y: spawnY,
        vx: (Math.random() - 0.5) * (isBurst ? 3.5 : 1.6),
        vy: -1.4 - Math.random() * (isBurst ? 3.5 : 2.2),
        size: isStarShape ? 3.2 + Math.random() * 2.8 : 2.2 + Math.random() * 2.4,
        alpha: 1,
        color: chosenColor,
        isStar: isStarShape,
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.1,
      });
    };

    // Burst fountain when title scrolls into view
    const triggerStarFountain = () => {
      for (let i = 0; i < 30; i++) {
        spawnStar(width * 0.2 + Math.random() * (width * 0.6), height - 30 + Math.random() * 30, true);
      }
    };

    // GSAP ScrollTrigger Entrance: Animate in once and stay permanently visible
    const gsapCtx = gsap.context(() => {
      const cards = el.querySelectorAll<HTMLDivElement>(".what-content");

      gsap.from(titleWrap, {
        scrollTrigger: {
          trigger: el,
          start: "top 85%",
          toggleActions: "play none none none",
          once: true,
          onEnter: () => triggerStarFountain(),
        },
        y: 45,
        opacity: 0,
        filter: "blur(6px)",
        duration: 0.8,
        ease: "power2.out",
        clearProps: "all",
      });

      if (cards.length) {
        gsap.from(cards, {
          scrollTrigger: {
            trigger: el,
            start: "top 80%",
            toggleActions: "play none none none",
            once: true,
          },
          y: 40,
          opacity: 0,
          filter: "blur(4px)",
          duration: 0.7,
          stagger: 0.12,
          ease: "power2.out",
          clearProps: "all",
        });
      }
    }, el);

    // Mouse interactive star spray over title only when hovering the title area
    const onTitleMouseMove = (e: MouseEvent) => {
      const rect = titleWrap.getBoundingClientRect();
      const mx = e.clientX - rect.left + 50;
      const my = e.clientY - rect.top + 70;

      for (let i = 0; i < 2; i++) {
        spawnStar(mx + (Math.random() - 0.5) * 20, my + (Math.random() - 0.5) * 15, false);
      }
    };
    titleWrap.addEventListener("mousemove", onTitleMouseMove, { passive: true });

    let isSectionVisible = true;
    let animId: number;

    const renderLoop = () => {
      if (!isSectionVisible) return;
      animId = requestAnimationFrame(renderLoop);

      if (Math.random() < 0.28) {
        spawnStar(width * 0.1 + Math.random() * (width * 0.8), height - 25);
      }

      ctx.clearRect(0, 0, width, height);

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.rotation += p.rotSpeed;
        p.vy *= 0.985;
        p.vx *= 0.985;
        p.alpha -= 0.012;

        if (p.alpha <= 0) {
          particles.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.globalAlpha = Math.max(0, p.alpha);

        if (p.isStar) {
          ctx.fillStyle = p.color;
          ctx.shadowColor = p.color;
          ctx.shadowBlur = 10;

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
          ctx.shadowColor = p.color;
          ctx.shadowBlur = 8;
          ctx.fill();
        }

        ctx.restore();
      }
    };

    // Pause canvas particle loop when section is offscreen
    let observer: IntersectionObserver | null = null;
    if (typeof IntersectionObserver !== "undefined") {
      observer = new IntersectionObserver(
        (entries) => {
          const entry = entries[0];
          isSectionVisible = entry.isIntersecting;
          if (isSectionVisible) {
            cancelAnimationFrame(animId);
            renderLoop();
          } else {
            cancelAnimationFrame(animId);
          }
        },
        { threshold: 0.05 }
      );
      observer.observe(el);
    } else {
      renderLoop();
    }

    if (ScrollTrigger.isTouch) {
      containerRef.current.forEach((container) => {
        if (container) {
          container.classList.remove("what-noTouch");
          container.addEventListener("click", () => handleClick(container));
        }
      });
    }

    return () => {
      cancelAnimationFrame(animId);
      observer?.disconnect();
      gsapCtx.revert();
      window.removeEventListener("resize", onResize);
      titleWrap.removeEventListener("mousemove", onTitleMouseMove);
      containerRef.current.forEach((container) => {
        if (container) {
          container.removeEventListener("click", () => handleClick(container));
        }
      });
    };
  }, []);

  return (
    <div className="whatIDO" id="what-i-do" ref={sectionRef}>
      <div className="what-box">
        <div className="what-title-wrap" ref={titleWrapRef}>
          <canvas ref={canvasRef} className="what-sparkle-canvas" />

          <div className="what-subtitle">
            <span className="what-badge-dot"></span>
            SERVICES &amp; EXPERTISE
          </div>
          <h2 className="title">
            W<span className="hat-h2">HAT</span>
            <div>
              I<span className="do-h2"> DO</span>
            </div>
          </h2>
          <div className="what-title-underline"></div>
        </div>
      </div>
      <div className="what-box">
        <div className="what-box-in">
          <div className="what-border2">
            <svg width="100%">
              <line
                x1="0"
                y1="0"
                x2="0"
                y2="100%"
                stroke="white"
                strokeWidth="2"
                strokeDasharray="7,7"
              />
              <line
                x1="100%"
                y1="0"
                x2="100%"
                y2="100%"
                stroke="white"
                strokeWidth="2"
                strokeDasharray="7,7"
              />
            </svg>
          </div>
          <div
            className="what-content what-noTouch"
            ref={(el) => setRef(el, 0)}
          >
            <div className="what-border1">
              <svg height="100%">
                <line
                  x1="0"
                  y1="0"
                  x2="100%"
                  y2="0"
                  stroke="white"
                  strokeWidth="2"
                  strokeDasharray="6,6"
                />
                <line
                  x1="0"
                  y1="100%"
                  x2="100%"
                  y2="100%"
                  stroke="white"
                  strokeWidth="2"
                  strokeDasharray="6,6"
                />
              </svg>
            </div>
            <div className="what-corner"></div>

            <div className="what-content-in">
              <h3>3D PRODUCT VIZ &amp; RENDERING</h3>
              <h4>Photorealistic Product Imagery in Blender</h4>
              <p>
                Crafting high-end photorealistic 3D product visualizations in
                Blender (Cycles/Eevee) for e-commerce, hardware brands, and
                commercial showcases—complete with precision studio lighting,
                realistic PBR materials, and clean image renders.
              </p>
              <h5>Skillset &amp; tools</h5>
              <div className="what-content-flex">
                <div className="what-tags">Blender</div>
                <div className="what-tags">Product Viz</div>
                <div className="what-tags">3D Renders</div>
                <div className="what-tags">Cycles / Eevee</div>
                <div className="what-tags">PBR Materials</div>
                <div className="what-tags">Studio Lighting</div>
                <div className="what-tags">Photorealism</div>
                <div className="what-tags">High-Res Export</div>
              </div>
              <div className="what-arrow"></div>
            </div>
          </div>
          <div
            className="what-content what-noTouch"
            ref={(el) => setRef(el, 1)}
          >
            <div className="what-border1">
              <svg height="100%">
                <line
                  x1="0"
                  y1="100%"
                  x2="100%"
                  y2="100%"
                  stroke="white"
                  strokeWidth="2"
                  strokeDasharray="6,6"
                />
              </svg>
            </div>
            <div className="what-corner"></div>
            <div className="what-content-in">
              <h3>UNITY GAME DEV &amp; ASSETS</h3>
              <h4>C# Mechanics &amp; Optimized 3D Game Assets</h4>
              <p>
                Developing indie game mechanics in Unity with clean C#, and
                crafting game-ready 3D assets (low-poly props, modular
                environments) built with optimized topology, efficient draw-calls,
                and LODs for high 60+ FPS performance.
              </p>
              <h5>Skillset &amp; tools</h5>
              <div className="what-content-flex">
                <div className="what-tags">Unity</div>
                <div className="what-tags">C#</div>
                <div className="what-tags">Game Assets</div>
                <div className="what-tags">Optimization</div>
                <div className="what-tags">Low-Poly</div>
                <div className="what-tags">Physics</div>
                <div className="what-tags">Modular Design</div>
                <div className="what-tags">Clean Topology</div>
              </div>
              <div className="what-arrow"></div>
            </div>
          </div>
          <div
            className="what-content what-noTouch"
            ref={(el) => setRef(el, 2)}
          >
            <div className="what-border1">
              <svg height="100%">
                <line
                  x1="0"
                  y1="100%"
                  x2="100%"
                  y2="100%"
                  stroke="white"
                  strokeWidth="2"
                  strokeDasharray="6,6"
                />
              </svg>
            </div>
            <div className="what-corner"></div>
            <div className="what-content-in">
              <h3>AI WORKFLOW &amp; RAPID SITES</h3>
              <h4>AI-Accelerated Web Creation &amp; 10x Pipeline</h4>
              <p>
                Harnessing state-of-the-art AI workflows to rapidly design and
                construct modern web experiences, fast-track concept ideation, and
                streamline the creative pipeline—delivering polished client
                results with extreme speed and cost efficiency.
              </p>
              <h5>Skillset &amp; tools</h5>
              <div className="what-content-flex">
                <div className="what-tags">AI Workflow</div>
                <div className="what-tags">Rapid Websites</div>
                <div className="what-tags">Fast Turnaround</div>
                <div className="what-tags">Pipeline Speed</div>
                <div className="what-tags">Prototyping</div>
                <div className="what-tags">Modern Web</div>
                <div className="what-tags">Productivity 10x</div>
                <div className="what-tags">Automation</div>
              </div>
              <div className="what-arrow"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WhatIDo;

function handleClick(container: HTMLDivElement) {
  container.classList.toggle("what-content-active");
  container.classList.remove("what-sibling");
  if (container.parentElement) {
    const siblings = Array.from(container.parentElement.children);

    siblings.forEach((sibling) => {
      if (sibling !== container) {
        sibling.classList.remove("what-content-active");
        sibling.classList.toggle("what-sibling");
      }
    });
  }
}
