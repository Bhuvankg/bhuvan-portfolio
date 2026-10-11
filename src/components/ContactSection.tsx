import React, { useState } from 'react';
import { 
  Send, 
  Mail, 
  Github, 
  Linkedin, 
  Instagram, 
  Copy, 
  Check, 
  AlertCircle, 
  MessageSquare, 
  Sparkles,
  MapPin,
  Clock
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { PERSONAL_INFO } from '../data/portfolioData';

export const ContactSection: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [copiedEmail, setCopiedEmail] = useState(false);

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(PERSONAL_INFO.email);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2500);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    if (status === 'error') setStatus('idle');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Client-side validations
    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      setStatus('error');
      setErrorMessage('Please fill in your name, email, and message.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setStatus('error');
      setErrorMessage('Please provide a valid email address.');
      return;
    }

    setStatus('sending');
    setErrorMessage('');

    try {
      // Send message via public form endpoint
      // Using Formspree endpoint or fallback to mailto draft if offline
      const response = await fetch('https://formspree.io/f/xbjnbqko', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          subject: formData.subject || 'Portfolio Inquiry for Bhuvan KG',
          message: formData.message,
          recipient: 'Bhuvan KG'
        })
      });

      if (response.ok) {
        setStatus('success');
        setFormData({ name: '', email: '', subject: '', message: '' });
        
        // Confetti celebration
        try {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 }
          });
        } catch (_) {}
      } else {
        // If external service fails, offer fallback to mailto
        setStatus('error');
        setErrorMessage(
          'Direct network submission was not completed. You can also reach me directly at: ' + PERSONAL_INFO.email
        );
      }
    } catch (err: any) {
      // In case of network disconnection or blocked endpoint
      setStatus('error');
      setErrorMessage(
        'Network error. Please try again or email directly via your mail client.'
      );
    }
  };

  return (
    <section id="contact" className="py-24 relative overflow-hidden bg-cyber-grid bg-[#07080D]">
      {/* Background Glows */}
      <div className="absolute top-1/3 -right-32 w-96 h-96 bg-[#9B6BFF]/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 -left-32 w-96 h-96 bg-[#5B8CFF]/15 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="flex flex-col items-center text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] mb-3">
            <MessageSquare className="w-3.5 h-3.5 text-[#5B8CFF]" />
            <span className="text-xs font-mono uppercase tracking-wider text-[#9298AB]">
              Get In Touch
            </span>
          </div>
          <h2 className="font-heading font-bold text-3xl sm:text-4xl lg:text-5xl text-white tracking-tight">
            Have An Idea? Let's Build It<span className="text-[#5B8CFF]">.</span>
          </h2>
          <p className="mt-3 text-sm sm:text-base text-[#9298AB] max-w-xl">
            I'm always interested in learning, collaborating on meaningful projects, and connecting with fellow developers.
          </p>
          <div className="h-1 w-20 bg-gradient-to-r from-[#5B8CFF] to-[#9B6BFF] rounded-full mt-4" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* LEFT: Contact Cards & Social Channels */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Direct Email Card */}
            <div className="rounded-2xl bg-[#0e111c]/90 border border-white/[0.08] p-6 backdrop-blur-xl">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-[#141829] border border-white/10 flex items-center justify-center text-[#5B8CFF]">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white">Direct Email</h4>
                  <p className="text-xs text-[#9298AB]">Send an email anytime</p>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-[#07080D] border border-white/[0.06] mt-4">
                <span className="text-xs font-mono text-[#F5F7FF] truncate mr-2">
                  {PERSONAL_INFO.email}
                </span>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={handleCopyEmail}
                    data-interactive="true"
                    className="p-1.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-[#9298AB] hover:text-white transition-colors"
                    title="Copy Email"
                    aria-label="Copy Email"
                  >
                    {copiedEmail ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                  <a
                    href={`mailto:${PERSONAL_INFO.email}?subject=Portfolio%20Inquiry%20for%20Bhuvan%20KG`}
                    data-interactive="true"
                    className="px-2.5 py-1 rounded-lg bg-[#5B8CFF]/15 hover:bg-[#5B8CFF]/25 text-[#5B8CFF] text-xs font-mono transition-colors"
                  >
                    Open Mail
                  </a>
                </div>
              </div>
            </div>

            {/* Profiles & Socials */}
            <div className="rounded-2xl bg-[#0e111c]/90 border border-white/[0.08] p-6 backdrop-blur-xl space-y-4">
              <h4 className="text-sm font-semibold text-white mb-2">Connect Across Platforms</h4>

              {/* GitHub */}
              <a
                href={PERSONAL_INFO.github}
                target="_blank"
                rel="noopener noreferrer"
                data-interactive="true"
                className="flex items-center justify-between p-3 rounded-xl bg-[#10121A] border border-white/[0.06] hover:border-[#5B8CFF]/40 hover:bg-[#141724] transition-all group"
              >
                <div className="flex items-center gap-3">
                  <Github className="w-5 h-5 text-white group-hover:text-[#5B8CFF] transition-colors" />
                  <div>
                    <span className="text-xs font-medium text-white block">GitHub Profile</span>
                    <span className="text-[11px] font-mono text-[#62687F]">github.com/bhuvankg</span>
                  </div>
                </div>
                <span className="text-xs font-mono text-[#5B8CFF] group-hover:translate-x-1 transition-transform">
                  Visit →
                </span>
              </a>

              {/* LinkedIn (Placeholder) */}
              <a
                href={PERSONAL_INFO.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                data-interactive="true"
                className="flex items-center justify-between p-3 rounded-xl bg-[#10121A] border border-white/[0.06] hover:border-[#5B8CFF]/40 hover:bg-[#141724] transition-all group"
              >
                <div className="flex items-center gap-3">
                  <Linkedin className="w-5 h-5 text-[#5B8CFF]" />
                  <div>
                    <span className="text-xs font-medium text-white block">LinkedIn</span>
                    <span className="text-[11px] font-mono text-[#62687F]">Professional Network (Profile)</span>
                  </div>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/[0.04] text-[#9298AB]">
                  Connect →
                </span>
              </a>

              {/* Instagram (Placeholder) */}
              <a
                href={PERSONAL_INFO.instagram}
                target="_blank"
                rel="noopener noreferrer"
                data-interactive="true"
                className="flex items-center justify-between p-3 rounded-xl bg-[#10121A] border border-white/[0.06] hover:border-[#9B6BFF]/40 hover:bg-[#141724] transition-all group"
              >
                <div className="flex items-center gap-3">
                  <Instagram className="w-5 h-5 text-[#9B6BFF]" />
                  <div>
                    <span className="text-xs font-medium text-white block">Instagram</span>
                    <span className="text-[11px] font-mono text-[#62687F]">Creative Social (Profile)</span>
                  </div>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/[0.04] text-[#9298AB]">
                  Visit →
                </span>
              </a>

            </div>

            {/* Quick Availability Badge */}
            <div className="p-4 rounded-xl bg-[#10121A]/70 border border-white/[0.05] flex items-center justify-between text-xs font-mono text-[#9298AB]">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>Response Time: Within 24-48 hrs</span>
              </div>
              <div className="flex items-center gap-1.5 text-[#62687F]">
                <Clock className="w-3.5 h-3.5" />
                <span>IST (UTC+5:30)</span>
              </div>
            </div>

          </div>

          {/* RIGHT: High-End Contact Form */}
          <div className="lg:col-span-7">
            <div className="rounded-3xl bg-[#0c0f1a]/95 border border-white/[0.08] p-7 sm:p-9 backdrop-blur-2xl shadow-2xl relative">
              
              <div className="flex items-center justify-between pb-5 mb-6 border-b border-white/[0.07]">
                <div>
                  <h3 className="font-heading font-bold text-xl text-white">Send A Message</h3>
                  <p className="text-xs text-[#9298AB] mt-0.5">Let's discuss projects, opportunities, or ideas.</p>
                </div>
                <Sparkles className="w-5 h-5 text-[#9B6BFF]" />
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                
                {/* Name & Email Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label htmlFor="contact-name" className="text-xs font-mono text-[#9298AB] block">
                      YOUR NAME <span className="text-[#5B8CFF]">*</span>
                    </label>
                    <input
                      id="contact-name"
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="e.g. Alex Sharma"
                      required
                      className="w-full px-4 py-3 rounded-xl bg-[#101320] border border-white/[0.08] focus:border-[#5B8CFF] focus:outline-none focus:ring-1 focus:ring-[#5B8CFF] text-white text-sm placeholder-[#62687F] transition-all"
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="contact-email" className="text-xs font-mono text-[#9298AB] block">
                      EMAIL ADDRESS <span className="text-[#5B8CFF]">*</span>
                    </label>
                    <input
                      id="contact-email"
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="you@domain.com"
                      required
                      className="w-full px-4 py-3 rounded-xl bg-[#101320] border border-white/[0.08] focus:border-[#5B8CFF] focus:outline-none focus:ring-1 focus:ring-[#5B8CFF] text-white text-sm placeholder-[#62687F] transition-all"
                    />
                  </div>
                </div>

                {/* Subject */}
                <div className="space-y-2">
                  <label htmlFor="contact-subject" className="text-xs font-mono text-[#9298AB] block">
                    SUBJECT
                  </label>
                  <input
                    id="contact-subject"
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    placeholder="Project inquiry, collaboration, or hello"
                    className="w-full px-4 py-3 rounded-xl bg-[#101320] border border-white/[0.08] focus:border-[#5B8CFF] focus:outline-none focus:ring-1 focus:ring-[#5B8CFF] text-white text-sm placeholder-[#62687F] transition-all"
                  />
                </div>

                {/* Message */}
                <div className="space-y-2">
                  <label htmlFor="contact-message" className="text-xs font-mono text-[#9298AB] block">
                    YOUR MESSAGE <span className="text-[#5B8CFF]">*</span>
                  </label>
                  <textarea
                    id="contact-message"
                    name="message"
                    rows={4}
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Tell me about your idea, project scope, or opportunity..."
                    required
                    className="w-full px-4 py-3 rounded-xl bg-[#101320] border border-white/[0.08] focus:border-[#5B8CFF] focus:outline-none focus:ring-1 focus:ring-[#5B8CFF] text-white text-sm placeholder-[#62687F] transition-all resize-y"
                  />
                </div>

                {/* Status Messages */}
                {status === 'success' && (
                  <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono flex items-center gap-2">
                    <Check className="w-4 h-4 shrink-0" />
                    <span>Thank you! Your message has been sent successfully. I will get back to you soon.</span>
                  </div>
                )}

                {status === 'error' && (
                  <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs font-mono flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={status === 'sending'}
                  data-interactive="true"
                  className="w-full relative group py-3.5 px-6 rounded-xl font-heading font-semibold text-sm text-white overflow-hidden transition-all duration-300 shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 disabled:opacity-60"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-[#5B8CFF] to-[#9B6BFF] transition-all" />
                  <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    {status === 'sending' ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Sending Message...</span>
                      </>
                    ) : (
                      <>
                        <span>Send Message</span>
                        <Send className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                      </>
                    )}
                  </span>
                </button>

              </form>

            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
