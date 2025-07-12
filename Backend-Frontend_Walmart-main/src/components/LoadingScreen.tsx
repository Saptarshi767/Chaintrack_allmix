import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { Package, Truck, Store, CheckCircle } from 'lucide-react';

const LoadingScreen: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const stepsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    const progress = progressRef.current;
    const steps = stepsRef.current;

    if (!container || !progress || !steps) return;

    // Animate progress bar
    gsap.to(progress, {
      width: '100%',
      duration: 1.8,
      ease: 'power2.out'
    });

    // Animate steps
    const stepElements = steps.children;
    gsap.from(stepElements, {
      opacity: 0,
      y: 20,
      duration: 0.5,
      stagger: 0.2,
      delay: 0.3
    });

    // Animate step completion
    gsap.to(stepElements, {
      scale: 1.1,
      duration: 0.3,
      stagger: 0.4,
      delay: 0.8,
      yoyo: true,
      repeat: 1
    });

    // Fade out loading screen
    gsap.to(container, {
      opacity: 0,
      duration: 0.5,
      delay: 1.5
    });
  }, []);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center z-50"
    >
      <div className="text-center">
        <div className="mb-8">
          <h1 className="text-5xl font-bold mb-2 text-white drop-shadow-lg">ChainTrack</h1>
          <p className="text-xl text-blue-100 font-medium">Blockchain Supply Chain Transparency</p>
        </div>
        
        <div className="mb-12">
          <div className="w-80 h-3 bg-blue-900/50 rounded-full mx-auto overflow-hidden border border-blue-500/30">
            <div
              ref={progressRef}
              className="h-full bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full w-0 shadow-lg"
            />
          </div>
        </div>

        <div ref={stepsRef} className="flex justify-center space-x-12">
          <div className="flex flex-col items-center space-y-3">
            <div className="p-3 bg-white/20 rounded-full backdrop-blur-sm border border-white/30">
              <Package className="w-8 h-8 text-white drop-shadow-md" />
            </div>
            <span className="text-sm font-medium text-white">Products</span>
          </div>
          <div className="flex flex-col items-center space-y-3">
            <div className="p-3 bg-white/20 rounded-full backdrop-blur-sm border border-white/30">
              <Truck className="w-8 h-8 text-white drop-shadow-md" />
            </div>
            <span className="text-sm font-medium text-white">Logistics</span>
          </div>
          <div className="flex flex-col items-center space-y-3">
            <div className="p-3 bg-white/20 rounded-full backdrop-blur-sm border border-white/30">
              <Store className="w-8 h-8 text-white drop-shadow-md" />
            </div>
            <span className="text-sm font-medium text-white">Stores</span>
          </div>
          <div className="flex flex-col items-center space-y-3">
            <div className="p-3 bg-white/20 rounded-full backdrop-blur-sm border border-white/30">
              <CheckCircle className="w-8 h-8 text-white drop-shadow-md" />
            </div>
            <span className="text-sm font-medium text-white">Verified</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;