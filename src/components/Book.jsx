import { useCursor, useTexture } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useAtom } from "jotai";
import { easing } from "maath";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
import * as THREE from "three";
import { degToRad } from "three/src/math/MathUtils.js";
import { pageAtom, pages } from "./UI";
import { useDevice } from "../context/DeviceContext";

// Mobile detection hook with debouncing for better performance
const useIsMobileOptimized = () => {
  const { isMobile } = useDevice();
  const [optimizedIsMobile, setOptimizedIsMobile] = useState(isMobile);
  
  useEffect(() => {
    let timeoutId;
    
    const updateMobile = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        setOptimizedIsMobile(isMobile);
      }, 100); // Debounce for 100ms
    };
    
    updateMobile();
    
    return () => {
      clearTimeout(timeoutId);
    };
  }, [isMobile]);
  
  return optimizedIsMobile;
};

const useIsMobile = () => {
  return useIsMobileOptimized();
};

// Balanced book parameters for optimal performance and stability
const BOOK_PARAMS = {
  mobile: {
    easingFactor: 0.12,
    easingFactorFold: 0.08,
    insideCurveStrength: 0.12, // Reduced for better performance
    outsideCurveStrength: 0.03, // Reduced for better performance
    turningCurveStrength: 0.06, // Reduced for better performance
    pageSegments: 6, // Reduced from 8 for better performance
    frameSkip: 2, // Increased frame skipping for mobile
    animationDuration: 450, // Slightly slower for smoother appearance
  },
  desktop: {
    easingFactor: 0.15,
    easingFactorFold: 0.1,
    insideCurveStrength: 0.16,
    outsideCurveStrength: 0.045,
    turningCurveStrength: 0.08,
    pageSegments: 12,
    frameSkip: 0,
    animationDuration: 350,
  }
};

const getBookParameters = (isMobile) => isMobile ? BOOK_PARAMS.mobile : BOOK_PARAMS.desktop;

// Page dimensions
const PAGE_WIDTH = 1.28;
const PAGE_HEIGHT = 1.71;
const PAGE_DEPTH = 0.003;

// Enhanced Resource Manager with better caching and cleanup
class ResourceManager {
  constructor() {
    this.geometries = new Map();
    this.materials = new Map();
    this.sharedColors = {
      white: new Color("white"),
      black: new Color("#111"),
      orange: new Color("orange")
    };
    this.animationData = new Map();
    this.isDisposed = false;
  }

  getGeometry(segments) {
    const key = `geometry_${segments}`;
    if (this.geometries.has(key)) {
      return this.geometries.get(key);
    }

    const geometry = new BoxGeometry(PAGE_WIDTH, PAGE_HEIGHT, PAGE_DEPTH, segments, 2);
    geometry.translate(PAGE_WIDTH / 2, 0, 0);

    const segmentWidth = PAGE_WIDTH / segments;
    const position = geometry.attributes.position;
    const vertex = new Vector3();

    const skinIndexes = new Uint16Array(position.count * 4);
    const skinWeights = new Float32Array(position.count * 4);

    for (let i = 0; i < position.count; i++) {
      vertex.fromBufferAttribute(position, i);
      const x = vertex.x;
      const skinIndex = Math.max(0, Math.min(segments - 1, Math.floor(x / segmentWidth)));
      const skinWeight = Math.max(0, Math.min(1, (x % segmentWidth) / segmentWidth));

      const idx = i * 4;
      skinIndexes[idx] = skinIndex;
      skinIndexes[idx + 1] = Math.min(skinIndex + 1, segments);
      skinWeights[idx] = 1 - skinWeight;
      skinWeights[idx + 1] = skinWeight;
      skinIndexes[idx + 2] = 0;
      skinIndexes[idx + 3] = 0;
      skinWeights[idx + 2] = 0;
      skinWeights[idx + 3] = 0;
    }

    geometry.setAttribute("skinIndex", new Uint16BufferAttribute(skinIndexes, 4));
    geometry.setAttribute("skinWeight", new Float32BufferAttribute(skinWeights, 4));

    this.geometries.set(key, geometry);
    return geometry;
  }

