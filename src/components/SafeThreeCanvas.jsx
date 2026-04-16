import React from 'react';

/**
 * SafeThreeCanvas - Pass-through wrapper.
 *
 * Previous global monkey patches to console/THREE internals were removed
 * to avoid runtime overhead and unpredictable side effects.
 */
const SafeThreeCanvas = ({ children, ...props }) => {
  return children;
};

export default SafeThreeCanvas;
