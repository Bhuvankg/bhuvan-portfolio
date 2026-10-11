import React from 'react';
import { Milestone, CheckCircle2, CircleDashed, Clock, ChevronRight } from 'lucide-react';
import { JOURNEY_STAGES } from '../data/portfolioData';

export const JourneySection: React.FC = () => {
  return (
    <section id="journey" className="py-24 relative overflow-hidden bg-cyber-grid bg-[#07080D]">
      {/* Background radial accent */}
      <div className="absolute top-1/2 left-1/3 -translate-y-1/2 w-96 h-96 bg-[#5B8CFF]/10 rounded-full blur-[130px] pointer-events-none" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="flex flex-col items-center text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] mb-3">
            <Milestone className="w-3.5 h-3.5 text-[#5B8CFF]" />
            <span className="text-xs font-mono uppercase tracking-wider text-[#9298AB]">
              Learning Roadmap
            </span>
          </div>
          <h2 className="font-heading font-bold text-3xl sm:text-4xl lg:text-5xl text-white tracking-tight">
            The Journey Is Just Beginning<span className="text-[#5B8CFF]">.</span>
          </h2>
          <p className="mt-3 text-sm sm:text-base text-[#9298AB] max-w-lg">
            An authentic roadmap reflecting stages of self-directed learning, academic study, and hands-on software development.
          </p>
          <div className="h-1 w-20 bg-gradient-to-r from-[#5B8CFF] to-[#9B6BFF] rounded-full mt-4" />
        </div>

        {/* Timeline Container */}
        <div className="relative">
          {/* Central Vertical Glowing Line */}
          <div className="absolute top-4 bottom-4 left-4 sm:left-1/2 -translate-x-1/2 w-[2px] bg-gradient-to-b from-[#5B8CFF] via-[#9B6BFF] to-transparent" />

          {/* Timeline Nodes */}
          <div className="space-y-12">
            {JOURNEY_STAGES.map((stage, idx) => {
              const isEven = idx % 2 === 0;
              const isCurrent = stage.status === 'Active Focus' || stage.status === 'In Progress';

              return (
                <div
                  key={stage.stage}
                  className={`relative flex flex-col sm:flex-row items-start ${
                    isEven ? 'sm:flex-row-reverse' : ''
                  } group`}
                >
                  {/* Central Node Marker */}
                  <div className="absolute left-4 sm:left-1/2 -translate-x-1/2 flex items-center justify-center w-8 h-8 rounded-full bg-[#07080D] border-2 border-[#5B8CFF] group-hover:scale-125 group-hover:border-[#9B6BFF] transition-all duration-300 z-10 shadow-[0_0_15px_rgba(91,140,255,0.4)]">
                    {stage.status === 'Completed' ? (
                      <CheckCircle2 className="w-4 h-4 text-[#5B8CFF]" />
                    ) : (
                      <div className="w-2.5 h-2.5 rounded-full bg-[#9B6BFF] animate-ping" />
                    )}
                  </div>

                  {/* Stage Content Card */}
                  <div
                    className={`ml-12 sm:ml-0 sm:w-1/2 ${
                      isEven ? 'sm:pr-12' : 'sm:pl-12'
                    } w-full`}
                  >
                    <div className="rounded-2xl bg-[#0f121d]/90 border border-white/[0.08] p-6 backdrop-blur-xl transition-all duration-300 hover:border-[#5B8CFF]/40 hover:shadow-[0_10px_30px_rgba(0,0,0,0.5)] group-hover:-translate-y-1">
                      
                      {/* Stage Meta Top Bar */}
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-mono font-bold text-[#5B8CFF] tracking-wider">
                          {stage.stage}
                        </span>
                        <span
                          className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                            stage.status === 'Completed'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : 'bg-purple-500/10 text-purple-300 border border-purple-500/20'
                          }`}
                        >
                          {stage.status}
                        </span>
                      </div>

                      {/* Stage Title */}
                      <h3 className="font-heading font-semibold text-lg text-white group-hover:text-[#5B8CFF] transition-colors mb-2">
                        {stage.title}
                      </h3>

                      {/* Stage Summary */}
                      <p className="text-xs sm:text-sm text-[#9298AB] leading-relaxed mb-4">
                        {stage.summary}
                      </p>

                      {/* Detail Bullets */}
                      <ul className="space-y-1.5 border-t border-white/[0.06] pt-3">
                        {stage.details.map((detail, dIdx) => (
                          <li
                            key={dIdx}
                            className="flex items-start gap-2 text-xs text-[#9298AB]/90 font-mono"
                          >
                            <ChevronRight className="w-3.5 h-3.5 text-[#5B8CFF] shrink-0 mt-0.5" />
                            <span>{detail}</span>
                          </li>
                        ))}
                      </ul>

                    </div>
                  </div>

                </div>
              );
            })}
          </div>

        </div>

      </div>
    </section>
  );
};
