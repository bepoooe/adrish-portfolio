import * as THREE from 'three';
import { disposeAllTextures } from './textureManager';
import { cleanupResources } from './memoryOptimizer';

// Clear Three.js cache
export const clearThreeCache = () => {
  // Clear material cache
  THREE.MaterialCache?.clear?.();
  
  // Clear texture cache
  THREE.Cache?.clear?.();
  
  // Clear geometry cache
  if (window._geometryCache) {
    window._geometryCache.clear();
  }
  
  // Clear material cache
  if (window._materialCache) {
    window._materialCache.clear();
  }
};

// Force garbage collection if available
export const forceGC = () => {
  if (window.gc) {
    window.gc();
  }
};

// Cleanup all resources
export const cleanupAll = () => {
  // Dispose textures
  disposeAllTextures();
  
  // Dispose other resources
  cleanupResources();
  
  // Clear Three.js cache
  clearThreeCache();
  
  // Force garbage collection
  forceGC();
};

// Setup cleanup on page unload
export const setupPageUnloadCleanup = () => {
  window.addEventListener('beforeunload', cleanupAll);
  
  // Also clean up on visibility change
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      // Partial cleanup when tab is hidden
      disposeAllTextures();
    }
  });
  
  return () => {
    window.removeEventListener('beforeunload', cleanupAll);
  };
};

// Setup memory monitoring
export const setupMemoryMonitoring = (interval = 10000) => {
  if (!window.performance || !window.performance.memory) {
    return () => {}; // No-op if memory API not available
  }
  
  const timer = setInterval(() => {
    console.log('Memory usage:', {
      totalJSHeapSize: Math.round(window.performance.memory.totalJSHeapSize / (1024 * 1024)) + 'MB',
      usedJSHeapSize: Math.round(window.performance.memory.usedJSHeapSize / (1024 * 1024)) + 'MB',
      jsHeapSizeLimit: Math.round(window.performance.memory.jsHeapSizeLimit / (1024 * 1024)) + 'MB'
    });
  }, interval);
  
  return () => {
    clearInterval(timer);
  };
};