import { SplitText } from "gsap/SplitText";
import gsap from "gsap";
import { smoother } from "../Navbar";
import { ScrollSmoother } from "gsap/ScrollSmoother";

export function initialFX() {
  try {
    // 1. Ensure scroll is completely unlocked on body and html
    document.documentElement.style.overflow = "auto";
    document.body.style.overflow = "auto";
    document.body.style.overflowY = "auto";

    // 2. Unpause and refresh ScrollSmoother
    import("../Navbar").then((module) => {
      if (module.refreshScroll) {
        module.refreshScroll();
      }
    });

    const activeSmoother =
      smoother ||
      (typeof ScrollSmoother !== "undefined" && ScrollSmoother.get
        ? ScrollSmoother.get()
        : null);

    if (activeSmoother && typeof activeSmoother.paused === "function") {
      activeSmoother.paused(false);
    }

    import("gsap/ScrollTrigger").then(({ ScrollTrigger }) => {
      ScrollTrigger.refresh();
      setTimeout(() => {
        ScrollTrigger.refresh();
      }, 300);
      setTimeout(() => {
        ScrollTrigger.refresh();
      }, 1000);
    });

    // 3. Mark main as active
    const mainEl = document.getElementsByTagName("main")[0];
    if (mainEl) {
      mainEl.classList.add("main-active");
    }

    gsap.to("body", {
      backgroundColor: "#0b080c",
      duration: 0.5,
      delay: 0.2,
    });

    // 4. Clean animation for landing intro & info text (prevent single-letter vertical stacking)
    try {
      const targets = document.querySelectorAll(".landing-info h3, .landing-intro h2");
      if (targets.length) {
        gsap.fromTo(
          targets,
          { opacity: 0, y: 35, filter: "blur(4px)" },
          {
            opacity: 1,
            duration: 0.9,
            filter: "blur(0px)",
            ease: "power3.out",
            y: 0,
            stagger: 0.1,
            delay: 0.15,
            clearProps: "all",
          }
        );
      }
    } catch (e) {
      console.warn("Landing text animation warning:", e);
    }

    // 5. Animate individual rainbow characters
    const charElements = document.querySelectorAll(".landing-char");
    if (charElements.length) {
      gsap.fromTo(
        charElements,
        { opacity: 0, y: 60, filter: "blur(5px)" },
        {
          opacity: 1,
          duration: 1.1,
          filter: "blur(0px)",
          ease: "power3.inOut",
          y: 0,
          stagger: 0.025,
          delay: 0.25,
          clearProps: "all",
        }
      );
    }

    // 6. Fade in navigation and chrome
    gsap.fromTo(
      [".header", ".icons-section", ".nav-fade"],
      { opacity: 0 },
      {
        opacity: 1,
        duration: 1,
        ease: "power1.inOut",
        delay: 0.1,
      }
    );
  } catch (err) {
    console.error("initialFX execution error:", err);
    // Even if animation fails, NEVER leave scroll locked!
    document.documentElement.style.overflow = "auto";
    document.body.style.overflow = "auto";
    document.body.style.overflowY = "auto";
  }
}
