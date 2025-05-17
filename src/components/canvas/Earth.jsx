import React, { Suspense, useRef, useState, useEffect } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { OrbitControls, Stars, useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import CanvasLoader from '../Loader';

// Mobile detection hook
const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    // Initial check
    checkMobile();
    
    // Add resize listener
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  return isMobile;
};

// Preload the GLTF model to avoid loading issues
useGLTF.preload('/planet-1/scene.gltf');

// Planet model component using the GLTF file from planet-1 folder
const Earth = () => {
  const planetRef = useRef();
  const glowRef = useRef();
  const isMobile = useIsMobile();
  
  // Load the GLTF model
  const { scene } = useGLTF('/planet-1/scene.gltf');
  
  // Create a copy of the scene to avoid modifying the original
  const planetModel = scene.clone();
  
  // Apply mobile optimizations to the model
  useEffect(() => {
    if (isMobile && planetModel) {
      // Simplify materials for mobile
      planetModel.traverse((child) => {
        if (child.isMesh) {
          // Simplify materials for better performance
          child.material.roughness = 1.0;
          child.material.metalness = 0.5;
          
          // Disable shadows on mobile
          child.castShadow = false;
          child.receiveShadow = false;
          
          // Reduce polygon count if possible
          if (child.geometry && child.geometry.attributes.position) {
            // We'll keep the original geometry but optimize rendering
            child.frustumCulled = true;
          }
        }
      });
    }
  }, [isMobile, planetModel]);
  
  // Rotation animation - slower on mobile
  useFrame(({ clock }) => {
    const elapsedTime = clock.getElapsedTime();
    const rotationSpeed = isMobile ? 0.05 : 0.1;
    
    if (planetRef.current) {
      planetRef.current.rotation.y = elapsedTime * rotationSpeed;
    }
    if (glowRef.current) {
      glowRef.current.rotation.y = elapsedTime * (rotationSpeed / 2);
    }
  });

  return (
    <group>
      {/* Subtle static stars matching dark theme - fewer on mobile */}
      <group>
        {[...Array(isMobile ? 100 : 300)].map((_, i) => {
          // Generate random positions in a sphere
          const theta = 2 * Math.PI * Math.random();
          const phi = Math.acos(2 * Math.random() - 1);
          const distance = 150 + Math.random() * 150; // Further away
          const x = distance * Math.sin(phi) * Math.cos(theta);
          const y = distance * Math.sin(phi) * Math.sin(theta);
          const z = distance * Math.cos(phi);
          
          // Smaller sizes for subtlety
          const size = 0.04 + Math.random() * 0.08;
          
          // Dark theme appropriate colors - more muted blues and purples
          const hue = 0.6 + Math.random() * 0.2; // Blue to purple range
          const saturation = 0.1 + Math.random() * 0.2; // Low saturation
          const lightness = 0.5 + Math.random() * 0.3; // Medium brightness
          
          const color = new THREE.Color().setHSL(hue, saturation, lightness);
          
          return (
            <mesh key={i} position={[x, y, z]}>
              <planeGeometry args={[size, size]} /> {/* Simpler geometry */}
              <meshBasicMaterial 
                color={color} 
                transparent 
                opacity={0.6 + Math.random() * 0.3} 
                side={THREE.DoubleSide} 
              />
            </mesh>
          );
        })}
      </group>
      
      {/* Planet from GLTF model */}
      <group ref={planetRef} scale={[3.2, 3.2, 3.2]} position={[0, 0, 0]}>
        <primitive object={planetModel} />
      </group>

      {/* Atmosphere glow */}
      <group ref={glowRef}>
        <mesh>
          <sphereGeometry args={[6.5, 36, 36]} />
          <meshStandardMaterial
            color="#4fc3f7"
            transparent
            opacity={0.07}
            side={THREE.BackSide}
            depthWrite={false}
          />
        </mesh>
      </group>
    </group>
  );
};

const EarthCanvas = () => {
  const isMobile = useIsMobile();
  
  return (
    <Canvas
      frameloop="demand"
      dpr={isMobile ? [0.8, 1.2] : [1, 1.5]} // Lower resolution on mobile
      gl={{
        antialias: !isMobile, // Disable antialiasing on mobile
        alpha: true,
        powerPreference: isMobile ? 'low-power' : 'default', // Use low power mode on mobile
        depth: true,
        stencil: false, // Disable stencil buffer on mobile
      }}
      camera={{
        fov: isMobile ? 40 : 35, // Wider FOV on mobile
        near: 0.1,
        far: 1000,
        position: [0, 0, isMobile ? 14 : 12], // Move camera back on mobile
      }}
      style={{ background: 'transparent' }}
    >
      {/* Simplified lighting for mobile */}
      <ambientLight intensity={isMobile ? 0.5 : 0.3} />
      <directionalLight 
        position={[5, 5, 5]}
        intensity={isMobile ? 1.2 : 1}
        color="#ffffff"
        castShadow={!isMobile} // Disable shadows on mobile
      />
      {!isMobile && (
        <pointLight 
          position={[-5, -5, -5]}
          intensity={0.2}
          color="#2196f3"
        />
      )}
      
      <Suspense fallback={<CanvasLoader />}>
        <OrbitControls
          autoRotate
          autoRotateSpeed={isMobile ? 0.3 : 0.5} // Slower rotation on mobile
          enableZoom={false}
          enablePan={false}
          maxPolarAngle={Math.PI / 1.7}
          minPolarAngle={Math.PI / 2.3}
          rotateSpeed={0.3}
          enableDamping={!isMobile} // Disable damping on mobile
        />
        <Earth />
      </Suspense>
    </Canvas>
  );
};

export default EarthCanvas;