  getAnimationData(segments) {
    if (this.animationData.has(segments)) {
      return this.animationData.get(segments);
    }

    const data = [];
    const halfSegments = segments * 0.5;

    for (let i = 0; i <= segments; i++) {
      const boneIndex = i / segments;

      data.push({
        insideCurveIntensity: i < halfSegments ? Math.sin(i * 0.2 + 0.25) : 0,
        outsideCurveIntensity: i >= halfSegments ? Math.cos(i * 0.3 + 0.09) : 0,
        sinValue: Math.sin(i * Math.PI * boneIndex),
        foldSinValue: i > segments * 0.6 ? Math.sin(i * Math.PI * boneIndex - 0.5) : 0,
      });
    }

    this.animationData.set(segments, data);
    return data;
  }

  dispose() {
    if (this.isDisposed) return;

    this.geometries.forEach(geometry => {
      if (geometry && geometry.dispose) geometry.dispose();
    });

    this.materials.forEach(materialSet => {
      if (Array.isArray(materialSet)) {
        materialSet.forEach(material => {
          if (material && material.dispose) material.dispose();
        });
      }
    });

    this.geometries.clear();
    this.materials.clear();
    this.animationData.clear();
    this.isDisposed = true;
  }
}

// Global resource manager
let resourceManager = new ResourceManager();

