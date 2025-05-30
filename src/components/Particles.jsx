import { useFrame } from "@react-three/fiber";
import React, { useMemo, useRef, useEffect } from "react";
import * as THREE from "three";
import { useDevice } from "../context/DeviceContext";
import { registerDisposable } from "../utils/memoryOptimizer";

// Create a shared texture for all particle instances
let sharedFireflyTexture = null;

const createFireflyTexture = () => {
  if (sharedFireflyTexture) return sharedFireflyTexture;

  // Reduced texture size for better performance
  const canvas = document.createElement('canvas');
  canvas.width = 12; // Further reduced from 16
  canvas.height = 12; // Further reduced from 16
  const ctx = canvas.getContext('2d');

  const gradient = ctx.createRadialGradient(6, 6, 0, 6, 6, 6); // Adjusted center points
  gradient.addColorStop(0, 'rgba(255, 252, 187, 1)');
  gradient.addColorStop(0.4, 'rgba(255, 252, 187, 0.5)');
  gradient.addColorStop(1, 'rgba(255, 252, 187, 0)');

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 12, 12); // Adjusted size

  const texture = new THREE.Texture(canvas);
  texture.needsUpdate = true;
  texture.generateMipmaps = false; // Disable mipmaps to save memory
  texture.minFilter = THREE.LinearFilter; // Use simple filtering
  texture.magFilter = THREE.LinearFilter;

  // Store for reuse
  sharedFireflyTexture = texture;
  registerDisposable(texture); // Register for proper cleanup
  return texture;
};

export const Particles = React.memo(({ count = 1000 }) => {
  // Significantly reduce particle count for better performance
  const actualCount = Math.min(count, 250); // Further reduced cap

  const points = useRef();
  const { isMobile, isLowPerformance } = useDevice();
  const frameSkipRef = useRef(0); // For skipping frames

  // Further reduce count based on device capability
  const finalCount = useMemo(() => {
    return isMobile ? Math.floor(actualCount * 0.4) : // Further reduced for mobile
           isLowPerformance ? Math.floor(actualCount * 0.6) : // Further reduced for low performance
           actualCount;
  }, [actualCount, isMobile, isLowPerformance]);

  // Create particle positions with optimized memory usage
  const particlesPosition = useMemo(() => {
    const positions = new Float32Array(finalCount * 3);
    const boundSize = isMobile ? 6 : 8; // Smaller bounds for all devices

    for (let i = 0; i < finalCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * boundSize;
      positions[i * 3 + 1] = (Math.random() - 0.5) * boundSize;
      positions[i * 3 + 2] = (Math.random() - 0.5) * boundSize;
    }
    return positions;
  }, [finalCount, isMobile]);

  // Use shared texture for all particles
  const firefliesTexture = useMemo(() => {
    return createFireflyTexture();
  }, []);

  // Create additional attributes for optimized animation
  const particleSpeeds = useMemo(() => {
    const speeds = new Float32Array(finalCount * 3);
    for (let i = 0; i < finalCount; i++) {
      // Randomize movement speeds for more natural motion
      speeds[i * 3] = 0.2 + Math.random() * 0.3;
      speeds[i * 3 + 1] = 0.2 + Math.random() * 0.3;
      speeds[i * 3 + 2] = 0.2 + Math.random() * 0.3;
    }
    return speeds;
  }, [finalCount]);

  // Optimize animation with frame skipping and batched updates
  useFrame((state) => {
    if (!points.current) return;

    // Skip frames based on device capability
    frameSkipRef.current += 1;
    const frameSkip = isMobile ? 3 : isLowPerformance ? 2 : 1;
    if (frameSkipRef.current % frameSkip !== 0) return;

    const time = state.clock.getElapsedTime();
    const positionArray = points.current.geometry.attributes.position.array;

    // Batch size for processing - process fewer particles per frame
    const batchSize = isMobile ? 10 : 20;
    const startIndex = (frameSkipRef.current * batchSize) % finalCount;
    const endIndex = Math.min(startIndex + batchSize, finalCount);

    const movementFactor = isMobile ? 0.0005 : 0.001; // Reduced movement factor
    const boundSize = isMobile ? 3 : 4; // Smaller bounds for better performance

    // Only update a subset of particles each frame
    for (let i = startIndex; i < endIndex; i++) {
      const i3 = i * 3;

      // Use pre-calculated speeds for more efficient animation
      positionArray[i3] += Math.sin(time * particleSpeeds[i3] + i * 0.1) * movementFactor;
      positionArray[i3 + 1] += Math.cos(time * particleSpeeds[i3 + 1] + i * 0.1) * movementFactor;
      positionArray[i3 + 2] += Math.sin(time * particleSpeeds[i3 + 2] + i * 0.1) * movementFactor;

      // Simplified boundary check with fewer calculations
      if (Math.abs(positionArray[i3]) > boundSize) positionArray[i3] *= -0.9;
      if (Math.abs(positionArray[i3 + 1]) > boundSize) positionArray[i3 + 1] *= -0.9;
      if (Math.abs(positionArray[i3 + 2]) > boundSize) positionArray[i3 + 2] *= -0.9;
    }

    // Only mark as needing update when we've actually changed something
    points.current.geometry.attributes.position.needsUpdate = true;
  });

  // Optimize particle appearance for better performance
  const particleSize = isMobile ? 0.06 : 0.05; // Slightly larger to compensate for fewer particles
  const particleOpacity = isMobile ? 0.5 : 0.6; // Slightly reduced opacity

  // Clean up resources when component unmounts
  useEffect(() => {
    return () => {
      if (points.current && points.current.geometry) {
        points.current.geometry.dispose();
      }
    };
  }, []);

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"        count={particlesPosition.length / 3}
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
        alphaTest={0.01} // Add alpha test to improve rendering performance
      />
    </points>
  );
});