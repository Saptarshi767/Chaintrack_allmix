import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Product, Supplier, Transaction, Prediction, sampleProducts, sampleSuppliers, sampleTransactions, samplePredictions } from '../data/sampleData';

interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface AppContextType {
  // Data
  products: Product[];
  suppliers: Supplier[];
  transactions: Transaction[];
  predictions: Prediction[];
  
  // UI State
  notifications: Notification[];
  isQRScannerOpen: boolean;
  isLoading: boolean;
  searchQuery: string;
  selectedProduct: Product | null;
  
  // Actions
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  removeNotification: (id: string) => void;
  markNotificationAsRead: (id: string) => void;
  clearAllNotifications: () => void;
  
  setIsQRScannerOpen: (open: boolean) => void;
  setIsLoading: (loading: boolean) => void;
  setSearchQuery: (query: string) => void;
  setSelectedProduct: (product: Product | null) => void;
  
  // Business Logic
  searchProducts: (query: string) => Product[];
  getProductById: (id: string) => Product | undefined;
  getSupplierById: (id: string) => Supplier | undefined;
  simulateQRScan: (productId?: string) => Promise<Product>;
  generateReport: (productId: string) => Promise<string>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [products] = useState<Product[]>(sampleProducts);
  const [suppliers] = useState<Supplier[]>(sampleSuppliers);
  const [transactions] = useState<Transaction[]>(sampleTransactions);
  const [predictions] = useState<Prediction[]>(samplePredictions);
  
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: 'N001',
      type: 'success',
      title: 'Product Verified',
      message: 'iPhone 15 Pro successfully verified on blockchain',
      timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
      read: false,
      action: {
        label: 'View Details',
        onClick: () => console.log('View product details')
      }
    },
    {
      id: 'N002',
      type: 'warning',
      title: 'High Demand Alert',
      message: 'Organic Bananas showing 40% increase in demand',
      timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
      read: false,
      action: {
        label: 'View Prediction',
        onClick: () => console.log('View prediction')
      }
    },
    {
      id: 'N003',
      type: 'info',
      title: 'Shipment Update',
      message: 'Nike Air Max 270 shipment arrived at distribution center',
      timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      read: true
    }
  ]);
  
  const [isQRScannerOpen, setIsQRScannerOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  
  const addNotification = (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: `N${Date.now()}`,
      timestamp: new Date().toISOString(),
      read: false
    };
    setNotifications(prev => [newNotification, ...prev]);
  };
  
  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };
  
  const markNotificationAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => 
      n.id === id ? { ...n, read: true } : n
    ));
  };
  
  const clearAllNotifications = () => {
    setNotifications([]);
  };
  
  const searchProducts = (query: string): Product[] => {
    if (!query.trim()) return products;
    
    const lowerQuery = query.toLowerCase();
    return products.filter(product => 
      product.name.toLowerCase().includes(lowerQuery) ||
      product.batchId.toLowerCase().includes(lowerQuery) ||
      product.category.toLowerCase().includes(lowerQuery) ||
      product.currentLocation.toLowerCase().includes(lowerQuery)
    );
  };
  
  const getProductById = (id: string): Product | undefined => {
    return products.find(p => p.id === id);
  };
  
  const getSupplierById = (id: string): Supplier | undefined => {
    return suppliers.find(s => s.id === id);
  };
  
  const simulateQRScan = async (productId?: string): Promise<Product> => {
    setIsLoading(true);
    
    // Simulate scanning delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const product = productId 
      ? products.find(p => p.id === productId) || products[0]
      : products[Math.floor(Math.random() * products.length)];
    
    setIsLoading(false);
    
    addNotification({
      type: 'success',
      title: 'QR Code Scanned',
      message: `Successfully scanned ${product.name}`,
      action: {
        label: 'View Product',
        onClick: () => setSelectedProduct(product)
      }
    });
    
    return product;
  };
  
  const generateReport = async (productId: string): Promise<string> => {
    setIsLoading(true);
    
    // Simulate report generation
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    setIsLoading(false);
    
    addNotification({
      type: 'success',
      title: 'Report Generated',
      message: 'Supply chain report has been generated successfully',
      action: {
        label: 'Download',
        onClick: () => console.log('Download report')
      }
    });
    
    return `report_${productId}_${Date.now()}.pdf`;
  };
  
  const value: AppContextType = {
    // Data
    products,
    suppliers,
    transactions,
    predictions,
    
    // UI State
    notifications,
    isQRScannerOpen,
    isLoading,
    searchQuery,
    selectedProduct,
    
    // Actions
    addNotification,
    removeNotification,
    markNotificationAsRead,
    clearAllNotifications,
    setIsQRScannerOpen,
    setIsLoading,
    setSearchQuery,
    setSelectedProduct,
    
    // Business Logic
    searchProducts,
    getProductById,
    getSupplierById,
    simulateQRScan,
    generateReport
  };
  
  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};