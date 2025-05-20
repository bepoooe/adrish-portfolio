import { Environment, Float, OrbitControls } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { Book } from "./Book";
import { Particles } from "./Particles";
import { Suspense, useEffect } from "react";
import { useDevice } from "../context/DeviceContext";

// Export the useDevice hook for other components
export const useIsMobile = () => {
  const { isMobile } = useDevice();
  return isMobile;
};

// Simple fallback component while book is loading
const BookFallback = () => {
  return (
    <mesh>
      <boxGeometry args={[1.28, 1.71, 0.1]} />
      <meshStandardMaterial color="#f9f9f9" />
    </mesh>
  );
};

export const Experience = () => {
  // Use the shared device context
  const { isMobile, isLowPerformance } = useDevice();
  
  // Adjust camera for mobile
  const CameraAdjuster = () => {
    const { camera } = useThree();
    
    useEffect(() => {
      if (isMobile) {
        // Adjust camera position for mobile - moved further back for better initial view
        camera.position.set(-0.5, 1.2, 6);
        camera.fov = 50; // Wider FOV for mobile
        camera.near = 0.1; // Closer near clipping plane
        camera.far = 2000; // Far clipping plane for zooming out
        camera.updateProjectionMatrix();
      } else {
        // Ensure desktop camera is properly positioned
        camera.position.set(-0.5, 1, 4.5);
        camera.fov = 40;
        camera.far = 2000; // Far clipping plane for zooming out
        camera.updateProjectionMatrix();
      }
    }, [camera, isMobile]);
    
    // Handle resize events to update camera on orientation changes
    useEffect(() => {
      const handleResize = () => {
        if (isMobile) {
          camera.position.set(-0.5, 1.2, 6);
          camera.fov = window.innerWidth < 380 ? 55 : 50; // Even wider FOV for very small screens
          camera.updateProjectionMatrix();
        }
      };
      
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }, [camera, isMobile]);
    
    return null;
  };
  
  return (
    <>
      <CameraAdjuster />
      <Float
        rotation-x={isMobile ? -Math.PI / 5 : -Math.PI / 4} // Less tilt on mobile
        floatIntensity={isMobile ? 0.2 : 1} // Significantly reduce float intensity on mobile
        speed={isMobile ? 0.8 : 2} // Slower on mobile for better performance
        rotationIntensity={isMobile ? 0.3 : 2} // Much less rotation on mobile
      >
        <Suspense fallback={<BookFallback />}>
          <Book />
        </Suspense>
      </Float>
      
      {/* Only show particles on higher-end devices */}
      {!isLowPerformance && <Particles count={isMobile ? 400 : 1000} />}
      
      <OrbitControls 
        enableZoom={true} // Enable zoom functionality
        zoomSpeed={isMobile ? 1.2 : 0.8} // Faster zoom speed on mobile
        minDistance={isMobile ? 2 : 1} // Prevent zooming in too close on mobile
        maxDistance={isMobile ? 10 : 15} // Limit zoom out on mobile for better performance
        enablePan={false} // Disable panning for better experience
        rotateSpeed={isMobile ? 0.7 : 0.5} // Slightly faster rotation on mobile
        maxPolarAngle={Math.PI / 1.5} // Limit rotation
        minPolarAngle={Math.PI / 3} // Limit rotation
        enableDamping={true} // Add smooth damping
        dampingFactor={0.1} // Control damping speed
        touchAction="none" // Prevent default touch actions
        screenSpacePanning={false} // Use more intuitive panning mode
      />
      
      {/* Simpler environment on mobile */}
      <Environment preset={isMobile ? "sunset" : "city"} intensity={isMobile ? 0.3 : 0.5} />
      
      {/* Optimized lighting for all devices */}
      {isMobile ? (
        // Mobile-optimized lighting - minimal for better performance
        <>
          <directionalLight
            position={[2, 5, 2]}
            intensity={3}
            castShadow={false}
          />
          <ambientLight intensity={2} />
        </>
      ) : (
        // Desktop lighting with optimized effects
        <>
          <directionalLight
            position={[2, 5, 2]}
            intensity={3}
            castShadow
            shadow-mapSize-width={1024} // Reduced shadow map size
            shadow-mapSize-height={1024}
            shadow-bias={-0.0001}
          />
          {/* Removed one spotlight for better performance */}
          <spotLight
            position={[3, 1, 1]}
            angle={0.5}
            penumbra={0.5}
            intensity={3}
            color="white"
            castShadow={false} // Disable shadow casting for better performance
            target-position={[0, 0, 0]}
          />
          <ambientLight intensity={1.5} />
          {/* Simplified shadow receiver */}
          <mesh position-y={-1.5} rotation-x={-Math.PI / 2} receiveShadow>
            <planeGeometry args={[50, 50]} /> {/* Smaller plane */}
            <shadowMaterial transparent opacity={0.15} />
          </mesh>
        </>
      )}
    </>
  );
};
