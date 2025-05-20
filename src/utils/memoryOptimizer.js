import * as THREE from 'three';
import { disposeAllTextures } from './textureManager';

// Enhanced resource tracking with type categorization
const disposableResources = {
  geometries: new Set(),
  materials: new Set(),
  textures: new Set(),
  meshes: new Set(),
  other: new Set()
};

// Global caches with better memory management
const materialCache = new Map();
window._materialCache = materialCache;

// Register a resource for disposal with type detection
export const registerDisposable = (resource) => {
  if (!resource) return;
  
  try {
    // Categorize by resource type for better cleanup
    if (resource.isGeometry || resource.isBufferGeometry) {
      disposableResources.geometries.add(resource);
    } else if (resource.isMaterial) {
      disposableResources.materials.add(resource);
    } else if (resource.isTexture) {
      disposableResources.textures.add(resource);
    } else if (resource.isMesh || resource.isSkinnedMesh) {
      disposableResources.meshes.add(resource);
    } else {
      disposableResources.other.add(resource);
    }
  } catch (e) {
    console.warn("Error registering resource:", e);
  }
};

// Unregister a resource with type detection
export const unregisterDisposable = (resource) => {
  if (!resource) return;
  
  // Check all resource categories
  for (const category in disposableResources) {
    if (disposableResources[category].has(resource)) {
      disposableResources[category].delete(resource);
      return;
    }
  }
};

// Enhanced material disposal with texture handling
const disposeMaterial = (material) => {
  if (!material) return;
  
  try {
    // Dispose all textures attached to the material
    const textureProps = ['map', 'normalMap', 'roughnessMap', 'metalnessMap', 
                          'aoMap', 'emissiveMap', 'displacementMap', 'alphaMap'];
    
    textureProps.forEach(prop => {
      if (material[prop] && material[prop].isTexture) {
        material[prop].dispose();
        disposableResources.textures.delete(material[prop]);
      }
    });
    
    // Dispose the material itself
    if (material.dispose) {
      material.dispose();
    }
    
    // Remove from tracking
    disposableResources.materials.delete(material);
    
    // Remove from cache if present
    for (const [key, value] of materialCache.entries()) {
      if (value === material) {
        materialCache.delete(key);
        break;
      }
    }
  } catch (e) {
    console.warn("Error disposing material:", e);
  }
};

// Dispose a specific resource with enhanced error handling
export const disposeResource = (resource) => {
  if (!resource) return;
  
  try {
    // Handle meshes with special care
    if (resource.isMesh || resource.isSkinnedMesh) {
      // Dispose geometry
      if (resource.geometry) {
        resource.geometry.dispose();
        disposableResources.geometries.delete(resource.geometry);
      }
      
      // Dispose materials
      if (resource.material) {
        if (Array.isArray(resource.material)) {
          resource.material.forEach(disposeMaterial);
        } else {
          disposeMaterial(resource.material);
        }
      }
      
      // Remove from scene if attached
      if (resource.parent) {
        resource.parent.remove(resource);
      }
      
      disposableResources.meshes.delete(resource);
      return;
    }
    
    // Handle other resource types
    if (resource.isGeometry || resource.isBufferGeometry) {
      resource.dispose();
      disposableResources.geometries.delete(resource);
    } else if (resource.isMaterial) {
      disposeMaterial(resource);
    } else if (resource.isTexture) {
      resource.dispose();
      disposableResources.textures.delete(resource);
    } else if (resource.dispose && typeof resource.dispose === 'function') {
      resource.dispose();
      disposableResources.other.delete(resource);
    }
  } catch (e) {
    console.warn("Error disposing resource:", e);
  }
};

// Clean up all resources with optimized order
export const cleanupResources = () => {
  // Dispose in optimal order: meshes first, then materials, geometries, textures
  disposableResources.meshes.forEach(disposeResource);
  disposableResources.materials.forEach(disposeMaterial);
  
  disposableResources.geometries.forEach(geometry => {
    geometry.dispose();
  });
  
  disposableResources.textures.forEach(texture => {
    texture.dispose();
  });
  
  disposableResources.other.forEach(resource => {
    if (resource.dispose) resource.dispose();
  });
  
  // Clear all tracking sets
  for (const category in disposableResources) {
    disposableResources[category].clear();
  }
  
  // Clean up texture cache
  disposeAllTextures();
  
  // Clear material cache
  materialCache.clear();
  
  // Suggest garbage collection
  if (window.gc) {
    window.gc();
  }
};

