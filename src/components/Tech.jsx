import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { SectionWrapper } from "../hoc";
import { technologies } from "../constants";
import { textVariant } from "../utils/motion";
import { styles } from "../styles";
import CircularGallery from "./CircularGallery";
import StarryBackground from "./StarryBackground";

// Spacious circular mobile tech layout inspired by reference design
const mobileTechStyles = `  /* Mobile tech container with generous spacing */
  .mobile-tech-container {
    width: 100%;
    padding: 60px 20px 80px 20px;
    margin: 0 auto;
    background: transparent;
    display: flex;
    justify-content: center;
  }
    /* 3-column grid layout with generous spacing */
  .mobile-tech-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 45px 35px;
    width: 100%;
    max-width: 360px;
    margin: 0 auto;
    justify-content: center;
    align-items: center;
  }
    /* Spacious circular tech items with blue theme */
  .mobile-tech-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 85px;
    height: 85px;
    border-radius: 50%;
    background: rgba(15, 23, 42, 0.4);
    border: 2px solid rgba(59, 130, 246, 0.5);
    transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    cursor: pointer;
    position: relative;
    overflow: visible;
    backdrop-filter: blur(10px);
    margin: 0 auto;
    box-shadow: 
      0 4px 15px rgba(0, 0, 0, 0.2),
      0 0 20px rgba(59, 130, 246, 0.1),
      inset 0 1px 0 rgba(255, 255, 255, 0.05);
  }
  
  /* Enhanced hover effects with blue glow */
  .mobile-tech-item:hover {
    border-color: rgba(59, 130, 246, 0.9);
    background: rgba(15, 23, 42, 0.7);
    transform: translateY(-8px) scale(1.15);
    box-shadow: 
      0 12px 30px rgba(0, 0, 0, 0.3),
      0 0 40px rgba(59, 130, 246, 0.4),
      0 0 60px rgba(59, 130, 246, 0.2),
      inset 0 1px 0 rgba(255, 255, 255, 0.1);
  }
  
  /* Icon styling with proper sizing */
  .mobile-tech-icon {
    width: 48px;
    height: 48px;
    object-fit: contain;
    transition: all 0.4s ease;
    filter: brightness(1.1) contrast(1.05);
  }
  
  .mobile-tech-item:hover .mobile-tech-icon {
    transform: scale(1.2) rotate(5deg);
    filter: brightness(1.3) contrast(1.1) drop-shadow(0 0 15px rgba(59, 130, 246, 0.7));
  }
    /* Tech name styling with proper spacing */
  .mobile-tech-name {
    position: absolute;
    bottom: -35px;
    left: 50%;
    transform: translateX(-50%);
    font-size: 11px;
    color: rgba(255, 255, 255, 0.85);
    text-align: center;
    white-space: nowrap;
    transition: all 0.4s ease;
    font-weight: 600;
    text-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);
    letter-spacing: 0.3px;
  }
    .mobile-tech-item:hover .mobile-tech-name {
    color: rgba(255, 255, 255, 1);
    transform: translateX(-50%) translateY(-3px);
    text-shadow: 0 0 8px rgba(59, 130, 246, 0.8);
  }
  
  /* Responsive adjustments for different screen sizes */  @media (min-width: 375px) {
    .mobile-tech-container {
      padding: 65px 25px 85px 25px;
    }
    
    .mobile-tech-grid {
      gap: 45px 35px;
      max-width: 380px;
    }
    
    .mobile-tech-item {
      width: 90px;
      height: 90px;
    }
    
    .mobile-tech-icon {
      width: 50px;
      height: 50px;
    }
      .mobile-tech-name {
      font-size: 11.5px;
      bottom: -38px;
      left: 50%;
      transform: translateX(-50%);
    }
  }
    @media (min-width: 425px) {
    .mobile-tech-container {
      padding: 70px 30px 90px 30px;
    }
    
    .mobile-tech-grid {
      gap: 50px 40px;
      max-width: 420px;
    }
    
    .mobile-tech-item {
      width: 95px;
      height: 95px;
    }
    
    .mobile-tech-icon {
      width: 52px;
      height: 52px;
    }
      .mobile-tech-name {
      font-size: 12px;
      bottom: -40px;
      left: 50%;
      transform: translateX(-50%);
    }
  }
    @media (min-width: 500px) {
    .mobile-tech-container {
      padding: 75px 35px 95px 35px;
    }
    
    .mobile-tech-grid {
      gap: 55px 45px;
      max-width: 480px;
    }
    
    .mobile-tech-item {
      width: 105px;
      height: 105px;
    }
    
    .mobile-tech-icon {
      width: 56px;
      height: 56px;
    }
      .mobile-tech-name {
      font-size: 12.5px;
      bottom: -42px;
      left: 50%;
      transform: translateX(-50%);
    }
  }
    @media (min-width: 640px) {
    .mobile-tech-container {
      padding: 80px 40px 100px 40px;
    }
    
    .mobile-tech-grid {
      gap: 60px 50px;
      max-width: 540px;
    }
    
    .mobile-tech-item {
      width: 115px;
      height: 115px;
    }
    
    .mobile-tech-icon {
      width: 60px;
      height: 60px;
    }
      .mobile-tech-name {
      font-size: 13px;
      bottom: -45px;
      left: 50%;
      transform: translateX(-50%);
    }
  }
    @media (min-width: 768px) {
    .mobile-tech-container {
      padding: 85px 45px 105px 45px;
    }
    
    .mobile-tech-grid {
      gap: 65px 55px;
      max-width: 600px;
    }
    
    .mobile-tech-item {
      width: 125px;
      height: 125px;
    }
    
    .mobile-tech-icon {
      width: 65px;
      height: 65px;
    }
      .mobile-tech-name {
      font-size: 14px;
      bottom: -48px;
      left: 50%;
      transform: translateX(-50%);
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
  const [loading, setLoading] = useState(true);  const [isMobile, setIsMobile] = useState(false);
  
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
  };  // Simple mobile layout with circular icons
  const renderMobileLayout = () => {
    return (
      <>
        <style>{mobileTechStyles}</style>
        
        <div className="mobile-tech-container">
          <motion.div 
            className="mobile-tech-grid"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ 
              duration: 0.6,
              ease: "easeOut"
            }}
          >
            {technologies.map((tech, index) => (
              <motion.div 
                key={`mobile-tech-${index}`}
                className="mobile-tech-item"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ 
                  duration: 0.4, 
                  delay: index * 0.1,
                  ease: "easeOut",
                  type: "spring",
                  stiffness: 120,
                  damping: 12
                }}
                whileTap={{ scale: 0.9 }}
              >
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
                      // Fallback to first letter if image fails
                      const parent = e.target.parentNode;
                      e.target.style.display = "none";
                      parent.innerHTML = `<div style="
                        width: 40px; 
                        height: 40px; 
                        display: flex; 
                        align-items: center; 
                        justify-content: center; 
                        background: ${tech.color}; 
                        border-radius: 50%; 
                        color: white; 
                        font-weight: bold; 
                        font-size: 18px;
                      ">${tech.name.charAt(0).toUpperCase()}</div>`;
                    }}
                  />
                )}
                <span className="mobile-tech-name">{tech.name}</span>
              </motion.div>
            ))}
          </motion.div>
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
      </motion.div>      {/* Conditional rendering based on device */}
      {isMobile ? (
        // Mobile view - wave layout only
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
          </div>        ) : (
          renderMobileLayout()
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
