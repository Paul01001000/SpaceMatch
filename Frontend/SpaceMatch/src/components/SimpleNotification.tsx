import React, { useState, useEffect } from 'react';

interface SimpleNotificationProps {
  message: string;
  type?: 'success' | 'error' | 'info';
  onClose: () => void;
}

const SimpleNotification: React.FC<SimpleNotificationProps> = ({ 
  message, 
  type = 'info', 
  onClose 
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Show notification
    setIsVisible(true);

    // Auto-close after 15 seconds
    const timer = setTimeout(() => {
      handleClose();
    }, 15000);

    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      onClose();
    }, 300); // Wait for fade-out animation
  };

  const getIcon = () => {
    switch (type) {
      case 'success': return '🎉';
      case 'error': return '❌';
      case 'info': return 'ℹ️';
      default: return 'ℹ️';
    }
  };

  const getBorderColor = () => {
    switch (type) {
      case 'success': return 'border-green-500';
      case 'error': return 'border-red-700';
      case 'info': return 'border-red-700';
      default: return 'border-red-700';
    }
  };

  const getBackgroundColor = () => {
    switch (type) {
      case 'success': return 'bg-green-50';
      case 'error': return 'bg-red-50';
      case 'info': return 'bg-white';
      default: return 'bg-white';
    }
  };

  const getProgressBarColor = () => {
    switch (type) {
      case 'success': return 'bg-green-500';
      case 'error': return 'bg-red-700';
      case 'info': return 'bg-red-700';
      default: return 'bg-red-700';
    }
  };

  return (
    <div 
      className={`
        fixed bottom-6 right-6 z-50 max-w-sm w-full
        transform transition-all duration-300 ease-out
        ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}
      `}
    >
      <div className={`
        ${getBackgroundColor()} border-2 ${getBorderColor()} rounded-lg shadow-lg p-4
        text-black
      `}>
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3">
            <span className={`text-xl ${type === 'success' ? 'animate-bounce' : ''}`}>{getIcon()}</span>
            <p className="text-sm leading-relaxed text-black flex-1">
              {message}
            </p>
          </div>
          
          <button
            onClick={handleClose}
            className="ml-4 text-black hover:text-red-700 transition-colors duration-200 hover:bg-gray-100 rounded p-1"
            aria-label="Close notification"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Progress bar */}
        <div className="mt-3 bg-gray-200 rounded-full h-1">
          <div className={`h-full ${getProgressBarColor()} rounded-full animate-pulse`} />
        </div>
      </div>
    </div>
  );
};

export default SimpleNotification;
