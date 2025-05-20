import { Environment, Float, OrbitControls } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { Book } from "./Book";
import { Particles } from "./Particles";
import { Suspense, useEffect, useState, lazy } from "react";
import { useDevice } from "../context/DeviceContext";
import { cleanupResources } from "../utils/memoryOptimizer";

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

// Lazy load particles to reduce initial memory usage
const LazyParticles = lazy(() => import('./Particles').then(module => ({ default: module.Particles })));

// Camera adjuster component extracted for better organization
const CameraAdjuster = ({ isMobile }) => {
  const { camera } = useThree();

  useEffect(() => {
    if (isMobile) {
      // Enhanced camera settings for more prominent mobile view
      camera.position.set(-0.5, 1.0, 5.2); // Closer Z position for larger appearance
      camera.fov = 45; // Narrower FOV for larger appearance
      camera.near = 0.1;
      camera.far = 1000; // Reduced far plane for better performance
      camera.updateProjectionMatrix();
    } else {
      // Desktop camera with optimized settings
      camera.position.set(-0.5, 1, 4.5);
      camera.fov = 40;
      camera.far = 1000; // Reduced far plane
      camera.updateProjectionMatrix();
    }

    // Cleanup function
    return () => {
      // Reset camera to default state when unmounting
      camera.position.set(0, 0, 0);
      camera.rotation.set(0, 0, 0);
      camera.updateProjectionMatrix();
    };
  }, [camera, isMobile]);

  // Simplified resize handler with debounce
  useEffect(() => {
    let resizeTimeout;

    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        if (isMobile) {
          // Adjust FOV based on screen width for optimal book visibility
          camera.fov = window.innerWidth < 380 ? 48 : 45;
          camera.updateProjectionMatrix();
        }
      }, 200); // Debounce resize events
    };

    window.addEventListener('resize', handleResize);
    return () => {
      clearTimeout(resizeTimeout);
      window.removeEventListener('resize', handleResize);
    };
  }, [camera, isMobile]);

  return null;
};

// Basic lighting component that works on all devices
const OptimizedLighting = () => {
  return (
    <>
      {/* Simple lighting setup that works on all devices */}
      <directionalLight
        position={[2, 5, 2]}
        intensity={3.5}
        castShadow={false}
      />
      <ambientLight intensity={2.5} />

      {/* Add extra light for better texture visibility */}
      <pointLight
        position={[0, 0, 5]}
        intensity={1.5}
        color="#ffffff"
      />
    </>
  );
};

export const Experience = () => {
  // Use the shared device context
  const { isMobile, isLowPerformance } = useDevice();

  // State to control when to show particles (delayed loading)
  const [showParticles, setShowParticles] = useState(false);

  // Delay particle loading to improve initial render performance
  useEffect(() => {
    // Only show particles after initial render is complete
    const timer = setTimeout(() => {
      if (!isLowPerformance) {
        setShowParticles(true);
      }
    }, 1000); // 1 second delay

    // Clean up resources when component unmounts
    return () => {
      clearTimeout(timer);
      cleanupResources(); // Force cleanup when unmounting
    };
  }, [isLowPerformance]);

  return (
    <>
      <CameraAdjuster isMobile={isMobile} />

      {/* Enhanced Float component for more prominent mobile appearance */}
      <Float
        rotation-x={isMobile ? -Math.PI / 6 : -Math.PI / 4} // Adjusted angle for better mobile view
        floatIntensity={isMobile ? 0.3 : 0.5} // Increased from 0.1 for more noticeable movement
        speed={isMobile ? 0.8 : 1} // Increased from 0.5 for more noticeable animation
        rotationIntensity={isMobile ? 0.4 : 1} // Increased from 0.2 for more noticeable rotation
      >
        <Suspense fallback={<BookFallback />}>
          <Book />
        </Suspense>
      </Float>

      {/* Lazy-loaded particles with delayed rendering */}
      {showParticles && (
        <Suspense fallback={null}>
          <LazyParticles count={isMobile ? 150 : 300} /> {/* Further reduced particle count */}
        </Suspense>
      )}

      {/* Optimized OrbitControls with simplified settings */}
      <OrbitControls
        enableZoom={true}
        zoomSpeed={0.8}
        minDistance={isMobile ? 2 : 1}
        maxDistance={isMobile ? 8 : 10} // Reduced max distance
        enablePan={false}
        rotateSpeed={0.5}
        maxPolarAngle={Math.PI / 1.5}
        minPolarAngle={Math.PI / 3}
        enableDamping={!isMobile} // Disable damping on mobile
        dampingFactor={0.05} // Reduced damping factor
      />

      {/* Simplified environment for better mobile performance */}
      {isMobile ? (
        // Use a simpler environment setup for mobile
        <color attach="background" args={['#000000']} />
      ) : (
        // Full environment for desktop
        <Environment
          preset="city"
          intensity={0.3}
        />
      )}

      {/* Use basic lighting component */}
      <OptimizedLighting />
    </>
  );
};
