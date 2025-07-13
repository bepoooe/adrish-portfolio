import React, { Suspense, useEffect, useState, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Preload, Box, Cylinder } from "@react-three/drei";

import CanvasLoader from "../Loader";

// Mobile detection hook with debouncing for better performance
const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth <= 500;
    }
    return false;
  });
  
  useEffect(() => {
    let timeoutId;
    
    const checkMobile = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        const newIsMobile = window.innerWidth <= 500;
        setIsMobile(prevIsMobile => {
          if (prevIsMobile !== newIsMobile) {
            return newIsMobile;
          }
          return prevIsMobile;
        });
      }, 100); // Debounce for 100ms
    };
    
    // Initial check
    checkMobile();
    
    // Add resize listener
    window.addEventListener('resize', checkMobile);
    
    return () => {
      window.removeEventListener('resize', checkMobile);
      clearTimeout(timeoutId);
    };
  }, []);
  
  return isMobile;
};

const SimpleComputer = React.memo(({ isMobile }) => {  const computerRef = useRef();
  const monitorRef = useRef();
  const screenRef = useRef();
  
  // Optimized animation with frame skipping for mobile
  useFrame(({ clock }) => {
    const elapsedTime = clock.getElapsedTime();
    
    // Frame skipping for mobile performance
    if (isMobile && Math.floor(elapsedTime * 60) % 2 !== 0) {
      return;
    }
    
    if (computerRef.current) {
      computerRef.current.rotation.y = Math.sin(elapsedTime * 0.3) * 0.1;
    }
    if (screenRef.current && screenRef.current.material) {
      screenRef.current.material.emissiveIntensity = 0.5 + Math.sin(elapsedTime * 2) * 0.2;
    }
  });

  const scale = isMobile ? 0.7 : 0.9;
  
  return (
    <group ref={computerRef} position={[0, -0.5, 0]} scale={scale}>
      {/* Base/Tower */}
      <Box args={[1, 3, 1.2]} position={[-1.2, -0.5, 0]}>
        <meshStandardMaterial color="#303030" metalness={0.5} roughness={0.2} />
      </Box>
      
      {/* Monitor Stand */}
      <Cylinder args={[0.3, 0.5, 0.2, 16]} position={[0, -1.5, 0]}>
        <meshStandardMaterial color="#252525" metalness={0.7} roughness={0.2} />
      </Cylinder>
      
      <Box args={[0.15, 1, 0.15]} position={[0, -1, 0]}>
        <meshStandardMaterial color="#404040" metalness={0.6} roughness={0.3} />
      </Box>
      
      {/* Monitor */}
      <group ref={monitorRef}>
        {/* Monitor frame */}
        <Box args={[3, 1.8, 0.1]} position={[0, 0, 0]}>
          <meshStandardMaterial color="#151515" metalness={0.5} roughness={0.2} />
        </Box>
        
        {/* Screen */}
        <Box ref={screenRef} args={[2.7, 1.5, 0.05]} position={[0, 0, 0.06]}>
          <meshStandardMaterial 
            color="#915eff" 
            emissive="#915eff" 
            emissiveIntensity={0.6}
          />
        </Box>
      </group>
      
      {/* Keyboard */}
      <Box args={[2, 0.1, 0.8]} position={[0, -1.8, 0.8]}>
        <meshStandardMaterial color="#252525" metalness={0.4} roughness={0.4} />
      </Box>
        {/* Mouse */}
      <Box args={[0.3, 0.1, 0.5]} position={[1.2, -1.8, 0.8]} rotation={[0, 0.3, 0]}>
        <meshStandardMaterial color="#303030" metalness={0.4} roughness={0.4} />
      </Box>
    </group>
  );
});

const ComputersCanvas = () => {
  const isMobile = useIsMobile();

  return (
    <Canvas
      frameloop='demand' // Changed from 'always' for better performance
      camera={{ position: [0, 0, 8], fov: 25 }}
      gl={{ 
        antialias: !isMobile, // Disable anti-aliasing on mobile
        alpha: true,
        powerPreference: "high-performance"
      }}
      dpr={[1, isMobile ? 1.5 : 2]} // Lower DPR on mobile
      style={{ background: 'transparent' }}
    >
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 5, 5]} intensity={0.8} />
      <pointLight position={[-5, -5, -5]} intensity={0.5} color="#915eff" />
      
      <Suspense fallback={<CanvasLoader />}>
        <OrbitControls
          enableZoom={false}
          autoRotate
          autoRotateSpeed={isMobile ? 0.3 : 0.5} // Slower rotation on mobile
          maxPolarAngle={Math.PI / 1.8}
          minPolarAngle={Math.PI / 2.2}
          enableDamping={true}
          dampingFactor={0.05}
        />
        <SimpleComputer isMobile={isMobile} />
      </Suspense>
    </Canvas>
  );
};

export default ComputersCanvas;
