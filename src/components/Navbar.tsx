import { useEffect } from "react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import HoverLinks from "./HoverLinks";
import AudioController from "./AudioController";
import { gsap } from "gsap";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import { useLoading } from "../context/LoadingProvider";
import "./styles/Navbar.css";

gsap.registerPlugin(ScrollSmoother, ScrollTrigger);
export let smoother: ScrollSmoother | null = null;

export const refreshScroll = () => {
  try {
    document.documentElement.style.overflow = "auto";
    document.body.style.overflow = "auto";
    document.body.style.overflowY = "auto";

    const isDesktop =
      typeof window !== "undefined" && window.innerWidth > 1024;

    if (isDesktop) {
      const existing = ScrollSmoother.get();
      if (existing) {
        smoother = existing;
        if (typeof smoother.paused === "function") {
          smoother.paused(false);
        }
      } else {
        smoother = ScrollSmoother.create({
          wrapper: "#smooth-wrapper",
          content: "#smooth-content",
          smooth: 0.45,
          speed: 1,
          effects: false,
          autoResize: true,
          ignoreMobileResize: true,
        });
      }
    }
    ScrollTrigger.refresh(true);
  } catch (err) {
    console.warn("Scroll refresh error:", err);
  }
};

const Navbar = () => {
  const loadingContext = useLoading();
  const isLoading = loadingContext ? loadingContext.isLoading : false;
  const isEntered = loadingContext ? loadingContext.isEntered : false;

  useEffect(() => {
    if (!isLoading && isEntered) {
      const timer = setTimeout(() => {
        refreshScroll();
      }, 80);
      const timer2 = setTimeout(() => {
        refreshScroll();
      }, 400);
      const timer3 = setTimeout(() => {
        refreshScroll();
      }, 900);

      window.addEventListener("resize", refreshScroll);

      return () => {
        clearTimeout(timer);
        clearTimeout(timer2);
        clearTimeout(timer3);
        window.removeEventListener("resize", refreshScroll);
      };
    }
  }, [isLoading, isEntered]);

  useEffect(() => {
    const cleanupFns: (() => void)[] = [];
    const links = document.querySelectorAll(".header ul a, .navbar-title");
    links.forEach((elem) => {
      const element = elem as HTMLAnchorElement;
      const handleClick = (e: MouseEvent) => {
        e.preventDefault();
        const currentElem = e.currentTarget as HTMLAnchorElement;
        const section = currentElem.getAttribute("data-href") || currentElem.getAttribute("href");

        if (section === "#landing" || section === "#" || section === "/#" || section === "#landingDiv") {
          if (smoother && typeof smoother.scrollTo === "function") {
            smoother.scrollTo(0, true);
          } else {
            window.scrollTo({ top: 0, behavior: "smooth" });
          }
          return;
        }

        if (smoother && typeof smoother.scrollTo === "function" && section) {
          try {
            const targetEl = document.querySelector(section) || 
              (section === "#freelance-perks" || section === "#why-me" ? document.querySelector("#why-me, #why-work-with-me, #freelance-perks") : null);
            if (targetEl) {
              smoother.scrollTo(targetEl, true, "top top");
            } else {
              smoother.scrollTo(section, true, "top top");
            }
          } catch {
            const target = document.querySelector(section) || 
              document.querySelector("#why-me, #why-work-with-me, #freelance-perks");
            target?.scrollIntoView({ behavior: "smooth" });
          }
        } else if (section) {
          const target = document.querySelector(section) || 
            (section === "#freelance-perks" || section === "#why-me" ? document.querySelector("#why-me, #why-work-with-me, #freelance-perks") : null);
          target?.scrollIntoView({ behavior: "smooth" });
        }
      };

      element.addEventListener("click", handleClick);
      cleanupFns.push(() => element.removeEventListener("click", handleClick));
    });

    const onResize = () => {
      if (smoother && typeof ScrollSmoother !== "undefined" && ScrollSmoother.refresh) {
        ScrollSmoother.refresh(true);
      }
      ScrollTrigger.refresh();
    };

    window.addEventListener("resize", onResize, { passive: true });
    return () => {
      cleanupFns.forEach((fn) => fn());
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <>
      <div className="header">
        <a
          href="/#"
          className="navbar-title"
          data-cursor="disable"
          title="TASAOVA STUDIOS"
        >
          <img
            src="/tasaova_logo.jpg"
            alt="TASAOVA STUDIOS Logo"
            className="navbar-logo-img"
            onError={(e) => {
              const target = e.currentTarget;
              if (target.src !== window.location.origin + "/images/tasaova_logo.jpg") {
                target.src = "/images/tasaova_logo.jpg";
              }
            }}
          />
          <span className="navbar-logo-text">TASAOVA STUDIOS</span>
        </a>

        {/* Center Pill Nav Bar */}
        <nav className="header-nav-pill">
          <ul className="header-links">
            <li>
              <a data-href="#landing" href="#landing">
                <HoverLinks text="HOME" />
              </a>
            </li>
            <li>
              <a data-href="#about" href="#about">
                <HoverLinks text="ABOUT" />
              </a>
            </li>
            <li>
              <a data-href="#what-i-do" href="#what-i-do">
                <HoverLinks text="SERVICES" />
              </a>
            </li>
            <li>
              <a data-href="#why-me" href="#why-me">
                <HoverLinks text="WHY ME" />
              </a>
            </li>
            <li>
              <a data-href="#contact" href="#contact">
                <HoverLinks text="CONTACT" />
              </a>
            </li>
          </ul>
        </nav>

        {/* Right Controls: Audio Capsule + Email Capsule */}
        <div className="navbar-right-group">
          <AudioController />
          <a
            href="mailto:tasaovastudios.official@gmail.com"
            className="navbar-connect-btn"
            data-cursor="disable"
            title="Contact via Email"
          >
            <span className="online-indicator">
              <span className="online-ping"></span>
              <span className="online-dot"></span>
            </span>
            <span className="navbar-email-text">tasaovastudios.official@gmail.com</span>
          </a>
        </div>
      </div>
    </>
  );
};

export default Navbar;
