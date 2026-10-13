import React, { useEffect, useRef, useState } from "react";
import { audioService } from "../services/audioService";
import { Volume2, VolumeX } from "lucide-react";
import "./styles/AudioController.css";

const AudioController: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  const bar1Ref = useRef<HTMLSpanElement>(null);
  const bar2Ref = useRef<HTMLSpanElement>(null);
  const bar3Ref = useRef<HTMLSpanElement>(null);
  const bar4Ref = useRef<HTMLSpanElement>(null);
  const haloRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    setIsPlaying(audioService.getIsPlaying());
    setIsMuted(audioService.getIsMuted());

    let prevPlaying = audioService.getIsPlaying();
    let prevMuted = audioService.getIsMuted();

    // High performance subscriber: updates DOM directly without triggering React re-renders 60+ times/sec
    const unsubscribe = audioService.subscribe((metrics) => {
      const currentPlaying = audioService.getIsPlaying();
      const currentMuted = audioService.getIsMuted();

      if (currentPlaying !== prevPlaying) {
        prevPlaying = currentPlaying;
        setIsPlaying(currentPlaying);
      }
      if (currentMuted !== prevMuted) {
        prevMuted = currentMuted;
        setIsMuted(currentMuted);
      }

      const active = currentPlaying && !currentMuted;

      const h1 = active ? Math.max(20, Math.min(100, Math.round(metrics.bass * 100))) : 20;
      const h2 = active ? Math.max(25, Math.min(100, Math.round((metrics.bass * 0.6 + metrics.mid * 0.4) * 100))) : 20;
      const h3 = active ? Math.max(18, Math.min(100, Math.round(metrics.mid * 100))) : 20;
      const h4 = active ? Math.max(15, Math.min(100, Math.round(metrics.high * 100))) : 20;

      if (bar1Ref.current) bar1Ref.current.style.height = `${h1}%`;
      if (bar2Ref.current) bar2Ref.current.style.height = `${h2}%`;
      if (bar3Ref.current) bar3Ref.current.style.height = `${h3}%`;
      if (bar4Ref.current) bar4Ref.current.style.height = `${h4}%`;

      if (haloRef.current) {
        if (active) {
          haloRef.current.style.transform = `scale(${(1 + metrics.bass * 0.28).toFixed(3)})`;
          haloRef.current.style.opacity = `${(0.3 + metrics.bass * 0.4).toFixed(3)}`;
        }
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const handleToggleSound = async () => {
    if (!audioService.getIsPlaying()) {
      await audioService.play();
      if (audioService.getIsMuted()) {
        audioService.toggleMute();
      }
    } else {
      audioService.toggleMute();
    }
    setIsPlaying(audioService.getIsPlaying());
    setIsMuted(audioService.getIsMuted());
  };

  const isSoundActive = isPlaying && !isMuted;

  return (
    <button
      className={`sound-animated-toggle-btn ${isSoundActive ? "sound-active" : "sound-muted"}`}
      onClick={handleToggleSound}
      data-cursor="pointer"
      title={isSoundActive ? "Mute Music" : "Unmute Music"}
      aria-label={isSoundActive ? "Mute Music" : "Unmute Music"}
    >
      {/* 4 Dancing Equalizer Bars */}
      <div className="sound-eq-bars">
        <span ref={bar1Ref} className="sound-eq-bar bar-1" style={{ height: "20%" }} />
        <span ref={bar2Ref} className="sound-eq-bar bar-2" style={{ height: "20%" }} />
        <span ref={bar3Ref} className="sound-eq-bar bar-3" style={{ height: "20%" }} />
        <span ref={bar4Ref} className="sound-eq-bar bar-4" style={{ height: "20%" }} />
      </div>

      {/* Speaker Icon */}
      <span className="sound-speaker-icon-wrap">
        {isSoundActive ? (
          <Volume2 size={15} className="sound-speaker-icon" />
        ) : (
          <VolumeX size={15} className="sound-speaker-icon muted" />
        )}
      </span>

      {/* Pulsing Luminous Beat Ring */}
      {isSoundActive && (
        <span
          ref={haloRef}
          className="sound-active-halo"
          style={{ transform: "scale(1)", opacity: 0.3 }}
        />
      )}
    </button>
  );
};

export default AudioController;
