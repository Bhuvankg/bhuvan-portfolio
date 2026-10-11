import React, { useState, useEffect } from 'react';
import { Menu, X, ArrowUpRight, Terminal } from 'lucide-react';

interface NavbarProps {
  activeSection: string;
}

export const Navbar: React.FC<NavbarProps> = ({ activeSection }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', href: '#home' },
    { name: 'About', href: '#about' },
    { name: 'Skills', href: '#skills' },
    { name: 'Projects', href: '#projects' },
    { name: 'Journey', href: '#journey' },
    { name: 'Contact', href: '#contact' },
  ];

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    const target = document.querySelector(href);
    if (target) {
      const topOffset = target.getBoundingClientRect().top + window.pageYOffset - 80;
      window.scrollTo({
        top: topOffset,
        behavior: 'smooth'
      });
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        isScrolled
          ? 'py-3 bg-[#07080D]/85 backdrop-blur-md border-b border-white/[0.07] shadow-[0_4px_30px_rgba(0,0,0,0.5)]'
          : 'py-5 bg-transparent border-b border-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Brand Logo */}
          <a
            href="#home"
            onClick={(e) => handleLinkClick(e, '#home')}
            className="group flex items-center gap-2.5 text-decoration-none"
            data-interactive="true"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#5B8CFF] to-[#9B6BFF] p-[1px] shadow-[0_0_15px_rgba(91,140,255,0.4)]">
              <div className="w-full h-full bg-[#07080D] rounded-[7px] flex items-center justify-center group-hover:bg-[#10121A] transition-colors">
                <Terminal className="w-4 h-4 text-[#5B8CFF] group-hover:text-[#9B6BFF] transition-colors" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="font-heading font-bold text-lg tracking-wider text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-[#5B8CFF] group-hover:to-[#9B6BFF] transition-all">
                BHUVAN<span className="text-[#5B8CFF]">.</span>KG
              </span>
              <span className="text-[10px] tracking-widest text-[#9298AB] -mt-1 font-mono uppercase">
                ISE • VTU
              </span>
            </div>
          </a>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center p-1 rounded-full bg-[#10121A]/80 border border-white/[0.08] backdrop-blur-md shadow-inner">
            {navLinks.map((link) => {
              const isActive = activeSection === link.href.substring(1);
              return (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={(e) => handleLinkClick(e, link.href)}
                  data-interactive="true"
                  className={`px-4 py-1.5 text-xs font-medium rounded-full transition-all duration-200 relative ${
                    isActive
                      ? 'text-white bg-white/10 shadow-[0_0_12px_rgba(91,140,255,0.3)]'
                      : 'text-[#9298AB] hover:text-white hover:bg-white/[0.04]'
                  }`}
                >
                  {link.name}
                  {isActive && (
                    <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-[#5B8CFF] rounded-full shadow-[0_0_6px_#5B8CFF]" />
                  )}
                </a>
              );
            })}
          </nav>

          {/* Right Action CTA */}
          <div className="hidden md:flex items-center gap-3">
            <a
              href="#contact"
              onClick={(e) => handleLinkClick(e, '#contact')}
              data-interactive="true"
              className="group relative inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg overflow-hidden transition-all duration-300"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-[#5B8CFF] to-[#9B6BFF] opacity-80 group-hover:opacity-100 transition-opacity" />
              <div className="absolute inset-[1px] bg-[#07080D]/90 rounded-[7px] group-hover:bg-[#07080D]/70 transition-colors" />
              <span className="relative z-10 text-white flex items-center gap-1.5">
                Let's Talk
                <ArrowUpRight className="w-3.5 h-3.5 text-[#5B8CFF] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </span>
            </a>
          </div>

          {/* Mobile Hamburger Toggle */}
          <div className="flex md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg bg-[#10121A] border border-white/10 text-[#9298AB] hover:text-white focus:outline-none"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden px-4 pt-3 pb-6 bg-[#07080D]/95 backdrop-blur-xl border-b border-white/10 animate-in slide-in-from-top-2 duration-200">
          <nav className="flex flex-col space-y-2">
            {navLinks.map((link) => {
              const isActive = activeSection === link.href.substring(1);
              return (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={(e) => handleLinkClick(e, link.href)}
                  className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center justify-between ${
                    isActive
                      ? 'text-white bg-gradient-to-r from-[#5B8CFF]/15 to-transparent border-l-2 border-[#5B8CFF]'
                      : 'text-[#9298AB] hover:text-white hover:bg-white/[0.04]'
                  }`}
                >
                  <span>{link.name}</span>
                  {isActive && <span className="w-2 h-2 rounded-full bg-[#5B8CFF]" />}
                </a>
              );
            })}
            <a
              href="#contact"
              onClick={(e) => handleLinkClick(e, '#contact')}
              className="mt-3 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-gradient-to-r from-[#5B8CFF] to-[#9B6BFF] text-white text-sm font-semibold shadow-lg shadow-blue-500/20"
            >
              <span>Let's Talk</span>
              <ArrowUpRight className="w-4 h-4" />
            </a>
          </nav>
        </div>
      )}
    </header>
  );
};
