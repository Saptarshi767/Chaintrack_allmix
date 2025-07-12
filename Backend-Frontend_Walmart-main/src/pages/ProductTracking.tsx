import React, { useState } from 'react';
import ProductTrackingHeader from '../components/ProductTrackingHeader';
import ProductJourney from '../components/ProductJourney';
import QRScanner from '../components/QRScanner';
import ProductDetails from '../components/ProductDetails';

const ProductTracking: React.FC = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [scannedProductId, setScannedProductId] = useState<string | null>(null);

  const handleScan = (productId: string) => {
    setScannedProductId(productId);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setScannedProductId(null);
  };

  return (
    <div className="min-h-screen pt-16 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ProductTrackingHeader />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <ProductJourney productId={scannedProductId || '0'} />
            <ProductDetails />
          </div>
          <div>
            <QRScanner onScan={handleScan} />
          </div>
        </div>
      </div>
      {/* Modal for scanned product journey */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 max-w-lg w-full relative">
            <button
              onClick={closeModal}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 text-2xl font-bold"
            >
              &times;
            </button>
            <h3 className="text-xl font-bold mb-4 text-center">Product Journey (Scanned)</h3>
            <ProductJourney productId={scannedProductId || '0'} />
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductTracking;