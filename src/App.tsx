import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { AboutSection } from './components/AboutSection';
import { TechStackSection } from './components/TechStackSection';
import { ProjectsSection } from './components/ProjectsSection';
import { JourneySection } from './components/JourneySection';
import { FocusSection } from './components/FocusSection';
import { ContactSection } from './components/ContactSection';
import { Footer } from './components/Footer';
import { CustomCursor } from './components/CustomCursor';

export const App: React.FC = () => {
  const [activeSection, setActiveSection] = useState<string>('home');

  useEffect(() => {
    const sections = ['home', 'about', 'skills', 'projects', 'journey', 'contact'];

    const handleScroll = () => {
      const scrollPos = window.scrollY + 250;

      for (let i = sections.length - 1; i >= 0; i--) {
        const el = document.getElementById(sections[i]);
        if (el && el.offsetTop <= scrollPos) {
          setActiveSection(sections[i]);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[#07080D] text-[#F5F7FF] relative selection:bg-[#5B8CFF]/30 selection:text-white">
      {/* Premium Desktop Custom Cursor */}
      <CustomCursor />

      {/* Floating Glass Navbar */}
      <Navbar activeSection={activeSection} />

      {/* Main Content Layout */}
      <main id="main-content">
        <HeroSection />
        <AboutSection />
        <TechStackSection />
        <ProjectsSection />
        <JourneySection />
        <FocusSection />
        <ContactSection />
      </main>

      {/* Premium Minimal Footer */}
      <Footer />
    </div>
  );
};

export default App;
