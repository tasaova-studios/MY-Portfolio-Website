import React, { useState, useEffect } from "react";
import { audioService } from "../services/audioService";
import { useLoading } from "../context/LoadingProvider";
import { Volume2, Sparkles, Headphones } from "lucide-react";
import "./styles/EntryOverlay.css";

const EntryOverlay: React.FC = () => {
  const { isLoading, isEntered, setIsEntered } = useLoading();
  const [isVisible, setIsVisible] = useState(true);
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    if (!isEntered && isVisible) {
      document.documentElement.style.overflow = "hidden";
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.documentElement.style.overflow = "auto";
      document.body.style.overflow = "auto";
    };
  }, [isEntered, isVisible]);

  // If already entered and fadeout complete, remove from DOM
  if (!isVisible || (isEntered && !isFading)) {
    return null;
  }

  const handleEnter = async (e?: React.MouseEvent | React.TouchEvent) => {
    if (e) {
      e.stopPropagation();
    }
    if (isFading) return;
    setIsFading(true);
    setIsEntered(true);

    try {
      if (audioService.getIsMuted()) {
        audioService.toggleMute();
      }
      await audioService.play();
    } catch (err) {
      console.warn("Autoplay unlock error:", err);
    }

    try {
      const module = await import("./utils/initialFX");
      if (module.initialFX) {
        module.initialFX();
      }
    } catch (err) {
      console.warn("initialFX trigger error:", err);
    }

    setTimeout(() => {
      setIsVisible(false);
      document.documentElement.style.overflow = "auto";
      document.body.style.overflow = "auto";
    }, 600);
  };

  return (
    <div
      className={`entry-overlay-backdrop ${isFading ? "fade-out" : ""} ${isLoading ? "entry-behind-loader" : ""}`}
      onClick={() => handleEnter()}
      onTouchStart={() => handleEnter()}
      role="dialog"
      aria-modal="true"
      aria-label="Welcome to TASAOVA STUDIOS"
    >
      <div
        className="entry-overlay-card"
        onClick={(e) => {
          e.stopPropagation();
          handleEnter();
        }}
      >
        <div className="entry-icon-glow">
          <Headphones size={28} className="entry-speaker" />
          <Sparkles size={16} className="entry-sparkle" />
        </div>
        <span className="entry-subtitle-top">WELCOME TO</span>
        <h2 className="entry-title">TASAOVA STUDIOS</h2>
        <p className="entry-desc">Tap or click anywhere to enter immersive sound &amp; experience</p>
        <button
          className="entry-action-btn"
          data-cursor="pointer"
          onClick={(e) => {
            e.stopPropagation();
            handleEnter(e);
          }}
        >
          <Volume2 size={16} />
          <span>Enter with Sound</span>
        </button>
      </div>
    </div>
  );
};

export default EntryOverlay;
