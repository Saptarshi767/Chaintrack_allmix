import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ExternalLink, CheckCircle, Clock, AlertTriangle } from 'lucide-react';

const RecentTransactions: React.FC = () => {
  const transactionsRef = useRef<HTMLDivElement>(null);

  const transactions = [
    {
      id: 'TX-2024-001',
      product: 'Organic Apples',
      from: 'Farm A',
      to: 'Store 1',
      status: 'completed',
      time: '2 hours ago',
      hash: '0x4a2b...8c9d'
    },
    {
      id: 'TX-2024-002',
      product: 'Samsung Galaxy S24',
      from: 'Factory B',
      to: 'Distribution Center',
      status: 'in-transit',
      time: '4 hours ago',
      hash: '0x7f3a...1e2b'
    },
    {
      id: 'TX-2024-003',
      product: 'Nike Air Max',
      from: 'Warehouse C',
      to: 'Store 2',
      status: 'completed',
      time: '6 hours ago',
      hash: '0x9d4c...5a7f'
    },
    {
      id: 'TX-2024-004',
      product: 'Protein Powder',
      from: 'Supplier D',
      to: 'Quality Control',
      status: 'pending',
      time: '8 hours ago',
      hash: '0x2b8e...9f4a'
    },
    {
      id: 'TX-2024-005',
      product: 'Laptop Charger',
      from: 'Factory E',
      to: 'Store 3',
      status: 'completed',
      time: '1 day ago',
      hash: '0x6c1d...3b9e'
    }
  ];

  useEffect(() => {
    const container = transactionsRef.current;
    if (!container) return;

    gsap.from(container.children, {
      opacity: 0,
      x: 50,
      duration: 0.6,
      stagger: 0.1,
      ease: 'power2.out'
    });
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'in-transit':
        return <Clock className="w-4 h-4 text-blue-500" />;
      case 'pending':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'in-transit':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Recent Transactions
        </h3>
        <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
          View All
        </button>
      </div>

      <div ref={transactionsRef} className="space-y-4">
        {transactions.map((transaction) => (
          <div
            key={transaction.id}
            className="group p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-3">
                {getStatusIcon(transaction.status)}
                <span className="font-medium text-gray-900 dark:text-white">
                  {transaction.product}
                </span>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(transaction.status)}`}>
                {transaction.status}
              </span>
            </div>
            
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              {transaction.from} → {transaction.to}
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {transaction.time}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {transaction.hash}
                </span>
              </div>
              <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-blue-500 transition-colors" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentTransactions;