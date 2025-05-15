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
      
      {/* Hero Section with Book Card on right side */}
      <div className="hero-section">
        <Hero />
        
        {/* Book Card positioned on mid-to-right area */}
        <div className="book-card-overlay">
          <div className="book-card">
            <div className="canvas-container" id="book">
              <Canvas shadows camera={{ position: [-0.5, 1, 4], fov: 45 }}>
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
