import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { 
  Shield, 
  Eye, 
  Zap, 
  Brain, 
  Globe, 
  Lock,
  Truck,
  BarChart3,
  CheckCircle
} from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const FeaturesSection: React.FC = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);

  const features = [
    {
      icon: Shield,
      title: 'Blockchain Security',
      description: 'Immutable ledger technology ensures data integrity and prevents tampering across the entire supply chain.',
      gradient: 'from-blue-500 to-cyan-500'
    },
    {
      icon: Eye,
      title: 'Real-time Visibility',
      description: 'Track products from source to destination with complete transparency and instant updates.',
      gradient: 'from-green-500 to-emerald-500'
    },
    {
      icon: Brain,
      title: 'AI Predictions',
      description: 'Machine learning algorithms predict demand patterns and optimize inventory management.',
      gradient: 'from-purple-500 to-pink-500'
    },
    {
      icon: Zap,
      title: 'Instant Verification',
      description: 'QR code scanning provides immediate product authenticity and journey verification.',
      gradient: 'from-yellow-500 to-orange-500'
    },
    {
      icon: Globe,
      title: 'Global Network',
      description: 'Connected network of suppliers, manufacturers, and retailers across multiple continents.',
      gradient: 'from-indigo-500 to-purple-500'
    },
    {
      icon: BarChart3,
      title: 'Advanced Analytics',
      description: 'Comprehensive reporting and insights for data-driven supply chain optimization.',
      gradient: 'from-red-500 to-pink-500'
    }
  ];

  useEffect(() => {
    const section = sectionRef.current;
    const featuresContainer = featuresRef.current;
    
    if (!section || !featuresContainer) return;

    // Animate features on scroll
    gsap.from(featuresContainer.children, {
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

    // Hover animations
    const featureCards = featuresContainer.querySelectorAll('.feature-card');
    featureCards.forEach((card) => {
      const icon = card.querySelector('.feature-icon');
      
      card.addEventListener('mouseenter', () => {
        gsap.to(icon, { scale: 1.1, rotation: 5, duration: 0.3 });
      });
      
      card.addEventListener('mouseleave', () => {
        gsap.to(icon, { scale: 1, rotation: 0, duration: 0.3 });
      });
    });

    return () => {
      featureCards.forEach((card) => {
        card.removeEventListener('mouseenter', () => {});
        card.removeEventListener('mouseleave', () => {});
      });
    };
  }, []);

  return (
    <div ref={sectionRef} className="py-20 bg-gray-50 dark:bg-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Revolutionary Features
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Discover how ChainTrack transforms supply chain management with cutting-edge technology
          </p>
        </div>

        <div ref={featuresRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="feature-card group relative bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2"
            >
              {/* Gradient overlay */}
              <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-10 rounded-2xl transition-opacity duration-300`} />
              
              {/* Content */}
              <div className="relative z-10">
                <div className={`feature-icon inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r ${feature.gradient} mb-6 shadow-lg`}>
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-purple-600 transition-all duration-300">
                  {feature.title}
                </h3>
                
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  {feature.description}
                </p>
              </div>

              {/* Floating elements */}
              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <CheckCircle className="w-5 h-5 text-green-500" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FeaturesSection;