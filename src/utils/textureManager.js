import * as THREE from 'three';
import { useTexture as dreiUseTexture } from '@react-three/drei';
import { registerDisposable } from './memoryOptimizer';

// Enhanced texture cache with priority management
const textureCache = new Map();
const textureLoadQueue = [];
const MAX_CONCURRENT_LOADS = 4;
let activeLoads = 0;

// Optimized texture settings based on device capabilities
const TEXTURE_SETTINGS = {
  mobile: {
    anisotropy: 1,
    generateMipmaps: false,
    minFilter: THREE.LinearFilter,
    magFilter: THREE.LinearFilter,
    format: THREE.RGBFormat,
    compression: true,
    maxSize: 512
  },
  desktop: {
    anisotropy: 2, // Reduced from 4 for better performance
    generateMipmaps: true,
    minFilter: THREE.LinearMipmapLinearFilter,
    magFilter: THREE.LinearFilter,
    format: THREE.RGBFormat,
    compression: false,
    maxSize: 1024
  },
  lowEnd: {
    anisotropy: 1,
    generateMipmaps: false,
    minFilter: THREE.LinearFilter,
    magFilter: THREE.LinearFilter,
    format: THREE.RGBFormat,
    compression: true,
    maxSize: 256
  }
};

// Detect device capabilities for optimal texture settings
const detectDeviceCapabilities = () => {
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  const isLowEndDevice = isMobile && (
    navigator.deviceMemory < 4 || 
    navigator.hardwareConcurrency < 4 ||
    window.innerWidth < 768
  );
  
  if (isLowEndDevice) return TEXTURE_SETTINGS.lowEnd;
  if (isMobile) return TEXTURE_SETTINGS.mobile;
  return TEXTURE_SETTINGS.desktop;
};

// Process texture load queue with throttling
const processTextureQueue = () => {
  if (textureLoadQueue.length === 0 || activeLoads >= MAX_CONCURRENT_LOADS) return;
  
  const nextLoad = textureLoadQueue.shift();
  activeLoads++;
  
  const { url, onLoad, onProgress, onError, settings } = nextLoad;
  const loader = new THREE.TextureLoader();
  
  loader.load(
    url,
    (texture) => {
      // Apply optimizations
      applyTextureOptimizations(texture, settings);
      
      // Store in cache
      textureCache.set(url, texture);
      
      // Register for proper disposal
      registerDisposable(texture);
      
      // Callback
      if (onLoad) onLoad(texture);
      
      // Process next in queue
      activeLoads--;
      processTextureQueue();
    },
    onProgress,
    (error) => {
      console.warn(`Error loading texture: ${url}`, error);
      if (onError) onError(error);
      
      // Process next in queue
      activeLoads--;
      processTextureQueue();
    }
  );
};

// Apply optimizations to a texture
const applyTextureOptimizations = (texture, settings) => {
  if (!texture) return;
  
  // Apply basic settings
  texture.generateMipmaps = settings.generateMipmaps;
  texture.minFilter = settings.minFilter;
  texture.magFilter = settings.magFilter;
  texture.anisotropy = settings.anisotropy;
  texture.colorSpace = THREE.SRGBColorSpace;
  
  // Apply size limits if needed
  if (texture.image && settings.maxSize) {
    const { width, height } = texture.image;
    if (width > settings.maxSize || height > settings.maxSize) {
      // Resize large textures
      const aspectRatio = width / height;
      let newWidth, newHeight;
      
      if (width > height) {
        newWidth = settings.maxSize;
        newHeight = Math.round(settings.maxSize / aspectRatio);
      } else {
        newHeight = settings.maxSize;
        newWidth = Math.round(settings.maxSize * aspectRatio);
      }
      
      // Create resized texture
      const canvas = document.createElement('canvas');
      canvas.width = newWidth;
      canvas.height = newHeight;
      
      const ctx = canvas.getContext('2d');
      ctx.drawImage(texture.image, 0, 0, newWidth, newHeight);
      
      texture.image = canvas;
      texture.needsUpdate = true;
    }
  }
};

// Enhanced texture loader with queue management
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
    
    // Add to load queue
    textureLoadQueue.push({
      url,
      onLoad,
      onProgress,
      onError,
      settings,
      priority: 1 // Default priority
    });
    
    // Start processing queue
    processTextureQueue();
    
    // Return a placeholder texture that will be updated
    const placeholderTexture = new THREE.Texture();
    return placeholderTexture;
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
  applyTextureOptimizations(texture, settings);
  
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
  
  // Clear load queue
  textureLoadQueue.length = 0;
  activeLoads = 0;
};

// Preload textures with priority management
export const preloadTextures = (paths, isMobile = false, priority = 0) => {
  const settings = detectDeviceCapabilities();
  
  // Add all paths to load queue with specified priority
  paths.forEach(path => {
    if (!textureCache.has(path)) {
      textureLoadQueue.push({
        url: path,
        onLoad: (texture) => {
          // Texture loaded and cached
          console.log(`Preloaded texture: ${path}`);
        },
        onError: (error) => {
          console.warn(`Failed to preload texture: ${path}`, error);
        },
        settings,
        priority
      });
    }
  });
  
  // Sort queue by priority (higher first)
  textureLoadQueue.sort((a, b) => b.priority - a.priority);
  
  // Start processing queue
  processTextureQueue();
};

// Get texture from cache or null if not found
export const getTextureFromCache = (path) => {
  return textureCache.get(path) || null;
};

// Optimize texture size based on device
export const getOptimalTextureSize = () => {
  const settings = detectDeviceCapabilities();
  return settings.maxSize;
};

// Create a downsampled version of a texture with enhanced quality
export const downsampleTexture = (texture, targetSize) => {
  if (!texture || !texture.image) return null;
  
  // Create a canvas to downsample
  const canvas = document.createElement('canvas');
  const { width, height } = texture.image;
  const aspectRatio = width / height;
  
  canvas.width = targetSize;
  canvas.height = Math.round(targetSize / aspectRatio);
  
  // Use better quality downsampling with multiple steps for large textures
  const ctx = canvas.getContext('2d');
  
  if (width > targetSize * 2) {
    // For large textures, use multi-step downsampling for better quality
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
    
    let currentWidth = width;
    let currentHeight = height;
    let currentImage = texture.image;
    
    // Step down by halving dimensions until close to target
    while (currentWidth > targetSize * 2) {
      const nextWidth = Math.max(currentWidth / 2, targetSize);
      const nextHeight = Math.max(currentHeight / 2, targetSize / aspectRatio);
      
      tempCanvas.width = nextWidth;
      tempCanvas.height = nextHeight;
      
      // Draw with better quality settings
      tempCtx.imageSmoothingEnabled = true;
      tempCtx.imageSmoothingQuality = 'high';
      tempCtx.drawImage(currentImage, 0, 0, nextWidth, nextHeight);
      
      currentWidth = nextWidth;
      currentHeight = nextHeight;
      currentImage = tempCanvas;
    }
    
    // Final draw to target canvas
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(currentImage, 0, 0, canvas.width, canvas.height);
  } else {
    // For smaller textures, direct downsampling is fine
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(texture.image, 0, 0, canvas.width, canvas.height);
  }
  
  // Create new texture from canvas
  const newTexture = new THREE.Texture(canvas);
  newTexture.needsUpdate = true;
  newTexture.colorSpace = THREE.SRGBColorSpace;
  newTexture.minFilter = THREE.LinearFilter;
  newTexture.magFilter = THREE.LinearFilter;
  
  // Register for proper disposal
  registerDisposable(newTexture);
  
  return newTexture;
};