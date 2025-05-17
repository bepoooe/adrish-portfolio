import { Loader } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";
import { Experience } from "./components/Experience";
import { UI } from "./components/UI";
import { MusicPlayer } from "./components/MusicPlayer";
import { Portfolio } from "./components/Portfolio";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";

function App() {
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
              <Canvas 
                shadows 
                camera={{ position: [-0.5, 1, 4.5], fov: 40, far: 2000 }}
                dpr={[1, 2]} // Responsive pixel ratio (better for mobile)
                gl={{ 
                  antialias: true,
                  alpha: true,
                  powerPreference: "high-performance"
                }}
                onCreated={({ gl }) => {
                  // Optimize for mobile
                  if (window.innerWidth <= 768) {
                    gl.setPixelRatio(window.devicePixelRatio > 2 ? 2 : window.devicePixelRatio);
                  }
                }}
              >
                <group position-y={0}>
                  <Suspense fallback={null}>
                    <Experience />
                  </Suspense>
                </group>
              </Canvas>
            </div>
          </div>
        </div>
      </div>
      <Portfolio />
    </>
  );
}

export default App;
