import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import {
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';

const AnalyticsOverview: React.FC = () => {
  const chartRef = useRef<HTMLDivElement>(null);

  const data = [
    { month: 'Jan', shipments: 12400, efficiency: 92, cost: 1.2 },
    { month: 'Feb', shipments: 13200, efficiency: 93, cost: 1.1 },
    { month: 'Mar', shipments: 14100, efficiency: 94, cost: 1.0 },
    { month: 'Apr', shipments: 15300, efficiency: 95, cost: 0.9 },
    { month: 'May', shipments: 16200, efficiency: 96, cost: 0.8 },
    { month: 'Jun', shipments: 17800, efficiency: 94, cost: 0.7 }
  ];

  useEffect(() => {
    const container = chartRef.current;
    if (!container) return;

    gsap.from(container, {
      opacity: 0,
      y: 30,
      duration: 0.8,
      ease: 'power2.out'
    });
  }, []);

  return (
    <div ref={chartRef} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
        Supply Chain Performance Overview
      </h3>
      
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="month" stroke="#6B7280" />
            <YAxis yAxisId="left" stroke="#6B7280" />
            <YAxis yAxisId="right" orientation="right" stroke="#6B7280" />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1F2937',
                border: 'none',
                borderRadius: '8px',
                color: '#F9FAFB'
              }}
            />
            <Legend />
            <Bar yAxisId="left" dataKey="shipments" fill="#3B82F6" name="Shipments" />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="efficiency"
              stroke="#10B981"
              strokeWidth={3}
              name="Efficiency %"
              dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="cost"
              stroke="#F59E0B"
              strokeWidth={3}
              name="Cost (M$)"
              dot={{ fill: '#F59E0B', strokeWidth: 2, r: 4 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default AnalyticsOverview;