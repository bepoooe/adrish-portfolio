import * as THREE from 'three';
import { useTexture as dreiUseTexture } from '@react-three/drei';

// Global texture cache to prevent duplicate loading
const textureCache = new Map();

// Texture compression settings
const TEXTURE_SETTINGS = {
  mobile: {
    anisotropy: 1,
    generateMipmaps: false,
    minFilter: THREE.LinearFilter,
    magFilter: THREE.LinearFilter,
    format: THREE.RGBFormat, // Use RGB instead of RGBA when possible
  },
  desktop: {
    anisotropy: 4,
    generateMipmaps: true,
    minFilter: THREE.LinearMipmapLinearFilter,
    magFilter: THREE.LinearFilter,
  }
};

// Custom texture loader with memory management
export const createTextureLoader = (isMobile = false) => {
  const settings = isMobile ? TEXTURE_SETTINGS.mobile : TEXTURE_SETTINGS.desktop;
  const loader = new THREE.TextureLoader();
  
  // Override load method to apply optimizations
  const originalLoad = loader.load;
  loader.load = function(url, onLoad, onProgress, onError) {
    // Check if texture is already in cache
    if (textureCache.has(url)) {
      const texture = textureCache.get(url);
      if (onLoad) setTimeout(() => onLoad(texture), 0);
      return texture;
    }
    
    return originalLoad.call(
      this,
      url,
      (texture) => {
        // Apply optimizations
        texture.generateMipmaps = settings.generateMipmaps;
        texture.minFilter = settings.minFilter;
        texture.magFilter = settings.magFilter;
        texture.anisotropy = settings.anisotropy;
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.needsUpdate = true;
        
        // Store in cache
        textureCache.set(url, texture);
        
        if (onLoad) onLoad(texture);
      },
      onProgress,
      onError
    );
  };
  
  return loader;
};

// Custom hook to use textures with memory optimization
export const useOptimizedTexture = (path, isMobile = false) => {
  // If already in cache, return it
  if (textureCache.has(path)) {
    return textureCache.get(path);
  }
  
  // Otherwise use drei's useTexture
  const texture = dreiUseTexture(path);
  
  // Apply optimizations
  const settings = isMobile ? TEXTURE_SETTINGS.mobile : TEXTURE_SETTINGS.desktop;
  texture.generateMipmaps = settings.generateMipmaps;
  texture.minFilter = settings.minFilter;
  texture.magFilter = settings.magFilter;
  texture.anisotropy = settings.anisotropy;
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
  
  // Store in cache
  textureCache.set(path, texture);
  
  return texture;
};

// Dispose textures that are no longer needed
export const disposeTexture = (path) => {
  if (textureCache.has(path)) {
    const texture = textureCache.get(path);
    texture.dispose();
    textureCache.delete(path);
  }
};

// Dispose all textures
export const disposeAllTextures = () => {
  textureCache.forEach(texture => {
    texture.dispose();
  });
  textureCache.clear();
};

// Preload textures with low quality first
export const preloadTextures = (paths, isMobile = false) => {
  const loader = createTextureLoader(isMobile);
  
  paths.forEach(path => {
    if (!textureCache.has(path)) {
      loader.load(path, () => {
        // Texture loaded and cached
      });
    }
  });
};

// Get texture from cache or null if not found
export const getTextureFromCache = (path) => {
  return textureCache.get(path) || null;
};

// Optimize texture size based on device
export const getOptimalTextureSize = (isMobile) => {
  return isMobile ? 512 : 1024; // Lower resolution for mobile
};

// Create a downsampled version of a texture
export const downsampleTexture = (texture, targetSize) => {
  if (!texture) return null;
  
  // Create a canvas to downsample
  const canvas = document.createElement('canvas');
  canvas.width = targetSize;
  canvas.height = targetSize * (texture.image.height / texture.image.width);
  
  // Draw the texture at lower resolution
  const ctx = canvas.getContext('2d');
  ctx.drawImage(texture.image, 0, 0, canvas.width, canvas.height);
  
  // Create new texture from canvas
  const newTexture = new THREE.Texture(canvas);
  newTexture.needsUpdate = true;
  newTexture.colorSpace = THREE.SRGBColorSpace;
  newTexture.minFilter = THREE.LinearFilter;
  newTexture.magFilter = THREE.LinearFilter;
  
  return newTexture;
};