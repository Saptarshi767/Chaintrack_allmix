import React from 'react';
import { TrendingUp, Download, Settings, RefreshCw } from 'lucide-react';

const AnalyticsHeader: React.FC = () => {
  return (
    <div className="mb-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Analytics Dashboard
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            AI-powered insights and predictive analytics for supply chain optimization
          </p>
        </div>
        
        <div className="flex items-center space-x-4 mt-4 sm:mt-0">
          <button className="p-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
            <RefreshCw className="w-5 h-5" />
          </button>
          <button className="p-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
            <Settings className="w-5 h-5" />
          </button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2">
            <Download className="w-4 h-4" />
            <span>Export Report</span>
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-green-600" />
            <span className="text-sm text-gray-600 dark:text-gray-400">Efficiency</span>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">94.2%</div>
            <div className="text-sm text-green-600">+2.3% from last month</div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            <span className="text-sm text-gray-600 dark:text-gray-400">Accuracy</span>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">98.7%</div>
            <div className="text-sm text-blue-600">+0.5% from last month</div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-purple-600" />
            <span className="text-sm text-gray-600 dark:text-gray-400">Cost Reduction</span>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">$2.1M</div>
            <div className="text-sm text-purple-600">+15% from last month</div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-orange-600" />
            <span className="text-sm text-gray-600 dark:text-gray-400">On-Time Delivery</span>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">96.3%</div>
            <div className="text-sm text-orange-600">+1.2% from last month</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsHeader;