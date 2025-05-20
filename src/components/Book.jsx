import { useCursor, useTexture } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useAtom } from "jotai";
import { easing } from "maath";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
import { useDevice } from "../context/DeviceContext";

// Use the shared device context
const useIsMobile = () => {
  const { isMobile } = useDevice();
  return isMobile;
};

// Import memory optimization utilities
import { createOptimizedGeometry, createSharedMaterial, registerDisposable } from '../utils/memoryOptimizer';
import { preloadTextures, getTextureFromCache } from '../utils/textureManager';

// Use the same parameters for both mobile and desktop to ensure consistency
const getBookParameters = (isMobile) => {
  return {
    easingFactor: 0.5, // Controls the speed of the easing
    easingFactorFold: 0.3, // Controls the speed of the easing for fold
    insideCurveStrength: 0.18, // Controls the strength of the curve
    outsideCurveStrength: 0.05, // Controls the strength of the curve
    turningCurveStrength: 0.09, // Controls the strength of the curve
    pageSegments: isMobile ? 20 : 30, // Slightly fewer segments on mobile for better performance
  };
};

const PAGE_WIDTH = 1.28;
const PAGE_HEIGHT = 1.71; // 4:3 aspect ratio
const PAGE_DEPTH = 0.003;

// Create page geometry based on device capabilities with caching
const createPageGeometry = (segments) => {
  // Check if we already have this geometry in cache
  const cacheKey = `geometry-${segments}`;
  if (!window._geometryCache) window._geometryCache = new Map();
  if (window._geometryCache.has(cacheKey)) {
    return window._geometryCache.get(cacheKey);
  }
  
  // Create new geometry if not in cache
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
  
  // Pre-allocate arrays for better performance
  const skinIndexes = new Uint16Array(position.count * 4);
  const skinWeights = new Float32Array(position.count * 4);

  for (let i = 0; i < position.count; i++) {
    // ALL VERTICES
    vertex.fromBufferAttribute(position, i); // get the vertex
    const x = vertex.x; // get the x position of the vertex

    const skinIndex = Math.max(0, Math.floor(x / segmentWidth)); // calculate the skin index
    let skinWeight = (x % segmentWidth) / segmentWidth; // calculate the skin weight

    // Set values directly in typed arrays for better performance
    const idx = i * 4;
    skinIndexes[idx] = skinIndex;
    skinIndexes[idx + 1] = skinIndex + 1;
    skinIndexes[idx + 2] = 0;
    skinIndexes[idx + 3] = 0;
    
    skinWeights[idx] = 1 - skinWeight;
    skinWeights[idx + 1] = skinWeight;
    skinWeights[idx + 2] = 0;
    skinWeights[idx + 3] = 0;
  }

  geometry.setAttribute(
    "skinIndex",
    new Uint16BufferAttribute(skinIndexes, 4)
  );
  geometry.setAttribute(
    "skinWeight",
    new Float32BufferAttribute(skinWeights, 4)
  );
  
  // Store in cache for reuse
  window._geometryCache.set(cacheKey, geometry);
  return geometry;
};

// Pre-create shared colors to avoid creating new instances
const whiteColor = new Color("white");
const emissiveColor = new Color("orange");
const blackColor = new Color("#111");

// Create shared materials using our optimized material creator
const pageMaterials = [
  createSharedMaterial('standard', { color: whiteColor }),
  createSharedMaterial('standard', { color: blackColor }),
  createSharedMaterial('standard', { color: whiteColor }),
  createSharedMaterial('standard', { color: whiteColor }),
];

// Preload textures once at component initialization
const textureUrls = [];
pages.forEach((page) => {
  textureUrls.push(`/textures/${page.front}.jpg`);
  textureUrls.push(`/textures/${page.back}.jpg`);
});
textureUrls.push(`/textures/book-cover-roughness.jpg`);

// Batch preload textures for better performance
useTexture.preload(textureUrls);

