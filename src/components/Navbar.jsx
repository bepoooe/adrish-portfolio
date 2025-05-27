import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLinkedin, faGithub, faInstagram } from '@fortawesome/free-brands-svg-icons';

import { styles } from "../styles";
import { navLinks } from "../constants";
import { menu, close } from "../assets";

const Navbar = () => {
  const [active, setActive] = useState("");
  const [toggle, setToggle] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const socialLinks = [
    {
      icon: faGithub,
      url: "https://github.com/bepoooe",
      color: "#333"
    },
    {
      icon: faLinkedin,
      url: "https://www.linkedin.com/in/adrishbasak/",
      color: "#0077B5"
    },
    {
      icon: faInstagram,
      url: "https://www.instagram.com/bepoisdying/?hl=en",
      color: "#E4405F"
    }
  ];

  // Handle scroll events to change navbar appearance
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      if (scrollTop > 100) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
      
      // Find which section is currently in view
      const sections = document.querySelectorAll('section[id]');
      let currentSection = '';
      
      sections.forEach((section) => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.offsetHeight;
        
        if (window.scrollY >= sectionTop - 200 && window.scrollY < sectionTop + sectionHeight - 200) {
          currentSection = section.getAttribute('id');
        }
      });
      
      setActive(currentSection);
    };

    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Enhanced scroll to section when nav link is clicked
  const scrollToSection = (sectionId) => {
    setToggle(false);
    
    // If sectionId is empty or null, scroll to top
    if (!sectionId) {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
      return;
    }
    
    const section = document.getElementById(sectionId);
    if (section) {
      // Calculate the exact position with offset for navbar height
      const headerOffset = 100;
      const elementPosition = section.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
      
      // Smooth scroll with animation
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className={`${styles.paddingX} w-full flex items-center py-3 sm:py-5 fixed top-0 z-20 transition-all duration-300 ${scrolled ? "bg-black bg-opacity-70 backdrop-blur-md shadow-[0_4px_15px_rgba(0,0,0,0.5)]" : "bg-transparent"}`}
    >
      <div className='w-full flex justify-between items-center max-w-7xl mx-auto'>
        <motion.div 
          className="flex items-center justify-between w-full px-3 sm:px-8 py-2 sm:py-3 rounded-full border border-gray-700 bg-black bg-opacity-60 backdrop-filter backdrop-blur-sm navbar-glow relative overflow-visible"
          whileHover={{ boxShadow: "0 0 15px rgba(0, 0, 0, 0.7)" }}
          transition={{ duration: 0.3 }}
        >
          {/* Decorative stars */}
          <div className="absolute top-1/4 left-[10%] w-1 h-1 bg-white rounded-full opacity-70 star-twinkle"></div>
          <div className="absolute top-3/4 left-[20%] w-0.5 h-0.5 bg-white rounded-full opacity-50 star-twinkle-slow"></div>
          <div className="absolute top-1/3 left-[80%] w-1 h-1 bg-white rounded-full opacity-70 star-twinkle" style={{animationDelay: '0.5s'}}></div>
          <div className="absolute top-2/3 left-[90%] w-0.5 h-0.5 bg-white rounded-full opacity-50 star-twinkle-slow" style={{animationDelay: '1.5s'}}></div>
          
          {/* Space dust particles */}
          <div className="absolute top-1/2 left-1/4 w-[2px] h-[2px] bg-blue-400 rounded-full opacity-30" style={{animation: 'space-dust 8s linear infinite'}}></div>
          <div className="absolute top-1/3 left-2/3 w-[1px] h-[1px] bg-purple-400 rounded-full opacity-20" style={{animation: 'space-dust 12s linear infinite', animationDelay: '2s'}}></div>
          {/* Left section - Logo and Name */}
          <div
            className='flex items-center gap-1 sm:gap-2 group cursor-pointer'
            onClick={() => {
              setActive("");
              scrollToSection(""); // Use scrollToSection with empty ID to scroll to top
            }}
          >
            <motion.img 
              src="/favicon.ico" 
              alt='logo' 
              className='w-7 h-7 sm:w-9 sm:h-9 object-contain'
              whileHover={{ rotate: 360, scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              transition={{ 
                rotate: { duration: 0.5, ease: "easeInOut" },
                scale: { duration: 0.2 }
              }}
            />
            <p className='text-[15px] sm:text-[18px] font-bold cursor-pointer flex transition-all duration-300'>
              <span className="text-[#e8e0cf] group-hover:text-[#f0e9db] drop-shadow-[0_0_3px_rgba(232,224,207,0.3)]">Bepo</span> <span className="ml-1"><span className="text-[#e8e0cf] opacity-70 group-hover:opacity-80">|</span> <span className="text-[#e8e0cf] group-hover:text-[#f0e9db] drop-shadow-[0_0_3px_rgba(232,224,207,0.3)]">Portfolio</span></span>
            </p>
          </div>

          {/* Right section - Navigation and Social Links */}
          <div className='hidden sm:flex items-center gap-6'>
            {/* Navigation Links */}
            <ul className='list-none flex flex-row gap-6 mr-6'>
              {navLinks.map((nav) => (
                <motion.li
                  key={nav.id}
                  className={`${active === nav.id ? "text-white" : "text-secondary"} hover:text-white text-[16px] font-medium cursor-pointer transition-all duration-300`}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <a 
                    href={`#${nav.id}`}
                    onClick={(e) => {
                      e.preventDefault(); // Prevent default link behavior
                      setActive(nav.id);
                      scrollToSection(nav.id);
                    }}
                  >
                    {nav.title}
                  </a>
                </motion.li>
              ))}
            </ul>

            {/* Social Links */}
            <div className="flex gap-4 border-l border-[#915EFF]/30 pl-6">
              {socialLinks.map((social, index) => (
                <motion.a
                  key={index}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ 
                    scale: 1.2,
                    rotate: 10,
                    transition: { duration: 0.3 }
                  }}
                  whileTap={{ scale: 0.9 }}
                  className="text-xl"
                  style={{ color: social.color }}
                >
                  {social.type === 'custom' ? (
                    <div className="w-4 h-4 flex items-center justify-center relative">
                      <div className="absolute w-3.5 h-3.5 bg-[#0AB79B] rounded-sm transform rotate-45"></div>
                      <span className="relative text-xs font-bold text-black">U</span>
                    </div>
                  ) : (
                    <FontAwesomeIcon icon={social.icon} />
                  )}
                </motion.a>
              ))}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className='sm:hidden flex items-center mr-1'>
            <motion.button
              className='w-[38px] h-[38px] flex items-center justify-center bg-white/15 rounded-full relative border border-white/20 z-20'
              onClick={() => setToggle(!toggle)}
              whileHover={{ scale: 1.1, backgroundColor: 'rgba(255, 255, 255, 0.2)' }}
              whileTap={{ scale: 0.9 }}
              animate={{
                boxShadow: toggle 
                  ? '0 0 12px rgba(255, 255, 255, 0.6)' 
                  : '0 0 5px rgba(255, 255, 255, 0.3)'
              }}
              transition={{ duration: 0.3 }}
            >
              <motion.img
                src={toggle ? close : menu}
                alt={toggle ? 'close' : 'menu'}
                className='w-[22px] h-[22px] object-contain'
                style={{ 
                  filter: 'brightness(1.3) drop-shadow(0 0 3px rgba(255, 255, 255, 0.7))',
                }}
                animate={{ 
                  rotate: toggle ? [0, 90, 0] : 0,
                  scale: toggle ? [1, 1.2, 1] : 1
                }}
                transition={{ duration: 0.3 }}
              />
              {/* Additional glow effect for better visibility */}
              <div className={`absolute inset-0 rounded-full ${toggle ? 'bg-white/10' : 'bg-transparent'} transition-all duration-300`}></div>
            </motion.button>
          </div>
        </motion.div>

        {/* Mobile Menu */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: toggle ? 1 : 0, scale: toggle ? 1 : 0.8 }}
          transition={{ duration: 0.2 }}
          className={`${!toggle ? "hidden" : "flex"} p-4 sm:p-6 bg-black bg-opacity-90 absolute top-16 sm:top-20 right-4 mx-0 sm:mx-4 my-2 min-w-[200px] z-10 rounded-xl backdrop-blur-md border border-gray-600 shadow-[0_4px_25px_rgba(0,0,0,0.7)] overflow-hidden w-[85%] sm:w-[80%] max-w-[300px]`}
        >
          {/* Decorative stars for mobile menu */}
          <div className="absolute top-1/4 right-[10%] w-1 h-1 bg-white rounded-full opacity-70 star-twinkle"></div>
          <div className="absolute bottom-1/4 left-[15%] w-0.5 h-0.5 bg-white rounded-full opacity-50 star-twinkle-slow"></div>
          <div className="absolute top-3/4 right-[20%] w-0.5 h-0.5 bg-white rounded-full opacity-60 star-twinkle" style={{animationDelay: '1s'}}></div>
          
          {/* Space dust particles */}
          <div className="absolute top-1/2 right-1/4 w-[2px] h-[2px] bg-white rounded-full opacity-30" style={{animation: 'space-dust 8s linear infinite'}}></div>
          <div className='flex flex-col gap-4'>
            <ul className='list-none flex flex-col gap-4'>
              {navLinks.map((nav) => (
                <motion.li
                  key={nav.id}
                  className={`font-medium cursor-pointer text-[16px] ${active === nav.id ? "text-white" : "text-secondary"} hover:text-white transition-colors duration-300`}
                  whileHover={{ x: 5 }}
                >
                  <a 
                    href={`#${nav.id}`}
                    onClick={(e) => {
                      e.preventDefault();
                      setToggle(!toggle);
                      setActive(nav.id);
                      scrollToSection(nav.id);
                    }}
                  >
                    {nav.title}
                  </a>
                </motion.li>
              ))}
            </ul>
            <div className="flex gap-4 pt-4 border-t border-[#915EFF]/30">
              {socialLinks.map((social, index) => (
                <motion.a
                  key={index}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                  className="text-xl"
                  style={{ color: social.color }}
                >
                  {social.type === 'custom' ? (
                    <div className="w-4 h-4 flex items-center justify-center relative">
                      <div className="absolute w-3.5 h-3.5 bg-[#0AB79B] rounded-sm transform rotate-45"></div>
                      <span className="relative text-xs font-bold text-black">U</span>
                    </div>
                  ) : (
                    <FontAwesomeIcon icon={social.icon} />
                  )}
                </motion.a>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </motion.nav>
  );
};

export default Navbar;
