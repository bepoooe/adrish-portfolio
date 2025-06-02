import React, { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import { styles } from "../styles";
import { SectionWrapper } from "../hoc";
import { aboutTimeline } from "../constants";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import StarryBackground from "./StarryBackground";

// Register ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger);

// Styled Components
const CardContainer = styled.div`
  position: relative;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 70vh;
  padding: 2rem 0;
  overflow: visible;
  
  @media (max-width: 768px) {
    min-height: 60vh;
    padding: 1rem 0;
  }
    @media (max-width: 480px) {
    min-height: 50vh;
    padding: 0.5rem 0 9rem; /* Increased bottom padding to accommodate indicators at -130px */
    margin-bottom: 1.5rem; /* Adjusted margin for better spacing */
    /* Don't restrict touch actions at the container level */
    /* Let the individual elements handle their own touch behavior */
  }
  
  /* Removed swipe hint as requested */
`;

// 3D Rotating Card Wrapper
const RotatingCardWrapper = styled.div`
  width: 100%;
  height: 100%;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: visible;
  perspective: 3000px;
  margin: 40px 0;
  min-height: 500px;
  transform: scale(0.85);
  
  @media (max-width: 1024px) {
    transform: scale(0.8);
    min-height: 450px;
  }
  
  @media (max-width: 768px) {
    transform: scale(0.7);
    min-height: 400px;
    margin: 20px 0;
  }
  
  @media (max-width: 480px) {
    transform: scale(0.6);
    min-height: 350px;
    margin: 10px 0;
  }
`;

const RotatingInner = styled.div`
  --w: 400px;
  --h: 350px;
  --translateZ: 600px;
  --rotateX: 0deg;
  --perspective: 2500px;
  --rotation-duration: 40s;
  position: relative;
  width: var(--w);
  height: var(--h);
  transform-style: preserve-3d;
  transform: perspective(var(--perspective)) rotateX(var(--rotateX));
  z-index: 5;
  will-change: transform; /* Hint to browser to optimize transform animations */
  
  &.auto-rotating {
    animation: autoRotate var(--rotation-duration) linear infinite;
    animation-fill-mode: forwards; /* Prevent flicker at animation end */
  }
  
  &.paused {
    animation-play-state: paused;
  }
  
  @keyframes autoRotate {
    from {
      transform: perspective(var(--perspective)) rotateX(var(--rotateX)) rotateY(0deg);
    }
    to {
      transform: perspective(var(--perspective)) rotateX(var(--rotateX)) rotateY(360deg);
    }
  }
  
  @media (max-width: 1024px) {
    --w: 380px;
    --h: 330px;
    --translateZ: 550px;
  }
  
  @media (max-width: 768px) {
    --w: 340px;
    --h: 300px;
    --translateZ: 500px;
    --perspective: 2000px;
    --rotateX: 5deg; /* Slight tilt for better mobile viewing */
    touch-action: manipulation; /* Improved touch handling */
  }
  
  @media (max-width: 480px) {
    --w: 300px;
    --h: 280px;
    --translateZ: 400px;
    --perspective: 1800px;
    --rotateX: 8deg; /* More tilt for smaller screens */
    --rotation-duration: 50s; /* Slightly slower on mobile for better performance */
  }
  
  /* Prevent animation during page load for better performance */
  @media (prefers-reduced-motion: reduce) {
    animation-duration: 0s !important;
    transition-duration: 0s !important;
  }
`;

const GlassCard = styled.div`
  position: absolute;
  width: 82%;
  height: 87%;
  background: rgba(15, 23, 42, 0.85);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border-radius: 12px;
  border: 2px solid rgba(var(--color-card, '59, 130, 246'), 0.5);
  box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.5),
              inset 0 0 30px rgba(var(--color-card, '59, 130, 246'), 0.15);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-evenly;
  padding: 12px 10px;
  left: 9%;
  top: 6.5%;
  transform: rotateY(calc((360deg / var(--quantity, 10)) * var(--index, 0)))
    translateZ(var(--translateZ));
  overflow: visible; /* Changed from hidden to visible to allow content to be scrollable */
  transform-style: preserve-3d;
  z-index: calc(10 - (var(--index, 0) % 10));
  transition: transform 0.4s cubic-bezier(0.215, 0.61, 0.355, 1), box-shadow 0.3s ease;
  will-change: transform, box-shadow; /* Hint to browser to optimize these properties */
  
  /* Active card styling */
  &.active-card {
    transform: rotateY(calc((360deg / var(--quantity, 10)) * var(--index, 0)))
      translateZ(calc(var(--translateZ) + 120px));
    z-index: 30;
    box-shadow: 0 12px 40px 0 rgba(0, 0, 0, 0.6),
                inset 0 0 40px rgba(var(--color-card, '59, 130, 246'), 0.25);
  }
  
  &:hover {
    transform: rotateY(calc((360deg / var(--quantity, 10)) * var(--index, 0)))
      translateZ(calc(var(--translateZ) + 100px));
    z-index: 20;
  }
  
  @media (max-width: 768px) {
    width: 85%;
    height: 90%;
    left: 7.5%;
    top: 5%;
    padding: 10px 8px;
    
    /* Ensure the hover effect works on touch devices */
    &:active {
      transform: rotateY(calc((360deg / var(--quantity, 10)) * var(--index, 0)))
        translateZ(calc(var(--translateZ) + 50px));
      z-index: 20;
    }
    
    &.active-card {
      transform: rotateY(calc((360deg / var(--quantity, 10)) * var(--index, 0)))
        translateZ(calc(var(--translateZ) + 80px));
    }
  }
  
  @media (max-width: 480px) {
    width: 88%;
    height: 92%;
    left: 6%;
    top: 4%;
    border-width: 1px;
    box-shadow: 0 4px 16px 0 rgba(0, 0, 0, 0.5),
                inset 0 0 15px rgba(var(--color-card, '59, 130, 246'), 0.15);
    /* Allow all touch actions within the card */
    touch-action: auto;
    /* Simplify backdrop filter on mobile for better performance */
    backdrop-filter: blur(6px);
    -webkit-backdrop-filter: blur(6px);
    
    &.active-card {
      box-shadow: 0 8px 30px 0 rgba(0, 0, 0, 0.7),
                  inset 0 0 25px rgba(var(--color-card, '59, 130, 246'), 0.3);
    }
  }
`;

const IconContainer = styled.div`
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: rgba(var(--color-card, '59, 130, 246'), 0.25);
  border: 2px solid rgba(var(--color-card, '59, 130, 246'), 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 15px;
  box-shadow: 0 0 25px rgba(var(--color-card, '59, 130, 246'), 0.5),
              inset 0 0 15px rgba(var(--color-card, '59, 130, 246'), 0.3);
  position: relative;
  overflow: hidden;
  
  &::after {
    content: '';
    position: absolute;
    width: 150%;
    height: 150%;
    background: radial-gradient(circle at center, rgba(var(--color-card, '59, 130, 246'), 0.8) 0%, transparent 70%);
    top: -25%;
    left: -25%;
    opacity: 0.1;
    animation: pulse 3s infinite ease-in-out;
  }
  
  span {
    font-size: 2rem;
    color: white;
    filter: drop-shadow(0 0 15px rgba(var(--color-card, '59, 130, 246'), 0.9));
  }
  
  @keyframes pulse {
    0% { transform: scale(0.8); opacity: 0.1; }
    50% { transform: scale(1.2); opacity: 0.2; }
    100% { transform: scale(0.8); opacity: 0.1; }
  }
  
  @media (max-width: 768px) {
    width: 50px;
    height: 50px;
    margin-bottom: 10px;
    border-width: 1.5px;
    
    span {
      font-size: 1.7rem;
    }
  }
  
  @media (max-width: 480px) {
    width: 45px;
    height: 45px;
    margin-bottom: 8px;
    border-width: 1px;
    box-shadow: 0 0 15px rgba(var(--color-card, '59, 130, 246'), 0.5),
                inset 0 0 10px rgba(var(--color-card, '59, 130, 246'), 0.3);
    
    span {
      font-size: 1.5rem;
    }
  }
`;

const CardTitle = styled.h2`
  font-size: 1.2rem;
  color: white;
  margin-bottom: 5px;
  text-shadow: 0 0 15px rgba(var(--color-card, '59, 130, 246'), 0.7);
  text-align: center;
  font-weight: 700;
  letter-spacing: 0.5px;
  width: 100%;
  line-height: 1.2;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 2.4rem;
  
  @media (max-width: 768px) {
    font-size: 1.1rem;
    margin-bottom: 4px;
  }
  
  @media (max-width: 480px) {
    font-size: 1rem;
    margin-bottom: 3px;
  }
`;

const CardPeriod = styled.p`
  font-size: 0.85rem;
  color: rgba(var(--color-card, '59, 130, 246'), 1);
  margin-bottom: 8px;
  text-align: center;
  font-weight: 600;
  text-shadow: 0 0 10px rgba(var(--color-card, '59, 130, 246'), 0.5);
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  
  @media (max-width: 768px) {
    font-size: 0.8rem;
    margin-bottom: 6px;
  }
  
  @media (max-width: 480px) {
    font-size: 0.75rem;
    margin-bottom: 5px;
  }
`;

const CardDescription = styled.div`
  font-size: 0.78rem;
  color: rgba(255, 255, 255, 0.9);
  text-align: center;
  line-height: 1.25;
  margin-bottom: 10px;
  max-width: 95%;
  overflow-y: auto;
  padding: 0 2px;
  font-weight: 500;
  max-height: 120px; /* Allow scrolling for longer descriptions */
  touch-action: auto; /* Allow all touch actions */
  -webkit-overflow-scrolling: touch; /* Smooth scrolling on iOS */
  overscroll-behavior: contain; /* Prevent scroll chaining */
  position: relative;
  z-index: 10; /* Ensure it's above other elements for touch events */
  
  @media (max-width: 768px) {
    font-size: 0.75rem;
    line-height: 1.2;
    margin-bottom: 8px;
    max-height: 90px;
    padding: 0 4px;
  }
  
  @media (max-width: 480px) {
    font-size: 0.7rem;
    line-height: 1.15;
    margin-bottom: 6px;
    max-height: 85px; /* Increased for more visible scrollable area */
    max-width: 98%;
    padding: 4px 6px; /* Increased padding for better touch area */
    border-radius: 6px;
    background: rgba(0, 0, 0, 0.1); /* Subtle background to indicate scrollable area */
  }
  
  /* Custom scrollbar styling */
  &::-webkit-scrollbar {
    width: 4px;
  }
  
  &::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 10px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: rgba(var(--color-card, '59, 130, 246'), 0.3);
    border-radius: 10px;
  }
  
  /* Improve scrollbar for mobile but keep functionality */
  @media (max-width: 480px) {
    scrollbar-width: thin;
    
    &::-webkit-scrollbar {
      width: 4px; /* Wider for better touch */
    }
    
    &::-webkit-scrollbar-thumb {
      background: rgba(var(--color-card, '59, 130, 246'), 0.7); /* More visible */
    }
    
    /* Add a subtle indicator that content is scrollable */
    &::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 15px;
      background: linear-gradient(to top, rgba(var(--color-card, '59, 130, 246'), 0.2), transparent);
      pointer-events: none;
      opacity: 0.7;
      border-bottom-left-radius: 6px;
      border-bottom-right-radius: 6px;
    }
  }
`;

const SkillsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 4px;
  margin-top: 8px;
  max-width: 95%;
  overflow: visible;
  
  @media (max-width: 768px) {
    gap: 3px;
    margin-top: 6px;
    max-width: 98%;
  }
  
  @media (max-width: 480px) {
    gap: 2px;
    margin-top: 4px;
    max-width: 100%;
  }
`;

const SkillTag = styled.span`
  padding: 2px 6px;
  background: rgba(var(--color-card, '59, 130, 246'), 0.25);
  border: 1px solid rgba(var(--color-card, '59, 130, 246'), 0.5);
  border-radius: 10px;
  color: white;
  font-size: 0.67rem;
  font-weight: 600;
  box-shadow: 0 1px 4px rgba(var(--color-card, '59, 130, 246'), 0.3);
  margin: 1px;
  text-shadow: 0 0 5px rgba(0, 0, 0, 0.3);
  white-space: nowrap;
  
  @media (max-width: 768px) {
    padding: 1px 5px;
    font-size: 0.62rem;
    border-radius: 8px;
  }
  
  @media (max-width: 480px) {
    padding: 1px 4px;
    font-size: 0.58rem;
    border-radius: 6px;
    margin: 0.5px;
    box-shadow: 0 1px 2px rgba(var(--color-card, '59, 130, 246'), 0.3);
  }
`;

const NavButton = styled.button`
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: rgba(15, 23, 42, 0.7);
  border: 2px solid rgba(59, 130, 246, 0.5);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 30; /* Increased to ensure buttons are always clickable */
  box-shadow: 0 4px 20px rgba(59, 130, 246, 0.4);
  backdrop-filter: blur(4px);
  transition: all 0.3s ease;
  outline: none; /* Remove outline for better aesthetics */
  
  /* Improved tap target for mobile */
  &::before {
    content: '';
    position: absolute;
    top: -15px;
    left: -15px;
    right: -15px;
    bottom: -15px;
    border-radius: 50%;
    z-index: -1; /* Ensure it doesn't block clicks */
  }
  
  /* Screen reader only text */
  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border-width: 0;
  }
  
  @media (max-width: 768px) {
    width: 42px;
    height: 42px;
  }
    @media (max-width: 480px) {
    width: 40px;
    height: 40px;
    background: rgba(15, 23, 42, 0.9); /* Darker for better visibility */
    border: 2px solid rgba(59, 130, 246, 0.9); /* More visible border */
    top: auto; /* Reset top positioning */
    bottom: -50px; /* Moved higher to prevent overlap with indicators */
    transform: none; /* Reset transform */
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.4), 0 0 10px rgba(59, 130, 246, 0.5);
    
    /* Add label below button on mobile */
    &::after {
      content: ${props => props.className === 'prev' ? '"Slower"' : '"Faster"'};
      position: absolute;
      bottom: -22px;
      left: 50%;
      transform: translateX(-50%);
      font-size: 11px;
      font-weight: 500;
      color: rgba(255, 255, 255, 0.9);
      white-space: nowrap;
      text-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);
      letter-spacing: 0.5px;
    }
  }
  
  svg {
    width: 30px;
    height: 30px;
    
    @media (max-width: 768px) {
      width: 24px;
      height: 24px;
    }
    
    @media (max-width: 480px) {
      width: 22px;
      height: 22px;
    }
  }
  
  &:hover {
    background: rgba(59, 130, 246, 0.3);
    box-shadow: 0 4px 25px rgba(59, 130, 246, 0.6);
    transform: translateY(-50%) scale(1.1);
    
    @media (max-width: 480px) {
      transform: scale(1.1); /* Different transform for mobile */
    }
  }
  
  &:active {
    transform: translateY(-50%) scale(0.95);
    background: rgba(59, 130, 246, 0.4);
    
    @media (max-width: 480px) {
      transform: scale(0.95); /* Different transform for mobile */
    }
  }
  
  &.prev {
    left: 50px;
    
    @media (max-width: 768px) {
      left: 20px;
    }
    
    @media (max-width: 480px) {
      left: calc(50% - 60px); /* Increased spacing from center */
    }
  }
  
  &.next {
    right: 50px;
    
    @media (max-width: 768px) {
      right: 20px;
    }
    
    @media (max-width: 480px) {
      right: calc(50% - 60px); /* Increased spacing from center */
    }
  }
  
  /* Add a subtle pulse animation to draw attention to the buttons */
  @keyframes pulse {
    0% { box-shadow: 0 4px 20px rgba(59, 130, 246, 0.4); }
    50% { box-shadow: 0 4px 30px rgba(59, 130, 246, 0.7); }
    100% { box-shadow: 0 4px 20px rgba(59, 130, 246, 0.4); }
  }
  
  &.pulse {
    animation: pulse 2s infinite ease-in-out;
  }
