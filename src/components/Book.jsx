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

// Cache for geometries to avoid recreating them
const geometryCache = new Map();

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
    
    // Use debounced resize handler for better performance
    let resizeTimer;
    const handleResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(checkMobile, 100);
    };
    
    window.addEventListener('resize', handleResize);
    return () => {
      clearTimeout(resizeTimer);
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  
  return isMobile;
};

// Adjust parameters based on device - restore original values
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

// Create page geometry based on device capabilities with caching
const createPageGeometry = (segments) => {
  // Check if we already have this geometry in cache
  const cacheKey = `geometry-${segments}`;
  if (geometryCache.has(cacheKey)) {
    return geometryCache.get(cacheKey);
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
  geometryCache.set(cacheKey, geometry);
  return geometry;
};

// Cache for materials to avoid recreating them
const materialCache = new Map();

// Pre-create shared colors to avoid creating new instances
const whiteColor = new Color("#f9f9f9"); // Slightly off-white for better text contrast
const emissiveColor = new Color("#333333");
const blackColor = new Color("#111");

// Create shared materials that don't need to be recreated for each page
const pageMaterials = [
  new MeshStandardMaterial({
    color: whiteColor,
    roughness: 0.95,
    metalness: 0,
  }),
  new MeshStandardMaterial({
    color: blackColor,
    roughness: 1.0,
    metalness: 0,
  }),
  new MeshStandardMaterial({
    color: whiteColor,
    roughness: 0.95,
    metalness: 0,
  }),
  new MeshStandardMaterial({
    color: whiteColor,
    roughness: 0.95,
    metalness: 0,
  }),
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
        texture.minFilter = LinearFilter;
        texture.magFilter = LinearFilter;
        
        // Lower anisotropy on mobile for performance
        if (texture.anisotropy !== undefined) {
          texture.anisotropy = isMobile ? 4 : 8; // Reduced max anisotropy for better performance
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
  const animationRef = useRef({ 
    emissiveIntensity: 0,
    lastTime: 0
  });
  
  // Create geometry with appropriate segment count for the device
  const pageGeometry = useMemo(() => 
    createPageGeometry(params.pageSegments), 
  [params.pageSegments]);
  
  const segmentWidth = PAGE_WIDTH / params.pageSegments;

  // Create materials with memoization to avoid unnecessary recreations
  const pageFrontMaterial = useMemo(() => {
    const materialKey = `front-${number}-${textureError}`;
    if (materialCache.has(materialKey)) {
      return materialCache.get(materialKey);
    }
    
    const material = new MeshStandardMaterial({
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
    });
    
    materialCache.set(materialKey, material);
    return material;
  }, [picture, pictureRoughness, textureError, number]);
  
  const pageBackMaterial = useMemo(() => {
    const materialKey = `back-${number}-${textureError}`;
    if (materialCache.has(materialKey)) {
      return materialCache.get(materialKey);
    }
    
    const material = new MeshStandardMaterial({
      color: whiteColor,
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
    });
    
    materialCache.set(materialKey, material);
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
    mesh.castShadow = !isMobile; // Disable shadows on mobile for performance
    mesh.receiveShadow = !isMobile;
    mesh.frustumCulled = true; // Enable frustum culling for better performance
    mesh.add(skeleton.bones[0]);
    mesh.bind(skeleton);
    return mesh;
  }, [pageGeometry, params.pageSegments, segmentWidth, isMobile, pageFrontMaterial, pageBackMaterial]);

  // Memoize bone calculations for animation - restore original calculations
  const boneCalculations = useMemo(() => {
    if (!manualSkinnedMesh) return null;
    
    const bones = manualSkinnedMesh.skeleton.bones;
    const calculations = [];
    
    for (let i = 0; i < bones.length; i++) {
      // Original curve parameters for consistent animation
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
        // Keep index for debugging if needed
        index: i
      });
    }
    
    return calculations;
  }, [manualSkinnedMesh]);

  useFrame((_, delta) => {
    if (!skinnedMeshRef.current || !boneCalculations) {
      return;
    }

    // Handle highlighted state with throttled updates
    const [material4, material5] = [skinnedMeshRef.current.material[4], skinnedMeshRef.current.material[5]];
    const targetEmissive = highlighted ? 0.05 : 0.0;
    
    // Only update emissive intensity if it's significantly different
    if (Math.abs(animationRef.current.emissiveIntensity - targetEmissive) > 0.001) {
      animationRef.current.emissiveIntensity = MathUtils.lerp(
        animationRef.current.emissiveIntensity,
        targetEmissive,
        0.1
      );
      
      material4.emissiveIntensity = material5.emissiveIntensity = animationRef.current.emissiveIntensity;
    }

    // Handle page turning animation
    if (lastOpened.current !== opened) {
      turnedAt.current = performance.now();
      lastOpened.current = opened;
    }
    
    // Use consistent animation duration for reliable page turning
    const animationDuration = 500; // Original animation duration
    const currentTime = performance.now();
    let turningTime = Math.min(animationDuration, currentTime - turnedAt.current) / animationDuration;
    
    // Original easing curve
    turningTime = Math.sin(turningTime * Math.PI); // Smooth easing curve

    // Original target rotation
    let targetRotation = opened ? -Math.PI / 2 : Math.PI / 2;
    if (!bookClosed) {
      targetRotation += degToRad(number * 0.8);
    }

    // Use pre-calculated bone parameters for better performance
    const bones = skinnedMeshRef.current.skeleton.bones;
    
    // Original update step - always update all bones for consistent animation
    const updateStep = 1;
    
    for (let i = 0; i < bones.length; i += updateStep) {
      const calc = boneCalculations[i];
      if (!calc) continue;
      
      const target = i === 0 ? group.current : bones[i];
      if (!target) continue;
      
      // Use pre-calculated values for better performance
      const turningIntensity = calc.sinValue * turningTime;
      
      // Original rotation angle calculation
      let rotationAngle =
        params.insideCurveStrength * calc.insideCurveIntensity * targetRotation -
        params.outsideCurveStrength * calc.outsideCurveIntensity * targetRotation +
        params.turningCurveStrength * turningIntensity * targetRotation;
      
      // Original fold angle calculation
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

      // Original fold intensity calculation
      const foldIntensity = calc.foldSinValue * turningTime;
      
      // Apply fold rotation
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

  // Calculate a stable z-position to prevent z-fighting
  const zPosition = useMemo(() => {
    // Base position based on page order
    const basePosition = -number * PAGE_DEPTH + page * PAGE_DEPTH;
    
    // Add a small offset based on the page number to ensure consistent stacking
    // This helps prevent z-fighting and rendering issues
    const stableOffset = number * 0.00001;
    
    return basePosition + stableOffset;
  }, [number, page]);

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
        position-z={zPosition}
        // Enable frustum culling but with a larger bounding box to prevent disappearing
        frustumCulled={true}
      />
    </group>
  );
};

export const Book = ({ ...props }) => {
  const [page] = useAtom(pageAtom);
  const [delayedPage, setDelayedPage] = useState(page);
  const isMobile = useIsMobile();
  const timeoutRef = useRef(null);
  const renderCountRef = useRef(0);

  // Increment render count for debugging and optimization
  renderCountRef.current++;

  // Memoize the page turning logic to avoid recreating functions
  const goToPage = useCallback(() => {
    setDelayedPage((delayedPage) => {
      if (page === delayedPage) {
        return delayedPage;
      } else {
        // Use consistent timing for page turning regardless of device
        // This ensures the book opens properly on all devices
        const delay = Math.abs(page - delayedPage) > 2 ? 100 : 200;
          
        // Clear any existing timeout to prevent multiple timers
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        
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
    goToPage();
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [page, goToPage]);

  // Memoize the filtered pages to avoid recalculating on every render
  const visiblePages = useMemo(() => {
    // On mobile, ensure we always render at least the cover, current page, and back
    // This prevents rendering issues when pages are missing
    const pagesToRender = [...pages].filter((_, index) => {
      if (isMobile) {
        // Always include cover, current page, adjacent pages, and back cover
        return Math.abs(index - delayedPage) <= 1 || 
               index === 0 || 
               index === pages.length - 1;
      }
      return true;
    });
    
    // Ensure we have at least the essential pages
    if (pagesToRender.length < 2) {
      console.warn("Not enough pages to render, forcing essential pages");
      return pages;
    }
    
    return pagesToRender;
  }, [delayedPage, isMobile]);

  // Memoize the book closed state to avoid recalculating
  const isBookClosed = useMemo(() => 
    delayedPage === 0 || delayedPage === pages.length,
  [delayedPage]);

  // Force a consistent z-index for pages to prevent z-fighting
  const pageZOffset = 0.0001;

  return (
    <group {...props} rotation-y={-Math.PI / 2}>
      {visiblePages.map((pageData, index) => {
        // Calculate a stable z-position to prevent z-fighting
        const zPosition = -index * pageZOffset;
        
        return (
          <Page
            key={index}
            page={delayedPage}
            number={index}
            opened={delayedPage > index}
            bookClosed={isBookClosed}
            position-z={zPosition}
            {...pageData}
          />
        );
      })}
    </group>
  );
};

