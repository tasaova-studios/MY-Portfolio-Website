import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import { SplitText } from "gsap/SplitText";

interface ParaElement extends HTMLElement {
  anim?: gsap.core.Animation;
  split?: SplitText;
}

gsap.registerPlugin(ScrollTrigger, ScrollSmoother, SplitText);

let isRefreshListenerAttached = false;
let resizeTimer: ReturnType<typeof setTimeout> | null = null;

export default function setSplitText() {
  ScrollTrigger.config({ ignoreMobileResize: true });
  if (typeof window === "undefined" || window.innerWidth < 900) return;

  const paras: NodeListOf<ParaElement> = document.querySelectorAll(".para");
  const titles: NodeListOf<ParaElement> = document.querySelectorAll(".title");

  const TriggerStart = "top 85%";
  // Never reverse or hide text when scrolling - keep text permanently visible once revealed
  const ToggleAction = "play none none none";

  paras.forEach((para: ParaElement) => {
    para.classList.add("visible");
    if (para.anim) {
      para.anim.progress(1).kill();
      para.split?.revert();
      para.anim = undefined;
      para.split = undefined;
    }

    try {
      para.split = new SplitText(para, {
        type: "lines,words",
        linesClass: "split-line",
      });

      if (para.split && para.split.words) {
        para.anim = gsap.fromTo(
          para.split.words,
          { autoAlpha: 0, y: 35 },
          {
            autoAlpha: 1,
            scrollTrigger: {
              trigger: para.parentElement || para,
              toggleActions: ToggleAction,
              start: TriggerStart,
              once: true,
            },
            duration: 0.45,
            ease: "power2.out",
            y: 0,
            stagger: 0.008,
            clearProps: "transform,opacity,visibility",
          }
        );
      }
    } catch {
      // Graceful fallback
    }
  });

  titles.forEach((title: ParaElement) => {
    if (title.anim) {
      title.anim.progress(1).kill();
      title.split?.revert();
      title.anim = undefined;
      title.split = undefined;
    }
    try {
      title.split = new SplitText(title, {
        type: "chars,lines",
        linesClass: "split-line",
      });
      if (title.split && title.split.chars) {
        title.anim = gsap.fromTo(
          title.split.chars,
          { autoAlpha: 0, y: 30, rotate: 6 },
          {
            autoAlpha: 1,
            scrollTrigger: {
              trigger: title.parentElement || title,
              toggleActions: ToggleAction,
              start: TriggerStart,
              once: true,
            },
            duration: 0.35,
            ease: "power2.out",
            y: 0,
            rotate: 0,
            stagger: 0.015,
            clearProps: "transform,opacity,visibility",
          }
        );
      }
    } catch {
      // Graceful fallback
    }
  });

  if (!isRefreshListenerAttached) {
    isRefreshListenerAttached = true;
    ScrollTrigger.addEventListener("refreshInit", () => {
      if (resizeTimer) clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        setSplitText();
      }, 250);
    });
  }
}
