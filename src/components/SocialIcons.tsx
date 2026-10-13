import { useState, useRef } from "react";
import "./styles/SocialIcons.css";
import { TbNotes } from "react-icons/tb";
import { Sparkles, MousePointerClick } from "lucide-react";
import HoverLinks from "./HoverLinks";
import gsap from "gsap";

const SocialIcons = () => {
  const brandText1 = "TASAOVA";
  const brandText2 = "STUDIOS";
  const [isScattered, setIsScattered] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const tweensRef = useRef<gsap.core.Tween[]>([]);

  const triggerScatter = () => {
    if (isScattered) return;
    setIsScattered(true);

    const letters = containerRef.current?.querySelectorAll(".brand-letter");
    if (!letters) return;

    tweensRef.current.forEach((t) => t.kill());
    tweensRef.current = [];

    letters.forEach((el, idx) => {
      const htmlEl = el as HTMLElement;
      // Scatter across the page like butterflies taking flight
      const targetX = (Math.random() - 0.5) * (window.innerWidth * 0.75);
      const targetY = -Math.random() * (window.innerHeight * 0.6) - 50;
      const targetRot = (Math.random() - 0.5) * 40;

      const tween = gsap.to(htmlEl, {
        x: targetX,
        y: targetY,
        rotation: targetRot,
        duration: 1.2 + idx * 0.05,
        ease: "power2.out",
        onComplete: () => {
          // Butterfly fluttering flight pattern across the page
          const butterflyTween = gsap.to(htmlEl, {
            x: targetX + (Math.random() - 0.5) * 160,
            y: targetY + (Math.random() - 0.5) * 110 - 20,
            rotation: targetRot + (Math.random() - 0.5) * 25,
            scaleX: 0.82, // butterfly wing flutter effect
            duration: 1.8 + Math.random() * 1.5,
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut",
          });
          tweensRef.current.push(butterflyTween);
        },
      });

      tweensRef.current.push(tween);
      htmlEl.classList.add("star-comet-trail");
    });
  };

  const triggerGather = () => {
    setIsScattered(false);

    tweensRef.current.forEach((t) => t.kill());
    tweensRef.current = [];

    const letters = containerRef.current?.querySelectorAll(".brand-letter");
    if (!letters) return;

    // Gracefully fly back home like butterflies returning to their nest
    letters.forEach((el, idx) => {
      const htmlEl = el as HTMLElement;
      const tween = gsap.to(htmlEl, {
        x: 0,
        y: 0,
        rotation: 0,
        scaleX: 1,
        duration: 1.4 + idx * 0.04,
        ease: "power2.inOut",
        onComplete: () => {
          htmlEl.classList.remove("star-comet-trail");
        },
      });
      tweensRef.current.push(tween);
    });
  };

  const handleToggle = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    if (isScattered) {
      triggerGather();
    } else {
      triggerScatter();
    }
  };

  return (
    <div className="icons-section">
      <div
        className={`social-icons gaming-brand-bubble ${isScattered ? "bubble-active-scatter" : ""}`}
        data-cursor="brand"
        id="social"
        ref={containerRef}
        onMouseEnter={triggerScatter}
        onMouseLeave={triggerGather}
        onClick={handleToggle}
        onTouchEnd={handleToggle}
        role="button"
        tabIndex={0}
        aria-label="TASAOVA STUDIOS - Hover or tap for butterfly magic effect"
      >
        {/* Floating Animated Callout Badge */}
        <div className="brand-floating-callout">
          <span className="callout-ping-dot">
            <span className="callout-ping-ring"></span>
            <span className="callout-ping-core"></span>
          </span>
          <MousePointerClick size={13} className="callout-cursor-icon" />
          <span className="callout-label">
            {isScattered ? "Click / Tap to Restore" : "Hover / Tap For Effect ✨"}
          </span>
          <Sparkles size={11} className="callout-sparkle" />
        </div>

        <div className="bubble-glow-bg"></div>

        <div className="gaming-brand-link">
          <div className="brand-word">
            {brandText1.split("").map((char, index) => (
              <span
                key={index}
                className="brand-letter"
                style={{ "--char-index": index } as React.CSSProperties}
              >
                {char}
              </span>
            ))}
          </div>
          <div className="brand-word">
            {brandText2.split("").map((char, index) => (
              <span
                key={index + 7}
                className="brand-letter"
                style={{ "--char-index": index + 7 } as React.CSSProperties}
              >
                {char}
              </span>
            ))}
          </div>
        </div>

        {/* Micro-hint under the brand name inside the capsule */}
        <div className="brand-sub-tap-hint">
          <span className="tap-hint-gem">✦</span>
          <span>{isScattered ? "ACTIVE EFFECT" : "HOVER OR TAP HERE"}</span>
          <span className="tap-hint-gem">✦</span>
        </div>
      </div>

      <a className="resume-button" href="#">
        <HoverLinks text="RESUME" />
        <span>
          <TbNotes />
        </span>
      </a>
    </div>
  );
};

export default SocialIcons;
