import React from 'react';
import { User, BookOpen, Compass, MapPin, Sparkles, Code, Cpu } from 'lucide-react';
import { PERSONAL_INFO } from '../data/portfolioData';

export const AboutSection: React.FC = () => {
  return (
    <section id="about" className="py-24 relative overflow-hidden bg-[#07080D]">
      {/* Subtle background ambient light */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-glow opacity-50 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="flex flex-col items-start mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] mb-3">
            <User className="w-3.5 h-3.5 text-[#5B8CFF]" />
            <span className="text-xs font-mono uppercase tracking-wider text-[#9298AB]">
              About Me
            </span>
          </div>
          <h2 className="font-heading font-bold text-3xl sm:text-4xl lg:text-5xl text-white tracking-tight">
            {PERSONAL_INFO.aboutHeading}
          </h2>
          <div className="h-1 w-20 bg-gradient-to-r from-[#5B8CFF] to-[#9B6BFF] rounded-full mt-3" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* LEFT: About Text & Core Brand Pillars */}
          <div className="lg:col-span-7 space-y-6">
            <div className="space-y-4 text-[#9298AB] text-base sm:text-lg leading-relaxed">
              <p className="text-white/90 font-medium">
                {PERSONAL_INFO.aboutParagraph1}
              </p>
              <p>
                {PERSONAL_INFO.aboutParagraph2}
              </p>
              <p>
                {PERSONAL_INFO.aboutParagraph3}
              </p>
            </div>

            {/* Brand Keywords Chips */}
            <div className="pt-4">
              <span className="text-xs font-mono uppercase tracking-wider text-[#62687F] block mb-3">
                Core Mindset & Principles
              </span>
              <div className="flex flex-wrap gap-2">
                {PERSONAL_INFO.brandKeywords.map((keyword, idx) => (
                  <div
                    key={keyword}
                    className="group relative px-3 py-1.5 rounded-lg bg-[#10121A] border border-white/[0.08] hover:border-[#5B8CFF]/50 transition-all duration-200"
                  >
                    <span className="text-xs font-mono text-[#9298AB] group-hover:text-white transition-colors flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#5B8CFF] opacity-60 group-hover:opacity-100" />
                      {keyword}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Academic Highlights */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
              <div className="p-4 rounded-xl bg-[#10121A]/70 border border-white/[0.06] backdrop-blur-sm">
                <div className="flex items-center gap-2.5 mb-1.5">
                  <BookOpen className="w-4 h-4 text-[#5B8CFF]" />
                  <span className="text-xs font-mono text-white font-semibold">Degree Program</span>
                </div>
                <p className="text-xs text-[#9298AB] leading-relaxed">
                  B.E. in Information Science and Engineering (2nd Year, VTU)
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#10121A]/70 border border-white/[0.06] backdrop-blur-sm">
                <div className="flex items-center gap-2.5 mb-1.5">
                  <Code className="w-4 h-4 text-[#9B6BFF]" />
                  <span className="text-xs font-mono text-white font-semibold">Primary Goal</span>
                </div>
                <p className="text-xs text-[#9298AB] leading-relaxed">
                  Building dependable software solutions & becoming an industry-ready full-stack developer.
                </p>
              </div>
            </div>

          </div>

          {/* RIGHT: Interactive Profile Card with 3D Orbit */}
          <div className="lg:col-span-5 relative flex items-center justify-center">
            
            {/* Animated 3D Orbit Ring 1 */}
            <div className="absolute w-80 h-80 rounded-full border border-dashed border-[#5B8CFF]/20 animate-spin [animation-duration:28s] pointer-events-none">
              <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-[#5B8CFF] shadow-[0_0_10px_#5B8CFF]" />
            </div>

            {/* Animated 3D Orbit Ring 2 */}
            <div className="absolute w-96 h-96 rounded-full border border-dotted border-[#9B6BFF]/20 animate-spin [animation-duration:36s] [animation-direction:reverse] pointer-events-none">
              <div className="absolute top-1/2 -right-1.5 -translate-y-1/2 w-3 h-3 rounded-full bg-[#9B6BFF] shadow-[0_0_10px_#9B6BFF]" />
            </div>

            {/* Main Interactive Profile Card */}
            <div className="relative z-10 w-full max-w-sm rounded-2xl bg-[#0a0d16]/95 border border-white/10 p-6 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.6)] transition-all duration-300 hover:border-[#5B8CFF]/40 group">
              
              {/* Profile Card Header */}
              <div className="flex items-center justify-between pb-4 border-b border-white/[0.08] mb-5">
                <div className="flex items-center gap-2.5">
                  <div className="w-3 h-3 rounded-full bg-[#5B8CFF] shadow-[0_0_8px_#5B8CFF]" />
                  <span className="font-mono text-xs text-[#9298AB] tracking-widest uppercase">
                    Developer Dossier
                  </span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/[0.05] text-[#9298AB] border border-white/[0.05]">
                  ID: BKG-2026
                </span>
              </div>

              {/* Data Fields */}
              <div className="space-y-4">
                
                {/* NAME */}
                <div className="space-y-1">
                  <span className="text-[10px] font-mono uppercase text-[#62687F] tracking-wider block">
                    NAME
                  </span>
                  <p className="font-heading font-bold text-xl text-white group-hover:text-[#5B8CFF] transition-colors">
                    {PERSONAL_INFO.cardDetails.name}
                  </p>
                </div>

                {/* FIELD */}
                <div className="space-y-1">
                  <span className="text-[10px] font-mono uppercase text-[#62687F] tracking-wider block">
                    FIELD
                  </span>
                  <p className="text-sm font-medium text-white/90">
                    {PERSONAL_INFO.cardDetails.field}
                  </p>
                  <p className="text-xs text-[#9298AB] font-mono">
                    {PERSONAL_INFO.cardDetails.university} • {PERSONAL_INFO.cardDetails.year}
                  </p>
                </div>

                {/* CURRENT FOCUS */}
                <div className="space-y-1">
                  <span className="text-[10px] font-mono uppercase text-[#62687F] tracking-wider block">
                    CURRENT FOCUS
                  </span>
                  <div className="p-2.5 rounded-lg bg-[#10121A] border border-white/[0.06] text-xs font-mono text-[#5B8CFF] leading-relaxed">
                    {PERSONAL_INFO.cardDetails.currentFocus}
                  </div>
                </div>

                {/* LOCATION */}
                <div className="space-y-1">
                  <span className="text-[10px] font-mono uppercase text-[#62687F] tracking-wider block">
                    LOCATION
                  </span>
                  <div className="flex items-center gap-2 text-sm text-white/80">
                    <MapPin className="w-4 h-4 text-[#9B6BFF]" />
                    <span>{PERSONAL_INFO.cardDetails.location}</span>
                  </div>
                </div>

              </div>

              {/* Status Indicator Bar */}
              <div className="mt-6 pt-4 border-t border-white/[0.08] flex items-center justify-between text-xs font-mono text-[#9298AB]">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[11px] text-[#9298AB]">Active Learner</span>
                </div>
                <span className="text-[11px] text-[#62687F]">VTU Affiliated</span>
              </div>

            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
