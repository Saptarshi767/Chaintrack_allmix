import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Package, Truck, Shield, TrendingUp } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const StatsSection: React.FC = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);

  const stats = [
    { icon: Package, value: '2.5M+', label: 'Products Tracked', color: 'text-blue-600' },
    { icon: Truck, value: '15K+', label: 'Shipments Daily', color: 'text-green-600' },
    { icon: Shield, value: '99.9%', label: 'Accuracy Rate', color: 'text-purple-600' },
    { icon: TrendingUp, value: '45%', label: 'Cost Reduction', color: 'text-orange-600' }
  ];

  useEffect(() => {
    const section = sectionRef.current;
    const statsContainer = statsRef.current;
    
    if (!section || !statsContainer) return;

    // Animate stats on scroll
    gsap.from(statsContainer.children, {
      opacity: 0,
      y: 50,
      duration: 0.8,
      stagger: 0.2,
      scrollTrigger: {
        trigger: section,
        start: 'top 80%',
        end: 'bottom 20%',
        toggleActions: 'play none none reverse'
      }
    });

    // Animate numbers counting up
    stats.forEach((stat, index) => {
      const element = statsContainer.children[index]?.querySelector('.stat-number');
      if (element) {
        const endValue = parseFloat(stat.value.replace(/[^0-9.]/g, ''));
        gsap.from({ value: 0 }, {
          value: endValue,
          duration: 2,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: section,
            start: 'top 80%',
            toggleActions: 'play none none reverse'
          },
          onUpdate: function() {
            const suffix = stat.value.includes('%') ? '%' : 
                         stat.value.includes('K') ? 'K+' : 
                         stat.value.includes('M') ? 'M+' : '';
            element.textContent = Math.floor(this.targets()[0].value).toLocaleString() + suffix;
          }
        });
      }
    });
  }, []);

  return (
    <div ref={sectionRef} className="py-20 bg-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Trusted by Industry Leaders
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Delivering transparency and efficiency across global supply chains
          </p>
        </div>

        <div ref={statsRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="group relative bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-700 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-purple-600/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              <div className="relative z-10">
                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r ${stat.color === 'text-blue-600' ? 'from-blue-100 to-blue-200' : 
                  stat.color === 'text-green-600' ? 'from-green-100 to-green-200' :
                  stat.color === 'text-purple-600' ? 'from-purple-100 to-purple-200' :
                  'from-orange-100 to-orange-200'} mb-6`}>
                  <stat.icon className={`w-8 h-8 ${stat.color}`} />
                </div>
                
                <div className={`text-4xl font-bold ${stat.color} mb-2 stat-number`}>
                  {stat.value}
                </div>
                
                <div className="text-gray-600 dark:text-gray-300 font-medium">
                  {stat.label}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StatsSection;