const Page = React.memo(({ number, front, back, page, opened, bookClosed, visible = true, ...props }) => {
  const isMobile = useIsMobile();
  const params = getBookParameters(isMobile);

  const group = useRef();
  const turnedAt = useRef(0);
  const lastOpened = useRef(opened);
  const skinnedMeshRef = useRef();
  const clickTimeRef = useRef(0);

  const animationState = useRef({
    emissiveIntensity: 0,
    frameCount: 0,
    isAnimating: false,
    lastTime: 0,
  });

  const [highlighted, setHighlighted] = useState(false);
  const [_, setPage] = useAtom(pageAtom);

  // Load textures using useTexture hook properly
  const textures = useMemo(() => {
    const textureList = [];
    if (front) textureList.push(`/textures/${front}.jpg`);
    if (back) textureList.push(`/textures/${back}.jpg`);
    return textureList;
  }, [front, back]);
  // Load textures with proper error handling and mobile optimization
  const loadedTextures = useTexture(textures, (textures) => {
    // Configure each texture properly with mobile optimization
    textures.forEach(texture => {
      texture.colorSpace = SRGBColorSpace;
      texture.minFilter = LinearFilter;
      texture.magFilter = LinearFilter;
      texture.generateMipmaps = !isMobile; // Disable mipmaps on mobile for memory optimization
      texture.flipY = true;
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.RepeatWrapping;
      texture.repeat.set(1, 1);
      texture.needsUpdate = true;
    });
  });

  // Ensure loadedTextures is always an array
  const textureArray = Array.isArray(loadedTextures) ? loadedTextures : [loadedTextures];
  const frontTexture = front ? textureArray[0] : null;
  const backTexture = back ? textureArray[front ? 1 : 0] : null;
  // Create materials with proper texture assignment and mobile optimization
  const materials = useMemo(() => {
    const baseMaterial = new MeshStandardMaterial({
      color: 0xffffff,
      roughness: isMobile ? 0.9 : 0.8, // Higher roughness on mobile for better performance
      metalness: isMobile ? 0 : 0.1, // Disable metalness on mobile
    });

    return [
      baseMaterial.clone(), // +X (right edge)
      new MeshStandardMaterial({
        color: 0x222222,
        roughness: 0.9,
        metalness: 0
      }), // -X (left edge/spine)
      baseMaterial.clone(), // +Y (top edge)
      baseMaterial.clone(), // -Y (bottom edge)
      // Front face
      new MeshStandardMaterial({
        map: frontTexture,
        color: 0xffffff,
        emissive: 0x000000,
        emissiveIntensity: 0,
        roughness: isMobile ? 0.9 : 0.8,
        metalness: isMobile ? 0 : 0.1,
        transparent: false,
        opacity: 1,
      }),
      // Back face
      new MeshStandardMaterial({
        map: backTexture,
        color: 0xffffff,
        emissive: 0x000000,
        emissiveIntensity: 0,
        roughness: isMobile ? 0.9 : 0.8,
        metalness: isMobile ? 0 : 0.1,
        transparent: false,
        opacity: 1,
      })
    ];
  }, [frontTexture, backTexture, isMobile]);
  // Create the skinned mesh with mobile optimization
  const skinnedMesh = useMemo(() => {
    try {
      const geometry = resourceManager.getGeometry(params.pageSegments);
      const mesh = new SkinnedMesh(geometry, materials);

      // Optimize for mobile
      mesh.castShadow = !isMobile; // Disable shadows on mobile
      mesh.receiveShadow = !isMobile; // Disable shadows on mobile
      mesh.frustumCulled = true; // Enable frustum culling for better performance

      // Create bones and skeleton
      const bones = [];
      const segmentWidth = PAGE_WIDTH / params.pageSegments;

      for (let i = 0; i <= params.pageSegments; i++) {
        const bone = new Bone();
        bones.push(bone);
        bone.position.x = i === 0 ? 0 : segmentWidth;
        if (i > 0) {
          bones[i - 1].add(bone);
        }
      }

      const skeleton = new Skeleton(bones);
      mesh.add(skeleton.bones[0]);
      mesh.bind(skeleton);      return mesh;
    } catch (error) {
      console.warn("Failed to create skinned mesh:", error);
      return null;
    }
  }, [params.pageSegments, materials, isMobile]);

  // Get animation data
  const animationData = useMemo(() =>
    resourceManager.getAnimationData(params.pageSegments),
  [params.pageSegments]);

  // Optimized frame loop
  useFrame((state, delta) => {
    if (!skinnedMeshRef.current || !group.current || !visible || !animationData.length) {
      return;
    }

    const animation = animationState.current;
    const now = state.clock.elapsedTime * 1000;

    // Frame skipping for mobile performance
    animation.frameCount++;
    if (params.frameSkip > 0 && animation.frameCount % (params.frameSkip + 1) !== 0) {
      return;
    }

    // Handle emissive intensity
    if (skinnedMeshRef.current.material && Array.isArray(skinnedMeshRef.current.material)) {
      const targetEmissive = highlighted ? 0.1 : 0.0;

      animation.emissiveIntensity = MathUtils.lerp(
        animation.emissiveIntensity,
        targetEmissive,
        0.12
      );

      const materials = skinnedMeshRef.current.material;
      if (materials[4]) materials[4].emissiveIntensity = animation.emissiveIntensity;
      if (materials[5]) materials[5].emissiveIntensity = animation.emissiveIntensity;
    }

    // Handle page turning animation
    if (lastOpened.current !== opened) {
      turnedAt.current = now;
      lastOpened.current = opened;
      animation.isAnimating = true;
    }

    const timeSinceTurn = Math.min(params.animationDuration, now - turnedAt.current);
    const turningProgress = Math.sin((timeSinceTurn / params.animationDuration) * Math.PI);

    if (timeSinceTurn >= params.animationDuration) {
      animation.isAnimating = false;
    }

    // Different angles for closed vs open book states
    let targetRotation;
    if (bookClosed) {
      // When book is closed, keep at 90 degrees for resting position
      targetRotation = opened ? -Math.PI / 2 : Math.PI / 2;
    } else {
      // When book is open, use different angles for mobile vs desktop
      if (isMobile) {
        // Mobile: 240 degrees for maximum wide opening
        targetRotation = opened ? -Math.PI * 1.333 : Math.PI * 1.333;
      } else {
        // Desktop: 120 degrees
        targetRotation = opened ? -Math.PI / 1.5 : Math.PI / 1.5;
      }
      targetRotation += degToRad(number * 0.5);
    }

    const bones = skinnedMeshRef.current.skeleton.bones;

    // Animate bones
    for (let i = 0; i < Math.min(bones.length, animationData.length); i++) {
      const bone = i === 0 ? group.current : bones[i];
      if (!bone) continue;

      const calc = animationData[i];
      let rotationAngle = 0;

      if (bookClosed && i === 0) {
        rotationAngle = targetRotation;
      } else if (!bookClosed) {
        const insideContrib = params.insideCurveStrength * calc.insideCurveIntensity * targetRotation;
        const outsideContrib = params.outsideCurveStrength * calc.outsideCurveIntensity * targetRotation;
        const turningContrib = params.turningCurveStrength * calc.sinValue * turningProgress * targetRotation;

        rotationAngle = insideContrib - outsideContrib + turningContrib;
      }

      rotationAngle = MathUtils.clamp(rotationAngle, -Math.PI, Math.PI);

      easing.dampAngle(
        bone.rotation,
        "y",
        rotationAngle,
        params.easingFactor,
        delta
      );

      // Folding animation
      if (!bookClosed && i > params.pageSegments * 0.6) {
        const foldAngle = degToRad(Math.sign(targetRotation) * 1.5);
        const foldIntensity = calc.foldSinValue * turningProgress;
        const targetFoldX = MathUtils.clamp(foldAngle * foldIntensity, -Math.PI/3, Math.PI/3);

        easing.dampAngle(
          bone.rotation,
          "x",
          targetFoldX,
          params.easingFactorFold,
          delta
        );
      } else if (Math.abs(bone.rotation.x) > 0.001) {
        easing.dampAngle(
          bone.rotation,
          "x",
          0,
          params.easingFactorFold,
          delta
        );
      }
    }
  });

  useCursor(highlighted && visible);

  if (!skinnedMesh) {
    return null;
  }

  const handleClick = useCallback((e) => {
    e.stopPropagation();

    const now = performance.now();
    if (now - clickTimeRef.current < 300) {
      return;
    }
    clickTimeRef.current = now;

    setHighlighted(false);

    // Fixed page turning logic
    const targetPage = opened ? number : number + 1;
    if (targetPage >= 0 && targetPage <= pages.length) {
      setPage(targetPage);
    }
  }, [opened, number, setPage]);

  const handlePointerEnter = useCallback((e) => {
    e.stopPropagation();
    setHighlighted(true);
  }, []);

  const handlePointerLeave = useCallback((e) => {
    e.stopPropagation();
    setHighlighted(false);
  }, []);

  return (
    <group
      {...props}
      ref={group}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
      onClick={handleClick}
    >      <primitive
        object={skinnedMesh}
        ref={skinnedMeshRef}
        position-z={-number * PAGE_DEPTH + page * PAGE_DEPTH}
        visible={visible}
      />
    </group>
  );
});

