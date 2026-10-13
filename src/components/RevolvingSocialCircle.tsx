import React from "react";
import {
  FaFacebookF,
  FaYoutube,
  FaWhatsapp,
  FaDiscord,
  FaInstagram,
  FaTiktok,
} from "react-icons/fa6";
import "./styles/RevolvingSocialCircle.css";

// You can easily update these 6 links with your actual URLs whenever ready!
export const SOCIAL_REDIRECT_LINKS = {
  fb: "https://www.facebook.com/tasaovastudios",
  yt: "https://www.youtube.com/@TasaovaStudios",
  whatsapp: "https://wa.me/8801795747429",
  discord: "https://discord.com/users/1192417789680566373",
  insta: "https://www.instagram.com/tasaovastudios.official",
  tiktok: "https://www.tiktok.com/@tasaovastudios.official",
};

interface SocialItem {
  id: string;
  name: string;
  shortLabel: string;
  url: string;
  icon: React.ReactNode;
  color: string;
  glow: string;
}

const RevolvingSocialCircle = () => {
  const items: SocialItem[] = [
    {
      id: "fb",
      name: "Facebook",
      shortLabel: "FB",
      url: SOCIAL_REDIRECT_LINKS.fb,
      icon: <FaFacebookF />,
      color: "#1877F2",
      glow: "rgba(24, 119, 242, 0.6)",
    },
    {
      id: "yt",
      name: "YouTube",
      shortLabel: "YT",
      url: SOCIAL_REDIRECT_LINKS.yt,
      icon: <FaYoutube />,
      color: "#FF0000",
      glow: "rgba(255, 0, 0, 0.6)",
    },
    {
      id: "whatsapp",
      name: "WhatsApp",
      shortLabel: "WhatsApp",
      url: SOCIAL_REDIRECT_LINKS.whatsapp,
      icon: <FaWhatsapp />,
      color: "#25D366",
      glow: "rgba(37, 211, 102, 0.6)",
    },
    {
      id: "discord",
      name: "Discord",
      shortLabel: "Discord",
      url: SOCIAL_REDIRECT_LINKS.discord,
      icon: <FaDiscord />,
      color: "#5865F2",
      glow: "rgba(88, 101, 242, 0.6)",
    },
    {
      id: "insta",
      name: "Instagram",
      shortLabel: "Insta",
      url: SOCIAL_REDIRECT_LINKS.insta,
      icon: <FaInstagram />,
      color: "#E1306C",
      glow: "rgba(225, 48, 108, 0.6)",
    },
    {
      id: "tiktok",
      name: "TikTok",
      shortLabel: "TikTok",
      url: SOCIAL_REDIRECT_LINKS.tiktok,
      icon: <FaTiktok />,
      color: "#00F2FE",
      glow: "rgba(0, 242, 254, 0.6)",
    },
  ];

  // Circle orbit radius
  const radius = 140; // In px for desktop (scaled via CSS container for mobile)

  return (
    <div className="revolving-circle-container" id="social-orbit">
      {/* Dashed circular orbit track */}
      <div className="revolving-track" />

      {/* Central Core */}
      <a
        href="mailto:tasaovastudios.official@gmail.com"
        className="revolving-center-hub"
        title="Email TASAOVA STUDIOS (tasaovastudios.official@gmail.com)"
        data-cursor="disable"
      >
        <span className="revolving-center-title">CONNECT</span>
        <span className="revolving-center-sub">6 Channels</span>
      </a>

      {/* 360-degree Revolving Orbit */}
      <div className="revolving-orbit">
        {items.map((item, index) => {
          // Angle in radians (6 items = 60 degrees apart)
          const angle = (index * (360 / items.length) * Math.PI) / 180;
          const cosVal = Number(Math.cos(angle).toFixed(5));
          const sinVal = Number(Math.sin(angle).toFixed(5));

          return (
            <div
              key={item.id}
              className="orbit-node"
              style={{
                transform: `translate(calc(var(--orbit-radius, 140px) * ${cosVal}), calc(var(--orbit-radius, 140px) * ${sinVal}))`,
              }}
            >
              <div className="orbit-node-inner">
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="orbit-button"
                  data-cursor="disable"
                  title={`Open ${item.name}`}
                  style={
                    {
                      "--item-color": item.color,
                      "--item-glow": item.glow,
                    } as React.CSSProperties
                  }
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                >
                  <span className="orbit-icon">{item.icon}</span>
                  <span className="orbit-label">{item.shortLabel}</span>
                </a>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RevolvingSocialCircle;
