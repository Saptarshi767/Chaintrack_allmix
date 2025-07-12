import React, { useState, useEffect, useRef } from 'react';
import { X, Camera, Type, Flashlight, FlashlightOff, RotateCcw, HelpCircle } from 'lucide-react';
import { useApp } from '../contexts/AppContext';

interface QRScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const QRScannerModal: React.FC<QRScannerModalProps> = ({ isOpen, onClose }) => {
  const { simulateQRScan, products, addNotification } = useApp();
  const [isScanning, setIsScanning] = useState(false);
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [manualCode, setManualCode] = useState('');
  const [flashEnabled, setFlashEnabled] = useState(false);
  const [recentScans, setRecentScans] = useState<Array<{
    id: string;
    productName: string;
    timestamp: string;
    location: string;
  }>>([
    {
      id: '1',
      productName: 'iPhone 15 Pro',
      timestamp: '2 minutes ago',
      location: 'New York, NY'
    },
    {
      id: '2',
      productName: 'Organic Bananas',
      timestamp: '5 minutes ago',
      location: 'Houston, TX'
    },
    {
      id: '3',
      productName: 'Nike Air Max 270',
      timestamp: '8 minutes ago',
      location: 'Denver, CO'
    }
  ]);
  const [showHelp, setShowHelp] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopCamera();
    }
    
    return () => {
      stopCamera();
    };
  }, [isOpen]);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      addNotification({
        type: 'error',
        title: 'Camera Access Denied',
        message: 'Please enable camera permissions to use QR scanner',
        action: {
          label: 'Manual Entry',
          onClick: () => setShowManualEntry(true)
        }
      });
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const handleScan = async () => {
    if (isScanning) return;
    
    setIsScanning(true);
    try {
      // Simulate QR code scanning
      const randomProduct = products[Math.floor(Math.random() * products.length)];
      const scannedProduct = await simulateQRScan(randomProduct.id);
      
      // Add to recent scans
      setRecentScans(prev => [{
        id: Date.now().toString(),
        productName: scannedProduct.name,
        timestamp: 'Just now',
        location: scannedProduct.currentLocation
      }, ...prev.slice(0, 4)]);
      
      onClose();
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Scan Failed',
        message: 'Unable to scan QR code. Please try again.',
      });
    } finally {
      setIsScanning(false);
    }
  };

  const handleManualEntry = async () => {
    if (!manualCode.trim()) return;
    
    setIsScanning(true);
    try {
      // Find product by ID or batch ID
      const product = products.find(p => 
        p.id === manualCode || 
        p.batchId.toLowerCase() === manualCode.toLowerCase()
      );
      
      if (product) {
        await simulateQRScan(product.id);
        setManualCode('');
        setShowManualEntry(false);
        onClose();
      } else {
        addNotification({
          type: 'error',
          title: 'Product Not Found',
          message: `No product found with ID: ${manualCode}`,
        });
      }
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Lookup Failed',
        message: 'Unable to find product. Please check the code and try again.',
      });
    } finally {
      setIsScanning(false);
    }
  };

  const toggleFlash = () => {
    setFlashEnabled(!flashEnabled);
    // In a real implementation, this would control the device flash
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-75 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            QR Scanner
          </h2>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowHelp(!showHelp)}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <HelpCircle className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <X className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            </button>
          </div>
        </div>

        {/* Camera View */}
        <div className="p-4">
          <div className="relative bg-gray-900 rounded-lg overflow-hidden aspect-square">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
            
            {/* Scanning Overlay */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative">
                <div className="w-64 h-64 border-2 border-blue-500 rounded-lg relative">
                  {/* Corner indicators */}
                  <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-blue-500 rounded-tl-lg"></div>
                  <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-blue-500 rounded-tr-lg"></div>
                  <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-blue-500 rounded-bl-lg"></div>
                  <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-blue-500 rounded-br-lg"></div>
                  
                  {/* Scanning line */}
                  {isScanning && (
                    <div className="absolute top-0 left-0 w-full h-1 bg-blue-500 animate-pulse"></div>
                  )}
                </div>
                
                {isScanning && (
                  <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-white text-sm">
                    Scanning...
                  </div>
                )}
              </div>
            </div>

            {/* Controls */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-4">
              <button
                onClick={toggleFlash}
                className="p-3 bg-black bg-opacity-50 rounded-full text-white hover:bg-opacity-75"
              >
                {flashEnabled ? (
                  <FlashlightOff className="w-6 h-6" />
                ) : (
                  <Flashlight className="w-6 h-6" />
                )}
              </button>
              
              <button
                onClick={handleScan}
                disabled={isScanning}
                className="p-4 bg-blue-600 rounded-full text-white hover:bg-blue-700 disabled:opacity-50"
              >
                <Camera className="w-8 h-8" />
              </button>
              
              <button
                onClick={() => setShowManualEntry(true)}
                className="p-3 bg-black bg-opacity-50 rounded-full text-white hover:bg-opacity-75"
              >
                <Type className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>

        {/* Manual Entry Modal */}
        {showManualEntry && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 m-4 max-w-sm w-full">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Enter Code Manually
              </h3>
              <input
                type="text"
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                placeholder="Enter Product ID or Batch Number"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
              <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                <p>Examples:</p>
                <p>• P001 (Product ID)</p>
                <p>• APL-2024-001 (Batch ID)</p>
              </div>
              <div className="flex space-x-3 mt-6">
                <button
                  onClick={handleManualEntry}
                  disabled={!manualCode.trim() || isScanning}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {isScanning ? 'Searching...' : 'Search'}
                </button>
                <button
                  onClick={() => setShowManualEntry(false)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 dark:bg-gray-600 dark:text-gray-300"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Help Modal */}
        {showHelp && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 m-4 max-w-sm w-full">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                How to Scan
              </h3>
              <div className="space-y-3 text-sm text-gray-600 dark:text-gray-300">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-blue-600 font-bold text-xs">1</span>
                  </div>
                  <p>Position the QR code within the blue frame</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-blue-600 font-bold text-xs">2</span>
                  </div>
                  <p>Tap the camera button to scan</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-blue-600 font-bold text-xs">3</span>
                  </div>
                  <p>Use the flashlight button in low light</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-blue-600 font-bold text-xs">4</span>
                  </div>
                  <p>Use manual entry if scanning fails</p>
                </div>
              </div>
              <button
                onClick={() => setShowHelp(false)}
                className="w-full mt-4 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
              >
                Got it
              </button>
            </div>
          </div>
        )}

        {/* Recent Scans */}
        <div className="border-t border-gray-200 dark:border-gray-700">
          <div className="p-4">
            <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
              Recent Scans
            </h3>
            <div className="space-y-2">
              {recentScans.map((scan) => (
                <div
                  key={scan.id}
                  className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded-md"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {scan.productName}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {scan.location}
                    </p>
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {scan.timestamp}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QRScannerModal;