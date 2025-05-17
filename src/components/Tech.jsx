import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { SectionWrapper } from "../hoc";
import { technologies } from "../constants";
import { textVariant } from "../utils/motion";
import { styles } from "../styles";
import CircularGallery from "./CircularGallery";
import StarryBackground from "./StarryBackground";

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

      {/* Circular Gallery */}
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
    </div>
  );
};

export default SectionWrapper(Tech, "technologies");
