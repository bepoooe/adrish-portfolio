import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

/**
 * SafeThreeCanvas - A wrapper component that adds error handling for Three.js buffer attribute issues
 */
const SafeThreeCanvas = ({ children, ...props }) => {
  const errorCountRef = useRef(0);
  const maxErrors = 10; // Increased tolerance
  const lastErrorTimeRef = useRef(0);

  useEffect(() => {
    // Override THREE.js WebGLAttributes.update to catch buffer resize errors
    const originalConsoleError = console.error;
    
    console.error = (...args) => {
      const errorMessage = args.join(' ');
      
      // Check for buffer attribute size mismatch errors
      if (errorMessage.includes('buffer attribute') && 
          (errorMessage.includes('array buffer') || errorMessage.includes('original size'))) {
        
        const currentTime = Date.now();
        
        // Throttle error reporting to prevent spam
        if (currentTime - lastErrorTimeRef.current > 1000) { // 1 second throttle
          errorCountRef.current += 1;
          lastErrorTimeRef.current = currentTime;
          
          console.warn(`SafeThreeCanvas: Caught and suppressed buffer attribute error #${errorCountRef.current}`);
          
          if (errorCountRef.current === maxErrors) {
            console.warn('SafeThreeCanvas: High number of buffer errors detected. This usually indicates screen resize issues.');
            console.warn('Consider refreshing the page if particles appear broken.');
          }
        }
        
        // Don't propagate the error to avoid console spam and crashes
        return;
      }
      
      // For other errors, use original console.error
      originalConsoleError.apply(console, args);
    };

    // More aggressive override of THREE.js WebGLAttributes.update method
    if (typeof THREE !== 'undefined' && THREE.WebGLAttributes) {
      const originalUpdate = THREE.WebGLAttributes.prototype.update;
      
      THREE.WebGLAttributes.prototype.update = function(attribute, bufferType) {
        try {
          // Pre-check: validate the attribute before attempting update
          if (!attribute || !attribute.array) {
            console.warn('SafeThreeCanvas: Invalid attribute, skipping update');
            return this.attributes.get(attribute) || { version: -1 };
          }
          
          // Check if we have an existing buffer for this attribute
          const existingBuffer = this.attributes.get(attribute);
          if (existingBuffer && existingBuffer.version >= attribute.version) {
            // Buffer is up to date, no need to update
            return existingBuffer;
          }
          
          return originalUpdate.call(this, attribute, bufferType);
          
        } catch (error) {
          if (error.message && error.message.includes('buffer attribute') && 
              (error.message.includes('array buffer') || error.message.includes('original size'))) {
            
            const currentTime = Date.now();
            
            if (currentTime - lastErrorTimeRef.current > 1000) {
              errorCountRef.current += 1;
              lastErrorTimeRef.current = currentTime;
              
              console.warn('SafeThreeCanvas: Prevented buffer attribute resize error - recreating buffer');
            }
            
            // Try to handle the error gracefully
            try {
              const gl = this.gl;
              if (attribute && attribute.array && gl) {
                // Remove the problematic buffer
                const oldBuffer = this.attributes.get(attribute);
                if (oldBuffer && oldBuffer.buffer) {
                  gl.deleteBuffer(oldBuffer.buffer);
                }
                this.attributes.delete(attribute);
                
                // Create a completely new buffer
                const newBuffer = {
                  buffer: gl.createBuffer(),
                  type: bufferType || gl.ARRAY_BUFFER,
                  bytesPerElement: attribute.array.BYTES_PER_ELEMENT,
                  version: attribute.version
                };
                
                gl.bindBuffer(newBuffer.type, newBuffer.buffer);
                gl.bufferData(newBuffer.type, attribute.array, gl.DYNAMIC_DRAW);
                
                this.attributes.set(attribute, newBuffer);
                
                return newBuffer;
              }
            } catch (recreateError) {
              // If recreation fails, just return a safe dummy result
              console.warn('SafeThreeCanvas: Buffer recreation failed, using fallback');
            }
            
            // Return a safe fallback
            return this.attributes.get(attribute) || { 
              version: attribute.version || -1,
              buffer: null 
            };
          }
          
          // Re-throw other errors
          throw error;
        }
      };
    }

    // Cleanup function
    return () => {
      console.error = originalConsoleError;
    };
  }, []);

  return children;
};

export default SafeThreeCanvas;
