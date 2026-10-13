import { useEffect, useState, useRef } from "react";
import "./styles/Loading.css";
import "./styles/EntryOverlay.css";
import { useLoading } from "../context/LoadingProvider";
import { audioService } from "../services/audioService";
import { Volume2, Sparkles, Headphones } from "lucide-react";
import WaterWaveCanvas from "./WaterWaveCanvas";

const Loading = ({ percent }: { percent: number }) => {
  const { setIsLoading } = useLoading();
  const [loaded, setLoaded] = useState(false);
  const [showWelcomeCard, setShowWelcomeCard] = useState(false);
  const [isFading, setIsFading] = useState(false);
  const wrapRef = useRef<HTMLDivElement | null>(null);

  // Lock scrolling while loading or welcome screen is active
  useEffect(() => {
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";

    return () => {
      document.documentElement.style.overflow = "auto";
      document.body.style.overflow = "auto";
    };
  }, []);

  // When percent reaches 100%, transition the pill button to "Welcome", then reveal the Welcome Card
  useEffect(() => {
    if (percent >= 100 && !loaded) {
      setLoaded(true);
      const timer = setTimeout(() => {
        setShowWelcomeCard(true);
      }, 750);
      return () => clearTimeout(timer);
    }
  }, [percent, loaded]);

  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    const target = e.currentTarget;
    const rect = target.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    target.style.setProperty("--mouse-x", `${x}px`);
    target.style.setProperty("--mouse-y", `${y}px`);
  };

  const handleEnter = async (e?: React.MouseEvent | React.TouchEvent) => {
    if (e) {
      e.stopPropagation();
    }
    if (isFading) return;
    setIsFading(true);

    // 1. Play background audio & ensure unmuted
    try {
      if (audioService.getIsMuted()) {
        audioService.toggleMute();
      }
      await audioService.play();
    } catch (err) {
      console.warn("Autoplay unlock error:", err);
    }

    // 2. Trigger landing page animation & unlock scroll
    try {
      const module = await import("./utils/initialFX");
      if (module.initialFX) {
        module.initialFX();
      }
    } catch (err) {
      console.warn("initialFX trigger error:", err);
    }

    // 3. Fully unlock scrolling on window, document, and body
    document.documentElement.style.overflow = "auto";
    document.body.style.overflow = "auto";
    document.body.style.overflowY = "auto";

    // 4. Smooth fade out and unmount loading
    setTimeout(() => {
      setIsLoading(false);
      document.documentElement.style.overflow = "auto";
      document.body.style.overflow = "auto";
      document.body.style.overflowY = "auto";

      import("./Navbar").then((module) => {
        if (module.refreshScroll) {
          module.refreshScroll();
        }
      });
      import("gsap/ScrollTrigger").then(({ ScrollTrigger }) => {
        ScrollTrigger.refresh(true);
      });
    }, 600);

    setTimeout(() => {
      import("gsap/ScrollTrigger").then(({ ScrollTrigger }) => {
        ScrollTrigger.refresh(true);
      });
    }, 1100);
  };

  return (
    <div className={`loading-screen ${isFading ? "fade-out" : ""}`}>
      {/* Bioluminescent Water Wave Background */}
      <WaterWaveCanvas />

      {/* Top Header: Brand Logo/Title & Bouncing Ball Mini-Game */}
      <div className="loading-header">
        <div className="loader-title">
          <div className="loader-logo-ring">
            <img
              src="/tasaova_logo.jpg"
              alt="TASAOVA STUDIOS"
              className="loader-logo-img"
              onError={(e) => {
                const target = e.currentTarget;
                if (target.src !== window.location.origin + "/images/tasaova_logo.jpg") {
                  target.src = "/images/tasaova_logo.jpg";
                }
              }}
            />
          </div>
          <span>TASAOVA STUDIOS</span>
        </div>

        <div className={`loaderGame ${showWelcomeCard ? "loader-out" : ""}`}>
          <div className="loaderGame-container">
            <div className="loaderGame-in">
              {[...Array(27)].map((_, index) => (
                <div className="loaderGame-line" key={index}></div>
              ))}
            </div>
            <div className="loaderGame-ball"></div>
          </div>
        </div>
      </div>

      {/* Running Marquee in Background */}
      <div className="loading-marquee" aria-hidden="true">
        <div className="loading-marquee-track">
          <span>3D GAME DEVELOPER</span>
          <span>CREATIVE 3D ARTIST</span>
          <span>PRODUCT RENDERING &amp; ANIMATION</span>
          <span>AI WORKFLOW SPECIALIST</span>
          <span>TASAOVA STUDIOS</span>
          <span>3D GAME DEVELOPER</span>
          <span>CREATIVE 3D ARTIST</span>
          <span>PRODUCT RENDERING &amp; ANIMATION</span>
          <span>AI WORKFLOW SPECIALIST</span>
          <span>TASAOVA STUDIOS</span>
        </div>
      </div>

      {/* Center Interactive Stage: Original Loading Pill or Welcome Card */}
      {!showWelcomeCard ? (
        <div
          ref={wrapRef}
          className="loading-wrap"
          onMouseMove={handleMouseMove}
          onClick={() => {
            if (percent >= 100) {
              setShowWelcomeCard(true);
            }
          }}
        >
          <div className="loading-hover"></div>
          <div className={`loading-button ${loaded ? "loading-complete" : ""}`}>
            <div className="loading-container">
              <div className="loading-content">
                <div className="loading-content-in">
                  Loading <span>{percent}%</span>
                </div>
              </div>
              <div className="loading-box"></div>
            </div>
            <div className="loading-content2">
              <span>Welcome</span>
            </div>
          </div>
        </div>
      ) : (
        /* Welcome Card: Tap or Click to Enter with Sound */
        <div
          className="welcome-card-stage"
          onClick={() => handleEnter()}
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
            <p className="entry-desc">
              Tap or click anywhere to enter immersive sound &amp; experience
            </p>
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
      )}
    </div>
  );
};

export default Loading;

export const setProgress = (setLoading: (value: number) => void) => {
  let percent: number = 0;

  let interval = setInterval(() => {
    if (percent <= 50) {
      let rand = Math.round(Math.random() * 5);
      percent = percent + rand;
      setLoading(percent);
    } else {
      clearInterval(interval);
      interval = setInterval(() => {
        percent = percent + Math.round(Math.random());
        setLoading(percent);
        if (percent > 91) {
          clearInterval(interval);
        }
      }, 2000);
    }
  }, 100);

  function clear() {
    clearInterval(interval);
    setLoading(100);
  }

  function loaded() {
    return new Promise<number>((resolve) => {
      clearInterval(interval);
      interval = setInterval(() => {
        if (percent < 100) {
          percent++;
          setLoading(percent);
        } else {
          resolve(percent);
          clearInterval(interval);
        }
      }, 2);
    });
  }
  return { loaded, percent, clear };
};