// Enhanced memory usage monitoring
export const getMemoryInfo = () => {
  const info = {
    trackedResources: {
      geometries: disposableResources.geometries.size,
      materials: disposableResources.materials.size,
      textures: disposableResources.textures.size,
      meshes: disposableResources.meshes.size,
      other: disposableResources.other.size,
      total: 0
    }
  };
  
  // Calculate total tracked resources
  info.trackedResources.total = Object.values(disposableResources)
    .reduce((sum, set) => sum + set.size, 0);
  
  // Add browser memory info if available
  if (window.performance && window.performance.memory) {
    info.browser = {
      totalJSHeapSize: Math.round(window.performance.memory.totalJSHeapSize / (1024 * 1024)) + 'MB',
      usedJSHeapSize: Math.round(window.performance.memory.usedJSHeapSize / (1024 * 1024)) + 'MB',
      jsHeapSizeLimit: Math.round(window.performance.memory.jsHeapSizeLimit / (1024 * 1024)) + 'MB'
    };
  }
  
  return info;
};

// Optimize Three.js renderer with enhanced settings
export const optimizeRenderer = (renderer) => {
  if (!renderer) return;
  
  // Apply optimized rendering settings
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1;
  
  // Optimize shadow maps
  renderer.shadowMap.autoUpdate = false;
  renderer.shadowMap.needsUpdate = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  
  // Set power preference for better performance
  renderer.powerPreference = 'high-performance';
  
  // Optimize memory usage
  renderer.info.autoReset = false;
  
  // Set pixel ratio based on device
  const pixelRatio = window.devicePixelRatio;
  renderer.setPixelRatio(Math.min(pixelRatio, 2)); // Cap at 2x for performance
};

// Create optimized geometry with enhanced caching
export const createOptimizedGeometry = (geometryType, params, segments) => {
  // Create a deterministic cache key
  const key = `${geometryType}-${JSON.stringify(params)}-${segments}`;
  
  // Check if we already have this geometry cached
  if (geometryCache.has(key)) {
    return geometryCache.get(key);
  }
  
  // Create new geometry with optimized parameters
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
    case 'sphere':
      geometry = new THREE.SphereGeometry(
        params.radius,
        segments,
        segments
      );
      break;
    case 'cylinder':
      geometry = new THREE.CylinderGeometry(
        params.radiusTop,
        params.radiusBottom,
        params.height,
        segments
      );
      break;
    default:
      geometry = new THREE.BoxGeometry(1, 1, 1);
  }
  
  // Register for proper disposal
  registerDisposable(geometry);
  
  // Cache the geometry
  geometryCache.set(key, geometry);
  
  return geometry;
};

// Create shared materials with enhanced caching
export const createSharedMaterial = (type, params) => {
  // Create a deterministic cache key
  const key = `${type}-${JSON.stringify(params)}`;
  
  // Check if we already have this material cached
  if (materialCache.has(key)) {
    return materialCache.get(key);
  }
  
  // Create new material with optimized parameters
  let material;
  
  switch (type) {
    case 'standard':
      material = new THREE.MeshStandardMaterial({
        ...params,
        // Apply optimized defaults
        flatShading: false,
        precision: 'mediump'
      });
      break;
    case 'basic':
      material = new THREE.MeshBasicMaterial({
        ...params,
        precision: 'mediump'
      });
      break;
    case 'phong':
      material = new THREE.MeshPhongMaterial({
        ...params,
        shininess: params.shininess || 30,
        precision: 'mediump'
      });
      break;
    case 'lambert':
      material = new THREE.MeshLambertMaterial({
        ...params,
        precision: 'mediump'
      });
      break;
    default:
      material = new THREE.MeshBasicMaterial(params);
  }
  
  // Register for proper disposal
  registerDisposable(material);
  
  // Cache the material
  materialCache.set(key, material);
  
  return material;
};