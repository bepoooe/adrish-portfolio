import React, { Suspense, useRef } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { OrbitControls, Stars, useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import CanvasLoader from '../Loader';

// Preload the GLTF model to avoid loading issues
useGLTF.preload('/planet-1/scene.gltf');

// Planet model component using the GLTF file from planet-1 folder
const Earth = () => {
  const planetRef = useRef();
  const glowRef = useRef();
  
  // Load the GLTF model
  const { scene } = useGLTF('/planet-1/scene.gltf');
  
  // Create a copy of the scene to avoid modifying the original
  const planetModel = scene.clone();
  
  // Rotation animation
  useFrame(({ clock }) => {
    const elapsedTime = clock.getElapsedTime();
    if (planetRef.current) {
      planetRef.current.rotation.y = elapsedTime * 0.1;
    }
    if (glowRef.current) {
      glowRef.current.rotation.y = elapsedTime * 0.05;
    }
  });

  return (
    <group>
      {/* Subtle static stars matching dark theme */}
      <group>
        {[...Array(300)].map((_, i) => {
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
  return (
    <Canvas
      frameloop="demand"
      dpr={[1, 1.5]}
      gl={{
        antialias: true,
        alpha: true,
        powerPreference: 'default'
      }}
      camera={{
        fov: 35,
        near: 0.1,
        far: 1000,
        position: [0, 0, 12],
      }}
      style={{ background: 'transparent' }}
    >
      {/* Lighting */}
      <ambientLight intensity={0.3} />
      <directionalLight 
        position={[5, 5, 5]}
        intensity={1}
        color="#ffffff"
      />
      <pointLight 
        position={[-5, -5, -5]}
        intensity={0.2}
        color="#2196f3"
      />
      
      <Suspense fallback={<CanvasLoader />}>
        <OrbitControls
          autoRotate
          autoRotateSpeed={0.5}
          enableZoom={false}
          enablePan={false}
          maxPolarAngle={Math.PI / 1.7}
          minPolarAngle={Math.PI / 2.3}
          rotateSpeed={0.3}
        />
        <Earth />
      </Suspense>
    </Canvas>
  );
};

export default EarthCanvas;
