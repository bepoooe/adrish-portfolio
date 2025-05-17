import React from 'react';
import { motion } from 'framer-motion';
import { styles } from '../styles';

const Hero = () => {
  // Mock-up for scroll tracking
  const [scrollY, setScrollY] = React.useState(0);
  
  React.useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    
    // Add scroll listener
    window.addEventListener('scroll', handleScroll);
    
    // Cleanup
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);
  
  return (
    <motion.section 
      className="relative w-full h-full mx-auto overflow-visible"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
      style={{ 
        opacity: scrollY > 300 ? 1 - (scrollY - 300) / 300 : 1, // Fade out effect when scrolling down
      }}
    >
      <motion.div 
        className="stars-container absolute inset-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.5 }}
      >
        <div className="stars stars-small"></div>
        <div className="stars stars-medium"></div>
        <div className="stars stars-large"></div>
      </motion.div>
      
      <div className="hero-content-wrapper" style={{ position: 'relative', zIndex: 5 }}>
        {/* Left side - Text content */}
        <div className="hero-text-container" style={{ position: 'relative', zIndex: 10 }}>
          <div className="flex flex-col justify-center items-center h-full">
            <div className="w-5 h-5 rounded-full bg-[#6382ff]" />
            <div className="w-1 sm:h-80 h-40 blue-gradient" />
          </div>
          
          <div className="hero-text-content" style={{ position: 'relative', zIndex: 10 }}>
            <motion.h1 
              className="text-white hero-main-text mb-0"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, type: "spring", stiffness: 100 }}
              style={{ textShadow: '0 0 10px rgba(0, 0, 0, 0.5)' }} // Add text shadow for better readability
            >
              <motion.span
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2, duration: 0.6, type: "spring" }}
                whileHover={{ scale: 1.05, color: "#6382ff" }}
              >
                Hi,<br />
              </motion.span>
              <motion.span
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4, duration: 0.6, type: "spring" }}
                whileHover={{ scale: 1.05, color: "#6382ff" }}
              >
                My name is<br />
              </motion.span>
              <motion.span 
                className="text-[#6382ff]"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6, duration: 0.6, type: "spring" }}
                whileHover={{ scale: 1.05 }}
              >
                Adrish
              </motion.span>
            </motion.h1>
            <motion.p 
              className="mt-2 text-white-100 hero-sub-text"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.8, type: "spring", damping: 12 }}
              whileHover={{ color: "#6382ff", scale: 1.02 }}
              style={{ 
                textShadow: '0 0 8px rgba(0, 0, 0, 0.7)',  // Add text shadow for better readability
                position: 'relative',
                zIndex: 10
              }}
            >
              Flip through the<br />
              pages of my<br />
              professional career
            </motion.p>
          </div>
        </div>
        
        {/* Right side will contain the book card (positioned via CSS) */}
        <div className="hero-right-space"></div>
      </div>
      


      {/* Book-themed decorative elements - with mobile-friendly positioning */}
      <motion.div 
        className="absolute w-24 h-24 bg-[#6382ff]/10 filter blur-md hidden md:block"
        animate={{
          x: [0, 20, 0],
          y: [0, 15, 0],
          rotate: [0, 5, 0]
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          repeatType: "reverse",
        }}
        style={{
          top: '30%',
          left: '20%',
          borderRadius: '5px',
          transform: 'rotate(15deg)'
        }}
      />
      <motion.div 
        className="absolute w-32 h-40 bg-[#4d7eff]/10 filter blur-md hidden md:block"
        animate={{
          x: [0, -15, 0],
          y: [0, -10, 0],
          rotate: [0, -3, 0]
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          repeatType: "reverse",
        }}
        style={{
          top: '50%',
          right: '25%',
          borderRadius: '5px',
          transform: 'rotate(-10deg)'
        }}
      />
      <motion.div 
        className="absolute w-20 h-28 bg-[#ff4d7e]/10 filter blur-md hidden md:block"
        animate={{
          x: [0, 10, 0],
          y: [0, -5, 0],
          rotate: [0, 8, 0]
        }}
        transition={{
          duration: 7,
          repeat: Infinity,
          repeatType: "reverse",
        }}
        style={{
          top: '35%',
          right: '45%',
          borderRadius: '5px',
          transform: 'rotate(5deg)'
        }}
      />
      
      {/* Mobile-specific decorative elements - smaller and better positioned */}
      <motion.div 
        className="absolute w-16 h-16 bg-[#6382ff]/10 filter blur-sm md:hidden"
        animate={{
          x: [0, 10, 0],
          y: [0, 8, 0],
          rotate: [0, 3, 0]
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          repeatType: "reverse",
        }}
        style={{
          top: '5%',  // Moved higher to avoid text overlap
          left: '5%', // Moved further left
          borderRadius: '5px',
          transform: 'rotate(10deg)',
          zIndex: 0  // Ensure it stays behind text
        }}
      />
      <motion.div 
        className="absolute w-20 h-24 bg-[#4d7eff]/10 filter blur-sm md:hidden"
        animate={{
          x: [0, -8, 0],
          y: [0, -5, 0],
          rotate: [0, -2, 0]
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          repeatType: "reverse",
        }}
        style={{
          top: '10%',  // Moved higher to avoid text overlap
          right: '5%', // Moved further right
          borderRadius: '5px',
          transform: 'rotate(-5deg)',
          zIndex: 0  // Ensure it stays behind text
        }}
      />
      
      {/* Floating paper elements - desktop */}
      <motion.div
        className="absolute w-10 h-14 bg-white/5 backdrop-blur-sm hidden md:block"
        animate={{
          y: [-10, 10, -10],
          rotate: [0, 5, 0]
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          repeatType: "reverse",
        }}
        style={{
          top: '25%',
          left: '35%',
          borderRadius: '2px',
          transform: 'rotate(10deg)'
        }}
      />
      <motion.div
        className="absolute w-8 h-12 bg-white/5 backdrop-blur-sm hidden md:block"
        animate={{
          y: [5, -5, 5],
          rotate: [0, -3, 0]
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          repeatType: "reverse",
        }}
        style={{
          top: '60%',
          left: '55%',
          borderRadius: '2px',
          transform: 'rotate(-5deg)'
        }}
      />
      
      {/* Floating paper elements - mobile */}
      <motion.div
        className="absolute w-8 h-10 bg-white/5 backdrop-blur-sm md:hidden"
        animate={{
          y: [-5, 5, -5],
          rotate: [0, 3, 0]
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          repeatType: "reverse",
        }}
        style={{
          top: '5%',  // Moved higher to avoid text overlap
          left: '70%', // Moved to the right side
          borderRadius: '2px',
          transform: 'rotate(5deg)',
          zIndex: 0  // Ensure it stays behind text
        }}
      />
      <motion.div
        className="absolute w-6 h-9 bg-white/5 backdrop-blur-sm md:hidden"
        animate={{
          y: [3, -3, 3],
          rotate: [0, -2, 0]
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          repeatType: "reverse",
        }}
        style={{
          top: '60%',  // Moved lower to avoid text overlap
          left: '80%', // Moved further right
          borderRadius: '2px',
          transform: 'rotate(-3deg)',
          zIndex: 0  // Ensure it stays behind text
        }}
      />
    </motion.section>
  );
};

export default Hero;
