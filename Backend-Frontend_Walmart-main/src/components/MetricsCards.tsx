import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { 
  Package, 
  Truck, 
  AlertTriangle, 
  CheckCircle, 
  TrendingUp, 
  TrendingDown,
  Clock,
  DollarSign
} from 'lucide-react';

const MetricsCards: React.FC = () => {
  const cardsRef = useRef<HTMLDivElement>(null);

  const metrics = [
    {
      title: 'Total Products',
      value: '2,547,891',
      change: '+12.5%',
      trend: 'up',
      icon: Package,
      color: 'blue',
      bgGradient: 'from-blue-500 to-blue-600'
    },
    {
      title: 'Active Shipments',
      value: '15,247',
      change: '+8.2%',
      trend: 'up',
      icon: Truck,
      color: 'green',
      bgGradient: 'from-green-500 to-green-600'
    },
    {
      title: 'Avg. Transit Time',
      value: '4.2 days',
      change: '-15.3%',
      trend: 'down',
      icon: Clock,
      color: 'purple',
      bgGradient: 'from-purple-500 to-purple-600'
    },
    {
      title: 'Cost Savings',
      value: '$1.2M',
      change: '+23.1%',
      trend: 'up',
      icon: DollarSign,
      color: 'orange',
      bgGradient: 'from-orange-500 to-orange-600'
    },
    {
      title: 'Verified Products',
      value: '2,489,234',
      change: '+5.7%',
      trend: 'up',
      icon: CheckCircle,
      color: 'emerald',
      bgGradient: 'from-emerald-500 to-emerald-600'
    },
    {
      title: 'Issues Detected',
      value: '127',
      change: '-31.4%',
      trend: 'down',
      icon: AlertTriangle,
      color: 'red',
      bgGradient: 'from-red-500 to-red-600'
    }
  ];

  useEffect(() => {
    const cards = cardsRef.current;
    if (!cards) return;

    // Animate cards on load
    gsap.from(cards.children, {
      opacity: 0,
      y: 50,
      duration: 0.6,
      stagger: 0.1,
      ease: 'power2.out'
    });

    // Hover animations
    const cardElements = cards.querySelectorAll('.metric-card');
    cardElements.forEach((card) => {
      const icon = card.querySelector('.metric-icon');
      
      card.addEventListener('mouseenter', () => {
        gsap.to(card, { scale: 1.02, duration: 0.3 });
        gsap.to(icon, { scale: 1.1, rotation: 5, duration: 0.3 });
      });
      
      card.addEventListener('mouseleave', () => {
        gsap.to(card, { scale: 1, duration: 0.3 });
        gsap.to(icon, { scale: 1, rotation: 0, duration: 0.3 });
      });
    });

    return () => {
      cardElements.forEach((card) => {
        card.removeEventListener('mouseenter', () => {});
        card.removeEventListener('mouseleave', () => {});
      });
    };
  }, []);

  return (
    <div ref={cardsRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {metrics.map((metric, index) => (
        <div
          key={index}
          className="metric-card group relative bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-gray-700"
        >
          {/* Background gradient overlay */}
          <div className={`absolute inset-0 bg-gradient-to-r ${metric.bgGradient} opacity-0 group-hover:opacity-5 rounded-xl transition-opacity duration-300`} />
          
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className={`metric-icon p-3 rounded-lg bg-gradient-to-r ${metric.bgGradient} shadow-lg`}>
                <metric.icon className="w-6 h-6 text-white" />
              </div>
              
              <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${
                metric.trend === 'up' 
                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                  : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
              }`}>
                {metric.trend === 'up' ? (
                  <TrendingUp className="w-3 h-3" />
                ) : (
                  <TrendingDown className="w-3 h-3" />
                )}
                <span>{metric.change}</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {metric.title}
              </h3>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {metric.value}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default MetricsCards;