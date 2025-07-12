import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ArrowRight, Play, Shield, Truck, Eye, Search, QrCode, TrendingUp, Users, Package, Activity, Wallet, Link as LinkIcon, ExternalLink } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Contract, BrowserProvider } from 'ethers';
import SupplyChainArtifact from '../SupplyChain.json';
import BlockchainAnimation from './BlockchainAnimation';
import { useApp } from '../contexts/AppContext';
import { statistics } from '../data/sampleData';

const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

const PALETTE = {
  blue1: '#7B9ACC',
  blue2: '#3976F6',
  navy:  '#184A8C',
  teal:  '#13C8C2',
  yellow: '#FFC233',
};

const HeroSection: React.FC = () => {
  const { setIsQRScannerOpen, setSearchQuery, addNotification } = useApp();
  const navigate = useNavigate();
  const heroRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const buttonsRef = useRef<HTMLDivElement>(null);
  const [searchInput, setSearchInput] = useState('');
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [blockchainStats, setBlockchainStats] = useState({
    totalProducts: 0,
    totalTransactions: 0,
    contractAddress: CONTRACT_ADDRESS
  });
  const [animatedStats, setAnimatedStats] = useState({
    productsTracked: 0,
    activeShipments: 0,
    verifiedSuppliers: 0,
    co2Saved: 0
  });

  // Connect wallet function
  const connectWallet = async () => {
    if (isConnecting || walletAddress) return; // Prevent multiple connection attempts
    
    setIsConnecting(true);
    try {
      const { ethereum } = window as any;
      if (!ethereum) {
        addNotification({
          type: 'error',
          title: 'MetaMask Required',
          message: 'Please install MetaMask to connect to the blockchain',
        });
        return;
      }

      // Check if already connected
      const accounts = await ethereum.request({ method: 'eth_accounts' });
      if (accounts.length > 0) {
        setWalletAddress(accounts[0]);
        const provider = new BrowserProvider(ethereum);
        await fetchBlockchainStats(provider);
        return;
      }

      const provider = new BrowserProvider(ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      setWalletAddress(address);
      
      addNotification({
        type: 'success',
        title: 'Wallet Connected',
        message: `Connected to ${address.slice(0, 6)}...${address.slice(-4)}`,
      });

      // Fetch blockchain stats
      await fetchBlockchainStats(provider);
    } catch (error: any) {
      console.error('Failed to connect wallet:', error);
      
      // Handle specific MetaMask errors
      if (error.code === -32002) {
        addNotification({
          type: 'error',
          title: 'Connection Pending',
          message: 'Please check MetaMask and approve the connection request.',
        });
      } else {
        addNotification({
          type: 'error',
          title: 'Connection Failed',
          message: 'Failed to connect wallet. Please try again.',
        });
      }
    } finally {
      setIsConnecting(false);
    }
  };

  // Fetch blockchain statistics
  const fetchBlockchainStats = async (provider: BrowserProvider) => {
    try {
      const contract = new Contract(CONTRACT_ADDRESS, SupplyChainArtifact.abi, provider);
      const totalProducts = Number(await contract.nextId());
      setBlockchainStats(prev => ({
        ...prev,
        totalProducts,
        totalTransactions: totalProducts * 2 // Estimate: each product has creation + status updates
      }));
    } catch (error) {
      console.error('Failed to fetch blockchain stats:', error);
    }
  };

  useEffect(() => {
    const tl = gsap.timeline();
    
    // Check if elements exist before animating
    if (titleRef.current) {
      tl.from(titleRef.current, {
        opacity: 0,
        y: 50,
        duration: 1,
        ease: 'power3.out'
      });
    }
    
    if (subtitleRef.current) {
      tl.from(subtitleRef.current, {
        opacity: 0,
        y: 30,
        duration: 0.8,
        ease: 'power3.out'
      }, '-=0.5');
    }
    
    if (buttonsRef.current?.children) {
      tl.from(buttonsRef.current.children, {
        opacity: 0,
        y: 20,
        duration: 0.6,
        stagger: 0.2,
        ease: 'power3.out'
      }, '-=0.3');
    }

    // Floating animation for hero icons - only if elements exist
    const floatingIcons = document.querySelectorAll('.floating-icon');
    if (floatingIcons.length > 0) {
      gsap.to('.floating-icon', {
        y: -10,
        duration: 2,
        repeat: -1,
        yoyo: true,
        ease: 'power2.inOut',
        stagger: 0.3
      });
    }

    // Animate statistics counters with blockchain data
    const counters = [
      { key: 'productsTracked', target: blockchainStats.totalProducts || statistics.productsTracked, duration: 2 },
      { key: 'activeShipments', target: statistics.activeShipments, duration: 1.5 },
      { key: 'verifiedSuppliers', target: statistics.verifiedSuppliers, duration: 1.8 },
      { key: 'co2Saved', target: statistics.co2Saved, duration: 2.2 }
    ];

    counters.forEach(({ key, target, duration }) => {
      gsap.to(animatedStats, {
        [key]: target,
        duration,
        ease: 'power2.out',
        delay: 1,
        onUpdate: () => {
          setAnimatedStats(prev => ({
            ...prev,
            [key]: Math.round(gsap.getProperty(animatedStats, key) as number)
          }));
        }
      });
    });

    return () => {
      // ScrollTrigger.getAll().forEach(trigger => trigger.kill()); // This line was removed as per the new_code, as ScrollTrigger is not imported.
    };
  }, [blockchainStats.totalProducts]);

  const handleStartTracking = () => {
    navigate('/dashboard');
    addNotification({
      type: 'success',
      title: 'Welcome to ChainTrack',
      message: 'Explore your supply chain dashboard',
    });
  };

  const handleViewDemo = () => {
    addNotification({
      type: 'info',
      title: 'Demo Mode',
      message: 'Interactive demo tour starting...',
    });
    // Simulate demo tour
    setTimeout(() => {
      addNotification({
        type: 'success',
        title: 'Demo Complete',
        message: 'Thanks for watching! Ready to get started?',
      });
    }, 3000);
  };

  const handleScanProduct = () => {
    setIsQRScannerOpen(true);
    addNotification({
      type: 'info',
      title: 'QR Scanner',
      message: 'Position QR code within the scanning area',
    });
  };

  const handleSearch = () => {
    if (searchInput.trim()) {
      setSearchQuery(searchInput);
      navigate('/tracking');
      addNotification({
        type: 'success',
        title: 'Search Initiated',
        message: `Searching for: ${searchInput}`,
      });
    }
  };

  const handleViewPredictions = () => {
    navigate('/analytics');
    addNotification({
      type: 'info',
      title: 'AI Predictions',
      message: 'Loading demand forecasting dashboard...',
    });
  };

  return (
    <div ref={heroRef} className="relative min-h-screen pt-16" style={{ background: `linear-gradient(90deg, ${PALETTE.blue1} 0%, ${PALETTE.blue2} 25%, ${PALETTE.navy} 50%, ${PALETTE.teal} 75%, ${PALETTE.yellow} 100%)` }}>
      {/* Background Animation */}
      <div className="absolute inset-0">
        <BlockchainAnimation />
      </div>

      {/* Floating Icons */}
      <div className="absolute top-20 left-10 floating-icon">
        <Shield className="w-8 h-8 text-blue-300 opacity-60" />
      </div>
      <div className="absolute top-40 right-20 floating-icon">
        <Truck className="w-8 h-8 text-yellow-300 opacity-60" />
      </div>
      <div className="absolute bottom-40 left-20 floating-icon">
        <Eye className="w-8 h-8 text-green-300 opacity-60" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20">
        <div className="text-center">
          <h1 ref={titleRef} className="text-5xl md:text-7xl font-bold mb-8 leading-tight animate-bounce" style={{ color: PALETTE.navy }}>
            <span style={{ color: PALETTE.yellow }}>Supply Chain,</span>
            <span style={{ color: PALETTE.teal }}> Transparency</span>
            <br />
            <span className="text-4xl md:text-6xl font-medium" style={{ color: PALETTE.blue2 }}>
              Powered by Blockchain
            </span>
          </h1>
          <p ref={subtitleRef} className="text-xl md:text-2xl max-w-4xl mx-auto mb-12 leading-relaxed font-medium animate-fade-in" style={{ color: PALETTE.navy }}>
            Track every product from farm to shelf with <span style={{ color: PALETTE.teal }}>complete transparency</span>.<br />
            <span style={{ color: PALETTE.yellow }}>ChainTrack</span> revolutionizes supply chain management with blockchain, AI, and real-time monitoring.
          </p>
          {/* Go to ChainTrack Demo Button */}
          <a
            href="http://localhost:5173" // Adjust if your ChainTrack-main frontend runs on a different port
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center space-x-2 px-8 py-4 rounded-full font-bold text-lg shadow-lg transition-all duration-300 hover:scale-105"
            style={{ background: PALETTE.yellow, color: PALETTE.navy, border: `2px solid ${PALETTE.navy}` }}
          >
            <ExternalLink className="w-6 h-6" />
            <span>Go to ChainTrack Demo</span>
          </a>
          {/* Fun Facts/Stats */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-xl shadow-lg bg-white/80 hover:bg-white transition-all duration-300 border-2" style={{ borderColor: PALETTE.teal }}>
              <div className="flex items-center justify-center mb-2">
                <Package className="w-8 h-8 text-teal-500" />
              </div>
              <div className="text-2xl font-bold" style={{ color: PALETTE.teal }}>10,000+</div>
              <div className="text-sm font-medium text-gray-700">Products Tracked</div>
            </div>
            <div className="p-6 rounded-xl shadow-lg bg-white/80 hover:bg-white transition-all duration-300 border-2" style={{ borderColor: PALETTE.blue2 }}>
              <div className="flex items-center justify-center mb-2">
                <Users className="w-8 h-8 text-blue-500" />
              </div>
              <div className="text-2xl font-bold" style={{ color: PALETTE.blue2 }}>1,200+</div>
              <div className="text-sm font-medium text-gray-700">Verified Suppliers</div>
            </div>
            <div className="p-6 rounded-xl shadow-lg bg-white/80 hover:bg-white transition-all duration-300 border-2" style={{ borderColor: PALETTE.yellow }}>
              <div className="flex items-center justify-center mb-2">
                <Shield className="w-8 h-8 text-yellow-500" />
              </div>
              <div className="text-2xl font-bold" style={{ color: PALETTE.yellow }}>100%</div>
              <div className="text-sm font-medium text-gray-700">Immutable Records</div>
            </div>
          </div>
          {/* Interactive Demo Section */}
          <div className="mt-16 flex flex-col items-center">
            <div className="text-lg font-semibold mb-4" style={{ color: PALETTE.navy }}>
              Try our interactive blockchain demo!
            </div>
            <button
              onClick={handleViewDemo}
              className="px-8 py-3 rounded-full font-bold text-white shadow-lg transition-all duration-300 hover:scale-105"
              style={{ background: PALETTE.blue2 }}
            >
              Start Demo Tour
            </button>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-white/60 rounded-full mt-2 animate-pulse" />
        </div>
      </div>
    </div>
  );
};

export default HeroSection;