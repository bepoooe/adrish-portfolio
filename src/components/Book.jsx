import { useCursor, useTexture } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useAtom } from "jotai";
import { easing } from "maath";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Bone,
  BoxGeometry,
  Color,
  Float32BufferAttribute,
  LinearFilter,
  MathUtils,
  MeshStandardMaterial,
  Skeleton,
  SkinnedMesh,
  SRGBColorSpace,
  Uint16BufferAttribute,
  Vector3,
} from "three";
import { degToRad } from "three/src/math/MathUtils.js";
import { pageAtom, pages } from "./UI";
// Use local implementation to avoid circular dependency
const useIsMobile = () => {
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
  
  return isMobile;
};

// Adjust parameters based on device
const getBookParameters = (isMobile) => {
  return {
    easingFactor: isMobile ? 0.4 : 0.5, // Slightly faster easing on mobile for more consistent opening
    easingFactorFold: isMobile ? 0.3 : 0.3, // Same fold easing for consistency
    insideCurveStrength: isMobile ? 0.12 : 0.12, // Same curve strength for consistent opening
    outsideCurveStrength: isMobile ? 0.03 : 0.03, // Same curve strength for consistent opening
    turningCurveStrength: isMobile ? 0.06 : 0.06, // Same turning curve for consistent opening
    pageSegments: isMobile ? 15 : 30, // Fewer segments on mobile for better performance
  };
};

const PAGE_WIDTH = 1.28;
const PAGE_HEIGHT = 1.71; // 4:3 aspect ratio
const PAGE_DEPTH = 0.003;

// Create page geometry based on device capabilities
const createPageGeometry = (segments) => {
  const geometry = new BoxGeometry(
    PAGE_WIDTH,
    PAGE_HEIGHT,
    PAGE_DEPTH,
    segments,
    2
  );

  geometry.translate(PAGE_WIDTH / 2, 0, 0);
  
  const segmentWidth = PAGE_WIDTH / segments;
  const position = geometry.attributes.position;
  const vertex = new Vector3();
  const skinIndexes = [];
  const skinWeights = [];

  for (let i = 0; i < position.count; i++) {
    // ALL VERTICES
    vertex.fromBufferAttribute(position, i); // get the vertex
    const x = vertex.x; // get the x position of the vertex

    const skinIndex = Math.max(0, Math.floor(x / segmentWidth)); // calculate the skin index
    let skinWeight = (x % segmentWidth) / segmentWidth; // calculate the skin weight

    skinIndexes.push(skinIndex, skinIndex + 1, 0, 0); // set the skin indexes
    skinWeights.push(1 - skinWeight, skinWeight, 0, 0); // set the skin weights
  }

  geometry.setAttribute(
    "skinIndex",
    new Uint16BufferAttribute(skinIndexes, 4)
  );
  geometry.setAttribute(
    "skinWeight",
    new Float32BufferAttribute(skinWeights, 4)
  );
  
  return geometry;
};

const whiteColor = new Color("#f9f9f9"); // Slightly off-white for better text contrast
const emissiveColor = new Color("#333333");

const pageMaterials = [
  new MeshStandardMaterial({
    color: whiteColor,
  }),
  new MeshStandardMaterial({
    color: "#111",
  }),
  new MeshStandardMaterial({
    color: whiteColor,
  }),
  new MeshStandardMaterial({
    color: whiteColor,
  }),
];

pages.forEach((page) => {
  useTexture.preload(`/textures/${page.front}.jpg`);
  useTexture.preload(`/textures/${page.back}.jpg`);
  useTexture.preload(`/textures/book-cover-roughness.jpg`);
});

const Page = ({ number, front, back, page, opened, bookClosed, ...props }) => {
  const isMobile = useIsMobile();
  const params = getBookParameters(isMobile);
  
  // Load textures with error handling
  const [textureError, setTextureError] = useState(false);
  
  // Use the standard useTexture hook directly instead of async loading
  const [picture, picture2, pictureRoughness] = useTexture(
    [
      `/textures/${front}.jpg`,
      `/textures/${back}.jpg`,
      ...(number === 0 || number === pages.length - 1
        ? [`/textures/book-cover-roughness.jpg`]
        : []),
    ],
    // Success callback
    (loadedTextures) => {
      // Apply optimizations to all textures
      loadedTextures.forEach(texture => {
        texture.colorSpace = SRGBColorSpace;
        texture.minFilter = LinearFilter;
        texture.magFilter = LinearFilter;
        
        // Lower anisotropy on mobile for performance
        if (texture.anisotropy !== undefined) {
          texture.anisotropy = isMobile ? 4 : 16;
        }
        
        texture.needsUpdate = true;
      });
      setTextureError(false);
    },
    // Error callback
    (error) => {
      console.error("Error loading textures:", error);
      setTextureError(true);
    }
  );
  
  // If textures failed to load, show a simple colored material instead
  if (textureError) {
    console.warn("Using fallback materials due to texture loading error");
  }
  
  const group = useRef();
  const turnedAt = useRef(0);
  const lastOpened = useRef(opened);
  const skinnedMeshRef = useRef();
  
  // Create geometry with appropriate segment count for the device
  const pageGeometry = useMemo(() => 
    createPageGeometry(params.pageSegments), 
  [params.pageSegments]);
  
  const segmentWidth = PAGE_WIDTH / params.pageSegments;

  const manualSkinnedMesh = useMemo(() => {
    // Create bones for the page
    const bones = [];
    for (let i = 0; i <= params.pageSegments; i++) {
      let bone = new Bone();
      bones.push(bone);
      if (i === 0) {
        bone.position.x = 0;
      } else {
        bone.position.x = segmentWidth;
      }
      if (i > 0) {
        bones[i - 1].add(bone); // attach the new bone to the previous bone
      }
    }
    const skeleton = new Skeleton(bones);

    // Create materials with the textures
    const materials = [
      ...pageMaterials,
      new MeshStandardMaterial({
        color: whiteColor,
        map: textureError ? null : picture,
        ...(number === 0
          ? {
              roughnessMap: textureError ? null : pictureRoughness,
              metalness: 0,
              roughness: 0.8
            }
          : {
              roughness: 0.95,
              metalness: 0,
              reflectivity: 0.05
            }),
        emissive: emissiveColor,
        emissiveIntensity: 0,
      }),
      new MeshStandardMaterial({
        color: new Color("#ffffff"),
        map: textureError ? null : picture2,
        ...(number === 0 || number === pages.length - 1
          ? {
              roughnessMap: textureError ? null : pictureRoughness,
              metalness: 0,
              roughness: 1.0,
              envMapIntensity: 0
            }
          : {
              roughness: 1.0,
              metalness: 0,
              reflectivity: 0,
              envMapIntensity: 0
            }),
        // Significantly increase contrast for better text visibility
        emissive: new Color("#ffffff"),
        emissiveIntensity: 0.4, // Higher intensity for better visibility
      }),
    ];
    
    const mesh = new SkinnedMesh(pageGeometry, materials);
    mesh.castShadow = !isMobile; // Disable shadows on mobile for performance
    mesh.receiveShadow = !isMobile;
    mesh.frustumCulled = false;
    mesh.add(skeleton.bones[0]);
    mesh.bind(skeleton);
    return mesh;
  }, [picture, picture2, pictureRoughness, textureError, pageGeometry, params.pageSegments, segmentWidth, isMobile]);

  useFrame((_, delta) => {
    if (!skinnedMeshRef.current) {
      return;
    }

    const emissiveIntensity = highlighted ? 0.05 : 0.0;
    skinnedMeshRef.current.material[4].emissiveIntensity =
      skinnedMeshRef.current.material[5].emissiveIntensity = MathUtils.lerp(
        skinnedMeshRef.current.material[4].emissiveIntensity,
        emissiveIntensity,
        0.1
      );

    if (lastOpened.current !== opened) {
      turnedAt.current = +new Date();
      lastOpened.current = opened;
    }
    
    // Use consistent animation duration for reliable page turning
    const animationDuration = 500; // Same duration regardless of device for consistent animation
    let turningTime = Math.min(animationDuration, new Date() - turnedAt.current) / animationDuration;
    turningTime = Math.sin(turningTime * Math.PI); // Smooth easing curve

    let targetRotation = opened ? -Math.PI / 2 : Math.PI / 2;
    if (!bookClosed) {
      targetRotation += degToRad(number * 0.8);
    }

    const bones = skinnedMeshRef.current.skeleton.bones;
    
    // On mobile, we need to update all bones for proper animation
    // The crooked opening was caused by skipping bones
    const updateStep = 1; // Always update all bones for consistent animation
    
    for (let i = 0; i < bones.length; i += updateStep) {
      const target = i === 0 ? group.current : bones[i];

      // Consistent curve parameters regardless of device
      const insideCurveIntensity = i < 8 ? Math.sin(i * 0.2 + 0.25) : 0;
      const outsideCurveIntensity = i >= 8 ? Math.cos(i * 0.3 + 0.09) : 0;
      const turningIntensity =
        Math.sin(i * Math.PI * (1 / bones.length)) * turningTime;
      
      // Calculate rotation angle with consistent parameters
      let rotationAngle =
        params.insideCurveStrength * insideCurveIntensity * targetRotation -
        params.outsideCurveStrength * outsideCurveIntensity * targetRotation +
        params.turningCurveStrength * turningIntensity * targetRotation;
      
      // Consistent fold angle
      let foldRotationAngle = degToRad(Math.sign(targetRotation) * 2);
      
      if (bookClosed) {
        if (i === 0) {
          rotationAngle = targetRotation;
          foldRotationAngle = 0;
        } else {
          rotationAngle = 0;
          foldRotationAngle = 0;
        }
      }
      
      // Apply rotation with appropriate easing
      easing.dampAngle(
        target.rotation,
        "y",
        rotationAngle,
        params.easingFactor,
        delta
      );

      // Consistent fold intensity calculation
      const foldIntensity =
        i > 8
          ? Math.sin(i * Math.PI * (1 / bones.length) - 0.5) * turningTime
          : 0;
      
      // Apply fold rotation
      easing.dampAngle(
        target.rotation,
        "x",
        foldRotationAngle * foldIntensity,
        params.easingFactorFold,
        delta
      );
    }
  });

  const [_, setPage] = useAtom(pageAtom);
  const [highlighted, setHighlighted] = useState(false);
  useCursor(highlighted);

  // If mesh isn't ready yet, show nothing
  if (!manualSkinnedMesh) {
    return null;
  }

  return (
    <group
      {...props}
      ref={group}
      onPointerEnter={(e) => {
        e.stopPropagation();
        setHighlighted(true);
      }}
      onPointerLeave={(e) => {
        e.stopPropagation();
        setHighlighted(false);
      }}
      onClick={(e) => {
        e.stopPropagation();
        setPage(opened ? number : number + 1);
        setHighlighted(false);
      }}
    >
      <primitive
        object={manualSkinnedMesh}
        ref={skinnedMeshRef}
        position-z={-number * PAGE_DEPTH + page * PAGE_DEPTH}
      />
    </group>
  );
};

export const Book = ({ ...props }) => {
  const [page] = useAtom(pageAtom);
  const [delayedPage, setDelayedPage] = useState(page);
  const isMobile = useIsMobile();

  useEffect(() => {
    let timeout;
    const goToPage = () => {
      setDelayedPage((delayedPage) => {
        if (page === delayedPage) {
          return delayedPage;
        } else {
          // Use consistent timing for page turning regardless of device
          // This ensures the book opens properly on all devices
          const delay = Math.abs(page - delayedPage) > 2 ? 100 : 200;
            
          timeout = setTimeout(() => {
            goToPage();
          }, delay);
          
          if (page > delayedPage) {
            return delayedPage + 1;
          }
          if (page < delayedPage) {
            return delayedPage - 1;
          }
        }
      });
    };
    goToPage();
    return () => {
      clearTimeout(timeout);
    };
  }, [page]);

  return (
    <group {...props} rotation-y={-Math.PI / 2}>
      {/* Only render visible pages on mobile for performance */}
      {[...pages].filter((_, index) => {
        // On mobile, only render current page and adjacent pages
        if (isMobile) {
          return Math.abs(index - delayedPage) <= 1 || 
                 index === 0 || 
                 index === pages.length - 1;
        }
        return true;
      }).map((pageData, index) => (
        <Page
          key={index}
          page={delayedPage}
          number={index}
          opened={delayedPage > index}
          bookClosed={delayedPage === 0 || delayedPage === pages.length}
          {...pageData}
        />
      ))}
    </group>
  );
};

