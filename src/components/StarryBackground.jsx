import React, { useEffect, useRef } from 'react';
import './StarryBackground.css';

const StarryBackground = ({ density = 100 }) => {
  const starsRef = useRef(null);
  const shootingStarsRef = useRef(null);
  const nebulaeRef = useRef(null);
  const starClustersRef = useRef(null);

  // Helper function to get a random star color
  const getRandomStarColor = () => {
    // Real stars have different colors based on temperature
    // Blue/white (hot), yellow (medium), orange/red (cooler)
    const starColors = [
      // White/blue stars (most common in visible night sky)
      { color: '#FFFFFF', glow: 'rgba(255, 255, 255, 0.8)', probability: 0.7 },
      { color: '#F8F7FF', glow: 'rgba(248, 247, 255, 0.8)', probability: 0.1 },
      { color: '#CAE8FF', glow: 'rgba(202, 232, 255, 0.8)', probability: 0.05 },
      
      // Yellow stars (like our sun)
      { color: '#FFF4E8', glow: 'rgba(255, 244, 232, 0.7)', probability: 0.08 },
      { color: '#FFF2D4', glow: 'rgba(255, 242, 212, 0.7)', probability: 0.04 },
      
      // Red/orange stars
      { color: '#FFE9D1', glow: 'rgba(255, 233, 209, 0.6)', probability: 0.02 },
      { color: '#FFDDC7', glow: 'rgba(255, 221, 199, 0.6)', probability: 0.01 }
    ];
    
    // Use weighted probability
    const random = Math.random();
    let cumulativeProbability = 0;
    
    for (const starColor of starColors) {
      cumulativeProbability += starColor.probability;
      if (random <= cumulativeProbability) {
        return starColor;
      }
    }
    
    // Default fallback
    return { color: '#FFFFFF', glow: 'rgba(255, 255, 255, 0.8)' };
  };

  useEffect(() => {
    if (!starsRef.current || !shootingStarsRef.current || !nebulaeRef.current || !starClustersRef.current) return;
    
    // Clear existing elements
    starsRef.current.innerHTML = '';
    shootingStarsRef.current.innerHTML = '';
    nebulaeRef.current.innerHTML = '';
    starClustersRef.current.innerHTML = '';
    
    // 1. Create nebulae (subtle colored clouds) - these should be created first as background
    const nebulaCount = Math.floor(density / 40);
    const nebulaColors = [
      { inner: 'rgba(100, 100, 255, 0.015)', outer: 'rgba(50, 50, 150, 0.005)' }, // Blue
      { inner: 'rgba(255, 100, 100, 0.01)', outer: 'rgba(150, 50, 50, 0.005)' },  // Red
      { inner: 'rgba(100, 255, 100, 0.01)', outer: 'rgba(50, 150, 50, 0.005)' },  // Green
      { inner: 'rgba(255, 180, 100, 0.01)', outer: 'rgba(150, 100, 50, 0.005)' }  // Orange
    ];
    
    for (let i = 0; i < nebulaCount; i++) {
      const nebula = document.createElement('div');
      nebula.className = 'nebula';
      
      // Random position
      nebula.style.left = `${Math.random() * 100}%`;
      nebula.style.top = `${Math.random() * 100}%`;
      
      // Random size (large)
      const size = 200 + Math.random() * 300;
      nebula.style.width = `${size}px`;
      nebula.style.height = `${size}px`;
      
      // Random color from our palette
      const colorIndex = Math.floor(Math.random() * nebulaColors.length);
      nebula.style.setProperty('--nebula-inner-color', nebulaColors[colorIndex].inner);
      nebula.style.setProperty('--nebula-outer-color', nebulaColors[colorIndex].outer);
      
      // Random opacity and blur
      nebula.style.setProperty('--nebula-opacity', `${0.1 + Math.random() * 0.2}`);
      nebula.style.setProperty('--nebula-blur', `${15 + Math.random() * 25}px`);
      
      // Add animation
      nebula.style.animation = `pulse ${30 + Math.random() * 40}s ease-in-out infinite`;
      nebula.style.setProperty('--min-opacity', `${0.05 + Math.random() * 0.1}`);
      nebula.style.setProperty('--max-opacity', `${0.15 + Math.random() * 0.15}`);
      
      nebulaeRef.current.appendChild(nebula);
    }
    
    // 2. Create star clusters (areas with higher star density)
    const clusterCount = Math.floor(density / 30);
    const clusterPositions = [];
    
    for (let i = 0; i < clusterCount; i++) {
      const cluster = document.createElement('div');
      cluster.className = 'star-cluster';
      
      // Random position
      const left = Math.random() * 100;
      const top = Math.random() * 100;
      cluster.style.left = `${left}%`;
      cluster.style.top = `${top}%`;
      
      // Random size
      const size = 50 + Math.random() * 150;
      cluster.style.setProperty('--cluster-size', `${size}px`);
      
      // Store position for later use when creating stars
      clusterPositions.push({ left, top, size });
      
      starClustersRef.current.appendChild(cluster);
    }
    
    // 3. Generate stars with improved realism
    const starTypes = ['star-tiny', 'star-small', 'star-medium', 'star-large', 'star-huge'];
    const starTypeDistribution = [0.65, 0.2, 0.08, 0.05, 0.02]; // Realistic distribution - mostly tiny stars
    const starsDensity = Math.floor(density * 5); // Higher density for more stars
    
    for (let i = 0; i < starsDensity; i++) {
      const star = document.createElement('div');
      
      // Use weighted distribution to favor smaller stars
      const random = Math.random();
      let starTypeIndex = 0;
      let cumulativeProbability = 0;
      
      for (let j = 0; j < starTypeDistribution.length; j++) {
        cumulativeProbability += starTypeDistribution[j];
        if (random <= cumulativeProbability) {
          starTypeIndex = j;
          break;
        }
      }
      
      star.className = `star ${starTypes[starTypeIndex]}`;
      
      // Determine if this star should be part of a cluster
      let isInCluster = false;
      let left = Math.random() * 100;
      let top = Math.random() * 100;
      
      // 30% chance to place star in a cluster if clusters exist
      if (clusterPositions.length > 0 && Math.random() < 0.3) {
        const clusterIndex = Math.floor(Math.random() * clusterPositions.length);
        const cluster = clusterPositions[clusterIndex];
        
        // Place star within the cluster's radius
        const angle = Math.random() * Math.PI * 2;
        const distance = Math.random() * (cluster.size / 2);
        
        // Convert from percentage to pixels and back for accurate circular distribution
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;
        
        const clusterCenterX = (cluster.left / 100) * windowWidth;
        const clusterCenterY = (cluster.top / 100) * windowHeight;
        
        const starX = clusterCenterX + Math.cos(angle) * distance;
        const starY = clusterCenterY + Math.sin(angle) * distance;
        
        left = (starX / windowWidth) * 100;
        top = (starY / windowHeight) * 100;
        isInCluster = true;
      }
      
      // Set position
      star.style.left = `${left}%`;
      star.style.top = `${top}%`;
      
      // Get random star color based on realistic star colors
      const starColor = getRandomStarColor();
      star.style.setProperty('--star-color', starColor.color);
      star.style.setProperty('--glow-color', starColor.glow);
      
      // Add slight blur to some stars for depth perception
      if (Math.random() < 0.3) {
        star.style.setProperty('--blur', `${Math.random() * 0.5}px`);
      }
      
      // Animation variables - realistic twinkling
      const baseDuration = isInCluster ? 3 : 5; // Stars in clusters twinkle faster
      star.style.setProperty('--duration', `${baseDuration + Math.random() * 10}s`);
      star.style.setProperty('--delay', `${Math.random() * 10}s`);
      
      // Brightness based on star type and random variation
      const baseOpacity = 0.3 + (Math.random() * 0.5 * (starTypeIndex + 1) / starTypes.length);
      star.style.setProperty('--max-opacity', `${baseOpacity}`);
      
      starsRef.current.appendChild(star);
    }
    
    // 4. Generate improved shooting stars
    const shootingStarCount = Math.floor(density / 40); // Fewer shooting stars for realism
    
    for (let i = 0; i < shootingStarCount; i++) {
      const shootingStar = document.createElement('div');
      shootingStar.className = 'shooting-star';
      
      // Random position and angle - more realistic angles
      shootingStar.style.left = `${Math.random() * 100}%`;
      shootingStar.style.top = `${Math.random() * 35}%`; // Keep shooting stars higher in the sky
      
      const angle = -5 - Math.random() * 30; // More subtle angles for realistic look
      shootingStar.style.setProperty('--angle', `${angle}deg`);
      shootingStar.style.setProperty('--angle-distance', `${Math.tan(angle * Math.PI / 180)}`);
      
      // Random length and width for variety
      shootingStar.style.setProperty('--length', `${60 + Math.random() * 40}px`);
      shootingStar.style.setProperty('--width', `${0.3 + Math.random() * 0.4}px`);
      
      // Random color - shooting stars can have slight color variations
      const meteorColors = [
        'rgba(255, 255, 255, 0.7)', // White
        'rgba(255, 250, 240, 0.7)', // Slight yellow
        'rgba(240, 240, 255, 0.7)'  // Slight blue
      ];
      const meteorColor = meteorColors[Math.floor(Math.random() * meteorColors.length)];
      shootingStar.style.setProperty('--meteor-color', meteorColor);
      
      // Random glow size and color
      shootingStar.style.setProperty('--glow-size', `${1 + Math.random() * 2}px`);
      shootingStar.style.setProperty('--glow-color', meteorColor.replace('0.7', '0.3'));
      
      // Animation variables - realistic timing
      shootingStar.style.setProperty('--duration', `${0.6 + Math.random() * 1.5}s`); // Faster duration - real meteors are very fast
      shootingStar.style.setProperty('--delay', `${20 + Math.random() * 60}s`); // Much longer delays between shooting stars
      shootingStar.style.setProperty('--meteor-brightness', `${0.7 + Math.random() * 0.3}`);
      
      shootingStarsRef.current.appendChild(shootingStar);
    }
    
  }, [density]);

  return (
    <div className="starry-background">
      <div ref={nebulaeRef} className="stars"></div>
      <div ref={starClustersRef} className="stars"></div>
      <div ref={starsRef} className="stars"></div>
      <div ref={shootingStarsRef} className="stars"></div>
    </div>
  );
};

export default StarryBackground;
