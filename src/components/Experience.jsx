import { Environment, Float, OrbitControls } from "@react-three/drei";
import { Book } from "./Book";
import { Particles } from "./Particles";

export const Experience = () => {
  return (
    <>
      <Float
        rotation-x={-Math.PI / 4}
        floatIntensity={1}
        speed={2}
        rotationIntensity={2}
      >
        <Book />
      </Float>
      <Particles count={2000} />
      <OrbitControls />
      <Environment preset="city" intensity={0.5}></Environment>
      <directionalLight
        position={[2, 5, 2]}
        intensity={4}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-bias={-0.0001}
      />
      {/* Add spotlights specifically to illuminate book pages */}
      <spotLight
        position={[3, 1, 1]}
        angle={0.5}
        penumbra={0.5}
        intensity={4}
        color="white"
        castShadow
        target-position={[0, 0, 0]}
      />
      <spotLight
        position={[-3, 1, 1]}
        angle={0.5}
        penumbra={0.5}
        intensity={4}
        color="white"
        castShadow
        target-position={[0, 0, 0]}
      />
      <ambientLight intensity={1.5} />
      <mesh position-y={-1.5} rotation-x={-Math.PI / 2} receiveShadow>
        <planeGeometry args={[100, 100]} />
        <shadowMaterial transparent opacity={0.2} />
      </mesh>
    </>
  );
};
