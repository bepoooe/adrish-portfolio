import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { SectionWrapper } from "../hoc";
import { technologies } from "../constants";
import { textVariant } from "../utils/motion";
import { styles } from "../styles";
import CircularGallery from "./CircularGallery";
import StarryBackground from "./StarryBackground";

// CSS for mobile tech carousel with horizontal scrolling and enhanced animations
const mobileTechStyles = `
  .mobile-tech-carousel {
    width: 100%;
    overflow-x: auto;
    position: relative;
    padding: 20px 0;
    margin-top: 20px;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none; /* Firefox */
    -ms-overflow-style: none; /* IE and Edge */
    cursor: grab;
    touch-action: pan-x;
  }
  
  .mobile-tech-carousel:active {
    cursor: grabbing;
  }
  
  .mobile-tech-carousel::-webkit-scrollbar {
    display: none; /* Chrome, Safari, Opera */
  }
  
  .mobile-tech-track {
    display: flex;
    gap: 16px;
    padding: 0 20px;
    will-change: transform;
    min-width: max-content;
    animation: scrollTech 60s linear infinite;
    animation-play-state: running;
  }
  
  .mobile-tech-carousel:hover .mobile-tech-track,
  .mobile-tech-carousel:active .mobile-tech-track {
    animation-play-state: paused;
  }
  
  @keyframes scrollTech {
    0% { transform: translateX(0); }
    100% { transform: translateX(calc(-100px * 21)); }
  }
  
  .mobile-tech-item {
    flex: 0 0 auto;
    display: flex;
    flex-direction: column;
    align-items: center;
    background: rgba(4, 7, 20, 0.4);
    border-radius: 50%;
    padding: 8px;
    width: 80px;
    height: 80px;
    box-shadow: 0 0 15px rgba(59, 130, 246, 0.2);
    border: 1px solid rgba(59, 130, 246, 0.2);
    transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    position: relative;
    overflow: hidden;
    transform: translateZ(0);
    will-change: transform, box-shadow;
    backdrop-filter: blur(8px);
  }
  
  .mobile-tech-item:active {
    transform: scale(0.92);
  }
  
  .mobile-tech-item::before {
    content: '';
    position: absolute;
    top: -1px;
    left: -1px;
    right: -1px;
    bottom: -1px;
    border-radius: 50%;
    background: linear-gradient(45deg, rgba(15, 23, 41, 0.3), rgba(17, 24, 39, 0.3), rgba(23, 37, 84, 0.3), rgba(12, 74, 110, 0.3));
    z-index: -2;
  }
  
  .mobile-tech-item::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    border-radius: 50%;
    background: radial-gradient(circle at center, transparent 60%, rgba(59, 130, 246, 0.1));
    opacity: 0;
    transition: opacity 0.3s ease;
    pointer-events: none;
    z-index: 1;
  }
  
  .mobile-tech-item:hover::after {
    opacity: 1;
  }
  
  .mobile-tech-item:hover {
    transform: translateY(-5px) scale(1.05);
    box-shadow: 0 5px 20px rgba(59, 130, 246, 0.3), 0 0 30px rgba(59, 130, 246, 0.2);
    border-color: rgba(59, 130, 246, 0.4);
    background: rgba(4, 7, 20, 0.3);
  }
  
  .mobile-tech-icon-container {
    width: 60%;
    height: 60%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 4px;
    position: relative;
    z-index: 2;
    background: radial-gradient(circle at center, rgba(59, 130, 246, 0.03), transparent);
    border-radius: 50%;
    padding: 6px;
  }
  
  .mobile-tech-icon {
    width: 100%;
    height: 100%;
    object-fit: contain;
    filter: drop-shadow(0 0 2px rgba(59, 130, 246, 0.3));
    transition: transform 0.3s ease, filter 0.3s ease;
  }
  
  .mobile-tech-item:hover .mobile-tech-icon {
    filter: drop-shadow(0 0 5px rgba(59, 130, 246, 0.5));
    transform: scale(1.1) rotate(3deg);
  }
  
  .mobile-tech-letter {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: rgba(255, 255, 255, 0.9);
    font-weight: bold;
    font-size: 16px;
    transition: all 0.3s ease;
    background: linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0) 100%);
    box-shadow: 0 0 8px rgba(255, 255, 255, 0.1);
    text-shadow: 0 2px 3px rgba(0, 0, 0, 0.3);
  }
  
  .mobile-tech-item:hover .mobile-tech-letter {
    transform: scale(1.1);
    box-shadow: 0 0 10px rgba(255, 255, 255, 0.2);
  }
  
  .mobile-tech-name {
    font-size: 10px;
    color: rgba(240, 240, 255, 0.8);
    text-align: center;
    font-weight: 400;
    max-width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    transition: all 0.3s ease;
    position: relative;
    z-index: 2;
    margin-top: 6px;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
    letter-spacing: 0.5px;
  }
  
  .mobile-tech-item:hover .mobile-tech-name {
    color: rgba(255, 255, 255, 0.95);
    text-shadow: 0 0 3px rgba(59, 130, 246, 0.5);
    transform: translateY(1px);
  }
  
  /* Subtle border glow effect */
  .mobile-tech-item::before {
    content: '';
    position: absolute;
    inset: -1px;
    background: linear-gradient(
      135deg,
      rgba(59, 130, 246, 0.2) 0%,
      rgba(30, 64, 175, 0.2) 25%,
      rgba(59, 130, 246, 0.2) 50%,
      rgba(30, 64, 175, 0.2) 75%,
      rgba(59, 130, 246, 0.2) 100%
    );
    border-radius: 50%;
    z-index: -1;
    opacity: 0.3;
    transition: opacity 0.4s ease;
  }
  
  .mobile-tech-item:hover::before {
    opacity: 0.6;
    animation: spin 8s linear infinite;
  }
  
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  

  
  /* No gradient fade effect on edges */
  
  /* For larger mobile screens */
  @media (min-width: 400px) {
    .mobile-tech-item {
      width: 90px;
      height: 90px;
    }
    
    .mobile-tech-name {
      font-size: 11px;
    }
  }
  
  /* For medium-sized mobile screens */
  @media (min-width: 500px) {
    .mobile-tech-item {
      width: 100px;
      height: 100px;
    }
  }
`;

