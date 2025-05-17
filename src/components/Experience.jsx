import { Environment, Float, OrbitControls } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { Book } from "./Book";
import { Particles } from "./Particles";
import { useEffect, useState } from "react";

export const Experience = () => {
  // Detect if we're on mobile for responsive adjustments
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    // Check if we're on mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    // Initial check
    checkMobile();
    
    // Add resize listener
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  // Adjust camera for mobile
  const CameraAdjuster = () => {
    const { camera } = useThree();
    
    useEffect(() => {
      if (isMobile) {
        // Adjust camera position for mobile
        camera.position.set(-0.5, 1.2, 4.5);
        camera.fov = 50;
        camera.updateProjectionMatrix();
      }
    }, [camera, isMobile]);
    
    return null;
  };
  
  return (
    <>
      <CameraAdjuster />
      <Float
        rotation-x={-Math.PI / 4}
        floatIntensity={isMobile ? 0.5 : 1} // Reduce float intensity on mobile
        speed={isMobile ? 1.5 : 2} // Slightly slower on mobile
        rotationIntensity={isMobile ? 1 : 2} // Less rotation on mobile
      >
        <Book />
      </Float>
      <Particles count={isMobile ? 1000 : 2000} /> {/* Fewer particles on mobile */}
      <OrbitControls 
        enableZoom={false} // Disable zoom for better mobile experience
        enablePan={false} // Disable panning for better mobile experience
        rotateSpeed={0.5} // Slower rotation for better control
        maxPolarAngle={Math.PI / 1.5} // Limit rotation
        minPolarAngle={Math.PI / 3} // Limit rotation
      />
      <Environment preset="city" intensity={0.5}></Environment>
      <directionalLight
        position={[2, 5, 2]}
        intensity={4}
        castShadow
        shadow-mapSize-width={isMobile ? 1024 : 2048} // Lower resolution shadows on mobile
        shadow-mapSize-height={isMobile ? 1024 : 2048}
        shadow-bias={-0.0001}
      />
      {/* Add spotlights specifically to illuminate book pages */}
      <spotLight
        position={[3, 1, 1]}
        angle={0.5}
        penumbra={0.5}
        intensity={4}
        color="white"
        castShadow={!isMobile} // Disable shadow casting on mobile for performance
        target-position={[0, 0, 0]}
      />
      <spotLight
        position={[-3, 1, 1]}
        angle={0.5}
        penumbra={0.5}
        intensity={4}
        color="white"
        castShadow={!isMobile} // Disable shadow casting on mobile for performance
        target-position={[0, 0, 0]}
      />
      <ambientLight intensity={isMobile ? 2 : 1.5} /> {/* Brighter ambient on mobile */}
      <mesh position-y={-1.5} rotation-x={-Math.PI / 2} receiveShadow>
        <planeGeometry args={[100, 100]} />
        <shadowMaterial transparent opacity={isMobile ? 0.15 : 0.2} />
      </mesh>
    </>
  );
};