`;

const Indicators = styled.div`
  position: absolute;
  bottom: -50px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 16px;
  z-index: 30; /* Increased to ensure indicators are always clickable */
  
  @media (max-width: 768px) {
    bottom: -40px;
    gap: 14px;
  }
    @media (max-width: 480px) {
    bottom: -130px; /* Moved further down to avoid overlap with speed control buttons */
    gap: 10px; /* Slightly reduced gap for better fit */
    padding: 6px 14px; /* Adjusted padding for better visibility and tap area */
    background: rgba(15, 23, 42, 0.8); /* Increased opacity for better visibility */
    border-radius: 20px;
    backdrop-filter: blur(4px);
    border: 1px solid rgba(59, 130, 246, 0.4);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  }
`;

const IndicatorDot = styled.button`
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: ${props => props.active ? 'rgba(59, 130, 246, 0.9)' : 'rgba(15, 23, 42, 0.7)'};
  border: 2px solid ${props => props.active ? 'rgba(59, 130, 246, 0.9)' : 'rgba(59, 130, 246, 0.3)'};
  cursor: pointer;
  box-shadow: ${props => props.active ? '0 0 15px rgba(59, 130, 246, 0.7)' : 'none'};
  transition: all 0.3s ease;
  outline: none; /* Remove outline for better aesthetics */
  
  &:hover {
    transform: scale(1.2);
    border-color: rgba(59, 130, 246, 0.6);
  }
  
  &:active {
    transform: scale(0.9);
  }
  
  @media (max-width: 768px) {
    width: 14px;
    height: 14px;
  }
  
  @media (max-width: 480px) {
    width: 12px; /* Increased for better visibility */
    height: 12px; /* Increased for better visibility */
    border-width: 1.5px; /* Thicker border for better visibility */
    
    /* Make tap target larger than visual size for better touch interaction */
    position: relative;
    
    &::after {
      content: '';
      position: absolute;
      top: -12px;
      left: -12px;
      right: -12px;
      bottom: -12px;
    }
    
    /* More pronounced active state for mobile */
    ${props => props.active && `
      background: rgba(59, 130, 246, 1);
      border-color: white;
      box-shadow: 0 0 20px rgba(59, 130, 246, 0.9);
    `}
  }
