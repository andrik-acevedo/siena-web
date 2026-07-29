import { ReactNode, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

interface PageTransitionProps {
  children: ReactNode;
}

export default function PageTransition({ children }: PageTransitionProps) {
  const location = useLocation();
  const [displayLocation, setDisplayLocation] = useState(location);
  const [transitionStage, setTransitionStage] = useState('enter');

  useEffect(() => {
    if (location !== displayLocation) {
      setTransitionStage('exit');
    }
  }, [location, displayLocation]);

  useEffect(() => {
    if (transitionStage === 'exit') {
      const timer = setTimeout(() => {
        setDisplayLocation(location);
        setTransitionStage('enter');
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [transitionStage, location]);

  return (
    <div className="relative overflow-hidden">
      <div
        className={`transition-all duration-700 ease-[cubic-bezier(0.4,0,0.2,1)] ${
          transitionStage === 'exit'
            ? 'opacity-0 blur-sm transform scale-105'
            : 'opacity-100 blur-none transform scale-100'
        }`}
        key={displayLocation.pathname}
      >
        {children}
      </div>
      
      {/* Overlay effect during transition */}
      <div
        className={`absolute inset-0 bg-gradient-to-br from-[#021E3C]/20 to-[#03274B]/20 pointer-events-none transition-opacity duration-400 ${
          transitionStage === 'exit' ? 'opacity-100' : 'opacity-0'
        }`}
      />
    </div>
  );
} 