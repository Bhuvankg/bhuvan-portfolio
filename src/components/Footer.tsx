import React from 'react';
import { ArrowUp, Terminal, Heart } from 'lucide-react';
import { PERSONAL_INFO } from '../data/portfolioData';

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navLinks = [
    { name: 'Home', href: '#home' },
    { name: 'About', href: '#about' },
    { name: 'Skills', href: '#skills' },
    { name: 'Projects', href: '#projects' },
    { name: 'Contact', href: '#contact' },
  ];

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    const target = document.querySelector(href);
    if (target) {
      const topOffset = target.getBoundingClientRect().top + window.pageYOffset - 80;
      window.scrollTo({ top: topOffset, behavior: 'smooth' });
    }
  };

  return (
    <footer className="relative bg-[#05060A] text-[#9298AB] pt-16 pb-12 overflow-hidden border-t border-white/[0.05]">
      
      {/* Animated Glowing Gradient Line */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#5B8CFF] to-transparent opacity-60 shadow-[0_0_10px_#5B8CFF]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 pb-12 border-b border-white/[0.06]">
          
          {/* Brand Info */}
          <div className="flex flex-col items-center md:items-start text-center md:text-left">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-[#5B8CFF] to-[#9B6BFF] p-[1px]">
                <div className="w-full h-full bg-[#07080D] rounded-[7px] flex items-center justify-center">
                  <Terminal className="w-3.5 h-3.5 text-[#5B8CFF]" />
                </div>
              </div>
              <span className="font-heading font-bold text-xl text-white tracking-wider">
                {PERSONAL_INFO.name}
              </span>
            </div>
            <p className="text-sm text-[#9298AB] font-normal italic">
              "Designed with curiosity. Built with code."
            </p>
            <span className="text-xs font-mono text-[#62687F] mt-1">
              Information Science & Engineering • Karnataka, India
            </span>
          </div>

          {/* Quick Nav Links */}
          <nav className="flex flex-wrap items-center justify-center gap-6 text-xs font-mono">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={(e) => handleLinkClick(e, link.href)}
                data-interactive="true"
                className="hover:text-white transition-colors"
              >
                {link.name}
              </a>
            ))}
          </nav>

          {/* Back to top button */}
          <button
            onClick={scrollToTop}
            data-interactive="true"
            className="group flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] text-xs font-mono text-[#9298AB] hover:text-white transition-all"
            aria-label="Back to top"
          >
            <span>Back to top</span>
            <ArrowUp className="w-3.5 h-3.5 group-hover:-translate-y-0.5 transition-transform" />
          </button>

        </div>

        {/* Bottom Copyright & Tech Note */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-[#62687F]">
          <div>
            © {currentYear} {PERSONAL_INFO.name}. All rights reserved.
          </div>
          <div className="flex items-center gap-1.5">
            <span>Crafted with</span>
            <span className="text-[#5B8CFF]">React</span>
            <span>•</span>
            <span className="text-[#9B6BFF]">Three.js</span>
            <span>•</span>
            <span className="text-[#5B8CFF]">Tailwind CSS</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
