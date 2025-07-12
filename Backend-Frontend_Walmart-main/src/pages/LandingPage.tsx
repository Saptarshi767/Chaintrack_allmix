import React from 'react';
import HeroSection from '../components/HeroSection';
import AIPredictions from '../components/AIPredictions';
import HowChainTrackWorks from '../components/HowChainTrackWorks';
import FeaturesSection from '../components/FeaturesSection';
import StatsSection from '../components/StatsSection';
import NetworkVisualization from '../components/NetworkVisualization';
import CTASection from '../components/CTASection';

const PALETTE = {
  blue1: '#7B9ACC',
  blue2: '#3976F6',
  navy:  '#184A8C',
  teal:  '#13C8C2',
  yellow: '#FFC233',
};

const LandingPage: React.FC = () => {
  return (
    <div style={{ background: `linear-gradient(90deg, ${PALETTE.blue1} 0%, ${PALETTE.blue2} 25%, ${PALETTE.navy} 50%, ${PALETTE.teal} 75%, ${PALETTE.yellow} 100%)` }}>
      <HeroSection />
      <AIPredictions />
      <HowChainTrackWorks />
      {/* Blockchain Explainer Section */}
      <section className="py-16 px-4 md:px-0 max-w-4xl mx-auto text-center" style={{ background: 'rgba(255,255,255,0.85)', borderRadius: '2rem', marginTop: '-4rem', boxShadow: '0 8px 32px rgba(0,0,0,0.08)' }}>
        <h2 className="text-3xl font-bold mb-4" style={{ color: PALETTE.navy }}>What is Blockchain Supply Chain?</h2>
        <p className="text-lg mb-6" style={{ color: PALETTE.blue2 }}>
          Blockchain brings transparency, security, and trust to supply chains. Every product movement is recorded on an immutable ledger, making it easy to verify authenticity and track every step from origin to shelf.
        </p>
        <div className="flex flex-col md:flex-row items-center justify-center gap-8 mt-8">
          <div className="p-6 rounded-xl shadow-lg bg-white border-2" style={{ borderColor: PALETTE.teal }}>
            <div className="font-bold text-xl mb-2" style={{ color: PALETTE.teal }}>Transparency</div>
            <div className="text-gray-700">All transactions are visible and verifiable by anyone.</div>
          </div>
          <div className="p-6 rounded-xl shadow-lg bg-white border-2" style={{ borderColor: PALETTE.yellow }}>
            <div className="font-bold text-xl mb-2" style={{ color: PALETTE.yellow }}>Security</div>
            <div className="text-gray-700">Data is tamper-proof and protected by cryptography.</div>
          </div>
          <div className="p-6 rounded-xl shadow-lg bg-white border-2" style={{ borderColor: PALETTE.blue2 }}>
            <div className="font-bold text-xl mb-2" style={{ color: PALETTE.blue2 }}>Efficiency</div>
            <div className="text-gray-700">Automated processes reduce errors and speed up delivery.</div>
          </div>
        </div>
      </section>
      {/* Testimonial Section */}
      <section className="py-16 px-4 md:px-0 max-w-3xl mx-auto text-center" style={{ background: 'rgba(19,200,194,0.08)', borderRadius: '2rem', marginTop: '2rem', boxShadow: '0 8px 32px rgba(0,0,0,0.04)' }}>
        <blockquote className="text-xl italic mb-4" style={{ color: PALETTE.navy }}>
          "Since integrating blockchain, our supply chain is faster, more transparent, and our customers trust us more than ever."
        </blockquote>
        <div className="font-bold text-lg" style={{ color: PALETTE.teal }}>— Jane Doe, Supply Chain Manager</div>
      </section>
      {/* Call to Action Section */}
      <section className="py-20 text-center" style={{ background: PALETTE.yellow, color: PALETTE.navy, borderRadius: '2rem', margin: '2rem auto', maxWidth: '900px', boxShadow: '0 8px 32px rgba(0,0,0,0.06)' }}>
        <h2 className="text-3xl font-bold mb-4">Ready to experience the future of supply chain?</h2>
        <p className="text-lg mb-8">Join ChainTrack and bring transparency to your business today.</p>
        <a
          href="http://localhost:5173"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block px-10 py-4 rounded-full font-bold text-lg shadow-lg transition-all duration-300 hover:scale-105"
          style={{ background: PALETTE.navy, color: PALETTE.yellow }}
        >
          Go to ChainTrack Demo
        </a>
      </section>
      <StatsSection />
      <FeaturesSection />
      <NetworkVisualization />
      <CTASection />
    </div>
  );
};

export default LandingPage;