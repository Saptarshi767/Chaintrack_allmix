import React from 'react';
import { Package, FileCheck, Wifi, Brain, QrCode } from 'lucide-react';

const PALETTE = {
  blue1: '#7B9ACC',
  blue2: '#3976F6',
  navy:  '#184A8C',
  teal:  '#13C8C2',
  yellow: '#FFC233',
};

const steps = [
  {
    icon: <Package className="w-10 h-10" style={{ color: PALETTE.blue2 }} />, 
    title: 'Tracking Every Step on Blockchain',
    desc: 'Every product handoff is recorded on an immutable blockchain ledger. No one can secretly change or fake any record. All supply chain partners see the same, verified truth.'
  },
  {
    icon: <FileCheck className="w-10 h-10" style={{ color: PALETTE.yellow }} />,
    title: 'Smart Contracts for Automation',
    desc: 'Smart contracts handle payments, penalties, and more — instantly and transparently. No manual paperwork, no disputes.'
  },
  {
    icon: <Wifi className="w-10 h-10" style={{ color: PALETTE.teal }} />,
    title: 'IoT Sensors for Live Monitoring',
    desc: 'IoT devices monitor temperature, humidity, and location. Live sensor data is fed to the blockchain for real-time visibility and accountability.'
  },
  {
    icon: <Brain className="w-10 h-10" style={{ color: PALETTE.navy }} />,
    title: 'AI for Predicting & Preventing Problems',
    desc: 'AI models forecast demand and predict disruptions, so Walmart can optimize stock and avoid delays before they happen.'
  },
  {
    icon: <QrCode className="w-10 h-10" style={{ color: PALETTE.yellow }} />,
    title: 'Customer Transparency & Trust',
    desc: 'Shoppers scan a QR code to see a product’s full journey, building trust and ensuring authenticity and freshness.'
  },
];

const HowChainTrackWorks: React.FC = () => (
  <section className="py-20 px-4 max-w-5xl mx-auto" style={{ background: 'rgba(255,255,255,0.95)', borderRadius: '2rem', boxShadow: '0 8px 32px rgba(0,0,0,0.08)' }}>
    <h2 className="text-4xl font-bold mb-8 text-center" style={{ color: PALETTE.navy }}>
      How ChainTrack Works
    </h2>
    <div className="grid md:grid-cols-2 gap-10">
      {steps.map((step, idx) => (
        <div key={idx} className="flex flex-col items-center text-center p-6 rounded-xl shadow-md hover:scale-105 transition-transform duration-300" style={{ background: idx % 2 === 0 ? PALETTE.blue1 : PALETTE.teal, color: idx % 2 === 0 ? PALETTE.navy : PALETTE.navy }}>
          <div className="mb-4">{step.icon}</div>
          <h3 className="font-bold text-xl mb-2" style={{ color: PALETTE.yellow }}>{step.title}</h3>
          <p className="text-base" style={{ color: '#222' }}>{step.desc}</p>
        </div>
      ))}
    </div>
    <div className="mt-12 text-center">
      <h3 className="text-2xl font-bold mb-2" style={{ color: PALETTE.blue2 }}>
        Why It Matters
      </h3>
      <ul className="text-lg space-y-2" style={{ color: PALETTE.navy }}>
        <li><b>Walmart</b> saves money by reducing waste and optimizing stock.</li>
        <li><b>Suppliers & partners</b> have fewer disputes with verified, transparent records.</li>
        <li><b>Customers</b> get fresher, safer, and more trustworthy products.</li>
        <li><b>The planet</b> benefits from less waste and smarter logistics.</li>
      </ul>
    </div>
  </section>
);

export default HowChainTrackWorks; 