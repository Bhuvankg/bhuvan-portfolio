import React from 'react';
import { ArrowRight, Sparkles, MapPin, GraduationCap, Github, Mail, ShieldCheck } from 'lucide-react';
import { PERSONAL_INFO } from '../data/portfolioData';
import { Hero3DCanvas } from './Hero3DCanvas';

export const HeroSection: React.FC = () => {
  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      const topOffset = el.getBoundingClientRect().top + window.pageYOffset - 80;
      window.scrollTo({ top: topOffset, behavior: 'smooth' });
    }
  };

  return (
    <section
      id="home"
      className="relative min-h-screen lg:max-h-[1050px] flex items-center justify-center pt-28 sm:pt-32 pb-20 overflow-hidden bg-cyber-grid"
    >
      {/* Background Ambient Radial Glows */}
      <div className="absolute top-1/4 -left-40 w-96 h-96 bg-[#5B8CFF]/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 -right-40 w-96 h-96 bg-[#9B6BFF]/15 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center pt-6 lg:pt-0">
          
          {/* LEFT SIDE: Narrative & CTAs */}
          <div className="lg:col-span-7 flex flex-col items-start space-y-6 text-left">
            
            {/* Small Animated Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.08] backdrop-blur-md shadow-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#5B8CFF] opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#5B8CFF]" />
              </span>
              <span className="text-[11px] font-mono uppercase tracking-wider text-[#9298AB]">
                {PERSONAL_INFO.heroBadge}
              </span>
            </div>

            {/* Main Heading */}
            <h1 className="font-heading font-bold text-4xl sm:text-5xl lg:text-6xl tracking-tight leading-[1.1] text-white">
              {PERSONAL_INFO.heroHeading}{' '}
              <span className="text-gradient block mt-1 sm:mt-2">
                {PERSONAL_INFO.heroHeadingHighlight}
              </span>
            </h1>

            {/* Introduction */}
            <p className="text-base sm:text-lg text-[#9298AB] leading-relaxed max-w-xl font-normal">
              {PERSONAL_INFO.heroIntro}
            </p>

            {/* Location & Status Pill */}
            <div className="flex flex-wrap items-center gap-4 text-xs text-[#9298AB] font-mono">
              <div className="flex items-center gap-1.5 bg-[#10121A]/80 px-3 py-1.5 rounded-md border border-white/[0.06]">
                <MapPin className="w-3.5 h-3.5 text-[#5B8CFF]" />
                <span>{PERSONAL_INFO.location}</span>
              </div>
              <div className="flex items-center gap-1.5 bg-[#10121A]/80 px-3 py-1.5 rounded-md border border-white/[0.06]">
                <GraduationCap className="w-3.5 h-3.5 text-[#9B6BFF]" />
                <span>VTU • 2nd Year ISE</span>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              {/* Explore My Work Button */}
              <button
                onClick={() => scrollTo('projects')}
                data-interactive="true"
                className="group relative inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-heading font-semibold text-sm text-white transition-all duration-300 shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 hover:-translate-y-0.5"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-[#5B8CFF] to-[#9B6BFF] rounded-xl" />
                <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl" />
                <span className="relative z-10 flex items-center gap-2">
                  Explore My Work
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </span>
              </button>

              {/* Let's Connect Button */}
              <button
                onClick={() => scrollTo('contact')}
                data-interactive="true"
                className="group inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-heading font-medium text-sm text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.1] hover:border-[#5B8CFF]/50 transition-all duration-300 backdrop-blur-md hover:-translate-y-0.5"
              >
                <Sparkles className="w-4 h-4 text-[#9B6BFF] group-hover:text-[#5B8CFF] transition-colors" />
                <span>Let's Connect</span>
              </button>
            </div>

            {/* Subtext Quote */}
            <div className="pt-2 border-t border-white/[0.06] w-full max-w-md">
              <p className="text-xs font-mono text-[#62687F] tracking-wide">
                {PERSONAL_INFO.heroSubtext}
              </p>
            </div>

          </div>

          {/* RIGHT SIDE: 3D Visual Composition & Polished Portrait Card */}
          <div className="lg:col-span-5 relative flex items-center justify-center">
            
            {/* 3D Canvas in background layer */}
            <div className="absolute inset-0 flex items-center justify-center z-0 scale-110 pointer-events-none">
              <Hero3DCanvas />
            </div>

            {/* Foreground Polished Portrait Card */}
            <div className="relative z-10 w-full max-w-sm sm:max-w-md group">
              
              {/* Outer Holographic Glow Edge */}
              <div className="absolute -inset-1.5 bg-gradient-to-r from-[#5B8CFF] via-[#9B6BFF] to-[#5B8CFF] rounded-3xl opacity-30 group-hover:opacity-60 blur-md transition-opacity duration-500" />
              
              {/* Glass Card Container */}
              <div className="relative rounded-2xl bg-[#0a0d16]/90 border border-white/10 p-5 backdrop-blur-xl shadow-2xl">
                
                {/* Card Header Bar */}
                <div className="flex items-center justify-between pb-3 mb-4 border-b border-white/[0.07]">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
                    <span className="text-[11px] font-mono text-[#9298AB] uppercase tracking-wider">
                      Identity Reference
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] font-mono text-[#5B8CFF] bg-[#5B8CFF]/10 px-2 py-0.5 rounded border border-[#5B8CFF]/20">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Verified Developer</span>
                  </div>
                </div>

                {/* Real Uploaded Photo Container */}
                <div className="relative overflow-hidden rounded-xl aspect-square bg-[#10121A] border border-white/10 group-hover:border-[#5B8CFF]/40 transition-colors">
                  <img
                    src={PERSONAL_INFO.profileImage}
                    alt="Bhuvan KG - Aspiring Software Developer"
                    className="w-full h-full object-cover object-top filter brightness-[1.02] contrast-[1.03] transition-transform duration-500 group-hover:scale-105"
                    loading="eager"
                  />
                  
                  {/* Subtle Gradient Vignette */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#07080D]/80 via-transparent to-transparent pointer-events-none" />

                  {/* Floating Hologram Tag Inside Photo */}
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between pointer-events-none">
                    <div className="px-2.5 py-1 rounded-md bg-[#07080D]/85 backdrop-blur-md border border-white/10 text-[11px] font-mono text-white">
                      Bhuvan KG
                    </div>
                    <div className="px-2 py-1 rounded-md bg-[#5B8CFF]/20 backdrop-blur-md border border-[#5B8CFF]/30 text-[10px] font-mono text-[#5B8CFF]">
                      2nd Year ISE
                    </div>
                  </div>
                </div>

                {/* Card Footer Bio Snippet */}
                <div className="mt-4 pt-3 border-t border-white/[0.07] flex items-center justify-between text-xs text-[#9298AB]">
                  <div className="flex flex-col">
                    <span className="text-white font-medium">Bhuvan KG</span>
                    <span className="text-[11px] font-mono text-[#62687F]">Information Science & Eng.</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <a
                      href={PERSONAL_INFO.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      data-interactive="true"
                      className="p-2 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] hover:text-white transition-colors"
                      aria-label="GitHub profile"
                    >
                      <Github className="w-4 h-4" />
                    </a>
                    <button
                      onClick={() => scrollTo('contact')}
                      data-interactive="true"
                      className="p-2 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] hover:text-white transition-colors"
                      aria-label="Contact Bhuvan"
                    >
                      <Mail className="w-4 h-4" />
                    </button>
                  </div>
                </div>

              </div>

            </div>

          </div>

        </div>
      </div>
    </section>
  );
};
