import * as THREE from 'three';

/**
 * Utility functions for Three.js buffer attribute safety
 */

/**
 * Safely update buffer attribute with size validation
 * @param {THREE.BufferAttribute} attribute - The buffer attribute to update
 * @param {Float32Array|Uint16Array} newData - New data array
 * @param {number} startIndex - Start index for partial updates
 * @param {number} count - Number of elements to update
 */
export const safeUpdateBufferAttribute = (attribute, newData, startIndex = 0, count = null) => {
  if (!attribute || !newData) {
    console.warn('SafeUpdateBufferAttribute: Invalid attribute or data');
    return false;
  }

  const actualCount = count || newData.length;
  const endIndex = startIndex + actualCount;

  // Validate array bounds
  if (endIndex > attribute.array.length) {
    console.warn(`SafeUpdateBufferAttribute: Update would exceed array bounds. Array length: ${attribute.array.length}, End index: ${endIndex}`);
    return false;
  }

  try {
    // Update the array data
    if (count === null) {
      attribute.array.set(newData, startIndex);
    } else {
      for (let i = 0; i < actualCount; i++) {
        attribute.array[startIndex + i] = newData[i];
      }
    }

    // Mark for update
    attribute.needsUpdate = true;
    
    // Use addUpdateRange instead of deprecated updateRange
    if (attribute.addUpdateRange) {
      attribute.addUpdateRange(startIndex, actualCount);
    } else if (attribute.updateRange) {
      // Fallback for older THREE.js versions
      attribute.updateRange.offset = startIndex;
      attribute.updateRange.count = actualCount;
    }

    return true;
  } catch (error) {
    console.error('SafeUpdateBufferAttribute: Error updating attribute:', error);
    return false;
  }
};

/**
 * Validate buffer attribute consistency
 * @param {THREE.BufferGeometry} geometry - The geometry to validate
 */
export const validateBufferGeometry = (geometry) => {
  if (!geometry || !geometry.attributes) {
    return false;
  }

  const position = geometry.attributes.position;
  if (!position) {
    return false;
  }

  const expectedCount = position.count;

  // Check all attributes have consistent counts
  for (const [name, attribute] of Object.entries(geometry.attributes)) {
    if (attribute.count !== expectedCount) {
      console.warn(`BufferGeometry validation failed: ${name} attribute count (${attribute.count}) doesn't match position count (${expectedCount})`);
      return false;
    }
  }

  return true;
};

/**
 * Create a safe buffer attribute with proper usage flags
 * @param {Float32Array|Uint16Array} array - The data array
 * @param {number} itemSize - Number of components per vertex
 * @param {boolean} dynamic - Whether the attribute will be updated frequently
 */
export const createSafeBufferAttribute = (array, itemSize, dynamic = false) => {
  const attribute = new THREE.BufferAttribute(array, itemSize);
  
  if (dynamic) {
    attribute.usage = THREE.DynamicDrawUsage;
  } else {
    attribute.usage = THREE.StaticDrawUsage;
  }

  return attribute;
};

/**
 * Dispose of buffer geometry safely
 * @param {THREE.BufferGeometry} geometry - The geometry to dispose
 */
export const safeDisposeGeometry = (geometry) => {
  if (!geometry) return;

  try {
    // Dispose of all attributes
    if (geometry.attributes) {
      for (const attribute of Object.values(geometry.attributes)) {
        if (attribute && typeof attribute.dispose === 'function') {
          attribute.dispose();
        }
      }
    }

    // Dispose of index if present
    if (geometry.index) {
      geometry.index.dispose();
    }

    // Dispose of the geometry itself
    geometry.dispose();
  } catch (error) {
    console.warn('Error disposing geometry:', error);
  }
};

/**
 * Monitor buffer attribute updates for debugging
 * @param {THREE.BufferAttribute} attribute - The attribute to monitor
 * @param {string} name - Name for logging
 */
export const monitorBufferAttribute = (attribute, name = 'unknown') => {
  if (!attribute) return;

  const originalUpdate = attribute.needsUpdate;
  
  Object.defineProperty(attribute, 'needsUpdate', {
    get() {
      return originalUpdate;
    },
    set(value) {
      if (value && process.env.NODE_ENV === 'development') {
        console.log(`BufferAttribute ${name} marked for update. Array length: ${attribute.array.length}, Count: ${attribute.count}`);
      }
      originalUpdate = value;
    }
  });
};

export default {
  safeUpdateBufferAttribute,
  validateBufferGeometry,
  createSafeBufferAttribute,
  safeDisposeGeometry,
  monitorBufferAttribute
};
