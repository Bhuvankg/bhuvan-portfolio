import React from 'react';
import { Layers, Target, TrendingUp, Sparkles, ArrowRight } from 'lucide-react';
import { FOCUS_GOALS, FocusGoal } from '../data/portfolioData';

export const FocusSection: React.FC = () => {
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Layers':
        return <Layers className="w-7 h-7 text-[#5B8CFF]" />;
      case 'Target':
        return <Target className="w-7 h-7 text-[#9B6BFF]" />;
      case 'TrendingUp':
        return <TrendingUp className="w-7 h-7 text-[#5B8CFF]" />;
      default:
        return <Layers className="w-7 h-7 text-[#5B8CFF]" />;
    }
  };

  return (
    <section className="py-24 relative overflow-hidden bg-[#07080D]">
      {/* Background ambient lighting */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-gradient-glow opacity-40 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="flex flex-col items-center text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] mb-3">
            <Sparkles className="w-3.5 h-3.5 text-[#9B6BFF]" />
            <span className="text-xs font-mono uppercase tracking-wider text-[#9298AB]">
              Future Horizons
            </span>
          </div>
          <h2 className="font-heading font-bold text-3xl sm:text-4xl lg:text-5xl text-white tracking-tight">
            Focused On What's Next<span className="text-[#9B6BFF]">.</span>
          </h2>
          <p className="mt-3 text-sm sm:text-base text-[#9298AB] max-w-lg">
            Directing energy and discipline into core areas that bridge academic theory with industry craftsmanship.
          </p>
          <div className="h-1 w-20 bg-gradient-to-r from-[#5B8CFF] to-[#9B6BFF] rounded-full mt-4" />
        </div>

        {/* 3 Premium Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {FOCUS_GOALS.map((goal) => (
            <div
              key={goal.number}
              className="group relative rounded-3xl bg-[#0c0f1a]/90 border border-white/[0.08] p-8 backdrop-blur-xl transition-all duration-300 hover:border-[#5B8CFF]/50 hover:shadow-[0_15px_40px_rgba(91,140,255,0.15)] hover:-translate-y-2 flex flex-col justify-between"
            >
              {/* Corner Watermark Number */}
              <div className="absolute top-6 right-6 font-heading font-bold text-5xl text-white/[0.03] group-hover:text-[#5B8CFF]/10 transition-colors pointer-events-none">
                {goal.number}
              </div>

              <div>
                {/* Icon Container with glowing effect */}
                <div className="w-14 h-14 rounded-2xl bg-[#141829] border border-white/10 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:border-[#5B8CFF]/40 transition-all duration-300 shadow-md shadow-blue-500/10">
                  {getIcon(goal.iconName)}
                </div>

                {/* Sub-label Highlight */}
                <span className="text-xs font-mono text-[#5B8CFF] uppercase tracking-wider block mb-2">
                  {goal.highlight}
                </span>

                {/* Title */}
                <h3 className="font-heading font-bold text-xl sm:text-2xl text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-[#5B8CFF] transition-all mb-4">
                  {goal.title}
                </h3>

                {/* Description */}
                <p className="text-sm text-[#9298AB] leading-relaxed">
                  {goal.description}
                </p>
              </div>

              {/* Card Footer */}
              <div className="mt-8 pt-4 border-t border-white/[0.06] flex items-center justify-between text-xs font-mono text-[#62687F]">
                <span>Active Commitment</span>
                <span className="text-[#5B8CFF] flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  In Focus
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
