import { MdCopyright } from "react-icons/md";
import SkillsBalls from "./SkillsBalls";
import RevolvingSocialCircle from "./RevolvingSocialCircle";
import "./styles/Contact.css";

const Contact = () => {
  return (
    <div className="contact-section section-container" id="contact">
      <div className="contact-container">
        <div style={{ marginBottom: "24px" }}>
          <span
            style={{
              fontSize: "13px",
              textTransform: "uppercase",
              letterSpacing: "4px",
              color: "var(--accentColor)",
              fontWeight: 600,
            }}
          >
            04 / Skills & Contact
          </span>
          <h3 style={{ marginTop: "8px" }}>Get In Touch</h3>
        </div>

        {/* 1. Interactive Skills Arena with labeled bouncing balls (Blender, C#, AI, Unity, etc.) */}
        <SkillsBalls />

        <div className="contact-flex" style={{ alignItems: "center" }}>
          {/* 2. Revolving Circle Contact System (FB, YT, WhatsApp, Discord, Insta, TikTok) */}
          <div className="contact-box" style={{ flex: "1 1 380px", alignItems: "center" }}>
            <h4 style={{ marginBottom: "10px", textAlign: "center" }}>
              Social Orbit (Click to Connect)
            </h4>
            <RevolvingSocialCircle />
          </div>

          {/* 3. Direct Contact Details */}
          <div className="contact-box" style={{ flex: "1 1 280px" }}>
            <h4>Email</h4>
            <p>
              <a
                href="mailto:tasaovastudios.official@gmail.com"
                data-cursor="disable"
              >
                tasaovastudios.official@gmail.com
              </a>
            </p>

            <h4>Location</h4>
            <p style={{ color: "rgba(234, 229, 236, 0.95)", fontWeight: 500 }}>
              Chuadanga, Bangladesh
            </p>
            <p style={{ color: "var(--accentColor, #c2a4ff)", fontSize: "13px", marginTop: "4px" }}>
              Available for Remote Work Worldwide
            </p>
          </div>

          {/* 4. Brand & Copyright */}
          <div className="contact-box" style={{ flex: "1 1 240px" }}>
            <h2>
              Designed and Developed <br /> by <span>Sahariar Utshab</span>
            </h2>
            <h5 style={{ marginTop: "16px" }}>
              <MdCopyright /> 2026
            </h5>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
