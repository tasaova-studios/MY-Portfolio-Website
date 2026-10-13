import {
  FiZap,
  FiDollarSign,
  FiAward,
  FiGift,
  FiArrowRight,
  FiBox,
} from "react-icons/fi";
import "./styles/FreelancePerks.css";

const FreelancePerks = () => {
  const perks = [
    {
      icon: <FiZap />,
      title: "1–2 Days Superfast Delivery",
      highlight: "Quick Turnaround",
      desc: "I respect tight deadlines. For 3D product visualization, Blender asset rendering, and Unity gameplay prototyping, I aim to deliver initial drafts within 24 to 48 hours.",
      accent: "#00dfd8",
    },
    {
      icon: <FiDollarSign />,
      title: "Budget-Friendly & Competitive Rates",
      highlight: "Affordable Pricing",
      desc: "High studio-grade quality without corporate agency costs. Pocket-friendly pricing designed for indie game developers, startups, and e-commerce brands.",
      accent: "#22c55e",
    },
    {
      icon: <FiBox />,
      title: "Optimized Game-Ready 3D Assets",
      highlight: "Built For High FPS",
      desc: "Creating low-poly & stylized 3D props, modular game environments, and character assets in Blender. Clean quad/tri topology, efficient UVs, and LODs engineered to run at silky-smooth 60+ FPS in Unity & mobile games.",
      accent: "#f59e0b",
    },
    {
      icon: <FiAward />,
      title: "High-Standard Craftsmanship",
      highlight: "Zero Compromises",
      desc: "Every product model is sculpted with photorealistic lighting in Blender (Cycles/Eevee). Every game system in Unity is coded with clean, modular C# for bug-free performance.",
      accent: "#c2a4ff",
    },
    {
      icon: <FiGift />,
      title: "Exclusive Perks for Repeat Clients",
      highlight: "Loyalty Benefits",
      desc: "Returning clients enjoy special promotional discounts, priority turnaround queue, complimentary minor tweaks, and dedicated direct support on recurring projects.",
      accent: "#f43f5e",
    },
  ];

  return (
    <div className="perks-section section-container" id="why-me">
      <div id="why-work-with-me" style={{ position: "relative", top: "-90px" }} />
      <div id="freelance-perks" style={{ position: "relative", top: "-90px" }} />
      <div className="perks-container">
        <div className="perks-header">
          <div className="perks-badge">Freelance Value & Client Perks</div>
          <h2 className="perks-title">Why Work With Me?</h2>
          <p className="perks-subtitle">
            Specialized in fast-turnaround Blender 3D rendering, game-ready
            optimized assets, Unity C# game dev, and stylized anime content to
            help you succeed without high costs.
          </p>
        </div>

        <div className="perks-grid">
          {perks.map((perk, index) => (
            <div
              key={index}
              className={`perk-card ${index === 4 ? "perk-card-full" : ""}`}
              style={
                {
                  "--card-accent": perk.accent,
                } as React.CSSProperties
              }
            >
              <div className="perk-icon-wrap">{perk.icon}</div>
              <h3 className="perk-card-title">{perk.title}</h3>
              <span className="perk-card-highlight">{perk.highlight}</span>
              <p className="perk-card-desc">{perk.desc}</p>
            </div>
          ))}
        </div>

        {/* Highlight for Anime & Cartoon Social Media Content */}
        <div className="perks-banner">
          <div className="perks-banner-info">
            <h4>🎬 Anime & 3D Cartoon Content Creation</h4>
            <p>
              Looking for engaging stylized 3D anime character animations and
              cartoon reels for YouTube, Facebook, or TikTok? Let's bring your
              creative ideas to life with vibrant storytelling, custom rigs, and
              eye-catching visuals!
            </p>
          </div>
          <a
            href="#social-orbit"
            className="perks-banner-cta"
            onClick={(e) => {
              e.preventDefault();
              try {
                // @ts-ignore
                const sm = window.ScrollSmoother?.get ? window.ScrollSmoother.get() : null;
                if (sm && typeof sm.scrollTo === "function") {
                  sm.scrollTo("#social-orbit", true, "center center");
                } else {
                  document.getElementById("social-orbit")?.scrollIntoView({ behavior: "smooth", block: "center" });
                }
              } catch {
                document.getElementById("social-orbit")?.scrollIntoView({ behavior: "smooth", block: "center" });
              }

              const orbit = document.getElementById("social-orbit");
              if (orbit) {
                orbit.classList.remove("orbit-highlight-pulse");
                void orbit.offsetWidth; // trigger reflow
                orbit.classList.add("orbit-highlight-pulse");
                setTimeout(() => {
                  orbit.classList.remove("orbit-highlight-pulse");
                }, 3000);
              }
            }}
          >
            Let's Talk <FiArrowRight />
          </a>
        </div>
      </div>
    </div>
  );
};

export default FreelancePerks;
