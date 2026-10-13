import { PropsWithChildren, useEffect } from "react";
import About from "./About";
import FreelancePerks from "./FreelancePerks";
import Contact from "./Contact";
import ThankYouNote from "./ThankYouNote";
import Cursor from "./Cursor";
import Landing from "./Landing";
import Navbar from "./Navbar";
import SocialIcons from "./SocialIcons";
import WhatIDo from "./WhatIDo";
import ButterflyFlight from "./ButterflyFlight";
import FuturisticBoxTrace from "./FuturisticBoxTrace";
import setSplitText from "./utils/splitText";

const MainContainer = ({ children }: PropsWithChildren) => {
  useEffect(() => {
    setSplitText();

    let debounceTimer: ReturnType<typeof setTimeout> | null = null;
    const handleResize = () => {
      if (debounceTimer) clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        setSplitText();
      }, 200);
    };

    window.addEventListener("resize", handleResize, { passive: true });
    return () => {
      if (debounceTimer) clearTimeout(debounceTimer);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <div className="container-main">
      <Cursor />
      <Navbar />
      <SocialIcons />
      <ButterflyFlight />
      <FuturisticBoxTrace />

      {/* Interactive 3D Video Wave Background Scene */}
      {children}

      <div id="smooth-wrapper">
        <div id="smooth-content">
          <div className="container-main">
            {/* 1. Hero / Landing */}
            <Landing />

            {/* 2. About Me */}
            <About />

            {/* 3. Services / What I Do */}
            <WhatIDo />

            {/* 4. Freelance Client Perks & Value */}
            <FreelancePerks />

            {/* 5. Skills Balls & Revolving Social Circle Contact */}
            <Contact />

            {/* 6. Outro Animated Thank You Note in the Enchanted Tree Finale */}
            <ThankYouNote />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainContainer;
