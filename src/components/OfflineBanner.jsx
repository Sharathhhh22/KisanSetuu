import React, { useState, useEffect } from 'react';
import { WifiOff, CheckCircle } from 'lucide-react';

export default function OfflineBanner({ langData }) {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline) return null;

  return (
    <div className="bg-amber-600 text-white text-xs sm:text-sm py-2 px-4 shadow-inner">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <WifiOff className="w-4 h-4 shrink-0" />
          <span>
            <strong>ಆಫ್‌ಲೈನ್ ಮೋಡ್ ಸಕ್ರಿಯವಾಗಿದೆ (Offline Mode Active):</strong> ನೀವು ಇಂಟರ್ನೆಟ್ ಸಂಪರ್ಕವಿಲ್ಲದೆ ಉಳಿಸಿದ ಹವಾಮಾನ ಸಲಹೆಗಳನ್ನು, ಮಂಡಿ ಧಾರಣೆಗಳನ್ನು ವೀಕ್ಷಿಸಬಹುದು. ಆನ್‌ಲೈನ್‌ಗೆ ಬಂದ ನಂತರ ಹೊಸ ಮಾಹಿತಿ ನವೀಕರಣಗೊಳ್ಳುತ್ತದೆ.
          </span>
        </div>
        <div className="hidden sm:flex items-center space-x-1 shrink-0 text-amber-100 text-xs">
          <CheckCircle className="w-3.5 h-3.5" />
          <span>ಸ್ಥಳೀಯ ಸಂಗ್ರಹಣೆ ಲಭ್ಯವಿದೆ</span>
        </div>
      </div>
    </div>
  );
}
