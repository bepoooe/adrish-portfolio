import * as THREE from 'three';

// Cache to track all disposable resources
const resourceCache = new Set();

// Register a resource for later disposal
export const registerResource = (resource) => {
  if (resource) {
    resourceCache.add(resource);
  }
};

// Unregister a resource when it's no longer needed
export const unregisterResource = (resource) => {
  if (resource && resourceCache.has(resource)) {
    resourceCache.delete(resource);
  }
};

// Dispose of a specific resource
export const disposeResource = (resource) => {
  if (!resource) return;
  
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
  
  unregisterResource(resource);
};

// Helper to dispose of materials and their textures
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
  resourceCache.forEach(resource => {
    disposeResource(resource);
  });
  resourceCache.clear();
  
  // Force garbage collection if available
  if (window.gc) {
    window.gc();
  }
};

// Cleanup specific types of resources
export const cleanupUnusedTextures = () => {
  resourceCache.forEach(resource => {
    if (resource.isTexture && !resource.__isUsed) {
      disposeResource(resource);
    }
  });
};

// Monitor memory usage if available
export const logMemoryUsage = () => {
  if (window.performance && window.performance.memory) {
    console.log('Memory usage:', {
      totalJSHeapSize: Math.round(window.performance.memory.totalJSHeapSize / (1024 * 1024)) + 'MB',
      usedJSHeapSize: Math.round(window.performance.memory.usedJSHeapSize / (1024 * 1024)) + 'MB',
      jsHeapSizeLimit: Math.round(window.performance.memory.jsHeapSizeLimit / (1024 * 1024)) + 'MB'
    });
  }
};

// Create a texture loader with memory management
export const createOptimizedTextureLoader = () => {
  const loader = new THREE.TextureLoader();
  const originalLoad = loader.load;
  
  // Override the load method to register textures
  loader.load = function(url, onLoad, onProgress, onError) {
    return originalLoad.call(
      this,
      url,
      texture => {
        // Apply optimizations
        texture.minFilter = THREE.LinearFilter;
        texture.magFilter = THREE.LinearFilter;
        texture.generateMipmaps = false;
        texture.colorSpace = THREE.SRGBColorSpace;
        
        // Register for disposal
        registerResource(texture);
        
        if (onLoad) onLoad(texture);
      },
      onProgress,
      onError
    );
  };
  
  return loader;
};

// Export a singleton texture loader
export const optimizedTextureLoader = createOptimizedTextureLoader();