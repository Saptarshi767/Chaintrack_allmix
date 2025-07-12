import React, { useEffect, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import * as THREE from 'three';

gsap.registerPlugin(ScrollTrigger);

const NetworkNodes: React.FC = () => {
  const groupRef = useRef<THREE.Group>(null);
  const { viewport } = useThree();
  
  const nodes = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    position: new THREE.Vector3(
      (Math.random() - 0.5) * viewport.width * 1.5,
      (Math.random() - 0.5) * viewport.height * 1.5,
      (Math.random() - 0.5) * 10
    ),
    connections: Math.floor(Math.random() * 5) + 1
  }));

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.1;
    }
  });

  return (
    <group ref={groupRef}>
      {nodes.map((node) => (
        <mesh key={node.id} position={node.position}>
          <sphereGeometry args={[0.1, 8, 8]} />
          <meshBasicMaterial color={new THREE.Color(0x60A5FA)} />
        </mesh>
      ))}
      
      {/* Connection lines */}
      {nodes.slice(0, 20).map((node, index) => {
        const nextNode = nodes[index + 1] || nodes[0];
        const geometry = new THREE.BufferGeometry().setFromPoints([
          node.position,
          nextNode.position
        ]);
        
        return (
          <line key={`line-${index}`}>
            <bufferGeometry attach="geometry" {...geometry} />
            <lineBasicMaterial color={0x60A5FA} transparent opacity={0.3} />
          </line>
        );
      })}
    </group>
  );
};

const NetworkVisualization: React.FC = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const canvas = canvasRef.current;
    
    if (!section || !canvas) return;

    // Animate canvas on scroll
    gsap.from(canvas, {
      opacity: 0,
      scale: 0.8,
      duration: 1,
      scrollTrigger: {
        trigger: section,
        start: 'top 80%',
        end: 'bottom 20%',
        toggleActions: 'play none none reverse'
      }
    });
  }, []);

  return (
    <div ref={sectionRef} className="py-20 bg-gray-900 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-white mb-4">
            Global Supply Chain Network
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Visualize the interconnected web of suppliers, manufacturers, and retailers
          </p>
        </div>

        <div ref={canvasRef} className="relative h-96 rounded-2xl overflow-hidden bg-gradient-to-br from-blue-900 to-purple-900">
          <Canvas camera={{ position: [0, 0, 5], fov: 75 }}>
            <NetworkNodes />
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} />
          </Canvas>
          
          {/* Overlay content */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-white">
              <div className="text-6xl font-bold mb-4">15,000+</div>
              <div className="text-xl">Connected Partners</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NetworkVisualization;