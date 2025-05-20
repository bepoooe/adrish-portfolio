import { Loader } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Suspense, useEffect, useState } from "react";
import { Experience } from "./components/Experience";
import { UI } from "./components/UI";
import { MusicPlayer } from "./components/MusicPlayer";
import { Portfolio } from "./components/Portfolio";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import { useDevice } from "./context/DeviceContext";
import { optimizeRenderer } from "./utils/memoryOptimizer";

// Memory-optimized Canvas component
const OptimizedCanvas = ({ children }) => {
  const { isMobile, isLowPerformance } = useDevice();
  const [rendererInstance, setRendererInstance] = useState(null);

  // Apply memory optimizations when renderer is created
  const handleCreated = ({ gl, scene }) => {
    // Apply memory-saving optimizations
    optimizeRenderer(gl);

    // Store renderer instance for cleanup
    setRendererInstance(gl);

    // Set pixel ratio based on device capability
    const maxPixelRatio = isMobile ? 1 : isLowPerformance ? 1.5 : 2;
    gl.setPixelRatio(Math.min(window.devicePixelRatio, maxPixelRatio));

    // Disable automatic clearing to improve performance
    gl.autoClear = false;

    // Optimize scene
    scene.matrixAutoUpdate = false;

    // Disable frustum culling for better performance
    scene.frustumCulled = false;
  };

  // Clean up renderer when component unmounts
  useEffect(() => {
    return () => {
      if (rendererInstance) {
        // Force dispose of renderer resources
        rendererInstance.dispose();

        // Clear any cached resources
        rendererInstance.forceContextLoss();
        rendererInstance.context = null;
        rendererInstance.domElement = null;
      }
    };
  }, [rendererInstance]);

  return (
    <Canvas
      shadows={!isMobile && !isLowPerformance} // Disable shadows on mobile/low-end devices
      frameloop={isLowPerformance ? "demand" : "always"} // Use demand-based rendering for low-end devices
      dpr={[0.8, 1.5]} // Lower DPR range for better performance
      gl={{
        antialias: !isLowPerformance, // Disable antialiasing on low-end devices
        alpha: true,
        powerPreference: "high-performance",
        depth: true,
        stencil: false, // Disable stencil buffer to save memory
        precision: isLowPerformance ? "lowp" : "mediump" // Use lower precision on low-end devices
      }}
      onCreated={handleCreated}
      performance={{ min: 0.5 }} // Allow ThreeJS to reduce quality for better performance
    >
      {children}
    </Canvas>
  );
};

function App() {
  // Force garbage collection on page visibility change
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // When tab is hidden, force cleanup
        if (window.gc) window.gc();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return (
    <>
      <Navbar />
      <MusicPlayer />
      <UI />
      <Loader />

      {/* Hero Section with Book Card (responsive layout) */}
      <div className="hero-section">
        <Hero />

        {/* Book Card - responsive positioning */}
        <div className="book-card-overlay">
          <div className="book-card">
            <div className="canvas-container" id="book">
              <OptimizedCanvas>
                <Suspense fallback={null}>
                  <Experience />
                </Suspense>
              </OptimizedCanvas>
            </div>
          </div>
        </div>
      </div>
      <Portfolio />
    </>
  );
}

export default App;
