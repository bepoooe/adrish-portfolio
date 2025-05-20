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
      // Simplified camera settings for mobile
      camera.position.set(-0.5, 1.2, 6);
      camera.fov = 50;
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
          camera.fov = window.innerWidth < 380 ? 55 : 50;
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

// Optimized lighting component to reduce re-renders
const OptimizedLighting = ({ isMobile }) => {
  return isMobile ? (
    // Ultra-simplified lighting for mobile
    <>
      <directionalLight position={[2, 5, 2]} intensity={3} />
      <ambientLight intensity={2} />
    </>
  ) : (
    // Simplified desktop lighting
    <>
      <directionalLight
        position={[2, 5, 2]}
        intensity={3}
        castShadow
        shadow-mapSize-width={512} // Further reduced shadow map size
        shadow-mapSize-height={512}
        shadow-bias={-0.0001}
      />
      <ambientLight intensity={1.5} />
      {/* Simplified shadow receiver with smaller geometry */}
      <mesh position-y={-1.5} rotation-x={-Math.PI / 2} receiveShadow>
        <planeGeometry args={[20, 20]} /> {/* Much smaller plane */}
        <shadowMaterial transparent opacity={0.15} />
      </mesh>
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

      {/* Optimized Float component with reduced animation */}
      <Float
        rotation-x={isMobile ? -Math.PI / 5 : -Math.PI / 4}
        floatIntensity={isMobile ? 0.1 : 0.5} // Further reduced float intensity
        speed={isMobile ? 0.5 : 1} // Further reduced speed
        rotationIntensity={isMobile ? 0.2 : 1} // Further reduced rotation
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

      {/* Simplified environment with lower intensity */}
      <Environment
        preset={isMobile ? "sunset" : "city"}
        intensity={isMobile ? 0.2 : 0.3} // Reduced intensity
      />

      {/* Use optimized lighting component */}
      <OptimizedLighting isMobile={isMobile} />
    </>
  );
};
