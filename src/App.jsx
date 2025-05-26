import { Loader } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Suspense, useEffect, useState } from "react";
import { Experience } from "./components/Experience";
import { UI } from "./components/UI";
import { MusicPlayer } from "./components/MusicPlayer";
import { Portfolio } from "./components/Portfolio";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import ScrollToTop from "./components/ScrollToTop";
import { useDevice } from "./context/DeviceContext";
import { optimizeRenderer } from "./utils/memoryOptimizer";
import * as THREE from "three";

// Memory-optimized Canvas component
const OptimizedCanvas = ({ children }) => {
  const { isMobile, isLowPerformance } = useDevice();
  const [rendererInstance, setRendererInstance] = useState(null);

  // Basic renderer setup that works on all devices
  const handleCreated = ({ gl, scene, camera }) => {
    // Store renderer instance for cleanup
    setRendererInstance(gl);

    // Set standard pixel ratio
    gl.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Basic renderer settings
    gl.outputColorSpace = THREE.SRGBColorSpace;

    // Enable texture extensions for better compatibility
    gl.getContext().getExtension('OES_texture_float');
    gl.getContext().getExtension('OES_texture_half_float');

    // Basic scene settings
    scene.matrixAutoUpdate = true;

    // Basic camera settings
    if (camera) {
      camera.near = 0.1;
      camera.far = 1000;
      camera.updateProjectionMatrix();
    }
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
      shadows={false} // Disable shadows for all devices
      frameloop="always" // Use always frameloop for better compatibility
      dpr={[1, 2]} // Standard DPR range
      gl={{
        antialias: true, // Enable antialiasing for better texture rendering
        alpha: true,
        powerPreference: "default", // Use default power preference for better compatibility
        depth: true,
        stencil: false, // Disable stencil buffer to save memory
        precision: "mediump", // Use medium precision for better compatibility
        failIfMajorPerformanceCaveat: false, // Don't fail on performance issues
      }}
      onCreated={handleCreated}
      performance={{ min: 0.5 }} // Standard performance setting
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
      <ScrollToTop />

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
