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
  ClampToEdgeWrapping,
  RGBFormat
} from "three";
import * as THREE from "three";
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

// Book parameters - balanced for performance and stability
const BOOK_PARAMS = {
  mobile: {
    easingFactor: 0.6,         // Balanced response
    easingFactorFold: 0.4,     // Balanced fold animation
    insideCurveStrength: 0.16, // Balanced curve strength
    outsideCurveStrength: 0.045, // Balanced curve strength
    turningCurveStrength: 0.085, // Balanced curve strength
    pageSegments: 18,          // Balanced segment count
  },
  desktop: {
    easingFactor: 0.55,        // Balanced response
    easingFactorFold: 0.35,    // Balanced fold animation
    insideCurveStrength: 0.18,
    outsideCurveStrength: 0.05,
    turningCurveStrength: 0.09,
    pageSegments: 26,          // Balanced segment count
  }
};

// Get parameters based on device type
const getBookParameters = (isMobile) => isMobile ? BOOK_PARAMS.mobile : BOOK_PARAMS.desktop;

// Page dimensions - constants for better performance
const PAGE_WIDTH = 1.28;
const PAGE_HEIGHT = 1.71; // 4:3 aspect ratio
const PAGE_DEPTH = 0.003;

// Shared geometry cache - moved to module scope for better memory management
const geometryCache = new Map();

