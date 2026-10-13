import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "./styles/About.css";
import { Sparkles, Gamepad2, Globe, Zap, Video } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

const About = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const card = cardRef.current;
    if (!section || !card) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top 82%",
          toggleActions: "play none none none",
          once: true,
        },
      });

      // 1. Card rises from below with sleek blur & gentle scale reveal
      tl.from(card, {
        y: 65,
        opacity: 0,
        scale: 0.94,
        filter: "blur(10px)",
        duration: 0.9,
        ease: "power3.out",
        clearProps: "transform,filter,opacity",
      })
      // 2. Header and descriptive paragraphs glide in with smooth stagger
      .from(
        card.querySelectorAll(".about-header, .about-lead, .about-body, .about-body-secondary"),
        {
          y: 28,
          opacity: 0,
          stagger: 0.1,
          duration: 0.65,
          ease: "power2.out",
          clearProps: "transform,opacity",
        },
        "-=0.6"
      )
      // 3. Highlight skill cards pop in with organic tactile response
      .from(
        card.querySelectorAll(".highlight-item"),
        {
          y: 32,
          opacity: 0,
          scale: 0.92,
          stagger: 0.1,
          duration: 0.55,
          ease: "back.out(1.4)",
          clearProps: "transform,opacity,scale",
        },
        "-=0.35"
      );
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <div className="about-section" id="about" ref={sectionRef}>
      <div className="about-me">
        <div className="about-card" ref={cardRef}>
          <div className="about-header">
            <div className="about-badge">
              <Sparkles size={13} className="about-badge-icon" />
              <span>CREATIVE TECHNOLOGIST &amp; 3D ARTIST</span>
            </div>
            <h3 className="about-title">About Me</h3>
          </div>

          <p className="about-lead">
            I am an <span className="text-highlight-purple">Indie Game Developer</span>,{" "}
            <span className="text-highlight-cyan">3D Visual Artist</span>, and{" "}
            <span className="text-highlight-white">Modern Web Developer</span>.
          </p>

          <p className="about-body">
            From crafting immersive worlds and mechanics in{" "}
            <strong className="text-glow-accent">Unity (C#)</strong> to creating{" "}
            <strong className="text-glow-white">photorealistic 3D product renders</strong> and{" "}
            <strong className="text-glow-purple">cinematic product animations</strong> in Blender,
            I bring digital concepts to life with high visual fidelity. Alongside 3D, I build
            sleek, responsive, and animated websites tailored for modern brands.
          </p>

          <p className="about-body-secondary">
            As a creator deeply synchronized with{" "}
            <span className="text-highlight-ai">cutting-edge AI workflows</span>, I constantly
            evolve with the latest tech to supercharge production speed—delivering studio-grade
            polish in record time.
          </p>

          <div className="about-highlights-grid">
            <div className="highlight-item">
              <div className="item-icon-box icon-purple">
                <Gamepad2 size={16} />
              </div>
              <div className="item-text">
                <span className="item-title">Game Development</span>
                <span className="item-desc">Unity C# &amp; Mechanics</span>
              </div>
            </div>

            <div className="highlight-item">
              <div className="item-icon-box icon-cyan">
                <Video size={16} />
              </div>
              <div className="item-text">
                <span className="item-title">3D Renders &amp; Animation</span>
                <span className="item-desc">Blender Product Visuals</span>
              </div>
            </div>

            <div className="highlight-item">
              <div className="item-icon-box icon-pink">
                <Globe size={16} />
              </div>
              <div className="item-text">
                <span className="item-title">Modern Web Dev</span>
                <span className="item-desc">Fast, Animated Websites</span>
              </div>
            </div>

            <div className="highlight-item">
              <div className="item-icon-box icon-amber">
                <Zap size={16} />
              </div>
              <div className="item-text">
                <span className="item-title">AI-Powered Speed</span>
                <span className="item-desc">Supercharged Delivery</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
