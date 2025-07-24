import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';

interface InfoTooltipProps {
  text: string;
  className?: string;
}

const InfoTooltip: React.FC<InfoTooltipProps> = ({ text, className = "" }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLButtonElement>(null);

  const updatePosition = () => {
    if (!triggerRef.current) return;
    
    const rect = triggerRef.current.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const scrollX = window.scrollX;
    const scrollY = window.scrollY;
    
    // Estimate tooltip dimensions
    const estimatedTooltipWidth = Math.min(300, Math.max(200, text.length * 8));
    const estimatedTooltipHeight = Math.max(60, Math.ceil(text.length / 40) * 20);
    
    // Default position (above the trigger)
    let top = rect.top + scrollY - estimatedTooltipHeight - 8;
    let left = rect.left + scrollX - estimatedTooltipWidth / 2 + rect.width / 2;
    
    // Adjust horizontally if tooltip would go off-screen
    if (left < 10) {
      left = 10;
    } else if (left + estimatedTooltipWidth > viewportWidth - 10) {
      left = viewportWidth - estimatedTooltipWidth - 10;
    }
    
    // Adjust vertically if tooltip would go off-screen at top
    if (top < 10) {
      top = rect.bottom + scrollY + 8; // Show below instead
    }
    
    setPosition({ top, left });
  };

  useEffect(() => {
    if (isVisible) {
      updatePosition();
      const handleScroll = () => updatePosition();
      const handleResize = () => updatePosition();
      
      window.addEventListener('scroll', handleScroll, true);
      window.addEventListener('resize', handleResize);
      
      return () => {
        window.removeEventListener('scroll', handleScroll, true);
        window.removeEventListener('resize', handleResize);
      };
    }
  }, [isVisible, text]);

  return (
    <div className={`relative inline-block ${className}`}>
      <button
        ref={triggerRef}
        type="button"
        className="inline-flex items-center justify-center w-4 h-4 ml-1 text-gray-400 hover:text-red-600 focus:outline-none transition-colors duration-200"
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        onFocus={() => setIsVisible(true)}
        onBlur={() => setIsVisible(false)}
        title={text} // Fallback browser tooltip
      >
        <svg 
          className="w-4 h-4" 
          fill="currentColor" 
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path 
            fillRule="evenodd" 
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" 
            clipRule="evenodd" 
          />
        </svg>
      </button>
      
      {/* Render tooltip using portal to avoid clipping */}
      {isVisible && createPortal(
        <div 
          className="fixed z-[9999] px-3 py-2 text-sm text-white bg-gray-800 rounded-lg shadow-2xl border border-gray-600 pointer-events-none transition-opacity duration-200 max-w-xs"
          style={{
            top: `${position.top}px`,
            left: `${position.left}px`,
          }}
        >
          <div className="leading-relaxed break-words">{text}</div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default InfoTooltip;