// Create optimized page geometry with instancing support
const createPageGeometry = (segments) => {
  // Check if we already have this geometry in cache
  const cacheKey = `geometry-${segments}`;
  if (geometryCache.has(cacheKey)) {
    return geometryCache.get(cacheKey);
  }

  // Create new geometry with optimized settings
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

  // Pre-allocate typed arrays for better performance
  const skinIndexes = new Uint16Array(position.count * 4);
  const skinWeights = new Float32Array(position.count * 4);

  // Optimize the loop for better performance
  for (let i = 0; i < position.count; i++) {
    vertex.fromBufferAttribute(position, i);
    const x = vertex.x;

    const skinIndex = Math.max(0, Math.floor(x / segmentWidth));
    const skinWeight = (x % segmentWidth) / segmentWidth;

    // Direct array access is faster than repeated method calls
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

  // Use optimized buffer attributes
  geometry.setAttribute("skinIndex", new Uint16BufferAttribute(skinIndexes, 4));
  geometry.setAttribute("skinWeight", new Float32BufferAttribute(skinWeights, 4));

  // Register for proper disposal and store in cache
  registerDisposable(geometry);
  geometryCache.set(cacheKey, geometry);
  return geometry;
};

// Pre-create shared colors as constants
const whiteColor = new Color("white");
const emissiveColor = new Color("orange");
const blackColor = new Color("#111");

// Create shared materials with optimized settings
const pageMaterials = [
  createSharedMaterial('standard', { color: whiteColor, roughness: 0.5 }),
  createSharedMaterial('standard', { color: blackColor, roughness: 0.5 }),
  createSharedMaterial('standard', { color: whiteColor, roughness: 0.5 }),
  createSharedMaterial('standard', { color: whiteColor, roughness: 0.5 }),
];

// Simplified texture preloading to fix black textures
const allTextures = [];

// Collect all texture paths
pages.forEach((page) => {
  allTextures.push(`/textures/${page.front}.jpg`);
  allTextures.push(`/textures/${page.back}.jpg`);
});

// Add roughness map
allTextures.push(`/textures/book-cover-roughness.jpg`);

// Preload all textures at once
useTexture.preload(allTextures);

// Optimized Page component with better performance
const Page = ({ number, front, back, page, opened, bookClosed, ...props }) => {
  const isMobile = useIsMobile();
  const params = getBookParameters(isMobile);

  // Refs for performance optimization
  const group = useRef();
  const turnedAt = useRef(0);
  const lastOpened = useRef(opened);
  const skinnedMeshRef = useRef();
  const animationRef = useRef({
    emissiveIntensity: 0,
    lastTime: 0,
    turningTime: 0
  });

  // State management
  const [highlighted, setHighlighted] = useState(false);
  const [_, setPage] = useAtom(pageAtom);
  const [textureError, setTextureError] = useState(false);

  // Optimize texture loading with memoization
  const texturePaths = useMemo(() => [
    `/textures/${front}.jpg`,
    `/textures/${back}.jpg`,
    ...(number === 0 || number === pages.length - 1
      ? [`/textures/book-cover-roughness.jpg`]
      : []),
  ], [front, back, number]);

  // Simplified texture loading to fix black textures
  const [picture, picture2, pictureRoughness] = useTexture(
    texturePaths,
    (loadedTextures) => {
      loadedTextures.forEach(texture => {
        // Basic texture settings that work on all devices
        texture.colorSpace = SRGBColorSpace;
        texture.minFilter = LinearFilter;
        texture.magFilter = LinearFilter;
        texture.generateMipmaps = false;

        // Force texture update
        texture.needsUpdate = true;
      });
      setTextureError(false);
    },
    (error) => {
      console.error("Error loading textures:", error);
      setTextureError(true);
    }
  );

  // Create optimized geometry with proper caching
  const pageGeometry = useMemo(() =>
    createPageGeometry(params.pageSegments),
  [params.pageSegments]);

  const segmentWidth = useMemo(() =>
    PAGE_WIDTH / params.pageSegments,
  [params.pageSegments]);

  // Simplified material creation to fix black textures
  const pageFrontMaterial = useMemo(() => {
    // Basic material properties that work on all devices
    const materialProps = {
      color: whiteColor,
      map: textureError ? null : picture,
      emissive: emissiveColor,
      emissiveIntensity: 0,
      roughness: 0.5,
    };

    // Only add roughness map for cover
    if (number === 0 && !textureError && pictureRoughness) {
      materialProps.roughnessMap = pictureRoughness;
    }

    // Create basic material that works on all devices
    const material = new MeshStandardMaterial(materialProps);

    // Register for proper disposal
    registerDisposable(material);
    return material;
  }, [picture, pictureRoughness, textureError, number]);

  const pageBackMaterial = useMemo(() => {
    // Basic material properties that work on all devices
    const materialProps = {
      color: whiteColor,
      map: textureError ? null : picture2,
      emissive: emissiveColor,
      emissiveIntensity: 0,
      roughness: 0.5,
    };

    // Only add roughness map for back cover
    if (number === pages.length - 1 && !textureError && pictureRoughness) {
      materialProps.roughnessMap = pictureRoughness;
    }

    // Create basic material that works on all devices
    const material = new MeshStandardMaterial(materialProps);

    // Register for proper disposal
    registerDisposable(material);
    return material;
  }, [picture2, pictureRoughness, textureError, number]);

  // Create optimized skinned mesh with bone structure
  const manualSkinnedMesh = useMemo(() => {
    // Create bones with optimized structure
    const bones = [];
    for (let i = 0; i <= params.pageSegments; i++) {
      const bone = new Bone();
      bones.push(bone);

      // Set bone position
      bone.position.x = i === 0 ? 0 : segmentWidth;

      // Connect bones in a chain
      if (i > 0) {
        bones[i - 1].add(bone);
      }
    }

    // Create skeleton once
    const skeleton = new Skeleton(bones);

    // Use shared materials where possible
    const materials = [
      ...pageMaterials,
      pageFrontMaterial,
      pageBackMaterial,
    ];

    // Create simplified mesh that works on all devices
    const mesh = new SkinnedMesh(pageGeometry, materials);

    // Basic settings that work on all devices
    mesh.castShadow = false;
    mesh.receiveShadow = false;
    mesh.frustumCulled = false;
    mesh.matrixAutoUpdate = true; // Enable automatic matrix updates for compatibility

    // Connect skeleton
    mesh.add(skeleton.bones[0]);
    mesh.bind(skeleton);

    // Register for proper disposal
    registerDisposable(mesh);
    return mesh;
  }, [pageGeometry, params.pageSegments, segmentWidth, pageFrontMaterial, pageBackMaterial]);

  // Pre-calculate bone animation parameters for better performance
  const boneCalculations = useMemo(() => {
    if (!manualSkinnedMesh) return null;

    const bones = manualSkinnedMesh.skeleton.bones;
    const calculations = [];

    // Pre-calculate all animation parameters
    for (let i = 0; i < bones.length; i++) {
      const boneIndex = i / bones.length;

      // Optimized curve calculations
      const insideCurveIntensity = i < 8 ? Math.sin(i * 0.2 + 0.25) : 0;
      const outsideCurveIntensity = i >= 8 ? Math.cos(i * 0.3 + 0.09) : 0;
      const sinValue = Math.sin(i * Math.PI * boneIndex);
      const foldSinValue = i > 8 ? Math.sin(i * Math.PI * boneIndex - 0.5) : 0;

      calculations.push({
        insideCurveIntensity,
        outsideCurveIntensity,
        sinValue,
        foldSinValue,
        index: i
      });
    }

    return calculations;
  }, [manualSkinnedMesh]);

  // Balanced animation frame handler for performance and stability
  useFrame((_, delta) => {
    if (!skinnedMeshRef.current || !boneCalculations || !group.current) {
      return;
    }

    // Moderate frame skipping for better performance without visual issues
    const now = performance.now();
    const frameSkip = isMobile ? 1 : 0; // Less aggressive frame skipping

    if (frameSkip > 0 && animationRef.current.lastTime &&
        now - animationRef.current.lastTime < 16.7 * frameSkip) {
      return;
    }
    animationRef.current.lastTime = now;

    // Handle highlighted state
    if (skinnedMeshRef.current.material[4] && skinnedMeshRef.current.material[5]) {
      const [material4, material5] = [skinnedMeshRef.current.material[4], skinnedMeshRef.current.material[5]];
      const targetEmissive = highlighted ? 0.22 : 0.0;

      // Balanced lerp speed
      animationRef.current.emissiveIntensity = MathUtils.lerp(
        animationRef.current.emissiveIntensity,
        targetEmissive,
        0.15 // Moderate transition speed
      );

      // Apply emissive intensity
      material4.emissiveIntensity = material5.emissiveIntensity = animationRef.current.emissiveIntensity;
    }

    // Handle page turning animation
    if (lastOpened.current !== opened) {
      turnedAt.current = now;
      lastOpened.current = opened;
    }

    // Calculate turning time with balanced animation speed
    const animationDuration = 350; // Balanced animation speed
    const elapsedTime = Math.min(animationDuration, now - turnedAt.current);
    let turningTime = elapsedTime / animationDuration;

    // Apply smooth easing curve
    turningTime = Math.sin(turningTime * Math.PI);
    animationRef.current.turningTime = turningTime;

    // Calculate target rotation
    let targetRotation = opened ? -Math.PI / 2 : Math.PI / 2;
    if (!bookClosed) {
      targetRotation += degToRad(number * 0.8);
    }

    // Get bones for animation
    const bones = skinnedMeshRef.current.skeleton.bones;

    // Always update all bones to ensure proper visual appearance
    for (let i = 0; i < bones.length; i++) {
      const calc = boneCalculations[i];
      if (!calc) continue;

      const target = i === 0 ? group.current : bones[i];
      if (!target) continue;

      // Calculate rotation with balanced approach
      let rotationAngle = 0;

      if (bookClosed && i === 0) {
        // Special case for first bone when book is closed
        rotationAngle = targetRotation;
      } else if (!bookClosed) {
        // Full calculation for proper visual appearance
        rotationAngle =
          params.insideCurveStrength * calc.insideCurveIntensity * targetRotation -
          params.outsideCurveStrength * calc.outsideCurveIntensity * targetRotation +
          params.turningCurveStrength * calc.sinValue * turningTime * targetRotation;
      }

      // Apply y-rotation with balanced damping
      easing.dampAngle(
        target.rotation,
        "y",
        rotationAngle,
        params.easingFactor * 1.2, // Slightly faster damping
        delta
      );

      // Calculate fold rotation for all relevant bones
      if (!bookClosed && i > 8) {
        // Calculate fold parameters
        const foldRotationAngle = degToRad(Math.sign(targetRotation) * 2);
        const foldIntensity = calc.foldSinValue * turningTime;

        // Apply x-rotation for fold effect
        easing.dampAngle(
          target.rotation,
          "x",
          foldRotationAngle * foldIntensity,
          params.easingFactorFold * 1.2, // Slightly faster damping
          delta
        );
      } else if (target.rotation.x !== 0) {
        // Smooth transition to zero for non-folding bones
        easing.dampAngle(
          target.rotation,
          "x",
          0,
          params.easingFactorFold,
          delta
        );
      }
    }
  });

  // Enable cursor change on hover
  useCursor(highlighted);

  // Return null if mesh isn't ready
  if (!manualSkinnedMesh) {
    return null;
  }

  // Improved click handler with safety checks
  const clickTimeRef = useRef(0);
  const handleClick = useCallback((e) => {
    e.stopPropagation();

    // Prevent click spamming with a moderate debounce
    const now = performance.now();
    if (now - clickTimeRef.current < 400) {
      return; // Ignore clicks that are too close together
    }

    clickTimeRef.current = now;

    // Immediate visual feedback
    setHighlighted(false);

    // Calculate the target page with bounds checking
    const targetPage = opened ? number : number + 1;

    // Safety check to prevent invalid page numbers
    if (targetPage >= 0 && targetPage <= pages.length) {
      // Use setTimeout instead of requestAnimationFrame for more reliable execution
      setTimeout(() => {
        setPage(targetPage);
      }, 0);
    }
  }, [opened, number, setPage]);

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
      onClick={handleClick}
    >
      <primitive
        object={manualSkinnedMesh}
        ref={skinnedMeshRef}
        position-z={-number * PAGE_DEPTH + page * PAGE_DEPTH}
      />
    </group>
  );
};

