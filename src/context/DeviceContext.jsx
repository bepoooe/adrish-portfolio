import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';

// Create context for device information
const DeviceContext = createContext({
  isMobile: false,
  isLowPerformance: false,
  gpuTier: 0
});

// Provider component that will wrap the app
export const DeviceProvider = ({ children }) => {
  // Initialize with current window width
  const [isMobile, setIsMobile] = useState(() => window.innerWidth <= 768);
  const [gpuTier, setGpuTier] = useState(0);
  
  // Detect GPU capabilities on mount
  useEffect(() => {
    // Simple GPU detection based on user agent and device
    const detectGPU = () => {
      const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      const isOldBrowser = !window.WebGLRenderingContext;
      
      if (isOldBrowser) return 0;
      if (isMobileDevice) return 1;
      
      // Try to create a WebGL context to test capabilities
      try {
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        
        if (!gl) return 1;
        
        // Check for some basic WebGL capabilities
        const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
        const renderer = debugInfo ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) : '';
        
        // Simple heuristic based on renderer string
        const isLowEnd = /(intel|microsoft|swiftshader|llvmpipe)/i.test(renderer);
        const isMidRange = /(mobile|iris)/i.test(renderer);
        const isHighEnd = /(nvidia|amd|radeon|geforce)/i.test(renderer);
        
        if (isHighEnd) return 3;
        if (isMidRange) return 2;
        if (isLowEnd) return 1;
        
        return 2; // Default to mid-range if we can't determine
      } catch (e) {
        return 1; // If there's an error, assume low-end
      }
    };
    
    setGpuTier(detectGPU());
  }, []);
  
  // Debounced resize handler
  useEffect(() => {
    let resizeTimer;
    const handleResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        setIsMobile(window.innerWidth <= 768);
      }, 150);
    };
    
    window.addEventListener('resize', handleResize);
    return () => {
      clearTimeout(resizeTimer);
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  
  // Memoize the context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    isMobile,
    isLowPerformance: isMobile, // Mobile devices are considered low performance
    gpuTier
  }), [isMobile, gpuTier]);
  
  return (
    <DeviceContext.Provider value={contextValue}>
      {children}
    </DeviceContext.Provider>
  );
};

// Custom hook to use the device context
export const useDevice = () => useContext(DeviceContext);