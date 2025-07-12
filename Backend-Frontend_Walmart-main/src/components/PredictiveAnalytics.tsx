import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { Brain, TrendingUp, BadgeAlert as Alert, Calendar } from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';

const PredictiveAnalytics: React.FC = () => {
  const analyticsRef = useRef<HTMLDivElement>(null);

  const predictionData = [
    { week: 'W1', actual: 15200, predicted: 15100, demand: 14800 },
    { week: 'W2', actual: 16100, predicted: 16000, demand: 15600 },
    { week: 'W3', actual: 14800, predicted: 14900, demand: 15200 },
    { week: 'W4', actual: 17200, predicted: 17100, demand: 16800 },
    { week: 'W5', actual: null, predicted: 18300, demand: 17900 },
    { week: 'W6', actual: null, predicted: 19100, demand: 18500 },
    { week: 'W7', actual: null, predicted: 20200, demand: 19800 },
    { week: 'W8', actual: null, predicted: 21000, demand: 20500 }
  ];

  const insights = [
    {
      type: 'warning',
      title: 'Demand Spike Predicted',
      description: 'Electronics category expected to increase by 25% in Week 6',
      icon: TrendingUp,
      color: 'orange'
    },
    {
      type: 'alert',
      title: 'Inventory Risk',
      description: 'Organic produce may face shortage in Week 8',
      icon: Alert,
      color: 'red'
    },
    {
      type: 'info',
      title: 'Seasonal Trend',
      description: 'Holiday shopping pattern detected starting Week 5',
      icon: Calendar,
      color: 'blue'
    }
  ];

  useEffect(() => {
    const container = analyticsRef.current;
    if (!container) return;

    gsap.from('.prediction-card', {
      opacity: 0,
      y: 30,
      duration: 0.8,
      stagger: 0.1,
      ease: 'power2.out'
    });
  }, []);

  return (
    <div ref={analyticsRef} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Prediction Chart */}
      <div className="prediction-card lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
        <div className="flex items-center space-x-2 mb-6">
          <Brain className="w-6 h-6 text-purple-600" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            AI Demand Predictions
          </h3>
        </div>
        
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={predictionData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="week" stroke="#6B7280" />
              <YAxis stroke="#6B7280" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1F2937',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#F9FAFB'
                }}
              />
              <ReferenceLine x="W4" stroke="#EF4444" strokeDasharray="5 5" />
              <Line
                type="monotone"
                dataKey="actual"
                stroke="#3B82F6"
                strokeWidth={3}
                name="Actual"
                dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                connectNulls={false}
              />
              <Line
                type="monotone"
                dataKey="predicted"
                stroke="#8B5CF6"
                strokeWidth={3}
                strokeDasharray="5 5"
                name="Predicted"
                dot={{ fill: '#8B5CF6', strokeWidth: 2, r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="demand"
                stroke="#10B981"
                strokeWidth={2}
                name="Demand Forecast"
                dot={{ fill: '#10B981', strokeWidth: 2, r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        
        <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
          <span className="font-medium">Prediction Accuracy:</span> 97.3% | 
          <span className="font-medium"> Confidence Level:</span> 95%
        </div>
      </div>

      {/* AI Insights */}
      <div className="prediction-card bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
          AI Insights
        </h3>
        
        <div className="space-y-4">
          {insights.map((insight, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg border-l-4 ${
                insight.color === 'orange' ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20' :
                insight.color === 'red' ? 'border-red-500 bg-red-50 dark:bg-red-900/20' :
                'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
              }`}
            >
              <div className="flex items-start space-x-3">
                <insight.icon className={`w-5 h-5 mt-0.5 ${
                  insight.color === 'orange' ? 'text-orange-600' :
                  insight.color === 'red' ? 'text-red-600' :
                  'text-blue-600'
                }`} />
                <div>
                  <div className={`font-medium ${
                    insight.color === 'orange' ? 'text-orange-800 dark:text-orange-200' :
                    insight.color === 'red' ? 'text-red-800 dark:text-red-200' :
                    'text-blue-800 dark:text-blue-200'
                  }`}>
                    {insight.title}
                  </div>
                  <div className={`text-sm ${
                    insight.color === 'orange' ? 'text-orange-700 dark:text-orange-300' :
                    insight.color === 'red' ? 'text-red-700 dark:text-red-300' :
                    'text-blue-700 dark:text-blue-300'
                  }`}>
                    {insight.description}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PredictiveAnalytics;