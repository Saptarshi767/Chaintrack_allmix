import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { MapPin, Truck, Package, Store } from 'lucide-react';

const SupplyChainMap: React.FC = () => {
  const mapRef = useRef<HTMLDivElement>(null);

  const locations = [
    { id: 1, name: 'Farm A', type: 'origin', x: 20, y: 60, icon: Package },
    { id: 2, name: 'Factory B', type: 'manufacturing', x: 35, y: 45, icon: Package },
    { id: 3, name: 'Distribution Center', type: 'distribution', x: 55, y: 30, icon: Truck },
    { id: 4, name: 'Store 1', type: 'retail', x: 75, y: 40, icon: Store },
    { id: 5, name: 'Store 2', type: 'retail', x: 85, y: 65, icon: Store }
  ];

  const routes = [
    { from: 1, to: 2 },
    { from: 2, to: 3 },
    { from: 3, to: 4 },
    { from: 3, to: 5 }
  ];

  useEffect(() => {
    const container = mapRef.current;
    if (!container) return;

    // Animate locations
    gsap.from('.map-location', {
      scale: 0,
      duration: 0.6,
      stagger: 0.2,
      ease: 'back.out(1.7)'
    });

    // Animate routes
    gsap.from('.map-route', {
      scaleX: 0,
      duration: 0.8,
      stagger: 0.1,
      ease: 'power2.out',
      delay: 0.5
    });

    // Pulse animation for active locations
    gsap.to('.map-location', {
      scale: 1.1,
      duration: 2,
      repeat: -1,
      yoyo: true,
      ease: 'power2.inOut',
      stagger: 0.3
    });
  }, []);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
        Supply Chain Network
      </h3>
      
      <div ref={mapRef} className="relative w-full h-96 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-700 dark:to-gray-600 rounded-lg overflow-hidden">
        {/* World map background pattern */}
        <div className="absolute inset-0 opacity-10">
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <defs>
              <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                <path d="M 10 0 L 0 0 0 10" fill="none" stroke="#374151" strokeWidth="0.5"/>
              </pattern>
            </defs>
            <rect width="100" height="100" fill="url(#grid)" />
          </svg>
        </div>

        {/* Routes */}
        {routes.map((route, index) => {
          const fromLocation = locations.find(loc => loc.id === route.from);
          const toLocation = locations.find(loc => loc.id === route.to);
          
          if (!fromLocation || !toLocation) return null;

          return (
            <div
              key={index}
              className="map-route absolute border-t-2 border-blue-500 border-dashed origin-left"
              style={{
                left: `${fromLocation.x}%`,
                top: `${fromLocation.y}%`,
                width: `${Math.sqrt(
                  Math.pow(toLocation.x - fromLocation.x, 2) + 
                  Math.pow(toLocation.y - fromLocation.y, 2)
                )}%`,
                transform: `rotate(${Math.atan2(
                  toLocation.y - fromLocation.y,
                  toLocation.x - fromLocation.x
                ) * 180 / Math.PI}deg)`,
                transformOrigin: '0 0'
              }}
            />
          );
        })}

        {/* Locations */}
        {locations.map((location) => (
          <div
            key={location.id}
            className="map-location absolute transform -translate-x-1/2 -translate-y-1/2 group cursor-pointer"
            style={{ left: `${location.x}%`, top: `${location.y}%` }}
          >
            <div className="relative">
              <div className={`w-12 h-12 rounded-full shadow-lg flex items-center justify-center ${
                location.type === 'origin' ? 'bg-green-500' :
                location.type === 'manufacturing' ? 'bg-blue-500' :
                location.type === 'distribution' ? 'bg-purple-500' :
                'bg-orange-500'
              }`}>
                <location.icon className="w-6 h-6 text-white" />
              </div>
              
              {/* Pulse rings */}
              <div className="absolute inset-0 rounded-full border-2 border-current animate-ping opacity-30" />
              <div className="absolute inset-0 rounded-full border-2 border-current animate-ping opacity-20" style={{ animationDelay: '0.5s' }} />
              
              {/* Label */}
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-2 py-1 bg-white dark:bg-gray-800 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                <div className="text-xs font-medium text-gray-900 dark:text-white">
                  {location.name}
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Legend */}
        <div className="absolute bottom-4 left-4 bg-white dark:bg-gray-800 rounded-lg p-3 shadow-lg">
          <div className="text-xs font-medium text-gray-900 dark:text-white mb-2">Legend</div>
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full" />
              <span className="text-xs text-gray-600 dark:text-gray-400">Origin</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full" />
              <span className="text-xs text-gray-600 dark:text-gray-400">Manufacturing</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-purple-500 rounded-full" />
              <span className="text-xs text-gray-600 dark:text-gray-400">Distribution</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-orange-500 rounded-full" />
              <span className="text-xs text-gray-600 dark:text-gray-400">Retail</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupplyChainMap;