import * as THREE from 'three';

// Cache to track all disposable resources with categorization
const resourceCache = new Set();

// Track resources by type for better management
const typedResourceCache = {
  geometries: new Set(),
  materials: new Set(),
  textures: new Set(),
  renderers: new Set(),
  scenes: new Set(),
  cameras: new Set(),
  other: new Set()
};

// Track memory usage
let memoryUsage = {
  lastReported: 0,
  peak: 0
};

// Register a resource for later disposal with type categorization
export const registerResource = (resource) => {
  if (!resource) return;

  // Add to general cache
  resourceCache.add(resource);

  // Categorize by type
  if (resource.isGeometry || resource.isBufferGeometry) {
    typedResourceCache.geometries.add(resource);
  } else if (resource.isMaterial) {
    typedResourceCache.materials.add(resource);
  } else if (resource.isTexture) {
    typedResourceCache.textures.add(resource);
  } else if (resource.isRenderer) {
    typedResourceCache.renderers.add(resource);
  } else if (resource.isScene) {
    typedResourceCache.scenes.add(resource);
  } else if (resource.isCamera) {
    typedResourceCache.cameras.add(resource);
  } else {
    typedResourceCache.other.add(resource);
  }
};

// Unregister a resource when it's no longer needed
export const unregisterResource = (resource) => {
  if (!resource) return;

  // Remove from general cache
  resourceCache.delete(resource);

  // Remove from typed caches
  if (resource.isGeometry || resource.isBufferGeometry) {
    typedResourceCache.geometries.delete(resource);
  } else if (resource.isMaterial) {
    typedResourceCache.materials.delete(resource);
  } else if (resource.isTexture) {
    typedResourceCache.textures.delete(resource);
  } else if (resource.isRenderer) {
    typedResourceCache.renderers.delete(resource);
  } else if (resource.isScene) {
    typedResourceCache.scenes.delete(resource);
  } else if (resource.isCamera) {
    typedResourceCache.cameras.delete(resource);
  } else {
    typedResourceCache.other.delete(resource);
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

// Clean up all resources in optimal order
export const cleanupResources = () => {
  // Dispose in optimal order to prevent errors

  // 1. First dispose renderers
  typedResourceCache.renderers.forEach(disposeResource);

  // 2. Then dispose scenes
  typedResourceCache.scenes.forEach(disposeResource);

  // 3. Then dispose cameras
  typedResourceCache.cameras.forEach(disposeResource);

  // 4. Then dispose materials (which will dispose their textures)
  typedResourceCache.materials.forEach(disposeResource);

  // 5. Then dispose textures
  typedResourceCache.textures.forEach(disposeResource);

  // 6. Then dispose geometries
  typedResourceCache.geometries.forEach(disposeResource);

  // 7. Finally dispose other resources
  typedResourceCache.other.forEach(disposeResource);

  // Clear all caches
  resourceCache.clear();
  Object.values(typedResourceCache).forEach(cache => cache.clear());

  // Clear THREE.js cache
  if (THREE.Cache) THREE.Cache.clear();

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

// Check if memory API is available
const hasMemoryAPI = () => {
  return window.performance && window.performance.memory;
};

// Get detailed memory usage information
export const getMemoryUsage = () => {
  if (!hasMemoryAPI()) {
    return { available: false };
  }

  const memory = window.performance.memory;
  const used = Math.round(memory.usedJSHeapSize / (1024 * 1024));
  const total = Math.round(memory.totalJSHeapSize / (1024 * 1024));
  const limit = Math.round(memory.jsHeapSizeLimit / (1024 * 1024));

  // Update peak memory usage
  if (used > memoryUsage.peak) {
    memoryUsage.peak = used;
  }

  // Calculate resource counts
  const resourceCounts = {};
  Object.entries(typedResourceCache).forEach(([key, cache]) => {
    resourceCounts[key] = cache.size;
  });

  return {
    available: true,
    used,
    total,
    limit,
    peak: memoryUsage.peak,
    percentUsed: Math.round((used / limit) * 100),
    resourceCounts
  };
};

// Monitor memory usage if available
export const logMemoryUsage = () => {
  const memory = getMemoryUsage();

  if (memory.available) {
    console.log('Memory usage:', {
      used: `${memory.used}MB`,
      total: `${memory.total}MB`,
      limit: `${memory.limit}MB`,
      peak: `${memory.peak}MB`,
      percentUsed: `${memory.percentUsed}%`,
      resources: memory.resourceCounts
    });
  } else {
    console.log('Memory API not available');
  }
};

// Start monitoring memory usage at regular intervals
export const startMemoryMonitoring = (interval = 10000) => {
  if (!hasMemoryAPI()) {
    console.warn('Memory monitoring not available in this browser');
    return () => {};
  }

  const timer = setInterval(() => {
    const memory = getMemoryUsage();

    // Only log if memory usage has changed significantly
    if (Math.abs(memory.used - memoryUsage.lastReported) > 10) {
      logMemoryUsage();
      memoryUsage.lastReported = memory.used;
    }

    // Alert if memory usage is high
    if (memory.percentUsed > 80) {
      console.warn('High memory usage detected:', `${memory.percentUsed}%`);

      // Force garbage collection if available
      if (window.gc) {
        console.log('Forcing garbage collection');
        window.gc();
      }
    }
  }, interval);

  return () => clearInterval(timer);
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