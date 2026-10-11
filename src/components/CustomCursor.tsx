import React, { useEffect, useState } from 'react';

export const CustomCursor: React.FC = () => {
  const [pos, setPos] = useState({ x: -100, y: -100 });
  const [trailingPos, setTrailingPos] = useState({ x: -100, y: -100 });
  const [isHovered, setIsHovered] = useState(false);
  const [isClicking, setIsClicking] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Only enable on desktop devices with fine pointer and no reduced motion
    const isTouch = window.matchMedia('(hover: none) and (pointer: coarse)').matches;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (isTouch || prefersReducedMotion) return;

    let targetX = -100;
    let targetY = -100;
    let currentX = -100;
    let currentY = -100;

    const handleMouseMove = (e: MouseEvent) => {
      targetX = e.clientX;
      targetY = e.clientY;
      setPos({ x: e.clientX, y: e.clientY });
      if (!isVisible) setIsVisible(true);

      // Check if hovering interactive elements
      const target = e.target as HTMLElement | null;
      const interactive = target?.closest('a, button, input, textarea, [data-interactive="true"]');
      setIsHovered(!!interactive);
    };

    const handleMouseDown = () => setIsClicking(true);
    const handleMouseUp = () => setIsClicking(false);
    const handleMouseLeave = () => setIsVisible(false);
    const handleMouseEnter = () => setIsVisible(true);

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);

    let frameId: number;
    const lerp = () => {
      // Smooth interpolation for the follower ring
      currentX += (targetX - currentX) * 0.18;
      currentY += (targetY - currentY) * 0.18;
      setTrailingPos({ x: currentX, y: currentY });
      frameId = requestAnimationFrame(lerp);
    };
    frameId = requestAnimationFrame(lerp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
      cancelAnimationFrame(frameId);
    };
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div className="custom-cursor-element pointer-events-none fixed inset-0 z-50 overflow-hidden">
      {/* Central Glowing Dot */}
      <div
        className="fixed w-2 h-2 -ml-1 -mt-1 bg-white rounded-full shadow-[0_0_10px_#5B8CFF,0_0_20px_#9B6BFF] transition-transform duration-75"
        style={{
          transform: `translate3d(${pos.x}px, ${pos.y}px, 0) scale(${isClicking ? 0.6 : 1})`,
        }}
      />

      {/* Outer Follower Ring */}
      <div
        className={`fixed rounded-full border transition-all duration-200 ease-out ${
          isHovered
            ? 'w-12 h-12 -ml-6 -mt-6 border-[#9B6BFF] bg-[#5B8CFF]/10 scale-125 backdrop-blur-[1px]'
            : 'w-8 h-8 -ml-4 -mt-4 border-[#5B8CFF]/60 bg-transparent scale-100'
        }`}
        style={{
          transform: `translate3d(${trailingPos.x}px, ${trailingPos.y}px, 0) scale(${
            isClicking ? 0.8 : isHovered ? 1.3 : 1
          })`,
          boxShadow: isHovered
            ? '0 0 25px rgba(155, 107, 255, 0.4), inset 0 0 10px rgba(91, 140, 255, 0.2)'
            : '0 0 12px rgba(91, 140, 255, 0.2)',
        }}
      />
    </div>
  );
};
