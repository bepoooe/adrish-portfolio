import { useFrame } from "@react-three/fiber";
import { useMemo, useRef, useEffect } from "react";
import * as THREE from "three";
import { useDevice } from "../context/DeviceContext";
import { registerDisposable } from "../utils/memoryOptimizer";

// Create a shared texture for all particle instances
let sharedFireflyTexture = null;

const createFireflyTexture = () => {
  if (sharedFireflyTexture) return sharedFireflyTexture;
  
  const canvas = document.createElement('canvas');
  canvas.width = 32;
  canvas.height = 32;
  const ctx = canvas.getContext('2d');
  
  const gradient = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
  gradient.addColorStop(0, 'rgba(255, 252, 187, 1)');
  gradient.addColorStop(0.4, 'rgba(255, 252, 187, 0.5)');
  gradient.addColorStop(1, 'rgba(255, 252, 187, 0)');
  
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 32, 32);
  
  const texture = new THREE.Texture(canvas);
  texture.needsUpdate = true;
  
  // Store for reuse
  sharedFireflyTexture = texture;
  return texture;
};

export function Particles({ count = 1000 }) {
  const points = useRef();
  const { isMobile } = useDevice();
  
  const particlesPosition = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const boundSize = isMobile ? 8 : 10; // Smaller bounds for mobile
    
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * boundSize;
      positions[i * 3 + 1] = (Math.random() - 0.5) * boundSize;
      positions[i * 3 + 2] = (Math.random() - 0.5) * boundSize;
    }
    return positions;
  }, [count, isMobile]);

  // Use shared texture for all particles
  const firefliesTexture = useMemo(() => {
    return createFireflyTexture();
  }, []);

  useFrame((state) => {
    if (!points.current) return;
    
    const time = state.clock.getElapsedTime();
    // Optimize for mobile - update fewer particles per frame
    const updateStep = isMobile ? 2 : 1; // Update every other particle on mobile
    const movementFactor = isMobile ? 0.001 : 0.002; // Slower movement on mobile
    const boundSize = isMobile ? 4 : 5; // Smaller bounds for mobile
    
    for (let i = 0; i < count; i += updateStep) {
      const i3 = i * 3;
      // More organic movement with varying speeds
      points.current.geometry.attributes.position.array[i3] += Math.sin(time * 0.5 + i * 0.3) * movementFactor;
      points.current.geometry.attributes.position.array[i3 + 1] += Math.cos(time * 0.4 + i * 0.2) * movementFactor;
      points.current.geometry.attributes.position.array[i3 + 2] += Math.sin(time * 0.3 + i * 0.1) * movementFactor;
      
      // Keep fireflies within bounds
      const x = points.current.geometry.attributes.position.array[i3];
      const y = points.current.geometry.attributes.position.array[i3 + 1];
      const z = points.current.geometry.attributes.position.array[i3 + 2];
      
      if (Math.abs(x) > boundSize) points.current.geometry.attributes.position.array[i3] *= -0.95;
      if (Math.abs(y) > boundSize) points.current.geometry.attributes.position.array[i3 + 1] *= -0.95;
      if (Math.abs(z) > boundSize) points.current.geometry.attributes.position.array[i3 + 2] *= -0.95;
    }
    points.current.geometry.attributes.position.needsUpdate = true;
  });

  // Particle size based on device
  const particleSize = isMobile ? 0.045 : 0.035;
  const particleOpacity = isMobile ? 0.6 : 0.7;

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particlesPosition.length / 3}
          array={particlesPosition}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={particleSize}
        map={firefliesTexture}
        transparent={true}
        opacity={particleOpacity}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        sizeAttenuation={true}
        color="#fffcbb"
      />
    </points>
  );
}