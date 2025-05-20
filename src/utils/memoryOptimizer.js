import * as THREE from 'three';
import { disposeAllTextures } from './textureManager';

// Track disposable resources
const disposableResources = new Set();

// Register a resource for disposal
export const registerDisposable = (resource) => {
  if (resource) {
    disposableResources.add(resource);
  }
};

// Unregister a resource
export const unregisterDisposable = (resource) => {
  if (resource && disposableResources.has(resource)) {
    disposableResources.delete(resource);
  }
};

// Dispose a specific resource
export const disposeResource = (resource) => {
  if (!resource) return;
  
  try {
    // Handle different types of resources
    if (resource.dispose && typeof resource.dispose === 'function') {
      resource.dispose();
    }
    
    // Handle geometries
    if (resource.geometry && resource.geometry.dispose) {
      resource.geometry.dispose();
    }
    
    // Handle materials
    if (resource.material) {
      if (Array.isArray(resource.material)) {
        resource.material.forEach(material => {
          disposeMaterial(material);
        });
      } else {
        disposeMaterial(resource.material);
      }
    }
    
    unregisterDisposable(resource);
  } catch (e) {
    console.error('Error disposing resource:', e);
  }
};

// Helper to dispose materials
const disposeMaterial = (material) => {
  if (!material) return;
  
  // Dispose textures
  Object.keys(material).forEach(prop => {
    if (!material[prop]) return;
    if (material[prop].isTexture) {
      material[prop].dispose();
    }
  });
  
  // Dispose the material itself
  if (material.dispose) {
    material.dispose();
  }
};

// Clean up all resources
export const cleanupResources = () => {
  disposableResources.forEach(resource => {
    disposeResource(resource);
  });
  disposableResources.clear();
  
  // Also clean up textures
  disposeAllTextures();
  
  // Force garbage collection if available
  if (window.gc) {
    window.gc();
  }
};

// Memory usage monitoring
export const getMemoryInfo = () => {
  if (window.performance && window.performance.memory) {
    return {
      totalJSHeapSize: Math.round(window.performance.memory.totalJSHeapSize / (1024 * 1024)) + 'MB',
      usedJSHeapSize: Math.round(window.performance.memory.usedJSHeapSize / (1024 * 1024)) + 'MB',
      jsHeapSizeLimit: Math.round(window.performance.memory.jsHeapSizeLimit / (1024 * 1024)) + 'MB'
    };
  }
  return null;
};

// Optimize Three.js renderer
export const optimizeRenderer = (renderer) => {
  if (!renderer) return;
  
  // Reduce precision if needed
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1;
  
  // Disable unnecessary features
  renderer.shadowMap.autoUpdate = false;
  renderer.shadowMap.needsUpdate = true;
  
  // Set power preference
  renderer.powerPreference = 'high-performance';
  
  // Optimize for memory
  renderer.info.autoReset = false;
};

// Create optimized geometry with shared attributes
export const createOptimizedGeometry = (geometryType, params, segments) => {
  // Create a cache key
  const key = `${geometryType}-${JSON.stringify(params)}-${segments}`;
  
  // Check if we already have this geometry cached
  if (!window._geometryCache) window._geometryCache = new Map();
  if (window._geometryCache.has(key)) {
    return window._geometryCache.get(key);
  }
  
  // Create new geometry
  let geometry;
  
  switch (geometryType) {
    case 'box':
      geometry = new THREE.BoxGeometry(
        params.width, 
        params.height, 
        params.depth, 
        segments, 
        segments, 
        segments
      );
      break;
    case 'plane':
      geometry = new THREE.PlaneGeometry(
        params.width,
        params.height,
        segments,
        segments
      );
      break;
    // Add more geometry types as needed
    default:
      geometry = new THREE.BoxGeometry(1, 1, 1);
  }
  
  // Cache the geometry
  window._geometryCache.set(key, geometry);
  registerDisposable(geometry);
  
  return geometry;
};

// Create shared materials
export const createSharedMaterial = (type, params) => {
  // Create a cache key
  const key = `${type}-${JSON.stringify(params)}`;
  
  // Check if we already have this material cached
  if (!window._materialCache) window._materialCache = new Map();
  if (window._materialCache.has(key)) {
    return window._materialCache.get(key);
  }
  
  // Create new material
  let material;
  
  switch (type) {
    case 'standard':
      material = new THREE.MeshStandardMaterial(params);
      break;
    case 'basic':
      material = new THREE.MeshBasicMaterial(params);
      break;
    case 'phong':
      material = new THREE.MeshPhongMaterial(params);
      break;
    // Add more material types as needed
    default:
      material = new THREE.MeshBasicMaterial(params);
  }
  
  // Cache the material
  window._materialCache.set(key, material);
  registerDisposable(material);
  
  return material;
};