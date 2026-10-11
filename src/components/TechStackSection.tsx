import React, { useState } from 'react';
import { 
  Code2, 
  Terminal, 
  FileCode, 
  Layout, 
  Palette, 
  Sparkles, 
  Server, 
  Database, 
  GitBranch, 
  Github, 
  Monitor, 
  Box, 
  Layers, 
  Cpu,
  Wrench,
  CheckCircle2
} from 'lucide-react';
import { TECH_STACK, TECH_CATEGORIES, TechItem } from '../data/portfolioData';

export const TechStackSection: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<string>('All');

  const filteredTech = activeCategory === 'All'
    ? TECH_STACK
    : TECH_STACK.filter(t => t.category === activeCategory);

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Code2': return <Code2 className="w-6 h-6 text-[#5B8CFF]" />;
      case 'Terminal': return <Terminal className="w-6 h-6 text-[#9B6BFF]" />;
      case 'FileCode': return <FileCode className="w-6 h-6 text-[#5B8CFF]" />;
      case 'Layout': return <Layout className="w-6 h-6 text-[#9B6BFF]" />;
      case 'Palette': return <Palette className="w-6 h-6 text-[#5B8CFF]" />;
      case 'Sparkles': return <Sparkles className="w-6 h-6 text-[#9B6BFF]" />;
      case 'Server': return <Server className="w-6 h-6 text-[#5B8CFF]" />;
      case 'Database': return <Database className="w-6 h-6 text-[#9B6BFF]" />;
      case 'GitBranch': return <GitBranch className="w-6 h-6 text-[#5B8CFF]" />;
      case 'Github': return <Github className="w-6 h-6 text-[#9B6BFF]" />;
      case 'Monitor': return <Monitor className="w-6 h-6 text-[#5B8CFF]" />;
      case 'Box': return <Box className="w-6 h-6 text-[#5B8CFF]" />;
      case 'Layers': return <Layers className="w-6 h-6 text-[#9B6BFF]" />;
      case 'Cpu': return <Cpu className="w-6 h-6 text-[#5B8CFF]" />;
      default: return <Code2 className="w-6 h-6 text-[#5B8CFF]" />;
    }
  };

  return (
    <section id="skills" className="py-24 relative overflow-hidden bg-cyber-grid bg-[#07080D]">
      {/* Background Glow */}
      <div className="absolute top-1/3 -right-20 w-80 h-80 bg-[#5B8CFF]/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-10 -left-20 w-80 h-80 bg-[#9B6BFF]/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="flex flex-col items-center text-center mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] mb-3">
            <Wrench className="w-3.5 h-3.5 text-[#5B8CFF]" />
            <span className="text-xs font-mono uppercase tracking-wider text-[#9298AB]">
              Skills & Tools
            </span>
          </div>
          <h2 className="font-heading font-bold text-3xl sm:text-4xl lg:text-5xl text-white tracking-tight">
            My Digital Toolkit<span className="text-[#5B8CFF]">.</span>
          </h2>
          <p className="mt-3 text-sm sm:text-base text-[#9298AB] max-w-xl">
            A structured look at my learning and development toolkit, focusing on practical programming fundamentals, web technologies, and ongoing exploration.
          </p>
          <div className="h-1 w-20 bg-gradient-to-r from-[#5B8CFF] to-[#9B6BFF] rounded-full mt-4" />
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-12">
          {TECH_CATEGORIES.map((category) => {
            const isActive = activeCategory === category;
            return (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                data-interactive="true"
                className={`px-4 py-2 rounded-xl text-xs font-mono font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-[#5B8CFF] to-[#9B6BFF] text-white shadow-lg shadow-blue-500/20'
                    : 'bg-[#10121A]/80 text-[#9298AB] hover:text-white hover:bg-white/[0.06] border border-white/[0.06]'
                }`}
              >
                {category}
              </button>
            );
          })}
        </div>

        {/* Tech Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredTech.map((item, index) => (
            <div
              key={item.name}
              className="group relative rounded-2xl bg-[#0e111c]/90 border border-white/[0.07] p-5 backdrop-blur-xl transition-all duration-300 hover:border-[#5B8CFF]/50 hover:shadow-[0_10px_30px_rgba(91,140,255,0.15)] hover:-translate-y-1.5"
            >
              {/* Subtle card glow overlay on hover */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#5B8CFF]/5 to-[#9B6BFF]/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

              <div className="relative z-10 flex flex-col h-full justify-between">
                <div>
                  {/* Top Bar with Icon & Category */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-[#141829] border border-white/[0.08] flex items-center justify-center group-hover:scale-110 group-hover:border-[#5B8CFF]/40 transition-all duration-300">
                      {getIcon(item.iconName)}
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/[0.04] text-[#9298AB] border border-white/[0.05]">
                      {item.category}
                    </span>
                  </div>

                  {/* Title & Level */}
                  <h3 className="font-heading font-semibold text-lg text-white group-hover:text-[#5B8CFF] transition-colors">
                    {item.name}
                  </h3>
                  
                  <div className="inline-flex items-center gap-1.5 mt-1 mb-2 text-xs font-mono text-[#5B8CFF]/90">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>{item.level}</span>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-[#9298AB] leading-relaxed mt-1">
                    {item.description}
                  </p>
                </div>

                {/* Bottom line indicator */}
                <div className="mt-4 pt-3 border-t border-white/[0.05] flex items-center justify-between">
                  <span className="text-[10px] font-mono text-[#62687F]">Practicing & Building</span>
                  <div className="w-1.5 h-1.5 rounded-full bg-[#5B8CFF]/40 group-hover:bg-[#5B8CFF] transition-colors" />
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
