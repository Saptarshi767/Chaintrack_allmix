import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { Star, TrendingUp, TrendingDown, Award } from 'lucide-react';

const SupplierPerformance: React.FC = () => {
  const performanceRef = useRef<HTMLDivElement>(null);

  const suppliers = [
    {
      name: 'FreshFarm Co.',
      category: 'Organic Produce',
      rating: 4.8,
      onTime: 96,
      quality: 98,
      trend: 'up',
      change: '+2.3%'
    },
    {
      name: 'TechSupply Inc.',
      category: 'Electronics',
      rating: 4.6,
      onTime: 94,
      quality: 95,
      trend: 'up',
      change: '+1.8%'
    },
    {
      name: 'Global Logistics',
      category: 'Transportation',
      rating: 4.4,
      onTime: 92,
      quality: 94,
      trend: 'down',
      change: '-0.5%'
    },
    {
      name: 'SportGear Ltd.',
      category: 'Apparel',
      rating: 4.5,
      onTime: 93,
      quality: 96,
      trend: 'up',
      change: '+3.1%'
    }
  ];

  useEffect(() => {
    const container = performanceRef.current;
    if (!container) return;

    gsap.from('.supplier-row', {
      opacity: 0,
      x: -50,
      duration: 0.6,
      stagger: 0.1,
      ease: 'power2.out'
    });
  }, []);

  return (
    <div ref={performanceRef} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
      <div className="flex items-center space-x-2 mb-6">
        <Award className="w-6 h-6 text-yellow-600" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Supplier Performance
        </h3>
      </div>
      
      <div className="space-y-4">
        {suppliers.map((supplier, index) => (
          <div key={index} className="supplier-row p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">
                  {supplier.name}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {supplier.category}
                </p>
              </div>
              
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-1">
                  <Star className="w-4 h-4 text-yellow-500 fill-current" />
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {supplier.rating}
                  </span>
                </div>
                
                <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${
                  supplier.trend === 'up' 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                    : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                }`}>
                  {supplier.trend === 'up' ? (
                    <TrendingUp className="w-3 h-3" />
                  ) : (
                    <TrendingDown className="w-3 h-3" />
                  )}
                  <span>{supplier.change}</span>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                  On-Time Delivery
                </div>
                <div className="flex items-center space-x-2">
                  <div className="flex-1 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full"
                      style={{ width: `${supplier.onTime}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {supplier.onTime}%
                  </span>
                </div>
              </div>
              
              <div>
                <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                  Quality Score
                </div>
                <div className="flex items-center space-x-2">
                  <div className="flex-1 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full"
                      style={{ width: `${supplier.quality}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {supplier.quality}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SupplierPerformance;