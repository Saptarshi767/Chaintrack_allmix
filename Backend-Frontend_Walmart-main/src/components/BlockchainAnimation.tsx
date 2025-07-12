import React, { useEffect, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Points, PointMaterial, Sphere } from '@react-three/drei';
import * as THREE from 'three';

const ParticleNetwork: React.FC = () => {
  const pointsRef = useRef<THREE.Points>(null);
  const { viewport } = useThree();
  
  const particleCount = 100;
  const positions = new Float32Array(particleCount * 3);
  const connections = new Float32Array(particleCount * 6);
  
  // Generate random positions for particles
  for (let i = 0; i < particleCount; i++) {
    positions[i * 3] = (Math.random() - 0.5) * viewport.width * 2;
    positions[i * 3 + 1] = (Math.random() - 0.5) * viewport.height * 2;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 10;
  }

  useFrame((state) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.x = state.clock.elapsedTime * 0.1;
      pointsRef.current.rotation.y = state.clock.elapsedTime * 0.05;
    }
  });

  return (
    <Points ref={pointsRef} positions={positions} stride={3} frustumCulled={false}>
      <PointMaterial
        transparent
        color="#60A5FA"
        size={0.1}
        sizeAttenuation={true}
        depthWrite={false}
        opacity={0.6}
      />
    </Points>
  );
};

const BlockchainAnimation: React.FC = () => {
  return (
    <div className="absolute inset-0 opacity-30">
      <Canvas camera={{ position: [0, 0, 5], fov: 75 }}>
        <ParticleNetwork />
      </Canvas>
    </div>
  );
};

export default BlockchainAnimation;