// Create ball-shaped tech icon images for the gallery like in the reference image
const createTechImage = (technology) => {
  // Tech icon base URLs - these are the actual tech logo images
  const techIconUrls = {
    // Programming Languages
    c: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/c/c-original.svg',
    java: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/java/java-original.svg',
    python: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg',
    javascript: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg',
    typescript: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg',
    html: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/html5/html5-original.svg',
    css: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/css3/css3-original.svg',
    vhdl: 'https://img.icons8.com/color/48/000000/integrated-circuit.png', // VHDL doesn't have a standard icon, using a chip icon
    
    // Frameworks & Libraries
    react: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg',
    nextjs: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nextjs/nextjs-original.svg',
    nodejs: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg',
    threejs: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/threejs/threejs-original.svg',
    tailwind: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/tailwindcss/tailwindcss-original.svg',
    render: 'https://cdn.simpleicons.org/render/46E3B7',
    flask: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/flask/flask-original.svg',
    numpy: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/numpy/numpy-original.svg',
    pandas: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/pandas/pandas-original.svg',
    matplotlib: 'https://upload.wikimedia.org/wikipedia/commons/8/84/Matplotlib_icon.svg',
    
    // Tools & Databases
    mongodb: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mongodb/mongodb-original.svg',
    git: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/git/git-original.svg',
    figma: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/figma/figma-original.svg'
  };
  
  // If no icon URL is found, create one with the first letter
  const iconUrl = techIconUrls[technology.icon] || `https://via.placeholder.com/100x100/${technology.color.substring(1)}/FFFFFF/?text=${technology.icon.charAt(0).toUpperCase()}`;
  
  // Create a canvas with the icon in a perfect circle
  const canvas = document.createElement('canvas');
  const size = 130; // Slightly larger for better quality
  
  // Make sure width and height are exactly the same to get a perfect circle
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  
  // Clear the canvas first
  ctx.clearRect(0, 0, size, size);
  
  // Create a perfect circle background - dark navy blue like in the image
  ctx.beginPath();
  ctx.arc(size/2, size/2, size/2 - 3, 0, Math.PI * 2);
  ctx.fillStyle = '#040714'; // Very dark blue/black background like in the image
  ctx.fill();
  
  // Draw circular colored border like in the reference image
  ctx.lineWidth = 2;
  ctx.strokeStyle = technology.color;
  ctx.stroke();
  
  // Create image to load the tech icon
  const img = new Image();
  img.crossOrigin = 'Anonymous'; // Enable CORS for the image
  
  // Return a promise that resolves with the canvas data URL
  return new Promise((resolve) => {
    img.onload = () => {
      // Calculate icon dimensions to fit in the circle with padding
      // Make the icon slightly smaller to ensure it fits nicely in the circle
      const iconSize = Math.round(size * 0.55);
      const padding = (size - iconSize) / 2;
      
      // Draw the icon in the center of the circle
      ctx.drawImage(img, padding, padding, iconSize, iconSize);
      
      // Add a more pronounced glow effect to match the aesthetic theme
      // First draw the outer glow
      ctx.shadowColor = technology.color;
      ctx.shadowBlur = 15;
      ctx.beginPath();
      ctx.arc(size/2, size/2, size/2 - 4, 0, Math.PI * 2);
      ctx.strokeStyle = `${technology.color}`;
      ctx.lineWidth = 2;
      ctx.stroke();
      
      // Add a subtle inner glow
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.arc(size/2, size/2, size/2 - 10, 0, Math.PI * 2);
      ctx.strokeStyle = `${technology.color}80`;  // Semi-transparent for inner glow
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.shadowBlur = 0;
      
      // Return the image data and tech name
      resolve({
        image: canvas.toDataURL('image/png'),
        text: technology.name
      });
    };
    
    // Handle loading errors
    img.onerror = () => {
      // If image fails to load, create a fallback with text
      ctx.fillStyle = technology.color;
      ctx.font = 'bold 50px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(technology.icon.charAt(0).toUpperCase(), size/2, size/2);
      
      resolve({
        image: canvas.toDataURL('image/png'),
        text: technology.name
      });
    };
    
    // Start loading the image
    img.src = iconUrl;
  });
};

