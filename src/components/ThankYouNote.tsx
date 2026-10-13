import React from "react";
import { FaHeart, FaWhatsapp, FaArrowUp } from "react-icons/fa6";
import { HiOutlineMail } from "react-icons/hi";
import { BsStars } from "react-icons/bs";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import "./styles/ThankYouNote.css";

const WHATSAPP_URL =
  "https://wa.me/8801795747429?text=Hello%20Sahariar,%20I%20saw%20your%20TASAOVA%20STUDIOS%20portfolio%20and%20would%20love%20to%20discuss%20a%20project!";

const EMAIL_URL =
  "mailto:tasaovastudios.official@gmail.com?subject=Project%20Inquiry%20-%20TASAOVA%20STUDIOS&body=Hello%20Sahariar,%0D%0A%0D%0AI%20checked%20out%20your%20portfolio%20and%20would%20like%20to%20collaborate!";

const ThankYouNote: React.FC = () => {
  // Smoothly scroll to an element or position with high-end easing
  const smoothScrollTo = (target: string | number, position: string = "center center") => {
    try {
      const sm =
        typeof ScrollSmoother !== "undefined" && ScrollSmoother.get
          ? ScrollSmoother.get()
          : null;
      if (sm && typeof sm.scrollTo === "function") {
        sm.scrollTo(target, true, position);
        return;
      }
    } catch {
      // Fallback to requestAnimationFrame easing below
    }

    if (typeof target === "number") {
      const startY = window.scrollY;
      const duration = 1200;
      const startTime = performance.now();

      const step = (currentTime: number) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        // Easing: easeInOutQuart
        const ease =
          progress < 0.5
            ? 8 * progress * progress * progress * progress
            : 1 - Math.pow(-2 * progress + 2, 4) / 2;

        window.scrollTo(0, startY * (1 - ease));
        if (progress < 1) {
          requestAnimationFrame(step);
        }
      };
      requestAnimationFrame(step);
    } else {
      const el = document.querySelector(target);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  };

  const scrollToOrbit = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    smoothScrollTo("#social-orbit", "center center");

    const orbit = document.getElementById("social-orbit");
    if (orbit) {
      orbit.classList.remove("orbit-highlight-pulse");
      void orbit.offsetWidth; // trigger reflow
      orbit.classList.add("orbit-highlight-pulse");
      setTimeout(() => {
        orbit.classList.remove("orbit-highlight-pulse");
      }, 3000);
    }
  };

  const scrollToTop = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    smoothScrollTo(0, "top top");
  };

  const handleWhatsApp = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.open(WHATSAPP_URL, "_blank", "noopener,noreferrer");
  };

  const handleEmail = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.location.href = EMAIL_URL;
  };

  return (
    <section className="thankyou-section" id="thank-you">
      <div className="thankyou-backdrop-glow"></div>

      {/* Floating Sparkle Particles */}
      <div className="thankyou-sparkle sparkle-1">✦</div>
      <div className="thankyou-sparkle sparkle-2">★</div>
      <div className="thankyou-sparkle sparkle-3">✨</div>
      <div className="thankyou-sparkle sparkle-4">✦</div>

      <div className="thankyou-card">
        {/* Animated Badge */}
        <div className="thankyou-badge">
          <BsStars className="badge-star-icon" />
          <span>PORTFOLIO OUTRO • APPRECIATION</span>
          <BsStars className="badge-star-icon" />
        </div>

        {/* Animated Heading with cosmic shimmer */}
        <h2 className="thankyou-heading">
          Thank You for <span className="shimmer-text">Exploring</span> My Portfolio!
        </h2>

        {/* Grateful Personal Message */}
        <p className="thankyou-message">
          It means the world that you took the time to explore my creative space.
          Whether you need photorealistic <strong>3D product visualizations</strong>,
          custom <strong>Blender renders</strong>, indie <strong>Unity (C#) gameplay</strong>,
          or rapid <strong>AI-accelerated web pipelines</strong> — I’m always ready to craft
          something extraordinary for your brand.
        </p>

        {/* Interactive Action Hub (All 4 Verified Working Buttons) */}
        <div className="thankyou-actions">
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleWhatsApp}
            className="thankyou-btn thankyou-btn-whatsapp"
            title="Chat directly with Sahariar on WhatsApp (+880 1795-747429)"
            data-cursor="disable"
          >
            <FaWhatsapp className="btn-icon" />
            <span>Chat on WhatsApp</span>
          </a>

          <a
            href={EMAIL_URL}
            onClick={handleEmail}
            className="thankyou-btn thankyou-btn-email"
            title="Send an email to tasaovastudios.official@gmail.com"
            data-cursor="disable"
          >
            <HiOutlineMail className="btn-icon" />
            <span>Send an Email</span>
          </a>

          <button
            type="button"
            onClick={scrollToOrbit}
            className="thankyou-btn thankyou-btn-orbit"
            title="Smoothly slide back to Social Orbit"
            data-cursor="disable"
          >
            <span>Social Orbit 💫</span>
          </button>

          <button
            type="button"
            onClick={scrollToTop}
            className="thankyou-btn thankyou-btn-top"
            title="Smoothly glide back to the top of the website"
            data-cursor="disable"
          >
            <FaArrowUp className="btn-icon" />
            <span>Top</span>
          </button>
        </div>

        {/* Subtle Sign-off */}
        <div className="thankyou-footer">
          <span>Crafted with</span>
          <FaHeart className="heart-icon" />
          <span>by <strong>Sahariar Utshab</strong> • TASAOVA STUDIOS</span>
        </div>
      </div>
    </section>
  );
};

export default ThankYouNote;