// Optimized Book component with better performance and memory management
export const Book = ({ ...props }) => {
  // State management
  const [page] = useAtom(pageAtom);
  const [delayedPage, setDelayedPage] = useState(page);
  const isMobile = useIsMobile();

  // Refs for performance optimization
  const timeoutRef = useRef(null);
  const animationFrameRef = useRef(null);

  // Clean up resources when component unmounts
  useEffect(() => {
    return () => {
      // Cancel any pending animations
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }

      // Clear any pending timeouts
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Clean up geometry cache
      if (geometryCache) {
        geometryCache.forEach(geometry => {
          geometry.dispose();
        });
        geometryCache.clear();
      }

      // Clean up material cache
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

  // Balanced page turning logic for performance and stability
  const goToPage = useCallback(() => {
    // Use state updater pattern for reliability
    setDelayedPage(prevPage => {
      // If already at target page, do nothing
      if (page === prevPage) {
        return prevPage;
      }

      // Clear any existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Calculate page distance
      const pageDistance = Math.abs(page - prevPage);

      // For large jumps, move at most 2 pages at once
      // This prevents skipping too many pages which can cause visual issues
      if (pageDistance > 2) {
        const jumpSize = 2; // Fixed jump size for stability
        const newPage = page > prevPage
          ? Math.min(prevPage + jumpSize, page)
          : Math.max(prevPage - jumpSize, page);

        // Moderate delay for stability
        timeoutRef.current = setTimeout(() => goToPage(), 50);
        return newPage;
      }

      // For smaller jumps, move one page at a time
      const delay = 80; // Balanced animation speed

      // Schedule next update
      timeoutRef.current = setTimeout(() => goToPage(), delay);

      // Move one page at a time in the right direction
      if (page > prevPage) {
        return prevPage + 1;
      }
      if (page < prevPage) {
        return prevPage - 1;
      }
      return prevPage;
    });
  }, [page]);

  // Trigger page turning animation when page changes
  useEffect(() => {
    goToPage();

    // Clean up on unmount or page change
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [page, goToPage]);

  // Optimized page rendering with proper visibility
  const visiblePages = useMemo(() => {
    // Always render all pages to prevent black screen issues
    // This is safer and ensures the book is always visible
    return pages.map((page, index) => ({
      ...page,
      _index: index // Store original index for reference
    }));
  }, []);

  // Optimize book closed state calculation
  const isBookClosed = useMemo(() =>
    delayedPage === 0 || delayedPage === pages.length,
  [delayedPage]);

  return (
    <group {...props} rotation-y={-Math.PI / 2}>
      {visiblePages.map((pageData) => {
        // Use the stored original index
        const pageNumber = pageData._index;

        return (
          <Page
            key={pageNumber}
            page={delayedPage}
            number={pageNumber}
            opened={delayedPage > pageNumber}
            bookClosed={isBookClosed}
            front={pageData.front}
            back={pageData.back}
          />
        );
      })}
    </group>
  );
};