const Page = ({ number, front, back, page, opened, bookClosed, ...props }) => {
  const isMobile = useIsMobile();
  const params = getBookParameters(isMobile);
  
  // Load textures with error handling
  const [textureError, setTextureError] = useState(false);
  
  // Create a cache key for this page's textures
  const textureKey = `${front}-${back}-${number}`;
  
  // Use the standard useTexture hook with memoized texture paths
  const texturePaths = useMemo(() => [
    `/textures/${front}.jpg`,
    `/textures/${back}.jpg`,
    ...(number === 0 || number === pages.length - 1
      ? [`/textures/book-cover-roughness.jpg`]
      : []),
  ], [front, back, number]);
  
  const [picture, picture2, pictureRoughness] = useTexture(
    texturePaths,
    // Success callback
    (loadedTextures) => {
      // Apply optimizations to all textures
      loadedTextures.forEach(texture => {
        texture.colorSpace = SRGBColorSpace;
        
        // Use standard filtering for compatibility
        texture.minFilter = LinearFilter;
        texture.magFilter = LinearFilter;
        
        // Ensure textures are properly updated
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
  const animationRef = useRef({ 
    emissiveIntensity: 0,
    lastTime: 0
  });
  
  // Create geometry with appropriate segment count for the device
  const pageGeometry = useMemo(() => 
    createPageGeometry(params.pageSegments), 
  [params.pageSegments]);
  
  const segmentWidth = PAGE_WIDTH / params.pageSegments;

  // Create materials with simplified properties for better performance
  const pageFrontMaterial = useMemo(() => {
    const material = new MeshStandardMaterial({
      color: whiteColor,
      map: textureError ? null : picture,
      ...(number === 0
        ? {
            roughnessMap: textureError ? null : pictureRoughness,
          }
        : {
            roughness: 0.1,
          }),
      emissive: emissiveColor,
      emissiveIntensity: 0,
    });
    
    return material;
  }, [picture, pictureRoughness, textureError, number]);
  
  const pageBackMaterial = useMemo(() => {
    const material = new MeshStandardMaterial({
      color: whiteColor,
      map: textureError ? null : picture2,
      ...(number === pages.length - 1
        ? {
            roughnessMap: textureError ? null : pictureRoughness,
          }
        : {
            roughness: 0.1,
          }),
      emissive: emissiveColor,
      emissiveIntensity: 0,
    });
    
    return material;
  }, [picture2, pictureRoughness, textureError, number]);

  const manualSkinnedMesh = useMemo(() => {
    // Create bones for the page - reuse bone objects when possible
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
      pageFrontMaterial,
      pageBackMaterial,
    ];
    
    const mesh = new SkinnedMesh(pageGeometry, materials);
    
    // Use the same settings for both mobile and desktop
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    
    mesh.frustumCulled = false; // Disable frustum culling to ensure visibility
    mesh.add(skeleton.bones[0]);
    mesh.bind(skeleton);
    return mesh;
  }, [pageGeometry, params.pageSegments, segmentWidth, pageFrontMaterial, pageBackMaterial]);

  // Memoize bone calculations for animation with improved curve parameters
  const boneCalculations = useMemo(() => {
    if (!manualSkinnedMesh) return null;
    
    const bones = manualSkinnedMesh.skeleton.bones;
    const calculations = [];
    
    for (let i = 0; i < bones.length; i++) {
      // Enhanced curve parameters for smoother animation
      const insideCurveIntensity = i < 8 ? Math.sin(i * 0.2 + 0.25) : 0;
      const outsideCurveIntensity = i >= 8 ? Math.cos(i * 0.3 + 0.09) : 0;
      const sinValue = Math.sin(i * Math.PI * (1 / bones.length));
      const foldSinValue = i > 8 ? Math.sin(i * Math.PI * (1 / bones.length) - 0.5) : 0;
      
      calculations.push({
        insideCurveIntensity,
        outsideCurveIntensity,
        sinValue,
        foldSinValue,
        target: i === 0 ? group : bones[i],
        index: i
      });
    }
    
    return calculations;
  }, [manualSkinnedMesh]);

  useFrame((_, delta) => {
    if (!skinnedMeshRef.current || !boneCalculations) {
      return;
    }

    // Handle highlighted state with smoother transitions
    const [material4, material5] = [skinnedMeshRef.current.material[4], skinnedMeshRef.current.material[5]];
    const targetEmissive = highlighted ? 0.22 : 0.0;
    
    // Update emissive intensity with smoother lerp
    animationRef.current.emissiveIntensity = MathUtils.lerp(
      animationRef.current.emissiveIntensity,
      targetEmissive,
      0.1
    );
    
    material4.emissiveIntensity = material5.emissiveIntensity = animationRef.current.emissiveIntensity;

    // Handle page turning animation
    if (lastOpened.current !== opened) {
      turnedAt.current = +new Date();
      lastOpened.current = opened;
    }
    
    // Use consistent animation duration for reliable page turning
    const animationDuration = 400; // Slightly faster animation for more responsive feel
    let turningTime = Math.min(animationDuration, new Date() - turnedAt.current) / animationDuration;
    
    // Improved easing curve for smoother animation
    turningTime = Math.sin(turningTime * Math.PI);

    // Target rotation with slight adjustment for better visual effect
    let targetRotation = opened ? -Math.PI / 2 : Math.PI / 2;
    if (!bookClosed) {
      targetRotation += degToRad(number * 0.8);
    }

    // Use pre-calculated bone parameters for better performance
    const bones = skinnedMeshRef.current.skeleton.bones;
    
    // Always update all bones to ensure proper animation
    for (let i = 0; i < bones.length; i++) {
      const calc = boneCalculations[i];
      if (!calc) continue;
      
      const target = i === 0 ? group.current : bones[i];
      if (!target) continue;
      
      // Use pre-calculated values with improved curve parameters
      const turningIntensity = calc.sinValue * turningTime;
      
      // Enhanced rotation angle calculation for smoother curves
      let rotationAngle =
        params.insideCurveStrength * calc.insideCurveIntensity * targetRotation -
        params.outsideCurveStrength * calc.outsideCurveIntensity * targetRotation +
        params.turningCurveStrength * turningIntensity * targetRotation;
      
      // Improved fold angle calculation
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

      // Enhanced fold intensity calculation
      const foldIntensity = calc.foldSinValue * turningTime;
      
      // Apply fold rotation with improved easing
      easing.dampAngle(
        target.rotation,
        "x",
        foldRotationAngle * foldIntensity,
        params.easingFactorFold,
        delta
      )
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
  const timeoutRef = useRef(null);
  
  // Clean up resources when component unmounts
  useEffect(() => {
    return () => {
      // Clear any pending timeouts
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      // Force cleanup of shared resources
      if (window._geometryCache) {
        window._geometryCache.forEach(geometry => {
          geometry.dispose();
        });
        window._geometryCache.clear();
      }
      
      if (window._materialCache) {
        window._materialCache.forEach(material => {
          if (material.map) material.map.dispose();
          if (material.roughnessMap) material.roughnessMap.dispose();
          material.dispose();
        });
        window._materialCache.clear();
      }
    };
  }, []);

  // Memoize the page turning logic with improved timing
  const goToPage = useCallback(() => {
    setDelayedPage((delayedPage) => {
      if (page === delayedPage) {
        return delayedPage;
      } else {
        // Clear any existing timeout to prevent multiple timers
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        
        // Use faster timing for more responsive feel
        const delay = Math.abs(page - delayedPage) > 2 ? 50 : 150;
        
        timeoutRef.current = setTimeout(() => {
          goToPage();
        }, delay);
        
        if (page > delayedPage) {
          return delayedPage + 1;
        }
        if (page < delayedPage) {
          return delayedPage - 1;
        }
        return delayedPage;
      }
    });
  }, [page]);

  // Use effect with proper cleanup
  useEffect(() => {
    let timeout;
    const startPageTurn = () => {
      goToPage();
    };
    
    startPageTurn();
    
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [page, goToPage]);

  // Always render all pages to ensure the book is visible
  const visiblePages = useMemo(() => {
    // Always render all pages to avoid blank display issues
    return [...pages];
  }, []);

  // Memoize the book closed state
  const isBookClosed = useMemo(() => 
    delayedPage === 0 || delayedPage === pages.length,
  [delayedPage]);

  return (
    <group {...props} rotation-y={-Math.PI / 2}>
      {visiblePages.map((pageData, index) => (
        <Page
          key={index}
          page={delayedPage}
          number={index}
          opened={delayedPage > index}
          bookClosed={isBookClosed}
          {...pageData}
        />
      ))}
    </group>
  );
};

