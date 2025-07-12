import React, { useEffect, useState } from 'react';
import { Contract, BrowserProvider } from 'ethers';
import SupplyChainArtifact from '../SupplyChain.json';

const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

interface ProductJourneyProps {
  productId?: string;
}

const ProductJourney: React.FC<ProductJourneyProps> = ({ productId = '0' }) => {
  const [journeySteps, setJourneySteps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchJourney() {
      setLoading(true);
      setError(null);
      try {
        const { ethereum } = window as any;
        if (!ethereum) {
          setError('MetaMask not detected');
          setLoading(false);
          return;
        }
        const provider = new BrowserProvider(ethereum);
        const contract = new Contract(CONTRACT_ADDRESS, SupplyChainArtifact.abi, provider);
        // Fetch the product by productId
        const product = await contract.products(Number(productId));
        const [statuses, times] = await contract.getHistory(Number(productId));
        const statusNames = ['Created', 'In Transit', 'Delivered'];
        const steps = statuses.map((status: number, idx: number) => ({
          id: idx + 1,
          title: statusNames[Number(status)] || `Status ${status}`,
          location: product.origin,
          date: new Date(Number(times[idx]) * 1000).toLocaleDateString(),
          time: new Date(Number(times[idx]) * 1000).toLocaleTimeString(),
          status: statusNames[Number(status)]?.toLowerCase() || 'unknown',
          details: `Status code: ${status}`
        }));
        setJourneySteps(steps);
      } catch (e) {
        setError('Failed to fetch product journey from blockchain.');
      } finally {
        setLoading(false);
      }
    }
    fetchJourney();
  }, [productId]);

  if (loading) return <div>Loading product journey from blockchain...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
        Product Journey (Product #{productId})
      </h3>
      <div className="space-y-6">
        {journeySteps.length === 0 ? (
          <div>No journey data found for product #{productId}.</div>
        ) : (
          journeySteps.map((step) => (
            <div key={step.id} className="journey-step relative flex items-start space-x-4">
              <div className="relative z-10 flex items-center justify-center w-16 h-16 rounded-full bg-blue-500 shadow-lg">
                <span className="text-white font-bold text-lg">{step.title[0]}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-lg font-medium text-gray-900 dark:text-white">{step.title}</h4>
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">{step.status}</span>
                </div>
                <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400 mb-2">
                  <div className="flex items-center space-x-1">
                    <span>{step.location}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <span>{step.date} at {step.time}</span>
                  </div>
                </div>
                <p className="text-gray-700 dark:text-gray-300">{step.details}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ProductJourney;