import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { Shield, Leaf, Award, Thermometer, Scale, Calendar } from 'lucide-react';

const ProductDetails: React.FC = () => {
  const detailsRef = useRef<HTMLDivElement>(null);

  const productInfo = {
    name: 'Organic Apples',
    batchNumber: 'OA-2024-001',
    variety: 'Gala',
    origin: 'California, USA',
    harvestDate: '2024-01-15',
    expiryDate: '2024-02-15',
    weight: '5.2 kg',
    temperature: '2-4°C',
    certifications: ['USDA Organic', 'Fair Trade', 'Non-GMO'],
    sustainabilityScore: 92
  };

  const certificationIcons = {
    'USDA Organic': Leaf,
    'Fair Trade': Award,
    'Non-GMO': Shield
  };

  useEffect(() => {
    const container = detailsRef.current;
    if (!container) return;

    gsap.from('.detail-card', {
      opacity: 0,
      y: 30,
      duration: 0.6,
      stagger: 0.1,
      ease: 'power2.out'
    });

    // Animate sustainability score
    gsap.from({ score: 0 }, {
      score: productInfo.sustainabilityScore,
      duration: 2,
      ease: 'power2.out',
      onUpdate: function() {
        const scoreElement = container?.querySelector('.sustainability-score');
        if (scoreElement) {
          scoreElement.textContent = Math.floor(this.targets()[0].score).toString();
        }
      }
    });
  }, []);

  return (
    <div ref={detailsRef} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
        Product Details
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Basic Information */}
        <div className="detail-card space-y-4">
          <h4 className="text-md font-medium text-gray-900 dark:text-white">
            Basic Information
          </h4>
          
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Product:</span>
              <span className="font-medium text-gray-900 dark:text-white">{productInfo.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Batch:</span>
              <span className="font-medium text-gray-900 dark:text-white">{productInfo.batchNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Variety:</span>
              <span className="font-medium text-gray-900 dark:text-white">{productInfo.variety}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Origin:</span>
              <span className="font-medium text-gray-900 dark:text-white">{productInfo.origin}</span>
            </div>
          </div>
        </div>

        {/* Storage & Handling */}
        <div className="detail-card space-y-4">
          <h4 className="text-md font-medium text-gray-900 dark:text-white">
            Storage & Handling
          </h4>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                <span className="text-gray-600 dark:text-gray-400">Harvest:</span>
              </div>
              <span className="font-medium text-gray-900 dark:text-white">{productInfo.harvestDate}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                <span className="text-gray-600 dark:text-gray-400">Expiry:</span>
              </div>
              <span className="font-medium text-gray-900 dark:text-white">{productInfo.expiryDate}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Scale className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                <span className="text-gray-600 dark:text-gray-400">Weight:</span>
              </div>
              <span className="font-medium text-gray-900 dark:text-white">{productInfo.weight}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Thermometer className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                <span className="text-gray-600 dark:text-gray-400">Temperature:</span>
              </div>
              <span className="font-medium text-gray-900 dark:text-white">{productInfo.temperature}</span>
            </div>
          </div>
        </div>

        {/* Certifications */}
        <div className="detail-card space-y-4">
          <h4 className="text-md font-medium text-gray-900 dark:text-white">
            Certifications
          </h4>
          
          <div className="space-y-3">
            {productInfo.certifications.map((cert, index) => {
              const Icon = certificationIcons[cert as keyof typeof certificationIcons];
              return (
                <div key={index} className="flex items-center space-x-3 p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <Icon className="w-5 h-5 text-green-600 dark:text-green-400" />
                  <span className="text-green-800 dark:text-green-300 font-medium">{cert}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Sustainability Score */}
        <div className="detail-card space-y-4">
          <h4 className="text-md font-medium text-gray-900 dark:text-white">
            Sustainability Score
          </h4>
          
          <div className="flex items-center justify-center">
            <div className="relative w-24 h-24">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  stroke="#E5E7EB"
                  strokeWidth="8"
                  fill="none"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  stroke="#10B981"
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray={`${productInfo.sustainabilityScore * 2.83} 283`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white sustainability-score">
                    {productInfo.sustainabilityScore}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">Score</div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-sm text-green-600 dark:text-green-400 font-medium">
              Excellent Sustainability
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">
              Above industry average
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;