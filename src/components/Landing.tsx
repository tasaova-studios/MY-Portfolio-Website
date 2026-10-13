import { PropsWithChildren, useEffect, useRef } from "react";
import "./styles/Landing.css";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollSmoother } from "gsap/ScrollSmoother";

gsap.registerPlugin(ScrollTrigger);

const Landing = ({ children }: PropsWithChildren) => {
  const titleRef = useRef<HTMLHeadingElement>(null);
  const backTrackRef = useRef<HTMLDivElement>(null);
  const frontTrackRef = useRef<HTMLDivElement>(null);
  const scrollIndicatorRef = useRef<HTMLDivElement>(null);

  const handleScrollClick = () => {
    const target = document.querySelector("#about");
    if (!target) return;

    try {
      const smoother = ScrollSmoother.get();
      if (smoother && typeof smoother.scrollTo === "function") {
        smoother.scrollTo(target, true, "top top");
        return;
      }
    } catch {}

    target.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    const el = titleRef.current;
    const backTrack = backTrackRef.current;
    const frontTrack = frontTrackRef.current;
    const indicator = scrollIndicatorRef.current;

    const ctx = gsap.context(() => {
      // 1. Subtle, gentle parallax elevation without disappearing or blurring
      if (el) {
        const chars = el.querySelectorAll<HTMLSpanElement>(".landing-char");
        if (chars.length) {
          gsap.to(chars, {
            y: -15,
            stagger: 0.01,
            ease: "none",
            scrollTrigger: {
              trigger: ".landing-section",
              start: "top top",
              end: "bottom top",
              scrub: 0.5,
            },
          });
        }
      }

      // 2. Exact reference layered text animation loop
      if (backTrack && frontTrack) {
        const tl = gsap.timeline({
          repeat: -1,
          repeatDelay: 2.2,
        });

        tl.to([backTrack, frontTrack], {
          yPercent: -50,
          duration: 0.7,
          ease: "power3.inOut",
        }).to([backTrack, frontTrack], {
          yPercent: 0,
          duration: 0.7,
          delay: 2.2,
          ease: "power3.inOut",
        });
      }

      // 3. Subtle floating Scroll to Explore indicator that fades out on scroll
      if (indicator) {
        gsap.to(indicator, {
          opacity: 0,
          y: 24,
          filter: "blur(6px)",
          ease: "power2.out",
          scrollTrigger: {
            trigger: ".landing-section",
            start: "top top",
            end: "18% top",
            scrub: 0.8,
          },
        });
      }
    });

    return () => ctx.revert();
  }, []);

  return (
    <>
      <div className="landing-section" id="landing">
        <div className="landing-container">
          <div className="landing-intro" style={{ width: "max-content" }}>
            <h2 style={{ whiteSpace: "nowrap" }}>Hello! I'm</h2>
            <h1
              ref={titleRef}
              className="main-title"
              aria-label="SAHARIAR UTSHAB"
              style={{ whiteSpace: "nowrap" }}
            >
              <span className="first-name" style={{ whiteSpace: "nowrap", display: "block" }}>
                {"SAHARIAR".split("").map((c, i) => (
                  <span
                    key={`f-${i}`}
                    className="landing-char inline-block rainbow-char"
                    style={{
                      display: "inline-block",
                      animationDelay: `${i * -0.22}s`,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {c}
                  </span>
                ))}
              </span>
              <span className="last-name" style={{ whiteSpace: "nowrap", display: "block" }}>
                {"UTSHAB".split("").map((c, i) => (
                  <span
                    key={`l-${i}`}
                    className="landing-char inline-block rainbow-char"
                    style={{
                      display: "inline-block",
                      animationDelay: `${(i + 8) * -0.22}s`,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {c}
                  </span>
                ))}
              </span>
            </h1>
          </div>
          <div className="landing-info" style={{ width: "max-content" }}>
            <h3 style={{ whiteSpace: "nowrap" }}>A Creative</h3>
            
            {/* Top layered word: purple, submerged fade behind the front text */}
            <div className="landing-h2-back">
              <div className="landing-back-track" ref={backTrackRef}>
                <div className="landing-word">DESIGNER</div>
                <div className="landing-word">DEVELOPER</div>
              </div>
            </div>

            {/* Front layered word: solid white, overlapping foreground */}
            <div className="landing-h2-front">
              <div className="landing-front-track" ref={frontTrackRef}>
                <div className="landing-word">DEVELOPER</div>
                <div className="landing-word">DESIGNER</div>
              </div>
            </div>
          </div>

          {/* Subtle Floating 'Scroll to Explore' Indicator */}
          <div
            ref={scrollIndicatorRef}
            className="landing-scroll-indicator"
            onClick={handleScrollClick}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                handleScrollClick();
              }
            }}
            role="button"
            tabIndex={0}
            data-cursor="pointer"
            aria-label="Scroll to explore"
          >
            <div className="scroll-indicator-mouse">
              <span className="scroll-indicator-wheel" />
            </div>
            <div className="scroll-indicator-content">
              <span className="scroll-indicator-text">SCROLL TO EXPLORE</span>
              <svg
                className="scroll-indicator-chevron"
                width="10"
                height="6"
                viewBox="0 0 10 6"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <path
                  d="M1 1L5 5L9 1"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>
        </div>
        {children}
      </div>
    </>
  );
};

export default Landing;
