import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { Package, AlertTriangle, CheckCircle, Clock } from 'lucide-react';

const InventoryOptimization: React.FC = () => {
  const optimizationRef = useRef<HTMLDivElement>(null);

  const recommendations = [
    {
      product: 'Organic Apples',
      category: 'Produce',
      currentStock: 1250,
      optimalStock: 1800,
      action: 'increase',
      urgency: 'medium',
      savings: '$2,300'
    },
    {
      product: 'iPhone 15',
      category: 'Electronics',
      currentStock: 450,
      optimalStock: 300,
      action: 'reduce',
      urgency: 'low',
      savings: '$8,500'
    },
    {
      product: 'Winter Jackets',
      category: 'Apparel',
      currentStock: 80,
      optimalStock: 250,
      action: 'increase',
      urgency: 'high',
      savings: '$1,200'
    },
    {
      product: 'Protein Powder',
      category: 'Supplements',
      currentStock: 320,
      optimalStock: 320,
      action: 'maintain',
      urgency: 'none',
      savings: '$0'
    }
  ];

  useEffect(() => {
    const container = optimizationRef.current;
    if (!container) return;

    gsap.from('.optimization-row', {
      opacity: 0,
      y: 30,
      duration: 0.6,
      stagger: 0.1,
      ease: 'power2.out'
    });
  }, []);

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'increase':
        return <AlertTriangle className="w-4 h-4 text-orange-500" />;
      case 'reduce':
        return <Package className="w-4 h-4 text-blue-500" />;
      case 'maintain':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'low':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  return (
    <div ref={optimizationRef} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
      <div className="flex items-center space-x-2 mb-6">
        <Package className="w-6 h-6 text-green-600" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Inventory Optimization
        </h3>
      </div>
      
      <div className="space-y-4">
        {recommendations.map((rec, index) => (
          <div key={index} className="optimization-row p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                {getActionIcon(rec.action)}
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    {rec.product}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {rec.category}
                  </p>
                </div>
              </div>
              
              {rec.urgency !== 'none' && (
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getUrgencyColor(rec.urgency)}`}>
                  {rec.urgency} priority
                </span>
              )}
            </div>
            
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <div className="text-gray-600 dark:text-gray-400 mb-1">Current</div>
                <div className="font-medium text-gray-900 dark:text-white">
                  {rec.currentStock.toLocaleString()}
                </div>
              </div>
              
              <div>
                <div className="text-gray-600 dark:text-gray-400 mb-1">Optimal</div>
                <div className="font-medium text-gray-900 dark:text-white">
                  {rec.optimalStock.toLocaleString()}
                </div>
              </div>
              
              <div>
                <div className="text-gray-600 dark:text-gray-400 mb-1">Savings</div>
                <div className="font-medium text-green-600 dark:text-green-400">
                  {rec.savings}
                </div>
              </div>
            </div>
            
            <div className="mt-3">
              <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                Recommended Action
              </div>
              <div className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                {rec.action === 'increase' ? 'Increase stock by ' + (rec.optimalStock - rec.currentStock) :
                 rec.action === 'reduce' ? 'Reduce stock by ' + (rec.currentStock - rec.optimalStock) :
                 'Maintain current stock level'}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default InventoryOptimization;