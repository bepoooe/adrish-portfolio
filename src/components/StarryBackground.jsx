import React, { useEffect, useRef, useState, useMemo } from 'react';
import './StarryBackground.css';
import { useDevice } from '../context/DeviceContext';

// Memory-optimized starry background with significantly fewer DOM elements
const StarryBackground = ({ density = 100 }) => {
  const { isMobile, isLowPerformance } = useDevice();
  const canvasRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const animationRef = useRef(null);

  // Reduce density based on device capability
  const adjustedDensity = useMemo(() => {
    if (isLowPerformance) return Math.floor(density * 0.3);
    if (isMobile) return Math.floor(density * 0.5);
    return density;
  }, [density, isMobile, isLowPerformance]);

  // Create star data only once
  const starData = useMemo(() => {
    // Significantly reduced star count
    const starCount = Math.min(adjustedDensity * 2, 100);
    const stars = [];

    // Create stars with varied properties
    for (let i = 0; i < starCount; i++) {
      stars.push({
        x: Math.random(),
        y: Math.random(),
        size: Math.random() < 0.8 ? 0.5 + Math.random() * 0.5 : 1 + Math.random() * 1.5,
        opacity: 0.5 + Math.random() * 0.5,
        twinkleSpeed: 0.5 + Math.random() * 2,
        twinkleOffset: Math.random() * Math.PI * 2,
        color: Math.random() < 0.8 ? '#FFFFFF' :
               Math.random() < 0.5 ? '#F8F7FF' : '#FFE9D1'
      });
    }

    return stars;
  }, [adjustedDensity]);

  // Create shooting star data
  const shootingStarData = useMemo(() => {
    // Very few shooting stars
    const count = Math.min(Math.floor(adjustedDensity / 50), 3);
    const shootingStars = [];

    for (let i = 0; i < count; i++) {
      shootingStars.push({
        active: false,
        x: 0,
        y: 0,
        length: 50 + Math.random() * 30,
        angle: -5 - Math.random() * 30,
        speed: 0.5 + Math.random() * 1,
        delay: 5 + Math.random() * 15
      });
    }

    return shootingStars;
  }, [adjustedDensity]);

  // Handle resize
  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current) {
        const { width, height } = canvasRef.current.getBoundingClientRect();
        setDimensions({ width, height });

        // Update canvas size
        canvasRef.current.width = width;
        canvasRef.current.height = height;
      }
    };

    // Initial size
    handleResize();

    // Add resize listener with debounce
    let resizeTimer;
    const debouncedResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(handleResize, 100);
    };

    window.addEventListener('resize', debouncedResize);
    return () => {
      clearTimeout(resizeTimer);
      window.removeEventListener('resize', debouncedResize);
    };
  }, []);

  // Animation loop
  useEffect(() => {
    if (!canvasRef.current || dimensions.width === 0) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    // Time tracking
    let lastTime = 0;
    let shootingStarTimer = 0;

    // Animation function
    const animate = (time) => {
      // Convert to seconds
      time *= 0.001;
      const deltaTime = time - lastTime;
      lastTime = time;

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw stars with twinkling effect
      starData.forEach(star => {
        const x = star.x * canvas.width;
        const y = star.y * canvas.height;

        // Calculate twinkling
        const twinkle = 0.5 + 0.5 * Math.sin(time * star.twinkleSpeed + star.twinkleOffset);
        const opacity = star.opacity * twinkle;

        // Draw star
        ctx.beginPath();
        ctx.arc(x, y, star.size, 0, Math.PI * 2);
        ctx.fillStyle = star.color;
        ctx.globalAlpha = opacity;
        ctx.fill();

        // Draw glow for larger stars
        if (star.size > 1 && !isLowPerformance) {
          const gradient = ctx.createRadialGradient(x, y, 0, x, y, star.size * 3);
          gradient.addColorStop(0, star.color);
          gradient.addColorStop(1, 'transparent');

          ctx.beginPath();
          ctx.arc(x, y, star.size * 3, 0, Math.PI * 2);
          ctx.fillStyle = gradient;
          ctx.globalAlpha = opacity * 0.3;
          ctx.fill();
        }
      });

      // Update shooting star timer
      shootingStarTimer += deltaTime;

      // Process shooting stars
      shootingStarData.forEach(shootingStar => {
        // Check if we should activate a new shooting star
        if (!shootingStar.active) {
          if (shootingStarTimer > shootingStar.delay) {
            shootingStar.active = true;
            shootingStar.x = Math.random() * canvas.width;
            shootingStar.y = Math.random() * (canvas.height * 0.3);
            shootingStar.progress = 0;
            shootingStarTimer = 0;
          }
        } else {
          // Update active shooting star
          shootingStar.progress += deltaTime * shootingStar.speed;

          if (shootingStar.progress >= 1) {
            shootingStar.active = false;
            shootingStar.delay = 5 + Math.random() * 15;
          } else {
            // Draw shooting star
            const angleRad = shootingStar.angle * Math.PI / 180;
            const tailX = shootingStar.x;
            const tailY = shootingStar.y;
            const headX = tailX + Math.cos(angleRad) * shootingStar.length * shootingStar.progress;
            const headY = tailY + Math.sin(angleRad) * shootingStar.length * shootingStar.progress;

            // Create gradient for tail
            const gradient = ctx.createLinearGradient(tailX, tailY, headX, headY);
            gradient.addColorStop(0, 'transparent');
            gradient.addColorStop(0.3, 'rgba(255, 255, 255, 0.1)');
            gradient.addColorStop(1, 'rgba(255, 255, 255, 0.7)');

            // Draw line
            ctx.beginPath();
            ctx.moveTo(tailX, tailY);
            ctx.lineTo(headX, headY);
            ctx.strokeStyle = gradient;
            ctx.lineWidth = 1;
            ctx.globalAlpha = 1;
            ctx.stroke();

            // Draw head glow
            if (!isLowPerformance) {
              const headGlow = ctx.createRadialGradient(headX, headY, 0, headX, headY, 3);
              headGlow.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
              headGlow.addColorStop(1, 'transparent');

              ctx.beginPath();
              ctx.arc(headX, headY, 3, 0, Math.PI * 2);
              ctx.fillStyle = headGlow;
              ctx.globalAlpha = 0.8;
              ctx.fill();
            }
          }
        }
      });

      // Reset global alpha
      ctx.globalAlpha = 1;

      // Continue animation loop
      animationRef.current = requestAnimationFrame(animate);
    };

    // Start animation
    animationRef.current = requestAnimationFrame(animate);

    // Cleanup
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [dimensions, starData, shootingStarData, isLowPerformance]);

  return (
    <div className="starry-background">
      <canvas
        ref={canvasRef}
        className="stars-canvas"
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  );
};

export default StarryBackground;
