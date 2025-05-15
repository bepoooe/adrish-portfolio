export const textVariant = (delay) => {
  return {
    hidden: {
      y: -50,
      opacity: 0,
    },
    show: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        duration: 1.25,
        delay: delay,
        damping: 12,
        stiffness: 100,
        mass: 0.9,
      },
    },
  };
};

export const timelineElementVariant = (delay = 0, direction = "left") => {
  // Detect if we're on mobile for responsive animation adjustments
  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768;
  
  return {
    hidden: { 
      opacity: 0, 
      // Smaller x offset on mobile for subtler animation
      x: direction === "right" ? (isMobile ? 50 : 100) : (isMobile ? -50 : -100),
      // Less dramatic scale change on mobile
      scale: isMobile ? 0.97 : 0.95
    },
    show: {
      opacity: 1,
      x: 0,
      scale: 1,
      transition: {
        // Use tween for mobile for smoother performance
        type: isMobile ? "tween" : "spring",
        // Shorter duration on mobile for snappier feeling
        duration: isMobile ? 0.5 : 0.8,
        delay: isMobile ? Math.min(delay, 0.3) : delay, // Cap delay on mobile
        // Less bouncy spring on mobile
        damping: isMobile ? 25 : 20,
        stiffness: isMobile ? 100 : 90,
        // Smoother easing for mobile
        ease: isMobile ? "easeOut" : [0.25, 0.1, 0.25, 1]
      },
    },
  };
};

export const fadeIn = (direction, type, delay, duration) => {
  return {
    hidden: {
      x: direction === "left" ? 100 : direction === "right" ? -100 : 0,
      y: direction === "up" ? 100 : direction === "down" ? -100 : 0,
      opacity: 0,
    },
    show: {
      x: 0,
      y: 0,
      opacity: 1,
      transition: {
        type: type,
        delay: delay,
        duration: duration,
        ease: [0.25, 0.1, 0.25, 1], // Cubic bezier for smoother easing
      },
    },
  };
};

export const staggerContainer = (staggerChildren, delayChildren) => {
  return {
    hidden: {},
    show: {
      transition: {
        staggerChildren: staggerChildren,
        delayChildren: delayChildren || 0,
      },
    },
  };
};

export const slideIn = (direction, type, delay, duration) => {
  return {
    hidden: {
      x: direction === "left" ? "-100%" : direction === "right" ? "100%" : 0,
      y: direction === "up" ? "100%" : direction === "down" ? "100%" : 0,
    },
    show: {
      x: 0,
      y: 0,
      transition: {
        type,
        delay,
        duration,
        ease: "easeOut",
      },
    },
  };
};
