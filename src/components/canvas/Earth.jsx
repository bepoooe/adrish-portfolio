import React, { Suspense, useState, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Preload, useGLTF } from "@react-three/drei";
import CanvasLoader from "../Loader";

// Mobile detection hook with debouncing for better performance
const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    let timeoutId;
    
    const checkMobile = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        setIsMobile(window.innerWidth <= 768);
      }, 100); // Debounce for 100ms
    };
    
    // Initial check
    setIsMobile(window.innerWidth <= 768);
    
    // Add resize listener
    window.addEventListener('resize', checkMobile);
    
    return () => {
      window.removeEventListener('resize', checkMobile);
      clearTimeout(timeoutId);
    };
  }, []);
  
  return isMobile;
};

// Preload the GLTF model
useGLTF.preload('./planet-1/scene.gltf');

const Earth = React.memo(() => {
  const earth = useGLTF("./planet-1/scene.gltf");
  const isMobile = useIsMobile();

  // Apply mobile optimizations to the model - only run once per mobile state change
  useEffect(() => {
    if (earth.scene) {
      earth.scene.traverse((child) => {
        if (child.isMesh && child.material) {
          if (isMobile) {
            // Simplify materials for better performance on mobile
            child.material.roughness = 1.0;
            child.material.metalness = 0.5;
            child.castShadow = false;
            child.receiveShadow = false;
          }
          // Enable frustum culling for better performance
          child.frustumCulled = true;
        }
      });
    }
  }, [isMobile, earth.scene]);

  // Add error boundary for the primitive
  if (!earth || !earth.scene) {
    return null;
  }

  return (
    <primitive 
      object={earth.scene} 
      scale={isMobile ? 2.0 : 2.5} 
      position-y={0} 
      rotation-y={0} 
    />
  );
});

const EarthCanvas = () => {
  const isMobile = useIsMobile();
  return (
    <Canvas
      shadows={!isMobile} // Disable shadows on mobile for better performance
      frameloop='demand'
      dpr={[1, isMobile ? 1.5 : 2]} // Lower DPR on mobile
      gl={{ 
        preserveDrawingBuffer: true,
        antialias: !isMobile, // Disable anti-aliasing on mobile
        powerPreference: "high-performance"
      }}
      camera={{
        fov: 45,
        near: 0.1,
        far: 200,
        position: isMobile ? [-3, 2.5, 5] : [-4, 3, 6],
      }}
    >
      <Suspense fallback={<CanvasLoader />}>
        <ambientLight intensity={0.3} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <OrbitControls
          autoRotate
          enableZoom={false}
          maxPolarAngle={Math.PI / 2}
          minPolarAngle={Math.PI / 2}
          enableDamping={true}
          dampingFactor={0.05}
        />
        <Earth />
        <Preload all />
      </Suspense>
    </Canvas>
  );
};

export default EarthCanvas;
