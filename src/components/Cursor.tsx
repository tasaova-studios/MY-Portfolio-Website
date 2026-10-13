import { useEffect, useRef } from "react";
import "./styles/Cursor.css";
import gsap from "gsap";

const Cursor = () => {
  const cursorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Disable on devices without pointer or touch screens
    if (typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches) {
      return;
    }

    const cursor = cursorRef.current;
    if (!cursor) return;

    let hover = false;
    const mousePos = { x: -100, y: -100 };
    const cursorPos = { x: -100, y: -100 };

    const setX = gsap.quickSetter(cursor, "x", "px");
    const setY = gsap.quickSetter(cursor, "y", "px");

    let isVisible = false;

    const onMouseMove = (e: MouseEvent) => {
      mousePos.x = e.clientX;
      mousePos.y = e.clientY;
      if (!isVisible) {
        isVisible = true;
        cursor.style.opacity = "1";
      }
    };
    window.addEventListener("mousemove", onMouseMove, { passive: true });

    let animId: number;
    const loop = () => {
      if (!hover && isVisible) {
        const delay = 5.5;
        cursorPos.x += (mousePos.x - cursorPos.x) / delay;
        cursorPos.y += (mousePos.y - cursorPos.y) / delay;
        setX(cursorPos.x);
        setY(cursorPos.y);
      }
      animId = requestAnimationFrame(loop);
    };
    animId = requestAnimationFrame(loop);

    // Event delegation for [data-cursor] to support all static & dynamic elements with zero memory leak
    const handleMouseOver = (e: MouseEvent) => {
      const target = (e.target as HTMLElement)?.closest("[data-cursor]") as HTMLElement | null;
      if (!target) return;

      const cursorType = target.dataset.cursor;
      if (cursorType === "icons") {
        const rect = target.getBoundingClientRect();
        cursor.classList.add("cursor-icons");
        gsap.to(cursor, { x: rect.left, y: rect.top, duration: 0.15, overwrite: "auto" });
        cursor.style.setProperty("--cursorH", `${rect.height}px`);
        hover = true;
      } else if (cursorType === "disable") {
        cursor.classList.add("cursor-disable");
      }
    };

    const handleMouseOut = (e: MouseEvent) => {
      const target = (e.target as HTMLElement)?.closest("[data-cursor]") as HTMLElement | null;
      if (!target) return;

      const related = (e.relatedTarget as HTMLElement)?.closest("[data-cursor]");
      if (related === target) return;

      cursor.classList.remove("cursor-disable", "cursor-icons");
      hover = false;
    };

    document.addEventListener("mouseover", handleMouseOver, { passive: true });
    document.addEventListener("mouseout", handleMouseOut, { passive: true });

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseover", handleMouseOver);
      document.removeEventListener("mouseout", handleMouseOut);
    };
  }, []);

  return <div className="cursor-main" ref={cursorRef} style={{ opacity: 0 }}></div>;
};

export default Cursor;
