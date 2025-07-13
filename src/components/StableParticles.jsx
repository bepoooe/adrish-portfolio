import { useFrame } from "@react-three/fiber";
import React, { useMemo, useRef, useEffect, useState } from "react";
import * as THREE from "three";
import { useDevice } from "../context/DeviceContext";
import { registerDisposable } from "../utils/memoryOptimizer";
import { validateBufferGeometry, safeDisposeGeometry } from "../utils/threeJsUtils";

// Create a shared texture for all particle instances
let sharedFireflyTexture = null;

const createFireflyTexture = () => {
  if (sharedFireflyTexture) return sharedFireflyTexture;

  // Reduced texture size for better performance
  const canvas = document.createElement('canvas');
  canvas.width = 12;
  canvas.height = 12;
  const ctx = canvas.getContext('2d');

  const gradient = ctx.createRadialGradient(6, 6, 0, 6, 6, 6);
  gradient.addColorStop(0, 'rgba(255, 252, 187, 1)');
  gradient.addColorStop(0.4, 'rgba(255, 252, 187, 0.5)');
  gradient.addColorStop(1, 'rgba(255, 252, 187, 0)');

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 12, 12);

  const texture = new THREE.Texture(canvas);
  texture.needsUpdate = true;
  texture.generateMipmaps = false;
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;

  sharedFireflyTexture = texture;
  registerDisposable(texture);
  return texture;
};

// Stable wrapper component that manages particle system lifecycle
const StableParticles = React.memo(({ deviceKey, count }) => {
  const points = useRef();
  const geometryRef = useRef();
  const frameSkipRef = useRef(0);
  const { isMobile, isLowPerformance } = useDevice();
  
  // Create stable particle data that never changes for this instance
  const { particlesPosition, particleSpeeds, particleCount } = useMemo(() => {
    const actualCount = Math.min(count, 250);
    // Use the deviceKey to determine count - this makes it stable per device type
    const deviceMultiplier = deviceKey.includes('mobile') ? 0.4 : 
                            deviceKey.includes('lowperf') ? 0.6 : 1;
    const finalCount = Math.floor(actualCount * deviceMultiplier);
    
    const positions = new Float32Array(finalCount * 3);
    const speeds = new Float32Array(finalCount * 3);
    const boundSize = 8;

    for (let i = 0; i < finalCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * boundSize;
      positions[i * 3 + 1] = (Math.random() - 0.5) * boundSize;
      positions[i * 3 + 2] = (Math.random() - 0.5) * boundSize;
      
      speeds[i * 3] = 0.2 + Math.random() * 0.3;
      speeds[i * 3 + 1] = 0.2 + Math.random() * 0.3;
      speeds[i * 3 + 2] = 0.2 + Math.random() * 0.3;
    }
    
    return { 
      particlesPosition: positions, 
      particleSpeeds: speeds,
      particleCount: finalCount
    };
  }, [deviceKey, count]); // Only recreate when deviceKey changes

  const firefliesTexture = useMemo(() => createFireflyTexture(), []);

  // Animation loop with stable array access
  useFrame((state) => {
    if (!points.current?.geometry?.attributes?.position) return;

    // Validate before updating
    if (!validateBufferGeometry(points.current.geometry)) return;

    frameSkipRef.current += 1;
    const frameSkip = isMobile ? 3 : isLowPerformance ? 2 : 1;
    if (frameSkipRef.current % frameSkip !== 0) return;

    const time = state.clock.getElapsedTime();
    const positionAttribute = points.current.geometry.attributes.position;
    const positionArray = positionAttribute.array;

    // Critical: verify array size hasn't changed
    if (positionArray.length !== particleCount * 3) {
      console.warn('Particle array size changed unexpectedly, stopping updates');
      return;
    }

    const batchSize = isMobile ? 10 : 20;
    const startIndex = (frameSkipRef.current * batchSize) % particleCount;
    const endIndex = Math.min(startIndex + batchSize, particleCount);
    
    const movementFactor = isMobile ? 0.0005 : 0.001;
    const boundSize = isMobile ? 3 : 4;

    for (let i = startIndex; i < endIndex; i++) {
      const i3 = i * 3;
      positionArray[i3] += Math.sin(time * particleSpeeds[i3] + i * 0.1) * movementFactor;
      positionArray[i3 + 1] += Math.cos(time * particleSpeeds[i3 + 1] + i * 0.1) * movementFactor;
      positionArray[i3 + 2] += Math.sin(time * particleSpeeds[i3 + 2] + i * 0.1) * movementFactor;

      if (Math.abs(positionArray[i3]) > boundSize) positionArray[i3] *= -0.9;
      if (Math.abs(positionArray[i3 + 1]) > boundSize) positionArray[i3 + 1] *= -0.9;
      if (Math.abs(positionArray[i3 + 2]) > boundSize) positionArray[i3 + 2] *= -0.9;
    }

    positionAttribute.needsUpdate = true;
    if (positionAttribute.updateRange) {
      positionAttribute.updateRange.offset = startIndex * 3;
      positionAttribute.updateRange.count = (endIndex - startIndex) * 3;
    }
  });

  // Cleanup
  useEffect(() => {
    return () => {
      if (points.current?.geometry) {
        safeDisposeGeometry(points.current.geometry);
      }
    };
  }, []);

  const particleSize = isMobile ? 0.06 : 0.05;
  const particleOpacity = isMobile ? 0.5 : 0.6;

  return (
    <points ref={points}>
      <bufferGeometry ref={geometryRef}>
        <bufferAttribute
          attach="attributes-position"
          count={particleCount}
          array={particlesPosition}
          itemSize={3}
          usage={THREE.DynamicDrawUsage}
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
        alphaTest={0.01}
      />
    </points>
  );
});

// Main component that manages device type changes
export const Particles = React.memo(({ count = 1000 }) => {
  const { isMobile, isLowPerformance } = useDevice();
  
  // Create a stable key that only changes when device type significantly changes
  const deviceKey = useMemo(() => {
    return `${isMobile ? 'mobile' : 'desktop'}-${isLowPerformance ? 'lowperf' : 'normal'}`;
  }, [isMobile, isLowPerformance]);

  // Use key prop to force remount when device type changes
  return (
    <StableParticles 
      key={deviceKey} 
      deviceKey={deviceKey} 
      count={count} 
    />
  );
});

export default Particles;
