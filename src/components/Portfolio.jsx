import React, { useState, useEffect, useRef } from 'react';
import { useIntersectionObserver } from '../hooks/useIntersectionObserver';
import Tech from './Tech';
import Projects from './Projects';
import GithubStats from './GithubStats';
import ScholasticRecord from './ScholasticRecord';
import AboutMe from './AboutMe';
import Contact from './Contact';

export const Portfolio = () => {
  // State for animation triggers
  const [visibleSections, setVisibleSections] = useState({
    // Start with projects visible on mobile to prevent blank screen
    projects: typeof window !== 'undefined' && window.innerWidth <= 768
  });
  
  // Track if we're on mobile
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      if (mobile) {
        // On mobile, ensure projects are visible from start
        setVisibleSections(prev => ({ ...prev, projects: true }));
      }
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  // Refs for sections
  const aboutRef = useRef(null);
  const educationRef = useRef(null);
  const techRef = useRef(null);
  const projectsRef = useRef(null);
  const githubRef = useRef(null);
  const contactRef = useRef(null);
  
  // Mouse position for interactive elements
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  
  // Handle mouse move for interactive elements
  const handleMouseMove = (e) => {
    setMousePosition({
      x: e.clientX,
      y: e.clientY
    });
  };
  
  // Use custom intersection observer hook for each section
  const isAboutVisible = useIntersectionObserver(aboutRef, { threshold: 0.2 });
  const isEducationVisible = useIntersectionObserver(educationRef, { threshold: 0.2 });
  const isTechVisible = useIntersectionObserver(techRef, { threshold: 0.2 });
  // Lower threshold for projects to improve mobile visibility
  const isProjectsVisible = useIntersectionObserver(projectsRef, { threshold: 0.1, rootMargin: '50px' });
  const isGithubVisible = useIntersectionObserver(githubRef, { threshold: 0.2 });
  const isContactVisible = useIntersectionObserver(contactRef, { threshold: 0.2 });
  
  // Update visible sections when intersection changes
  useEffect(() => {
    if (isAboutVisible) {
      setVisibleSections(prev => ({ ...prev, about: true }));
    }
    if (isEducationVisible) {
      setVisibleSections(prev => ({ ...prev, education: true }));
    }
    if (isTechVisible) {
      setVisibleSections(prev => ({ ...prev, technologies: true }));
    }
    if (isProjectsVisible) {
      setVisibleSections(prev => ({ ...prev, projects: true }));
    }
    if (isGithubVisible) {
      setVisibleSections(prev => ({ ...prev, github: true }));
    }
    if (isContactVisible) {
      setVisibleSections(prev => ({ ...prev, contact: true }));
    }
  }, [isAboutVisible, isEducationVisible, isTechVisible, isProjectsVisible, isGithubVisible, isContactVisible]);

  // Fallback timeout to ensure projects section becomes visible on mobile
  useEffect(() => {
    const timer = setTimeout(() => {
      setVisibleSections(prev => ({ ...prev, projects: true }));
    }, 3000); // Show projects after 3 seconds as fallback

    return () => clearTimeout(timer);
  }, []);

  // Additional scroll listener to ensure projects become visible on mobile
  useEffect(() => {
    const handleScroll = () => {
      if (projectsRef.current) {
        const rect = projectsRef.current.getBoundingClientRect();
        const isVisible = rect.top < window.innerHeight && rect.bottom > 0;
        if (isVisible) {
          setVisibleSections(prev => ({ ...prev, projects: true }));
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    // Check immediately on mount
    handleScroll();
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  // Add mouse move event listener
  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);
  // Parallax effect for stars
  const starParallax = (e) => {
    const x = (window.innerWidth - e.pageX * 2) / 100;
    const y = (window.innerHeight - e.pageY * 2) / 100;
    return { transform: `translate(${x}px, ${y}px)` };
  };
  
  return (
    <div 
      className="portfolio-container bg-black text-white overflow-hidden" 
      onMouseMove={handleMouseMove}
    >
      {/* Space background with stars */}
      <div className="stars-container fixed inset-0 z-0">
        <div className="stars stars-small"></div>
        <div className="stars stars-medium"></div>
        <div className="stars stars-large"></div>
      </div>
      
      {/* Floating elements */}
      <div 
        className="floating-element floating-planet-1" 
        style={{
          transform: `translate(${mousePosition.x / 50}px, ${mousePosition.y / 50}px)`
        }}
      ></div>
      <div 
        className="floating-element floating-planet-2" 
        style={{
          transform: `translate(${-mousePosition.x / 70}px, ${-mousePosition.y / 70}px)`
        }}
      ></div>
      <div 
        className="floating-element floating-asteroid" 
        style={{
          transform: `translate(${mousePosition.x / 30}px, ${-mousePosition.y / 30}px) rotate(${mousePosition.x / 20}deg)`
        }}
      ></div>      {/* About Me Section */}
      <section 
        id="about" 
        ref={aboutRef}
        className={`py-8 md:py-16 px-4 md:px-16 max-w-6xl mx-auto relative z-10 transition-all duration-1000 ${visibleSections.about ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
      >
        <div className="bg-black bg-opacity-60 backdrop-filter backdrop-blur-sm rounded-2xl p-8 shadow-xl">
          <AboutMe />
        </div>
      </section>      {/* Scholastic Record Section */}
      <section 
        id="education" 
        ref={educationRef}
        className={`py-8 md:py-16 px-4 md:px-16 max-w-6xl mx-auto relative z-10 transition-all duration-1000 ${visibleSections.education ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
      >
        <div className="bg-black bg-opacity-60 backdrop-filter backdrop-blur-sm rounded-2xl p-8 shadow-xl">
          <ScholasticRecord />
        </div>
      </section>      {/* Technologies Section */}
      <section 
        id="technologies" 
        ref={techRef}
        className={`py-8 md:py-16 px-4 md:px-16 max-w-6xl mx-auto relative z-10 transition-all duration-1000 ${visibleSections.technologies ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
      >
        <div className="bg-black bg-opacity-60 backdrop-filter backdrop-blur-sm rounded-2xl p-8 shadow-xl">
          <Tech />
        </div>
      </section>      {/* Projects Section - Full Width */}
      <div 
        ref={projectsRef}
        className={`relative z-10 transition-all duration-1000 ${
          visibleSections.projects || isMobile 
            ? 'opacity-100 translate-y-0' 
            : 'opacity-0 translate-y-10'
        }`}
      >
        <Projects />
      </div>

      {/* GitHub Stats Section */}
      <section 
        id="github" 
        ref={githubRef}
        className={`py-8 md:py-16 px-4 md:px-16 max-w-6xl mx-auto relative z-10 transition-all duration-1000 ${visibleSections.github ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
      >
        <div className="bg-black bg-opacity-60 backdrop-filter backdrop-blur-sm rounded-2xl p-8 shadow-xl">
          <GithubStats />
        </div>
      </section>      {/* Contact Section */}
      <section 
        id="contact" 
        ref={contactRef}
        className={`py-6 md:py-16 px-4 md:px-16 max-w-6xl mx-auto relative z-10 transition-all duration-1000 ${visibleSections.contact ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
      >
        <div className="bg-black bg-opacity-60 backdrop-filter backdrop-blur-sm rounded-2xl p-8 shadow-xl">
          <Contact />
        </div>
      </section>      {/* Footer */}
      <footer className="py-4 md:py-8 px-4 text-center bg-gray-900 bg-opacity-70 backdrop-filter backdrop-blur-lg relative z-10">
        <p className="text-blue-400">© 2025 bepo. All rights reserved.</p>
        <p className="mt-2 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600">Built with React, Three.js, and Vite</p>
      </footer>
    </div>
  );
};