const Tech = () => {
  const [galleryItems, setGalleryItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  
  // Add mobile detection
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    // Initial check
    checkMobile();
    
    // Listen for window resize
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  useEffect(() => {
    const loadTechImages = async () => {
      setLoading(true);
      try {
        // Create all tech images in parallel using Promise.all
        const techImagesPromises = technologies.map(tech => createTechImage(tech));
        const resolvedImages = await Promise.all(techImagesPromises);
        setGalleryItems(resolvedImages);
      } catch (error) {
        console.error('Error creating tech images:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadTechImages();
  }, []);

  // Get the correct icon URL for each technology
  const getTechIconUrl = (tech) => {
    // Tech icon base URLs - these are the actual tech logo images
    const techIconUrls = {
      // Programming Languages
      c: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/c/c-original.svg',
      java: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/java/java-original.svg',
      python: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg',
      javascript: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg',
      typescript: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg',
      html: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/html5/html5-original.svg',
      css: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/css3/css3-original.svg',
      vhdl: 'https://img.icons8.com/color/48/000000/integrated-circuit.png', // VHDL doesn't have a standard icon, using a chip icon
      
      // Frameworks & Libraries
      react: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg',
      nextjs: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nextjs/nextjs-original.svg',
      nodejs: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg',
      threejs: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/threejs/threejs-original.svg',
      tailwind: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/tailwindcss/tailwindcss-original.svg',
      render: 'https://cdn.simpleicons.org/render/46E3B7',
      flask: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/flask/flask-original.svg',
      numpy: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/numpy/numpy-original.svg',
      pandas: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/pandas/pandas-original.svg',
      matplotlib: 'https://upload.wikimedia.org/wikipedia/commons/8/84/Matplotlib_icon.svg',
      
      // Tools & Databases
      mongodb: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mongodb/mongodb-original.svg',
      git: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/git/git-original.svg',
      figma: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/figma/figma-original.svg'
    };
    
    return techIconUrls[tech.icon] || `https://cdn.jsdelivr.net/gh/devicons/devicon/icons/${tech.icon}/${tech.icon}-original.svg`;
  };

  // Render mobile tech carousel with horizontal scrolling animation
  const renderMobileTechCarousel = () => {
    return (
      <>
        <style>{mobileTechStyles}</style>
        <div className="mobile-tech-carousel">
          <div className="mobile-tech-track">
            {/* First set of items */}
            {technologies.map((tech, index) => (
              <motion.div 
                key={`tech-${index}`}
                className="mobile-tech-item"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ 
                  duration: 0.5, 
                  delay: index * 0.03,
                  ease: "easeOut"
                }}
                whileHover={{ 
                  y: -5, 
                  scale: 1.05,
                  transition: { duration: 0.2 } 
                }}
                whileTap={{ scale: 0.92 }}
              >
                <div className="mobile-tech-icon-container">
                  {tech.icon === "vhdl" ? (
                    <img 
                      src="https://img.icons8.com/color/48/000000/integrated-circuit.png"
                      alt={tech.name}
                      className="mobile-tech-icon"
                    />
                  ) : tech.icon === "render" ? (
                    <img 
                      src="https://cdn.simpleicons.org/render/46E3B7"
                      alt={tech.name}
                      className="mobile-tech-icon"
                    />
                  ) : tech.icon === "matplotlib" ? (
                    <img 
                      src="https://upload.wikimedia.org/wikipedia/commons/8/84/Matplotlib_icon.svg"
                      alt={tech.name}
                      className="mobile-tech-icon"
                    />
                  ) : (
                    <img 
                      src={getTechIconUrl(tech)}
                      alt={tech.name}
                      className="mobile-tech-icon"
                      onError={(e) => {
                        // Create a colored circle with the first letter as fallback
                        e.target.style.display = "none";
                        const parent = e.target.parentNode;
                        
                        // Check if we already created a fallback
                        if (!parent.querySelector('.mobile-tech-letter')) {
                          const letter = document.createElement("div");
                          letter.className = "mobile-tech-letter";
                          letter.style.backgroundColor = tech.color;
                          letter.textContent = tech.name.charAt(0).toUpperCase();
                          parent.appendChild(letter);
                        }
                      }}
                    />
                  )}
                </div>
                <span className="mobile-tech-name">{tech.name}</span>
                
                {/* Add cosmic glow effect */}
                <motion.div
                  className="absolute inset-0 rounded-full"
                  style={{ 
                    backgroundColor: `${tech.color}10`,
                    boxShadow: `0 0 15px ${tech.color}40`
                  }}
                  animate={{
                    boxShadow: [
                      `0 0 10px ${tech.color}30`,
                      `0 0 15px ${tech.color}50`,
                      `0 0 10px ${tech.color}30`
                    ]
                  }}
                  transition={{
                    duration: 2,
                    ease: "easeInOut",
                    repeat: Infinity,
                    repeatType: "reverse"
                  }}
                />
              </motion.div>
            ))}
            
            {/* Duplicate all items to create a seamless loop effect */}
            {technologies.map((tech, index) => (
              <motion.div 
                key={`tech-dup-${index}`}
                className="mobile-tech-item"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ 
                  duration: 0.5, 
                  delay: (technologies.length + index) * 0.03,
                  ease: "easeOut"
                }}
                whileHover={{ 
                  y: -5, 
                  scale: 1.05,
                  transition: { duration: 0.2 } 
                }}
                whileTap={{ scale: 0.92 }}
              >
                <div className="mobile-tech-icon-container">
                  {tech.icon === "vhdl" ? (
                    <img 
                      src="https://img.icons8.com/color/48/000000/integrated-circuit.png"
                      alt={tech.name}
                      className="mobile-tech-icon"
                    />
                  ) : tech.icon === "render" ? (
                    <img 
                      src="https://cdn.simpleicons.org/render/46E3B7"
                      alt={tech.name}
                      className="mobile-tech-icon"
                    />
                  ) : tech.icon === "matplotlib" ? (
                    <img 
                      src="https://upload.wikimedia.org/wikipedia/commons/8/84/Matplotlib_icon.svg"
                      alt={tech.name}
                      className="mobile-tech-icon"
                    />
                  ) : (
                    <img 
                      src={getTechIconUrl(tech)}
                      alt={tech.name}
                      className="mobile-tech-icon"
                      onError={(e) => {
                        // Create a colored circle with the first letter as fallback
                        e.target.style.display = "none";
                        const parent = e.target.parentNode;
                        
                        // Check if we already created a fallback
                        if (!parent.querySelector('.mobile-tech-letter')) {
                          const letter = document.createElement("div");
                          letter.className = "mobile-tech-letter";
                          letter.style.backgroundColor = tech.color;
                          letter.textContent = tech.name.charAt(0).toUpperCase();
                          parent.appendChild(letter);
                        }
                      }}
                    />
                  )}
                </div>
                <span className="mobile-tech-name">{tech.name}</span>
                
                {/* Add cosmic glow effect */}
                <motion.div
                  className="absolute inset-0 rounded-full"
                  style={{ 
                    backgroundColor: `${tech.color}10`,
                    boxShadow: `0 0 15px ${tech.color}40`
                  }}
                  animate={{
                    boxShadow: [
                      `0 0 10px ${tech.color}30`,
                      `0 0 15px ${tech.color}50`,
                      `0 0 10px ${tech.color}30`
                    ]
                  }}
                  transition={{
                    duration: 2,
                    ease: "easeInOut",
                    repeat: Infinity,
                    repeatType: "reverse"
                  }}
                />
              </motion.div>
            ))}
          </div>
          

        </div>
      </>
    );
  };

  return (
    <div className="w-full flex flex-col items-center relative">
      <StarryBackground density={250} />
      {/* Animated Header */}
      <motion.div variants={textVariant()}>
        <p className={`${styles.sectionSubText} text-center`}>
          What I have done so far
        </p>
        <h2 className={`${styles.sectionHeadText} text-center`}>
          Technologies I've Worked With
        </h2>
      </motion.div>

      {/* Conditional rendering based on device */}
      {isMobile ? (
        // Mobile view - horizontal scrolling carousel
        loading ? (
          <div className="w-full h-[300px] flex justify-center items-center">
            <motion.div 
              className="w-16 h-16 relative"
              animate={{ rotate: 360 }}
              transition={{ 
                duration: 2,
                ease: "linear",
                repeat: Infinity
              }}
            >
              <div className="absolute inset-0 rounded-full border-t-4 border-b-4 border-blue-500 opacity-75"></div>
              <motion.div 
                className="absolute inset-0 rounded-full border-l-4 border-r-4 border-blue-300"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ 
                  duration: 1.5,
                  ease: "easeInOut",
                  repeat: Infinity
                }}
              ></motion.div>
            </motion.div>
          </div>
        ) : (
          renderMobileTechCarousel()
        )
      ) : (
        // Desktop view - circular gallery (unchanged)
        <div className="w-full max-w-5xl mx-auto h-[300px] sm:h-[350px] md:h-[400px] mt-4 sm:mt-6 relative">
          <div className="px-2 sm:px-4 w-full h-full">
          {loading ? (
            <div className="w-full h-full flex justify-center items-center">
              <div className="w-16 h-16 border-t-4 border-b-4 border-blue-500 rounded-full animate-spin"></div>
            </div>
          ) : galleryItems.length > 0 ? (
            <CircularGallery 
              items={galleryItems}
              bend={-1.8}
              textColor="#f0f0ff"
              borderRadius={0}
              font="bold 14px DM Sans sm:bold 16px DM Sans"
              preserveAspectRatio={true}
            />
          ) : (
            <div className="w-full h-full flex justify-center items-center text-gray-400">
              Could not load technology icons
            </div>
          )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SectionWrapper(Tech, "technologies");
