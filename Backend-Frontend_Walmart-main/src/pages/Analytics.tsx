import React from 'react';
import AnalyticsHeader from '../components/AnalyticsHeader';
import AnalyticsOverview from '../components/AnalyticsOverview';
import PredictiveAnalytics from '../components/PredictiveAnalytics';
import SupplierPerformance from '../components/SupplierPerformance';
import InventoryOptimization from '../components/InventoryOptimization';
import AIPredictions from '../components/AIPredictions';

const Analytics: React.FC = () => {
  return (
    <div className="min-h-screen pt-16 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AnalyticsHeader />
        
        <div className="space-y-8">
          <AnalyticsOverview />
          <PredictiveAnalytics />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <SupplierPerformance />
            <InventoryOptimization />
          </div>
          
          <AIPredictions />
        </div>
      </div>
    </div>
  );
};

export default Analytics;