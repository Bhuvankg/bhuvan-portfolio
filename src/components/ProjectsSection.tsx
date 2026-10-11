import React, { useState } from 'react';
import { 
  ExternalLink, 
  Github, 
  Sparkles, 
  FolderGit2, 
  Layers, 
  CheckCircle,
  Eye,
  Maximize2
} from 'lucide-react';
import { PROJECTS, ProjectItem, PERSONAL_INFO } from '../data/portfolioData';

export const ProjectsSection: React.FC = () => {
  const [selectedProject, setSelectedProject] = useState<ProjectItem | null>(null);

  return (
    <section id="projects" className="py-24 relative overflow-hidden bg-[#07080D]">
      {/* Background Glows */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-[#5B8CFF]/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-[#9B6BFF]/15 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="flex flex-col items-start mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] mb-3">
            <FolderGit2 className="w-3.5 h-3.5 text-[#5B8CFF]" />
            <span className="text-xs font-mono uppercase tracking-wider text-[#9298AB]">
              Portfolio Showcase
            </span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between w-full gap-4">
            <div>
              <h2 className="font-heading font-bold text-3xl sm:text-4xl lg:text-5xl text-white tracking-tight">
                Selected Works<span className="text-[#5B8CFF]">.</span>
              </h2>
              <p className="mt-2 text-sm sm:text-base text-[#9298AB] max-w-xl">
                Real projects. Practical learning. Continuous improvement.
              </p>
            </div>
            <div className="text-xs font-mono text-[#62687F] self-start sm:self-auto bg-[#10121A] px-3 py-1.5 rounded-lg border border-white/[0.05]">
              {PROJECTS.length} Deployed Applications
            </div>
          </div>
          <div className="h-1 w-20 bg-gradient-to-r from-[#5B8CFF] to-[#9B6BFF] rounded-full mt-4" />
        </div>

        {/* Projects Showcase Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10">
          {PROJECTS.map((project, idx) => (
            <div
              key={project.id}
              className="group relative rounded-3xl bg-[#0c0f1a]/95 border border-white/[0.08] overflow-hidden backdrop-blur-2xl transition-all duration-500 hover:border-[#5B8CFF]/50 hover:shadow-[0_20px_50px_rgba(0,0,0,0.7),0_0_30px_rgba(91,140,255,0.15)] hover:-translate-y-2 flex flex-col justify-between"
            >
              {/* Top Gradient Accent Bar on hover */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#5B8CFF] to-[#9B6BFF] opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20" />

              <div>
                {/* Visual Preview Screenshot Container */}
                <div className="relative aspect-[16/10] overflow-hidden bg-[#101320] border-b border-white/[0.06]">
                  {/* Browser Window Mockup Top Bar */}
                  <div className="absolute top-0 left-0 right-0 z-20 px-4 py-2.5 bg-[#0a0d16]/90 backdrop-blur-md flex items-center justify-between border-b border-white/[0.06]">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                      <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                    </div>
                    <div className="text-[10px] font-mono text-[#9298AB] px-3 py-0.5 rounded-full bg-white/[0.04] border border-white/[0.04] truncate max-w-[200px]">
                      {new URL(project.liveUrl).hostname}
                    </div>
                    <span className="text-[10px] font-mono text-[#5B8CFF]">
                      0{idx + 1}
                    </span>
                  </div>

                  {/* Real Screenshot */}
                  <img
                    src={project.image}
                    alt={`${project.title} live preview`}
                    className="w-full h-full object-cover object-top pt-8 transition-transform duration-700 ease-out group-hover:scale-105"
                    onError={(e) => {
                      // Fallback placeholder if image error
                      const target = e.target as HTMLElement;
                      target.style.display = 'none';
                    }}
                  />

                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0c0f1a] via-transparent to-transparent opacity-60 pointer-events-none" />

                  {/* Live Status Pill */}
                  <div className="absolute bottom-3 left-4 z-10 flex items-center gap-2 bg-[#07080D]/85 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 text-[11px] font-mono text-emerald-400">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>Live & Deployed</span>
                  </div>
                </div>

                {/* Card Content Area */}
                <div className="p-6 sm:p-7 space-y-4">
                  {/* Subtitle / Category */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-[#5B8CFF] uppercase tracking-wider">
                      {project.subtitle}
                    </span>
                    <span className="text-xs font-mono text-[#62687F]">
                      Project 0{idx + 1}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="font-heading font-bold text-2xl text-white group-hover:text-[#5B8CFF] transition-colors">
                    {project.title}
                  </h3>

                  {/* Description */}
                  <p className="text-sm text-[#9298AB] leading-relaxed">
                    {project.description}
                  </p>

                  {/* Feature Highlights (for GradeAI and complex works) */}
                  {project.capabilities && project.capabilities.length > 0 && (
                    <div className="pt-2">
                      <span className="text-[11px] font-mono text-[#62687F] uppercase tracking-wider block mb-2">
                        Key Architecture & Capabilities:
                      </span>
                      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                        {project.capabilities.map((cap) => (
                          <li key={cap} className="flex items-start gap-1.5 text-xs text-[#9298AB]/90 font-mono">
                            <CheckCircle className="w-3.5 h-3.5 text-[#5B8CFF] shrink-0 mt-0.5" />
                            <span>{cap}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Tech Tags */}
                  <div className="flex flex-wrap gap-2 pt-1">
                    {project.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-[11px] font-mono px-2.5 py-1 rounded-md bg-[#141829] text-[#9298AB] border border-white/[0.06] group-hover:border-[#5B8CFF]/20 group-hover:text-white transition-colors"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Buttons Bar */}
              <div className="p-6 sm:p-7 pt-0 border-t border-white/[0.06] mt-4 flex flex-wrap items-center justify-between gap-3">
                <a
                  href={project.liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-interactive="true"
                  className="group/btn inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#5B8CFF] to-[#9B6BFF] text-white font-heading font-semibold text-xs tracking-wide shadow-md shadow-blue-500/20 hover:shadow-blue-500/40 hover:-translate-y-0.5 transition-all duration-200"
                >
                  <span>{project.ctaText}</span>
                  <ExternalLink className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
                </a>

                {project.githubUrl ? (
                  <a
                    href={project.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    data-interactive="true"
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-[#9298AB] hover:text-white border border-white/[0.08] hover:border-white/20 font-mono text-xs transition-colors"
                  >
                    <Github className="w-3.5 h-3.5" />
                    <span>View Repository</span>
                  </a>
                ) : (
                  <a
                    href={PERSONAL_INFO.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    data-interactive="true"
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.03] text-[#62687F] hover:text-[#9298AB] border border-white/[0.04] font-mono text-xs transition-colors"
                  >
                    <Github className="w-3.5 h-3.5" />
                    <span>GitHub Profile</span>
                  </a>
                )}
              </div>

            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
