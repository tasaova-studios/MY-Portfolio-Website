import { useEffect, useState } from "react";
import "./styles/Loading.css";
import { useLoading } from "../context/LoadingProvider";
import Marquee from "react-fast-marquee";

const SafeMarquee = ({ children }: { children: React.ReactNode }) => {
  const Comp: any =
    (Marquee as any)?.default && (Marquee as any)?.default?.$$typeof
      ? (Marquee as any).default
      : (Marquee as any)?.default || Marquee;

  if (
    typeof Comp === "function" ||
    (typeof Comp === "object" && Comp !== null && (Comp.$$typeof || Comp.render))
  ) {
    return <Comp>{children}</Comp>;
  }
  return (
    <div style={{ display: "flex", overflow: "hidden", whiteSpace: "nowrap" }}>
      {children}
    </div>
  );
};

const Loading = ({ percent }: { percent: number }) => {
  const { setIsLoading } = useLoading();
  const [loaded, setLoaded] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [clicked, setClicked] = useState(false);

  const handleWelcomeClick = () => {
    if (!loaded || clicked) return;
    setClicked(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 700);
  };

  useEffect(() => {
    if (percent >= 100) {
      const timer1 = setTimeout(() => {
        setLoaded(true);
        const timer2 = setTimeout(() => {
          setIsLoaded(true);
        }, 600);
        return () => clearTimeout(timer2);
      }, 350);
      return () => clearTimeout(timer1);
    }
  }, [percent]);

  // Auto-advance if user doesn't click Welcome within 1.2s
  useEffect(() => {
    if (isLoaded && !clicked) {
      const autoTimer = setTimeout(() => {
        handleWelcomeClick();
      }, 1200);
      return () => clearTimeout(autoTimer);
    }
  }, [isLoaded, clicked]);

  function handleMouseMove(e: React.MouseEvent<HTMLElement>) {
    const { currentTarget: target } = e;
    const rect = target.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    target.style.setProperty("--mouse-x", `${x}px`);
    target.style.setProperty("--mouse-y", `${y}px`);
  }

  return (
    <>
      <div className="loading-header">
        <a href="/#" className="loader-title" data-cursor="disable" title="TASAOVA STUDIOS">
          <img
            src="/tasaova_logo.jpg"
            alt="TASAOVA STUDIOS Logo"
            className="loader-logo-img"
          />
          <span className="loader-logo-text">TASAOVA STUDIOS</span>
        </a>
        <div className={`loaderGame ${clicked && "loader-out"}`}>
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
      <div className="loading-screen">
        <div className="loading-marquee">
          <SafeMarquee>
            <span> A Creative Developer</span> <span>A Creative Designer</span>
            <span> A Creative Developer</span> <span>A Creative Designer</span>
          </SafeMarquee>
        </div>
        <div
          className={`loading-wrap ${clicked && "loading-clicked"}`}
          onMouseMove={(e) => handleMouseMove(e)}
          onClick={handleWelcomeClick}
          style={{ cursor: loaded ? "pointer" : "default" }}
          data-cursor={loaded ? "pointer" : undefined}
          role={loaded ? "button" : undefined}
          tabIndex={loaded ? 0 : undefined}
        >
          <div className="loading-hover"></div>
          <div className={`loading-button ${loaded && "loading-complete"}`}>
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
      </div>
    </>
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
