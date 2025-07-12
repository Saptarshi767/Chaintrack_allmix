import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import DashboardHeader from '../components/DashboardHeader';
import MetricsCards from '../components/MetricsCards';
import ChartSection from '../components/ChartSection';
import RecentTransactions from '../components/RecentTransactions';
import SupplyChainMap from '../components/SupplyChainMap';
import AIPredictions from '../components/AIPredictions';

const Dashboard: React.FC = () => {
  const dashboardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const dashboard = dashboardRef.current;
    if (!dashboard) return;

    // Animate dashboard sections
    gsap.from('.dashboard-section', {
      opacity: 0,
      y: 30,
      duration: 0.6,
      stagger: 0.1,
      ease: 'power2.out'
    });
  }, []);

  return (
    <div ref={dashboardRef} className="min-h-screen pt-16 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <DashboardHeader />
        
        <div className="space-y-8">
          <div className="dashboard-section">
            <MetricsCards />
          </div>
          
          <div className="dashboard-section grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <ChartSection />
            </div>
            <div>
              <RecentTransactions />
            </div>
          </div>
          
          <div className="dashboard-section">
            <SupplyChainMap />
          </div>
          
          <div className="dashboard-section">
            <AIPredictions />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;