export const Book = React.memo(({ ...props }) => {
  const [page] = useAtom(pageAtom);
  const [delayedPage, setDelayedPage] = useState(page);
  const isMobile = useIsMobile();
  const timeoutRef = useRef(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (resourceManager) {
        resourceManager.dispose();
        resourceManager = new ResourceManager();
      }
    };
  }, []);

  // Page transition logic
  const goToPage = useCallback(() => {
    setDelayedPage(prevPage => {
      if (page === prevPage) {
        return prevPage;
      }

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      const pageDistance = Math.abs(page - prevPage);

      if (pageDistance > 2) {
        const jumpSize = 2;
        const newPage = page > prevPage
          ? Math.min(prevPage + jumpSize, page)
          : Math.max(prevPage - jumpSize, page);

        timeoutRef.current = setTimeout(() => goToPage(), 50);
        return newPage;
      }

      const delay = 80;
      timeoutRef.current = setTimeout(() => goToPage(), delay);

      if (page > prevPage) {
        return prevPage + 1;
      }
      if (page < prevPage) {
        return prevPage - 1;
      }
      return prevPage;
    });
  }, [page]);

  useEffect(() => {
    goToPage();

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [page, goToPage]);

  const visiblePages = useMemo(() => {
    return pages.map((pageData, index) => ({
      ...pageData,
      _index: index
    }));
  }, []);

  const isBookClosed = useMemo(() =>
    delayedPage === 0 || delayedPage === pages.length,
  [delayedPage]);

  return (
    <group {...props} rotation-y={-Math.PI / 2}>
      {visiblePages.map((pageData) => {
        const pageNumber = pageData._index;        return (
          <Page
            key={pageNumber}
            page={delayedPage}
            number={pageNumber}
            opened={delayedPage > pageNumber}
            bookClosed={isBookClosed}
            visible={true}
            front={pageData.front}
            back={pageData.back}
          />
        );
      })}
    </group>
  );
});