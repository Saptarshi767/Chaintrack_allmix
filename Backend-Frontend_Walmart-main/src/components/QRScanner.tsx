import React from 'react';

interface QRScannerProps {
  onScan: (productId: string) => void;
}

const QRScanner: React.FC<QRScannerProps> = ({ onScan }) => {
  // For demo, simulate a scan with a button
  const handleSimulateScan = () => {
    const demoProductId = '0'; // Use product ID 0 for demo
    onScan(demoProductId);
  };

  return (
    <div className="flex flex-col items-center justify-center p-6 bg-white rounded-xl shadow-md">
      <div className="mb-4 text-lg font-semibold">Scan a product QR code</div>
      {/* In a real app, integrate a QR scanner library here */}
      <button
        onClick={handleSimulateScan}
        className="px-6 py-3 rounded-full font-bold text-white bg-blue-500 hover:bg-blue-600 transition-all duration-300"
      >
        Simulate QR Scan
      </button>
      <div className="mt-2 text-xs text-gray-500">(Demo: Click to simulate scanning product #0)</div>
    </div>
  );
};

export default QRScanner;