`;

const DecorativeBlur = styled.div`
  position: absolute;
  width: 300px;
  height: 300px;
  border-radius: 50%;
  z-index: 1;
  opacity: 0.1;
  filter: blur(80px);
  
  &.top-left {
    top: -100px;
    left: -100px;
    background: radial-gradient(circle, rgba(59, 130, 246, 1) 0%, transparent 70%);
  }
  
  &.bottom-right {
    bottom: -100px;
    right: -100px;
    background: radial-gradient(circle, rgba(147, 51, 234, 1) 0%, transparent 70%);
  }
`;

const AboutMe = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [rotationSpeed, setRotationSpeed] = useState(40); // Default 40 seconds per rotation
  const headerRef = useRef(null);
  const paragraphRef = useRef(null);
  const cardRefs = useRef([]);
  const rotatingRef = useRef(null);
  
  // Setup card refs
  useEffect(() => {
    cardRefs.current = cardRefs.current.slice(0, aboutTimeline.length);
  }, []);
  
  // Function to speed up rotation
  const speedUpRotation = () => {
    // Prevent rapid button clicks
    const now = Date.now();
    if (rotatingRef.current?.lastSpeedChangeTime && now - rotatingRef.current.lastSpeedChangeTime < 300) {
      return;
    }
    rotatingRef.current.lastSpeedChangeTime = now;
    
    // Remove active class from all cards for cleaner transition
    cardRefs.current.forEach(card => {
      if (card) card.classList.remove('active-card');
    });
    
    // Decrease rotation time (faster rotation) with more granular control
    const newSpeed = Math.max(10, rotationSpeed - 5); // Minimum 10 seconds, smaller increments
    setRotationSpeed(newSpeed);
    
    // Get current rotation angle to maintain position
    const currentRotation = getCurrentRotationAngle(rotatingRef.current);
    
    // Resume auto-rotation with a smoother transition
    if (rotatingRef.current) {
      // Apply transition with current angle to prevent jumping
      rotatingRef.current.style.transition = 'transform 0.3s ease-out';
      rotatingRef.current.style.transform = `perspective(var(--perspective)) rotateX(var(--rotateX)) rotateY(${currentRotation}deg)`;
      
      // Then after a shorter transition, add the auto-rotating class
      setTimeout(() => {
        if (rotatingRef.current) {
          rotatingRef.current.style.transition = '';
          rotatingRef.current.style.transform = '';
          rotatingRef.current.classList.add('auto-rotating');
          
          // Add active class to current card
          if (cardRefs.current[activeIndex]) {
            cardRefs.current[activeIndex].classList.add('active-card');
          }
        }
      }, 300);
    }
  };
  
  // Function to slow down rotation
  const slowDownRotation = () => {
    // Prevent rapid button clicks
    const now = Date.now();
    if (rotatingRef.current?.lastSpeedChangeTime && now - rotatingRef.current.lastSpeedChangeTime < 300) {
      return;
    }
    rotatingRef.current.lastSpeedChangeTime = now;
    
    // Remove active class from all cards for cleaner transition
    cardRefs.current.forEach(card => {
      if (card) card.classList.remove('active-card');
    });
    
    // Increase rotation time (slower rotation) with more granular control
    const newSpeed = Math.min(60, rotationSpeed + 5); // Maximum 60 seconds, smaller increments
    setRotationSpeed(newSpeed);
    
    // Get current rotation angle to maintain position
    const currentRotation = getCurrentRotationAngle(rotatingRef.current);
    
    // Resume auto-rotation with a smoother transition
    if (rotatingRef.current) {
      // Apply transition with current angle to prevent jumping
      rotatingRef.current.style.transition = 'transform 0.3s ease-out';
      rotatingRef.current.style.transform = `perspective(var(--perspective)) rotateX(var(--rotateX)) rotateY(${currentRotation}deg)`;
      
      // Then after a shorter transition, add the auto-rotating class
      setTimeout(() => {
        if (rotatingRef.current) {
          rotatingRef.current.style.transition = '';
          rotatingRef.current.style.transform = '';
          rotatingRef.current.classList.add('auto-rotating');
          
          // Add active class to current card
          if (cardRefs.current[activeIndex]) {
            cardRefs.current[activeIndex].classList.add('active-card');
          }
        }
      }, 300);
    }
  };
  
  // Helper function to get current rotation angle
  const getCurrentRotationAngle = (element) => {
    if (!element) return 0;
    
    const style = window.getComputedStyle(element);
    const matrix = new DOMMatrix(style.transform);
    
    // Extract rotation angle from transform matrix
    // Math.atan2 returns radians, convert to degrees
    return Math.round(Math.atan2(matrix.m32, matrix.m33) * (180 / Math.PI));
  };
  
  // Update active index based on visible card only when auto-rotating
  useEffect(() => {
    const interval = setInterval(() => {
      // Only update if auto-rotating is active
      if (rotatingRef.current && rotatingRef.current.classList.contains('auto-rotating')) {
        // Update the active index
        const nextIndex = (activeIndex + 1) % aboutTimeline.length;
        setActiveIndex(nextIndex);
      }
    }, 5000); // Check every 5 seconds
    
    return () => clearInterval(interval);
  }, [activeIndex, aboutTimeline.length]);
  
  // Function to rotate to a specific card
  const rotateToCard = (index) => {
    if (!rotatingRef.current) return;
    
    // Improved debounce mechanism - allow interaction if enough time has passed
    const now = Date.now();
    if (rotatingRef.current.lastRotateTime && now - rotatingRef.current.lastRotateTime < 300) {
      return; // Prevent rapid interactions within 300ms
    }
    rotatingRef.current.lastRotateTime = now;
    
    // Remove active class from all cards
    cardRefs.current.forEach(card => {
      if (card) card.classList.remove('active-card');
    });
    
    // Pause auto-rotation
    rotatingRef.current.classList.remove('auto-rotating');
    
    // Calculate the rotation angle to show the selected card
    const angle = -(360 / aboutTimeline.length) * index;
    
    // Apply the rotation with a smooth transition
    // Using a more performant cubic-bezier curve
    rotatingRef.current.style.transition = 'transform 0.4s cubic-bezier(0.25, 0.1, 0.25, 1)';
    rotatingRef.current.style.transform = `perspective(var(--perspective)) rotateX(var(--rotateX)) rotateY(${angle}deg)`;
    
    // Update active index
    setActiveIndex(index);
    
    // Add active class to the selected card immediately for better responsiveness
    requestAnimationFrame(() => {
      if (cardRefs.current[index]) {
        cardRefs.current[index].classList.add('active-card');
      }
    });
    
    // Reset transition after animation completes
    setTimeout(() => {
      if (rotatingRef.current) {
        rotatingRef.current.style.transition = '';
      }
    }, 400);
  };
  
  // Add touch event handling for mobile
  useEffect(() => {
    let touchStartX = 0;
    let touchStartY = 0;
    let isSwiping = false;
    
    const handleTouchStart = (e) => {
      // Store the initial touch position
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
      isSwiping = false;
    };
    
    const handleTouchMove = (e) => {
      if (!touchStartX || !touchStartY) return;
      
      const touchCurrentX = e.touches[0].clientX;
      const touchCurrentY = e.touches[0].clientY;
      
      // Calculate the swipe distance
      const deltaX = touchCurrentX - touchStartX;
      const deltaY = touchCurrentY - touchStartY;
      
      // Check if the touch is on a card description (scrollable element)
      const target = e.target;
      const isCardDescription = target.closest('.card-description');
      
      // If we're in a card description and trying to scroll vertically, allow it
      if (isCardDescription) {
        // Get the card description element
        const descriptionElement = target.closest('.card-description');
        
        // Check if we're at the top or bottom of the scroll area
        const isAtTop = descriptionElement.scrollTop <= 0;
        const isAtBottom = descriptionElement.scrollTop + descriptionElement.clientHeight >= descriptionElement.scrollHeight - 1;
        
        // If we're scrolling up and not at the top, or scrolling down and not at the bottom, allow scrolling
        if ((deltaY > 0 && !isAtTop) || (deltaY < 0 && !isAtBottom)) {
          // We're in the middle of the content, allow normal scrolling
          return;
        }
        
        // If we're at the boundaries but still trying to scroll vertically more than horizontally, allow it
        if (Math.abs(deltaY) > Math.abs(deltaX) * 1.5) {
          return;
        }
      }
      
      // Only prevent default for horizontal swipes on the card container
      // This allows normal scrolling elsewhere on the page
      if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 15) {
        isSwiping = true;
        e.preventDefault();
      }
    };
    
    const handleTouchEnd = (e) => {
      if (!isSwiping) return;
      
      const touchEndX = e.changedTouches[0].clientX;
      const touchEndY = e.changedTouches[0].clientY;
      
      // Calculate the swipe distance
      const deltaX = touchEndX - touchStartX;
      const deltaY = touchEndY - touchStartY;
      
      // Only consider horizontal swipes
      if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
        if (deltaX > 0) {
          // Swipe right - go to previous card
          const prevIndex = (activeIndex - 1 + aboutTimeline.length) % aboutTimeline.length;
          rotateToCard(prevIndex);
        } else {
          // Swipe left - go to next card
          const nextIndex = (activeIndex + 1) % aboutTimeline.length;
          rotateToCard(nextIndex);
        }
      }
      
      // Reset values
      touchStartX = 0;
      touchStartY = 0;
      isSwiping = false;
    };
    
    // Add touch event listeners only to the rotating container
    const container = rotatingRef.current;
    if (container) {
      // Use passive: true for touchstart to improve performance
      container.addEventListener('touchstart', handleTouchStart, { passive: true });
      
      // Use passive: false only for touchmove to allow preventDefault() when needed
      // This is important for controlling horizontal swipes without affecting vertical scrolling
      container.addEventListener('touchmove', handleTouchMove, { passive: false });
      
      // Use passive: true for touchend since we don't need to prevent default
      container.addEventListener('touchend', handleTouchEnd, { passive: true });
      
      return () => {
        container.removeEventListener('touchstart', handleTouchStart);
        container.removeEventListener('touchmove', handleTouchMove);
        container.removeEventListener('touchend', handleTouchEnd);
      };
    }
  }, [activeIndex, aboutTimeline.length]);
  
  // Animation for initial load
  useEffect(() => {
    // Header animation
    gsap.fromTo(
      headerRef.current.children,
      { y: -30, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.8,
        stagger: 0.2,
        ease: "power2.out",
        scrollTrigger: {
          trigger: headerRef.current,
          start: "top bottom-=100",
          toggleActions: "play none none none",
        },
      }
    );
    
    // Paragraph animation
    gsap.fromTo(
      paragraphRef.current,
      { y: 20, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.8,
        delay: 0.3,
        ease: "power2.out",
        scrollTrigger: {
          trigger: paragraphRef.current,
          start: "top bottom-=50",
          toggleActions: "play none none none",
        },
      }
    );
    
    // Cards animation
    cardRefs.current.forEach((card, index) => {
      if (card) {
        gsap.set(card, { 
          opacity: 0,
          scale: 0.85,
          rotationX: 15
        });
        
        gsap.to(card, {
          opacity: 1,
          scale: 1,
          rotationX: 0,
          duration: 1.2,
          delay: 0.5 + (index * 0.1),
          ease: "back.out(1.2)",
          scrollTrigger: {
            trigger: card,
            start: "top bottom-=50",
            toggleActions: "play none none none",
          },
        });
      }
    });
    
    // Make sure the rotation is visible
    gsap.set('.rotating-inner', {
      transformStyle: 'preserve-3d',
      transformPerspective: 2500
    });
  }, []);
  
  return (
    <div className="relative">
      <StarryBackground density={230} />
      <div ref={headerRef}>
        <p className={`${styles.sectionSubText} text-center`}>
          Introduction
        </p>
        <h2 className={`${styles.sectionHeadText} text-center`}>
          About Me
        </h2>
      </div>

      <div className="mt-8">
        <p
          ref={paragraphRef}
          className="text-gray-300 text-[17px] max-w-3xl mx-auto leading-[30px] text-center mb-16"
        >
          I'm a developer passionate about crafting intuitive user experiences through clean code and thoughtful UI/UX design. My full-stack expertise has been sharpened through hackathon competitions, while my growing interest in machine learning drives me to solve increasingly complex problems. I'm actively seeking industry connections and opportunities to further develop my web and front-end engineering skills.
        </p>

        <CardContainer>
          {/* 3D Rotating Cards */}
          <RotatingCardWrapper>
            <RotatingInner 
              ref={rotatingRef}
              className="rotating-inner auto-rotating"
              style={{ 
                '--quantity': aboutTimeline.length,
                '--rotation-duration': `${rotationSpeed}s`
              }}
            >
              {aboutTimeline.map((card, index) => (
                <GlassCard 
                  key={index}
                  ref={el => cardRefs.current[index] = el}
                  style={{
                    '--index': index,
                    '--color-card': getCardColor(index)
                  }}
                  onClick={() => rotateToCard(index)}
                >
                  <IconContainer>
                    <span>{card.icon}</span>
                  </IconContainer>
                  
                  <CardTitle>{card.title}</CardTitle>
                  <CardPeriod>{card.period}</CardPeriod>
                  <CardDescription className="card-description">{card.description}</CardDescription>
                  
                  {card.skills && (
                    <SkillsContainer>
                      {card.skills.map((skill, skillIndex) => (
                        <SkillTag key={skillIndex}>{skill}</SkillTag>
                      ))}
                    </SkillsContainer>
                  )}
                </GlassCard>
              ))}
            </RotatingInner>
          </RotatingCardWrapper>
          
          {/* Speed Control Buttons */}
          <NavButton className="prev" onClick={slowDownRotation} title="Slow down & resume rotation">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="8" y1="12" x2="16" y2="12"></line>
            </svg>
            <span className="sr-only">Slow down</span>
          </NavButton>
          
          <NavButton className="next" onClick={speedUpRotation} title="Speed up & resume rotation">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="16"></line>
              <line x1="8" y1="12" x2="16" y2="12"></line>
            </svg>
            <span className="sr-only">Speed up</span>
          </NavButton>
          
          {/* Indicator Dots */}
          <Indicators>
            {aboutTimeline.map((_, index) => (
              <IndicatorDot 
                key={index} 
                active={index === activeIndex}
                onClick={() => rotateToCard(index)}
              />
            ))}
          </Indicators>
          
          {/* Decorative Elements */}
          <DecorativeBlur className="top-left" />
          <DecorativeBlur className="bottom-right" />
        </CardContainer>
      </div>
    </div>
  );
};

// Helper function to get different colors for each card
const getCardColor = (index) => {
  const colors = [
    '99, 179, 237',   // Blue
    '129, 140, 248',  // Indigo
    '160, 110, 245',  // Purple
    '213, 90, 235',   // Pink
    '246, 109, 155',  // Rose
    '252, 129, 97',   // Orange
    '250, 176, 5',    // Amber
    '163, 230, 53',   // Lime
    '52, 211, 153',   // Emerald
    '6, 182, 212'     // Cyan
  ];
  
  // Make the active card's color more vibrant
  return colors[index % colors.length];
};

export default SectionWrapper(AboutMe, "about");
